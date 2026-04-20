import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
  const { data: categories, error: catError } = await supabase
    .from('inventory')
    .select('category')
    .then(({ data }) => ({ data: [...new Set(data?.map(i => i.category))], error: null }));

  if (catError) {
    console.error(catError);
    return;
  }

  console.log('Unique categories:', categories);

  for (const cat of categories) {
    if (cat.toLowerCase().includes('apple') || cat.toLowerCase().includes('iphone')) {
      const { data, error } = await supabase
        .from('inventory')
        .select('model, device_model, name')
        .eq('category', cat)
        .limit(5);
      
      console.log(`\nSample for category "${cat}":`);
      console.log(data);
    }
  }
}

checkCategories();
