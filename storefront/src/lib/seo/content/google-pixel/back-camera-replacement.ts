import type { RepairTypeSeoPocket, GooglePixelHardwareConfig } from './types';
import { getGooglePixelWhyChooseConfig } from './why-choose';

export function buildGooglePixelBackCameraReplacementPocket(
  config: GooglePixelHardwareConfig
): RepairTypeSeoPocket {
  return {
    quickAnswer: `Need ${config.modelName} back camera replacement in Ringwood? Ali Mobile & Repair diagnoses black camera previews, blurred images, focus failure, stabilisation problems, and camera switching issues to confirm if a rear camera module replacement is necessary.`,
    workbenchHeadings: {
      options: 'Rear camera repair approach',
      diagnostics: 'What do we check first?',
      symptoms: 'What are the common camera symptoms?',
      outcomes: 'What affects the final result?',
    },
    repairOptions: [
      {
        name: 'Multi-Camera Diagnosis',
        shortDescription: 'Testing to identify which specific lens or module within the camera bar has failed.',
        bestFor: 'Devices experiencing issues only when zooming in, or when using specific camera modes.',
        notes: 'We separate internal module failure from external lens-cover damage.',
      },
      {
        name: 'Camera Module Replacement',
        shortDescription: `Replacement of the internal rear camera assembly for your ${config.modelName}.`,
        bestFor: 'Confirmed hardware failures of the main, ultrawide, or telephoto cameras.',
        notes: 'We test focus, optical image stabilisation, and camera switching after installation.',
      },
    ],
    commonProblems: [
      {
        title: 'Black Camera Preview',
        description: 'The camera app shows a completely black screen when opening the main rear camera.',
        // context: 'Often indicates a completely failed camera module or a disconnected internal flex cable.',
      },
      {
        title: 'Blurred Images and Focus Failure',
        description: 'Photos appear hazy, or the camera constantly hunts for focus without locking on.',
        // context: 'Can be caused by impact damage disrupting the delicate autofocus mechanism.',
      },
      {
        title: 'Stabilisation Problems',
        description: 'The camera view shakes rapidly, or you hear a buzzing noise from the camera area.',
        // context: 'Indicates a failure of the Optical Image Stabilisation (OIS) system, typically from a drop or vibration exposure.',
      },
      {
        title: 'Camera Switching Problems',
        description: 'The app freezes or crashes when trying to switch between zoom levels or lenses.',
        // context: 'Often points to a failure in one specific module within a multi-camera array.',
      },
    ],
    diagnosticSteps: [
      {
        step: 'Initial multi-camera assessment',
        title: 'Initial multi-camera assessment',
        description: 'We test all zoom levels and lenses using diagnostic tools to isolate the faulty module.',
      },
      {
        step: 'Inspect external lens cover',
        title: 'Inspect external lens cover',
        description: 'We check if a cracked or scratched outer lens cover is causing the image issues.',
      },
      {
        step: 'Disassemble device',
        title: 'Disassemble device',
        description: 'We safely open the phone to access the rear camera array.',
      },
      {
        step: 'Replace camera module',
        title: 'Replace camera module',
        description: 'We install the replacement rear camera assembly.',
      },
      {
        step: 'Check camera-bar alignment',
        title: 'Check camera-bar alignment',
        description: 'We ensure the camera assembly sits perfectly within the distinctive Pixel camera bar housing.',
      },
      {
        step: 'Final functional testing',
        title: 'Final functional testing',
        description: 'We verify focus, stabilisation, and zoom transitions before finalizing the repair.',
      },
    ],
    faq: [
      {
        question: `How much does ${config.modelName} rear-camera repair cost?`,
        answer: 'We provide a clear quote after diagnosing exactly which camera module or lens cover requires replacement.',
      },
      {
        question: 'Which rear camera module is faulty?',
        answer: 'Modern Pixel phones have multiple rear cameras (main, ultrawide, telephoto). Our diagnostic testing identifies exactly which module has failed so we only replace what is necessary.',
      },
      {
        question: 'Is the external camera lens included?',
        answer: 'The external camera lens cover (the glass on the outside of the phone) is separate from the internal camera module. If only the outer glass is broken, we may only need to replace that specific part.',
      },
      {
        question: 'Can impact damage affect camera focus or stabilisation?',
        answer: 'Yes. The delicate moving parts used for autofocus and optical image stabilisation are highly susceptible to damage from drops or prolonged vibration.',
      },
      {
        question: 'Will my data normally remain on the phone?',
        answer: 'Yes, rear camera replacement is a hardware service that does not typically affect stored data, though a backup is always recommended.',
      },
      {
        question: 'How long does the repair take?',
        answer: 'Rear camera replacement typically takes a few hours. We can provide a more accurate estimate when assessing the device.',
      },
    ],
  };
}
