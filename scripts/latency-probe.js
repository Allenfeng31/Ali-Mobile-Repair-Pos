import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runProbe() {
  console.log(`🔍 [Probe] Target: ${supabaseUrl}`);
  
  const start = performance.now();
  
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('id')
      .limit(1);
    
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    
    if (error) {
      console.error(`❌ [Probe] Query failed: ${error.message}`);
    } else {
      console.log(`✅ [Probe] Success! Data received.`);
      console.log(`⏱️ [Probe] Latency: ${duration} ms`);
    }
  } catch (err) {
    console.error(`❌ [Probe] Unexpected error: ${err.message}`);
  }
}

runProbe();
