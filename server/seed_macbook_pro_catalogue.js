/**
 * Seed & Synchronize MacBook Pro Inventory Catalogue for POS
 *
 * Requirements:
 * 1. Ensure exactly 5 approved repair types exist for each model:
 *    - Screen Replacement
 *    - Battery Replacement
 *    - Charging Port Replacement
 *    - Water Damage Cleaning / Assessment
 *    - Motherboard & Logic Board Repair
 * 2. Models:
 *    - MacBook Pro 14" M4 (2024) [A3112 / Mac16,1]
 *    - MacBook Pro 14"/16" M4 Pro/Max (2024) [A3185, A3186 / Mac16,6, Mac16,8, Mac16,7, Mac16,5]
 *    - MacBook Pro 14" M5 (2025) [Mac17,2]
 *    - MacBook Pro 14"/16" M5 Pro/Max (2026) [Mac17,6, Mac17,7, Mac17,8, Mac17,9]
 *    - MacBook Pro 14"/16" M3 Pro/Max (2023) [A2992, A2991] -> year corrected from (2024) to (2023)
 * 3. All unpriced items must have price: 0 (Quote on Request).
 * 4. Existing prices on M3 Pro/Max rows must be preserved.
 * 5. Idempotent: safe to run multiple times.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const APPROVED_SERVICES = [
  { label: 'Screen Replacement', iconName: 'Smartphone' },
  { label: 'Battery Replacement', iconName: 'Battery' },
  { label: 'Charging Port Replacement', iconName: 'Zap' },
  { label: 'Water Damage Cleaning / Assessment', iconName: 'Wrench' },
  { label: 'Motherboard & Logic Board Repair', iconName: 'Cpu' },
];

const NEW_MODELS = [
  {
    modelName: 'MacBook Pro 14" M4 (2024)',
    deviceModel: 'A3112',
  },
  {
    modelName: 'MacBook Pro 14"/16" M4 Pro/Max (2024)',
    deviceModel: 'A3185, A3186',
  },
  {
    modelName: 'MacBook Pro 14" M5 (2025)',
    deviceModel: 'Mac17,2',
  },
  {
    modelName: 'MacBook Pro 14"/16" M5 Pro/Max (2026)',
    deviceModel: 'Mac17,6, Mac17,7, Mac17,8, Mac17,9',
  },
];

async function runSeed({ isDryRun = true } = {}) {
  const host = new URL(supabaseUrl).host;
  console.log(`\n========================================================`);
  console.log(`MacBook Pro POS Inventory Catalogue Synchronization`);
  console.log(`Target Supabase Host: ${host}`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (No writes)' : 'APPLY (Executing writes)'}`);
  console.log(`========================================================\n`);

  // 1. Fetch all existing MacBook Pro rows
  const { data: existingRows, error: fetchErr } = await supabase
    .from('inventory')
    .select('id, name, model, device_model, category, price, status, iconName, quality_grade')
    .ilike('model', '%MacBook Pro%')
    .order('id', { ascending: true });

  if (fetchErr) {
    console.error('❌ Failed to fetch existing MacBook Pro inventory rows:', fetchErr);
    process.exit(1);
  }

  console.log(`Found ${existingRows.length} existing MacBook Pro rows in POS inventory.\n`);

  // 2. Plan M3 Pro/Max year correction (2024) -> (2023)
  const m3RowsToCorrect = existingRows.filter(
    (r) => r.name.includes('M3 Pro/Max (2024)') || r.model.includes('M3 Pro/Max (2024)')
  );

  console.log(`[M3 Pro/Max Year Correction]`);
  console.log(`Found ${m3RowsToCorrect.length} row(s) requiring (2024) -> (2023) correction:`);
  for (const r of m3RowsToCorrect) {
    const updatedName = r.name.replace('(2024)', '(2023)');
    const updatedModel = r.model.replace('(2024)', '(2023)');
    console.log(`  Row ${r.id}: "${r.name}" ($${r.price}) -> "${updatedName}"`);
  }

  // 3. Plan missing service rows for M3 Pro/Max (ensure all 5 services exist)
  const m3ModelName = 'MacBook Pro 14"/16" M3 Pro/Max (2023)';
  const m3ServicesPresent = new Set();
  for (const r of existingRows) {
    if (r.name.includes('M3 Pro/Max')) {
      for (const s of APPROVED_SERVICES) {
        if (r.name.includes(s.label) || (s.label.includes('Logic Board') && r.name.includes('Logic Board Repair'))) {
          m3ServicesPresent.add(s.label);
        }
      }
    }
  }

  const m3MissingServices = APPROVED_SERVICES.filter((s) => !m3ServicesPresent.has(s.label));
  console.log(`\n[M3 Pro/Max Missing Services]: ${m3MissingServices.map((s) => s.label).join(', ') || 'None (all 5 present)'}`);

  // 4. Plan rows for the 4 newly added MacBook Pro models
  const rowsToInsert = [];

  // M3 missing rows
  for (const service of m3MissingServices) {
    rowsToInsert.push({
      name: `${m3ModelName} ${service.label}`,
      model: `C MacBook||${m3ModelName}`,
      device_model: 'A2992, A2991',
      sku: `MB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      stock: 0,
      minStock: 0,
      costPrice: 0,
      price: 0,
      margin: 0,
      iconName: service.iconName,
      status: 'In Stock',
      category: service.label,
      quality_grade: 'Standard',
      is_recommended: false,
      is_pinned: false,
      pin_order: 0,
    });
  }

  // 4 new models
  for (const modelDef of NEW_MODELS) {
    console.log(`\n[Planning Model]: ${modelDef.modelName} (Device Code: ${modelDef.deviceModel})`);
    for (const service of APPROVED_SERVICES) {
      const expectedName = `${modelDef.modelName} ${service.label}`;
      const alreadyExists = existingRows.some(
        (r) => r.name.toLowerCase().trim() === expectedName.toLowerCase().trim()
      );

      if (alreadyExists) {
        console.log(`  ✓ [EXISTS] ${service.label}`);
      } else {
        console.log(`  + [TO INSERT] ${service.label} (Price: Quote on Request / $0)`);
        rowsToInsert.push({
          name: expectedName,
          model: `C MacBook||${modelDef.modelName}`,
          device_model: modelDef.deviceModel,
          sku: `MB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          stock: 0,
          minStock: 0,
          costPrice: 0,
          price: 0,
          margin: 0,
          iconName: service.iconName,
          status: 'In Stock',
          category: service.label,
          quality_grade: 'Standard',
          is_recommended: false,
          is_pinned: false,
          pin_order: 0,
        });
      }
    }
  }

  console.log(`\n--------------------------------------------------------`);
  console.log(`Summary of Actions:`);
  console.log(`  - M3 Pro/Max Rows to Update: ${m3RowsToCorrect.length}`);
  console.log(`  - Total Rows to Insert: ${rowsToInsert.length}`);
  console.log(`--------------------------------------------------------\n`);

  if (isDryRun) {
    console.log('✅ DRY-RUN COMPLETED. No database records were modified.');
    console.log('To apply changes, run with --apply');
    return { m3RowsToCorrect, rowsToInsert };
  }

  // 5. Execute Updates
  if (m3RowsToCorrect.length > 0) {
    console.log(`Executing M3 Pro/Max year corrections...`);
    for (const r of m3RowsToCorrect) {
      const updatedName = r.name.replace('(2024)', '(2023)');
      const updatedModel = r.model.replace('(2024)', '(2023)');
      const { error: updateErr } = await supabase
        .from('inventory')
        .update({ name: updatedName, model: updatedModel })
        .eq('id', r.id);

      if (updateErr) {
        console.error(`❌ Failed to update row ${r.id}:`, updateErr);
        process.exit(1);
      }
      console.log(`  ✓ Updated row ${r.id} -> "${updatedName}"`);
    }
  }

  // 6. Execute Inserts
  if (rowsToInsert.length > 0) {
    console.log(`\nInserting ${rowsToInsert.length} new inventory repair rows...`);
    const { data: inserted, error: insertErr } = await supabase
      .from('inventory')
      .insert(rowsToInsert)
      .select('id, name, model, device_model, category, price');

    if (insertErr) {
      console.error(`❌ Failed to insert rows:`, insertErr);
      process.exit(1);
    }
    console.log(`✅ Successfully inserted ${inserted.length} rows.`);
  }

  return { success: true };
}

if (require.main === module) {
  const isApply = process.argv.includes('--apply');
  runSeed({ isDryRun: !isApply }).catch((err) => {
    console.error('Fatal error during seed execution:', err);
    process.exit(1);
  });
}

module.exports = { runSeed, APPROVED_SERVICES, NEW_MODELS };
