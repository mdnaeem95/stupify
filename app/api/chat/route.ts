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

export const maxDuration = 30;

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { 
      messages, 
      simplicityLevel, 
      source,
      confusionRetry = false,
      retryInstructions = null
    } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ 
        error: 'Invalid request: messages must be an array' 
      }, { status: 400 });
    }
    
    const level = (simplicityLevel || 'normal') as SimplicityLevel;
    const isExtension = source === 'extension';

    // Get authenticated user
    let user = null;
    let supabaseClient = null;
    
    try {
      if (isExtension) {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        
        if (token) {
          supabaseClient = await createClientWithToken(token);
          const { data, error: authError } = await supabaseClient.auth.getUser();
          if (!authError && data.user) {
            user = data.user;
          }
        }
      } else {
        supabaseClient = await createClient();
        const { data, error: authError } = await supabaseClient.auth.getUser();
        if (!authError && data.user) {
          user = data.user;
        }
      }
    } catch (authError) {
      // Continue without user
    }
    
    // A/B TEST: Determine AI provider and model
    let isPremium = false;
    let aiProvider: AIProvider = 'openai';
    let aiModel = 'gpt-4o-mini' as OpenAIModel | ClaudeModel;
    
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
      } catch (subError) {
        // Continue with defaults
      }
    } else {
      aiProvider = getABTestProvider(null);
      aiModel = getModelForTier(aiProvider, false);
    }
    
    // Get system prompt
    let systemPrompt = getSystemPromptV2(level);

    // Add confusion retry instructions if needed
    if (confusionRetry && retryInstructions) {
      systemPrompt += `\n\n[IMPORTANT INSTRUCTION FOR THIS RESPONSE ONLY]: ${retryInstructions}`;
    }

    // Add personalization if user is logged in
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
          }
        }

        // Run gamification tracking in background
        Promise.all([
          updateUserStreak(user.id),
          updateDailyStats(user.id, undefined, level, false, false),
          checkAllAchievements(user.id),
        ]).catch(() => {
          // Fail silently for gamification errors
        });
      } catch (profileError) {
        // Continue without personalization
      }
    }

    // Convert messages based on source
    let modelMessages;
    if (isExtension) {
      modelMessages = messages;
    } else {
      modelMessages = convertToModelMessages(messages);
    }

    // Stream from appropriate AI provider
    const result = await streamAIResponse({
      provider: aiProvider,
      model: aiModel,
      systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
    });

    const responseTime = Date.now() - startTime;

    // Return appropriate format
    const response = isExtension 
      ? result.toTextStreamResponse() 
      : result.toUIMessageStreamResponse();

    // Add tracking headers
    response.headers.set('X-AI-Provider', aiProvider);
    response.headers.set('X-AI-Model', aiModel);
    response.headers.set('X-Response-Time', responseTime.toString());
    response.headers.set('X-Is-Premium', isPremium.toString());

    return response;

  } catch (error) {
    // Log to error monitoring service in production
    // e.g., Sentry.captureException(error);
    
    return Response.json({ 
      error: 'Error processing chat request',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}