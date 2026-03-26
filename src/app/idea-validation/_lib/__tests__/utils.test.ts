import { describe, it, expect } from 'vitest';
import { countWords, truncate, clamp, getContextLabel } from '../utils';

describe('countWords', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace-only string', () => {
    expect(countWords('   ')).toBe(0);
  });

  it('counts single word', () => {
    expect(countWords('hello')).toBe(1);
  });

  it('counts multiple words', () => {
    expect(countWords('hello world foo bar')).toBe(4);
  });

  it('handles extra whitespace between words', () => {
    expect(countWords('  hello   world  ')).toBe(2);
  });

  it('handles newlines and tabs', () => {
    expect(countWords('hello\nworld\tfoo')).toBe(3);
  });
});

describe('truncate', () => {
  it('returns string unchanged if under max length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('returns string unchanged if exactly at max length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and adds ellipsis if over max length', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('handles empty string', () => {
    expect(truncate('', 10)).toBe('');
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min when below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max when above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('getContextLabel', () => {
  it('returns "new idea" for new_idea', () => {
    expect(getContextLabel('new_idea')).toBe('new idea');
  });

  it('returns "existing business" for existing_business', () => {
    expect(getContextLabel('existing_business')).toBe('existing business');
  });

  it('returns "new product" for new_product', () => {
    expect(getContextLabel('new_product')).toBe('new product');
  });

  it('returns "pivot" for pivot', () => {
    expect(getContextLabel('pivot')).toBe('pivot');
  });

  it('returns "idea" for unknown value', () => {
    expect(getContextLabel('')).toBe('idea');
    expect(getContextLabel('unknown')).toBe('idea');
  });
});
