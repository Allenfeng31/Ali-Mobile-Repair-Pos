import { describe, expect, it } from 'vitest';

import {
  resolveSharedRepairContext,
  type SharedRepairContextInput,
} from './sharedRepairContext';

const candidates = [
  { canonicalBrandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro' },
  { canonicalBrandSlug: 'oppo', modelSlug: 'find-x8-pro', displayBrand: 'OPPO', displayModel: 'Find X8 Pro' },
  { canonicalBrandSlug: 'samsung', modelSlug: 'galaxy-s25', displayBrand: 'Samsung', displayModel: 'Galaxy S25' },
  { canonicalBrandSlug: 'nokia', modelSlug: 'shared-model', displayBrand: 'Nokia', displayModel: 'Shared Model' },
  { canonicalBrandSlug: 'motorola', modelSlug: 'shared-model', displayBrand: 'Motorola', displayModel: 'Shared Model' },
] as const;

const globalInput = (overrides: Partial<SharedRepairContextInput> = {}): SharedRepairContextInput => ({
  route: { scope: 'global' },
  repairSlug: 'front-camera-replacement',
  bookingService: 'Front Camera Replacement',
  query: {},
  candidates,
  ...overrides,
});

const googleRoute = {
  scope: 'brand' as const,
  canonicalBrandSlug: 'google-pixel',
  routeBrandSegment: 'google',
};

describe('resolveSharedRepairContext', () => {
  it('returns a frozen generic context without query input', () => {
    expect(resolveSharedRepairContext(globalInput())).toEqual({
      canonicalBrandSlug: null,
      routeBrandSegment: null,
      modelSlug: null,
      displayBrand: null,
      displayModel: null,
      repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement',
      isValid: true,
      reason: 'generic-context',
    });
  });

  it('validates global brand-only and exact brand/model contexts using trusted candidates', () => {
    expect(resolveSharedRepairContext(globalInput({ query: { brand: 'oppo' } }))).toEqual({
      canonicalBrandSlug: 'oppo', routeBrandSegment: null, modelSlug: null,
      displayBrand: 'OPPO', displayModel: null, repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement', isValid: true, reason: 'brand-context',
    });
    expect(resolveSharedRepairContext(globalInput({ query: { brand: 'google-pixel', model: 'pixel-8-pro' } }))).toEqual({
      canonicalBrandSlug: 'google-pixel', routeBrandSegment: null, modelSlug: 'pixel-8-pro',
      displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro', repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement', isValid: true, reason: 'model-context',
    });
  });

  it('fails closed for model-only, invalid brand/model, mismatches, duplicate query values, and malformed slugs', () => {
    const cases = [
      [{ model: 'pixel-8-pro' }, 'invalid-brand'],
      [{ brand: 'unknown-brand' }, 'invalid-brand'],
      [{ brand: 'google-pixel', model: 'missing-model' }, 'invalid-model'],
      [{ brand: 'google-pixel', model: '' }, 'invalid-model'],
      [{ brand: 'google-pixel', model: 'find-x8-pro' }, 'brand-model-mismatch'],
      [{ brand: 'google', model: 'pixel-8-pro' }, 'invalid-brand'],
      [{ brand: ['google-pixel', 'oppo'] }, 'invalid-query-shape'],
      [{ brand: '' }, 'invalid-brand'],
      [{ brand: 'Google-Pixel' }, 'invalid-brand'],
      [{ brand: 'google--pixel' }, 'invalid-brand'],
      [{ brand: 'google/pixel' }, 'invalid-brand'],
    ] as const;

    for (const [query, reason] of cases) {
      expect(resolveSharedRepairContext(globalInput({ query }))).toEqual({
        canonicalBrandSlug: null, routeBrandSegment: null, modelSlug: null,
        displayBrand: null, displayModel: null, repairSlug: 'front-camera-replacement',
        bookingService: 'Front Camera Replacement', isValid: false, reason,
      });
    }
  });

  it('keeps a Google brand route distinct from its google-pixel catalogue identity', () => {
    expect(resolveSharedRepairContext(globalInput({
      route: googleRoute,
      query: { model: 'pixel-8-pro' },
    }))).toEqual({
      canonicalBrandSlug: 'google-pixel', routeBrandSegment: 'google', modelSlug: 'pixel-8-pro',
      displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro', repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement', isValid: true, reason: 'model-context',
    });

    expect(resolveSharedRepairContext(globalInput({ route: googleRoute, query: {} }))).toEqual({
      canonicalBrandSlug: 'google-pixel', routeBrandSegment: 'google', modelSlug: null,
      displayBrand: 'Google Pixel', displayModel: null, repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement', isValid: true, reason: 'brand-context',
    });
  });

  it('rejects a route-segment alias or another brand model on a Google brand route', () => {
    for (const query of [
      { brand: 'google', model: 'pixel-8-pro' },
      { model: 'find-x8-pro' },
    ]) {
      expect(resolveSharedRepairContext(globalInput({ route: googleRoute, query }))).toEqual({
        canonicalBrandSlug: 'google-pixel', routeBrandSegment: 'google', modelSlug: null,
        displayBrand: 'Google Pixel', displayModel: null, repairSlug: 'front-camera-replacement',
        bookingService: 'Front Camera Replacement', isValid: false,
        reason: query.brand ? 'route-brand-mismatch' : 'brand-model-mismatch',
      });
    }
  });

  it.each([
    [{ scope: 'brand' as const, canonicalBrandSlug: 'samsung', routeBrandSegment: 'samsung' }, 'galaxy-s25', 'Samsung', 'Galaxy S25'],
    [{ scope: 'brand' as const, canonicalBrandSlug: 'oppo', routeBrandSegment: 'oppo' }, 'find-x8-pro', 'OPPO', 'Find X8 Pro'],
  ])('validates exact fixed-brand context for %s', (route, model, displayBrand, displayModel) => {
    expect(resolveSharedRepairContext(globalInput({ route, query: { brand: route.canonicalBrandSlug, model } }))).toEqual({
      canonicalBrandSlug: route.canonicalBrandSlug,
      routeBrandSegment: route.routeBrandSegment,
      modelSlug: model,
      displayBrand,
      displayModel,
      repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement',
      isValid: true,
      reason: 'model-context',
    });
  });

  it('does not accept service query injection or expose it in the result', () => {
    expect(resolveSharedRepairContext(globalInput({
      query: { brand: 'google-pixel', model: 'pixel-8-pro', service: 'Logic Board Repair' },
    }))).toEqual({
      canonicalBrandSlug: null, routeBrandSegment: null, modelSlug: null,
      displayBrand: null, displayModel: null, repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement', isValid: false, reason: 'forbidden-service-override',
    });
  });

  it('allows identical model slugs across brands only with an exact brand match', () => {
    expect(resolveSharedRepairContext(globalInput({ query: { brand: 'nokia', model: 'shared-model' } }))).toMatchObject({
      isValid: true, canonicalBrandSlug: 'nokia', displayBrand: 'Nokia', reason: 'model-context',
    });
    expect(resolveSharedRepairContext(globalInput({ query: { brand: 'motorola', model: 'shared-model' } }))).toMatchObject({
      isValid: true, canonicalBrandSlug: 'motorola', displayBrand: 'Motorola', reason: 'model-context',
    });
  });

  it('fails closed for malformed or duplicate candidates without mutating inputs', () => {
    const duplicate = [...candidates, candidates[0]];
    const malformed = [{ ...candidates[0], displayModel: '' }];
    const input = globalInput({ candidates: duplicate, query: { brand: 'google-pixel', model: 'pixel-8-pro' } });
    const before = structuredClone(input);

    expect(resolveSharedRepairContext(input)).toMatchObject({ isValid: false, reason: 'invalid-candidates' });
    expect(resolveSharedRepairContext(globalInput({ candidates: malformed }))).toMatchObject({ isValid: false, reason: 'invalid-candidates' });
    expect(resolveSharedRepairContext(globalInput({
      route: googleRoute,
      candidates: [null] as unknown as SharedRepairContextInput['candidates'],
    }))).toEqual({
      canonicalBrandSlug: 'google-pixel', routeBrandSegment: 'google', modelSlug: null,
      displayBrand: null, displayModel: null, repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement', isValid: false, reason: 'invalid-candidates',
    });
    expect(input).toEqual(before);
  });

  it('returns frozen deterministic output and ignores unknown query keys', () => {
    const input = globalInput({
      query: {
        brand: 'samsung',
        model: 'galaxy-s25',
        utm_source: 'ignored',
        scope: 'brand',
        canonicalBrandSlug: 'google-pixel',
        repairSlug: 'logic-board-repair',
        bookingService: 'Logic Board Repair',
      } as SharedRepairContextInput['query'],
    });
    const first = resolveSharedRepairContext(input);

    expect(first).toEqual(resolveSharedRepairContext(input));
    expect(Object.isFrozen(first)).toBe(true);
    expect(first).toMatchObject({ isValid: true, canonicalBrandSlug: 'samsung', modelSlug: 'galaxy-s25' });
  });
});
