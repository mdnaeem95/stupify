import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCacheStats, resetCacheStats, clearAllCache } from '@/lib/cache/cache-manager';

// GET /api/cache/stats - Get cache statistics
export async function GET(request: NextRequest) {
  try {
    // Optional: Require authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get cache statistics
    const stats = await getCacheStats();
    
    // Calculate cost savings
    const avgCostPerRequest = 0.0015; // ~$0.0015 per GPT-4o-mini request
    const savedRequests = stats.hits;
    const costSavings = savedRequests * avgCostPerRequest;
    
    return NextResponse.json({
      ...stats,
      costSavings: {
        amount: Math.round(costSavings * 100) / 100,
        currency: 'USD',
        savedRequests,
      },
      metrics: {
        hitRate: stats.hitRate + '%',
        totalRequests: stats.totalRequests,
        cacheEfficiency: stats.hits > 0 
          ? `${Math.round((stats.hits / stats.stored) * 100)}%` 
          : '0%',
      }
    });
    
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cache/stats - Reset cache statistics
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Optional: Check if user is admin
    // For now, any authenticated user can reset
    
    await resetCacheStats();
    
    return NextResponse.json({
      success: true,
      message: 'Cache statistics reset'
    });
    
  } catch (error) {
    console.error('Cache reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cache/clear - Clear all cached responses
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Optional: Check if user is admin
    // This is a dangerous operation!
    
    await clearAllCache();
    
    return NextResponse.json({
      success: true,
      message: 'All cache cleared'
    });
    
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}