import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "Phone Repair Melbourne | iPhone Screen Replacement | Ali Mobile",
  description: "Expert phone repair in Ringwood, Melbourne. We specialize in iPhone screen replacement, battery fixing, and all brand repairs. Most fixed in 15-30 minutes.",
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
            "name": "Phone & iPhone Repair Melbourne",
            "serviceType": "Phone Repair",
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
                "name": "Phone Repair",
                "item": "https://www.alimobile.com.au/services/iphone-screen-repair-melbourne"
              }
            ]
          })
        }}
      />
      <div className="page-container">
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Phone &amp; iPhone Repair in Melbourne</h1>
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
          <Link href="/book-repair" className="primary-btn">Book Your Phone Repair</Link>
        </div>
      </div>
    </>
  );
}
