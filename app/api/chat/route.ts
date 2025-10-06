import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
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

    // Use the new AI SDK streamText
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Error processing chat request', { status: 500 });
  }
}