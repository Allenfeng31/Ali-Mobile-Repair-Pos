require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
(async () => {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  console.log(error ? error : Object.keys(data[0] || {}));
})();
