import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "Drone Repair Near Me | DJI Repair Melbourne | Ali Mobile",
  description: "Expert drone repair services in Melbourne. We fix DJI Mavic, Phantom, and more. Fast diagnosis and reliable parts replacement.",
};

export default function DroneRepairPage() {
  return (
    <>
      <head>
        <link rel="canonical" href="https://www.alimobile.com.au/services/drone-repair-near-me" />
      </head>
      <Script
        id="schema-drone-repair"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Drone Repair Melbourne",
            "serviceType": "Drone Repair",
            "provider": {
              "@type": "LocalBusiness",
              "name": "Ali Mobile Repair",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Melbourne",
                "addressRegion": "VIC"
              }
            },
            "category": "Electronics Repair",
            "description": "Expert drone repair and DJI gimbal fixing in Melbourne."
          })
        }}
      />
      <Script
        id="schema-drone-breadcrumbs"
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
                "name": "Drone Repair",
                "item": "https://www.alimobile.com.au/services/drone-repair-near-me"
              }
            ]
          })
        }}
      />
      <div style={{ paddingTop: '100px', padding: '0 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Drone Repair Services Near You</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8' }}>
          Crashed your drone? Don't worry! Ali Mobile Repair provides specialized drone 
          diagnostic and repair services in Melbourne. We cater to popular consumer models 
          including DJI series.
        </p>

        <h2 style={{ marginBottom: '1rem' }}>Our Drone Services Include:</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Gimbal Repair & Replacement</li>
          <li>Motor & Arm Replacement</li>
          <li>Water Damage Recovery</li>
          <li>Software & Calibration Issues</li>
        </ul>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/book-repair" className="primary-btn">Get a Quote for Your Drone</Link>
        </div>
      </div>
    </>
  );
}
