import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ShareableCard } from '@/components/shareable/ShareableCard';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { SimplicityLevel } from '@/lib/prompts/prompts-v2';

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: SharePageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('saved_explanations')
    .select('question, answer')
    .eq('id', resolvedParams.id)
    .single();

  if (!data) {
    return {
      title: 'Explanation Not Found - Stupify',
    };
  }

  const truncatedAnswer = data.answer.substring(0, 155) + '...';
  
  return {
    title: `${data.question} - Explained Simply | Stupify`,
    description: truncatedAnswer,
    openGraph: {
      title: data.question,
      description: truncatedAnswer,
      type: 'article',
      siteName: 'Stupify',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.question,
      description: truncatedAnswer,
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  // Fetch the shared explanation (no auth required - public page)
  const { data: explanation, error } = await supabase
    .from('saved_explanations')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !explanation) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Stupify</span>
            </Link>
            
            <div className="flex gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" asChild>
                <Link href="/signup">Try Stupify Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Intro Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Check out this explanation!
          </h1>
          <p className="text-lg text-gray-600">
            Created with Stupify - AI that finally speaks human
          </p>
        </div>

        {/* Shareable Card */}
        <div className="flex justify-center mb-8">
          <ShareableCard
            question={explanation.question}
            answer={explanation.answer}
            level={explanation.simplicity_level as SimplicityLevel}
            theme={explanation.card_theme as 'gradient' | 'minimal' | 'playful'}
            showBranding={true}
          />
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-4 border border-purple-200">
              <span className="text-2xl">💡</span>
              <span className="text-sm font-semibold text-purple-900">Get your own simple explanations!</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Want to understand anything this clearly?
            </h2>
            
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Stupify makes complex topics simple. Ask anything, get clear answers in seconds.
              No jargon, no confusion, just clarity.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                asChild
              >
                <Link href="/signup">Start Learning Free</Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                asChild
              >
                <Link href="/">Learn More</Link>
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              10 free questions per day • No credit card required
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-white"
                />
              ))}
            </div>
            <span>Join thousands learning with Stupify</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500">
            © 2025 Stupify. Made with ❤️ to make AI accessible to everyone.
          </div>
        </div>
      </footer>
    </div>
  );
}