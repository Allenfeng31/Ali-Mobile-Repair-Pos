import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const adminNumber = process.env.ADMIN_PHONE_NUMBER || '+61481058514';

export async function POST(request: Request) {
  try {
    const { name, phone, deviceModel, repairType } = await request.json();

    if (!name || !phone || !deviceModel || !repairType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio not configured');
      return NextResponse.json({ success: true, message: 'Lead captured (SMS disabled)' });
    }

    try {
      const client = twilio(accountSid, authToken);
      
      await client.messages.create({
        body: `Quote: ${name}, ${deviceModel} ${repairType}. Ph: ${phone}`,
        from: fromNumber,
        to: adminNumber,
      });

      return NextResponse.json({ success: true });
    } catch (smsError: any) {
      console.error('Twilio SMS Send Failure:', {
        message: smsError.message,
        code: smsError.code,
        moreInfo: smsError.moreInfo
      });
      return NextResponse.json({ 
        error: 'Failed to send SMS alert', 
        details: smsError.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Critical Error in Quote Request API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
