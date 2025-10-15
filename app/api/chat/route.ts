/* eslint-disable  @typescript-eslint/no-explicit-any */
import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { getSystemPromptV2, SimplicityLevel } from '@/lib/prompts-v2';
import { createClient } from '@/lib/supabase/server-api';
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
    console.log('📦 Request body:', body);
    
    const { messages, simplicityLevel } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ 
        error: 'Invalid request: messages must be an array' 
      }, { status: 400 });
    }
    
    const level = (simplicityLevel || 'normal') as SimplicityLevel;

    // Get authenticated user
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    let user = null;
    try {
      const supabase = createClient(token);
      const { data, error: authError } = await supabase.auth.getUser();
      if (!authError) {
        user = data.user;
        console.log('✅ Authenticated user:', user?.email);
      }
    } catch (error) {
      console.log('⚠️ Auth failed (continuing without user):', error);
    }
    
    // Get system prompt
    let systemPrompt = getSystemPromptV2(level);

    // Add personalization if user is logged in
    if (user) {
      try {
        const profile = await getUserProfile(user.id);
        
        // ✅ Safely check if profile and knownTopics exist
        if (profile && Array.isArray(profile.knownTopics) && profile.knownTopics.length > 0) {
          // Extract topic from user's question
          const userMessages = messages.filter((m: any) => m?.role === 'user');
          const lastUserMessage = userMessages[userMessages.length - 1];
          const userQuestion = lastUserMessage?.content || '';
          
          if (userQuestion) {
            const topics = extractTopics(userQuestion);
            const currentTopic = topics[0] || '';
            
            // Add personalization to prompt
            const personalizedAddition = getPersonalizedAnalogyPrompt(profile, currentTopic);
            systemPrompt += personalizedAddition;
            
            console.log('🎯 Personalized prompt for user');
          }
        }

        // Run gamification tracking in background (don't await)
        Promise.all([
          updateUserStreak(user.id),
          updateDailyStats(user.id, undefined, level, false, false),
          checkAllAchievements(user.id),
        ]).catch((error) => {
          console.error('⚠️ Gamification error (non-critical):', error);
        });
      } catch (profileError) {
        console.error('⚠️ Personalization error (continuing):', profileError);
        // Continue without personalization
      }
    }

    // Convert UIMessages to ModelMessages for streamText
    const modelMessages = convertToModelMessages(messages);

    // Use the new AI SDK v5 streamText
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
    });

    // Return as AI Stream Response
    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error('Chat API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return Response.json({ 
      error: 'Error processing chat request',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}