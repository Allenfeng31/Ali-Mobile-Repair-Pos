import { slugify } from '@/lib/inventoryUtils';
import { buildSamsungBackCameraReplacementPocket } from './back-camera-replacement';
import { buildSamsungBackHousingReplacementPocket } from './back-housing-replacement';
import { buildSamsungBatteryReplacementPocket } from './battery-replacement';
import { buildSamsungChargingPortReplacementPocket } from './charging-port-replacement';
import {
  getSamsungHardwareConfig,
  SAMSUNG_HARDWARE_CONFIG,
  SAMSUNG_STANDARD_REPAIR_TURNAROUND_MINUTES,
} from './config';
import { buildSamsungFrontCameraReplacementPocket } from './front-camera-replacement';
import { buildSamsungLogicBoardRepairPocket } from './logic-board-repair';
import { buildSamsungScreenReplacementPocket } from './screen-replacement';
import { getSamsungEnhancedHubLinks, type SamsungHubLink } from './shared';
import type {
  AliMobileEnhancedSamsungModelSlug,
  AliMobileEnhancedSamsungRepairType,
  RepairTypeSeoPocket,
} from './types';

export type {
  AliMobileEnhancedSamsungModelSlug,
  AliMobileEnhancedSamsungRepairType,
  RepairTypeSeoPocket,
} from './types';

interface AliMobileEnhancedSamsungRouteParams {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}

interface AliMobileEnhancedSamsungSeoPocketParams {
  category: string;
  brand: string;
  model: string;
  repairType: string;
  pocket: RepairTypeSeoPocket | null;
}

const SAMSUNG_STANDARD_REPAIR_NAMES = {
  'screen-replacement': 'Screen Replacement',
  'battery-replacement': 'Battery Replacement',
  'charging-port-replacement': 'Charging Port Replacement',
  'back-glass-replacement': 'Back Glass Replacement',
  'front-camera-replacement': 'Front Camera Replacement',
  'back-camera-replacement': 'Back Camera Replacement',
  'logic-board-repair': 'Logic Board Repair',
} as const;

function isSamsungRepairTimingQuestion(question: string): boolean {
  return /how long/i.test(question) &&
    /(?:repair|replacement|diagnosis).*(?:take|usually)|(?:take|usually).*?(?:repair|replacement|diagnosis)/i.test(question);
}

function withStandardSamsungTurnaround(
  pocket: RepairTypeSeoPocket,
  repairType: AliMobileEnhancedSamsungRepairType,
  modelName: string
): RepairTypeSeoPocket {
  const turnaroundMinutes = SAMSUNG_STANDARD_REPAIR_TURNAROUND_MINUTES[repairType];
  const repairName = SAMSUNG_STANDARD_REPAIR_NAMES[repairType as keyof typeof SAMSUNG_STANDARD_REPAIR_NAMES];

  if (!turnaroundMinutes || !repairName) {
    return pocket;
  }

  const timingQuestion = `How long does ${modelName} ${repairName} usually take?`;
  const supportsTierPriceFaq =
    repairType === 'screen-replacement' || repairType === 'back-glass-replacement';
  const hasTierPriceFaq = pocket.faq.some(
    (faq) => /how much/i.test(faq.question) && /cost/i.test(faq.question)
  );

  return {
    ...pocket,
    turnaroundMinutes,
    useResolvedTierPriceFaq:
      repairType === 'screen-replacement' || repairType === 'back-glass-replacement',
    faq: [
      {
        question: timingQuestion,
        answer:
          'We confirm the required part and repair path before work begins, including any additional fault findings that may affect the repair.',
      },
      ...(supportsTierPriceFaq && !hasTierPriceFaq
        ? [{
            question: `How much does ${modelName} ${repairName} cost?`,
            answer:
              'Current price availability is shown above when listed. If no price is shown, we confirm the correct part and quote before work begins.',
          }]
        : []),
      ...pocket.faq.filter(
        (faq) => faq.question !== timingQuestion && !isSamsungRepairTimingQuestion(faq.question)
      ),
    ],
  };
}

function buildEnhancedSamsungRepairTypesByModel(): Record<
  AliMobileEnhancedSamsungModelSlug,
  ReadonlySet<AliMobileEnhancedSamsungRepairType>
> {
  const repairTypesByModel = {} as Record<
    AliMobileEnhancedSamsungModelSlug,
    ReadonlySet<AliMobileEnhancedSamsungRepairType>
  >;

  for (const config of Object.values(SAMSUNG_HARDWARE_CONFIG)) {
    repairTypesByModel[config.modelSlug] = new Set<AliMobileEnhancedSamsungRepairType>(
      config.supportedRepairTypes
    );
  }

  return repairTypesByModel;
}

export const ENHANCED_SAMSUNG_REPAIR_TYPES_BY_MODEL: Record<
  AliMobileEnhancedSamsungModelSlug,
  ReadonlySet<AliMobileEnhancedSamsungRepairType>
> = buildEnhancedSamsungRepairTypesByModel();

function getAliMobileEnhancedSamsungModelSlug(
  params: AliMobileEnhancedSamsungRouteParams
): AliMobileEnhancedSamsungModelSlug | null {
  const category = slugify(params.category);
  const brand = slugify(params.brand);
  const model = slugify(params.model);

  if (category !== 'phone' || brand !== 'samsung') {
    return null;
  }

  const hardwareConfig = getSamsungHardwareConfig(model);
  return hardwareConfig?.modelSlug ?? null;
}

export function getAliMobileEnhancedSamsungRepairType(
  params: AliMobileEnhancedSamsungRouteParams
): AliMobileEnhancedSamsungRepairType | null {
  const modelSlug = getAliMobileEnhancedSamsungModelSlug(params);
  const repairType = slugify(params['repair-type']) as AliMobileEnhancedSamsungRepairType;

  if (!modelSlug) {
    return null;
  }

  return ENHANCED_SAMSUNG_REPAIR_TYPES_BY_MODEL[modelSlug].has(repairType) ? repairType : null;
}

export function isAliMobileEnhancedSamsungRepairPage(
  params: AliMobileEnhancedSamsungRouteParams
): boolean {
  return getAliMobileEnhancedSamsungRepairType(params) !== null;
}

export function getAliMobileEnhancedSamsungSeoPocket({
  category,
  brand,
  model,
  repairType,
  pocket,
}: AliMobileEnhancedSamsungSeoPocketParams): RepairTypeSeoPocket | null {
  const enhancedRepairType = getAliMobileEnhancedSamsungRepairType({
    category,
    brand,
    model,
    'repair-type': repairType,
  });

  if (!enhancedRepairType) {
    return pocket;
  }

  const hardwareConfig = getSamsungHardwareConfig(model);
  if (!hardwareConfig) {
    return pocket;
  }

  const enhancedPocket = (() => {
    switch (enhancedRepairType) {
    case 'screen-replacement':
      return buildSamsungScreenReplacementPocket(hardwareConfig);
    case 'battery-replacement':
      return buildSamsungBatteryReplacementPocket(hardwareConfig);
    case 'charging-port-replacement':
      return buildSamsungChargingPortReplacementPocket(hardwareConfig);
    case 'back-glass-replacement':
    case 'back-housing-replacement':
      return buildSamsungBackHousingReplacementPocket(hardwareConfig);
    case 'front-camera-replacement':
      return buildSamsungFrontCameraReplacementPocket(hardwareConfig);
    case 'back-camera-replacement':
      return buildSamsungBackCameraReplacementPocket(hardwareConfig);
    case 'logic-board-repair':
      return buildSamsungLogicBoardRepairPocket(hardwareConfig);
    default:
      return pocket;
    }
  })();

  return enhancedPocket
    ? withStandardSamsungTurnaround(enhancedPocket, enhancedRepairType, hardwareConfig.modelName)
    : enhancedPocket;
}

export function getAliMobileEnhancedSamsungHubLinks(modelSlug: string): SamsungHubLink[] {
  const hardwareConfig = getSamsungHardwareConfig(modelSlug);
  return hardwareConfig ? getSamsungEnhancedHubLinks(hardwareConfig) : [];
}
