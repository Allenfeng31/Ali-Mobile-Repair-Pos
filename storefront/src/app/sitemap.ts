import { MetadataRoute } from 'next';

import { fetchRepairCatalog } from '@/lib/api';
import { getGooglePixelHardwareConfig } from '@/lib/seo/content/google-pixel/config';
import { getOppoModelConfig } from '@/lib/seo/content/oppo/shared';
import { isConfiguredAppleWatchModel } from '@/lib/seo/content/apple-watch';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { getSortedPostsData } from '@/lib/blog';
import { preserveRouteSegment, safeSlugSegment } from '@/lib/inventoryUtils';
import { getWaterDamageSitemapPaths, isWaterDamageRepairSlug } from '@/lib/waterDamageRouting';

function getReliableBlogLastModified(updatedAt?: string): Date | undefined {
  if (!updatedAt) return undefined;

  const parsedDate = new Date(updatedAt);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alimobile.com.au';
  
  const blogPosts = await getSortedPostsData();
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => {
    const lastModified = getReliableBlogLastModified(post.updated_at);

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    };
  });

  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/repairs`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/repairs/screen-replacement`, changeFrequency: 'weekly', priority: 0.82 },
    { url: `${baseUrl}/repairs/battery-replacement`, changeFrequency: 'weekly', priority: 0.82 },
    { url: `${baseUrl}/repairs/charging-port-replacement`, changeFrequency: 'weekly', priority: 0.82 },
    { url: `${baseUrl}/repairs/back-glass-replacement`, changeFrequency: 'weekly', priority: 0.82 },
    { url: `${baseUrl}/repairs/phone/front-camera-replacement`, changeFrequency: 'weekly', priority: 0.74 },
    { url: `${baseUrl}/repairs/phone/back-camera-replacement`, changeFrequency: 'weekly', priority: 0.74 },
    { url: `${baseUrl}/repairs/phone/samsung/camera-lens-replacement`, changeFrequency: 'weekly', priority: 0.76 },
    { url: `${baseUrl}/repairs/phone/google/camera-lens-replacement`, changeFrequency: 'weekly', priority: 0.76 },
    { url: `${baseUrl}/repairs/phone/oppo/camera-lens-replacement`, changeFrequency: 'weekly', priority: 0.76 },
    { url: `${baseUrl}/repairs/phone/camera-lens-replacement`, changeFrequency: 'weekly', priority: 0.74 },
    ...['samsung', 'google', 'oppo'].flatMap((brand) => [
      'loudspeaker-replacement',
      'earpiece-speaker-replacement',
      'power-button-replacement',
      'volume-button-replacement',
    ].map((repair) => ({ url: `${baseUrl}/repairs/phone/${brand}/${repair}`, changeFrequency: 'weekly' as const, priority: 0.76 }))),
    ...[
      'loudspeaker-replacement',
      'earpiece-speaker-replacement',
      'power-button-replacement',
      'volume-button-replacement',
    ].map((repair) => ({ url: `${baseUrl}/repairs/phone/${repair}`, changeFrequency: 'weekly' as const, priority: 0.74 })),
    { url: `${baseUrl}/book-repair`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/zh/phone-repair-melbourne-east`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${baseUrl}/about-us`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const sitemapUrls = [...staticUrls, ...blogUrls];
  const grandfatheredWaterDamageUrls: MetadataRoute.Sitemap = getWaterDamageSitemapPaths().map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const locationUrls: MetadataRoute.Sitemap = SERVICE_AREAS.map(area => ({
    url: `${baseUrl}/locations/${area.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  try {
    const catalog = await fetchRepairCatalog();

    // Category hub URLs
    const categoryUrls: MetadataRoute.Sitemap = ['phone', 'tablet', 'laptop', 'watch'].map(category => ({
      url: `${baseUrl}/repairs/${safeSlugSegment(category)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    // Brand sub-hub URLs
    const brandUrls: MetadataRoute.Sitemap = catalog.brands.map(brand => ({
      url: `${baseUrl}/repairs/${safeSlugSegment(brand.category)}/${safeSlugSegment(brand.slug)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Model sub-hub URLs (intermediate page)
    const modelUrls: MetadataRoute.Sitemap = [];
    // Long-tail repair page URLs
    const repairUrls: MetadataRoute.Sitemap = [];
    for (const brand of catalog.brands) {
      for (const model of brand.models) {
        const isExcludedPixel = brand.slug === 'google-pixel' && !getGooglePixelHardwareConfig(model.slug);
        const isExcludedOppo = brand.slug === 'oppo' && !getOppoModelConfig(model.slug);
        const isExcludedAppleWatch = brand.category === 'watch' && brand.slug === 'apple' && !isConfiguredAppleWatchModel(model.slug);

        if (!isExcludedPixel && !isExcludedOppo && !isExcludedAppleWatch) {
          modelUrls.push({
            url: `${baseUrl}/repairs/${safeSlugSegment(brand.category)}/${safeSlugSegment(brand.slug)}/${preserveRouteSegment(model.slug)}`,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
        }

        for (const repair of model.repairTypes) {
          if (repair.slug.includes('flex-cable')) continue;
          if (isWaterDamageRepairSlug(repair.slug)) continue;

          if (isExcludedOppo) continue;
          if (isExcludedPixel) continue;
          if (isExcludedAppleWatch) continue;
          if (brand.category === 'watch' && brand.slug === 'apple' && repair.slug === 'charging-port-replacement') continue;

          repairUrls.push({
            url: `${baseUrl}/repairs/${safeSlugSegment(brand.category)}/${safeSlugSegment(brand.slug)}/${preserveRouteSegment(model.slug)}/${preserveRouteSegment(repair.slug)}`,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          });
        }
      }
    }

    return [...sitemapUrls, ...grandfatheredWaterDamageUrls, ...locationUrls, ...categoryUrls, ...brandUrls, ...modelUrls, ...repairUrls];
  } catch (error) {
    console.error("Failed to generate dynamic sitemap:", error);
  }

  return [...sitemapUrls, ...grandfatheredWaterDamageUrls, ...locationUrls];
}
