import { describe, expect, it } from 'vitest';
import { getValidatedGoogleAnalyticsId } from './googleAnalytics';

describe('getValidatedGoogleAnalyticsId', () => {
  it('returns the measurement ID for Vercel production with a valid G- prefix', () => {
    expect(getValidatedGoogleAnalyticsId('production', 'G-0NZN1D3MMX')).toBe('G-0NZN1D3MMX');
  });

  it('returns null if the VERCEL_ENV is preview', () => {
    expect(getValidatedGoogleAnalyticsId('preview', 'G-0NZN1D3MMX')).toBeNull();
  });

  it('returns null if the VERCEL_ENV is development or undefined', () => {
    expect(getValidatedGoogleAnalyticsId('development', 'G-0NZN1D3MMX')).toBeNull();
    expect(getValidatedGoogleAnalyticsId(undefined, 'G-0NZN1D3MMX')).toBeNull();
    expect(getValidatedGoogleAnalyticsId('', 'G-0NZN1D3MMX')).toBeNull();
  });

  it('returns null if the measurement ID is missing or invalid in production', () => {
    expect(getValidatedGoogleAnalyticsId('production', undefined)).toBeNull();
    expect(getValidatedGoogleAnalyticsId('production', '')).toBeNull();
  });

  it('returns null for malformed measurement IDs even in production', () => {
    // lowercase
    expect(getValidatedGoogleAnalyticsId('production', 'g-0nzn1d3mmx')).toBeNull();
    // extra characters/spaces
    expect(getValidatedGoogleAnalyticsId('production', 'G-0NZN1D3MMX ')).toBeNull();
    expect(getValidatedGoogleAnalyticsId('production', ' G-0NZN1D3MMX')).toBeNull();
    // missing G-
    expect(getValidatedGoogleAnalyticsId('production', '0NZN1D3MMX')).toBeNull();
    expect(getValidatedGoogleAnalyticsId('production', 'UA-12345678-1')).toBeNull();
    // non-alphanumeric after G-
    expect(getValidatedGoogleAnalyticsId('production', 'G-0NZN-1D3MMX')).toBeNull();
  });

  it('is a deterministic pure function that does not modify inputs', () => {
    const env = 'production';
    const id = 'G-0NZN1D3MMX';
    const first = getValidatedGoogleAnalyticsId(env, id);
    const second = getValidatedGoogleAnalyticsId(env, id);
    expect(first).toBe('G-0NZN1D3MMX');
    expect(first).toStrictEqual(second);
  });
});
