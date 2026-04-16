import React from 'react';

export interface FAQ {
  question: string;
  answer: string;
}

interface StoreData {
  name: string;
  image: string;
  telephone: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification: Array<{
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }>;
  priceRange: string;
}

// Single active store configuration for Ringwood, Melbourne SEO Priority
const MAIN_STORE_CONFIG: StoreData = {
  name: 'Ali Mobile Repair',
  image: 'https://www.alimobile.com.au/logo.png',
  telephone: '0481058514',
  address: {
    streetAddress: 'Kiosk c1 Ringwood Square Shopping Centre',
    addressLocality: 'Ringwood, Melbourne',
    addressRegion: 'VIC',
    postalCode: '3134',
    addressCountry: 'AU',
  },
  geo: { latitude: -37.815444, longitude: 145.222375 },
  openingHoursSpecification: [
    {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '17:00',
    }
  ],
  priceRange: '$$',
};

interface StructuredDataProps {
  faqs?: FAQ[];
}

export function StructuredData({ faqs }: StructuredDataProps) {
  const getLocalBusinessSchema = (data: StoreData) => ({
    '@context': 'https://schema.org',
    '@type': 'MobilePhoneStore',
    name: data.name,
    image: data.image,
    telephone: data.telephone,
    address: {
      '@type': 'PostalAddress',
      ...data.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      ...data.geo,
    },
    url: 'https://www.alimobile.com.au',
    openingHoursSpecification: data.openingHoursSpecification.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      ...hours,
    })),
    priceRange: data.priceRange,
    areaServed: [
      { '@type': 'City', name: 'Ringwood' },
      { '@type': 'City', name: 'Melbourne' },
      { '@type': 'State', name: 'Victoria' }
    ]
  });

  const getFAQSchema = (faqsList: FAQ[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqsList.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getLocalBusinessSchema(MAIN_STORE_CONFIG)) }}
      />
      
      {faqs && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQSchema(faqs)) }}
        />
      )}
    </>
  );
}
