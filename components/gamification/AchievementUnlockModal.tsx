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
          className="bg-white rounded-3xl shadow-2xl shadow-indigo-500/20 max-w-md w-full p-8 relative pointer-events-auto animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Content */}
          <div className="text-center space-y-6">
            {/* Blinky celebration */}
            <div className="flex justify-center">
              <Mascot expression="celebrating" size={160} />
            </div>

            {/* Achievement unlocked text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Achievement Unlocked!
                </span>
              </div>
              <div className="text-6xl mb-4">{achievement.icon}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{achievement.name}</h2>
              <p className="text-gray-600 leading-relaxed">{achievement.description}</p>
            </div>

            {/* Category badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
              <span className="text-sm font-semibold text-gray-700 capitalize">
                {achievement.category}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all font-semibold cursor-pointer"
              >
                Awesome!
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement share functionality
                  console.log('Share achievement:', achievement);
                }}
                variant="outline"
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" strokeWidth={2} />
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
            backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 5)],
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