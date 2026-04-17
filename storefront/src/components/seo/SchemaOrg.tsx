import Script from "next/script";

interface SchemaOrgProps {
  type: 'LocalBusiness' | 'Service' | 'FAQPage';
  data: any;
}

export function SchemaOrg({ type, data }: SchemaOrgProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <Script
      id={`schema-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessSchema() {
  const businessData = {
    "name": "Ali Mobile & Repair",
    "image": "https://alimobile.com.au/logo.png", // Correct logo URL
    "@id": "https://alimobile.com.au/#localbusiness",
    "url": "https://alimobile.com.au",
    "telephone": "0481 058 514",
    "priceRange": "$$",
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
      "latitude": -37.815340,
      "longitude": 145.228510
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/alimobileandreari/",
    ],
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": -37.815340,
        "longitude": 145.228510
      },
      "geoRadius": "15000"
    }
  };

  return <SchemaOrg type="LocalBusiness" data={businessData} />;
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const faqData = {
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return <SchemaOrg type="FAQPage" data={faqData} />;
}

export function RepairServiceSchema({ serviceName, description, price }: { serviceName: string; description: string; price?: string }) {
  const serviceData = {
    "name": serviceName,
    "description": description,
    "provider": {
      "@id": "https://alimobile.com.au/#localbusiness"
    },
    "offers": price ? {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "AUD",
      "availability": "https://schema.org/InStock"
    } : {
      "@type": "Offer",
      "description": "No Fix No Charge policy. Get a free quote."
    }
  };

  return <SchemaOrg type="Service" data={serviceData} />;
}
