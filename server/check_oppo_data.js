require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
  // Check for OPPO items in inventory
  const { data, error } = await supabase
    .from('inventory')
    .select('id, name, model, category, device_model, price, status')
    .ilike('model', '%OPPO%')
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data.length} OPPO items (showing first 20):`);
  data.forEach(item => {
    console.log(`  [${item.id}] ${item.name} | model: "${item.model}" | cat: "${item.category}" | price: ${item.price} | status: "${item.status}" | device_model: "${item.device_model}"`);
  });

  // Total count
  const { count, error: countErr } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .ilike('model', '%OPPO%');

  if (!countErr) {
    console.log(`\nTotal OPPO items in database: ${count}`);
  }
})();
