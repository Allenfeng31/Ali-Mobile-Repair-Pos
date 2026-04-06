import Link from "next/link";
import Script from "next/script";
import ReviewsSection from "@/components/ReviewsSection";

export default function Home() {
  return (
    <>
      <Script
        id="schema-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Ali Mobile Repair",
            "image": "https://www.alimobile.com.au/logo.png",
            "logo": "https://www.alimobile.com.au/logo.png",
            "@id": "https://www.alimobile.com.au",
            "url": "https://www.alimobile.com.au",
            "telephone": "0481058514",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Kiosk c1 Ringwood Square Shopping Centre",
              "addressLocality": "Ringwood",
              "addressRegion": "VIC",
              "postalCode": "3134",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": -37.8154441,
              "longitude": 145.222375
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "10:00",
                "closes": "17:00"
              }
            ],
            "sameAs": [
              "https://www.facebook.com/alimobilerepair",
              "https://www.instagram.com/alimobilerepair"
            ],
            "description": "Expert mobile phone and iPad repair in Melbourne. Specializing in screen replacement, battery fixing, and system recovery."
          })
        }}
      />
      <section className="hero">
        <div className="hero-contact-pill">
          <a href="https://maps.app.goo.gl/3fR3uWqE9B7v4j4Y7" target="_blank" rel="noopener noreferrer" className="contact-item">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span>Kiosk c1 Ringwood Square Shopping Centre, Ringwood 3134</span>
          </a>
          <div className="contact-item">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            <span>0481 058 514</span>
          </div>
        </div>
        <h1>Ali Mobile Repair</h1>
        <p>Premium Device Repair in Melbourne. No FIX no CHARGE.</p>
        <div className="hero-cta">
          <Link href="/book-repair" className="primary-btn">Book Repair Now</Link>
          <Link href="/track-status" className="secondary-btn">Track Status</Link>
        </div>
      </section>

      <section className="servicesGrid">
        <Link href="/services/iphone-screen-repair-melbourne" className="serviceCard">
          <h3>iPhone Repair</h3>
          <p>Broken screen? Battery draining fast? We fix it on the spot in 15-60 minutes.</p>
        </Link>
        <Link href="/services/ipad-repair" className="serviceCard">
          <h3>iPad Repair</h3>
          <p>Fast, reliable repairs for all iPad models. Get it fixed in under 1 hour.</p>
        </Link>
        <Link href="/services/computer-repair" className="serviceCard">
          <h3>Computer &amp; MacBook Repair</h3>
          <p>Screen, battery, and logic board repairs for all MacBook and laptop models.</p>
        </Link>
        <Link href="/book-repair" className="serviceCard">
          <h3>Smart Watch Repair</h3>
          <p>Apple Watch screen and battery repairs. Professional service for all series.</p>
        </Link>
      </section>


      <ReviewsSection />

      <section className="map-section">
        <h2>Visit Us in Melbourne</h2>
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
      </section>
    </>
  );
}
