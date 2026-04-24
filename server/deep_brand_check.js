import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function displayBrand(brand) {
  if (/^[PTCWptcw] .+/.test(brand)) return brand.slice(2).trim();
  return brand;
}

function detectDeviceType(brand) {
  const first = brand.trim().charAt(0).toUpperCase();
  if (first === "T") return "tablet";
  if (first === "C") return "computer";
  if (first === "W") return "watch";
  return "phone";
}

function parseItem(raw) {
  const cat = (raw.category || "").toLowerCase();
  if (cat.includes("accessor") || cat === "other") return null;

  let brand = "";
  let modelName = "";
  if (typeof raw.model === "string") {
    let parts = raw.model.split(/\|\||\|/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
       brand = parts[0];
       modelName = parts.slice(1).join(" ");
    } else if (parts.length === 1) {
       brand = parts[0];
    }
  }

  if (!brand || brand.toLowerCase() === "other") return null;

  return {
    brand,
    deviceModel: modelName || "Other Model",
    display: displayBrand(brand),
    type: detectDeviceType(brand)
  };
}

async function deepBrandCheck() {
  const { data, error } = await supabase.from('inventory').select('*');
  if (error) throw error;

  const parsed = data.map(parseItem).filter(Boolean);
  const brandStats = new Map();

  parsed.forEach(p => {
    if (!brandStats.has(p.brand)) {
        brandStats.set(p.brand, new Set());
    }
    brandStats.get(p.brand).add(p.display);
  });

  console.log("Parsed Brand Mapping:");
  for (const [raw, displays] of brandStats.entries()) {
    console.log(`Raw: ${JSON.stringify(raw)} -> Displays: ${Array.from(displays).map(d => JSON.stringify(d)).join(', ')}`);
  }

  // Find duplicates in the final UI list
  const allDisplays = parsed.map(p => ({ raw: p.brand, display: p.display, type: p.type }));
  const uniqueByRaw = Array.from(new Set(allDisplays.map(d => d.raw))).map(raw => {
    const match = allDisplays.find(d => d.raw === raw);
    return { raw, display: match.display, type: match.type };
  });

  console.log("\nWhat the UI sees for type='phone':");
  const phoneBrands = uniqueByRaw.filter(b => b.type === 'phone');
  phoneBrands.forEach(b => {
    console.log(`- Display: "${b.display}" (Raw: "${b.raw}")`);
  });
}

deepBrandCheck().catch(console.error);
