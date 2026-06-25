import {
  appendUniqueCommonProblems,
  appendUniqueDiagnosticSteps,
  appendUniqueFaqs,
  appendUniqueRepairOptions,
} from './shared';
import type { RepairTypeSeoPocket } from './types';

export function applyIphoneFrontCameraReplacementSeoPocket(
  pocket: RepairTypeSeoPocket,
  modelName: string
): RepairTypeSeoPocket {
  return {
    ...pocket,
    quickAnswer:
      `Need ${modelName} front camera replacement in Ringwood? Ali Mobile & Repair checks selfie image failure, blur, haze, portrait-camera problems, top sensor-area impact, front camera alignment, and TrueDepth-related risk before confirming whether front camera replacement is the right path.`,
    workbenchHeadings: {
      options: "What do we check before replacing this front camera?",
      diagnostics: "How do we confirm the front camera fault?",
      symptoms: "Which front camera symptoms matter most?",
      outcomes: "What can affect the final front camera result?",
    },
    repairOptions: appendUniqueRepairOptions(
      pocket.repairOptions.map((option) => {
        switch (option.name) {
          case "Rear camera module diagnosis":
            return {
              ...option,
              name: "Front camera image diagnosis",
              shortDescription:
                "We check selfie preview, focus behaviour, portrait-camera response, exposure, and whether the front camera image fails completely.",
              bestFor:
                "Phones with blurred selfies, black front camera preview, weak portrait-camera behaviour, or front camera faults after impact.",
              notes:
                "We do not assume every front camera symptom requires module replacement before inspection.",
            };
          case "Front camera and Face ID area check":
            return {
              ...option,
              name: "TrueDepth-area and connector-path inspection",
              shortDescription:
                "We inspect the top sensor area, front camera alignment, surrounding components, and related connector risk before quoting.",
              bestFor:
                "Phones with impact near the earpiece, top screen area, or symptoms involving both the front camera and Face ID-related functions.",
              notes:
                "Front camera replacement does not automatically guarantee Face ID restoration because paired or separate components may also be involved.",
            };
          case "Lens glass and dust assessment":
            return {
              ...option,
              name: "Front camera clarity and contamination assessment",
              shortDescription:
                "We check haze, dust, moisture marks, or image spots in the front camera path and assess whether cleaning, alignment, or replacement is more likely.",
              bestFor:
                "Customers seeing foggy selfies, front-camera spots, or unclear images after screen or impact damage.",
              notes:
                "Inspection is required before confirming whether the issue is the front camera itself or another surrounding fault.",
            };
          default:
            return option;
        }
      }),
      [
        {
          name: "Final front-facing function retesting",
          shortDescription:
            "After repair, we retest selfie image quality, portrait-camera response, and the main front-facing functions linked to the repair area.",
          bestFor:
            "Customers who want the front camera path checked again before pickup rather than only having the module fitted.",
          notes:
            "If another TrueDepth-related issue remains, we explain that separately instead of assuming the front camera alone resolves it.",
        },
      ]
    ),
    commonProblems: appendUniqueCommonProblems(
      pocket.commonProblems.map((problem) => {
        switch (problem.title) {
          case "Blurry or shaking rear camera":
            return {
              title: "Blurred or unfocused selfies",
              description:
                "The front camera may produce soft, unclear, or unstable selfies when focus or the front camera path is affected.",
            };
          case "Black camera preview":
            return {
              title: "Front camera image not appearing",
              description:
                "A black front-camera preview can come from a camera fault, connection issue, or another fault in the surrounding top assembly.",
            };
          case "Cracked lens glass":
            return {
              title: "Dust, haze, or spots in front-camera images",
              description:
                "Fog, dust, or image spots can point to contamination, prior damage, or a front camera path issue that needs inspection before replacement is confirmed.",
            };
          case "Front camera or Face ID area impact":
            return {
              title: "Front camera or TrueDepth-area impact",
              description:
                "Damage near the earpiece and top sensor area can affect front camera behaviour and may overlap with Face ID-related symptoms.",
            };
          case "Dust, fog, or moisture marks":
            return {
              title: "Portrait or selfie camera inconsistency",
              description:
                "Portrait-camera faults or unstable selfie behaviour can overlap with alignment, sensor-area, or contamination issues rather than the front camera alone.",
            };
          case "Software versus hardware fault":
            return {
              title: "Software versus hardware fault",
              description:
                "We test the front camera across normal modes because app-level glitches and hardware faults can look similar at first.",
            };
          default:
            return problem;
        }
      }),
      [
        {
          title: "Front camera issue after screen or impact damage",
          description:
            "A screen-area impact or prior screen work can affect the front camera path, so we inspect before confirming replacement.",
        },
        {
          title: "Face ID symptoms alongside front camera faults",
          description:
            "Front camera problems can appear alongside Face ID symptoms, but front camera replacement alone does not prove the paired TrueDepth path will be restored.",
        },
      ]
    ),
    diagnosticSteps: appendUniqueDiagnosticSteps(
      pocket.diagnosticSteps.map((step) => {
        switch (step.title) {
          case "Test camera modes":
            return {
              ...step,
              title: "Test selfie and portrait-camera behaviour",
              description:
                "We check selfie preview, portrait-camera response, image clarity, exposure, and whether the front camera fails consistently.",
            };
          case "Inspect lens and housing":
            return {
              ...step,
              title: "Inspect top camera path and surrounding fit",
              description:
                "We inspect the top camera path, earpiece area, surrounding alignment, dust, haze, and visible impact before quoting.",
            };
          case "Check front camera risk":
            return {
              ...step,
              title: "Check TrueDepth and Face ID-related limitations",
              description:
                "Where front camera symptoms overlap with the top sensor area, we explain that TrueDepth and Face ID problems may involve paired or separate components.",
            };
          case "Confirm final camera function":
            return {
              ...step,
              title: "Confirm final front-facing camera function",
              description:
                "After repair, we retest selfie image quality, portrait-camera response, and the normal front-facing camera functions linked to the repair area.",
            };
          default:
            return step;
        }
      }),
      [
        {
          step: "05",
          title: "Confirm scope before front camera replacement",
          description:
            "We confirm whether the fault still points to front camera replacement after checking image behaviour, surrounding fit, and any TrueDepth-related risk.",
        },
      ]
    ),
    faq: appendUniqueFaqs(
      pocket.faq.map((item) => {
        switch (item.question) {
          case "Can you fix an iPhone 13 camera that is blurry or shaking?":
            return {
              question: `Can you fix a ${modelName} front camera that is blurry or not focusing properly?`,
              answer:
                "Yes. We test selfie image clarity, portrait-camera behaviour, and the front camera path before confirming whether the issue points to the module itself or another surrounding fault.",
            };
          case "Do you repair cracked iPhone 13 camera lens glass?":
            return {
              question: `Can dust or haze in the ${modelName} top camera area affect selfies?`,
              answer:
                "Yes. Dust, haze, or moisture marks can affect front-camera images, so we inspect the front camera path before confirming whether cleaning, alignment, or replacement is needed.",
            };
          case "Will front camera repair affect Face ID?":
            return {
              question: "Does front camera replacement automatically restore Face ID?",
              answer:
                "No. Front camera replacement does not automatically guarantee Face ID restoration because the TrueDepth and Face ID path can involve paired or separate components that still need inspection.",
            };
          case "Can iPhone 13 camera repair be done same day in Ringwood?":
            return {
              question: `Can ${modelName} front camera replacement be done the same day in Ringwood?`,
              answer:
                "Many front camera repairs can be handled the same day when the correct part is available and no hidden top-assembly or board-level issue changes the scope.",
            };
          default:
            return item;
        }
      }),
      [
        {
          question: `Can a screen-area impact cause ${modelName} front camera problems?`,
          answer:
            "Yes. Damage near the top display and earpiece area can affect the front camera path, which is why we inspect the surrounding assembly before confirming replacement.",
        },
        {
          question: `Will Ali Mobile check TrueDepth-related symptoms before ${modelName} front camera replacement?`,
          answer:
            "Yes. If the front camera fault overlaps with Face ID or TrueDepth symptoms, we explain that inspection first because the repair scope may involve more than the front camera alone.",
        },
      ]
    ),
  };
}
