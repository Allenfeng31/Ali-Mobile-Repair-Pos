const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function dedupeInventory() {
  console.log("🔍 Starting inventory deduplication...");

  // 1. Fetch all inventory items
  const { data: items, error } = await supabase
    .from('inventory')
    .select('id, model, category');

  if (error) {
    console.error("❌ Error fetching inventory:", error.message);
    return;
  }

  console.log(`📦 Loaded ${items.length} items.`);

  const seen = new Map();
  const toDelete = [];

  for (const item of items) {
    const key = `${item.model}|${item.category}`;
    if (seen.has(key)) {
      // Duplicate found. Since we ordered by created_at ascending, 
      // the first one we saw is the oldest. This one is younger.
      toDelete.push(item.id);
    } else {
      seen.set(key, item.id);
    }
  }

  if (toDelete.length === 0) {
    console.log("✅ No duplicates found.");
    return;
  }

  console.log(`🧹 Found ${toDelete.length} duplicates. Deleting...`);

  // Delete in batches of 100 to avoid request limits
  const batchSize = 100;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);
    const { error: delError } = await supabase
      .from('inventory')
      .delete()
      .in('id', batch);

    if (delError) {
      console.error(`❌ Error deleting batch ${i / batchSize}:`, delError.message);
    } else {
      console.log(`✅ Deleted batch ${i / batchSize + 1}/${Math.ceil(toDelete.length / batchSize)}`);
    }
  }

  console.log("✨ Deduplication complete.");
}

dedupeInventory();
