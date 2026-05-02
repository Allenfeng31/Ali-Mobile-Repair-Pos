import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;
const adminNumber = process.env.ADMIN_PHONE_NUMBER || '+61481058514';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

    // ── SMS Gate: check DB setting BEFORE touching Twilio ──────────────
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'sms_alerts_enabled')
          .maybeSingle();

        if (data?.value === 'false') {
          console.log('SMS alerts disabled by admin. Skipping Twilio.');
          return NextResponse.json({ success: true, message: 'SMS disabled by admin' });
        }
      } catch (err) {
        // Fail-open: if we can't check, proceed with SMS (backwards compatible)
        console.warn('Failed to check SMS gate setting:', err);
      }
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

