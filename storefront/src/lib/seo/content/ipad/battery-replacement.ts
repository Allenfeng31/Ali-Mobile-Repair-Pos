import type { IpadEnhancedSeoPocket, IpadHardwareConfig } from './types';
import {
  ALI_MOBILE_IPAD_BUSINESS,
  getIpadAccessoryLabel,
  getIpadBatteryHandlingSentence,
  getIpadBiometricLabel,
  getIpadBiometricTestLabel,
  getIpadConnectorLabel,
  getIpadLocalSuburbReference,
  getIpadSupportLabel,
} from './shared';

export function buildIpadBatteryReplacementPocket(config: IpadHardwareConfig): IpadEnhancedSeoPocket {
  const connectorLabel = getIpadConnectorLabel(config);
  const accessoryLabel = getIpadAccessoryLabel(config);
  const biometricLabel = getIpadBiometricLabel(config);
  const biometricTestLabel = getIpadBiometricTestLabel(config);
  const supportLabel = getIpadSupportLabel(config) ?? undefined;
  const connectorSpecificWorkbench =
    config.connectorType === 'lightning'
      ? 'Lightning charging response, Home Button condition, and current Touch ID state are tested after repair.'
      : config.hasLargerFrameInspectionNote
        ? 'USB-C charging, top-button Touch ID state, and the larger frame and display edges are tested after repair.'
        : 'USB-C charging response and the top-button Touch ID path are tested after repair.';

  return {
    modelSlug: config.modelSlug,
    modelName: config.modelName,
    repairType: 'battery-replacement',
    metaTitle: `${config.modelName} Battery Replacement in Ringwood | Ali Mobile & Repair`,
    metaDescription: `${config.modelName} battery replacement in Ringwood with checks for fast drain, shutdowns, charging symptoms, swelling, and broader power faults before repair.`,
    heroSubtitle:
      `Bring your ${config.modelName} to ${ALI_MOBILE_IPAD_BUSINESS.businessName} at ${ALI_MOBILE_IPAD_BUSINESS.locationShort} for battery diagnosis, existing live pricing, and booking support.`,
    schemaDescription:
      `Battery replacement for ${config.modelName} in Ringwood with inspection of drain, shutdown, charging behavior, swelling condition, and the broader power path before confirming repair.`,
    supportLabel,
    quickAnswer:
      `${config.modelName} battery symptoms can also be caused by the charger, cable, charging port, software state, or another power issue, so diagnosis confirms whether battery replacement is appropriate. If the battery is swollen, the iPad should not be pressed back together. Backing up the iPad before repair is recommended whenever it still powers on.`,
    workbenchHeadings: {
      options: `What does the technician confirm before ${config.modelName} battery replacement?`,
      diagnostics: 'How is the battery fault confirmed step by step?',
      symptoms: `Which ${config.modelName} battery symptoms matter most?`,
      outcomes: 'What can expand the battery repair scope?',
    },
    repairOptions: [
      {
        name: 'Battery symptom review',
        shortDescription:
          'We review fast drain, shutdowns, percentage jumps, slow charge gain, heat, poor standby time, and startup behavior after extended charging.',
        bestFor:
          'Short runtime, random shutdowns, slow charging progress, or an iPad that no longer powers on reliably.',
        notes:
          'Battery wear is confirmed in context rather than assumed from one symptom alone.',
      },
      {
        name: 'Charging-path diagnosis',
        shortDescription:
          `We test ${accessoryLabel}, connector condition, and charging response so cable, charger, and connector faults are separated from battery faults.`,
        bestFor:
          'Battery complaints that also involve poor charging, unstable cable response, or inconsistent power-up behavior.',
        notes:
          'Charging and power-path checks happen before the battery replacement path is approved.',
      },
      {
        name: 'Safe opening and model-specific care',
        shortDescription:
          `${getIpadBatteryHandlingSentence(config)} ${config.connectorType === 'lightning' ? 'Home Button and Touch ID handling is protected throughout the repair.' : 'The top-button Touch ID path is checked before and after the repair.'}`,
        bestFor:
          'Ensuring safe handling of iPads that show signs of swelling, screen lift, or visible frame impact.',
        notes:
          'Existing damage is explained clearly before the repair scope is confirmed.',
      },
      {
        name: 'Post-repair power checks',
        shortDescription:
          `${connectorSpecificWorkbench} We also check startup stability and the main day-to-day power functions before handover.`,
        bestFor:
          'Customers who want the charging and basic power path rechecked before handover.',
        notes:
          'Any separate power issue found during testing is reported before extra work is suggested.',
      },
    ],
    commonProblems: [
      {
        title: 'Fast battery drain',
        description:
          'A worn battery can lose charge quickly during normal use, even when the iPad otherwise seems to work normally.',
      },
      {
        title: 'Unexpected shutdown',
        description:
          'The iPad can switch off under load or at a higher displayed percentage when battery performance is unstable.',
      },
      {
        title: 'Percentage jumping',
        description:
          'Rapid jumps in the battery percentage can point to unstable battery behavior or another power-path issue that still needs diagnosis.',
      },
      {
        title: 'Slow charge increase',
        description:
          'Charging can rise very slowly when the battery, charging accessories, or connector path is not behaving normally.',
      },
      {
        title: 'No start after extended charging',
        description:
          'An iPad that still will not power on after extended charging may need battery diagnosis, but other power faults can also be involved.',
      },
      {
        title: 'Unusual heat',
        description:
          'Heat during charging or use can point to battery wear, swelling condition, or another electrical issue that needs inspection.',
      },
      {
        title: 'Screen or frame separation',
        description:
          'If the display or frame has separated, bring the iPad in for inspection so we can confirm the cause and explain the options.',
      },
      {
        title: 'Poor standby time',
        description:
          'A battery can appear usable during short sessions but still lose too much power while the iPad sits unused.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: `Confirm the exact ${config.modelName} model`,
        description:
          'We confirm the exact iPad model first so the battery path, connector checks, and post-repair testing match the correct hardware.',
      },
      {
        step: '02',
        title: 'Inspect the frame, display, and overall condition',
        description:
          'We check the battery condition, display fit and device response before confirming the repair plan.',
      },
      {
        step: '03',
        title: 'Reproduce the reported power fault',
        description:
          'We review the customer-reported drain, shutdown, charging, startup, heat, and standby symptoms on the bench.',
      },
      {
        step: '04',
        title: 'Test related functions',
        description:
          `We test ${accessoryLabel.toLowerCase()}, charging response, and the nearby hardware linked to ${biometricLabel.toLowerCase()}.`,
      },
      {
        step: '05',
        title: 'Distinguish the likely battery or power cause',
        description:
          'We separate battery symptoms from charging-port faults, accessory problems, software behavior, and broader power issues before quoting.',
      },
      {
        step: '06',
        title: 'Confirm the repair approach with the customer',
        description:
          'We explain whether battery replacement is appropriate, note any visible limitations, and confirm the repair scope before work begins.',
      },
      {
        step: '07',
        title: 'Perform post-repair functional checks',
        description:
          `After repair we retest charging, startup behavior, ${biometricTestLabel.toLowerCase()}, and normal operation before handover.`,
      },
    ],
    modelSpecificNotes: {
      kicker: 'Model-specific repair notes',
      heading: `${config.modelName} battery repair notes`,
      intro:
        `This page uses the confirmed battery-related hardware details for ${config.modelName} so the inspection wording matches the actual iPad model.`,
      items: [
        `${config.modelName} uses ${connectorLabel} and ${biometricLabel}.`,
        config.connectorType === 'lightning'
          ? 'Lightning charging behavior, Home Button condition, and current Touch ID state are part of the bench checks.'
          : 'USB-C charging behavior and the top-button Touch ID path are part of the bench checks.',
        config.hasLargerFrameInspectionNote
          ? 'The larger 13-inch frame and display edges receive extra inspection so we can confirm the full condition before opening.'
          : 'We check the battery condition, display fit and device response before confirming the repair plan.',
        `The exact battery scope is only confirmed after the charging path and ${accessoryLabel.toLowerCase()} response have been checked.`,
      ],
    },
    repairLimitations: {
      kicker: 'Inspection process',
      heading: `How we confirm ${config.modelName} battery replacement`,
      intro:
        'Battery replacement is confirmed only after the wider power path has been considered.',
      items: [
        'Battery-like symptoms can also be caused by charging accessories, connector faults, software state, or another power-system issue.',
        'If swelling has affected the display or frame, we will explain the options clearly before proceeding.',
        'We inspect for existing impact or liquid exposure so you know the exact condition before we begin.',
        'Backing up the iPad before repair is recommended whenever the device still powers on normally.',
        'Turnaround is confirmed after bench diagnosis once the exact repair path is clear.',
      ],
    },
    localService: {
      kicker: 'Ringwood iPad support',
      heading: `Bring your ${config.modelName} to Ringwood Square for battery diagnosis`,
      intro:
        `${ALI_MOBILE_IPAD_BUSINESS.businessName} works from ${ALI_MOBILE_IPAD_BUSINESS.locationName} in ${ALI_MOBILE_IPAD_BUSINESS.locality}. ${getIpadLocalSuburbReference('battery-replacement')}`,
      items: [
        'Do not keep using or pressing down a swollen iPad. Bring it in for inspection as it is.',
        `If the charging symptom only appears with one accessory, bring that ${accessoryLabel.toLowerCase()} so we can test the full setup.`,
        `Call ${ALI_MOBILE_IPAD_BUSINESS.phone} or book online if you want help checking likely battery availability before travelling.`,
      ],
    },
    finalCta: {
      kicker: 'Next step',
      heading: `Ready to organise ${config.modelName} battery replacement?`,
      body:
        'You can book the repair, request a quote through the existing system, call the store, or walk in for diagnosis first. The battery path is only confirmed after inspection.',
      bullets: [
        'Book Repair for the exact iPad model and battery service path.',
        `Call ${ALI_MOBILE_IPAD_BUSINESS.phone} if you want to describe shutdown, drain, or swelling symptoms first.`,
        'Visit the Ringwood store if the screen is lifting or the iPad no longer powers on reliably.',
      ],
    },
    faq: [
      {
        question: `What are common signs that ${config.modelName} needs battery replacement?`,
        answer:
          'Common signs include fast battery drain, unexpected shutdowns, poor standby time, unusual heat, slow charge gain, or swelling that starts lifting the screen or frame.',
      },
      {
        question: `Can something other than the battery cause fast drain on ${config.modelName}?`,
        answer:
          'Yes. Charging accessories, connector faults, software behavior, and other power issues can also affect runtime, so we diagnose the wider power path before quoting battery replacement.',
      },
      {
        question: `Is a swollen battery in ${config.modelName} safe to keep using?`,
        answer:
          'No. A swollen battery should not be pressed back into the iPad or kept in normal use. Bring it in for inspection as soon as practical.',
      },
      {
        question: `Should I back up my ${config.modelName} before bringing it in?`,
        answer:
          'Backing up your iPad data before any repair is always recommended whenever the device still powers on and functions well enough to do so.',
      },
      {
        question: `Why do you check the charging system before replacing the battery in ${config.modelName}?`,
        answer:
          `We check ${accessoryLabel.toLowerCase()}, connector behavior, and charging response first because a battery symptom can overlap with the charging path.`,
      },
      {
        question: `What is tested after ${config.modelName} battery replacement?`,
        answer:
          `We retest charging response, startup behavior, ${biometricTestLabel.toLowerCase()}, and the main day-to-day power functions before handover.`,
      },
      {
        question: `How is the final repair scope confirmed for ${config.modelName} battery replacement?`,
        answer:
          'We confirm the exact iPad model, inspect for swelling or existing damage, reproduce the reported power fault, test the charging path, and then explain the practical repair approach before work begins.',
      },
    ],
  };
}
