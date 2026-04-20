const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CORE_SERVICES = [
  { name: "Screen Replacement", category: "Screen Replacement", icon: "Smartphone" },
  { name: "Battery Replacement", category: "Battery Replacement", icon: "Battery" },
  { name: "Charging Port Replacement", category: "Charging Port Replacement", icon: "Zap" },
  { name: "Back Glass/Housing", category: "Back Housing Replacement", icon: "Smartphone" },
  { name: "Front Camera", category: "Front Camera Replacement", icon: "Smartphone" },
  { name: "Back Camera", category: "Back Camera Replacement", icon: "Smartphone" },
  { name: "Logic Board Repair", category: "Logic Board Repair", icon: "Wrench" }
];

async function backfill() {
  console.log("🚀 Starting Core Repair Items Backfill...");

  // 1. Target Models (explicitly mentioned or new)
  const targets = [
    { name: "iPhone 17 Air", code: "A3517", brandPrefix: "P iPhone||" },
    { name: "iPhone 17e", code: "A3634", brandPrefix: "P iPhone||" },
    { name: "iPhone 16e", code: "A3409", brandPrefix: "P iPhone||" },
    { name: "iPhone 17", code: "A3520", brandPrefix: "P iPhone||" },
    { name: "iPhone 17 Pro", code: "A3523", brandPrefix: "P iPhone||" },
    { name: "iPhone 17 Pro Max", code: "A3526", brandPrefix: "P iPhone||" },
    { name: "Galaxy S26 Ultra", code: "SM-S948B", brandPrefix: "P Samsung||" },
    { name: "Galaxy S26+", code: "SM-S946B", brandPrefix: "P Samsung||" },
    { name: "Galaxy S26", code: "SM-S941B", brandPrefix: "P Samsung||" },
    { name: "Galaxy S25 Ultra", code: "SM-S938B", brandPrefix: "P Samsung||" },
    { name: "Galaxy S25+", code: "SM-S936B", brandPrefix: "P Samsung||" },
    { name: "Galaxy S25", code: "SM-S931B", brandPrefix: "P Samsung||" }
  ];

  // 2. Fetch existing inventory for these models
  const modelNames = targets.map(t => `${t.brandPrefix}${t.name}`);
  const { data: existing, error: fetchErr } = await supabase
    .from('inventory')
    .select('*')
    .in('model', modelNames);

  if (fetchErr) {
    console.error("Error fetching inventory:", fetchErr);
    return;
  }

  const toInsert = [];

  for (const target of targets) {
    const fullModel = `${target.brandPrefix}${target.name}`;
    const existingForModel = existing.filter(i => i.model === fullModel);
    
    console.log(`Checking ${target.name}... Found ${existingForModel.length} existing items.`);

    for (const service of CORE_SERVICES) {
      // Check if this service (or similar) already exists for this model
      // We check by category primarily
      const hasService = existingForModel.some(i => 
        i.category.toLowerCase() === service.category.toLowerCase() ||
        i.name.toLowerCase().includes(service.name.toLowerCase())
      );

      if (!hasService) {
        const brand = target.brandPrefix.replace('||', '').slice(2); // "iPhone" or "Samsung"
        toInsert.push({
          name: `${target.name} ${service.name}`,
          model: fullModel,
          device_model: target.code,
          sku: `${brand.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          stock: 0,
          minStock: 0,
          costPrice: 0,
          price: 0,
          margin: 0,
          iconName: service.icon,
          status: "in-stock",
          category: service.category
        });
      }
    }
  }

  if (toInsert.length === 0) {
    console.log("✅ No missing items found for targets.");
    return;
  }

  console.log(`📦 Inserting ${toInsert.length} missing items...`);
  
  const { error: insertErr } = await supabase.from('inventory').insert(toInsert);
  if (insertErr) {
    console.error("Error inserting items:", insertErr);
  } else {
    console.log(`✅ Successfully backfilled ${toInsert.length} items.`);
    toInsert.forEach(i => console.log(`  + Added: ${i.name}`));
  }
}

backfill();
