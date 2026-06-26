import {
  BatteryCharging,
  ClipboardCheck,
  Eye,
  FoldHorizontal,
  Search,
  ShieldCheck,
  Smartphone,
  Usb,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { WhyChooseConfig } from '../iphone/why-choose';
import { getSamsungHardwareConfigByModelName } from './config';
import type { AliMobileEnhancedSamsungRepairType } from './types';

export interface SamsungWhyChooseHighlight {
  icon: LucideIcon;
  text: string;
}

export const SAMSUNG_WHY_CHOOSE_SHARED_HIGHLIGHTS: SamsungWhyChooseHighlight[] = [
  { icon: FoldHorizontal, text: 'Two-display diagnosis where relevant' },
  { icon: Search, text: 'Protector, screen, and hinge faults separated carefully' },
  { icon: ClipboardCheck, text: 'Quote-only scope confirmed before work' },
  { icon: Smartphone, text: 'Open-and-closed testing where relevant' },
  { icon: ShieldCheck, text: 'Careful foldable-device handling' },
  { icon: Wrench, text: 'Seal limitations explained clearly' },
];

export function getSamsungWhyChooseContent(
  modelName: string
): Record<AliMobileEnhancedSamsungRepairType, WhyChooseConfig> {
  const hardwareConfig = getSamsungHardwareConfigByModelName(modelName);
  const isFlip = hardwareConfig?.deviceFamily === 'z-flip';
  const frontCameraIsInnerOnly = hardwareConfig?.frontCameraClass === 'inner-only';

  return {
    'screen-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${modelName} screen replacement`,
      intro:
        isFlip
          ? 'Flip-screen faults need careful separation between the primary inner folding display, the smaller cover display, the protector, and hinge or frame findings before any quote is confirmed.'
          : 'Foldable screen faults need careful separation between the inner display, outer cover display, the inner protector, and hinge-related findings before any quote is confirmed.',
      cards: [
        {
          title: isFlip ? 'Main versus cover-display diagnosis' : 'Two-display diagnosis first',
          icon: FoldHorizontal,
          points: [
            isFlip
              ? 'We separate faults on the primary inner folding screen from faults on the smaller cover display before recommending parts.'
              : 'We separate inner foldable-display faults from outer cover-display faults before recommending parts.',
            'One screen replacement does not automatically cover the other display.',
          ],
        },
        {
          title: isFlip ? 'Protector, crease, and hinge context' : 'Protector and hinge context',
          icon: Search,
          points: [
            'We inspect the inner protector, crease area, hinge feel, and surrounding impact before confirming scope.',
            'We do not treat every visible crease as automatic display failure.',
          ],
        },
        {
          title: 'Transparent quote-only scope',
          icon: ClipboardCheck,
          points: [
            'The route stays quote-only until a technician confirms whether the issue is inner-display, cover-display, protector, or hinge-related.',
          ],
        },
      ],
    },
    'battery-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${modelName} battery replacement`,
      intro:
        'Battery complaints on a foldable phone can overlap with charging-path and structural symptoms, so we diagnose first and quote only after the power path is clear.',
      cards: [
        {
          title: 'Battery symptoms in context',
          icon: BatteryCharging,
          points: [
            'We review rapid drain, shutdowns, unstable charge percentage, heat, and swelling before assuming the battery is the only cause.',
            'Swelling is checked for pressure on the rear panel and device structure.',
          ],
        },
        {
          title: 'Charging-path separation',
          icon: Usb,
          points: [
            'USB-C charging and wireless charging behaviour are checked so battery work is not quoted on the wrong fault path.',
          ],
        },
        {
          title: 'Open-and-closed validation',
          icon: FoldHorizontal,
          points: [
            'Where relevant, we test stability in open and closed positions before handover.',
          ],
        },
      ],
    },
    'charging-port-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${modelName} charging port replacement`,
      intro:
        'USB-C faults are inspected carefully because debris, cable issues, battery symptoms, and board-level charging faults can overlap on the same phone.',
      cards: [
        {
          title: 'USB-C inspection first',
          icon: Usb,
          points: [
            'We inspect cable fit, debris, contamination, and visible USB-C wear before assuming replacement is needed.',
          ],
        },
        {
          title: 'Charging-path diagnosis',
          icon: Search,
          points: [
            'Battery, charging, and board-level symptoms are separated before the final quote is confirmed.',
          ],
        },
        {
          title: 'Function retesting before handover',
          icon: ClipboardCheck,
          points: [
            'Wired charging and related connection behaviour are retested before pickup.',
          ],
        },
      ],
    },
    'back-housing-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${modelName} back housing replacement`,
      intro:
        'Rear housing work on a foldable phone can overlap with hinge-enclosure damage, camera-area impact, and wireless-charging concerns, so the practical scope is checked before quoting.',
      cards: [
        {
          title: 'Rear housing and frame review',
          icon: Smartphone,
          points: [
            'We inspect rear-panel damage, structural fit, and frame distortion before confirming housing work.',
          ],
        },
        {
          title: 'Hinge and camera-area separation',
          icon: Search,
          points: [
            'Hinge enclosure damage and camera-area impact are checked so housing work is not quoted as if it solves every related issue.',
          ],
        },
        {
          title: 'Transparent limitations',
          icon: ClipboardCheck,
          points: [
            'We explain that hinge repair is separate when needed and that factory water resistance is not restored after opening.',
          ],
        },
      ],
    },
    'front-camera-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${modelName} front camera replacement`,
      intro:
        frontCameraIsInnerOnly
          ? 'This model uses a focused inner selfie-camera path for front-camera work, so we verify that path first and only then confirm the quote-only repair scope.'
          : 'This model has more than one front-facing camera path, so we identify the affected camera first and only then confirm the quote-only repair scope.',
      cards: [
        {
          title: frontCameraIsInnerOnly ? 'Inner selfie-camera diagnosis' : 'Cover versus inner camera diagnosis',
          icon: Eye,
          points: [
            frontCameraIsInnerOnly
              ? 'We keep the diagnosis on the inner selfie-camera path and do not relabel rear-camera use with the cover display as a second front-camera product.'
              : 'We separate the cover-screen camera from the inner display camera before recommending parts.',
            frontCameraIsInnerOnly
              ? 'Display, protector, or fold-area findings are checked before we assume the selfie camera alone needs replacement.'
              : 'Replacing one front-facing camera does not replace the other.',
          ],
        },
        {
          title: 'Display-area overlap checks',
          icon: Search,
          points: [
            frontCameraIsInnerOnly
              ? 'We inspect the inner display, protector, crease area, and nearby impact where those faults may overlap with the camera complaint.'
              : 'We inspect the cover-display area, inner display, protector, and fold area where those faults may overlap with the camera complaint.',
          ],
        },
        {
          title: 'Clear quote-only scope',
          icon: ClipboardCheck,
          points: [
            'We explain which camera is affected, what testing supports that view, and what remains uncertain before work starts.',
          ],
        },
      ],
    },
    'back-camera-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${modelName} back camera replacement`,
      intro:
        'Rear camera complaints can come from lens glass, housing damage, alignment issues, or the internal module itself, so we diagnose the path before confirming the quote.',
      cards: [
        {
          title: 'Rear-camera mode testing',
          icon: Eye,
          points: [
            'We compare preview, focus, shake, artefacts, and mode-specific symptoms before deciding whether a module fault is present.',
          ],
        },
        {
          title: 'Lens glass and housing separation',
          icon: Search,
          points: [
            'External lens glass and housing damage are checked before internal camera work is quoted.',
          ],
        },
        {
          title: 'Transparent outcome setting',
          icon: ClipboardCheck,
          points: [
            'We explain when the likely path is lens glass, housing-related work, or internal camera replacement without promising every stabilisation result.',
          ],
        },
      ],
    },
    'logic-board-repair': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${modelName} logic board repair`,
      intro:
        'Board-level faults need disciplined diagnosis after simpler causes are excluded, so we keep the scope quote-only and explain repair-versus-data priorities clearly.',
      cards: [
        {
          title: 'Simpler causes ruled out first',
          icon: Search,
          points: [
            'Battery, charging, display, and basic connection causes are checked before the fault is treated as board-level.',
          ],
        },
        {
          title: 'Repair versus data priorities',
          icon: Wrench,
          points: [
            'We separate the goal of restoring the phone from the separate goal of recovering data where possible.',
          ],
        },
        {
          title: 'Quote-only risk review',
          icon: ClipboardCheck,
          points: [
            'Board-level work is only approved after we explain the likely scope, uncertainty, and limitations clearly.',
          ],
        },
      ],
    },
  };
}
