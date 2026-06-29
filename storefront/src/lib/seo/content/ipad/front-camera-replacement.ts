import type { IpadEnhancedSeoPocket, IpadHardwareConfig } from './types';
import {
  ALI_MOBILE_IPAD_BUSINESS,
  getIpadBiometricLabel,
  getIpadBiometricTestLabel,
  getIpadCenterStageSentence,
  getIpadFrontCameraPositionLabel,
  getIpadLocalSuburbReference,
  getIpadSupportLabel,
} from './shared';

function getFrontCameraAreaSentence(config: IpadHardwareConfig): string {
  if (config.biometricType === 'face-id') {
    return config.frontCameraPosition === 'landscape'
      ? 'The landscape TrueDepth area is checked carefully because camera and Face ID faults do not always share the same repair path.'
      : 'The TrueDepth area is checked carefully because camera and Face ID faults do not always share the same repair path.';
  }

  return config.frontCameraPosition === 'landscape'
    ? 'The landscape front-camera area and top-button path are checked carefully before the repair scope is confirmed.'
    : config.hasHomeButton
      ? 'The front-camera area and Home Button path are checked carefully before the repair scope is confirmed.'
      : 'The front-camera area and top-button path are checked carefully before the repair scope is confirmed.';
}

export function buildIpadFrontCameraReplacementPocket(config: IpadHardwareConfig): IpadEnhancedSeoPocket {
  const biometricLabel = getIpadBiometricLabel(config);
  const biometricTestLabel = getIpadBiometricTestLabel(config);
  const supportLabel = getIpadSupportLabel(config) ?? undefined;
  const landscapeSentence =
    config.frontCameraPosition === 'landscape'
      ? 'This model uses a landscape front camera, so impact and alignment checks focus on the long edge camera position.'
      : 'This model uses the traditional front-camera position, so impact and alignment checks stay focused on the usual camera area.';
  const faceIdSentence =
    config.biometricType === 'face-id'
      ? 'Face ID is tested separately and is never assumed as an automatic result of front-camera replacement.'
      : config.biometricType === 'home-button-touch-id'
        ? 'Home Button and current Touch ID state are checked separately because front-camera repair does not automatically restore unrelated biometric faults.'
        : 'The top button and current Touch ID state are checked separately because front-camera repair does not automatically restore unrelated biometric faults.';

  return {
    modelSlug: config.modelSlug,
    modelName: config.modelName,
    repairType: 'front-camera-replacement',
    metaTitle: `${config.modelName} Front Camera Replacement in Ringwood | Ali Mobile & Repair`,
    metaDescription: `${config.modelName} front camera replacement in Ringwood with checks for black preview, blur, app-use faults, permissions, and nearby hardware before repair.`,
    heroSubtitle:
      `Bring your ${config.modelName} to ${ALI_MOBILE_IPAD_BUSINESS.businessName} at ${ALI_MOBILE_IPAD_BUSINESS.locationShort} for front-camera diagnosis, live pricing, and booking support.`,
    schemaDescription:
      `Front camera replacement for ${config.modelName} in Ringwood with diagnosis of preview failure, blur, app-use issues, settings, and nearby hardware before confirming repair.`,
    supportLabel,
    quickAnswer:
      `${config.modelName} front-camera faults are checked carefully because a black preview, blur, app failure, or unstable video-call behavior can still be caused by permissions, settings, software state, or nearby hardware. ${getIpadCenterStageSentence(config)} ${faceIdSentence}`,
    workbenchHeadings: {
      options: `What does the technician confirm before ${config.modelName} front-camera repair?`,
      diagnostics: 'How is the front-camera fault confirmed step by step?',
      symptoms: `Which ${config.modelName} front-camera symptoms matter most?`,
      outcomes: 'What can expand the front-camera repair scope?',
    },
    repairOptions: [
      {
        name: 'Preview and app behavior diagnosis',
        shortDescription:
          'We check black preview, blur, flicker, image marks, camera-app failure, and video-call use before confirming a hardware replacement path.',
        bestFor:
          'Selfie issues, app crashes when switching cameras, blurry calls, or a camera that will not open consistently.',
        notes:
          'The camera path is not confirmed until software-related causes have also been considered.',
      },
      {
        name: 'Model-specific front-area inspection',
        shortDescription:
          `${landscapeSentence} ${getFrontCameraAreaSentence(config)}`,
        bestFor:
          'Impact around the front-camera opening, top edge damage, or concern about nearby biometric hardware.',
        notes:
          'We use the confirmed front-camera placement for this model rather than generic iPad wording.',
      },
      {
        name: 'Center Stage and biometric checks',
        shortDescription:
          `${getIpadCenterStageSentence(config)} ${faceIdSentence}`,
        bestFor:
          'Camera complaints that also involve framing behavior, Face ID concern, or uncertainty about how the front-camera path is tested.',
        notes:
          'Center Stage behavior is still checked in context of app support and current settings where the model supports it.',
      },
      {
        name: 'Post-repair front-camera testing',
        shortDescription:
          `After repair we retest front-camera preview, image clarity, camera switching, video-call use, and ${biometricTestLabel.toLowerCase()} before handover.`,
        bestFor:
          'Customers who want the main camera and nearby functions rechecked before pickup.',
        notes:
          'Any remaining software or board-related limitation is explained clearly before the iPad is handed back.',
      },
    ],
    commonProblems: [
      {
        title: 'Black camera preview',
        description:
          'A black preview can come from the camera module, settings, app behavior, or another hardware issue, so we reproduce the fault before quoting replacement.',
      },
      {
        title: 'Blurry image',
        description:
          'Blur can be constant or intermittent, and the cause still needs to be separated from software, lens contamination, or impact around the camera area.',
      },
      {
        title: 'Camera will not open',
        description:
          'If the camera app or another app will not open the front camera, we still check permissions and software state before approving a hardware path.',
      },
      {
        title: 'Camera switching freezes',
        description:
          'Freezing when switching between front and rear cameras can still involve the app, the camera path, or another hardware overlap.',
      },
      {
        title: 'Fixed marks or abnormal colour',
        description:
          'Persistent marks or unusual colour can point to the camera path itself, but we still confirm the fault on the bench before quoting replacement.',
      },
      {
        title: 'Video-call applications cannot use the camera',
        description:
          'A front-camera problem can appear only in specific apps, which is why app support, permissions, and current settings are considered during diagnosis.',
      },
      {
        title: 'Flickering image',
        description:
          'Flicker or unstable front-camera preview can be hardware-related, but the symptom still needs to be reproduced and checked in more than one app when possible.',
      },
      {
        title: config.supportsCenterStage ? 'Center Stage behavior concern' : 'Front-camera area impact concern',
        description: config.supportsCenterStage
          ? 'Center Stage behavior is checked in context of app support and settings because framing complaints are not always caused by the camera module alone.'
          : 'Impact around the front-camera area can affect the repair scope even when the main complaint is blur or a black preview.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: `Confirm the exact ${config.modelName} model`,
        description:
          'We confirm the exact iPad model first so the camera placement, Center Stage wording, and nearby hardware tests match the correct device.',
      },
      {
        step: '02',
        title: 'Inspect the frame, display, and impact history',
        description:
          'We inspect visible impact, frame stress, and nearby front-camera-area damage before the iPad is opened.',
      },
      {
        step: '03',
        title: 'Reproduce the reported front-camera fault',
        description:
          'We reproduce black preview, blur, app-use issues, switching freezes, colour problems, and video-call complaints on the bench.',
      },
      {
        step: '04',
        title: 'Test related functions',
        description:
          `We test app permissions, switching behavior, current settings, video-call use where practical, and ${biometricTestLabel.toLowerCase()}.`,
      },
      {
        step: '05',
        title: 'Distinguish the likely camera or broader cause',
        description:
          'We separate the likely camera fault from app behavior, settings, connector issues, board-level faults, and nearby biometric hardware overlap before quoting replacement.',
      },
      {
        step: '06',
        title: 'Confirm the repair approach with the customer',
        description:
          'We explain whether front-camera replacement is appropriate, what still requires separate testing, and the practical repair scope before work begins.',
      },
      {
        step: '07',
        title: 'Perform post-repair functional checks',
        description:
          `After repair we retest the front camera, camera switching, video-call use where practical, and ${biometricTestLabel.toLowerCase()} before handover.`,
      },
    ],
    modelSpecificNotes: {
      kicker: 'Model-specific repair notes',
      heading: `${config.modelName} front-camera repair notes`,
      intro:
        `This page uses the confirmed front-camera details for ${config.modelName} so the repair wording stays aligned with the actual iPad hardware.`,
      items: [
        `${config.modelName} uses ${config.frontCameraDescription}${config.frontCameraPosition === 'landscape' ? ' in a landscape front-camera layout' : ''}.`,
        `${config.modelName} uses ${getIpadFrontCameraPositionLabel(config)} and ${biometricLabel}.`,
        config.supportsCenterStage
          ? `${config.modelName} supports Center Stage, but Center Stage behavior can still depend on app support, settings, and current software state.`
          : `${config.modelName} does not support Center Stage, so we keep the diagnosis focused on the front-camera path, app permissions, and nearby hardware.`,
        faceIdSentence,
        landscapeSentence,
      ],
    },
    repairLimitations: {
      kicker: 'Inspection process',
      heading: `How we confirm ${config.modelName} front-camera repair`,
      intro:
        'Front-camera replacement is confirmed only after software and nearby hardware overlap have been considered.',
      items: [
        'Permissions, settings, and app support can still affect front-camera behavior even when the camera module is working normally.',
        'Connector or board-related faults can mimic a simple front-camera problem and may require broader diagnosis.',
        config.biometricType === 'face-id'
          ? 'Face ID requires separate testing and is never assumed through front-camera replacement alone.'
          : `${biometricLabel} requires separate testing and is not automatically restored through front-camera replacement alone.`,
        config.supportsCenterStage
          ? 'Center Stage behavior can still vary by app support, settings, and software state after the camera path is repaired.'
          : 'External impact around the front-camera area can expand the repair scope beyond the camera module itself.',
        'Turnaround depends on diagnosis and part availability rather than a fixed timeline.',
      ],
    },
    localService: {
      kicker: 'Ringwood iPad support',
      heading: `Bring your ${config.modelName} to Ringwood Square for front-camera diagnosis`,
      intro:
        `${ALI_MOBILE_IPAD_BUSINESS.businessName} works from ${ALI_MOBILE_IPAD_BUSINESS.locationName} in ${ALI_MOBILE_IPAD_BUSINESS.locality}. ${getIpadLocalSuburbReference('front-camera-replacement')}`,
      items: [
        'If the issue appears mainly in one app, having that symptom ready to show in store can help the bench diagnosis.',
        'If the iPad has visible damage near the front-camera area, bring it in as it is so the overlap can be inspected properly.',
        `Call ${ALI_MOBILE_IPAD_BUSINESS.phone} or book online if you want help checking likely front-camera availability before travelling.`,
      ],
    },
    finalCta: {
      kicker: 'Next step',
      heading: `Ready to organise ${config.modelName} front-camera repair?`,
      body:
        'You can book the repair, request a quote through the existing system, call the store, or walk in for a camera diagnosis first. We confirm the front-camera scope before parts are fitted.',
      bullets: [
        'Book Repair for the exact iPad model and front-camera path.',
        `Call ${ALI_MOBILE_IPAD_BUSINESS.phone} if you want to describe black preview, blur, or video-call issues first.`,
        'Visit the Ringwood store if the symptom only appears in one app or after visible impact around the camera area.',
      ],
    },
    faq: [
      {
        question: `Does ${config.modelName} support Center Stage?`,
        answer: config.supportsCenterStage
          ? `${config.modelName} does support Center Stage, although the exact behavior can still depend on app support, settings, and the current software state.`
          : `No. ${config.modelName} does not support Center Stage, so the diagnosis stays focused on the front-camera path, app permissions, and nearby hardware.`,
      },
      {
        question: `Can software permissions cause a black front-camera screen on ${config.modelName}?`,
        answer:
          'Yes. Permissions, settings, and app behavior can all affect whether the front camera opens properly, so we check those before confirming hardware replacement.',
      },
      {
        question: config.biometricType === 'face-id'
          ? `Can a front-camera problem affect Face ID on ${config.modelName}?`
          : `Will ${config.modelName} Touch ID be tested during front-camera repair?`,
        answer: config.biometricType === 'face-id'
          ? 'It can overlap, which is why Face ID is tested separately. Front-camera replacement never assumes Face ID restoration by itself.'
          : `${biometricLabel} is tested separately, but front-camera replacement does not automatically restore unrelated biometric faults.`,
      },
      {
        question: `Does ${config.modelName} use a landscape front camera?`,
        answer: config.frontCameraPosition === 'landscape'
          ? `Yes. ${config.modelName} uses a landscape front camera, so inspection and alignment checks follow that camera position.`
          : `No. ${config.modelName} uses the traditional front-camera position rather than a landscape camera layout.`,
      },
      {
        question: `Will the screen need to be opened for ${config.modelName} front-camera repair?`,
        answer:
          'Inspection and repair access still depend on the model and the confirmed fault path. We explain the practical repair scope before work begins.',
      },
      {
        question: `Should I back up my ${config.modelName} before bringing it in?`,
        answer:
          'Backing up your iPad data before any repair is always recommended whenever the device still powers on and functions well enough to do so.',
      },
      {
        question: `What is tested after ${config.modelName} front-camera repair?`,
        answer:
          `We retest front-camera preview, image clarity, camera switching, video-call use where practical, and ${biometricTestLabel.toLowerCase()} before handover.`,
      },
    ],
  };
}
