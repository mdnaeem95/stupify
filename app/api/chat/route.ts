/* eslint-disable  @typescript-eslint/no-explicit-any */
import { convertToModelMessages } from 'ai';
import { getSystemPromptV2, SimplicityLevel } from '@/lib/prompts-v2';
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

// ⭐ NEW: Import rate limiting
import {
  globalLimiter,
  freeUserLimiter,
  premiumUserLimiter,
  getClientIp,
  getUserIdentifier,
  checkRateLimit,
  createRateLimitResponse,
} from '@/lib/rate-limit';

export const maxDuration = 30;

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    console.error('[CHAT] 🚀 Request received');
    
    // ============================================================================
    // STEP 1: GLOBAL RATE LIMITING (ANTI-ABUSE)
    // ============================================================================
    
    const ip = getClientIp(req);
    console.error('[CHAT] 🌐 Client IP:', ip.substring(0, 8) + '...');
    
    // Check global rate limit (100 req/min per IP)
    const globalCheck = await checkRateLimit(globalLimiter, ip);
    
    if (!globalCheck.success) {
      console.warn('[CHAT] ⚠️ Global rate limit exceeded for IP:', ip.substring(0, 8) + '...');
      return createRateLimitResponse(
        "Too many requests from your IP. Please slow down.",
        globalCheck.limit,
        globalCheck.remaining,
        globalCheck.reset
      );
    }
    
    console.error('[CHAT] ✅ Global rate limit passed:', {
      remaining: globalCheck.remaining,
      limit: globalCheck.limit
    });
    
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
    // STEP 3: AUTHENTICATE USER
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
    // STEP 4: USER-SPECIFIC RATE LIMITING
    // ============================================================================
    
    // Determine if user is premium
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
    
    // Choose appropriate rate limiter based on subscription
    const userLimiter = isPremium ? premiumUserLimiter : freeUserLimiter;
    const identifier = getUserIdentifier(user?.id || null, ip);
    
    // Check user-specific rate limit
    const userCheck = await checkRateLimit(userLimiter, identifier);
    
    if (!userCheck.success) {
      console.warn('[CHAT] ⚠️ User rate limit exceeded:', {
        userId: user?.id?.slice(0, 8) || 'anonymous',
        isPremium,
        limit: userCheck.limit,
      });
      
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
    
    // Log remaining quota
    console.error('[CHAT] 📊 Rate limit status:', {
      userId: user?.id?.slice(0, 8) || 'anonymous',
      isPremium,
      remaining: userCheck.remaining,
      limit: userCheck.limit,
    });
    
    // ============================================================================
    // STEP 5: BUILD SYSTEM PROMPT
    // ============================================================================
    
    console.error('[CHAT] 📄 Building system prompt...');
    let systemPrompt = getSystemPromptV2(level);

    // Add confusion retry instructions if needed
    if (confusionRetry && retryInstructions) {
      console.error('[CHAT] 😕 Adding confusion retry instructions');
      systemPrompt += `\n\n[IMPORTANT INSTRUCTION FOR THIS RESPONSE ONLY]: ${retryInstructions}`;
    }

    // ============================================================================
    // STEP 6: PERSONALIZATION (NON-BLOCKING)
    // ============================================================================
    
    if (user) {
      try {
        const profile = await getUserProfile(user.id);
        
        if (profile && Array.isArray(profile.knownTopics) && profile.knownTopics.length > 0) {
          let userQuestion = '';
          
          if (isExtension) {
            const lastUserMessage = messages.filter((m: any) => m?.role === 'user').pop();
            userQuestion = lastUserMessage?.content || '';
          } else {
            const userMessages = messages.filter((m: any) => m?.role === 'user');
            const lastUserMessage = userMessages[userMessages.length - 1];
            userQuestion = lastUserMessage?.content || '';
          }
          
          if (userQuestion) {
            const topics = extractTopics(userQuestion);
            const currentTopic = topics[0] || '';
            const personalizedAddition = getPersonalizedAnalogyPrompt(profile, currentTopic);
            systemPrompt += personalizedAddition;
            console.error('[CHAT] 🎯 Added personalization for topics:', topics.slice(0, 3));
          }
        }

        // Run gamification tracking in background (non-blocking)
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
    // STEP 7: CONVERT MESSAGES & CALL AI
    // ============================================================================
    
    console.error('[CHAT] 🔄 Converting messages...');
    let modelMessages;
    if (isExtension) {
      modelMessages = messages;
    } else {
      modelMessages = convertToModelMessages(messages);
    }
    console.error('[CHAT] ✅ Messages converted:', modelMessages.length);

    // Stream from appropriate AI provider
    console.error('[CHAT] 🤖 Calling streamAIResponse with:', {
      provider: aiProvider,
      model: aiModel,
      messageCount: modelMessages.length,
      promptLength: systemPrompt.length
    });
    
    const result = await streamAIResponse({
      provider: aiProvider,
      model: aiModel,
      systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
    });

    console.error('[CHAT] ✅ Stream result received');

    const responseTime = Date.now() - startTime;

    // ============================================================================
    // STEP 8: RETURN RESPONSE WITH TRACKING HEADERS
    // ============================================================================
    
    console.error('[CHAT] 📤 Preparing response format:', isExtension ? 'text' : 'ui');
    
    const response = isExtension 
      ? result.toTextStreamResponse() 
      : result.toUIMessageStreamResponse();

    // Add tracking headers
    response.headers.set('X-AI-Provider', aiProvider);
    response.headers.set('X-AI-Model', aiModel);
    response.headers.set('X-Response-Time', responseTime.toString());
    response.headers.set('X-Is-Premium', isPremium.toString());
    
    // Add rate limit headers (helpful for debugging)
    response.headers.set('X-RateLimit-Limit', userCheck.limit.toString());
    response.headers.set('X-RateLimit-Remaining', userCheck.remaining.toString());
    response.headers.set('X-RateLimit-Reset', userCheck.reset.toString());

    console.error('[CHAT] ✅ Response ready, returning stream');

    return response;

  } catch (error) {
    console.error('[CHAT] ❌❌❌ CRITICAL ERROR:', error);
    console.error('[CHAT] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[CHAT] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
    });
    
    return Response.json({ 
      error: 'Error processing chat request',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}