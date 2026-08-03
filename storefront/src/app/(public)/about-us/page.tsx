import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { LOCAL_BUSINESS_OPENING_HOURS } from "@/lib/businessHours";

import styles from "./AboutUs.module.css";

const baseUrl = "https://www.alimobile.com.au";

export const metadata: Metadata = {
  title: "About Ali Mobile & Repair | Ringwood Repair Team",
  description:
    "Learn about Ali Mobile & Repair in Ringwood Square, our repair approach, No Fix, No Charge policy, and how we help local customers with phones, tablets, and laptops.",
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    title: "About Ali Mobile & Repair | Ringwood Repair Team",
    description:
      "Learn about Ali Mobile & Repair in Ringwood Square, our repair approach, No Fix, No Charge policy, and how we help local customers with phones, tablets, and laptops.",
    url: "https://www.alimobile.com.au/about-us",
    type: "website",
    locale: "en_AU",
    siteName: "Ali Mobile & Repair",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Ali Mobile & Repair | Ringwood Repair Team",
    description:
      "Learn about Ali Mobile & Repair in Ringwood Square, our repair approach, No Fix, No Charge policy, and how we help local customers with phones, tablets, and laptops.",
  },
};

const proofPoints = [
  { value: "10+", label: "Years Experience" },
  { value: "C1", label: "Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134" },
  { value: "0$", label: "No Fix, No Charge" },
];

const principles = [
  {
    label: "Transparent Diagnosis",
    text: "Every repair starts with a clear inspection, a practical quote, and a straight answer before any work begins.",
  },
  {
    label: "Precision Repair",
    text: "Screens, batteries, charging ports, tablets, laptops, and board-level issues are handled with careful bench discipline.",
  },
  {
    label: "Local Accountability",
    text: "You deal with a Ringwood team that lives by repeat customers, word of mouth, and repairs that hold up after you leave.",
  },
];

const trustDetails = [
  {
    label: "Quote-first repairs",
    text: "We inspect the device, explain the likely fault, and confirm the repair quote before work proceeds. If damage points to a different repair path, we talk it through first.",
  },
  {
    label: "Practical data privacy",
    text: "Most hardware repairs do not require browsing personal photos or files. When functional testing needs access, we explain what needs checking and can involve the customer where possible.",
  },
  {
    label: "Parts explained clearly",
    text: "Screen, battery, charging and device repairs can have different part options depending on model and stock. The quoted option is explained so customers know what they are approving.",
  },
  {
    label: "Warranty boundaries",
    text: "Repair warranty support is explained before handover, including what is covered and what may fall outside normal warranty, such as liquid damage, severe impact or unrelated faults.",
  },
];

const repairLinks = [
  {
    href: "/repairs/phone",
    label: "Phone repair",
    text: "Find brand and model-specific repair paths for iPhone, Samsung, Google Pixel, OPPO and more.",
  },
  {
    href: "/repairs/screen-replacement",
    label: "Screen replacement",
    text: "Compare common cracked screen and display repair options before booking.",
  },
  {
    href: "/repairs/battery-replacement",
    label: "Battery replacement",
    text: "Check battery service guidance for weak battery life, swelling or shutdown issues.",
  },
  {
    href: "/repairs/charging-port-replacement",
    label: "Charging port repair",
    text: "Understand charging faults, port issues and when diagnosis is needed first.",
  },
];

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MobilePhoneStore",
  "@id": `${baseUrl}/#localbusiness`,
  name: "Ali Mobile & Repair",
  url: baseUrl,
  image: `${baseUrl}/images/about-us-new.jpg`,
  telephone: "+61481058514",
  priceRange: "$$",
  description:
    "Ali Mobile & Repair is a local electronics repair kiosk at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134, helping customers with phone, tablet, laptop and smart watch repair assessments.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ringwood Square Shopping Centre Kiosk C1, Seymour St",
    addressLocality: "Ringwood",
    addressRegion: "VIC",
    postalCode: "3134",
    addressCountry: "AU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -37.81534,
    longitude: 145.22851,
  },
  openingHoursSpecification: [LOCAL_BUSINESS_OPENING_HOURS],
  areaServed: [
    { "@type": "City", name: "Ringwood" },
    { "@type": "AdministrativeArea", name: "Melbourne eastern suburbs" },
  ],
  makesOffer: repairLinks.map((link) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: link.label,
      url: `${baseUrl}${link.href}`,
    },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${baseUrl}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "About Us",
      item: `${baseUrl}/about-us`,
    },
  ],
};

export default function AboutUsPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>Ringwood Repair Lab</span>
            <h1>
              Quietly technical.
              <span>Seriously local.</span>
            </h1>
            <p>
              Ali Mobile & Repair has spent more than a decade helping Ringwood customers get phones,
              tablets, and laptops back to work without drama, hidden costs, or inflated chain-store pricing.
            </p>
            <div className={styles.heroActions}>
              <Link href="/book-repair" className={styles.primaryAction}>
                Book a Repair
              </Link>
              <Link href="/repairs" className={styles.secondaryAction}>
                View Services
              </Link>
            </div>
          </div>

          <div className={styles.visualPanel} aria-label="Ali Mobile & Repair store front">
            <div className={styles.imageShell}>
              <Image
                src="/images/about-us-new.jpg"
                alt="Ali Mobile & Repair store front in Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134"
                width={680}
                height={460}
                priority
                className={styles.storeImage}
              />
            </div>
            <div className={styles.signalCard}>
              <span>Live Bench Status</span>
              <strong>Repairs in motion</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.proofBand} aria-label="Business highlights">
        <div className={styles.proofGrid}>
          {proofPoints.map((item) => (
            <div className={styles.proofItem} key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyGrid}>
          <div className={styles.storyIntro}>
            <span className={styles.kicker}>Our Story</span>
            <h2>Built for the repair customers actually need.</h2>
          </div>
          <div className={styles.storyText}>
            <p>
              We are a specialist electronics repair shop based at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134. Our work covers everyday device problems such as cracked screens and tired
              batteries, plus trickier issues like charging faults, water damage, and laptop repairs.
            </p>
            <p>
              The promise is simple: careful diagnosis, fair pricing, clearly explained part options,
              and repair advice you can trust. Our No Fix, No Charge policy keeps the incentives clean,
              so customers only pay when the repair actually solves the problem.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.trustSection} aria-labelledby="trust-heading">
        <div className={styles.trustHeader}>
          <span className={styles.kicker}>Customer Trust</span>
          <h2 id="trust-heading">Clear expectations before the device goes on the bench.</h2>
          <p>
            Local repair trust comes from the details: what we test, what we quote, how we treat customer
            data, and where warranty support begins and ends.
          </p>
        </div>
        <div className={styles.trustDetailGrid}>
          {trustDetails.map((detail) => (
            <article className={styles.trustDetailCard} key={detail.label}>
              <h3>{detail.label}</h3>
              <p>{detail.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.principles} aria-label="Repair principles">
        <div className={styles.principlesHeader}>
          <span className={styles.kicker}>How We Work</span>
          <h2>Less theatre, more precision.</h2>
        </div>
        <div className={styles.principleGrid}>
          {principles.map((principle, index) => (
            <article className={styles.principleCard} key={principle.label}>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <h3>{principle.label}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.repairPathSection} aria-labelledby="repair-path-heading">
        <div className={styles.repairPathHeader}>
          <span className={styles.kicker}>Repair Pathways</span>
          <h2 id="repair-path-heading">Start with the repair path that matches the problem.</h2>
        </div>
        <div className={styles.repairPathGrid}>
          {repairLinks.map((link) => (
            <Link href={link.href} className={styles.repairPathCard} key={link.href}>
              <strong>{link.label}</strong>
              <span>{link.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <span className={styles.kicker}>Free Quote</span>
          <h2>Bring the device in. We will tell you what is worth fixing.</h2>
          <p>
            Visit Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 or book online for priority service. Most common screen and battery
            same-day repair may be available for many common phone models when parts are in stock
            and queue timing allows.
          </p>
          <Link href="/book-repair" className={styles.primaryAction}>
            Book Repair Now
          </Link>
        </div>
      </section>
    </main>
  );
}
