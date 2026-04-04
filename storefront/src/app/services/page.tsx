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
            "serviceType": ["Phone Repair", "Tablet Repair", "Computer Repair"],
            "areaServed": {
              "@type": "City",
              "name": "Melbourne"
            }
          })
        }}
      />
      <div className="container" style={{ paddingTop: '160px', minHeight: '80vh' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Our Repair Services</h1>
        <div className="servicesGrid">
          <Link href="/services/iphone-screen-repair-melbourne" className="serviceCard">
            <h3>iPhone Screen Repair</h3>
            <p>Premium quality screens replaced in 15-30 minutes. Lifetime warranty on parts.</p>
          </Link>
          <Link href="/services/ipad-repair" className="serviceCard">
            <h3>iPad & Tablet Repair</h3>
            <p>Expert glass and LCD replacement for all iPad generations. Most fixed in 1 hour.</p>
          </Link>
          <Link href="/services/computer-repair" className="serviceCard">
            <h3>Computer &amp; MacBook Repair</h3>
            <p>Screen, battery, charging port &amp; logic board repairs for all MacBook models. Same-day diagnosis.</p>
          </Link>
        </div>
      </div>
    </>
  );
}
