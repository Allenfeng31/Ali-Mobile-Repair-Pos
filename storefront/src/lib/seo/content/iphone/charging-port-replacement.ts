import { appendUniqueCommonProblems, appendUniqueDiagnosticSteps, appendUniqueFaqs, appendUniqueRepairOptions } from './shared';
import type { IphoneHardwareConfig } from './config';
import type { RepairTypeSeoPocket } from './types';

function mapPocketText(
  pocket: RepairTypeSeoPocket,
  transform: (value: string) => string
): RepairTypeSeoPocket {
  return {
    ...pocket,
    quickAnswer: transform(pocket.quickAnswer),
    workbenchHeadings: pocket.workbenchHeadings
      ? {
          options: transform(pocket.workbenchHeadings.options),
          diagnostics: transform(pocket.workbenchHeadings.diagnostics),
          symptoms: transform(pocket.workbenchHeadings.symptoms),
          outcomes: transform(pocket.workbenchHeadings.outcomes),
        }
      : undefined,
    repairOptions: pocket.repairOptions.map((option) => ({
      name: transform(option.name),
      shortDescription: transform(option.shortDescription),
      bestFor: transform(option.bestFor),
      notes: transform(option.notes),
    })),
    commonProblems: pocket.commonProblems.map((problem) => ({
      title: transform(problem.title),
      description: transform(problem.description),
    })),
    diagnosticSteps: pocket.diagnosticSteps.map((step) => ({
      step: step.step,
      title: transform(step.title),
      description: transform(step.description),
    })),
    faq: pocket.faq.map((item) => ({
      question: transform(item.question),
      answer: transform(item.answer),
    })),
  };
}

function getChargingPortCopy(config: IphoneHardwareConfig) {
  switch (config.chargingPortType) {
    case 'usb-c':
      return {
        quickAnswer:
          `Need ${config.modelName} charging port replacement in Ringwood? Ali Mobile & Repair checks angle-only charging, loose USB-C cable fit, intermittent or slow charging, debris or contamination, USB-C cable and charger response, cleaning suitability, and charging-port versus battery or board-level diagnosis before confirming replacement.`,
        repairOptionDescription:
          'We test known-good USB-C charging gear and compare cable fit before assuming the port assembly needs to be replaced.',
        repairOptionNotes:
          'Bring the USB-C cable or charger that shows the issue if you can so we can compare it during the diagnosis.',
        looseCableDescription:
          'If the USB-C cable no longer seats firmly, the problem can come from contamination, damaged contacts, or port wear rather than the charger alone.',
        wiredOnlyDescription:
          'If the phone charges wirelessly but not through the port, we check the USB-C cable, charger, debris, port wear, and the wired charging path before confirming whether port replacement is needed.',
        angleFaqQuestion: `Does my ${config.modelName} need USB-C port replacement if it only charges at an angle?`,
      };
    case 'lightning':
    case 'unknown':
    default:
      return {
        quickAnswer:
          `Need ${config.modelName} charging port replacement in Ringwood? Ali Mobile & Repair checks angle-only charging, loose cable fit, intermittent or slow charging, debris or contamination, cable and charger response, cleaning suitability, and charging-port versus battery or board-level diagnosis before confirming replacement.`,
        repairOptionDescription:
          'We test known-good charging gear and compare cable fit before assuming the port assembly needs to be replaced.',
        repairOptionNotes:
          'Bring the cable or charger that shows the issue if you can so we can compare it during the diagnosis.',
        looseCableDescription:
          'If the cable no longer seats firmly, the problem can come from contamination, damaged contacts, or port wear rather than the charger alone.',
        wiredOnlyDescription:
          'If the phone charges wirelessly but not through the port, we check the cable, charger, debris, port wear, and the wired charging path before confirming whether port replacement is needed.',
        angleFaqQuestion: `Does my ${config.modelName} need charging port replacement if it only charges at an angle?`,
      };
  }
}

export function applyIphoneChargingPortReplacementSeoPocket(
  pocket: RepairTypeSeoPocket,
  config: IphoneHardwareConfig
): RepairTypeSeoPocket {
  const copy = getChargingPortCopy(config);
  let adjustedPocket = pocket;

  if (config.chargingPortType === 'usb-c') {
    adjustedPocket = mapPocketText(adjustedPocket, (value) =>
      value
        .replaceAll('Lightning tail-plug', 'USB-C plug')
        .replaceAll('Lightning socket', 'USB-C socket')
        .replaceAll('Lightning contacts', 'USB-C contacts')
        .replaceAll('Lightning accessory detection', 'USB-C accessory detection')
        .replaceAll('Lightning accessory', 'USB-C accessory')
        .replaceAll('Lightning accessories', 'USB-C accessories')
        .replaceAll('Lightning', 'USB-C')
    );
  }

  if (config.chargingPortType === 'unknown') {
    adjustedPocket = mapPocketText(adjustedPocket, (value) =>
      value
        .replaceAll('USB-C port', 'charging port')
        .replaceAll('USB-C socket', 'charging port')
        .replaceAll('USB-C cable', 'charging cable')
        .replaceAll('USB-C charger', 'charger')
        .replaceAll('USB-C accessory detection', 'wired accessory detection')
        .replaceAll('USB-C accessories', 'wired accessories')
        .replaceAll('USB-C accessory', 'wired accessory')
        .replaceAll('USB-C contacts', 'port contacts')
        .replaceAll('USB-C plug', 'charging plug')
        .replaceAll('USB-C', 'charging')
        .replaceAll('Lightning port', 'charging port')
        .replaceAll('Lightning socket', 'charging port')
        .replaceAll('Lightning cable', 'charging cable')
        .replaceAll('Lightning charger', 'charger')
        .replaceAll('Lightning accessory detection', 'wired accessory detection')
        .replaceAll('Lightning accessories', 'wired accessories')
        .replaceAll('Lightning accessory', 'wired accessory')
        .replaceAll('Lightning contacts', 'port contacts')
        .replaceAll('Lightning tail-plug', 'charging plug')
        .replaceAll('Lightning', 'charging')
    );
  }

  return {
    ...adjustedPocket,
    quickAnswer: copy.quickAnswer,
    workbenchHeadings: {
      options: "What do we check before replacing this charging port?",
      diagnostics: "How do we confirm the charging fault?",
      symptoms: "Which charging symptoms matter most?",
      outcomes: "What can affect the final charging result?",
    },
    repairOptions: appendUniqueRepairOptions(adjustedPocket.repairOptions, [
      {
        name: "Cable and charger test first",
        shortDescription: copy.repairOptionDescription,
        bestFor:
          "Phones that charge with one cable, only respond at certain angles, or show inconsistent charging behaviour.",
        notes: copy.repairOptionNotes,
      },
    ]),
    commonProblems: appendUniqueCommonProblems(adjustedPocket.commonProblems, [
      {
        title: "Loose cable connection",
        description: copy.looseCableDescription,
      },
      {
        title: "Intermittent or slow charging",
        description:
          "Unstable cable charging can overlap with accessory issues, battery behaviour, or lower-assembly faults, so we test first.",
      },
      {
        title: "Wireless charging works but cable charging does not",
        description: copy.wiredOnlyDescription,
      },
    ]),
    diagnosticSteps: appendUniqueDiagnosticSteps(adjustedPocket.diagnosticSteps, []),
    faq: appendUniqueFaqs(adjustedPocket.faq, [
      {
        question: copy.angleFaqQuestion,
        answer:
          "Not always. We inspect for debris, contamination, cable fit, and wear first because some angle-only charging faults can be confirmed or ruled out before a replacement is quoted.",
      },
      {
        question: "Can a battery or board fault look like a charging port problem?",
        answer:
          "Yes. That is why we test the charging path first and do not promise that every charging fault is solved by the port alone.",
      },
    ]),
  };
}
