/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  
  // Older - show date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Extract text content from AI SDK v5 message parts
 */
export function extractMessageText(message: any): string {
  return message?.parts
    ?.filter((part: any) => part.type === 'text')
    .map((part: any) => part.text)
    .join('') || '';
}

/**
 * Convert database messages to UI message format
 */
export function convertToUIMessages(savedMessages: any[]) {
  return savedMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: 'text' as const, text: msg.content }],
    createdAt: new Date(msg.created_at),
  }));
}

/**
 * Dispatch custom window event
 */
export function dispatchCustomEvent(eventName: string, detail?: any) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Auto-resize textarea based on content
 */
export function autoResizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = 'auto';
  element.style.height = Math.min(element.scrollHeight, 200) + 'px';
}