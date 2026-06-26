import type { RepairTypeSeoPocket, SamsungHardwareConfig } from './types';
import {
  getSamsungFrontCameraLabel,
  SAMSUNG_FOLD_TESTING_NOTE,
  SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE,
  SAMSUNG_QUOTE_ONLY_SCOPE,
  SAMSUNG_WATER_RESISTANCE_NOTE,
} from './shared';

export function buildSamsungFrontCameraReplacementPocket(
  config: SamsungHardwareConfig
): RepairTypeSeoPocket {
  if (config.modelSlug === 'galaxy-s23-ultra') {
    return {
      quickAnswer:
        `Need ${config.modelName} front camera replacement in Ringwood? Ali Mobile & Repair checks blur, haze, spots, preview failure, focus inconsistency, and impact near the punch-hole opening before confirming whether the fault sits in the camera path, nearby damage, or a deeper diagnostic issue.`,
      workbenchHeadings: {
        options: `Which front-camera path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before front-camera work?',
        symptoms: 'Which front-camera symptoms matter most?',
        outcomes: 'What can change the front-camera result?',
      },
      repairOptions: [
        {
          name: 'Punch-hole front-camera diagnosis',
          shortDescription:
            'We test blur, haze, spots, preview failure, and focus inconsistency before confirming whether the front camera itself is the main fault.',
          bestFor:
            'Phones where selfies, video calls, or front-camera preview no longer look clear or fail to load normally.',
          notes:
            'Impact around the camera opening is inspected carefully because nearby display-area damage can overlap with the camera complaint.',
        },
        {
          name: 'Camera-versus-software or board-path review',
          shortDescription:
            'We separate likely hardware camera faults from software behaviour, connection issues, or deeper board-level overlap before replacement is confirmed.',
          bestFor:
            'Phones with inconsistent preview failure, intermittent focus, or symptoms that do not behave like a simple camera-only fault.',
          notes:
            'Front camera replacement does not automatically include screen work or guarantee that every secondary function tied to the area will be restored.',
        },
        {
          name: 'Pre-repair and post-repair validation',
          shortDescription:
            'We confirm the front-camera path before service and retest the main front-facing functions before handover.',
          bestFor:
            'Customers who want the front camera tested in context rather than assuming every image issue needs the same repair.',
          notes:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Blur, haze, or spots in selfies',
          description:
            'Blur or haze can come from the front camera path itself, but we also inspect whether impact or contamination around the camera opening is involved.',
        },
        {
          title: 'Preview failure or black image',
          description:
            'A failed selfie preview can be camera-related, software-related, or part of a deeper board-level problem, so we diagnose before replacing parts.',
        },
        {
          title: 'Focus inconsistency',
          description:
            'Front-camera image quality can shift if the camera path is damaged, but inconsistent results still need diagnosis rather than assumption.',
        },
        {
          title: 'Impact near the punch-hole opening',
          description:
            'Impact close to the camera opening can affect more than the visible lens area, so we inspect the surrounding repair zone first.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Test the front-camera preview and image quality',
          description:
            'We check clarity, focus, spots, and preview behaviour before confirming whether the front camera is the main fault path.',
        },
        {
          step: '02',
          title: 'Inspect the camera opening and nearby impact',
          description:
            'Impact around the punch-hole area is checked before the front camera is treated as an isolated part failure.',
        },
        {
          step: '03',
          title: 'Separate camera faults from software or board overlap',
          description:
            'We compare the symptoms with likely software, connection, and board-level possibilities before confirming replacement.',
        },
        {
          step: '04',
          title: 'Retest the front-camera path before handover',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Does ${config.modelName} front camera replacement include the screen?`,
          answer:
            'No. Front camera replacement stays focused on the front-camera path and does not automatically include screen replacement.',
        },
        {
          question: `Can impact near the ${config.modelName} front-camera opening affect more than the camera itself?`,
          answer:
            'Yes. We inspect the surrounding repair area because nearby damage can overlap with the camera complaint and change the final repair outcome.',
        },
        {
          question: `Do you guarantee every camera-related secondary function after ${config.modelName} front camera work?`,
          answer:
            'No. We retest the front-camera path and explain any remaining limitation clearly, but we do not promise outcomes that depend on separate faults or calibration paths.',
        },
        {
          question: `Is the ${config.modelName} front camera route based on the live catalogue-backed repair listing?`,
          answer:
            'Yes. The displayed front-camera route stays tied to the live catalogue-backed listing for this model.',
        },
        {
          question: `Will front camera repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  if (config.frontCameraClass === 'single-punch-hole') {
    return {
      quickAnswer:
        `Need ${config.modelName} front camera replacement in Ringwood? Ali Mobile & Repair checks blur, haze, spots, preview failure, focus inconsistency, and impact near the punch-hole opening before confirming whether the fault sits in the camera path, nearby damage, or a deeper diagnostic issue.`,
      workbenchHeadings: {
        options: `Which front-camera path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before front-camera work?',
        symptoms: 'Which front-camera symptoms matter most?',
        outcomes: 'What can change the front-camera result?',
      },
      repairOptions: [
        {
          name: 'Punch-hole front-camera diagnosis',
          shortDescription:
            'We test blur, haze, spots, preview failure, and focus inconsistency before confirming whether the front camera itself is the main fault.',
          bestFor:
            'Phones where selfies, video calls, or front-camera preview no longer look clear or fail to load normally.',
          notes:
            'Impact around the camera opening is inspected carefully because nearby display-area damage can overlap with the camera complaint.',
        },
        {
          name: 'Camera-versus-software or board-path review',
          shortDescription:
            'We separate likely hardware camera faults from software behaviour, connection issues, or deeper board-level overlap before replacement is confirmed.',
          bestFor:
            'Phones with inconsistent preview failure, intermittent focus, or symptoms that do not behave like a simple camera-only fault.',
          notes:
            'Front camera replacement does not automatically include screen work or guarantee that every secondary function tied to the area will be restored.',
        },
        {
          name: 'Pre-repair and post-repair validation',
          shortDescription:
            'We confirm the front-camera path before service and retest the main front-facing functions before handover.',
          bestFor:
            'Customers who want the front camera tested in context rather than assuming every image issue needs the same repair.',
          notes:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Blur, haze, or spots in selfies',
          description:
            'Blur or haze can come from the front camera path itself, but we also inspect whether impact or contamination around the camera opening is involved.',
        },
        {
          title: 'Preview failure or black image',
          description:
            'A failed selfie preview can be camera-related, software-related, or part of a deeper board-level problem, so we diagnose before replacing parts.',
        },
        {
          title: 'Focus inconsistency',
          description:
            'Front-camera image quality can shift if the camera path is damaged, but inconsistent results still need diagnosis rather than assumption.',
        },
        {
          title: 'Impact near the punch-hole opening',
          description:
            'Impact close to the camera opening can affect more than the visible lens area, so we inspect the surrounding repair zone first.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Test the front-camera preview and image quality',
          description:
            'We check clarity, focus, spots, and preview behaviour before confirming whether the front camera is the main fault path.',
        },
        {
          step: '02',
          title: 'Inspect the camera opening and nearby impact',
          description:
            'Impact around the punch-hole area is checked before the front camera is treated as an isolated part failure.',
        },
        {
          step: '03',
          title: 'Separate camera faults from software or board overlap',
          description:
            'We compare the symptoms with likely software, connection, and board-level possibilities before confirming replacement.',
        },
        {
          step: '04',
          title: 'Retest the front-camera path before handover',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Does ${config.modelName} front camera replacement include the screen?`,
          answer:
            'No. Front camera replacement stays focused on the front-camera path and does not automatically include screen replacement.',
        },
        {
          question: `Can impact near the ${config.modelName} front-camera opening affect more than the camera itself?`,
          answer:
            'Yes. We inspect the surrounding repair area because nearby damage can overlap with the camera complaint and change the final repair outcome.',
        },
        {
          question: `Do you guarantee every camera-related secondary function after ${config.modelName} front camera work?`,
          answer:
            'No. We retest the front-camera path and explain any remaining limitation clearly, but we do not promise outcomes that depend on separate faults or calibration paths.',
        },
        {
          question: `Is the ${config.modelName} front camera route based on the live catalogue-backed repair listing?`,
          answer:
            'Yes. The displayed front-camera route stays tied to the live catalogue-backed listing for this model.',
        },
        {
          question: `Will front camera repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  if (config.seriesFamily === 'galaxy-s') {
    const frontCameraLabel = getSamsungFrontCameraLabel(config);

    return {
      quickAnswer:
        `Need ${config.modelName} front camera replacement in Ringwood? Ali Mobile & Repair checks blurry image, haze, spots, preview failure, focus inconsistency, impact near the camera opening, and camera-versus-software or board diagnosis before confirming the ${frontCameraLabel} path.`,
      workbenchHeadings: {
        options: `Which front-camera path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before front-camera work?',
        symptoms: 'Which front-camera symptoms matter most?',
        outcomes: 'What can change the front-camera result?',
      },
      repairOptions: [
        {
          name: 'Front-camera diagnosis',
          shortDescription:
            `We test blur, haze, spots, preview failure, and focus inconsistency before confirming whether the front camera itself is the main fault.`,
          bestFor:
            'Phones where selfies, video calls, or front-camera preview no longer look clear or fail to load normally.',
          notes:
            'Impact around the camera opening is inspected carefully because nearby display-area damage can overlap with the camera complaint.',
        },
        {
          name: 'Camera-versus-software or board-path review',
          shortDescription:
            'We separate likely hardware camera faults from software behaviour, connection issues, or deeper board-level overlap before replacement is confirmed.',
          bestFor:
            'Phones with inconsistent preview failure, intermittent focus, or symptoms that do not behave like a simple camera-only fault.',
          notes:
            'Front camera replacement does not automatically include screen work or guarantee that every secondary function tied to the area will be restored.',
        },
        {
          name: 'Pre-repair and post-repair validation',
          shortDescription:
            'We confirm the front-camera path before service and retest the main front-facing functions before handover.',
          bestFor:
            'Customers who want the front camera tested in context rather than assuming every image issue needs the same repair.',
          notes:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Blur, haze, or spots in selfies',
          description:
            'Blur or haze can come from the front camera path itself, but we also inspect whether impact or contamination around the camera opening is involved.',
        },
        {
          title: 'Preview failure or black image',
          description:
            'A failed selfie preview can be camera-related, software-related, or part of a deeper board-level problem, so we diagnose before replacing parts.',
        },
        {
          title: 'Focus inconsistency',
          description:
            'Front-camera image quality can shift if the camera path is damaged, but inconsistent results still need diagnosis rather than assumption.',
        },
        {
          title: 'Impact near the camera opening',
          description:
            'Impact close to the camera opening can affect more than the visible lens area, so we inspect the surrounding repair zone first.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Test the front-camera preview and image quality',
          description:
            'We check clarity, focus, spots, and preview behaviour before confirming whether the front camera is the main fault path.',
        },
        {
          step: '02',
          title: 'Inspect the camera opening and nearby impact',
          description:
            'Impact around the camera opening is checked before the front camera is treated as an isolated part failure.',
        },
        {
          step: '03',
          title: 'Separate camera faults from software or board overlap',
          description:
            'We compare the symptoms with likely software, connection, and board-level possibilities before confirming replacement.',
        },
        {
          step: '04',
          title: 'Retest the front-camera path before handover',
          description:
            `${SAMSUNG_PRE_AND_POST_REPAIR_TESTING_NOTE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `Does ${config.modelName} front camera replacement include the screen?`,
          answer:
            'No. Front camera replacement stays focused on the front-camera path and does not automatically include screen replacement.',
        },
        {
          question: `Can impact near the ${config.modelName} front-camera opening affect more than the camera itself?`,
          answer:
            'Yes. We inspect the surrounding repair area because nearby damage can overlap with the camera complaint and change the final repair outcome.',
        },
        {
          question: `Do you guarantee every camera-related secondary function after ${config.modelName} front camera work?`,
          answer:
            'No. We retest the front-camera path and explain any remaining limitation clearly, but we do not promise outcomes that depend on separate faults or calibration paths.',
        },
        {
          question: `Is the ${config.modelName} front camera route based on the live catalogue-backed repair listing?`,
          answer:
            'Yes. The displayed front-camera route stays tied to the live catalogue-backed listing for this model.',
        },
        {
          question: `Will front camera repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  if (config.frontCameraClass === 'inner-only') {
    return {
      quickAnswer:
        `Need ${config.modelName} front camera replacement in Ringwood? Ali Mobile & Repair keeps this route quote-only while we focus on the inner selfie-camera path, check preview failure, blur, haze, or impact around the inner display area, and confirm whether display or fold-area issues overlap with the complaint.`,
      workbenchHeadings: {
        options: `Which front-camera path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before front-camera work?',
        symptoms: 'Which front-camera symptoms matter most?',
        outcomes: 'What can change the front-camera scope?',
      },
      repairOptions: [
        {
          name: 'Inner selfie-camera diagnosis',
          shortDescription:
            'We test blur, haze, spots, preview failure, and impact around the inner display area before confirming whether the selfie camera itself is at fault.',
          bestFor:
            'Phones where selfies, video calls, or inner-display camera preview fail during normal unfolded use.',
          notes:
            'This content stays focused on the inner selfie-camera path and does not treat the rear cameras used with the cover display as a second front-camera product.',
        },
        {
          name: 'Display, protector, and fold-area overlap review',
          shortDescription:
            'We inspect whether inner-display, protector, crease-area, or hinge-side findings overlap with the selfie-camera complaint before quoting.',
          bestFor:
            'Phones where impact, protector issues, or fold-area pressure may be affecting the front-camera result.',
          notes:
            'The technician confirms whether the fault is camera-specific or whether the display/fold area changes the repair path.',
        },
        {
          name: 'Quote-only scope confirmation',
          shortDescription:
            'We identify the affected selfie-camera path, explain the likely scope, and confirm the quote before any parts are approved.',
          bestFor:
            'Phones where the complaint is mixed, inconsistent, or likely to overlap with display-area damage.',
          notes:
            `${SAMSUNG_FOLD_TESTING_NOTE} ${SAMSUNG_QUOTE_ONLY_SCOPE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Blur, haze, or spots on selfies',
          description:
            'Blur or haze can come from the selfie camera path itself, but we also inspect for overlap with display-area impact or contamination.',
        },
        {
          title: 'Preview failure or black image',
          description:
            'A failed selfie preview can overlap with inner-display or fold-area damage, so we diagnose before quoting parts.',
        },
        {
          title: 'Impact near the inner display camera area',
          description:
            'Impact around the inner display area can affect more than the camera alone and may change the correct repair scope.',
        },
        {
          title: 'Quote-only diagnosis',
          description:
            'Final scope and price still require inspection because camera, display, protector, and fold-area faults can overlap.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Test the inner selfie-camera path',
          description:
            'We check preview, clarity, blur, spots, and general camera response during normal inner-display use.',
        },
        {
          step: '02',
          title: 'Inspect related display and fold-area overlap',
          description:
            'The inner display, protector, crease area, and nearby impact are checked before confirming whether front-camera replacement is the right scope.',
        },
        {
          step: '03',
          title: 'Separate selfie-camera faults from rear-camera use cases',
          description:
            'We keep the diagnosis on the actual inner selfie-camera path and do not mislabel rear-camera use with the cover display as a second front-camera issue.',
        },
        {
          step: '04',
          title: 'Confirm the quote-only repair path',
          description:
            'We explain the likely scope, testing outcome, and any remaining uncertainty before work starts.',
        },
      ],
      faq: [
        {
          question: `Does ${config.modelName} front camera replacement cover more than one front-facing camera?`,
          answer:
            'No. On this Galaxy Z Flip model, the Front Camera product stays focused on the inner selfie-camera path, and we do not treat rear-camera use with the cover display as a second front-camera replacement.',
        },
        {
          question: `Can inner-display or protector issues affect the front camera on my ${config.modelName}?`,
          answer:
            'Yes. We inspect the inner display, protector, crease area, and nearby impact before confirming whether the fault is isolated to the camera.',
        },
        {
          question: `Why is ${config.modelName} front camera repair quote-only?`,
          answer:
            'The final scope depends on whether the issue is limited to the inner selfie camera or overlaps with inner-display, protector, or fold-area findings.',
        },
        {
          question: `Do you guarantee recalibration or every secondary function after ${config.modelName} front camera work?`,
          answer:
            'No. We retest the camera path and explain any remaining limitations after inspection and repair, but we do not promise outcomes that depend on separate faults.',
        },
        {
          question: `Will front camera repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  if (config.seriesFamily === 'galaxy-a') {
    return {
      quickAnswer: `Need ${config.modelName} front camera replacement in Ringwood? Ali Mobile & Repair checks for a blurry image, haze or dust, black preview, focus inconsistency, and impact near the camera opening before confirming the module fault.`,
      workbenchHeadings: {
        options: `Which front camera path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before front camera replacement?',
        symptoms: 'Which selfie camera symptoms matter most?',
        outcomes: 'What can change the front camera repair result?',
      },
      repairOptions: [
        {
          name: 'Image and focus diagnosis',
          shortDescription: 'We assess a blurry image, black preview, and focus inconsistency.',
          bestFor: 'Phones that produce unclear selfies or fail to load the front camera.',
          notes: 'We perform camera-versus-software diagnosis to ensure the module requires physical replacement.',
        },
        {
          name: 'Lens opening inspection',
          shortDescription: 'We check for haze or dust and impact near the camera opening.',
          bestFor: 'Phones with visible dust under the screen glass near the camera.',
          notes: 'If the screen glass covering the camera is cracked, a front camera replacement alone will not clear the image.',
        },
      ],
      commonProblems: [
        {
          title: 'Blurry image',
          description: 'Smudges or lack of sharpness during front camera use.',
        },
        {
          title: 'Haze or dust',
          description: 'Particulates trapped between the module and the display glass.',
        },
        {
          title: 'Black preview',
          description: 'The camera app loads but the front preview remains completely dark.',
        },
        {
          title: 'Focus inconsistency',
          description: 'The camera struggles to lock onto subjects.',
        },
        {
          title: 'Impact near the camera opening',
          description: 'Physical damage to the display area covering the module.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Software validation',
          description: 'We perform camera-versus-software diagnosis.',
        },
        {
          step: '02',
          title: 'Inspect physical damage',
          description: 'We check for impact near the camera opening.',
        },
        {
          step: '03',
          title: 'Assess image quality',
          description: 'We check for a blurry image or focus inconsistency.',
        },
        {
          step: '04',
          title: 'Check for debris',
          description: 'We look for haze or dust trapped over the lens.',
        },
      ],
      faq: [
        {
          question: `Why is the front camera on my ${config.modelName} blurry or hazy?`,
          answer:
            'Blur or haze can come from the camera module, dust, impact, or nearby display-area damage. We inspect the camera opening and surrounding area before confirming the repair path.',
        },
        {
          question: `Could software cause a black front-camera preview on my ${config.modelName}?`,
          answer:
            'Yes. A black preview can be caused by software, connection, or deeper board-level issues as well as physical camera failure, so we diagnose before replacing parts.',
        },
        {
          question: `Will front-camera repair on ${config.modelName} erase my data?`,
          answer:
            'No. Front camera repair does not normally erase data, but we still recommend backing up important files before service as a precaution.',
        },
        {
          question: `Will the camera opening and display area be checked on my ${config.modelName}?`,
          answer:
            'Yes. We inspect the camera opening and nearby display area because impact around the lens path can overlap with the camera symptom.',
        },
        {
          question: `How is the final front-camera price confirmed for ${config.modelName}?`,
          answer:
            'The price follows the live catalogue-backed front-camera product for this model and repair path. We confirm the current route before work begins so the quote matches the available listing.',
        },
        {
          question: `How long does front-camera diagnosis and repair usually take on ${config.modelName}?`,
          answer:
            'Timing depends on the fault path, part availability, and whether the issue is limited to the camera or overlaps with nearby display or board symptoms.',
        },
      ],
    };
  }

  return {
    quickAnswer:
      `Need ${config.modelName} front camera replacement in Ringwood? Ali Mobile & Repair first identifies whether the issue affects the cover-screen camera or the inner display camera, then checks for related display, protector, or fold-area overlap before confirming the quote-only scope.`,
    workbenchHeadings: {
      options: `Which front-camera path fits this ${config.modelName}?`,
      diagnostics: 'What do we inspect before front-camera work?',
      symptoms: 'Which front-camera symptoms matter most?',
      outcomes: 'What can change the front-camera scope?',
    },
    repairOptions: [
      {
        name: 'Cover-screen camera diagnosis',
        shortDescription:
          'We test blur, haze, spots, preview failure, and impact around the cover-display area to confirm whether the outer front-facing camera is affected.',
        bestFor:
          'Phones with selfie or video-call problems while using the outer cover display.',
        notes:
          'Repairing the cover-screen camera does not automatically replace the inner front-facing camera.',
      },
      {
        name: 'Inner display camera diagnosis',
        shortDescription:
          'We assess the inner display camera while accounting for its normal image characteristics and any overlap with inner-display, protector, or fold-area issues.',
        bestFor:
          'Phones where the complaint only appears while using the inner unfolded display.',
        notes:
          'The inner display camera can look different from a conventional lens, so its normal appearance is not automatically labelled damage.',
      },
      {
        name: 'Shared quote confirmation and testing',
        shortDescription:
          'We identify which front-facing camera is affected, inspect related display areas, and confirm the correct quote-only path before work begins.',
        bestFor:
          'Phones where the faulty camera is unclear or where impact may have affected more than one front-facing component.',
        notes:
          `${SAMSUNG_FOLD_TESTING_NOTE} ${SAMSUNG_QUOTE_ONLY_SCOPE}`,
      },
    ],
    commonProblems: [
      {
        title: 'Blur, haze, or spots on the cover camera',
        description:
          'Impact near the cover display can affect the outer front-facing camera path and needs to be separated from display-only damage.',
      },
      {
        title: 'Inner camera preview concerns',
        description:
          'The inner display camera may show unusual-looking output compared with a normal lens, so we diagnose before labelling it as damage.',
      },
      {
        title: 'Preview failure or black image',
        description:
          'Preview failure can overlap with inner-display, protector, or fold-area faults, especially when the issue only appears while unfolded.',
      },
      {
        title: 'Unclear camera identification',
        description:
          'We confirm whether the cover-screen camera or the inner camera is actually affected because replacing one does not replace the other.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: 'Test both front-facing cameras',
        description:
          'We compare the cover-screen camera and the inner display camera so the fault is tied to the correct camera path.',
      },
      {
        step: '02',
        title: 'Inspect related display and fold-area overlap',
        description:
          'Impact near the cover screen, inner display, protector, or fold area is reviewed before confirming whether camera replacement is the right scope.',
      },
      {
        step: '03',
        title: 'Separate normal inner-camera traits from damage',
        description:
          'The inner display camera is assessed carefully so its normal image characteristics are not mistaken for a hardware fault.',
      },
      {
        step: '04',
        title: 'Confirm the quote-only repair path',
        description:
          'We identify the affected camera, explain the final scope, and avoid fixed-price assumptions before work starts.',
      },
    ],
    faq: [
      {
        question: `Does ${config.modelName} front camera replacement cover both front-facing cameras?`,
        answer:
          'No. The cover-screen camera and the inner display camera are different components, so we identify the affected camera before quoting.',
      },
      {
        question: `How do you tell whether the cover camera or inner camera is faulty on my ${config.modelName}?`,
        answer:
          'We test both front-facing cameras in their normal display contexts and compare the symptoms before confirming the repair path.',
      },
      {
        question: `Can the inner display camera on my ${config.modelName} look different from the cover camera?`,
        answer:
          'Yes. The inner display camera can have different normal image characteristics from a standard camera, so we do not automatically label that as damage.',
      },
      {
        question: `Why is ${config.modelName} front camera repair quote-only?`,
        answer:
          'The final scope depends on which front-facing camera is affected and whether inner-display, protector, or fold-area issues overlap with the complaint.',
      },
      {
        question: `Do you guarantee recalibration or every secondary function after ${config.modelName} front camera work?`,
        answer:
          'No. We retest the camera path and explain any remaining limitations after inspection and repair, but we do not promise outcomes that depend on separate faults.',
      },
      {
        question: `Will front camera repair restore factory water resistance on my ${config.modelName}?`,
        answer: SAMSUNG_WATER_RESISTANCE_NOTE,
      },
    ],
  };
}
