// lib/topics/topics-db.ts
// Now reads from Supabase database instead of hardcoded data

import { createClient } from '@/lib/supabase/server';
import { Topic } from './types';

// Cache topics in memory for better performance
let topicsCache: Map<string, Topic> | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Helper: Convert database row to Topic type
function dbRowToTopic(row: any): Topic {
  return {
    slug: row.slug,
    title: row.title,
    metaDescription: row.meta_description,
    category: row.category,
    difficulty: row.difficulty,
    searchVolume: row.search_volume,
    explanations: {
      '5yo': row.explanation_5yo,
      normal: row.explanation_normal,
      advanced: row.explanation_advanced,
    },
    relatedTopics: row.related_topic_slugs || [],
    keywords: row.keywords || [],
    lastUpdated: row.updated_at,
  };
}

// Helper: Load topics from database into cache
async function loadTopicsCache(): Promise<Map<string, Topic>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('view_count', { ascending: false });
  
  if (error) {
    console.error('Failed to load topics:', error);
    return new Map();
  }
  
  const cache = new Map<string, Topic>();
  data?.forEach((row) => {
    cache.set(row.slug, dbRowToTopic(row));
  });
  
  return cache;
}

// Helper: Get cache (refresh if expired)
async function getCache(): Promise<Map<string, Topic>> {
  const now = Date.now();
  
  if (!topicsCache || now - cacheTime > CACHE_DURATION) {
    topicsCache = await loadTopicsCache();
    cacheTime = now;
    console.log(`[Topics Cache] Loaded ${topicsCache.size} topics`);
  }
  
  return topicsCache;
}

// Get all topics
export async function getAllTopics(): Promise<Topic[]> {
  const cache = await getCache();
  return Array.from(cache.values());
}

// Get topic by slug
export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const cache = await getCache();
  return cache.get(slug) || null;
}

// Get topics by category
export async function getTopicsByCategory(category: string): Promise<Topic[]> {
  const allTopics = await getAllTopics();
  return allTopics.filter(topic => topic.category === category);
}

// Get related topics
export async function getRelatedTopics(slug: string): Promise<Topic[]> {
  const topic = await getTopicBySlug(slug);
  if (!topic) return [];
  
  const cache = await getCache();
  return topic.relatedTopics
    .map(relatedSlug => cache.get(relatedSlug))
    .filter((t): t is Topic => t !== null);
}

// Search topics (full-text search in memory)
export async function searchTopics(query: string): Promise<Topic[]> {
  const lowerQuery = query.toLowerCase();
  const allTopics = await getAllTopics();
  
  return allTopics.filter(topic => 
    topic.title.toLowerCase().includes(lowerQuery) ||
    topic.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
    topic.metaDescription.toLowerCase().includes(lowerQuery)
  );
}

// Semantic search (finds similar questions)
export async function searchTopicsBySemantic(
  query: string,
  threshold: number = 0.8
): Promise<Array<{ topic: Topic; similarity: number }>> {
  // This requires generating an embedding for the query
  // and searching in the database
  const supabase = await createClient();
  
  // TODO: Generate embedding for query using OpenAI
  // const embedding = await generateEmbedding(query);
  
  // For now, fall back to keyword search
  const results = await searchTopics(query);
  return results.map(topic => ({ topic, similarity: 0.9 }));
}

// Increment view count (call this on page view)
export async function incrementTopicView(slug: string): Promise<void> {
  const supabase = await createClient();
  
  // Use RPC function to increment atomically
  const { error } = await supabase.rpc('increment_topic_view_count', {
    topic_slug: slug,
  });
  
  if (error) {
    console.error('Failed to increment view count:', error);
  }
}

// Increment conversion count (call when user clicks CTA)
export async function incrementTopicConversion(slug: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('topics')
    .update({ conversion_count: supabase.rpc('increment', { value: 1 }) })
    .eq('slug', slug);
  
  if (error) {
    console.error('Failed to increment conversion count:', error);
  }
}

// Clear cache (useful for admin panel)
export function clearTopicsCache(): void {
  topicsCache = null;
  cacheTime = 0;
  console.log('[Topics Cache] Cleared');
}