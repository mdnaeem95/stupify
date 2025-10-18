import { Redis } from "@upstash/redis";

// Initialize Redis client (same one used for rate limiting)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

const CACHE_CONFIG = {
  // How long to cache responses (7 days in seconds)
  DEFAULT_TTL: 60 * 60 * 24 * 7, // 7 days
  
  // Shorter TTL for potentially time-sensitive content (1 day)
  SHORT_TTL: 60 * 60 * 24, // 1 day
  
  // Minimum question length to cache (avoid caching "hi", "ok", etc.)
  MIN_QUESTION_LENGTH: 10,
  
  // Maximum question length to cache (avoid caching essays)
  MAX_QUESTION_LENGTH: 500,
  
  // Keywords that indicate time-sensitive content (use SHORT_TTL)
  TIME_SENSITIVE_KEYWORDS: [
    'latest', 'recent', 'current', 'today', 'now', 'new', 
    'breaking', 'update', '2024', '2025', 'this week', 'this month'
  ],
  
  // Keywords that indicate personalized content (DON'T CACHE)
  PERSONALIZED_KEYWORDS: [
    'my', 'i am', 'i\'m', 'me', 'personal', 'recommend me',
    'for me', 'help me', 'my situation', 'i have', 'i need'
  ],
};

// =============================================================================
// CACHE KEY GENERATION
// =============================================================================

/**
 * Generate a deterministic cache key from question and settings
 * Format: "cache:v1:{level}:{normalizedQuestion}"
 */
export function generateCacheKey(
  question: string,
  simplicityLevel: string
): string {
  // Normalize question:
  // - Lowercase
  // - Remove extra whitespace
  // - Remove punctuation
  // - Trim
  const normalized = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
  
  // Create hash-like key (first 100 chars to keep keys manageable)
  const questionKey = normalized.substring(0, 100);
  
  return `cache:v1:${simplicityLevel}:${questionKey}`;
}

// =============================================================================
// CACHE DECISION LOGIC
// =============================================================================

/**
 * Determine if a question should be cached
 */
export function shouldCache(question: string): {
  shouldCache: boolean;
  reason?: string;
  ttl?: number;
} {
  // Check length
  if (question.length < CACHE_CONFIG.MIN_QUESTION_LENGTH) {
    return {
      shouldCache: false,
      reason: 'Question too short'
    };
  }
  
  if (question.length > CACHE_CONFIG.MAX_QUESTION_LENGTH) {
    return {
      shouldCache: false,
      reason: 'Question too long'
    };
  }
  
  const lowerQuestion = question.toLowerCase();
  
  // Check for personalized content
  const isPersonalized = CACHE_CONFIG.PERSONALIZED_KEYWORDS.some(
    keyword => lowerQuestion.includes(keyword)
  );
  
  if (isPersonalized) {
    return {
      shouldCache: false,
      reason: 'Question appears personalized'
    };
  }
  
  // Check for time-sensitive content
  const isTimeSensitive = CACHE_CONFIG.TIME_SENSITIVE_KEYWORDS.some(
    keyword => lowerQuestion.includes(keyword)
  );
  
  if (isTimeSensitive) {
    return {
      shouldCache: true,
      reason: 'Time-sensitive content',
      ttl: CACHE_CONFIG.SHORT_TTL
    };
  }
  
  // Cache by default with standard TTL
  return {
    shouldCache: true,
    reason: 'Cacheable question',
    ttl: CACHE_CONFIG.DEFAULT_TTL
  };
}

// =============================================================================
// CACHE OPERATIONS
// =============================================================================

export interface CachedResponse {
  response: string;
  model: string;
  provider: string;
  cachedAt: number;
  hitCount: number;
}

/**
 * Get cached response if it exists
 */
export async function getCachedResponse(
  question: string,
  simplicityLevel: string
): Promise<CachedResponse | null> {
  try {
    const cacheKey = generateCacheKey(question, simplicityLevel);
    const cached = await redis.get<CachedResponse>(cacheKey);
    
    if (cached) {
      // Increment hit count
      await redis.hincrby('cache:stats', 'hits', 1);
      
      // Update hit count for this specific cache entry
      await redis.hincrby(cacheKey + ':meta', 'hitCount', 1);
      
      console.log('[CACHE] ✅ HIT:', {
        key: cacheKey.substring(0, 50) + '...',
        hitCount: cached.hitCount + 1,
        age: Math.round((Date.now() - cached.cachedAt) / 1000 / 60) + ' minutes'
      });
      
      return {
        ...cached,
        hitCount: cached.hitCount + 1
      };
    }
    
    // Cache miss
    await redis.hincrby('cache:stats', 'misses', 1);
    
    console.log('[CACHE] ❌ MISS:', {
      key: cacheKey.substring(0, 50) + '...'
    });
    
    return null;
  } catch (error) {
    console.error('[CACHE] Error getting cached response:', error);
    return null; // Fail gracefully - don't break the request
  }
}

/**
 * Store response in cache
 */
export async function setCachedResponse(
  question: string,
  simplicityLevel: string,
  response: string,
  model: string,
  provider: string,
  ttl?: number
): Promise<void> {
  try {
    const decision = shouldCache(question);
    
    if (!decision.shouldCache) {
      console.log('[CACHE] ⏭️  Skipping cache:', decision.reason);
      return;
    }
    
    const cacheKey = generateCacheKey(question, simplicityLevel);
    const cacheTTL = ttl || decision.ttl || CACHE_CONFIG.DEFAULT_TTL;
    
    const cacheData: CachedResponse = {
      response,
      model,
      provider,
      cachedAt: Date.now(),
      hitCount: 0,
    };
    
    // Store the cached response with TTL
    await redis.set(cacheKey, cacheData, { ex: cacheTTL });
    
    // Track cache storage
    await redis.hincrby('cache:stats', 'stored', 1);
    
    console.log('[CACHE] 💾 STORED:', {
      key: cacheKey.substring(0, 50) + '...',
      ttl: cacheTTL + 's (' + Math.round(cacheTTL / 60 / 60 / 24) + ' days)',
      responseLength: response.length,
      reason: decision.reason
    });
  } catch (error) {
    console.error('[CACHE] Error storing response:', error);
    // Fail gracefully - don't break the request
  }
}

/**
 * Invalidate cache for a specific question
 */
export async function invalidateCache(
  question: string,
  simplicityLevel: string
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(question, simplicityLevel);
    await redis.del(cacheKey);
    
    console.log('[CACHE] 🗑️  INVALIDATED:', cacheKey.substring(0, 50) + '...');
  } catch (error) {
    console.error('[CACHE] Error invalidating cache:', error);
  }
}

/**
 * Clear all cache (use sparingly!)
 */
export async function clearAllCache(): Promise<void> {
  try {
    // Get all cache keys
    const keys = await redis.keys('cache:v1:*');
    
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log('[CACHE] 🗑️  CLEARED ALL:', keys.length + ' entries');
    }
  } catch (error) {
    console.error('[CACHE] Error clearing cache:', error);
  }
}

// =============================================================================
// CACHE STATISTICS
// =============================================================================

export interface CacheStats {
  hits: number;
  misses: number;
  stored: number;
  hitRate: number;
  totalRequests: number;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStats> {
  try {
    const stats = await redis.hgetall<Record<string, number>>('cache:stats');
    
    const hits = stats?.hits || 0;
    const misses = stats?.misses || 0;
    const stored = stats?.stored || 0;
    const totalRequests = hits + misses;
    const hitRate = totalRequests > 0 ? (hits / totalRequests) * 100 : 0;
    
    return {
      hits,
      misses,
      stored,
      totalRequests,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  } catch (error) {
    console.error('[CACHE] Error getting stats:', error);
    return {
      hits: 0,
      misses: 0,
      stored: 0,
      totalRequests: 0,
      hitRate: 0,
    };
  }
}

/**
 * Reset cache statistics
 */
export async function resetCacheStats(): Promise<void> {
  try {
    await redis.del('cache:stats');
    console.log('[CACHE] 📊 Stats reset');
  } catch (error) {
    console.error('[CACHE] Error resetting stats:', error);
  }
}