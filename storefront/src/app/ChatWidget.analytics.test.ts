import { describe, expect, it, vi } from 'vitest';

const { trackContactSubmitSuccess } = vi.hoisted(() => ({
  trackContactSubmitSuccess: vi.fn(),
}));

vi.mock('@/lib/ga4RepairEvents', () => ({
  getRepairPageContext: (pathname: string) => pathname.includes('/repairs/phone/iphone')
    ? { pageType: 'brand_hub', repairBrand: 'iphone' }
    : { pageType: 'other' },
  trackContactSubmitSuccess,
}));

import { hasPersistedChatMessage, trackPersistedCustomerMessage } from './ChatWidget';

describe('ChatWidget persisted-message contract', () => {
  it('only accepts a server response containing a persisted message identifier', () => {
    expect(hasPersistedChatMessage({ id: 'message-1' })).toBe(true);
    expect(hasPersistedChatMessage({ id: 42 })).toBe(true);
    expect(hasPersistedChatMessage({ id: '' })).toBe(false);
    expect(hasPersistedChatMessage({ success: true })).toBe(false);
    expect(hasPersistedChatMessage(null)).toBe(false);
  });

  it('records contact success only after persistence and sends no message or identifier', () => {
    expect(trackPersistedCustomerMessage({ id: 'message-1' }, '/repairs/phone/iphone')).toBe(true);
    expect(trackContactSubmitSuccess).toHaveBeenCalledWith({
      pageType: 'brand_hub',
      repairBrand: 'iphone',
      placement: 'chat',
    });

    trackContactSubmitSuccess.mockClear();
    expect(trackPersistedCustomerMessage({ success: true }, '/repairs/phone/iphone')).toBe(false);
    expect(trackContactSubmitSuccess).not.toHaveBeenCalled();
  });
});
