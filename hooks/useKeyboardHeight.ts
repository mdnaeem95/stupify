'use client';

import { useState, useEffect } from 'react';

interface KeyboardState {
  isVisible: boolean;
  height: number;
}

export function useKeyboardHeight(): KeyboardState {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
  });

  useEffect(() => {
    // Only run on mobile browsers
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    const initialHeight = viewport.height;

    const handleResize = () => {
      if (!viewport) return;

      const currentHeight = viewport.height;
      const heightDifference = initialHeight - currentHeight;
      
      // Keyboard is visible if viewport height decreased significantly
      const isVisible = heightDifference > 150; // At least 150px difference
      const height = isVisible ? heightDifference : 0;

      setKeyboardState({ isVisible, height });
    };

    // Listen to visual viewport resize events (works on iOS and modern Android)
    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  return keyboardState;
}

/**
 * Hook to handle keyboard-safe area padding
 * Returns the padding needed at the bottom to keep content above keyboard
 */
export function useKeyboardPadding(): number {
  const { height } = useKeyboardHeight();
  return height;
}

/**
 * Hook to adjust scroll position when keyboard appears
 */
export function useKeyboardScroll(elementRef: React.RefObject<HTMLElement>) {
  const { isVisible, height } = useKeyboardHeight();

  useEffect(() => {
    if (isVisible && elementRef.current) {
      // Scroll the focused element into view
      setTimeout(() => {
        elementRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [isVisible, height, elementRef]);
}