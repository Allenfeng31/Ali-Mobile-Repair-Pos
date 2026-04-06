import Link from "next/link";
import Script from "next/script";
import LiveQuoteCalculator from "@/components/LiveQuoteCalculator";

export const metadata = {
  title: "Tablet & iPad Repair Melbourne | Fast & Reliable | Ali Mobile",
  description: "Expert tablet and iPad repair services in Ringwood, Melbourne. We fix iPad Pro, Air, Mini and Samsung Galaxy Tab models. Most fixed within 1 hour. No fix no charge.",
};

export default function IPadRepairPage() {
  return (
    <>
      <head>
        <link rel="canonical" href="https://www.alimobile.com.au/services/ipad-repair" />
      </head>
      <Script
        id="schema-ipad-repair"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Tablet & iPad Repair Melbourne",
            "serviceType": "Tablet Repair",
            "provider": {
              "@type": "LocalBusiness",
              "name": "Ali Mobile Repair",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Melbourne",
                "addressRegion": "VIC"
              }
            },
            "category": "Tablet Repair",
            "description": "Professional iPad repair for all models in Melbourne."
          })
        }}
      />
      <Script
        id="schema-ipad-breadcrumbs"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.alimobile.com.au"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Services",
                "item": "https://www.alimobile.com.au/services"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Tablet Repair",
                "item": "https://www.alimobile.com.au/services/ipad-repair"
              }
            ]
          })
        }}
      />
      <div className="page-container">
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Tablet &amp; iPad Repair in Melbourne</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8' }}>
          Cracked your iPad screen? Battery not holding a charge? Ali Mobile Repair provides 
          specialized repair services for all iPad models, including iPad Pro, Air, and Mini. 
          Most repairs are completed within 1 hour at our Ringwood store.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Get a Live Tablet Repair Quote</h2>
          <LiveQuoteCalculator />
        </section>

        <h2 style={{ marginBottom: '1rem' }}>Our Tablet Services Include:</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Glass & LCD Replacement</li>
          <li>Battery Replacement</li>
          <li>Charging Port Repair</li>
          <li>System Recovery & Data Backup</li>
        </ul>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/book-repair" className="primary-btn">Book Your Tablet Repair</Link>
        </div>
      </div>
    </>
  );
}
