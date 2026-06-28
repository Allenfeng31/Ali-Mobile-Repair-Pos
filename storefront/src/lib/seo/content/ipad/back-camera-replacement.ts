import type { IpadEnhancedSeoPocket, IpadHardwareConfig } from './types';
import {
  ALI_MOBILE_IPAD_BUSINESS,
  getIpadBiometricTestLabel,
  getIpadLocalSuburbReference,
  getIpadRearCameraSystemSummary,
  getIpadSupportLabel,
} from './shared';

function getRearCameraFaqHeading(config: IpadHardwareConfig): string {
  if (config.rearCameraSystem === 'dual-wide-ultra-wide-lidar') {
    return 'Does this model have one or two rear cameras?';
  }

  return 'Does this model have one rear camera or more?';
}

function getRearCameraLayoutAnswer(config: IpadHardwareConfig): string {
  switch (config.rearCameraSystem) {
    case 'single-8mp':
      return `${config.modelName} uses a single 8MP rear camera.`;
    case 'single-12mp':
      return `${config.modelName} uses a single 12MP Wide rear camera.`;
    case 'dual-wide-ultra-wide-lidar':
      return `${config.modelName} uses a 12MP Wide rear camera, a 10MP Ultra Wide rear camera, and LiDAR Scanner. Those paths are checked separately during diagnosis.`;
    case 'single-12mp-lidar':
      return `${config.modelName} uses a single 12MP Wide rear camera with LiDAR tested separately.`;
    default:
      return `${config.modelName} uses the rear-camera layout confirmed for this model, and we test the relevant camera path separately during diagnosis.`;
  }
}

export function buildIpadBackCameraReplacementPocket(config: IpadHardwareConfig): IpadEnhancedSeoPocket {
  const rearCameraSummary = getIpadRearCameraSystemSummary(config);
  const supportLabel = getIpadSupportLabel(config) ?? undefined;
  const biometricTestLabel = getIpadBiometricTestLabel(config);
  const dualCameraSentence =
    config.rearCameraSystem === 'dual-wide-ultra-wide-lidar'
      ? 'Wide camera, Ultra Wide camera, and LiDAR are checked separately because rear-camera replacement does not automatically repair every imaging path.'
      : config.rearCameraSystem === 'single-12mp-lidar'
        ? 'The single Wide rear camera and LiDAR path are checked separately because LiDAR is not assumed to be repaired with the camera module.'
        : 'External lens-area damage is checked separately so a camera-module replacement is not assumed before diagnosis confirms the cause.';

  return {
    modelSlug: config.modelSlug,
    modelName: config.modelName,
    repairType: 'back-camera-replacement',
    metaTitle: `${config.modelName} Back Camera Replacement in Ringwood | Ali Mobile & Repair`,
    metaDescription: `${config.modelName} back camera replacement in Ringwood with checks for blur, focus problems, black preview, lens-area damage, and related camera hardware before repair.`,
    heroSubtitle:
      `Bring your ${config.modelName} to ${ALI_MOBILE_IPAD_BUSINESS.businessName} at ${ALI_MOBILE_IPAD_BUSINESS.locationShort} for rear-camera diagnosis, live pricing, and booking support.`,
    schemaDescription:
      `Back camera replacement for ${config.modelName} in Ringwood with diagnosis of blur, focus faults, black preview, lens-area damage, and related camera hardware before confirming repair.`,
    supportLabel,
    quickAnswer:
      `${config.modelName} rear-camera faults are checked carefully because black preview, blur, focus hunting, spots, or video issues can still be caused by the camera module, the external lens area, settings, permissions, or another hardware path. ${dualCameraSentence}`,
    workbenchHeadings: {
      options: `What does the technician confirm before ${config.modelName} back-camera repair?`,
      diagnostics: 'How is the rear-camera fault confirmed step by step?',
      symptoms: `Which ${config.modelName} back-camera symptoms matter most?`,
      outcomes: 'What can expand the rear-camera repair scope?',
    },
    repairOptions: [
      {
        name: 'Rear-camera image diagnosis',
        shortDescription:
          'We check black preview, blur, focus hunting, shaking, spots, app freezing, and switching behavior before confirming a hardware replacement path.',
        bestFor:
          'Photo and video faults, blurry image, unstable focus, camera-app freezing, or a rear camera that will not open reliably.',
        notes:
          'The rear-camera path is not confirmed until software-related causes and external damage are also considered.',
      },
      {
        name: 'Lens-area and housing inspection',
        shortDescription:
          'We inspect the external lens area, surrounding housing, and visible impact because external damage does not always mean the camera module itself has failed.',
        bestFor:
          'Cracked lens-area glass, dents around the camera opening, or damage that started after a drop.',
        notes:
          'Lens-area damage and module failure are separated during diagnosis before repair is approved.',
      },
      {
        name: 'Model-specific camera-system checks',
        shortDescription:
          `${config.modelName} uses ${rearCameraSummary}. ${dualCameraSentence}`,
        bestFor:
          'Customers who want the camera layout and testing differences explained clearly before the quote is approved.',
        notes:
          'We use only the camera details confirmed for this model when describing the repair scope.',
      },
      {
        name: 'Post-repair imaging tests',
        shortDescription:
          `After repair we retest the repaired camera path, image clarity, focus behavior, video capture, switching behavior, and ${biometricTestLabel.toLowerCase()} where relevant before handover.`,
        bestFor:
          'Customers who want the main photo and video functions rechecked before pickup.',
        notes:
          'Any separate LiDAR, Ultra Wide, software, or board-related limitation is explained clearly before the iPad leaves the bench.',
      },
    ],
    commonProblems: [
      {
        title: 'Black rear-camera preview',
        description:
          'A black preview can come from the camera module, software state, permissions, or another hardware issue, so the fault is reproduced before replacement is quoted.',
      },
      {
        title: 'Blurry image',
        description:
          'Blur can be constant or intermittent, and it still needs to be separated from lens-area damage, focus issues, or software behavior.',
      },
      {
        title: 'Focus hunting',
        description:
          'If focus keeps moving without locking properly, we confirm whether the problem matches the camera module or another related cause.',
      },
      {
        title: 'Fixed black marks or spots',
        description:
          'Persistent marks or spots can point to camera-path damage, but the lens area and external contamination are still checked first.',
      },
      {
        title: 'Video flickering',
        description:
          'Flicker or unstable video can be hardware-related, but the symptom still needs to be reproduced and tested in context before parts are fitted.',
      },
      {
        title: 'Camera application freezing',
        description:
          'App freezing when opening the rear camera or switching modes can involve software or a broader camera-path issue, so diagnosis comes first.',
      },
      {
        title: 'Front and rear switching failure',
        description:
          'Switching between cameras can fail because of the rear camera path, the front camera path, or app behavior, so that overlap is checked before quoting.',
      },
      {
        title: 'External lens-area damage',
        description:
          'Damage around the outer lens area does not automatically prove the camera module itself has failed, so both are inspected separately.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: `Confirm the exact ${config.modelName} model`,
        description:
          'We confirm the exact iPad model first so the camera layout, LiDAR wording, and bench tests match the correct device.',
      },
      {
        step: '02',
        title: 'Inspect the frame, display, and impact history',
        description:
          'We inspect the housing, camera area, lens area, and visible impact history before the iPad is opened.',
      },
      {
        step: '03',
        title: 'Reproduce the reported rear-camera fault',
        description:
          'We reproduce black preview, blur, focus hunting, image spots, video flicker, and switching issues on the bench.',
      },
      {
        step: '04',
        title: 'Test related functions',
        description:
          'We test relevant camera modes, switching behavior, app access, and the related imaging paths that could overlap with the complaint.',
      },
      {
        step: '05',
        title: 'Distinguish the likely camera or broader cause',
        description:
          'We separate camera-module faults from external lens-area damage, software issues, connector faults, and any separate LiDAR or secondary-camera path before quoting replacement.',
      },
      {
        step: '06',
        title: 'Confirm the repair approach with the customer',
        description:
          'We explain whether rear-camera replacement is appropriate, what is being repaired, and what still needs separate testing before work begins.',
      },
      {
        step: '07',
        title: 'Perform post-repair functional checks',
        description:
          `After repair we retest the repaired camera path, image clarity, focus behavior, video capture, relevant switching behavior, and ${biometricTestLabel.toLowerCase()} before handover.`,
      },
    ],
    modelSpecificNotes: {
      kicker: 'Model-specific repair notes',
      heading: `${config.modelName} back-camera repair notes`,
      intro:
        `This page uses the confirmed rear-camera details for ${config.modelName} so the repair wording stays aligned with the actual iPad hardware.`,
      items: [
        `${config.modelName} uses ${rearCameraSummary}.`,
        dualCameraSentence,
        config.rearCameraSystem === 'single-12mp-lidar'
          ? 'This M4 iPad Pro rear camera wording stays focused on the single Wide camera and LiDAR.'
          : config.rearCameraSystem === 'dual-wide-ultra-wide-lidar'
            ? 'Wide and Ultra Wide faults are considered separately during diagnosis, and LiDAR is never described as included in camera replacement.'
            : 'Rear-camera repair wording stays focused on the single-camera path for this model, without adding unsupported Ultra Wide or LiDAR claims.',
        'External lens-area damage is checked separately so the camera module is not blamed automatically before diagnosis confirms the fault.',
      ],
    },
    repairLimitations: {
      kicker: 'Repair limitations',
      heading: `What can limit ${config.modelName} back-camera repair`,
      intro:
        'Rear-camera replacement is confirmed only after external damage, software overlap, and camera-system differences have been considered.',
      items: [
        'Permissions, settings, and application behavior can still affect rear-camera use even when the camera module itself is working normally.',
        'Connector or board-related faults can mimic a simple rear-camera problem and may require broader diagnosis.',
        'External lens-area damage and camera-module damage are not treated as the same thing until the iPad is inspected.',
        config.hasLidar
          ? 'LiDAR requires separate testing and is never assumed to be repaired through rear-camera replacement alone.'
          : 'Turnaround still depends on diagnosis and part availability rather than a fixed timeline.',
        config.rearCameraSystem === 'dual-wide-ultra-wide-lidar'
          ? 'Wide and Ultra Wide problems can differ, so a single repair claim is not made until the exact faulty path is confirmed.'
          : 'The exact repair scope depends on the confirmed faulty camera path rather than the visible symptom alone.',
      ],
    },
    localService: {
      kicker: 'Ringwood iPad support',
      heading: `Bring your ${config.modelName} to Ringwood Square for rear-camera diagnosis`,
      intro:
        `${ALI_MOBILE_IPAD_BUSINESS.businessName} works from ${ALI_MOBILE_IPAD_BUSINESS.locationName} in ${ALI_MOBILE_IPAD_BUSINESS.locality}. ${getIpadLocalSuburbReference('back-camera-replacement')}`,
      items: [
        'If the issue started after impact around the camera area, bring the iPad in without trying to pry at the lens area first.',
        'If the symptom only appears in one camera mode, having that ready to show on the bench can help diagnosis.',
        `Call ${ALI_MOBILE_IPAD_BUSINESS.phone} or book online if you want help checking likely camera availability before travelling.`,
      ],
    },
    finalCta: {
      kicker: 'Next step',
      heading: `Ready to organise ${config.modelName} back-camera repair?`,
      body:
        'You can book the repair, request a quote through the existing system, call the store, or walk in for a camera diagnosis first. We confirm the faulty rear-camera path before parts are fitted.',
      bullets: [
        'Book Repair for the exact iPad model and rear-camera path.',
        `Call ${ALI_MOBILE_IPAD_BUSINESS.phone} if you want to describe blur, focus issues, or lens-area damage first.`,
        'Visit the Ringwood store if the iPad has visible damage around the rear-camera area or if the problem only appears in certain camera modes.',
      ],
    },
    faq: [
      {
        question: getRearCameraFaqHeading(config),
        answer: getRearCameraLayoutAnswer(config),
      },
      {
        question: config.hasLidar
          ? `Is LiDAR included in ${config.modelName} camera replacement?`
          : `Can external lens-area damage cause the rear-camera problem on ${config.modelName}?`,
        answer: config.hasLidar
          ? 'No. LiDAR is tested separately. Rear-camera replacement is not described as LiDAR repair unless diagnosis proves that a separate LiDAR issue also needs attention.'
          : 'Yes. External lens-area damage can affect image quality or access to the camera path, but it does not automatically prove the camera module itself has failed.',
      },
      {
        question: `Why are photos still blurry on ${config.modelName} even after cleaning the lens area?`,
        answer:
          'If the blur remains after the outer area is cleaned, the fault may still be inside the camera path or related to focus behavior. We diagnose that before quoting replacement.',
      },
      {
        question: `Should I back up my ${config.modelName} before bringing it in?`,
        answer:
          'Backing up your iPad data before any repair is always recommended whenever the device still powers on and functions well enough to do so.',
      },
      {
        question: `How is the faulty camera component identified on ${config.modelName}?`,
        answer:
          'We confirm the exact model, reproduce the rear-camera symptom, test relevant camera modes and switching behavior, inspect the lens area, and then separate the likely faulty path before quoting replacement.',
      },
      {
        question: config.rearCameraSystem === 'dual-wide-ultra-wide-lidar'
          ? `Are the Wide and Ultra Wide rear cameras tested separately on ${config.modelName}?`
          : `What is tested after ${config.modelName} back-camera repair?`,
        answer: config.rearCameraSystem === 'dual-wide-ultra-wide-lidar'
          ? 'Yes. Wide, Ultra Wide, and LiDAR are checked as separate paths during diagnosis and post-repair testing where relevant.'
          : `After repair we retest the repaired camera path, image clarity, focus behavior, video capture, and ${biometricTestLabel.toLowerCase()} where relevant before handover.`,
      },
      {
        question: `Can front and rear switching faults on ${config.modelName} still be software-related?`,
        answer:
          'Yes. Switching faults can involve the app, settings, the front camera path, the rear camera path, or another hardware issue, so we confirm the cause before fitting parts.',
      },
    ],
  };
}
