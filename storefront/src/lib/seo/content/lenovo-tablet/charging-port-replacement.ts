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

export function buildLenovoTabletChargingPortReplacementPocket(
  config: LenovoTabletModelConfig
): LenovoTabletEnhancedSeoPocket {
  const diagnosticSteps = [
    {
      step: '01',
      title: 'Confirm the exact Lenovo tablet model and model code',
      description: `We confirm the exact ${config.modelName} version and model code before the charging-connector repair path is approved.`,
    },
    {
      step: '02',
      title: 'Review the reported charging problem',
      description: 'We check how the cable behaves now and what the customer sees during charging or accessory use.',
    },
    {
      step: '03',
      title: 'Test the affected function',
      description: 'We test charging connection behaviour and the reported cable-fit issue before the repair path is confirmed.',
    },
    {
      step: '04',
      title: 'Check the related tablet functions',
      description: 'We check charging response and related accessory or data behaviour where applicable before repair is approved.',
    },
    {
      step: '05',
      title: 'Confirm the suitable repair option and existing price or quote',
      description: 'We explain the suitable charging-connector repair option and keep the live price or quote route visible before work begins.',
    },
    {
      step: '06',
      title: 'Complete the approved repair',
      description: 'Once approved, we complete the repair using the path confirmed for that Lenovo tablet model.',
    },
    {
      step: '07',
      title: 'Perform post-repair function checks',
      description: `Before handover, we retest ${getLenovoTabletPostRepairChecks('charging-port-replacement')}.`,
    },
  ] as const;

  return {
    modelSlug: config.modelSlug,
    modelName: config.modelName,
    repairType: 'charging-port-replacement',
    metaTitle: buildLenovoTabletMetaTitle(config, 'charging-port-replacement'),
    metaDescription: buildLenovoTabletMetaDescription(config, 'charging-port-replacement'),
    heroSubtitle: buildLenovoTabletHeroSubtitle(config, 'charging-port-replacement'),
    schemaDescription: buildLenovoTabletSchemaDescription(config, 'charging-port-replacement'),
    supportLabel: getLenovoTabletSupportLabel(config),
    quickAnswer: `${config.modelName} charging-port replacement helps when the charging cable only works at an angle, the connection feels loose, charging starts and stops, or accessory connection becomes unreliable. At Ali Mobile & Repair we confirm the exact Lenovo tablet model and model code, inspect the charging connector before the repair option is confirmed, and test the related functions after repair. Customers can book online or visit our Ringwood store for inspection.`,
    workbenchHeadings: {
      options: `What do we check before ${config.modelName} charging-port replacement?`,
      diagnostics: 'How do we confirm the charging-connector repair path?',
      symptoms: 'Which charging symptoms matter most?',
      outcomes: 'What is tested after the charging-port repair?',
    },
    repairOptions: [
      {
        name: 'Charging-connector assessment',
        shortDescription: 'We check loose cable fit, intermittent charging, visible wear, and the way the tablet responds to charging before we confirm the repair path.',
        bestFor: 'Loose charging connection, cable angle sensitivity, charge dropouts, or unreliable accessory connection.',
        notes: 'The charging connector is inspected before the suitable repair option is approved.',
      },
      {
        name: 'Model-code matching and inspection',
        shortDescription: `We confirm the exact ${config.modelName} model code so the charging repair information matches the correct Lenovo tablet version.`,
        bestFor: 'Customers who want the repair path matched carefully to the exact Lenovo tablet variant they are bringing in.',
        notes: 'We keep the existing price or quote route visible before the repair is approved.',
      },
      {
        name: 'Post-repair connection checks',
        shortDescription: `After repair we retest ${getLenovoTabletPostRepairChecks('charging-port-replacement')} before handover.`,
        bestFor: 'Customers who want the main charging and connection behaviour checked before they collect the tablet.',
        notes: 'Booking, quote, and store-visit options stay available through the current system.',
      },
    ],
    commonProblems: [
      { title: 'Charging cable works only at an angle', description: 'The cable may need to be held a certain way before the tablet starts charging consistently.' },
      { title: 'Loose charging connection', description: 'A cable that no longer feels secure in the connector is checked before the repair path is approved.' },
      { title: 'Charging starts and stops', description: 'The connection may drop in and out instead of staying stable during normal charging.' },
      { title: 'Tablet does not charge', description: 'When the tablet shows no normal charging response, we inspect the charging connector before confirming the next step.' },
      { title: 'Computer or accessory connection is unreliable', description: 'If connection to a computer or accessory is inconsistent, we check the connector path during diagnosis.' },
      { title: 'Connector contains debris or visible wear', description: 'Visible debris or wear around the charging connector is inspected as part of the repair assessment.' },
    ],
    diagnosticSteps: [...diagnosticSteps],
    diagnosticProcess: buildLenovoTabletDiagnosticProcessSection(config, 'charging-port-replacement', diagnosticSteps),
    serviceSection: buildLenovoTabletServiceSection(config, 'charging-port-replacement'),
    localService: buildLenovoTabletLocalServiceSection(config, 'charging-port-replacement'),
    finalCta: buildLenovoTabletFinalCtaSection(config, 'charging-port-replacement'),
    faq: [
      {
        question: `Why does the charging cable work only at an angle on ${config.modelName}?`,
        answer: 'That usually means the charging connection needs a closer inspection on the bench. We reproduce the fault, inspect the charging connector, and then explain the suitable repair option.',
      },
      {
        question: 'Can the charging connector be inspected before repair?',
        answer: 'Yes. We inspect the connector, test the charging response, and confirm the suitable repair path before any repair work is approved.',
      },
      {
        question: `Is charging and data connection tested after ${config.modelName} charging-port replacement?`,
        answer: 'Yes. We retest cable fit, charging connection, charging response, and data or accessory connection where applicable before handover.',
      },
      {
        question: `How do I confirm my exact Lenovo tablet model before booking?`,
        answer: `If you are unsure, bring the tablet in and we will confirm the exact ${config.modelName} model and matching model-code family before the repair is approved.`,
      },
      {
        question: `What symptoms can this repair help with on ${config.modelName}?`,
        answer: 'Common reasons for booking include loose cable fit, intermittent charging, a tablet that no longer charges normally, or unreliable accessory connection.',
      },
      {
        question: `Should I back up my tablet before bringing it in?`,
        answer: 'Yes. If the tablet still powers on, backing up important data before the visit is a practical step whenever you can.',
      },
      {
        question: `Can I book this Lenovo Tablet charging-port repair online?`,
        answer: 'Yes. You can book online through the current booking flow, call 0481 058 514, or visit Ali Mobile & Repair at Ringwood Square for inspection first.',
      },
    ],
  };
}

