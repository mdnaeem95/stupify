/* eslint-disable  @typescript-eslint/no-explicit-any */
/**
 * Audio Utilities
 * 
 * Provides utilities for audio recording and processing including:
 * - Microphone permission handling
 * - Audio recording
 * - Format conversion for Whisper API
 * - Silence detection
 * - Audio duration calculation
 */

// Check if microphone permission is granted
export async function checkMicrophonePermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.permissions) {
    return false;
  }
  
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state === 'granted';
  } catch (error) {
    console.warn('Permission API not supported, will request on first use', error);
    return false;
  }
}

// Request microphone access
export async function requestMicrophoneAccess(): Promise<MediaStream | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    throw new Error('MediaDevices API not supported');
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });
    
    return stream;
  } catch (error: any) {
    console.error('Microphone access denied:', error);
    
    if (error.name === 'NotAllowedError') {
      throw new Error('Microphone access denied. Please enable it in your browser settings.');
    } else if (error.name === 'NotFoundError') {
      throw new Error('No microphone found. Please connect a microphone.');
    } else if (error.name === 'NotReadableError') {
      throw new Error('Microphone is already in use by another application.');
    }
    
    throw new Error('Failed to access microphone. Please check your settings.');
  }
}

// Stop all tracks in a media stream
export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

// Audio recording options
export interface AudioRecordingOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  onDataAvailable?: (blob: Blob) => void;
  onStop?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

// Create a MediaRecorder for audio recording
export async function createAudioRecorder(
  stream: MediaStream,
  options: AudioRecordingOptions = {}
): Promise<MediaRecorder> {
  // Determine best supported MIME type
  const mimeType = options.mimeType || getBestMimeType();
  
  const recorder = new MediaRecorder(stream, {
    mimeType,
    audioBitsPerSecond: options.audioBitsPerSecond || 128000,
  });
  
  const chunks: Blob[] = [];
  
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
      options.onDataAvailable?.(event.data);
    }
  };
  
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    options.onStop?.(blob);
  };
  
  recorder.onerror = (event: any) => {
    const error = new Error(`Recording error: ${event.error}`);
    options.onError?.(error);
  };
  
  return recorder;
}

// Get the best supported MIME type for recording
export function getBestMimeType(): string {
  if (typeof MediaRecorder === 'undefined') {
    return 'audio/webm';
  }
  
  // Priority order of MIME types (best quality to most compatible)
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    'audio/wav',
  ];
  
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  
  // Fallback
  return 'audio/webm';
}

// Convert audio blob to a format suitable for Whisper API
export async function convertToWhisperFormat(blob: Blob): Promise<File> {
  // Whisper API accepts: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
  // Our recordings are already in webm/ogg format which Whisper accepts
  
  // Create a File object (required for API upload)
  const file = new File([blob], `recording-${Date.now()}.webm`, {
    type: blob.type || 'audio/webm',
  });
  
  return file;
}

// Get audio duration from blob
export async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });
    
    audio.addEventListener('error', () => {
      reject(new Error('Failed to load audio metadata'));
    });
    
    audio.src = URL.createObjectURL(blob);
  });
}

// Silence detection configuration
export interface SilenceDetectorOptions {
  threshold?: number; // Volume threshold (0-255)
  duration?: number; // Silence duration in ms before triggering
  onSilence?: () => void;
  onSound?: () => void;
}

// Silence detector class
export class SilenceDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null; 
  private silenceTimer: NodeJS.Timeout | null = null;
  private isDetecting = false;
  
  private threshold: number;
  private duration: number;
  private onSilence: (() => void) | undefined;
  private onSound: (() => void) | undefined;
  
  constructor(options: SilenceDetectorOptions = {}) {
    this.threshold = options.threshold ?? 10; // Very low volume
    this.duration = options.duration ?? 3000; // 3 seconds of silence
    this.onSilence = options.onSilence;
    this.onSound = options.onSound;
  }
  
  // Start detecting silence
  start(stream: MediaStream): void {
    if (this.isDetecting) {
      console.warn('Silence detector already running');
      return;
    }
    
    try {
      // Create audio context and analyser
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      
      // Connect stream to analyser
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      // Create data array for frequency data
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.isDetecting = true;
      this.detectSilence();
      
    } catch (error) {
      console.error('Failed to start silence detection:', error);
    }
  }
  
  // Stop detecting silence
  stop(): void {
    this.isDetecting = false;
    
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
  }
  
  // Internal method to detect silence
  private detectSilence(): void {
    if (!this.isDetecting || !this.analyser || !this.dataArray) {
      return;
    }
    
    // Get current volume level
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    
    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const value = Math.abs(this.dataArray[i] - 128);
      sum += value;
    }
    const average = sum / this.dataArray.length;
    
    // Check if volume is below threshold (silence)
    if (average < this.threshold) {
      // Start silence timer if not already started
      if (!this.silenceTimer) {
        this.silenceTimer = setTimeout(() => {
          this.onSilence?.();
        }, this.duration);
      }
    } else {
      // Sound detected, reset timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
        this.onSound?.();
      }
    }
    
    // Continue detecting
    requestAnimationFrame(() => this.detectSilence());
  }
  
  // Get current volume level (0-100)
  getVolume(): number {
    if (!this.analyser || !this.dataArray) {
      return 0;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const value = Math.abs(this.dataArray[i] - 128);
      sum += value;
    }
    const average = sum / this.dataArray.length;
    
    // Normalize to 0-100
    return Math.min(100, (average / 128) * 100);
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Format duration for display
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${secs}s`;
}

// Audio visualization data
export function getAudioVisualizationData(
  analyser: AnalyserNode,
  bufferLength: number = 64
): number[] {
  const dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
  analyser.getByteFrequencyData(dataArray);
  
  // Convert to normalized values (0-1)
  return Array.from(dataArray).map(value => value / 255);
}