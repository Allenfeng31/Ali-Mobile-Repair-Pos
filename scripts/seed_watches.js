
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const models = [
  { name: 'Series 3', sizes: ['38mm', '42mm'] },
  { name: 'Series 4', sizes: ['40mm', '44mm'] },
  { name: 'Series 5', sizes: ['40mm', '44mm'] },
  { name: 'Series 6', sizes: ['40mm', '44mm'] },
  { name: 'SE (1st Gen)', sizes: ['40mm', '44mm'] },
  { name: 'Series 7', sizes: ['41mm', '45mm'] },
  { name: 'Series 8', sizes: ['41mm', '45mm'] },
  { name: 'Ultra', sizes: ['49mm'] },
  { name: 'SE (2nd Gen)', sizes: ['40mm', '44mm'] },
  { name: 'Series 9', sizes: ['41mm', '45mm'] },
  { name: 'Ultra 2', sizes: ['49mm'] },
  { name: 'Series 10', sizes: ['42mm', '46mm'] },
];

const repairTypes = [
  { name: 'Screen Repair', icon: 'Watch' },
  { name: 'Battery Replacement', icon: 'Battery' },
];

async function seed() {
  console.log('🚀 Seeding Apple Watch repair items...');

  const items = [];

  for (const model of models) {
    for (const size of model.sizes) {
      const fullModelName = `Apple Watch ${model.name} (${size})`;
      for (const repair of repairTypes) {
        items.push({
          name: `${fullModelName} ${repair.name}`,
          model: `W Apple Watch||${fullModelName}`,
          sku: `W-AW-${model.name.replace(/\s+/g, '-')}-${size}-${repair.name.charAt(0)}`.toUpperCase(),
          stock: 0,
          minStock: 2,
          costPrice: 0,
          price: 0,
          margin: 0,
          iconName: repair.icon,
          status: 'In Stock',
          category: 'Watch Repair'
        });
      }
    }
  }

  console.log(`📦 Inserting ${items.length} items...`);

  const { data, error } = await supabase
    .from('inventory')
    .insert(items)
    .select();

  if (error) {
    console.error('❌ Error inserting items:', error.message);
  } else {
    console.log(`✅ Successfully inserted ${data.length} items.`);
  }
}

seed();
