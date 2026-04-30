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
    "image": "https://alimobile.com.au/logo.png",
    "@id": "https://alimobile.com.au/#localbusiness",
    "url": "https://alimobile.com.au",
    "telephone": "0481 058 514",
    "priceRange": "$$",
    "description": "Expert mobile phone, tablet, and laptop repair service located in Ringwood Square Shopping Centre, Melbourne. Specializing in screen replacements, micro-soldering, Face ID repair, and using OEM parts.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kiosk C1, Ringwood Square Shopping Centre, 59-65 Maroondah Hwy",
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

export function RepairServiceSchema({ serviceName, description, price, modelCode }: { serviceName: string; description: string; price?: string; modelCode?: string }) {
  const serviceData: any = {
    "name": serviceName,
    "description": description,
    "provider": {
      "@id": "https://alimobile.com.au/#localbusiness"
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock"
    }
  };

  const parsedPrice = typeof price === 'string' ? parseFloat(price) : Number(price);

  if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
    serviceData.offers.description = "No Fix No Charge policy. Get a free quote.";
    // STRICT GUARD: Ensure absolutely no price output for zero/empty values
    delete (serviceData.offers as any).price;
    delete (serviceData.offers as any).priceCurrency;
  } else {
    serviceData.offers.price = parsedPrice.toFixed(2);
    serviceData.offers.priceCurrency = "AUD";
  }

  if (modelCode) {
    serviceData.model = modelCode;
    serviceData.mpn = modelCode;
    serviceData.itemOffered = {
      "@type": "Product",
      "name": modelCode,
      "model": modelCode
    };
  }

  return <SchemaOrg type="Service" data={serviceData} />;
}
