import { Metadata } from 'next';

interface MetadataProps {
  title: string;
  description: string;
  location?: string;
  brand?: string;
  device?: string;
  service?: string;
}

export function constructMetadata({
  title,
  description,
  location = 'Ringwood',
  brand,
  device,
  service,
}: MetadataProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alimobile.com.au';
  
  // SEO Optimized Title
  const seoTitle = `${title} | Ali Mobile & Repair ${location}`;
  
  return {
    title: seoTitle,
    description: description,
    openGraph: {
      title: seoTitle,
      description: description,
      url: baseUrl,
      siteName: 'Ali Mobile & Repair',
      locale: 'en_AU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: description,
    },
    alternates: {
      canonical: baseUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
