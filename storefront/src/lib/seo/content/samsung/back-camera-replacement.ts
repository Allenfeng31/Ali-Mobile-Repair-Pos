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

  if (config.seriesFamily === 'galaxy-note') {
    const rearCameraLabel = getSamsungRearCameraLabel(config);

    return {
      quickAnswer:
        `Need ${config.modelName} back camera replacement in Ringwood? Ali Mobile & Repair checks blurred image, focus failure, camera shaking, black preview, image spots, impact damage, and module-versus-lens-glass-versus-housing diagnosis before confirming the quote-only rear-camera path.`,
      workbenchHeadings: {
        options: `Which rear-camera path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before rear-camera work?',
        symptoms: 'Which rear-camera symptoms matter most?',
        outcomes: 'What can change the rear-camera result?',
      },
      repairOptions: [
        {
          name: 'Module-specific diagnosis',
          shortDescription:
            `We test the supported ${rearCameraLabel} path to identify which camera module appears affected before work is approved.`,
          bestFor:
            'Phones where one rear camera mode fails, the image shakes, or focus no longer behaves normally.',
          notes:
            'One repair does not automatically replace every rear camera on the phone.',
        },
        {
          name: 'Lens glass and housing separation',
          shortDescription:
            'External lens glass and camera-area housing damage are checked before internal camera replacement is assumed.',
          bestFor:
            'Phones with impact around the camera cluster where the visible glass or housing may be part of the fault.',
          notes:
            'External lens glass is not presented here as a separate confirmed public service.',
        },
        {
          name: 'Quote-only scope review',
          shortDescription:
            'The displayed route stays aligned with the live catalogue while the actual affected module still has to be confirmed during diagnosis.',
          bestFor:
            'Customers who want the rear-camera path checked before committing to the repair quote.',
          notes:
            `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Blurred image or focus failure',
          description:
            'Blur or focus inconsistency can come from a camera module fault, but it can also overlap with the surrounding camera-area damage.',
        },
        {
          title: 'Camera shaking or image instability',
          description:
            'Shaky or unstable output can indicate the affected module is struggling, but we still separate that from other causes before confirming the quote.',
        },
        {
          title: 'Black preview or image spots',
          description:
            'A black preview or spots on the image can be tied to the module, the lens glass, or the camera-area housing.',
        },
        {
          title: 'Impact damage around the camera cluster',
          description:
            'Rear impact can affect more than one physical part, so the camera cluster is reviewed together with the housing.',
        },
        {
          title: 'Software or board overlap',
          description:
            'Some camera faults are actually software or board issues, so the final path is set only after diagnosis.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Test each supported rear-camera mode',
          description:
            `We compare the supported ${rearCameraLabel} behaviour so the affected module can be identified before quoting.`,
        },
        {
          step: '02',
          title: 'Inspect lens glass and housing damage',
          description:
            'We check whether external glass or housing damage overlaps with the camera complaint before assuming the module alone is at fault.',
        },
        {
          step: '03',
          title: 'Separate hardware from software or board overlap',
          description:
            'If the fault still looks ambiguous, we compare it with likely software or board-level causes before confirming replacement.',
        },
        {
          step: '04',
          title: 'Retest the rear-camera path before handover',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Does ${config.modelName} back camera repair replace every rear camera?`,
          answer:
            'No. The technician identifies the affected module, and one repair does not automatically replace every rear camera on the phone.',
        },
        {
          question: `Is external camera lens glass included in ${config.modelName} back camera repair?`,
          answer:
            'We inspect lens glass and housing damage, but external lens glass is not presented here as a separate confirmed public service.',
        },
        {
          question: `Why does the camera shake or fail to focus on my ${config.modelName}?`,
          answer:
            'Camera shake or focus failure can come from the module itself, but it can also overlap with housing damage or a deeper software or board issue.',
        },
        {
          question: `Could housing damage affect the rear camera on my ${config.modelName}?`,
          answer:
            'Yes. We inspect the camera-area housing and rear-panel fit because physical damage there can change the way the camera behaves.',
        },
        {
          question: `Could software or board faults cause a black preview on my ${config.modelName}?`,
          answer:
            'Yes. A black preview can be hardware-related, software-related, or board-related, so we diagnose before confirming the quote.',
        },
        {
          question: `How is the quote confirmed for rear-camera work on my ${config.modelName}?`,
          answer:
            `We confirm the affected module and the likely repair path first, then explain the quote-only route before any work starts. ${SAMSUNG_QUOTE_ONLY_SCOPE}`,
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

  if (config.seriesFamily === 'galaxy-a') {
    return {
      quickAnswer: `Need ${config.modelName} back camera replacement in Ringwood? Ali Mobile & Repair checks for a blurred or shaking image, focus failure, black preview, image spots, and impact damage before confirming the module fault.`,
      workbenchHeadings: {
        options: `Which rear camera path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before back camera replacement?',
        symptoms: 'Which rear camera symptoms matter most?',
        outcomes: 'What can change the rear camera repair result?',
      },
      repairOptions: [
        {
          name: 'Module and focus diagnosis',
          shortDescription: 'We assess a blurred or shaking image, focus failure, and black preview.',
          bestFor: 'Phones that produce shaky videos or fail to load the rear camera.',
          notes: 'We perform module-versus-lens-glass-versus-housing diagnosis to ensure the module itself requires replacement.',
        },
        {
          name: 'Lens and impact inspection',
          shortDescription: 'We check for image spots and impact damage to the rear housing.',
          bestFor: 'Phones with visible damage to the rear glass over the camera.',
          notes: 'If the external lens glass is shattered, it must be addressed to protect the new back camera module.',
        },
      ],
      commonProblems: [
        {
          title: 'Blurred or shaking image',
          description: 'Optical stabilisation failure causes the image to vibrate or blur.',
        },
        {
          title: 'Focus failure',
          description: 'The camera cannot lock focus on near or distant subjects.',
        },
        {
          title: 'Black preview',
          description: 'The camera app loads but the rear view is completely dark.',
        },
        {
          title: 'Image spots',
          description: 'Dark spots or blemishes that appear consistently in photos due to sensor damage or dust.',
        },
        {
          title: 'Impact damage',
          description: 'Physical damage to the lens area or housing.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Assess optical stability',
          description: 'We check for a blurred or shaking image and focus failure.',
        },
        {
          step: '02',
          title: 'Inspect physical damage',
          description: 'We perform module-versus-lens-glass-versus-housing diagnosis after impact damage.',
        },
        {
          step: '03',
          title: 'Check sensor output',
          description: 'We look for a black preview or permanent image spots.',
        },
        {
          step: '04',
          title: 'Isolate the fault',
          description: 'We confirm whether the module itself has failed before quoting.',
        },
      ],
      faq: [
        {
          question: `Does Back Camera Repair on my ${config.modelName} replace every rear camera module?`,
          answer:
            'No. The technician identifies the affected internal camera module first, and the repair scope depends on that fault path rather than automatically replacing every rear camera together.',
        },
        {
          question: `Is external camera lens glass included in ${config.modelName} back camera repair?`,
          answer:
            'External lens glass is not a confirmed standalone public service here. We inspect it separately because lens glass, housing damage, and internal module faults can look similar.',
        },
        {
          question: `Why does the rear camera on my ${config.modelName} shake or fail to focus?`,
          answer:
            'Shake or focus problems can come from the camera module, housing damage, or impact around the camera area. We test the supported rear-camera modes before confirming the repair path.',
        },
        {
          question: `Could housing damage affect the back camera on my ${config.modelName}?`,
          answer:
            'Yes. Rear housing deformation can affect the camera alignment or the way the module sits, so we inspect the outer structure before assuming the module alone has failed.',
        },
        {
          question: `Could software or a board fault cause a black rear-camera preview on my ${config.modelName}?`,
          answer:
            'Yes. A black preview can also come from software or board-level faults, so we do not assume every image problem is a camera-module failure.',
        },
        {
          question: `How is the quote confirmed for ${config.modelName} back camera repair?`,
          answer:
            'We confirm the quote after identifying the affected camera module and checking whether the fault sits in the module, lens glass, housing, or a broader diagnostic path.',
        },
      ],
    };
  }

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
