import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMessage = vi.fn();
const twilioClient = vi.fn(() => ({ messages: { create: createMessage } }));

vi.mock('twilio', () => ({ default: twilioClient }));

const request = (body: unknown) => new Request('http://localhost/api/quote-request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

describe('POST /api/quote-request', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM_NUMBER;
  });

  it('does not report success when no durable notification path is configured', async () => {
    const { POST } = await import('./route');

    const response = await POST(request({
      name: 'Test Customer',
      phone: '0400000000',
      deviceModel: 'iPhone 15',
      repairType: 'Screen Replacement',
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ success: false });
    expect(createMessage).not.toHaveBeenCalled();
  });

  it('returns notification success only after Twilio accepts the SMS request', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'AC_test';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    process.env.TWILIO_FROM_NUMBER = '+61000000000';
    createMessage.mockResolvedValue({ sid: 'SM_test' });
    const { POST } = await import('./route');

    const response = await POST(request({
      name: 'Test Customer',
      phone: '0400000000',
      deviceModel: 'iPhone 15',
      repairType: 'Screen Replacement',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, delivery: 'sms' });
    expect(createMessage).toHaveBeenCalledOnce();
  });

  it('returns a failure when the SMS provider rejects the request', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'AC_test';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    process.env.TWILIO_FROM_NUMBER = '+61000000000';
    createMessage.mockRejectedValue(new Error('provider unavailable'));
    const { POST } = await import('./route');

    const response = await POST(request({
      name: 'Test Customer',
      phone: '0400000000',
      deviceModel: 'iPhone 15',
      repairType: 'Screen Replacement',
    }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({ success: false });
  });

  it('rejects incomplete requests before attempting notification', async () => {
    const { POST } = await import('./route');

    const response = await POST(request({ name: 'Test Customer' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ success: false, error: 'Missing required fields' });
  });

  it('does not report success for malformed request JSON', async () => {
    const { POST } = await import('./route');
    const response = await POST(new Request('http://localhost/api/quote-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ success: false });
  });
});
