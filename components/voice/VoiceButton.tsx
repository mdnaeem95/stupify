/**
 * VoiceButton Component
 * 
 * Microphone button for voice input
 * Shows different states: idle, recording, processing
 */

'use client';

import { Mic, MicOff, Loader2 } from 'lucide-react';
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
}: VoiceButtonProps) {
  // Determine button state
  const isDisabled = disabled || !isSupported || isProcessing;
  
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
  
  return (
    <div className="relative">
      <Button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          'rounded-xl transition-all duration-200',
          sizeClasses[size],
          // Base styles
          'relative overflow-hidden',
          // Idle state
          !isRecording && !isProcessing && 'bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600',
          // Recording state
          isRecording && 'bg-red-500 hover:bg-red-600 animate-pulse',
          // Processing state
          isProcessing && 'bg-gray-400 cursor-wait',
          // Disabled state
          isDisabled && !isProcessing && 'opacity-50 cursor-not-allowed',
          // Error state
          error && !isRecording && !isProcessing && 'bg-red-500',
          className
        )}
        aria-label={
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
        {isProcessing ? (
          <Loader2 className={cn(iconSizeClasses[size], 'animate-spin text-white')} />
        ) : isRecording ? (
          <MicOff className={cn(iconSizeClasses[size], 'text-white')} />
        ) : error ? (
          <Mic className={cn(iconSizeClasses[size], 'text-white opacity-50')} />
        ) : (
          <Mic className={cn(iconSizeClasses[size], 'text-white')} />
        )}
        
        {/* Recording pulse effect */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}
      </Button>
      
      {/* Duration display */}
      {isRecording && duration > 0 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
          {formatDuration(duration)}
        </div>
      )}
      
      {/* Tooltip for unsupported browsers */}
      {!isSupported && !isRecording && !isProcessing && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Voice input not supported
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-black/90" />
          </div>
        </div>
      )}
      
      {/* Error tooltip */}
      {error && !isRecording && !isProcessing && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap max-w-[200px] text-center">
          {error}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-red-600" />
          </div>
        </div>
      )}
    </div>
  );
}