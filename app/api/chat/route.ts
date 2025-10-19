/* eslint-disable  @typescript-eslint/no-explicit-any */
import { convertToModelMessages } from 'ai';
import { getSystemPromptV3, SimplicityLevel } from '@/lib/prompts-v3';
import { createClient } from '@/lib/supabase/server';
import { createClientWithToken } from '@/lib/supabase/server-api';
import { getUserProfile } from '@/lib/get-user-profile';
import { extractTopics, getPersonalizedAnalogyPrompt } from '@/lib/user-profiler';
import { updateUserStreak } from '@/lib/gamification/streak-tracker';
import { updateDailyStats } from '@/lib/gamification/learning-stats';
import { checkAllAchievements } from '@/lib/gamification/achievement-checker';
import { 
  ClaudeModel,
  getABTestProvider, 
  getModelForTier, 
  OpenAIModel, 
  streamAIResponse,
  type AIProvider 
} from '@/lib/ai-providers';

// Rate limiting
import {
  globalLimiter,
  freeUserLimiter,
  premiumUserLimiter,
  getClientIp,
  getUserIdentifier,
  checkRateLimit,
  createRateLimitResponse,
} from '@/lib/rate-limit';

// ⭐ Caching
import {
  getCachedResponse,
  setCachedResponse,
} from '@/lib/cache/cache-manager';

export const maxDuration = 30;

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    console.error('[CHAT] 🚀 Request received');
    
    // ============================================================================
    // STEP 1: GLOBAL RATE LIMITING
    // ============================================================================
    
    const ip = getClientIp(req);
    console.error('[CHAT] 🌐 Client IP:', ip.substring(0, 8) + '...');
    
    const globalCheck = await checkRateLimit(globalLimiter, ip);
    
    if (!globalCheck.success) {
      console.warn('[CHAT] ⚠️ Global rate limit exceeded');
      return createRateLimitResponse(
        "Too many requests from your IP. Please slow down.",
        globalCheck.limit,
        globalCheck.remaining,
        globalCheck.reset
      );
    }
    
    console.error('[CHAT] ✅ Global rate limit passed');
    
    // ============================================================================
    // STEP 2: PARSE REQUEST
    // ============================================================================
    
    const body = await req.json();
    const { 
      messages, 
      simplicityLevel, 
      source,
      confusionRetry = false,
      retryInstructions = null
    } = body;
    
    console.error('[CHAT] 📝 Parsed body:', {
      messageCount: messages?.length,
      level: simplicityLevel,
      source,
      confusionRetry
    });
    
    if (!messages || !Array.isArray(messages)) {
      console.error('[CHAT] ❌ Invalid messages format');
      return Response.json({ 
        error: 'Invalid request: messages must be an array' 
      }, { status: 400 });
    }
    
    const level = (simplicityLevel || 'normal') as SimplicityLevel;
    const isExtension = source === 'extension';

    // ============================================================================
    // STEP 3: EXTRACT USER QUESTION (FOR CACHING)
    // ============================================================================
    
    let userQuestion = '';
    
    if (isExtension) {
      const lastUserMessage = messages.filter((m: any) => m?.role === 'user').pop();
      userQuestion = lastUserMessage?.content || '';
    } else {
      const userMessages = messages.filter((m: any) => m?.role === 'user');
      const lastUserMessage = userMessages[userMessages.length - 1];
      userQuestion = lastUserMessage?.content || '';
    }
    
    console.error('[CHAT] 💬 User question:', userQuestion.substring(0, 50) + '...');

    // ============================================================================
    // STEP 4: CHECK CACHE (BEFORE EXPENSIVE OPERATIONS)
    // ============================================================================
    
    let cachedResult: any = null;
    
    // Only check cache for non-confused, non-personalized questions
    if (!confusionRetry && userQuestion) {
      cachedResult = await getCachedResponse(userQuestion, level);
      
      if (cachedResult) {
        console.error('[CHAT] 🎯 CACHE HIT! Returning cached response');
        
        const responseTime = Date.now() - startTime;
        
        // ⭐ IMPORTANT: Return in UI Message format for web, text for extension
        if (isExtension) {
          return new Response(cachedResult.response, {
            status: 200,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'X-Cache-Hit': 'true',
              'X-AI-Provider': cachedResult.provider,
              'X-AI-Model': cachedResult.model,
              'X-Response-Time': responseTime.toString(),
              'X-Cache-Age': Math.round((Date.now() - cachedResult.cachedAt) / 1000).toString(),
              'X-Cache-Hit-Count': cachedResult.hitCount.toString(),
            }
          });
        } else {
          // Web UI needs AI SDK format
          // Create a minimal UI message stream
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              // Send the cached response in AI SDK format
              const uiMessage = `0:${JSON.stringify(cachedResult.response)}\n`;
              controller.enqueue(encoder.encode(uiMessage));
              controller.close();
            }
          });
          
          return new Response(stream, {
            status: 200,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'X-Cache-Hit': 'true',
              'X-AI-Provider': cachedResult.provider,
              'X-AI-Model': cachedResult.model,
              'X-Response-Time': responseTime.toString(),
              'X-Cache-Age': Math.round((Date.now() - cachedResult.cachedAt) / 1000).toString(),
              'X-Cache-Hit-Count': cachedResult.hitCount.toString(),
            }
          });
        }
      }
    }
    
    console.error('[CHAT] ❌ Cache miss - proceeding to AI call');

    // ============================================================================
    // STEP 5: AUTHENTICATE USER
    // ============================================================================
    
    let user = null;
    let supabaseClient = null;
    
    try {
      console.error('[CHAT] 🔐 Attempting authentication...');
      
      if (isExtension) {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        
        if (token) {
          supabaseClient = await createClientWithToken(token);
          const { data, error: authError } = await supabaseClient.auth.getUser();
          if (!authError && data.user) {
            user = data.user;
            console.error('[CHAT] ✅ Extension user authenticated:', user.email);
          }
        }
      } else {
        supabaseClient = await createClient();
        const { data, error: authError } = await supabaseClient.auth.getUser();
        if (!authError && data.user) {
          user = data.user;
          console.error('[CHAT] ✅ Web user authenticated:', user.email);
        }
      }
    } catch (authError) {
      console.error('[CHAT] ⚠️ Auth error:', authError);
    }
    
    // ============================================================================
    // STEP 6: USER-SPECIFIC RATE LIMITING
    // ============================================================================
    
    let isPremium = false;
    let aiProvider: AIProvider = 'openai';
    let aiModel = 'gpt-4o-mini' as OpenAIModel | ClaudeModel;
    
    console.error('[CHAT] 🧪 Starting A/B test assignment...');
    
    if (user && supabaseClient) {
      try {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();
        
        isPremium = profile?.subscription_status === 'premium';
        aiProvider = getABTestProvider(user.id);
        aiModel = getModelForTier(aiProvider, isPremium);
        
        console.error('[CHAT] ✅ A/B assignment:', {
          userId: user.id.slice(0, 8),
          isPremium,
          provider: aiProvider,
          model: aiModel
        });
      } catch (subError) {
        console.error('[CHAT] ⚠️ Subscription check error:', subError);
      }
    } else {
      aiProvider = getABTestProvider(null);
      aiModel = getModelForTier(aiProvider, false);
      console.error('[CHAT] ℹ️ Guest user assigned:', { provider: aiProvider, model: aiModel });
    }
    
    const userLimiter = isPremium ? premiumUserLimiter : freeUserLimiter;
    const identifier = getUserIdentifier(user?.id || null, ip);
    
    const userCheck = await checkRateLimit(userLimiter, identifier);
    
    if (!userCheck.success) {
      console.warn('[CHAT] ⚠️ User rate limit exceeded');
      
      const upgradeMessage = isPremium
        ? `Daily limit reached (${userCheck.limit} questions). Please try again tomorrow.`
        : `Daily limit reached (${userCheck.limit} questions). Upgrade to Premium for 1000/day!`;
      
      return createRateLimitResponse(
        upgradeMessage,
        userCheck.limit,
        userCheck.remaining,
        userCheck.reset
      );
    }
    
    console.error('[CHAT] 📊 Rate limit status:', {
      remaining: userCheck.remaining,
      limit: userCheck.limit,
    });
    
    // ============================================================================
    // STEP 7: BUILD SYSTEM PROMPT
    // ============================================================================
    
    console.error('[CHAT] 📄 Building system prompt...');
    let systemPrompt = getSystemPromptV3(level);

    if (confusionRetry && retryInstructions) {
      console.error('[CHAT] 😕 Adding confusion retry instructions');
      systemPrompt += `\n\n[IMPORTANT INSTRUCTION FOR THIS RESPONSE ONLY]: ${retryInstructions}`;
    }

    // ============================================================================
    // STEP 8: PERSONALIZATION
    // ============================================================================
    
    if (user) {
      try {
        const profile = await getUserProfile(user.id);
        
        if (profile && Array.isArray(profile.knownTopics) && profile.knownTopics.length > 0) {
          if (userQuestion) {
            const topics = extractTopics(userQuestion);
            const currentTopic = topics[0] || '';
            const personalizedAddition = getPersonalizedAnalogyPrompt(profile, currentTopic);
            systemPrompt += personalizedAddition;
            console.error('[CHAT] 🎯 Added personalization');
          }
        }

        Promise.all([
          updateUserStreak(user.id),
          updateDailyStats(user.id, undefined, level, false, false),
          checkAllAchievements(user.id),
        ]).catch((gamError) => {
          console.error('[CHAT] ⚠️ Gamification error:', gamError);
        });
      } catch (profileError) {
        console.error('[CHAT] ⚠️ Personalization error:', profileError);
      }
    }

    // ============================================================================
    // STEP 9: CONVERT MESSAGES & CALL AI
    // ============================================================================
    
    console.error('[CHAT] 🔄 Converting messages...');
    let modelMessages;
    if (isExtension) {
      modelMessages = messages;
    } else {
      modelMessages = convertToModelMessages(messages);
    }

    console.error('[CHAT] 🤖 Calling AI (cache miss)');
    
    const result = await streamAIResponse({
      provider: aiProvider,
      model: aiModel,
      systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
    });

    console.error('[CHAT] ✅ Stream result received');

    // ============================================================================
    // STEP 10: CACHE THE RESPONSE IN BACKGROUND
    // ============================================================================
    
    // For caching, we'll collect the full response after streaming
    // We'll do this by tee-ing the stream
    const textResponse = isExtension 
      ? result.toTextStreamResponse()
      : result.toUIMessageStreamResponse();
    
    // Clone the response body to read it for caching
    if (!confusionRetry && userQuestion && textResponse.body) {
      const [stream1, stream2] = textResponse.body.tee();
      
      // Read stream1 in background to cache
      (async () => {
        try {
          const reader = stream1.getReader();
          const decoder = new TextDecoder();
          let fullResponse = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            
            // For UI message stream, extract just the text content
            if (!isExtension) {
              // AI SDK format is like: 0:"text content"\n
              // We need to parse it to get the actual text
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('0:')) {
                  try {
                    const content = JSON.parse(line.substring(2));
                    fullResponse += content;
                  } catch (e) {
                    // If parsing fails, just append the raw chunk
                    fullResponse += chunk;
                  }
                }
              }
            } else {
              fullResponse += chunk;
            }
          }
          
          // Cache the complete response
          if (fullResponse) {
            console.error('[CHAT] 💾 Caching response:', {
              questionLength: userQuestion.length,
              responseLength: fullResponse.length,
              provider: aiProvider,
              model: aiModel
            });
            
            await setCachedResponse(
              userQuestion,
              level,
              fullResponse,
              aiModel,
              aiProvider
            );
          }
        } catch (error) {
          console.error('[CHAT] ⚠️ Error caching response:', error);
          // Don't fail the request
        }
      })();
      
      // Return stream2 to the client
      const responseTime = Date.now() - startTime;
      
      const response = new Response(stream2, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Cache-Hit': 'false',
          'X-AI-Provider': aiProvider,
          'X-AI-Model': aiModel,
          'X-Response-Time': responseTime.toString(),
          'X-Is-Premium': isPremium.toString(),
          'X-RateLimit-Limit': userCheck.limit.toString(),
          'X-RateLimit-Remaining': userCheck.remaining.toString(),
        }
      });

      console.error('[CHAT] ✅ Response ready, caching in background');
      return response;
    }

    // If not caching (confusion retry or no question), just return the stream
    const responseTime = Date.now() - startTime;
    
    const response = textResponse;
    response.headers.set('X-Cache-Hit', 'false');
    response.headers.set('X-AI-Provider', aiProvider);
    response.headers.set('X-AI-Model', aiModel);
    response.headers.set('X-Response-Time', responseTime.toString());
    response.headers.set('X-Is-Premium', isPremium.toString());
    response.headers.set('X-RateLimit-Limit', userCheck.limit.toString());
    response.headers.set('X-RateLimit-Remaining', userCheck.remaining.toString());

    console.error('[CHAT] ✅ Response ready (no caching)');
    return response;

  } catch (error) {
    console.error('[CHAT] ❌ CRITICAL ERROR:', error);
    
    return Response.json({ 
      error: 'Error processing chat request',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}