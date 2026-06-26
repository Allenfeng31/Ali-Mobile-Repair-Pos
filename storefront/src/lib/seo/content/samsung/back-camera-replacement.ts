import type { RepairTypeSeoPocket, SamsungHardwareConfig } from './types';
import {
  SAMSUNG_CATALOGUE_VARIANT_NOTE,
  SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE,
  SAMSUNG_QUOTE_ONLY_SCOPE,
  SAMSUNG_WATER_RESISTANCE_NOTE,
  getSamsungRearCameraLabel,
} from './shared';

export function buildSamsungBackCameraReplacementPocket(
  config: SamsungHardwareConfig
): RepairTypeSeoPocket {
  if (config.modelSlug === 'galaxy-s23-ultra') {
    return {
      quickAnswer:
        `Need ${config.modelName} back camera replacement in Ringwood? Ali Mobile & Repair checks black preview, blur, focus inconsistency, shake, image artefacts, and impact around the camera housing before identifying which rear camera module is actually affected.`,
      workbenchHeadings: {
        options: `Which back-camera path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before rear-camera work?',
        symptoms: 'Which rear-camera symptoms matter most?',
        outcomes: 'What can change the rear-camera scope?',
      },
      repairOptions: [
        {
          name: 'Quad-camera function diagnosis',
          shortDescription:
            'We test preview, focus, image stability, artefacts, and whether the issue appears in one supported rear-camera mode or across more than one mode.',
          bestFor:
            'Phones where one rear camera mode fails, preview turns black, focus hunts, or image quality changes after impact.',
          notes:
            'The technician identifies the affected camera module first because one repair does not automatically replace all rear cameras on the phone.',
        },
        {
          name: 'Lens glass, housing, and module separation',
          shortDescription:
            'We separate external lens glass damage, rear housing damage, and internal camera-module faults before confirming the repair path.',
          bestFor:
            'Phones with impact around the camera housing, visible outer damage, or image problems that may not come from the internal camera module alone.',
          notes:
            'External camera lens glass is not a confirmed standalone service, and rear housing damage can affect camera performance without proving that every internal module needs replacement.',
        },
        {
          name: 'Catalogue-driven scope confirmation',
          shortDescription:
            'We confirm the affected module path, explain the likely repair scope, and keep the displayed route aligned with the live catalogue listing.',
          bestFor:
            'Customers who want to understand why one rear-camera issue does not automatically mean that all four physical camera modules are being replaced together.',
          notes:
            `${SAMSUNG_CATALOGUE_VARIANT_NOTE} ${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'One rear-camera mode fails',
          description:
            'A fault can show up in one rear-camera mode without meaning that every rear camera on the phone has failed together.',
        },
        {
          title: 'Blur or focus inconsistency',
          description:
            'Blur, focus hunting, or unstable detail can point to one affected camera module, but it still needs diagnosis before replacement is confirmed.',
        },
        {
          title: 'Shaking or image instability',
          description:
            'Shake can come from module damage or impact-related alignment issues, so we do not assume every stabilisation complaint is solved the same way.',
        },
        {
          title: 'Artefacts or black preview',
          description:
            'Image artefacts and black preview are checked against both module-specific faults and broader impact around the camera housing.',
        },
        {
          title: 'Lens glass or housing overlap',
          description:
            'Cracked lens glass or housing damage can affect image quality, but those findings do not automatically prove that all rear modules need replacement.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Test the supported rear-camera modes',
          description:
            'We compare preview, focus, and image behaviour across the relevant rear-camera modes before deciding which module path is affected.',
        },
        {
          step: '02',
          title: 'Inspect the camera housing externally',
          description:
            'External lens glass, housing damage, and impact signs are reviewed before we treat the fault as an internal module-only problem.',
        },
        {
          step: '03',
          title: 'Identify the affected camera module',
          description:
            'We confirm whether one module or a broader camera-area issue explains the fault before the repair scope is finalised.',
        },
        {
          step: '04',
          title: 'Retest the confirmed camera path',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_CATALOGUE_VARIANT_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Does ${config.modelName} Back Camera Replacement mean all four rear cameras are replaced together?`,
          answer:
            'No. The phone has a quad rear-camera system, but the technician still identifies the affected camera module and the repair scope before assuming that every rear camera is included together.',
        },
        {
          question: `Can you tell whether my ${config.modelName} issue is lens glass, housing, or an internal camera module?`,
          answer:
            'Yes. We separate external lens glass, housing damage, and internal camera-module faults before confirming the repair path.',
        },
        {
          question: `Is external lens glass a standalone ${config.modelName} service on this page?`,
          answer:
            'No. External camera lens glass is not confirmed here as a standalone public service, so we inspect it as part of the broader camera-area diagnosis.',
        },
        {
          question: `Why does the ${config.modelName} back camera page still need inspection even when a price is shown?`,
          answer:
            'Because the displayed route comes from one unified POS Back Camera Replacement listing, while the actual failed rear camera module still has to be identified during diagnosis.',
        },
        {
          question: `Will back camera repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  if (config.seriesFamily === 'galaxy-s') {
    const rearCameraLabel = getSamsungRearCameraLabel(config);
    const rearCameraModesLabel =
      config.rearCameraClass === 'single'
        ? 'the rear camera path'
        : config.rearCameraClass === 'dual'
          ? 'supported rear-camera modes'
          : config.rearCameraClass === 'triple'
            ? 'supported rear-camera modes'
            : 'the available rear-camera modes';
    const rearCameraClassLabel =
      config.rearCameraClass === 'single'
        ? 'single rear-camera'
        : config.rearCameraClass === 'dual'
          ? 'dual rear-camera'
          : config.rearCameraClass === 'triple'
            ? 'triple rear-camera'
            : 'rear-camera';

    return {
      quickAnswer:
        `Need ${config.modelName} back camera replacement in Ringwood? Ali Mobile & Repair checks preview failure, blur, focus inconsistency, shake, image artefacts, and impact around the camera housing before confirming whether the fault sits in lens glass, housing, alignment, or the ${rearCameraLabel} itself.`,
      workbenchHeadings: {
        options: `Which back-camera path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before rear-camera work?',
        symptoms: 'Which rear-camera symptoms matter most?',
        outcomes: 'What can change the rear-camera scope?',
      },
      repairOptions: [
        {
          name: 'Rear camera function diagnosis',
          shortDescription:
            `We test preview, focus, ${rearCameraModesLabel === 'the rear camera path' ? 'image consistency' : `switching between ${rearCameraModesLabel}`}, artefacts, and instability before confirming whether a camera module fault is present.`,
          bestFor:
            'Phones with black preview, blur, focus hunting, shaking, or problems that appear in one rear-camera mode only.',
          notes:
            `${rearCameraClassLabel.charAt(0).toUpperCase()}${rearCameraClassLabel.slice(1)} behaviour is assessed carefully because not every image issue points to the same rear camera path.`,
        },
        {
          name: 'Lens glass, housing, and alignment separation',
          shortDescription:
            'We separate cracked external lens glass, rear housing damage, and alignment issues from internal camera-module failure before quoting.',
          bestFor:
            'Phones with impact around the camera area, broken outer lens glass, or visible deformation near the rear housing.',
          notes:
            'Hinge or frame deformation can affect camera performance without meaning the rear camera module alone has failed.',
        },
        {
          name: 'Quote-only rear-camera confirmation',
          shortDescription:
            'We confirm whether the scope is lens glass, housing-related, or internal camera-module work before parts are approved.',
          bestFor:
            'Phones where the fault is visible in some camera modes but not others, or where external impact has changed the likely repair path.',
          notes:
            `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Preview failure or black image',
          description:
            'A failed preview can come from internal camera damage, but it can also overlap with impact and connection issues around the rear camera area.',
        },
        {
          title: 'Blur or focus inconsistency',
          description:
            `Blur, focus hunting, or weak detail in one mode may point to one rear-camera path rather than every camera at once.`,
        },
        {
          title: 'Shaking or image instability',
          description:
            'Shake can indicate module damage, but we do not assume every stabilisation complaint is solved by a camera-module replacement.',
        },
        {
          title: 'Lens glass or housing damage',
          description:
            'Cracked outer lens glass or rear housing damage can affect image quality and must be separated from internal camera failure.',
        },
        {
          title: 'Frame deformation overlap',
          description:
            'Rear camera issues can follow larger impact damage, so frame deformation is considered during diagnosis.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Test rear-camera modes and preview behaviour',
          description:
            `We check preview, focus, image stability, and whether the issue is limited to one of ${rearCameraModesLabel}.`,
        },
        {
          step: '02',
          title: 'Inspect the rear camera area externally',
          description:
            'External lens glass, rear housing, and impact signs are reviewed before assuming the camera module is the only fault.',
        },
        {
          step: '03',
          title: 'Check for alignment or structural overlap',
          description:
            'Frame deformation is considered during diagnosis because it can affect the rear camera path after impact.',
        },
        {
          step: '04',
          title: 'Confirm the quote-only repair scope',
          description:
            'We explain whether the likely path is lens glass, housing, internal camera-module work, or a broader structural issue.',
        },
      ],
      faq: [
        {
          question: `Does every blurry ${config.modelName} photo mean the rear camera module is bad?`,
          answer:
            'No. Blur can come from lens glass damage, housing distortion, focus issues, or one affected rear-camera path, so we diagnose first.',
        },
        {
          question: `Can you tell whether my ${config.modelName} needs lens glass or full back camera work?`,
          answer:
            'Yes. We separate external lens glass damage, rear housing issues, and internal camera-module faults before confirming the quote.',
        },
        {
          question: `Do you guarantee stabilisation restoration after ${config.modelName} back camera repair?`,
          answer:
            'No. We test image stability and explain the likely outcome, but we do not promise that every shake or stabilisation symptom is solved by camera-module work alone.',
        },
        {
          question: `Why is ${config.modelName} back camera service quote-only?`,
          answer:
            'Impact around the camera area, lens-glass damage, housing distortion, and one-mode-only faults can all change the correct repair scope and price.',
        },
        {
          question: `Will back camera repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  const rearCameraModesLabel =
    config.rearCameraClass === 'single'
      ? 'the rear camera path'
      : config.rearCameraClass === 'dual'
        ? 'supported rear-camera modes'
        : config.rearCameraClass === 'triple'
          ? 'supported rear-camera modes'
          : 'the available rear-camera modes';
  const rearCameraClassLabel =
    config.rearCameraClass === 'single'
      ? 'single rear-camera'
      : config.rearCameraClass === 'dual'
        ? 'dual rear-camera'
        : config.rearCameraClass === 'triple'
          ? 'triple rear-camera'
          : 'rear-camera';

  return {
    quickAnswer:
      `Need ${config.modelName} back camera replacement in Ringwood? Ali Mobile & Repair checks preview failure, blur, focus inconsistency, shake, image artefacts, and impact around the rear camera area before confirming whether the fault sits in lens glass, housing, alignment, or the camera module itself.`,
    workbenchHeadings: {
      options: `Which back-camera path fits this ${config.modelName}?`,
      diagnostics: 'What do we inspect before rear-camera work?',
      symptoms: 'Which rear-camera symptoms matter most?',
      outcomes: 'What can change the rear-camera scope?',
    },
    repairOptions: [
      {
        name: 'Rear camera function diagnosis',
        shortDescription:
          `We test preview, focus, ${rearCameraModesLabel === 'the rear camera path' ? 'image consistency' : `switching between ${rearCameraModesLabel}`}, artefacts, and instability before confirming whether a camera module fault is present.`,
        bestFor:
          'Phones with black preview, blur, focus hunting, shaking, or problems that appear in one rear-camera mode only.',
        notes:
          `${rearCameraClassLabel.charAt(0).toUpperCase()}${rearCameraClassLabel.slice(1)} behaviour is assessed carefully because not every image issue points to the same rear camera path.`,
      },
      {
        name: 'Lens glass, housing, and alignment separation',
        shortDescription:
          'We separate cracked external lens glass, rear housing damage, and alignment issues from internal camera-module failure before quoting.',
        bestFor:
          'Phones with impact around the camera area, broken outer lens glass, or visible deformation near the rear housing.',
        notes:
          'Hinge or frame deformation can affect camera performance without meaning the rear camera module alone has failed.',
      },
      {
        name: 'Quote-only rear-camera confirmation',
        shortDescription:
          'We confirm whether the scope is lens glass, housing-related, or internal camera-module work before parts are approved.',
        bestFor:
          'Phones where the fault is visible in some camera modes but not others, or where external impact has changed the likely repair path.',
        notes:
          `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
      },
    ],
    commonProblems: [
      {
        title: 'Preview failure or black image',
        description:
          'A failed preview can come from internal camera damage, but it can also overlap with impact and connection issues around the rear camera area.',
      },
      {
        title: 'Blur or focus inconsistency',
        description:
          `Blur, focus hunting, or weak detail in one mode may point to one rear-camera path rather than every camera at once.`,
      },
      {
        title: 'Shaking or image instability',
        description:
          'Shake can indicate module damage, but we do not assume every stabilisation complaint is solved by a camera-module replacement.',
      },
      {
        title: 'Lens glass or housing damage',
        description:
          'Cracked outer lens glass or rear housing damage can affect image quality and must be separated from internal camera failure.',
      },
      {
        title: 'Hinge or frame deformation overlap',
        description:
          'Rear camera issues can follow larger impact damage, so hinge and frame deformation are considered during diagnosis.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: 'Test rear-camera modes and preview behaviour',
        description:
          `We check preview, focus, image stability, and whether the issue is limited to one of ${rearCameraModesLabel}.`,
      },
      {
        step: '02',
        title: 'Inspect the rear camera area externally',
        description:
          'External lens glass, rear housing, and impact signs are reviewed before assuming the camera module is the only fault.',
      },
      {
        step: '03',
        title: 'Check for alignment or structural overlap',
        description:
          'Frame or hinge deformation is considered during diagnosis because it can affect the rear camera path after impact.',
      },
      {
        step: '04',
        title: 'Confirm the quote-only repair scope',
        description:
          'We explain whether the likely path is lens glass, housing, internal camera-module work, or a broader structural issue.',
      },
    ],
    faq: [
      {
        question: `Does every blurry ${config.modelName} photo mean the rear camera module is bad?`,
        answer:
          'No. Blur can come from lens glass damage, housing distortion, focus issues, or one affected rear-camera path, so we diagnose first.',
      },
      {
        question: `Can you tell whether my ${config.modelName} needs lens glass or full back camera work?`,
        answer:
          'Yes. We separate external lens glass damage, rear housing issues, and internal camera-module faults before confirming the quote.',
      },
      {
        question: `Do you guarantee stabilisation restoration after ${config.modelName} back camera repair?`,
        answer:
          'No. We test image stability and explain the likely outcome, but we do not promise that every shake or stabilisation symptom is solved by camera-module work alone.',
      },
      {
        question: `Why is ${config.modelName} back camera service quote-only?`,
        answer:
          'Impact around the camera area, lens-glass damage, housing distortion, and one-mode-only faults can all change the correct repair scope and price.',
      },
      {
        question: `Will back camera repair restore factory water resistance on my ${config.modelName}?`,
        answer: SAMSUNG_WATER_RESISTANCE_NOTE,
      },
    ],
  };
}
