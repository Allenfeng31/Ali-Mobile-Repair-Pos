import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function mergeSamsung() {
  console.log("🚀 Starting Samsung Brand Consolidation...");

  // 1. Direct SQL-like update for the 'brand' column (if it exists)
  // ILIKE %samsung% catches "Samsung", "Samsung ", "samsung", etc.
  const { data: updateData, error: updateError } = await supabase
    .from('inventory')
    .update({ brand: 'Samsung' })
    .ilike('brand', '%samsung%');

  if (updateError) {
    if (updateError.message.includes('column "brand" does not exist')) {
      console.log("ℹ️ Column 'brand' does not exist, skipping direct brand update.");
    } else {
      console.error("❌ Error updating brand column:", updateError.message);
    }
  } else {
    console.log("✅ Updated 'brand' column for Samsung items.");
  }

  // 2. Normalize prefixes in the 'model' column (e.g., "samsung ||..." -> "Samsung ||...")
  // This is crucial because parseItem uses the model column.
  console.log("📦 Fetching items to normalize model prefixes...");
  
  let allItems = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase.from('inventory').select('id, model').range(from, from + step - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allItems = allItems.concat(data);
    if (data.length < step) break;
    from += step;
  }

  const toUpdate = [];
  for (const item of allItems) {
    if (item.model && item.model.toLowerCase().includes('samsung')) {
      const parts = item.model.split('||');
      if (parts.length >= 2) {
        const rawBrand = parts[0];
        const rest = parts.slice(1).join('||');
        if (rawBrand.toLowerCase().trim() === 'samsung' && rawBrand !== 'Samsung') {
          toUpdate.push({ id: item.id, model: `Samsung ||${rest}` });
        }
      }
    }
  }

  console.log(`🔄 Found ${toUpdate.length} items needing model prefix normalization.`);

  if (toUpdate.length > 0) {
    for (const item of toUpdate) {
      const { error } = await supabase.from('inventory').update({ model: item.model }).eq('id', item.id);
      if (error) {
        console.error(`❌ Failed to update ID ${item.id}:`, error.message);
      }
    }
    console.log("✅ Successfully normalized model prefixes.");
  }

  console.log("🏁 Consolidation complete.");
}

mergeSamsung().catch(console.error);
