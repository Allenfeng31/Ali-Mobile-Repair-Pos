import type { IpadEnhancedSeoPocket, IpadHardwareConfig } from './types';
import {
  ALI_MOBILE_IPAD_BUSINESS,
  getIpadAccessoryLabel,
  getIpadBiometricTestLabel,
  getIpadConnectorLabel,
  getIpadLocalSuburbReference,
  getIpadSchoolUseSentence,
  getIpadSupportLabel,
} from './shared';

export function buildIpadChargingPortReplacementPocket(config: IpadHardwareConfig): IpadEnhancedSeoPocket {
  const connectorLabel = getIpadConnectorLabel(config);
  const accessoryLabel = getIpadAccessoryLabel(config);
  const biometricTestLabel = getIpadBiometricTestLabel(config);
  const supportLabel = getIpadSupportLabel(config) ?? undefined;
  const connectorQuestionLabel = config.connectorType === 'lightning' ? 'Lightning' : 'USB-C';

  return {
    modelSlug: config.modelSlug,
    modelName: config.modelName,
    repairType: 'charging-port-replacement',
    metaTitle: `${config.modelName} Charging Port Replacement in Ringwood | Ali Mobile & Repair`,
    metaDescription: `${config.modelName} charging port replacement in Ringwood with checks for loose cable fit, no charging, debris, connector damage, and wider power-path issues before repair.`,
    heroSubtitle:
      `Bring your ${config.modelName} to ${ALI_MOBILE_IPAD_BUSINESS.businessName} at ${ALI_MOBILE_IPAD_BUSINESS.locationShort} for connector diagnosis, live pricing, and booking support.`,
    schemaDescription:
      `Charging port replacement for ${config.modelName} in Ringwood with testing of accessories, connector condition, charging response, data connection where applicable, and broader power causes before confirming repair.`,
    supportLabel,
    quickAnswer:
      `${config.modelName} charging problems are checked with known-good accessories first because the charger, cable, battery, connector, software state, or a broader power issue can cause similar symptoms. Diagnosis confirms whether charging port replacement is appropriate. We inspect for debris, visible connector damage, corrosion, and impact before confirming the repair path.`,
    workbenchHeadings: {
      options: `What does the technician confirm before ${config.modelName} charging port repair?`,
      diagnostics: 'How is the charging fault confirmed step by step?',
      symptoms: `Which ${config.modelName} charging symptoms matter most?`,
      outcomes: 'What can expand the charging repair scope?',
    },
    repairOptions: [
      {
        name: 'Accessory testing before parts are quoted',
        shortDescription:
          `We test ${accessoryLabel.toLowerCase()} before confirming the connector path so cable or charger faults are ruled out first.`,
        bestFor:
          'Angle-only charging, intermittent response, or charging that changes depending on the accessory being used.',
        notes:
          'Bring the cable or charger that shows the fault if the issue only happens with one setup.',
      },
      {
        name: 'Connector inspection and cleaning assessment',
        shortDescription:
          `We inspect the ${connectorQuestionLabel} connector for lint, corrosion, visible damage, and cable fit before we assume replacement is needed.`,
        bestFor:
          'Loose connection, no charging, intermittent charging, or visible contamination inside the connector.',
        notes:
          'If debris removal is the practical fix, we avoid unnecessary part replacement.',
      },
      {
        name: 'Power-path and data-path diagnosis',
        shortDescription:
          'We test charging response, data or accessory connection where applicable, and check whether the battery or another power fault is overlapping with the charging complaint.',
        bestFor:
          'Slow charging, unstable charge gain, or situations where the iPad will not connect reliably to a computer or accessory.',
        notes:
          'We do not assume the connector is always the only failed part.',
      },
      {
        name: 'Model-specific retesting after repair',
        shortDescription:
          `${getIpadSchoolUseSentence(config)} After repair we retest charging response, cable fit, and ${biometricTestLabel.toLowerCase()} before handover.`,
        bestFor:
          'Customers who want the connector path and related functions rechecked before pickup.',
        notes:
          'Existing impact or liquid exposure can expand the scope and is explained before extra work is suggested.',
      },
    ],
    commonProblems: [
      {
        title: 'Cable works only at an angle',
        description:
          'A connector can still charge when pressure is applied from one direction, which often points to wear, debris, or damage that needs inspection.',
      },
      {
        title: 'Loose connection',
        description:
          'If the cable no longer seats firmly, the connector may have wear, contamination, or housing movement around it.',
      },
      {
        title: 'No charging',
        description:
          'No-charge behavior can come from the connector path, the battery, accessories, or another power fault, so the full path is tested first.',
      },
      {
        title: 'Intermittent charging',
        description:
          'The iPad may start and stop charging repeatedly when the connector path is unstable or when another power issue is overlapping with the symptom.',
      },
      {
        title: 'Slow or unstable charge',
        description:
          'Slow charging does not automatically prove the connector is faulty, so accessories, battery behavior, and the wider power path are still checked.',
      },
      {
        title: 'Computer or accessory connection failure',
        description:
          'An iPad can sometimes charge while still failing data or accessory connection, so that path is tested where applicable.',
      },
      {
        title: 'Debris, corrosion, or visible connector damage',
        description:
          'Visible contamination or impact around the connector can change whether cleaning or replacement is the practical next step.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: `Confirm the exact ${config.modelName} model`,
        description:
          'We confirm the exact iPad model first so the connector type, bench checks, and repair path match the correct hardware.',
      },
      {
        step: '02',
        title: 'Inspect the frame, display, and impact history',
        description:
          'We inspect the frame, surrounding housing, display edges, and visible impact history before the iPad is opened.',
      },
      {
        step: '03',
        title: 'Reproduce the reported charging fault',
        description:
          'We confirm whether the charging issue is no response, angle-only charging, intermittent charging, or poor data or accessory behavior.',
      },
      {
        step: '04',
        title: 'Test related functions',
        description:
          `We test known-good ${accessoryLabel.toLowerCase()}, charging response, and data connection where applicable before quoting replacement.`,
      },
      {
        step: '05',
        title: 'Distinguish the likely charging cause',
        description:
          'We separate connector faults from debris, battery behavior, accessory problems, liquid exposure, and broader power-system issues.',
      },
      {
        step: '06',
        title: 'Confirm the repair approach with the customer',
        description:
          'We explain whether cleaning, connector replacement, or broader diagnosis is the practical next step before work begins.',
      },
      {
        step: '07',
        title: 'Perform post-repair functional checks',
        description:
          `After repair we retest charging response, cable fit, data or accessory behavior where applicable, and ${biometricTestLabel.toLowerCase()} before handover.`,
      },
    ],
    modelSpecificNotes: {
      kicker: 'Model-specific repair notes',
      heading: `${config.modelName} charging repair notes`,
      intro:
        `This page uses the confirmed connector and hardware details for ${config.modelName} so the charging-port wording matches the actual iPad model.`,
      items: [
        `${config.modelName} uses ${connectorLabel}.`,
        config.connectorType === 'lightning'
          ? 'Lightning charging response is checked alongside Home Button and Touch ID behavior because the lower assembly path can overlap with the repair area.'
          : 'USB-C charging response is checked alongside the top-button Touch ID path because nearby impact or pressure can overlap with the repair area.',
        'Data or accessory connection is tested where applicable so a charge-only symptom is not assumed to tell the whole story.',
        'Visible impact, case pressure, and liquid signs around the connector are assessed before the final repair scope is confirmed.',
      ],
    },
    repairLimitations: {
      kicker: 'Repair limitations',
      heading: `What can limit ${config.modelName} charging port repair`,
      intro:
        'Charging-port replacement is only confirmed after the full charging path has been considered.',
      items: [
        'Cable, charger, battery, software state, or broader power faults can mimic a bad connector.',
        'Debris may be removable without replacing the connector, while visible physical damage can expand the repair path.',
        'Third-party accessory compatibility can still vary after repair, especially when the accessory itself is part of the original problem.',
        'Impact or liquid exposure around the connector can affect the result and may require wider diagnosis.',
        'Turnaround depends on diagnosis and part availability rather than a fixed promise.',
      ],
    },
    localService: {
      kicker: 'Ringwood iPad support',
      heading: `Bring your ${config.modelName} to Ringwood Square for charging diagnosis`,
      intro:
        `${ALI_MOBILE_IPAD_BUSINESS.businessName} works from ${ALI_MOBILE_IPAD_BUSINESS.locationName} in ${ALI_MOBILE_IPAD_BUSINESS.locality}. ${getIpadLocalSuburbReference('charging-port-replacement')}`,
      items: [
        `If the fault only happens with one accessory, bring that ${accessoryLabel.toLowerCase()} with the iPad.`,
        'Do not force a cable into a connector that feels loose, gritty, or visibly damaged.',
        `Call ${ALI_MOBILE_IPAD_BUSINESS.phone} or book online if you want help checking likely connector availability before travelling.`,
      ],
    },
    finalCta: {
      kicker: 'Next step',
      heading: `Ready to organise ${config.modelName} charging port repair?`,
      body:
        'You can book the repair, request a quote through the existing system, call the store, or walk in with the iPad and the accessory that shows the fault. The practical charging path is confirmed after diagnosis.',
      bullets: [
        'Book Repair for the exact iPad model and charging fault path.',
        `Call ${ALI_MOBILE_IPAD_BUSINESS.phone} if you want to describe angle-only charging, no-charge, or data-connection symptoms first.`,
        'Visit the Ringwood store with the cable or charger that reproduces the issue if possible.',
      ],
    },
    faq: [
      {
        question: `Does ${config.modelName} use Lightning or USB-C?`,
        answer: `${config.modelName} uses ${connectorQuestionLabel}. We confirm the exact model first so the connector path and parts match the iPad on the bench.`,
      },
      {
        question: `Why does the cable only work at an angle on ${config.modelName}?`,
        answer:
          'Angle-only charging can point to debris, connector wear, housing movement, or visible damage. We inspect the connector before assuming replacement is needed.',
      },
      {
        question: `Could the battery be causing the charging problem on ${config.modelName}?`,
        answer:
          'Yes. Battery behavior can overlap with connector complaints, which is why we test the broader power path before confirming charging-port replacement.',
      },
      {
        question: `Can debris be removed without replacing the connector on ${config.modelName}?`,
        answer:
          'Sometimes, yes. If the issue is debris rather than physical damage, cleaning may be the practical fix. We inspect the connector first.',
      },
      {
        question: `Will ${config.modelName} charging port repair remove my data?`,
        answer:
          'Charging-port repair is not normally performed to remove data, but backing up the iPad is still recommended whenever it powers on and charges well enough to do so.',
      },
      {
        question: `How is the charging fault confirmed on ${config.modelName}?`,
        answer:
          `We confirm the exact model, test known-good ${accessoryLabel.toLowerCase()}, inspect the connector, test charging response and data connection where applicable, and then explain the practical repair path before work begins.`,
      },
      {
        question: `What is tested after ${config.modelName} charging port repair?`,
        answer:
          `We retest charging response, cable fit, data or accessory behavior where applicable, and ${biometricTestLabel.toLowerCase()} before handover.`,
      },
    ],
  };
}
