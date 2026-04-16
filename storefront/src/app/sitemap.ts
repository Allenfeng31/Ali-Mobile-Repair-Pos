import { MetadataRoute } from 'next';
import { RawItem, ParsedItem, parseItem, slugify } from '@/lib/inventoryUtils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alimobile.com.au';
  
  // Blog posts - matching the discovered MD files
  const blogPosts = [
    'iphone-17-pro-screen-replacement-ringwood',
    'fast-reliable-screen-replacement-ringwood',
    'reliable-phone-repair-ringwood',
    'professional-mobile-phone-repair-ringwood',
    'system-recovery-services-ringwood'
  ];

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/services/iphone-screen-repair-melbourne`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/services/ipad-repair`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/services/computer-repair`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/book-repair`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const sitemapUrls = [...staticUrls, ...blogUrls];

  try {
    const backendUrl = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3001';
    // Use short cache for ISR to periodically check for new combinations without burdening DB
    const res = await fetch(`${backendUrl}/api/inventory`, { next: { revalidate: 3600 } });
    
    if (res.ok) {
      const raw: RawItem[] = await res.json();
      const parsed = raw.map(parseItem).filter(Boolean) as ParsedItem[];
      
      const paths: { brand: string; model: string; service: string }[] = [];
      
      parsed.forEach(item => {
        paths.push({
          brand: slugify(item.brand),
          model: slugify(item.deviceModel),
          service: slugify(item.service),
        });
      });
      
      const uniquePaths = Array.from(new Set(paths.map(p => JSON.stringify(p)))).map(p => JSON.parse(p));
      
      const dynamicUrls: MetadataRoute.Sitemap = uniquePaths.map(path => ({
        url: `${baseUrl}/repairs/${path.brand}/${path.model}/${path.service}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));

      return [...sitemapUrls, ...dynamicUrls];
    }
  } catch (error) {
    console.error("Failed to generate dynamic inventory sitemap:", error);
  }

  return sitemapUrls;
}
