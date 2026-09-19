import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { resolveFutureRepairResultDestination } from './futureRepairResultDestination';
import {
  createVirtualPhoneRepairMetadata,
  GOOGLE_PIXEL_SHARED_PAGE_V2_CONFIG,
  getGooglePixelSharedPageV2Config,
} from './virtualPhoneRepairRoute';
import { getGooglePixelHardwareConfig } from './seo/content/google-pixel/config';
import {
  buildSharedRepairPageCandidates,
  buildSharedRepairPageSupportedModels,
  getSharedRepairCandidatePriceLabel,
  isSharedRepairPageModelEligible,
} from './sharedRepairPageV2';
import { getVirtualPhoneRepairLandingHref } from './virtualPhoneRepairs';
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

const earpieceGoogleBrand: BrandEntry = {
  ...googleBrand,
  models: [
    {
      model: 'Pixel 8',
      slug: 'pixel-8',
      repairTypes: [{
        slug: 'earpiece-speaker-replacement',
        name: 'Earpiece Speaker Replacement',
        price: 109,
        repairOrigin: 'pos',
        variants: [
          { quality_grade: 'Standard', price: 109, is_recommended: true },
          { quality_grade: 'Premium', price: 139, is_recommended: false },
        ],
      }],
    },
    {
      model: 'Pixel 9',
      slug: 'pixel-9',
      repairTypes: [{
        slug: 'earpiece-speaker-replacement',
        name: 'Earpiece Speaker Replacement',
        price: 129,
        repairOrigin: 'pos',
      }],
    },
    { model: 'Pixel 9a', slug: 'pixel-9a', repairTypes: [] },
    { model: 'Pixel 10a', slug: 'pixel-10a', repairTypes: [] },
  ],
};

function googleButtonBrand(repairSlug: 'power-button-replacement' | 'volume-button-replacement', repairName: string): BrandEntry {
  return {
    ...googleBrand,
    models: [
      {
        model: 'Pixel 8',
        slug: 'pixel-8',
        repairTypes: [{
          slug: repairSlug,
          name: repairName,
          price: 109,
          repairOrigin: 'pos',
          variants: [
            { quality_grade: 'Standard', price: 109, is_recommended: true },
            { quality_grade: 'Premium', price: 139, is_recommended: false },
          ],
        }],
      },
      {
        model: 'Pixel 9',
        slug: 'pixel-9',
        repairTypes: [{ slug: repairSlug, name: repairName, price: 129, repairOrigin: 'pos' }],
      },
      { model: 'Pixel 9a', slug: 'pixel-9a', repairTypes: [] },
      { model: 'Pixel 10a', slug: 'pixel-10a', repairTypes: [] },
    ],
  };
}

const cameraLensGoogleBrand: BrandEntry = {
  ...googleBrand,
  models: [
    {
      model: 'Pixel 8',
      slug: 'pixel-8',
      repairTypes: [{
        slug: 'camera-lens-replacement',
        name: 'Camera Lens Replacement',
        price: 89,
        repairOrigin: 'pos',
        variants: [
          { quality_grade: 'Standard', price: 89, is_recommended: true },
          { quality_grade: 'Premium', price: 109, is_recommended: false },
        ],
      }],
    },
    {
      model: 'Pixel 9',
      slug: 'pixel-9',
      repairTypes: [{
        slug: 'camera-lens-replacement',
        name: 'Camera Lens Replacement',
        price: 99,
        repairOrigin: 'pos',
      }],
    },
    { model: 'Pixel 9a', slug: 'pixel-9a', repairTypes: [] },
    { model: 'Pixel 10a', slug: 'pixel-10a', repairTypes: [] },
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

  it('uses the same catalogue-only eligibility and exact POS pricing rules for Earpiece Speaker', () => {
    expect(getGooglePixelHardwareConfig('pixel-10a')).toBeNull();
    expect(isSharedRepairPageModelEligible({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-10a', repairSlug: 'earpiece-speaker-replacement',
    })).toBe(true);

    const supportedModels = buildSharedRepairPageSupportedModels({
      brands: [earpieceGoogleBrand],
      canonicalBrandSlug: 'google-pixel',
      repairSlug: 'earpiece-speaker-replacement',
    });
    const candidates = buildSharedRepairPageCandidates({
      brands: [earpieceGoogleBrand],
      canonicalBrandSlug: 'google-pixel',
      repairSlug: 'earpiece-speaker-replacement',
    });

    expect(supportedModels.map((model) => model.modelSlug)).toEqual(['pixel-8', 'pixel-9', 'pixel-9a', 'pixel-10a']);
    expect(candidates.map((candidate) => candidate.modelSlug)).toEqual(['pixel-8', 'pixel-9']);
    expect(getSharedRepairCandidatePriceLabel(candidates[0]!)).toBe('From $109');
    expect(getSharedRepairCandidatePriceLabel(candidates[1]!)).toBe('$129');
  });

  it.each([
    ['power-button-replacement', 'Power Button Replacement'],
    ['volume-button-replacement', 'Volume Button Replacement'],
  ] as const)('uses catalogue-only eligibility and exact POS pricing for %s', (repairSlug, repairName) => {
    const brand = googleButtonBrand(repairSlug, repairName);
    const supportedModels = buildSharedRepairPageSupportedModels({ brands: [brand], canonicalBrandSlug: 'google-pixel', repairSlug });
    const candidates = buildSharedRepairPageCandidates({ brands: [brand], canonicalBrandSlug: 'google-pixel', repairSlug });

    expect(getGooglePixelHardwareConfig('pixel-10a')).toBeNull();
    expect(isSharedRepairPageModelEligible({ category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-10a', repairSlug })).toBe(true);
    expect(supportedModels.map((model) => model.modelSlug)).toEqual(['pixel-8', 'pixel-9', 'pixel-9a', 'pixel-10a']);
    expect(candidates.map((candidate) => candidate.modelSlug)).toEqual(['pixel-8', 'pixel-9']);
    expect(getSharedRepairCandidatePriceLabel(candidates[0]!)).toBe('From $109');
    expect(getSharedRepairCandidatePriceLabel(candidates[1]!)).toBe('$129');
  });

  it('activates Google Pixel Camera Lens V2 by exact identity without a hardware gate or virtual price', () => {
    expect(getGooglePixelHardwareConfig('pixel-10a')).toBeNull();
    expect(isSharedRepairPageModelEligible({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-10a', repairSlug: 'camera-lens-replacement',
    })).toBe(true);
    expect(isSharedRepairPageModelEligible({
      category: 'phone', brandSlug: 'samsung', modelSlug: 'galaxy-s25', repairSlug: 'camera-lens-replacement',
    })).toBe(false);
    expect(isSharedRepairPageModelEligible({
      category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'camera-lens-replacement',
    })).toBe(false);

    const supportedModels = buildSharedRepairPageSupportedModels({
      brands: [cameraLensGoogleBrand], canonicalBrandSlug: 'google-pixel', repairSlug: 'camera-lens-replacement',
    });
    const candidates = buildSharedRepairPageCandidates({
      brands: [cameraLensGoogleBrand], canonicalBrandSlug: 'google-pixel', repairSlug: 'camera-lens-replacement',
    });

    expect(supportedModels.map((model) => model.modelSlug)).toEqual(['pixel-8', 'pixel-9', 'pixel-9a', 'pixel-10a']);
    expect(candidates.map((candidate) => candidate.modelSlug)).toEqual(['pixel-8', 'pixel-9']);
    expect(getSharedRepairCandidatePriceLabel(candidates[0]!)).toBe('From $89');
    expect(getSharedRepairCandidatePriceLabel(candidates[1]!)).toBe('$99');
  });

  it('does not retain the Google hardware registry as a V2 visibility gate', () => {
    const routeSource = readFileSync(resolve(process.cwd(), 'src/lib/virtualPhoneRepairRoute.tsx'), 'utf8');

    expect(routeSource).not.toContain('supportedGooglePixelModel');
    expect(routeSource).not.toContain('supportedModel: supportedGooglePixelModel');
  });

  it('resolves only completed Google Pixel V2 masters for future Repair Results', () => {
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-8', repairSlug: 'loudspeaker-replacement',
    })).toMatchObject({ href: '/repairs/phone/google/loudspeaker-replacement' });
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-8', repairSlug: 'front-camera-replacement',
    })).toBeNull();
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-9a', repairSlug: 'earpiece-speaker-replacement',
    })).toMatchObject({ href: '/repairs/phone/google/earpiece-speaker-replacement' });
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-9a', repairSlug: 'power-button-replacement',
    })).toMatchObject({ href: '/repairs/phone/google/power-button-replacement' });
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-9a', repairSlug: 'volume-button-replacement',
    })).toMatchObject({ href: '/repairs/phone/google/volume-button-replacement' });
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-9a', repairSlug: 'camera-lens-replacement',
    })).toMatchObject({ href: '/repairs/phone/google/camera-lens-replacement' });
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'huawei', modelSlug: 'p30-pro', repairSlug: 'screen-replacement',
    })).toBeNull();
  });

  it.each([
    ['loudspeaker-replacement', '/repairs/phone/google/loudspeaker-replacement'],
    ['earpiece-speaker-replacement', '/repairs/phone/google/earpiece-speaker-replacement'],
    ['power-button-replacement', '/repairs/phone/google/power-button-replacement'],
    ['volume-button-replacement', '/repairs/phone/google/volume-button-replacement'],
  ] as const)('keeps completed Google V2 canonical metadata query-free and without virtual $50 for %s', (repairSlug, canonicalPath) => {
    const metadata = createVirtualPhoneRepairMetadata('google', repairSlug);

    expect(metadata.alternates?.canonical).toBe(canonicalPath);
    expect(metadata.openGraph?.url).toBe(canonicalPath);
    expect(metadata.description).not.toContain('$50');
  });

  it('limits Google Pixel V2 activation to four completed routes with route-specific quick answers', () => {
    expect(getGooglePixelSharedPageV2Config('loudspeaker-replacement')).toMatchObject({
      quickAnswers: { repairTime: '30–60 minutes', warranty: '6 months warranty' },
    });
    expect(getGooglePixelSharedPageV2Config('earpiece-speaker-replacement')).toMatchObject({
      quickAnswers: { repairTime: 'Contact us to confirm repair time.' },
    });
    expect(getGooglePixelSharedPageV2Config('power-button-replacement')).toMatchObject({
      quickAnswers: { repairTime: 'Contact us to confirm repair time.' },
    });
    expect(getGooglePixelSharedPageV2Config('volume-button-replacement')).toMatchObject({
      quickAnswers: { repairTime: 'Contact us to confirm repair time.' },
    });
    expect(Object.keys(GOOGLE_PIXEL_SHARED_PAGE_V2_CONFIG)).toEqual([
      'loudspeaker-replacement',
      'earpiece-speaker-replacement',
      'power-button-replacement',
      'volume-button-replacement',
    ]);
  });

  it('keeps Earpiece Speaker on its shared canonical owner with model state rather than a Detail URL', () => {
    const routeSource = readFileSync(resolve(process.cwd(), 'src/app/(public)/repairs/phone/google/earpiece-speaker-replacement/page.tsx'), 'utf8');

    expect(getVirtualPhoneRepairLandingHref('phone', 'google-pixel', 'pixel-9a', 'earpiece-speaker-replacement'))
      .toBe('/repairs/phone/google/earpiece-speaker-replacement?model=pixel-9a');
    expect(routeSource).toContain('searchParams');
    expect(routeSource).toContain('selectedModelSlug={typeof model === \'string\' ? model : null}');
    expect(routeSource).not.toContain('/repairs/phone/google-pixel/pixel-9a/earpiece-speaker-replacement');
  });

  it.each([
    ['power-button-replacement', 'power-button-replacement'],
    ['volume-button-replacement', 'volume-button-replacement'],
  ] as const)('keeps %s on its shared canonical owner with model state rather than a Detail URL', (repairSlug, routeSlug) => {
    const routeSource = readFileSync(resolve(process.cwd(), `src/app/(public)/repairs/phone/google/${routeSlug}/page.tsx`), 'utf8');

    expect(getVirtualPhoneRepairLandingHref('phone', 'google-pixel', 'pixel-9a', repairSlug))
      .toBe(`/repairs/phone/google/${routeSlug}?model=pixel-9a`);
    expect(routeSource).toContain('searchParams');
    expect(routeSource).toContain('selectedModelSlug={typeof model === \'string\' ? model : null}');
    expect(routeSource).not.toContain(`/repairs/phone/google-pixel/pixel-9a/${routeSlug}`);
  });
});
