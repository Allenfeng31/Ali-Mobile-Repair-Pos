import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function normalizeSamsung() {
  console.log("🚀 Normalizing Samsung prefixes...");

  let allItems = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase.from('inventory').select('id, model, category').range(from, from + step - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allItems = allItems.concat(data);
    if (data.length < step) break;
    from += step;
  }

  const toUpdate = [];
  for (const item of allItems) {
    if (item.model && item.model.toLowerCase().includes('samsung')) {
      const parts = item.model.split(/\|\||\|/);
      if (parts.length >= 2) {
        let prefix = parts[0].trim();
        const rest = parts.slice(1).join('||');
        
        // Determine correct prefix based on category
        let correctPrefix = 'P Samsung';
        if (item.category?.toLowerCase() === 'tablet') correctPrefix = 'T Samsung';
        else if (item.category?.toLowerCase() === 'watch') correctPrefix = 'W Samsung';
        else if (item.category?.toLowerCase() === 'computer') correctPrefix = 'C Samsung';

        if (prefix !== correctPrefix) {
          toUpdate.push({ id: item.id, model: `${correctPrefix}||${rest}` });
        }
      }
    }
  }

  console.log(`🔄 Found ${toUpdate.length} Samsung items with incorrect prefixes.`);

  if (toUpdate.length > 0) {
    for (const item of toUpdate) {
      console.log(`Updating ID ${item.id}: ${item.model}`);
      const { error } = await supabase.from('inventory').update({ model: item.model }).eq('id', item.id);
      if (error) console.error(`❌ Error updating ID ${item.id}:`, error.message);
    }
    console.log("✅ Normalization complete.");
  } else {
    console.log("ℹ️ No items needed normalization.");
  }
}

normalizeSamsung().catch(console.error);
