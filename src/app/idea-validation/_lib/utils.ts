/**
 * Shared utility functions for the Idea Validation module.
 */

/** Count the number of words in a string. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Truncate a string to a maximum length, appending "..." if truncated. */
export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '...';
}

/** Clamp a number between min and max. */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/** Map context_type to a human-readable label. */
export function getContextLabel(contextType: string): string {
  switch (contextType) {
    case 'new_idea':
      return 'new idea';
    case 'existing_business':
      return 'existing business';
    case 'new_product':
      return 'new product';
    case 'pivot':
      return 'pivot';
    default:
      return 'idea';
  }
}
