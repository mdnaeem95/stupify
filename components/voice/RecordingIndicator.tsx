/**
 * RecordingIndicator Component
 * 
 * Fullscreen overlay that appears during voice recording
 * Shows visual feedback, duration, and controls
 */

'use client';

import { Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/useMobileDetection';

export interface RecordingIndicatorProps {
  isVisible: boolean;
  duration: number;
  volume: number;
  interimTranscript: string;
  method: 'web-speech' | 'whisper' | null;
  onStop: () => void;
  onCancel: () => void;
}

export function RecordingIndicator({
  isVisible,
  duration,
  volume,
  interimTranscript,
  method,
  onStop,
  onCancel,
}: RecordingIndicatorProps) {
  const { isMobile } = useMobileDetection();
  
  if (!isVisible) {
    return null;
  }
  
  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate waveform bars based on volume
  const barCount = isMobile ? 20 : 30;
  const bars = Array.from({ length: barCount }, (_, i) => {
    // Create variation in bar heights based on volume and position
    const baseHeight = 20 + (volume * 0.6);
    const variation = Math.sin((i + duration) * 0.5) * 10;
    const height = Math.max(10, Math.min(80, baseHeight + variation));
    return height;
  });
  
  return (
    <div className={cn(
      'fixed inset-0 z-50 bg-gradient-to-br from-purple-600/95 to-blue-600/95 backdrop-blur-sm',
      'flex flex-col items-center justify-center',
      'animate-in fade-in duration-200'
    )}>
      {/* Safe area padding for mobile */}
      <div className="w-full h-full flex flex-col items-center justify-center p-6 safe-area-inset">
        
        {/* Cancel button */}
        <button
          onClick={onCancel}
          className={cn(
            'absolute top-6 right-6',
            'w-12 h-12 rounded-full',
            'bg-white/20 hover:bg-white/30',
            'flex items-center justify-center',
            'transition-colors'
          )}
          aria-label="Cancel recording"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        {/* Main content */}
        <div className="flex flex-col items-center gap-8 max-w-md w-full">
          
          {/* Microphone icon with pulse */}
          <div className="relative">
            {/* Pulsing circles */}
            <div className="absolute inset-0 -m-8">
              <div className="w-32 h-32 rounded-full bg-white/20 animate-ping" />
            </div>
            <div className="absolute inset-0 -m-4">
              <div className="w-24 h-24 rounded-full bg-white/20 animate-pulse" />
            </div>
            
            {/* Icon */}
            <div className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <Mic className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          {/* Duration */}
          <div className="text-center">
            <div className="text-6xl font-bold text-white tabular-nums">
              {formatDuration(duration)}
            </div>
            <div className="text-white/80 text-sm mt-2">
              {method === 'web-speech' ? 'Listening...' : 'Recording...'}
            </div>
          </div>
          
          {/* Waveform visualization */}
          <div className="flex items-center justify-center gap-1 h-20">
            {bars.map((height, i) => (
              <div
                key={i}
                className="w-1 bg-white/60 rounded-full transition-all duration-100"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 20}ms`,
                }}
              />
            ))}
          </div>
          
          {/* Interim transcript */}
          {interimTranscript && (
            <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-h-[60px]">
              <p className="text-white/90 text-center text-sm">
                {interimTranscript}
              </p>
            </div>
          )}
          
          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-white/90 font-medium">
              {isMobile ? 'Tap to stop' : 'Click to stop'}
            </p>
            <p className="text-white/60 text-sm">
              or wait for automatic pause
            </p>
          </div>
          
          {/* Stop button */}
          <Button
            onClick={onStop}
            className={cn(
              'w-full max-w-xs',
              'h-14 rounded-full',
              'bg-white hover:bg-white/90',
              'text-purple-600 font-semibold text-lg',
              'shadow-xl',
              'transition-all duration-200',
              'active:scale-95'
            )}
          >
            Stop Recording
          </Button>
        </div>
      </div>
    </div>
  );
}