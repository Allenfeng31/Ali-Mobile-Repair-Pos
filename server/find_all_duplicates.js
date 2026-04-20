import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findDuplicates() {
  let allItems = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('inventory')
      .select('id, name, model, device_model, category')
      .range(from, from + step - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allItems = allItems.concat(data);
    if (data.length < step) break;
    from += step;
  }

  console.log(`Total items: ${allItems.length}`);

  const grouped = {};
  allItems.forEach(item => {
    // We normalize the key to find duplicates
    // Using device_model and name (service name)
    const dm = (item.device_model || '').trim().toLowerCase();
    const n = (item.name || '').trim().toLowerCase();
    
    // If device_model is empty, it might be harder to deduplicate, 
    // but the user's requirement specifically mentions au_model_code (device_model)
    if (!dm && !n) return;

    const key = `${dm} | ${n}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const duplicates = Object.entries(grouped).filter(([key, items]) => items.length > 1);
  
  console.log(`Duplicates groups found: ${duplicates.length}`);
  
  let totalRowsToRemove = 0;
  duplicates.forEach(([key, items]) => {
    totalRowsToRemove += (items.length - 1);
    console.log(`Key: "${key}" - Count: ${items.length} - IDs: ${items.map(i => i.id).join(', ')}`);
  });

  console.log(`Total rows to remove: ${totalRowsToRemove}`);
}

findDuplicates().catch(console.error);
