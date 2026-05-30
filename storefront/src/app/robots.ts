import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Aggressive block for all subdomains (pos / api)
  if (host.includes('pos.alimobile.com.au') || host.includes('api.alimobile.com.au')) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

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
