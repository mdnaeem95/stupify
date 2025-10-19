import { Metadata } from 'next';
import Link from 'next/link';
import { getAllTopics, getTopicsByCategory } from '@/lib/topics/topics-db';
import { Sparkles, ArrowRight, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explore Topics | Stupify - Learn Anything Simply',
  description: 'Browse hundreds of topics explained at 3 levels: 5-year-old, normal, and advanced. From quantum computing to photosynthesis.',
  keywords: ['learn', 'explain', 'education', 'simple explanations', 'AI learning'],
};

export default async function ExplainIndexPage() {
  // ⭐ Now async - fetches from database
  const allTopics = await getAllTopics();
  const categories = ['Technology', 'Science', 'Business', 'Finance', 'Health', 'Math', 'Philosophy', 'History'] as const;
  
  // ⭐ Map with Promise.all for parallel fetching
  const categoryTopics = await Promise.all(
    categories.map(async (category) => ({
      name: category,
      topics: await getTopicsByCategory(category),
    }))
  );
  
  const topicsByCategory = categoryTopics.filter(cat => cat.topics.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Stupify
            </span>
          </Link>
          
          <Link 
            href="/chat"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            Try for Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="container mx-auto px-4 py-16 max-w-6xl text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Explore Topics
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Browse {allTopics.length}+ topics explained at 3 levels
        </p>
        
        {/* Search Bar (placeholder for now) */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full text-gray-900 pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-lg"
            />
          </div>
        </div>
      </div>

      {/* Topics by Category */}
      <div className="container mx-auto px-4 pb-16 max-w-6xl">
        {topicsByCategory.map((category) => (
          <div key={category.name} className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {category.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/explain/${topic.slug}`}
                  className="p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {topic.title}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {topic.metaDescription}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                      {topic.difficulty}
                    </span>
                    {topic.searchVolume && (
                      <span className="text-xs text-gray-500">
                        {(topic.searchVolume / 1000).toFixed(0)}k searches/mo
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 pb-16 max-w-4xl">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-xl text-indigo-100 mb-6">
            Ask Stupify anything and get instant, simple answers
          </p>
          <Link 
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all text-lg"
          >
            Start Chatting for Free
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">
              © 2025 Stupify. Making AI accessible to everyone.
            </p>
            <p>
              <Link href="/about" className="hover:text-indigo-600">About</Link>
              <span className="mx-2">•</span>
              <Link href="/privacy" className="hover:text-indigo-600">Privacy</Link>
              <span className="mx-2">•</span>
              <Link href="/terms" className="hover:text-indigo-600">Terms</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}