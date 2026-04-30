require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const brand = "Oppo";
const models = [
  "A1k", "A3s", "A5", "A5s", "A7", "A9", "A5 (2020)", "A9 (2020)", "A11", "A12", 
  "A15", "A16", "A16s", "A31", "A32", "A33", "A37", "A39", "A52", "A53", 
  "A53s", "A54", "A54 5G", "A72", "A73", "A74", "A74 5G", "A76", "A77", 
  "A77 5G", "A78 5G", "A79", "A94", "A96", "A98"
];

const services = [
  { label: 'Screen Replacement', icon: 'Smartphone' },
  { label: 'Battery Replacement', icon: 'Battery' },
  { label: 'Charging Port Replacement', icon: 'Zap' },
  { label: 'Back Camera Replacement', icon: 'Camera' },
  { label: 'Front Camera Replacement', icon: 'Camera' },
  { label: 'Back Housing Replacement', icon: 'Layout' },
  { label: 'Logic Board Repair', icon: 'Cpu' }
];

const items = [];

for (const model of models) {
  for (const service of services) {
    const generatedName = `${model} ${service.label}`;
    items.push({
      name: generatedName,
      model: `P ${brand}||${model}`,
      device_model: null,
      sku: `OP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      stock: 0,
      minStock: 0,
      costPrice: 0,
      price: 0,
      margin: 0,
      iconName: service.icon,
      status: "in-stock",
      category: "Phone Repair"
    });
  }
}

(async () => {
  console.log('--- OPPO A-Series Seeding Script Start ---');
  console.log(`Targeting ${items.length} items for ${models.length} models.`);
  
  // 1. Fetch existing items to avoid duplicates
  const { data: existing, error: fetchErr } = await supabase.from('inventory').select('name');
  if (fetchErr) {
    console.error('Failed to fetch existing items:', fetchErr);
    process.exit(1);
  }
  
  const existingNames = new Set(existing.map(i => i.name.toLowerCase().trim()));

  const toInsert = items.filter(i => !existingNames.has(i.name.toLowerCase().trim()));

  console.log(`\nFound ${items.length - toInsert.length} existing items. Skipping...`);
  console.log(`New Items to Insert: ${toInsert.length}`);
  
  if (toInsert.length === 0) {
    console.log('\n✅ Database already has these items seeded! Exiting safely.');
    return;
  }

  // 2. Chunking and inserting (Supabase payload limits)
  const chunkSize = 200;
  let successCount = 0;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from('inventory').insert(chunk);
    if (error) {
      console.error('\n❌ Insert error on chunk:', error);
    } else {
      successCount += chunk.length;
      console.log(`   Inserted ${successCount}/${toInsert.length}...`);
    }
  }
  
  console.log(`\n✅ Successfully inserted ${successCount} items into the database.`);
})();
