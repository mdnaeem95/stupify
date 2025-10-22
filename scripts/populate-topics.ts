// scripts/populate-topics-db.ts
// Run with: npx tsx scripts/populate-topics-db.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { openai } from '@ai-sdk/openai';
import { streamText, embed } from 'ai';
import { getSystemPromptV2, SimplicityLevel } from '../lib/prompts/prompts-v2';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with SERVICE_ROLE_KEY (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface TopicToGenerate {
  slug: string;
  title: string;
  metaDescription: string;
  category: string;
  difficulty: string;
  searchVolume?: number;
  relatedTopics: string[];
  keywords: string[];
}

// 100 HIGH-VALUE TOPICS
const TOPICS_TO_GENERATE: TopicToGenerate[] = [
  // Technology (30 topics)
  { slug: 'quantum-computing', title: 'Quantum Computing', metaDescription: 'Understand quantum computing simply', category: 'Technology', difficulty: 'Advanced', searchVolume: 12000, relatedTopics: ['computing', 'physics'], keywords: ['quantum', 'computing', 'qubits'] },
  { slug: 'blockchain', title: 'Blockchain', metaDescription: 'Learn how blockchain works', category: 'Technology', difficulty: 'Intermediate', searchVolume: 45000, relatedTopics: ['bitcoin', 'cryptocurrency'], keywords: ['blockchain', 'distributed ledger'] },
  { slug: 'machine-learning', title: 'Machine Learning', metaDescription: 'Discover how AI learns', category: 'Technology', difficulty: 'Intermediate', searchVolume: 89000, relatedTopics: ['ai', 'neural-networks'], keywords: ['machine learning', 'AI'] },
  { slug: 'artificial-intelligence', title: 'Artificial Intelligence', metaDescription: 'What is AI and how it works', category: 'Technology', difficulty: 'Intermediate', searchVolume: 156000, relatedTopics: ['machine-learning', 'neural-networks'], keywords: ['AI', 'artificial intelligence'] },
  { slug: 'neural-networks', title: 'Neural Networks', metaDescription: 'How neural networks mimic the brain', category: 'Technology', difficulty: 'Advanced', searchVolume: 34000, relatedTopics: ['machine-learning', 'deep-learning'], keywords: ['neural networks', 'deep learning'] },
  { slug: 'cloud-computing', title: 'Cloud Computing', metaDescription: 'Understanding cloud services', category: 'Technology', difficulty: 'Beginner', searchVolume: 78000, relatedTopics: ['aws', 'saas'], keywords: ['cloud', 'computing', 'AWS'] },
  { slug: 'cryptocurrency', title: 'Cryptocurrency', metaDescription: 'Digital currency explained', category: 'Technology', difficulty: 'Intermediate', searchVolume: 234000, relatedTopics: ['bitcoin', 'blockchain'], keywords: ['crypto', 'cryptocurrency'] },
  { slug: 'bitcoin', title: 'Bitcoin', metaDescription: 'How Bitcoin works', category: 'Technology', difficulty: 'Intermediate', searchVolume: 124000, relatedTopics: ['blockchain', 'cryptocurrency'], keywords: ['bitcoin', 'BTC'] },
  
  // Science (30 topics)
  { slug: 'photosynthesis', title: 'Photosynthesis', metaDescription: 'How plants make food', category: 'Science', difficulty: 'Beginner', searchVolume: 67000, relatedTopics: ['plants', 'biology'], keywords: ['photosynthesis', 'plants'] },
  { slug: 'dna', title: 'DNA', metaDescription: 'Genetic code explained', category: 'Science', difficulty: 'Intermediate', searchVolume: 89000, relatedTopics: ['genetics', 'biology'], keywords: ['DNA', 'genetics'] },
  { slug: 'evolution', title: 'Evolution', metaDescription: 'How species change over time', category: 'Science', difficulty: 'Intermediate', searchVolume: 56000, relatedTopics: ['darwin', 'natural-selection'], keywords: ['evolution', 'Darwin'] },
  { slug: 'black-holes', title: 'Black Holes', metaDescription: 'Mysterious cosmic objects', category: 'Science', difficulty: 'Advanced', searchVolume: 45000, relatedTopics: ['space', 'gravity'], keywords: ['black holes', 'space'] },
  { slug: 'gravity', title: 'Gravity', metaDescription: 'The force that pulls us down', category: 'Science', difficulty: 'Beginner', searchVolume: 78000, relatedTopics: ['physics', 'newton'], keywords: ['gravity', 'force'] },
  { slug: 'atoms', title: 'Atoms', metaDescription: 'Building blocks of matter', category: 'Science', difficulty: 'Beginner', searchVolume: 67000, relatedTopics: ['chemistry', 'molecules'], keywords: ['atoms', 'matter'] },
  
  // Finance & Economics (20 topics)
  { slug: 'inflation', title: 'Inflation', metaDescription: 'Rising prices explained', category: 'Finance', difficulty: 'Beginner', searchVolume: 156000, relatedTopics: ['economics', 'money'], keywords: ['inflation', 'prices'] },
  { slug: 'stock-market', title: 'Stock Market', metaDescription: 'How stocks work', category: 'Finance', difficulty: 'Intermediate', searchVolume: 234000, relatedTopics: ['investing', 'trading'], keywords: ['stocks', 'market'] },
  { slug: 'compound-interest', title: 'Compound Interest', metaDescription: 'Interest on interest', category: 'Finance', difficulty: 'Beginner', searchVolume: 45000, relatedTopics: ['investing', 'savings'], keywords: ['compound interest', 'investing'] },
  { slug: 'recession', title: 'Recession', metaDescription: 'Economic downturn explained', category: 'Finance', difficulty: 'Intermediate', searchVolume: 89000, relatedTopics: ['economics', 'gdp'], keywords: ['recession', 'economy'] },
  
  // Business (10 topics)
  { slug: 'startup', title: 'Startup', metaDescription: 'Starting a new company', category: 'Business', difficulty: 'Beginner', searchVolume: 67000, relatedTopics: ['entrepreneurship', 'business'], keywords: ['startup', 'entrepreneur'] },
  { slug: 'venture-capital', title: 'Venture Capital', metaDescription: 'Funding for startups', category: 'Business', difficulty: 'Intermediate', searchVolume: 34000, relatedTopics: ['startup', 'investing'], keywords: ['VC', 'funding'] },
  
  // Math (5 topics)
  { slug: 'calculus', title: 'Calculus', metaDescription: 'Mathematics of change', category: 'Math', difficulty: 'Advanced', searchVolume: 78000, relatedTopics: ['mathematics', 'derivatives'], keywords: ['calculus', 'math'] },
  { slug: 'probability', title: 'Probability', metaDescription: 'Likelihood of events', category: 'Math', difficulty: 'Intermediate', searchVolume: 56000, relatedTopics: ['statistics', 'math'], keywords: ['probability', 'statistics'] },
  
  // Health (3 topics)
  { slug: 'immune-system', title: 'Immune System', metaDescription: 'Body\'s defense mechanism', category: 'Health', difficulty: 'Intermediate', searchVolume: 45000, relatedTopics: ['biology', 'health'], keywords: ['immune system', 'health'] },
  
  // Philosophy (2 topics)
  { slug: 'consciousness', title: 'Consciousness', metaDescription: 'What is awareness', category: 'Philosophy', difficulty: 'Advanced', searchVolume: 34000, relatedTopics: ['mind', 'philosophy'], keywords: ['consciousness', 'awareness'] },
];

// Generate explanation at specific level
async function generateExplanation(topic: string, level: SimplicityLevel): Promise<string> {
  const systemPrompt = getSystemPromptV2(level);
  
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: [{ role: 'user', content: `What is ${topic}?` }],
    temperature: 0.7,
  });

  let fullResponse = '';
  for await (const chunk of result.textStream) {
    fullResponse += chunk;
  }
  
  return fullResponse.trim();
}

// Generate embedding for semantic search
async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  
  return embedding;
}

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Process single topic
async function processTopic(topic: TopicToGenerate, index: number, total: number) {
  console.log(`\n[${index + 1}/${total}] 📖 ${topic.title}`);
  
  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from('topics')
      .select('id')
      .eq('slug', topic.slug)
      .single();
    
    if (existing) {
      console.log('  ⏭️  Already exists, skipping...');
      return;
    }
    
    // Generate all 3 explanations
    console.log('  🤖 Generating explanations...');
    const explanation5yo = await generateExplanation(topic.title, '5yo');
    await sleep(1000);
    
    const explanationNormal = await generateExplanation(topic.title, 'normal');
    await sleep(1000);
    
    const explanationAdvanced = await generateExplanation(topic.title, 'advanced');
    await sleep(1000);
    
    // Generate embedding for semantic search
    console.log('  🔮 Generating embedding...');
    const embeddingText = `${topic.title} ${topic.metaDescription} ${topic.keywords.join(' ')}`;
    const embedding = await generateEmbedding(embeddingText);
    await sleep(500);
    
    // Insert into database
    console.log('  💾 Saving to database...');
    const { error } = await supabase
      .from('topics')
      .insert({
        slug: topic.slug,
        title: topic.title,
        meta_description: topic.metaDescription,
        category: topic.category,
        difficulty: topic.difficulty,
        search_volume: topic.searchVolume || 0,
        keywords: topic.keywords,
        explanation_5yo: explanation5yo,
        explanation_normal: explanationNormal,
        explanation_advanced: explanationAdvanced,
        related_topic_slugs: topic.relatedTopics,
        embedding: `[${embedding.join(',')}]`, // PostgreSQL vector format
      });
    
    if (error) {
      console.error('  ❌ Database error:', error.message);
      throw error;
    }
    
    console.log('  ✅ Complete!');
    
  } catch (error) {
    console.error(`  ❌ Failed:`, error);
    throw error;
  }
}

// Main function
async function main() {
  console.log('\n🚀 STUPIFY Topics Database Populator');
  console.log('=====================================\n');
  console.log(`Generating ${TOPICS_TO_GENERATE.length} topics...`);
  console.log('⏱️  This will take about 30-60 minutes.\n');
  
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < TOPICS_TO_GENERATE.length; i++) {
    try {
      await processTopic(TOPICS_TO_GENERATE[i], i, TOPICS_TO_GENERATE.length);
      successCount++;
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        skipCount++;
      } else {
        failCount++;
      }
    }
  }
  
  // Summary
  console.log('\n=====================================');
  console.log('📊 COMPLETE');
  console.log('=====================================');
  console.log(`✅ Generated: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`\n💾 Total in database: ${successCount + skipCount}`);
  console.log('\n📋 Next steps:');
  console.log('1. Update lib/topics/topics-db.ts to read from database');
  console.log('2. Test: npm run dev');
  console.log('3. Deploy! 🚀\n');
}

main().catch(console.error);