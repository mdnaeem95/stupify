/**
 * Topic Extractor - Extracts 1-3 main topics from user questions
 * Used to build and update the user's knowledge graph
 * 
 * @module lib/personalization/topic-extractor
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TopicExtractionResult {
  topics: string[];
  confidence: number;
  fallbackUsed: boolean;
}

/**
 * Extract topics using GPT-4o-mini (fast & cheap)
 */
async function extractWithAI(question: string): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Extract 1-3 main topics from the user's question. Return ONLY a JSON array of lowercase topic strings, no explanation.
        
Examples:
"How does photosynthesis work?" → ["photosynthesis", "biology"]
"Explain quantum entanglement like I'm 5" → ["quantum physics", "entanglement"]
"What's the difference between REST and GraphQL APIs?" → ["rest api", "graphql", "web development"]

Rules:
- Return 1-3 topics maximum
- Use simple, searchable terms
- Lowercase only
- No punctuation
- Prefer specific over general (e.g., "machine learning" not "technology")`
      },
      {
        role: 'user',
        content: question
      }
    ],
    temperature: 0.3,
    max_tokens: 50,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) return [];

  try {
    const topics = JSON.parse(content);
    return Array.isArray(topics) ? topics.slice(0, 3) : [];
  } catch {
    return [];
  }
}

/**
 * Fallback: Simple keyword extraction
 */
function extractWithKeywords(question: string): string[] {
  // Remove common question words
  const stopWords = new Set([
    'what', 'how', 'why', 'when', 'where', 'who', 'which', 'is', 'are', 'was', 'were',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'does', 'do', 'did', 'can', 'could', 'would', 'should', 'will', 'like', 'explain',
    'tell', 'me', 'about', 'difference', 'between', 'work', 'mean'
  ]);

  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  // Group common tech terms
  const bigramMap: Record<string, string> = {
    'machine learning': 'machine learning',
    'quantum physics': 'quantum physics',
    'artificial intelligence': 'artificial intelligence',
    'climate change': 'climate change',
    'neural network': 'neural network',
  };

  // Check for bigrams
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (bigramMap[bigram]) {
      return [bigramMap[bigram]];
    }
  }

  // Return top 2 longest words (likely to be topic-specific)
  return words
    .sort((a, b) => b.length - a.length)
    .slice(0, 2);
}

/**
 * Main extraction function with fallback
 */
export async function extractTopics(
  question: string
): Promise<TopicExtractionResult> {
  if (!question || question.trim().length < 5) {
    return { topics: [], confidence: 0, fallbackUsed: false };
  }

  try {
    const topics = await extractWithAI(question);
    
    if (topics.length > 0) {
      return { topics, confidence: 0.9, fallbackUsed: false };
    }
  } catch (error) {
    console.error('AI topic extraction failed:', error);
  }

  // Fallback to keyword extraction
  const topics = extractWithKeywords(question);
  return { 
    topics, 
    confidence: topics.length > 0 ? 0.6 : 0, 
    fallbackUsed: true 
  };
}

/**
 * Batch extract topics from multiple questions
 */
export async function extractTopicsBatch(
  questions: string[]
): Promise<TopicExtractionResult[]> {
  return Promise.all(questions.map(q => extractTopics(q)));
}