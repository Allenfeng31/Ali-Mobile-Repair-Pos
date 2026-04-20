import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const tables = ['order_items', 'repairs', 'appointments'];
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`Error on ${table}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`Columns for ${table}:`, Object.keys(data[0]));
    } else {
      console.log(`${table} is empty.`);
    }
  }
}

inspect();
