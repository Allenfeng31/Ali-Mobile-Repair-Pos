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

export function getSamsungFoldableFamilyLabel(config: SamsungHardwareConfig): string {
  return config.deviceFamily === 'z-flip' ? 'Galaxy Z Flip' : 'Galaxy Z Fold';
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
