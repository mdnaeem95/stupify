'use client';

import { Mic, MicOff, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface VoiceButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  error: string | null;
  duration: number;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  userTier?: 'free' | 'starter' | 'premium'; // NEW
  onUpgradeClick?: () => void; // NEW
}

export function VoiceButton({
  isRecording,
  isProcessing,
  isSupported,
  error,
  duration,
  onClick,
  disabled = false,
  className,
  size = 'md',
  userTier = 'free', // NEW
  onUpgradeClick, // NEW
}: VoiceButtonProps) {
  // Check if voice is locked for free users
  const isLocked = userTier === 'free';
  const isDisabled = disabled || !isSupported || isProcessing || isLocked;
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-11 w-11',
    lg: 'h-12 w-12',
  };
  
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };
  
  // Handle click - show upgrade modal if locked
  const handleClick = () => {
    if (isLocked && onUpgradeClick) {
      onUpgradeClick();
    } else {
      onClick();
    }
  };
  
  return (
    <div className="relative group">
      <Button
        type="button"
        onClick={handleClick}
        disabled={isDisabled && !isLocked} // Don't disable if just locked
        className={cn(
          'rounded-2xl transition-all duration-200 relative overflow-hidden',
          sizeClasses[size],
          // Locked state (free users)
          isLocked && 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 shadow-lg cursor-pointer',
          // Idle state - gradient matching design system
          !isLocked && !isRecording && !isProcessing && !error && 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5',
          // Recording state - red with pulse
          !isLocked && isRecording && 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25',
          // Processing state
          !isLocked && isProcessing && 'bg-gray-400 cursor-wait',
          // Disabled state
          isDisabled && !isProcessing && !isLocked && 'opacity-50 cursor-not-allowed',
          // Error state
          !isLocked && error && !isRecording && !isProcessing && 'bg-gradient-to-r from-red-500 to-red-600',
          className
        )}
        aria-label={
          isLocked ? 'Upgrade to use voice input' :
          isRecording ? 'Stop recording' :
          isProcessing ? 'Processing...' :
          error ? 'Voice input error' :
          !isSupported ? 'Voice input not supported' :
          'Start voice input'
        }
        style={{
          minHeight: size === 'lg' ? '48px' : '44px',
          minWidth: size === 'lg' ? '48px' : '44px',
        }}
      >
        {isLocked ? (
          <Lock className={cn(iconSizeClasses[size], 'text-white')} strokeWidth={2.5} />
        ) : isProcessing ? (
          <Loader2 className={cn(iconSizeClasses[size], 'animate-spin text-white')} strokeWidth={2.5} />
        ) : isRecording ? (
          <MicOff className={cn(iconSizeClasses[size], 'text-white')} strokeWidth={2.5} />
        ) : error ? (
          <Mic className={cn(iconSizeClasses[size], 'text-white opacity-50')} strokeWidth={2.5} />
        ) : (
          <Mic className={cn(iconSizeClasses[size], 'text-white')} strokeWidth={2.5} />
        )}
        
        {/* Recording pulse effect */}
        {isRecording && !isLocked && (
          <>
            <span className="absolute inset-0 rounded-2xl bg-red-400/50 animate-ping" />
            <span className="absolute inset-0 rounded-2xl bg-red-400/30 animate-pulse" />
          </>
        )}
      </Button>
      
      {/* Duration display */}
      {isRecording && duration > 0 && !isLocked && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-900 to-violet-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
          {formatDuration(duration)}
        </div>
      )}
      
      {/* Locked tooltip */}
      {isLocked && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
          🔒 Upgrade for voice input
        </div>
      )}
      
      {/* Tooltip for unsupported browsers */}
      {!isSupported && !isLocked && !isRecording && !isProcessing && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          Voice input not supported
        </div>
      )}
      
      {/* Error tooltip */}
      {error && !isRecording && !isProcessing && !isLocked && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap max-w-[200px] text-center shadow-xl">
          {error}
        </div>
      )}
    </div>
  );
}