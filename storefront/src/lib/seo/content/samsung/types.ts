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
  | 'galaxy-z-fold-7';

export type SamsungDeviceFamily = 'z-fold' | 'z-flip';
export type SamsungBiometricClass = 'side-fingerprint' | 'unknown';
export type SamsungChargingPortType = 'usb-c' | 'unknown';
export type SamsungRearCameraClass = 'single' | 'dual' | 'triple' | 'unknown';
export type SamsungFrontCameraClass = 'cover-and-inner' | 'inner-only' | 'unknown';
export type SamsungRearConstructionClass = 'rear-glass-and-hinge-housing';

export interface SamsungHardwareConfig {
  modelSlug: AliMobileEnhancedSamsungModelSlug;
  modelName: string;
  deviceFamily: SamsungDeviceFamily;
  supportedRepairTypes: ReadonlyArray<AliMobileEnhancedSamsungRepairType>;
  hasInnerFoldableDisplay: boolean;
  hasOuterCoverDisplay: boolean;
  biometrics: SamsungBiometricClass;
  chargingPortType: SamsungChargingPortType;
  supportsWirelessCharging: boolean | 'unknown';
  rearCameraClass: SamsungRearCameraClass;
  frontCameraClass: SamsungFrontCameraClass;
  rearConstruction: SamsungRearConstructionClass;
}
