import type { RepairTypeSeoPocket } from '../iphone';

export type { RepairTypeSeoPocket } from '../iphone';

export const SAMSUNG_TABLET_REPAIR_TYPES = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
] as const;

export type AliMobileEnhancedSamsungTabletRepairType =
  typeof SAMSUNG_TABLET_REPAIR_TYPES[number];

export const SAMSUNG_TABLET_MODEL_SLUGS = [
  'galaxy-tab-a-101-2016-sm-p585-sm-t580',
  'galaxy-tab-a-101-2019-sm-t510-sm-t515',
  'galaxy-tab-a-105-2018-sm-t590-sm-t595',
  'galaxy-tab-a-70-2016-sm-t280',
  'galaxy-tab-a-80-2015-sm-t350-sm-t355',
  'galaxy-tab-a-80-2017-sm-t380-sm-t385',
  'galaxy-tab-a-80-2019-sm-t290-sm-t295',
  'galaxy-tab-a-97-sm-p550-sm-t550-sm-t555',
  'galaxy-tab-a7-lite-sm-t220-sm-t225',
  'galaxy-tab-a7-sm-t500',
  'galaxy-tab-a8-sm-x200-sm-x205',
  'galaxy-tab-a9-plus-sm-x210-sm-x215',
  'galaxy-tab-s-105-sm-t800-sm-t805',
  'galaxy-tab-s-84-sm-t700-sm-t705',
  'galaxy-tab-s10-fe-plus-sm-x620-sm-x626',
  'galaxy-tab-s10-fe-sm-x520-sm-x526',
  'galaxy-tab-s10-lite-sm-x400-sm-x406',
  'galaxy-tab-s10-plus-sm-x820-sm-x826',
  'galaxy-tab-s10-ultra-sm-x920-sm-x926',
  'galaxy-tab-s11-sm-x730-sm-x736',
  'galaxy-tab-s11-ultra-sm-x930-sm-x936',
  'galaxy-tab-s2-80-sm-t710-sm-t715',
  'galaxy-tab-s2-97-sm-t810-sm-t815',
  'galaxy-tab-s3-sm-t820-sm-t825',
  'galaxy-tab-s4-sm-t830-sm-t835',
  'galaxy-tab-s5e-sm-t720-sm-t725',
  'galaxy-tab-s6-lite-sm-p610-sm-p613-sm-p615-sm-p619',
  'galaxy-tab-s6-sm-t860-sm-t865',
  'galaxy-tab-s7-fe-sm-t730-sm-t733-sm-t736',
  'galaxy-tab-s7-plus-sm-t970-sm-t975-sm-t976',
  'galaxy-tab-s7-sm-t870-sm-t875',
  'galaxy-tab-s8-plus-sm-x800-sm-x806',
  'galaxy-tab-s8-sm-x700-sm-x706',
  'galaxy-tab-s8-ultra-sm-x900-sm-x906',
  'galaxy-tab-s9-fe-plus-sm-x610-sm-x616',
  'galaxy-tab-s9-fe-sm-x510-sm-x516',
  'galaxy-tab-s9-plus-sm-x810-sm-x816',
  'galaxy-tab-s9-sm-x710-sm-x716',
  'galaxy-tab-s9-ultra-sm-x910-sm-x916',
] as const;

export type AliMobileEnhancedSamsungTabletModelSlug =
  typeof SAMSUNG_TABLET_MODEL_SLUGS[number];

export type SamsungTabletFamily = 'galaxy-tab-a' | 'galaxy-tab-s';
export type SamsungTabletVariantClass = 'base' | 'lite' | 'fe' | 'plus' | 'ultra';

export interface SamsungTabletModelConfig {
  modelSlug: AliMobileEnhancedSamsungTabletModelSlug;
  modelName: string;
  modelCodes: readonly string[];
  family: SamsungTabletFamily;
  familyLabel: 'Galaxy Tab A' | 'Galaxy Tab S';
  familyOrder: number;
  generationKey: string;
  sizeKey: string;
  variantClass: SamsungTabletVariantClass;
  supportedRepairTypes: readonly AliMobileEnhancedSamsungTabletRepairType[];
}

export interface SamsungTabletDetailSection {
  kicker: string;
  heading: string;
  intro: string;
  items: ReadonlyArray<string>;
}

export interface SamsungTabletDiagnosticProcessSection {
  kicker: string;
  heading: string;
  intro: string;
  steps: ReadonlyArray<{
    step: string;
    title: string;
    description: string;
  }>;
}

export interface SamsungTabletServiceSection {
  eyebrow: string;
  heading: string;
  intro: string;
  cards: ReadonlyArray<{
    title: string;
    description: string;
  }>;
}

export interface SamsungTabletFinalCtaSection {
  kicker: string;
  heading: string;
  body: string;
  bullets: ReadonlyArray<string>;
}

export interface SamsungTabletEnhancedSeoPocket extends RepairTypeSeoPocket {
  modelSlug: AliMobileEnhancedSamsungTabletModelSlug;
  modelName: string;
  repairType: AliMobileEnhancedSamsungTabletRepairType;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  schemaDescription: string;
  supportLabel: string;
  diagnosticProcess: SamsungTabletDiagnosticProcessSection;
  serviceSection: SamsungTabletServiceSection;
  localService: SamsungTabletDetailSection;
  finalCta: SamsungTabletFinalCtaSection;
}

