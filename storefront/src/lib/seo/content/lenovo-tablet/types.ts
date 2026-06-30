import type { RepairTypeSeoPocket } from '../iphone';

export type { RepairTypeSeoPocket } from '../iphone';

export const LENOVO_TABLET_REPAIR_TYPES = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
] as const;

export type AliMobileEnhancedLenovoTabletRepairType =
  typeof LENOVO_TABLET_REPAIR_TYPES[number];

export const LENOVO_TABLET_MODEL_SLUGS = [
  'lenovo-tab-p12-tb-370fu',
  'lenovo-tab-p11-gen-2-tb-350fu',
  'lenovo-tab-p11-pro-gen-2-tb-132fu',
  'lenovo-tab-p11-plus-tb-j616f',
  'lenovo-tab-p11-tb-j606f',
  'lenovo-tab-p12-pro-tb-q706f',
  'lenovo-tab-m10-plus-gen-3-tb-125fu-tb-128fu',
  'lenovo-tab-m10-gen-3-tb-328fu',
  'lenovo-tab-m10-tb-x606f',
  'lenovo-tab-m10-hd-2nd-gen-tb-x306f',
  'lenovo-tab-m9-tb-310fu',
  'lenovo-tab-m8-gen-4-tb-300fu',
  'lenovo-tab-m7-3rd-gen-tb-7305f',
  'lenovo-yoga-tab-13-yt-k606f',
  'lenovo-yoga-tab-11-yt-j706f',
  'lenovo-yoga-smart-tab-yt-x705f',
  'lenovo-tab-extreme-tb-570fu',
  'lenovo-tab-k10-tb-j606',
] as const;

export type AliMobileEnhancedLenovoTabletModelSlug =
  typeof LENOVO_TABLET_MODEL_SLUGS[number];

export type LenovoTabletFamily =
  | 'tab-p'
  | 'tab-m'
  | 'yoga-tab'
  | 'tab-extreme'
  | 'tab-k';

export type LenovoTabletVariantClass =
  | 'base'
  | 'plus'
  | 'pro'
  | 'hd'
  | 'compact'
  | 'yoga'
  | 'smart'
  | 'extreme';

export interface LenovoTabletModelConfig {
  modelSlug: AliMobileEnhancedLenovoTabletModelSlug;
  modelName: string;
  modelCodes: readonly string[];
  family: LenovoTabletFamily;
  familyLabel:
    | 'Lenovo Tab P'
    | 'Lenovo Tab M'
    | 'Lenovo Yoga Tab'
    | 'Lenovo Tab Extreme'
    | 'Lenovo Tab K';
  familyOrder: number;
  generationKey: string;
  sizeKey: string;
  variantClass: LenovoTabletVariantClass;
  supportedRepairTypes: readonly AliMobileEnhancedLenovoTabletRepairType[];
}

export interface LenovoTabletDetailSection {
  kicker: string;
  heading: string;
  intro: string;
  items: ReadonlyArray<string>;
}

export interface LenovoTabletDiagnosticProcessSection {
  kicker: string;
  heading: string;
  intro: string;
  steps: ReadonlyArray<{
    step: string;
    title: string;
    description: string;
  }>;
}

export interface LenovoTabletServiceSection {
  eyebrow: string;
  heading: string;
  intro: string;
  cards: ReadonlyArray<{
    title: string;
    description: string;
  }>;
}

export interface LenovoTabletFinalCtaSection {
  kicker: string;
  heading: string;
  body: string;
  bullets: ReadonlyArray<string>;
}

export interface LenovoTabletEnhancedSeoPocket extends RepairTypeSeoPocket {
  modelSlug: AliMobileEnhancedLenovoTabletModelSlug;
  modelName: string;
  repairType: AliMobileEnhancedLenovoTabletRepairType;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  schemaDescription: string;
  supportLabel: string;
  diagnosticProcess: LenovoTabletDiagnosticProcessSection;
  serviceSection: LenovoTabletServiceSection;
  localService: LenovoTabletDetailSection;
  finalCta: LenovoTabletFinalCtaSection;
}
