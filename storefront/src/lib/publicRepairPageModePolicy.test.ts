import { describe, expect, it } from 'vitest';

import {
  evaluateNonIphonePublicRepairPageMode,
  PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY,
  type NonIphonePublicRepairPageModeInput,
} from './publicRepairPageModePolicy';

const baseInput = (overrides: Partial<NonIphonePublicRepairPageModeInput> = {}): NonIphonePublicRepairPageModeInput => ({
  category: 'phone',
  brandSlug: 'oppo',
  modelSlug: 'find-x8-pro',
  repairSlug: 'screen-replacement',
  repairOrigin: 'pos',
  eligibilityEvidence: 'current-live-pos-exact',
  legacyStatus: 'none',
  ...overrides,
});

describe('evaluateNonIphonePublicRepairPageMode', () => {
  it('allows only an exact current POS seven-type repair to be independent', () => {
    const decision = evaluateNonIphonePublicRepairPageMode(baseInput());

    expect(decision).toEqual({
      mode: 'independent',
      reason: 'independent-current-live-pos',
      target: { scope: 'model', href: '/repairs/phone/oppo/find-x8-pro/screen-replacement' },
      routeAvailable: true,
    });
    expect(Object.isFrozen(decision)).toBe(true);
    expect(Object.isFrozen(decision.target)).toBe(true);
  });

  it.each([
    ['snapshot origin only', { eligibilityEvidence: 'snapshot-origin-only' as const }],
    ['retained snapshot', { eligibilityEvidence: 'retained-or-carried-forward' as const }],
    ['synthetic core', { repairOrigin: 'synthetic-core' as const, eligibilityEvidence: 'none' as const }],
    ['synthetic backfill', { repairOrigin: 'synthetic-backfill' as const, eligibilityEvidence: 'none' as const }],
    ['absent option', { repairOrigin: 'absent' as const, eligibilityEvidence: 'none' as const }],
  ])('never grants a seven-type independent page from %s', (_label, overrides) => {
    const decision = evaluateNonIphonePublicRepairPageMode(baseInput(overrides));

    expect(decision.mode).not.toBe('independent');
  });

  it('allows a verified independent grandfather only for a seven-type exact identity', () => {
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({
      repairOrigin: 'unknown-legacy',
      eligibilityEvidence: 'verified-independent-grandfather',
      legacyStatus: 'independent-verified',
    }))).toMatchObject({ mode: 'independent', reason: 'independent-verified-grandfather' });
  });

  it('keeps shared-only, Water Damage, and unknown taxonomy ahead of grandfather evidence', () => {
    const grandfather = {
      eligibilityEvidence: 'verified-independent-grandfather' as const,
      legacyStatus: 'independent-verified' as const,
    };

    expect(evaluateNonIphonePublicRepairPageMode(baseInput({ ...grandfather, repairSlug: 'loudspeaker-replacement' }))).toMatchObject({
      mode: 'shared', reason: 'shared-brand-route', target: { scope: 'brand', href: '/repairs/phone/oppo/loudspeaker-replacement' },
    });
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({ ...grandfather, repairSlug: 'water-damage-repair' }))).toMatchObject({
      mode: 'shared', reason: 'central-water-damage', target: { scope: 'global', href: '/repairs/water-damage' },
    });
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({ ...grandfather, repairSlug: 'microsoldering-special' }))).toEqual({
      mode: 'hidden', reason: 'unknown-repair-taxonomy', target: null, routeAvailable: false,
    });
  });

  it('uses real brand routes before global routes and reports missing masters without inventing hrefs', () => {
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({ repairOrigin: 'virtual', eligibilityEvidence: 'none', repairSlug: 'camera-lens-replacement' }))).toMatchObject({
      mode: 'shared', reason: 'shared-brand-route', target: { scope: 'brand', href: '/repairs/phone/oppo/camera-lens-replacement' },
    });
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({ brandSlug: 'motorola', modelSlug: 'moto-g04', repairOrigin: 'virtual', eligibilityEvidence: 'none', repairSlug: 'camera-lens-replacement' }))).toMatchObject({
      mode: 'shared', reason: 'shared-global-route', target: { scope: 'global', href: '/repairs/phone/camera-lens-replacement' },
    });
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({ brandSlug: 'google-pixel', modelSlug: 'pixel-9', repairOrigin: 'virtual', eligibilityEvidence: 'none', repairSlug: 'power-button-replacement' }))).toMatchObject({
      mode: 'shared', reason: 'shared-brand-route', target: { scope: 'brand', href: '/repairs/phone/google/power-button-replacement' },
    });
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({ repairOrigin: 'absent', eligibilityEvidence: 'none', repairSlug: 'front-camera-replacement' }))).toEqual({
      mode: 'shared', reason: 'shared-global-route', target: { scope: 'global', href: '/repairs/phone/front-camera-replacement' }, routeAvailable: true,
    });
  });

  it.each([
    ['front-camera-replacement', '/repairs/phone/front-camera-replacement'],
    ['back-camera-replacement', '/repairs/phone/back-camera-replacement'],
    ['logic-board-repair', '/repairs/phone/logic-board-repair'],
  ])('routes insufficient-evidence %s to its real global shared master', (repairSlug, href) => {
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({
      repairOrigin: 'synthetic-backfill',
      eligibilityEvidence: 'none',
      repairSlug,
    }))).toEqual({
      mode: 'shared',
      reason: 'shared-global-route',
      target: { scope: 'global', href },
      routeAvailable: true,
    });
  });

  it.each([
    'camera-lens-replacement',
    'loudspeaker-replacement',
    'earpiece-speaker-replacement',
    'power-button-replacement',
    'volume-button-replacement',
  ])('maps Google Pixel catalogue identity to the Google brand shared route for %s', (repairSlug) => {
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({
      brandSlug: 'google-pixel',
      modelSlug: 'pixel-8-pro',
      repairOrigin: 'pos',
      eligibilityEvidence: 'current-live-pos-exact',
      repairSlug,
    }))).toEqual({
      mode: 'shared',
      reason: 'shared-brand-route',
      target: { scope: 'brand', href: `/repairs/phone/google/${repairSlug}` },
      routeAvailable: true,
    });
  });

  it('does not treat the Google shared route segment as a Google Pixel catalogue identity', () => {
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({
      brandSlug: 'google',
      modelSlug: 'pixel-8-pro',
      repairOrigin: 'virtual',
      eligibilityEvidence: 'none',
      repairSlug: 'loudspeaker-replacement',
    }))).toEqual({
      mode: 'shared',
      reason: 'shared-global-route',
      target: { scope: 'global', href: '/repairs/phone/loudspeaker-replacement' },
      routeAvailable: true,
    });
  });

  it.each([
    ['Apple brand', { brandSlug: 'apple' }],
    ['iPhone brand', { brandSlug: 'iphone' }],
    ['iPhone model', { modelSlug: 'iphone-15-pro' }],
    ['non-phone category', { category: 'tablet' }],
  ])('keeps %s out of this policy', (_label, overrides) => {
    expect(evaluateNonIphonePublicRepairPageMode(baseInput(overrides))).toEqual({
      mode: 'out-of-scope', reason: 'out-of-scope', target: null, routeAvailable: false,
    });
  });

  it.each([
    { repairOrigin: 'pos' as const, eligibilityEvidence: 'current-live-pos-exact' as const, legacyStatus: 'route-history-only' as const },
    { repairOrigin: 'unknown-legacy' as const, eligibilityEvidence: 'snapshot-origin-only' as const, legacyStatus: 'route-history-only' as const },
    { repairOrigin: 'pos' as const, eligibilityEvidence: 'conflict' as const, legacyStatus: 'unresolved' as const },
    { repairOrigin: 'synthetic-core' as const, eligibilityEvidence: 'current-live-pos-exact' as const, legacyStatus: 'none' as const },
    { repairOrigin: 'absent' as const, eligibilityEvidence: 'current-live-pos-exact' as const, legacyStatus: 'none' as const },
  ])('fails insufficient or conflicting evidence closed', (overrides) => {
    expect(evaluateNonIphonePublicRepairPageMode(baseInput(overrides))).toMatchObject({ mode: 'unresolved', target: null, routeAvailable: false });
  });

  it('applies the non-iPhone policy matrix without widening independent detail eligibility', () => {
    const motorola = ['screen-replacement', 'battery-replacement', 'charging-port-replacement'].map((repairSlug) =>
      evaluateNonIphonePublicRepairPageMode(baseInput({ brandSlug: 'motorola', modelSlug: 'moto-g04', repairSlug })),
    );
    expect(motorola.map((decision) => decision.mode)).toEqual(['independent', 'independent', 'independent']);

    const samsungSeven = [
      'screen-replacement', 'battery-replacement', 'charging-port-replacement', 'back-glass-replacement',
      'front-camera-replacement', 'back-camera-replacement', 'logic-board-repair',
    ].map((repairSlug) => evaluateNonIphonePublicRepairPageMode(baseInput({ brandSlug: 'samsung', modelSlug: 'galaxy-s25', repairSlug })));
    expect(samsungSeven.every((decision) => decision.mode === 'independent')).toBe(true);

    expect(evaluateNonIphonePublicRepairPageMode(baseInput({ brandSlug: 'samsung', modelSlug: 'galaxy-s25', repairSlug: 'loudspeaker-replacement' }))).toMatchObject({
      mode: 'shared', target: { scope: 'brand', href: '/repairs/phone/samsung/loudspeaker-replacement' },
    });
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({ brandSlug: 'nokia', modelSlug: 'g42', repairOrigin: 'absent', eligibilityEvidence: 'none', repairSlug: 'back-camera-replacement' }))).toMatchObject({
      mode: 'shared', reason: 'shared-global-route', target: { scope: 'global', href: '/repairs/phone/back-camera-replacement' },
    });
  });

  it('does not mutate its input while making deterministic decisions', () => {
    const input = baseInput({ repairOrigin: 'virtual', eligibilityEvidence: 'none', repairSlug: 'camera-lens-replacement' });
    const before = structuredClone(input);

    expect(evaluateNonIphonePublicRepairPageMode(input)).toEqual(evaluateNonIphonePublicRepairPageMode(input));
    expect(input).toEqual(before);
  });

  it('keeps diagnostic and v1 route-history evidence non-routable until separately verified', () => {
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({
      repairOrigin: 'diagnostic', eligibilityEvidence: 'none', repairSlug: 'logic-board-repair',
    }))).toEqual({ mode: 'unresolved', reason: 'diagnostic-not-supported', target: null, routeAvailable: false });
    expect(evaluateNonIphonePublicRepairPageMode(baseInput({
      repairOrigin: 'unknown-legacy', eligibilityEvidence: 'snapshot-origin-only', legacyStatus: 'route-history-only',
    }))).toEqual({ mode: 'unresolved', reason: 'insufficient-evidence', target: null, routeAvailable: false });
  });

  it.each([
    { brandSlug: ' Oppo' },
    { modelSlug: 'find--x8-pro' },
    { repairSlug: 'Screen-Replacement' },
    { repairSlug: 'screen/replacement' },
  ])('rejects non-canonical identities', (overrides) => {
    expect(evaluateNonIphonePublicRepairPageMode(baseInput(overrides))).toEqual({
      mode: 'hidden', reason: 'invalid-identity', target: null, routeAvailable: false,
    });
  });

  it('keeps the registry deterministic, frozen, and limited to real shared routes', () => {
    expect(Object.isFrozen(PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY)).toBe(true);
    expect(PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY).toContainEqual({ catalogueBrandSlug: 'google-pixel', repairSlug: 'power-button-replacement', href: '/repairs/phone/google/power-button-replacement' });
    expect(Object.isFrozen(PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY.find((route) => route.catalogueBrandSlug === 'google-pixel')!)).toBe(true);
    expect(PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY).not.toContainEqual(expect.objectContaining({ href: '/repairs/phone/oppo/front-camera-replacement' }));
    expect(PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY.map((route) => `${route.catalogueBrandSlug ?? 'global'}/${route.repairSlug}`)).toEqual([
      ...PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY.map((route) => `${route.catalogueBrandSlug ?? 'global'}/${route.repairSlug}`),
    ].sort());
  });
});
