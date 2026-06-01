import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env files
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'storefront/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'storefront/.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing server-side Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Resetting FAILED keyword statuses to 'approved'...");
  const { data, error } = await supabase
    .from('seo_keywords')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('status', 'FAILED')
    .select('keyword');

  if (error) {
    console.error("Failed to update status:", error);
  } else {
    console.log(`Reset completed successfully. Reset ${data?.length || 0} keywords:`);
    console.log(data?.map(d => d.keyword));
  }
}

run();
