import { describe, expect, it } from 'vitest';
const { secretMatches, isAuthorizedCron } = require('./internalProcessorAuth.js');

describe('internal outbox processor authentication', () => {
  it('fails closed for missing, malformed, incorrect, and different-length secrets', () => {
    expect(secretMatches(undefined, 'expected')).toBe(false);
    expect(isAuthorizedCron(undefined, 'expected')).toBe(false);
    expect(isAuthorizedCron('token expected', 'expected')).toBe(false);
    expect(isAuthorizedCron('Bearer wrong', 'expected')).toBe(false);
    expect(isAuthorizedCron('Bearer x', 'expected-secret-with-more-bytes')).toBe(false);
  });

  it('accepts only a matching Bearer secret', () => {
    expect(isAuthorizedCron('Bearer expected', 'expected')).toBe(true);
  });
});
