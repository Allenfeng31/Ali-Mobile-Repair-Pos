import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DRY_RUN = process.env.DRY_RUN !== 'false'; // Default to dry run

async function deduplicate() {
  console.log(`🚀 Starting deduplication (DRY_RUN=${DRY_RUN})...`);

  // 1. Fetch all items
  let allItems = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase.from('inventory').select('id, model, name, device_model').range(from, from + step - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allItems = allItems.concat(data);
    if (data.length < step) break;
    from += step;
  }
  console.log(`📦 Fetched ${allItems.length} total items.`);

  const appleRecords = allItems.filter(i => i.model && i.model.startsWith('Apple||'));
  const targetRecords = allItems.filter(i => i.model && (
    i.model.startsWith('P iPhone||') || 
    i.model.startsWith('T iPad||') || 
    i.model.startsWith('W Apple Watch||') || 
    i.model.startsWith('C MacBook||')
  ));

  console.log(`🍎 Found ${appleRecords.length} Apple|| records.`);
  console.log(`🎯 Found ${targetRecords.length} potential target records.`);

  const toDelete = [];
  const toUpdate = [];

  for (const appleItem of appleRecords) {
    const appleModelPart = appleItem.model.split('||')[1];
    const serviceName = appleItem.name;
    
    // Determine target prefix
    let targetPrefix = 'P iPhone||';
    if (appleModelPart.includes('iPad')) targetPrefix = 'T iPad||';
    else if (appleModelPart.includes('Watch')) targetPrefix = 'W Apple Watch||';
    else if (appleModelPart.includes('MacBook')) targetPrefix = 'C MacBook||';

    // Find duplicates in targets
    // We normalize comparison: remove spaces and model codes in parentheses
    const normalize = (str) => str.toLowerCase().replace(/\s+/g, '').replace(/\(.*\)/g, '');
    const appleModelNorm = normalize(appleModelPart);
    const serviceNorm = normalize(serviceName);

    const duplicate = targetRecords.find(t => {
      const tModelPart = t.model.split('||')[1];
      return normalize(tModelPart).includes(appleModelNorm) && normalize(t.name) === serviceNorm;
    });

    if (duplicate) {
      toDelete.push(appleItem.id);
      console.log(`[-] Duplicate found for "${appleItem.name}" (${appleItem.model}) -> Keep ID ${duplicate.id}, Delete ID ${appleItem.id}`);
    } else {
      const newModel = targetPrefix + appleModelPart;
      toUpdate.push({ id: appleItem.id, model: newModel });
      console.log(`[~] Unique item found: "${appleItem.name}" (${appleItem.model}) -> Migrate to ${newModel}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`- To Delete (duplicates): ${toDelete.length}`);
  console.log(`- To Update (migrations): ${toUpdate.length}`);

  if (!DRY_RUN) {
    if (toDelete.length > 0) {
      console.log(`\n🗑️ Deleting ${toDelete.length} duplicates...`);
      // Delete in chunks to avoid URL length issues or single request limits
      for (let i = 0; i < toDelete.length; i += 100) {
        const chunk = toDelete.slice(i, i + 100);
        const { error } = await supabase.from('inventory').delete().in('id', chunk);
        if (error) console.error(`Error deleting chunk ${i}:`, error.message);
      }
    }

    if (toUpdate.length > 0) {
      console.log(`\n🔄 Updating ${toUpdate.length} unique items...`);
      for (const item of toUpdate) {
        const { error } = await supabase.from('inventory').update({ model: item.model }).eq('id', item.id);
        if (error) console.error(`Error updating ID ${item.id}:`, error.message);
      }
    }
    console.log(`\n✅ Done!`);
  } else {
    console.log(`\nℹ️ Dry run complete. No changes made. Set DRY_RUN=false to execute.`);
  }
}

deduplicate().catch(console.error);
