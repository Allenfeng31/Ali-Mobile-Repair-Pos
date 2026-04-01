import Link from "next/link";
import Script from "next/script";

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
              "streetAddress": "Shop 28, Ringwood Square Shopping Centre",
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
        <h1>Melbourne's Premium Device Repair</h1>
        <p>Expert fixing and system recovery for iPhone, iPad, and more. No fix, no charge.</p>
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
      </section>

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
