const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/.env' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const EXPECTED_MODELS = [
  { model: 'C MacBook||MacBook Pro 14" M4 (2024)', expected_device_model: 'A3112', comm_name: 'MacBook Pro 14" M4 (2024)', id_range: '4223-4227 (preserved)' },
  { model: 'C MacBook||MacBook Pro 14" M4 Pro (2024)', expected_device_model: 'A3401', comm_name: 'MacBook Pro 14" M4 Pro (2024)', id_range: '4228-4232 (updated from 14"/16" combined)' },
  { model: 'C MacBook||MacBook Pro 14" M4 Max (2024)', expected_device_model: 'A3185', comm_name: 'MacBook Pro 14" M4 Max (2024)', id_range: '4243-4247 (inserted)' },
  { model: 'C MacBook||MacBook Pro 16" M4 Pro (2024)', expected_device_model: 'A3403', comm_name: 'MacBook Pro 16" M4 Pro (2024)', id_range: '4248-4252 (inserted)' },
  { model: 'C MacBook||MacBook Pro 16" M4 Max (2024)', expected_device_model: 'A3186', comm_name: 'MacBook Pro 16" M4 Max (2024)', id_range: '4253-4257 (inserted)' },
  { model: 'C MacBook||MacBook Pro 14" M5 (2025)', expected_device_model: 'A3434', comm_name: 'MacBook Pro 14" M5 (2025)', id_range: '4233-4237 (updated A-number from Mac17,2 to A3434)' },
  { model: 'C MacBook||MacBook Pro 14" M5 Pro (2026)', expected_device_model: 'A3426', comm_name: 'MacBook Pro 14" M5 Pro (2026)', id_range: '4238-4242 (updated from 14"/16" combined)' },
  { model: 'C MacBook||MacBook Pro 14" M5 Max (2026)', expected_device_model: 'A3427', comm_name: 'MacBook Pro 14" M5 Max (2026)', id_range: '4258-4262 (inserted)' },
  { model: 'C MacBook||MacBook Pro 16" M5 Pro (2026)', expected_device_model: 'A3428', comm_name: 'MacBook Pro 16" M5 Pro (2026)', id_range: '4263-4267 (inserted)' },
  { model: 'C MacBook||MacBook Pro 16" M5 Max (2026)', expected_device_model: 'A3429', comm_name: 'MacBook Pro 16" M5 Max (2026)', id_range: '4268-4272 (inserted)' },
];

const REQUIRED_CATEGORIES = [
  'Screen Replacement',
  'Battery Replacement',
  'Charging Port Replacement',
  'Water Damage Cleaning / Assessment',
  'Motherboard & Logic Board Repair',
];

async function verifyAll() {
  console.log('================================================================');
  console.log('       LIVE SUPABASE DATABASE DIRECT AUDIT & VERIFICATION       ');
  console.log('================================================================\n');

  const { data: allRows, error } = await supabase
    .from('inventory')
    .select('id, name, model, device_model, category, price, costPrice, stock, status, iconName, sku')
    .gte('id', 4223)
    .lte('id', 4272)
    .order('id', { ascending: true });

  if (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }

  console.log('1. TOTAL NEW MACBOOK PRO RECORDS: ' + allRows.length + ' (Expected: 50)');
  const grouped = {};
  for (const r of allRows) {
    if (!grouped[r.model]) grouped[r.model] = [];
    grouped[r.model].push(r);
  }

  console.log('2. DISTINCT MODEL GROUPS: ' + Object.keys(grouped).length + ' (Expected: 10)\n');

  let allChecksPass = true;
  for (const [idx, exp] of EXPECTED_MODELS.entries()) {
    const rows = grouped[exp.model] || [];
    const countOk = rows.length === 5;
    const cats = rows.map(r => r.category);
    const catsOk = REQUIRED_CATEGORIES.every(c => cats.includes(c)) && cats.length === 5;
    const devModels = [...new Set(rows.map(r => r.device_model))];
    const devModelOk = devModels.length === 1 && devModels[0] === exp.expected_device_model;
    const namesOk = rows.every(r => r.name === exp.comm_name + ' ' + r.category);
    const priceOk = rows.every(r => Number(r.price) === 0 && Number(r.costPrice || 0) === 0 && Number(r.stock || 0) === 0);
    const ids = rows.map(r => r.id);

    console.log(`[Model ${idx + 1}/10] ${exp.comm_name}`);
    console.log(`  IDs: ${ids.join(', ')} [${exp.id_range}]`);
    console.log(`  A-Number: ${devModels.join(', ')} (Required: ${exp.expected_device_model}) -> ${devModelOk ? 'PASS' : 'FAIL'}`);
    console.log(`  Categories: ${catsOk ? 'PASS (all 5 present)' : 'FAIL'}`);
    console.log(`  Name Parity: ${namesOk ? 'PASS' : 'FAIL'}`);
    console.log(`  Zero Price/Cost/Stock: ${priceOk ? 'PASS' : 'FAIL'}`);

    if (!countOk || !catsOk || !devModelOk || !namesOk || !priceOk) {
      allChecksPass = false;
    }
  }

  // 3. Confirm 0 combined models remain
  const { data: combinedRows } = await supabase
    .from('inventory')
    .select('id, name, model')
    .or('model.ilike.%14"/16" M4 Pro/Max%,model.ilike.%14"/16" M5 Pro/Max%');

  console.log('\n3. REMAINING COMBINED M4/M5 INVENTORY GROUPS: ' + combinedRows.length + ' (Required: 0) -> ' + (combinedRows.length === 0 ? 'PASS' : 'FAIL'));

  // 4. Legacy M3 check
  const { data: legacyRows } = await supabase
    .from('inventory')
    .select('id, name, model, price')
    .in('id', [1263, 1264, 3902])
    .order('id', { ascending: true });

  console.log('\n4. LEGACY M3 PRO/MAX PRICE PRESERVATION:');
  for (const lr of legacyRows) {
    console.log(`  Row ID ${lr.id}: $${lr.price} (${lr.name})`);
  }
  const legacyOk = legacyRows.find(r => r.id === 1263)?.price == 780 &&
                   legacyRows.find(r => r.id === 1264)?.price == 240 &&
                   legacyRows.find(r => r.id === 3902)?.price == 750;
  console.log('  Legacy Price Status: ' + (legacyOk ? 'PASS (All strictly preserved)' : 'FAIL'));

  // 5. Query Production POS API
  console.log('\n5. PRODUCTION POS API AUDIT (https://api.alimobile.com.au/api/inventory):');
  try {
    const apiRes = await fetch('https://api.alimobile.com.au/api/inventory');
    const apiInventory = await apiRes.json();
    console.log(`  Total items in production POS API: ${apiInventory.length}`);
    const apiMacBookItems = apiInventory.filter(item => item.id >= 4223 && item.id <= 4272);
    console.log(`  Migrated items present in POS API: ${apiMacBookItems.length} (Expected: 50)`);

    const apiModels = [...new Set(apiMacBookItems.map(i => i.model))];
    console.log(`  Distinct models in POS API: ${apiModels.length} (Expected: 10)`);

    // Check for any Mac17 identifiers
    const macIdentifiers = apiMacBookItems.filter(i => /Mac17/i.test(i.device_model || ''));
    console.log(`  Items with legacy Mac17,x identifiers in POS API: ${macIdentifiers.length} (Required: 0) -> ${macIdentifiers.length === 0 ? 'PASS' : 'FAIL'}`);

    // Verify each item has an independent ID
    const uniqueIds = new Set(apiMacBookItems.map(i => i.id));
    console.log(`  Unique item IDs in POS API: ${uniqueIds.size} / 50 -> ${uniqueIds.size === 50 ? 'PASS' : 'FAIL'}`);
  } catch (apiErr) {
    console.error('POS API error:', apiErr.message);
  }

  console.log('\n================================================================');
  console.log('FINAL AUDIT RESULT: ' + (allChecksPass && combinedRows.length === 0 && legacyOk ? 'ALL PASS' : 'FAIL'));
  console.log('================================================================');
}

verifyAll();
