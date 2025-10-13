'use client';

import { useState, useEffect } from 'react';
import { ShareableCard } from './ShareableCard';
import { ShareModal } from './ShareModal';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts-v2';

interface SavedExplanation {
  id: string;
  question: string;
  answer: string;
  simplicity_level: SimplicityLevel;
  card_theme: 'gradient' | 'minimal' | 'playful';
  share_count: number;
  created_at: string;
}

export function ExplanationGallery() {
  const [explanations, setExplanations] = useState<SavedExplanation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExplanation, setSelectedExplanation] = useState<SavedExplanation | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadExplanations();
  }, []);

  const loadExplanations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/share/save?limit=50');
      if (response.ok) {
        const data = await response.json();
        setExplanations(data.explanations || []);
      }
    } catch (error) {
      console.error('Failed to load explanations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (explanation: SavedExplanation) => {
    setSelectedExplanation(explanation);
    setShowShareModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your saved explanations...</p>
        </div>
      </div>
    );
  }

  if (explanations.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-6 rounded-3xl shadow-xl inline-block mb-6">
          <Sparkles className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          No Saved Explanations Yet
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          When you share explanations, they&apos;ll appear here. Start learning and share your favorite insights!
        </p>
        <Button
          onClick={loadExplanations}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Saved Explanations</h2>
          <p className="text-gray-600 mt-1">
            {explanations.length} {explanations.length === 1 ? 'explanation' : 'explanations'} saved
          </p>
        </div>
        <Button
          onClick={loadExplanations}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {explanations.map((explanation) => (
          <div
            key={explanation.id}
            onClick={() => handleCardClick(explanation)}
            className="cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative">
              <ShareableCard
                question={explanation.question}
                answer={explanation.answer}
                level={explanation.simplicity_level}
                theme={explanation.card_theme}
                showBranding={true}
              />
              
              {/* Overlay with stats */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-3xl">
                <div className="flex justify-between items-center text-white text-sm">
                  <span>
                    {new Date(explanation.created_at).toLocaleDateString()}
                  </span>
                  {explanation.share_count > 0 && (
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      {explanation.share_count} {explanation.share_count === 1 ? 'share' : 'shares'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {selectedExplanation && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedExplanation(null);
          }}
          question={selectedExplanation.question}
          answer={selectedExplanation.answer}
          level={selectedExplanation.simplicity_level}
          explanationId={selectedExplanation.id}
        />
      )}
    </div>
  );
}