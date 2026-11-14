import Link from "next/link";
import Image from "next/image";

import type {
  IpadScreenRepairPriceTable,
  IpadScreenRepairScope,
} from "@/data/ipadScreenRepairCost";

import styles from "./IpadScreenRepairCostArticle.module.css";

const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const repairPhotos = [
  {
    model: "iPad 7th Generation",
    before: "ipad-7th-generation-screen-replacement-before.webp",
    after: "ipad-7th-generation-screen-replacement-after.webp",
    note: "The front glass was extensively cracked before repair. The after photo shows the screen displaying an image again; the photos alone do not establish the LCD condition before repair.",
  },
  {
    model: "iPad 9th Generation",
    before: "ipad-9th-generation-screen-replacement-before.webp",
    after: "ipad-9th-generation-screen-replacement-after.webp",
    note: "The front surface was heavily cracked. The after photo shows a working display; an unrelated lock-screen notification has been obscured for privacy.",
  },
  {
    model: "iPad Pro 10.5-inch",
    before: "ipad-pro-10.5-inch-screen-replacement-before.webp",
    after: "ipad-pro-10.5-inch-screen-replacement-after.webp",
    note: "The before photo shows screen damage near the upper edge. The after photo shows a lit replacement screen. This older Pro model is a repair example, not a current public price listing.",
  },
] as const;

const photoBase = "/images/blog/ipad-screen-repair-cost/";

const symptoms = [
  ["Cracked glass", "The outer glass may be damaged while the picture still looks normal. Sharp or loose glass should not be left exposed."],
  ["Black screen", "A display, connection, power or other internal fault can cause a black screen. Diagnosis is required before a screen is ordered."],
  ["Touch not working", "Dead zones or failed swipes can point to digitiser damage, but connectors and wider impact damage also need checking."],
  ["Ghost touch", "Unwanted taps, typing or scrolling can follow digitiser damage, frame pressure or another hardware fault."],
  ["Flickering or lines", "Unstable brightness, coloured lines or blocked areas often indicate display-panel or connection damage."],
  ["Black spots", "Ink-like patches or spreading dark areas usually indicate damage below the outer glass."],
  ["Screen lifting", "A bent frame, poor seating, damaged adhesive or a swollen battery can lift the screen and each needs a different response."],
] as const;

const faqs = [
  {
    question: "Can I replace just the glass on my iPad?",
    answer: "On the supported standard iPad 5th–11th Generation models, the published service can replace the front glass and touchscreen digitiser while retaining a working LCD. Supported Air, mini and Pro models use a full display assembly service.",
  },
  {
    question: "Does standard iPad glass replacement include the LCD?",
    answer: "No. The standard iPad prices in this guide cover the front glass and touchscreen digitiser only. If the LCD has lines, black areas, image loss or other damage, contact Ali Mobile for a separate assessment and quote.",
  },
  {
    question: "Does iPad Air, mini or Pro screen replacement include the display?",
    answer: "For the currently supported Air, mini and Pro models listed in the full-display table, the service covers the complete display assembly. The exact assembly and display technology still depend on the model.",
  },
  {
    question: "Can you fix an iPad with black lines or dark spots?",
    answer: "These symptoms can indicate display-panel damage. The display output, connections and device condition are checked before the appropriate repair is confirmed.",
  },
  {
    question: "Can you repair an iPad with a bent frame?",
    answer: "Minor distortion may sometimes be corrected safely to improve screen fit. Severe bending, structural damage or inward corner damage may make the repair risky or unsuitable, so an inspection is required.",
  },
  {
    question: "Why is my iPad screen lifting?",
    answer: "Possible causes include frame distortion, damaged adhesive, impact at a corner or internal pressure from a swollen battery. Do not press the screen down; stop using the iPad if swelling, heat, odour or other battery warning signs are present.",
  },
  {
    question: "Will I lose my data during iPad screen repair?",
    answer: "A standard screen repair does not normally require erasing the iPad. Back up important data first whenever the device is safe and stable enough to use, because unrelated damage can still create data risk.",
  },
  {
    question: "How long does iPad screen repair take?",
    answer: "Most straightforward iPad screen repairs can take approximately one hour once the correct part is available. Repair time may be longer if the frame is bent, additional faults are found, or extra fitting, adhesive curing or testing is needed. Contact the Ringwood store for a model-specific estimate.",
  },
  {
    question: "Is there a warranty on iPad screen repairs?",
    answer: "Eligible iPad screen repairs include a six-month warranty covering the replacement part and workmanship, subject to our repair terms. New drops, external force, bending, liquid damage and unrelated faults are outside the ordinary repair warranty. This does not limit rights under Australian Consumer Law.",
  },
] as const;

type Props = {
  priceTable: IpadScreenRepairPriceTable | null;
};

function catalogueFreshnessLabel(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `Catalogue snapshot refreshed ${date.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Australia/Melbourne",
  })}.`;
}

function scopeLabel(scope: IpadScreenRepairScope) {
  return scope === "glass-digitiser" ? "Glass & Digitiser Only — LCD Not Included" : "Full Display Assembly";
}

function PriceList({
  priceTable,
  scope,
  caption,
}: {
  priceTable: IpadScreenRepairPriceTable;
  scope: IpadScreenRepairScope;
  caption: string;
}) {
  const rows = priceTable.rows.filter((row) => row.scope === scope);
  if (rows.length === 0) {
    return <div className={styles.catalogueNotice}>No current POS-origin models are published in this repair group. Contact the store for model confirmation.</div>;
  }

  return (
    <div className={styles.priceList} role="list" aria-label={caption}>
      {rows.map((row) => (
        <Link
          className={styles.priceRow}
          href={`/repairs/tablet/ipad/${row.modelSlug}/screen-replacement`}
          key={row.modelSlug}
          role="listitem"
        >
          <span className={styles.modelBlock}>
            <strong>{row.model}</strong>
            <span>{scopeLabel(row.scope)}</span>
          </span>
          <span className={`${styles.priceLabel} ${row.isQuote ? styles.quote : ""}`}>
            {row.price !== null
              ? `Screen replacement from ${currency.format(row.price)}`
              : "Screen replacement — Quote Required"}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function IpadScreenRepairCostArticle({ priceTable }: Props) {
  const freshness = catalogueFreshnessLabel(priceTable?.fetchedAt ?? null);

  return (
    <div className={styles.article}>
      <section className={styles.quickAnswer} aria-labelledby="ipad-quick-answer">
        <p className={styles.eyebrow}>Quick answer</p>
        <h2 id="ipad-quick-answer">A cracked iPad does not always need the same screen repair</h2>
        <p className={styles.lead}>
          The right repair depends on the exact model, whether the picture still works, how touch responds
          and whether the frame was damaged. For supported <strong>standard iPad 5th–11th Generation</strong>
          {" "}models, the listed service is front glass and touchscreen digitiser replacement only. For the
          supported <strong>iPad Air, mini and Pro</strong> models below, it is a complete display assembly.
        </p>
        <dl className={styles.factGrid}>
          <div><dt>Standard iPad</dt><dd>Glass & digitiser only</dd></div>
          <div><dt>Air / mini / Pro</dt><dd>Full display assembly</dd></div>
          <div><dt>LCD damage</dt><dd>Separate quote where required</dd></div>
          <div><dt>Price source</dt><dd>Public POS catalogue</dd></div>
        </dl>
      </section>

      <section className={styles.priceSection} aria-labelledby="ipad-prices">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Current catalogue</p>
            <h2 id="ipad-prices">How much does iPad screen repair cost?</h2>
          </div>
          <p>
            These server-rendered prices come from the existing POS → Storefront public repair catalogue.
            Invalid or unavailable amounts remain <strong>Quote Required</strong>; this guide never substitutes
            a made-up price.
          </p>
        </div>

        {priceTable && priceTable.rows.length > 0 ? (
          <>
            <div className={styles.priceGroup}>
              <h3>Standard iPad glass and digitiser prices</h3>
              <p>
                For the listed standard iPad 5th–11th Generation models, this price covers the front glass
                and touchscreen digitiser. It <strong>does not include LCD replacement</strong>. If the LCD has
                lines, black areas, image loss or other damage, contact the store for a separate quote.
              </p>
              <PriceList
                priceTable={priceTable}
                scope="glass-digitiser"
                caption="Current standard iPad glass and touchscreen digitiser prices in Australian dollars"
              />
            </div>

            <div className={styles.priceGroup}>
              <h3>iPad Air, mini and Pro full display prices</h3>
              <p>
                The supported models in this table use a complete display assembly service, including the
                glass, touch layer and display panel. OLED and LCD are different display technologies, so the
                exact part is always matched to the model rather than calling every panel an LCD.
              </p>
              <PriceList
                priceTable={priceTable}
                scope="full-display"
                caption="Current iPad Air, iPad mini and iPad Pro full display assembly prices in Australian dollars"
              />
            </div>
          </>
        ) : (
          <div className={styles.catalogueNotice} role="status">
            Current iPad prices are temporarily unavailable. Choose your model or contact Ali Mobile for the
            current price or Quote status; no fixed fallback amount is shown.
          </div>
        )}

        <p className={styles.priceNote}>
          Each row shows the lowest current valid public price for that model, or Quote Required when no valid
          amount is published. Prices may change as parts pricing changes. {freshness}
        </p>
        <div className={styles.actions}>
          <Link href="/repairs/tablet/ipad">Choose your iPad model</Link>
          <Link href="/book-repair">Book a repair</Link>
        </div>
      </section>

      <section aria-labelledby="construction-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Repair scope</p>
            <h2 id="construction-heading">Glass, digitiser and display construction</h2>
          </div>
          <p>The visible crack does not by itself identify every damaged layer.</p>
        </div>
        <div className={styles.splitCards}>
          <article>
            <h3>Standard iPad: separate glass and LCD</h3>
            <p>
              On the supported standard models, the front glass and touch digitiser can be replaced while a
              working LCD is retained. A clear picture with cracked glass may suit this repair after inspection.
            </p>
            <p>
              If the image also has black patches, coloured lines or no picture, the LCD may be damaged and
              needs a separate quote.
            </p>
          </article>
          <article>
            <h3>Supported Air, mini and Pro: laminated assembly</h3>
            <p>
              The currently supported models in the full-display table are repaired as a laminated assembly.
              That assembly combines glass, touch and the display rather than using the standard glass-only path.
            </p>
            <p>
              Display technology varies by model, including LCD-based and OLED panels. Older Air and mini
              generations can use different construction, so unlisted models must be confirmed individually.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="symptoms-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Fault guide</p>
            <h2 id="symptoms-heading">What common iPad screen symptoms can mean</h2>
          </div>
          <p>Similar symptoms can come from different parts, so diagnosis comes before the final quote.</p>
        </div>
        <div className={styles.symptomGrid}>
          {symptoms.map(([title, explanation]) => (
            <article key={title}><h3>{title}</h3><p>{explanation}</p></article>
          ))}
        </div>
        <div className={styles.safetyNote}>
          <strong>Safety note:</strong> stop using the iPad and seek prompt assessment if screen lifting is
          accompanied by swelling, unusual heat, odour, smoke or hissing. Do not force a raised screen down.
        </div>
      </section>

      <section aria-labelledby="frame-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Frame condition</p>
            <h2 id="frame-heading">Why bent frames and dented corners matter</h2>
          </div>
          <p>A replacement screen needs a clean, level seating surface without ongoing edge pressure.</p>
        </div>
        <div className={styles.frameCard}>
          <p>
            Before fitting a part, we inspect the display output, touch response and frame condition, including
            corners pushed inward by impact. Where appropriate and safe, a technician may carefully realign
            minor distortion or clear obstructing damaged material so the replacement screen is not kept under
            pressure, forced upward or exposed to avoidable repeat damage.
          </p>
          <p>
            Severe deformation cannot always be corrected safely. If the frame is structurally compromised,
            correction risks internal damage, or a screen cannot sit reliably, we explain the limitations and
            alternatives before work proceeds. Correction may leave cosmetic marks and does not guarantee the
            original factory shape can be restored.
          </p>
        </div>
      </section>

      <section aria-labelledby="real-repairs-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Workshop photos</p>
            <h2 id="real-repairs-heading">Real iPad Screen Repairs at Ali Mobile</h2>
          </div>
          <p>These are photos of actual devices at our repair desk. The illustrated image in the page header is separate from these examples.</p>
        </div>
        <div className={styles.repairGallery}>
          {repairPhotos.map(({ model, before, after, note }) => (
            <article className={styles.repairExample} key={model}>
              <h3>{model}</h3>
              <div className={styles.photoPair}>
                <figure>
                  <Image
                    src={`${photoBase}${before}`}
                    alt={`${model} with a damaged front screen before repair`}
                    width={1400}
                    height={1050}
                    sizes="(max-width: 720px) calc(100vw - 4rem), (max-width: 1200px) 42vw, 500px"
                    loading="lazy"
                  />
                  <figcaption>Before</figcaption>
                </figure>
                <figure>
                  <Image
                    src={`${photoBase}${after}`}
                    alt={`${model} with the screen displaying an image after repair`}
                    width={1400}
                    height={model === "iPad 9th Generation" ? 1032 : 1050}
                    sizes="(max-width: 720px) calc(100vw - 4rem), (max-width: 1200px) 42vw, 500px"
                    loading="lazy"
                  />
                  <figcaption>After</figcaption>
                </figure>
              </div>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.repairInfo} aria-labelledby="repair-info-heading">
        <h2 id="repair-info-heading">Repair time and warranty</h2>
        <p>Most straightforward iPad screen repairs can take approximately one hour once the correct part is available. Repair time may be longer if the frame is bent, additional faults are found, or extra fitting, adhesive curing or testing is needed.</p>
        <p>Eligible iPad screen repairs include a six-month warranty covering the replacement part and workmanship, subject to our repair terms. New drops, external force and liquid damage are outside the ordinary repair warranty. Australian Consumer Law rights still apply.</p>
      </section>

      <section aria-labelledby="process-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Workshop process</p>
            <h2 id="process-heading">How Ali Mobile assesses and repairs an iPad screen</h2>
          </div>
          <p>The repair scope is agreed after model, screen and frame checks—not from the crack alone.</p>
        </div>
        <ol className={styles.processList}>
          <li><div><strong>Confirm the exact model</strong><p>We check the family, generation, screen size and A-number where available.</p></div></li>
          <li><div><strong>Inspect display, touch and frame</strong><p>We test image output, brightness and touch response, then inspect edges, corners, lifting and wider impact signs.</p></div></li>
          <li><div><strong>Confirm repair scope and quote</strong><p>Glass/digitiser, separate LCD work or a full display assembly is explained before approval, including frame limitations.</p></div></li>
          <li><div><strong>Remove damaged components</strong><p>The technician opens the device using the appropriate method and protects internal components during disassembly.</p></div></li>
          <li><div><strong>Prepare the seating surface</strong><p>Old adhesive and debris are removed, and approved minor frame or corner work is performed only where safe.</p></div></li>
          <li><div><strong>Fit and secure the part</strong><p>The compatible component is aligned without avoidable pressure and secured using the appropriate adhesive and process.</p></div></li>
          <li><div><strong>Test before handover</strong><p>Display output, touch response, brightness, fit and relevant functions affected by the repair are checked. We confirm aftercare and the applicable repair warranty; extra testing or adhesive curing may extend the turnaround.</p></div></li>
        </ol>
      </section>

      <section aria-labelledby="faq-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Common questions</p>
            <h2 id="faq-heading">iPad screen repair FAQs</h2>
          </div>
          <p>Model and device condition still determine the final repair.</p>
        </div>
        <div className={styles.faqList}>
          {faqs.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="ipad-next-step">
        <div>
          <p className={styles.eyebrow}>Ringwood repair desk</p>
          <h2 id="ipad-next-step">Find the right repair for your iPad</h2>
          <p>
            Choose the exact model to review current repair options, or book an assessment for LCD damage,
            touch faults, lifting or frame concerns. You can also compare the broader
            {" "}<Link href="/repairs/screen-replacement">screen replacement service</Link> first.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/repairs/tablet/ipad">View iPad repair options</Link>
          <Link href="/book-repair">Book a repair</Link>
        </div>
      </section>
    </div>
  );
}
