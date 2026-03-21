require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const samsungModels = [
  'Galaxy S8', 'Galaxy S8+', 'Galaxy S9', 'Galaxy S9+', 'Galaxy S10', 'Galaxy S10+', 'Galaxy S10e',
  'Galaxy S20', 'Galaxy S20+', 'Galaxy S20 Ultra', 'Galaxy S20 FE',
  'Galaxy S21', 'Galaxy S21+', 'Galaxy S21 Ultra', 'Galaxy S21 FE',
  'Galaxy S22', 'Galaxy S22+', 'Galaxy S22 Ultra',
  'Galaxy S23', 'Galaxy S23+', 'Galaxy S23 Ultra', 'Galaxy S23 FE',
  'Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra', 'Galaxy S24 FE',
  'Galaxy Note 8', 'Galaxy Note 9', 'Galaxy Note 10', 'Galaxy Note 10+', 'Galaxy Note 20', 'Galaxy Note 20 Ultra',
  'Galaxy A20', 'Galaxy A21', 'Galaxy A30', 'Galaxy A31', 'Galaxy A32', 'Galaxy A40', 'Galaxy A50', 'Galaxy A51', 'Galaxy A52', 'Galaxy A53', 'Galaxy A54', 'Galaxy A55', 'Galaxy A70', 'Galaxy A71', 'Galaxy A72', 'Galaxy A73',
  'Galaxy Z Flip', 'Galaxy Z Flip 3', 'Galaxy Z Flip 4', 'Galaxy Z Flip 5', 'Galaxy Z Flip 6',
  'Galaxy Z Fold', 'Galaxy Z Fold 2', 'Galaxy Z Fold 3', 'Galaxy Z Fold 4', 'Galaxy Z Fold 5', 'Galaxy Z Fold 6'
];

const googleModels = [
  'Pixel 3', 'Pixel 3 XL', 'Pixel 3a', 'Pixel 3a XL',
  'Pixel 4', 'Pixel 4 XL', 'Pixel 4a', 'Pixel 4a 5G',
  'Pixel 5', 'Pixel 5a',
  'Pixel 6', 'Pixel 6 Pro', 'Pixel 6a',
  'Pixel 7', 'Pixel 7 Pro', 'Pixel 7a',
  'Pixel 8', 'Pixel 8 Pro', 'Pixel 8a',
  'Pixel 9', 'Pixel 9 Pro', 'Pixel 9 Pro XL', 'Pixel 9 Pro Fold'
];

const oppoModels = [
  'Reno 8', 'Reno 8 Pro',
  'Reno 9', 'Reno 9 Pro',
  'Reno 10', 'Reno 10 Pro', 'Reno 10 Pro+',
  'Reno 11', 'Reno 11 Pro',
  'Reno 12', 'Reno 12 Pro',
  'Find X3 Pro', 'Find X5', 'Find X5 Pro', 'Find X6', 'Find X6 Pro', 'Find X7', 'Find X7 Ultra', 'Find X8', 'Find X8 Pro'
];

const categories = [
  "Screen Repair",
  "Battery Service",
  "Logic Board",
  "Charging Port",
  "Back Housing",
  "Front Camera",
  "Back Camera"
];

const items = [];

function populate(brand, modelsList) {
  for (const model of modelsList) {
    for (const cat of categories) {
      items.push({
        name: `${model} ${cat}`,
        model: `${brand}||${model}`,
        sku: `${brand.substring(0,2).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        stock: 0,
        minStock: 0,
        costPrice: 0,
        price: 0,
        margin: 0,
        iconName: "Smartphone",
        status: "in-stock",
        category: cat
      });
    }
  }
}

populate('Samsung', samsungModels);
populate('Google', googleModels);
populate('Oppo', oppoModels);

// mapping icons precisely
items.forEach(i => {
  if (i.category.includes('Battery')) i.iconName = 'Battery';
  else if (i.category.includes('Charging')) i.iconName = 'Zap';
  else if (i.category.includes('Logic')) i.iconName = 'Wrench';
  else i.iconName = 'Smartphone';
});

(async () => {
  // Fetch existing items to avoid duplicates
  const { data: existing } = await supabase.from('inventory').select('name');
  const existingNames = new Set(existing.map(i => i.name.toLowerCase().trim()));

  const toInsert = items.filter(i => !existingNames.has(i.name.toLowerCase().trim()));

  console.log(`Inserting ${toInsert.length} new items out of ${items.length} total generated...`);

  // Supabase limits payload size, chunk it by 200
  const chunkSize = 200;
  let successCount = 0;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from('inventory').insert(chunk);
    if (error) {
      console.error('Insert error on chunk:', error);
    } else {
      successCount += chunk.length;
    }
  }
  console.log(`Successfully inserted ${successCount} items.`);
})();
