import { MetadataRoute } from 'next';

import { fetchRepairCatalog } from '@/lib/api';
import { getOppoModelConfig } from '@/lib/seo/content/oppo/shared';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { getSortedPostsData } from '@/lib/blog';
import { preserveRouteSegment, safeSlugSegment } from '@/lib/inventoryUtils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alimobile.com.au';
  
  const blogPosts = await getSortedPostsData();
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/repairs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/repairs/screen-replacement`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.82 },
    { url: `${baseUrl}/repairs/battery-replacement`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.82 },
    { url: `${baseUrl}/repairs/charging-port-replacement`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.82 },
    { url: `${baseUrl}/repairs/back-glass-replacement`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.82 },
    { url: `${baseUrl}/repairs/phone/samsung/camera-lens-replacement`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.76 },
    { url: `${baseUrl}/repairs/phone/google/camera-lens-replacement`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.76 },
    { url: `${baseUrl}/repairs/phone/oppo/camera-lens-replacement`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.76 },
    { url: `${baseUrl}/repairs/phone/camera-lens-replacement`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.74 },
    ...['samsung', 'google', 'oppo'].flatMap((brand) => [
      'loudspeaker-replacement',
      'earpiece-speaker-replacement',
      'power-button-replacement',
      'volume-button-replacement',
    ].map((repair) => ({ url: `${baseUrl}/repairs/phone/${brand}/${repair}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.76 }))),
    ...[
      'loudspeaker-replacement',
      'earpiece-speaker-replacement',
      'power-button-replacement',
      'volume-button-replacement',
    ].map((repair) => ({ url: `${baseUrl}/repairs/phone/${repair}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.74 })),
    { url: `${baseUrl}/repairs/water-damage`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.78 },
    { url: `${baseUrl}/book-repair`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/zh/phone-repair-melbourne-east`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${baseUrl}/about-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const sitemapUrls = [...staticUrls, ...blogUrls];

  const locationUrls: MetadataRoute.Sitemap = SERVICE_AREAS.map(area => ({
    url: `${baseUrl}/locations/${area.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  try {
    const catalog = await fetchRepairCatalog();

    // Category hub URLs
    const categoryUrls: MetadataRoute.Sitemap = ['phone', 'tablet', 'laptop', 'watch'].map(category => ({
      url: `${baseUrl}/repairs/${safeSlugSegment(category)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    // Brand sub-hub URLs
    const brandUrls: MetadataRoute.Sitemap = catalog.brands.map(brand => ({
      url: `${baseUrl}/repairs/${safeSlugSegment(brand.category)}/${safeSlugSegment(brand.slug)}`,
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
        // Expose only Pixel 8 Pro for Google Pixel brand for now
        if (brand.slug === 'google-pixel' && model.slug !== 'pixel-8-pro') {
          continue;
        }

        // Wait for OPPO models to be fully validated before exposing to sitemap
        if (brand.slug === 'oppo' && !getOppoModelConfig(model.slug)) {
          continue;
        }

        modelUrls.push({
          url: `${baseUrl}/repairs/${safeSlugSegment(brand.category)}/${safeSlugSegment(brand.slug)}/${preserveRouteSegment(model.slug)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
        for (const repair of model.repairTypes) {
          if (repair.slug.includes('flex-cable')) continue;

          repairUrls.push({
            url: `${baseUrl}/repairs/${safeSlugSegment(brand.category)}/${safeSlugSegment(brand.slug)}/${preserveRouteSegment(model.slug)}/${preserveRouteSegment(repair.slug)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          });
        }
      }
    }

    return [...sitemapUrls, ...locationUrls, ...categoryUrls, ...brandUrls, ...modelUrls, ...repairUrls];
  } catch (error) {
    console.error("Failed to generate dynamic sitemap:", error);
  }

  return [...sitemapUrls, ...locationUrls];
}
