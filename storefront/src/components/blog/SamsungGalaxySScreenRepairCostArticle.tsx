import Image from "next/image";
import Link from "next/link";

import {
  type SamsungGalaxySScreenRepairPriceTable,
} from "@/data/samsungGalaxySScreenRepairCost";

import styles from "./SamsungGalaxySScreenRepairCostArticle.module.css";

function priceLabel(price: number | undefined, isQuote: boolean) {
  if (price !== undefined) return `$${price}`;
  return isQuote ? "Quote" : "—";
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

const screenRepairLinks: Readonly<Record<string, string>> = {
  "Galaxy S24 Ultra": "/repairs/phone/samsung/galaxy-s24-ultra/screen-replacement",
  "Galaxy S23 Ultra": "/repairs/phone/samsung/galaxy-s23-ultra/screen-replacement",
  "Galaxy S22 Ultra": "/repairs/phone/samsung/galaxy-s22-ultra/screen-replacement",
};

function PriceTable({ priceTable }: { priceTable: SamsungGalaxySScreenRepairPriceTable }) {
  return (
    <div className={styles.tableScroll} tabIndex={0} aria-label="Samsung Galaxy S screen replacement price table">
      <table className={styles.priceTable}>
        <caption>Current Ali Mobile Samsung Galaxy S screen replacement prices by model and available quality tier</caption>
        <thead>
          <tr>
            <th scope="col">Model</th>
            {priceTable.columns.map((column) => <th key={column} scope="col">{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {priceTable.rows.map((row) => (
            <tr key={row.model}>
              <th scope="row">
                {screenRepairLinks[row.model]
                  ? <Link className={styles.modelLink} href={screenRepairLinks[row.model]}>{row.model}</Link>
                  : row.model}
              </th>
              {priceTable.columns.map((column) => {
                const price = priceLabel(row.prices[column], row.quoteTiers.includes(column));
                return <td key={column} aria-label={`${row.model}, ${column}, ${price}`}>{price}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const repairExamples = [
  {
    model: "Galaxy S22 Ultra",
    href: "/repairs/phone/samsung/galaxy-s22-ultra/screen-replacement",
    before: {
      src: "/images/blog/samsung-galaxy-s22-ultra-screen-replacement-before.webp",
      width: 3024,
      height: 4032,
      alt: "Galaxy S22 Ultra before screen replacement showing a bright horizontal line and blacked-out lower display",
      caption: "Before: a bright horizontal line and a blacked-out lower display.",
    },
    after: {
      src: "/images/blog/samsung-galaxy-s22-ultra-screen-replacement-after.webp",
      width: 3024,
      height: 4032,
      alt: "Galaxy S22 Ultra after screen replacement with the display working normally",
      caption: "After: the replacement display returned to normal operation.",
    },
  },
  {
    model: "Galaxy S24",
    href: "/repairs/phone/samsung/galaxy-s24/screen-replacement",
    before: {
      src: "/images/blog/samsung-galaxy-s24-screen-replacement-before.webp",
      width: 4284,
      height: 5712,
      alt: "Galaxy S24 before screen replacement showing yellow banding and horizontal line damage",
      caption: "Before: yellow banding and horizontal line damage across the OLED panel.",
    },
    after: {
      src: "/images/blog/samsung-galaxy-s24-screen-replacement-after.webp",
      width: 4284,
      height: 5712,
      alt: "Galaxy S24 after screen replacement with the display working normally",
      caption: "After: the replacement display returned to normal operation.",
    },
  },
  {
    model: "Galaxy S24 Ultra",
    href: "/repairs/phone/samsung/galaxy-s24-ultra/screen-replacement",
    before: {
      src: "/images/blog/samsung-galaxy-s24-ultra-screen-replacement-before.webp",
      width: 4284,
      height: 5712,
      alt: "Galaxy S24 Ultra before screen replacement showing green-line and white-block display damage",
      caption: "Before: green-line and white-block panel damage.",
    },
    after: {
      src: "/images/blog/samsung-galaxy-s24-ultra-screen-replacement-after.webp",
      width: 4284,
      height: 5712,
      alt: "Galaxy S24 Ultra after screen replacement with the display working normally",
      caption: "After: the replacement display returned to normal operation.",
    },
  },
] as const;

const faqs = [
  {
    question: "What does Genuine mean in the Samsung repair price table?",
    answer: "Genuine is the current POS quality-tier name for the original-equipment display option listed for a supported repair. It does not mean Ali Mobile is Samsung or an authorised Samsung Service Centre.",
  },
  {
    question: "Does Samsung screen replacement include the frame?",
    answer: "Genuine and Premium are quality-tier names, not guarantees that a replacement frame is included. We confirm the exact part scope and inspect the existing frame before the repair is approved.",
  },
  {
    question: "Will fingerprint still work after replacement?",
    answer: "Fingerprint behaviour can overlap with the original screen damage, the replacement panel, frame condition and any calibration requirement. We test relevant functions where applicable, but no screen repair guarantees every biometric symptom will be resolved.",
  },
  {
    question: "Will 120Hz still work with a Premium screen?",
    answer: "Premium is the current catalogue tier name, but compatible aftermarket panel characteristics can vary. Some panels may be limited to 60Hz, while others can support higher refresh rates, and they may not reproduce Samsung's original adaptive refresh behaviour in exactly the same way.",
  },
  {
    question: "Can screen replacement affect S Pen use?",
    answer: "On supported Ultra models, screen and frame quality can affect the overall S Pen experience. In one Galaxy S25 Ultra case we encountered, S Pen state detection behaved incorrectly after a refurbished display and aftermarket frame had been fitted; that does not mean every aftermarket assembly causes the same issue.",
  },
  {
    question: "Can only the cracked glass be replaced?",
    answer: "OLED glass refurbishment exists, but it needs specialist equipment and controlled conditions. Ali Mobile does not offer Samsung Galaxy S glass-only refurbishment for this service and instead uses supported complete display assemblies.",
  },
  {
    question: "Do black spots, green lines or flickering mean the OLED is damaged?",
    answer: "They can indicate damage beyond the outer glass and may involve the OLED display layer. A damaged OLED may remain stable temporarily or deteriorate further, so back up important data if the screen is becoming unstable.",
  },
  {
    question: "Will screen replacement restore IP68 water resistance?",
    answer: "No. Opening and resealing a phone does not restore factory water resistance. We recommend avoiding intentional water exposure after a major repair.",
  },
  {
    question: "Will a screen replacement erase my data?",
    answer: "A normal screen replacement does not intentionally erase customer data, but a backup is recommended where possible because a damaged device can carry existing data risk.",
  },
  {
    question: "How long does Samsung Galaxy S screen repair take?",
    answer: "Repair timing is confirmed after the exact Galaxy model, required part and availability are checked.",
  },
];

export function SamsungGalaxySScreenRepairCostArticle({
  priceTable,
}: {
  priceTable: SamsungGalaxySScreenRepairPriceTable | null;
}) {
  const freshnessLabel = catalogueFreshnessLabel(priceTable?.fetchedAt ?? null);

  return (
    <div className={styles.article}>
      <section className={styles.guideNav} aria-labelledby="samsung-guide-heading">
        <h2 id="samsung-guide-heading">In this guide</h2>
        <nav aria-label="Samsung Galaxy S screen repair guide">
          <a href="#samsung-price-table-heading">Prices</a>
          <a href="#comparison-heading">Genuine vs Premium</a>
          <a href="#frame-heading">Why the frame matters</a>
          <a href="#real-repair-examples-heading">Real repair examples</a>
          <a href="#samsung-screen-faq-heading">FAQs</a>
        </nav>
      </section>

      <section className={styles.wideSection} aria-labelledby="samsung-price-table-heading">
        <h2 id="samsung-price-table-heading">Samsung Galaxy S screen replacement prices</h2>
        <p>
          Ali Mobile generally recommends the Genuine tier for customers who want the display experience to stay as close as practical to the original phone. Browse supported <Link href="/repairs/phone/samsung">Samsung repair options</Link> before confirming the current option for your exact model.
        </p>
        {priceTable
          ? <PriceTable priceTable={priceTable} />
          : <p>Current fixed Samsung Galaxy S screen prices are not available in our online repair catalogue. Contact us for a quote for your model.</p>}
        <p className={styles.optionNote}><strong>—</strong> means the tier is not currently listed in the online catalogue. <strong>Quote</strong> means a current fixed online price is unavailable.</p>
        <p className={styles.optionNote}>
          Prices shown are sourced from Ali Mobile&apos;s current online repair catalogue.
          {freshnessLabel ? ` Catalogue snapshot refreshed ${freshnessLabel}.` : ""} Prices may change as parts pricing changes.
        </p>
      </section>

      <section className={styles.readingSection} aria-labelledby="genuine-tier-heading">
        <h2 id="genuine-tier-heading">What does Genuine mean for Samsung screen repair?</h2>
        <p>
          Genuine is the current POS quality-tier name for the original-equipment display option listed for a supported repair. It describes the part option; it does not mean Ali Mobile is Samsung or an authorised Samsung Service Centre. Genuine and Premium tier names do not by themselves confirm whether a replacement frame is included, so we verify the exact part scope before work. See our <Link href="/repairs/screen-replacement">screen replacement service</Link> for the broader repair path.
        </p>
      </section>

      <section className={styles.readingSection} aria-labelledby="comparison-heading">
        <h2 id="comparison-heading">Genuine vs Premium Samsung screen repair</h2>
        <h3>Display quality and brightness</h3>
        <p>Premium is the current catalogue tier name. Compatible aftermarket OLED quality can vary; in our repair experience, some panels can have a slightly smaller active display area, a more noticeable lower black border, lower brightness or subtly different colour. That does not mean every Premium or aftermarket screen is poor.</p>
        <h3>Fingerprint sensitivity</h3>
        <p>Samsung ultrasonic fingerprint can still work with some Premium replacement screens. Depending on the specific panel, sensitivity may feel lower or require more deliberate placement than with the original Samsung display.</p>
        <h3>Refresh rate and display response</h3>
        <p>Some aftermarket panels in the broader market may be limited to 60Hz, while others can support higher refresh rates. Newer Samsung phones use more sophisticated adaptive behaviour, which a replacement panel may not reproduce exactly. We have also seen variation in display wake and response; this is observed variability, not a universal defect or a promise about every Premium option.</p>
        <h3>S Pen on Galaxy Ultra models</h3>
        <p>For customers who use S Pen frequently, Ali Mobile generally recommends Genuine. In one Galaxy S25 Ultra case we encountered, S Pen state detection behaved incorrectly after a refurbished display and aftermarket frame had been fitted. That does not mean every Premium or aftermarket assembly will cause the same issue, but it is one reason we test relevant S Pen functions carefully.</p>
      </section>

      <section className={styles.readingSection} aria-labelledby="decision-heading">
        <h2 id="decision-heading">When is a Premium screen worth considering?</h2>
        <p>Premium can be a legitimate lower-cost choice for some older phones, particularly where the Genuine repair cost is close to the phone&apos;s value and display demands are lower. Customers prioritising display quality, fingerprint sensitivity, S Pen use, original-like behaviour or longer-term ownership may prefer Genuine.</p>
        <h3>Is it worth repairing an older Galaxy S phone?</h3>
        <p>Consider the phone&apos;s overall condition, other hardware faults, battery condition, repair cost, value and expected remaining use. If the phone is otherwise in good condition, a screen repair can still make sense; if it has several significant faults, replacement can be the more practical choice.</p>
      </section>

      <section className={styles.readingSection} aria-labelledby="frame-heading">
        <h2 id="frame-heading">Why does the frame matter on a Samsung OLED repair?</h2>
        <p>Samsung OLED panels are fragile during installation. In our repair experience, even a small hard fragment beneath a panel can create a pressure point, while a phone that has been dropped may have a subtly distorted or dented frame.</p>
        <p>Reattaching a fragile display to an old damaged frame can make fit, adhesive contact, sealing and long-term stability less predictable. A replacement OLED may not sit under perfectly even conditions, which can contribute to panel lifting, debris around a poor fit, local pressure, black spots, ink-like spreading or increased vulnerability after another impact.</p>
        <aside className={styles.callout}>
          The Genuine or Premium tier name does not guarantee frame inclusion. Ali Mobile confirms the exact part scope and existing frame condition before work because fitting a fragile OLED to an impact-damaged frame can introduce additional risk.
        </aside>
      </section>

      <section className={styles.readingSection} aria-labelledby="damage-heading">
        <h2 id="damage-heading">What do black spots, green lines or flickering mean?</h2>
        <p>A crack with black spots, ink-like spreading, green lines, flickering or missing display areas usually indicates damage beyond only the outer glass and can involve the OLED display layer. If the screen is unstable, back up important information where possible.</p>
        <h3>What if the screen is black but the phone still works?</h3>
        <p>If the phone still vibrates, rings, makes notification sounds or appears to boot, display damage is a strong possibility. It is not a guarantee that a screen replacement is the only fix: we may need to rule out a connector or flex issue, impact-related board fault, power/display circuit issue, liquid damage or previous repair damage.</p>
      </section>

      <section className={styles.wideSection} aria-labelledby="real-repair-examples-heading">
        <h2 id="real-repair-examples-heading">Real Samsung Screen Repair Examples</h2>
        <p>These photos show examples of damaged Galaxy S displays before replacement and the normal display operation visible after repair.</p>
        <div className={styles.repairExamples}>
          {repairExamples.map((example) => (
            <article className={styles.repairExample} key={example.model}>
              <h3><Link href={example.href}>{example.model}</Link></h3>
              <div className={styles.repairPair}>
                {(["before", "after"] as const).map((state) => {
                  const photo = example[state];

                  return (
                    <figure className={styles.repairPhoto} key={state}>
                      <span className={styles.repairPhotoLabel}>{state === "before" ? "Before" : "After"}</span>
                      <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 760px) 100vw, 50vw" />
                      <figcaption>{photo.caption}</figcaption>
                    </figure>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.readingSection} aria-labelledby="repair-process-heading">
        <h2 id="repair-process-heading">What happens during an Ali Mobile screen repair?</h2>
        <p>We confirm the exact Galaxy model, inspect the reported fault and frame condition, and confirm the appropriate option before work. A normal screen replacement does not intentionally erase customer data, but a backup is recommended where possible.</p>
        <p>After repair, we use Samsung&apos;s built-in diagnostic and testing tools where applicable, alongside relevant checks for display, touch, fingerprint, S Pen and other functions related to the repair. Repair timing is confirmed after the exact Galaxy model, required part and availability are checked.</p>
        <p>Eligible screen repairs include a 6-month warranty on the fitted part and workmanship. It does not cover new impact damage, bending, liquid damage, misuse, another repairer&apos;s work or unrelated faults. Opening and resealing the phone does not restore factory water resistance, so avoid intentional water exposure after major repair.</p>
        <p>Browse <Link href="/repairs/phone/samsung">Samsung repair options</Link>, see the <Link href="/repairs/screen-replacement">screen replacement service</Link>, or <Link href="/book-repair">book an assessment</Link> to confirm the right option.</p>
      </section>

      <section className={styles.readingSection} aria-labelledby="samsung-screen-faq-heading">
        <h2 id="samsung-screen-faq-heading">Samsung Galaxy S screen replacement FAQs</h2>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
