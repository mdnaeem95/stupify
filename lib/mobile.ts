/* eslint-disable  @typescript-eslint/no-explicit-any */
/**
 * Mobile utility functions for Stupify
 * Handles mobile-specific behaviors and optimizations
 */

/**
 * Prevent iOS zoom on input focus
 * Sets font size to minimum 16px to prevent auto-zoom
 */
export function preventIOSZoom(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);
  
  if (fontSize < 16) {
    element.style.fontSize = '16px';
  }
}

/**
 * Detect if device is iOS
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
}

/**
 * Detect if device is Android
 */
export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /android/.test(navigator.userAgent.toLowerCase());
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get safe area insets for iOS devices
 * Returns padding values for notch/home indicator
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
  };
}

/**
 * Disable body scroll (useful for modals on mobile)
 */
export function disableBodyScroll() {
  if (typeof document === 'undefined') return;
  
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
}

/**
 * Enable body scroll (restore after modal closes)
 */
export function enableBodyScroll() {
  if (typeof document === 'undefined') return;
  
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(element: HTMLElement, offset: number = 0) {
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  
  window.scrollTo({
    top,
    behavior: 'smooth',
  });
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Format text for mobile display (break long words)
 */
export function formatForMobile(text: string, maxLength: number = 30): string {
  const words = text.split(' ');
  return words.map(word => {
    if (word.length > maxLength) {
      return word.match(new RegExp(`.{1,${maxLength}}`, 'g'))?.join('\u200B') || word;
    }
    return word;
  }).join(' ');
}

/**
 * Debounce function for touch events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get optimal touch target size (minimum 44x44px per Apple HIG)
 */
export function getMinTouchTarget() {
  return {
    minWidth: '44px',
    minHeight: '44px',
  };
}