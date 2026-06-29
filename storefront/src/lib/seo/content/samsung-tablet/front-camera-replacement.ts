import type {
  SamsungTabletEnhancedSeoPocket,
  SamsungTabletModelConfig,
} from './types';
import {
  buildSamsungTabletDiagnosticProcessSection,
  buildSamsungTabletFinalCtaSection,
  buildSamsungTabletHeroSubtitle,
  buildSamsungTabletLocalServiceSection,
  buildSamsungTabletMetaDescription,
  buildSamsungTabletMetaTitle,
  buildSamsungTabletSchemaDescription,
  buildSamsungTabletServiceSection,
  getSamsungTabletPostRepairChecks,
  getSamsungTabletSupportLabel,
} from './shared';

export function buildSamsungTabletFrontCameraReplacementPocket(
  config: SamsungTabletModelConfig
): SamsungTabletEnhancedSeoPocket {
  const diagnosticSteps = [
    {
      step: '01',
      title: 'Confirm the exact Galaxy Tab model and model code',
      description: `We confirm the exact ${config.modelName} version and model code before the front-camera repair path is approved.`,
    },
    {
      step: '02',
      title: 'Review the reported camera problem',
      description: 'We check what happens during camera use, app switching, and video calls before the repair path is confirmed.',
    },
    {
      step: '03',
      title: 'Test the affected function',
      description: 'We test the front-camera preview, image quality, and app behaviour before confirming the next step.',
    },
    {
      step: '04',
      title: 'Check the related tablet functions',
      description: 'We check video-call behaviour, camera switching, and microphone basics as part of the front-camera diagnosis.',
    },
    {
      step: '05',
      title: 'Confirm the suitable repair option and existing price or quote',
      description: 'We explain the suitable front-camera repair option and keep the live price or quote route visible before work begins.',
    },
    {
      step: '06',
      title: 'Complete the approved repair',
      description: 'Once approved, we complete the repair using the path confirmed for that Galaxy Tab model.',
    },
    {
      step: '07',
      title: 'Perform post-repair function checks',
      description: `Before pickup, we retest ${getSamsungTabletPostRepairChecks('front-camera-replacement')}.`,
    },
  ] as const;

  return {
    modelSlug: config.modelSlug,
    modelName: config.modelName,
    repairType: 'front-camera-replacement',
    metaTitle: buildSamsungTabletMetaTitle(config, 'front-camera-replacement'),
    metaDescription: buildSamsungTabletMetaDescription(config, 'front-camera-replacement'),
    heroSubtitle: buildSamsungTabletHeroSubtitle(config, 'front-camera-replacement'),
    schemaDescription: buildSamsungTabletSchemaDescription(config, 'front-camera-replacement'),
    supportLabel: getSamsungTabletSupportLabel(config),
    quickAnswer: `${config.modelName} front-camera replacement helps when the front camera shows a black preview, video calls look blurry, the camera will not open, or camera switching freezes. At Ali Mobile & Repair we confirm the exact Galaxy Tab model and model code, inspect the fault before the repair option is confirmed, and test the related functions after repair. Customers can book online or visit our Ringwood store for inspection.`,
    workbenchHeadings: {
      options: `What do we check before ${config.modelName} front-camera replacement?`,
      diagnostics: 'How do we confirm the front-camera repair path?',
      symptoms: 'Which front-camera symptoms matter most?',
      outcomes: 'What is tested after the front-camera repair?',
    },
    repairOptions: [
      {
        name: 'Front-camera preview assessment',
        shortDescription: 'We check black preview, blur, unusual colour, app access, and switching behaviour before we confirm the repair path.',
        bestFor: 'Black preview, blurry video calls, camera launch issues, or unstable camera switching.',
        notes: 'The front-camera path is checked directly before the suitable repair option is approved.',
      },
      {
        name: 'Model-code matching and inspection',
        shortDescription: `We confirm the exact ${config.modelName} model code so the camera repair information matches the correct Galaxy Tab version.`,
        bestFor: 'Customers who want the repair path matched carefully to the exact Galaxy Tab variant they are bringing in.',
        notes: 'We keep the existing price or quote route visible before the repair is approved.',
      },
      {
        name: 'Post-repair camera checks',
        shortDescription: `After repair we retest ${getSamsungTabletPostRepairChecks('front-camera-replacement')} before pickup.`,
        bestFor: 'Customers who want the main camera and video-call behaviour checked before they collect the tablet.',
        notes: 'Booking, quote, and store-visit options stay available through the current system.',
      },
    ],
    commonProblems: [
      { title: 'Front camera shows a black preview', description: 'The front camera opens but does not show a normal live image.' },
      { title: 'Video-call image is blurry', description: 'The front camera image may stay soft or unclear during calls or recording.' },
      { title: 'Camera will not open', description: 'The tablet may fail to launch the front camera normally when the app is opened.' },
      { title: 'Camera switching freezes', description: 'Switching between the front and rear cameras can stall or stop responding normally.' },
      { title: 'Image contains fixed marks or unusual colour', description: 'A front-camera issue can show fixed spots, unusual colour, or abnormal preview behaviour.' },
      { title: 'Video-call apps cannot use the camera normally', description: 'If video-call apps cannot use the front camera as expected, we inspect the front-camera path before confirming repair.' },
    ],
    diagnosticSteps: [...diagnosticSteps],
    diagnosticProcess: buildSamsungTabletDiagnosticProcessSection(config, 'front-camera-replacement', diagnosticSteps),
    serviceSection: buildSamsungTabletServiceSection(config, 'front-camera-replacement'),
    localService: buildSamsungTabletLocalServiceSection(config, 'front-camera-replacement'),
    finalCta: buildSamsungTabletFinalCtaSection(config, 'front-camera-replacement'),
    faq: [
      {
        question: `Why is the front camera showing a black screen on ${config.modelName}?`,
        answer: 'We inspect the live front-camera preview, camera switching, and app behaviour before we confirm the suitable repair path for the tablet.',
      },
      {
        question: 'Can app permissions affect video calls?',
        answer: 'Yes. App permissions and settings can affect camera access, which is why we check live camera behaviour before confirming the repair option.',
      },
      {
        question: `What camera and video-call functions are tested after ${config.modelName} front-camera replacement?`,
        answer: 'We retest camera preview, video-call behaviour, camera switching, and microphone basics before the tablet is ready for pickup.',
      },
      {
        question: `How do I confirm my exact Galaxy Tab model before booking?`,
        answer: `If you are unsure, bring the tablet in and we will confirm the exact ${config.modelName} model and matching model-code family before the repair is approved.`,
      },
      {
        question: `How is the correct front-camera repair option confirmed?`,
        answer: 'We inspect the reported fault first, test live camera behaviour, and then explain the suitable repair option through the current price or quote path.',
      },
      {
        question: `Should I back up my tablet before bringing it in?`,
        answer: 'Yes. If the tablet still powers on, backing up important data before the visit is a practical step whenever you can.',
      },
      {
        question: `Can I book this Samsung Tablet front-camera repair online?`,
        answer: 'Yes. You can book online through the current booking flow, call 0481 058 514, or visit Ali Mobile & Repair at Ringwood Square for inspection first.',
      },
    ],
  };
}

