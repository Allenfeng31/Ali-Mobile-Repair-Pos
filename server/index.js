const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize Supabase
// Use service_role key if available (bypasses RLS, recommended for server-side use)
// Get service_role key from: Supabase Dashboard → Settings → API → service_role (secret)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
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

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ [SMS] Twilio client initialized — SMS notifications active.');
} else {
  console.warn('⚠️  [SMS] Twilio credentials not set — SMS notifications disabled. Add TWILIO_* to server/.env');
}

const SMS_MESSAGES = {
  dropoff: (name) =>
    `Hi ${name}! Thank you for choosing Ali Mobile Repair. Your device has been successfully checked in. Our technicians will assess it right away and we'll send you a text as soon as your repair is complete. We appreciate your trust! 📱`,

  completed: (name, device) =>
    `Great news, ${name}! 🎉 Your ${device} repair at Ali Mobile Repair is now complete and ready for pickup. Please visit us at your convenience. We look forward to seeing you!`,

  review: (name) =>
    `Hi ${name}! Thank you for choosing Ali Mobile Repair. We hope you're happy with the service! If you have a moment, we'd really appreciate a Google review — it means the world to us 🙏\n${googleReviewLink}`,
};

app.post('/api/sms/send', async (req, res) => {
  const { to, type, customerName = 'Valued Customer', deviceModel = 'your device' } = req.body;

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
    const body = type === 'dropoff'
      ? SMS_MESSAGES.dropoff(customerName)
      : type === 'completed'
        ? SMS_MESSAGES.completed(customerName, deviceModel)
        : SMS_MESSAGES.review(customerName);

    const message = await twilioClient.messages.create({
      body,
      from: twilioPhone,
      to: formattedPhone,
    });

    console.log(`✅ [SMS] ${type} sent to ${formattedPhone} — SID: ${message.sid}`);
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
  
  const { data, error } = await supabase
    .from('pos_users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const { password: _, ...user } = data;
  res.json({ success: true, user });
});

app.put('/api/users/:id', async (req, res) => {
  const { username, password } = req.body;
  const updateData = {};
  if (username) updateData.username = username;
  if (password) updateData.password = password;

  const { data, error } = await supabase
    .from('pos_users')
    .update(updateData)
    .eq('id', req.params.id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  
  const { password: _, ...user } = data[0];
  res.json(user);
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
  const { data, error } = await supabase.from('inventory').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/inventory/:id', async (req, res) => {
  const { data, error } = await supabase.from('inventory').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
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
  const knownColumns = ['id', 'timestamp', 'subtotal', 'tax', 'surcharge', 'total', 'profit', 'type', 'paymentMethod', 'status'];
  const orderData = {};
  for (const key of knownColumns) {
    if (fullOrderData[key] !== undefined) {
      orderData[key] = fullOrderData[key];
    }
  }

  // Insert Order - if surcharge column doesn't exist yet, retry without it
  let order, orderError;
  ({ data: order, error: orderError } = await supabase.from('orders').insert([orderData]).select());
  
  if (orderError && orderError.message && orderError.message.includes("surcharge")) {
    // Fallback: column doesn't exist in DB yet, insert without surcharge
    const { surcharge: _removed, ...orderDataWithoutSurcharge } = orderData;
    ({ data: order, error: orderError } = await supabase.from('orders').insert([orderDataWithoutSurcharge]).select());
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
  const { data: customers, error } = await supabase.from('customers').select('*').order('name', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  const { data: repairs, error: repairsError } = await supabase.from('repairs').select('*');
  if (repairsError) return res.status(500).json({ error: repairsError.message });

  const customersWithRepairs = customers.map(customer => ({
    ...customer,
    repairs: repairs.filter(r => r.customer_id === customer.id)
  }));

  res.json(customersWithRepairs);
});

app.post('/api/customers', async (req, res) => {
  const { repairs, ...customerData } = req.body;
  const { data, error } = await supabase.from('customers').insert([customerData]).select();
  if (error) return res.status(500).json({ error: error.message });

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
// START SERVER
// ----------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${port}`);
  });
}

module.exports = app;
