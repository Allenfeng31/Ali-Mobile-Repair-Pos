require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const brandsData = [
  {
    brand: "Apple",
    models: [
      { name: "iPhone 17 Pro Max", code: "A3526" },
      { name: "iPhone 17 Pro", code: "A3523" },
      { name: "iPhone 17 Air", code: "A3517" },
      { name: "iPhone 17", code: "A3520" },
      { name: "iPhone 17e", code: "A3634" },
      { name: "iPhone 16e", code: "A3409" },
      { name: "iPhone SE 3", code: "A2783" },
      { name: "iPhone SE 2", code: "A2296" },
      { name: "iPhone SE", code: "A1662" }
    ]
  },
  {
    brand: "Samsung",
    models: [
      { name: "Galaxy S26 Ultra", code: "SM-S948B" },
      { name: "Galaxy S26+", code: "SM-S946B" },
      { name: "Galaxy S26", code: "SM-S941B" },
      { name: "Galaxy Z Fold 7", code: "SM-F966B" },
      { name: "Galaxy Z Flip 7", code: "SM-F751B" },
      { name: "Galaxy A17", code: "SM-A176B" },
      { name: "Galaxy A16", code: "SM-A166B" },
      { name: "Galaxy A15", code: "SM-A156E" },
      { name: "Galaxy A14", code: "SM-A146P" },
      { name: "Galaxy A13", code: "SM-A135F" },
      { name: "Galaxy A12", code: "SM-A125F" },
      { name: "Galaxy A11", code: "SM-A115F" }
    ]
  }
];

const categories = [
  "Screen Replacement",
  "Battery Replacement",
  "Logic Board Repair",
  "Charging Port Replacement",
  "Back Housing Replacement",
  "Front Camera Replacement",
  "Back Camera Replacement"
];

const items = [];

for (const brandObj of brandsData) {
  const brand = brandObj.brand;
  for (const model of brandObj.models) {
    for (const cat of categories) {
      const generatedName = `${model.name} ${cat}`;
      items.push({
        name: generatedName,
        model: `${brand}||${model.name}`,
        device_model: model.code,
        sku: `${brand.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        stock: 0,
        minStock: 0,
        costPrice: 0,
        price: 0,
        margin: 0,
        iconName: "Smartphone",
        status: "in-stock",
        category: cat
      });
    }
  }
}

// Icon mapping based on POS heuristics
items.forEach(i => {
  if (i.category.includes('Battery')) i.iconName = 'Battery';
  else if (i.category.includes('Charging')) i.iconName = 'Zap';
  else if (i.category.includes('Logic')) i.iconName = 'Wrench';
  else i.iconName = 'Smartphone';
});

(async () => {
  console.log('--- Phase 4 Database Seeding Script Start ---');
  console.log('Connecting to Supabase...');
  
  // Fetch existing items to avoid duplicates
  const { data: existing, error: fetchErr } = await supabase.from('inventory').select('name');
  if (fetchErr) {
    console.error('Failed to fetch existing items:', fetchErr);
    process.exit(1);
  }
  
  const existingNames = new Set(existing.map(i => i.name.toLowerCase().trim()));

  const skipped = [];
  const toInsert = [];

  items.forEach(i => {
    if (existingNames.has(i.name.toLowerCase().trim())) {
      skipped.push(i);
    } else {
      toInsert.push(i);
    }
  });

  console.log(`\nFound ${skipped.length} existing items. Skipping these...`);
  if (skipped.length > 0) {
    console.log(`Sample Skipped:\n`, skipped.map(s => ` - [SKIPPED] ${s.name}`).slice(0, 5).join('\n'));
    if (skipped.length > 5) console.log(`   ...and ${skipped.length - 5} more skipped.`);
  }

  console.log(`\nNew Items to Insert: ${toInsert.length}`);
  
  if (toInsert.length === 0) {
    console.log('\n✅ Database already has these items seeded! Exiting safely.');
    return;
  }

  // Print all new inserts
  console.log(`\nInserting following services...`);
  toInsert.forEach(i => console.log(` + [INSERTED] ${i.name} (Device Code: ${i.device_model})`));

  // Chunking and inserting
  const chunkSize = 200;
  let successCount = 0;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from('inventory').insert(chunk);
    if (error) {
      console.error('\n❌ Insert error on chunk:', error);
    } else {
      successCount += chunk.length;
    }
  }
  
  console.log(`\n✅ Successfully inserted ${successCount} items into the database.`);
})();
