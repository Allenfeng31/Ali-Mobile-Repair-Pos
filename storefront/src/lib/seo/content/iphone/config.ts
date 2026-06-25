import { slugify } from '@/lib/inventoryUtils';
import type { AliMobileEnhancedIphoneModelSlug, AliMobileEnhancedIphoneRepairType } from './types';

export type IphoneDisplayClass = 'lcd' | 'oled' | 'unknown';
export type IphoneChargingPortType = 'lightning' | 'usb-c' | 'unknown';
export type IphoneBiometricClass = 'face-id' | 'touch-id' | 'unknown';
export type IphoneRearCameraClass =
  | 'single'
  | 'dual'
  | 'triple'
  | 'unknown';

export interface IphoneHardwareConfig {
  modelSlug: AliMobileEnhancedIphoneModelSlug;
  modelName: string;
  supportedRepairTypes: ReadonlyArray<AliMobileEnhancedIphoneRepairType>;
  displayType: IphoneDisplayClass;
  hasDynamicIsland: boolean | 'unknown';
  biometrics: IphoneBiometricClass;
  chargingPortType: IphoneChargingPortType;
  hasMagSafe: boolean | 'unknown';
  rearCameraClass: IphoneRearCameraClass;
  supportsBackGlassContent: boolean;
}

export const BATCH1_SUPPORTED_IPHONE_REPAIR_TYPES = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'back-glass-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
] as const satisfies ReadonlyArray<AliMobileEnhancedIphoneRepairType>;

function defineIphoneHardwareConfig(
  config: Omit<IphoneHardwareConfig, 'supportedRepairTypes'> & {
    supportedRepairTypes?: ReadonlyArray<AliMobileEnhancedIphoneRepairType>;
  }
): IphoneHardwareConfig {
  return {
    ...config,
    supportedRepairTypes: config.supportedRepairTypes ?? BATCH1_SUPPORTED_IPHONE_REPAIR_TYPES,
  };
}

export const IPHONE_BATCH1_HARDWARE_CONFIG: Record<AliMobileEnhancedIphoneModelSlug, IphoneHardwareConfig> = {
  'iphone-17': defineIphoneHardwareConfig({
    modelSlug: 'iphone-17',
    modelName: 'iPhone 17',
    displayType: 'unknown',
    hasDynamicIsland: 'unknown',
    biometrics: 'unknown',
    chargingPortType: 'unknown',
    hasMagSafe: 'unknown',
    rearCameraClass: 'unknown',
    supportsBackGlassContent: true,
  }),
  'iphone-17-pro': defineIphoneHardwareConfig({
    modelSlug: 'iphone-17-pro',
    modelName: 'iPhone 17 Pro',
    displayType: 'unknown',
    hasDynamicIsland: 'unknown',
    biometrics: 'unknown',
    chargingPortType: 'unknown',
    hasMagSafe: 'unknown',
    rearCameraClass: 'unknown',
    supportsBackGlassContent: true,
  }),
  'iphone-17-pro-max': defineIphoneHardwareConfig({
    modelSlug: 'iphone-17-pro-max',
    modelName: 'iPhone 17 Pro Max',
    displayType: 'unknown',
    hasDynamicIsland: 'unknown',
    biometrics: 'unknown',
    chargingPortType: 'unknown',
    hasMagSafe: 'unknown',
    rearCameraClass: 'unknown',
    supportsBackGlassContent: true,
  }),
  'iphone-17-air': defineIphoneHardwareConfig({
    modelSlug: 'iphone-17-air',
    modelName: 'iPhone 17 Air',
    displayType: 'unknown',
    hasDynamicIsland: 'unknown',
    biometrics: 'unknown',
    chargingPortType: 'unknown',
    hasMagSafe: 'unknown',
    rearCameraClass: 'unknown',
    supportsBackGlassContent: true,
  }),
  'iphone-17e': defineIphoneHardwareConfig({
    modelSlug: 'iphone-17e',
    modelName: 'iPhone 17e',
    displayType: 'unknown',
    hasDynamicIsland: 'unknown',
    biometrics: 'unknown',
    chargingPortType: 'unknown',
    hasMagSafe: 'unknown',
    rearCameraClass: 'unknown',
    supportsBackGlassContent: true,
  }),
  'iphone-16': defineIphoneHardwareConfig({
    modelSlug: 'iphone-16',
    modelName: 'iPhone 16',
    displayType: 'oled',
    hasDynamicIsland: true,
    biometrics: 'face-id',
    chargingPortType: 'usb-c',
    hasMagSafe: true,
    rearCameraClass: 'dual',
    supportsBackGlassContent: true,
  }),
  'iphone-16-plus': defineIphoneHardwareConfig({
    modelSlug: 'iphone-16-plus',
    modelName: 'iPhone 16 Plus',
    displayType: 'oled',
    hasDynamicIsland: true,
    biometrics: 'face-id',
    chargingPortType: 'usb-c',
    hasMagSafe: true,
    rearCameraClass: 'dual',
    supportsBackGlassContent: true,
  }),
  'iphone-16-pro': defineIphoneHardwareConfig({
    modelSlug: 'iphone-16-pro',
    modelName: 'iPhone 16 Pro',
    displayType: 'oled',
    hasDynamicIsland: true,
    biometrics: 'face-id',
    chargingPortType: 'usb-c',
    hasMagSafe: true,
    rearCameraClass: 'triple',
    supportsBackGlassContent: true,
  }),
  'iphone-16-pro-max': defineIphoneHardwareConfig({
    modelSlug: 'iphone-16-pro-max',
    modelName: 'iPhone 16 Pro Max',
    displayType: 'oled',
    hasDynamicIsland: true,
    biometrics: 'face-id',
    chargingPortType: 'usb-c',
    hasMagSafe: true,
    rearCameraClass: 'triple',
    supportsBackGlassContent: true,
  }),
  'iphone-16e': defineIphoneHardwareConfig({
    modelSlug: 'iphone-16e',
    modelName: 'iPhone 16e',
    displayType: 'unknown',
    hasDynamicIsland: 'unknown',
    biometrics: 'unknown',
    chargingPortType: 'unknown',
    hasMagSafe: 'unknown',
    rearCameraClass: 'unknown',
    supportsBackGlassContent: true,
  }),
  'iphone-15': defineIphoneHardwareConfig({
    modelSlug: 'iphone-15',
    modelName: 'iPhone 15',
    displayType: 'oled',
    hasDynamicIsland: true,
    biometrics: 'face-id',
    chargingPortType: 'usb-c',
    hasMagSafe: true,
    rearCameraClass: 'dual',
    supportsBackGlassContent: true,
  }),
  'iphone-15-plus': defineIphoneHardwareConfig({
    modelSlug: 'iphone-15-plus',
    modelName: 'iPhone 15 Plus',
    displayType: 'oled',
    hasDynamicIsland: true,
    biometrics: 'face-id',
    chargingPortType: 'usb-c',
    hasMagSafe: true,
    rearCameraClass: 'dual',
    supportsBackGlassContent: true,
  }),
  'iphone-15-pro': defineIphoneHardwareConfig({
    modelSlug: 'iphone-15-pro',
    modelName: 'iPhone 15 Pro',
    displayType: 'oled',
    hasDynamicIsland: true,
    biometrics: 'face-id',
    chargingPortType: 'usb-c',
    hasMagSafe: true,
    rearCameraClass: 'triple',
    supportsBackGlassContent: true,
  }),
  'iphone-15-pro-max': defineIphoneHardwareConfig({
    modelSlug: 'iphone-15-pro-max',
    modelName: 'iPhone 15 Pro Max',
    displayType: 'oled',
    hasDynamicIsland: true,
    biometrics: 'face-id',
    chargingPortType: 'usb-c',
    hasMagSafe: true,
    rearCameraClass: 'triple',
    supportsBackGlassContent: true,
  }),
  'iphone-14': defineIphoneHardwareConfig({
    modelSlug: 'iphone-14',
    modelName: 'iPhone 14',
    displayType: 'oled',
    hasDynamicIsland: false,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'dual',
    supportsBackGlassContent: true,
  }),
  'iphone-14-plus': defineIphoneHardwareConfig({
    modelSlug: 'iphone-14-plus',
    modelName: 'iPhone 14 Plus',
    displayType: 'oled',
    hasDynamicIsland: false,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'dual',
    supportsBackGlassContent: true,
  }),
  'iphone-14-pro': defineIphoneHardwareConfig({
    modelSlug: 'iphone-14-pro',
    modelName: 'iPhone 14 Pro',
    displayType: 'oled',
    hasDynamicIsland: true,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'triple',
    supportsBackGlassContent: true,
  }),
  'iphone-14-pro-max': defineIphoneHardwareConfig({
    modelSlug: 'iphone-14-pro-max',
    modelName: 'iPhone 14 Pro Max',
    displayType: 'oled',
    hasDynamicIsland: true,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'triple',
    supportsBackGlassContent: true,
  }),
  'iphone-13-mini': defineIphoneHardwareConfig({
    modelSlug: 'iphone-13-mini',
    modelName: 'iPhone 13 mini',
    displayType: 'oled',
    hasDynamicIsland: false,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'dual',
    supportsBackGlassContent: true,
  }),
  'iphone-13': defineIphoneHardwareConfig({
    modelSlug: 'iphone-13',
    modelName: 'iPhone 13',
    displayType: 'oled',
    hasDynamicIsland: false,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'dual',
    supportsBackGlassContent: true,
  }),
  'iphone-13-pro': defineIphoneHardwareConfig({
    modelSlug: 'iphone-13-pro',
    modelName: 'iPhone 13 Pro',
    displayType: 'oled',
    hasDynamicIsland: false,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'triple',
    supportsBackGlassContent: true,
  }),
  'iphone-13-pro-max': defineIphoneHardwareConfig({
    modelSlug: 'iphone-13-pro-max',
    modelName: 'iPhone 13 Pro Max',
    displayType: 'oled',
    hasDynamicIsland: false,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'triple',
    supportsBackGlassContent: true,
  }),
  'iphone-12-mini': defineIphoneHardwareConfig({
    modelSlug: 'iphone-12-mini',
    modelName: 'iPhone 12 mini',
    displayType: 'oled',
    hasDynamicIsland: false,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'dual',
    supportsBackGlassContent: true,
  }),
  'iphone-12': defineIphoneHardwareConfig({
    modelSlug: 'iphone-12',
    modelName: 'iPhone 12',
    displayType: 'oled',
    hasDynamicIsland: false,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'dual',
    supportsBackGlassContent: true,
  }),
  'iphone-12-pro': defineIphoneHardwareConfig({
    modelSlug: 'iphone-12-pro',
    modelName: 'iPhone 12 Pro',
    displayType: 'oled',
    hasDynamicIsland: false,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'triple',
    supportsBackGlassContent: true,
  }),
  'iphone-12-pro-max': defineIphoneHardwareConfig({
    modelSlug: 'iphone-12-pro-max',
    modelName: 'iPhone 12 Pro Max',
    displayType: 'oled',
    hasDynamicIsland: false,
    biometrics: 'face-id',
    chargingPortType: 'lightning',
    hasMagSafe: true,
    rearCameraClass: 'triple',
    supportsBackGlassContent: true,
  }),
};

export function getIphoneHardwareConfig(modelSlug: string): IphoneHardwareConfig | null {
  const normalizedModelSlug = slugify(modelSlug) as AliMobileEnhancedIphoneModelSlug;

  return IPHONE_BATCH1_HARDWARE_CONFIG[normalizedModelSlug] ?? null;
}

export function getIphoneHardwareConfigByModelName(modelName: string): IphoneHardwareConfig | null {
  return Object.values(IPHONE_BATCH1_HARDWARE_CONFIG).find((config) => config.modelName === modelName) ?? null;
}
