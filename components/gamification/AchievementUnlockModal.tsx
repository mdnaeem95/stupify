'use client';

import { useEffect, useState } from 'react';
import { Mascot } from '../mascot/Mascot';
import { X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface AchievementUnlockModalProps {
  achievement: Achievement;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementUnlockModal({ achievement, isOpen, onClose }: AchievementUnlockModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative pointer-events-auto animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="text-center space-y-6">
            {/* Blinky celebration */}
            <div className="flex justify-center">
              <Mascot expression="celebrating" size={160} />
            </div>

            {/* Achievement unlocked text */}
            <div>
              <p className="text-sm font-semibold text-purple-600 mb-2">Achievement Unlocked!</p>
              <div className="text-6xl mb-3">{achievement.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{achievement.name}</h2>
              <p className="text-gray-600">{achievement.description}</p>
            </div>

            {/* Category badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200">
              <span className="text-sm font-medium text-purple-900 capitalize">
                {achievement.category}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Awesome!
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement share functionality
                  console.log('Share achievement:', achievement);
                }}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti animation */}
      {showConfetti && <Confetti />}

      {/* Add styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
}

// Confetti component
function Confetti() {
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#a855f7', '#3b82f6', '#fbbf24', '#f472b6', '#10b981'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}