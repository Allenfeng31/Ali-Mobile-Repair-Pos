import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alimobile.com.au';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/login',
        '/dashboard',
        '/pos',
        '/internal',
        '/api/internal/', // Prevent internal API crawling
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
