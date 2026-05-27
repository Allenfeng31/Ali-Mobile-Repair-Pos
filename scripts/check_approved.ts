import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'storefront/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'storefront/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('seo_keywords')
    .select('keyword, status')
    .in('status', ['approved', 'queued']);

  if (error) {
    console.error("Error fetching keywords:", error);
    return;
  }

  console.log("Approved or Queued Keywords:");
  console.log(data);
}

run();
