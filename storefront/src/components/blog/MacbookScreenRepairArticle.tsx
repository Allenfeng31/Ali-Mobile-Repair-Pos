import Image from "next/image";
import Link from "next/link";

import type { MacbookAirScreenRepairPriceTable } from "@/data/macbookScreenRepairBlog";

import styles from "./MacbookScreenRepairArticle.module.css";

const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const symptoms = [
  ["Cracked glass or ink-like black areas", "Physical display damage is likely, but the lid and lower chassis still need inspection."],
  ["Vertical lines or coloured bands", "The display panel or its connection may be damaged. Diagnosis confirms whether the assembly is the cause."],
  ["Flickering or image loss at some angles", "The display assembly, cable path or another component may be involved."],
  ["Backlight on but no usable picture", "A screen, backlight, logic-board or power fault can produce a similar symptom."],
  ["Mac starts but the screen stays black", "Test the complete display path before ordering a screen; a black screen is not proof of panel failure."],
  ["Bent or dented display lid", "A complete assembly may address damage contained in the replaced lid, but not hinges or the lower chassis."],
] as const;

const faqs = [
  {
    question: "How much does MacBook Air screen replacement cost?",
    answer: "The current public prices for supported MacBook Air models appear in the table above. The exact amount depends on the model, year and available display option. If the catalogue does not hold a valid public price, the table shows Quote Required instead of $0 or an estimate.",
  },
  {
    question: "How much does MacBook Pro screen replacement cost?",
    answer: "MacBook Pro prices are not included in this MacBook Air table. Choose the exact MacBook Pro in the model finder above to see its available repair options and request the correct current quote.",
  },
  {
    question: "How long does MacBook screen replacement take?",
    answer: "The hands-on replacement work is usually about one hour once the correct part is available and the fault is confirmed. Parts ordering, the repair queue, extra diagnosis and final testing are separate and can extend the overall turnaround.",
  },
  {
    question: "Can I replace only the MacBook screen glass?",
    answer: "No. Ali Mobile does not offer glass-only MacBook screen replacement. The standard service replaces the complete display assembly rather than bonding new glass onto a damaged display panel.",
  },
  {
    question: "Does a full display replacement include the metal lid?",
    answer: "Yes. The complete display assembly includes the display panel, screen assembly and outer metal display housing or lid. Unrelated hinges, the lower chassis and other structural damage still need separate inspection.",
  },
  {
    question: "Can I still use my MacBook with a cracked screen?",
    answer: "Sometimes. A MacBook may still start even when the display has cracks, lines, black areas or partial image loss. Avoid pressure and repeated lid movement, back up safely if possible, and stop using it if there is liquid exposure, unusual heat, battery swelling, smoke or another safety concern.",
  },
  {
    question: "Will I lose my files during screen replacement?",
    answer: "A normal display assembly replacement does not require erasing the MacBook storage. Back up important files first if the MacBook is safe and stable to use, because wider damage or an unrelated fault can still create data risk.",
  },
  {
    question: "Does MacBook screen replacement include a warranty?",
    answer: "Eligible completed standard screen repairs include a 6-month parts and labour warranty, subject to Ali Mobile's warranty terms and exclusions. It does not cover new accidental damage, liquid damage, another drop or unrelated faults.",
  },
  {
    question: "Do I need to book before visiting?",
    answer: "Walk-ins are welcome, but booking or calling first is recommended so Ali Mobile can confirm the exact model, likely repair path and current part availability before you travel.",
  },
  {
    question: "What if my MacBook screen is black but not cracked?",
    answer: "A black screen is not proof that the display panel needs replacement. The display assembly, backlight, logic board, power system or another component may be involved, so the MacBook should be diagnosed before a screen is ordered.",
  },
] as const;

type Props = {
  priceTable: MacbookAirScreenRepairPriceTable | null;
};

export function MacbookScreenRepairArticle({ priceTable }: Props) {
  return (
    <div className={styles.article}>
      <section className={styles.quickAnswer} aria-labelledby="macbook-quick-answer">
        <p className={styles.eyebrow}>Quick answer</p>
        <h2 id="macbook-quick-answer">Can a broken MacBook screen be repaired?</h2>
        <p className={styles.lead}>
          Yes. A cracked or damaged MacBook screen can often be repaired by replacing the <strong>complete
          display assembly</strong>—not only the glass. That assembly includes the display panel, screen
          assembly and outer metal lid or housing. The hands-on repair is typically <strong>about one hour
          once the correct part is available</strong>, followed by testing.
        </p>
        <dl className={styles.factGrid}>
          <div><dt>Price</dt><dd>Model-specific prices below</dd></div>
          <div><dt>Repair time</dt><dd>About 1 hour*</dd></div>
          <div><dt>Warranty</dt><dd>6 months*</dd></div>
          <div><dt>Replacement</dt><dd>Complete display assembly</dd></div>
        </dl>
        <p className={styles.finePrint}>
          *Once the correct part is available and the diagnosis is confirmed. Ordering, queue time and
          extra diagnosis are separate. Warranty terms and exclusions apply.
        </p>
      </section>

      <section className={styles.priceSection} aria-labelledby="macbook-air-prices">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Current catalogue</p>
            <h2 id="macbook-air-prices">MacBook Air screen replacement prices</h2>
          </div>
          <p>
            These server-rendered amounts come from the existing POS → Storefront public repair
            catalogue. The table never substitutes an invented price when the catalogue has no valid
            positive amount.
          </p>
        </div>

        {priceTable && priceTable.rows.length > 0 ? (
          <div className={styles.tableFrame} tabIndex={0} aria-label="Scrollable MacBook Air screen price table">
            <table className={styles.priceTable}>
              <caption>Current public MacBook Air screen replacement prices in Australian dollars</caption>
              <thead>
                <tr>
                  <th scope="col">MacBook Air model</th>
                  {priceTable.columns.map((column) => <th scope="col" key={column}>{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {priceTable.rows.map((row) => (
                  <tr key={row.modelSlug}>
                    <th scope="row">
                      <Link href={`/repairs/laptop/macbook/${row.modelSlug}/screen-replacement`}>
                        {row.model}
                      </Link>
                    </th>
                    {priceTable.columns.map((column) => {
                      const price = row.prices[column];
                      return (
                        <td key={column} data-label={column}>
                          {price !== undefined
                            ? currency.format(price)
                            : row.quoteTiers.includes(column)
                              ? <span className={styles.quote}>Quote Required</span>
                              : <span aria-label="Not listed">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.catalogueNotice} role="status">
            Current MacBook Air prices are temporarily unavailable. Choose your model to request a
            confirmed quote; no fallback amount has been inserted.
          </div>
        )}
        <p className={styles.priceNote}>
          Confirm the model and condition before booking. Parts availability and additional faults can
          change the final repair path.
        </p>

        <aside className={styles.proCta} aria-labelledby="macbook-pro-cta">
          <div>
            <p className={styles.eyebrow}>MacBook Pro</p>
            <h3 id="macbook-pro-cta">Need a MacBook Pro screen quote?</h3>
            <p>Choose the exact MacBook Pro in the existing model finder to see its current repair options.</p>
          </div>
          <Link href="/repairs/laptop/macbook#models-list">View MacBook Pro screen repair prices</Link>
        </aside>
      </section>

      <section aria-labelledby="display-assembly-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Scope of repair</p>
            <h2 id="display-assembly-heading">What the complete display assembly includes</h2>
          </div>
          <p>
            Replacing the assembly avoids bonding new glass onto a damaged panel and avoids reusing a
            bent display lid. It does not make the entire MacBook new.
          </p>
        </div>
        <div className={styles.splitCards}>
          <article>
            <h3>Included in the screen assembly</h3>
            <ul>
              <li>Display panel and backlight assembly.</li>
              <li>Outer metal display lid or housing.</li>
              <li>Model-specific display cabling and attached components supplied with that assembly.</li>
            </ul>
          </article>
          <article className={styles.boundaryCard}>
            <h3>Not automatically fixed</h3>
            <ul>
              <li>Lower chassis, keyboard case or unrelated cosmetic damage.</li>
              <li>Separate hinge, logic-board, liquid or power faults.</li>
              <li>New accidental damage, another drop or future display damage.</li>
            </ul>
          </article>
        </div>
      </section>

      <section aria-labelledby="repair-results-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Repair evidence</p>
            <h2 id="repair-results-heading">Real MacBook Air screen repair results</h2>
          </div>
          <p>
            These are Ali Mobile workshop photos supplied for this article. Exact model labels are
            intentionally withheld until each image pair is matched to its repair record.
          </p>
        </div>
        <div className={styles.resultGrid}>
          <figure>
            <div className={styles.imagePair}>
              <div><span>Before</span><Image src="/images/blog/macbook-screen-repair/a2337-before.webp" alt="MacBook Air with a severely cracked display before screen replacement" width={1600} height={700} /></div>
              <div><span>After</span><Image src="/images/blog/macbook-screen-repair/a2337-after.webp" alt="MacBook Air showing a working display after complete screen assembly replacement" width={1600} height={700} /></div>
            </div>
            <figcaption>Workshop repair pair 1: damaged display replaced and tested. Exact model record pending confirmation.</figcaption>
          </figure>
          <figure>
            <div className={styles.imagePair}>
              <div><span>Before</span><Image src="/images/blog/macbook-screen-repair/notch-model-before.webp" alt="Later-design MacBook Air with a damaged notched display before replacement" width={1600} height={700} /></div>
              <div><span>After</span><Image src="/images/blog/macbook-screen-repair/notch-model-after.webp" alt="Later-design MacBook Air with a working notched display after replacement" width={1600} height={700} /></div>
            </div>
            <figcaption>Workshop repair pair 2: the supplied “M1 2020” filename conflicts with the notched chassis, so no model claim is published.</figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="symptoms-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Symptom guide</p>
            <h2 id="symptoms-heading">What a broken MacBook display can look like</h2>
          </div>
          <p>A MacBook may still boot even when the built-in display is unusable. Similar symptoms can also come from faults outside the panel.</p>
        </div>
        <div className={styles.tableFrame} tabIndex={0}>
          <table className={styles.symptomTable}>
            <caption>MacBook display symptoms and what they may mean</caption>
            <thead><tr><th scope="col">What you see</th><th scope="col">What it may mean</th></tr></thead>
            <tbody>
              {symptoms.map(([symptom, meaning]) => (
                <tr key={symptom}><th scope="row">{symptom}</th><td>{meaning}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="process-heading">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Four steps</p><h2 id="process-heading">How the repair process works</h2></div>
        </div>
        <ol className={styles.processGrid}>
          <li><span>01</span><h3>Identify and inspect</h3><p>Confirm the exact model, visible impact, lid condition and whether the symptom is likely screen-related.</p></li>
          <li><span>02</span><h3>Confirm part and quote</h3><p>Match the compatible assembly, current price and availability before work is approved.</p></li>
          <li><span>03</span><h3>Replace the assembly</h3><p>Remove the damaged complete display assembly and fit the correct replacement. Hands-on work is usually about one hour.</p></li>
          <li><span>04</span><h3>Test the MacBook</h3><p>Check the image, brightness, camera area where applicable, sleep/wake behaviour, lid movement and startup.</p></li>
        </ol>
      </section>

      <section className={styles.safetySection} aria-labelledby="data-safety-heading">
        <div>
          <p className={styles.eyebrow}>Before the appointment</p>
          <h2 id="data-safety-heading">Protect the MacBook and your data</h2>
          <p>
            If the MacBook is stable and safe to use, make a current backup before repair. Avoid
            pressing the damaged display and limit opening or closing the lid so cracks and image loss
            do not spread.
          </p>
          <p>
            <strong>Stop using the MacBook</strong> if there is liquid exposure, unusual heat, battery
            swelling, smoke, a burnt smell or other safety concern. Do not keep charging or testing it.
          </p>
        </div>
        <Link href="https://support.apple.com/en-au/104984">Apple: Back up with Time Machine</Link>
      </section>

      <section aria-labelledby="book-heading">
        <div className={styles.bookingCard}>
          <p className={styles.eyebrow}>When to book</p>
          <h2 id="book-heading">Arrange assessment before the damage gets worse</h2>
          <p>
            Book when the display has cracks, lines, flicker, black areas, partial image loss or no
            image—or when the lid is visibly bent. Bring the charger if the MacBook also has power or
            startup symptoms.
          </p>
          <div className={styles.actions}>
            <Link href="/book-repair">Book a MacBook assessment</Link>
            <Link href="/repairs/laptop/macbook">Choose your MacBook model</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-heading">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Common questions</p><h2 id="faq-heading">MacBook screen replacement FAQs</h2></div>
        </div>
        <div className={styles.faqList}>
          {faqs.map(({ question, answer }) => (
            <details key={question}><summary>{question}</summary><p>{answer}</p></details>
          ))}
        </div>
      </section>

      <aside className={styles.sources} aria-labelledby="sources-heading">
        <h2 id="sources-heading">Model and data guidance</h2>
        <ul>
          <li><Link href="https://support.apple.com/en-au/102767">Apple: Find your Mac model name and serial number</Link></li>
          <li><Link href="https://support.apple.com/en-au/102869">Apple: Identify your MacBook Air model</Link></li>
          <li><Link href="https://support.apple.com/en-au/104984">Apple: Back up your Mac with Time Machine</Link></li>
        </ul>
        <p>Ali Mobile &amp; Repair is an independent repair business and is not represented as an Apple Authorised Service Provider.</p>
      </aside>
    </div>
  );
}
