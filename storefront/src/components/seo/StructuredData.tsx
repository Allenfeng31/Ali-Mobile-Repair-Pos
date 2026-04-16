import React from 'react';

export type StoreLocation = 'Melbourne' | 'Hobart';

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

// Store configs map
const STORE_CONFIGS: Record<StoreLocation, StoreData> = {
  Melbourne: {
    name: 'Ali Mobile & Repair',
    image: 'https://www.alimobile.com.au/logo.png',
    telephone: '0481058514',
    address: {
      streetAddress: 'Kiosk c1 Ringwood Square Shopping Centre',
      addressLocality: 'Ringwood',
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
  },
  Hobart: {
    name: 'Ali Mobile & Repair - Hobart',
    image: 'https://www.alimobile.com.au/logo.png',
    telephone: '0481058514',
    address: {
      streetAddress: 'Hobart CBD', // Placeholder
      addressLocality: 'Hobart',
      addressRegion: 'TAS',
      postalCode: '7000',
      addressCountry: 'AU',
    },
    geo: { latitude: -42.8821, longitude: 147.3272 },
    openingHoursSpecification: [
      {
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:30',
      },
    ],
    priceRange: '$$',
  }
};

interface StructuredDataProps {
  location?: StoreLocation;
  faqs?: FAQ[];
}

export function StructuredData({ location, faqs }: StructuredDataProps) {
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
    url: `https://www.alimobile.com.au${location ? `/locations/${location.toLowerCase()}` : ''}`,
    openingHoursSpecification: data.openingHoursSpecification.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      ...hours,
    })),
    priceRange: data.priceRange,
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
      {location && STORE_CONFIGS[location] && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getLocalBusinessSchema(STORE_CONFIGS[location])) }}
        />
      )}
      
      {faqs && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQSchema(faqs)) }}
        />
      )}
    </>
  );
}
