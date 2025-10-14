/* eslint-disable  @typescript-eslint/no-explicit-any */
/**
 * Speech Recognition Utilities
 * 
 * Provides utilities for Web Speech API integration including:
 * - Browser support detection
 * - Language detection
 * - Configuration constants
 */

// Check if Web Speech API is supported
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window
  );
}

// Get the SpeechRecognition constructor (with webkit prefix support)
export function getSpeechRecognitionConstructor(): typeof SpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

// Create a configured SpeechRecognition instance
export function createSpeechRecognition(): SpeechRecognition | null {
  const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();
  
  if (!SpeechRecognitionConstructor) {
    return null;
  }
  
  const recognition = new SpeechRecognitionConstructor();
  
  // Configure recognition settings
  recognition.continuous = SPEECH_CONFIG.continuous;
  recognition.interimResults = SPEECH_CONFIG.interimResults;
  recognition.maxAlternatives = SPEECH_CONFIG.maxAlternatives;
  
  // Set language (auto-detect from browser)
  const userLang = detectUserLanguage();
  recognition.lang = userLang;
  
  return recognition;
}

// Detect user's preferred language from browser
export function detectUserLanguage(): string {
  if (typeof window === 'undefined') return 'en-US';
  
  // Get browser language
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en-US';
  
  // Map to supported language code
  return mapLanguageCode(browserLang);
}

// Map browser language codes to standard language codes
export function mapLanguageCode(browserLang: string): string {
  // Common language mappings
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'en-GB': 'en-GB',
    'en-AU': 'en-AU',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-BR',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'ru': 'ru-RU',
    'ar': 'ar-SA',
    'hi': 'hi-IN',
  };
  
  // Try exact match first
  if (browserLang in languageMap) {
    return languageMap[browserLang];
  }
  
  // Try base language code (e.g., 'en-US' → 'en')
  const baseCode = browserLang.split('-')[0];
  if (baseCode in languageMap) {
    return languageMap[baseCode];
  }
  
  // Default to US English
  return 'en-US';
}

// Get language name for display
export function getLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'en-AU': 'English (Australia)',
    'es-ES': 'Spanish',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'pt-BR': 'Portuguese',
    'zh-CN': 'Chinese',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'ru-RU': 'Russian',
    'ar-SA': 'Arabic',
    'hi-IN': 'Hindi',
  };
  
  return languageNames[code] || code;
}

// Speech recognition configuration
export const SPEECH_CONFIG = {
  // Enable continuous recognition (don't stop after first result)
  continuous: true,
  
  // Get interim results (partial transcriptions)
  interimResults: true,
  
  // Number of alternative transcriptions to return
  maxAlternatives: 1,
  
  // Auto-stop after this many milliseconds of silence
  autoStopAfterSilence: 3000, // 3 seconds
  
  // Maximum recording duration (safety limit)
  maxRecordingDuration: 60000, // 1 minute
  
  // Minimum confidence threshold (0-1)
  minConfidence: 0.5,
};

// Speech recognition error types
export enum SpeechErrorType {
  NO_SPEECH = 'no-speech',
  ABORTED = 'aborted',
  AUDIO_CAPTURE = 'audio-capture',
  NETWORK = 'network',
  NOT_ALLOWED = 'not-allowed',
  SERVICE_NOT_ALLOWED = 'service-not-allowed',
  BAD_GRAMMAR = 'bad-grammar',
  LANGUAGE_NOT_SUPPORTED = 'language-not-supported',
  UNKNOWN = 'unknown',
}

// Get user-friendly error message
export function getSpeechErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    [SpeechErrorType.NO_SPEECH]: "No speech detected. Please try again.",
    [SpeechErrorType.ABORTED]: "Recording was cancelled.",
    [SpeechErrorType.AUDIO_CAPTURE]: "Microphone not available. Please check your settings.",
    [SpeechErrorType.NETWORK]: "Network error. Please check your connection.",
    [SpeechErrorType.NOT_ALLOWED]: "Microphone access denied. Please enable it in your browser settings.",
    [SpeechErrorType.SERVICE_NOT_ALLOWED]: "Speech recognition service unavailable.",
    [SpeechErrorType.BAD_GRAMMAR]: "Speech recognition error. Please try again.",
    [SpeechErrorType.LANGUAGE_NOT_SUPPORTED]: "Language not supported. Please use English.",
    [SpeechErrorType.UNKNOWN]: "An error occurred. Please try again.",
  };
  
  return errorMessages[error] || errorMessages[SpeechErrorType.UNKNOWN];
}

// Browser compatibility info
export interface BrowserCompatibility {
  isSupported: boolean;
  browser: string;
  version: string;
  needsFallback: boolean;
  message: string;
}

// Check browser compatibility and provide detailed info
export function checkBrowserCompatibility(): BrowserCompatibility {
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      browser: 'Server',
      version: 'N/A',
      needsFallback: true,
      message: 'Running on server',
    };
  }
  
  const isSupported = isSpeechRecognitionSupported();
  const userAgent = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown';
  let version = 'Unknown';
  
  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
    version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  }
  
  // Determine if fallback is needed
  const needsFallback = !isSupported || browser === 'Firefox';
  
  // Generate message
  let message = '';
  if (isSupported) {
    message = `${browser} supports voice input natively.`;
  } else {
    message = `${browser} doesn't support native voice input. Using fallback method.`;
  }
  
  return {
    isSupported,
    browser,
    version,
    needsFallback,
    message,
  };
}