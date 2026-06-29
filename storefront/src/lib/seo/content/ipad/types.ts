import type { RepairTypeSeoPocket } from '../iphone';

export type { RepairTypeSeoPocket } from '../iphone';

export type AliMobileEnhancedIpadRepairType =
  | 'screen-replacement'
  | 'battery-replacement'
  | 'charging-port-replacement'
  | 'front-camera-replacement'
  | 'back-camera-replacement';

export type AliMobileEnhancedIpadModelSlug =
  | 'ipad-5th-generation'
  | 'ipad-6th-generation'
  | 'ipad-7th-generation'
  | 'ipad-8th-generation'
  | 'ipad-9th-generation'
  | 'ipad-10th-generation'
  | 'ipad-11th-generation'
  | 'ipad-air-3rd-generation'
  | 'ipad-air-4th-generation'
  | 'ipad-air-5th-generation'
  | 'ipad-air-m2-11-inch'
  | 'ipad-air-m2-13-inch'
  | 'ipad-mini-5th-generation'
  | 'ipad-mini-6th-generation'
  | 'ipad-mini-7th-generation'
  | 'ipad-pro-11-inch-1st-generation'
  | 'ipad-pro-11-inch-2nd-generation'
  | 'ipad-pro-11-inch-3rd-generation'
  | 'ipad-pro-11-inch-4th-generation'
  | 'ipad-pro-11-inch-m4'
  | 'ipad-pro-129-inch-3rd-generation'
  | 'ipad-pro-129-inch-4th-generation'
  | 'ipad-pro-129-inch-5th-generation'
  | 'ipad-pro-129-inch-6th-generation'
  | 'ipad-pro-13-inch-m4';

export type IpadFamily = 'ipad' | 'ipad-air' | 'ipad-mini' | 'ipad-pro';
export type IpadBiometricType = 'home-button-touch-id' | 'top-button-touch-id' | 'face-id';
export type IpadConnectorType = 'lightning' | 'usb-c' | 'usb-c-thunderbolt';
export type IpadFrontCameraPosition = 'traditional' | 'landscape';
export type IpadDisplayFamily =
  | 'retina'
  | 'liquid-retina'
  | 'liquid-retina-xdr-mini-led'
  | 'ultra-retina-xdr-tandem-oled';
export type IpadRearCameraSystem =
  | 'single-8mp'
  | 'single-12mp'
  | 'dual-wide-ultra-wide-lidar'
  | 'single-12mp-lidar';

export interface IpadHardwareConfig {
  modelSlug: AliMobileEnhancedIpadModelSlug;
  modelName: string;
  family: IpadFamily;
  generationOrder: number;
  releasePairKey?: string;
  customerFacingReferenceName?: string;
  screenSizeInches: number;
  screenSizeLabel: string;
  displayMarketingName: string;
  displayFamily: IpadDisplayFamily;
  hasHomeButton: boolean;
  biometricType: IpadBiometricType;
  connectorType: IpadConnectorType;
  frontCameraDescription: string;
  frontCameraPosition: IpadFrontCameraPosition;
  supportsCenterStage: boolean;
  hasTrueDepthFrontCamera: boolean;
  rearCameraDescription: string;
  rearCameraSystem: IpadRearCameraSystem;
  hasRearUltraWide: boolean;
  hasLidar: boolean;
  supports4kRearVideo: boolean;
  hasTrueToneFlash: boolean;
  hasProMotion: boolean;
  hasLargerFrameInspectionNote: boolean;
}

export interface IpadDetailSection {
  kicker: string;
  heading: string;
  intro: string;
  items: ReadonlyArray<string>;
}

export interface IpadFinalCtaSection {
  kicker: string;
  heading: string;
  body: string;
  bullets: ReadonlyArray<string>;
}

export interface IpadEnhancedSeoPocket extends RepairTypeSeoPocket {
  modelSlug: AliMobileEnhancedIpadModelSlug;
  modelName: string;
  repairType: AliMobileEnhancedIpadRepairType;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  schemaDescription: string;
  supportLabel?: string;
  modelSpecificNotes: IpadDetailSection;
  repairLimitations: IpadDetailSection;
  localService: IpadDetailSection;
  finalCta: IpadFinalCtaSection;
}
