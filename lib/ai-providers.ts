/* eslint-disable  @typescript-eslint/no-explicit-any */
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export type AIProvider = 'openai' | 'anthropic';
export type OpenAIModel = 'gpt-4o-mini' | 'gpt-4o';
export type ClaudeModel =
  | 'claude-sonnet-4-20250514'
  | 'claude-sonnet-4-5-20250929'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022';

export interface AIConfig {
  provider: AIProvider;
  model: OpenAIModel | ClaudeModel;
  systemPrompt: string;
  messages: any[];
  temperature?: number;
}

/** A/B provider choice */
export function getABTestProvider(userId: string | null): AIProvider {
  console.error('[AI-PROVIDER] getABTestProvider called:', { 
    userId: userId?.slice(0, 8),
    abTestEnabled: process.env.ENABLE_AB_TEST 
  });
  
  if (process.env.ENABLE_AB_TEST !== 'true') {
    console.error('[AI-PROVIDER] A/B test disabled, using openai');
    return 'openai';
  }
  
  if (!userId) {
    const random = Math.random() < 0.5 ? 'anthropic' : 'openai';
    console.error('[AI-PROVIDER] Guest user, random:', random);
    return random;
  }

  const hash = hashString(userId);
  const claudePercentage = parseInt(process.env.CLAUDE_PERCENTAGE || '50', 10);
  const provider = (hash % 100) < claudePercentage ? 'anthropic' : 'openai';
  
  console.error('[AI-PROVIDER] User assigned:', { hash, claudePercentage, provider });
  return provider;
}

/** Simple string hash */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Tier-based model selection */
export function getModelForTier(
  provider: AIProvider,
  isPremium: boolean
): OpenAIModel | ClaudeModel {
  const model = provider === 'anthropic'
    ? (isPremium ? 'claude-sonnet-4-20250514' : 'claude-3-5-haiku-20241022')
    : (isPremium ? 'gpt-4o' : 'gpt-4o-mini');
  
  console.error('[AI-PROVIDER] Model selected:', { provider, isPremium, model });
  return model;
}

/** Single entrypoint */
export async function streamAIResponse(config: AIConfig) {
  console.error('[AI-PROVIDER] streamAIResponse called:', {
    provider: config.provider,
    model: config.model,
    messageCount: config.messages.length,
    promptLength: config.systemPrompt.length
  });
  
  try {
    const result = config.provider === 'anthropic'
      ? await streamClaudeResponse(config)
      : await streamOpenAIResponse(config);
    
    console.error('[AI-PROVIDER] ✅ Stream created successfully');
    return result;
  } catch (error) {
    console.error('[AI-PROVIDER] ❌ Stream creation failed:', error);
    console.error('[AI-PROVIDER] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    throw error;
  }
}

/** OpenAI via AI SDK */
async function streamOpenAIResponse(config: AIConfig) {
  console.error('[AI-PROVIDER] 🤖 Using OpenAI:', config.model);
  
  try {
    return streamText({
      model: openai(config.model as OpenAIModel),
      system: config.systemPrompt,
      messages: config.messages,
      temperature: config.temperature ?? 0.7,
    });
  } catch (error) {
    console.error('[AI-PROVIDER] ❌ OpenAI error:', error);
    throw error;
  }
}

/** Anthropic via AI SDK */
async function streamClaudeResponse(config: AIConfig) {
  console.error('[AI-PROVIDER] 🧠 Using Claude:', config.model);
  
  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[AI-PROVIDER] ❌ ANTHROPIC_API_KEY not found!');
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }
  
  console.error('[AI-PROVIDER] ✅ API key found');
  
  try {
    return streamText({
      model: anthropic(config.model as ClaudeModel),
      system: config.systemPrompt,
      messages: config.messages,
      temperature: config.temperature ?? 0.7,
    });
  } catch (error) {
    console.error('[AI-PROVIDER] ❌ Claude error:', error);
    throw error;
  }
}