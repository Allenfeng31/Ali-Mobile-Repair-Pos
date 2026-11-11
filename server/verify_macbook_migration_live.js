const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/.env' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const EXPECTED_MODELS = [
  { model: 'C MacBook||MacBook Pro 14" M4 (2024)', expected_device_model: 'A3112', comm_name: 'MacBook Pro 14" M4 (2024)' },
  { model: 'C MacBook||MacBook Pro 14" M4 Pro (2024)', expected_device_model: 'A3401', comm_name: 'MacBook Pro 14" M4 Pro (2024)' },
  { model: 'C MacBook||MacBook Pro 14" M4 Max (2024)', expected_device_model: 'A3185', comm_name: 'MacBook Pro 14" M4 Max (2024)' },
  { model: 'C MacBook||MacBook Pro 16" M4 Pro (2024)', expected_device_model: 'A3403', comm_name: 'MacBook Pro 16" M4 Pro (2024)' },
  { model: 'C MacBook||MacBook Pro 16" M4 Max (2024)', expected_device_model: 'A3186', comm_name: 'MacBook Pro 16" M4 Max (2024)' },
  { model: 'C MacBook||MacBook Pro 14" M5 (2025)', expected_device_model: 'A3434', comm_name: 'MacBook Pro 14" M5 (2025)' },
  { model: 'C MacBook||MacBook Pro 14" M5 Pro (2026)', expected_device_model: 'A3426', comm_name: 'MacBook Pro 14" M5 Pro (2026)' },
  { model: 'C MacBook||MacBook Pro 14" M5 Max (2026)', expected_device_model: 'A3427', comm_name: 'MacBook Pro 14" M5 Max (2026)' },
  { model: 'C MacBook||MacBook Pro 16" M5 Pro (2026)', expected_device_model: 'A3428', comm_name: 'MacBook Pro 16" M5 Pro (2026)' },
  { model: 'C MacBook||MacBook Pro 16" M5 Max (2026)', expected_device_model: 'A3429', comm_name: 'MacBook Pro 16" M5 Max (2026)' },
];

const REQUIRED_CATEGORIES = [
  'Screen Replacement',
  'Battery Replacement',
  'Charging Port Replacement',
  'Water Damage Cleaning / Assessment',
  'Motherboard & Logic Board Repair',
];

async function verify() {
  const modelNames = EXPECTED_MODELS.map(m => m.model);

  const { data: rows, error } = await supabase
    .from('inventory')
    .select('id, name, model, device_model, category, price, costPrice, stock')
    .in('model', modelNames)
    .order('id', { ascending: true });

  if (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }

  const { data: combinedRows } = await supabase
    .from('inventory')
    .select('id, name, model')
    .or('model.ilike.%14"/16" M4 Pro/Max%,model.ilike.%14"/16" M5 Pro/Max%');

  const { data: legacyRows } = await supabase
    .from('inventory')
    .select('id, name, price')
    .in('id', [1263, 1264, 3902])
    .order('id', { ascending: true });

  const isMigrated = rows.length === 50 && combinedRows.length === 0;

  console.log(JSON.stringify({
    isMigrated,
    migratedRowsCount: rows.length,
    remainingCombinedCount: combinedRows.length,
    legacyRows,
    sampleRows: rows.slice(0, 5),
    insertedRows: rows.filter(r => r.id > 4242).map(r => ({ id: r.id, name: r.name, model: r.model, device_model: r.device_model }))
  }, null, 2));
}

verify();
