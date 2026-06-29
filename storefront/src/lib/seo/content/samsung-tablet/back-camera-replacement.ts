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

export function buildSamsungTabletBackCameraReplacementPocket(
  config: SamsungTabletModelConfig
): SamsungTabletEnhancedSeoPocket {
  const diagnosticSteps = [
    {
      step: '01',
      title: 'Confirm the exact Galaxy Tab model and model code',
      description: `We confirm the exact ${config.modelName} version and model code before the rear-camera repair path is approved.`,
    },
    {
      step: '02',
      title: 'Review the reported camera problem',
      description: 'We check what happens during photos, focus, and video use before the repair path is confirmed.',
    },
    {
      step: '03',
      title: 'Test the affected function',
      description: 'We test the rear-camera preview, image clarity, focus behaviour, and video before confirming the next step.',
    },
    {
      step: '04',
      title: 'Check the related tablet functions',
      description: 'We check camera switching and the wider rear-camera behaviour during the inspection process.',
    },
    {
      step: '05',
      title: 'Confirm the suitable repair option and existing price or quote',
      description: 'We explain the suitable rear-camera repair option and keep the live price or quote route visible before work begins.',
    },
    {
      step: '06',
      title: 'Complete the approved repair',
      description: 'Once approved, we complete the repair using the path confirmed for that Galaxy Tab model.',
    },
    {
      step: '07',
      title: 'Perform post-repair function checks',
      description: `Before pickup, we retest ${getSamsungTabletPostRepairChecks('back-camera-replacement')}.`,
    },
  ] as const;

  return {
    modelSlug: config.modelSlug,
    modelName: config.modelName,
    repairType: 'back-camera-replacement',
    metaTitle: buildSamsungTabletMetaTitle(config, 'back-camera-replacement'),
    metaDescription: buildSamsungTabletMetaDescription(config, 'back-camera-replacement'),
    heroSubtitle: buildSamsungTabletHeroSubtitle(config, 'back-camera-replacement'),
    schemaDescription: buildSamsungTabletSchemaDescription(config, 'back-camera-replacement'),
    supportLabel: getSamsungTabletSupportLabel(config),
    quickAnswer: `${config.modelName} back-camera replacement helps when the rear camera shows a black preview, photos remain blurry, focus does not settle, or video becomes unstable. At Ali Mobile & Repair we confirm the exact Galaxy Tab model and model code, inspect the fault before the repair option is confirmed, and test the related functions after repair. Customers can book online or visit our Ringwood store for inspection.`,
    workbenchHeadings: {
      options: `What do we check before ${config.modelName} back-camera replacement?`,
      diagnostics: 'How do we confirm the rear-camera repair path?',
      symptoms: 'Which rear-camera symptoms matter most?',
      outcomes: 'What is tested after the rear-camera repair?',
    },
    repairOptions: [
      {
        name: 'Rear-camera preview and focus assessment',
        shortDescription: 'We check black preview, blur, focus behaviour, unusual image marks, and video response before we confirm the repair path.',
        bestFor: 'Black rear-camera preview, blurry photos, unstable focus, or video problems.',
        notes: 'Rear-camera faults are checked directly before the suitable repair option is approved.',
      },
      {
        name: 'Model-code matching and inspection',
        shortDescription: `We confirm the exact ${config.modelName} model code so the camera repair information matches the correct Galaxy Tab version.`,
        bestFor: 'Customers who want the repair path matched carefully to the exact Galaxy Tab variant they are bringing in.',
        notes: 'We keep the existing price or quote route visible before the repair is approved.',
      },
      {
        name: 'Post-repair camera checks',
        shortDescription: `After repair we retest ${getSamsungTabletPostRepairChecks('back-camera-replacement')} before pickup.`,
        bestFor: 'Customers who want the main rear-camera behaviour checked before they collect the tablet.',
        notes: 'Booking, quote, and store-visit options stay available through the current system.',
      },
    ],
    commonProblems: [
      { title: 'Rear camera shows a black preview', description: 'The rear camera opens but does not show a normal live image.' },
      { title: 'Photos remain blurry', description: 'The image can stay soft or unclear even when the camera area has already been cleaned.' },
      { title: 'Focus does not settle', description: 'The rear camera may keep searching for focus instead of locking clearly on the subject.' },
      { title: 'Fixed marks appear in photos', description: 'A rear-camera issue can show fixed spots or marks that stay visible across photos or video.' },
      { title: 'Video flickers', description: 'Video can become unstable or flicker during recording, which is checked directly during diagnosis.' },
      { title: 'Camera switching freezes', description: 'Switching between the front and rear cameras can stall or stop responding normally.' },
      { title: 'Rear camera will not open', description: 'If the rear camera will not open at all, we inspect the live fault before confirming repair.' },
    ],
    diagnosticSteps: [...diagnosticSteps],
    diagnosticProcess: buildSamsungTabletDiagnosticProcessSection(config, 'back-camera-replacement', diagnosticSteps),
    serviceSection: buildSamsungTabletServiceSection(config, 'back-camera-replacement'),
    localService: buildSamsungTabletLocalServiceSection(config, 'back-camera-replacement'),
    finalCta: buildSamsungTabletFinalCtaSection(config, 'back-camera-replacement'),
    faq: [
      {
        question: `Why are photos still blurry on ${config.modelName} after cleaning the camera area?`,
        answer: 'If the camera area has already been cleaned and the image still stays blurry, we inspect the live rear-camera behaviour before confirming the suitable repair path.',
      },
      {
        question: `How is the rear-camera fault checked on ${config.modelName}?`,
        answer: 'We confirm the exact Galaxy Tab model and model code, test the rear-camera preview, image quality, focus, and video behaviour, and then explain the suitable repair option through the current price or quote path.',
      },
      {
        question: `What photo, focus, and video functions are tested after ${config.modelName} back-camera replacement?`,
        answer: 'We retest image quality, focus, video capture, and camera switching before the tablet is ready for pickup.',
      },
      {
        question: `How do I confirm my exact Galaxy Tab model before booking?`,
        answer: `If you are unsure, bring the tablet in and we will confirm the exact ${config.modelName} model and matching model-code family before the repair is approved.`,
      },
      {
        question: `What symptoms can this repair help with on ${config.modelName}?`,
        answer: 'Common reasons for booking include black rear-camera preview, blurry photos, unstable focus, video flicker, fixed image marks, or a rear camera that will not open normally.',
      },
      {
        question: `Should I back up my tablet before bringing it in?`,
        answer: 'Yes. If the tablet still powers on, backing up important data before the visit is a practical step whenever you can.',
      },
      {
        question: `Can I book this Samsung Tablet back-camera repair online?`,
        answer: 'Yes. You can book online through the current booking flow, call 0481 058 514, or visit Ali Mobile & Repair at Ringwood Square for inspection first.',
      },
    ],
  };
}

