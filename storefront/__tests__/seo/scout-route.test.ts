import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createRouteHandlerClient: vi.fn(),
  getSession: vi.fn(),
  maybeSingle: vi.fn(),
  insert: vi.fn(),
  order: vi.fn(),
  update: vi.fn(),
  updateEq: vi.fn(),
  runScoutEngine: vi.fn(),
  buildStrategicScoutQueries: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: mocks.createRouteHandlerClient,
}));

vi.mock('@/lib/seo/scout', () => ({
  runScoutEngine: mocks.runScoutEngine,
  buildStrategicScoutQueries: mocks.buildStrategicScoutQueries,
}));

function createSupabaseMock() {
  const scoutLogsQuery = {
    select: vi.fn(() => scoutLogsQuery),
    eq: vi.fn(() => scoutLogsQuery),
    order: mocks.order,
    limit: vi.fn(() => scoutLogsQuery),
    maybeSingle: mocks.maybeSingle,
    insert: mocks.insert,
    update: mocks.update,
  };

  mocks.order.mockImplementation(() => scoutLogsQuery);
  mocks.update.mockReturnValue({ eq: mocks.updateEq });

  return {
    auth: {
      getSession: mocks.getSession,
    },
    from: vi.fn(() => scoutLogsQuery),
  };
}

describe('/api/seo/scout route authorization', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mocks.createRouteHandlerClient.mockReturnValue(createSupabaseMock());
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.insert.mockResolvedValue({ data: [{}], error: null });
    mocks.updateEq.mockResolvedValue({ data: [{}], error: null });
    mocks.runScoutEngine.mockResolvedValue({ insertedCount: 3, blockedCount: 1 });
    mocks.buildStrategicScoutQueries.mockReturnValue([
      'iphone 15 pro max green screen after drop',
      'soft oled vs hard oled iphone 15 pro',
    ]);
  });

  it('allows Supabase users whose custom SUPER ADMIN role lives in app_metadata', async () => {
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user_123',
            role: 'authenticated',
            app_metadata: { role: 'SUPER ADMIN' },
            user_metadata: {},
          },
        },
      },
      error: null,
    });

    const { POST } = await import('@/app/api/seo/scout/route');
    const response = await POST(
      new Request('http://localhost:3000/api/seo/scout', {
        method: 'POST',
        body: JSON.stringify({ forceRun: true }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe('SUCCESS');
    expect(mocks.runScoutEngine).toHaveBeenCalledOnce();
  });

  it('allows local development scout runs when auth metadata is still being triaged', async () => {
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'local_user',
            role: 'authenticated',
            app_metadata: { provider: 'email' },
            user_metadata: {},
          },
        },
      },
      error: null,
    });

    const { POST } = await import('@/app/api/seo/scout/route');
    const response = await POST(
      new Request('http://localhost:3000/api/seo/scout', {
        method: 'POST',
        body: JSON.stringify({ forceRun: true }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe('SUCCESS');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '🚨 [Scout Auth Triaged Failed] Current Session User Data:',
      {
        id: 'local_user',
        role: 'authenticated',
        app_metadata: { provider: 'email' },
        user_metadata: {},
      }
    );
  });

  it('keeps non-local unauthorized requests blocked and logs session details', async () => {
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'staff_user',
            role: 'authenticated',
            app_metadata: { provider: 'email' },
            user_metadata: {},
          },
        },
      },
      error: null,
    });

    const { POST } = await import('@/app/api/seo/scout/route');
    const response = await POST(
      new Request('https://ali-mobile-repair-storefront.vercel.app/api/seo/scout', {
        method: 'POST',
        body: JSON.stringify({ forceRun: true }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe('Unauthorized: Super Admin clearance required.');
    expect(mocks.runScoutEngine).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '🚨 [Scout Auth Triaged Failed] Current Session User Data:',
      {
        id: 'staff_user',
        role: 'authenticated',
        app_metadata: { provider: 'email' },
        user_metadata: {},
      }
    );
  });

  it('fetches real keywords ordered by search weight for local development', async () => {
    const keywords = [
      { id: 'kw_1', keyword: 'iphone repair', search_weight: 8, status: 'pending' },
    ];
    mocks.order.mockResolvedValueOnce({ data: keywords, error: null });

    const { GET } = await import('@/app/api/seo/scout/route');
    const response = await GET(new Request('http://localhost:3000/api/seo/scout'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ status: 'SUCCESS', data: keywords });
    expect(mocks.order).toHaveBeenCalledWith('search_weight', { ascending: false });
  });

  it('updates keyword triage status through PUT for local development', async () => {
    const { PUT } = await import('@/app/api/seo/scout/route');
    const response = await PUT(
      new Request('http://localhost:3000/api/seo/scout', {
        method: 'PUT',
        body: JSON.stringify({ id: 'kw_1', status: 'approved' }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe('SUCCESS');
    expect(mocks.update).toHaveBeenCalledWith({
      status: 'approved',
      updated_at: expect.any(String),
    });
    expect(mocks.updateEq).toHaveBeenCalledWith('id', 'kw_1');
  });
});
