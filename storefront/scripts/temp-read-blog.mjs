import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('storefront_blogs')
    .select('id, slug, title, description, content, cover_image, is_published, published_at, updated_at')
    .eq('slug', 'how-to-fix-face-id-on-iphone-15-and-newer-models-after-camera-replacement')
    .single();

  if (error) throw error;
  console.log(JSON.stringify(data, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
