import type { RepairTypeSeoPocket, SamsungHardwareConfig } from './types';
import {
  SAMSUNG_FOLD_TESTING_NOTE,
  SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE,
  SAMSUNG_QUOTE_ONLY_SCOPE,
  SAMSUNG_WATER_RESISTANCE_NOTE,
} from './shared';

export function buildSamsungBatteryReplacementPocket(
  config: SamsungHardwareConfig
): RepairTypeSeoPocket {
  if (config.modelSlug === 'galaxy-s23-ultra') {
    return {
      quickAnswer:
        `Need ${config.modelName} battery replacement in Ringwood? Ali Mobile & Repair checks rapid drain, shutdowns, charging-percentage instability, heat, swelling, and charging behaviour before confirming whether the battery is the main fault path.`,
      workbenchHeadings: {
        options: `Which battery path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before battery replacement?',
        symptoms: 'Which battery symptoms matter most?',
        outcomes: 'What can change the battery result?',
      },
      repairOptions: [
        {
          name: 'Battery and power-path diagnosis',
          shortDescription:
            'We check rapid drain, reduced runtime, unexpected shutdowns, charge-percentage instability, and heat before assuming the battery is the only problem.',
          bestFor:
            'Phones that no longer last well through the day, shut down unexpectedly, or report unstable battery behaviour.',
          notes:
            'Battery symptoms can overlap with charging-port, accessory, and board-level faults, so diagnosis comes before replacement.',
        },
        {
          name: 'Swelling and rear-housing safety inspection',
          shortDescription:
            'We inspect swelling pressure, rear lift, and whether the rear housing or frame condition changes the safe repair path.',
          bestFor:
            'Phones with heat, swelling, lifted rear sections, or pressure that affects the way the phone sits.',
          notes:
            'Where swelling affects the rear housing, we check whether the housing condition also needs attention before the battery work is finalised.',
        },
        {
          name: 'Pre-repair and post-repair validation',
          shortDescription:
            'We compare charging response, stability, and the practical power result before and after service.',
          bestFor:
            'Customers who want the battery path checked in context rather than assuming every power complaint comes from the battery alone.',
          notes:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Rapid battery drain or reduced runtime',
          description:
            'Fast drain can come from battery wear, but it can also overlap with charging or board-level power-path faults that need diagnosis first.',
        },
        {
          title: 'Unexpected shutdowns',
          description:
            'Shutdowns under load or at unstable percentages can point to battery wear or a deeper power-path issue.',
        },
        {
          title: 'Charging-percentage instability',
          description:
            'Sudden jumps or drops in percentage can indicate battery wear, charging instability, or another fault that overlaps with the battery symptoms.',
        },
        {
          title: 'Heat or swelling',
          description:
            'Heat and swelling are checked carefully because swelling can affect the rear housing, safe opening, and the surrounding structure.',
        },
        {
          title: 'Charging overlap',
          description:
            'USB-C charging issues can look like battery failure, so the charging path is separated before battery replacement is treated as the final answer.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Review power symptoms in context',
          description:
            'We document drain, runtime loss, shutdowns, charge-percentage instability, and heat before deciding whether the battery is the main cause.',
        },
        {
          step: '02',
          title: 'Check charging behaviour and overlap',
          description:
            'USB-C charging response and general power stability are tested so battery replacement is not quoted on the wrong fault path.',
        },
        {
          step: '03',
          title: 'Inspect swelling and rear-housing condition',
          description:
            'If swelling affects the rear housing, lift, or structure, we confirm the safe repair path before proceeding.',
        },
        {
          step: '04',
          title: 'Retest the battery path before handover',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Does every ${config.modelName} power problem mean the battery is bad?`,
          answer:
            'No. Battery, charging-port, accessory, and board-level faults can overlap, so we diagnose the power path before treating the battery as the only cause.',
        },
        {
          question: `Do you inspect swelling on my ${config.modelName} before battery replacement?`,
          answer:
            'Yes. We inspect heat, swelling, rear lift, and whether the rear housing condition changes the safe repair path before proceeding.',
        },
        {
          question: `Will a new battery guarantee a certain runtime on my ${config.modelName}?`,
          answer:
            'No. Battery replacement aims to restore safe, stable battery function, but real runtime still depends on usage, signal conditions, apps, and overall device health.',
        },
        {
          question: `Is the ${config.modelName} battery page based on a genuine catalogue-backed repair listing?`,
          answer:
            'Yes. The displayed battery route follows the live catalogue-backed repair listing for this model rather than a fabricated SEO-only service.',
        },
        {
          question: `Will battery replacement restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  if (config.seriesFamily === 'galaxy-note') {
    return {
      quickAnswer:
        `Need ${config.modelName} battery replacement in Ringwood? Ali Mobile & Repair checks rapid drain, unexpected shutdowns, unstable percentage, heat, swelling, charging-without-holding-power symptoms, and power-path overlap before confirming the quote-only battery route.`,
      workbenchHeadings: {
        options: `Which battery path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before battery replacement?',
        symptoms: 'Which battery symptoms matter most?',
        outcomes: 'What can change the battery result?',
      },
      repairOptions: [
        {
          name: 'Battery and power-path diagnosis',
          shortDescription:
            'We check rapid drain, reduced runtime, unexpected shutdowns, charge-percentage instability, and heat before assuming the battery is the only problem.',
          bestFor:
            'Phones that no longer last well through the day, shut down unexpectedly, or report unstable battery behaviour.',
          notes:
            'Battery symptoms can overlap with charging-port, accessory, and board-level faults, so diagnosis comes before the quote is confirmed.',
        },
        {
          name: 'Swelling and rear-housing safety inspection',
          shortDescription:
            'We inspect swelling pressure, rear lift, and whether the rear housing or frame condition changes the safe repair path.',
          bestFor:
            'Phones with heat, swelling, lifted rear sections, or pressure that affects the way the phone sits.',
          notes:
            'Where swelling affects the rear housing, we check whether the housing condition also needs attention before the battery work is finalised.',
        },
        {
          name: 'Quote-only battery handover',
          shortDescription:
            'We compare charging response, stability, and the practical power result before and after service.',
          bestFor:
            'Customers who want the battery path checked in context rather than assuming every power complaint comes from the battery alone.',
          notes:
            `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Rapid battery drain or reduced runtime',
          description:
            'Fast drain can come from battery wear, but it can also overlap with charging or board-level power-path faults that need diagnosis first.',
        },
        {
          title: 'Unexpected shutdowns',
          description:
            'Shutdowns under load or at unstable percentages can point to battery wear or a deeper power-path issue.',
        },
        {
          title: 'Charging-percentage instability',
          description:
            'Sudden jumps or drops in percentage can indicate battery wear, charging instability, or another fault that overlaps with the battery symptoms.',
        },
        {
          title: 'Heat or swelling',
          description:
            'Heat and swelling are checked carefully because swelling can affect the rear housing, safe opening, and the surrounding structure.',
        },
        {
          title: 'Charging overlap',
          description:
            'USB-C charging issues can look like battery failure, so the charging path is separated before battery replacement is treated as the final answer.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Review power symptoms in context',
          description:
            'We document drain, runtime loss, shutdowns, charge-percentage instability, and heat before deciding whether the battery is the main cause.',
        },
        {
          step: '02',
          title: 'Check charging behaviour and overlap',
          description:
            'USB-C charging response and general power stability are tested so battery replacement is not quoted on the wrong fault path.',
        },
        {
          step: '03',
          title: 'Inspect swelling and rear-housing condition',
          description:
            'If swelling affects the rear housing, lift, or structure, we confirm the safe repair path before proceeding.',
        },
        {
          step: '04',
          title: 'Retest the battery path before handover',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `How long should a replacement battery last in my ${config.modelName}?`,
          answer:
            'We do not promise an exact battery lifespan. Runtime still depends on usage, signal strength, apps, temperature, and the rest of the phone’s condition after the repair.',
        },
        {
          question: `Can swelling damage the display or housing on my ${config.modelName}?`,
          answer:
            'Yes. We inspect swelling carefully because pressure can affect the rear housing, frame fit, and sometimes the display path as well.',
        },
        {
          question: `Will battery replacement erase my data on my ${config.modelName}?`,
          answer:
            'Battery replacement does not normally target storage data, but we still recommend a backup because deeper faults can appear during diagnosis or repair.',
        },
        {
          question: `Could a charging-port or board fault cause the same symptoms on my ${config.modelName}?`,
          answer:
            'Yes. Battery, charging-port, accessory, and board-level faults can overlap, so we diagnose the full power path before confirming the battery route.',
        },
        {
          question: `Will a new battery fix overheating on my ${config.modelName}?`,
          answer:
            'Not always. Heat can be battery-related, but it can also come from charging, board-level, or usage-related causes that need separate assessment.',
        },
        {
          question: `How is the quote confirmed for battery work on my ${config.modelName}?`,
          answer:
            `We confirm the likely fault path first, then explain the quote-only battery route before any work starts. ${SAMSUNG_QUOTE_ONLY_SCOPE}`,
        },
        {
          question: `How long can battery replacement take on my ${config.modelName}?`,
          answer:
            'Many straightforward repairs can be completed in under an hour once the correct part and repair path are confirmed, but we still inspect the actual device before giving a timing estimate.',
        },
      ],
    };
  }

  if (config.seriesFamily === 'galaxy-s') {
    return {
      quickAnswer:
        `Need ${config.modelName} battery replacement in Ringwood? Ali Mobile & Repair checks rapid drain, shutdowns, charging-percentage instability, heat, swelling, and charging behaviour before confirming whether the battery is the main fault path.`,
      workbenchHeadings: {
        options: `Which battery path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before battery replacement?',
        symptoms: 'Which battery symptoms matter most?',
        outcomes: 'What can change the battery result?',
      },
      repairOptions: [
        {
          name: 'Battery and power-path diagnosis',
          shortDescription:
            'We check rapid drain, reduced runtime, unexpected shutdowns, charge-percentage instability, and heat before assuming the battery is the only problem.',
          bestFor:
            'Phones that no longer last well through the day, shut down unexpectedly, or report unstable battery behaviour.',
          notes:
            'Battery symptoms can overlap with charging-port, accessory, and board-level faults, so diagnosis comes before replacement.',
        },
        {
          name: 'Swelling and rear-housing safety inspection',
          shortDescription:
            'We inspect swelling pressure, rear lift, and whether the rear housing or frame condition changes the safe repair path.',
          bestFor:
            'Phones with heat, swelling, lifted rear sections, or pressure that affects the way the phone sits.',
          notes:
            'Where swelling affects the rear housing, we check whether the housing condition also needs attention before the battery work is finalised.',
        },
        {
          name: 'Pre-repair and post-repair validation',
          shortDescription:
            'We compare charging response, stability, and the practical power result before and after service.',
          bestFor:
            'Customers who want the battery path checked in context rather than assuming every power complaint comes from the battery alone.',
          notes:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Rapid battery drain or reduced runtime',
          description:
            'Fast drain can come from battery wear, but it can also overlap with charging or board-level power-path faults that need diagnosis first.',
        },
        {
          title: 'Unexpected shutdowns',
          description:
            'Shutdowns under load or at unstable percentages can point to battery wear or a deeper power-path issue.',
        },
        {
          title: 'Charging-percentage instability',
          description:
            'Sudden jumps or drops in percentage can indicate battery wear, charging instability, or another fault that overlaps with the battery symptoms.',
        },
        {
          title: 'Heat or swelling',
          description:
            'Heat and swelling are checked carefully because swelling can affect the rear housing, safe opening, and the surrounding structure.',
        },
        {
          title: 'Charging overlap',
          description:
            'USB-C charging issues can look like battery failure, so the charging path is separated before battery replacement is treated as the final answer.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Review power symptoms in context',
          description:
            'We document drain, runtime loss, shutdowns, charge-percentage instability, and heat before deciding whether the battery is the main cause.',
        },
        {
          step: '02',
          title: 'Check charging behaviour and overlap',
          description:
            'USB-C charging response and general power stability are tested so battery replacement is not quoted on the wrong fault path.',
        },
        {
          step: '03',
          title: 'Inspect swelling and rear-housing condition',
          description:
            'If swelling affects the rear housing, lift, or structure, we confirm the safe repair path before proceeding.',
        },
        {
          step: '04',
          title: 'Retest the battery path before handover',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Does every ${config.modelName} power problem mean the battery is bad?`,
          answer:
            'No. Battery, charging-port, accessory, and board-level faults can overlap, so we diagnose the power path before treating the battery as the only cause.',
        },
        {
          question: `Do you inspect swelling on my ${config.modelName} before battery replacement?`,
          answer:
            'Yes. We inspect heat, swelling, rear lift, and whether the rear housing condition changes the safe repair path before proceeding.',
        },
        {
          question: `Will a new battery guarantee a certain runtime on my ${config.modelName}?`,
          answer:
            'No. Battery replacement aims to restore safe, stable battery function, but real runtime still depends on usage, signal conditions, apps, and overall device health.',
        },
        {
          question: `Is the ${config.modelName} battery page based on a genuine catalogue-backed repair listing?`,
          answer:
            'Yes. The displayed battery route follows the live catalogue-backed repair listing for this model rather than a fabricated SEO-only service.',
        },
        {
          question: `Will battery replacement restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  if (config.seriesFamily === 'galaxy-a') {
    return {
      quickAnswer: `Need ${config.modelName} battery replacement in Ringwood? Ali Mobile & Repair checks rapid drain, unexpected shutdown, percentage instability, heat, swelling, and rear-housing pressure before confirming whether the battery is the main fault path.`,
      workbenchHeadings: {
        options: `Which battery path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before battery replacement?',
        symptoms: 'Which battery symptoms matter most?',
        outcomes: 'What can change the battery result?',
      },
      repairOptions: [
        {
          name: 'Battery and power diagnosis',
          shortDescription: 'We check rapid drain, unexpected shutdown, and percentage instability before assuming the battery is the only problem.',
          bestFor: 'Phones that no longer hold power or shut down unexpectedly.',
          notes: 'Symptoms can overlap with port or board faults, so battery-versus-port-versus-board diagnosis comes first.',
        },
        {
          name: 'Swelling and housing inspection',
          shortDescription: 'We inspect swelling pressure and rear-housing condition.',
          bestFor: 'Phones with heat, swelling, or rear pressure.',
          notes: 'If swelling affects the rear housing, we confirm the safe repair path.',
        },
        {
          name: 'Functional testing',
          shortDescription: 'We test charging stability and power hold after installation.',
          bestFor: 'Customers who want the battery path checked in context.',
          notes: 'Functional testing after installation ensures stable power.',
        },
      ],
      commonProblems: [
        {
          title: 'Rapid battery drain',
          description: 'Fast drain can come from battery wear, but it can also overlap with charging or board faults.',
        },
        {
          title: 'Unexpected shutdown',
          description: 'Shutdowns under load can point to battery wear.',
        },
        {
          title: 'Percentage instability',
          description: 'Sudden jumps or drops in percentage can indicate battery wear.',
        },
        {
          title: 'Charging but not holding power',
          description: 'If the phone recognizes a charger but drops power quickly off the cable, the battery is typically worn.',
        },
        {
          title: 'Heat and swelling',
          description: 'Heat and swelling are checked carefully to assess rear-housing pressure and safety.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Review power symptoms',
          description: 'We document drain, shutdown, and percentage instability.',
        },
        {
          step: '02',
          title: 'Check charging overlap',
          description: 'We perform battery-versus-port-versus-board diagnosis.',
        },
        {
          step: '03',
          title: 'Inspect for swelling',
          description: 'We check rear-housing pressure and heat.',
        },
        {
          step: '04',
          title: 'Retest battery path',
          description: 'We conduct functional testing after installation.',
        },
      ],
      faq: [
        {
          question: `How long should a replacement battery last in my ${config.modelName}?`,
          answer:
            'A replacement battery should restore stable power delivery, but we do not promise a fixed runtime or exact battery-health percentage. Real battery life still depends on usage, signal strength, apps, charging habits, and overall device condition.',
        },
        {
          question: `Can battery swelling damage the display or housing on my ${config.modelName}?`,
          answer:
            'Yes. Swelling can press on the rear housing, lift the back section, or affect the display fit. We inspect the frame and housing before confirming the repair path.',
        },
        {
          question: `Will battery replacement erase my data on ${config.modelName}?`,
          answer:
            'Battery replacement does not normally erase data. We still recommend backing up important files before service as a sensible precaution.',
        },
        {
          question: `Could a charging-port or board fault cause similar battery symptoms on my ${config.modelName}?`,
          answer:
            'Yes. Fast drain, shutdowns, and unstable percentages can overlap with charging-path or board-level faults, so we diagnose the full power path before replacing the battery.',
        },
        {
          question: `Will a new ${config.modelName} battery fix overheating?`,
          answer:
            'It can help when the battery is the source of the heat, but not every overheating complaint comes from the battery alone. We check for charging overlap, board-level faults, and swelling-related pressure first.',
        },
        {
          question: `How is the final ${config.modelName} battery quote confirmed?`,
          answer:
            'The quote follows the live catalogue-backed battery listing for this model and repair path. We confirm the current route before work begins so the repair matches the available product.',
        },
        {
          question: `How long does battery replacement usually take on my ${config.modelName}?`,
          answer:
            'Timing depends on part availability and whether the battery fault overlaps with charging or board-level symptoms. We confirm the likely turnaround after diagnosis rather than promising a fixed completion time.',
        },
      ],
    };
  }

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
