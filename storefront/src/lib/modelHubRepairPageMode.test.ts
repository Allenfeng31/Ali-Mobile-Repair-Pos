import { describe, expect, it, vi } from 'vitest';

import {
  resolveModelHubRepairPageMode,
  type ModelHubRepairPageModeInput,
} from './modelHubRepairPageMode';
import { getVirtualCameraLensRepairOption } from './virtualCameraLens';
import { withVirtualPhoneRepairOptions } from './virtualPhoneRepairs';

const repair = (
  slug: string,
  repairOrigin: ModelHubRepairPageModeInput['repairTypes'][number]['repairOrigin'] = 'pos',
) => ({
  slug,
  name: slug,
  price: 0,
  variants: [],
  repairOrigin,
});

function resolve(overrides: Partial<ModelHubRepairPageModeInput> = {}) {
  return resolveModelHubRepairPageMode({
    category: 'phone',
    brandSlug: 'oppo',
    modelSlug: 'find-x8-pro',
    catalogueSource: 'live-pos',
    repairTypes: [repair('screen-replacement')],
    ...overrides,
  });
}

describe('resolveModelHubRepairPageMode', () => {
  it('keeps only exact live-POS seven-type repairs on their model Detail route', () => {
    expect(resolve().options).toEqual([
      expect.objectContaining({
        slug: 'screen-replacement',
        href: '/repairs/phone/oppo/find-x8-pro/screen-replacement',
      }),
    ]);
    expect(resolve().decisions).toEqual([
      expect.objectContaining({ mode: 'independent', reason: 'independent-current-live-pos' }),
    ]);
  });

  it.each([
    ['snapshot POS', 'last-known-good' as const, repair('screen-replacement', 'pos')],
    ['unknown legacy', 'last-known-good' as const, repair('screen-replacement', 'unknown-legacy')],
    ['diagnostic', 'live-pos' as const, repair('screen-replacement', 'diagnostic')],
  ])('leaves %s evidence to the Grid legacy Detail fallback without granting independence', (_label, catalogueSource, option) => {
    const result = resolve({ catalogueSource, repairTypes: [option] });

    expect(result.options[0]).not.toHaveProperty('href');
    expect(result.decisions[0]?.mode).toBe('unresolved');
  });

  it.each([
    ['screen-replacement', '/repairs/screen-replacement'],
    ['battery-replacement', '/repairs/battery-replacement'],
    ['charging-port-replacement', '/repairs/charging-port-replacement'],
    ['back-glass-replacement', '/repairs/back-glass-replacement'],
    ['front-camera-replacement', '/repairs/phone/front-camera-replacement'],
    ['back-camera-replacement', '/repairs/phone/back-camera-replacement'],
    ['logic-board-repair', '/repairs/phone/logic-board-repair'],
  ])('uses registered global masters for synthetic %s', (slug, href) => {
    const result = resolve({ repairTypes: [repair(slug, 'synthetic-backfill')] });

    expect(result.options[0]?.href).toBe(`${href}?brand=oppo&model=find-x8-pro`);
    expect(result.decisions[0]).toMatchObject({ mode: 'shared', reason: 'shared-global-route' });
  });

  it.each([
    ['samsung', 'galaxy-s25', '/repairs/phone/samsung/loudspeaker-replacement?model=galaxy-s25'],
    ['google-pixel', 'pixel-8-pro', '/repairs/phone/google/loudspeaker-replacement?model=pixel-8-pro'],
    ['oppo', 'find-x8-pro', '/repairs/phone/oppo/loudspeaker-replacement?model=find-x8-pro'],
    ['motorola', 'moto-g04', '/repairs/phone/loudspeaker-replacement?brand=motorola&model=moto-g04'],
  ])('uses the exact shared target and encoded context for %s', (brandSlug, modelSlug, href) => {
    const result = resolve({
      brandSlug,
      modelSlug,
      repairTypes: [repair('loudspeaker-replacement', 'virtual')],
    });

    expect(result.options[0]?.href).toBe(href);
    expect(result.decisions[0]?.mode).toBe('shared');
  });

  it('centralizes Water Damage without brand or model query context', () => {
    expect(resolve({ repairTypes: [repair('water-damage-repair', 'synthetic-core')] }).options[0]?.href)
      .toBe('/repairs/water-damage');
    expect(resolve({ repairTypes: [repair('water-damage-repair', 'synthetic-core')] }).options[0]?.href)
      .not.toContain('?');
  });

  it('hides unknown taxonomy and preserves iPhone and non-phone fallback routes', () => {
    expect(resolve({ repairTypes: [repair('microsoldering-special', 'pos')] }).options).toEqual([]);
    expect(resolve({ brandSlug: 'iphone', modelSlug: 'iphone-15', repairTypes: [repair('screen-replacement')] }).options[0]?.href)
      .toBe('/repairs/phone/iphone/iphone-15/screen-replacement');
    expect(resolve({ category: 'tablet', brandSlug: 'samsung', modelSlug: 'tab-s9', repairTypes: [repair('screen-replacement')] }).options[0]?.href)
      .toBe('/repairs/tablet/samsung/tab-s9/screen-replacement');
  });

  it.each([
    ['samsung', 'galaxy-s25', '/repairs/phone/samsung/camera-lens-replacement?model=galaxy-s25'],
    ['google-pixel', 'pixel-8-pro', '/repairs/phone/google/camera-lens-replacement?model=pixel-8-pro'],
    ['motorola', 'moto-g04', '/repairs/phone/camera-lens-replacement?brand=motorola&model=moto-g04'],
  ])('routes non-iPhone Camera Lens to its real shared master for %s', (brandSlug, modelSlug, href) => {
    const cameraLens = getVirtualCameraLensRepairOption('phone', brandSlug);
    expect(cameraLens).not.toBeNull();

    const result = resolve({ brandSlug, modelSlug, repairTypes: [cameraLens!] });
    expect(result.options[0]?.href).toBe(href);
    expect(result.options[0]?.href).not.toBe(`/repairs/phone/${brandSlug}/${modelSlug}/camera-lens-replacement`);
  });

  it('routes actual injected virtual shared repairs through the policy rather than a model Detail', () => {
    const virtualRepairs = withVirtualPhoneRepairOptions([], 'phone', 'google-pixel');
    const result = resolve({ brandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', repairTypes: virtualRepairs });

    expect(result.options).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'loudspeaker-replacement', href: '/repairs/phone/google/loudspeaker-replacement?model=pixel-8-pro' }),
      expect.objectContaining({ slug: 'earpiece-speaker-replacement', href: '/repairs/phone/google/earpiece-speaker-replacement?model=pixel-8-pro' }),
      expect.objectContaining({ slug: 'power-button-replacement', href: '/repairs/phone/google/power-button-replacement?model=pixel-8-pro' }),
      expect.objectContaining({ slug: 'volume-button-replacement', href: '/repairs/phone/google/volume-button-replacement?model=pixel-8-pro' }),
    ]));
    expect(result.options.every((option) => !option.href?.startsWith('/repairs/phone/google-pixel/pixel-8-pro/'))).toBe(true);
  });

  it('leaves ordinary unresolved repairs without a server href for the Grid legacy fallback', () => {
    const result = resolve({
      catalogueSource: 'last-known-good',
      repairTypes: [repair('screen-replacement', 'unknown-legacy')],
    });

    expect(result.decisions[0]).toMatchObject({ mode: 'unresolved', reason: 'insufficient-evidence' });
    expect(result.options[0]).not.toHaveProperty('href');
  });

  it('deduplicates identical repairs and fails conflicting origins closed without selecting POS evidence', () => {
    const identical = resolve({ repairTypes: [repair('screen-replacement'), repair('screen-replacement')] });
    expect(identical.options).toHaveLength(1);

    const conflict = resolve({
      repairTypes: [repair('screen-replacement', 'pos'), repair('screen-replacement', 'synthetic-core')],
    });
    expect(conflict.options).toHaveLength(1);
    expect(conflict.options[0]).not.toHaveProperty('href');
    expect(conflict.decisions[0]).toMatchObject({ mode: 'unresolved', reason: 'conflicting-evidence' });
  });

  it('uses URLSearchParams for canonical shared context', () => {
    const NativeURLSearchParams = URLSearchParams;
    let constructions = 0;
    class TrackingURLSearchParams extends NativeURLSearchParams {
      constructor() {
        constructions += 1;
        super();
      }
    }
    vi.stubGlobal('URLSearchParams', TrackingURLSearchParams);

    try {
      expect(resolve({ repairTypes: [repair('loudspeaker-replacement', 'virtual')] }).options[0]?.href)
        .toBe('/repairs/phone/oppo/loudspeaker-replacement?model=find-x8-pro');
    } finally {
      vi.unstubAllGlobals();
    }

    expect(constructions).toBeGreaterThan(0);
  });

  it('is deterministic, frozen, preserves canonical query ordering, and does not mutate input', () => {
    const input: ModelHubRepairPageModeInput = {
      category: 'phone',
      brandSlug: 'moto-x',
      modelSlug: 'edge-40',
      catalogueSource: 'live-pos',
      repairTypes: [repair('front-camera-replacement', 'synthetic-core'), repair('battery-replacement', 'synthetic-core')],
    };
    const before = structuredClone(input);
    const forward = resolveModelHubRepairPageMode(input);
    const reverse = resolveModelHubRepairPageMode({ ...input, repairTypes: [...input.repairTypes].reverse() });

    expect(forward).toEqual(reverse);
    expect(Object.isFrozen(forward)).toBe(true);
    expect(Object.isFrozen(forward.options[0]!)).toBe(true);
    expect(input).toEqual(before);
    expect(resolve({ brandSlug: 'motorola', modelSlug: 'moto-g04', repairTypes: [repair('loudspeaker-replacement', 'virtual')] }).options[0]?.href)
      .toBe('/repairs/phone/loudspeaker-replacement?brand=motorola&model=moto-g04');
  });
});
