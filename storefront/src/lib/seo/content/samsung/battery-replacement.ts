import type { RepairTypeSeoPocket, SamsungHardwareConfig } from './types';
import {
  SAMSUNG_FOLD_TESTING_NOTE,
  SAMSUNG_QUOTE_ONLY_SCOPE,
  SAMSUNG_WATER_RESISTANCE_NOTE,
} from './shared';

export function buildSamsungBatteryReplacementPocket(
  config: SamsungHardwareConfig
): RepairTypeSeoPocket {
  return {
    quickAnswer:
      `Need ${config.modelName} battery replacement in Ringwood? Ali Mobile & Repair checks rapid drain, shutdowns, charging-percentage instability, heat, swelling, and charging behaviour before confirming whether battery replacement is the right quote-only path.`,
    workbenchHeadings: {
      options: `Which battery path fits this ${config.modelName}?`,
      diagnostics: 'What do we inspect before foldable battery work?',
      symptoms: 'Which battery symptoms matter most?',
      outcomes: 'What can change the battery scope?',
    },
    repairOptions: [
      {
        name: 'Battery and power-path diagnosis',
        shortDescription:
          'We review drain rate, shutdown behaviour, charge-percentage jumps, heat, and charging response before assuming the battery is the fault.',
        bestFor:
          'Phones that drain too quickly, shut down unexpectedly, or show unstable charge readings in daily use.',
        notes:
          'Battery complaints can overlap with charging-port, board-level, or software-related causes, so diagnosis comes before replacement.',
      },
      {
        name: 'Swelling and structural safety inspection',
        shortDescription:
          'We inspect for swelling pressure affecting the rear panel, housing, and internal fit before any battery work is approved.',
        bestFor:
          'Phones with rear-panel lift, unusual pressure, heat, or a structure that feels different after charging.',
        notes:
          'Swelling can affect more than battery runtime, especially when it changes the way the rear structure sits.',
      },
      {
        name: 'Open-and-closed position validation',
        shortDescription:
          'Where relevant, we compare heat, charging behaviour, and general stability with the device open and closed before finalising the quote.',
        bestFor:
          'Phones where fold posture, charging use, or heat behaviour seems inconsistent.',
        notes:
          `${SAMSUNG_FOLD_TESTING_NOTE} ${SAMSUNG_QUOTE_ONLY_SCOPE}`,
      },
    ],
    commonProblems: [
      {
        title: 'Rapid battery drain',
        description:
          'Fast drain can be caused by battery wear, but it can also overlap with charging faults or deeper power-path issues.',
      },
      {
        title: 'Unexpected shutdowns',
        description:
          'Shutdowns under load or at unstable percentages may point to voltage instability, not just normal battery ageing.',
      },
      {
        title: 'Charge percentage jumps',
        description:
          'Sudden drops or jumps in battery percentage can indicate battery wear or power-path instability that needs diagnosis first.',
      },
      {
        title: 'Heat or swelling',
        description:
          'Heat and swelling are handled carefully because swelling can affect the rear panel, internal structure, and safe device opening.',
      },
      {
        title: 'Charging overlap',
        description:
          'USB-C charging faults, wireless charging problems, and board-level issues can mimic battery failure on a foldable phone.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: 'Review battery symptoms in context',
        description:
          'We document drain, shutdowns, charge-percentage instability, and when heat or swelling is noticed during normal use.',
      },
      {
        step: '02',
        title: 'Test wired and wireless charging behaviour',
        description:
          'We compare USB-C charging response, wireless charging where relevant, and general power stability before confirming battery replacement.',
      },
      {
        step: '03',
        title: 'Inspect safety and structural fit',
        description:
          'Rear-panel lift, swelling pressure, and structure changes are checked before opening because battery issues can affect more than runtime.',
      },
      {
        step: '04',
        title: 'Confirm the quote-only path',
        description:
          `${SAMSUNG_FOLD_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE} ${SAMSUNG_QUOTE_ONLY_SCOPE}`,
      },
    ],
    faq: [
      {
        question: `Can a new battery fix every power problem on my ${config.modelName}?`,
        answer:
          'No. We diagnose first because charging faults, board-level issues, and other power-path problems can look like battery failure.',
      },
      {
        question: `Do you check my ${config.modelName} for swelling before battery replacement?`,
        answer:
          'Yes. We inspect for swelling, rear-panel lift, and structural pressure before approving battery work.',
      },
      {
        question: `Do you test the ${config.modelName} open and closed during battery diagnosis?`,
        answer:
          'Where relevant, yes. We compare heat and general stability with the phone in open and closed positions during assessment and handover testing.',
      },
      {
        question: `Will a new battery guarantee a certain runtime on my ${config.modelName}?`,
        answer:
          'No. We aim to restore safe, stable battery function, but real runtime still depends on usage patterns, apps, network conditions, and overall device health.',
      },
      {
        question: `Is ${config.modelName} battery replacement a fixed-price service here?`,
        answer:
          'No. This route stays quote-only because diagnosis, swelling findings, and power-path results can change the final scope.',
      },
      {
        question: `Will battery replacement restore factory water resistance on my ${config.modelName}?`,
        answer: SAMSUNG_WATER_RESISTANCE_NOTE,
      },
    ],
  };
}
