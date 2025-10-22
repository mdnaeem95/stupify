/**
 * useSpeechRecognition Hook
 * 
 * React hook for Web Speech API integration
 * Provides clean interface for voice recognition
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { isSpeechRecognitionSupported, createSpeechRecognition, getSpeechErrorMessage } from '@/lib/voice/speech-recognition';

export interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const [isSupported] = useState(() => isSpeechRecognitionSupported());
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }
    
    try {
      recognitionRef.current = createSpeechRecognition();
      
      if (!recognitionRef.current) {
        console.error('Failed to create speech recognition instance');
        return;
      }
      
      const recognition = recognitionRef.current;
      
      // Configure based on options
      if (options.continuous !== undefined) {
        recognition.continuous = options.continuous;
      }
      if (options.interimResults !== undefined) {
        recognition.interimResults = options.interimResults;
      }
      if (options.language) {
        recognition.lang = options.language;
      }
      
      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcriptText + ' ';
          } else {
            interimText += transcriptText;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          options.onResult?.(finalTranscript.trim(), true);
        }
        
        if (interimText) {
          setInterimTranscript(interimText);
          options.onResult?.(interimText, false);
        }
      };
      
      // Handle errors
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        const errorMessage = getSpeechErrorMessage(event.error);
        setError(errorMessage);
        options.onError?.(event.error);
        
        // Stop listening on error
        setIsListening(false);
        isListeningRef.current = false;
      };
      
      // Handle end
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        isListeningRef.current = false;
        options.onEnd?.();
      };
      
      // Handle start
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        isListeningRef.current = true;
        setError(null);
      };
      
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setError('Failed to initialize speech recognition');
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.warn('Error stopping speech recognition:', error);
        }
      }
    };
  }, [isSupported, options.continuous, options.interimResults, options.language]);
  
  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    
    if (!recognitionRef.current) {
      setError('Speech recognition not initialized');
      return;
    }
    
    if (isListeningRef.current) {
      console.warn('Speech recognition already listening');
      return;
    }
    
    try {
      // Reset state
      setError(null);
      setInterimTranscript('');
      
      // Start recognition
      recognitionRef.current.start();
      
    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      
      // Handle specific errors
      if (error.message?.includes('already started')) {
        console.warn('Speech recognition already started, stopping and restarting');
        recognitionRef.current.stop();
        
        // Retry after a short delay
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 100);
      } else {
        setError('Failed to start speech recognition');
      }
    }
  }, [isSupported]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) {
      return;
    }
    
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.warn('Error stopping speech recognition:', error);
    }
  }, []);
  
  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);
  
  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}