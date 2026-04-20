import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data, error } = await supabase
    .from('inventory')
    .select('id, name, model, device_model, category')
    .limit(100);

  if (error) {
    console.error(error);
    return;
  }

  // Group by model and name to find duplicates
  const grouped = {};
  data.forEach(item => {
    const key = `${item.model} | ${item.name}`.toLowerCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const duplicates = Object.entries(grouped).filter(([key, items]) => items.length > 1);
  console.log('Duplicates found:', duplicates.length);
  if (duplicates.length > 0) {
    console.log(JSON.stringify(duplicates.slice(0, 5), null, 2));
  } else {
    // If no duplicates by model+name, maybe search by model only?
    console.log('No model+name duplicates in first 100. Sample data:');
    console.log(JSON.stringify(data.slice(0, 10), null, 2));
  }
}

inspect();
