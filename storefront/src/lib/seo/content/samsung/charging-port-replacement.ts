import type { RepairTypeSeoPocket, SamsungHardwareConfig } from './types';
import {
  SAMSUNG_QUOTE_ONLY_SCOPE,
  SAMSUNG_WATER_RESISTANCE_NOTE,
} from './shared';

export function buildSamsungChargingPortReplacementPocket(
  config: SamsungHardwareConfig
): RepairTypeSeoPocket {
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
