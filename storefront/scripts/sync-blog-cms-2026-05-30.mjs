import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars. Load .env.local first.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const REMOVE_SLUGS = [
  'professional-device-repair-ringwood-melbourne',
  'google-pixel-screen-replacement-ringwood-melbourne',
  'system-recovery-services-ringwood',
  'samsung-battery-replacement-ringwood-melbourne',
  'iphone-17-pro-screen-replacement-ringwood',
  'fast-reliable-screen-replacement-ringwood',
  'reliable-phone-repair-ringwood',
  'professional-mobile-phone-repair-ringwood',
  'tablet-repair-service-ringwood',
];

const KEEP_SLUGS = [
  'the-hidden-reality-of-macbook-pro-keyboard-repairs-in-melbourne-why-saving-70-mi',
  'google-pixel-10-pro-xl-screen-replacement-the-hidden-fingerprint-trap-and-how-we',
  'how-to-fix-face-id-on-iphone-15-and-newer-models-after-camera-replacement',
  'how-to-hard-reset-iphone',
];

const MACBOOK_SLUG = 'the-hidden-reality-of-macbook-pro-keyboard-repairs-in-melbourne-why-saving-70-mi';
const MACBOOK_TITLE = 'MacBook Keyboard Repair in Ringwood | Top Case Assembly Explained';
const MACBOOK_DESCRIPTION =
  'Need MacBook keyboard repair in Ringwood? Ali Mobile & Repair explains why we usually recommend top case assembly, how long it takes, what is included, and what our 6-month warranty covers.';

const MACBOOK_CONTENT = `
<h2>Quick answer</h2>
<p>For most MacBook keyboard repairs, we usually recommend <strong>top case assembly replacement</strong> instead of keyboard-only replacement because it is generally more stable after reassembly.</p>

<h2>Top case assembly vs keyboard-only repair</h2>
<p><strong>Keyboard-only repair</strong> focuses on replacing only the keyboard layer. It can work in some cases, but the process requires deeper disassembly around the frame and many internal screw points.</p>
<p><strong>Top case assembly repair</strong> replaces the upper structure that supports the keyboard and related mounting points, which usually gives a more consistent fit after rebuild.</p>
<p><strong>Important:</strong> the top case assemblies we use <strong>do not include battery</strong>. This applies to all MacBook models we service.</p>

<h2>Why stability can be lower with keyboard-only on older units</h2>
<p>Many MacBooks we see have had years of daily use. Over time, internal frame areas can wear, screw points can fatigue, and old keyboard structures can lose rigidity. During keyboard-only repair, these conditions can make final alignment and long-term feel less predictable.</p>
<p>That is why we often recommend top case assembly for better stability and durability in real-world use.</p>

<h2>Repair timeline</h2>
<ul>
  <li>Parts lead time is usually <strong>1 to 2 days</strong>.</li>
  <li>Once parts arrive, the hands-on repair is usually around <strong>1 hour</strong>.</li>
</ul>

<h2>Warranty: 6 months</h2>
<p>Our MacBook keyboard repair includes a <strong>6-month warranty</strong>.</p>
<p>This job requires removal and reinstallation of the logic board and multiple internal components, with many delicate flex cables inside the MacBook. The 6-month period gives you practical time to confirm keyboard input, trackpad response, battery behavior, speakers, ports, and overall stability after reassembly.</p>

<h2>Before you bring your MacBook in</h2>
<ul>
  <li>Back up important data first.</li>
  <li>Tell us if there was liquid exposure or impact damage.</li>
  <li>Let us know which keys fail and whether the issue is intermittent.</li>
  <li>Bring your charger if charging behavior has also changed.</li>
</ul>

<h2>Visit us in Ringwood Square</h2>
<p>Ali Mobile & Repair is located at <strong>Ringwood Square Shopping Centre, Kiosk C1, Seymour St, Ringwood VIC 3134</strong>. We can inspect your MacBook and explain whether top case assembly or another path is the safer option for your specific model.</p>

<h2>FAQ</h2>
<h3>Do you always do top case assembly for MacBook keyboard repair?</h3>
<p>In most cases, yes. We recommend it when long-term structural stability is the priority.</p>

<h3>Does your top case assembly include a battery?</h3>
<p>No. Our top case assembly replacements do <strong>not</strong> include battery for any model.</p>

<h3>How long will I be without my MacBook?</h3>
<p>Usually 1 to 2 days to receive parts, then about 1 hour for the actual repair once parts are in stock.</p>

<h3>What does the 6-month warranty cover?</h3>
<p>It covers keyboard-repair-related workmanship and helps ensure key post-repair functions remain stable after full reassembly.</p>
`.trim();

async function run() {
  const report = {
    removeRequested: REMOVE_SLUGS.length,
    removeFound: 0,
    removeUpdated: 0,
    removeRows: [],
    keepRows: [],
    macBefore: null,
    macAfter: null,
    warnings: [],
  };

  const { data: removeRows, error: removeFetchError } = await supabase
    .from('storefront_blogs')
    .select('id, slug, title, is_published, updated_at')
    .in('slug', REMOVE_SLUGS);

  if (removeFetchError) throw removeFetchError;
  report.removeRows = removeRows || [];
  report.removeFound = report.removeRows.length;

  if (report.removeRows.length > 0) {
    const { data: updatedRows, error: removeUpdateError } = await supabase
      .from('storefront_blogs')
      .update({
        is_published: false,
        updated_at: new Date().toISOString(),
      })
      .in('slug', REMOVE_SLUGS)
      .select('id, slug, is_published, updated_at');

    if (removeUpdateError) throw removeUpdateError;
    report.removeUpdated = (updatedRows || []).length;
  }

  const { data: keepRows, error: keepError } = await supabase
    .from('storefront_blogs')
    .select('id, slug, title, is_published, updated_at')
    .in('slug', KEEP_SLUGS);

  if (keepError) throw keepError;
  report.keepRows = keepRows || [];

  const { data: macBefore, error: macBeforeError } = await supabase
    .from('storefront_blogs')
    .select('id, slug, title, description, content, cover_image, is_published, published_at, updated_at')
    .eq('slug', MACBOOK_SLUG)
    .maybeSingle();

  if (macBeforeError) throw macBeforeError;

  if (!macBefore) {
    report.warnings.push('MacBook target slug not found in storefront_blogs');
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  report.macBefore = {
    id: macBefore.id,
    slug: macBefore.slug,
    title: macBefore.title,
    description: macBefore.description,
    contentLength: macBefore.content ? macBefore.content.length : 0,
    cover_image: macBefore.cover_image,
    is_published: macBefore.is_published,
    published_at: macBefore.published_at,
    updated_at: macBefore.updated_at,
  };

  const { data: macAfter, error: macUpdateError } = await supabase
    .from('storefront_blogs')
    .update({
      title: MACBOOK_TITLE,
      description: MACBOOK_DESCRIPTION,
      content: MACBOOK_CONTENT,
      is_published: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', macBefore.id)
    .select('id, slug, title, description, content, cover_image, is_published, published_at, updated_at')
    .single();

  if (macUpdateError) throw macUpdateError;

  report.macAfter = {
    id: macAfter.id,
    slug: macAfter.slug,
    title: macAfter.title,
    description: macAfter.description,
    contentLength: macAfter.content ? macAfter.content.length : 0,
    cover_image: macAfter.cover_image,
    is_published: macAfter.is_published,
    published_at: macAfter.published_at,
    updated_at: macAfter.updated_at,
  };

  console.log(JSON.stringify(report, null, 2));
}

run().catch((error) => {
  console.error('CMS sync failed:', error);
  process.exit(1);
});
