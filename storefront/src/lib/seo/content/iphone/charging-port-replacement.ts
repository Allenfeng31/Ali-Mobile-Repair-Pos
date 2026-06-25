import { appendUniqueCommonProblems, appendUniqueDiagnosticSteps, appendUniqueFaqs, appendUniqueRepairOptions } from './shared';
import type { RepairTypeSeoPocket } from './types';

export function applyIphoneChargingPortReplacementSeoPocket(
  pocket: RepairTypeSeoPocket,
  modelName: string
): RepairTypeSeoPocket {
  return {
    ...pocket,
    quickAnswer:
      `Need ${modelName} charging port replacement in Ringwood? Ali Mobile & Repair checks angle-only charging, loose cable fit, intermittent or slow charging, debris or contamination, cable and charger response, cleaning suitability, and charging-port versus battery or board-level diagnosis before confirming replacement.`,
    workbenchHeadings: {
      options: "What do we check before replacing this charging port?",
      diagnostics: "How do we confirm the charging fault?",
      symptoms: "Which charging symptoms matter most?",
      outcomes: "What can affect the final charging result?",
    },
    repairOptions: appendUniqueRepairOptions(pocket.repairOptions, [
      {
        name: "Cable and charger test first",
        shortDescription:
          "We test known-good charging gear and compare cable fit before assuming the port assembly needs to be replaced.",
        bestFor:
          "Phones that charge with one cable, only respond at certain angles, or show inconsistent charging behaviour.",
        notes:
          "Bring the cable or charger that shows the issue if you can so we can compare it during the diagnosis.",
      },
    ]),
    commonProblems: appendUniqueCommonProblems(pocket.commonProblems, [
      {
        title: "Loose cable connection",
        description:
          "If the cable no longer seats firmly, the problem can come from contamination, damaged contacts, or port wear rather than the charger alone.",
      },
      {
        title: "Intermittent or slow charging",
        description:
          "Unstable cable charging can overlap with accessory issues, battery behaviour, or lower-assembly faults, so we test first.",
      },
      {
        title: "Wireless charging works but cable charging does not",
        description:
          "If the phone charges wirelessly but not through the port, we check the cable, charger, debris, port wear, and the wired charging path before confirming whether port replacement is needed.",
      },
    ]),
    diagnosticSteps: appendUniqueDiagnosticSteps(pocket.diagnosticSteps, []),
    faq: appendUniqueFaqs(pocket.faq, [
      {
        question: `Does my ${modelName} need charging port replacement if it only charges at an angle?`,
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
