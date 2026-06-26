import type { RepairTypeSeoPocket } from '../iphone';

export type { RepairTypeSeoPocket } from '../iphone';

export type AliMobileEnhancedSamsungRepairType =
  | 'screen-replacement'
  | 'battery-replacement'
  | 'charging-port-replacement'
  | 'back-housing-replacement'
  | 'front-camera-replacement'
  | 'back-camera-replacement'
  | 'logic-board-repair';

export type AliMobileEnhancedSamsungModelSlug =
  | 'galaxy-s8'
  | 'galaxy-s8-plus'
  | 'galaxy-s9'
  | 'galaxy-s9-plus'
  | 'galaxy-s10'
  | 'galaxy-s10-plus'
  | 'galaxy-s10e'
  | 'galaxy-s20'
  | 'galaxy-s20-plus'
  | 'galaxy-s20-fe'
  | 'galaxy-s20-ultra'
  | 'galaxy-s21'
  | 'galaxy-s21-plus'
  | 'galaxy-s21-fe'
  | 'galaxy-s21-ultra'
  | 'galaxy-s22'
  | 'galaxy-s22-plus'
  | 'galaxy-s22-ultra'
  | 'galaxy-s23'
  | 'galaxy-s23-plus'
  | 'galaxy-s23-fe'
  | 'galaxy-s23-ultra'
  | 'galaxy-s24'
  | 'galaxy-s24-plus'
  | 'galaxy-s24-fe'
  | 'galaxy-s24-ultra'
  | 'galaxy-s25'
  | 'galaxy-s25-plus'
  | 'galaxy-s25-ultra'
  | 'galaxy-s26'
  | 'galaxy-s26-plus'
  | 'galaxy-s26-ultra'
  | 'galaxy-z-flip'
  | 'galaxy-z-flip-3'
  | 'galaxy-z-flip-4'
  | 'galaxy-z-flip-5'
  | 'galaxy-z-flip-6'
  | 'galaxy-z-flip-7'
  | 'galaxy-z-fold'
  | 'galaxy-z-fold-2'
  | 'galaxy-z-fold-3'
  | 'galaxy-z-fold-4'
  | 'galaxy-z-fold-5'
  | 'galaxy-z-fold-6'
  | 'galaxy-z-fold-7'
  | 'galaxy-s23-ultra';

export type SamsungSeriesFamily = 'galaxy-z' | 'galaxy-s';
export type SamsungDeviceFamily = 'z-fold' | 'z-flip' | 'galaxy-s' | 'galaxy-s-ultra';
export type SamsungVariantClass = 'base' | 'plus' | 'ultra' | 'fe' | 'edge' | 'active' | 'other';
export type SamsungDisplayForm = 'flat' | 'curved' | 'foldable' | 'unknown';
export type SamsungBiometricClass =
  | 'front-home-fingerprint'
  | 'rear-fingerprint'
  | 'side-fingerprint'
  | 'under-display-fingerprint'
  | 'none'
  | 'unknown';
export type SamsungChargingPortType = 'micro-usb' | 'usb-c' | 'unknown';
export type SamsungRearCameraClass = 'single' | 'dual' | 'triple' | 'quad' | 'unknown';
export type SamsungFrontCameraClass = 'cover-and-inner' | 'inner-only' | 'single-punch-hole' | 'single-bezel' | 'dual-front' | 'unknown';

export type SamsungDisplayEdgeClass = 'flat' | 'curved' | 'unknown';

export type SamsungSPenCapability =
  | 'none'
  | 'supported-external'
  | 'integrated-slot'
  | 'unknown';

export interface SamsungHardwareConfig {
  modelSlug: AliMobileEnhancedSamsungModelSlug;
  modelName: string;
  seriesFamily: SamsungSeriesFamily;
  deviceFamily: SamsungDeviceFamily;
  generation: number;
  variantClass: SamsungVariantClass;
  displayForm: SamsungDisplayForm;
  displayEdgeClass: SamsungDisplayEdgeClass;
  supportedRepairTypes: ReadonlyArray<AliMobileEnhancedSamsungRepairType>;
  hasInnerFoldableDisplay: boolean;
  hasOuterCoverDisplay: boolean;
  biometrics: SamsungBiometricClass;
  chargingPortType: SamsungChargingPortType;
  supportsWirelessCharging: boolean;
  rearCameraClass: SamsungRearCameraClass;
  frontCameraClass: SamsungFrontCameraClass;
  sPenCapability: SamsungSPenCapability;
}
