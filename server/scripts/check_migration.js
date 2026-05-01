const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('Checking for is_recommended column...');
  
  // We can check if the column exists by trying to select it
  const { error: checkError } = await supabase
    .from('inventory')
    .select('is_recommended')
    .limit(1);

  if (checkError && checkError.message.includes('column "is_recommended" does not exist')) {
    console.log('Column is_recommended missing. Applying migration...');
    
    // Supabase JS client doesn't support raw SQL easily unless we use a function or the REST API doesn't allow ALTER TABLE.
    // However, the server/api/index.js uses the service_role key.
    // Usually, migrations are run via the Supabase Dashboard or CLI.
    // I will output the SQL for the user to run.
    console.log('\nPLEASE RUN THE FOLLOWING SQL IN YOUR SUPABASE SQL EDITOR:\n');
    console.log(`
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_inventory_is_recommended
  ON public.inventory (is_recommended)
  WHERE is_recommended = true;
    `);
  } else if (checkError) {
    console.error('Error checking column:', checkError.message);
  } else {
    console.log('✅ is_recommended column already exists.');
  }
}

applyMigration();
