import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function finalInspect() {
  const { data, error } = await supabase.from('inventory').select('model');
  if (error) throw error;

  const brands = new Set();
  data.forEach(item => {
    if (item.model) {
      const parts = item.model.split(/\|\||\|/);
      if (parts.length >= 1) {
        brands.add(parts[0]);
      }
    }
  });

  console.log("ALL UNIQUE BRAND STRINGS (JSON encoded to see spaces/case):");
  Array.from(brands).sort().forEach(b => {
    console.log(JSON.stringify(b));
  });
}

finalInspect().catch(console.error);
