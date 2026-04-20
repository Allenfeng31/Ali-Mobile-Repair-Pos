import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const adminNumber = process.env.ADMIN_PHONE_NUMBER || '+61481058514';

export async function POST(request: Request) {
  try {
    const { message, customerName, customerPhone } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio not configured');
      return NextResponse.json({ success: true, message: 'Alert logged (SMS disabled)' });
    }

    const client = twilio(accountSid, authToken);
    
    // Truncate snippet to 30 chars for 1-segment guarantee
    const snippet = message.length > 30 ? message.substring(0, 30) : message;

    await client.messages.create({
      body: `Chat: "${snippet}". Open POS.`,
      from: fromNumber,
      to: adminNumber,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending chat alert SMS:', error);
    return NextResponse.json({ error: 'Failed to send alert' }, { status: 500 });
  }
}
