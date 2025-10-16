/* eslint-disable  @typescript-eslint/no-explicit-any */
import Anthropic from '@anthropic-ai/sdk';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export type AIProvider = 'openai' | 'anthropic';
export type OpenAIModel = 'gpt-4o-mini' | 'gpt-4o';
export type ClaudeModel = 'claude-sonnet-4-20250514' | 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022';

export interface AIConfig {
  provider: AIProvider;
  model: OpenAIModel | ClaudeModel;
  systemPrompt: string;
  messages: any[];
  temperature?: number;
}

/**
 * Get AI provider based on A/B test assignment
 */
export function getABTestProvider(userId: string | null): AIProvider {
  if (process.env.ENABLE_AB_TEST !== 'true') {
    return 'openai';
  }

  if (!userId) {
    return Math.random() < 0.5 ? 'anthropic' : 'openai';
  }

  const hash = hashString(userId);
  const claudePercentage = parseInt(process.env.CLAUDE_PERCENTAGE || '50');
  
  return (hash % 100) < claudePercentage ? 'anthropic' : 'openai';
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Get model based on provider and subscription tier
 */
export function getModelForTier(
  provider: AIProvider,
  isPremium: boolean
): OpenAIModel | ClaudeModel {
  if (provider === 'anthropic') {
    return isPremium ? 'claude-3-5-haiku-20241022' : 'claude-sonnet-4-20250514';
  } else {
    return isPremium ? 'gpt-4o' : 'gpt-4o-mini';
  }
}

/**
 * Stream response from appropriate AI provider
 */
export async function streamAIResponse(config: AIConfig) {
  if (config.provider === 'anthropic') {
    return streamClaudeResponse(config);
  } else {
    return streamOpenAIResponse(config);
  }
}

/**
 * Stream from OpenAI
 */
async function streamOpenAIResponse(config: AIConfig) {
  return streamText({
    model: openai(config.model as OpenAIModel),
    system: config.systemPrompt,
    messages: config.messages,
    temperature: config.temperature || 0.7,
  });
}

/**
 * Stream from Claude
 */
async function streamClaudeResponse(config: AIConfig) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const claudeMessages = config.messages.map((msg: any) => ({
    role: msg.role === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
    content: msg.content,
  }));

  const stream = await anthropic.messages.create({
    model: config.model as ClaudeModel,
    max_tokens: 2048,
    temperature: config.temperature || 0.7,
    system: config.systemPrompt,
    messages: claudeMessages,
    stream: true,
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              controller.enqueue(
                new TextEncoder().encode(event.delta.text)
              );
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return {
    toTextStreamResponse: () => new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-AI-Provider': 'anthropic',
        'X-AI-Model': config.model,
      },
    }),
    toUIMessageStreamResponse: () => {
      const dataStream = new ReadableStream({
        async start(controller) {
          const reader = readableStream.getReader();
          const decoder = new TextDecoder();
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const text = decoder.decode(value, { stream: true });
              controller.enqueue(
                new TextEncoder().encode(`0:${JSON.stringify(text)}\n`)
              );
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(dataStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-AI-Provider': 'anthropic',
          'X-AI-Model': config.model,
        },
      });
    },
  };
}