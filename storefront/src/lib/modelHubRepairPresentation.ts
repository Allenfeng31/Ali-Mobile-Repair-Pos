import {
  getAliMobileEnhancedGooglePixelSeoPocket,
  getGooglePixelRearServiceSemantic,
} from '@/lib/seo/content/google-pixel';
import { getAliMobileEnhancedIphoneSeoPocket } from '@/lib/seo/content/iphone';
import type { RepairTypeSeoPocket } from '@/lib/seo/content/iphone/types';
import { getAliMobileEnhancedOppoSeoPocket } from '@/lib/seo/content/oppo';
import { getAliMobileEnhancedSamsungSeoPocket } from '@/lib/seo/content/samsung';
import { SHARED_PHONE_STANDARD_REPAIR_MINUTES } from '@/lib/sharedPhoneRepairTiming';
import {
  SAMSUNG_PHONE_WATER_DAMAGE_INITIAL_ASSESSMENT_MINUTES,
  isGooglePixelAliasBrand,
  isWaterDamageRepairSlug,
} from '@/lib/waterDamageRouting';

type ModelHubRepairPresentationInput = Readonly<{
  category: string;
  brandSlug: string;
  modelSlug: string;
  repairSlug: string;
}>;

export type ModelHubRepairPresentation = Readonly<{
  displayName?: string;
  timingLabel?: string;
  turnaroundMinutes?: number;
}>;

const EMPTY_POCKET: RepairTypeSeoPocket = {
  quickAnswer: '',
  repairOptions: [],
  commonProblems: [],
  diagnosticSteps: [],
  faq: [],
};

const SHARED_STANDARD_REPAIR_SLUGS = new Set([
  'camera-lens-replacement',
  'earpiece-speaker-replacement',
  'loudspeaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
]);

const SUMMARY_REPAIR_SLUGS = new Set([
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
]);

function withMinutes(turnaroundMinutes: number): ModelHubRepairPresentation {
  return { timingLabel: `${turnaroundMinutes} Minutes`, turnaroundMinutes };
}

function resolveDetailPocket({ category, brandSlug, modelSlug, repairSlug }: ModelHubRepairPresentationInput) {
  const params = { category, brand: brandSlug, model: modelSlug, repairType: repairSlug, pocket: EMPTY_POCKET };

  if (brandSlug === 'iphone') return getAliMobileEnhancedIphoneSeoPocket(params);
  if (brandSlug === 'samsung') return getAliMobileEnhancedSamsungSeoPocket(params);
  if (isGooglePixelAliasBrand(brandSlug) || brandSlug === 'google-pixel') {
    return getAliMobileEnhancedGooglePixelSeoPocket(params);
  }
  if (brandSlug === 'oppo') return getAliMobileEnhancedOppoSeoPocket(params);
  return null;
}

export function resolveModelHubRepairPresentation(
  input: ModelHubRepairPresentationInput,
): ModelHubRepairPresentation {
  const { category, brandSlug, modelSlug, repairSlug } = input;
  const isMajorPhoneBrand = category === 'phone' && (
    brandSlug === 'iphone' ||
    brandSlug === 'samsung' ||
    brandSlug === 'oppo' ||
    brandSlug === 'google-pixel' ||
    isGooglePixelAliasBrand(brandSlug)
  );
  if (!isMajorPhoneBrand) return {};

  if (isWaterDamageRepairSlug(repairSlug)) {
    return brandSlug === 'samsung'
      ? {
          timingLabel: `Initial Assessment & Cleaning — ${SAMSUNG_PHONE_WATER_DAMAGE_INITIAL_ASSESSMENT_MINUTES} Minutes`,
        }
      : { timingLabel: 'Depends on Damage' };
  }

  if (repairSlug === 'logic-board-repair' && brandSlug !== 'samsung') {
    return { timingLabel: 'Diagnostic Required' };
  }

  const detailPocket = resolveDetailPocket(input);
  const turnaroundMinutes = detailPocket?.turnaroundMinutes;
  const basePresentation = turnaroundMinutes
    ? withMinutes(turnaroundMinutes)
    : SHARED_STANDARD_REPAIR_SLUGS.has(repairSlug)
      ? withMinutes(SHARED_PHONE_STANDARD_REPAIR_MINUTES)
      : repairSlug === 'back-glass-replacement'
        ? { timingLabel: 'Varies' }
        : {};

  if (
    (brandSlug === 'google-pixel' || isGooglePixelAliasBrand(brandSlug)) &&
    repairSlug === 'back-glass-replacement'
  ) {
    const semantic = getGooglePixelRearServiceSemantic(modelSlug);
    return {
      displayName: semantic.displayName,
      timingLabel: semantic.timingLabel,
      turnaroundMinutes: semantic.turnaroundMinutes,
    };
  }

  return basePresentation;
}

export function getModelHubTimingSummary({
  category,
  brandSlug,
  modelSlug,
  repairSlugs,
}: Readonly<{
  category: string;
  brandSlug: string;
  modelSlug: string;
  repairSlugs: readonly string[];
}>) {
  const approvedMinutes = repairSlugs
    .filter((repairSlug) => SUMMARY_REPAIR_SLUGS.has(repairSlug))
    .map((repairSlug) => resolveModelHubRepairPresentation({ category, brandSlug, modelSlug, repairSlug }).turnaroundMinutes)
    .filter((minutes): minutes is number => typeof minutes === 'number');

  if (approvedMinutes.length === 0) return null;

  const minimum = Math.min(...approvedMinutes);
  const maximum = Math.max(...approvedMinutes);
  const duration = minimum === maximum ? `${minimum} Minutes` : `${minimum}–${maximum} Minutes`;

  return {
    title: 'Typical repair time',
    primaryLine: `Most standard repairs: ${duration}`,
    secondaryLine: 'Exact repair time is shown with each service below.',
  } as const;
}
