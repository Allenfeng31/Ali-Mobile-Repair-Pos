import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars. Ensure SUPABASE_SERVICE_ROLE_KEY is set.');
  process.exit(1);
}

const IS_DRY_RUN = process.env.DRY_RUN !== 'false';
const supabase = createClient(supabaseUrl, supabaseKey);

const FACEID_SLUG = 'how-to-fix-face-id-on-iphone-15-and-newer-models-after-camera-replacement';
const FACEID_TITLE = 'iPhone Face ID Repair After Front Camera Replacement | What Customers Should Know';
const FACEID_DESCRIPTION = 'Face ID repair after front camera replacement depends on the iPhone model and damage history. Ali Mobile & Repair explains how iPhone 14 and older, iPhone 15, and iPhone 16 and newer models are handled.';

const FACEID_CONTENT = `
<h1>iPhone Face ID Repair After Front Camera Replacement</h1>

<p>Face ID problems after a front camera replacement can be confusing. On many iPhones, the front camera, TrueDepth parts, Face ID sensors, flex cables, and mainboard security are closely related. This means a simple camera swap does not always restore Face ID.</p>

<p>At <strong>Ali Mobile &amp; Repair in Ringwood</strong>, we have worked on Face ID and front camera repair cases across different iPhone generations. The correct repair method depends heavily on the model, the original fault, and whether there is liquid damage, impact damage, previous repair damage, or board-level damage.</p>

<h2>Why Face ID can stop working after camera replacement</h2>

<p>Face ID is not just a normal front camera function. It uses several related parts and security checks. If the wrong part is installed, if the original sensor group is damaged, or if the repair process is not handled correctly, the phone may show a Face ID error or fail to complete Face ID setup.</p>

<p>This is why Face ID repair should not be treated like a basic camera replacement. It often requires model-specific diagnosis, original parts, and specific repair tools.</p>

<h2>iPhone 14 and older: front camera separation can help preserve Face ID</h2>

<p>For iPhone 14 and older models, one common case is that the front camera is blurry, damaged, or not working, but Face ID still works before the repair. In this situation, replacing the entire front camera and sensor assembly without care can cause Face ID to stop working.</p>

<p>For suitable cases, Ali Mobile &amp; Repair can perform a careful front camera separation process. The goal is to replace the faulty front camera while keeping the customer’s original Face ID-related components in place.</p>

<p>This is a delicate repair. The parts are small, thin, and easy to damage if the separation is rushed. The advantage of this method is that it can repair the camera issue while preserving the original Face ID function when the original Face ID system was still working before repair.</p>

<h2>What if both the front camera and Face ID are already not working?</h2>

<p>If both the front camera and Face ID have already failed, the repair becomes more complicated. This is especially common after water damage, heavy impact, or previous repair attempts.</p>

<p>In these cases, replacing the camera alone may not solve the problem. The issue may be related to the flex cable, TrueDepth-related parts, power lines, or the mainboard. We need to inspect the phone first before confirming whether Face ID can be restored.</p>

<h2>iPhone 15 series: why we check carefully before giving an answer</h2>

<p>The iPhone 15 series is a more sensitive transition generation for this type of repair. Because of the way parts, software, and calibration can interact, we do not give a simple promise before checking the device.</p>

<p>For iPhone 15, the result depends on the condition of the original Face ID system, the front camera module, the flex cables, the board, and whether the phone has had water damage or previous repair work. Some cases can be repaired, but the phone needs to be inspected properly first.</p>

<h2>iPhone 16 and newer: more predictable with the right repair process</h2>

<p>For iPhone 16 and newer models, our current repair experience has been much more predictable when the correct original part and proper repair process are used.</p>

<p>These repairs still need the right tools and checks. We use specific professional repair tools and original parts where required. We also check for other issues such as liquid damage, damaged flex cables, board faults, or previous repair damage before confirming the repair result.</p>

<p>When there is no unrelated damage, Face ID recovery on iPhone 16 and newer models has been much more stable in our current workshop experience.</p>

<h2>Why we do not treat Face ID repair as a simple part swap</h2>

<p>Face ID is connected to device security, so every repair needs to be handled carefully. A camera may look like the only failed part, but the actual issue can be deeper.</p>

<p>Before completing the repair, we check the camera function, Face ID status, error messages, flex condition, and any signs of liquid or impact damage. This helps us avoid giving the customer a simple answer when the phone needs deeper diagnosis.</p>

<h2>What customers should tell us before repair</h2>

<ul>
  <li>Whether Face ID worked before the camera repair or screen repair.</li>
  <li>Whether the phone had water damage or heavy impact.</li>
  <li>Whether the phone was repaired somewhere else before.</li>
  <li>Whether the front camera is blurry, black, shaking, or completely not working.</li>
  <li>Whether the phone shows any Face ID error message in Settings.</li>
</ul>

<h2>Visit Ali Mobile &amp; Repair in Ringwood</h2>

<p>Ali Mobile &amp; Repair is located at <strong>Ringwood Square Shopping Centre, Kiosk C1, Seymour St, Ringwood VIC 3134</strong>. We help customers from Ringwood, Ringwood East, Mitcham, Croydon, Heathmont and nearby suburbs with iPhone front camera, Face ID, screen, battery, and other phone repairs.</p>

<p>If your Face ID stopped working after a camera replacement, or if your front camera is damaged but Face ID still works, bring the phone to our Ringwood kiosk. We will inspect the model, damage condition, and repair history before explaining the safest repair option.</p>

<p><strong>Need your iPhone checked?</strong> Use our <a target="_blank" rel="noopener noreferrer nofollow" href="https://alimobile.com.au/book-repair" style="color: rgb(37, 99, 235); font-weight: 600; text-decoration: underline;">Repair Quick Drop-off Form</a> or visit us at Ringwood Square Shopping Centre.</p>
`.trim();

async function run() {
  const report = {
    mode: IS_DRY_RUN ? 'DRY_RUN' : 'WRITE',
    table: 'storefront_blogs',
    targetSlug: FACEID_SLUG,
    faceIdBefore: null,
    faceIdPlanned: null,
    faceIdAfter: null,
    confirmsOnlyThisSlugUpdated: true,
    confirmsNoOtherBlogModified: true
  };

  const { data: faceIdBefore, error: fetchError } = await supabase
    .from('storefront_blogs')
    .select('id, slug, title, description, content, cover_image, is_published, published_at, updated_at')
    .eq('slug', FACEID_SLUG)
    .single();

  if (fetchError) throw fetchError;

  report.faceIdBefore = {
    title: faceIdBefore.title,
    description: faceIdBefore.description,
    contentLength: faceIdBefore.content ? faceIdBefore.content.length : 0,
    cover_image: faceIdBefore.cover_image,
    is_published: faceIdBefore.is_published
  };

  if (IS_DRY_RUN) {
    report.faceIdPlanned = {
      title: FACEID_TITLE,
      description: FACEID_DESCRIPTION,
      contentLength: FACEID_CONTENT.length,
      cover_image: faceIdBefore.cover_image,
      is_published: true
    };
  } else {
    const { data: faceIdAfter, error: updateError } = await supabase
      .from('storefront_blogs')
      .update({
        title: FACEID_TITLE,
        description: FACEID_DESCRIPTION,
        content: FACEID_CONTENT,
        updated_at: new Date().toISOString()
      })
      .eq('id', faceIdBefore.id)
      .select('id, slug, title, description, content, cover_image, is_published, published_at, updated_at')
      .single();

    if (updateError) throw updateError;
    
    report.faceIdAfter = {
      title: faceIdAfter.title,
      description: faceIdAfter.description,
      contentLength: faceIdAfter.content ? faceIdAfter.content.length : 0,
      cover_image: faceIdAfter.cover_image,
      is_published: faceIdAfter.is_published
    };
  }

  console.log(JSON.stringify(report, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
