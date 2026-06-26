import type { RepairTypeSeoPocket, SamsungHardwareConfig } from './types';
import {
  SAMSUNG_QUOTE_ONLY_SCOPE,
  SAMSUNG_WATER_RESISTANCE_NOTE,
} from './shared';

export function buildSamsungBackCameraReplacementPocket(
  config: SamsungHardwareConfig
): RepairTypeSeoPocket {
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
