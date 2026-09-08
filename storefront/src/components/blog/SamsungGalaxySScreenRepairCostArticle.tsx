import Image from "next/image";
import Link from "next/link";

import {
  SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA,
  SAMSUNG_GALAXY_S_SCREEN_REPAIR_PRICES,
  type SamsungGalaxySScreenRepairPrice,
} from "@/data/samsungGalaxySScreenRepairCost";

import styles from "./SamsungGalaxySScreenRepairCostArticle.module.css";

function priceLabel(price: number | null) {
  return price === null ? "—" : `$${price}`;
}

function PriceTable() {
  const columns: Array<{
    key: keyof Pick<SamsungGalaxySScreenRepairPrice, "servicePackWithFrame" | "aftermarketWithFrame">;
    label: string;
  }> = [
    { key: "servicePackWithFrame", label: "Samsung Service Pack + Frame" },
    { key: "aftermarketWithFrame", label: "Aftermarket Display + Frame" },
  ];

  return (
    <div className={styles.tableScroll} tabIndex={0} aria-label="Samsung Galaxy S screen replacement price table">
      <table className={styles.priceTable}>
        <caption>Ali Mobile Samsung Galaxy S screen replacement prices by model and complete display assembly</caption>
        <thead>
          <tr>
            <th scope="col">Model</th>
            {columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {SAMSUNG_GALAXY_S_SCREEN_REPAIR_PRICES.map((row) => (
            <tr key={row.model}>
              <th scope="row">{row.model}</th>
              {columns.map((column) => {
                const price = priceLabel(row[column.key]);
                return <td key={column.key} aria-label={`${row.model}, ${column.label}, ${price}`}>{price}</td>;
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
    question: "What is a Samsung Service Pack screen?",
    answer: "At Ali Mobile, Samsung Service Pack means a genuine Samsung display assembly supplied through Samsung service channels. For these repairs, we use the complete display + frame assembly.",
  },
  {
    question: "Does Samsung screen replacement include the frame?",
    answer: "The options in this guide are complete display + frame assemblies. We inspect the device first because impact damage, liquid exposure or another fault can still change the suitable repair path.",
  },
  {
    question: "Will fingerprint still work after replacement?",
    answer: "Fingerprint behaviour can overlap with the original screen damage, the replacement panel, frame condition and any calibration requirement. We test relevant functions where applicable, but no screen repair guarantees every biometric symptom will be resolved.",
  },
  {
    question: "Will 120Hz still work with an aftermarket screen?",
    answer: "Aftermarket quality varies. Some lower-grade panels may be limited to 60Hz, while others can support higher refresh rates. An aftermarket panel may not reproduce Samsung's original adaptive refresh behaviour in exactly the same way.",
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

export function SamsungGalaxySScreenRepairCostArticle() {
  return (
    <div className={styles.article}>
      <section aria-labelledby="samsung-price-table-heading">
        <h2 id="samsung-price-table-heading">Samsung Galaxy S screen replacement prices</h2>
        <p>
          Ali Mobile generally recommends a Samsung Service Pack assembly for customers who want the display experience to stay as close as practical to the original phone. This is a static Ali Mobile price guide checked on {SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.displayDateModified}; confirm the current option for your exact model before repair.
        </p>
        <PriceTable />
        <p className={styles.optionNote}><strong>—</strong> means Ali Mobile does not currently list an aftermarket display + frame option for that exact model.</p>
      </section>

      <section aria-labelledby="service-pack-heading">
        <h2 id="service-pack-heading">What is a Samsung Service Pack screen?</h2>
        <p>
          At Ali Mobile, Samsung Service Pack refers to the genuine Samsung display assembly supplied through Samsung service channels. For these repairs, Ali Mobile uses the complete display + frame assembly. This describes the part option we fit; it does not mean Ali Mobile is Samsung or an authorised Samsung Service Centre.
        </p>
      </section>

      <section aria-labelledby="comparison-heading">
        <h2 id="comparison-heading">Samsung Service Pack vs aftermarket screen</h2>
        <h3>Display quality and brightness</h3>
        <p>Aftermarket OLED quality varies. In our repair experience, some panels can have a slightly smaller active display area, a more noticeable lower black border, lower brightness or subtly different colour. That does not mean every aftermarket screen is poor.</p>
        <h3>Fingerprint sensitivity</h3>
        <p>Samsung ultrasonic fingerprint can still work with some aftermarket screens. Depending on the specific replacement panel, sensitivity may feel lower or require more deliberate placement than with the original Samsung display.</p>
        <h3>Refresh rate and display response</h3>
        <p>Some lower-grade aftermarket panels may be limited to 60Hz, while better panels may support higher refresh rates. Newer Samsung phones use more sophisticated adaptive behaviour, which an aftermarket panel may not reproduce exactly. We have also seen variation in display wake and response; this is observed variability, not a universal defect.</p>
        <h3>S Pen on Galaxy Ultra models</h3>
        <p>For customers who use S Pen frequently, Ali Mobile generally recommends Service Pack. In one Galaxy S25 Ultra case we encountered, S Pen state detection behaved incorrectly after a refurbished display and aftermarket frame had been fitted. That does not mean every aftermarket assembly will cause the same issue, but it is one reason we test relevant S Pen functions carefully.</p>
      </section>

      <section aria-labelledby="frame-heading">
        <h2 id="frame-heading">Why does the frame matter on a Samsung OLED repair?</h2>
        <p>Samsung OLED panels are fragile during installation. In our repair experience, even a small hard fragment beneath a panel can create a pressure point, while a phone that has been dropped may have a subtly distorted or dented frame.</p>
        <p>Reattaching a fragile display to an old damaged frame can make fit, adhesive contact, sealing and long-term stability less predictable. A replacement OLED may not sit under perfectly even conditions, which can contribute to panel lifting, debris around a poor fit, local pressure, black spots, ink-like spreading or increased vulnerability after another impact.</p>
        <aside className={styles.callout}>
          Ali Mobile now prefers complete display + frame assemblies because they reduce the variables involved in fitting a fragile OLED to an old impact-damaged frame. This does not mean every display-only repair will fail.
        </aside>
      </section>

      <section aria-labelledby="damage-heading">
        <h2 id="damage-heading">What do black spots, green lines or flickering mean?</h2>
        <p>A crack with black spots, ink-like spreading, green lines, flickering or missing display areas usually indicates damage beyond only the outer glass and can involve the OLED display layer. If the screen is unstable, back up important information where possible.</p>
        <h3>What if the screen is black but the phone still works?</h3>
        <p>If the phone still vibrates, rings, makes notification sounds or appears to boot, display damage is a strong possibility. It is not a guarantee that a screen replacement is the only fix: we may need to rule out a connector or flex issue, impact-related board fault, power/display circuit issue, liquid damage or previous repair damage.</p>
      </section>

      <section aria-labelledby="real-repair-examples-heading">
        <h2 id="real-repair-examples-heading">Real Samsung Screen Repair Examples</h2>
        <p>These photos show examples of damaged Galaxy S displays before replacement and the normal display operation visible after repair.</p>
        <div className={styles.repairExamples}>
          {repairExamples.map((example) => (
            <article className={styles.repairExample} key={example.model}>
              <h3>{example.model}</h3>
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

      <section aria-labelledby="decision-heading">
        <h2 id="decision-heading">When is an aftermarket screen worth considering?</h2>
        <p>Aftermarket can be a legitimate budget choice for some older phones, particularly where the genuine repair cost is close to the phone&apos;s value and display demands are lower. Customers prioritising display quality, fingerprint sensitivity, S Pen use, original-like behaviour or longer-term ownership may prefer Service Pack.</p>
        <h3>Is it worth repairing an older Galaxy S phone?</h3>
        <p>Consider the phone&apos;s overall condition, other hardware faults, battery condition, repair cost, value and expected remaining use. If the phone is otherwise in good condition, a screen repair can still make sense; if it has several significant faults, replacement can be the more practical choice.</p>
      </section>

      <section aria-labelledby="repair-process-heading">
        <h2 id="repair-process-heading">What happens during an Ali Mobile screen repair?</h2>
        <p>We confirm the exact Galaxy model, inspect the reported fault and frame condition, and confirm the appropriate option before work. A normal screen replacement does not intentionally erase customer data, but a backup is recommended where possible.</p>
        <p>After repair, we use Samsung&apos;s built-in diagnostic and testing tools where applicable, alongside relevant checks for display, touch, fingerprint, S Pen and other functions related to the repair. Repair timing is confirmed after the exact Galaxy model, required part and availability are checked.</p>
        <p>Eligible screen repairs include a 6-month warranty on the fitted part and workmanship. It does not cover new impact damage, bending, liquid damage, misuse, another repairer&apos;s work or unrelated faults. Opening and resealing the phone does not restore factory water resistance, so avoid intentional water exposure after major repair.</p>
        <p>Browse <Link href="/repairs/phone/samsung">Samsung repair options</Link>, see the <Link href="/repairs/screen-replacement">screen replacement service</Link>, or <Link href="/book-repair">book an assessment</Link> to confirm the right option.</p>
      </section>

      <section aria-labelledby="samsung-screen-faq-heading">
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
