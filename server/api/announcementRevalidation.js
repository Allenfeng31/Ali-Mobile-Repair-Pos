const ANNOUNCEMENT_REVALIDATION_TIMEOUT_MS = 3_000;
const ANNOUNCEMENT_REVALIDATION_ATTEMPTS = 2;

async function notifyStorefrontAnnouncementChange({
  fetchImpl = fetch,
  url = process.env.STOREFRONT_ANNOUNCEMENT_REVALIDATION_URL,
  secret = process.env.ANNOUNCEMENT_REVALIDATION_SECRET,
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
} = {}) {
  if (!url || !secret) {
    console.warn('[Announcements] Storefront cache refresh is not configured.');
    return false;
  }

  for (let attempt = 0; attempt < ANNOUNCEMENT_REVALIDATION_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeoutImpl(() => controller.abort(), ANNOUNCEMENT_REVALIDATION_TIMEOUT_MS);

    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: { 'x-announcement-revalidation-secret': secret },
        signal: controller.signal,
      });
      if (response.ok) return true;
    } catch {
      // The announcement mutation has already succeeded; retry once only.
    } finally {
      clearTimeoutImpl(timeout);
    }
  }

  console.warn('[Announcements] Storefront cache refresh failed after bounded retries.');
  return false;
}

module.exports = {
  ANNOUNCEMENT_REVALIDATION_ATTEMPTS,
  ANNOUNCEMENT_REVALIDATION_TIMEOUT_MS,
  notifyStorefrontAnnouncementChange,
};
