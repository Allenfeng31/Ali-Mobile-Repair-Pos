import Link from "next/link";
import Script from "next/script";

export default function ServicesPage() {
  return (
    <>
      <Script
        id="schema-services"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "provider": {
              "@type": "LocalBusiness",
              "name": "Ali Mobile Repair"
            },
            "serviceType": ["Phone Repair", "Tablet Repair", "Computer Repair", "Smart Watch Repair"],
            "areaServed": [
              { "@type": "City", "name": "Ringwood" },
              { "@type": "City", "name": "Melbourne" }
            ]
          })
        }}
      />
      <div className="container" style={{ paddingTop: '160px', minHeight: '80vh' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Our Repair Services</h1>
        <div className="servicesGrid">
          <Link href="/services/iphone-screen-repair-melbourne" className="serviceCard">
            <h3>Phone Repair</h3>
            <p>Premium quality screen and battery replacement for iPhone, Samsung, Oppo, and Google Pixel. Most fixed in 15-30 minutes.</p>
          </Link>
          <Link href="/services/ipad-repair" className="serviceCard">
            <h3>Tablet Repair</h3>
            <p>Expert glass and LCD replacement for all iPad generations and Samsung Tab models. Reliable service in under 1 hour.</p>
          </Link>
          <Link href="/services/computer-repair" className="serviceCard">
            <h3>Computer &amp; MacBook Repair</h3>
            <p>Screen, battery, and logic board repairs for all MacBook and laptop models. Professional diagnosis.</p>
          </Link>
          <Link href="/book-repair" className="serviceCard">
            <h3>Smart Watch Repair</h3>
            <p>Apple Watch screen replacement and battery fixing. Fast service for all Series and Ultra models.</p>
          </Link>
        </div>
      </div>
    </>
  );
}
