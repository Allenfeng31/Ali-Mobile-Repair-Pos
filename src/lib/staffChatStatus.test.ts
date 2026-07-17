import { describe, expect, it } from 'vitest';
import { getStaffChatStatus, getStaffChatStatusMessage } from './staffChatStatus';

describe('staff chat status mapping', () => {
  it('reserves the session-expired message for confirmed 401 responses', () => {
    expect(getStaffChatStatus(401)).toBe('expired');
    expect(getStaffChatStatusMessage(getStaffChatStatus(401))).toContain('sign out');
  });

  it('keeps permission, rate-limit, upstream, and internal failures distinct', () => {
    expect(getStaffChatStatus(403)).toBe('forbidden');
    expect(getStaffChatStatus(429)).toBe('busy');
    expect(getStaffChatStatus(503)).toBe('unavailable');
    expect(getStaffChatStatus(500)).toBe('service');
    expect(getStaffChatStatusMessage('busy')).toContain('temporarily busy');
    expect(getStaffChatStatusMessage('unavailable')).toContain('temporarily unavailable');
  });
});
