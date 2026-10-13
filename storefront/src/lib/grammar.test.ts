import { describe, expect, it } from 'vitest';
import { getIndefiniteArticle } from './grammar';

describe('getIndefiniteArticle', () => {
  it('returns "an" for vowel-starting device models', () => {
    expect(getIndefiniteArticle('iPhone 16 Plus')).toBe('an');
    expect(getIndefiniteArticle('iPhone 13')).toBe('an');
    expect(getIndefiniteArticle('iPad 10th Gen')).toBe('an');
    expect(getIndefiniteArticle('Apple Watch Series 9')).toBe('an');
    expect(getIndefiniteArticle('Asus ROG Phone 8')).toBe('an');
    expect(getIndefiniteArticle('A77')).toBe('an');
  });

  it('returns "a" for consonant-starting device models', () => {
    expect(getIndefiniteArticle('Find X3 Pro')).toBe('a');
    expect(getIndefiniteArticle('Find X5 Pro')).toBe('a');
    expect(getIndefiniteArticle('Reno 10')).toBe('a');
    expect(getIndefiniteArticle('Galaxy S24 Ultra')).toBe('a');
    expect(getIndefiniteArticle('Pixel 8 Pro')).toBe('a');
    expect(getIndefiniteArticle('Motorola Edge 50')).toBe('a');
    expect(getIndefiniteArticle('OnePlus 12')).toBe('a');
  });

  it('handles empty strings safely', () => {
    expect(getIndefiniteArticle('')).toBe('a');
    expect(getIndefiniteArticle('   ')).toBe('a');
  });
});
