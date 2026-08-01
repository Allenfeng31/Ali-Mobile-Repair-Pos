require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Only run if credentials exist
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Skipping seed_moto_g24.js - no Supabase credentials found.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const modelName = "Moto G24";
const brand = "Motorola";
const deviceCode = "XT2423-2";

const categories = [
  "Screen Replacement",
  "Battery Replacement",
  "Logic Board Repair",
  "Charging Port Replacement",
  "Back Housing Replacement",
  "Front Camera Replacement",
  "Back Camera Replacement"
];

const prices = {
  "Screen Replacement": 139,
  "Battery Replacement": 75
};

const items = categories.map(cat => {
  let iconName = 'Smartphone';
  if (cat.includes('Battery')) iconName = 'Battery';
  else if (cat.includes('Charging')) iconName = 'Zap';
  else if (cat.includes('Logic')) iconName = 'Wrench';

  return {
    name: `${modelName} ${cat}`,
    model: `P ${brand}||${modelName}`,
    device_model: deviceCode,
    sku: `${brand.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    stock: 0,
    minStock: 0,
    costPrice: 0,
    price: prices[cat] !== undefined ? prices[cat] : 0,
    margin: 0,
    iconName: iconName,
    status: "in-stock",
    category: cat
  };
});

// Export for testing
module.exports = {
  items,
  seedMotoG24: async (isDryRun = false) => {
    const projectUrl = process.env.VITE_SUPABASE_URL;
    const host = projectUrl ? new URL(projectUrl).host : 'unknown host';

    // 1. Log Supabase project/host
    console.log(`[Target]: ${host}`);

    const { data: existing, error: fetchErr } = await supabase
      .from('inventory')
      .select('name')
      .eq('model', `P ${brand}||${modelName}`);

    if (fetchErr) {
      console.error('Failed to fetch existing items:', fetchErr.message || fetchErr);
      process.exit(1);
    }

    const existingNames = new Set(existing.map(i => i.name.toLowerCase().trim()));
    const toInsert = items.filter(i => !existingNames.has(i.name.toLowerCase().trim()));
    const toSkip = items.filter(i => existingNames.has(i.name.toLowerCase().trim()));

    // 2. Log intended creation numbers
    console.log(`[Total generated]: ${items.length}`);
    console.log(`[Existing found]: ${existing.length}`);
    console.log(`[To skip]: ${toSkip.length}`);
    console.log(`[To insert]: ${toInsert.length}`);

    // 3. Log specifics
    console.log(`[Model Number]: ${deviceCode}`);
    items.forEach(i => {
      console.log(` - [${i.category}]: $${i.price}`);
    });

    if (isDryRun) {
      console.log('--- DRY RUN COMPLETED ---');
      return;
    }

    if (toInsert.length === 0) {
      console.log('Database already has Moto G24 items seeded!');
      return;
    }

    console.log('Connecting to Supabase to insert data...');
    const { error } = await supabase.from('inventory').insert(toInsert);

    if (error) {
      console.error('Insert error:', error.message || error);
      process.exit(1);
    } else {
      console.log(`Successfully inserted ${toInsert.length} items for Moto G24.`);
    }
  }
};

// Run if called directly
if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  module.exports.seedMotoG24(isDryRun).catch(e => {
    console.error('Unhandled execution error:', e);
    process.exit(1);
  });
}
