import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and twMerge for Tailwind CSS classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
} 