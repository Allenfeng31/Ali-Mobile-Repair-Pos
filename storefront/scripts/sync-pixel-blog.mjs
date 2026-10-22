import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars. Ensure SUPABASE_SERVICE_ROLE_KEY is set.');
  process.exit(1);
}

const IS_DRY_RUN = process.env.DRY_RUN !== 'false';
const supabase = createClient(supabaseUrl, supabaseKey);

const PIXEL_SLUG = 'google-pixel-10-pro-xl-screen-replacement-the-hidden-fingerprint-trap-and-how-we';
const PIXEL_TITLE = 'Pixel 10 Pro XL Screen Replacement: Fingerprint Calibration & Repair';
const PIXEL_SEO_TITLE = 'Pixel 10 Pro XL Screen Repair & Fingerprint Calibration | Ali Mobile';
const PIXEL_DESCRIPTION = 'Pixel 10 Pro XL screen repair in Ringwood. Learn how fingerprint calibration, diagnosis and final testing support a professional screen replacement.';

const PIXEL_CONTENT = `
<p>A cracked Google Pixel 10 Pro XL screen can affect more than the display. The under-display fingerprint sensor is an important part of the repair, so it needs to be checked before the device is sealed.</p>

<p>At <strong>Ali Mobile &amp; Repair in Ringwood</strong>, we assess the screen, touch response and fingerprint function before explaining the available repair options. A professional Pixel screen repair involves assessment, calibration where required, diagnosis and final testing.</p>

<h2>Why fingerprint recognition matters after a Pixel screen replacement</h2>

<p>A replacement display assembly may affect fingerprint recognition. After the screen is replaced, the display, touch response and fingerprint function all need checking.</p>

<h2>Our approach: calibration first, hardware diagnosis second</h2>

<p>Replacing a Google Pixel 10 Pro XL screen involves more than fitting a new display. The fingerprint sensor may require calibration to work correctly after replacement.</p>

<p>We check the display and fingerprint functionality as part of the repair process. Where required, we first attempt the appropriate manufacturer-supported fingerprint calibration procedure. If calibration does not resolve the issue, we investigate possible hardware or compatibility problems. A failed calibration alone does not prove that the sensor is defective.</p>

<h2>When original sensor transfer may be considered</h2>

<p>In certain cases, transferring the original fingerprint sensor may be considered when the component is intact, compatible and technically suitable for reuse. It is not a normal requirement for every Pixel screen replacement, and it does not guarantee that every fingerprint issue will be resolved.</p>

<p>Our aim is to identify the most appropriate repair approach while avoiding unnecessary work on delicate components.</p>

<h2>What we test before completing the repair</h2>

<p>Before final sealing, we test the display, touch response, fingerprint response where applicable, and relevant device functions. We also confirm the available repair approach, pricing and expected timing for the exact device.</p>

<img class="blog-inline-image" src="https://mmjyjciyhcsjpnbtovag.supabase.co/storage/v1/object/public/blog-images/1777098530515-google-pixel-10-screen-replacement.jpg" style="max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0px;">

<h2>Screen options, warranty and water resistance</h2>

<p>We confirm compatible screen options, repair pricing and expected timing for the exact device before work begins. <a href="/repairs/phone/google-pixel/pixel-10-pro-xl/screen-replacement">View Pixel 10 Pro XL Screen Replacement Options &amp; Pricing</a> for the current repair path.</p>

<p>Eligible standard repairs include a 6-month warranty on relevant parts and labour. Water-damage repairs are excluded from warranty. Opening a phone can affect its factory water resistance, so it cannot be guaranteed after repair.</p>

<h2>Common questions</h2>

<h3>Why does my Pixel fingerprint scanner stop working after screen replacement?</h3>
<p>A replacement sensor may need calibration after the screen is fitted. Part compatibility or another device fault can also affect the result, so the cause needs professional assessment.</p>

<h3>Does a new Pixel screen need fingerprint calibration?</h3>
<p>Where appropriate, calibration is the preferred first approach after fitting a replacement screen with a fingerprint sensor.</p>

<h3>What happens if fingerprint calibration fails?</h3>
<p>We diagnose possible hardware or compatibility issues. A failed calibration alone does not identify the cause or prove that the sensor is defective.</p>

<h3>Is transferring the original fingerprint sensor always necessary?</h3>
<p>No. It is a conditional repair option only when diagnosis supports it and the original sensor is intact, compatible and suitable for reuse.</p>

<h3>Will my Pixel retain its original water resistance?</h3>
<p>Factory water resistance cannot be guaranteed after a phone has been opened for repair.</p>

<h3>Where can I arrange Pixel 10 Pro XL screen replacement in Ringwood?</h3>
<p>Ali Mobile &amp; Repair is an independent phone repair shop at <strong>Kiosk C1, Ringwood Square Shopping Centre, Seymour Street, Ringwood VIC 3134</strong>. Walk-ins are welcome; contact us to discuss screen availability, fingerprint concerns and a repair quote.</p>

<h2>Pixel 10 Pro XL screen replacement in Ringwood</h2>

<p>If your Pixel 10 Pro XL screen is cracked or the fingerprint scanner is not working after a repair, <a href="/book-repair">book a repair visit</a> or contact the store for a professional screen replacement assessment. Parts availability, repair timing and the final quote are confirmed for the device.</p>
`.trim();

async function run() {
  const report = {
    mode: IS_DRY_RUN ? 'DRY_RUN' : 'WRITE',
    table: 'storefront_blogs',
    targetSlug: PIXEL_SLUG,
    pixelBefore: null,
    pixelPlanned: null,
    pixelAfter: null,
    confirmsOnlyThisSlugUpdated: true,
    confirmsNoOtherBlogModified: true
  };

  const { data: pixelBefore, error: fetchError } = await supabase
    .from('storefront_blogs')
    .select('id, slug, title, seo_title, description, content, cover_image, is_published, published_at, updated_at')
    .eq('slug', PIXEL_SLUG)
    .single();

  if (fetchError) throw fetchError;

  report.pixelBefore = {
    title: pixelBefore.title,
    seo_title: pixelBefore.seo_title,
    description: pixelBefore.description,
    contentLength: pixelBefore.content ? pixelBefore.content.length : 0,
    cover_image: pixelBefore.cover_image,
    is_published: pixelBefore.is_published
  };

  if (IS_DRY_RUN) {
    report.pixelPlanned = {
      title: PIXEL_TITLE,
      seo_title: PIXEL_SEO_TITLE,
      description: PIXEL_DESCRIPTION,
      contentLength: PIXEL_CONTENT.length,
      cover_image: pixelBefore.cover_image,
      is_published: true
    };
  } else {
    const { data: pixelAfter, error: updateError } = await supabase
      .from('storefront_blogs')
      .update({
        title: PIXEL_TITLE,
        seo_title: PIXEL_SEO_TITLE,
        description: PIXEL_DESCRIPTION,
        content: PIXEL_CONTENT,
        updated_at: new Date().toISOString()
      })
      .eq('id', pixelBefore.id)
      .select('id, slug, title, seo_title, description, content, cover_image, is_published, published_at, updated_at')
      .single();

    if (updateError) throw updateError;
    
    report.pixelAfter = {
      title: pixelAfter.title,
      seo_title: pixelAfter.seo_title,
      description: pixelAfter.description,
      contentLength: pixelAfter.content ? pixelAfter.content.length : 0,
      cover_image: pixelAfter.cover_image,
      is_published: pixelAfter.is_published
    };
  }

  console.log(JSON.stringify(report, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
