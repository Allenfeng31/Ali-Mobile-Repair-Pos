require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const appleUpdates = [
  { name: "iPhone 17 Pro Max", code: "A3526" },
  { name: "iPhone 17 Pro", code: "A3523" },
  { name: "iPhone 17 Air", code: "A3517" },
  { name: "iPhone 17", code: "A3520" },
  { name: "iPhone 17e", code: "A3634" },
  { name: "iPhone 16e", code: "A3409" },
  { name: "iPhone SE 3", code: "A2783" },
  { name: "iPhone SE 2", code: "A2296" },
  { name: "iPhone SE", code: "A1662" }
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

(async () => {
  console.log('--- Force Updating Apple Model Codes ---');
  let totalUpdated = 0;
  let totalInserted = 0;

  for (const item of appleUpdates) {
    const rawModelStr = `Apple||${item.name}`;
    
    // First, try to update existing records
    // `model` field uniquely identifies the phone (e.g. "Apple||iPhone 17 Pro")
    const { data: updated, error: updateErr } = await supabase
      .from('inventory')
      .update({ device_model: item.code })
      .eq('model', rawModelStr)
      .select();

    if (updateErr) {
      console.error(`❌ Failed to update ${item.name}:`, updateErr);
      continue;
    }

    if (updated && updated.length > 0) {
      console.log(`✅ Updated ${updated.length} entries for ${item.name} with code ${item.code}`);
      totalUpdated += updated.length;
    }

    // Now, let's verify all 7 categories exist. If any are missing, INSERT them.
    const { data: existingRecords } = await supabase
      .from('inventory')
      .select('category')
      .eq('model', rawModelStr);
      
    const existingCategories = new Set((existingRecords || []).map(r => r.category));
    
    const toInsert = [];
    for (const cat of categories) {
      if (!existingCategories.has(cat)) {
        toInsert.push({
          name: `${item.name} ${cat}`,
          model: rawModelStr,
          device_model: item.code,
          sku: `AP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          stock: 0,
          minStock: 0,
          costPrice: 0,
          price: 0,
          margin: 0,
          iconName: cat.includes('Battery') ? 'Battery' : 
                   cat.includes('Charging') ? 'Zap' : 
                   cat.includes('Logic') ? 'Wrench' : 'Smartphone',
          status: "in-stock",
          category: cat
        });
      }
    }

    if (toInsert.length > 0) {
      const { data: inserted, error: insertErr } = await supabase
        .from('inventory')
        .insert(toInsert)
        .select();

      if (insertErr) {
        console.error(`❌ Failed to insert missing categories for ${item.name}:`, insertErr);
      } else {
        console.log(`🆕 Inserted ${inserted.length} missing service categories for ${item.name}`);
        totalInserted += inserted.length;
      }
    } else if (updated.length === 0) {
      console.log(`ℹ️ ${item.name} is fully seeded with ${existingCategories.size} categories already.`);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Total Rows Updated with Code: ${totalUpdated}`);
  console.log(`Total Missing Services Inserted: ${totalInserted}`);
})();
