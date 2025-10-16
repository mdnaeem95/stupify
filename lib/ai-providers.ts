/* eslint-disable  @typescript-eslint/no-explicit-any */
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export type AIProvider = 'openai' | 'anthropic';
export type OpenAIModel = 'gpt-4o-mini' | 'gpt-4o';
export type ClaudeModel =
  | 'claude-sonnet-4-20250514'
  | 'claude-sonnet-4-5-20250929' // optional newest Sonnet 4.5
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022';

export interface AIConfig {
  provider: AIProvider;
  model: OpenAIModel | ClaudeModel;
  systemPrompt: string;
  messages: any[];      // [{ role: 'user'|'assistant'|'system', content: string }]
  temperature?: number;
}

/** A/B provider choice */
export function getABTestProvider(userId: string | null): AIProvider {
  if (process.env.ENABLE_AB_TEST !== 'true') return 'openai';
  if (!userId) return Math.random() < 0.5 ? 'anthropic' : 'openai';

  const hash = hashString(userId);
  const claudePercentage = parseInt(process.env.CLAUDE_PERCENTAGE || '50', 10);
  return (hash % 100) < claudePercentage ? 'anthropic' : 'openai';
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

/** Tier-based model selection (fixed: premium => stronger) */
export function getModelForTier(
  provider: AIProvider,
  isPremium: boolean
): OpenAIModel | ClaudeModel {
  if (provider === 'anthropic') {
    return isPremium
      ? 'claude-sonnet-4-20250514'       // or 'claude-sonnet-4-5-20250929'
      : 'claude-3-5-haiku-20241022';
  }
  return isPremium ? 'gpt-4o' : 'gpt-4o-mini';
}

/** Single entrypoint */
export async function streamAIResponse(config: AIConfig) {
  return config.provider === 'anthropic'
    ? streamClaudeResponse(config)
    : streamOpenAIResponse(config);
}

/** OpenAI via AI SDK */
async function streamOpenAIResponse(config: AIConfig) {
  return streamText({
    model: openai(config.model as OpenAIModel),
    system: config.systemPrompt,
    messages: config.messages,
    temperature: config.temperature ?? 0.7,
  });
}

/** Anthropic via AI SDK (no manual streaming loop) */
async function streamClaudeResponse(config: AIConfig) {
  // Ensure ANTHROPIC_API_KEY is set in env (AI SDK reads it automatically
  return streamText({
    model: anthropic(config.model as ClaudeModel),
    system: config.systemPrompt,
    messages: config.messages,
    temperature: config.temperature ?? 0.7,

    // Optional: enable thinking on Sonnet 4 / Opus 4 models when needed
    // providerOptions: { anthropic: { thinking: { type: 'enabled', budgetTokens: 8000 } } },
  });
}
