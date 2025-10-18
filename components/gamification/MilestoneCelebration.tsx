'use client';

import { useEffect, useState } from 'react';
import { Mascot } from '../mascot/Mascot';
import { Flame, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MilestoneCelebrationProps {
  milestone: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MilestoneCelebration({ milestone, isOpen, onClose }: MilestoneCelebrationProps) {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowFireworks(true);
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getMilestoneMessage = () => {
    if (milestone === 3) {
      return {
        title: "3-Day Streak! 🔥",
        message: "You're building an amazing habit!",
        color: "from-orange-400 to-red-400",
      };
    } else if (milestone === 7) {
      return {
        title: "7-Day Streak! 🔥🔥",
        message: "A whole week of learning! You're unstoppable!",
        color: "from-orange-500 to-red-500",
      };
    } else if (milestone === 30) {
      return {
        title: "30-Day Streak! 🔥🔥🔥",
        message: "A FULL MONTH! You're a learning legend!",
        color: "from-orange-600 to-red-600",
      };
    } else if (milestone === 100) {
      return {
        title: "100-DAY STREAK! 🔥🔥🔥🔥",
        message: "INCREDIBLE! You've joined the Century Club!",
        color: "from-yellow-500 to-orange-600",
      };
    } else {
      return {
        title: `${milestone}-Day Streak! 🔥`,
        message: "Keep that fire burning!",
        color: "from-orange-500 to-red-500",
      };
    }
  };

  const { title, message, color } = getMilestoneMessage();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-3xl shadow-2xl shadow-orange-500/20 max-w-lg w-full p-10 relative pointer-events-auto animate-bounceIn"
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
            {/* Blinky with fires */}
            <div className="relative flex justify-center">
              <Mascot expression="celebrating" size={180} />
              {/* Floating fire icons */}
              <div className="absolute -left-8 top-8 animate-float">
                <Flame className="w-12 h-12 text-orange-500" strokeWidth={2} />
              </div>
              <div className="absolute -right-8 top-8 animate-float-delayed">
                <Flame className="w-12 h-12 text-red-500" strokeWidth={2} />
              </div>
            </div>

            {/* Milestone title with gradient */}
            <div>
              <h2 className={`text-4xl font-black mb-3 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {title}
              </h2>
              <p className="text-xl text-gray-700 font-semibold leading-relaxed">{message}</p>
            </div>

            {/* Stats bar */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {milestone}
                  </p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Days</p>
                </div>
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {milestone * 2}
                  </p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Avg Questions</p>
                </div>
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {Math.floor(milestone / 3)}
                  </p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Topics</p>
                </div>
              </div>
            </div>

            {/* Encouragement */}
            <div className="text-center">
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                {milestone === 3 && "Three days in a row! The hardest part is over. Keep going! 💪"}
                {milestone === 7 && "You've proven this is a habit. See you tomorrow! 🎯"}
                {milestone === 30 && "Research shows it takes 30 days to form a habit. You did it! 🏆"}
                {milestone === 100 && "Only the most dedicated learners reach 100 days. You're incredible! 👑"}
                {milestone > 100 && `${milestone} days of consistent learning. You're setting an example for everyone! 🌟`}
              </p>
            </div>

            {/* Action button */}
            <Button
              onClick={onClose}
              className={`w-full bg-gradient-to-r ${color} hover:opacity-90 text-white text-lg py-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all cursor-pointer`}
            >
              Let&apos;s Keep Learning! 🚀
            </Button>
          </div>
        </div>
      </div>

      {/* Fireworks animation */}
      {showFireworks && <Fireworks />}

      {/* Add styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { 
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 2s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </>
  );
}

// Fireworks component (more dramatic than confetti)
function Fireworks() {
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => {
        const colors = ['#f59e0b', '#f97316', '#ef4444', '#dc2626'];
        return (
          <div
            key={i}
            className="absolute animate-firework"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              width: '4px',
              height: '4px',
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes firework {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(
              ${Math.random() * 200 - 100}px,
              ${Math.random() * 200 - 100}px
            ) scale(3);
            opacity: 0;
          }
        }
        .animate-firework {
          animation: firework ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Hook to check and show milestone celebrations
export function useMilestoneCelebration() {
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const checkMilestone = (streakData: { currentStreak: number; isNewRecord?: boolean; milestoneReached?: boolean; milestoneValue?: number }) => {
    if (streakData.milestoneReached && streakData.milestoneValue) {
      setCurrentMilestone(streakData.milestoneValue);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMilestone(null);
  };

  return {
    currentMilestone,
    isModalOpen,
    closeModal,
    checkMilestone,
  };
}