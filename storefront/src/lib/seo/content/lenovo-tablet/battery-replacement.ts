import type {
  LenovoTabletEnhancedSeoPocket,
  LenovoTabletModelConfig,
} from './types';
import {
  buildLenovoTabletDiagnosticProcessSection,
  buildLenovoTabletFinalCtaSection,
  buildLenovoTabletHeroSubtitle,
  buildLenovoTabletLocalServiceSection,
  buildLenovoTabletMetaDescription,
  buildLenovoTabletMetaTitle,
  buildLenovoTabletSchemaDescription,
  buildLenovoTabletServiceSection,
  getLenovoTabletPostRepairChecks,
  getLenovoTabletSupportLabel,
} from './shared';

export function buildLenovoTabletBatteryReplacementPocket(
  config: LenovoTabletModelConfig
): LenovoTabletEnhancedSeoPocket {
  const diagnosticSteps = [
    {
      step: '01',
      title: 'Confirm the exact Lenovo tablet model and model code',
      description: `We confirm the exact ${config.modelName} version and model code before the battery repair path is approved.`,
    },
    {
      step: '02',
      title: 'Review the reported battery problem',
      description: 'We listen to the power, standby, heat, or charging behaviour the customer has noticed in normal use.',
    },
    {
      step: '03',
      title: 'Test the affected function',
      description: 'We check current battery behaviour, startup stability, and the way the tablet responds to charging.',
    },
    {
      step: '04',
      title: 'Check the related tablet functions',
      description: 'We check the charging response and related power behaviour before confirming that a battery repair is the right step.',
    },
    {
      step: '05',
      title: 'Confirm the suitable repair option and existing price or quote',
      description: 'We explain the suitable battery repair option and keep the live price or quote route visible before work begins.',
    },
    {
      step: '06',
      title: 'Complete the approved repair',
      description: 'Once approved, we complete the battery repair using the path confirmed for that Lenovo tablet model.',
    },
    {
      step: '07',
      title: 'Perform post-repair function checks',
      description: `Before handover, we retest ${getLenovoTabletPostRepairChecks('battery-replacement')}.`,
    },
  ] as const;

  return {
    modelSlug: config.modelSlug,
    modelName: config.modelName,
    repairType: 'battery-replacement',
    metaTitle: buildLenovoTabletMetaTitle(config, 'battery-replacement'),
    metaDescription: buildLenovoTabletMetaDescription(config, 'battery-replacement'),
    heroSubtitle: buildLenovoTabletHeroSubtitle(config, 'battery-replacement'),
    schemaDescription: buildLenovoTabletSchemaDescription(config, 'battery-replacement'),
    supportLabel: getLenovoTabletSupportLabel(config),
    quickAnswer: `${config.modelName} battery replacement helps when the tablet drains quickly, shuts down unexpectedly, shows unstable percentage behaviour, or no longer stays powered for normal use. At Ali Mobile & Repair we confirm the exact Lenovo tablet model and model code, inspect the reported power fault before the repair option is confirmed, and test the related functions after repair. Customers can book online or visit our Ringwood store for inspection.`,
    workbenchHeadings: {
      options: `What do we check before ${config.modelName} battery replacement?`,
      diagnostics: 'How do we confirm the battery repair path?',
      symptoms: 'Which battery symptoms matter most?',
      outcomes: 'What is tested after the battery repair?',
    },
    repairOptions: [
      {
        name: 'Battery and power-behaviour assessment',
        shortDescription: 'We check fast drain, shutdowns, unstable percentage changes, weak standby time, and unusual warmth before the repair path is confirmed.',
        bestFor: 'Battery drain, short run time, unstable percentage behaviour, or tablets that no longer stay powered normally.',
        notes: 'Charging behaviour is checked alongside battery symptoms before the repair is approved.',
      },
      {
        name: 'Model-code matching and inspection',
        shortDescription: `We confirm the exact ${config.modelName} model code so the battery repair information matches the correct Lenovo tablet version.`,
        bestFor: 'Customers who want the repair path matched carefully to the exact Lenovo tablet variant they are bringing in.',
        notes: 'We keep the existing price or quote route visible before the repair is approved.',
      },
      {
        name: 'Post-repair power checks',
        shortDescription: `After repair we retest ${getLenovoTabletPostRepairChecks('battery-replacement')} before handover.`,
        bestFor: 'Customers who want the main battery and charging behaviour checked before they collect the tablet.',
        notes: 'Booking, quote, and store-visit options stay available through the current system.',
      },
    ],
    commonProblems: [
      { title: 'Battery drains quickly', description: 'The tablet no longer lasts through normal use, even after a full charge.' },
      { title: 'Unexpected shutdown', description: 'The device turns off early or powers down before the battery level seems low enough to expect it.' },
      { title: 'Unstable percentage', description: 'Battery percentage can jump up or down suddenly during normal use or while charging.' },
      { title: 'Reduced standby time', description: 'The tablet loses charge too quickly while not in active use.' },
      { title: 'Slow charging progress', description: 'The battery level climbs too slowly even when the charging setup seems normal.' },
      { title: 'Tablet becomes unusually warm', description: 'Unusual warmth during charging or light use is checked along with the overall battery behaviour.' },
      { title: 'Tablet does not remain powered for normal use', description: 'The tablet may start, then drop power too quickly to be practical for everyday use.' },
    ],
    diagnosticSteps: [...diagnosticSteps],
    diagnosticProcess: buildLenovoTabletDiagnosticProcessSection(config, 'battery-replacement', diagnosticSteps),
    serviceSection: buildLenovoTabletServiceSection(config, 'battery-replacement'),
    localService: buildLenovoTabletLocalServiceSection(config, 'battery-replacement'),
    finalCta: buildLenovoTabletFinalCtaSection(config, 'battery-replacement'),
    faq: [
      {
        question: `What are common signs that ${config.modelName} battery replacement may help?`,
        answer: 'Common signs include fast battery drain, unstable battery percentage, unexpected shutdowns, reduced standby time, and a tablet that no longer stays powered for normal use.',
      },
      {
        question: `How do you check battery and charging behaviour on ${config.modelName}?`,
        answer: 'We confirm the exact model and model code, review the reported battery symptoms, test charging response, and then explain the suitable repair option through the current price or quote path.',
      },
      {
        question: `What is tested after ${config.modelName} battery replacement?`,
        answer: 'We retest charging response, battery behaviour, power stability, and related tablet functions before the device is ready for return.',
      },
      {
        question: `How do I confirm my exact Lenovo tablet model before booking?`,
        answer: `If you are unsure, bring the tablet in and we will confirm the exact ${config.modelName} model and matching model-code family before the repair is approved.`,
      },
      {
        question: `How is the correct battery repair option confirmed?`,
        answer: 'We inspect the reported fault first, test the live battery and charging behaviour, and then explain the suitable repair option before work begins.',
      },
      {
        question: `Should I back up my tablet before bringing it in?`,
        answer: 'Yes. If the tablet still powers on, backing up important data before the visit is a practical step whenever you can.',
      },
      {
        question: `Can I book this Lenovo Tablet battery repair online?`,
        answer: 'Yes. You can book online through the current booking flow, call 0481 058 514, or visit Ali Mobile & Repair at Ringwood Square for inspection first.',
      },
    ],
  };
}

