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
import {
  getSamsungBiometricLabel,
  getSamsungFrontCameraLabel,
  getSamsungRearCameraLabel,
  SAMSUNG_QUOTE_ONLY_SCOPE,
  SAMSUNG_WATER_RESISTANCE_NOTE,
} from './shared';
import type { AliMobileEnhancedSamsungRepairType, SamsungHardwareConfig } from './types';

export interface SamsungWhyChooseHighlight {
  icon: LucideIcon;
  text: string;
}

const SAMSUNG_FOLDABLE_WHY_CHOOSE_SHARED_HIGHLIGHTS: SamsungWhyChooseHighlight[] = [
  { icon: FoldHorizontal, text: 'Two-display diagnosis where relevant' },
  { icon: Search, text: 'Protector, screen, and hinge faults separated carefully' },
  { icon: ClipboardCheck, text: 'Quote-only scope confirmed before work' },
  { icon: Smartphone, text: 'Open-and-closed testing where relevant' },
  { icon: ShieldCheck, text: 'Careful foldable-device handling' },
  { icon: Wrench, text: 'Seal limitations explained clearly' },
];

const SAMSUNG_GALAXY_S_ULTRA_WHY_CHOOSE_SHARED_HIGHLIGHTS: SamsungWhyChooseHighlight[] = [
  { icon: Smartphone, text: 'Flagship-device diagnosis with function checks' },
  { icon: Search, text: 'Screen, fingerprint, and frame overlap assessed carefully' },
  { icon: Eye, text: 'Front and rear camera paths separated clearly' },
  { icon: ClipboardCheck, text: 'Catalogue-backed options and variants shown transparently' },
  { icon: ShieldCheck, text: 'Pre-repair and post-repair testing explained clearly' },
  { icon: Wrench, text: 'Seal limitations explained clearly' },
];

const SAMSUNG_GALAXY_S_WHY_CHOOSE_SHARED_HIGHLIGHTS: SamsungWhyChooseHighlight[] = [
  { icon: Smartphone, text: 'Flagship-device diagnosis with display and function checks' },
  { icon: Search, text: 'Screen, biometric, and frame overlap assessed carefully' },
  { icon: Eye, text: 'Front and rear camera paths separated clearly' },
  { icon: ClipboardCheck, text: 'Catalogue-backed options and variants shown transparently' },
  { icon: ShieldCheck, text: 'Pre-repair and post-repair testing explained clearly' },
  { icon: Wrench, text: 'Seal limitations explained clearly' },
];

const SAMSUNG_GALAXY_A_WHY_CHOOSE_SHARED_HIGHLIGHTS: SamsungWhyChooseHighlight[] = [
  { icon: Smartphone, text: 'Model-specific diagnostics with clear repair-path confirmation' },
  { icon: Search, text: 'Screen, battery, port, housing, and camera faults separated carefully' },
  { icon: ClipboardCheck, text: 'Quote scope confirmed before work starts' },
  { icon: ShieldCheck, text: 'Careful device handling with seal limitations explained clearly' },
  { icon: BatteryCharging, text: 'Biometric and charging checks where relevant' },
  { icon: Wrench, text: 'Post-repair testing before handover' },
];

const SAMSUNG_GALAXY_NOTE_WHY_CHOOSE_SHARED_HIGHLIGHTS: SamsungWhyChooseHighlight[] = [
  { icon: Smartphone, text: 'Model-specific Note diagnostics' },
  { icon: Search, text: 'S Pen and digitizer checks where relevant' },
  { icon: ClipboardCheck, text: 'Repair path confirmed before work' },
  { icon: ShieldCheck, text: 'Quote confirmed before commitment' },
  { icon: Eye, text: 'Display and biometric checks' },
  { icon: Wrench, text: 'Seal limitations explained clearly' },
];

function buildSamsungNoteTimingCards(
  underHourPoints: [string, string],
  fastTurnaroundPoints: [string, string],
  quoteFirstPoints: [string, string]
): WhyChooseConfig['cards'] {
  return [
    {
      title: 'Under 1 Hour',
      icon: ClipboardCheck,
      points: underHourPoints,
    },
    {
      title: 'Fast Turnaround',
      icon: Wrench,
      points: fastTurnaroundPoints,
    },
    {
      title: 'Clear Quote First',
      icon: ShieldCheck,
      points: quoteFirstPoints,
    },
  ];
}

export function getSamsungWhyChooseSharedHighlights(
  modelName: string
): SamsungWhyChooseHighlight[] {
  const hardwareConfig = getSamsungHardwareConfigByModelName(modelName);

  if (hardwareConfig?.seriesFamily === 'galaxy-s') {
    return hardwareConfig.modelSlug === 'galaxy-s23-ultra'
      ? SAMSUNG_GALAXY_S_ULTRA_WHY_CHOOSE_SHARED_HIGHLIGHTS
      : SAMSUNG_GALAXY_S_WHY_CHOOSE_SHARED_HIGHLIGHTS;
  }

  if (hardwareConfig?.seriesFamily === 'galaxy-a') {
    return SAMSUNG_GALAXY_A_WHY_CHOOSE_SHARED_HIGHLIGHTS;
  }

  if (hardwareConfig?.seriesFamily === 'galaxy-note') {
    return SAMSUNG_GALAXY_NOTE_WHY_CHOOSE_SHARED_HIGHLIGHTS;
  }

  return SAMSUNG_FOLDABLE_WHY_CHOOSE_SHARED_HIGHLIGHTS;
}

function buildSamsungNoteWhyChooseContent(
  hardwareConfig: SamsungHardwareConfig
): Record<string, WhyChooseConfig> {
  const biometricLabel = getSamsungBiometricLabel(hardwareConfig);
  const frontCameraLabel = getSamsungFrontCameraLabel(hardwareConfig);
  const rearCameraLabel = getSamsungRearCameraLabel(hardwareConfig);
  const displayEdgeDescriptor = hardwareConfig.displayEdgeClass === 'flat' ? 'flat-display' : 'curved-edge';
  const hasIntegratedSPen = hardwareConfig.sPenCapability === 'integrated-slot';

  return {
    'screen-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${hardwareConfig.modelName} screen replacement`,
      intro:
        `Screen faults on this Note can overlap with ${biometricLabel} symptoms, ${displayEdgeDescriptor} condition, frame condition, and S Pen digitizer response, so we inspect the full display path before confirming the final repair outcome.`,
      cards: buildSamsungNoteTimingCards(
        [
          'Many straightforward Note screen repairs can be completed in under an hour once the correct part and repair path are confirmed.',
          `We still check the ${biometricLabel} path, frame fit, and S Pen input response before giving a timing estimate so the handover stays realistic.`,
        ],
        [
          'We test the display, touch, fingerprint, and S Pen response before and after service so the repair follows the actual fault path.',
          'That keeps the handover focused on the confirmed repair result rather than a generic promise.',
        ],
        [
          `Screen damage, ${biometricLabel} symptoms, ${displayEdgeDescriptor} condition, frame condition, and calibration requirements may overlap and must be assessed before the final repair outcome is confirmed.`,
          `Opening the device affects factory seals. ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        ]
      ),
    },
    'battery-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${hardwareConfig.modelName} battery replacement`,
      intro:
        'Battery complaints can overlap with charging-path or board-level faults, so we confirm the likely cause before treating the battery as the only answer.',
      cards: buildSamsungNoteTimingCards(
        [
          'Many straightforward battery jobs are completed quickly once the correct battery and repair path are confirmed.',
          'We still inspect runtime, charging, and swelling risks before pickup so the handover remains practical.',
        ],
        [
          'We test the charging port and board before assuming the battery is the only fault.',
          'That helps avoid replacing a battery when the real issue is charge delivery or deeper power draw.',
        ],
        [
          'We confirm the quote-only battery path before work starts and explain any remaining diagnosis limits clearly.',
          'Battery replacement aims to restore safe, stable battery function, but real runtime still depends on usage, signal conditions, apps, and overall device health.',
        ]
      ),
    },
    'charging-port-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${hardwareConfig.modelName} charging port replacement`,
      intro:
        'USB-C issues are diagnosed carefully because cable fit, contamination, battery symptoms, and board-level charging faults can all present similarly.',
      cards: buildSamsungNoteTimingCards(
        [
          'Many straightforward USB-C repairs can be completed in under an hour once the fault is confirmed.',
          'We still test cable fit, debris, and charge draw first so the timing matches the actual repair path.',
        ],
        [
          'We check for dirt and debris before replacing the physical port.',
          'If the fault points to battery or board behaviour, we explain that before starting the repair.',
        ],
        [
          `We confirm the quote-only USB-C path before work starts. ${SAMSUNG_QUOTE_ONLY_SCOPE}`,
          'We also test wired charging and data transfer so the repair reflects the live catalogue-backed route rather than a guess.',
        ]
      ),
    },
    'back-glass-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${hardwareConfig.modelName} back glass replacement`,
      intro:
        `Rear glass work can overlap with frame damage, camera-area impact, ${hasIntegratedSPen ? 'S Pen slot-area distortion, ' : ''}and wireless-charging behaviour, so the scope is reviewed carefully before work starts.`,
      cards: buildSamsungNoteTimingCards(
        [
          'Many straightforward rear-glass jobs can move quickly once the right assembly is confirmed.',
          'We still inspect the rear panel, frame fit, and slot-area condition before giving a timing estimate.',
        ],
        [
          'We check the frame and rear-panel seating to ensure the new assembly sits flush.',
          'If deformation or swelling is present, we explain whether that needs separate attention before fitment.',
        ],
        [
          `Back Glass Replacement is quote-only on this Note page, while the live POS product remains Back Housing Replacement. ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
          'We also explain that this route does not automatically include S Pen service, cameras, or board work.',
        ]
      ),
    },
    'back-housing-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${hardwareConfig.modelName} back glass replacement`,
      intro:
        `Rear glass work can overlap with frame damage, camera-area impact, ${hasIntegratedSPen ? 'S Pen slot-area distortion, ' : ''}and wireless-charging behaviour, so the scope is reviewed carefully before work starts.`,
      cards: buildSamsungNoteTimingCards(
        [
          'Many straightforward rear-glass jobs can move quickly once the right assembly is confirmed.',
          'We still inspect the rear panel, frame fit, and slot-area condition before giving a timing estimate.',
        ],
        [
          'We check the frame and rear-panel seating to ensure the new assembly sits flush.',
          'If deformation or swelling is present, we explain whether that needs separate attention before fitment.',
        ],
        [
          `Back Glass Replacement is quote-only on this Note page, while the live POS product remains Back Housing Replacement. ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
          'We also explain that this route does not automatically include S Pen service, cameras, or board work.',
        ]
      ),
    },
    'front-camera-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${hardwareConfig.modelName} front camera replacement`,
      intro:
        `This model uses ${frontCameraLabel}, so we keep the diagnosis focused on that camera path and separate it from software, display, and broader board-level faults first.`,
      cards: buildSamsungNoteTimingCards(
        [
          'Many straightforward front-camera jobs can move quickly once the camera path is confirmed.',
          'We still check the camera opening, nearby impact, and preview behaviour before giving a timing estimate.',
        ],
        [
          'We perform camera-versus-software testing to confirm the physical module has failed.',
          'That keeps the quote tied to the actual fault path instead of a guess.',
        ],
        [
          `Front camera work is quote-only on this Note page. ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
          'We do not promise that every image issue resolves the same way because display-area damage or software faults can overlap with the camera complaint.',
        ]
      ),
    },
    'back-camera-replacement': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${hardwareConfig.modelName} back camera replacement`,
      intro:
        `This model has a ${rearCameraLabel}, so we identify the affected camera path first instead of treating every zoom, focus, or preview fault as if all rear cameras are replaced together.`,
      cards: buildSamsungNoteTimingCards(
        [
          'Many straightforward rear-camera jobs can move quickly once the affected module is identified.',
          'We still test the supported camera modes and inspect lens glass and housing condition before giving a timing estimate.',
        ],
        [
          'We test focus and optical stability to confirm the internal camera is faulty.',
          'That helps separate module failure from lens or housing damage.',
        ],
        [
          `Back camera work is quote-only on this Note page. ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
          'We do not imply that every rear camera module is replaced together, because the affected module must be identified first.',
        ]
      ),
    },
    'logic-board-repair': {
      kicker: 'Ali Mobile support',
      heading: `Why choose Ali Mobile for ${hardwareConfig.modelName} logic board repair`,
      intro:
        'Board-level faults need disciplined diagnosis after simpler causes are excluded, so we keep the route quote-only and explain repair-versus-data priorities clearly.',
      cards: buildSamsungNoteTimingCards(
        [
          'Board-level work is only approved after we explain the likely scope, uncertainty, and limitations without fabricating a fixed price.',
          'That keeps the quote practical when no-power or restart symptoms may still be tied to simpler causes.',
        ],
        [
          'We address board-level faults after excluding modular issues like batteries or ports.',
          'That keeps the repair path focused on the actual fault rather than on a generic replacement guess.',
        ],
        [
          `Logic-board repair is quote-only on this Note page. ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
          'Data recovery can be discussed separately, but it is never promised as part of the board job.',
        ]
      ),
    },
  };
}

export function getSamsungWhyChooseContent(
  modelName: string
): Record<string, WhyChooseConfig> {
  const hardwareConfig = getSamsungHardwareConfigByModelName(modelName);
  const isFlip = hardwareConfig?.deviceFamily === 'z-flip';
  const isGalaxyS23Ultra = hardwareConfig?.modelSlug === 'galaxy-s23-ultra';
  const isGalaxyS = hardwareConfig?.seriesFamily === 'galaxy-s';
  const isGalaxyA = hardwareConfig?.seriesFamily === 'galaxy-a';
  const frontCameraIsInnerOnly = hardwareConfig?.frontCameraClass === 'inner-only';

  if (isGalaxyS23Ultra) {
    return {
      'screen-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} screen replacement`,
        intro:
          'Screen faults on this flagship Samsung can overlap with under-display fingerprint symptoms, frame condition, and calibration requirements, so we inspect the full display path before confirming the final repair outcome.',
        cards: [
          {
            title: 'Display and fingerprint testing',
            icon: Smartphone,
            points: [
              'We test display output, touch response, and the fingerprint path before and after service instead of assuming every biometric symptom disappears with a new screen.',
              'Screen damage, fingerprint symptoms, frame condition, and calibration requirements are assessed together before the repair outcome is confirmed.',
            ],
          },
          {
            title: 'Frame and impact review',
            icon: Search,
            points: [
              'We inspect edge impact and frame condition before fitting a screen because deformation can change the safest repair path.',
              'A screen replacement does not automatically guarantee that every deeper biometric or structural fault is solved.',
            ],
          },
          {
            title: 'Catalogue-backed screen path',
            icon: ClipboardCheck,
            points: [
              'This page follows the live catalogue-backed screen listing for the model without inventing extra screen-quality tiers or unsupported options.',
            ],
          },
        ],
      },
      'battery-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} battery replacement`,
        intro:
          'Battery complaints can overlap with charging-path or board-level faults, so we confirm the likely cause before treating the battery as the only answer.',
        cards: [
          {
            title: 'Battery symptoms in context',
            icon: BatteryCharging,
            points: [
              'We review rapid drain, shutdowns, unstable percentage, heat, swelling, and reduced runtime before confirming the battery path.',
              'Swelling is checked against rear housing fit rather than being treated as a cosmetic issue only.',
            ],
          },
          {
            title: 'Charging-path separation',
            icon: Usb,
            points: [
              'USB-C charging behaviour and related symptoms are checked so battery work is not quoted on the wrong fault path.',
            ],
          },
          {
            title: 'Clear scope before work',
            icon: ClipboardCheck,
            points: [
              'We explain when the battery path looks appropriate and when deeper diagnosis is still needed before parts are approved.',
            ],
          },
        ],
      },
      'charging-port-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} charging port replacement`,
        intro:
          'USB-C issues are diagnosed carefully because cable fit, contamination, battery symptoms, and board-level charging faults can all present similarly.',
        cards: [
          {
            title: 'USB-C inspection first',
            icon: Usb,
            points: [
              'We inspect cable fit, loose connection symptoms, debris, and contamination before assuming the port needs replacement.',
            ],
          },
          {
            title: 'Port-versus-power diagnosis',
            icon: Search,
            points: [
              'Battery and board-level causes are separated from the USB-C path before the repair listing is treated as the final answer.',
            ],
          },
          {
            title: 'Function retesting before handover',
            icon: ClipboardCheck,
            points: [
              'Charging and related connection behaviour are retested before pickup so the handover reflects the confirmed repair path.',
            ],
          },
        ],
      },
      'back-housing-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} back housing replacement`,
        intro:
          'Rear housing work can overlap with frame damage, camera-area impact, wireless-charging behaviour, and S Pen slot-area distortion, so the scope is reviewed carefully before work starts.',
        cards: [
          {
            title: 'Rear housing and frame review',
            icon: Smartphone,
            points: [
              'We distinguish rear housing or rear-panel damage from broader frame deformation before confirming the repair path.',
              'Severe frame damage stays subject to separate inspection rather than being assumed inside every housing repair.',
            ],
          },
          {
            title: 'Variant and function checks',
            icon: Search,
            points: [
              'The available Premium and Genuine variants remain driven by the live catalogue, with wireless-charging and rear fit checked where relevant.',
              'S Pen slot-area impact is reviewed as diagnostic context without implying that S Pen service is included.',
            ],
          },
          {
            title: 'Clear repair boundaries',
            icon: ClipboardCheck,
            points: [
              'Back Housing Replacement does not automatically include cameras, charging components, or logic-board work, and opening the phone does not restore factory water resistance.',
            ],
          },
        ],
      },
      'front-camera-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} front camera replacement`,
        intro:
          'This model uses a single punch-hole front camera, so we keep the diagnosis focused on that camera path and separate it from software, display, and broader board-level faults first.',
        cards: [
          {
            title: 'Single front-camera diagnosis',
            icon: Eye,
            points: [
              'We check blur, haze, spots, preview failure, and focus inconsistency around the punch-hole camera path.',
              'Impact near the camera opening is assessed before we assume the front camera alone is the cause.',
            ],
          },
          {
            title: 'Camera-versus-system separation',
            icon: Search,
            points: [
              'We separate likely camera faults from software or board-level behaviour before confirming the repair path.',
            ],
          },
          {
            title: 'Clear expectations before work',
            icon: ClipboardCheck,
            points: [
              'We explain what supports the front-camera diagnosis and what remains uncertain rather than promising every image issue resolves the same way.',
            ],
          },
        ],
      },
      'back-camera-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} back camera replacement`,
        intro:
          'This model has multiple rear-camera modules, so we identify the affected camera path first instead of treating every zoom, focus, or preview fault as if all rear cameras are replaced together.',
        cards: [
          {
            title: 'Module-specific diagnosis',
            icon: Eye,
            points: [
              'We test the supported rear-camera modes to identify which camera module appears affected before work is approved.',
              'One repair does not automatically replace every rear camera on the phone.',
            ],
          },
          {
            title: 'Lens glass and housing separation',
            icon: Search,
            points: [
              'External lens glass and camera-area housing damage are checked before internal camera replacement is assumed.',
              'External lens glass is not presented here as a separate confirmed public service.',
            ],
          },
          {
            title: 'Catalogue-backed scope',
            icon: ClipboardCheck,
            points: [
              'The displayed route stays aligned with the live catalogue while the actual affected module still has to be confirmed during diagnosis.',
            ],
          },
        ],
      },
      'logic-board-repair': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} logic board repair`,
        intro:
          'Board-level faults need disciplined diagnosis after simpler causes are excluded, so we keep the route quote-only and explain repair-versus-data priorities clearly.',
        cards: [
          {
            title: 'Simpler causes ruled out first',
            icon: Search,
            points: [
              'Battery, charging, display, and basic connection causes are reviewed before the fault is treated as board-level.',
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
              'Board-level work is only approved after we explain the likely scope, uncertainty, and limitations without fabricating a fixed price.',
            ],
          },
        ],
      },
    };
  }

  if (hardwareConfig?.seriesFamily === 'galaxy-note' && hardwareConfig) {
    return buildSamsungNoteWhyChooseContent(hardwareConfig);
  }

  if (isGalaxyS && hardwareConfig) {
    const biometricLabel = getSamsungBiometricLabel(hardwareConfig);
    const frontCameraLabel = getSamsungFrontCameraLabel(hardwareConfig);
    const rearCameraLabel = getSamsungRearCameraLabel(hardwareConfig);
    const hasSPenSlot = hardwareConfig.sPenCapability === 'integrated-slot';

    return {
      'screen-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} screen replacement`,
        intro:
          `Screen faults on this Samsung Galaxy S model can overlap with ${biometricLabel} symptoms, frame condition, and calibration requirements, so we inspect the full display path before confirming the final repair outcome.`,
        cards: [
          {
            title: 'Display and biometric testing',
            icon: Smartphone,
            points: [
              `We test display output, touch response, and the ${biometricLabel} path before and after service instead of assuming every symptom disappears with a new screen.`,
              'Screen damage, biometric symptoms, frame condition, and calibration requirements are assessed together before the repair outcome is confirmed.',
            ],
          },
          {
            title: 'Frame and impact review',
            icon: Search,
            points: [
              'We inspect edge impact and frame condition before fitting a screen because deformation can change the safest repair path.',
              'A screen replacement does not automatically guarantee that every deeper biometric or structural fault is solved.',
            ],
          },
          {
            title: 'Catalogue-backed screen path',
            icon: ClipboardCheck,
            points: [
              'This page follows the live catalogue-backed screen listing for the model without inventing extra screen-quality tiers or unsupported options.',
            ],
          },
        ],
      },
      'battery-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} battery replacement`,
        intro:
          'Battery complaints can overlap with charging-path or board-level faults, so we confirm the likely cause before treating the battery as the only answer.',
        cards: [
          {
            title: 'Battery symptoms in context',
            icon: BatteryCharging,
            points: [
              'We review rapid drain, shutdowns, unstable percentage, heat, swelling, and reduced runtime before confirming the battery path.',
              'Swelling is checked against rear housing fit rather than being treated as a cosmetic issue only.',
            ],
          },
          {
            title: 'Charging-path separation',
            icon: Usb,
            points: [
              'USB-C charging behaviour and related symptoms are checked so battery work is not quoted on the wrong fault path.',
            ],
          },
          {
            title: 'Clear scope before work',
            icon: ClipboardCheck,
            points: [
              'We explain when the battery path looks appropriate and when deeper diagnosis is still needed before parts are approved.',
            ],
          },
        ],
      },
      'charging-port-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} charging port replacement`,
        intro:
          'USB-C issues are diagnosed carefully because cable fit, contamination, battery symptoms, and board-level charging faults can all present similarly.',
        cards: [
          {
            title: 'USB-C inspection first',
            icon: Usb,
            points: [
              'We inspect cable fit, loose connection symptoms, debris, and contamination before assuming the port needs replacement.',
            ],
          },
          {
            title: 'Port-versus-power diagnosis',
            icon: Search,
            points: [
              'Battery and board-level causes are separated from the USB-C path before the repair listing is treated as the final answer.',
            ],
          },
          {
            title: 'Function retesting before handover',
            icon: ClipboardCheck,
            points: [
              'Charging and related connection behaviour are retested before pickup so the handover reflects the confirmed repair path.',
            ],
          },
        ],
      },
      'back-housing-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} back housing replacement`,
        intro:
          `Rear housing work can overlap with frame damage, camera-area impact, wireless-charging behaviour${hasSPenSlot ? ', and S Pen slot-area distortion' : ''}, so the scope is reviewed carefully before work starts.`,
        cards: [
          {
            title: 'Rear housing and frame review',
            icon: Smartphone,
            points: [
              'We distinguish rear housing or rear-panel damage from broader frame deformation before confirming the repair path.',
              'Severe frame damage stays subject to separate inspection rather than being assumed inside every housing repair.',
            ],
          },
          {
            title: 'Variant and function checks',
            icon: Search,
            points: [
              'The available catalogue-backed variants remain driven by the live catalogue, with wireless-charging and rear fit checked where relevant.',
              ...(hasSPenSlot
                ? ['S Pen slot-area impact is reviewed as diagnostic context without implying that S Pen service is included.']
                : []),
            ],
          },
          {
            title: 'Clear repair boundaries',
            icon: ClipboardCheck,
            points: [
              'Back Housing Replacement does not automatically include cameras, charging components, or logic-board work, and opening the phone does not restore factory water resistance.',
            ],
          },
        ],
      },
      'front-camera-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} front camera replacement`,
        intro:
          `This model uses a ${frontCameraLabel}, so we keep the diagnosis focused on that camera path and separate it from software, display, and broader board-level faults first.`,
        cards: [
          {
            title: 'Single front-camera diagnosis',
            icon: Eye,
            points: [
              `We check blur, haze, spots, preview failure, and focus inconsistency around the ${frontCameraLabel} path.`,
              'Impact near the camera opening is assessed before we assume the front camera alone is the cause.',
            ],
          },
          {
            title: 'Camera-versus-system separation',
            icon: Search,
            points: [
              'We separate likely camera faults from software or board-level behaviour before confirming the repair path.',
            ],
          },
          {
            title: 'Clear expectations before work',
            icon: ClipboardCheck,
            points: [
              'We explain what supports the front-camera diagnosis and what remains uncertain rather than promising every image issue resolves the same way.',
            ],
          },
        ],
      },
      'back-camera-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} back camera replacement`,
        intro:
          `This model has a ${rearCameraLabel}, so we identify the affected camera path first instead of treating every zoom, focus, or preview fault as if all rear cameras are replaced together.`,
        cards: [
          {
            title: 'Module-specific diagnosis',
            icon: Eye,
            points: [
              'We test the supported rear-camera modes to identify which camera module appears affected before work is approved.',
              'One repair does not automatically replace every rear camera on the phone.',
            ],
          },
          {
            title: 'Lens glass and housing separation',
            icon: Search,
            points: [
              'External lens glass and camera-area housing damage are checked before internal camera replacement is assumed.',
              'External lens glass is not presented here as a separate confirmed public service.',
            ],
          },
          {
            title: 'Catalogue-backed scope',
            icon: ClipboardCheck,
            points: [
              'The displayed route stays aligned with the live catalogue while the actual affected module still has to be confirmed during diagnosis.',
            ],
          },
        ],
      },
      'logic-board-repair': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} logic board repair`,
        intro:
          'Board-level faults need disciplined diagnosis after simpler causes are excluded, so we keep the route quote-only and explain repair-versus-data priorities clearly.',
        cards: [
          {
            title: 'Simpler causes ruled out first',
            icon: Search,
            points: [
              'Battery, charging, display, and basic connection causes are reviewed before the fault is treated as board-level.',
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
              'Board-level work is only approved after we explain the likely scope, uncertainty, and limitations without fabricating a fixed price.',
            ],
          },
        ],
      },
    };
  }

  if (isGalaxyA && hardwareConfig) {
    let biometricLabel = 'fingerprint scanner';
    if (hardwareConfig.biometrics === 'rear-fingerprint') biometricLabel = 'rear fingerprint scanner';
    else if (hardwareConfig.biometrics === 'side-fingerprint') biometricLabel = 'side-key fingerprint scanner';
    else if (hardwareConfig.biometrics === 'under-display-fingerprint') biometricLabel = 'under-display fingerprint scanner';
    const chargingPortLabel = hardwareConfig.chargingPortType === 'usb-c' ? 'USB-C charging path' : 'charging path';
    const displayLabel = 'display path';

    return {
      'screen-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} screen replacement`,
        intro:
          `We test the display output, touch response, and ${biometricLabel} to ensure your ${modelName} functions as expected after screen repair. Screen damage, frame condition, and calibration requirements can overlap, so we confirm the repair path before promising the outcome.`,
        cards: [
          {
            title: 'Under 1 Hour',
            icon: ClipboardCheck,
            points: [
              `Many straightforward ${modelName} screen repairs can be completed in under an hour once the correct part and repair path are confirmed.`,
              `We still inspect the ${displayLabel}, frame fit, and ${biometricLabel} before giving a timing estimate, so the quote stays realistic.`,
            ],
          },
          {
            title: 'Diagnostic first',
            icon: Search,
            points: [
              `We test the ${biometricLabel} and ${displayLabel} before confirming the repair.`,
              `If calibration or frame concerns are present, we explain those limits before any work begins.`,
            ],
          },
        ],
      },
      'battery-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} battery replacement`,
        intro:
          `We test your ${modelName} power path to confirm the battery is the main fault before replacing it. Battery wear, charging behaviour, and board-level faults can overlap, so we separate them before quoting.`,
        cards: [
          {
            title: 'Fast Turnaround',
            icon: ClipboardCheck,
            points: [
              `Many straightforward battery jobs are completed quickly once the correct battery and repair path are confirmed.`,
              `We keep the handover practical by checking runtime, charging, and swelling risks before pickup.`,
            ],
          },
          {
            title: 'Power path check',
            icon: BatteryCharging,
            points: [
              `We test the charging port and board before assuming the battery is the only fault.`,
              `That helps avoid replacing a battery when the real issue is charge delivery or deeper power draw.`,
            ],
          },
        ],
      },
      'charging-port-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} charging port replacement`,
        intro:
          `We clear debris and test cables before quoting a full port replacement for your ${modelName}. USB-C faults can overlap with battery or board issues, so we check the full charging path first.`,
        cards: [
          {
            title: 'Under 1 Hour',
            icon: ClipboardCheck,
            points: [
              `Many straightforward ${chargingPortLabel} repairs can be completed in under an hour once the fault is confirmed.`,
              `We still test cable fit, debris, and charge draw first so timing matches the actual repair path.`,
            ],
          },
          {
            title: 'Clear diagnostics',
            icon: Search,
            points: [
              `We check for dirt and debris before replacing the physical port.`,
              `If the fault points to battery or board behaviour, we explain that before starting the repair.`,
            ],
          },
        ],
      },
      'back-housing-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} back housing replacement`,
        intro:
          `We inspect the frame condition and rear-panel fit before confirming back housing work for your ${modelName}. Rear damage, button alignment, and charging behaviour can overlap, so we confirm the structural path first.`,
        cards: [
          {
            title: 'Frame inspection',
            icon: Search,
            points: [
              `We check the frame and rear-panel seating to ensure the new housing sits flush.`,
              `If deformation or swelling is present, we explain whether that needs separate attention before fitment.`,
            ],
          },
          {
            title: 'Seal protection',
            icon: ShieldCheck,
            points: [
              `We replace the housing with a fresh seal where appropriate, though factory water resistance is not guaranteed.`,
              `You get a clear explanation of what the housing work covers and what it does not.`,
            ],
          },
        ],
      },
      'front-camera-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} front camera replacement`,
        intro:
          `We test the camera module and inspect the display glass to ensure the best selfie outcome for your ${modelName}. Camera faults can overlap with display-area damage, so we identify the likely cause before confirming the repair.`,
        cards: [
          {
            title: 'Module check',
            icon: Search,
            points: [
              `We perform camera-versus-software testing to confirm the physical module has failed.`,
              `That keeps the quote tied to the actual fault path instead of a guess.`,
            ],
          },
          {
            title: 'Glass inspection',
            icon: ShieldCheck,
            points: [
              `We check for impact over the lens that might require a screen or housing repair.`,
              `If the glass is damaged, we explain the overlap before you approve the work.`,
            ],
          },
        ],
      },
      'back-camera-replacement': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} back camera replacement`,
        intro:
          `We test optical stability and inspect the external lens glass before replacing your ${modelName} rear camera. Multiple rear-camera paths can look similar, so we identify the fault first.`,
        cards: [
          {
            title: 'Stability testing',
            icon: Search,
            points: [
              `We test focus and optical stability to confirm the internal camera is faulty.`,
              `That helps separate module failure from lens or housing damage.`,
            ],
          },
          {
            title: 'Lens glass check',
            icon: ShieldCheck,
            points: [
              `We inspect the external lens to ensure the new camera stays protected.`,
              `If the lens or housing is the only damaged part, we explain that before any replacement is approved.`,
            ],
          },
        ],
      },
      'logic-board-repair': {
        kicker: 'Ali Mobile support',
        heading: `Why choose Ali Mobile for ${modelName} logic board repair`,
        intro:
          `We perform board diagnostics when your ${modelName} fails to power on, restarts unpredictably, or will not charge normally. Logic-board work is quote-only because the real fault path has to be confirmed first.`,
        cards: [
          {
            title: 'Micro-soldering',
            icon: Search,
            points: [
              `We address board-level faults after excluding modular issues like batteries or ports.`,
              `That keeps the repair path focused on the actual fault rather than on a generic replacement guess.`,
            ],
          },
          {
            title: 'Diagnostic approach',
            icon: ShieldCheck,
            points: [
              `We assess the viability of the repair before anything is approved.`,
              `Data recovery can be discussed separately, but it is never promised as part of the board job.`,
            ],
          },
        ],
      },
    };
  }

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
