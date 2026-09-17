import type { RepairOrigin } from './publicRepairCataloguePolicy';
import { compareDeterministicStrings } from './deterministicStrings';
import { getCanonicalBrandSlug, isWaterDamageRepairSlug } from './waterDamageRouting';

export type PhoneBrandClass = 'iphone' | 'core-android' | 'secondary-phone';

export type TargetPublicRepairPageMode =
  | 'independent'
  | 'brand-shared'
  | 'generic-shared'
  | 'shared-only'
  | 'hidden';

export type PublicPageOwnershipScope = 'model' | 'brand' | 'device-category' | 'global';

export type SharedMasterAvailability = 'not-required' | 'available' | 'missing';

export type TargetPublicRepairPageModeInput = Readonly<{
  category: string;
  brandSlug: string;
  modelSlug: string;
  repairSlug: string;
  /** Service evidence is intentionally not used to choose the target page mode. */
  repairOrigin?: RepairOrigin | 'absent';
  legacyStatus?: NonIphonePublicRepairPageModeInput['legacyStatus'];
}>;

export type TargetPublicRepairPageModeDecision = Readonly<{
  targetMode: TargetPublicRepairPageMode;
  ownershipScope: PublicPageOwnershipScope | null;
  independentDetailAllowed: boolean;
  sharedDestinationRequired: boolean;
  safeToExpose: boolean;
  sharedMasterAvailability: SharedMasterAvailability;
  canonicalBrandSlug: string;
  canonicalRepairSlug: string;
  legacyTreatment: 'none' | 'separate';
  reason:
    | 'iphone-normal-repair'
    | 'core-android-model-repair'
    | 'core-android-brand-shared'
    | 'secondary-generic-shared'
    | 'logic-board-shared-only'
    | 'water-damage-shared-only'
    | 'unsupported-device-category'
    | 'unknown-repair-taxonomy'
    | 'invalid-identity';
}>;

const TARGET_CORE_MODEL_REPAIR_SLUGS = new Set([
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'back-glass-replacement',
  'back-housing-replacement',
  'back-cover-replacement',
]);

const TARGET_PERIPHERAL_REPAIR_SLUGS = new Set([
  'camera-lens-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
  'loudspeaker-replacement',
  'earpiece-speaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
]);

const TARGET_LOGIC_BOARD_REPAIR_SLUGS = new Set(['logic-board-repair']);
const TARGET_DEVICE_CATEGORIES = new Set(['phone', 'tablet', 'laptop', 'watch']);

function targetCanonicalRepairSlug(repairSlug: string) {
  return isWaterDamageRepairSlug(repairSlug) ? 'water-damage-repair' : repairSlug;
}

function targetLegacyTreatment(input: TargetPublicRepairPageModeInput) {
  return input.legacyStatus && input.legacyStatus !== 'none' ? 'separate' as const : 'none' as const;
}

function targetDecision(
  input: TargetPublicRepairPageModeInput,
  targetMode: TargetPublicRepairPageMode,
  ownershipScope: PublicPageOwnershipScope | null,
  sharedMasterAvailability: SharedMasterAvailability,
  reason: TargetPublicRepairPageModeDecision['reason'],
  canonicalBrandSlug: string,
  canonicalRepairSlug: string,
): TargetPublicRepairPageModeDecision {
  return Object.freeze({
    targetMode,
    ownershipScope,
    independentDetailAllowed: targetMode === 'independent',
    sharedDestinationRequired: ownershipScope !== null && targetMode !== 'independent',
    safeToExpose: targetMode !== 'hidden' && (targetMode === 'independent' || sharedMasterAvailability !== 'missing'),
    sharedMasterAvailability,
    canonicalBrandSlug,
    canonicalRepairSlug,
    legacyTreatment: targetLegacyTreatment(input),
    reason,
  });
}

export function classifyPhoneBrand(brandSlug: string): PhoneBrandClass {
  const canonicalBrandSlug = getCanonicalBrandSlug(brandSlug);

  if (canonicalBrandSlug === 'iphone' || canonicalBrandSlug === 'apple') return 'iphone';
  if (canonicalBrandSlug === 'samsung' || canonicalBrandSlug === 'google-pixel' || canonicalBrandSlug === 'oppo') {
    return 'core-android';
  }

  return 'secondary-phone';
}

/**
 * Pure future-page policy. It deliberately does not generate hrefs or switch
 * current routing; consumers must separately verify a shared master exists.
 */
export function evaluateTargetPublicRepairPageMode(
  input: TargetPublicRepairPageModeInput,
): TargetPublicRepairPageModeDecision {
  const canonicalBrandSlug = getCanonicalBrandSlug(input.brandSlug);
  const canonicalRepairSlug = targetCanonicalRepairSlug(input.repairSlug);

  if (!isCanonicalSlug(input.category) || !isCanonicalSlug(canonicalBrandSlug)
    || !isCanonicalSlug(input.modelSlug) || !isCanonicalSlug(canonicalRepairSlug)) {
    return targetDecision(input, 'hidden', null, 'not-required', 'invalid-identity', canonicalBrandSlug, canonicalRepairSlug);
  }

  if (!TARGET_DEVICE_CATEGORIES.has(input.category)) {
    return targetDecision(input, 'hidden', null, 'not-required', 'unsupported-device-category', canonicalBrandSlug, canonicalRepairSlug);
  }

  if (TARGET_LOGIC_BOARD_REPAIR_SLUGS.has(canonicalRepairSlug)) {
    return targetDecision(
      input,
      'shared-only',
      'device-category',
      input.category === 'phone' ? 'available' : 'missing',
      'logic-board-shared-only',
      canonicalBrandSlug,
      canonicalRepairSlug,
    );
  }

  if (canonicalRepairSlug === 'water-damage-repair') {
    return targetDecision(
      input,
      'shared-only',
      'global',
      'available',
      'water-damage-shared-only',
      canonicalBrandSlug,
      canonicalRepairSlug,
    );
  }

  if (input.category !== 'phone') {
    return targetDecision(input, 'hidden', null, 'not-required', 'unsupported-device-category', canonicalBrandSlug, canonicalRepairSlug);
  }

  const brandClass = classifyPhoneBrand(canonicalBrandSlug);
  const isCoreModelRepair = TARGET_CORE_MODEL_REPAIR_SLUGS.has(canonicalRepairSlug);
  const isPeripheralRepair = TARGET_PERIPHERAL_REPAIR_SLUGS.has(canonicalRepairSlug);

  if (!isCoreModelRepair && !isPeripheralRepair) {
    return targetDecision(input, 'hidden', null, 'not-required', 'unknown-repair-taxonomy', canonicalBrandSlug, canonicalRepairSlug);
  }

  if (brandClass === 'iphone') {
    return targetDecision(input, 'independent', 'model', 'not-required', 'iphone-normal-repair', canonicalBrandSlug, canonicalRepairSlug);
  }

  if (brandClass === 'core-android') {
    if (isCoreModelRepair) {
      return targetDecision(input, 'independent', 'model', 'not-required', 'core-android-model-repair', canonicalBrandSlug, canonicalRepairSlug);
    }

    const currentBrandMasterExists = !['front-camera-replacement', 'back-camera-replacement'].includes(canonicalRepairSlug);
    return targetDecision(
      input,
      'brand-shared',
      'brand',
      currentBrandMasterExists ? 'available' : 'missing',
      'core-android-brand-shared',
      canonicalBrandSlug,
      canonicalRepairSlug,
    );
  }

  return targetDecision(
    input,
    'generic-shared',
    'global',
    isPeripheralRepair ? 'available' : 'missing',
    'secondary-generic-shared',
    canonicalBrandSlug,
    canonicalRepairSlug,
  );
}

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
  { repairSlug: 'front-camera-replacement', href: '/repairs/phone/front-camera-replacement' },
  { repairSlug: 'back-camera-replacement', href: '/repairs/phone/back-camera-replacement' },
  { repairSlug: 'logic-board-repair', href: '/repairs/phone/logic-board-repair' },
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
