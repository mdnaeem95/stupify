import { createClient } from '@/lib/supabase/server';

export default async function ABTestDashboard() {
  const supabase = await createClient();
  
  // Get overall stats
  const { data: stats } = await supabase
    .from('ab_test_analytics')
    .select('*');
  
  // Get quality ratings
  const { data: ratings } = await supabase
    .from('analogy_ratings')
    .select('rating, ai_provider, ai_model')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
  
  // Calculate averages
  const claudeRatings = ratings?.filter(r => r.ai_provider === 'anthropic') || [];
  const openaiRatings = ratings?.filter(r => r.ai_provider === 'openai') || [];
  
  const claudeAvg = claudeRatings.length > 0
    ? claudeRatings.reduce((sum, r) => sum + (r.rating === 'up' ? 1 : -1), 0) / claudeRatings.length
    : 0;
    
  const openaiAvg = openaiRatings.length > 0
    ? openaiRatings.reduce((sum, r) => sum + (r.rating === 'up' ? 1 : -1), 0) / openaiRatings.length
    : 0;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">A/B Test Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Claude (Anthropic)</h2>
          <div className="space-y-2">
            <p><strong>Messages:</strong> {stats?.find(s => s.ai_provider === 'anthropic')?.total_messages || 0}</p>
            <p><strong>Avg Response Time:</strong> {stats?.find(s => s.ai_provider === 'anthropic')?.avg_response_time || 0}ms</p>
            <p><strong>Quality Score:</strong> {claudeAvg.toFixed(2)}</p>
            <p><strong>Total Ratings:</strong> {claudeRatings.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">OpenAI</h2>
          <div className="space-y-2">
            <p><strong>Messages:</strong> {stats?.find(s => s.ai_provider === 'openai')?.total_messages || 0}</p>
            <p><strong>Avg Response Time:</strong> {stats?.find(s => s.ai_provider === 'openai')?.avg_response_time || 0}ms</p>
            <p><strong>Quality Score:</strong> {openaiAvg.toFixed(2)}</p>
            <p><strong>Total Ratings:</strong> {openaiRatings.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-2">🎯 Winner So Far:</h3>
        <p className="text-lg">
          {claudeAvg > openaiAvg ? '🏆 Claude' : claudeAvg < openaiAvg ? '🏆 OpenAI' : '🤝 Tie'}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Based on {claudeRatings.length + openaiRatings.length} user ratings
        </p>
      </div>
    </div>
  );
}