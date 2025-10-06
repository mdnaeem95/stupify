import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { getSystemPrompt, type SimplicityLevel } from '@/lib/prompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, simplicityLevel } = await req.json();

    // Validate simplicity level
    const level = (simplicityLevel || 'normal') as SimplicityLevel;
    
    // Get the appropriate system prompt
    const systemPrompt = getSystemPrompt(level);

    // Convert UIMessages to ModelMessages for streamText
    const modelMessages = convertToModelMessages(messages);

    // Use the new AI SDK v5 streamText
    const result = await streamText({
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