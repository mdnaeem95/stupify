/* eslint-disable  @typescript-eslint/no-explicit-any */
import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { getSystemPromptV2, SimplicityLevel } from '@/lib/prompts-v2';
import { createClient } from '@/lib/supabase/server';
import { createClientWithToken } from '@/lib/supabase/server-api';
import { getUserProfile } from '@/lib/get-user-profile';
import { extractTopics, getPersonalizedAnalogyPrompt } from '@/lib/user-profiler';
import { updateUserStreak } from '@/lib/gamification/streak-tracker';
import { updateDailyStats } from '@/lib/gamification/learning-stats';
import { checkAllAchievements } from '@/lib/gamification/achievement-checker';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      messages, 
      simplicityLevel, 
      source,
      // NEW: Confusion detection fields
      confusionRetry = false,
      retryInstructions = null
    } = body;
    
    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ 
        error: 'Invalid request: messages must be an array' 
      }, { status: 400 });
    }
    
    const level = (simplicityLevel || 'normal') as SimplicityLevel;
    const isExtension = source === 'extension';
    
    console.log('🚀 Chat request:', { 
      source: isExtension ? 'extension' : 'web',
      messageCount: messages.length,
      level,
      confusionRetry // NEW: Log confusion retries
    });

    // Get authenticated user
    let user = null;
    try {
      // For extension, extract JWT from Authorization header
      if (isExtension) {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        
        if (token) {
          const supabase = await createClientWithToken(token);
          const { data, error: authError } = await supabase.auth.getUser();
          if (!authError && data.user) {
            user = data.user;
            console.log('✅ Extension user authenticated:', user.email);
          }
        }
      } else {
        // For web app, use normal server client (reads cookies)
        const supabase = await createClient();
        const { data, error: authError } = await supabase.auth.getUser();
        if (!authError && data.user) {
          user = data.user;
          console.log('✅ Web user authenticated:', user.email);
        }
      }
    } catch (authError) {
      console.log('⚠️ Auth failed (continuing without user):', authError);
    }
    
    // Get the appropriate system prompt
    let systemPrompt = getSystemPromptV2(level);

    // NEW: Add confusion retry instructions to system prompt if detected
    if (confusionRetry && retryInstructions) {
      console.log('😕 Adding confusion retry instructions to system prompt');
      systemPrompt += `\n\n[IMPORTANT INSTRUCTION FOR THIS RESPONSE ONLY]: ${retryInstructions}`;
    }

    // Add personalization if user is logged in
    if (user) {
      try {
        const profile = await getUserProfile(user.id);
        
        if (profile && Array.isArray(profile.knownTopics) && profile.knownTopics.length > 0) {
          // Extract topic from user's question
          // For extension: simple message format
          // For web: UI message format
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
            
            // Add personalization to prompt
            const personalizedAddition = getPersonalizedAnalogyPrompt(profile, currentTopic);
            systemPrompt += personalizedAddition;
            
            console.log('🎯 Personalized prompt:', {
              knownTopics: profile.knownTopics.slice(0, 3),
              currentTopic
            });
          }
        }

        // Run gamification tracking in background (don't block response)
        Promise.all([
          updateUserStreak(user.id),
          updateDailyStats(user.id, undefined, level, false, false),
          checkAllAchievements(user.id),
        ]).then(([streakResult, , newAchievements]) => {
          if (streakResult) {
            console.log('🔥 Streak updated:', streakResult);
          }
          if (newAchievements && newAchievements.length > 0) {
            console.log('🏆 New achievements:', newAchievements.length);
          }
        }).catch((error) => {
          console.error('⚠️ Gamification error (non-critical):', error);
        });
      } catch (profileError) {
        console.error('⚠️ Personalization error (continuing):', profileError);
        // Continue without personalization
      }
    }

    // Convert messages based on source
    let modelMessages;
    if (isExtension) {
      // Extension sends simple message format - use directly
      modelMessages = messages;
    } else {
      // Web app sends UI message format - convert
      modelMessages = convertToModelMessages(messages);
    }

    // Use the AI SDK v5 streamText
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
    });

    // Return appropriate format based on source
    if (isExtension) {
      return result.toTextStreamResponse();
    } else {
      return result.toUIMessageStreamResponse();
    }

  } catch (error) {
    console.error('Chat API Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return Response.json({ 
      error: 'Error processing chat request',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}