import Link from "next/link";
import dynamic from "next/dynamic";
import { Clock3, MapPin, Navigation, PhoneCall } from "lucide-react";
import { LocalBusinessSchema } from "@/components/seo/SchemaOrg";
import heroStyles from "./HomeHero.module.css";

const ReviewsSection = dynamic(() => import("@/components/ReviewsSection"));
const HomeFAQ = dynamic(() => import("@/components/HomeFAQ"));
const ServiceAreas = dynamic(() => import("@/components/seo/ServiceAreas"));

export default function Home() {
  return (
    <main>
      <LocalBusinessSchema />
      <header className={`${heroStyles.heroSection} w-full px-4 sm:px-6 lg:px-8`}>
        <div className={`${heroStyles.heroInner} flex flex-col items-center justify-center text-center w-full max-w-[1400px] mx-auto pt-16 pb-12`}>
          <div className="h-32 md:h-40" aria-hidden="true" />

          <h1 className="text-[3.5rem] md:text-[6rem] font-black tracking-tighter leading-[1.05] text-slate-950">
            Expert Mobile Phone &amp; Tablet Repair
            <span className="block mt-2 text-[2rem] md:text-[3.5rem] font-extrabold text-slate-500 tracking-tight">
              in Ringwood Square
            </span>
          </h1>

          <div className="hero-contact-pill gap-6">
            <span className="contact-item">No Fix, No Charge</span>
            <span className="contact-item">6-Month Warranty on All Repairs</span>
          </div>

          <div className="hero-cta">
            <a className="primary-btn" href="/book-repair">
              Book Repair Now
            </a>
            <a className="secondary-btn" href="/track-status">
              Track Status
            </a>
          </div>
        </div>
      </header>

      <section className="servicesGrid homepage-services-motion !mt-24 md:!mt-32" aria-labelledby="services-heading">
        <h2 className="sr-only" id="services-heading">Our Repair Services</h2>
        <Link href="/repairs/phone" className="serviceCard">
          <div className="card-bg" style={{ backgroundImage: "url('/images/services/phone-repair.jpg')" }} />
          <div className="card-gradient" />
          <div className="card-content">
            <h3>Phone Repair</h3>
            <p>Broken screen? Battery draining fast? We fix all brands including iPhone, Samsung, Oppo & Pixel.</p>
            <span className="card-link">View Pricing →</span>
          </div>
        </Link>
        <Link href="/repairs/tablet" className="serviceCard">
          <div className="card-bg" style={{ backgroundImage: "url('/images/services/tablet-repair.jpg')" }} />
          <div className="card-gradient" />
          <div className="card-content">
            <h3>Tablet & iPad Repair</h3>
            <p>Fast, reliable repairs for all iPad and Samsung tablet models. Most fixed in under 1 hour.</p>
            <span className="card-link">View Pricing →</span>
          </div>
        </Link>
        <Link href="/repairs/laptop" className="serviceCard">
          <div className="card-bg" style={{ backgroundImage: "url('/images/services/laptop-repair.jpg')" }} />
          <div className="card-gradient" />
          <div className="card-content">
            <h3>Laptop & MacBook Repair</h3>
            <p>Screen, battery, and logic board repairs for all MacBook and laptop models.</p>
            <span className="card-link">View Pricing →</span>
          </div>
        </Link>
        <Link href="/repairs/watch" className="serviceCard">
          <div className="card-bg" style={{ backgroundImage: "url('/images/services/watch-repair.jpg')" }} />
          <div className="card-gradient" />
          <div className="card-content">
            <h3>Smart Watch Repair</h3>
            <p>Apple Watch screen and battery repairs. Professional service for all series.</p>
            <span className="card-link">View Pricing →</span>
          </div>
        </Link>
      </section>


      <ReviewsSection />

      <HomeFAQ />

      <ServiceAreas />

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

    </main>
  );
}
