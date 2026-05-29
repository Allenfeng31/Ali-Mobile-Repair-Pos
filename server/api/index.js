const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { callModelWithRetry } = require('../utils/api-utils.js');
const { isSmsAlertEnabled } = require('./sms-gate.js');
const { syncCustomerToGoogleContacts } = require('./googleContactsSync.js');
// Only load dotenv in local development (where .env file exists)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'https://pos.alimobile.com.au',
  'https://www.alimobile.com.au',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Root route to prevent "Cannot GET /" confusion
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
      <h1>Ali Mobile Repair POS API</h1>
      <p>The backend API is running correctly.</p>
      <p style="margin-top: 2rem; font-weight: bold; color: #004253;">
        Please visit the UI at: <a href="http://localhost:3002">http://localhost:3002</a>
      </p>
    </div>
  `);
});

// Initialize Supabase
// Use service_role key if available (bypasses RLS, recommended for server-side use)
// Get service_role key from: Supabase Dashboard → Settings → API → service_role (secret)
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [Supabase] Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the backend Vercel project.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ [Security] Using service_role key — database fully protected by RLS.');
} else {
  console.warn('⚠️  [Security] Using anon key — add SUPABASE_SERVICE_ROLE_KEY to server/.env for maximum security.');
}

const getLocalIp = () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// ----------------------------------------------------------------------
// SMS via Twilio
// ----------------------------------------------------------------------
let twilioClient = null;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const googleReviewLink = process.env.GOOGLE_REVIEW_LINK || 'https://g.page/r/your-review-link';
const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER || '+61481058514';

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ [SMS] Twilio client initialized — SMS notifications active.');
} else {
  console.warn('⚠️  [SMS] Twilio credentials or phone number not set — SMS notifications disabled. Add TWILIO_* to server/.env');
}

// ----------------------------------------------------------------------
// Web Push (VAPID)
// ----------------------------------------------------------------------
const webpush = require('web-push');
const VAPID_PUBLIC_KEY = "BLApuKbr8Y8olv4dOWbYlt-_y0umoi11j_HCGsk-NPU_xM5bGVk2I2_3NeZqmiif2_PWXsvdkGFMIn10oh9RoIU";

// Push subscriptions are stored in Supabase `push_subscriptions` table
// (NOT in-memory — in-memory arrays die on Vercel serverless cold starts)

if (VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@alimobile.com.au',
    VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  const privKeyPrefix = process.env.VAPID_PRIVATE_KEY.substring(0, 3);
  console.log(`✅ [Push] VAPID keys configured — Web Push active. (Private Key Prefix: ${privKeyPrefix}...)`);
} else {
  console.warn('⚠️ [Push] VAPID keys not fully set. Public:', !!VAPID_PUBLIC_KEY, 'Private:', !!process.env.VAPID_PRIVATE_KEY);
}

// SMS debounce is DB-backed via `last_sms_sent_at` on `chat_sessions`
// (NOT in-memory Map — Maps die on Vercel serverless cold starts)
const DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes

const SMS_SEGMENT_LIMIT = 160;

const normalizeSMSText = (text) => {
  return String(text || '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Remove emojis
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanSMS = (text) => {
  return normalizeSMSText(text).slice(0, SMS_SEGMENT_LIMIT); // Strict length limit
};

const trimForSMS = (value, maxLength, fallback = '') => {
  const normalized = normalizeSMSText(value || fallback);
  return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
};

const formatAustralianPhone = (phone) => {
  const formatted = String(phone || '').replace(/[^\d+]/g, '');
  if (formatted.startsWith('0')) return `+61${formatted.slice(1)}`;
  if (formatted.startsWith('61')) return `+${formatted}`;
  return formatted;
};

const formatBookingTimeForSMS = (datetime) => {
  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) return trimForSMS(datetime, 12, 'TBC');

  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replace(',', '');
};

const buildBookingConfirmationSMS = ({ customerName, deviceModel, bookingTime }) => {
  let name = trimForSMS(customerName, 16, 'there');
  let device = trimForSMS(deviceModel, 22, 'your device');
  const time = trimForSMS(bookingTime, 12, 'TBC');

  const build = () =>
    `Hi ${name}, your repair for ${device} is CONFIRMED! Time: ${time}. Loc: Kiosk C1, Ringwood Square. Any concern? Call 0485058514.`;

  let body = build();
  if (body.length > SMS_SEGMENT_LIMIT) {
    device = trimForSMS(device, Math.max(8, device.length - (body.length - SMS_SEGMENT_LIMIT)), 'device');
    body = build();
  }
  if (body.length > SMS_SEGMENT_LIMIT) {
    name = trimForSMS(name, Math.max(5, name.length - (body.length - SMS_SEGMENT_LIMIT)), 'there');
    body = build();
  }

  return cleanSMS(body);
};

const buildRepairReminderSMS = (bookingTime) => {
  const time = trimForSMS(bookingTime, 18, 'TBC');
  return cleanSMS(
    `Reminder: Your Ali Mobile repair booking is TOMORROW at ${time}! Loc: Kiosk C1, Ringwood Square Shopping Centre. Need to change? Call 0485058514.`
  );
};

const REMINDER_SENT_NOTE_REGEX = /\[REMINDER_SENT_AT:([^;\]]+)(?:;SID:[^\]]+)?\]/;

const getReminderSentAt = (appointment) => {
  if (!appointment) return null;
  if (appointment.reminder_sent_at) return appointment.reminder_sent_at;

  const match = String(appointment.notes || '').match(REMINDER_SENT_NOTE_REGEX);
  return match?.[1] || null;
};

const appendReminderSentNote = (notes, sentAt, sid) => {
  const cleanNotes = String(notes || '').replace(REMINDER_SENT_NOTE_REGEX, '').trim();
  const marker = `[REMINDER_SENT_AT:${sentAt}${sid ? `;SID:${sid}` : ''}]`;
  return cleanNotes ? `${cleanNotes} ${marker}` : marker;
};

const SMS_MESSAGES = {
  dropoff: (name) =>
    `Hi ${name}, your device is checked in at Ali Mobile Repair. We'll text you when complete. Thank you!`,

  completed: (name, device) =>
    `Hi ${name}, your ${device} repair at Ali Mobile Repair is complete. Ready for pickup!`,

  review: (name) =>
    `Hi ${name}, thanks for choosing Ali Mobile Repair! If you loved our service, a quick review helps us out a lot: https://g.page/r/CRGwjUq_bZMbEBM/review`,

  partArrived: (name, device) =>
    `Hi ${name}, parts for your ${device} have arrived at Ali Mobile Repair. Visit us soon!`,

  booking: (name, deviceModel, bookingTime) =>
    buildBookingConfirmationSMS({ customerName: name, deviceModel, bookingTime }),
};

const sendAdminPushNotification = async ({ title, body, url = '/admin/chat', unreadCount }) => {
  if (!VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('[Push] Missing VAPID keys. Skipping admin push notification.');
    return { success: 0, failed: 0, skipped: true };
  }

  try {
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return { success: 0, failed: 0, skipped: true };
    }

    let badgeCount = unreadCount;
    if (typeof badgeCount !== 'number') {
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('sender', 'customer');
      badgeCount = count || 1;
    }

    webpush.setVapidDetails(
      'mailto:admin@alimobile.com.au',
      VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({
      title,
      body,
      url,
      unreadCount: badgeCount,
    });

    const results = await Promise.allSettled(subs.map(async sub => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };

      try {
        await webpush.sendNotification(pushSub, payload);
        return { success: true };
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
        }
        throw err;
      }
    }));

    const success = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    console.log(`[Push] Admin notification batch: ${success} success, ${failed} failed.`);
    return { success, failed, skipped: false };
  } catch (err) {
    console.error('[Push] Admin notification failed:', err.message);
    return { success: 0, failed: 1, skipped: false, error: err.message };
  }
};

  // Repairs
  // Public Endpoint: Track a single repair safely without exposing other customer data
  app.get('/api/repairs/track/:id', async (req, res) => {
    try {
      const queryParam = req.params.id;
      if (!queryParam) return res.status(400).json({ error: 'Repair ID or Phone required' });

      let repairData = null;
      let customerData = null;

      // 1. Try fetching by Repair ID directly
      const { data: rData, error: rErr } = await supabase
        .from('repairs')
        .select('*')
        .eq('id', queryParam)
        .maybeSingle();

      if (rData) {
        repairData = rData;
        const { data: cData } = await supabase.from('customers').select('name').eq('id', rData.customer_id).maybeSingle();
        customerData = cData;
      } else {
        // 2. If not found, try fetching by Phone Number
        // Normalize phone number (strip spaces if needed, but the DB might have spaces)
        // We'll just do a direct match for now.
        const { data: cData, error: cErr } = await supabase
          .from('customers')
          .select('id, name')
          .eq('phone', queryParam)
          .maybeSingle();

        if (cData) {
          customerData = cData;
          // Get the most recent repair for this customer
          const { data: latestRData } = await supabase
            .from('repairs')
            .select('*')
            .eq('customer_id', cData.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .maybeSingle();
          repairData = latestRData;
        }
      }

      if (!repairData) return res.status(404).json({ error: 'Repair ticket not found. Please check your ID or Phone Number.' });

      res.json({
        repair: repairData,
        customerName: customerData ? customerData.name : 'Customer'
      });

    } catch (err) {
      console.error('❌ [Tracking] Error fetching repair:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.post('/api/sms/send', async (req, res) => {
  const { to, type, customerName = 'Valued Customer', deviceModel = 'your device', customerId } = req.body;

  if (!twilioClient) {
    console.warn('[SMS] Twilio not configured — skipping SMS to', to);
    return res.json({ ok: false, reason: 'Twilio not configured' });
  }

  if (!to || !type || !SMS_MESSAGES[type]) {
    return res.status(400).json({ error: 'Missing required fields: to, type' });
  }

  // Format AU phone numbers to E.164 if needed
  let formattedPhone = to.replace(/\s/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '+61' + formattedPhone.slice(1);
  }

  try {
    let body = type === 'dropoff'
      ? SMS_MESSAGES.dropoff(customerName)
      : type === 'completed'
        ? SMS_MESSAGES.completed(customerName, deviceModel)
        : type === 'partArrived'
          ? SMS_MESSAGES.partArrived(customerName, deviceModel)
          : SMS_MESSAGES.review(customerName);

    body = cleanSMS(body);

    const message = await twilioClient.messages.create({
      body,
      from: twilioPhone,
      to: formattedPhone,
    });

    console.log(`✅ [SMS] ${type} sent to ${formattedPhone} — SID: ${message.sid}`);

    // If it's a review request, update the customer's lastReviewSent date in the database
    if (type === 'review') {
      const timestamp = new Date().toISOString();
      const updateFilter = customerId ? { id: customerId } : { phone: to };

      const { error: updateError } = await supabase
        .from('customers')
        .update({ lastReviewSent: timestamp })
        .match(updateFilter);

      if (updateError) {
        console.error(`❌ [SMS] Failed to update lastReviewSent: ${updateError.message}`);
      }

      return res.json({ ok: true, sid: message.sid, lastReviewSent: timestamp });
    }

    res.json({ ok: true, sid: message.sid });
  } catch (err) {
    console.error('❌ [SMS] Error sending SMS:', err.message);
    if (err.code) {
      console.error(`❌ [SMS] Twilio Error Code: ${err.code} — Check https://www.twilio.com/docs/errors/${err.code}`);
    }
    res.status(500).json({ ok: false, error: err.message, code: err.code });
  }
});

// ----------------------------------------------------------------------
// SUPPLIER SYNC (Scraper Control Center)
// ----------------------------------------------------------------------
// SUPPLIER SYNC (Background Catalog Sync)
// ----------------------------------------------------------------------
app.post('/api/scraper/sync', (req, res) => {
  const rootDir = path.resolve(__dirname, '../../');
  const venvPath = path.join(rootDir, 'scraper/scraper_venv/bin/python3');
  const scraperPath = path.join(rootDir, 'scraper/main.py');

  console.log(`🚀 [Scraper] Initiating background sync...`);
  console.log(`📍 [Scraper] VENV Path: ${venvPath}`);

  const pythonCmd = fs.existsSync(venvPath) ? venvPath : 'python3';

  const scraperProcess = spawn(pythonCmd, [scraperPath], {
    cwd: rootDir,
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  scraperProcess.stderr.on('data', (data) => {
    console.error(`❌ [Scraper Startup Error]: ${data.toString()}`);
  });

  scraperProcess.on('error', (err) => {
    console.error(`❌ [Scraper Failed to Launch]:`, err);
  });

  scraperProcess.unref();

  res.status(200).json({
    ok: true,
    message: 'Background sync started. This may take 10-15 minutes.'
  });
});

// ----------------------------------------------------------------------
// SYSTEM
// ----------------------------------------------------------------------
app.get('/api/ip', (req, res) => {
  res.json({ ip: getLocalIp() });
});

// ----------------------------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Dummy Email Mapping Pattern (for legacy support)
  const mappedEmail = username.includes('@') ? username : `${username}@pos.local`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: mappedEmail,
    password
  });

  if (error) {
    console.error('Login error:', error);
    return res.status(401).json({ error: error.message || 'Access denied' });
  }

  if (!data?.user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({ success: true, user: data.user });
});


// ----------------------------------------------------------------------
// ADMIN & RBAC
// ----------------------------------------------------------------------
app.get('/api/admin/employees', async (req, res) => {
  try {
    // Note: Fetching from auth.users might be restricted depending on Supabase version/config
    // even with service_role. If this doesn't work, we'd need to use a profiles table.
    const { data: perms, error: permsError } = await supabase
      .from('employee_permissions')
      .select('*');

    if (permsError) throw permsError;

    // Get auth emails for these users
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const combined = perms.map(p => {
      const authUser = authUsers.find(u => u.id === p.user_id);
      return {
        ...p,
        email: authUser?.email || 'Unknown User'
      };
    });

    res.json(combined);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/permissions/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('employee_permissions')
      .select('*')
      .eq('user_id', req.params.userId)
      .maybeSingle();

    if (error) throw error;
    res.json(data || null);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/employees', async (req, res) => {
  const { email, password, permissions } = req.body;

  try {
    // 1. Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    // 2. Update permissions
    // The trigger on_auth_user_created should have created the row.
    // We update it with the specific permissions provided.
    const { error: permError } = await supabase
      .from('employee_permissions')
      .update(permissions)
      .eq('user_id', authUser.user.id);

    if (permError) throw permError;

    res.json({ success: true, user: authUser.user });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/employees/:userId', async (req, res) => {
  const { userId } = req.params;
  const { permissions } = req.body;

  try {
    const { data, error } = await supabase
      .from('employee_permissions')
      .update(permissions)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// INVENTORY
// ----------------------------------------------------------------------
app.get('/api/inventory', async (req, res) => {
  try {
    let allData = [];
    let from = 0;
    const step = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('id', { ascending: true })
        .range(from, from + step - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      allData = allData.concat(data);
      if (data.length < step) break;

      from += step;
    }

    res.json(allData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  const item = req.body;

  // If we have a device_model and name, try to find existing first to prevent duplicates 
  // until a DB-level unique constraint is applied.
  if (item.device_model && item.name) {
    const { data: existing } = await supabase
      .from('inventory')
      .select('id')
      .eq('device_model', item.device_model)
      .eq('name', item.name)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('inventory')
        .update(item)
        .eq('id', existing.id)
        .select();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data[0]);
    }
  }

  let { data, error } = await supabase
    .from('inventory')
    .insert([item])
    .select();

  if (error && (error.message.includes("is_pinned") || error.message.includes("pin_order"))) {
    console.warn(`⚠️ [Database Fallback] 'is_pinned' or 'pin_order' columns missing in 'inventory' table. Skipping pinning fields.`);
    const { is_pinned: _p, pin_order: _o, ...safeData } = item;
    ({ data, error } = await supabase.from('inventory').insert([safeData]).select());
  }

  if (error) {
    console.error(`❌ [Database Error] Failed to create inventory item:`, error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json(data[0]);
});

// Bulk create inventory items (Batch insert for "Bulk Generate Repair Suite")
app.post('/api/inventory/bulk', async (req, res) => {
  const items = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Request body must be a non-empty array of items.' });
  }

  try {
    let { data, error } = await supabase
      .from('inventory')
      .insert(items)
      .select();

    // Fallback: strip is_pinned/pin_order if columns don't exist
    if (error && (error.message.includes("is_pinned") || error.message.includes("pin_order"))) {
      console.warn(`⚠️ [Database Fallback] 'is_pinned' or 'pin_order' columns missing. Retrying bulk insert without pinning fields.`);
      const safeItems = items.map(({ is_pinned, pin_order, ...rest }) => rest);
      ({ data, error } = await supabase.from('inventory').insert(safeItems).select());
    }

    if (error) {
      console.error(`❌ [Database Error] Bulk insert failed:`, error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ [Inventory] Bulk generated ${data.length} items successfully.`);
    res.json(data);
  } catch (err) {
    console.error(`❌ [Inventory] Bulk insert exception:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  const itemData = req.body;
  let { data, error } = await supabase.from('inventory').update(itemData).eq('id', req.params.id).select();

  if (error && (error.message.includes("is_pinned") || error.message.includes("pin_order"))) {
    console.warn(`⚠️ [Database Fallback] 'is_pinned' or 'pin_order' columns missing in 'inventory' table. Skipping pinning fields.`);
    const { is_pinned: _p, pin_order: _o, ...safeData } = itemData;
    ({ data, error } = await supabase.from('inventory').update(safeData).eq('id', req.params.id).select());
  }

  if (error) {
    console.error(`❌ [Database Error] Failed to update inventory item ${req.params.id}:`, error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json(data[0]);
});

app.delete('/api/inventory/:id', async (req, res) => {
  const { error } = await supabase.from('inventory').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ----------------------------------------------------------------------
// ORDERS
// ----------------------------------------------------------------------
app.get('/api/orders', async (req, res) => {
  // Fetch orders with their items
  const { data: orders, error: ordersError } = await supabase.from('orders').select('*').order('timestamp', { ascending: false });
  if (ordersError) return res.status(500).json({ error: ordersError.message });

  const { data: items, error: itemsError } = await supabase.from('order_items').select('*');
  if (itemsError) return res.status(500).json({ error: itemsError.message });

  // Map items back to their parents
  const ordersWithItems = orders.map(order => ({
    ...order,
    items: items.filter(item => item.order_id === order.id)
  }));

  res.json(ordersWithItems);
});

app.post('/api/orders', async (req, res) => {
  const { items, ...fullOrderData } = req.body;

  // Explicitly pick only the columns that exist in the 'orders' table.
  // This prevents schema errors if new fields (like 'surcharge') haven't been
  // added to the database yet via a migration.
  const knownColumns = ['id', 'timestamp', 'subtotal', 'tax', 'surcharge', 'total', 'profit', 'type', 'paymentMethod', 'status', 'mixedCash', 'mixedEftpos'];
  const orderData = {};
  for (const key of knownColumns) {
    if (fullOrderData[key] !== undefined) {
      orderData[key] = fullOrderData[key];
    }
  }

  // Insert Order - if new columns don't exist yet, retry with only legacy ones
  let order, orderError;
  ({ data: order, error: orderError } = await supabase.from('orders').insert([orderData]).select());

  if (orderError && orderError.message && (
    orderError.message.includes("surcharge") ||
    orderError.message.includes("status") ||
    orderError.message.includes("mixedCash") ||
    orderError.message.includes("mixedEftpos")
  )) {
    console.warn(`⚠️ [Database Fallback] One or more new 'orders' columns missing. Retrying with essential columns only.`);
    const essentialColumns = ['id', 'timestamp', 'subtotal', 'tax', 'total', 'profit', 'type', 'paymentMethod'];
    const safeOrderData = {};
    essentialColumns.forEach(key => { if (orderData[key] !== undefined) safeOrderData[key] = orderData[key]; });

    ({ data: order, error: orderError } = await supabase.from('orders').insert([safeOrderData]).select());
  }

  if (orderError) return res.status(500).json({ error: orderError.message });

  // Insert Order Items
  if (items && items.length > 0) {
    const itemsData = items.map(item => ({ ...item, order_id: orderData.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(itemsData);
    if (itemsError) return res.status(500).json({ error: itemsError.message });
  }

  // Always return the full order including surcharge to the frontend
  res.json({ ...order[0], surcharge: fullOrderData.surcharge || 0, items });
});

// ----------------------------------------------------------------------
// CUSTOMERS
// ----------------------------------------------------------------------
app.get('/api/customers', async (req, res) => {
  // Selective fields — only fetch what the UI actually needs for the list view
  const customerFields = 'id, name, phone, email, initials, totalSpent, status, statusColor, lastVisit, lastReviewSent, synced_to_google';
  const repairFields = 'id, customer_id, timestamp, repairItem, modelNumber, price, status, liquidDamage, deposit, password, imei, remark';

  // Run both queries in parallel for faster response
  const [customersResult, repairsResult] = await Promise.all([
    supabase.from('customers').select(customerFields).order('name', { ascending: true }),
    supabase.from('repairs').select(repairFields)
  ]);

  if (customersResult.error) return res.status(500).json({ error: customersResult.error.message });
  if (repairsResult.error) return res.status(500).json({ error: repairsResult.error.message });

  // Use a Map for O(n) join instead of O(n*m) filter per customer
  const repairsByCustomer = new Map();
  for (const r of repairsResult.data) {
    if (!repairsByCustomer.has(r.customer_id)) {
      repairsByCustomer.set(r.customer_id, []);
    }
    repairsByCustomer.get(r.customer_id).push(r);
  }

  const customersWithRepairs = customersResult.data.map(customer => ({
    ...customer,
    repairs: repairsByCustomer.get(customer.id) || []
  }));

  res.json(customersWithRepairs);
});

app.post('/api/customers', async (req, res) => {
  const { repairs, ...customerData } = req.body;
  const { data, error } = await supabase.from('customers').insert([customerData]).select();
  if (error) return res.status(500).json({ error: error.message });

  // Sync to Google Contacts (Awaited to ensure Vercel doesn't kill the process early)
  if (data && data[0]) {
    try {
      await syncCustomerToGoogleContacts(data[0], supabase);
    } catch (err) {
      console.error('[Google Contacts] Sync failed:', err);
    }
  }

  res.json({ ...data[0], repairs: [] });
});

app.put('/api/customers/:id', async (req, res) => {
  const { repairs, ...customerData } = req.body;
  const { data, error } = await supabase.from('customers').update(customerData).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });

  res.json(data[0]);
});

app.delete('/api/customers/:id', async (req, res) => {
  const { error } = await supabase.from('customers').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ----------------------------------------------------------------------
// APPOINTMENTS
// ----------------------------------------------------------------------
const isMissingReminderColumnError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('reminder_sent_at') || message.includes('reminder_sms_sid');
};

const selectAppointmentForReminder = async (id) => {
  const withReminderFields = await supabase
    .from('appointments')
    .select('id, customer_name, phone, brand, model, service, datetime, notes, status, reminder_sent_at, reminder_sms_sid')
    .eq('id', id)
    .maybeSingle();

  if (!withReminderFields.error) return withReminderFields;

  if (!isMissingReminderColumnError(withReminderFields.error)) {
    return withReminderFields;
  }

  const fallback = await supabase
    .from('appointments')
    .select('id, customer_name, phone, brand, model, service, datetime, notes, status')
    .eq('id', id)
    .maybeSingle();

  if (fallback.data) {
    fallback.data.reminder_sent_at = getReminderSentAt(fallback.data);
    fallback.data.reminder_sms_sid = null;
  }

  return fallback;
};

const markAppointmentReminderSent = async (appointment, sentAt, sid) => {
  const id = appointment.id;

  const fullUpdate = await supabase
    .from('appointments')
    .update({ reminder_sent_at: sentAt, reminder_sms_sid: sid || null })
    .eq('id', id)
    .select('id, reminder_sent_at, reminder_sms_sid')
    .maybeSingle();

  if (!fullUpdate.error) return fullUpdate.data;

  if (!isMissingReminderColumnError(fullUpdate.error)) {
    throw fullUpdate.error;
  }

  const partialUpdate = await supabase
    .from('appointments')
    .update({ reminder_sent_at: sentAt })
    .eq('id', id)
    .select('id, reminder_sent_at')
    .maybeSingle();

  if (!partialUpdate.error) return partialUpdate.data;

  if (!isMissingReminderColumnError(partialUpdate.error)) {
    throw partialUpdate.error;
  }

  const notes = appendReminderSentNote(appointment.notes, sentAt, sid);
  const notesUpdate = await supabase
    .from('appointments')
    .update({ notes })
    .eq('id', id)
    .select('id, notes')
    .maybeSingle();

  if (notesUpdate.error) throw notesUpdate.error;
  return { ...notesUpdate.data, reminder_sent_at: sentAt, reminder_sms_sid: sid || null };
};

app.post('/api/book-repair', async (req, res) => {
  const { customer_name, phone, devices, total, hasCustomQuote, datetime, notes, session_token } = req.body;

  if (!customer_name || !phone || !datetime || !devices) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1. Create Main Appointment Record
  const mainDevice = devices[0];
  const { data: appointment, error: apptError } = await supabase
    .from('appointments')
    .insert([{
      customer_name,
      phone,
      brand: mainDevice.brand,
      model: mainDevice.model,
      service: devices.length > 1 ? `${mainDevice.services[0]?.name || 'Repair'} + more` : (mainDevice.services[0]?.name || 'Repair'),
      datetime,
      notes: `[MULTI-DEVICE] Total: $${total} ${hasCustomQuote ? '(+Custom)' : ''} | Full Notes: ${notes}`,
      status: 'pending'
    }])
    .select()
    .maybeSingle();

  if (apptError) return res.status(500).json({ error: apptError.message });

  // 2. Chat Session Integration
  let sessionId = null;
  if (session_token) {
    const { data: session } = await supabase.from('chat_sessions').select('id').eq('session_token', session_token).single();
    if (session) sessionId = session.id;
  }

  if (!sessionId) {
    const newToken = crypto.randomBytes(16).toString('hex');
    const { data: newSession } = await supabase.from('chat_sessions').insert({ session_token: newToken }).select().single();
    if (newSession) sessionId = newSession.id;
  }

  const bookingSummary = devices.map(d => `${d.brand} ${d.model}: ${d.services.map(s => s.name).join(', ')}`).join(' | ');
  const mainDeviceTitle = `${mainDevice.brand} ${mainDevice.model}`;
  const mainServiceDescription = devices.length > 1 ? `${mainDevice.services[0]?.name || 'Repair'} + more` : (mainDevice.services[0]?.name || 'Repair');

  const messageContent = `[BOOKING_DATA] ${JSON.stringify({
    appointmentId: appointment.id,
    name: customer_name,
    phone,
    device: mainDeviceTitle,
    service: mainServiceDescription,
    summary: bookingSummary,
    total: total,
    time: datetime,
    notes
  })}`;

  await supabase.from('chat_messages').insert({ session_id: sessionId, sender: 'customer', content: messageContent });
  await supabase.from('chat_sessions').update({ last_message_at: new Date().toISOString() }).eq('id', sessionId);

  // 3. Push notification for the POS PWA
  try {
    await sendAdminPushNotification({
      title: 'New Repair Booking',
      body: `${customer_name}: ${mainDeviceTitle} - ${mainServiceDescription}`,
      url: '/admin/chat',
    });
  } catch (err) {
    console.error('[Push] Booking notification failed:', err.message);
  }

  res.json({ success: true, appointment });
});

app.patch('/api/appointments/:id/status', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['confirmed', 'declined', 'arrived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  console.log(`📅 [Appointment] Updating status for ID ${id} to: ${status}`);

  const { data: existingAppointment, error: existingAppointmentError } = await supabase
    .from('appointments')
    .select('id, status')
    .eq('id', id)
    .maybeSingle();

  if (existingAppointmentError) {
    console.error(`❌ [Appointment] Failed to fetch current status: ${existingAppointmentError.message}`);
    return res.status(500).json({ error: existingAppointmentError.message });
  }

  if (!existingAppointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const isFirstConfirmation = status === 'confirmed' && existingAppointment.status !== 'confirmed';
  const isArrival = status === 'arrived' && existingAppointment.status !== 'arrived';

  // 1. Update Appointment
  const appointmentUpdate = isArrival
    ? { status, arrived_at: new Date().toISOString() }
    : { status };

  let { data: appointment, error } = await supabase
    .from('appointments')
    .update(appointmentUpdate)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error && String(error.message || '').toLowerCase().includes('arrived_at')) {
    ({ data: appointment, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle());
  }

  if (error) {
    console.error(`❌ [Appointment] Failed to update: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }

  // 2. On confirmation, trigger Twilio SMS confirmation
  if (isFirstConfirmation) {
    const phone = appointment.phone;
    const name = appointment.customer_name;

    if (twilioClient && twilioPhone) {
      try {
        const smsBody = SMS_MESSAGES.booking(
          name,
          `${appointment.brand || ''} ${appointment.model || ''}`.trim() || 'your device',
          formatBookingTimeForSMS(appointment.datetime)
        );
        const formattedPhone = formatAustralianPhone(phone);

        await twilioClient.messages.create({
          body: smsBody,
          from: twilioPhone,
          to: formattedPhone,
        });
        console.log(`✅ [SMS] Booking confirmation sent after manual approval to ${formattedPhone}`);
      } catch (smsError) {
        console.error('❌ [SMS] Approval-triggered booking SMS failed:', smsError.message);
      }
    }
  }

  // 3. On arrival, check/create customer, link repair record, and sync to Google Contacts
  if (isArrival) {
    const phone = appointment.phone;
    const name = appointment.customer_name;

    console.log(`🔍 [Appointment] Checking/Creating customer for ${name} (${phone})`);

    // Check if customer exists by phone
    const { data: existing, error: checkError } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone);

    if (checkError) console.error(`⚠️ [Appointment] Error checking existing customer: ${checkError.message}`);

    let customerId;

    if (!existing || existing.length === 0) {
      // Normalize phone for storage (optional, but good for matching)
      const cleanPhone = phone.replace(/\D/g, '');

      // Calculate initials safely
      const names = name.trim().split(/\s+/).filter(Boolean);
      let initials = names[0]?.[0] || 'C';
      if (names.length > 1) {
        initials += names[names.length - 1]?.[0] || '';
      }
      initials = initials.toUpperCase().slice(0, 2);

      customerId = crypto.randomUUID();
      console.log(`✨ [Appointment] Creating new customer record with ID ${customerId}: ${name} (${cleanPhone})`);

      const { error: insertError } = await supabase.from('customers').insert({
        id: customerId,
        name: name.trim(),
        phone: phone.trim(),
        email: '',
        totalSpent: 0,
        status: 'Active',
        statusColor: 'green',
        lastVisit: new Date().toISOString().split('T')[0],
        initials
      });

      if (insertError) {
        console.error(`❌ [Appointment] Failed to create customer: ${insertError.message}`);
      } else {
        console.log(`✅ [Appointment] Customer record successfully created for ${name}`);
        // Sync to Google Contacts (Awaited to ensure Vercel doesn't kill the process early)
        try {
          await syncCustomerToGoogleContacts({ id: customerId, name: name.trim(), phone: phone.trim() }, supabase);
        } catch (err) {
          console.error('[Google Contacts] Sync failed:', err);
        }
      }
    } else {
      customerId = existing[0].id;
      console.log(`ℹ️ [Appointment] Customer ${name} already exists (ID: ${customerId})`);
    }

    // Create Repair Record for new/existing customer
    if (customerId) {
      const brand = appointment.brand || '';
      const model = appointment.model || '';
      const service = appointment.service || 'Repair';
      const scheduledTime = appointment.datetime || '';

      const dateObj = new Date(scheduledTime);
      const displayTime = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

      const repairId = `R-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      console.log(`🛠️ [Appointment] Creating linked repair record ${repairId} for ${brand} ${model}`);

      const { error: repairError } = await supabase.from('repairs').insert({
        id: repairId,
        customer_id: customerId,
        timestamp: new Date().toISOString(),
        repairItem: service,
        modelNumber: `${brand} ${model}`.trim(),
        price: 0,
        status: 'In Processing',
        remark: `预约时间: ${displayTime}`,
        liquidDamage: false,
        password: '',
        imei: ''
      });

      if (repairError) {
        console.error(`❌ [Appointment] Failed to create repair record: ${repairError.message}`);
      } else {
        console.log(`✅ [Appointment] Repair record successfully linked for ${name}`);
      }
    }
  }

  res.json(appointment);
});

app.post('/api/appointments/:id/reminder', async (req, res) => {
  try {
    const { data: appointment, error } = await selectAppointmentForReminder(req.params.id);

    if (error || !appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const existingSentAt = getReminderSentAt(appointment);
    if (existingSentAt) {
      return res.json({
        success: true,
        alreadySent: true,
        reminder_sent_at: existingSentAt,
        appointment: { ...appointment, reminder_sent_at: existingSentAt },
      });
    }

    if (!twilioClient || !twilioPhone) {
      return res.status(503).json({ error: 'Twilio is not configured' });
    }

    const to = formatAustralianPhone(appointment.phone);
    if (!to) return res.status(400).json({ error: 'Appointment phone number is missing' });

    const smsBody = buildRepairReminderSMS(formatBookingTimeForSMS(appointment.datetime));
    const message = await twilioClient.messages.create({
      body: smsBody,
      from: twilioPhone,
      to,
    });

    const sentAt = new Date().toISOString();
    const reminderUpdate = await markAppointmentReminderSent(appointment, sentAt, message.sid);

    res.json({
      success: true,
      alreadySent: false,
      reminder_sent_at: sentAt,
      reminder_sms_sid: message.sid,
      appointment: {
        ...appointment,
        ...reminderUpdate,
        reminder_sent_at: sentAt,
        reminder_sms_sid: message.sid,
      },
      messageLength: smsBody.length,
    });
  } catch (err) {
    console.error('❌ [SMS] Appointment reminder failed:', err.message);
    res.status(500).json({ error: err.message || 'Failed to send reminder' });
  }
});

app.get('/api/appointments/upcoming', async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const withReminderFields = await supabase
    .from('appointments')
    .select('id, customer_name, phone, brand, model, service, datetime, notes, status, created_at, reminder_sent_at, reminder_sms_sid')
    .gte('datetime', startOfToday.toISOString())
    .order('datetime', { ascending: true });

  let data = withReminderFields.data;
  let error = withReminderFields.error;

  if (error && isMissingReminderColumnError(error)) {
    const fallback = await supabase
      .from('appointments')
      .select('id, customer_name, phone, brand, model, service, datetime, notes, status, created_at')
      .gte('datetime', startOfToday.toISOString())
      .order('datetime', { ascending: true });

    data = (fallback.data || []).map((appointment) => ({
      ...appointment,
      reminder_sent_at: getReminderSentAt(appointment),
      reminder_sms_sid: null,
    }));
    error = fallback.error;
  }

  if (error) return res.status(500).json({ error: error.message });

  const visibleStatuses = new Set(['pending', 'confirmed']);
  const upcoming = (data || [])
    .filter((appointment) => visibleStatuses.has(String(appointment.status || '').toLowerCase()))
    .map((appointment) => ({
      ...appointment,
      reminder_sent_at: getReminderSentAt(appointment),
    }));

  res.json(upcoming);
});

app.get('/api/appointments/:id', async (req, res) => {
  const { data, error } = await selectAppointmentForReminder(req.params.id);

  if (error) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: data?.id,
    status: data?.status,
    reminder_sent_at: getReminderSentAt(data),
    reminder_sms_sid: data?.reminder_sms_sid || null,
  });
});

// ----------------------------------------------------------------------
// ANNOUNCEMENTS
// ----------------------------------------------------------------------
app.get('/api/announcements', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('storefront_announcements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('storefront_announcements')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/announcements/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('storefront_announcements')
      .update(req.body)
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('storefront_announcements')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// QUALITY TIERS
// ----------------------------------------------------------------------
app.get('/api/quality-tiers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quality_tiers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quality-tiers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quality_tiers')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/quality-tiers/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quality_tiers')
      .update(req.body)
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/quality-tiers/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('quality_tiers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// REPAIRS
// ----------------------------------------------------------------------
app.post('/api/repairs', async (req, res) => {
  const { data, error } = await supabase.from('repairs').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/repairs/:id', async (req, res) => {
  const { data, error } = await supabase.from('repairs').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/repairs/:id', async (req, res) => {
  const { error } = await supabase.from('repairs').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Public Tracking Endpoint
app.get('/api/repairs/track/:id', async (req, res) => {
  const query = decodeURIComponent(req.params.id);
  try {
    // 1. Try exact ID match
    let { data: repair } = await supabase
      .from('repairs')
      .select('id, status, customer_id')
      .eq('id', query)
      .maybeSingle();

    let customerName = null;

    // 2. If no ID match, try Phone match
    if (!repair) {
      const cleanPhone = query.replace(/\s/g, '');
      const { data: customer } = await supabase
        .from('customers')
        .select('id, name')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (customer) {
        const { data: recentRepair } = await supabase
          .from('repairs')
          .select('id, status, customer_id')
          .eq('customer_id', customer.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (recentRepair) {
          repair = recentRepair;
          customerName = customer.name;
        }
      }
    } else {
      // Get customer name for ID match
      if (repair.customer_id) {
        const { data: customer } = await supabase
          .from('customers')
          .select('name')
          .eq('id', repair.customer_id)
          .maybeSingle();
        if (customer) customerName = customer.name;
      }
    }

    if (!repair) {
      return res.status(404).json({ error: 'Repair not found. Please check your ID.' });
    }

    res.json({
      repair: {
        id: repair.id,
        status: repair.status,
        customerName: customerName
      }
    });
  } catch (error) {
    console.error('Track API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----------------------------------------------------------------------
// STOREFRONT UPSELLS
// ----------------------------------------------------------------------
app.get('/api/upsells', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('storefront_upsells')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// SETTINGS
// ----------------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) return res.status(500).json({ error: error.message });

  const settingsMap = {};
  data.forEach(item => { settingsMap[item.key] = item.value; });
  res.json(settingsMap);
});

app.put('/api/settings/:key', async (req, res) => {
  const { value } = req.body;
  const { data, error } = await supabase.from('settings').upsert({ key: req.params.key, value }).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// ----------------------------------------------------------------------
// BLOG GENERATION (AI)
// ----------------------------------------------------------------------
app.post('/api/blog/generate', (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic required' });

  try {
    const scriptPath = path.join(__dirname, '../../scripts/generate-blog.mjs');
    console.log(`🤖 [AI Blog] Generating draft for topic: ${topic}`);

    // Run the script with --json flag
    const result = execSync(`node "${scriptPath}" --json "${topic}"`, { encoding: 'utf-8' });
    const draft = JSON.parse(result);

    res.json(draft);
  } catch (err) {
    console.error('❌ [AI Blog] Generation failed:', err.message);
    res.status(500).json({ error: 'Failed to generate blog draft' });
  }
});

app.post('/api/blog/confirm', async (req, res) => {
  const { slug, content, image: cloudImageUrl } = req.body;
  if (!slug || !content) return res.status(400).json({ error: 'Slug and content required' });

  try {
    const blogDraftDir = path.join(__dirname, '../../storefront/src/content/blog');
    const publicAssetsDir = path.join(__dirname, '../../storefront/public/blog');
    const markdownPath = path.join(blogDraftDir, `${slug}.md`);
    const imagePath = path.join(publicAssetsDir, `${slug}.png`);

    // 1. Ensure directories exist
    if (!fs.existsSync(blogDraftDir)) fs.mkdirSync(blogDraftDir, { recursive: true });
    if (!fs.existsSync(publicAssetsDir)) fs.mkdirSync(publicAssetsDir, { recursive: true });

    // 2. Download Image if cloud URL is provided
    if (cloudImageUrl && cloudImageUrl.startsWith('http')) {
      console.log(`📥 [AI Blog] Dowloading AI image for: ${slug}`);
      const response = await fetch(cloudImageUrl);
      if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(imagePath, buffer);
      console.log(`🖼️ [AI Blog] Saved local image: ${imagePath}`);
    }

    // 3. Write Markdown file
    fs.writeFileSync(markdownPath, content);

    console.log(`✅ [AI Blog] Published new post: ${slug}`);
    res.json({ success: true, slug });
  } catch (err) {
    console.error('❌ [AI Blog] Publish failed:', err.message);
    res.status(500).json({ error: 'Failed to save blog post and image' });
  }
});


// ----------------------------------------------------------------------
// REVIEWS SYSTEM
// ----------------------------------------------------------------------

const googleReviewsData = [
  {
    id: 1,
    name: "Nina Meow",
    rating: 5,
    text: "Ali Mobile Repair is honest and affordable. No hidden fees, just clear and fair pricing. I compared with other nearby shops and this one is definitely cheaper. Great service and fast repair – highly recommended!",
    date: "8 months ago",
    avatar: "N"
  },
  {
    id: 2,
    name: "John Williamson",
    rating: 5,
    text: "This is about the fourth or fifth time I have used Ali Express. He has always been helpful, prompt and fairly priced. Pleased to have gone to him. Highly recommended.",
    date: "8 months ago",
    avatar: "J"
  },
  {
    id: 3,
    name: "BBQs-R-US",
    rating: 5,
    text: "Extremely friendly and competent, fixed all my little issues and I basically have a new phone for $200. Thanks",
    date: "6 months ago",
    avatar: "B"
  },
  {
    id: 4,
    name: "Janine B",
    rating: 5,
    text: "Allen replaced my screen within an hour - very honest and polite, and great rate! Amazed and grateful! Best Samsung Note 2 repair experience.",
    date: "7 years ago",
    avatar: "J"
  },
  {
    id: 5,
    name: "Bumzigan Yebet",
    rating: 5,
    text: "Dropped my Samsung tablet in to have the battery replaced. Was done in time stated and works like a new one now. Highly recommended. Thanks",
    date: "9 months ago",
    avatar: "B"
  },
  {
    id: 6,
    name: "Jay Taplin",
    rating: 5,
    text: "Great service, very helpful and friendly. Highly recommend for any phone repairs in Ringwood.",
    date: "A month ago",
    avatar: "J"
  }
];

app.get('/api/reviews', (req, res) => {
  res.json(googleReviewsData);
});

// ----------------------------------------------------------------------
// CHAT SYSTEM
// ----------------------------------------------------------------------

// Customer: create or retrieve a session by token
app.post('/api/chat/session', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });

  // Try to find existing session
  let { data: existing } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('session_token', token)
    .maybeSingle();

  if (existing) return res.json(existing);

  // Create new session
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ session_token: token })
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Customer: get messages for their own session
app.get('/api/chat/session/:token/messages', async (req, res) => {
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('session_token', req.params.token)
    .maybeSingle();

  if (!session) return res.status(404).json({ error: 'session not found' });

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Customer: send a message
app.post('/api/chat/session/:token/message', async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'content required' });

  const trimmed = content.trim();

  // Fetch session WITH the debounce timestamp (DB-backed, serverless-safe)
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id, last_sms_sent_at')
    .eq('session_token', req.params.token)
    .maybeSingle();

  if (!session) return res.status(404).json({ error: 'session not found' });

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ session_id: session.id, sender: 'customer', content: trimmed })
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  // Update last_message_at
  await supabase
    .from('chat_sessions')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', session.id);

  // ── Server-side SMS + Push Alert (DB-backed debounce) ─────────────
  const INTRO_PREFIX = '[CUSTOMER_INFO]';
  const BOOKING_PREFIX = '[BOOKING_DATA]';
  const shouldAlert = !trimmed.startsWith(INTRO_PREFIX) && !trimmed.startsWith(BOOKING_PREFIX);

  if (shouldAlert) {
    const now = new Date();
    // DB-backed debounce: check `last_sms_sent_at` from chat_sessions
    const lastSmsTimestamp = session.last_sms_sent_at;
    const withinDebounce = lastSmsTimestamp &&
      (now.getTime() - new Date(lastSmsTimestamp).getTime()) < DEBOUNCE_MS;

    if (!withinDebounce) {
      // Update the DB timestamp FIRST (atomic, survives cold starts)
      await supabase
        .from('chat_sessions')
        .update({ last_sms_sent_at: now.toISOString() })
        .eq('id', session.id);

      // SMS alert — only if admin has SMS alerts enabled (cost-saving gate)
      if (twilioClient && twilioPhone) {
        const smsEnabled = await isSmsAlertEnabled(supabase);
        if (!smsEnabled) {
          console.log('SMS alerts disabled by admin. Skipping Twilio.');
        } else {
          const snippet = trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed;
          const smsBody = cleanSMS(`New POS Chat: "${snippet}"`);
          try {
            const msg = await twilioClient.messages.create({
              body: smsBody,
              from: twilioPhone,
              to: ADMIN_PHONE,
            });
            console.log(`✅ [SMS] Chat alert sent — SID: ${msg.sid}`);
          } catch (err) {
            console.error('❌ [SMS] Chat alert failed:', err.message);
          }
        }
      }
    }

    // Web Push alert (load subscriptions from DB, not in-memory)
    // ALWAYS fire push, even within debounce, because push is free and updates the badge
    if (VAPID_PUBLIC_KEY) {
      try {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth');

        if (subs && subs.length > 0) {
          const snippet = trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed;

          // Calculate total unread messages for the app badge
          const { count: unreadCount } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .eq('sender', 'customer');

          const pushPayload = JSON.stringify({
            title: 'New Customer Chat',
            body: snippet,
            url: '/admin/chat',
            unreadCount: unreadCount || 1
          });

          if (!process.env.VAPID_PRIVATE_KEY) {
            console.error("🚨 CRITICAL: VAPID_PRIVATE_KEY is UNDEFINED in production!");
          }

          console.log('--- PUSH DEBUG START ---');
          console.log('1. Has Private Key Context?', !!process.env.VAPID_PRIVATE_KEY);
          console.log('2. Private Key Length:', process.env.VAPID_PRIVATE_KEY ? process.env.VAPID_PRIVATE_KEY.length : 'UNDEFINED!');
          console.log('3. VAPID Details Configuration:', webpush.generateVapidHeaders ? 'Methods exist' : 'Missing methods');
          console.log('--- PUSH DEBUG END ---');

          if (process.env.VAPID_PRIVATE_KEY) {
            webpush.setVapidDetails(
              'mailto:admin@alimobile.com.au',
              VAPID_PUBLIC_KEY,
              process.env.VAPID_PRIVATE_KEY
            );
            console.log("Current Subject:", "mailto:admin@alimobile.com.au");
          }

          const results = await Promise.allSettled(subs.map(async sub => {
            const pushSub = {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            };
            try {
              await webpush.sendNotification(pushSub, pushPayload);
              return { success: true };
            } catch (err) {
              console.error("❌ PUSH REJECTED:", err.statusCode, err.body || err.message);

              if (err.statusCode === 401 || err.statusCode === 403) {
                console.error("🚨 [Push Auth Error] 401/403 鉴权失败！可能原因：");
                console.error("   1. Vercel 上未配置 VAPID_PRIVATE_KEY 环境变量");
                console.error("   2. 前后端 VAPID_PUBLIC_KEY 不一致");
                console.error("   3. mailto subject 格式不正确");
              }

              // Remove stale/invalid subscriptions from DB
              if (err.statusCode === 410 || err.statusCode === 404) {
                await supabase
                  .from('push_subscriptions')
                  .delete()
                  .eq('endpoint', sub.endpoint);
                console.log(`🗑️ [Push] Removed stale subscription: ${sub.endpoint.substring(0, 40)}...`);
              }
              throw err;
            }
          }));

          const successes = results.filter(r => r.status === 'fulfilled').length;
          const fails = results.filter(r => r.status === 'rejected').length;
          console.log(`📡 [Push] Delivery Batch: ${successes} success, ${fails} failed.`);
        }
      } catch (pushErr) {
        console.error('❌ [Push] Failed to load subscriptions:', pushErr.message);
      }
    }
  }

  res.json(data);
});

// Staff: get all sessions (conversation list)
app.get('/api/chat/sessions', async (req, res) => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select(`
      id, session_token, created_at, last_message_at,
      chat_messages (id, sender, content, created_at, is_read)
    `)
    .order('last_message_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Filter out sessions that have no messages (ghost sessions)
  const activeSessions = (data || []).filter(s => s.chat_messages && s.chat_messages.length > 0);
  res.json(activeSessions);
});

// Staff: get all messages in a specific session
app.get('/api/chat/session/id/:id/messages', async (req, res) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', req.params.id)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Mark all customer messages as read
  await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('session_id', req.params.id)
    .eq('sender', 'customer');

  res.json(data || []);
});

// Staff: reply to a customer session
app.post('/api/chat/session/id/:id/reply', async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'content required' });

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ session_id: req.params.id, sender: 'staff', content: content.trim() })
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  await supabase
    .from('chat_sessions')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', req.params.id);

  res.json(data);
});


// Staff: delete a chat session (and all its messages via CASCADE)
app.delete('/api/chat/session/id/:id', async (req, res) => {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Proxy for AI Images (fixes CORS and loading issues in preview)
app.get('/api/blog/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL required');

  try {
    const rawUrl = decodeURIComponent(url.toString());
    const response = await fetch(rawUrl);
    if (!response.ok) throw new Error('Failed to fetch image');

    const contentType = response.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    console.error('❌ [Proxy] Image fetch failed:', err.message);
    res.status(500).send('Failed to proxy image');
  }
});

// ----------------------------------------------------------------------
// WEB PUSH NOTIFICATIONS
// ----------------------------------------------------------------------

// Get VAPID public key (needed by frontend to subscribe)
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Save a push subscription (DB-backed, upsert by endpoint)
app.post('/api/push/subscribe', async (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  const keys = subscription.keys || {};
  if (!keys.p256dh || !keys.auth) {
    return res.status(400).json({ error: 'Missing p256dh or auth keys' });
  }

  try {
    // Upsert: insert or update if endpoint already exists
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_id: subscription.user_id || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'endpoint' });

    if (error) throw error;

    const { count } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ [Push] Subscription upserted. Total in DB: ${count}`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ [Push] Failed to save subscription:', err.message);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Unsubscribe (DB-backed)
app.post('/api/push/unsubscribe', async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'endpoint required' });

  try {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    const { count } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    console.log(`🗑️ [Push] Subscription removed. Remaining in DB: ${count}`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ [Push] Failed to remove subscription:', err.message);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

// Test push (for debugging — reads from DB)
app.post('/api/push/test', async (req, res) => {
  console.log("🔥 TEST ENDPOINT TRIGGERED");
  try {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');

    console.log("📊 Subscriptions found in DB:", subs?.length);

    if (!subs || subs.length === 0) {
      return res.status(404).json({ error: "No push subscriptions found in database." });
    }

    const payload = JSON.stringify({
      title: 'Test Notification',
      body: 'Push notifications are working! 🎉',
      url: '/admin/chat',
    });

    if (!process.env.VAPID_PRIVATE_KEY) {
      console.error("🚨 CRITICAL: VAPID_PRIVATE_KEY is UNDEFINED in production!");
    }

    console.log('--- PUSH DEBUG START ---');
    console.log('1. Has Private Key Context?', !!process.env.VAPID_PRIVATE_KEY);
    console.log('2. Private Key Length:', process.env.VAPID_PRIVATE_KEY ? process.env.VAPID_PRIVATE_KEY.length : 'UNDEFINED!');
    console.log('3. VAPID Details Configuration:', webpush.generateVapidHeaders ? 'Methods exist' : 'Missing methods');
    console.log('--- PUSH DEBUG END ---');

    if (process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:admin@alimobile.com.au',
        VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
      console.log("Current Subject:", "mailto:admin@alimobile.com.au");
    }

    const results = await Promise.allSettled(subs.map(async sub => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      try {
        await webpush.sendNotification(pushSub, payload);
        return { success: true, endpoint: sub.endpoint };
      } catch (err) {
        console.error("❌ PUSH REJECTED:", err.statusCode, err.body || err.message);

        if (err.statusCode === 401 || err.statusCode === 403) {
          console.error("🚨 [Push Auth Error] 401/403 鉴权失败！可能原因：");
          console.error("   1. Vercel 上未配置 VAPID_PRIVATE_KEY 环境变量");
          console.error("   2. 前后端 VAPID_PUBLIC_KEY 不一致");
          console.error("   3. mailto subject 格式不正确");
        }

        // Remove stale/invalid subscriptions from DB
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          console.log(`🗑️ [Push] Removed stale subscription: ${sub.endpoint.substring(0, 40)}...`);
        }

        return {
          success: false,
          endpoint: sub.endpoint,
          error: err.body || err.message,
          statusCode: err.statusCode
        };
      }
    }));

    const successes = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failures = results
      .map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Settlement Error' })
      .filter(f => !f.success);

    res.json({
      ok: true,
      attempted: subs.length,
      successes,
      failures
    });
  } catch (err) {
    console.error('❌ [Push] Test push error:', err.message);
    res.status(500).json({ error: 'Failed to send test push' });
  }
});

// ----------------------------------------------------------------------
// START SERVER
// ----------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${port}`);
  });
}

module.exports = app;
