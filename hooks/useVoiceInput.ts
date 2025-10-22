/* eslint-disable  @typescript-eslint/no-explicit-any */
/**
 * useVoiceInput Hook
 * 
 * Main hook for voice input functionality
 * Orchestrates Web Speech API with Whisper API fallback
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { requestMicrophoneAccess, stopMediaStream, createAudioRecorder, convertToWhisperFormat, SilenceDetector } from '@/lib/voice/audio-utils';
import { checkBrowserCompatibility } from '@/lib/voice/speech-recognition';
import { useHapticFeedback } from './useHapticFeedback';

export interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  autoStop?: boolean; // Auto-stop after silence
  maxDuration?: number; // Max recording duration in ms
  useWebSpeech?: boolean; // Use Web Speech API (true) or always use Whisper (false)
}

export interface UseVoiceInputReturn {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  duration: number;
  volume: number;
  isSupported: boolean;
  method: 'web-speech' | 'whisper' | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
}

export function useVoiceInput(
  options: UseVoiceInputOptions = {}
): UseVoiceInputReturn {
  const {
    onTranscript,
    onError,
    autoStop = true,
    maxDuration = 60000, // 1 minute default
    useWebSpeech = true,
  } = options;
  
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const [method, setMethod] = useState<'web-speech' | 'whisper' | null>(null);
  
  // Check browser compatibility
  const [compatibility] = useState(() => checkBrowserCompatibility());
  const isSupported = compatibility.isSupported || compatibility.needsFallback;
  
  // Refs
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const silenceDetectorRef = useRef<SilenceDetector | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  // Haptic feedback
  const { triggerHaptic } = useHapticFeedback();
  
  // Web Speech API hook (only used if enabled and supported)
  const speechRecognition = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        setTranscript(prev => {
          const newTranscript = prev + text + ' ';
          onTranscript?.(newTranscript.trim());
          return newTranscript;
        });
      } else {
        setInterimTranscript(text);
      }
    },
    onError: (err) => {
      console.error('Speech recognition error:', err);
      // Don't show error immediately, might be recoverable
    },
    onEnd: () => {
      // Recognition ended, might need to restart or switch to Whisper
      if (isRecording) {
        console.log('Speech recognition ended while still recording, checking if we should switch to Whisper');
      }
    },
  });
  
  // Start recording
  const startRecording = useCallback(async () => {
    if (isRecording) {
      console.warn('Already recording');
      return;
    }
    
    if (!isSupported) {
      const errorMsg = 'Voice input not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }
    
    // Haptic feedback
    triggerHaptic('light');
    
    // Reset state
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setDuration(0);
    setVolume(0);
    setIsRecording(true);
    startTimeRef.current = Date.now();
    recordedChunksRef.current = [];
    
    try {
      // Request microphone access
      const stream = await requestMicrophoneAccess();
      if (!stream) {
        throw new Error('Failed to access microphone');
      }
      
      streamRef.current = stream;
      
      // Decide which method to use
      const shouldUseWebSpeech = useWebSpeech && speechRecognition.isSupported;
      
      if (shouldUseWebSpeech) {
        // Use Web Speech API (primary method)
        console.log('Starting recording with Web Speech API');
        setMethod('web-speech');
        
        // Start speech recognition
        await speechRecognition.startListening();
        
      } else {
        // Use Whisper API (fallback method)
        console.log('Starting recording with Whisper API fallback');
        setMethod('whisper');
        
        // Create audio recorder
        const recorder = await createAudioRecorder(stream, {
          onDataAvailable: (blob) => {
            recordedChunksRef.current.push(blob);
          },
        });
        
        recorderRef.current = recorder;
        recorder.start(100); // Collect data every 100ms
      }
      
      // Start duration tracking
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(Math.floor(elapsed / 1000));
      }, 100);
      
      // Set max duration timeout
      maxDurationTimeoutRef.current = setTimeout(() => {
        console.log('Max duration reached, stopping recording');
        stopRecording();
      }, maxDuration);
      
      // Setup silence detection (if auto-stop enabled)
      if (autoStop) {
        silenceDetectorRef.current = new SilenceDetector({
          threshold: 10,
          duration: 3000, // 3 seconds of silence
          onSilence: () => {
            console.log('Silence detected, auto-stopping');
            stopRecording();
          },
        });
        silenceDetectorRef.current.start(stream);
        
        // Update volume for visualization
        const volumeInterval = setInterval(() => {
          if (silenceDetectorRef.current) {
            const vol = silenceDetectorRef.current.getVolume();
            setVolume(vol);
          }
        }, 50);
        
        // Store interval for cleanup
        (silenceDetectorRef.current as any)._volumeInterval = volumeInterval;
      }
      
    } catch (error: any) {
      console.error('Error starting recording:', error);
      const errorMsg = error.message || 'Failed to start recording';
      setError(errorMsg);
      onError?.(errorMsg);
      setIsRecording(false);
      cleanup();
    }
  }, [
    isRecording,
    isSupported,
    useWebSpeech,
    autoStop,
    maxDuration,
    speechRecognition,
    triggerHaptic,
    onError,
  ]);
  
  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!isRecording) {
      return;
    }
    
    // Haptic feedback
    triggerHaptic('medium');
    
    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      if (method === 'web-speech') {
        // Stop Web Speech API
        speechRecognition.stopListening();
        
        // Transcript is already available from speechRecognition
        const finalTranscript = transcript + interimTranscript;
        if (finalTranscript.trim()) {
          onTranscript?.(finalTranscript.trim());
        }
        
        setIsProcessing(false);
        
      } else if (method === 'whisper') {
        // Stop audio recorder
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          recorderRef.current.stop();
          
          // Wait for final data
          await new Promise<void>((resolve) => {
            if (recorderRef.current) {
              recorderRef.current.onstop = () => resolve();
            } else {
              resolve();
            }
            setTimeout(resolve, 1000); // Timeout after 1 second
          });
        }
        
        // Create blob from chunks
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        
        // Convert to file for Whisper
        const audioFile = await convertToWhisperFormat(audioBlob);
        
        // Send to Whisper API
        const formData = new FormData();
        formData.append('audio', audioFile);
        
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Transcription failed');
        }
        
        const data = await response.json();
        
        if (data.success && data.transcript) {
          setTranscript(data.transcript);
          onTranscript?.(data.transcript);
        } else {
          throw new Error(data.error || 'Transcription failed');
        }
        
        setIsProcessing(false);
      }
      
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      const errorMsg = error.message || 'Failed to process recording';
      setError(errorMsg);
      onError?.(errorMsg);
      setIsProcessing(false);
    } finally {
      cleanup();
    }
  }, [
    isRecording,
    method,
    transcript,
    interimTranscript,
    speechRecognition,
    triggerHaptic,
    onTranscript,
    onError,
  ]);
  
  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (!isRecording) {
      return;
    }
    
    console.log('Cancelling recording');
    
    // Haptic feedback
    triggerHaptic('light');
    
    setIsRecording(false);
    setIsProcessing(false);
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    
    // Stop speech recognition
    if (method === 'web-speech') {
      speechRecognition.stopListening();
      speechRecognition.resetTranscript();
    }
    
    // Stop recorder
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    
    cleanup();
  }, [isRecording, method, speechRecognition, triggerHaptic]);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop media stream
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    
    // Stop silence detector
    if (silenceDetectorRef.current) {
      // Clear volume interval if it exists
      const volumeInterval = (silenceDetectorRef.current as any)._volumeInterval;
      if (volumeInterval) {
        clearInterval(volumeInterval);
      }
      silenceDetectorRef.current.stop();
      silenceDetectorRef.current = null;
    }
    
    // Clear intervals and timeouts
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
    
    // Reset recorder
    recorderRef.current = null;
    recordedChunksRef.current = [];
    
    // Reset volume
    setVolume(0);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);
  
  return {
    isRecording,
    isProcessing,
    transcript,
    interimTranscript,
    error,
    duration,
    volume,
    isSupported,
    method,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}