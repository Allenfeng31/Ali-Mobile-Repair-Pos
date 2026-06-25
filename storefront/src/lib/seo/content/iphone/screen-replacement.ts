import { appendUniqueCommonProblems, appendUniqueDiagnosticSteps, appendUniqueFaqs, appendUniqueRepairOptions } from './shared';
import type { RepairTypeSeoPocket } from './types';

export function applyIphone14ProMaxScreenReplacementSeoPocket(
  pocket: RepairTypeSeoPocket
): RepairTypeSeoPocket {
  return {
    ...pocket,
    quickAnswer:
      "Need iPhone 14 Pro Max screen replacement in Ringwood? Ali Mobile & Repair checks cracked or damaged glass, touch-response faults, lines, flickering, available OLED or display options, frame condition, and the front sensor or Face ID area before confirming the repair path.",
    workbenchHeadings: {
      options: "What do we check before replacing this screen?",
      diagnostics: "How do we confirm the display fault?",
      symptoms: "Which screen symptoms matter most?",
      outcomes: "What can affect the final screen result?",
    },
    repairOptions: appendUniqueRepairOptions(pocket.repairOptions, [
      {
        name: "Front sensor area and final function checks",
        shortDescription:
          "We inspect the top display area, relevant front sensors, and the practical daily-use functions linked to the screen assembly.",
        bestFor:
          "Drops near the top edge or front sensor zone, plus phones with frame pressure around the display opening.",
        notes:
          "If Face ID or another front sensor fault is already present, we assess it carefully but do not promise a screen replacement alone will resolve it.",
      },
    ]),
    commonProblems: appendUniqueCommonProblems(pocket.commonProblems, [
      {
        title: "Ghost touch or unintended touch input",
        description:
          "The display may tap on its own, open apps, or type without normal input after impact damage. We test the screen assembly before confirming that replacement is the right fix.",
      },
      {
        title: "Black screen while the phone still responds",
        description:
          "Phone still rings or vibrates while the display stays black. OLED or screen damage, or a loose or failed display connector, may be involved. We test before confirming screen replacement.",
      },
      {
        title: "OLED ink marks, black spots, or dead pixels",
        description:
          "Dark blotches, spreading ink-like damage, or dead pixel areas can appear after pressure or impact even when the glass damage looks limited. We inspect the panel before quoting the repair path.",
      },
    ]),
    diagnosticSteps: appendUniqueDiagnosticSteps(pocket.diagnosticSteps, []),
    faq: appendUniqueFaqs(pocket.faq, [
      {
        question: "Can you fix an iPhone 14 Pro Max with cracked glass but working touch?",
        answer:
          "Yes. We still test the display and frame first because cracked glass can overlap with OLED damage, lifted edges, or touch faults even when the phone still unlocks.",
      },
      {
        question: "Do you check lines, flickering, or a black screen before replacing the display?",
        answer:
          "Yes. We test the image, touch response, and visible OLED behaviour before confirming that a screen replacement is the right repair path.",
      },
    ]),
  };
}
