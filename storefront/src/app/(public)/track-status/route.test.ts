import { describe, expect, it } from 'vitest';
import { GET, HEAD } from './route';

describe('/track-status route handler', () => {
  it('GET returns a 404 text response with proper headers', async () => {
    const response = await GET();

    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    expect(response.headers.get('Cache-Control')).toBe('no-store');

    const text = await response.text();
    expect(text).toBe('Repair status tracking is temporarily unavailable. We will contact you by SMS when your repair is ready.');

    // Ensure no HTML, scripts, or GA tags are present
    expect(text).not.toContain('<script');
    expect(text).not.toContain('<html');
    expect(text).not.toContain('GoogleAnalytics');
  });

  it('HEAD returns a 404 empty response with proper headers', async () => {
    const response = await HEAD();

    expect(response.status).toBe(404);
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    expect(response.headers.get('Cache-Control')).toBe('no-store');

    const text = await response.text();
    expect(text).toBe('');
  });

  it('GET does not read or reflect query parameters in its response', async () => {
    // The handler does not take a Request object, proving it does not read the URL
    const response = await GET();
    const text = await response.text();

    expect(text).not.toContain('0412345678');
    expect(response.headers.has('0412345678')).toBe(false);
  });
});
