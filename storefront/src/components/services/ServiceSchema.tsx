import Script from "next/script";

interface ServiceSchemaProps {
  serviceName: string;
  description: string;
  url: string;
}

export function ServiceSchema({ serviceName, description, url }: ServiceSchemaProps) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    "name": serviceName,
    "url": url,
    "description": description,
    "provider": {
      "@id": "https://www.alimobile.com.au/#localbusiness",
    },
  };

  return (
    <Script
      id="service-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
    />
  );
}
