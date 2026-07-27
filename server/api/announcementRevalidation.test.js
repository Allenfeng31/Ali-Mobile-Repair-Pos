/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import announcementRevalidation from './announcementRevalidation.js';

const {
  ANNOUNCEMENT_REVALIDATION_ATTEMPTS,
  ANNOUNCEMENT_REVALIDATION_TIMEOUT_MS,
  notifyStorefrontAnnouncementChange,
} = announcementRevalidation;

describe('Storefront announcement cache notification', () => {
  it('uses a timeout and at most two server-to-server notification attempts', async () => {
    const fetchImpl = vi.fn()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce({ ok: true });
    const setTimeoutImpl = vi.fn(() => 1);
    const clearTimeoutImpl = vi.fn();

    await expect(notifyStorefrontAnnouncementChange({
      fetchImpl,
      url: 'https://storefront.example/api/internal/revalidate-announcement',
      secret: 'test-secret',
      setTimeoutImpl,
      clearTimeoutImpl,
    })).resolves.toBe(true);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl).toHaveBeenLastCalledWith(
      'https://storefront.example/api/internal/revalidate-announcement',
      expect.objectContaining({ method: 'POST', headers: { 'x-announcement-revalidation-secret': 'test-secret' } })
    );
    expect(setTimeoutImpl).toHaveBeenCalledWith(expect.any(Function), ANNOUNCEMENT_REVALIDATION_TIMEOUT_MS);
    expect(clearTimeoutImpl).toHaveBeenCalledTimes(2);
    expect(ANNOUNCEMENT_REVALIDATION_ATTEMPTS).toBe(2);
  });

  it('does not call the network when the server-only notification configuration is absent', async () => {
    const fetchImpl = vi.fn();
    await expect(notifyStorefrontAnnouncementChange({ fetchImpl, url: undefined, secret: undefined })).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
