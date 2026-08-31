import type { RepairOrigin } from './publicRepairCataloguePolicy';
import { compareDeterministicStrings } from './deterministicStrings';

export type NonIphonePublicRepairPageModeInput = {
  category: string;
  brandSlug: string;
  modelSlug: string;
  repairSlug: string;
  repairOrigin: RepairOrigin | 'absent';
  eligibilityEvidence:
    | 'current-live-pos-exact'
    | 'verified-independent-grandfather'
    | 'snapshot-origin-only'
    | 'retained-or-carried-forward'
    | 'none'
    | 'unresolved'
    | 'conflict';
  legacyStatus: 'none' | 'route-history-only' | 'independent-verified' | 'unresolved';
};

export type PublicRepairPageModeReason =
  | 'invalid-identity'
  | 'out-of-scope'
  | 'central-water-damage'
  | 'shared-brand-route'
  | 'shared-global-route'
  | 'shared-master-missing'
  | 'unknown-repair-taxonomy'
  | 'independent-current-live-pos'
  | 'independent-verified-grandfather'
  | 'insufficient-evidence'
  | 'conflicting-evidence'
  | 'diagnostic-not-supported';

export type NonIphonePublicRepairPageModeDecision = Readonly<{
  mode: 'independent' | 'shared' | 'hidden' | 'unresolved' | 'out-of-scope';
  reason: PublicRepairPageModeReason;
  target: Readonly<{ scope: 'model' | 'brand' | 'global'; href: string }> | null;
  routeAvailable: boolean;
  desiredMode?: 'shared';
  desiredSharedScope?: 'brand' | 'global';
}>;

type SharedRoute = Readonly<{
  catalogueBrandSlug?: 'samsung' | 'google-pixel' | 'oppo';
  repairSlug: string;
  href: string;
}>;

type SharedRouteBrandIdentity = Readonly<{
  catalogueBrandSlug: 'samsung' | 'google-pixel' | 'oppo';
  routeBrandSegment: 'samsung' | 'google' | 'oppo';
}>;

const INDEPENDENT_REPAIR_SLUGS = new Set([
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'back-glass-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
  'logic-board-repair',
]);

const SHARED_ONLY_REPAIR_SLUGS = new Set([
  'camera-lens-replacement',
  'loudspeaker-replacement',
  'earpiece-speaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
]);

const SHARED_ROUTE_BRAND_IDENTITIES: readonly SharedRouteBrandIdentity[] = Object.freeze([
  Object.freeze({ catalogueBrandSlug: 'samsung', routeBrandSegment: 'samsung' }),
  Object.freeze({ catalogueBrandSlug: 'google-pixel', routeBrandSegment: 'google' }),
  Object.freeze({ catalogueBrandSlug: 'oppo', routeBrandSegment: 'oppo' }),
]);

const SHARED_ONLY_REPAIR_SLUG_LIST = [
  'camera-lens-replacement',
  'loudspeaker-replacement',
  'earpiece-speaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
] as const;

const sharedRoutes: SharedRoute[] = [
  { repairSlug: 'screen-replacement', href: '/repairs/screen-replacement' },
  { repairSlug: 'battery-replacement', href: '/repairs/battery-replacement' },
  { repairSlug: 'charging-port-replacement', href: '/repairs/charging-port-replacement' },
  { repairSlug: 'back-glass-replacement', href: '/repairs/back-glass-replacement' },
  ...SHARED_ONLY_REPAIR_SLUG_LIST.flatMap((repairSlug) => [
    { repairSlug, href: `/repairs/phone/${repairSlug}` },
    ...SHARED_ROUTE_BRAND_IDENTITIES.map(({ catalogueBrandSlug, routeBrandSegment }) => ({
      catalogueBrandSlug,
      repairSlug,
      href: `/repairs/phone/${routeBrandSegment}/${repairSlug}`,
    })),
  ]),
];

export const PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY: readonly SharedRoute[] = Object.freeze(
  sharedRoutes
    .map((route) => Object.freeze(route))
    .sort((left, right) => compareDeterministicStrings(
      `${left.catalogueBrandSlug ?? 'global'}/${left.repairSlug}`,
      `${right.catalogueBrandSlug ?? 'global'}/${right.repairSlug}`,
    )),
);

function freezeDecision(
  mode: NonIphonePublicRepairPageModeDecision['mode'],
  reason: PublicRepairPageModeReason,
  target: NonIphonePublicRepairPageModeDecision['target'],
  routeAvailable: boolean,
  desiredSharedScope?: 'brand' | 'global',
): NonIphonePublicRepairPageModeDecision {
  return Object.freeze({
    mode,
    reason,
    target: target ? Object.freeze(target) : null,
    routeAvailable,
    ...(desiredSharedScope ? { desiredMode: 'shared' as const, desiredSharedScope } : {}),
  });
}

function isCanonicalSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isCanonicalIdentity(input: NonIphonePublicRepairPageModeInput) {
  return isCanonicalSlug(input.category)
    && isCanonicalSlug(input.brandSlug)
    && isCanonicalSlug(input.modelSlug)
    && isCanonicalSlug(input.repairSlug);
}

function isIphoneIdentity(input: NonIphonePublicRepairPageModeInput) {
  return input.brandSlug === 'apple'
    || input.brandSlug === 'iphone'
    || input.modelSlug === 'iphone'
    || input.modelSlug.startsWith('iphone-');
}

function sharedRouteFor(brandSlug: string, repairSlug: string) {
  return PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY.find((route) => route.catalogueBrandSlug === brandSlug && route.repairSlug === repairSlug)
    ?? PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY.find((route) => !route.catalogueBrandSlug && route.repairSlug === repairSlug)
    ?? null;
}

function sharedDecision(brandSlug: string, repairSlug: string, desiredSharedScope: 'brand' | 'global' = 'global') {
  const route = sharedRouteFor(brandSlug, repairSlug);
  if (!route) {
    return freezeDecision('unresolved', 'shared-master-missing', null, false, desiredSharedScope);
  }

  return freezeDecision(
    'shared',
    route.catalogueBrandSlug ? 'shared-brand-route' : 'shared-global-route',
    { scope: route.catalogueBrandSlug ? 'brand' : 'global', href: route.href },
    true,
  );
}

function unresolvedForEvidence(reason: Extract<PublicRepairPageModeReason, 'insufficient-evidence' | 'conflicting-evidence' | 'diagnostic-not-supported'>) {
  return freezeDecision('unresolved', reason, null, false);
}

/**
 * Pure report-only policy. No production route, sitemap, booking, or catalogue
 * consumer imports this module until a separately approved integration slice.
 */
export function evaluateNonIphonePublicRepairPageMode(
  input: NonIphonePublicRepairPageModeInput,
): NonIphonePublicRepairPageModeDecision {
  if (!isCanonicalIdentity(input)) {
    return freezeDecision('hidden', 'invalid-identity', null, false);
  }

  if (input.category !== 'phone' || isIphoneIdentity(input)) {
    return freezeDecision('out-of-scope', 'out-of-scope', null, false);
  }

  if (input.repairSlug === 'water-damage-repair') {
    return freezeDecision('shared', 'central-water-damage', { scope: 'global', href: '/repairs/water-damage' }, true);
  }

  if (SHARED_ONLY_REPAIR_SLUGS.has(input.repairSlug)) {
    return sharedDecision(input.brandSlug, input.repairSlug, 'global');
  }

  if (!INDEPENDENT_REPAIR_SLUGS.has(input.repairSlug)) {
    return freezeDecision('hidden', 'unknown-repair-taxonomy', null, false);
  }

  if (input.eligibilityEvidence === 'conflict' || input.legacyStatus === 'unresolved') {
    return unresolvedForEvidence('conflicting-evidence');
  }

  if ((input.eligibilityEvidence === 'current-live-pos-exact' && input.repairOrigin !== 'pos')
    || (input.eligibilityEvidence === 'verified-independent-grandfather' && input.legacyStatus !== 'independent-verified')) {
    return unresolvedForEvidence('conflicting-evidence');
  }

  const currentLivePos = input.repairOrigin === 'pos'
    && input.eligibilityEvidence === 'current-live-pos-exact'
    && input.legacyStatus === 'none';
  if (currentLivePos) {
    return freezeDecision(
      'independent',
      'independent-current-live-pos',
      { scope: 'model', href: `/repairs/phone/${input.brandSlug}/${input.modelSlug}/${input.repairSlug}` },
      true,
    );
  }

  const verifiedGrandfather = input.eligibilityEvidence === 'verified-independent-grandfather'
    && input.legacyStatus === 'independent-verified';
  if (verifiedGrandfather) {
    return freezeDecision(
      'independent',
      'independent-verified-grandfather',
      { scope: 'model', href: `/repairs/phone/${input.brandSlug}/${input.modelSlug}/${input.repairSlug}` },
      true,
    );
  }

  if (input.repairOrigin === 'diagnostic') {
    return unresolvedForEvidence('diagnostic-not-supported');
  }

  if (input.repairOrigin === 'pos'
    || input.repairOrigin === 'unknown-legacy'
    || input.eligibilityEvidence === 'snapshot-origin-only'
    || input.eligibilityEvidence === 'retained-or-carried-forward'
    || input.eligibilityEvidence === 'unresolved'
    || input.legacyStatus === 'route-history-only') {
    return unresolvedForEvidence('insufficient-evidence');
  }

  return sharedDecision(input.brandSlug, input.repairSlug);
}
