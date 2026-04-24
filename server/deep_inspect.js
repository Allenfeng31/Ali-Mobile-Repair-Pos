import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deepInspect() {
  const { data, error } = await supabase.from('inventory').select('model');
  if (error) throw error;

  const rawBrands = new Map();
  data.forEach(item => {
    if (item.model) {
      const parts = item.model.split(/\|\||\|/);
      if (parts.length >= 1) {
        const brand = parts[0];
        const display = brand.replace(/^[PTCWptcw] /, '').trim();
        if (!rawBrands.has(brand)) {
          rawBrands.set(brand, { count: 0, display });
        }
        rawBrands.get(brand).count++;
      }
    }
  });

  console.log("Raw Brands in DB:");
  const sorted = Array.from(rawBrands.entries()).sort((a,b) => a[0].localeCompare(b[0]));
  sorted.forEach(([raw, info]) => {
    console.log(`- "${raw}" (Display: "${info.display}") - Count: ${info.count}`);
  });

  console.log("\nPotential Duplicates (Different Raw, Same Display):");
  const displayMap = new Map();
  for (const [raw, info] of rawBrands.entries()) {
    if (!displayMap.has(info.display)) displayMap.set(info.display, []);
    displayMap.get(info.display).push(raw);
  }

  for (const [display, raws] of displayMap.entries()) {
    if (raws.length > 1) {
      console.log(`- Display "${display}" has multiple raws: ${raws.map(r => `"${r}"`).join(', ')}`);
    }
  }
}

deepInspect().catch(console.error);
