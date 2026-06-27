import { preserveRouteSegment } from '@/lib/inventoryUtils';
import type { SamsungHardwareConfig } from './types';

export interface SamsungHubLink {
  href: string;
  label: string;
}

export const SAMSUNG_QUOTE_ONLY_SCOPE =
  'Final scope and pricing follow technician inspection. This route remains quote-only.';

export const SAMSUNG_WATER_RESISTANCE_NOTE =
  'Opening and resealing the phone does not restore factory water resistance.';

export const SAMSUNG_FOLD_TESTING_NOTE =
  'Where relevant, the device is tested in both open and closed positions before and after repair.';

export const SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE =
  'Pre-repair and post-repair functional testing helps confirm the repair area and the final handover result.';

export const SAMSUNG_CATALOGUE_VARIANT_NOTE =
  'Displayed pricing and available variants follow the live repair catalogue for this route.';

export function getSamsungSeriesLabel(config: SamsungHardwareConfig): string {
  if (config.seriesFamily === 'galaxy-note') {
    return 'Galaxy Note';
  }

  if (config.seriesFamily === 'galaxy-s') {
    return config.deviceFamily === 'galaxy-s-ultra' ? 'Galaxy S Ultra' : 'Galaxy S';
  }

  if (config.deviceFamily === 'z-flip') return 'Galaxy Z Flip';
  return 'Galaxy Z Fold';
}

export function getSamsungDeviceFamilyLabel(config: SamsungHardwareConfig): string {
  return getSamsungSeriesLabel(config);
}

export function getSamsungVariantClassLabel(config: SamsungHardwareConfig): string {
  switch (config.variantClass) {
    case 'plus':
      return 'Plus';
    case 'ultra':
      return 'Ultra';
    case 'fe':
      return 'FE';
    case 'edge':
      return 'Edge';
    case 'active':
      return 'Active';
    default:
      return 'base';
  }
}

export function getSamsungDisplayFormLabel(config: SamsungHardwareConfig): string {
  switch (config.displayForm) {
    case 'curved':
      return 'curved';
    case 'flat':
      return 'flat';
    case 'foldable':
      return 'foldable';
    default:
      return 'display';
  }
}

export function getSamsungDisplayEdgeLabel(config: SamsungHardwareConfig): string {
  switch (config.displayEdgeClass) {
    case 'flat':
      return 'flat display edge';
    case 'curved':
      return 'curved display edge';
    default:
      return 'display edge';
  }
}

export function getSamsungBiometricLabel(config: SamsungHardwareConfig): string {
  switch (config.biometrics) {
    case 'front-home-fingerprint':
      return 'home-button fingerprint';
    case 'rear-fingerprint':
      return 'rear fingerprint';
    case 'side-fingerprint':
      return 'side fingerprint';
    case 'under-display-fingerprint':
      return 'under-display fingerprint';
    case 'none':
      return 'biometric';
    default:
      return 'biometric';
  }
}

export function getSamsungFrontCameraLabel(config: SamsungHardwareConfig): string {
  switch (config.frontCameraClass) {
    case 'single-bezel':
      return 'single front camera with bezel framing';
    case 'single-punch-hole':
      return 'single punch-hole front camera';
    case 'dual-front':
      return 'dual front camera';
    case 'inner-only':
      return 'inner selfie camera';
    case 'cover-and-inner':
      return 'cover and inner front cameras';
    default:
      return 'front camera';
  }
}

export function getSamsungRearCameraLabel(config: SamsungHardwareConfig): string {
  switch (config.rearCameraClass) {
    case 'single':
      return 'single rear camera';
    case 'dual':
      return 'dual rear camera';
    case 'triple':
      return 'triple rear camera';
    case 'quad':
      return 'quad rear camera';
    default:
      return 'rear camera system';
  }
}

export function getSamsungEnhancedHubLinks(config: SamsungHardwareConfig): SamsungHubLink[] {
  return [
    {
      href: `/repairs/phone/samsung/${preserveRouteSegment(config.modelSlug)}`,
      label: `View all ${config.modelName} repairs`,
    },
    {
      href: '/repairs/phone/samsung',
      label: 'View all Samsung phone repairs',
    },
    {
      href: '/repairs/phone',
      label: 'View all phone repairs',
    },
  ];
}
