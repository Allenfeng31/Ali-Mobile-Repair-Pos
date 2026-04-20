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
    
    // Truncate message to 50 chars as requested
    const snippet = message.length > 50 ? message.substring(0, 50) + '...' : message;
    const customerInfo = customerName ? `${customerName} (${customerPhone || 'No phone'})` : 'A customer';

    await client.messages.create({
      body: `💬 New Live Chat! ${customerInfo} says: "${snippet}". Open POS to reply now!`,
      from: fromNumber,
      to: adminNumber,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending chat alert SMS:', error);
    return NextResponse.json({ error: 'Failed to send alert' }, { status: 500 });
  }
}
