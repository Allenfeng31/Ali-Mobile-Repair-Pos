import Image from "next/image";
import Link from "next/link";

import {
  CURRENT_IPHONE_SCREEN_REPAIR_PRICES,
  OLDER_IPHONE_SCREEN_REPAIR_PRICES,
  IPHONE_SCREEN_PHOTOS,
  SCREEN_OPTION_SAMPLE,
  SCREEN_OPTION_SAMPLE_TOTAL,
  type IPhoneScreenRepairPrice,
  type ScreenPrice,
} from "@/data/iphoneScreenRepairCost";

import styles from "./IphoneScreenRepairCostArticle.module.css";

const photoCaption = "Photographed by Ali Mobile & Repair. Camera exposure and device settings can affect how displays appear in photos.";

function priceLabel(price: ScreenPrice) {
  return price === null ? "—" : `$${price}`;
}

function ScreenPhoto({ photo }: { photo: (typeof IPHONE_SCREEN_PHOTOS)[keyof typeof IPHONE_SCREEN_PHOTOS] }) {
  return (
    <figure className={styles.screenPhoto}>
      <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 640px) 100vw, 31vw" />
      <figcaption>{photoCaption}</figcaption>
    </figure>
  );
}

function ComparisonMark({ label, children }: { label: string; children: React.ReactNode }) {
  return <span className={styles.comparisonMark} aria-label={label}>{children}</span>;
}

const SCREEN_OPTION_COLUMNS = [
  { key: "lcdInCell", label: "LCD / In-cell" },
  { key: "softOled", label: "Soft OLED" },
  { key: "originalScreen", label: "Original Screen" },
] as const;

function ComparisonCell({ option, children }: { option: (typeof SCREEN_OPTION_COLUMNS)[number]["key"]; children: React.ReactNode }) {
  const column = SCREEN_OPTION_COLUMNS.find((candidate) => candidate.key === option)!;

  return (
    <td>
      <span className={styles.comparisonMobileLabel} aria-hidden="true">{column.label}</span>
      <span className={styles.comparisonValue}>{children}</span>
    </td>
  );
}

function PriceTable({ rows, caption }: { rows: IPhoneScreenRepairPrice[]; caption: string }) {
  const priceColumns = [
    { key: "lcdInCell", label: "LCD / In-cell" },
    { key: "softOled", label: "Soft OLED" },
    { key: "originalScreen", label: "Original" },
  ] as const;

  return (
    <div className={`${styles.tableScroll} ${styles.priceTableScroll}`} tabIndex={0} aria-label="iPhone screen repair price table">
      <table className={styles.priceTable}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">iPhone model</th>
            <th scope="col">LCD / In-cell</th>
            <th scope="col">Soft OLED</th>
            <th scope="col">Original Screen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.model}>
              <th scope="row">{row.model}</th>
              {priceColumns.map(({ key, label }) => {
                const price = priceLabel(row[key]);

                return (
                  <td key={key} aria-label={`${row.model}, ${label}, ${price}`}>
                    <span className={styles.mobilePriceLabel} aria-hidden="true">{label}</span>
                    {price}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IphoneScreenRepairCostArticle() {
  return (
    <div className={styles.article}>
      <section aria-labelledby="price-table-heading">
        <h2 id="price-table-heading">Current iPhone screen replacement prices</h2>
        <p className={styles.intro}>
          Prices checked against Ali Mobile&apos;s current public Storefront on 29 July 2026. Prices can change with parts supply, the exact model and the device&apos;s condition.
        </p>
        <PriceTable rows={CURRENT_IPHONE_SCREEN_REPAIR_PRICES} caption="Current Ali Mobile iPhone screen replacement prices by model and screen option" />
        <details className={styles.olderModels}>
          <summary>More iPhone models ({OLDER_IPHONE_SCREEN_REPAIR_PRICES.length})</summary>
          <PriceTable rows={OLDER_IPHONE_SCREEN_REPAIR_PRICES} caption="Earlier iPhone screen replacement prices by model and screen option" />
        </details>
        <p className={styles.tableNote}><strong>—</strong> Not currently listed online. Contact us to confirm current screen options.</p>
      </section>

      <section aria-labelledby="screen-options-heading">
        <h2 id="screen-options-heading">LCD vs Soft OLED vs Original Screen</h2>
        <figure className={styles.comparisonFigure}>
          <Image
            src={IPHONE_SCREEN_PHOTOS.comparison.src}
            alt={IPHONE_SCREEN_PHOTOS.comparison.alt}
            width={IPHONE_SCREEN_PHOTOS.comparison.width}
            height={IPHONE_SCREEN_PHOTOS.comparison.height}
            sizes="(max-width: 800px) 100vw, 760px"
          />
          <figcaption>{photoCaption}</figcaption>
        </figure>

        <div className={`${styles.tableScroll} ${styles.comparisonTableScroll}`} tabIndex={0} aria-label="Screen option comparison table">
          <table className={styles.comparisonTable}>
            <caption>How the three public screen options differ</caption>
            <thead>
              <tr><th scope="col">Consideration</th>{SCREEN_OPTION_COLUMNS.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr>
            </thead>
            <tbody>
              <tr><th scope="row">Affordability</th><ComparisonCell option="lcdInCell"><ComparisonMark label="Five out of five stars for relative affordability">★★★★★</ComparisonMark></ComparisonCell><ComparisonCell option="softOled"><ComparisonMark label="Three out of five stars for relative affordability">★★★☆☆</ComparisonMark></ComparisonCell><ComparisonCell option="originalScreen"><ComparisonMark label="One out of five stars for relative affordability">★☆☆☆☆</ComparisonMark></ComparisonCell></tr>
              <tr><th scope="row">Display type</th><ComparisonCell option="lcdInCell">LCD</ComparisonCell><ComparisonCell option="softOled">Flexible OLED</ComparisonCell><ComparisonCell option="originalScreen">Original display technology</ComparisonCell></tr>
              <tr><th scope="row">Colour &amp; blacks</th><ComparisonCell option="lcdInCell"><ComparisonMark label="Two out of five stars for relative colour and black levels">★★☆☆☆</ComparisonMark></ComparisonCell><ComparisonCell option="softOled"><ComparisonMark label="Four out of five stars for relative colour and black levels">★★★★☆</ComparisonMark></ComparisonCell><ComparisonCell option="originalScreen"><ComparisonMark label="Five out of five stars for original colour and black levels">★★★★★</ComparisonMark></ComparisonCell></tr>
              <tr><th scope="row">True Tone</th><ComparisonCell option="lcdInCell"><ComparisonMark label="Depends on compatible part and repair programming">△ Depends</ComparisonMark></ComparisonCell><ComparisonCell option="softOled"><ComparisonMark label="Supported subject to the footnote">✓ Supported*</ComparisonMark></ComparisonCell><ComparisonCell option="originalScreen"><ComparisonMark label="Supported subject to the footnote">✓ Supported*</ComparisonMark></ComparisonCell></tr>
              <tr><th scope="row">120Hz ProMotion</th><ComparisonCell option="lcdInCell"><ComparisonMark label="Does not reproduce 120Hz ProMotion on models originally equipped with it.">✕</ComparisonMark></ComparisonCell><ComparisonCell option="softOled"><ComparisonMark label="Supported subject to the footnote">✓ Supported*</ComparisonMark></ComparisonCell><ComparisonCell option="originalScreen"><ComparisonMark label="Supported subject to the footnote">✓ Supported*</ComparisonMark></ComparisonCell></tr>
              <tr><th scope="row">Fit &amp; bezel</th><ComparisonCell option="lcdInCell">Thicker / more visible</ComparisonCell><ComparisonCell option="softOled">Thin / near-original fit</ComparisonCell><ComparisonCell option="originalScreen">Original fit</ComparisonCell></tr>
              <tr><th scope="row">iOS genuine verification</th><ComparisonCell option="lcdInCell"><ComparisonMark label="Not verified by iOS as a Genuine Apple Part">✕</ComparisonMark></ComparisonCell><ComparisonCell option="softOled"><ComparisonMark label="Not verified by iOS as a Genuine Apple Part">✕</ComparisonMark></ComparisonCell><ComparisonCell option="originalScreen">Depends on exact part and repair path</ComparisonCell></tr>
              <tr><th scope="row">Best suited to</th><ComparisonCell option="lcdInCell">Budget-first use</ComparisonCell><ComparisonCell option="softOled">Best balance of quality and price</ComparisonCell><ComparisonCell option="originalScreen">Original display experience</ComparisonCell></tr>
            </tbody>
          </table>
        </div>
        <p className={styles.comparisonFootnote}>* True Tone requires a compatible display and correct repair programming. 120Hz ProMotion applies only to supported iPhone models and compatible screen options.</p>

        <div className={styles.optionPhotos}>
          <div><h3>LCD / In-cell</h3><ScreenPhoto photo={IPHONE_SCREEN_PHOTOS.lcdInCell} /></div>
          <div><h3>Soft OLED</h3><ScreenPhoto photo={IPHONE_SCREEN_PHOTOS.softOled} /></div>
          <div><h3>Original Screen</h3><ScreenPhoto photo={IPHONE_SCREEN_PHOTOS.originalScreen} /></div>
        </div>
      </section>

      <section className={styles.sampleSection} aria-labelledby="selection-sample-heading">
        <div className={styles.sampleHeading}>
          <h2 id="selection-sample-heading">What 100 iPhone screen repair customers chose</h2>
          <p>Soft OLED was selected in 72 of the 100 repairs, making it the most frequently chosen option in this Ali Mobile sample.</p>
        </div>
        <div className={styles.sampleContent}>
          <div className={styles.sampleVisual}>
            <div className={styles.donut} role="img" aria-label="Out of 100 repairs, 72 customers chose Soft OLED, 21 chose LCD or In-cell, and 7 chose Original Screen.">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle className={styles.donutTrack} cx="60" cy="60" r="42" pathLength="100" />
                <circle className={styles.donutSoftOled} cx="60" cy="60" r="42" pathLength="100" />
                <circle className={styles.donutLcd} cx="60" cy="60" r="42" pathLength="100" />
                <circle className={styles.donutOriginal} cx="60" cy="60" r="42" pathLength="100" />
              </svg>
              <span><strong>{SCREEN_OPTION_SAMPLE_TOTAL}</strong> repairs</span>
            </div>
            <ul className={styles.legend}>
              {SCREEN_OPTION_SAMPLE.map((option) => <li key={option.name}><span style={{ backgroundColor: option.colour }} />{option.name} — {option.customers} customers — {option.customers}%</li>)}
            </ul>
          </div>
          <div className={styles.sampleCards}>
            {SCREEN_OPTION_SAMPLE.map((option) => (
              <article className={styles.sampleCard} key={option.name}>
                <h3>{option.name}</h3>
                <p><strong>{option.customers} customers</strong><span>{option.customers}% of the sample</span></p>
                <div className={styles.sampleBar} aria-label={`${option.name}: ${option.customers}% of the sample`}><span style={{ width: `${option.customers}%`, backgroundColor: option.colour }} /></div>
                <p>{option.summary}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className={styles.interpretationBox} aria-labelledby="interpretation-heading">
          <h3 id="interpretation-heading">How to read this sample</h3>
          <p>This sample shows the screen options selected across 100 Ali Mobile iPhone screen repairs. It describes customer choice at our repair desk; it is not an Australia-wide market survey and does not measure satisfaction or long-term failure rates.</p>
        </aside>
      </section>

      <section aria-labelledby="factors-heading">
        <h2 id="factors-heading">What changes the final repair price?</h2>
        <div className={styles.factorGrid}>
          {[
            "Exact iPhone model and display size",
            "LCD, OLED and ProMotion display requirements",
            "Display-only failure versus frame or housing damage",
            "Touch, image, brightness and dead-pixel faults",
            "Damage around the earpiece, sensors or front-camera area",
            "Liquid exposure or internal damage",
            "Current parts availability",
            "Selected screen option",
          ].map((factor) => <div key={factor}>{factor}</div>)}
        </div>
        <p>A cracked front glass, failed touch layer and damaged OLED panel can look similar from the outside but may require different parts or additional work. We inspect the device before confirming the final quote.</p>
      </section>

      <section className={styles.decisionSection} aria-labelledby="choosing-heading">
        <h2 id="choosing-heading">A practical way to choose</h2>
        <ul>
          <li><strong>Budget priority:</strong> LCD / In-cell.</li>
          <li><strong>Best balance:</strong> Soft OLED.</li>
          <li><strong>Original display experience:</strong> Original Screen.</li>
        </ul>
        <p>Ali Mobile &amp; Repair organises this guide from its current quote structure and repair experience. Start with the <Link href="/repairs/screen-replacement">screen replacement service</Link> or <Link href="/repairs/phone/iphone">choose your iPhone model</Link> before booking.</p>
        <p>For liquid exposure or internal damage, use the <Link href="/repairs/water-damage">water-damage assessment</Link> path. It may affect the suitable repair option and final quote.</p>
      </section>

      <section className={styles.contactSection} aria-labelledby="contact-heading">
        <h2 id="contact-heading">Confirm the right option before repair</h2>
        <p>Ali Mobile &amp; Repair<br />Kiosk C1, Ringwood Square Shopping Centre<br />Seymour Street, Ringwood VIC 3134<br /><a href="tel:0481058514">0481 058 514</a></p>
        <Link href="/book-repair" className={styles.bookLink}>Book a repair assessment</Link>
        <p className={styles.sourceNote}>Price source: Ali Mobile&apos;s current public Storefront. Customer-choice source: an Ali Mobile sample of 100 screen repairs. Updated 29 July 2026.</p>
      </section>
    </div>
  );
}
