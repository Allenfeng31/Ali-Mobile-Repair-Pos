import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { resolveFutureRepairResultDestination } from './futureRepairResultDestination';
import { createVirtualPhoneRepairMetadata } from './virtualPhoneRepairRoute';
import { getGooglePixelHardwareConfig } from './seo/content/google-pixel/config';
import {
  buildSharedRepairPageCandidates,
  buildSharedRepairPageSupportedModels,
  getSharedRepairCandidatePriceLabel,
  isSharedRepairPageModelEligible,
} from './sharedRepairPageV2';
import type { BrandEntry } from './publicRepairCataloguePolicy';

const googleBrand: BrandEntry = {
  category: 'phone',
  brand: 'Google Pixel',
  slug: 'google-pixel',
  icon: 'phone',
  models: [
    {
      model: 'Pixel 8',
      slug: 'pixel-8',
      repairTypes: [{
        slug: 'loudspeaker-replacement',
        name: 'Loudspeaker Replacement',
        price: 139,
        repairOrigin: 'pos',
        variants: [
          { quality_grade: 'Standard', price: 139, is_recommended: true },
          { quality_grade: 'Premium', price: 169, is_recommended: false },
        ],
      }],
    },
    {
      model: 'Pixel 9',
      slug: 'pixel-9',
      repairTypes: [{
        slug: 'loudspeaker-replacement',
        name: 'Loudspeaker Replacement',
        price: 119,
        repairOrigin: 'pos',
      }],
    },
    {
      model: 'Pixel 9a',
      slug: 'pixel-9a',
      repairTypes: [],
    },
    {
      model: 'Pixel 10a',
      slug: 'pixel-10a',
      repairTypes: [],
    },
  ],
};

describe('Shared Page V2 candidate and destination foundation', () => {
  it('includes a catalogue-only Pixel 10a in shared loudspeaker context without hardware enrichment', () => {
    expect(getGooglePixelHardwareConfig('pixel-10a')).toBeNull();
    expect(isSharedRepairPageModelEligible({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-10a', repairSlug: 'loudspeaker-replacement',
    })).toBe(true);
    expect(isSharedRepairPageModelEligible({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-10a', repairSlug: 'invented-repair',
    })).toBe(false);

    const supportedModels = buildSharedRepairPageSupportedModels({
      brands: [googleBrand],
      canonicalBrandSlug: 'google-pixel',
      repairSlug: 'loudspeaker-replacement',
    });
    const candidates = buildSharedRepairPageCandidates({
      brands: [googleBrand],
      canonicalBrandSlug: 'google-pixel',
      repairSlug: 'loudspeaker-replacement',
    });

    expect(supportedModels.map((model) => model.modelSlug)).toEqual(['pixel-8', 'pixel-9', 'pixel-9a', 'pixel-10a']);
    expect(candidates.map((candidate) => candidate.modelSlug)).toEqual(['pixel-8', 'pixel-9']);
    expect(candidates[0].repair).toBe(googleBrand.models[0].repairTypes[0]);
    expect(candidates[0].pricing).toMatchObject({ resolvedPrice: 139, source: 'variant', canEmitOffer: true });
    expect(getSharedRepairCandidatePriceLabel(candidates[0])).toBe('From $139');
    expect(getSharedRepairCandidatePriceLabel(candidates[1])).toBe('$119');
  });

  it('does not create a synthetic or virtual Pixel 9a price candidate', () => {
    const candidates = buildSharedRepairPageCandidates({
      brands: [{
        ...googleBrand,
        models: [...googleBrand.models, {
          model: 'Pixel virtual',
          slug: 'pixel-virtual',
          repairTypes: [{
            slug: 'loudspeaker-replacement',
            name: 'Loudspeaker Replacement',
            price: 50,
            repairOrigin: 'virtual',
          }],
        }],
      }],
      canonicalBrandSlug: 'google-pixel',
      repairSlug: 'loudspeaker-replacement',
    });

    expect(candidates.find((candidate) => candidate.modelSlug === 'pixel-9a')).toBeUndefined();
    expect(candidates.map((candidate) => candidate.modelSlug)).not.toContain('pixel-virtual');
  });

  it('does not retain the Google hardware registry as a V2 visibility gate', () => {
    const routeSource = readFileSync(resolve(process.cwd(), 'src/lib/virtualPhoneRepairRoute.tsx'), 'utf8');

    expect(routeSource).not.toContain('supportedGooglePixelModel');
    expect(routeSource).not.toContain('supportedModel: supportedGooglePixelModel');
  });

  it('uses the authoritative target policy to resolve only the completed Google shared master', () => {
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-8', repairSlug: 'loudspeaker-replacement',
    })).toMatchObject({ href: '/repairs/phone/google/loudspeaker-replacement' });
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-8', repairSlug: 'front-camera-replacement',
    })).toBeNull();
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'huawei', modelSlug: 'p30-pro', repairSlug: 'screen-replacement',
    })).toBeNull();
  });

  it('keeps the Google shared canonical query-free without a virtual $50 metadata claim', () => {
    const metadata = createVirtualPhoneRepairMetadata('google', 'loudspeaker-replacement');

    expect(metadata.alternates?.canonical).toBe('/repairs/phone/google/loudspeaker-replacement');
    expect(metadata.openGraph?.url).toBe('/repairs/phone/google/loudspeaker-replacement');
    expect(metadata.description).not.toContain('$50');
  });
});
