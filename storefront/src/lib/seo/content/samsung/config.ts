import { slugify } from '@/lib/inventoryUtils';
import type {
  AliMobileEnhancedSamsungModelSlug,
  AliMobileEnhancedSamsungRepairType,
  SamsungBiometricClass,
  SamsungConnectivityClass,
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
export const SAMSUNG_GALAXY_NOTE_REPAIR_TYPES = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'back-glass-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
  'logic-board-repair',
] as const satisfies ReadonlyArray<AliMobileEnhancedSamsungRepairType>;

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

const SAMSUNG_GALAXY_NOTE_MODEL_SPECS: ReadonlyArray<{
  modelSlug: AliMobileEnhancedSamsungModelSlug;
  modelName: string;
  modelCodes: ReadonlyArray<string>;
  generation: number;
  connectivityClass: SamsungConnectivityClass;
  displayForm: SamsungDisplayForm;
  displayEdgeClass: SamsungDisplayEdgeClass;
  variantClass: SamsungVariantClass;
  biometrics: SamsungBiometricClass;
  chargingPortType: 'usb-c';
  waterResistanceClass: 'ip68';
  rearCameraClass: SamsungRearCameraClass;
  frontCameraClass: SamsungFrontCameraClass;
}> = [
  {
    modelSlug: 'galaxy-note-8',
    modelName: 'Galaxy Note 8',
    modelCodes: ['SM-N950F'],
    generation: 8,
    connectivityClass: '4g',
    displayForm: 'curved',
    displayEdgeClass: 'curved',
    variantClass: 'base',
    biometrics: 'rear-fingerprint',
    chargingPortType: 'usb-c',
    waterResistanceClass: 'ip68',
    rearCameraClass: 'dual',
    frontCameraClass: 'single-bezel',
  },
  {
    modelSlug: 'galaxy-note-9',
    modelName: 'Galaxy Note 9',
    modelCodes: ['SM-N960F'],
    generation: 9,
    connectivityClass: '4g',
    displayForm: 'curved',
    displayEdgeClass: 'curved',
    variantClass: 'base',
    biometrics: 'rear-fingerprint',
    chargingPortType: 'usb-c',
    waterResistanceClass: 'ip68',
    rearCameraClass: 'dual',
    frontCameraClass: 'single-bezel',
  },
  {
    modelSlug: 'galaxy-note-10',
    modelName: 'Galaxy Note 10',
    modelCodes: ['SM-N970F'],
    generation: 10,
    connectivityClass: '4g',
    displayForm: 'curved',
    displayEdgeClass: 'curved',
    variantClass: 'base',
    biometrics: 'under-display-fingerprint',
    chargingPortType: 'usb-c',
    waterResistanceClass: 'ip68',
    rearCameraClass: 'triple',
    frontCameraClass: 'single-punch-hole',
  },
  {
    modelSlug: 'galaxy-note-10-plus',
    modelName: 'Galaxy Note 10+',
    modelCodes: ['SM-N975F'],
    generation: 10,
    connectivityClass: '4g',
    displayForm: 'curved',
    displayEdgeClass: 'curved',
    variantClass: 'plus',
    biometrics: 'under-display-fingerprint',
    chargingPortType: 'usb-c',
    waterResistanceClass: 'ip68',
    rearCameraClass: 'triple',
    frontCameraClass: 'single-punch-hole',
  },
  {
    modelSlug: 'galaxy-note-20',
    modelName: 'Galaxy Note 20',
    modelCodes: ['SM-N980F'],
    generation: 20,
    connectivityClass: '4g',
    displayForm: 'flat',
    displayEdgeClass: 'flat',
    variantClass: 'base',
    biometrics: 'under-display-fingerprint',
    chargingPortType: 'usb-c',
    waterResistanceClass: 'ip68',
    rearCameraClass: 'triple',
    frontCameraClass: 'single-punch-hole',
  },
  {
    modelSlug: 'galaxy-note-20-ultra',
    modelName: 'Galaxy Note 20 Ultra',
    modelCodes: ['SM-N986B'],
    generation: 20,
    connectivityClass: '5g',
    displayForm: 'curved',
    displayEdgeClass: 'curved',
    variantClass: 'ultra',
    biometrics: 'under-display-fingerprint',
    chargingPortType: 'usb-c',
    waterResistanceClass: 'ip68',
    rearCameraClass: 'triple',
    frontCameraClass: 'single-punch-hole',
  },
];

export const SAMSUNG_GALAXY_NOTE_MODEL_ORDER = SAMSUNG_GALAXY_NOTE_MODEL_SPECS.map(
  (spec) => spec.modelSlug
);

function buildSamsungGalaxyNoteConfig(
  spec: (typeof SAMSUNG_GALAXY_NOTE_MODEL_SPECS)[number]
): SamsungHardwareConfig {
  return defineSamsungHardwareConfig({
    modelSlug: spec.modelSlug,
    modelName: spec.modelName,
    modelCodes: spec.modelCodes,
    seriesFamily: 'galaxy-note',
    deviceFamily: 'galaxy-note',
    generation: spec.generation,
    connectivityClass: spec.connectivityClass,
    variantClass: spec.variantClass,
    displayForm: spec.displayForm,
    displayEdgeClass: spec.displayEdgeClass,
    supportedRepairTypes: SAMSUNG_GALAXY_NOTE_REPAIR_TYPES,
    hasInnerFoldableDisplay: false,
    hasOuterCoverDisplay: false,
    waterResistanceClass: spec.waterResistanceClass,
    biometrics: spec.biometrics,
    chargingPortType: spec.chargingPortType,
    supportsWirelessCharging: true,
    rearCameraClass: spec.rearCameraClass,
    frontCameraClass: spec.frontCameraClass,
    sPenCapability: 'integrated-slot',
  });
}

const SAMSUNG_GALAXY_NOTE_CONFIGS = SAMSUNG_GALAXY_NOTE_MODEL_SPECS.map((spec) =>
  buildSamsungGalaxyNoteConfig(spec)
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



const SAMSUNG_GALAXY_A_MODEL_CODES: Partial<
  Record<AliMobileEnhancedSamsungModelSlug, ReadonlyArray<string>>
> = {
  'galaxy-a37-5g': ['SM-A376B'],
  'galaxy-a57-5g': ['SM-A576B'],
};

function defineSamsungGalaxyAConfig(modelName: string): SamsungHardwareConfig {
  const modelSlug = slugify(modelName) as AliMobileEnhancedSamsungModelSlug;
  const isLbSupported = ["galaxy-a20","galaxy-a21","galaxy-a30","galaxy-a31","galaxy-a32","galaxy-a40","galaxy-a50","galaxy-a51","galaxy-a52","galaxy-a53","galaxy-a54","galaxy-a55","galaxy-a70","galaxy-a71","galaxy-a72","galaxy-a73"].includes(modelSlug);

  let biometrics: SamsungBiometricClass = 'unknown';
  if (['galaxy-a11', 'galaxy-a20', 'galaxy-a21', 'galaxy-a21s', 'galaxy-a30', 'galaxy-a40'].includes(modelSlug)) biometrics = 'rear-fingerprint';
  else if (['galaxy-a12', 'galaxy-a13', 'galaxy-a14', 'galaxy-a15', 'galaxy-a16', 'galaxy-a17'].includes(modelSlug)) biometrics = 'side-fingerprint';
  else biometrics = 'under-display-fingerprint';

  const supportedRepairTypes: AliMobileEnhancedSamsungRepairType[] = [
    'screen-replacement',
    'battery-replacement',
    'charging-port-replacement',
    'back-housing-replacement',
    'front-camera-replacement',
    'back-camera-replacement'
  ];
  if (isLbSupported) supportedRepairTypes.push('logic-board-repair');

  return defineSamsungHardwareConfig({
    modelSlug,
    modelName,
    modelCodes: SAMSUNG_GALAXY_A_MODEL_CODES[modelSlug],
    seriesFamily: 'galaxy-a',
    deviceFamily: 'galaxy-a',
    generation: Number.parseInt(modelSlug.match(/(\d+)/)?.[1] ?? '0', 10),
    variantClass: 'base',
    displayForm: 'flat',
    displayEdgeClass: 'flat',
    supportedRepairTypes,
    hasInnerFoldableDisplay: false,
    hasOuterCoverDisplay: false,
    biometrics,
    chargingPortType: 'usb-c',
    supportsWirelessCharging: false,
    rearCameraClass: 'unknown',
    frontCameraClass: 'single-punch-hole',
    sPenCapability: 'none'
  });
}

const SAMSUNG_GALAXY_A_CONFIGS = [
  'Galaxy A11',
  'Galaxy A12',
  'Galaxy A13',
  'Galaxy A14',
  'Galaxy A15',
  'Galaxy A16',
  'Galaxy A17',
  'Galaxy A20',
  'Galaxy A21',
  'Galaxy A21s',
  'Galaxy A30',
  'Galaxy A31',
  'Galaxy A32',
  'Galaxy A34 5G',
  'Galaxy A35 5G',
  'Galaxy A36 5G',
  'Galaxy A37 5G',
  'Galaxy A40',
  'Galaxy A50',
  'Galaxy A51',
  'Galaxy A52',
  'Galaxy A53',
  'Galaxy A54',
  'Galaxy A55',
  'Galaxy A56 5G',
  'Galaxy A57 5G',
  'Galaxy A70',
  'Galaxy A71',
  'Galaxy A72',
  'Galaxy A73'
].map(defineSamsungGalaxyAConfig);

export const GALAXY_A_MODEL_ORDER = [
  'galaxy-a73', 'galaxy-a72', 'galaxy-a71', 'galaxy-a70',
  'galaxy-a57-5g', 'galaxy-a56-5g', 'galaxy-a55', 'galaxy-a54', 'galaxy-a53', 'galaxy-a52', 'galaxy-a51', 'galaxy-a50',
  'galaxy-a40',
  'galaxy-a37-5g', 'galaxy-a36-5g', 'galaxy-a35-5g', 'galaxy-a34-5g', 'galaxy-a32', 'galaxy-a31', 'galaxy-a30',
  'galaxy-a21s', 'galaxy-a21', 'galaxy-a20',
  'galaxy-a17', 'galaxy-a16', 'galaxy-a15', 'galaxy-a14', 'galaxy-a13', 'galaxy-a12', 'galaxy-a11'
];

export const SAMSUNG_HARDWARE_CONFIG: Record<
  AliMobileEnhancedSamsungModelSlug,
  SamsungHardwareConfig
> = buildSamsungHardwareConfigRecord([
  ...SAMSUNG_GALAXY_S_CONFIGS,
  ...SAMSUNG_GALAXY_A_CONFIGS,
  ...SAMSUNG_GALAXY_NOTE_CONFIGS,
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
