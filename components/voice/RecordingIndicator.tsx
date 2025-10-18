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
  const barCount = isMobile ? 15 : 20;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const baseHeight = 20 + (volume * 0.6);
    const variation = Math.sin((i + duration) * 0.5) * 10;
    const height = Math.max(10, Math.min(80, baseHeight + variation));
    return height;
  });
  
  return (
    <div className={cn(
      'fixed inset-0 z-50 bg-white',
      'flex flex-col items-center justify-center',
      'animate-in fade-in duration-200'
    )}>
      {/* Subtle ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-3xl rounded-full" />
      
      {/* Safe area padding for mobile */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 safe-area-inset">
        
        {/* Cancel button - top right */}
        <button
          onClick={onCancel}
          className={cn(
            'absolute top-6 right-6',
            'w-10 h-10 rounded-xl',
            'bg-gray-100 hover:bg-gray-200',
            'flex items-center justify-center',
            'transition-colors duration-200'
          )}
          aria-label="Cancel recording"
        >
          <X className="w-5 h-5 text-gray-600" strokeWidth={2} />
        </button>
        
        {/* Main content */}
        <div className="flex flex-col items-center gap-10 max-w-md w-full">
          
          {/* Microphone icon - simple and clean */}
          <div className="relative">
            <div className="absolute inset-0 -m-6">
              <div className="w-24 h-24 rounded-full bg-red-500/10 animate-pulse" />
            </div>
            
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Duration - large and clear */}
          <div className="text-center space-y-3">
            <div className="text-7xl font-bold text-gray-900 tabular-nums tracking-tight">
              {formatDuration(duration)}
            </div>
            <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-gray-700 text-sm font-medium">
                {method === 'web-speech' ? 'Listening...' : 'Recording...'}
              </span>
            </div>
          </div>
          
          {/* Waveform - minimal and clean */}
          <div className="flex items-center justify-center gap-1.5 h-16">
            {bars.map((height, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-indigo-600 to-violet-600 rounded-full transition-all duration-100"
                style={{
                  height: `${height}%`,
                }}
              />
            ))}
          </div>
          
          {/* Interim transcript */}
          {interimTranscript && (
            <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-4 min-h-[60px]">
              <p className="text-gray-700 text-center text-sm leading-relaxed">
                {interimTranscript}
              </p>
            </div>
          )}
          
          {/* Stop button - prominent */}
          <div className="w-full max-w-xs space-y-3">
            <Button
              onClick={onStop}
              className={cn(
                'w-full h-14 rounded-2xl',
                'bg-gradient-to-r from-indigo-600 to-violet-600',
                'hover:from-indigo-700 hover:to-violet-700',
                'text-white font-semibold text-base',
                'shadow-lg shadow-indigo-500/25',
                'hover:shadow-xl hover:shadow-indigo-500/30',
                'transform hover:-translate-y-0.5',
                'transition-all duration-200',
                'active:scale-95'
              )}
            >
              Stop Recording
            </Button>
            
            <p className="text-gray-500 text-sm text-center">
              or wait for automatic pause
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}