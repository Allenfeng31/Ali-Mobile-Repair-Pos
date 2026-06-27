import type { GooglePixelHardwareConfig, AliMobileEnhancedGooglePixelModelSlug } from './types';

export const GOOGLE_PIXEL_HARDWARE_CONFIG: Record<
  AliMobileEnhancedGooglePixelModelSlug,
  GooglePixelHardwareConfig
> = {
  'pixel-8-pro': {
    modelSlug: 'pixel-8-pro',
    modelName: 'Google Pixel 8 Pro',
    modelCodes: ['GC3VE'],
    supportedRepairTypes: [
      'screen-replacement',
      'battery-replacement',
      'charging-port-replacement',
      'back-glass-replacement',
      'front-camera-replacement',
      'back-camera-replacement',
      'logic-board-repair',
    ],
  },
};

export function getGooglePixelHardwareConfig(
  modelSlug: string
): GooglePixelHardwareConfig | null {
  return GOOGLE_PIXEL_HARDWARE_CONFIG[modelSlug as AliMobileEnhancedGooglePixelModelSlug] ?? null;
}

export function getGooglePixelHardwareConfigByModelName(
  modelName: string
): GooglePixelHardwareConfig | null {
  const name = modelName.toLowerCase();
  return Object.values(GOOGLE_PIXEL_HARDWARE_CONFIG).find(
    (config) => config.modelName.toLowerCase() === name || name.includes(config.modelSlug.replace(/-/g, ' ')) || config.modelSlug.replace(/-/g, ' ').includes(name)
  ) ?? null;
}
