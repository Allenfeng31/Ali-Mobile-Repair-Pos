import type { RepairTypeSeoPocket, GooglePixelHardwareConfig } from './types';
import { getGooglePixelWhyChooseConfig } from './why-choose';

export function buildGooglePixelLogicBoardRepairPocket(
  config: GooglePixelHardwareConfig
): RepairTypeSeoPocket {
  return {
    quickAnswer: `Need ${config.modelName} logic board repair in Ringwood? Ali Mobile & Repair uses a diagnostic-first approach for complex issues like no power, boot loops, unexpected restarting, charging-path faults, and liquid damage, prioritizing data recovery where possible.`,
    workbenchHeadings: {
      options: 'Logic board repair approach',
      diagnostics: 'What do we check first?',
      symptoms: 'What are the common board-level symptoms?',
      outcomes: 'What affects the final result?',
    },
    repairOptions: [
      {
        name: 'Logic Board Diagnosis',
        shortDescription: 'Comprehensive testing to identify component-level faults on the main board.',
        bestFor: 'Devices with severe liquid damage, persistent boot loops, or completely dead states.',
        notes: 'Diagnosis is required. Repair may not be possible, and a no-fix outcome is a possibility.',
      },
      {
        name: 'Data Recovery Focused Repair',
        shortDescription: 'Targeted component repair designed specifically to revive the device long enough to extract data.',
        bestFor: 'Customers whose primary goal is retrieving irreplaceable photos, messages, or documents.',
        notes: 'Data recovery is not guaranteed. Final price depends on the specific fault discovered.',
      },
    ],
    commonProblems: [
      {
        title: 'No Power or Completely Dead',
        description: 'The phone shows no signs of life, won\'t charge, and won\'t turn on.',
        // context: 'Can be caused by a short circuit on a main power rail or a failed power management IC.',
      },
      {
        title: 'Boot Loops and Unexpected Restarting',
        description: 'The phone constantly restarts or gets stuck on the Google logo.',
        // context: 'Often related to logic board faults, storage IC issues, or severe software corruption.',
      },
      {
        title: 'Charging-Path Faults',
        description: 'The phone refuses to take power, even after a confirmed battery and port replacement.',
        // context: 'Indicates a failure in the board-level charging circuitry.',
      },
      {
        title: 'Liquid or Corrosion Damage',
        description: 'Internal components have shorted or corroded due to fluid exposure.',
        // context: 'Requires specialized cleaning and microsoldering to address component-level uncertainty.',
      },
      {
        title: 'Board-Linked Feature Faults',
        description: 'Features like Wi-Fi, cellular signal, or cameras fail despite replacing the associated modular parts.',
        // context: 'Points to a failure in the logic board components managing those specific features.',
      },
    ],
    diagnosticSteps: [
      {
        step: 'Initial power assessment',
        title: 'Initial power assessment',
        description: 'We connect the device to a DC power supply to observe current draw and identify potential short circuits.',
      },
      {
        step: 'Disassemble and inspect',
        title: 'Disassemble and inspect',
        description: 'We remove the logic board and inspect it under a microscope for visible corrosion, blown components, or micro-fractures.',
      },
      {
        step: 'Component-level measurement',
        title: 'Component-level measurement',
        description: 'We use multimeters and schematics to trace faults through the power and data rails.',
      },
      {
        step: 'Microsoldering repair (if viable)',
        title: 'Microsoldering repair (if viable)',
        description: 'If a specific component fault is identified and repairable, we replace the micro-components.',
      },
      {
        step: 'Determine data-recovery goals',
        title: 'Determine data-recovery goals',
        description: 'We attempt to stabilize the board sufficiently to boot and allow data extraction.',
      },
      {
        step: 'Final assessment',
        title: 'Final assessment',
        description: 'We report back on whether a repair was successful or if the board is beyond economic repair.',
      },
    ],
    faq: [
      {
        question: `How much does ${config.modelName} logic-board repair cost?`,
        answer: 'Because logic board faults vary wildly, we must diagnose the device first. We will provide a quote based on the specific fault discovered. A diagnostic fee may apply, and a no-fix outcome is possible.',
      },
      {
        question: 'Can a boot loop be caused by the logic board?',
        answer: 'Yes. While sometimes software-related, persistent boot loops (getting stuck on the Google logo) frequently indicate a hardware fault on the logic board, such as a failing storage chip or power issue.',
      },
      {
        question: 'Can you recover data from a non-working Pixel?',
        answer: 'In many cases, yes. Our data recovery service involves repairing the logic board just enough to boot the phone and extract your files. However, data recovery is never guaranteed.',
      },
      {
        question: 'Is every logic-board fault repairable?',
        answer: 'No. Some faults, such as severe CPU damage, catastrophic liquid corrosion, or extreme physical bending, are beyond repair.',
      },
      {
        question: 'Will my data remain intact?',
        answer: 'If the repair is successful and the storage chip is undamaged, your data will still be there. If the storage chip itself has failed, data recovery is usually impossible.',
      },
      {
        question: 'How long does diagnosis and repair take?',
        answer: 'Logic board diagnosis and microsoldering are complex processes that typically take several days to over a week, depending on the fault and component availability.',
      },
    ],
  };
}
