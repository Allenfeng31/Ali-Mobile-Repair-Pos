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
const PIXEL_TITLE = 'Google Pixel 10 Pro XL Screen Replacement in Ringwood | Fingerprint Scanner Explained';
const PIXEL_DESCRIPTION = 'Need Google Pixel 10 Pro XL screen replacement in Ringwood? Ali Mobile & Repair explains fingerprint scanner testing, original screen options, sealing, and what customers should know before repair.';

const PIXEL_CONTENT = `
<p>If you have dropped your Google Pixel 10 Pro XL and the OLED screen is cracked, the repair is not always just about replacing the display. On this model, the under-display fingerprint scanner is one of the most important parts to check during screen replacement.</p>

<p>At <strong>Ali Mobile &amp; Repair in Ringwood</strong>, we have repaired many Pixel 10 Pro XL devices. From our repair experience, the fingerprint scanner is the part that needs the most careful testing before the phone is sealed again.</p>

<h2>The fingerprint scanner issue we see during Pixel 10 Pro XL screen replacement</h2>

<p>Most new Pixel 10 Pro XL replacement screens come with a fingerprint scanner already attached. In theory, this should make the repair simple. In real repairs, it is not always that straightforward.</p>

<p>Sometimes the new fingerprint scanner on the replacement screen works perfectly with the customer’s phone. Sometimes it does not work properly, even when the screen and scanner are original parts. This is why we do not assume the new scanner will automatically match every phone.</p>

<p>Before we seal the phone, we always test the new screen, display, touch response, and fingerprint scanner. If the fingerprint scanner does not work correctly during testing, we do not continue sealing the phone as if everything is fine.</p>

<h2>What we do if the new fingerprint scanner does not match</h2>

<p>If the fingerprint scanner that comes with the new screen is not compatible with the phone, we carefully remove the original fingerprint scanner from the customer’s broken screen. We also remove the scanner from the new screen, then transfer the customer’s original scanner onto the replacement screen.</p>

<p>This is the difficult part of the repair. Google Pixel OLED screens are extremely thin, and the fingerprint scanner is also very thin. Both parts can be damaged easily if the removal is rushed or handled incorrectly.</p>

<p>Our process is to remove and transfer the scanner carefully so the original fingerprint function can be retained when the customer’s original scanner was working before the screen was damaged.</p>

<h2>Why we test before sealing the phone</h2>

<p>Once a Pixel screen is fully sealed, opening it again can increase risk and may affect the quality of the final seal. That is why testing before final installation is important.</p>

<p>During the repair, we check the display, touch, fingerprint response where applicable, and general device functions before completing the final seal. This helps avoid a situation where the screen looks finished but the fingerprint scanner does not work properly.</p>

<img class="blog-inline-image" src="https://mmjyjciyhcsjpnbtovag.supabase.co/storage/v1/object/public/blog-images/1777098530515-google-pixel-10-screen-replacement.jpg" style="max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0px;">

<h2>Why we use original Pixel screens</h2>

<p>There are different screen grades available for Pixel repairs, including original and aftermarket options. For Pixel screen replacement, we currently use original screens only.</p>

<p>From our experience, lower-grade aftermarket Pixel screens can have noticeable colour difference, larger black borders, and less sensitive touch response. On a premium phone like the Pixel 10 Pro XL, these differences can affect the way the phone feels after repair.</p>

<h2>What about water resistance after screen replacement?</h2>

<p>After replacing the screen, we reseal the phone carefully so it has practical daily protection again. However, it is important to be honest: this is not the same as a brand-new phone assembled in a factory environment with automated sealing conditions.</p>

<p>We do not recommend using the phone in water after any screen replacement. The seal can help with normal daily use, but it should not be treated as a reason to intentionally expose the phone to water.</p>

<h2>Should you back up your data before repair?</h2>

<p>It is always best to back up important data before any phone repair. A screen replacement normally does not require a data reset, and so far we have not had a customer lose data from this repair, but backing up first is still the safest habit.</p>

<h2>Visit Ali Mobile &amp; Repair in Ringwood</h2>

<p>Ali Mobile &amp; Repair is located at <strong>Ringwood Square Shopping Centre, Kiosk C1, Seymour St, Ringwood VIC 3134</strong>. We help customers from Ringwood, Ringwood East, Mitcham, Croydon, Heathmont and nearby suburbs with Pixel screen replacement and other phone repairs.</p>

<p>If your Pixel 10 Pro XL screen is cracked, you can bring it to our Ringwood kiosk for an inspection. We will check the screen condition, frame condition, touch response, and fingerprint function before explaining the repair options.</p>

<p><strong>Need your Pixel 10 Pro XL checked?</strong> Use our <a target="_blank" rel="noopener noreferrer nofollow" href="https://alimobile.com.au/book-repair" style="color: rgb(37, 99, 235); font-weight: 600; text-decoration: underline;">Repair Quick Drop-off Form</a> or visit us at Ringwood Square Shopping Centre.</p>
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
    .select('id, slug, title, description, content, cover_image, is_published, published_at, updated_at')
    .eq('slug', PIXEL_SLUG)
    .single();

  if (fetchError) throw fetchError;

  report.pixelBefore = {
    title: pixelBefore.title,
    description: pixelBefore.description,
    contentLength: pixelBefore.content ? pixelBefore.content.length : 0,
    cover_image: pixelBefore.cover_image,
    is_published: pixelBefore.is_published
  };

  if (IS_DRY_RUN) {
    report.pixelPlanned = {
      title: PIXEL_TITLE,
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
        description: PIXEL_DESCRIPTION,
        content: PIXEL_CONTENT,
        updated_at: new Date().toISOString()
      })
      .eq('id', pixelBefore.id)
      .select('id, slug, title, description, content, cover_image, is_published, published_at, updated_at')
      .single();

    if (updateError) throw updateError;
    
    report.pixelAfter = {
      title: pixelAfter.title,
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
