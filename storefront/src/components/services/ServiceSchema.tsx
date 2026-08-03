import Script from "next/script";
import { LOCAL_BUSINESS_OPENING_HOURS } from "@/lib/businessHours";

interface ServiceSchemaProps {
  serviceName: string;
  description: string;
}

export function getServiceLocalBusinessSchema(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "@id": "https://www.alimobile.com.au/#localbusiness",
    "name": "Ali Mobile & Repair",
    "image": "https://www.alimobile.com.au/logo.png",
    "description": description,
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
    "url": "https://www.alimobile.com.au",
    "telephone": "0481 058 514",
    "openingHoursSpecification": [LOCAL_BUSINESS_OPENING_HOURS]
  };
}

export function ServiceSchema({ serviceName, description }: ServiceSchemaProps) {
  const localBusinessSchema = getServiceLocalBusinessSchema(description);

  return (
    <>
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
    </>
  );
}
