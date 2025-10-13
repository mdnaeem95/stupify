'use client';

import { useCallback } from 'react';
import { useMobileDetection } from './useMobileDetection';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHapticFeedback() {
  const { isMobile, isIOS } = useMobileDetection();

  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Only trigger on mobile devices
    if (!isMobile) return;

    try {
      // iOS Haptic Feedback (Safari)
      if (isIOS && 'vibrate' in navigator) {
        const patterns: Record<HapticType, number | number[]> = {
          light: 10,
          medium: 20,
          heavy: 30,
          success: [10, 50, 10],
          warning: [20, 100, 20],
          error: [30, 100, 30, 100, 30],
        };
        
        navigator.vibrate(patterns[type]);
        return;
      }

      // Android/Other browsers - standard vibration API
      if ('vibrate' in navigator) {
        const patterns: Record<HapticType, number | number[]> = {
          light: 10,
          medium: 25,
          heavy: 40,
          success: [10, 50, 10],
          warning: [25, 100, 25],
          error: [40, 100, 40, 100, 40],
        };
        
        navigator.vibrate(patterns[type]);
      }
    } catch (error) {
      // Haptic feedback failed, silently ignore
      console.debug('Haptic feedback not supported', error);
    }
  }, [isMobile, isIOS]);

  return { triggerHaptic };
}

/**
 * Convenience hooks for common haptic patterns
 */
export function useHapticButton() {
  const { triggerHaptic } = useHapticFeedback();
  
  const onPress = useCallback(() => {
    triggerHaptic('light');
  }, [triggerHaptic]);

  return { onPress };
}

export function useHapticSuccess() {
  const { triggerHaptic } = useHapticFeedback();
  
  const onSuccess = useCallback(() => {
    triggerHaptic('success');
  }, [triggerHaptic]);

  return { onSuccess };
}

export function useHapticError() {
  const { triggerHaptic } = useHapticFeedback();
  
  const onError = useCallback(() => {
    triggerHaptic('error');
  }, [triggerHaptic]);

  return { onError };
}