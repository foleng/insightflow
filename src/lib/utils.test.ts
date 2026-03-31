import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge multiple class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional class names', () => {
    const result = cn('text-red-500', true && 'bg-blue-500', false && 'hidden');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle empty class names', () => {
    const result = cn('', 'text-red-500', '');
    expect(result).toBe('text-red-500');
  });

  it('should merge conflicting class names correctly', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });
});
