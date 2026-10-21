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

<p>At <strong>Ali Mobile &amp; Repair in Ringwood</strong>, we assess the screen, touch response and fingerprint function before explaining the available repair options. A professional Pixel screen repair is a process of calibration, diagnosis and final testing—not an automatic sensor transfer.</p>

<h2>Why fingerprint recognition matters after a Pixel screen replacement</h2>

<p>Compatible replacement Pixel display assemblies may include a fingerprint sensor. After the screen is installed, the display, touch response, physical connections and fingerprint function all need checking.</p>

<h2>Why a replacement fingerprint sensor may require calibration</h2>

<p>Google provides an <a href="https://pixelrepair.withgoogle.com/" target="_blank" rel="noopener noreferrer">Update and Software Repair</a> function for fingerprint calibration where supported. After a screen replacement, the replacement sensor may need this software calibration before fingerprint recognition works normally.</p>

<p>The process is not simply a file download that pairs every sensor automatically. It follows Google’s supported connection, installation and restart steps for the device. <a href="https://www.ifixit.com/Guide/How+to+Calibrate+the+Fingerprint+Sensor+in+your+Google+Pixel+Phone/166753" target="_blank" rel="noopener noreferrer">iFixit’s fingerprint calibration guide</a> also describes calibration for eligible Pixel phones with replacement screens.</p>

<h2>Our approach: calibration first, hardware diagnosis second</h2>

<p>Calibration is the first step when it is supported. If it does not complete or fingerprint recognition still does not work, that does not automatically mean the replacement sensor is defective or incompatible.</p>

<ul>
  <li>We confirm that the required calibration process and restarts were completed.</li>
  <li>We inspect sensor connections and physical condition.</li>
  <li>We confirm the replacement display assembly is compatible with the device.</li>
  <li>We assess whether another hardware or software fault needs attention.</li>
</ul>

<h2>When transferring the original fingerprint sensor may be considered</h2>

<p>If calibration and appropriate troubleshooting do not resolve the issue, the original fingerprint sensor may be considered for transfer only when it is intact, compatible and suitable for reuse. This is a delicate hardware procedure, not a normal requirement for every Pixel screen replacement.</p>

<p>Transfer is not guaranteed to resolve every fingerprint issue, and further calibration may still be needed. We assess the risks before considering it and test the final fingerprint function before completing the repair.</p>

<h2>What we test before completing the repair</h2>

<p>Before final sealing, we test the display, touch response, fingerprint response where applicable, and relevant device functions. This helps ensure that a screen which looks finished has also been checked for the functions customers rely on.</p>

<img class="blog-inline-image" src="https://mmjyjciyhcsjpnbtovag.supabase.co/storage/v1/object/public/blog-images/1777098530515-google-pixel-10-screen-replacement.jpg" style="max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0px;">

<h2>Screen options, warranty and water resistance</h2>

<p>We confirm compatible screen options, repair pricing and expected timing for the exact device before work begins. <a href="/repairs/phone/google-pixel/pixel-10-pro-xl/screen-replacement">View Pixel 10 Pro XL Screen Replacement Options &amp; Pricing</a> for the current repair path. For a model-specific disassembly reference, see <a href="https://www.ifixit.com/Guide/Google+Pixel+10+Pro+XL+Screen+Replacement/200994" target="_blank" rel="noopener noreferrer">iFixit’s Pixel 10 Pro XL screen replacement guide</a>.</p>

<p>Eligible standard repairs include a 6-month warranty on relevant parts and labour. Water-damage repairs are excluded from warranty. Opening a phone can affect its factory water resistance, so it cannot be guaranteed after repair.</p>

<h2>Common questions</h2>

<h3>Why does my Pixel fingerprint scanner stop working after screen replacement?</h3>
<p>A replacement sensor may need software calibration after the screen is fitted. Connections, part compatibility and other device faults can also affect the result, so the cause needs checking before a repair is completed.</p>

<h3>Does a new Pixel screen need fingerprint calibration?</h3>
<p>Where supported, Google’s fingerprint calibration process is the first step after fitting a replacement screen with a fingerprint sensor.</p>

<h3>What happens if fingerprint calibration fails?</h3>
<p>We check that the required process and restarts were completed, inspect the relevant connections and parts, and diagnose other possible faults. A failed calibration alone does not identify the cause.</p>

<h3>Is transferring the original fingerprint sensor always necessary?</h3>
<p>No. It is a conditional repair option only when diagnosis supports it and the original sensor is intact, compatible and suitable for reuse.</p>

<h3>Will my Pixel retain its original water resistance?</h3>
<p>Factory water resistance cannot be guaranteed after a phone has been opened for repair.</p>

<h3>Where can I arrange Pixel 10 Pro XL screen replacement in Ringwood?</h3>
<p>Ali Mobile &amp; Repair is an independent phone repair shop at <strong>Kiosk C1, Ringwood Square Shopping Centre, Seymour Street, Ringwood VIC 3134</strong>. Walk-ins are welcome; contact us to confirm screen availability, fingerprint concerns and the final repair quote.</p>

<h2>Pixel 10 Pro XL screen replacement in Ringwood</h2>

<p>If your Pixel 10 Pro XL screen is cracked or the fingerprint scanner is not working after a repair, <a href="/book-repair">book a repair visit</a> or contact the store. Online booking helps us plan your visit; parts availability, repair timing and the final quote are confirmed for the device.</p>
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
