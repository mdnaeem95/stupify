import { SimplicityLevel } from '@/lib/prompts';

interface LevelSuggestionProps {
  suggestedLevel: SimplicityLevel;
  onAccept: () => void;
  onDismiss: () => void;
}

export function LevelSuggestion({ suggestedLevel, onAccept, onDismiss }: LevelSuggestionProps) {
  const levelText = suggestedLevel === 'advanced' ? 'more detailed' : 'simpler';

  return (
    <div className="max-w-4xl mx-auto px-6 mb-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-900">
            💡 You&apos;re doing great! Want to try {levelText} explanations?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
          >
            Yes, switch
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-1 bg-white text-purple-600 text-sm rounded-lg border border-purple-200 hover:bg-purple-50"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}