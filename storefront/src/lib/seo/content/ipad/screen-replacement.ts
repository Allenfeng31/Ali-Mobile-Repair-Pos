import type { IpadEnhancedSeoPocket, IpadHardwareConfig } from './types';
import {
  ALI_MOBILE_IPAD_BUSINESS,
  getIpadBiometricLabel,
  getIpadBiometricTestLabel,
  getIpadFrontCameraPositionLabel,
  getIpadLocalSuburbReference,
  getIpadScreenTechnologySummary,
  getIpadSupportLabel,
} from './shared';

function getScreenCameraAreaLabel(config: IpadHardwareConfig): string {
  if (config.biometricType === 'face-id') {
    return config.frontCameraPosition === 'landscape'
      ? 'landscape TrueDepth camera area'
      : 'TrueDepth and Face ID area';
  }

  return config.frontCameraPosition === 'landscape'
    ? 'landscape front-camera edge'
    : config.hasHomeButton
      ? 'front-camera and Home Button area'
      : 'front-camera and top-button area';
}

export function buildIpadScreenReplacementPocket(config: IpadHardwareConfig): IpadEnhancedSeoPocket {
  const screenTechnology = getIpadScreenTechnologySummary(config);
  const biometricLabel = getIpadBiometricLabel(config);
  const biometricTestLabel = getIpadBiometricTestLabel(config);
  const cameraAreaLabel = getScreenCameraAreaLabel(config);
  const supportLabel = getIpadSupportLabel(config) ?? undefined;
  const largerFrameSentence = config.hasLargerFrameInspectionNote
    ? 'The larger 13-inch frame and display edges are inspected carefully before the replacement scope is confirmed.'
    : 'Frame edges and corners are inspected carefully before the replacement scope is confirmed.';

  return {
    modelSlug: config.modelSlug,
    modelName: config.modelName,
    repairType: 'screen-replacement',
    metaTitle: `${config.modelName} Screen Replacement in Ringwood | Ali Mobile & Repair`,
    metaDescription: `${config.modelName} screen replacement in Ringwood with inspection of cracked glass, touch, display output, frame condition, and ${cameraAreaLabel}.`,
    heroSubtitle:
      `Bring your ${config.modelName} to ${ALI_MOBILE_IPAD_BUSINESS.businessName} at ${ALI_MOBILE_IPAD_BUSINESS.locationShort} for model-aware screen inspection, live pricing, and booking support.`,
    schemaDescription:
      `Model-aware screen replacement for ${config.modelName} in Ringwood. We inspect glass damage, touch response, display output, frame condition, and nearby camera or biometric functions before confirming the repair scope.`,
    supportLabel,
    quickAnswer:
      `${config.modelName} screen replacement starts with inspection of cracked glass, touch response, display output, frame condition, and ${cameraAreaLabel}. We confirm the exact part and repair scope through diagnosis rather than assuming a glass-only replacement. We check the battery condition, display fit and device response before confirming the repair plan. Backing up the iPad before repair is always recommended.`,
    workbenchHeadings: {
      options: `What does the technician confirm before ${config.modelName} screen repair?`,
      diagnostics: 'How is the screen fault confirmed step by step?',
      symptoms: `Which ${config.modelName} screen symptoms matter most?`,
      outcomes: 'What can expand the screen repair scope?',
    },
    repairOptions: [
      {
        name: 'Glass, touch, and display assessment',
        shortDescription:
          `We confirm the exact ${config.modelName} screen symptom by checking cracked glass, black display behavior, lines, flickering, and touch response across the panel.`,
        bestFor:
          'Cracked glass, image loss, dead touch zones, ghost touch, or a screen that still responds while the display stays dark.',
        notes:
          'The screen path is only confirmed after glass, touch, and display behavior are tested together.',
      },
      {
        name: 'Frame and hardware overlap inspection',
        shortDescription:
          `${largerFrameSentence} We also inspect damage around the ${cameraAreaLabel} before parts are approved.`,
        bestFor:
          'Dropped iPads with dented corners, bent edges, lifting screen areas, or visible damage near the camera or biometric zone.',
        notes:
          'We check the battery condition, display fit and device response before confirming the repair plan.',
      },
      {
        name: 'Model-specific handling notes',
        shortDescription:
          `${config.modelName} uses ${screenTechnology}, ${getIpadFrontCameraPositionLabel(config)}, and ${biometricLabel}. Those details shape the inspection and post-repair testing path.`,
        bestFor:
          'Customers who want to understand why the repair wording varies between standard iPad, Air, mini, and Pro models.',
        notes:
          'We use only the hardware details confirmed for this iPad model when explaining the repair scope.',
      },
      {
        name: 'Post-repair function testing',
        shortDescription:
          `After repair we retest touch coverage, brightness, display output, cameras, ${biometricTestLabel.toLowerCase()}, charging response, screen alignment, and edge fit.`,
        bestFor:
          'Customers who want the key day-to-day functions rechecked before handover.',
        notes:
          'Any unrelated issue found during testing is explained before extra work is suggested.',
      },
    ],
    commonProblems: [
      {
        title: 'Cracked glass',
        description:
          'Cracks can stay cosmetic at first, but they may also hide touch instability or spread into areas that affect safe use.',
      },
      {
        title: 'No touch response',
        description:
          'A screen can still show an image while touch stops responding, so glass and touch are assessed together rather than assumed to be one simple layer issue.',
      },
      {
        title: 'Partial touch failure',
        description:
          'Dead zones along one edge or one section of the panel often point to a repair scope that needs full diagnosis before a quote is confirmed.',
      },
      {
        title: 'Ghost touch',
        description:
          'Repeated taps or drifting input can come from damaged screen layers, impact stress, or broader hardware distortion around the frame.',
      },
      {
        title: 'Black display while the iPad still responds',
        description:
          'The iPad may still vibrate, charge, or respond to buttons even when the screen image is no longer usable.',
      },
      {
        title: 'Lines, flickering, dark areas, or colour blocks',
        description:
          'Image faults can show up as lines, unstable brightness, dark patches, or blocked colour zones after impact or distortion.',
      },
      {
        title: 'Screen separation',
        description:
          'A separated edge is inspected to confirm the underlying cause so we can explain the full repair scope before work begins.',
      },
      {
        title: 'Frame and corner condition',
        description:
          'We inspect the frame and corners so the replacement screen fits correctly and the repair plan covers everything you need.',
      },
      {
        title: 'Camera-area damage',
        description:
          `Damage around the ${cameraAreaLabel} is inspected because nearby impact can affect the practical repair scope even when the main complaint is the screen.`,
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: `Confirm the exact ${config.modelName} model`,
        description:
          'We confirm the exact iPad model first so the screen path, hardware checks, and expected testing match the device in front of us.',
      },
      {
        step: '02',
        title: 'Inspect the frame, display, and impact history',
        description:
          `We inspect cracks, corner damage, frame shape, screen lifting, and visible impact history before the iPad is opened.`,
      },
      {
        step: '03',
        title: 'Reproduce the reported screen fault',
        description:
          'We check image output, touch response, ghost touch, flicker, black-screen behavior, and any customer-reported dead zones.',
      },
      {
        step: '04',
        title: 'Test related functions',
        description:
          `We test the front and rear cameras, ${biometricTestLabel.toLowerCase()}, charging response, and the nearby hardware linked to the screen area.`,
      },
      {
        step: '05',
        title: 'Distinguish the likely repair cause',
        description:
          `We distinguish screen damage from frame condition, connection faults, and broader hardware factors before quoting.`,
      },
      {
        step: '06',
        title: 'Confirm the repair approach with the customer',
        description:
          'We explain the practical screen repair scope, any visible limitations, and the next step before parts are fitted.',
      },
      {
        step: '07',
        title: 'Perform post-repair functional checks',
        description:
          `After repair we retest touch across the full panel, display output, brightness, cameras, ${biometricTestLabel.toLowerCase()}, charging, and screen fit before handover.`,
      },
    ],
    modelSpecificNotes: {
      kicker: 'Model-specific repair notes',
      heading: `${config.modelName} screen repair notes`,
      intro:
        `This page uses the confirmed hardware facts for ${config.modelName} so the screen wording stays aligned with the actual iPad model.`,
      items: [
        `${config.modelName} uses ${screenTechnology}.`,
        `${config.modelName} has ${getIpadFrontCameraPositionLabel(config)} and ${biometricLabel}.`,
        config.biometricType === 'face-id'
          ? 'Face ID and the TrueDepth camera path are tested separately after repair, but they are never assumed as an automatic result of screen replacement.'
          : `The ${biometricLabel.toLowerCase()} path is checked after repair without assuming restoration of any pre-existing biometric fault.`,
        config.hasLargerFrameInspectionNote
          ? 'This larger 13-inch frame needs extra inspection around the display edges and corners before the replacement scope is confirmed.'
          : 'Frame edges, corners, and alignment are checked carefully before the replacement scope is confirmed.',
      ],
    },
    repairLimitations: {
      kicker: 'Inspection process',
      heading: `How we confirm ${config.modelName} screen repair`,
      intro:
        'Screen replacement can still depend on the physical condition of the iPad around the display area.',
      items: [
        'We check the frame, corners and overall structure so the replacement screen fits correctly.',
        'If the screen has separated, we identify the underlying cause and explain all options before proceeding.',
        'Any signs of liquid exposure are noted so you understand the full condition before we begin.',
        config.biometricType === 'face-id'
          ? 'Face ID requires separate testing and is never assumed through screen repair alone.'
          : `${biometricLabel} requires separate testing and is not assumed through screen repair alone.`,
        'The iPad\'s original assembly is carefully managed, though post-repair fit can depend on the existing frame condition.',
      ],
    },
    localService: {
      kicker: 'Ringwood iPad support',
      heading: `Bring your ${config.modelName} to Ringwood Square for inspection`,
      intro:
        `${ALI_MOBILE_IPAD_BUSINESS.businessName} works from ${ALI_MOBILE_IPAD_BUSINESS.locationName} in ${ALI_MOBILE_IPAD_BUSINESS.locality}. ${getIpadLocalSuburbReference('screen-replacement')}`,
      items: [
        `Bring the ${config.modelName} in as it is so we can inspect the full condition on site.`,
        'If the iPad still powers on, backing up important data before the visit is recommended.',
        `Call ${ALI_MOBILE_IPAD_BUSINESS.phone} or book online if you want help checking likely part availability before travelling.`,
      ],
    },
    finalCta: {
      kicker: 'Next step',
      heading: `Ready to organise ${config.modelName} screen replacement?`,
      body:
        'You can book the repair, request a quote through the existing system, call the store, or walk in for an inspection first. We confirm the screen scope before work starts.',
      bullets: [
        'Book Repair for the exact iPad model and repair path.',
        `Call ${ALI_MOBILE_IPAD_BUSINESS.phone} if you want to discuss frame condition or parts availability first.`,
        'Visit the Ringwood store if you want the screen, frame, and nearby hardware checked in person.',
      ],
    },
    faq: [
      {
        question: `How is the correct repair option confirmed for ${config.modelName}?`,
        answer:
          'We confirm the exact iPad model, inspect the screen and frame, reproduce the fault, test related functions, and then explain the practical repair approach before fitting parts.',
      },
      {
        question: `What functions are tested after ${config.modelName} screen repair?`,
        answer:
          `We retest the front and rear cameras, ${biometricTestLabel.toLowerCase()}, charging response, and the repaired screen before handover.`,
      },
      {
        question: `Should I back up my ${config.modelName} before bringing it in?`,
        answer:
          'Backing up your iPad data before any repair is always recommended whenever the device still powers on and functions well enough to do so.',
      },
      {
        question: `How can I book this repair in Ringwood?`,
        answer:
          `You can book online through our existing system, call ${ALI_MOBILE_IPAD_BUSINESS.phone} to discuss parts availability, or visit the Ringwood store in person.`,
      },
      {
        question: `What should I bring when visiting the store for ${config.modelName} repair?`,
        answer:
          'Bring the iPad as it is. If the issue is related to charging or a specific accessory, bring that accessory with you so we can test the complete setup.',
      },
    ],
  };
}
