import type { RepairTypeSeoPocket, GooglePixelHardwareConfig } from './types';
import { getGooglePixelWhyChooseConfig } from './why-choose';

export function buildGooglePixelChargingPortReplacementPocket(
  config: GooglePixelHardwareConfig
): RepairTypeSeoPocket {
  return {
    quickAnswer: `Need ${config.modelName} charging port replacement in Ringwood? Ali Mobile & Repair checks for debris, corrosion, cable connection issues, and board-level charging faults before confirming a port replacement.`,
    workbenchHeadings: {
      options: 'Charging port repair approach',
      diagnostics: 'What do we check first?',
      symptoms: 'What are the common charging symptoms?',
      outcomes: 'What affects the final result?',
    },
    repairOptions: [
      {
        name: 'Charging Port Assessment',
        shortDescription: 'Inspection and basic cleaning of the USB-C port to remove compacted debris.',
        bestFor: 'Devices where the charging cable feels loose or fails to click securely into place.',
        notes: 'Often, careful cleaning can resolve charging issues without requiring part replacement.',
      },
      {
        name: 'Port Replacement',
        shortDescription: `Replacement of the internal charging port assembly for your ${config.modelName}.`,
        bestFor: 'Devices with severe corrosion, physically damaged pins, or persistent charging failures.',
        notes: 'We verify the charging fault is not caused by a degraded battery or a logic board issue.',
      },
    ],
    commonProblems: [
      {
        title: 'Cable Not Seating Correctly',
        description: 'The USB-C cable feels loose, wiggles, or will not plug in fully.',
        // context: 'Frequently caused by compacted pocket lint or dirt at the base of the port.',
      },
      {
        title: 'Intermittent Charging',
        description: 'The phone only charges when the cable is held at a specific angle.',
        // context: 'A strong indicator of a physically worn or damaged internal connector.',
      },
      {
        title: 'No Wired Charging',
        description: 'The device completely fails to respond when plugged into a known-working charger.',
        // context: 'Requires diagnosis to rule out battery or logic-board power faults.',
      },
      {
        title: 'Debris or Corrosion',
        description: 'Visible dirt, liquid residue, or green/black corrosion inside the port.',
        // context: 'Corrosion can short internal pins and prevent safe power delivery.',
      },
    ],
    diagnosticSteps: [
      {
        step: 'External inspection and cleaning attempt',
        title: 'External inspection and cleaning attempt',
        description: 'We carefully check for and remove any compacted debris obstructing the port.',
      },
      {
        step: 'Cable and charger testing',
        title: 'Cable and charger testing',
        description: 'We test with our own verified equipment to rule out faulty accessories.',
      },
      {
        step: 'Diagnose charging faults',
        title: 'Diagnose charging faults',
        description: 'We determine if the issue is the port, the battery, or a deeper logic board fault.',
      },
      {
        step: 'Disassemble device',
        title: 'Disassemble device',
        description: 'We open the phone and safely disconnect internal power.',
      },
      {
        step: 'Replace port assembly',
        title: 'Replace port assembly',
        description: 'We install the new charging port component.',
      },
      {
        step: 'Verify charging and data',
        title: 'Verify charging and data',
        description: 'We test power draw and data connection reliability before reassembly.',
      },
    ],
    faq: [
      {
        question: `How much does ${config.modelName} charging-port repair cost?`,
        answer: 'We provide a clear quote after inspecting the port. If it only requires cleaning, the cost is minimal. If a replacement is needed, we will quote based on the specific part required.',
      },
      {
        question: 'Could debris be causing the problem?',
        answer: 'Yes, compacted pocket lint or dirt is one of the most common causes of a USB-C cable failing to seat properly or charge consistently.',
      },
      {
        question: 'How do you distinguish a port fault from a battery fault?',
        answer: 'We use diagnostic tools to measure power draw. If the device takes power but drains rapidly, the battery is likely at fault. If power is intermittent or absent at the connection, the port is typically the issue.',
      },
      {
        question: 'Can a damaged USB-C port affect data connection?',
        answer: 'Yes, the charging port also handles data transfer. Damage to specific pins can prevent your phone from communicating with a computer while still allowing basic charging, or vice versa.',
      },
      {
        question: 'Will my data normally remain on the phone?',
        answer: 'Yes, a charging port replacement is a hardware service that does not typically affect stored data. We always recommend keeping regular backups, however.',
      },
      {
        question: 'Will factory water resistance be restored?',
        answer: 'No. While we use appropriate internal adhesives during reassembly, the original factory IP rating cannot be guaranteed once a device has been opened.',
      },
      {
        question: 'How long does the repair take?',
        answer: 'Charging port replacement generally takes a few hours, though basic cleaning and assessment is much quicker.',
      },
    ],
  };
}
