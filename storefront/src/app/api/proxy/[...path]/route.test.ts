import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { GET, PATCH, POST, PUT } from './route';

const environment = process.env as Record<string, string | undefined>;
const originalLocalOnly = process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY;
const originalNodeEnv = process.env.NODE_ENV;
const originalPosUrl = process.env.NEXT_PUBLIC_POS_API_URL;

function restoreEnvironment() {
  if (originalLocalOnly === undefined) delete environment.ALI_MOBILE_LOCAL_CATALOG_ONLY;
  else environment.ALI_MOBILE_LOCAL_CATALOG_ONLY = originalLocalOnly;
  if (originalPosUrl === undefined) delete environment.NEXT_PUBLIC_POS_API_URL;
  else environment.NEXT_PUBLIC_POS_API_URL = originalPosUrl;
  environment.NODE_ENV = originalNodeEnv;
}

afterEach(() => {
  restoreEnvironment();
  vi.unstubAllGlobals();
});

describe('GET /api/proxy/inventory', () => {
  it('returns deterministic local inventory without an upstream request in local-only mode', async () => {
    environment.NODE_ENV = 'development';
    environment.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
    environment.NEXT_PUBLIC_POS_API_URL = 'https://remote.example.test';
    const upstreamFetch = vi.fn();
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await GET(new NextRequest('https://local.test/api/proxy/inventory'), {
      params: Promise.resolve({ path: ['inventory'] }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.arrayContaining([
      expect.objectContaining({ model: 'P Samsung||Galaxy S21', name: 'Galaxy S21 Loudspeaker Replacement', price: 0 }),
    ]));
    expect(upstreamFetch).not.toHaveBeenCalled();
  });

  it('forwards inventory unchanged when local-only mode is disabled', async () => {
    environment.NODE_ENV = 'development';
    delete environment.ALI_MOBILE_LOCAL_CATALOG_ONLY;
    environment.NEXT_PUBLIC_POS_API_URL = 'https://pos.example.test';
    const upstreamFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: 1 }]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await GET(new NextRequest('https://local.test/api/proxy/inventory?active=true'), {
      params: Promise.resolve({ path: ['inventory'] }),
    });

    expect(upstreamFetch).toHaveBeenCalledWith('https://pos.example.test/api/inventory?active=true', expect.objectContaining({ method: 'GET' }));
    expect(await response.json()).toEqual([{ id: 1 }]);
  });

  it('retains the production local-only guard without an upstream request', async () => {
    environment.NODE_ENV = 'production';
    environment.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
    const upstreamFetch = vi.fn();
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await GET(new NextRequest('https://local.test/api/proxy/inventory'), {
      params: Promise.resolve({ path: ['inventory'] }),
    });

    expect(response.status).toBe(500);
    expect(upstreamFetch).not.toHaveBeenCalled();
  });

  it('returns neutral Book Repair configuration without upstream calls in local-only mode', async () => {
    environment.NODE_ENV = 'development';
    environment.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
    const upstreamFetch = vi.fn();
    vi.stubGlobal('fetch', upstreamFetch);

    const [tiers, configs] = await Promise.all([
      GET(new NextRequest('https://local.test/api/proxy/quality-tiers'), { params: Promise.resolve({ path: ['quality-tiers'] }) }),
      GET(new NextRequest('https://local.test/api/proxy/store-configs'), { params: Promise.resolve({ path: ['store-configs'] }) }),
    ]);

    expect(await tiers.json()).toEqual([]);
    expect(await configs.json()).toEqual({ multi_discount_tier_2: 0.1, multi_discount_tier_3: 0.15 });
    expect(upstreamFetch).not.toHaveBeenCalled();
  });

  it.each(['chat/session', 'book-repair'])('blocks local-only %s writes without upstream calls', async (path) => {
    environment.NODE_ENV = 'development';
    environment.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
    const upstreamFetch = vi.fn();
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await POST(new NextRequest(`https://local.test/api/proxy/${path}`, {
      method: 'POST', body: JSON.stringify({ test: true }), headers: { 'content-type': 'application/json' },
    }), { params: Promise.resolve({ path: path.split('/') }) });

    expect(response.status).toBe(503);
    expect(upstreamFetch).not.toHaveBeenCalled();
  });

  it('blocks an existing chat session poll without an upstream call in local-only mode', async () => {
    environment.NODE_ENV = 'development';
    environment.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
    const upstreamFetch = vi.fn();
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await GET(new NextRequest('https://local.test/api/proxy/chat/session/saved-session/messages'), {
      params: Promise.resolve({ path: ['chat', 'session', 'saved-session', 'messages'] }),
    });

    expect(response.status).toBe(503);
    expect(upstreamFetch).not.toHaveBeenCalled();
  });

  it.each([
    ['GET', GET],
    ['POST', POST],
    ['PUT', PUT],
    ['PATCH', PATCH],
  ] as const)('blocks an unlisted %s proxy path without an upstream call in local-only mode', async (method, handler) => {
    environment.NODE_ENV = 'development';
    environment.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
    environment.NEXT_PUBLIC_POS_API_URL = 'https://remote.example.test';
    const upstreamFetch = vi.fn();
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await handler(new NextRequest('https://local.test/api/proxy/unlisted-path', {
      method,
      ...(method === 'GET' ? {} : { body: JSON.stringify({ test: true }), headers: { 'content-type': 'application/json' } }),
    }), { params: Promise.resolve({ path: ['unlisted-path'] }) });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Proxy endpoint unavailable in local-only mode.' });
    expect(upstreamFetch).not.toHaveBeenCalled();
  });
});
