import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deduplicate() {
  console.log('🚀 Starting Inventory Deduplication...');

  // 1. Fetch all inventory
  let allItems = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('inventory')
      .select('id, name, model, device_model, sku, category')
      .range(from, from + step - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allItems = allItems.concat(data);
    if (data.length < step) break;
    from += step;
  }

  console.log(`📦 Fetched ${allItems.length} records.`);

  // 2. Group by (device_model, name)
  const grouped = {};
  allItems.forEach(item => {
    const dm = (item.device_model || '').trim().toLowerCase();
    const n = (item.name || '').trim().toLowerCase();
    if (!dm && !n) return;
    const key = `${dm} | ${n}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const duplicateGroups = Object.entries(grouped).filter(([key, items]) => items.length > 1);
  console.log(`🔍 Found ${duplicateGroups.length} groups of duplicates.`);

  let totalDeleted = 0;
  let totalUpdatedOrders = 0;

  for (const [key, items] of duplicateGroups) {
    // Sort by ID to find the "earliest" record
    items.sort((a, b) => a.id - b.id);
    const [main, ...duplicates] = items;

    console.log(`\nProcessing: "${key}"`);
    console.log(`  Keeping ID: ${main.id} (SKU: ${main.sku})`);

    for (const dup of duplicates) {
      console.log(`  Removing ID: ${dup.id} (SKU: ${dup.sku})`);

      // Update order_items that use the duplicate SKU
      const { data: updatedOrders, error: updateError } = await supabase
        .from('order_items')
        .update({ sku: main.sku })
        .eq('sku', dup.sku)
        .select();

      if (updateError) {
        console.error(`  ❌ Failed to update order_items for SKU ${dup.sku}:`, updateError.message);
        continue;
      }

      if (updatedOrders && updatedOrders.length > 0) {
        console.log(`  ✅ Updated ${updatedOrders.length} order_items from SKU ${dup.sku} to ${main.sku}`);
        totalUpdatedOrders += updatedOrders.length;
      }

      // Delete the duplicate inventory record
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', dup.id);

      if (deleteError) {
        console.error(`  ❌ Failed to delete inventory record ${dup.id}:`, deleteError.message);
      } else {
        totalDeleted++;
      }
    }
  }

  console.log('\n--- Summary ---');
  console.log(`✅ Total inventory records deleted: ${totalDeleted}`);
  console.log(`✅ Total order_items updated: ${totalUpdatedOrders}`);
  console.log('Done!');
}

deduplicate().catch(err => {
  console.error('❌ Fatal Error:', err);
});
