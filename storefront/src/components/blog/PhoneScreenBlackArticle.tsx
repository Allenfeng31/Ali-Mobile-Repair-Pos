import Image from "next/image";
import Link from "next/link";
import { Clock3, Database, ShieldCheck } from "lucide-react";

import type { PhoneScreenBrandPriceTable } from "@/data/phoneScreenBlackArticle";

import styles from "./PhoneScreenBlackArticle.module.css";

type Props = { priceTable: PhoneScreenBrandPriceTable | null };

const symptoms = [
  {
    question: "My phone screen is black but it still rings",
    answer: "The phone may still be running while the display assembly is no longer producing a visible image. A failed OLED/LCD panel or damaged display connection is possible, but testing is needed.",
  },
  {
    question: "My alarm works but there is no display",
    answer: "An alarm can continue because the operating system, speaker and other internal functions are active even when the screen cannot show an image.",
  },
  {
    question: "My phone vibrates but the screen stays black",
    answer: "Vibration shows that at least part of the phone is responding. It does not, by itself, prove whether the fault is the screen, its connection, power delivery or the main board.",
  },
  {
    question: "Half my phone screen is black",
    answer: "A black section, coloured lines, ink-like patches or flickering often points to physical damage inside the display panel, even if part of the image still works.",
  },
  {
    question: "My screen is black but the glass isn't cracked",
    answer: "The outer glass can look intact while the OLED/LCD layer underneath is damaged by impact, pressure, liquid or an internal connection fault.",
  },
] as const;

const diagnosticSteps = [
  {
    title: "Check the response",
    emphasis: "Ringing, vibration or sound.",
    description: "We call the phone and check whether it still responds.",
  },
  {
    title: "Check charging and power",
    emphasis: "Charging current / approximately 10 minutes.",
    description: "When it is safe, we check charging behaviour and current draw, allow a flat battery time to respond, and attempt a model-appropriate restart.",
  },
  {
    title: "Test with a known-good display",
    emphasis: "Known-good test display.",
    description: "When the cause remains unclear, we may connect a compatible working display using the correct professional procedure.",
  },
  {
    title: "Inspect the display and connection",
    emphasis: "Internal cracks, ink bleed and loose connections.",
    description: "Using a strong inspection light where helpful, we check for internal panel damage, display bleeding, layer separation, pressure damage and visible connector problems.",
  },
  {
    title: "Reconnect, replace or investigate further",
    emphasis: "Loose connector: usually $35.",
    description: "This conditional price applies only when a loose display connector is confirmed and reconnecting it restores normal operation; it is not a universal diagnostic fee or guaranteed solution. A damaged panel generally needs a display assembly; other results may require board-level or power diagnosis.",
  },
] as const;

const causes = [
  ["OLED or LCD panel damage", "Impact or pressure can damage the image-producing layer without breaking the outer glass. OLED damage can create black areas, bright lines, flashes or a completely blank display. A physically damaged internal panel normally requires replacement of the relevant display assembly."],
  ["Display flex or connection damage", "A loose, torn or damaged display flex or connector can interrupt the image. Reconnecting can help only where the connection itself is the confirmed problem; it cannot repair a cracked panel."],
  ["Software fault", "A stalled operating system or failed update can sometimes leave a phone responsive with no usable display. A model-appropriate forced restart is a sensible first check when the device is safe to operate."],
  ["Liquid exposure", "Moisture can affect the screen, connectors, power circuits or main board. Continued charging can be unsafe when liquid exposure, corrosion, heat or battery damage is suspected."],
  ["Battery, power or board-level issue", "A weak battery, power-management fault or main-board problem can resemble a screen failure. These faults need a different repair path, so screen replacement should not be assumed before testing."],
] as const;

const repairCases = [
  {
    model: "Samsung Galaxy A15",
    description: "This Galaxy A15 arrived with a mostly black display and blue/purple abnormalities along the damaged image area. The photographs show the failed display before repair and a working replacement screen after the screen replacement.",
    before: "/images/blog/phone-screen-black/samsung-galaxy-a15-screen-before.webp",
    after: "/images/blog/phone-screen-black/samsung-galaxy-a15-screen-after.webp",
    beforeAlt: "Samsung Galaxy A15 before screen replacement with a mostly black display and blue-purple image damage",
    afterAlt: "Samsung Galaxy A15 showing a working display after screen replacement at Ali Mobile",
  },
  {
    model: "Google Pixel 7",
    description: "This owner-confirmed Pixel 7 had a physically damaged screen with display failure. A replacement screen restored a visible working image. The after photo was taken during testing and still shows the temporary screen-protection label used at that stage.",
    before: "/images/blog/phone-screen-black/google-pixel-7-screen-before.webp",
    after: "/images/blog/phone-screen-black/google-pixel-7-screen-after.webp",
    beforeAlt: "Google Pixel 7 before repair with a cracked screen and failed black display",
    afterAlt: "Google Pixel 7 working during testing after screen replacement with a temporary protection label visible",
  },
  {
    model: "iPhone 17",
    description: "This iPhone 17 had a partial display failure: part of the emergency keypad remained visible while a large section stayed black. The after photo shows the full display working following screen replacement.",
    before: "/images/blog/phone-screen-black/iphone-17-screen-before.webp",
    after: "/images/blog/phone-screen-black/iphone-17-screen-after.webp",
    beforeAlt: "iPhone 17 before repair with the lower part of the display black and only part of the emergency keypad visible",
    afterAlt: "iPhone 17 with the full emergency keypad visible after screen replacement at Ali Mobile",
  },
] as const;

const faqs = [
  ["Can a phone work when its screen is completely black?", "Yes. Calls, alarms, sounds or vibration may continue if the phone is running but its display cannot produce an image. Those responses are useful clues, not a complete diagnosis."],
  ["Does a black screen always mean I need a new screen?", "No. A damaged panel often requires screen assembly replacement, but software, connection, battery, liquid or board-level faults may need a different solution."],
  ["Is a loose display connector repair always $35?", "No. Ali Mobile usually charges $35 only when a loose display connector is confirmed and reconnecting it restores normal operation. It is not a universal diagnostic fee or a guaranteed fix for every black-screen fault."],
  ["Will screen replacement erase my photos and apps?", "A standard screen replacement normally does not require a factory reset, and Ali Mobile does not normally erase customer data for this repair. Back up important data where possible because no repairer can guarantee data safety on every damaged or liquid-exposed device."],
  ["How long does a phone screen replacement take?", "Many straightforward repairs on common models take about 30–60 minutes once the fault is confirmed and the correct part is available. Complex damage, testing, part availability and model design can extend the time."],
  ["Is the repair covered by a warranty?", "Eligible completed screen replacements include Ali Mobile's six-month parts and labour warranty, subject to the applicable terms and exclusions. This does not limit rights available under Australian Consumer Law."],
] as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(value);
}

export function PhoneScreenBlackArticle({ priceTable }: Props) {
  return (
    <div className={styles.article}>
      <section className={styles.quickAnswer} aria-labelledby="black-screen-quick-answer">
        <p className={styles.eyebrow}>Quick answer</p>
        <h2 id="black-screen-quick-answer">Why can my phone still work with a black screen?</h2>
        <p className={styles.lead}>
          Your phone can still ring, vibrate or trigger alarms because the device may be running normally
          behind a display that is no longer producing an image. The fault could be the OLED/LCD panel or
          its connection, but software, liquid, battery, power and board-level faults can cause similar symptoms.
        </p>
        <p>Do not assume that every black screen needs a screen replacement. The response and display need to be tested first.</p>
      </section>

      <section aria-labelledby="black-screen-symptoms">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>What you may notice</p><h2 id="black-screen-symptoms">What does your black-screen symptom mean?</h2></div>
          <p>These common descriptions help narrow the checks, but several faults can produce the same symptom.</p>
        </div>
        <div className={styles.symptomGrid}>
          {symptoms.map(({ question, answer }) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="diagnostic-process-heading">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Our workshop process</p><h2 id="diagnostic-process-heading">How Ali Mobile diagnoses a no-display phone</h2></div>
          <p>We confirm what the phone is doing before recommending a screen. A test display can support the diagnosis, but it does not independently prove every underlying cause.</p>
        </div>
        <ol className={styles.processList}>
          {diagnosticSteps.map(({ title, emphasis, description }) => (
            <li key={title}>
              <div>
                <h3>{title}</h3>
                <p><strong>{emphasis}</strong> {description}</p>
              </div>
            </li>
          ))}
        </ol>
        <figure className={styles.infographic}>
          <a href="/images/blog/phone-screen-black/ali-mobile-no-display-diagnostic-process.webp" target="_blank" rel="noreferrer" aria-label="Open the no-display phone diagnostic infographic at full size">
            <Image
              src="/images/blog/phone-screen-black/ali-mobile-no-display-diagnostic-process.webp"
              alt="Five-step Ali Mobile no-display phone diagnostic process: check response, charging, a working test screen, the original display and its connector, then reconnect or replace as appropriate"
              width={1448}
              height={1086}
              sizes="(max-width: 900px) calc(100vw - 48px), 1040px"
            />
          </a>
          <figcaption>
            An explanatory illustration of Ali Mobile&apos;s genuine workshop process, not photographic evidence of an individual repair. Open the image to view the full-size text.
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="black-screen-causes">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Common causes</p><h2 id="black-screen-causes">Why phone displays go black</h2></div>
          <p>A black display is a symptom. The correct repair depends on whether the panel, connection, software or another circuit has failed.</p>
        </div>
        <div className={styles.causeList}>
          {causes.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="safe-black-screen-checks">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Before repair</p><h2 id="safe-black-screen-checks">Safe checks you can try</h2></div>
          <p>Stop if the phone is hot, swollen, wet, smoking or visibly damaged around the battery. Do not keep charging or repeatedly power-test a device when an electrical hazard is suspected.</p>
        </div>
        <ol className={styles.checkList}>
          <li>Call the phone from another device and listen for ringing, vibration or notification sounds.</li>
          <li>If it is dry, cool and undamaged, connect a known-working compatible charger and allow a deeply discharged battery about 10 minutes to respond.</li>
          <li>Try the manufacturer&apos;s model-appropriate forced restart without repeatedly guessing button combinations.</li>
          <li>Look for faint images, coloured lines, flashes, black patches or a working section of the display without pressing or bending the screen.</li>
          <li>If the phone remains blank, arrange diagnosis rather than opening it or disconnecting the battery yourself.</li>
        </ol>
        <p className={styles.guidanceLinks}>
          See official restart guidance from <a href="https://support.apple.com/en-au/116940">Apple</a>, <a href="https://www.samsung.com/us/support/answer/ANS10001374/">Samsung</a> or <a href="https://support.google.com/pixelphone/answer/7167687?hl=en">Google Pixel</a> for the exact device controls.
        </p>
      </section>

      <section aria-labelledby="real-black-screen-repairs">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Real workshop examples</p><h2 id="real-black-screen-repairs">Three genuine screen replacement cases</h2></div>
          <p>These are Ali Mobile repair photographs. Each case shows the visible symptom and the screen replacement outcome without claiming unrecorded diagnostic findings.</p>
        </div>
        <div className={styles.repairGallery}>
          {repairCases.map((repair) => (
            <article className={styles.repairCase} key={repair.model}>
              <h3>{repair.model}</h3>
              <p>{repair.description}</p>
              <div className={styles.photoPair}>
                <figure><Image src={repair.before} alt={repair.beforeAlt} width={1200} height={1600} sizes="(max-width: 640px) 44vw, 480px" /><figcaption>Before repair</figcaption></figure>
                <figure><Image src={repair.after} alt={repair.afterAlt} width={1200} height={1600} sizes="(max-width: 640px) 44vw, 480px" /><figcaption>After screen replacement</figcaption></figure>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="screen-replacement-prices">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Published catalogue prices</p><h2 id="screen-replacement-prices">Phone screen replacement price ranges</h2></div>
          <p>These compact ranges cover valid published screen-replacement prices across supported models and available grades. Your exact price depends on the model, confirmed fault and replacement option.</p>
        </div>
        {priceTable && priceTable.rows.length > 0 ? (
          <div className={styles.priceList}>
            {priceTable.rows.map(({ brand, href, range }) => (
              <Link href={href} prefetch={false} className={styles.priceRow} key={brand}>
                <span><strong>{brand}</strong><small>Published range across supported models</small></span>
                <b>{range.min === range.max ? formatPrice(range.min) : `${formatPrice(range.min)}–${formatPrice(range.max)}`}</b>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.catalogueNotice}>Current published screen prices are temporarily unavailable. Contact the store with your exact model for a quote.</p>
        )}
        <p className={styles.priceNote}>Quote-required models are not included. Prices can change with parts and model availability; diagnosis may show that the screen is not the failed component.</p>
        <Link className={styles.textLink} href="/repairs/screen-replacement" prefetch={false}>Explore screen replacement options</Link>
      </section>

      <section className={styles.serviceFacts} aria-labelledby="repair-time-data-warranty">
        <div className={styles.serviceFactsHeading}><p className={styles.eyebrow}>What to expect</p><h2 id="repair-time-data-warranty">Data, timing and warranty</h2></div>
        <div className={styles.serviceFactList}>
          <article>
            <span className={styles.factIcon} aria-hidden="true"><Database size={22} /></span>
            <div><h3>Your Data</h3><p className={styles.keyStatement}>Standard screen replacement <strong>normally does not require a factory reset</strong>.</p><p>Ali Mobile does not normally erase photos, apps or other personal data for this repair. Back up important data where possible; data safety cannot be guaranteed for every damaged or liquid-exposed device.</p></div>
          </article>
          <article>
            <span className={styles.factIcon} aria-hidden="true"><Clock3 size={22} /></span>
            <div><h3>Repair Time</h3><p className={styles.keyStatement}><strong>Approximately 30–60 minutes</strong> for straightforward screen replacements when the fault is confirmed and the correct part is available.</p><p>Model design, further diagnostics, complex damage and parts availability can extend the repair time.</p></div>
          </article>
          <article>
            <span className={styles.factIcon} aria-hidden="true"><ShieldCheck size={22} /></span>
            <div><h3>Warranty</h3><p className={styles.keyStatement}><strong>6-Month Warranty</strong> for eligible completed screen repairs.</p><p>Parts and labour warranty terms and exclusions apply. Warranty coverage does not limit rights under Australian Consumer Law.</p></div>
          </article>
        </div>
      </section>

      <section aria-labelledby="black-screen-faq">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Practical answers</p><h2 id="black-screen-faq">Black-screen phone FAQ</h2></div></div>
        <div className={styles.faqList}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </section>

      <section className={styles.finalCta} aria-labelledby="black-screen-booking">
        <div><p className={styles.eyebrow}>Ali Mobile &amp; Repair, Ringwood</p><h2 id="black-screen-booking">Need your black screen checked?</h2><p>Visit us at Ringwood Square Shopping Centre or call <a href="tel:0481058514">0481 058 514</a>. We will confirm the likely repair path and available options before proceeding.</p></div>
        <Link href="/book-repair" prefetch={false}>Book a repair assessment</Link>
      </section>
    </div>
  );
}
