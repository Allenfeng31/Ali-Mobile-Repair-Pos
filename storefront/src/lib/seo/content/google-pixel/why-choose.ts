import {
  BatteryCharging,
  ClipboardCheck,
  Search,
  ShieldCheck,
  Smartphone,
  Wrench,
} from 'lucide-react';
import type { WhyChooseConfig } from '../iphone/why-choose';
import type { GooglePixelHardwareConfig, AliMobileEnhancedGooglePixelRepairType } from './types';

export function getGooglePixelWhyChooseConfig(
  config: GooglePixelHardwareConfig,
  repairType: AliMobileEnhancedGooglePixelRepairType
): WhyChooseConfig {
  const { modelName } = config;

  return {
    kicker: 'Service Value',
    heading: `Why choose us for your ${modelName} repair?`,
    intro: 'We focus on clear diagnosis, practical repair options, and reliable testing before handover.',
    cards: [
      {
        title: 'Thorough Inspection',
        icon: Search,
        points: [
          'We inspect frame damage and internal component condition.',
          'We check for related faults before starting work.',
          'We test biometric sensors and cameras during diagnosis.',
        ],
      },
      {
        title: 'Clear Options',
        icon: ClipboardCheck,
        points: [
          'We explain the available repair paths for your specific fault.',
          'We quote based on the exact requirements of your device.',
          'We discuss risks upfront, especially for board-level or liquid damage.',
        ],
      },
      {
        title: 'Careful Assembly',
        icon: Wrench,
        points: [
          'We align panels, camera openings, and internal shields correctly.',
          'We route cables safely away from battery and pressure points.',
          'We use appropriate adhesives for a secure physical fit.',
        ],
      },
      {
        title: 'Post-Repair Testing',
        icon: ShieldCheck,
        points: [
          'We test display quality, touch response, and charging after assembly.',
          'We verify basic network and Wi-Fi functionality where possible.',
          'We test cameras and microphones before returning your device.',
        ],
      },
    ],
  };
}
