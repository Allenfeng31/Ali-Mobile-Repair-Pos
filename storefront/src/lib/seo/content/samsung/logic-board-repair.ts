import type { RepairTypeSeoPocket, SamsungHardwareConfig } from './types';
import { SAMSUNG_QUOTE_ONLY_SCOPE, SAMSUNG_WATER_RESISTANCE_NOTE } from './shared';

export function buildSamsungLogicBoardRepairPocket(
  config: SamsungHardwareConfig
): RepairTypeSeoPocket {
  if (config.modelSlug === 'galaxy-s23-ultra') {
    return {
      quickAnswer:
        `Need ${config.modelName} logic board repair in Ringwood? Ali Mobile & Repair uses board-level diagnosis for no-power faults, restart loops, and charging or communication faults after simpler causes are excluded, then explains the quote-only repair or data-first path.`,
      workbenchHeadings: {
        options: `Which board-level path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before logic board work?',
        symptoms: 'Which logic-board symptoms matter most?',
        outcomes: 'What can change the board-repair scope?',
      },
      repairOptions: [
        {
          name: 'No-power and restart-loop diagnosis',
          shortDescription:
            'We test for no power, restart loops, unstable boot behaviour, and current-path symptoms after simpler display, battery, and charging causes are checked first.',
          bestFor:
            'Phones that stay dead, keep restarting, or fail to boot normally after the simpler part-level causes have been ruled out.',
          notes:
            'Board-level diagnosis begins only after the easier modular causes are excluded so the quote-only scope reflects the actual fault path.',
        },
        {
          name: 'Charging and communication fault isolation',
          shortDescription:
            'We separate charging, USB-C, and communication faults that remain after accessory, battery, and charging-port causes no longer explain the problem.',
          bestFor:
            'Phones with persistent charging or connection faults after the usual lower-path causes have already been checked.',
          notes:
            'Impact or liquid-related board symptoms are considered during diagnosis without creating a separate Water Damage service route.',
        },
        {
          name: 'Repair-versus-data outcome review',
          shortDescription:
            'We explain when the practical next step is board repair, a data-first attempt, or stopping at diagnosis if the risk outweighs the likely result.',
          bestFor:
            'Customers who need a clear distinction between trying to restore the device and trying to recover important data.',
          notes:
            `${SAMSUNG_QUOTE_ONLY_SCOPE} Data recovery is discussed as a separate outcome from successful device repair.`,
        },
      ],
      commonProblems: [
        {
          title: 'No power',
          description:
            'A phone that stays dead after the simpler checks are exhausted can point to a board-level fault, but we rule out easier causes first.',
        },
        {
          title: 'Restart loops',
          description:
            'Boot loops and unstable startup behaviour can indicate board-level damage after simpler display, battery, or charging causes are excluded.',
        },
        {
          title: 'Charging or communication faults',
          description:
            'Persistent charging or connection faults can require board-level diagnosis when port, accessory, and battery-level causes no longer explain the symptoms.',
        },
        {
          title: 'Impact or liquid-related board symptoms',
          description:
            'Impact and liquid history can affect multiple board paths, so we factor that into diagnosis without assuming a fixed repair outcome.',
        },
        {
          title: 'Data priority',
          description:
            'When the main priority is the data, we discuss that separately from the chance of restoring normal device function.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Rule out simpler causes first',
          description:
            'Display, battery, charging-port, and basic connection causes are checked before the fault is treated as board-level.',
        },
        {
          step: '02',
          title: 'Measure board-related behaviour',
          description:
            'We assess no-power response, restart behaviour, charging and communication symptoms, and any history pointing to impact or liquid exposure.',
        },
        {
          step: '03',
          title: 'Set repair versus data priorities',
          description:
            'Where relevant, we separate the goal of restoring the phone from the separate goal of recovering important data.',
        },
        {
          step: '04',
          title: 'Confirm the quote-only next step',
          description:
            `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Can you guarantee successful ${config.modelName} logic board repair?`,
          answer:
            'No. Board-level work is diagnosed first because the final outcome depends on the actual fault path, prior damage, and whether the affected circuits are recoverable.',
        },
        {
          question: `Does ${config.modelName} logic board repair guarantee data recovery?`,
          answer:
            'No. Data recovery is discussed as a separate outcome, and success depends on the board condition and the type of damage present.',
        },
        {
          question: `Why is ${config.modelName} logic board work still quote-only?`,
          answer:
            'Board-level symptoms vary too much for fixed pricing, and the final scope depends on diagnosis after simpler causes are ruled out.',
        },
        {
          question: `Does this ${config.modelName} route create a separate Water Damage service?`,
          answer:
            'No. Liquid history may be part of the board-level diagnosis, but this page does not create a separate Water Damage repair route.',
        },
        {
          question: `Will logic board repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  if (config.seriesFamily === 'galaxy-s') {
    return {
      quickAnswer:
        `Need ${config.modelName} logic board repair in Ringwood? Ali Mobile & Repair uses board-level diagnosis for no-power faults, restart loops, and charging or communication faults after simpler causes are excluded, then explains the quote-only repair or data-first path.`,
      workbenchHeadings: {
        options: `Which board-level path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before logic board work?',
        symptoms: 'Which logic-board symptoms matter most?',
        outcomes: 'What can change the board-repair scope?',
      },
      repairOptions: [
        {
          name: 'No-power and restart-loop diagnosis',
          shortDescription:
            'We test for no power, restart loops, unstable boot behaviour, and current-path symptoms after simpler display, battery, and charging causes are checked first.',
          bestFor:
            'Phones that stay dead, keep restarting, or fail to boot normally after the simpler part-level causes have been ruled out.',
          notes:
            'Board-level diagnosis begins only after the easier modular causes are excluded so the quote-only scope reflects the actual fault path.',
        },
        {
          name: 'Charging and communication fault isolation',
          shortDescription:
            'We separate charging, USB-C, and communication faults that remain after accessory, battery, and charging-port causes no longer explain the problem.',
          bestFor:
            'Phones with persistent charging or connection faults after the usual lower-path causes have already been checked.',
          notes:
            'Impact or liquid-related board symptoms are considered during diagnosis without creating a separate Water Damage service route.',
        },
        {
          name: 'Repair-versus-data outcome review',
          shortDescription:
            'We explain when the practical next step is board repair, a data-first attempt, or stopping at diagnosis if the risk outweighs the likely result.',
          bestFor:
            'Customers who need a clear distinction between trying to restore the device and trying to recover data.',
          notes:
            `${SAMSUNG_QUOTE_ONLY_SCOPE} Data recovery is discussed as a separate outcome from successful device repair.`,
        },
      ],
      commonProblems: [
        {
          title: 'No power',
          description:
            'A phone that stays dead after the simpler checks are exhausted can point to a board-level fault, but we rule out easier causes first.',
        },
        {
          title: 'Restart loops',
          description:
            'Boot loops and unstable startup behaviour can indicate board-level damage after simpler display, battery, or charging causes are excluded.',
        },
        {
          title: 'Charging or communication faults',
          description:
            'Persistent charging or connection faults can require board-level diagnosis when port, accessory, and battery-level causes no longer explain the symptoms.',
        },
        {
          title: 'Impact or liquid-related board symptoms',
          description:
            'Impact and liquid history can affect multiple board paths, so we factor that into diagnosis without assuming a fixed repair outcome.',
        },
        {
          title: 'Data priority',
          description:
            'When the main priority is the data, we discuss that separately from the chance of restoring normal device function.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Rule out simpler causes first',
          description:
            'Display, battery, charging-port, and basic connection causes are checked before the fault is treated as board-level.',
        },
        {
          step: '02',
          title: 'Measure board-related behaviour',
          description:
            'We assess no-power response, restart behaviour, charging and communication symptoms, and any history pointing to impact or liquid exposure.',
        },
        {
          step: '03',
          title: 'Set repair versus data priorities',
          description:
            'Where relevant, we separate the goal of restoring the phone from the separate goal of recovering data.',
        },
        {
          step: '04',
          title: 'Confirm the quote-only next step',
          description:
            `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Can you guarantee successful ${config.modelName} logic board repair?`,
          answer:
            'No. Board-level work is diagnosed first because the final outcome depends on the actual fault path, prior damage, and whether the affected circuits are recoverable.',
        },
        {
          question: `Does ${config.modelName} logic board repair guarantee data recovery?`,
          answer:
            'No. Data recovery is discussed as a separate outcome, and success depends on the board condition and the type of damage present.',
        },
        {
          question: `Why is ${config.modelName} logic board work still quote-only?`,
          answer:
            'Board-level symptoms vary too much for fixed pricing, and the final scope depends on diagnosis after simpler causes are ruled out.',
        },
        {
          question: `Does this ${config.modelName} route create a separate Water Damage service?`,
          answer:
            'No. Liquid history may be part of the board-level diagnosis, but this page does not create a separate Water Damage repair route.',
        },
        {
          question: `Will logic board repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  return {
    quickAnswer:
      `Need ${config.modelName} logic board repair in Ringwood? Ali Mobile & Repair uses board-level diagnosis for no-power faults, restart loops, and charging or communication faults after simpler causes are excluded, then explains the quote-only repair or data-first path.`,
    workbenchHeadings: {
      options: `Which board-level path fits this ${config.modelName}?`,
      diagnostics: 'What do we inspect before logic board work?',
      symptoms: 'Which logic-board symptoms matter most?',
      outcomes: 'What can change the board-repair scope?',
    },
    repairOptions: [
      {
        name: 'No-power and restart-loop diagnosis',
        shortDescription:
          'We test for no power, restart loops, unstable boot behaviour, and current-path symptoms after simpler battery, charging, and display causes are checked first.',
        bestFor:
          'Phones that will not turn on, keep restarting, or fail to boot normally after basic part-level causes have been ruled out.',
        notes:
          'Board-level diagnosis starts only after the simpler causes are excluded so the quote reflects the actual fault path.',
      },
      {
        name: 'Charging and communication fault isolation',
        shortDescription:
          'We separate charging, USB-C, connection, and communication faults that remain after port, battery, and accessory-level checks are completed.',
        bestFor:
          'Phones with persistent charging or connection problems after the obvious lower-path causes are no longer the leading explanation.',
        notes:
          'Liquid or impact-related symptoms are considered because they can affect more than one board path at once.',
      },
      {
        name: 'Repair-versus-data outcome review',
        shortDescription:
          'We explain when the practical next step is board repair, a data-first attempt, or stopping at diagnosis if the risk outweighs the likely result.',
        bestFor:
          'Customers who need a clear decision between device repair and data recovery priorities.',
        notes:
          `${SAMSUNG_QUOTE_ONLY_SCOPE} Data recovery is discussed as a separate outcome from successful device repair.`,
      },
    ],
    commonProblems: [
      {
        title: 'No power',
        description:
          'A phone that stays dead after simpler checks can point to a board-level fault, but we rule out modular causes first.',
      },
      {
        title: 'Restart loops',
        description:
          'Boot loops and unstable startup behaviour can indicate board-level damage after simpler battery or charging causes are excluded.',
      },
      {
        title: 'Charging or communication faults',
        description:
          'Persistent charging or connection faults can require board-level diagnosis when accessory, battery, and port-level causes no longer explain the symptoms.',
      },
      {
        title: 'Liquid or impact history',
        description:
          'Corrosion and impact damage can affect multiple board paths, so history and visible evidence are part of the diagnosis.',
      },
      {
        title: 'Data priority',
        description:
          'When the phone matters mainly for its data, we discuss recovery goals separately from the chance of full device repair.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: 'Rule out simpler causes first',
        description:
          'Battery, charging, display, and basic connection causes are checked before the fault is treated as board-level.',
      },
      {
        step: '02',
        title: 'Measure board-related behaviour',
        description:
          'We assess no-power response, restart behaviour, charging and communication symptoms, and any history pointing to liquid or impact.',
      },
      {
        step: '03',
        title: 'Set repair versus data priorities',
        description:
          'Where relevant, we separate the goal of restoring the phone from the separate goal of recovering data.',
      },
      {
        step: '04',
        title: 'Confirm the quote-only next step',
        description:
          `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
      },
    ],
    faq: [
      {
        question: `Can you guarantee successful ${config.modelName} logic board repair?`,
        answer:
          'No. Board-level work is diagnosed first because the final outcome depends on the fault path, prior damage, and whether the affected circuits are recoverable.',
      },
      {
        question: `Does ${config.modelName} logic board repair guarantee data recovery?`,
        answer:
          'No. Data recovery is discussed as a separate outcome, and success depends on the board condition and the type of damage present.',
      },
      {
        question: `Why is ${config.modelName} logic board work quote-only?`,
        answer:
          'Board-level symptoms vary too much for fixed pricing, and the final scope depends on diagnosis after simpler causes are ruled out.',
      },
      {
        question: `How long does ${config.modelName} logic board diagnosis take?`,
        answer:
          'Timing depends on the symptoms, inspection findings, and whether the practical next step is board repair, data-first work, or stopping at diagnosis.',
      },
      {
        question: `Will logic board repair restore factory water resistance on my ${config.modelName}?`,
        answer: SAMSUNG_WATER_RESISTANCE_NOTE,
      },
    ],
  };
}
