import { slugify } from '@/lib/inventoryUtils';
import type {
  AliMobileEnhancedSamsungModelSlug,
  AliMobileEnhancedSamsungRepairType,
  SamsungHardwareConfig,
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

export const GALAXY_Z_FOLD_5_REPAIR_TYPES = SAMSUNG_FOLDABLE_REPAIR_TYPES;

function defineSamsungHardwareConfig(config: SamsungHardwareConfig): SamsungHardwareConfig {
  return config;
}

function defineSamsungFoldConfig(
  modelSlug: AliMobileEnhancedSamsungModelSlug,
  modelName: string
): SamsungHardwareConfig {
  return defineSamsungHardwareConfig({
    modelSlug,
    modelName,
    deviceFamily: 'z-fold',
    supportedRepairTypes: SAMSUNG_FOLDABLE_REPAIR_TYPES,
    hasInnerFoldableDisplay: true,
    hasOuterCoverDisplay: true,
    biometrics: 'side-fingerprint',
    chargingPortType: 'usb-c',
    supportsWirelessCharging: true,
    rearCameraClass: 'triple',
    frontCameraClass: 'cover-and-inner',
    rearConstruction: 'rear-glass-and-hinge-housing',
  });
}

function defineSamsungFlipConfig(
  modelSlug: AliMobileEnhancedSamsungModelSlug,
  modelName: string
): SamsungHardwareConfig {
  return defineSamsungHardwareConfig({
    modelSlug,
    modelName,
    deviceFamily: 'z-flip',
    supportedRepairTypes: SAMSUNG_FOLDABLE_REPAIR_TYPES,
    hasInnerFoldableDisplay: true,
    hasOuterCoverDisplay: true,
    biometrics: 'side-fingerprint',
    chargingPortType: 'usb-c',
    supportsWirelessCharging: true,
    rearCameraClass: 'dual',
    frontCameraClass: 'inner-only',
    rearConstruction: 'rear-glass-and-hinge-housing',
  });
}

export const SAMSUNG_HARDWARE_CONFIG: Record<
  AliMobileEnhancedSamsungModelSlug,
  SamsungHardwareConfig
> = {
  'galaxy-z-flip': defineSamsungFlipConfig('galaxy-z-flip', 'Galaxy Z Flip'),
  'galaxy-z-flip-3': defineSamsungFlipConfig('galaxy-z-flip-3', 'Galaxy Z Flip 3'),
  'galaxy-z-flip-4': defineSamsungFlipConfig('galaxy-z-flip-4', 'Galaxy Z Flip 4'),
  'galaxy-z-flip-5': defineSamsungFlipConfig('galaxy-z-flip-5', 'Galaxy Z Flip 5'),
  'galaxy-z-flip-6': defineSamsungFlipConfig('galaxy-z-flip-6', 'Galaxy Z Flip 6'),
  'galaxy-z-flip-7': defineSamsungFlipConfig('galaxy-z-flip-7', 'Galaxy Z Flip 7'),
  'galaxy-z-fold': defineSamsungFoldConfig('galaxy-z-fold', 'Galaxy Z Fold'),
  'galaxy-z-fold-2': defineSamsungFoldConfig('galaxy-z-fold-2', 'Galaxy Z Fold 2'),
  'galaxy-z-fold-3': defineSamsungFoldConfig('galaxy-z-fold-3', 'Galaxy Z Fold 3'),
  'galaxy-z-fold-4': defineSamsungFoldConfig('galaxy-z-fold-4', 'Galaxy Z Fold 4'),
  'galaxy-z-fold-5': defineSamsungFoldConfig('galaxy-z-fold-5', 'Galaxy Z Fold 5'),
  'galaxy-z-fold-6': defineSamsungFoldConfig('galaxy-z-fold-6', 'Galaxy Z Fold 6'),
  'galaxy-z-fold-7': defineSamsungFoldConfig('galaxy-z-fold-7', 'Galaxy Z Fold 7'),
};

export function getSamsungHardwareConfig(modelSlug: string): SamsungHardwareConfig | null {
  const normalized = slugify(modelSlug) as AliMobileEnhancedSamsungModelSlug;
  return SAMSUNG_HARDWARE_CONFIG[normalized] ?? null;
}

export function getSamsungHardwareConfigByModelName(modelName: string): SamsungHardwareConfig | null {
  const normalized = slugify(modelName);
  return Object.values(SAMSUNG_HARDWARE_CONFIG).find((config) => slugify(config.modelName) === normalized) ?? null;
}
