import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

import ChatNowButton from "@/components/ChatNowButton";
import ServiceAreas from "@/components/seo/ServiceAreas";

import styles from "./RepairsHub.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Professional Device Repair Services in Ringwood | Ali Mobile",
  description:
    "Choose your device category to check repair options, compare repair turnaround time, and follow a clear quote path for device repair services in Ringwood before visiting.",
  alternates: {
    canonical: "/repairs",
  },
  openGraph: {
    title: "Professional Device Repair Services in Ringwood | Ali Mobile",
    description:
      "Choose your device category to check repair options, compare repair turnaround time, and follow a clear quote path for device repair services in Ringwood before visiting.",
    url: "/repairs",
    type: "website",
    locale: "en_AU",
    siteName: "Ali Mobile & Repair",
  },
};

const repairCategories = [
  {
    href: "/repairs/phone",
    title: "Phone Repair",
    description:
      "Broken screen, weak battery, charging fault, or water damage. We repair iPhone, Samsung, Oppo, Pixel, and more.",
    image: "/images/services/phone-repair.jpg",
    metric: "15-60 min",
    detail: "Common screen and battery repairs",
  },
  {
    href: "/repairs/tablet",
    title: "Tablet & iPad Repair",
    description:
      "Fast iPad and Samsung tablet repairs with careful bonding, glass replacement, battery service, and charging fixes.",
    image: "/images/services/tablet-repair.jpg",
    metric: "1-2 hrs",
    detail: "Most iPad and tablet repairs",
  },
  {
    href: "/repairs/laptop",
    title: "Laptop & MacBook Repair",
    description:
      "Screen, battery, keyboard, SSD, logic board, and data recovery support for MacBook and Windows laptops.",
    image: "/images/services/laptop-repair.jpg",
    metric: "Fast turnaround",
    detail: "When parts are in stock",
  },
  {
    href: "/repairs/watch",
    title: "Smart Watch Repair",
    description:
      "Precision Apple Watch and smart watch screen, battery, rear glass, and sealing repairs for everyday wear.",
    image: "/images/services/watch-repair.jpg",
    metric: "2-4 hrs",
    detail: "Precision reseal process",
  },
];

const trustSignals = [
  { value: "No Fix", label: "No Charge Policy" },
  { value: "6 mo", label: "Warranty on Repairs" },
  { value: "C1", label: "Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134" },
];

const processSteps = [
  {
    title: "Choose Device Type",
    text: "Start with the category that matches your device so you can check repair options, compare repair categories, and move to the right brand, model, and repair type.",
  },
  {
    title: "Check Live Pricing",
    text: "Many common repairs show a clear price path before you book, helping you check the repair price before visiting and understand likely repair turnaround time.",
  },
  {
    title: "Bring In or Book",
    text: "Book online for priority service or use our walk-in repair options at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 for a fast assessment.",
  },
];

const faqs = [
  {
    question: "Can I check the repair price before booking?",
    answer:
      "Yes. Start by choosing your device category, brand and model to view available repair options. Some repairs show starting prices, while quote-only repairs are confirmed after a physical assessment.",
  },
  {
    question: "How long does a phone repair usually take?",
    answer:
      "Many common phone repairs are fast. Around 80% of common phone models can usually be handled same day when parts are in stock. Timing depends on the exact model, repair queue, parts availability and fault condition.",
  },
  {
    question: "What repair types can I choose from?",
    answer:
      "You can choose from common repair types such as screen replacement, battery replacement, charging port repair, water damage assessment, back glass and housing repair, and camera repair options across supported devices.",
    relatedLink: {
      href: "/repairs/water-damage",
      label: "water damage assessment",
    },
  },
  {
    question: "What if I do not know my exact device model?",
    answer:
      "Start with the closest device category. Our team can help identify the exact model at the store or when you submit a quote request.",
  },
  {
    question: "Do I need to book, or can I walk in?",
    answer:
      "Walk-ins are welcome at our Ringwood Square kiosk. An online booking or quote request helps us prepare the repair path and gives you priority in the queue.",
  },
  {
    question: "Do I need to share my passcode for a repair?",
    answer:
      "Most repairs do not require your passcode. If device access is needed for functional testing, we will ask first. You can choose not to share it and test the device with us in person before the repair is finalised. We do not browse your photos, messages or other personal content.",
  },
  {
    question: "Should I back up my device before repair?",
    answer:
      "We recommend backing up your device before any repair. Standard part replacements normally do not affect stored data, but data cannot be guaranteed on an already damaged device. Logic-board, liquid-damage, no-power and data-recovery work can carry a higher risk, which we explain before work begins.",
  },
  {
    question: "Do repairs include a warranty?",
    answer:
      "Eligible repairs include a warranty on the fitted part and workmanship. Warranty does not cover new impact damage, liquid damage, misuse or unrelated faults.",
  },
];

export default function RepairsHubPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="repairs-heading">
        <div className={styles.heroInner}>
          <span className={styles.kicker}>Repair Command Center</span>
          <h1 id="repairs-heading">
            Pick your device.
            <span>Get a clean repair path.</span>
          </h1>
          <p>
            Choose your device category, check repair options, and follow a clear quote path before
            visiting our Ringwood Square kiosk.
          </p>

          <div className={styles.trustGrid} aria-label="Repair guarantees">
            {trustSignals.map((signal) => (
              <div className={styles.trustItem} key={signal.label}>
                <strong>{signal.value}</strong>
                <span>{signal.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.categoriesSection} aria-label="Repair categories">
        <div className={styles.categoryGrid}>
          {repairCategories.map((category, index) => (
            <Link href={category.href} key={category.href} className={styles.categoryCard}>
              <div className={styles.cardImage} aria-hidden="true">
                <Image
                  className={styles.cardPhoto}
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1180px) 50vw, 25vw"
                />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardTopline}>
                  <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.metric}>{category.metric}</span>
                </div>
                <h2>{category.title}</h2>
                <p>{category.description}</p>
                <div className={styles.cardFooter}>
                  <span>{category.detail}</span>
                  <strong>View Pricing</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.processSection} aria-labelledby="repair-process-heading">
        <div className={styles.processHeader}>
          <span className={styles.kicker}>Simple Flow</span>
          <h2 id="repair-process-heading">From broken device to clear next step.</h2>
        </div>
        <div className={styles.processGrid}>
          {processSteps.map((step, index) => (
            <article className={styles.processCard} key={step.title}>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.processSection} aria-labelledby="repairs-faq-heading">
        <div className={styles.processHeader}>
          <span className={styles.kicker}>Before You Visit</span>
          <h2 id="repairs-faq-heading">Popular repair questions</h2>
          <p>
            Common questions customers ask before choosing a repair category or requesting a quote
            for device repair services in Ringwood.
          </p>
        </div>
        <div className="faq-accordion">
          {faqs.map((faq) => (
            <details key={faq.question} className="faq-item">
              <summary className="faq-question">
                <span>{faq.question}</span>
                <svg
                  className="faq-chevron"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className="faq-answer">
                <p>
                  {faq.answer}
                  {faq.relatedLink ? (
                    <>
                      {" "}
                      If liquid exposure is involved, start with our{" "}
                      <Link href={faq.relatedLink.href}>{faq.relatedLink.label}</Link> page.
                    </>
                  ) : null}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <ServiceAreas />

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <span className={styles.kicker}>Need Help Choosing?</span>
          <h2>Not sure which model or repair type you need?</h2>
          <p>
            Not sure whether it is screen, battery, charging port or water damage? Start with your
            device category and we can help identify the right repair path.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/book-repair" className={styles.primaryAction}>
              Get a Live Quote
            </Link>
            <a href="tel:0481058514" className={styles.secondaryAction}>
              Call 0481 058 514
            </a>
            <ChatNowButton className={styles.secondaryAction} />
          </div>
        </div>
      </section>
    </main>
  );
}
