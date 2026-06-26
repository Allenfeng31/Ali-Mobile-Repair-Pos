import { slugify } from '@/lib/inventoryUtils';
import type {
  AliMobileEnhancedSamsungModelSlug,
  AliMobileEnhancedSamsungRepairType,
  SamsungBiometricClass,
  SamsungDeviceFamily,
  SamsungDisplayEdgeClass,
  SamsungDisplayForm,
  SamsungFrontCameraClass,
  SamsungHardwareConfig,
  SamsungRearCameraClass,
  SamsungSeriesFamily,
  SamsungSPenCapability,
  SamsungVariantClass,
} from './types';

export const SAMSUNG_FOLDABLE_REPAIR_TYPES = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'back-housing-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
  'logic-board-repair',
] as const satisfies ReadonlyArray<AliMobileEnhancedSamsungRepairType>;

export const SAMSUNG_GALAXY_S_REPAIR_TYPES = SAMSUNG_FOLDABLE_REPAIR_TYPES;
export const SAMSUNG_GALAXY_S23_ULTRA_REPAIR_TYPES = SAMSUNG_GALAXY_S_REPAIR_TYPES;
export const GALAXY_Z_FOLD_5_REPAIR_TYPES = SAMSUNG_FOLDABLE_REPAIR_TYPES;

const SAMSUNG_VARIANT_ORDER: ReadonlyArray<SamsungVariantClass> = [
  'base',
  'plus',
  'ultra',
  'fe',
  'edge',
  'active',
  'other',
];

const SAMSUNG_GALAXY_S_MODEL_SPECS: ReadonlyArray<{
  generation: number;
  variants: ReadonlyArray<SamsungVariantClass>;
}> = [
  { generation: 8, variants: ['base', 'plus'] },
  { generation: 9, variants: ['base', 'plus'] },
  { generation: 10, variants: ['base', 'plus', 'edge'] },
  { generation: 20, variants: ['base', 'plus', 'fe', 'ultra'] },
  { generation: 21, variants: ['base', 'plus', 'fe', 'ultra'] },
  { generation: 22, variants: ['base', 'plus', 'ultra'] },
  { generation: 23, variants: ['base', 'plus', 'fe', 'ultra'] },
  { generation: 24, variants: ['base', 'plus', 'fe', 'ultra'] },
  { generation: 25, variants: ['base', 'plus', 'ultra'] },
  { generation: 26, variants: ['base', 'plus', 'ultra'] },
];

export const SAMSUNG_GALAXY_S_MODEL_ORDER = SAMSUNG_GALAXY_S_MODEL_SPECS.flatMap((spec) =>
  spec.variants.map((variantClass) => buildSamsungGalaxySModelSlug(spec.generation, variantClass))
);

function defineSamsungHardwareConfig(config: SamsungHardwareConfig): SamsungHardwareConfig {
  return config;
}

function buildSamsungGalaxySModelSlug(
  generation: number,
  variantClass: SamsungVariantClass
): AliMobileEnhancedSamsungModelSlug {
  if (variantClass === 'edge') {
    return `galaxy-s${generation}e` as AliMobileEnhancedSamsungModelSlug;
  }

  if (variantClass === 'plus') {
    return `galaxy-s${generation}-plus` as AliMobileEnhancedSamsungModelSlug;
  }

  if (variantClass === 'fe') {
    return `galaxy-s${generation}-fe` as AliMobileEnhancedSamsungModelSlug;
  }

  if (variantClass === 'ultra') {
    return `galaxy-s${generation}-ultra` as AliMobileEnhancedSamsungModelSlug;
  }

  return `galaxy-s${generation}` as AliMobileEnhancedSamsungModelSlug;
}

function buildSamsungGalaxySModelName(
  generation: number,
  variantClass: SamsungVariantClass
): string {
  if (variantClass === 'edge') {
    return `Galaxy S${generation}e`;
  }

  if (variantClass === 'plus') {
    return `Galaxy S${generation}+`;
  }

  if (variantClass === 'fe') {
    return `Galaxy S${generation} FE`;
  }

  if (variantClass === 'ultra') {
    return `Galaxy S${generation} Ultra`;
  }

  return `Galaxy S${generation}`;
}

function normalizeSamsungModelNameKey(modelName: string): string {
  return slugify(
    modelName
      .replace(/^samsung\s+/i, '')
      .replace(/^samsung-/i, '')
      .replace(/\+/g, ' plus ')
  );
}

function getSamsungGalaxySDeviceFamily(variantClass: SamsungVariantClass): SamsungDeviceFamily {
  return variantClass === 'ultra' ? 'galaxy-s-ultra' : 'galaxy-s';
}

function getSamsungGalaxySDisplayEdgeClass(
  generation: number,
  variantClass: SamsungVariantClass
): SamsungDisplayEdgeClass {
  if (generation <= 9) return 'curved';
  if (generation === 10) return variantClass === 'edge' ? 'flat' : 'curved';
  if (generation === 20) return variantClass === 'fe' ? 'flat' : 'curved';
  if (generation === 21 || generation === 22 || generation === 23) {
    return variantClass === 'ultra' ? 'curved' : 'flat';
  }
  return 'flat';
}

function getSamsungGalaxySDisplayForm(
  generation: number,
  variantClass: SamsungVariantClass
): SamsungDisplayForm {
  return 'flat';
}

function getSamsungGalaxySSPenCapability(
  generation: number,
  variantClass: SamsungVariantClass
): SamsungSPenCapability {
  if (variantClass !== 'ultra') return 'none';
  if (generation <= 20) return 'none';
  if (generation === 21) return 'supported-external';
  return 'integrated-slot';
}

function getSamsungGalaxySFrontCameraClass(
  generation: number,
  variantClass: SamsungVariantClass
): SamsungFrontCameraClass {
  if (generation <= 9) {
    return 'single-bezel';
  }

  if (generation === 10 && variantClass === 'edge') {
    return 'single-punch-hole';
  }

  return 'single-punch-hole';
}

function buildSamsungGalaxySConfig(
  generation: number,
  variantClass: SamsungVariantClass
): SamsungHardwareConfig {
  const modelSlug = buildSamsungGalaxySModelSlug(generation, variantClass);
  const modelName = buildSamsungGalaxySModelName(generation, variantClass);
  const deviceFamily = getSamsungGalaxySDeviceFamily(variantClass);

  return defineSamsungHardwareConfig({
    modelSlug,
    modelName,
    seriesFamily: 'galaxy-s' as SamsungSeriesFamily,
    deviceFamily,
    generation,
    variantClass,
    displayForm: getSamsungGalaxySDisplayForm(generation, variantClass),
    displayEdgeClass: getSamsungGalaxySDisplayEdgeClass(generation, variantClass),
    supportedRepairTypes: SAMSUNG_GALAXY_S_REPAIR_TYPES,
    hasInnerFoldableDisplay: false,
    hasOuterCoverDisplay: false,
    biometrics: 'unknown', // patched later
    chargingPortType: 'usb-c',
    supportsWirelessCharging: true,
    rearCameraClass: 'unknown', // patched later
    frontCameraClass: 'unknown', // patched later
    sPenCapability: getSamsungGalaxySSPenCapability(generation, variantClass),
  });
}

function defineSamsungFoldConfig(
  modelSlug: AliMobileEnhancedSamsungModelSlug,
  modelName: string
): SamsungHardwareConfig {
  return defineSamsungHardwareConfig({
    modelSlug,
    modelName,
    seriesFamily: 'galaxy-z',
    deviceFamily: 'z-fold',
    generation: Number.parseInt(slugify(modelSlug).match(/(\d+)/)?.[1] ?? '0', 10) || 0,
    variantClass: 'other',
    displayForm: 'foldable',
    displayEdgeClass: 'flat',
    supportedRepairTypes: SAMSUNG_FOLDABLE_REPAIR_TYPES,
    hasInnerFoldableDisplay: true,
    hasOuterCoverDisplay: true,
    biometrics: 'side-fingerprint',
    chargingPortType: 'usb-c',
    supportsWirelessCharging: true,
    rearCameraClass: 'triple',
    frontCameraClass: 'cover-and-inner',
    sPenCapability: 'none',
  });
}

function defineSamsungFlipConfig(
  modelSlug: AliMobileEnhancedSamsungModelSlug,
  modelName: string
): SamsungHardwareConfig {
  return defineSamsungHardwareConfig({
    modelSlug,
    modelName,
    seriesFamily: 'galaxy-z',
    deviceFamily: 'z-flip',
    generation: Number.parseInt(slugify(modelSlug).match(/(\d+)/)?.[1] ?? '0', 10) || 0,
    variantClass: 'other',
    displayForm: 'foldable',
    displayEdgeClass: 'flat',
    supportedRepairTypes: SAMSUNG_FOLDABLE_REPAIR_TYPES,
    hasInnerFoldableDisplay: true,
    hasOuterCoverDisplay: true,
    biometrics: 'side-fingerprint',
    chargingPortType: 'usb-c',
    supportsWirelessCharging: true,
    rearCameraClass: 'dual',
    frontCameraClass: 'inner-only',
    sPenCapability: 'none',
  });
}

function buildSamsungHardwareConfigRecord(
  configs: ReadonlyArray<SamsungHardwareConfig>
): Record<AliMobileEnhancedSamsungModelSlug, SamsungHardwareConfig> {
  const record = {} as Record<AliMobileEnhancedSamsungModelSlug, SamsungHardwareConfig>;

  for (const config of configs) {
    record[config.modelSlug] = config;
  }

  return record;
}

const SAMSUNG_GALAXY_S_CONFIGS = SAMSUNG_GALAXY_S_MODEL_SPECS.flatMap((spec) =>
  spec.variants.map((variantClass) => buildSamsungGalaxySConfig(spec.generation, variantClass))
);

export const SAMSUNG_HARDWARE_CONFIG: Record<
  AliMobileEnhancedSamsungModelSlug,
  SamsungHardwareConfig
> = buildSamsungHardwareConfigRecord([
  ...SAMSUNG_GALAXY_S_CONFIGS,
  defineSamsungHardwareConfig({
    modelSlug: 'galaxy-s23-ultra',
    modelName: 'Galaxy S23 Ultra',
    seriesFamily: 'galaxy-s',
    deviceFamily: 'galaxy-s-ultra',
    generation: 23,
    variantClass: 'ultra',
    displayForm: 'flat',
    displayEdgeClass: 'curved',
    supportedRepairTypes: SAMSUNG_GALAXY_S23_ULTRA_REPAIR_TYPES,
    hasInnerFoldableDisplay: false,
    hasOuterCoverDisplay: false,
    biometrics: 'under-display-fingerprint',
    chargingPortType: 'usb-c',
    supportsWirelessCharging: true,
    rearCameraClass: 'quad',
    frontCameraClass: 'single-punch-hole',
    sPenCapability: 'integrated-slot',
  }),
  defineSamsungFlipConfig('galaxy-z-flip', 'Galaxy Z Flip'),
  defineSamsungFlipConfig('galaxy-z-flip-3', 'Galaxy Z Flip 3'),
  defineSamsungFlipConfig('galaxy-z-flip-4', 'Galaxy Z Flip 4'),
  defineSamsungFlipConfig('galaxy-z-flip-5', 'Galaxy Z Flip 5'),
  defineSamsungFlipConfig('galaxy-z-flip-6', 'Galaxy Z Flip 6'),
  defineSamsungFlipConfig('galaxy-z-flip-7', 'Galaxy Z Flip 7'),
  defineSamsungFoldConfig('galaxy-z-fold', 'Galaxy Z Fold'),
  defineSamsungFoldConfig('galaxy-z-fold-2', 'Galaxy Z Fold 2'),
  defineSamsungFoldConfig('galaxy-z-fold-3', 'Galaxy Z Fold 3'),
  defineSamsungFoldConfig('galaxy-z-fold-4', 'Galaxy Z Fold 4'),
  defineSamsungFoldConfig('galaxy-z-fold-5', 'Galaxy Z Fold 5'),
  defineSamsungFoldConfig('galaxy-z-fold-6', 'Galaxy Z Fold 6'),
  defineSamsungFoldConfig('galaxy-z-fold-7', 'Galaxy Z Fold 7'),
]);

export function getSamsungHardwareConfig(modelSlug: string): SamsungHardwareConfig | null {
  const normalized = slugify(modelSlug) as AliMobileEnhancedSamsungModelSlug;
  return SAMSUNG_HARDWARE_CONFIG[normalized] ?? null;
}

export function getSamsungHardwareConfigByModelName(modelName: string): SamsungHardwareConfig | null {
  const normalized = normalizeSamsungModelNameKey(modelName);
  return (
    Object.values(SAMSUNG_HARDWARE_CONFIG).find(
      (config) => normalizeSamsungModelNameKey(config.modelName) === normalized
    ) ?? null
  );
}
