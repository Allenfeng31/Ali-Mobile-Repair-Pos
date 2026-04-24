
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
// Run from /Users/yanningli/Desktop/ali-mobile-repair-pos 2/server
dotenv.config({ path: './.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing credentials');
  console.log('URL:', supabaseUrl);
  console.log('Key exists:', !!serviceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUsers() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error listing users:', error.message);
    return;
  }

  console.log('--- Auth Users ---');
  users.forEach(user => {
    console.log(`ID: ${user.id} | Email: ${user.email} | Last Sign In: ${user.last_sign_in_at}`);
  });
  console.log('------------------');

  const adminEmail = 'admin@pos.local';
  const adminUser = users.find(u => u.email === adminEmail);
  if (!adminUser) {
    console.log(`ALERT: ${adminEmail} NOT FOUND in Supabase Auth!`);
  } else {
    console.log(`${adminEmail} exists.`);
  }
}

checkUsers();
