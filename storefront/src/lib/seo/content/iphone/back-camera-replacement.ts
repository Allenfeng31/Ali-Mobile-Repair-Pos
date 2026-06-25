import {
  appendUniqueCommonProblems,
  appendUniqueDiagnosticSteps,
  appendUniqueFaqs,
  appendUniqueRepairOptions,
} from './shared';
import type { RepairTypeSeoPocket } from './types';

export function applyIphoneBackCameraReplacementSeoPocket(
  pocket: RepairTypeSeoPocket,
  modelName: string
): RepairTypeSeoPocket {
  return {
    ...pocket,
    quickAnswer:
      `Need ${modelName} back camera replacement in Ringwood? Ali Mobile & Repair checks rear camera focus, image failure, stabilisation symptoms, lens-glass damage, camera-area impact, housing fit, and rear camera mode behaviour before confirming whether back camera replacement is the right path.`,
    workbenchHeadings: {
      options: "What do we check before replacing this back camera?",
      diagnostics: "How do we confirm the rear camera fault?",
      symptoms: "Which back camera symptoms matter most?",
      outcomes: "What can affect the final back camera result?",
    },
    repairOptions: appendUniqueRepairOptions(
      pocket.repairOptions.map((option) => {
        switch (option.name) {
          case "Rear camera module diagnosis":
            return {
              ...option,
              name: "Rear camera focus and stabilisation diagnosis",
              shortDescription:
                "We check focus, image shake, black preview, rear camera switching, and whether the module behaviour points to an internal camera fault.",
              bestFor:
                "Phones with blurry rear photos, shaking image, failed rear camera modes, or no rear camera image after impact.",
              notes:
                "We do not assume every rear camera symptom means the module itself must be replaced.",
            };
          case "Front camera and Face ID area check":
            return {
              ...option,
              name: "Rear camera area and housing inspection",
              shortDescription:
                "We inspect the camera island, surrounding housing fit, impact around the rear camera area, and whether alignment or housing damage changes the repair scope.",
              bestFor:
                "Phones with drop damage near the rear camera area, one rear lens failing, or concern about camera-area housing condition.",
              notes:
                "Rear housing damage, alignment issues, or prior impact can change whether the module alone is the practical repair path.",
            };
          case "Lens glass and dust assessment":
            return {
              ...option,
              name: "Lens glass, camera ring, and module assessment",
              shortDescription:
                "We separate cracked external lens glass, camera ring damage, contamination, and internal module failure before confirming the repair path.",
              bestFor:
                "Customers seeing glare, image artefacts, cracked lens glass, or uncertainty about whether the fault is external or internal.",
              notes:
                "External camera lens glass damage is not automatically the same repair as internal back camera module replacement.",
            };
          default:
            return option;
        }
      }),
      [
        {
          name: "Final rear-camera mode retesting",
          shortDescription:
            "After repair, we retest image clarity, focus, rear camera switching, and the main rear-camera modes linked to the repair area.",
          bestFor:
            "Customers who want the rear camera path checked again before pickup rather than only having the module fitted.",
          notes:
            "If another lens-glass, housing, or board-level issue remains, we explain that separately instead of assuming the module alone resolves it.",
        },
      ]
    ),
    commonProblems: appendUniqueCommonProblems(
      pocket.commonProblems.map((problem) => {
        switch (problem.title) {
          case "Blurry or shaking rear camera":
            return {
              title: "Blurred, shaking, or unstable rear camera",
              description:
                "Impact can affect focus or stabilisation, causing shaky image behaviour, unclear photos, or unstable rear camera performance.",
            };
          case "Black camera preview":
            return {
              title: "Rear camera image not appearing",
              description:
                "A black rear camera preview can come from a module fault, connection issue, or another fault in the rear camera path.",
            };
          case "Cracked lens glass":
            return {
              title: "Cracked rear lens glass versus internal camera fault",
              description:
                "Broken outer lens glass can cause glare, dust spots, and moisture risk, but it is not automatically the same repair as internal back camera module replacement.",
            };
          case "Front camera or Face ID area impact":
            return {
              title: "Impact around the rear camera area",
              description:
                "Damage around the camera island can affect housing fit, camera alignment, and whether the rear camera module is the only fault involved.",
            };
          case "Dust, fog, or moisture marks":
            return {
              title: "Dark spots, haze, or image artefacts",
              description:
                "Dust, haze, or image marks can come from broken lens glass, contamination, or internal rear camera faults that need diagnosis first.",
            };
          case "Software versus hardware fault":
            return {
              title: "One rear lens or camera mode failing",
              description:
                "We test rear camera modes separately because one lens, one mode, or the switching behaviour can fail without the entire camera system being the same fault.",
            };
          default:
            return problem;
        }
      }),
      [
        {
          title: "Rear camera switching or focus inconsistency",
          description:
            "If the phone struggles to switch between supported rear cameras or cannot settle focus, we test whether the fault is in the module, lens-glass path, or housing area.",
        },
        {
          title: "Camera-area housing or fit concern",
          description:
            "Rear camera issues can overlap with bent housing, impact near the camera island, or surrounding fit problems that change the repair scope.",
        },
      ]
    ),
    diagnosticSteps: appendUniqueDiagnosticSteps(
      pocket.diagnosticSteps.map((step) => {
        switch (step.title) {
          case "Test camera modes":
            return {
              ...step,
              title: "Test rear camera modes and lens switching",
              description:
                "We check rear photo, video, focus, exposure, stabilisation behaviour, and switching across supported rear camera modes.",
            };
          case "Inspect lens and housing":
            return {
              ...step,
              title: "Inspect lens glass, camera rings, and rear housing",
              description:
                "We inspect lens glass, camera rings, rear housing fit, contamination, and visible impact around the rear camera area before quoting.",
            };
          case "Check front camera risk":
            return {
              ...step,
              title: "Separate lens-glass damage from module failure",
              description:
                "We explain whether the symptom still points to external lens-glass damage, housing damage, or internal back camera module failure before confirming scope.",
            };
          case "Confirm final camera function":
            return {
              ...step,
              title: "Confirm final rear camera function",
              description:
                "After repair, we retest rear image clarity, focus, supported rear camera modes, and normal app behaviour linked to the repair area.",
            };
          default:
            return step;
        }
      }),
      [
        {
          step: "05",
          title: "Confirm scope before back camera replacement",
          description:
            "We confirm whether the fault still points to back camera replacement after checking lens glass, housing fit, and rear camera mode behaviour.",
        },
      ]
    ),
    faq: appendUniqueFaqs(
      pocket.faq.map((item) => {
        switch (item.question) {
          case "Can you fix an iPhone 13 camera that is blurry or shaking?":
            return {
              question: `Can you fix a ${modelName} back camera that is blurry or shaking?`,
              answer:
                "Yes. We test focus, stabilisation symptoms, rear camera switching, and app behaviour to confirm whether the internal back camera module, lens-glass path, or another fault is causing the issue.",
            };
          case "Do you repair cracked iPhone 13 camera lens glass?":
            return {
              question: `Do you separate ${modelName} rear lens-glass damage from back camera module faults?`,
              answer:
                "Yes. We inspect lens glass, camera rings, contamination, and housing condition first because cracked rear lens glass is not automatically the same repair as internal back camera replacement.",
            };
          case "Will front camera repair affect Face ID?":
            return {
              question: `Can damage around the ${modelName} rear camera area change the repair path?`,
              answer:
                "Yes. Impact around the rear camera area can affect housing fit, alignment, or surrounding parts, so we inspect that before confirming whether the back camera module alone is the right repair.",
            };
          case "Can iPhone 13 camera repair be done same day in Ringwood?":
            return {
              question: `Can ${modelName} back camera replacement be done the same day in Ringwood?`,
              answer:
                "Many back camera repairs can be handled the same day when the correct part is available and no hidden lens-glass, housing, or board-level issue changes the scope.",
            };
          default:
            return item;
        }
      }),
      [
        {
          question: `Will Ali Mobile check whether one ${modelName} rear camera mode is failing before replacement?`,
          answer:
            "Yes. We test rear camera modes and switching behaviour first because one lens or one mode can fail without automatically meaning the entire rear camera path needs the same repair.",
        },
        {
          question: `Does ${modelName} back camera replacement guarantee every image-quality issue will be solved?`,
          answer:
            "No. Some image-quality faults are caused by lens-glass damage, housing damage, contamination, or another camera-path issue, so we diagnose first before confirming replacement.",
        },
      ]
    ),
  };
}
