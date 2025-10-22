// scripts/generate-topics.ts
// Run with: npx tsx scripts/generate-topics.ts

// ⭐ IMPORTANT: Load environment variables first!
import { config } from 'dotenv';
config({ path: '.env.local' }); // Load .env.local

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getSystemPromptV2, SimplicityLevel } from '../lib/prompts/prompts-v2';
import * as fs from 'fs/promises';
import * as path from 'path';

// Verify API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY not found!');
  console.error('');
  console.error('Make sure you have one of these files with your API key:');
  console.error('  - .env.local');
  console.error('  - .env');
  console.error('');
  console.error('Example .env.local content:');
  console.error('  OPENAI_API_KEY=sk-proj-your-key-here');
  console.error('');
  process.exit(1);
}

console.log('✅ OpenAI API key loaded');

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

// Topics to generate explanations for
const TOPICS_TO_GENERATE: TopicToGenerate[] = [
  {
    slug: 'quantum-computing',
    title: 'Quantum Computing',
    metaDescription: 'Understand quantum computing simply. Learn how quantum computers work using qubits, superposition, and entanglement. Explained at 3 levels.',
    category: 'Technology',
    difficulty: 'Advanced',
    searchVolume: 12000,
    relatedTopics: ['superposition', 'qubits', 'quantum-mechanics', 'cryptography', 'computing'],
    keywords: ['quantum computing', 'qubits', 'superposition', 'quantum mechanics', 'quantum computers explained'],
  },
  {
    slug: 'blockchain',
    title: 'Blockchain',
    metaDescription: 'Learn how blockchain works in simple terms. Understand distributed ledgers, cryptography, and why blockchain powers Bitcoin and cryptocurrencies.',
    category: 'Technology',
    difficulty: 'Intermediate',
    searchVolume: 45000,
    relatedTopics: ['bitcoin', 'cryptocurrency', 'cryptography', 'distributed-systems', 'smart-contracts'],
    keywords: ['blockchain', 'distributed ledger', 'bitcoin', 'cryptocurrency', 'blockchain explained'],
  },
  {
    slug: 'machine-learning',
    title: 'Machine Learning',
    metaDescription: 'Discover how machine learning works. Understand AI, neural networks, and how computers learn from data. Explained simply.',
    category: 'Technology',
    difficulty: 'Intermediate',
    searchVolume: 89000,
    relatedTopics: ['artificial-intelligence', 'neural-networks', 'deep-learning', 'data-science', 'algorithms'],
    keywords: ['machine learning', 'AI', 'neural networks', 'artificial intelligence', 'ML explained'],
  },
  {
    slug: 'photosynthesis',
    title: 'Photosynthesis',
    metaDescription: 'Learn how plants make food from sunlight. Understand photosynthesis, chlorophyll, and why plants are green. Simple explanations.',
    category: 'Science',
    difficulty: 'Beginner',
    searchVolume: 67000,
    relatedTopics: ['chlorophyll', 'plants', 'biology', 'cellular-respiration', 'ecology'],
    keywords: ['photosynthesis', 'plants', 'chlorophyll', 'how plants make food', 'photosynthesis explained'],
  },
  {
    slug: 'bitcoin',
    title: 'Bitcoin',
    metaDescription: 'Understand Bitcoin simply. Learn how cryptocurrency works, blockchain technology, and why Bitcoin is digital money.',
    category: 'Finance',
    difficulty: 'Intermediate',
    searchVolume: 124000,
    relatedTopics: ['blockchain', 'cryptocurrency', 'mining', 'digital-currency', 'decentralization'],
    keywords: ['bitcoin', 'cryptocurrency', 'digital currency', 'blockchain', 'BTC explained'],
  },
  {
    slug: 'inflation',
    title: 'Inflation',
    metaDescription: 'Learn what inflation means for your money. Understand rising prices, purchasing power, and economic impact explained simply.',
    category: 'Finance',
    difficulty: 'Beginner',
    searchVolume: 156000,
    relatedTopics: ['economics', 'monetary-policy', 'federal-reserve', 'purchasing-power', 'interest-rates'],
    keywords: ['inflation', 'rising prices', 'economics', 'purchasing power', 'inflation explained'],
  },
];

// Helper: Generate explanation at a specific level
async function generateExplanation(
  topic: string,
  level: SimplicityLevel
): Promise<string> {
  console.log(`  Generating ${level} explanation...`);
  
  const systemPrompt = getSystemPromptV2(level);
  const question = `What is ${topic}? Explain it clearly and concisely.`;
  
  try {
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
      temperature: 0.7,
    });

    // Collect the full response
    let fullResponse = '';
    
    for await (const chunk of result.textStream) {
      fullResponse += chunk;
    }
    
    const trimmed = fullResponse.trim();
    console.log(`    ✅ Done (${trimmed.length} chars)`);
    return trimmed;
    
  } catch (error) {
    console.error(`    ❌ Error generating ${level}:`, error);
    throw error;
  }
}

// Helper: Generate all 3 explanations for a topic
async function generateTopicExplanations(topic: TopicToGenerate) {
  console.log(`\n📖 Generating: ${topic.title}`);
  
  const explanations = {
    '5yo': '',
    'normal': '',
    'advanced': '',
  };
  
  try {
    // Generate all 3 levels sequentially (to avoid rate limits)
    explanations['5yo'] = await generateExplanation(topic.title, '5yo');
    await sleep(1500); // 1.5 second delay
    
    explanations.normal = await generateExplanation(topic.title, 'normal');
    await sleep(1500);
    
    explanations.advanced = await generateExplanation(topic.title, 'advanced');
    await sleep(1500);
    
    const totalChars = explanations['5yo'].length + explanations.normal.length + explanations.advanced.length;
    console.log(`  ✅ Complete! (${totalChars} total chars)`);
    
    return explanations;
  } catch (error) {
    console.error(`  ❌ Failed to generate ${topic.title}`);
    throw error;
  }
}

// Helper: Sleep function
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: Escape strings for TypeScript code generation
function escapeForCode(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

// Helper: Generate TypeScript code for topics-db.ts
function generateTopicsDbCode(topics: any[]): string {
  const topicsCode = topics.map(topic => `  '${topic.slug}': {
    slug: '${topic.slug}',
    title: '${escapeForCode(topic.title)}',
    metaDescription: \`${escapeForCode(topic.metaDescription)}\`,
    category: '${topic.category}',
    difficulty: '${topic.difficulty}',
    searchVolume: ${topic.searchVolume || 0},
    explanations: {
      '5yo': \`${escapeForCode(topic.explanations['5yo'])}\`,
      normal: \`${escapeForCode(topic.explanations.normal)}\`,
      advanced: \`${escapeForCode(topic.explanations.advanced)}\`,
    },
    relatedTopics: ${JSON.stringify(topic.relatedTopics)},
    keywords: ${JSON.stringify(topic.keywords)},
    lastUpdated: '${new Date().toISOString()}',
  }`).join(',\n\n');

  return `// lib/topics/topics-db.ts
// AUTO-GENERATED by scripts/generate-topics.ts
// Generated: ${new Date().toISOString()}

import { Topic } from './types';

export const TOPICS_DB: Record<string, Topic> = {
${topicsCode}
};

// Helper function to get all topics
export function getAllTopics(): Topic[] {
  return Object.values(TOPICS_DB);
}

// Helper function to get topic by slug
export function getTopicBySlug(slug: string): Topic | null {
  return TOPICS_DB[slug] || null;
}

// Helper function to get topics by category
export function getTopicsByCategory(category: string): Topic[] {
  return getAllTopics().filter(topic => topic.category === category);
}

// Helper function to get related topics
export function getRelatedTopics(slug: string): Topic[] {
  const topic = getTopicBySlug(slug);
  if (!topic) return [];
  
  return topic.relatedTopics
    .map(relatedSlug => getTopicBySlug(relatedSlug))
    .filter((t): t is Topic => t !== null);
}

// Helper function to search topics
export function searchTopics(query: string): Topic[] {
  const lowerQuery = query.toLowerCase();
  return getAllTopics().filter(topic => 
    topic.title.toLowerCase().includes(lowerQuery) ||
    topic.keywords.some(k => k.toLowerCase().includes(lowerQuery))
  );
}`;
}

// Main function
async function main() {
  console.log('\n🚀 STUPIFY Topic Explanation Generator');
  console.log('=====================================\n');
  console.log(`Generating explanations for ${TOPICS_TO_GENERATE.length} topics...`);
  console.log('⏱️  This will take about 3-4 minutes.\n');

  const generatedTopics = [];
  let successCount = 0;
  let failCount = 0;

  // Generate each topic
  for (const topic of TOPICS_TO_GENERATE) {
    try {
      const explanations = await generateTopicExplanations(topic);
      
      generatedTopics.push({
        ...topic,
        explanations,
        lastUpdated: new Date().toISOString(),
      });
      
      successCount++;
    } catch (error) {
      console.error(`Failed to generate ${topic.title}:`, error);
      failCount++;
    }
  }

  // Generate the TypeScript code
  console.log('\n📝 Generating topics-db.ts file...');
  const code = generateTopicsDbCode(generatedTopics);

  // Write to file
  const outputPath = path.join(process.cwd(), 'lib', 'topics', 'topics-db.ts');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, code, 'utf-8');

  console.log(`✅ Written to: ${outputPath}`);

  // Calculate total characters
  const totalChars = generatedTopics.reduce((sum, t) => 
    sum + t.explanations['5yo'].length + 
    t.explanations.normal.length + 
    t.explanations.advanced.length, 0
  );

  // Summary
  console.log('\n=====================================');
  console.log('📊 GENERATION COMPLETE');
  console.log('=====================================');
  console.log(`✅ Success: ${successCount} topics`);
  console.log(`❌ Failed: ${failCount} topics`);
  console.log(`📊 Total characters: ${totalChars.toLocaleString()}`);
  console.log(`📁 Output: lib/topics/topics-db.ts`);
  console.log('\n📋 Next steps:');
  console.log('1. Review the generated explanations');
  console.log('2. Test the pages: npm run dev');
  console.log('3. Visit: http://localhost:3000/explain/blockchain');
  console.log('4. Deploy to production!\n');
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});