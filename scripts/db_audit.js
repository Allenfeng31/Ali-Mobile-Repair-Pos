import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log(`\n--- DB Latency Audit ---`);
  console.log(`URL: ${supabaseUrl}`);

  // 1. SELECT 1 x 10
  console.log(`\nExecuting 10x 'SELECT 1' (Settings lookup)...`);
  let select1Times = [];
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    const { error: err } = await supabase.from('settings').select('key').limit(1);
    const end = performance.now();
    if (err) {
      console.error(`Attempt ${i+1} failed:`, err.message);
    } else {
      select1Times.push(end - start);
      console.log(`  [${i+1}] ${ (end - start).toFixed(2) }ms`);
    }
  }
  const avgSelect1 = select1Times.reduce((a, b) => a + b, 0) / select1Times.length;
  console.log(`Average 'SELECT 1' (Settings lookup): ${avgSelect1.toFixed(2)}ms`);

  // 2. Complex Inventory Query x 5
  console.log(`\nExecuting 5x Complex Inventory Queries...`);
  let complexTimes = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    const { data, error } = await supabase
      .from('inventory')
      .select('category, brand, count')
      .select('category, brand')
      .neq('id', 0); // Force some work
    
    // Actually let's do a real group by via a complex filter if possible, 
    // but Supabase JS doesn't support GROUP BY directly easily without RPC.
    // Let's do a large select with multiple filters.
    const { error: err } = await supabase
      .from('inventory')
      .select('*')
      .or('category.eq.Phone,category.eq.Tablet')
      .order('price', { ascending: false })
      .limit(100);

    const end = performance.now();
    if (err) {
      console.error(`Complex Attempt ${i+1} failed:`, err.message);
    } else {
      complexTimes.push(end - start);
      console.log(`  [${i+1}] ${ (end - start).toFixed(2) }ms`);
    }
  }
  const avgComplex = complexTimes.reduce((a, b) => a + b, 0) / complexTimes.length;
  console.log(`Average Complex Query: ${avgComplex.toFixed(2)}ms`);

  console.log(`\n--- Summary ---`);
  if (avgSelect1 < 50) {
    console.log(`✅ SELECT 1 latency is excellent (${avgSelect1.toFixed(2)}ms). Definitely Sydney node.`);
  } else if (avgSelect1 < 100) {
    console.log(`⚠️ SELECT 1 latency is okay (${avgSelect1.toFixed(2)}ms). Likely Sydney, but check routing.`);
  } else {
    console.log(`❌ SELECT 1 latency is high (${avgSelect1.toFixed(2)}ms). Possible cross-region connection (200ms+ expected for US).`);
  }
}

runAudit();
