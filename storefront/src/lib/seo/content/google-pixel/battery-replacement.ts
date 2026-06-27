import type { RepairTypeSeoPocket, GooglePixelHardwareConfig } from './types';
import { getGooglePixelWhyChooseConfig } from './why-choose';

export function buildGooglePixelBatteryReplacementPocket(
  config: GooglePixelHardwareConfig
): RepairTypeSeoPocket {
  return {
    quickAnswer: `Need ${config.modelName} battery replacement in Ringwood? Ali Mobile & Repair diagnoses rapid battery drain, unexpected shutdowns, battery swelling, and charging issues to determine if a battery replacement is the correct solution.`,
    workbenchHeadings: {
      options: 'Battery replacement approach',
      diagnostics: 'What do we check first?',
      symptoms: 'What are the common battery symptoms?',
      outcomes: 'What affects the final result?',
    },
    repairOptions: [
      {
        name: 'Battery Replacement',
        shortDescription: `A direct replacement of a degraded or failing battery in your ${config.modelName}.`,
        bestFor: 'Phones experiencing poor battery life, sudden shutdowns, or minor battery swelling.',
        notes: 'We verify battery health and charging behavior before and after installation.',
      },
      {
        name: 'Diagnosis and Assessment',
        shortDescription: 'Testing to distinguish a battery fault from a charging port or logic board issue.',
        bestFor: 'Phones that refuse to charge, overheat significantly, or show severe rear glass lifting.',
        notes: 'Sometimes a presumed battery issue is actually caused by board-level power drain.',
      },
    ],
    commonProblems: [
      {
        title: 'Rapid Battery Drain',
        description: 'The battery percentage drops unusually fast, even with light usage.',
        // context: 'Typical sign of a battery reaching the end of its natural chemical lifespan.',
      },
      {
        title: 'Unexpected Shutdowns',
        description: 'The phone powers off suddenly, despite the battery indicator showing remaining charge.',
        // context: 'Occurs when a degraded battery cannot deliver the peak voltage required by the system.',
      },
      {
        title: 'Battery Swelling',
        description: 'The battery expands physically, pushing against the internal components.',
        // context: 'A safety risk that can permanently damage the rear glass or display panel if left untreated.',
      },
      {
        title: 'Percentage Instability',
        description: 'The battery reading jumps erratically (e.g., from 40% to 10% in minutes).',
        // context: 'Indicates the battery calibration is failing due to internal wear.',
      },
      {
        title: 'Excessive Heat During Charging',
        description: 'The phone becomes uncomfortably hot when connected to a charger.',
        // context: 'Can indicate battery failure, charging port issues, or board-level faults.',
      },
    ],
    diagnosticSteps: [
      {
        step: 'Initial charging test',
        title: 'Initial charging test',
        description: 'We connect the device to a tester to observe power draw and identify basic charging faults.',
      },
      {
        step: 'Inspect for swelling',
        title: 'Inspect for swelling',
        description: 'We examine the frame and rear panel for any lifting caused by an expanded battery.',
      },
      {
        step: 'Disconnect power securely',
        title: 'Disconnect power securely',
        description: 'We open the device carefully and disconnect the battery to prevent short circuits.',
      },
      {
        step: 'Remove the degraded battery',
        title: 'Remove the degraded battery',
        description: 'We safely extract the old battery without piercing or bending it.',
      },
      {
        step: 'Install the replacement',
        title: 'Install the replacement',
        description: 'We fit the new battery using appropriate pull-tab adhesives.',
      },
      {
        step: 'Test charging and power',
        title: 'Test charging and power',
        description: 'We verify the device takes a charge correctly and boots stably.',
      },
      {
        step: 'Explain seal limitations',
        title: 'Explain seal limitations',
        description: 'We note that factory water resistance is not guaranteed after opening the device.',
      },
    ],
    faq: [
      {
        question: `How much does ${config.modelName} battery replacement cost?`,
        answer: 'We provide a clear quote upfront based on your exact model. Please bring the device in for an assessment.',
      },
      {
        question: 'How do I know whether the battery is failing?',
        answer: 'Common signs include the battery draining rapidly, the phone shutting down unexpectedly, the device feeling unusually hot, or the rear glass starting to lift due to battery swelling.',
      },
      {
        question: 'Can battery swelling lift the rear glass?',
        answer: 'Yes, a failing battery can expand significantly and generate enough internal pressure to lift the rear glass panel away from the frame.',
      },
      {
        question: 'Will my data remain on the phone?',
        answer: 'Battery replacement is a hardware service that does not typically affect your stored data. However, we always recommend having a recent backup.',
      },
      {
        question: 'Does a charging problem always mean the battery is faulty?',
        answer: 'No. Charging issues can also be caused by a damaged charging port, debris in the port, a faulty charging cable, or a logic board fault. We perform testing to identify the exact cause.',
      },
      {
        question: 'Will factory water resistance be restored?',
        answer: 'No. While we use appropriate internal adhesives during reassembly, the original factory IP rating cannot be guaranteed once a device has been opened.',
      },
      {
        question: 'How long does battery replacement take?',
        answer: 'Most standard Pixel battery replacements take a few hours. We can provide a more accurate time estimate when you bring the device in.',
      },
    ],
  };
}
