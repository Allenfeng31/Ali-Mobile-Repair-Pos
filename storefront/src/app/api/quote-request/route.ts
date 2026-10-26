import { NextResponse } from 'next/server';
import twilio from 'twilio';

const adminNumber = process.env.ADMIN_PHONE_NUMBER || '+61481058514';

export async function POST(request: Request) {
  try {
    const { name, phone, deviceModel, repairType } = await request.json();

    if (!name || !phone || !deviceModel || !repairType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio not configured for quote notifications');
      return NextResponse.json({
        success: false,
        error: 'Quote request notifications are temporarily unavailable.',
      }, { status: 503 });
    }

    try {
      const client = twilio(accountSid, authToken);

      await client.messages.create({
        body: `Quote: ${name}, ${deviceModel} ${repairType}. Ph: ${phone}`,
        from: fromNumber,
        to: adminNumber,
      });

      return NextResponse.json({ success: true, delivery: 'sms' });
    } catch (smsError: unknown) {
      const error = smsError as { message?: string; code?: string | number; moreInfo?: string };
      console.error('Twilio SMS Send Failure:', {
        message: error.message,
        code: error.code,
        moreInfo: error.moreInfo,
      });
      return NextResponse.json({
        success: false,
        error: 'Unable to notify our team of this quote request.',
      }, { status: 502 });
    }
  } catch (error: unknown) {
    console.error('Critical Error in Quote Request API:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
