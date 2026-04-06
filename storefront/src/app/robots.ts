import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/track-status', '/login', '/api/'],
    },
    sitemap: 'https://www.alimobile.com.au/sitemap.xml',
  };
}
