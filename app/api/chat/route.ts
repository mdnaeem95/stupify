/* eslint-disable  @typescript-eslint/no-explicit-any */
import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { getSystemPromptV2, SimplicityLevel } from '@/lib/prompts-v2';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile } from '@/lib/get-user-profile';
import { extractTopics, getPersonalizedAnalogyPrompt } from '@/lib/user-profiler';
import { updateUserStreak } from '@/lib/gamification/streak-tracker';
import { updateDailyStats } from '@/lib/gamification/learning-stats';
import { checkAllAchievements } from '@/lib/gamification/achievement-checker';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, simplicityLevel } = await req.json();
    const level = (simplicityLevel || 'normal') as SimplicityLevel;

    // Get authenticated user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get the appropriate system prompt
    let systemPrompt = getSystemPromptV2(level);

    // Add personalization if user is logged in
    if (user) {
      const profile = await getUserProfile(user.id);
      
      if (profile && profile.knownTopics.length > 0) {
        // Extract topic from user's question
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
        const userQuestion = lastUserMessage?.content || '';
        const topics = extractTopics(userQuestion);
        const currentTopic = topics[0] || '';
        
        // Add personalization to prompt
        const personalizedAddition = getPersonalizedAnalogyPrompt(profile, currentTopic);
        systemPrompt += personalizedAddition;
        
        console.log('🎯 Personalized prompt for user:', {
          knownTopics: profile.knownTopics,
          currentTopic
        });
      }
    }

    if (user) {
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
          console.log('🏆 New achievements unlocked:', newAchievements.length);
        }
      }).catch((error) => {
        console.error('⚠️ Gamification tracking error (non-critical):', error);
      });
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
    return new Response('Error processing chat request', { status: 500 });
  }
}