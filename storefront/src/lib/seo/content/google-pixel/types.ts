import type { RepairTypeSeoPocket } from '../iphone';

export type { RepairTypeSeoPocket } from '../iphone';

export type AliMobileEnhancedGooglePixelRepairType =
  | 'screen-replacement'
  | 'battery-replacement'
  | 'charging-port-replacement'
  | 'back-glass-replacement'
  | 'front-camera-replacement'
  | 'back-camera-replacement'
  | 'logic-board-repair';

export type AliMobileEnhancedGooglePixelModelSlug =
  | 'pixel-8-pro';

export interface GooglePixelHardwareConfig {
  modelSlug: AliMobileEnhancedGooglePixelModelSlug;
  modelName: string;
  modelCodes?: ReadonlyArray<string>;
  supportedRepairTypes: ReadonlyArray<AliMobileEnhancedGooglePixelRepairType>;
}
