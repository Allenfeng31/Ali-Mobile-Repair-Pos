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

export function buildSamsungTabletScreenReplacementPocket(
  config: SamsungTabletModelConfig
): SamsungTabletEnhancedSeoPocket {
  const diagnosticSteps = [
    {
      step: '01',
      title: 'Confirm the exact Galaxy Tab model and model code',
      description: `We confirm the exact ${config.modelName} version and matching model code before the screen repair path is approved.`,
    },
    {
      step: '02',
      title: 'Review the reported screen problem',
      description: 'We check how the damage happened and which parts of the display or touch response are still working now.',
    },
    {
      step: '03',
      title: 'Test the affected function',
      description: 'We test the display image, touch response, brightness, and the visible fault before confirming the next step.',
    },
    {
      step: '04',
      title: 'Check the related tablet functions',
      description: 'We check the camera areas and charging response so the wider screen-related behaviour is understood before repair.',
    },
    {
      step: '05',
      title: 'Confirm the suitable repair option and existing price or quote',
      description: 'We explain the suitable screen repair path and keep the live price or quote route visible before work begins.',
    },
    {
      step: '06',
      title: 'Complete the approved repair',
      description: 'Once approved, we complete the screen repair using the repair path confirmed for that Galaxy Tab model.',
    },
    {
      step: '07',
      title: 'Perform post-repair function checks',
      description: `Before pickup, we retest ${getSamsungTabletPostRepairChecks('screen-replacement')}.`,
    },
  ] as const;

  return {
    modelSlug: config.modelSlug,
    modelName: config.modelName,
    repairType: 'screen-replacement',
    metaTitle: buildSamsungTabletMetaTitle(config, 'screen-replacement'),
    metaDescription: buildSamsungTabletMetaDescription(config, 'screen-replacement'),
    heroSubtitle: buildSamsungTabletHeroSubtitle(config, 'screen-replacement'),
    schemaDescription: buildSamsungTabletSchemaDescription(config, 'screen-replacement'),
    supportLabel: getSamsungTabletSupportLabel(config),
    quickAnswer: `${config.modelName} screen replacement helps with cracked glass, black display faults, touch issues, lines, flickering, and colour or brightness problems. At Ali Mobile & Repair we confirm the exact Galaxy Tab model and model code, inspect the fault before the repair option is confirmed, and test the related functions after repair. Customers can book online or visit our Ringwood store for inspection.`,
    workbenchHeadings: {
      options: `What do we check before ${config.modelName} screen replacement?`,
      diagnostics: 'How do we confirm the correct screen repair path?',
      symptoms: 'Which screen symptoms matter most?',
      outcomes: 'What is tested after the screen repair?',
    },
    repairOptions: [
      {
        name: 'Display and touch assessment',
        shortDescription: 'We check cracked glass, black display behaviour, touch response, flicker, and visible image faults before we confirm the repair path.',
        bestFor: 'Cracked glass, display image issues, touch dead zones, or unstable touch behaviour.',
        notes: 'The suitable screen repair option is confirmed after the live fault is inspected on the bench.',
      },
      {
        name: 'Model-code matching and inspection',
        shortDescription: `We confirm the exact ${config.modelName} model code so the screen repair information matches the correct Galaxy Tab version.`,
        bestFor: 'Customers who want the repair path matched carefully to the exact Galaxy Tab variant they are bringing in.',
        notes: 'We keep the existing price or quote route visible before the repair is approved.',
      },
      {
        name: 'Post-repair function testing',
        shortDescription: `After repair we retest ${getSamsungTabletPostRepairChecks('screen-replacement')} before pickup.`,
        bestFor: 'Customers who want the main daily-use functions checked before they collect the tablet.',
        notes: 'Booking, quote, and store-visit options stay available through the current system.',
      },
    ],
    commonProblems: [
      { title: 'Cracked glass', description: 'Visible cracks can still leave part of the screen working, but they often overlap with touch or display faults that need closer testing.' },
      { title: 'Touch not responding', description: 'A Galaxy Tab screen can still light up while the touch layer stops responding normally.' },
      { title: 'Partial touch failure', description: 'Only one side of the panel may stop responding, which is why we test the full touch area before confirming the repair.' },
      { title: 'Ghost touch', description: 'Repeated taps, drifting touch, or unstable input can point to screen damage that needs model-aware inspection.' },
      { title: 'Black display', description: 'The tablet may still react to charging or power even when the display image is no longer usable.' },
      { title: 'Lines or flickering', description: 'Display lines, flicker, or unstable image behaviour are checked directly before the repair path is approved.' },
      { title: 'Colour or brightness issues', description: 'Unusual colour areas or weak brightness can be part of the same screen fault and are checked together during diagnosis.' },
      { title: 'Display works but touch does not', description: 'When the image still shows but touch does not respond normally, we confirm the correct repair path before work begins.' },
    ],
    diagnosticSteps: [...diagnosticSteps],
    diagnosticProcess: buildSamsungTabletDiagnosticProcessSection(config, 'screen-replacement', diagnosticSteps),
    serviceSection: buildSamsungTabletServiceSection(config, 'screen-replacement'),
    localService: buildSamsungTabletLocalServiceSection(config, 'screen-replacement'),
    finalCta: buildSamsungTabletFinalCtaSection(config, 'screen-replacement'),
    faq: [
      {
        question: `Why does the display work but touch not respond on ${config.modelName}?`,
        answer: 'That usually means the screen problem needs closer testing rather than a quick assumption. We inspect the live display and touch behaviour before confirming the repair path.',
      },
      {
        question: `How do you confirm the correct screen repair option for ${config.modelName}?`,
        answer: 'We confirm the exact Galaxy Tab model and model code, inspect the visible damage, test the display and touch response, and then explain the suitable repair option through the existing price or quote path.',
      },
      {
        question: `What display and touch functions are tested after ${config.modelName} screen replacement?`,
        answer: 'We retest the display image, touch response, brightness, cameras, and charging response before the tablet is ready for pickup.',
      },
      {
        question: `How do I confirm my exact Galaxy Tab model before booking?`,
        answer: `If you are unsure, bring the tablet in and we will confirm the exact ${config.modelName} model and model-code family before the repair is approved.`,
      },
      {
        question: `What symptoms can ${config.modelName} screen replacement help with?`,
        answer: 'Common reasons for booking include cracked glass, touch issues, black display faults, lines, flicker, and colour or brightness problems.',
      },
      {
        question: `Should I back up my tablet before bringing it in?`,
        answer: 'Yes. If the tablet still powers on, backing up important data before the visit is a practical step whenever you can.',
      },
      {
        question: `Can I book this Samsung Tablet screen repair online?`,
        answer: `Yes. You can book online through the current booking flow, call ${config.modelCodes[0] ? 'Ali Mobile & Repair' : 'the store'} on 0481 058 514, or visit the Ringwood Square store for inspection.`,
      },
    ],
  };
}

