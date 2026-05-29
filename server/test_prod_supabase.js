require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('failed_sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (error) {
    console.log("Supabase Error:", error.message);
  } else {
    console.log("Latest Logs in failed_sync_logs:");
    console.log(JSON.stringify(data, null, 2));
  }
}
check();
