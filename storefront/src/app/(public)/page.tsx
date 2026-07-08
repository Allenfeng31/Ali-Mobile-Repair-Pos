import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Clock3, MapPin, Navigation, PhoneCall } from "lucide-react";
import { LocalBusinessSchema } from "@/components/seo/SchemaOrg";
import RealRepairResultsSection from "@/components/repair-results/RealRepairResultsSection";
import { REPAIR_CATEGORY_NAV_ITEMS } from "@/lib/repairCategoryNavigation";
import heroStyles from "./HomeHero.module.css";
import homeStyles from "./HomePage.module.css";

const ReviewsSection = dynamic(() => import("@/components/ReviewsSection"));
const HomeFAQ = dynamic(() => import("@/components/HomeFAQ"));
const ServiceAreas = dynamic(() => import("@/components/seo/ServiceAreas"));
import ScrollReveal from "@/components/ScrollReveal";

const popularRepairs = [
  {
    label: "iPhone Repairs",
    href: "/repairs/phone/iphone",
    note: "Screens, batteries, charging and model-specific repair options.",
  },
  {
    label: "Samsung Repairs",
    href: "/repairs/phone/samsung",
    note: "Galaxy screen, battery and charging repair paths.",
  },
  {
    label: "Other Phone Repairs",
    href: "/repairs/phone",
    note: "Google Pixel, Oppo and other phone repair categories.",
  },
  {
    label: "iPad Repairs",
    href: "/repairs/tablet/ipad",
    note: "iPad screen, battery and charging repair options.",
  },
  {
    label: "MacBook Repairs",
    href: "/repairs/laptop/macbook",
    note: "MacBook screen, battery, keyboard and diagnostic support.",
  },
  {
    label: "Apple Watch Repairs",
    href: "/repairs/watch/apple",
    note: "Apple Watch screen and battery repair options.",
  },
];

export const metadata: Metadata = {
  title: "Phone, Tablet, MacBook & Apple Watch Repair Ringwood | Ali Mobile",
  description:
    "Ali Mobile & Repair offers phone, tablet, MacBook and Apple Watch repairs in Ringwood Square with clear quotes, walk-ins welcome, and online booking.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Phone, Tablet, MacBook & Apple Watch Repair Ringwood | Ali Mobile",
    description:
      "Ali Mobile & Repair offers phone, tablet, MacBook and Apple Watch repairs in Ringwood Square with clear quotes, walk-ins welcome, and online booking.",
    url: "https://www.alimobile.com.au/",
    type: "website",
    locale: "en_AU",
    siteName: "Ali Mobile & Repair",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phone, Tablet, MacBook & Apple Watch Repair Ringwood | Ali Mobile",
    description:
      "Ali Mobile & Repair offers phone, tablet, MacBook and Apple Watch repairs in Ringwood Square with clear quotes, walk-ins welcome, and online booking.",
  },
};

export default function Home() {
  return (
    <main>
      <LocalBusinessSchema />
      <header className={`${heroStyles.heroSection} w-full px-4 sm:px-6 lg:px-8`}>
        <div className={`${heroStyles.heroInner} flex flex-col items-center justify-center text-center w-full max-w-[1400px] mx-auto pt-10 md:pt-16 pb-10 md:pb-12`}>
          <div className={heroStyles.heroTopSpacer} aria-hidden="true" />

          <h1 className={heroStyles.heroTitle}>
            Expert Phone, Tablet &amp; MacBook Repair
          </h1>
          <p className={heroStyles.heroLocation}>in Ringwood Square</p>

          <div className="hero-contact-pill gap-6">
            <span className="contact-item">Walk-ins welcome</span>
            <span className="contact-item">Call ahead for parts and timing</span>
            <span className="contact-item">Find us at Kiosk C1, Ringwood Square Shopping Centre, Ringwood VIC.</span>
          </div>

          <div className={heroStyles.repairIssueBlock}>
            <span className={heroStyles.repairIssueLabel}>Common Repair Issues</span>
            <nav className={heroStyles.repairIssueGrid} aria-label="Common repair issues">
              {REPAIR_CATEGORY_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={heroStyles.repairIssueLink}
                >
                  <span className={heroStyles.repairIssueLinkText}>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="hero-cta">
            <a className="primary-btn" href="/book-repair">
              Book Repair Now
            </a>
          </div>
        </div>
      </header>

      <ScrollReveal>
        <section className="servicesGrid homepage-services-motion !mt-24 md:!mt-32" aria-labelledby="services-heading">
          <h2 className="sr-only" id="services-heading">Our Repair Services</h2>
          <Link href="/repairs/phone" className="serviceCard">
            <div className="card-bg">
              <Image
                src="/images/services/phone-repair.jpg"
                alt="Phone repair service at Ali Mobile"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="card-gradient" />
            <div className="card-content">
              <h3>Phone Repair</h3>
              <p>iPhone, Samsung, Google Pixel and Oppo screen, battery, charging port and camera repair options.</p>
              <span className="card-link">View Pricing →</span>
            </div>
          </Link>
          <Link href="/repairs/tablet" className="serviceCard">
            <div className="card-bg">
              <Image
                src="/images/services/tablet-repair.jpg"
                alt="Tablet repair service at Ali Mobile"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="card-gradient" />
            <div className="card-content">
              <h3>Tablet & iPad Repair</h3>
              <p>iPad and tablet screen, battery and charging repairs with quote confirmation before work begins.</p>
              <span className="card-link">View Pricing →</span>
            </div>
          </Link>
          <Link href="/repairs/laptop" className="serviceCard">
            <div className="card-bg">
              <Image
                src="/images/services/laptop-repair.jpg"
                alt="MacBook repair service at Ali Mobile"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="card-gradient" />
            <div className="card-content">
              <h3>Laptop & MacBook Repair</h3>
              <p>MacBook screen, battery, keyboard and diagnostic support for common laptop repair issues.</p>
              <span className="card-link">View Pricing →</span>
            </div>
          </Link>
          <Link href="/repairs/watch" className="serviceCard">
            <div className="card-bg">
              <Image
                src="/images/services/watch-repair.jpg"
                alt="Apple Watch repair service at Ali Mobile"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="card-gradient" />
            <div className="card-content">
              <h3>Smart Watch Repair</h3>
              <p>Apple Watch screen and battery repair options. Call ahead for model support and parts timing.</p>
              <span className="card-link">View Pricing →</span>
            </div>
          </Link>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className={homeStyles.popularRepairs} aria-labelledby="popular-repairs-heading">
          <div className={homeStyles.popularShell}>
            <div className={homeStyles.popularHeader}>
              <span className={homeStyles.popularKicker}>Quick repair paths</span>
              <h2 id="popular-repairs-heading">Popular repair categories</h2>
              <p>
                Choose a repair category or book online for quote confirmation.
              </p>
            </div>

            <nav className={homeStyles.popularGrid} aria-label="Popular repair categories">
              {popularRepairs.map((repair) => (
                <Link key={`${repair.label}-${repair.href}`} href={repair.href} className={homeStyles.popularCard}>
                  <span>{repair.label}</span>
                  <small>{repair.note}</small>
                </Link>
              ))}
            </nav>

            <div className={homeStyles.infoStrip}>
              <h3>Repairs available at our Ringwood Square kiosk</h3>
              <p>
                We help with iPhone, Samsung, Google Pixel, Oppo, iPad, MacBook and Apple Watch repairs.
                Visit Ali Mobile &amp; Repair at Kiosk C1 inside Ringwood Square. Walk-ins are welcome,
                and quotes are confirmed before repair.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <RealRepairResultsSection />
      </ScrollReveal>

      <ScrollReveal>
        <ReviewsSection />
      </ScrollReveal>

      <ScrollReveal>
        <HomeFAQ />
      </ScrollReveal>

      <ScrollReveal>
        <ServiceAreas />
      </ScrollReveal>

      <ScrollReveal>
        <section className="map-section" aria-labelledby="map-heading">
          <div className="map-shell">
            <div className="map-copy">
              <span className="map-kicker">
                <MapPin size={16} strokeWidth={2.5} aria-hidden="true" />
                Visit the repair bench
              </span>
              <h2 id="map-heading">Find us inside Ringwood Square</h2>
              <p>
                Drop in at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 for a practical device check, quote confirmation, or same-day
                repair path when parts are available.
              </p>

              <div className="map-info-grid">
                <div>
                  <Navigation size={18} strokeWidth={2.5} aria-hidden="true" />
                  <span>Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134</span>
                </div>
                <div>
                  <Clock3 size={18} strokeWidth={2.5} aria-hidden="true" />
                  <span>Call ahead for stock and timing</span>
                </div>
              </div>

              <div className="map-actions">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Ali+Mobile+%26+Repair+Ringwood"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repair-primary-action"
                >
                  Get Directions
                  <Navigation size={18} strokeWidth={2.7} aria-hidden="true" />
                </a>
                <a href="tel:0481058514" className="repair-secondary-action">
                  <PhoneCall size={17} strokeWidth={2.6} aria-hidden="true" />
                  Call Now
                </a>
              </div>
            </div>

            <div className="map-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6303.831349042814!2d145.222375!3d-37.8154441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad63bd4323d01bd%3A0x1b936dbf4a8db011!2sAli%20Mobile%20%26%20Repair!5e0!3m2!1sen!2sau!4v1775003205754!5m2!1sen!2sau"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                title="Ali Mobile Repair Location - Ringwood Melbourne"
              ></iframe>
            </div>
          </div>
        </section>
      </ScrollReveal>

    </main>
  );
}
