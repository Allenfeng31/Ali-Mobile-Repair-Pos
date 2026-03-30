import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "iPhone Screen Repair Melbourne | Fast & Cheap | Ali Mobile",
  description: "Get your iPhone screen fixed in Melbourne within 30 minutes! High-quality parts, no fix no charge. Walk in to our Ringwood store today.",
};

export default function IPhoneRepairPage() {
  return (
    <>
      <head>
        <link rel="canonical" href="https://www.alimobile.com.au/services/iphone-screen-repair-melbourne" />
      </head>
      <Script
        id="schema-iphone-repair"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "iPhone Screen Repair Melbourne",
            "serviceType": "iPhone Screen Repair",
            "provider": {
              "@type": "LocalBusiness",
              "name": "Ali Mobile Repair",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Melbourne",
                "addressRegion": "VIC"
              }
            },
            "category": "Mobile Phone Repair",
            "description": "High-quality iPhone screen replacements in 15-30 minutes."
          })
        }}
      />
      <Script
        id="schema-iphone-breadcrumbs"
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
                "name": "iPhone Repair",
                "item": "https://www.alimobile.com.au/services/iphone-screen-repair-melbourne"
              }
            ]
          })
        }}
      />
      <div style={{ paddingTop: '100px', padding: '0 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>iPhone Screen Repair in Melbourne</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8' }}>
          At Ali Mobile Repair, we specialize in high-quality iPhone screen replacements. 
          Whether you dropped your brand new iPhone 15 or need a quick fix for an older model, 
          our expert technicians in Ringwood will have it looking brand new in just 15-30 minutes.
        </p>

        <h2 style={{ marginBottom: '1rem' }}>Why Choose Us?</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Premium Quality Screens</li>
          <li>On-the-spot Repair (15-60 min)</li>
          <li>No Fix, No Charge Guarantee</li>
          <li>Over 10 Years Setup Experience</li>
        </ul>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/book-repair" className="primary-btn">Book Your iPhone Repair</Link>
        </div>
      </div>
    </>
  );
}
