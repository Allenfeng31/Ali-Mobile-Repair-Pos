import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectBrands() {
  const { data, error } = await supabase.from('inventory').select('model');
  if (error) throw error;

  const brands = new Set();
  data.forEach(item => {
    if (item.model) {
      const parts = item.model.split(/\|\||\|/);
      if (parts.length >= 2) {
        brands.add(parts[0]);
      }
    }
  });

  console.log("Unique brand prefixes found:");
  console.log(Array.from(brands));
  
  const samsungVariations = Array.from(brands).filter(b => b.toLowerCase().includes('samsung'));
  console.log("\nSamsung variations:");
  console.log(samsungVariations);
}

inspectBrands().catch(console.error);
