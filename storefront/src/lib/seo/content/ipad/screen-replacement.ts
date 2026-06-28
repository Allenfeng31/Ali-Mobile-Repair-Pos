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
      `Model-aware screen replacement for ${config.modelName} in Ringwood. We inspect glass damage, touch response, display output, frame pressure, and nearby camera or biometric functions before confirming the repair scope.`,
    supportLabel,
    quickAnswer:
      `${config.modelName} screen replacement starts with inspection of cracked glass, touch response, display output, frame condition, and ${cameraAreaLabel}. We do not promise glass-only replacement because the exact part and repair scope depend on diagnosis. If the screen is lifting, we also check for battery pressure or frame damage. Screen repair is not normally performed to remove data, but backing up the iPad before repair is still recommended.`,
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
          'Screen lifting can point to battery pressure or structural damage, so the iPad is assessed before repair is booked in.',
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
          'Customers who want the key day-to-day functions rechecked before pickup.',
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
          'Repeated taps or drifting input can come from damaged screen layers, impact stress, or broader hardware pressure around the frame.',
      },
      {
        title: 'Black display while the iPad still responds',
        description:
          'The iPad may still vibrate, charge, or respond to buttons even when the screen image is no longer usable.',
      },
      {
        title: 'Lines, flickering, dark areas, or colour blocks',
        description:
          'Image faults can show up as lines, unstable brightness, dark patches, or blocked colour zones after impact or pressure.',
      },
      {
        title: 'Screen lifting',
        description:
          'A lifted edge can point to failed bonding, frame distortion, or battery pressure, so the underlying cause is checked before repair.',
      },
      {
        title: 'Bent frame or damaged corners',
        description:
          'A bent corner or twisted frame can affect how safely the iPad opens and how cleanly the replacement screen sits afterward.',
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
          `We separate screen damage from frame issues, battery pressure, connection faults, and broader hardware damage before quoting.`,
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
          ? 'Face ID and the TrueDepth camera path are tested separately after repair, but they are never guaranteed as an automatic result of screen replacement.'
          : `The ${biometricLabel.toLowerCase()} path is checked after repair without guaranteeing restoration of any pre-existing biometric fault.`,
        config.hasLargerFrameInspectionNote
          ? 'This larger 13-inch frame needs extra inspection around the display edges and corners before the replacement scope is confirmed.'
          : 'Frame edges, corners, and alignment are checked carefully before the replacement scope is confirmed.',
      ],
    },
    repairLimitations: {
      kicker: 'Repair limitations',
      heading: `What can limit ${config.modelName} screen repair`,
      intro:
        'Screen replacement can still depend on the physical condition of the iPad around the display area.',
      items: [
        'Bent frames, damaged corners, or existing structural distortion can affect final fit and may expand the repair scope.',
        'Screen lifting can be linked to battery pressure, failed bonding, or frame damage rather than the screen alone.',
        'Existing liquid damage can affect the result and may require separate diagnosis.',
        config.biometricType === 'face-id'
          ? 'Face ID requires separate testing and is never guaranteed through screen repair alone.'
          : `${biometricLabel} requires separate testing and is not guaranteed through screen repair alone.`,
        'The original seal is not guaranteed to be restored after the iPad has been opened.',
      ],
    },
    localService: {
      kicker: 'Ringwood iPad support',
      heading: `Bring your ${config.modelName} to Ringwood Square for inspection`,
      intro:
        `${ALI_MOBILE_IPAD_BUSINESS.businessName} works from ${ALI_MOBILE_IPAD_BUSINESS.locationName} in ${ALI_MOBILE_IPAD_BUSINESS.locality}. ${getIpadLocalSuburbReference('screen-replacement')}`,
      items: [
        `Bring the ${config.modelName} in as it is, especially if the frame is bent or the screen is lifting.`,
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
        question: `Is only the outer glass replaced on ${config.modelName}?`,
        answer:
          'Not automatically. We inspect the glass, touch response, display output, and frame condition first because the exact repair scope depends on what is actually damaged.',
      },
      {
        question: `Why can ${config.modelName} still show an image when touch does not work?`,
        answer:
          'The image path and touch path can fail differently, so we test both before confirming whether screen replacement is the right repair.',
      },
      {
        question: `Can a bent frame affect ${config.modelName} screen replacement?`,
        answer:
          'Yes. A bent frame or damaged corner can affect safe opening, screen fit, and the final repair scope, so it is inspected before work begins.',
      },
      {
        question: `What if the screen on ${config.modelName} is lifting?`,
        answer:
          'Screen lifting can be linked to battery pressure, frame damage, or bonding issues. We inspect the cause first instead of pushing the screen back down.',
      },
      {
        question: `Will the cameras and biometric functions be tested after ${config.modelName} screen repair?`,
        answer:
          `Yes. We retest the front and rear cameras, ${biometricTestLabel.toLowerCase()}, charging response, and the repaired screen before handover.`,
      },
      {
        question: `Will ${config.modelName} screen replacement remove my data?`,
        answer:
          'Data removal is not normally the purpose of screen repair, but backing up the iPad before repair is still recommended as a precaution.',
      },
      {
        question: `Is the original seal restored after ${config.modelName} screen replacement?`,
        answer:
          'No factory seal is guaranteed after the iPad has been opened. We explain that limitation clearly before the repair is approved.',
      },
      {
        question: `How is the final screen repair scope confirmed for ${config.modelName}?`,
        answer:
          'We confirm the exact iPad model, inspect the screen and frame, reproduce the fault, test related functions, and then explain the practical repair approach before fitting parts.',
      },
    ],
  };
}
