import {
  ClipboardCheck,
  MapPin,
  PhoneCall,
  Search,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { WhyChooseConfig } from '../iphone/why-choose';
import type { AliMobileEnhancedIpadRepairType, IpadHardwareConfig } from './types';
import {
  ALI_MOBILE_IPAD_BUSINESS,
  getIpadBiometricTestLabel,
  getIpadConnectorLabel,
  getIpadRepairLabel,
} from './shared';

export const IPAD_WHY_CHOOSE_SHARED_HIGHLIGHTS: Array<{ icon: LucideIcon; text: string }> = [
  { icon: MapPin, text: 'Inside Ringwood Square' },
  { icon: Search, text: 'Exact iPad model confirmation' },
  { icon: ClipboardCheck, text: 'Clear repair-scope explanation' },
  { icon: ShieldCheck, text: 'Transparent quote from the existing system' },
  { icon: Wrench, text: 'Model-aware post-repair testing' },
  { icon: PhoneCall, text: `Call ${ALI_MOBILE_IPAD_BUSINESS.phone}` },
];

export function getIpadWhyChooseConfig(
  config: IpadHardwareConfig,
  repairType: AliMobileEnhancedIpadRepairType
): WhyChooseConfig {
  const repairLabel = getIpadRepairLabel(repairType);
  const connectorLabel = getIpadConnectorLabel(config);
  const biometricLabel = getIpadBiometricTestLabel(config);

  const heading = `Why choose Ali Mobile for ${config.modelName} ${repairLabel.toLowerCase()}`;

  if (repairType === 'screen-replacement') {
    return {
      kicker: 'Ali Mobile support',
      heading,
      intro:
        'We confirm the exact iPad screen fault, explain the practical repair scope, and retest the main functions linked to the display area before handover.',
      cards: [
        {
          title: 'Exact model and screen assessment',
          icon: Search,
          points: [
            `We confirm the exact ${config.modelName} screen path before quoting.`,
            'Glass, touch, display, frame condition, and screen lifting are checked together rather than assumed to be one simple issue.',
          ],
        },
        {
          title: 'Scope explained before fitting',
          icon: ClipboardCheck,
          points: [
            'We explain whether frame condition, battery condition, or corner damage may affect the repair path.',
            'We do not assume glass-only service before diagnosis confirms what the screen assembly needs.',
          ],
        },
        {
          title: 'Model-aware post-repair checks',
          icon: Wrench,
          points: [
            `After repair we retest full-screen touch, display output, camera function, ${biometricLabel.toLowerCase()}, charging, and edge fit.`,
          ],
        },
      ],
    };
  }

  if (repairType === 'battery-replacement') {
    return {
      kicker: 'Ali Mobile support',
      heading,
      intro:
        'Battery complaints can overlap with charging, accessory, or broader power faults, so we inspect the charging path before confirming that a battery replacement is the right step.',
      cards: [
        {
          title: 'Battery symptoms in context',
          icon: Search,
          points: [
            'Fast drain, shutdowns, heat, swelling, and weak standby time are checked together before repair is approved.',
            'We do not assume the battery is the only cause until charging-path checks are complete.',
          ],
        },
        {
          title: 'Safe opening and handling',
          icon: Wrench,
          points: [
            'Display lift, frame condition, and existing impact damage are checked before opening the iPad.',
            config.hasLargerFrameInspectionNote
              ? 'The larger 13-inch frame and display edges receive extra inspection before the work begins.'
              : 'We inspect the areas most likely to show swelling pressure before the work begins.',
          ],
        },
        {
          title: 'Post-repair power checks',
          icon: ClipboardCheck,
          points: [
            `After repair we retest ${connectorLabel}, startup stability, and the main functions around ${biometricLabel.toLowerCase()}.`,
          ],
        },
      ],
    };
  }

  if (repairType === 'charging-port-replacement') {
    return {
      kicker: 'Ali Mobile support',
      heading,
      intro:
        'Charging faults are checked carefully because the cable, charger, battery, connector, and broader power system can overlap.',
      cards: [
        {
          title: 'Known-good accessory testing',
          icon: Search,
          points: [
            `We test ${connectorLabel} behavior with known-good accessories before we quote a connector replacement.`,
          ],
        },
        {
          title: 'Debris, damage, and power-path checks',
          icon: ClipboardCheck,
          points: [
            'We inspect for lint, visible connector wear, corrosion, and impact before confirming the repair path.',
            'Battery and broader power causes are still checked so we do not assume the port is always the fault.',
          ],
        },
        {
          title: 'Relevant post-repair testing',
          icon: Wrench,
          points: [
            'After repair we retest charging response, cable fit, and data or accessory connection where applicable.',
          ],
        },
      ],
    };
  }

  if (repairType === 'front-camera-replacement') {
    return {
      kicker: 'Ali Mobile support',
      heading,
      intro:
        'Front camera problems can overlap with permissions, app support, settings, and nearby hardware, so we confirm the exact iPad camera path before replacing parts.',
      cards: [
        {
          title: 'Camera preview diagnosis',
          icon: Search,
          points: [
            'We check black preview, blur, app switching, video-call use, and abnormal image behavior before repair is confirmed.',
          ],
        },
        {
          title: 'Model-specific front-area care',
          icon: Wrench,
          points: [
            `We inspect the front-camera area, related openings, and ${biometricLabel.toLowerCase()} during diagnosis and handover testing.`,
            config.biometricType === 'face-id'
              ? 'Face ID is tested separately and is never assumed as an automatic result of camera repair.'
              : 'Biometric behavior is checked separately because it is not automatically restored by a front-camera replacement.',
          ],
        },
        {
          title: 'Clear explanation before pickup',
          icon: ClipboardCheck,
          points: [
            'We explain what was confirmed as camera-related, what was software-related, and what still needs separate attention before the iPad leaves the bench.',
          ],
        },
      ],
    };
  }

  return {
    kicker: 'Ali Mobile support',
    heading,
    intro:
      'Rear camera faults can come from the module, the lens area, impact around the housing, or another imaging path, so we confirm the cause before quoting.',
    cards: [
      {
        title: 'Rear-camera fault confirmation',
        icon: Search,
        points: [
          'We test preview, focus, blur, switching behavior, and visible damage before replacing the camera module.',
        ],
      },
      {
        title: 'Camera-area inspection first',
        icon: Wrench,
        points: [
          'Lens-area damage, housing impact, and any LiDAR or second-camera overlap are checked separately from the camera module itself.',
          config.hasLidar
            ? 'LiDAR is tested separately and is not assumed to be fixed through rear-camera replacement.'
            : 'External lens-area damage is checked before we assume the camera module is the fault.',
        ],
      },
      {
        title: 'Practical post-repair checks',
        icon: ClipboardCheck,
        points: [
          'After repair we retest the repaired camera path, image clarity, and related switching behavior before handover.',
        ],
      },
    ],
  };
}
