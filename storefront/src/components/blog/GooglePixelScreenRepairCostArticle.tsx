import Image from "next/image";
import Link from "next/link";

import type {
  GooglePixelScreenRepairPriceRow,
  GooglePixelScreenRepairPriceTable,
} from "@/data/googlePixelScreenRepairCost";

import styles from "./GooglePixelScreenRepairCostArticle.module.css";

const QUALITY_ORDER = ["Genuine", "Premium", "Standard", "Current price"];

function formatPrice(price: number) {
  return `$${price}`;
}

function catalogueFreshnessLabel(fetchedAt: string | null) {
  if (!fetchedAt || Number.isNaN(new Date(fetchedAt).getTime())) return null;

  return new Date(fetchedAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  });
}

function generation(model: string) {
  return Number(model.match(/Pixel\s+(\d+)/i)?.[1] ?? 0);
}

function compareQuality(left: string, right: string) {
  const leftIndex = QUALITY_ORDER.indexOf(left);
  const rightIndex = QUALITY_ORDER.indexOf(right);
  return (leftIndex === -1 ? QUALITY_ORDER.length : leftIndex)
    - (rightIndex === -1 ? QUALITY_ORDER.length : rightIndex)
    || left.localeCompare(right);
}

function rowOptions(row: GooglePixelScreenRepairPriceRow) {
  const labels = new Set([...Object.keys(row.prices), ...row.quoteTiers]);
  return [...labels].sort(compareQuality).map((quality) => ({
    quality,
    price: row.prices[quality],
    isQuote: row.quoteTiers.includes(quality),
  }));
}

function PriceTable({ rows, label }: { rows: GooglePixelScreenRepairPriceRow[]; label: string }) {
  return (
    <div className={styles.tableFrame} aria-label={label}>
      <table className={styles.priceTable}>
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Model</th>
            <th scope="col">Available screen option</th>
            <th scope="col">Current price</th>
          </tr>
        </thead>
        <tbody>
          {rows.flatMap((row) => rowOptions(row).map(({ quality, price, isQuote }) => {
            const priceText = price === undefined ? (isQuote ? "Quote" : "—") : formatPrice(price);
            const href = `/repairs/phone/google-pixel/${row.slug}/screen-replacement`;

            return (
              <tr key={`${row.slug}-${quality}`} aria-label={`${row.model}, ${quality}, ${priceText}`}>
                <th scope="row" data-label="Model">
                  <Link className={styles.modelLink} href={href} prefetch={false}>{row.model}</Link>
                </th>
                <td data-label="Screen option">{quality}</td>
                <td className={styles.priceCell} data-label="Current price">{priceText}</td>
              </tr>
            );
          }))}
        </tbody>
      </table>
    </div>
  );
}

const repairExamples = [
  {
    model: "Pixel 9",
    href: "/repairs/phone/google-pixel/pixel-9/screen-replacement",
    description: "This Pixel 9 arrived with severe line damage and a partially failed display. The replacement screen restored a clear, working image during post-repair testing.",
    before: {
      src: "/media/repair-results/d1f43583-ff07-4530-8a75-d0332792d8cd/before",
      alt: "Google Pixel 9 before screen replacement with cracked glass and vertical display lines",
      caption: "Before: cracked glass, vertical lines and a partially failed display.",
    },
    after: {
      src: "/media/repair-results/d1f43583-ff07-4530-8a75-d0332792d8cd/after",
      alt: "Google Pixel 9 after screen replacement with a clear working lock screen",
      caption: "After: the display is clear and working during final testing.",
    },
  },
  {
    model: "Pixel 7",
    href: "/repairs/phone/google-pixel/pixel-7/screen-replacement",
    description: "This Pixel 7 had extensive physical screen damage and no usable image. The after photo records the replacement display working during testing.",
    before: {
      src: "/media/repair-results/ab30828f-1c1b-4b95-96ec-e6613eb84bb6/before",
      alt: "Google Pixel 7 before screen replacement with extensive cracked glass and a black display",
      caption: "Before: extensive cracked glass and no usable display image.",
    },
    after: {
      src: "/media/repair-results/ab30828f-1c1b-4b95-96ec-e6613eb84bb6/after",
      alt: "Google Pixel 7 after screen replacement with the display working during testing",
      caption: "After: the display works during testing; the temporary screen-protection label is still attached.",
    },
  },
] as const;

const faqs = [
  {
    question: "How much does Google Pixel screen replacement cost?",
    answer: "The current fixed price depends on the exact Pixel model and the screen option listed for it. Use the live catalogue table above; models without a valid fixed amount are marked Quote rather than shown as $0.",
  },
  {
    question: "How long does a Google Pixel screen repair take?",
    answer: "Timing is confirmed after we identify the exact model, check the damage and confirm that the required part is available. Fold damage and additional frame, liquid or board faults can change the repair path.",
  },
  {
    question: "Will a Pixel screen replacement erase my data?",
    answer: <>A normal screen replacement does not intentionally erase customer data, but damaged devices can carry existing data risk. <strong>Back up important information</strong> before repair whenever the screen condition allows it.</>,
  },
  {
    question: "Can only the cracked Pixel glass be replaced?",
    answer: "Cracked outer glass can overlap with damage to the image or touch layers. Ali Mobile assesses the display assembly and provides the supported repair option for the exact model rather than promising glass-only work before inspection.",
  },
  {
    question: "Will the fingerprint sensor work after screen replacement?",
    answer: "Fingerprint behaviour is tested where applicable. Some under-display Pixel models may require the official calibration path after display work; Fold models use a different side-mounted sensor arrangement.",
  },
  {
    question: "Will the replacement screen quality be the same?",
    answer: <>Ali Mobile offers <strong>genuine parts for supported Pixel models</strong>. We confirm model compatibility and parts availability before repair. A different POS catalogue grade is not represented as Genuine.</>,
  },
  {
    question: "Will my Pixel still be water-resistant after repair?",
    answer: <>No factory IP rating is promised after the phone has been opened. Adhesive is handled during reassembly, but screen replacement <strong>does not restore the factory IP rating</strong>, so avoid intentional water exposure.</>,
  },
  {
    question: "Is Google Pixel screen repair worth it?",
    answer: "Compare the confirmed repair cost with the phone's condition, battery health, other damage, remaining value and how long you plan to keep it. Replacement may be more practical when several major faults are present.",
  },
  {
    question: "What warranty applies to an eligible Pixel screen repair?",
    answer: <>Eligible completed screen repairs include a <strong>6-month warranty on the fitted part and workmanship</strong>. New impact, bending, liquid damage, misuse, third-party work and unrelated faults are excluded, and Australian Consumer Law rights are not limited.</>,
  },
] as const;

export function GooglePixelScreenRepairCostArticle({
  priceTable,
}: {
  priceTable: GooglePixelScreenRepairPriceTable | null;
}) {
  const currentRows = priceTable?.rows.filter((row) => generation(row.model) >= 7) ?? [];
  const legacyRows = priceTable?.rows.filter((row) => generation(row.model) < 7) ?? [];
  const freshnessLabel = catalogueFreshnessLabel(priceTable?.fetchedAt ?? null);
  const range = priceTable?.range;

  return (
    <div className={styles.article}>
      <section className={styles.guideNav} aria-labelledby="pixel-guide-heading">
        <h2 id="pixel-guide-heading">In this guide</h2>
        <nav aria-label="Google Pixel screen repair cost guide">
          <a href="#pixel-quick-answer">Quick answer</a>
          <a href="#pixel-price-table">Prices</a>
          <a href="#pixel-screen-options">Screen options</a>
          <a href="#pixel-fingerprint">Fingerprint checks</a>
          <a href="#pixel-repair-results">Real repairs</a>
          <a href="#pixel-faq">FAQs</a>
        </nav>
      </section>

      <section className={styles.readingSection} aria-labelledby="pixel-quick-answer">
        <h2 id="pixel-quick-answer">Google Pixel screen repair cost: quick answer</h2>
        {range ? (
          <p className={styles.answerLead}>
            Ali Mobile&apos;s currently published Google Pixel screen replacement prices range from <strong>{formatPrice(range.min)} to {formatPrice(range.max)}</strong> across the non-folding models with a valid published amount. Your exact price depends on the model and the screen option listed for it.
          </p>
        ) : (
          <p className={styles.answerLead}>
            Current fixed Google Pixel screen prices are temporarily unavailable from the public repair catalogue. Contact the store with the exact model so the available option can be confirmed.
          </p>
        )}
        <p>
          The table is generated from Ali Mobile&apos;s POS-backed public catalogue. A damaged frame, liquid exposure or another fault can change the repair path after inspection. Browse all <Link href="/repairs/phone/google-pixel" prefetch={false}>Google Pixel repair options</Link> if you are unsure which service applies.
        </p>
      </section>

      <section className={styles.wideSection} aria-labelledby="pixel-price-table">
        <h2 id="pixel-price-table">Current Google Pixel screen replacement prices</h2>
        <p><strong>Current repair prices</strong> retain the exact POS catalogue grade published for each model. A grade is never renamed, and multiple catalogue entries remain separate.</p>
        {priceTable && priceTable.rows.length > 0 ? (
          <>
            {currentRows.length > 0 && <PriceTable rows={currentRows} label="Current Google Pixel 7 and newer screen replacement prices" />}
            {legacyRows.length > 0 && (
              <details className={styles.legacyPrices} data-legacy-prices="true">
                <summary>Pixel 6 and earlier screen prices</summary>
                <PriceTable rows={legacyRows} label="Google Pixel 6 and earlier screen replacement prices" />
              </details>
            )}
          </>
        ) : (
          <p className={styles.catalogueNotice}>Current fixed Google Pixel screen prices are temporarily unavailable from the online catalogue. Contact us for a quote for your exact model.</p>
        )}
        <p className={styles.priceNote}><strong>Quote</strong> means the catalogue contains the repair option but no valid positive fixed price. No invalid or zero amount is displayed as an offer.</p>
        <p className={styles.priceNote}>
          {freshnessLabel ? `Catalogue snapshot refreshed ${freshnessLabel}. ` : ""}Prices may change with parts and model availability. See the broader <Link href="/repairs/screen-replacement" prefetch={false}>screen replacement service</Link> for the inspection path.
        </p>

        <aside className={styles.foldNotice}>
          <h3>Fold screen repair needs a component check</h3>
          <p>Pixel 9 Pro Fold and Pixel 10 Pro Fold have more than one display component. Their catalogue amounts are not included in this comparison or its price range because the damaged inner or cover display must be confirmed before a meaningful quote is given.</p>
        </aside>
      </section>

      <section className={styles.readingSection} aria-labelledby="pixel-price-factors">
        <h2 id="pixel-price-factors">Why do Google Pixel screen repair prices vary?</h2>
        <h3>Model and display assembly</h3>
        <p>Pixel generations, Pro and XL variants, a-series models and foldables do not all use the same display assembly. <strong>The exact model must be identified</strong> before the part or price is confirmed.</p>
        <h3>Frame and impact damage</h3>
        <p><strong>Frame and impact damage can change the repair path.</strong> A bent edge, damaged housing or trapped debris can stop a replacement screen from sitting safely. Black screens, lines and failed touch can also overlap with connector, liquid or board faults.</p>
        <h3>Part option and availability</h3>
        <p>The displayed option comes from the current catalogue for that model. <strong>Parts availability and the approved repair scope</strong> are confirmed before work begins.</p>
      </section>

      <section className={styles.readingSection} aria-labelledby="pixel-screen-options">
        <h2 id="pixel-screen-options">Genuine Google Pixel replacement parts</h2>
        <p>For supported models, Ali Mobile offers <strong>genuine Google Pixel screen replacement parts</strong> to help maintain the original display experience. We confirm exact model compatibility and <strong>parts availability</strong> before repair.</p>
        <p>The live table retains the original POS catalogue grade and price for accuracy. <strong>A different catalogue grade is never relabelled as Genuine</strong>, and its price is not used as a Genuine quote.</p>
      </section>

      <section className={styles.readingSection} aria-labelledby="pixel-screen-problems">
        <h2 id="pixel-screen-problems">Common Google Pixel screen problems</h2>
        <div className={styles.problemLayout}>
          <ul>
            <li><strong>Cracked glass:</strong> sharp edges and spreading cracks can make the phone unsafe to handle even while the image still works.</li>
            <li><strong>Black display:</strong> a Pixel may still ring or vibrate when the display assembly has failed, but power and board faults must also be ruled out.</li>
            <li><strong>Green or coloured lines:</strong> line damage can indicate failure within the display layer rather than only the outer glass.</li>
            <li><strong>Flicker, black spots or ink-like marks:</strong> these symptoms can follow pressure or impact damage and may worsen.</li>
            <li><strong>Touch not responding:</strong> dead areas or ghost touches can involve the touch layer, a connection or other impact damage.</li>
          </ul>
          <figure className={styles.problemImage}>
            <Image
              src="/images/blog/google-pixel-screen-repair-cost/pixel-screen-damage-repair-tools.webp"
              alt="Illustrative cracked phone screen beside professional repair tools"
              width={1122}
              height={1402}
              sizes="(max-width: 768px) 100vw, 34vw"
            />
            <figcaption>Illustrative image: screen and display damage can require more than an outer-glass repair.</figcaption>
          </figure>
        </div>
        <p>For safe checks before assuming the screen is the only fault, read <Link href="/blog/phone-screen-black-but-still-on" prefetch={false}>why a phone screen can stay black while the phone is still on</Link>.</p>
      </section>

      <section className={`${styles.readingSection} ${styles.calibrationFeature}`} aria-labelledby="pixel-fingerprint">
        <div className={styles.calibrationContent}>
          <h2 id="pixel-fingerprint">Genuine Google Pixel Screen Replacement &amp; Fingerprint Calibration</h2>
          <h3>Genuine replacement parts</h3>
          <p>At Ali Mobile &amp; Repair, we offer <strong>genuine screen replacement parts</strong> for supported Google Pixel models, helping maintain the original display experience.</p>
          <h3>Google fingerprint calibration</h3>
          <p>For compatible models with an under-display fingerprint sensor, we use <strong>Google&apos;s official fingerprint calibration software</strong> when required after screen replacement.</p>
          <h3>Post-repair function testing</h3>
          <p>We also carry out post-repair checks, including display quality and touch response, and <strong>test the fingerprint sensor</strong> where applicable. Customers can verify fingerprint enrolment and unlocking before collecting their devices when necessary.</p>
          <p>Our goal is to replace the damaged screen and confirm that the repaired device&apos;s key functions have been properly checked.</p>
          <p>Pixel 6 and later non-folding models use an under-display fingerprint path, while Fold models use a side-mounted sensor arrangement. These are different repair and testing paths.</p>
          <p>Google provides an official <a href="https://pixelrepair.withgoogle.com/" target="_blank" rel="noreferrer">Pixel Update and Software Repair tool</a> with a fingerprint calibration option, plus the <a href="https://support.google.com/pixelphone/answer/14257407?hl=en-AU" target="_blank" rel="noreferrer">Pixel Repair Diagnostics App</a>.</p>
          <p>Supported phones can also use <a href="https://support.google.com/pixelphone/answer/14266732?hl=en-AU" target="_blank" rel="noreferrer">Pixel Repair Mode</a> to limit access to personal data during service. <strong>Back up important data</strong> first and do not share the normal lock-screen PIN.</p>
          <p>All repairs are subject to model compatibility, <strong>parts availability</strong> and our applicable <strong>6-month repair warranty</strong>.</p>
        </div>
      </section>

      <section className={styles.wideSection} aria-labelledby="pixel-repair-results">
        <h2 id="pixel-repair-results">Real Google Pixel screen repair results</h2>
        <p>These public, privacy-checked repair records show actual Pixel screen faults before replacement and the working display visible during testing afterwards. The photos do not claim a screen grade beyond the option confirmed for that individual repair.</p>
        <div className={styles.repairExamples}>
          {repairExamples.map((example) => (
            <article className={styles.repairExample} key={example.model}>
              <h3><Link href={example.href} prefetch={false}>{example.model} screen replacement</Link></h3>
              <p>{example.description}</p>
              <div className={styles.photoPair}>
                {(["before", "after"] as const).map((state) => {
                  const photo = example[state];
                  return (
                    <figure className={styles.repairPhoto} key={state}>
                      <span className={styles.photoLabel}>{state === "before" ? "Before" : "After"}</span>
                      <Image src={photo.src} alt={photo.alt} width={1600} height={2133} sizes="(max-width: 640px) 100vw, 42vw" />
                      <figcaption>{photo.caption}</figcaption>
                    </figure>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.readingSection} aria-labelledby="pixel-repair-process">
        <h2 id="pixel-repair-process">Repair process, timing and warranty</h2>
        <ol>
          <li><strong>Confirm the model:</strong> inspect the display, touch response and frame.</li>
          <li><strong>Confirm the price:</strong> explain the available screen option, fixed price or quote requirements before work begins.</li>
          <li><strong>Replace the display:</strong> fit the supported assembly and handle the frame adhesive carefully.</li>
          <li><strong>Test key functions:</strong> check the image, touch, charging, cameras and fingerprint function where applicable.</li>
        </ol>
        <p>Repair timing is confirmed after the model, required part and damage are checked. A normal screen replacement does not intentionally erase data, but <strong>back up important information</strong> beforehand whenever possible.</p>
        <p>Eligible completed screen repairs include a <strong>6-month warranty on the fitted part and workmanship</strong>. New impact, bending, liquid damage, misuse, third-party work and unrelated faults are excluded. Opening and resealing a Pixel <strong>does not restore the factory IP rating</strong>, so intentional water exposure should be avoided after repair.</p>
      </section>

      <section className={styles.readingSection} aria-labelledby="pixel-repair-value">
        <h2 id="pixel-repair-value">Is Google Pixel screen repair worth it?</h2>
        <p>Compare the <strong>confirmed repair cost</strong> with the phone&apos;s overall condition, battery health, other damage, remaining value and expected use. Repair can make sense when the phone is otherwise reliable and its data or setup matters to you. If it has several major faults or a badly distorted frame, <strong>replacement may be more practical</strong>.</p>
      </section>

      <section className={styles.readingSection} aria-labelledby="pixel-faq">
        <h2 id="pixel-faq">Google Pixel screen replacement FAQs</h2>
        <div className={styles.faqList}>
          {faqs.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.bookingPanel} aria-labelledby="pixel-booking">
        <h2 id="pixel-booking">Book a Google Pixel screen assessment in Ringwood</h2>
        <p>Bring the phone to Ali Mobile &amp; Repair at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134. We confirm the model, screen option, price and timing before work begins.</p>
        <Link href="/book-repair" prefetch={false}>Book a repair assessment</Link>
      </section>
    </div>
  );
}
