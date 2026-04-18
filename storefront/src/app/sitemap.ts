import { MetadataRoute } from 'next';
import { fetchRepairCatalog } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alimobile.com.au';
  
  // Blog posts
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
    { url: `${baseUrl}/repairs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/book-repair`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const sitemapUrls = [...staticUrls, ...blogUrls];

  try {
    const catalog = await fetchRepairCatalog();

    // Brand sub-hub URLs
    const brandUrls: MetadataRoute.Sitemap = catalog.brands.map(brand => ({
      url: `${baseUrl}/repairs/${brand.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Model sub-hub URLs (intermediate page)
    const modelUrls: MetadataRoute.Sitemap = [];
    // Long-tail repair page URLs
    const repairUrls: MetadataRoute.Sitemap = [];
    for (const brand of catalog.brands) {
      for (const model of brand.models) {
        modelUrls.push({
          url: `${baseUrl}/repairs/${brand.slug}/${model.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
        for (const repair of model.repairTypes) {
          repairUrls.push({
            url: `${baseUrl}/repairs/${brand.slug}/${model.slug}/${repair.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          });
        }
      }
    }

    return [...sitemapUrls, ...brandUrls, ...modelUrls, ...repairUrls];
  } catch (error) {
    console.error("Failed to generate dynamic sitemap:", error);
  }

  return sitemapUrls;
}
