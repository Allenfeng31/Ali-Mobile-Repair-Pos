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
  | 'pixel-10'
  | 'pixel-10-pro'
  | 'pixel-10-pro-fold'
  | 'pixel-10-pro-xl'
  | 'pixel-3'
  | 'pixel-3-xl'
  | 'pixel-3a'
  | 'pixel-3a-xl'
  | 'pixel-4'
  | 'pixel-4-xl'
  | 'pixel-4a'
  | 'pixel-4a-5g'
  | 'pixel-5'
  | 'pixel-5a'
  | 'pixel-6'
  | 'pixel-6-pro'
  | 'pixel-6a'
  | 'pixel-7'
  | 'pixel-7-pro'
  | 'pixel-7a'
  | 'pixel-8'
  | 'pixel-8-pro'
  | 'pixel-8a'
  | 'pixel-9'
  | 'pixel-9-pro'
  | 'pixel-9-pro-fold'
  | 'pixel-9-pro-xl';

export interface GooglePixelHardwareConfig {
  modelSlug: AliMobileEnhancedGooglePixelModelSlug;
  modelName: string;
  modelCodes?: ReadonlyArray<string>;
  displayForm?: 'slab' | 'foldable';
  fingerprintType?: 'under-display' | 'rear-mounted' | 'side-mounted' | 'none';
  faceUnlockType?: 'infrared' | 'camera' | 'none';
  rearPanelType?: 'glass' | 'plastic' | 'composite';
  isFoldable?: boolean;
  hasInnerDisplay?: boolean;
  hasCoverDisplay?: boolean;
  supportedRepairTypes: ReadonlyArray<AliMobileEnhancedGooglePixelRepairType>;
}
