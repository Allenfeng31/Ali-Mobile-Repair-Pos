import Link from "next/link";
import Script from "next/script";
import LiveQuoteCalculator from "@/components/LiveQuoteCalculator";

export const metadata = {
  title: "Professional iPad Repair Melbourne | Fast & Reliable | Ali Mobile",
  description: "Expert iPad repair services in Melbourne. From screen replacement to battery issues, we fix all iPad models within 1 hour. No fix no charge.",
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
            "name": "iPad Repair Melbourne",
            "serviceType": "iPad Repair",
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
                "name": "iPad Repair",
                "item": "https://www.alimobile.com.au/services/ipad-repair"
              }
            ]
          })
        }}
      />
      <div style={{ paddingTop: '100px', padding: '0 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Professional iPad Repair in Melbourne</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8' }}>
          Cracked your iPad screen? Battery not holding a charge? Ali Mobile Repair provides 
          specialized repair services for all iPad models, including iPad Pro, Air, and Mini. 
          Most repairs are completed within 1 hour at our Ringwood store.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Get a Live iPad Repair Quote</h2>
          <LiveQuoteCalculator />
        </section>

        <h2 style={{ marginBottom: '1rem' }}>Our iPad Services Include:</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Glass & LCD Replacement</li>
          <li>Battery Replacement</li>
          <li>Charging Port Repair</li>
          <li>System Recovery & Data Backup</li>
        </ul>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/book-repair" className="primary-btn">Book Your iPad Repair</Link>
        </div>
      </div>
    </>
  );
}
