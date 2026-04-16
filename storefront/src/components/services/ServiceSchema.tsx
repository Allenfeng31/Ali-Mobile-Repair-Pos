import Script from "next/script";

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceSchemaProps {
  serviceName: string;
  description: string;
  faqs?: FAQItem[];
}

export function ServiceSchema({ serviceName, description, faqs }: ServiceSchemaProps) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Ali Mobile & Repair",
    "image": "https://alimobilerepair.com.au/logo.png", // Replace with actual URL
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kiosk C1, Ringwood Square Shopping Centre",
      "addressLocality": "Ringwood",
      "addressRegion": "VIC",
      "postalCode": "3134",
      "addressCountry": "AU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -37.815,
      "longitude": 145.228
    },
    "url": "https://alimobilerepair.com.au",
    "telephone": "0481 058 514",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ]
  };

  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <>
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
