import type { RepairTypeSeoPocket, GooglePixelHardwareConfig } from './types';
import { getGooglePixelWhyChooseConfig } from './why-choose';

export function buildGooglePixelFrontCameraReplacementPocket(
  config: GooglePixelHardwareConfig
): RepairTypeSeoPocket {
  return {
    quickAnswer: `Need ${config.modelName} front camera replacement in Ringwood? Ali Mobile & Repair diagnoses black camera previews, blurred images, focus issues, and video-call problems to confirm if the front camera module requires replacement.`,
    workbenchHeadings: {
      options: 'Front camera repair approach',
      diagnostics: 'What do we check first?',
      symptoms: 'What are the common camera symptoms?',
      outcomes: 'What affects the final result?',
    },
    repairOptions: [
      {
        name: 'Front Camera Diagnosis',
        shortDescription: 'Assessment to distinguish a camera module fault from software issues or display glass damage.',
        bestFor: 'Devices with blurry selfies or a black screen when switching to the front camera.',
        notes: 'Sometimes the issue is caused by a cracked screen obscuring the lens, not the camera itself.',
      },
      {
        name: 'Front Camera Replacement',
        shortDescription: `Replacement of the internal front-facing camera module for your ${config.modelName}.`,
        bestFor: 'Confirmed hardware failures of the front camera assembly.',
        notes: 'We test focus, exposure, and general image quality after installation.',
      },
    ],
    commonProblems: [
      {
        title: 'Black Front-Camera Preview',
        description: 'The camera app shows a completely black screen when switching to selfie mode.',
        // context: 'Often indicates a disconnected cable or a completely failed camera module.',
      },
      {
        title: 'Blurred Image or Focus Problems',
        description: 'Selfies appear constantly out of focus or hazy.',
        // context: 'Can be caused by internal camera failure, moisture condensation, or scratches on the screen glass covering the lens.',
      },
      {
        title: 'Exposure Problems',
        description: 'Images are consistently blown out (too bright) or far too dark.',
        // context: 'Indicates a failure in the camera sensor\'s ability to meter light correctly.',
      },
      {
        title: 'Video-Call Problems',
        description: 'The camera fails to initialize during video calls in third-party apps.',
        // context: 'We diagnose to ensure the issue is hardware-related and not a software permissions problem.',
      },
    ],
    diagnosticSteps: [
      {
        step: 'Initial camera assessment',
        title: 'Initial camera assessment',
        description: 'We test the front camera using the native camera app and diagnostic tools.',
      },
      {
        step: 'Inspect screen glass',
        title: 'Inspect screen glass',
        description: 'We check if a cracked or heavily scratched display is causing the image issues.',
      },
      {
        step: 'Disassemble device',
        title: 'Disassemble device',
        description: 'We carefully open the phone to access the front camera module.',
      },
      {
        step: 'Replace camera module',
        title: 'Replace camera module',
        description: 'We install a replacement front camera assembly.',
      },
      {
        step: 'Testing after installation',
        title: 'Testing after installation',
        description: 'We verify focus, exposure, and image clarity before finalizing the repair.',
      },
    ],
    faq: [
      {
        question: `How much does ${config.modelName} front-camera repair cost?`,
        answer: 'We provide a clear quote after confirming whether the issue requires a new camera module or is related to screen damage obscuring the lens.',
      },
      {
        question: 'Does a blurry image always mean the camera module is faulty?',
        answer: 'Not always. A blurry image can be caused by dirt, condensation, or scratches on the section of the screen glass that covers the front camera.',
      },
      {
        question: 'Can screen damage affect the front camera?',
        answer: 'Yes. Cracks running across the camera cutout can distort the image, create lens flares, or block the view entirely.',
      },
      {
        question: 'Will my data normally remain on the phone?',
        answer: 'Yes, front camera replacement is a hardware service that does not typically affect stored data, but a backup is always recommended.',
      },
      {
        question: 'Will factory water resistance be restored?',
        answer: 'No. While we use appropriate internal adhesives during reassembly, the original factory IP rating cannot be guaranteed once a device has been opened.',
      },
      {
        question: 'How long does the repair take?',
        answer: 'Front camera replacement generally takes a few hours. We can provide a more accurate estimate when assessing the device.',
      },
    ],
  };
}
