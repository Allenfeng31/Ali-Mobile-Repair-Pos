import { appendUniqueCommonProblems, appendUniqueDiagnosticSteps, appendUniqueFaqs, appendUniqueRepairOptions } from './shared';
import type { RepairTypeSeoPocket } from './types';

export function applyIphone14ProMaxBackGlassReplacementSeoPocket(
  pocket: RepairTypeSeoPocket
): RepairTypeSeoPocket {
  return {
    ...pocket,
    quickAnswer:
      "Need iPhone 14 Pro Max back glass replacement in Ringwood? Ali Mobile & Repair checks cracked or missing rear glass, sharp edges, lifting or exposed areas, camera-area damage, surrounding housing condition, repair-method suitability, and relevant wireless-charging checks before confirming the rear glass or back housing path.",
    workbenchHeadings: {
      options: "What do we check before rear glass work starts?",
      diagnostics: "How do we confirm the rear repair path?",
      symptoms: "Which back-glass symptoms matter most?",
      outcomes: "What can affect the final rear-glass result?",
    },
    repairOptions: appendUniqueRepairOptions(pocket.repairOptions, []),
    commonProblems: appendUniqueCommonProblems(pocket.commonProblems, [
      {
        title: "Sharp edges and lifting sections",
        description:
          "Broken rear glass can lift away from the housing or leave sharp edges that should be assessed before further use.",
      },
      {
        title: "Missing glass pieces or exposed rear sections",
        description:
          "If parts of the rear glass are missing, the phone may have exposed sections that collect dust or feel unsafe to handle. We inspect the damage extent before confirming the repair path.",
      },
      {
        title: "Damage that may change the back glass / back housing method",
        description:
          "Severe corner, frame, or housing damage can affect whether the current back glass / back housing method is suitable, so we confirm the practical repair path before proceeding.",
      },
    ]),
    diagnosticSteps: appendUniqueDiagnosticSteps(pocket.diagnosticSteps, []),
    faq: appendUniqueFaqs(pocket.faq, [
      {
        question: "Can you repair cracked iPhone 14 Pro Max back glass with sharp edges or missing sections?",
        answer:
          "Yes. We assess the full damage extent first, including exposed areas, lifting sections, and whether the surrounding housing condition changes the repair path.",
      },
      {
        question: "Do you check the camera area before iPhone 14 Pro Max back glass replacement?",
        answer:
          "Yes. Damage around the camera area is reviewed before we confirm the practical rear-glass or back-housing method.",
      },
      {
        question: "Will Ali Mobile confirm the rear-glass repair method before proceeding?",
        answer:
          "Yes. We confirm the repair method and quote before work starts so you know whether the job suits the current rear-glass or back-housing path on the page.",
      },
      {
        question: "Will iPhone 14 Pro Max back glass replacement restore factory water resistance?",
        answer:
          "No. We handle resealing carefully, but factory water resistance cannot be guaranteed after the phone has been opened.",
      },
    ]),
  };
}
