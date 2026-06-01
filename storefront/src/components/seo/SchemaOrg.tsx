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
    "@type": "MobilePhoneStore",
    "name": "Ali Mobile & Repair",
    "image": "https://www.alimobile.com.au/logo.png",
    "@id": "https://www.alimobile.com.au/#localbusiness",
    "url": "https://www.alimobile.com.au",
    "telephone": "0481 058 514",
    "priceRange": "$$",
    "description": "Expert mobile phone, tablet, and laptop repair service located in Ringwood Square Shopping Centre, Melbourne. Specializing in screen replacements, micro-soldering, Face ID repair, and using OEM parts.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ringwood Square Shopping Centre Kiosk C1, Seymour St",
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
        "opens": "10:00",
        "closes": "17:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/alimobileandreari/"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Specialty Repair Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Micro-soldering Repair"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Face ID Repair"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "OEM Parts Replacement"
          }
        }
      ]
    },
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

export function RepairServiceSchema({
  serviceName,
  description,
  price,
  url,
}: {
  serviceName: string;
  description: string;
  price?: string;
  url?: string;
}) {
  const serviceData: any = {
    "name": serviceName,
    "description": description,
    "provider": {
      "@id": "https://www.alimobile.com.au/#localbusiness"
    },
  };

  const parsedPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  const hasNumericPrice = !isNaN(parsedPrice) && parsedPrice > 0;

  if (hasNumericPrice) {
    const offerData: any = {
      "@type": "Offer",
      "price": parsedPrice.toFixed(2),
      "priceCurrency": "AUD",
      "availability": "https://schema.org/InStock",
    };
    if (url) offerData.url = url;
    serviceData.offers = offerData;
  }

  return <SchemaOrg type="Service" data={serviceData} />;
}
