import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function hexInspect() {
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

  console.log("HEX INSPECTION OF BRAND STRINGS:");
  Array.from(brands).sort().forEach(b => {
    if (b.toLowerCase().includes('samsung') || b.toLowerCase().includes('google')) {
      const hex = Buffer.from(b, 'utf8').toString('hex');
      console.log(`${JSON.stringify(b)} -> Hex: ${hex}`);
    }
  });
}

hexInspect().catch(console.error);
