/* eslint-disable  @typescript-eslint/no-explicit-any */
import { convertToModelMessages } from 'ai';
import { getSystemPromptV3, SimplicityLevel } from '@/lib/prompts/prompts-v3';
import { createClient } from '@/lib/supabase/server';
import { createClientWithToken } from '@/lib/supabase/server-api';
import { updateUserStreak } from '@/lib/gamification/streak-tracker';
import { updateDailyStats } from '@/lib/gamification/learning-stats';
import { checkAllAchievements } from '@/lib/gamification/achievement-checker';
import { ClaudeModel, getABTestProvider, getModelForTier, OpenAIModel, streamAIResponse, type AIProvider } from '@/lib/ai-providers';
import { extractTopics } from '@/lib/personalization/topic-extractor';
import { getPersonalizationContext } from '@/lib/personalization/context-injector';
import { createPersonalizedPrompt } from '@/lib/personalization/personalized-prompts';

// Three-tier pricing
import { 
  checkQuestionLimit,  
  type SubscriptionTier 
} from '@/lib/stripe';

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

// Caching
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
      retryInstructions = null,
      conversationId = null
    } = body;
    
    console.error('[CHAT] 📝 Parsed body:', {
      messageCount: messages?.length,
      level: simplicityLevel,
      source,
      confusionRetry,
      conversationId 
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
    
    if (!confusionRetry && userQuestion) {
      cachedResult = await getCachedResponse(userQuestion, level);
      
      if (cachedResult) {
        console.error('[CHAT] 🎯 CACHE HIT! Returning cached response');
        
        const responseTime = Date.now() - startTime;
        
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
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
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
    // STEP 6: THREE-TIER USAGE LIMITS CHECK
    // ============================================================================
    
    let tier: SubscriptionTier = 'free';
    let monthlyQuestionsUsed = 0;
    
    if (user && supabaseClient) {
      try {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('subscription_status, monthly_questions_used')
          .eq('id', user.id)
          .maybeSingle();
        
        tier = (profile?.subscription_status || 'free') as SubscriptionTier;
        monthlyQuestionsUsed = profile?.monthly_questions_used || 0;
        
        console.error('[CHAT] 👤 User tier:', tier);
        
        // Get today's usage for daily limits (free tier)
        const today = new Date().toISOString().split('T')[0];
        const { data: usage } = await supabaseClient
          .from('daily_usage')
          .select('question_count')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();
        
        const dailyCount = usage?.question_count || 0;
        
        // Check if user can ask questions based on tier
        const limitCheck = checkQuestionLimit(tier, dailyCount, monthlyQuestionsUsed);
        
        if (!limitCheck.canAsk) {
          console.warn('[CHAT] ⚠️ Usage limit reached:', limitCheck.reason);
          
          return Response.json({
            error: 'limit_reached',
            message: limitCheck.reason,
            tier,
            upgradeRequired: limitCheck.upgradeRequired,
            usage: {
              daily: dailyCount,
              monthly: monthlyQuestionsUsed,
            }
          }, { status: 429 });
        }
        
        // Increment usage counters
        console.error('[CHAT] 📊 Incrementing usage counters for', tier);
        
        // 1. Daily usage (for all tiers, tracking purposes)
        await supabaseClient.rpc('increment_daily_usage', {
          p_user_id: user.id,
          p_date: today,
        });
        
        // 2. Monthly usage (for Starter tier only)
        if (tier === 'starter') {
          await supabaseClient
            .from('profiles')
            .update({ 
              monthly_questions_used: monthlyQuestionsUsed + 1 
            })
            .eq('id', user.id);
          
          console.error('[CHAT] 📈 Starter monthly usage:', monthlyQuestionsUsed + 1, '/ 100');
        }
        
        console.error('[CHAT] ✅ Usage limit check passed:', {
          tier,
          daily: dailyCount + 1,
          monthly: tier === 'starter' ? monthlyQuestionsUsed + 1 : 'N/A',
          remaining: limitCheck.questionsLeft
        });
        
      } catch (error) {
        console.error('[CHAT] ⚠️ Usage check error:', error);
        // Continue with free tier defaults if check fails
      }
    }
    
    // ============================================================================
    // STEP 7: DETERMINE AI MODEL BASED ON TIER
    // ============================================================================
    
    let aiProvider: AIProvider = 'openai';
    let aiModel = 'gpt-4o-mini' as OpenAIModel | ClaudeModel;
    
    // Premium users get better models
    const isPremium = tier === 'premium';
    
    console.error('[CHAT] 🧪 Starting A/B test assignment...');
    
    if (user) {
      aiProvider = getABTestProvider(user.id);
      aiModel = getModelForTier(aiProvider, isPremium);
      
      console.error('[CHAT] ✅ A/B assignment:', {
        userId: user.id.slice(0, 8),
        tier,
        isPremium,
        provider: aiProvider,
        model: aiModel
      });
    } else {
      // Guest users (no auth)
      aiProvider = getABTestProvider(null);
      aiModel = getModelForTier(aiProvider, false);
      console.error('[CHAT] ℹ️ Guest user assigned:', { provider: aiProvider, model: aiModel });
    }
    
    // ============================================================================
    // STEP 8: LEGACY RATE LIMITING (BACKUP)
    // ============================================================================
    
    const userLimiter = isPremium ? premiumUserLimiter : freeUserLimiter;
    const identifier = getUserIdentifier(user?.id || null, ip);
    
    const userCheck = await checkRateLimit(userLimiter, identifier);
    
    if (!userCheck.success) {
      console.warn('[CHAT] ⚠️ Rate limiter backup triggered');
      
      const upgradeMessage = isPremium
        ? `Daily limit reached (${userCheck.limit} questions). Please try again tomorrow.`
        : `Daily limit reached. Upgrade to continue learning!`;
      
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
    // STEP 9: BUILD SYSTEM PROMPT
    // ============================================================================
    
    console.error('[CHAT] 📄 Building system prompt...');
    let systemPrompt = getSystemPromptV3(level);

    if (confusionRetry && retryInstructions) {
      console.error('[CHAT] 😕 Adding confusion retry instructions');
      systemPrompt += `\n\n[IMPORTANT INSTRUCTION FOR THIS RESPONSE ONLY]: ${retryInstructions}`;
    }

    // ============================================================================
    // STEP 10: ⭐ NEW PERSONALIZATION ENGINE
    // ============================================================================

    let extractedTopics: string[] = [];

    if (user && userQuestion) {
      try {
        console.error('[CHAT] 🎯 Starting personalization engine...');
        
        // 1. Extract topics from question
        const topicResult = await extractTopics(userQuestion);
        extractedTopics = topicResult.topics;
        
        console.error('[CHAT] 📚 Extracted topics:', {
          topics: extractedTopics,
          confidence: topicResult.confidence,
          fallback: topicResult.fallbackUsed
        });
                
        // 3. Get personalization context
        const context = await getPersonalizationContext(user.id, extractedTopics);
        
        console.error('[CHAT] 🧠 Personalization context loaded:', {
          knownTopics: context.knownTopics.length,
          hasLearningStyle: !!context.learningStyle,
          struggles: context.recentStruggles.length,
          memories: context.crossConversationMemories.length,
          totalQuestions: context.stats.totalQuestions
        });
        
        // 4. Create personalized prompt
        if (context.knownTopics.length > 0 || context.learningStyle) {
          systemPrompt = createPersonalizedPrompt(systemPrompt, context, level);
          console.error('[CHAT] ✨ Personalized prompt injected');
        } else {
          console.error('[CHAT] ℹ️ No personalization data available');
        }
        
        // 5. Run gamification in background (non-blocking)
        Promise.all([
          updateUserStreak(user.id),
          updateDailyStats(user.id, undefined, level, false, false),
          checkAllAchievements(user.id),
        ]).catch((gamError) => {
          console.error('[CHAT] ⚠️ Gamification error:', gamError);
        });
        
      } catch (personalizationError) {
        console.error('[CHAT] ⚠️ Personalization error:', personalizationError);
        // Continue without personalization
      }
    }

    // ============================================================================
    // STEP 11: CONVERT MESSAGES & CALL AI
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
    // STEP 12: CACHE THE RESPONSE IN BACKGROUND
    // ============================================================================
    
    const textResponse = isExtension 
      ? result.toTextStreamResponse()
      : result.toUIMessageStreamResponse();
    
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
            
            if (!isExtension) {
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('0:')) {
                  try {
                    const content = JSON.parse(line.substring(2));
                    fullResponse += content;
                  } catch (e) {
                    fullResponse += chunk;
                    console.warn('[CHAT] ⚠️ Error parsing chunk for caching, using raw chunk', e);
                  }
                }
              }
            } else {
              fullResponse += chunk;
            }
          }
          
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
          'X-Subscription-Tier': tier,
          'X-Is-Premium': isPremium.toString(),
          'X-RateLimit-Limit': userCheck.limit.toString(),
          'X-RateLimit-Remaining': userCheck.remaining.toString(),
        }
      });

      console.error('[CHAT] ✅ Response ready, caching in background');
      return response;
    }

    // If not caching, just return the stream
    const responseTime = Date.now() - startTime;
    
    const response = textResponse;
    response.headers.set('X-Cache-Hit', 'false');
    response.headers.set('X-AI-Provider', aiProvider);
    response.headers.set('X-AI-Model', aiModel);
    response.headers.set('X-Response-Time', responseTime.toString());
    response.headers.set('X-Subscription-Tier', tier);
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