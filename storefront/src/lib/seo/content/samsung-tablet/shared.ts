import type { ExploreRepairLink } from '@/components/services/ExploreRepairNetworkSection';
import { preserveRouteSegment, slugify } from '@/lib/inventoryUtils';
import {
  getSamsungTabletModelConfig,
  SAMSUNG_TABLET_MODEL_CONFIG_LIST,
} from './config';
import type {
  AliMobileEnhancedSamsungTabletModelSlug,
  AliMobileEnhancedSamsungTabletRepairType,
  SamsungTabletDetailSection,
  SamsungTabletDiagnosticProcessSection,
  SamsungTabletFinalCtaSection,
  SamsungTabletModelConfig,
  SamsungTabletServiceSection,
  SamsungTabletVariantClass,
} from './types';

export interface SamsungTabletRepairDetailLink {
  href: string;
  label: string;
  slug: string;
}

export const ALI_MOBILE_SAMSUNG_TABLET_BUSINESS = {
  businessName: 'Ali Mobile & Repair',
  locationName: 'Ringwood Square Shopping Centre',
  locationShort: 'Ringwood Square',
  locality: 'Ringwood, Victoria',
  phone: '0481 058 514',
} as const;

export const SAMSUNG_TABLET_REPAIR_LABELS: Record<
  AliMobileEnhancedSamsungTabletRepairType,
  string
> = {
  'screen-replacement': 'Screen Replacement',
  'battery-replacement': 'Battery Replacement',
  'charging-port-replacement': 'Charging Port Replacement',
  'front-camera-replacement': 'Front Camera Replacement',
  'back-camera-replacement': 'Back Camera Replacement',
};

const SAMSUNG_TABLET_REPAIR_ORDER: ReadonlyArray<AliMobileEnhancedSamsungTabletRepairType> = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
];

export function isSamsungTabletEnhancedBrand(brandSlug: string): boolean {
  const normalizedBrand = slugify(brandSlug);
  return normalizedBrand === 'samsung' || normalizedBrand === 'galaxy';
}

export function buildSamsungTabletRepairDetailHref(
  modelSlug: AliMobileEnhancedSamsungTabletModelSlug,
  repairSlug: AliMobileEnhancedSamsungTabletRepairType
): string {
  return `/repairs/tablet/samsung/${preserveRouteSegment(modelSlug)}/${preserveRouteSegment(repairSlug)}`;
}

export function buildSamsungTabletModelHubHref(
  modelSlug: AliMobileEnhancedSamsungTabletModelSlug
): string {
  return `/repairs/tablet/samsung/${preserveRouteSegment(modelSlug)}`;
}

export function getSamsungTabletRepairLabel(
  repairType: AliMobileEnhancedSamsungTabletRepairType
): string {
  return SAMSUNG_TABLET_REPAIR_LABELS[repairType];
}

export function formatSamsungTabletModelCodes(modelCodes: readonly string[]): string {
  if (modelCodes.length === 1) {
    return modelCodes[0];
  }

  if (modelCodes.length === 2) {
    return `${modelCodes[0]} or ${modelCodes[1]}`;
  }

  const leadingCodes = modelCodes.slice(0, -1).join(', ');
  return `${leadingCodes}, or ${modelCodes[modelCodes.length - 1]}`;
}

export function getSamsungTabletSupportLabel(config: SamsungTabletModelConfig): string {
  return `We confirm model codes such as ${formatSamsungTabletModelCodes(config.modelCodes)} so the repair information matches the correct Galaxy Tab version.`;
}

export function getSamsungTabletPostRepairChecks(
  repairType: AliMobileEnhancedSamsungTabletRepairType
): string {
  switch (repairType) {
    case 'screen-replacement':
      return 'display, touch response, brightness, cameras, and charging response';
    case 'battery-replacement':
      return 'charging response, battery behaviour, power stability, and related tablet functions';
    case 'charging-port-replacement':
      return 'cable fit, charging connection, charging response, and data connection where applicable';
    case 'front-camera-replacement':
      return 'camera preview, video call, camera switching, and microphone basics';
    case 'back-camera-replacement':
      return 'image quality, focus, video, and camera switching';
    default:
      return 'the related tablet functions';
  }
}

function getSamsungTabletRelatedFunctions(
  repairType: AliMobileEnhancedSamsungTabletRepairType
): string {
  switch (repairType) {
    case 'screen-replacement':
      return 'display response, touch coverage, cameras, and charging response';
    case 'battery-replacement':
      return 'power stability, charging response, and the related daily-use functions';
    case 'charging-port-replacement':
      return 'charging response, cable fit, and accessory or data connection where applicable';
    case 'front-camera-replacement':
      return 'camera preview, video-call behaviour, and app switching';
    case 'back-camera-replacement':
      return 'camera preview, image clarity, focus, and video capture';
    default:
      return 'the related tablet functions';
  }
}

export function getSamsungTabletLocalSuburbReference(
  family: SamsungTabletModelConfig['family'],
  repairType: AliMobileEnhancedSamsungTabletRepairType
): string {
  switch (repairType) {
    case 'screen-replacement':
      return family === 'galaxy-tab-a'
        ? 'Customers often visit from Croydon or Ringwood East when a Galaxy Tab screen still powers on but the touch or glass damage needs a closer inspection.'
        : 'Customers often visit from Mitcham or Blackburn when a Galaxy Tab screen fault needs clear in-person testing before they approve the repair.';
    case 'battery-replacement':
      return family === 'galaxy-tab-a'
        ? 'Customers from Heathmont and Ringwood often bring in Galaxy Tab A models that no longer stay powered for normal daily use.'
        : 'Customers from Croydon and Wantirna often bring Galaxy Tab S models in when battery behaviour has become too short or inconsistent for work, study, or streaming.';
    case 'charging-port-replacement':
      return family === 'galaxy-tab-a'
        ? 'Customers from Ringwood East and Heathmont often bring the charging cable with them so we can reproduce the connector fault on the bench.'
        : 'Customers from Mitcham and Blackburn often bring in Galaxy Tab S models when the charging connection becomes unreliable during daily use or accessory connection.';
    case 'front-camera-replacement':
      return 'Customers around Ringwood often bring the tablet in with the video-call issue ready to show on screen so we can confirm the camera path clearly.';
    case 'back-camera-replacement':
      return 'Customers from Croydon and Wantirna often visit after impact around the rear camera area so we can separate image faults from external damage before the repair is booked.';
    default:
      return 'Customers across Ringwood and nearby suburbs use the store for clear Samsung Tablet inspection before they approve repair work.';
  }
}

export function buildSamsungTabletServiceSection(
  config: SamsungTabletModelConfig,
  repairType: AliMobileEnhancedSamsungTabletRepairType
): SamsungTabletServiceSection {
  const repairLabel = getSamsungTabletRepairLabel(repairType).toLowerCase();
  const modelCodeLabel = formatSamsungTabletModelCodes(config.modelCodes);
  const postRepairChecks = getSamsungTabletPostRepairChecks(repairType);

  return {
    eyebrow: 'MODEL-AWARE SAMSUNG TABLET REPAIR',
    heading: `${config.modelName} ${getSamsungTabletRepairLabel(repairType)} in Ringwood`,
    intro:
      `We keep the ${repairLabel} process clear, practical, and tied to the exact Galaxy Tab version in front of us.`,
    cards: [
      {
        title: 'Exact Galaxy Tab model confirmation',
        description: `We confirm model codes such as ${modelCodeLabel} so the repair information, inspection notes, and next step match the correct ${config.familyLabel} version.`,
      },
      {
        title: 'Clear inspection and repair plan',
        description: `We inspect the reported ${repairLabel} fault, explain the suitable repair option, and keep the existing price or quote path visible before work begins.`,
      },
      {
        title: 'Related functions tested after repair',
        description: `After the ${repairLabel}, we retest ${postRepairChecks} so the main day-to-day functions are checked before handover.`,
      },
      {
        title: 'Convenient Ringwood Square service',
        description: `Visit ${ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.businessName} at ${ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.locationName}, call ${ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.phone}, or book online before you visit.`,
      },
    ],
  };
}

export function buildSamsungTabletDiagnosticProcessSection(
  config: SamsungTabletModelConfig,
  repairType: AliMobileEnhancedSamsungTabletRepairType,
  diagnosticSteps: SamsungTabletDiagnosticProcessSection['steps']
): SamsungTabletDiagnosticProcessSection {
  return {
    kicker: 'Diagnostic process',
    heading: `${config.modelName} ${getSamsungTabletRepairLabel(repairType)} diagnostic process`,
    intro:
      'We follow a clear seven-step process so the model, reported fault, quoted repair, and post-repair checks stay aligned from the first inspection to handover.',
    steps: diagnosticSteps,
  };
}

export function buildSamsungTabletLocalServiceSection(
  config: SamsungTabletModelConfig,
  repairType: AliMobileEnhancedSamsungTabletRepairType
): SamsungTabletDetailSection {
  const repairLabel = getSamsungTabletRepairLabel(repairType).toLowerCase();

  return {
    kicker: 'Ringwood tablet support',
    heading: `Bring your ${config.modelName} to Ringwood Square for ${repairLabel}`,
    intro: `${ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.businessName} works from ${ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.locationName} in ${ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.locality}. ${getSamsungTabletLocalSuburbReference(config.family, repairType)}`,
    items: [
      `Bring the ${config.modelName} in as it is so we can confirm the reported fault and the matching model code on the bench.`,
      'If the tablet still powers on, backing up important data before the visit is a sensible preparation step.',
      `Call ${ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.phone} or book online if you want help checking the repair path before travelling to Ringwood.`,
    ],
  };
}

export function buildSamsungTabletFinalCtaSection(
  config: SamsungTabletModelConfig,
  repairType: AliMobileEnhancedSamsungTabletRepairType
): SamsungTabletFinalCtaSection {
  const repairLabel = getSamsungTabletRepairLabel(repairType).toLowerCase();

  return {
    kicker: 'Next step',
    heading: `Ready to organise ${config.modelName} ${repairLabel}?`,
    body:
      'You can book the repair, request a quote through the existing system, call the store, or visit Ringwood Square for an inspection first. We confirm the suitable repair option before work starts.',
    bullets: [
      'Book Repair for the exact Galaxy Tab model and repair path.',
      `Call ${ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.phone} if you want to discuss the fault before visiting.`,
      'Visit Ali Mobile & Repair at Ringwood Square for in-person inspection and next-step guidance.',
    ],
  };
}

function getVariantDistance(
  currentVariant: SamsungTabletVariantClass,
  candidateVariant: SamsungTabletVariantClass
): number {
  const variantOrder: SamsungTabletVariantClass[] = ['base', 'lite', 'fe', 'plus', 'ultra'];
  return Math.abs(
    variantOrder.indexOf(currentVariant) - variantOrder.indexOf(candidateVariant)
  );
}

function getSamsungTabletSimilarityScore(
  currentConfig: SamsungTabletModelConfig,
  candidateConfig: SamsungTabletModelConfig
): number {
  let score = Math.abs(candidateConfig.familyOrder - currentConfig.familyOrder) * 22;

  if (candidateConfig.family === currentConfig.family) {
    score -= 320;
  }

  if (candidateConfig.generationKey === currentConfig.generationKey) {
    score -= 180;
  }

  if (candidateConfig.sizeKey === currentConfig.sizeKey) {
    score -= 120;
  }

  if (candidateConfig.variantClass === currentConfig.variantClass) {
    score -= candidateConfig.variantClass === 'base' ? 60 : 100;
  }

  score += getVariantDistance(currentConfig.variantClass, candidateConfig.variantClass) * 18;

  return score;
}

export function getSamsungTabletSameModelRepairLinks(
  modelSlug: AliMobileEnhancedSamsungTabletModelSlug,
  currentRepairType: AliMobileEnhancedSamsungTabletRepairType
): SamsungTabletRepairDetailLink[] {
  const config = getSamsungTabletModelConfig(modelSlug);
  if (!config) {
    return [];
  }

  return SAMSUNG_TABLET_REPAIR_ORDER
    .filter((repairType) => repairType !== currentRepairType)
    .map((repairType) => ({
      href: buildSamsungTabletRepairDetailHref(config.modelSlug, repairType),
      label: `${config.modelName} ${getSamsungTabletRepairLabel(repairType).toLowerCase()}`,
      slug: repairType,
    }));
}

export function getSamsungTabletSameRepairLinks(
  modelSlug: AliMobileEnhancedSamsungTabletModelSlug,
  repairType: AliMobileEnhancedSamsungTabletRepairType
): SamsungTabletRepairDetailLink[] {
  const currentConfig = getSamsungTabletModelConfig(modelSlug);
  if (!currentConfig) {
    return [];
  }

  return SAMSUNG_TABLET_MODEL_CONFIG_LIST
    .filter((config) => config.modelSlug !== modelSlug)
    .map((config) => ({
      config,
      score: getSamsungTabletSimilarityScore(currentConfig, config),
    }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      return left.config.modelName.localeCompare(right.config.modelName);
    })
    .slice(0, 5)
    .map(({ config }) => ({
      href: buildSamsungTabletRepairDetailHref(config.modelSlug, repairType),
      label: `${config.modelName} ${getSamsungTabletRepairLabel(repairType).toLowerCase()}`,
      slug: repairType,
    }));
}

export function getSamsungTabletModelHubLinks(
  modelSlug: AliMobileEnhancedSamsungTabletModelSlug
): ExploreRepairLink[] {
  const currentConfig = getSamsungTabletModelConfig(modelSlug);
  if (!currentConfig) {
    return [];
  }

  return SAMSUNG_TABLET_MODEL_CONFIG_LIST
    .filter((config) => config.modelSlug !== modelSlug)
    .map((config) => ({
      config,
      score: getSamsungTabletSimilarityScore(currentConfig, config),
    }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      return left.config.modelName.localeCompare(right.config.modelName);
    })
    .slice(0, 5)
    .map(({ config }) => ({
      href: buildSamsungTabletModelHubHref(config.modelSlug),
      label: `Explore ${config.modelName} repairs`,
    }));
}

export function getSamsungTabletCategoryHubLinks(): ExploreRepairLink[] {
  return [
    { href: '/repairs/tablet/samsung', label: 'Explore Samsung Tablet repairs' },
    { href: '/repairs/tablet/ipad', label: 'Explore iPad repairs' },
    { href: '/repairs/phone', label: 'Explore phone repairs' },
    { href: '/repairs/phone/samsung', label: 'Explore Samsung phone repairs' },
    { href: '/repairs/laptop/macbook', label: 'Explore MacBook repairs' },
    { href: '/repairs/watch/apple', label: 'Explore Apple Watch repairs' },
  ];
}

export function buildSamsungTabletMetaTitle(
  config: SamsungTabletModelConfig,
  repairType: AliMobileEnhancedSamsungTabletRepairType
): string {
  return `${config.modelName} ${getSamsungTabletRepairLabel(repairType)} in Ringwood | Ali Mobile & Repair`;
}

export function buildSamsungTabletMetaDescription(
  config: SamsungTabletModelConfig,
  repairType: AliMobileEnhancedSamsungTabletRepairType
): string {
  return `${config.modelName} ${getSamsungTabletRepairLabel(repairType).toLowerCase()} in Ringwood with model-code confirmation for ${formatSamsungTabletModelCodes(config.modelCodes)}, fault inspection, clear pricing or quote support, and post-repair function checks.`;
}

export function buildSamsungTabletHeroSubtitle(
  config: SamsungTabletModelConfig,
  repairType: AliMobileEnhancedSamsungTabletRepairType
): string {
  return `Bring your ${config.modelName} to ${ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.businessName} at ${ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.locationShort} for model-aware ${getSamsungTabletRepairLabel(repairType).toLowerCase()} inspection, transparent pricing or quote support, and easy booking help.`;
}

export function buildSamsungTabletSchemaDescription(
  config: SamsungTabletModelConfig,
  repairType: AliMobileEnhancedSamsungTabletRepairType
): string {
  return `Model-aware ${getSamsungTabletRepairLabel(repairType).toLowerCase()} for ${config.modelName} in Ringwood. We confirm the exact model code, inspect the reported fault, test ${getSamsungTabletRelatedFunctions(repairType)}, and explain the suitable repair option before work begins.`;
}

