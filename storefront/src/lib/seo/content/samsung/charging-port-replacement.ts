import type { RepairTypeSeoPocket, SamsungHardwareConfig } from './types';
import {
  SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE,
  SAMSUNG_QUOTE_ONLY_SCOPE,
  SAMSUNG_WATER_RESISTANCE_NOTE,
} from './shared';

export function buildSamsungChargingPortReplacementPocket(
  config: SamsungHardwareConfig
): RepairTypeSeoPocket {
  if (config.modelSlug === 'galaxy-s23-ultra') {
    return {
      quickAnswer:
        `Need ${config.modelName} charging port replacement in Ringwood? Ali Mobile & Repair checks intermittent USB-C charging, loose cable fit, debris, contamination, data-transfer faults, and overlapping battery or board causes before confirming the correct charging path.`,
      workbenchHeadings: {
        options: `Which USB-C charging path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before USB-C port work?',
        symptoms: 'Which USB-C symptoms matter most?',
        outcomes: 'What can change the charging-port result?',
      },
      repairOptions: [
        {
          name: 'USB-C port inspection first',
          shortDescription:
            'We inspect loose cable fit, debris, contamination, visible wear, and moisture history before assuming the port itself needs replacement.',
          bestFor:
            'Phones that charge only at certain angles, feel loose at the port, or stop charging when the cable moves.',
          notes:
            'Not every charging issue needs port replacement, so cleaning or a broader diagnosis may be the safer first step.',
        },
        {
          name: 'Charging-path separation',
          shortDescription:
            'We separate cable, USB-C port, battery, and board-level causes before confirming whether the charging-port product is the right repair path.',
          bestFor:
            'Phones with no charge draw, unstable wired charging, or symptoms that change across different chargers and cables.',
          notes:
            'Lower-path symptoms can overlap with microphone or daughterboard-related issues, but those are treated as diagnostic possibilities rather than automatically included parts.',
        },
        {
          name: 'USB-C data and function validation',
          shortDescription:
            'We test wired charging, data transfer, and related lower-path behaviour before and after service.',
          bestFor:
            'Phones that will not maintain a stable wired connection to accessories or a computer.',
          notes:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Intermittent USB-C charging',
          description:
            'Charging that cuts in and out can come from cable movement, compacted debris, worn contacts, or deeper charging-path issues.',
        },
        {
          title: 'Loose cable connection',
          description:
            'If the cable feels loose or only charges at one angle, we inspect the USB-C path before deciding whether replacement is necessary.',
        },
        {
          title: 'Debris or contamination',
          description:
            'Compacted lint or contamination can mimic port failure, so we inspect and separate that from actual port wear.',
        },
        {
          title: 'USB-C data-transfer faults',
          description:
            'A phone can show some charge response but still fail data transfer or accessory communication on the same USB-C path.',
        },
        {
          title: 'Battery or board overlap',
          description:
            'Battery and board-level issues can mimic port failure, so the final repair path is based on diagnosis rather than assumption.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Inspect the USB-C connection physically',
          description:
            'We check cable seating, debris, contamination, and visible wear before treating the port as the final fault.',
        },
        {
          step: '02',
          title: 'Separate charging and lower-path causes',
          description:
            'Battery behaviour, board-level symptoms, and related lower-path findings are checked before confirming the port route.',
        },
        {
          step: '03',
          title: 'Test wired charging and data transfer',
          description:
            'We compare USB-C charging response and data-transfer behaviour so the repair scope matches the actual fault path.',
        },
        {
          step: '04',
          title: 'Retest the USB-C path before handover',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Does every ${config.modelName} charging problem need a new USB-C port?`,
          answer:
            'No. Debris, cable issues, battery behaviour, and board-level faults can all look like port failure, so we diagnose first.',
        },
        {
          question: `Can a ${config.modelName} charging-port issue also affect data transfer?`,
          answer:
            'Yes. Wired data-transfer problems can overlap with the same USB-C path, so we test charging and data behaviour together during diagnosis.',
        },
        {
          question: `Does the ${config.modelName} charging-port product automatically include every lower-board component?`,
          answer:
            'No. We treat microphone or daughterboard-related symptoms as diagnostic possibilities only and do not assume every related component is automatically included.',
        },
        {
          question: `Is the ${config.modelName} charging-port page tied to the live catalogue-backed repair listing?`,
          answer:
            'Yes. The displayed route follows the live catalogue-backed repair listing for this model rather than an invented SEO-only service.',
        },
        {
          question: `Will charging-port repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  if (config.seriesFamily === 'galaxy-note') {
    return {
      quickAnswer:
        `Need ${config.modelName} charging port replacement in Ringwood? Ali Mobile & Repair checks intermittent USB-C charging, loose cable fit, debris, contamination, data-transfer faults, accessory testing, and overlapping battery or board causes before confirming the quote-only charging path.`,
      workbenchHeadings: {
        options: `Which USB-C charging path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before USB-C port work?',
        symptoms: 'Which USB-C symptoms matter most?',
        outcomes: 'What can change the charging-port result?',
      },
      repairOptions: [
        {
          name: 'USB-C port inspection first',
          shortDescription:
            'We inspect loose cable fit, debris, contamination, visible wear, and moisture history before assuming the port itself needs replacement.',
          bestFor:
            'Phones that charge only at certain angles, feel loose at the port, or stop charging when the cable moves.',
          notes:
            'Not every charging issue needs port replacement, so cleaning or a broader diagnosis may be the safer first step.',
        },
        {
          name: 'Charging-path separation',
          shortDescription:
            'We separate cable, USB-C port, battery, and board-level causes before confirming whether the charging-port product is the right repair path.',
          bestFor:
            'Phones with no charge draw, unstable wired charging, or symptoms that change across different chargers and cables.',
          notes:
            'Lower-path symptoms can overlap with microphone or daughterboard-related issues, but those are treated as diagnostic possibilities rather than automatically included parts.',
        },
        {
          name: 'USB-C data and function validation',
          shortDescription:
            'We test wired charging, data transfer, and related lower-path behaviour before and after service.',
          bestFor:
            'Phones that will not maintain a stable wired connection to accessories or a computer.',
          notes:
            `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Intermittent USB-C charging',
          description:
            'Charging that cuts in and out can come from cable movement, compacted debris, worn contacts, or deeper charging-path issues.',
        },
        {
          title: 'Loose cable connection',
          description:
            'If the cable feels loose or only charges at one angle, we inspect the USB-C path before deciding whether replacement is necessary.',
        },
        {
          title: 'Debris or contamination',
          description:
            'Compacted lint or contamination can mimic port failure, so we inspect and separate that from actual port wear.',
        },
        {
          title: 'USB-C data-transfer faults',
          description:
            'A phone can show some charge response but still fail data transfer or accessory communication on the same USB-C path.',
        },
        {
          title: 'Battery or board overlap',
          description:
            'Battery and board-level issues can mimic port failure, so the final repair path is based on diagnosis rather than assumption.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Inspect the USB-C connection physically',
          description:
            'We check cable seating, accessory behaviour, debris, contamination, and visible wear before treating the port as the final fault.',
        },
        {
          step: '02',
          title: 'Separate charging and lower-path causes',
          description:
            'Battery behaviour, board-level symptoms, and related lower-path findings are checked before confirming the port route.',
        },
        {
          step: '03',
          title: 'Test wired charging and data transfer',
          description:
            'We compare USB-C charging response and data-transfer behaviour so the repair scope matches the actual fault path.',
        },
        {
          step: '04',
          title: 'Retest the USB-C path before handover',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Could lint or debris cause the charging problem on my ${config.modelName}?`,
          answer:
            'Yes. Compacted lint or contamination can mimic a port fault, so we inspect the USB-C path before deciding whether replacement is needed.',
        },
        {
          question: `How do you tell whether the port, cable, battery, or board is faulty on my ${config.modelName}?`,
          answer:
            'We test the USB-C path, battery behaviour, and board-level symptoms together so the quote is based on the actual cause rather than one symptom alone.',
        },
        {
          question: `Does this ${config.modelName} charging-port repair include microphone or antenna replacement?`,
          answer:
            'Not automatically. Microphone- or daughterboard-related symptoms are treated as diagnostic possibilities only unless the live catalogue specifically proves otherwise.',
        },
        {
          question: `Will USB-C data transfer be tested on my ${config.modelName}?`,
          answer:
            'Yes. Wired charging and data-transfer behaviour are both checked because they can fail differently even when they share the same physical path.',
        },
        {
          question: `Will the repair erase my data on my ${config.modelName}?`,
          answer:
            'Charging-port work does not normally target storage data, but we still recommend a backup because deeper faults can appear during diagnosis or repair.',
        },
        {
          question: `How is the quote confirmed for charging-port work on my ${config.modelName}?`,
          answer:
            `We confirm the likely fault path first, then explain the quote-only charging route before any work starts. ${SAMSUNG_QUOTE_ONLY_SCOPE}`,
        },
        {
          question: `How long can charging-port diagnosis take on my ${config.modelName}?`,
          answer:
            'Many straightforward repairs can be completed in under an hour once the correct part and repair path are confirmed, but we still inspect the device before giving a timing estimate.',
        },
      ],
    };
  }

  if (config.seriesFamily === 'galaxy-s') {
    return {
      quickAnswer:
        `Need ${config.modelName} charging port replacement in Ringwood? Ali Mobile & Repair checks intermittent USB-C charging, loose cable fit, debris, contamination, data-transfer faults, and overlapping battery or board causes before confirming the correct charging path.`,
      workbenchHeadings: {
        options: `Which USB-C charging path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before USB-C port work?',
        symptoms: 'Which USB-C symptoms matter most?',
        outcomes: 'What can change the charging-port result?',
      },
      repairOptions: [
        {
          name: 'USB-C port inspection first',
          shortDescription:
            'We inspect loose cable fit, debris, contamination, visible wear, and moisture history before assuming the port itself needs replacement.',
          bestFor:
            'Phones that charge only at certain angles, feel loose at the port, or stop charging when the cable moves.',
          notes:
            'Not every charging issue needs port replacement, so cleaning or a broader diagnosis may be the safer first step.',
        },
        {
          name: 'Charging-path separation',
          shortDescription:
            'We separate cable, USB-C port, battery, and board-level causes before confirming whether the charging-port product is the right repair path.',
          bestFor:
            'Phones with no charge draw, unstable wired charging, or symptoms that change across different chargers and cables.',
          notes:
            'Lower-path symptoms can overlap with microphone or daughterboard-related issues, but those are treated as diagnostic possibilities rather than automatically included parts.',
        },
        {
          name: 'USB-C data and function validation',
          shortDescription:
            'We test wired charging, data transfer, and related lower-path behaviour before and after service.',
          bestFor:
            'Phones that will not maintain a stable wired connection to accessories or a computer.',
          notes:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Intermittent USB-C charging',
          description:
            'Charging that cuts in and out can come from cable movement, compacted debris, worn contacts, or deeper charging-path issues.',
        },
        {
          title: 'Loose cable connection',
          description:
            'If the cable feels loose or only charges at one angle, we inspect the USB-C path before deciding whether replacement is necessary.',
        },
        {
          title: 'Debris or contamination',
          description:
            'Compacted lint or contamination can mimic port failure, so we inspect and separate that from actual port wear.',
        },
        {
          title: 'USB-C data-transfer faults',
          description:
            'A phone can show some charge response but still fail data transfer or accessory communication on the same USB-C path.',
        },
        {
          title: 'Battery or board overlap',
          description:
            'Battery and board-level issues can mimic port failure, so the final repair path is based on diagnosis rather than assumption.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Inspect the USB-C connection physically',
          description:
            'We check cable seating, debris, contamination, and visible wear before treating the port as the final fault.',
        },
        {
          step: '02',
          title: 'Separate charging and lower-path causes',
          description:
            'Battery behaviour, board-level symptoms, and related lower-path findings are checked before confirming the port route.',
        },
        {
          step: '03',
          title: 'Test wired charging and data transfer',
          description:
            'We compare USB-C charging response and data-transfer behaviour so the repair scope matches the actual fault path.',
        },
        {
          step: '04',
          title: 'Retest the USB-C path before handover',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Does every ${config.modelName} charging problem need a new USB-C port?`,
          answer:
            'No. Debris, cable issues, battery behaviour, and board-level faults can all look like port failure, so we diagnose first.',
        },
        {
          question: `Can a ${config.modelName} charging-port issue also affect data transfer?`,
          answer:
            'Yes. Wired data-transfer problems can overlap with the same USB-C path, so we test charging and data behaviour together during diagnosis.',
        },
        {
          question: `Does the ${config.modelName} charging-port product automatically include every lower-board component?`,
          answer:
            'No. We treat microphone or daughterboard-related symptoms as diagnostic possibilities only and do not assume every related component is automatically included.',
        },
        {
          question: `Is the ${config.modelName} charging-port page tied to the live catalogue-backed repair listing?`,
          answer:
            'Yes. The displayed route follows the live catalogue-backed repair listing for this model rather than an invented SEO-only service.',
        },
        {
          question: `Will charging-port repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  if (config.seriesFamily === 'galaxy-a') {
    const portTypeStr = config.chargingPortType === 'usb-c' ? 'USB-C' : 'charging port';
    return {
      quickAnswer: `Need ${config.modelName} ${portTypeStr} replacement in Ringwood? Ali Mobile & Repair checks cable and adapter compatibility, debris, loose connections, damaged port pins, intermittent charging, and data-transfer issues before quoting.`,
      workbenchHeadings: {
        options: `Which charging path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before charging port replacement?',
        symptoms: 'Which charging symptoms matter most?',
        outcomes: 'What can change the port repair result?',
      },
      repairOptions: [
        {
          name: 'Debris and accessory check',
          shortDescription: 'We check cable and adapter testing alongside port debris.',
          bestFor: 'Phones with intermittent charging or loose connections.',
          notes: `Sometimes the ${portTypeStr} just needs safe clearing or a new cable.`,
        },
        {
          name: 'Port pin inspection',
          shortDescription: 'We inspect for a damaged port or data-transfer issues.',
          bestFor: 'Phones that only charge at certain angles.',
          notes: 'A damaged port requires replacement to restore stable connection.',
        },
        {
          name: 'Power path validation',
          shortDescription: 'We separate battery or board faults from the port.',
          bestFor: 'Phones that do not respond to charging at all.',
          notes: 'We confirm the port is the main issue before proceeding.',
        },
      ],
      commonProblems: [
        {
          title: 'Intermittent charging',
          description: 'The connection drops out unless the cable is held at an angle.',
        },
        {
          title: 'Loose connection',
          description: 'The cable falls out easily or lacks a solid click.',
        },
        {
          title: 'Damaged port',
          description: `Visible pin damage inside the ${portTypeStr}.`,
        },
        {
          title: 'Data-transfer issues',
          description: 'The phone charges but cannot transfer data to a computer.',
        },
        {
          title: 'Debris',
          description: `Lint or dirt packed into the ${portTypeStr} preventing a connection.`,
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Accessory testing',
          description: 'We perform cable and adapter testing.',
        },
        {
          step: '02',
          title: 'Inspect for debris',
          description: 'We check for a loose connection caused by dirt.',
        },
        {
          step: '03',
          title: 'Check pin condition',
          description: 'We look for damaged port pins and data-transfer issues.',
        },
        {
          step: '04',
          title: 'Isolate power path',
          description: 'We check for underlying battery or board faults.',
        },
      ],
      faq: [
        {
          question: `Could lint or debris cause the charging problem on my ${config.modelName}?`,
          answer:
            'Yes. Compacted lint or contamination can prevent the USB-C plug from seating properly, so we inspect and clean the port before recommending replacement when safe.',
        },
        {
          question: `How do you tell whether the USB-C port, cable, battery, or board is faulty on ${config.modelName}?`,
          answer:
            'We test with known-good cables and adapters, then separate port wear from battery and board-level behaviour. That helps us avoid replacing the wrong part when the symptoms overlap.',
        },
        {
          question: `Does charging-port repair on ${config.modelName} automatically include microphone or antenna replacement?`,
          answer:
            'No. Lower-board parts vary by model variant, so microphone, antenna, or complete daughterboard work is only included when the live catalogue-backed repair listing proves it.',
        },
        {
          question: `Will USB-C data transfer be tested during ${config.modelName} charging-port repair?`,
          answer:
            'Yes. We test wired charging and data transfer together because a phone can charge while still failing to communicate over USB-C.',
        },
        {
          question: `Will charging-port repair erase my data on ${config.modelName}?`,
          answer:
            'Charging-port repair does not normally erase data. We still recommend backing up important files before service as a precaution.',
        },
        {
          question: `How long does ${config.modelName} charging-port repair usually take?`,
          answer:
            'Timing depends on the fault path, part availability, and whether the USB-C issue is limited to the port or overlaps with battery or board-level symptoms.',
        },
        {
          question: `How is the final ${config.modelName} charging-port price confirmed?`,
          answer:
            'The final price follows the live catalogue-backed USB-C charging-port listing for this model. We confirm the route before work begins so the quote matches the available product.',
        },
      ],
    };
  }

  return {
    quickAnswer:
      `Need ${config.modelName} charging port replacement in Ringwood? Ali Mobile & Repair checks intermittent USB-C charging, cable movement, debris, contamination, data-connection faults, and overlapping battery or board-level causes before confirming the quote-only path.`,
    workbenchHeadings: {
      options: `Which USB-C charging path fits this ${config.modelName}?`,
      diagnostics: 'What do we inspect before USB-C port work?',
      symptoms: 'Which USB-C symptoms matter most?',
      outcomes: 'What can change the charging-port scope?',
    },
    repairOptions: [
      {
        name: 'USB-C port inspection first',
        shortDescription:
          'We inspect cable fit, debris, contamination, moisture history, and visible wear before assuming the port needs replacement.',
        bestFor:
          'Loose cables, charging only at certain angles, or phones that stop charging when the cable moves.',
        notes:
          'Not every charging issue requires port replacement, so cleaning or further diagnosis may be the safer first step.',
      },
      {
        name: 'Charging-path separation',
        shortDescription:
          'We separate cable, USB-C socket, battery, and board-level causes before confirming whether the port assembly is the real fault.',
        bestFor:
          'Phones with intermittent wired charging, no charge draw, or behaviour that changes with different accessories.',
        notes:
          'A battery or board issue can mimic a port issue, so we confirm the path before fitting parts.',
      },
      {
        name: 'USB-C data and function validation',
        shortDescription:
          'We test wired charging, data connection, and related lower-path behaviour before confirming the final quote.',
        bestFor:
          'Phones that fail to connect to a computer or accessory even when the battery seems normal.',
        notes:
          `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
      },
    ],
    commonProblems: [
      {
        title: 'USB-C charging cuts in and out',
        description:
          'Intermittent charging can come from cable movement, compacted debris, worn contacts, or deeper charging-path faults.',
      },
      {
        title: 'Cable only works at one angle',
        description:
          'Poor cable seating can indicate debris, contamination, or physical USB-C port wear that needs inspection.',
      },
      {
        title: 'No data connection',
        description:
          'A phone may show some charge response while still failing USB-C data transfer or accessory detection.',
      },
      {
        title: 'Charging overlap with battery or board faults',
        description:
          'We do not assume every charging complaint is caused by the USB-C port because battery and board faults can produce similar symptoms.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: 'Inspect the USB-C socket and cable fit',
        description:
          'We check how the cable seats, whether debris or contamination is present, and whether visible wear changes the connection.',
      },
      {
        step: '02',
        title: 'Test charging response and isolate the path',
        description:
          'We compare accessory response, charge behaviour, and related battery symptoms before recommending USB-C port replacement.',
      },
      {
        step: '03',
        title: 'Check data connection and related functions',
        description:
          'USB-C data connection is tested so we can tell whether the fault is isolated to charging or affects the broader lower path.',
      },
      {
        step: '04',
        title: 'Confirm the correct quote-only scope',
        description:
          `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
      },
    ],
    faq: [
      {
        question: `Does every ${config.modelName} charging issue need a new USB-C port?`,
        answer:
          'No. We inspect for debris, contamination, accessory issues, battery overlap, and board-level faults before confirming port replacement.',
      },
      {
        question: `Do you keep ${config.modelName} charging repairs on the USB-C path only?`,
        answer:
          'Yes. The Galaxy Z Fold 5 uses USB-C, and our diagnosis and quoting stay on the USB-C charging path only.',
      },
      {
        question: `Can data-connection faults point to the same path as USB-C charging issues?`,
        answer:
          'Yes. Wired data problems can overlap with the same USB-C path, so we test charging and data behaviour together during diagnosis.',
      },
      {
        question: `Why is ${config.modelName} charging-port service quote-only?`,
        answer:
          'The final scope depends on whether the fault is limited to the USB-C port or whether battery and board-level causes are involved.',
      },
      {
        question: `Will charging-port repair restore factory water resistance on my ${config.modelName}?`,
        answer: SAMSUNG_WATER_RESISTANCE_NOTE,
      },
    ],
  };
}
