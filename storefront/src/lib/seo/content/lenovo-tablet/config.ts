import type {
  AliMobileEnhancedLenovoTabletModelSlug,
  LenovoTabletModelConfig,
} from './types';
import { LENOVO_TABLET_MODEL_SLUGS, LENOVO_TABLET_REPAIR_TYPES } from './types';

function createConfig(config: LenovoTabletModelConfig): LenovoTabletModelConfig {
  return config;
}

const ALL_REPAIR_TYPES = [...LENOVO_TABLET_REPAIR_TYPES] as const;

export const LENOVO_TABLET_MODEL_CONFIG_LIST: ReadonlyArray<LenovoTabletModelConfig> = [
  createConfig({
    modelSlug: 'lenovo-tab-p12-tb-370fu',
    modelName: 'Lenovo Tab P12 (TB-370FU)',
    modelCodes: ['TB-370FU'],
    family: 'tab-p',
    familyLabel: 'Lenovo Tab P',
    familyOrder: 1,
    generationKey: 'tab-p12',
    sizeKey: '12',
    variantClass: 'base',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-p11-gen-2-tb-350fu',
    modelName: 'Lenovo Tab P11 Gen 2 (TB-350FU)',
    modelCodes: ['TB-350FU'],
    family: 'tab-p',
    familyLabel: 'Lenovo Tab P',
    familyOrder: 2,
    generationKey: 'tab-p11',
    sizeKey: '11',
    variantClass: 'base',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-p11-pro-gen-2-tb-132fu',
    modelName: 'Lenovo Tab P11 Pro Gen 2 (TB-132FU)',
    modelCodes: ['TB-132FU'],
    family: 'tab-p',
    familyLabel: 'Lenovo Tab P',
    familyOrder: 3,
    generationKey: 'tab-p11',
    sizeKey: '11',
    variantClass: 'pro',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-p11-plus-tb-j616f',
    modelName: 'Lenovo Tab P11 Plus (TB-J616F)',
    modelCodes: ['TB-J616F'],
    family: 'tab-p',
    familyLabel: 'Lenovo Tab P',
    familyOrder: 4,
    generationKey: 'tab-p11',
    sizeKey: '11',
    variantClass: 'plus',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-p11-tb-j606f',
    modelName: 'Lenovo Tab P11 (TB-J606F)',
    modelCodes: ['TB-J606F'],
    family: 'tab-p',
    familyLabel: 'Lenovo Tab P',
    familyOrder: 5,
    generationKey: 'tab-p11',
    sizeKey: '11',
    variantClass: 'base',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-p12-pro-tb-q706f',
    modelName: 'Lenovo Tab P12 Pro (TB-Q706F)',
    modelCodes: ['TB-Q706F'],
    family: 'tab-p',
    familyLabel: 'Lenovo Tab P',
    familyOrder: 6,
    generationKey: 'tab-p12',
    sizeKey: '12',
    variantClass: 'pro',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-m10-plus-gen-3-tb-125fu-tb-128fu',
    modelName: 'Lenovo Tab M10 Plus Gen 3 (TB-125FU / TB-128FU)',
    modelCodes: ['TB-125FU', 'TB-128FU'],
    family: 'tab-m',
    familyLabel: 'Lenovo Tab M',
    familyOrder: 1,
    generationKey: 'tab-m10',
    sizeKey: '10',
    variantClass: 'plus',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-m10-gen-3-tb-328fu',
    modelName: 'Lenovo Tab M10 Gen 3 (TB-328FU)',
    modelCodes: ['TB-328FU'],
    family: 'tab-m',
    familyLabel: 'Lenovo Tab M',
    familyOrder: 2,
    generationKey: 'tab-m10',
    sizeKey: '10',
    variantClass: 'base',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-m10-tb-x606f',
    modelName: 'Lenovo Tab M10 (TB-X606F)',
    modelCodes: ['TB-X606F'],
    family: 'tab-m',
    familyLabel: 'Lenovo Tab M',
    familyOrder: 3,
    generationKey: 'tab-m10',
    sizeKey: '10',
    variantClass: 'base',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-m10-hd-2nd-gen-tb-x306f',
    modelName: 'Lenovo Tab M10 HD 2nd Gen (TB-X306F)',
    modelCodes: ['TB-X306F'],
    family: 'tab-m',
    familyLabel: 'Lenovo Tab M',
    familyOrder: 4,
    generationKey: 'tab-m10',
    sizeKey: '10',
    variantClass: 'hd',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-m9-tb-310fu',
    modelName: 'Lenovo Tab M9 (TB-310FU)',
    modelCodes: ['TB-310FU'],
    family: 'tab-m',
    familyLabel: 'Lenovo Tab M',
    familyOrder: 5,
    generationKey: 'tab-m9',
    sizeKey: '9',
    variantClass: 'compact',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-m8-gen-4-tb-300fu',
    modelName: 'Lenovo Tab M8 Gen 4 (TB-300FU)',
    modelCodes: ['TB-300FU'],
    family: 'tab-m',
    familyLabel: 'Lenovo Tab M',
    familyOrder: 6,
    generationKey: 'tab-m8',
    sizeKey: '8',
    variantClass: 'compact',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-m7-3rd-gen-tb-7305f',
    modelName: 'Lenovo Tab M7 3rd Gen (TB-7305F)',
    modelCodes: ['TB-7305F'],
    family: 'tab-m',
    familyLabel: 'Lenovo Tab M',
    familyOrder: 7,
    generationKey: 'tab-m7',
    sizeKey: '7',
    variantClass: 'compact',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-yoga-tab-13-yt-k606f',
    modelName: 'Lenovo Yoga Tab 13 (YT-K606F)',
    modelCodes: ['YT-K606F'],
    family: 'yoga-tab',
    familyLabel: 'Lenovo Yoga Tab',
    familyOrder: 1,
    generationKey: 'yoga-tab-13',
    sizeKey: '13',
    variantClass: 'yoga',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-yoga-tab-11-yt-j706f',
    modelName: 'Lenovo Yoga Tab 11 (YT-J706F)',
    modelCodes: ['YT-J706F'],
    family: 'yoga-tab',
    familyLabel: 'Lenovo Yoga Tab',
    familyOrder: 2,
    generationKey: 'yoga-tab-11',
    sizeKey: '11',
    variantClass: 'yoga',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-yoga-smart-tab-yt-x705f',
    modelName: 'Lenovo Yoga Smart Tab (YT-X705F)',
    modelCodes: ['YT-X705F'],
    family: 'yoga-tab',
    familyLabel: 'Lenovo Yoga Tab',
    familyOrder: 3,
    generationKey: 'yoga-smart-tab',
    sizeKey: '10',
    variantClass: 'smart',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-extreme-tb-570fu',
    modelName: 'Lenovo Tab Extreme (TB-570FU)',
    modelCodes: ['TB-570FU'],
    family: 'tab-extreme',
    familyLabel: 'Lenovo Tab Extreme',
    familyOrder: 1,
    generationKey: 'tab-extreme',
    sizeKey: '14',
    variantClass: 'extreme',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
  createConfig({
    modelSlug: 'lenovo-tab-k10-tb-j606',
    modelName: 'Lenovo Tab K10 (TB-J606)',
    modelCodes: ['TB-J606'],
    family: 'tab-k',
    familyLabel: 'Lenovo Tab K',
    familyOrder: 1,
    generationKey: 'tab-k10',
    sizeKey: '10',
    variantClass: 'base',
    supportedRepairTypes: ALL_REPAIR_TYPES,
  }),
] as const;

export const LENOVO_TABLET_MODEL_CONFIG: Record<
  AliMobileEnhancedLenovoTabletModelSlug,
  LenovoTabletModelConfig
> = Object.fromEntries(
  LENOVO_TABLET_MODEL_CONFIG_LIST.map((config) => [config.modelSlug, config])
) as Record<AliMobileEnhancedLenovoTabletModelSlug, LenovoTabletModelConfig>;

export function getLenovoTabletModelConfig(
  modelSlug: string
): LenovoTabletModelConfig | null {
  return LENOVO_TABLET_MODEL_CONFIG[modelSlug as AliMobileEnhancedLenovoTabletModelSlug] ?? null;
}

export function getLenovoTabletModelConfigByModelName(
  modelName: string
): LenovoTabletModelConfig | null {
  return LENOVO_TABLET_MODEL_CONFIG_LIST.find((config) => config.modelName === modelName) ?? null;
}

export const LENOVO_TABLET_MODEL_COUNT = LENOVO_TABLET_MODEL_SLUGS.length;
