import Link from "next/link";
import { Metadata } from "next";

import ChatNowButton from "@/components/ChatNowButton";
import ServiceAreas from "@/components/seo/ServiceAreas";

import styles from "./RepairsHub.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Professional Device Repair Services in Ringwood | Ali Mobile",
  description:
    "Choose your device category to find expert repair services in Ringwood. Phone, Tablet, Laptop, and Smart Watch repairs with same-day turnaround.",
  alternates: {
    canonical: "/repairs",
  },
  openGraph: {
    title: "Professional Device Repair Services in Ringwood | Ali Mobile",
    description:
      "Choose your device category to find expert repair services in Ringwood. Phone, Tablet, Laptop, and Smart Watch repairs with same-day turnaround.",
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
    metric: "Same day",
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
    text: "Start with the category that matches your device so we can guide you to the right brand, model, and repair type.",
  },
  {
    title: "Check Live Pricing",
    text: "Most common repairs show a clear price path before you book, with options for part grade when available.",
  },
  {
    title: "Drop Off or Book",
    text: "Book online for priority service or bring the device to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 for a fast assessment.",
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
            Select a category below to see repair services, live pricing, and model-specific options
            for phones, tablets, laptops, and smart watches in Ringwood.
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
                <div
                  className={styles.cardPhoto}
                  style={{ backgroundImage: `url('${category.image}')` }}
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

      <ServiceAreas />

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <span className={styles.kicker}>Need Help Choosing?</span>
          <h2>Not sure which model or repair type you need?</h2>
          <p>
            Use the live quote flow, call the store, or open chat. We will identify the device and
            give you the fastest realistic repair option.
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
