import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function normalizeBrands() {
  console.log("--- Brand Normalization Script Start ---");
  
  let allItems = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('inventory')
      .select('id, model, category, name')
      .range(from, from + step - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allItems = allItems.concat(data);
    if (data.length < step) break;
    from += step;
  }

  console.log(`Fetched ${allItems.length} items.`);

  const updates = [];
  const brandMap = new Map();

  allItems.forEach(item => {
    if (!item.model) return;

    let parts = item.model.split(/\|\||\|/).map(p => p.trim());
    if (parts.length === 0) return;

    let rawBrand = parts[0];
    let modelName = parts.slice(1).join(" ");

    // Determine prefix based on category if missing
    let prefix = "";
    if (/^[PTCWptcw] /.test(rawBrand)) {
      prefix = rawBrand.charAt(0).toUpperCase();
      rawBrand = rawBrand.slice(2).trim();
    } else {
      // Legacy - determine by category
      const cat = (item.category || "").toLowerCase();
      if (cat.includes("tablet") || cat.includes("ipad")) prefix = "T";
      else if (cat.includes("computer") || cat.includes("mac") || cat.includes("laptop")) prefix = "C";
      else if (cat.includes("watch")) prefix = "W";
      else prefix = "P";
    }

    const normalizedBrand = `${prefix} ${rawBrand}`;
    const normalizedModel = modelName ? `${normalizedBrand}||${modelName}` : normalizedBrand;

    if (item.model !== normalizedModel) {
      updates.push({ id: item.id, model: normalizedModel, name: item.name });
      console.log(`- ID ${item.id}: "${item.model}" -> "${normalizedModel}"`);
    }
  });

  console.log(`\nFound ${updates.length} items to normalize.`);

  if (updates.length > 0) {
    console.log(`\nPerforming updates for ${updates.length} items...`);
    const batchSize = 20;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      await Promise.all(batch.map(item => 
        supabase.from('inventory')
          .update({ model: item.model })
          .eq('id', item.id)
          .then(({ error }) => {
            if (error) console.error(`Error updating ID ${item.id}:`, error.message);
          })
      ));
      console.log(`Progress: ${Math.min(i + batchSize, updates.length)}/${updates.length}`);
    }
    console.log("Normalization complete.");
  } else {
    console.log("All brands are already normalized.");
  }
}

normalizeBrands().catch(console.error);
