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

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

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

  // Remove password from response
  const { password: _, ...user } = data;
  res.json({ success: true, user });
});

// ----------------------------------------------------------------------
// INVENTORY
// ----------------------------------------------------------------------
app.get('/api/inventory', async (req, res) => {
  const { data, error } = await supabase.from('inventory').select('*').order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
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
  const { items, ...orderData } = req.body;
  
  // Insert Order
  const { data: order, error: orderError } = await supabase.from('orders').insert([orderData]).select();
  if (orderError) return res.status(500).json({ error: orderError.message });

  // Insert Order Items
  if (items && items.length > 0) {
    const itemsData = items.map(item => ({ ...item, order_id: orderData.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(itemsData);
    if (itemsError) return res.status(500).json({ error: itemsError.message });
  }

  res.json({ ...order[0], items });
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
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
