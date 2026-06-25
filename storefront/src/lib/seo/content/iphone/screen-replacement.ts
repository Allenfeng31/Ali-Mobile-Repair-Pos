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

export function applyIphoneScreenReplacementSeoPocket(
  pocket: RepairTypeSeoPocket,
  config: IphoneHardwareConfig
): RepairTypeSeoPocket {
  const { modelName } = config;
  const supportsOledCopy = config.displayType === 'oled';
  const supportsFaceIdCopy = config.biometrics === 'face-id';
  const displayOptionLabel = supportsOledCopy ? 'available OLED or display options' : 'available display options';
  const frontSensorAreaLabel = supportsFaceIdCopy ? 'the front sensor or Face ID area' : 'the front sensor area';
  const faceIdRepairNote = supportsFaceIdCopy
    ? 'If Face ID or another front sensor fault is already present, we assess it carefully but do not promise a screen replacement alone will resolve it.'
    : 'If another front sensor fault is already present, we assess it carefully but do not promise a screen replacement alone will resolve it.';
  const blackScreenDescription = supportsOledCopy
    ? 'Phone still rings or vibrates while the display stays black. OLED or screen damage, or a loose or failed display connector, may be involved. We test before confirming screen replacement.'
    : 'Phone still rings or vibrates while the display stays black. Screen or display damage, or a loose or failed display connector, may be involved. We test before confirming screen replacement.';
  const displaySpotsTitle = supportsOledCopy
    ? 'OLED ink marks, black spots, or dead pixels'
    : 'Display damage, black spots, or dead pixels';
  const displaySpotsDescription = supportsOledCopy
    ? 'Dark blotches, spreading ink-like damage, or dead pixel areas can appear after pressure or impact even when the glass damage looks limited. We inspect the panel before quoting the repair path.'
    : 'Dark blotches, black spots, or dead pixel areas can appear after pressure or impact even when the glass damage looks limited. We inspect the panel before quoting the repair path.';
  const crackedGlassFaqAnswer = supportsOledCopy
    ? 'Yes. We still test the display and frame first because cracked glass can overlap with OLED damage, lifted edges, or touch faults even when the phone still unlocks.'
    : 'Yes. We still test the display and frame first because cracked glass can overlap with display damage, lifted edges, or touch faults even when the phone still unlocks.';
  const screenFaultFaqAnswer = supportsOledCopy
    ? 'Yes. We test the image, touch response, and visible OLED behaviour before confirming that a screen replacement is the right repair path.'
    : 'Yes. We test the image, touch response, and visible display behaviour before confirming that a screen replacement is the right repair path.';
  let adjustedPocket = pocket;

  if (!supportsOledCopy) {
    const replacementDisplayLabel = config.displayType === 'lcd' ? 'LCD' : 'display';

    adjustedPocket = mapPocketText(adjustedPocket, (value) =>
      value
        .replaceAll('OLED faults', 'display faults')
        .replaceAll('OLED behaviour', 'display behaviour')
        .replaceAll('OLED option availability', `${replacementDisplayLabel} option availability`)
        .replaceAll('available OLED or display options', 'available display options')
        .replaceAll('OLED layer', 'display layer')
        .replaceAll('OLED', replacementDisplayLabel)
    );
  }

  if (!supportsFaceIdCopy) {
    adjustedPocket = mapPocketText(adjustedPocket, (value) =>
      value
        .replaceAll('Face ID-related', 'front sensor-related')
        .replaceAll('Face ID area', 'front sensor area')
        .replaceAll('Face ID', 'front sensor')
        .replaceAll('front sensor or front sensor area', 'front sensor area')
    );
  }

  return {
    ...adjustedPocket,
    quickAnswer:
      `Need ${modelName} screen replacement in Ringwood? Ali Mobile & Repair checks cracked or damaged glass, touch-response faults, lines, flickering, ${displayOptionLabel}, frame condition, and ${frontSensorAreaLabel} before confirming the repair path.`,
    workbenchHeadings: {
      options: "What do we check before replacing this screen?",
      diagnostics: "How do we confirm the display fault?",
      symptoms: "Which screen symptoms matter most?",
      outcomes: "What can affect the final screen result?",
    },
    repairOptions: appendUniqueRepairOptions(adjustedPocket.repairOptions, [
      {
        name: "Front sensor area and final function checks",
        shortDescription:
          "We inspect the top display area, relevant front sensors, and the practical daily-use functions linked to the screen assembly.",
        bestFor:
          "Drops near the top edge or front sensor zone, plus phones with frame pressure around the display opening.",
        notes:
          faceIdRepairNote,
      },
    ]),
    commonProblems: appendUniqueCommonProblems(adjustedPocket.commonProblems, [
      {
        title: "Ghost touch or unintended touch input",
        description:
          "The display may tap on its own, open apps, or type without normal input after impact damage. We test the screen assembly before confirming that replacement is the right fix.",
      },
      {
        title: "Black screen while the phone still responds",
        description: blackScreenDescription,
      },
      {
        title: displaySpotsTitle,
        description: displaySpotsDescription,
      },
    ]),
    diagnosticSteps: appendUniqueDiagnosticSteps(adjustedPocket.diagnosticSteps, []),
    faq: appendUniqueFaqs(adjustedPocket.faq, [
      {
        question: `Can you fix an ${modelName} with cracked glass but working touch?`,
        answer: crackedGlassFaqAnswer,
      },
      {
        question: "Do you check lines, flickering, or a black screen before replacing the display?",
        answer: screenFaultFaqAnswer,
      },
    ]),
  };
}
