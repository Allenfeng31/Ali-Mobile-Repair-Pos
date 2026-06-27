import type { RepairTypeSeoPocket, GooglePixelHardwareConfig } from './types';
import { getGooglePixelWhyChooseConfig } from './why-choose';

export function buildGooglePixelBackGlassReplacementPocket(
  config: GooglePixelHardwareConfig
): RepairTypeSeoPocket {
  return {
    quickAnswer: `Need ${config.modelName} back glass replacement in Ringwood? Ali Mobile & Repair checks rear-glass damage, frame condition, camera-bar openings, and battery swelling. The exact replacement method depends on damage extent and available assembly, which we map to our internal back housing service.`,
    workbenchHeadings: {
      options: 'Back glass replacement approach',
      diagnostics: 'What do we check first?',
      symptoms: 'What are the common rear panel symptoms?',
      outcomes: 'What affects the final result?',
    },
    repairOptions: [
      {
        name: 'Back Glass Assessment',
        shortDescription: `Evaluation of the cracked or lifting rear glass on your ${config.modelName}.`,
        bestFor: 'Determining if a swollen battery is causing the glass to lift, or if frame damage requires full housing replacement.',
        notes: 'The public Back Glass service is fulfilled using the model-specific POS Back Housing product.',
      },
      {
        name: 'Housing/Panel Replacement',
        shortDescription: 'Fitting a replacement rear panel or housing assembly based on assessment.',
        bestFor: 'Resolving severe glass cracking, sharp edges, or camera-bar damage.',
        notes: 'We align the replacement carefully around the distinctive Pixel camera bar.',
      },
    ],
    commonProblems: [
      {
        title: 'Cracked or Chipped Rear Glass',
        description: 'Visible fractures or missing chips of glass on the rear panel.',
        // context: 'Can expose internal components to moisture and create sharp edges.',
      },
      {
        title: 'Loose or Lifting Rear Panel',
        description: 'The back glass is separating from the frame, creating a gap.',
        // context: 'Often a secondary symptom of battery swelling pushing the rear panel upward.',
      },
      {
        title: 'Damage Around Camera Openings',
        description: 'Cracks extending into or originating from the camera bar area.',
        // context: 'Requires careful assessment to ensure camera lenses are not compromised.',
      },
      {
        title: 'Frame Deformation',
        description: 'Bends or dents in the metal frame surrounding the glass.',
        // context: 'Frame deformation hidden by cosmetic damage may require a broader housing repair.',
      },
    ],
    diagnosticSteps: [
      {
        step: 'Confirm model and product mapping',
        title: 'Confirm model and product mapping',
        description: 'We identify the exact model and map the repair to the correct POS Back Housing part.',
      },
      {
        step: 'Inspect rear glass and frame',
        title: 'Inspect rear glass and frame',
        description: 'We assess the extent of the cracking and check for any frame bends.',
      },
      {
        step: 'Check battery swelling',
        title: 'Check battery swelling',
        description: 'We verify that the battery is not expanding and pushing against the glass.',
      },
      {
        step: 'Inspect camera-bar alignment',
        title: 'Inspect camera-bar alignment',
        description: 'We check the integrity of the camera openings and surrounding area.',
      },
      {
        step: 'Confirm the correct rear panel/housing part',
        title: 'Confirm the correct rear panel/housing part',
        description: 'We select the appropriate replacement based on the assessment.',
      },
      {
        step: 'Fit and align the replacement',
        title: 'Fit and align the replacement',
        description: 'We install the new panel, ensuring a secure fit.',
      },
      {
        step: 'Test functions',
        title: 'Test functions',
        description: 'We test cameras, flash, buttons, charging, and wireless functions where applicable.',
      },
      {
        step: 'Explain seal limitations',
        title: 'Explain seal limitations',
        description: 'We inform you that original factory water resistance cannot be guaranteed after repair.',
      },
    ],
    faq: [
      {
        question: 'Is this rear glass or the full housing?',
        answer: 'Depending on the exact damage and part availability, we fulfill back glass repairs using the appropriate housing assembly to ensure structural integrity and correct alignment around the camera bar.',
      },
      {
        question: `How much does ${config.modelName} Back Glass Replacement cost?`,
        answer: 'We provide a clear quote upfront based on the extent of the damage to the rear panel and frame. Please bring your device in for a thorough assessment.',
      },
      {
        question: 'Can a swollen battery lift the rear glass?',
        answer: 'Yes, a degraded battery can swell and generate enough internal pressure to lift the rear panel away from the frame. We always check for this during inspection.',
      },
      {
        question: 'Is camera-lens replacement included?',
        answer: 'The external camera lens cover is typically separate from standard back glass. We inspect the camera bar and advise if lens replacement is also required.',
      },
      {
        question: 'Will my data normally remain on the phone?',
        answer: 'Yes, back glass replacement is a hardware service that does not typically affect stored data, but we always recommend keeping a recent backup.',
      },
      {
        question: 'Will factory water resistance be restored?',
        answer: 'No. While we use appropriate internal adhesives during reassembly, the original factory IP rating cannot be guaranteed once a device has been opened.',
      },
      {
        question: 'How long does the repair take?',
        answer: 'This depends on whether the frame requires correction or just the panel needs replacing. We provide a time estimate after the initial inspection.',
      },
    ],
  };
}
