import type { RepairTypeSeoPocket, GooglePixelHardwareConfig } from './types';
import { getGooglePixelRearServiceSemantic } from './config';

export function buildGooglePixelBackGlassReplacementPocket(
  config: GooglePixelHardwareConfig
): RepairTypeSeoPocket {
  const semantic = getGooglePixelRearServiceSemantic(config.modelSlug);

  if (semantic.isBackHousing) {
    return {
      quickAnswer: `Need ${config.modelName} back housing replacement in Ringwood? Ali Mobile & Repair checks rear damage, frame condition, camera-bar openings, and battery swelling before fitting the appropriate housing assembly.`,
      workbenchHeadings: {
        options: 'Back housing replacement approach',
        diagnostics: 'What do we check first?',
        symptoms: 'What are the common rear panel symptoms?',
        outcomes: 'What affects the final result?',
      },
      repairOptions: [
        {
          name: 'Back Housing Assessment',
          shortDescription: `Evaluation of rear cracking, lifting or frame separation on your ${config.modelName}.`,
          bestFor: 'Determining if a swollen battery is causing separation, or if frame damage requires full housing replacement.',
          notes: 'Fitted using the model-specific Pixel Back Housing assembly.',
        },
        {
          name: 'Back Housing Replacement',
          shortDescription: 'Fitting a replacement rear housing assembly based on assessment.',
          bestFor: 'Resolving severe cracking, sharp edges, bent frames or camera-bar separation.',
          notes: 'We align the replacement carefully around the distinctive Pixel camera bar.',
        },
      ],
      commonProblems: [
        {
          title: `Cracked or Chipped Rear ${config.rearPanelType === 'glass' ? 'Glass' : 'Panel'}`,
          description: 'Visible fractures or missing chips on the rear panel.',
        },
        {
          title: 'Loose or Lifting Rear Panel',
          description: `The back ${config.rearPanelType === 'glass' ? 'glass' : 'panel'} is separating from the frame, creating a gap.`,
        },
        {
          title: 'Damage Around Camera Openings',
          description: 'Cracks extending into or originating from the camera bar area.',
        },
        {
          title: 'Frame Deformation',
          description: 'Bends or dents in the metal frame surrounding the glass.',
        },
      ],
      diagnosticSteps: [
        {
          step: 'Confirm model and product mapping',
          title: 'Confirm model and product mapping',
          description: 'We identify the exact model and map the repair to the correct POS Back Housing part.',
        },
        {
          step: `Inspect rear ${config.rearPanelType === 'glass' ? 'glass' : 'panel'} and frame`,
          title: `Inspect rear ${config.rearPanelType === 'glass' ? 'glass' : 'panel'} and frame`,
          description: 'We assess the extent of the cracking and check for any frame bends.',
        },
        {
          step: 'Check battery swelling',
          title: 'Check battery swelling',
          description: `We verify that the battery is not expanding and pushing against the ${config.rearPanelType === 'glass' ? 'glass' : 'panel'}.`,
        },
        {
          step: 'Inspect camera-bar alignment',
          title: 'Inspect camera-bar alignment',
          description: 'We check the integrity of the camera openings and surrounding area.',
        },
        {
          step: 'Confirm the correct housing part',
          title: 'Confirm the correct housing part',
          description: 'We select the appropriate replacement housing based on the assessment.',
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
          question: 'Is this rear glass only or the full back housing?',
          answer: 'Depending on the model and damage extent, Pixel rear repairs use the appropriate back housing assembly to ensure structural integrity and correct alignment around the camera bar.',
        },
        {
          question: `How much does ${config.modelName} Back Housing Replacement cost?`,
          answer: 'We provide a clear quote upfront based on the extent of the damage to the rear panel and frame. Please bring your device in for a thorough assessment.',
        },
        {
          question: `Can a swollen battery lift the rear ${config.rearPanelType === 'glass' ? 'glass' : 'panel'}?`,
          answer: 'Yes, a degraded battery can swell and generate enough internal pressure to lift the rear panel away from the frame. We always check for this during inspection.',
        },
        {
          question: 'Is camera-lens replacement included?',
          answer: `The external camera lens cover is typically separate from standard back ${config.rearPanelType === 'glass' ? 'glass' : 'panel'}. We inspect the camera bar and advise if lens replacement is also required.`,
        },
        {
          question: 'Will my data normally remain on the phone?',
          answer: 'Yes, back housing replacement is a hardware service that does not typically affect stored data, but we always recommend keeping a recent backup.',
        },
        {
          question: 'Will factory water resistance be restored?',
          answer: 'No. While we use appropriate internal adhesives during reassembly, the original factory IP rating cannot be guaranteed once a device has been opened.',
        },
        {
          question: 'How long does the repair take?',
          answer: 'Pixel back housing replacement typically takes around 60 minutes when the correct part is available. If additional internal damage or severe frame correction is required, turnaround may vary.',
        },
      ],
    };
  }

  return {
    quickAnswer: `Need ${config.modelName} back glass replacement in Ringwood? Ali Mobile & Repair checks rear-glass damage, frame condition, camera-bar openings, and battery swelling before fitting a quality replacement glass panel.`,
    workbenchHeadings: {
      options: 'Back glass replacement approach',
      diagnostics: 'What do we check first?',
      symptoms: 'What are the common rear panel symptoms?',
      outcomes: 'What affects the final result?',
    },
    repairOptions: [
      {
        name: 'Back Glass Assessment',
        shortDescription: `Evaluation of rear glass cracking, lifting or camera-bar separation on your ${config.modelName}.`,
        bestFor: 'Determining if a swollen battery is causing separation, or if rear-glass replacement is required.',
        notes: 'Fitted using the model-specific Pixel Back Glass assembly.',
      },
      {
        name: 'Back Glass Replacement',
        shortDescription: 'Fitting a replacement rear glass panel based on assessment.',
        bestFor: 'Resolving cracked or shattered back glass and sharp edges.',
        notes: 'We align the replacement carefully around the distinctive Pixel camera bar.',
      },
    ],
    commonProblems: [
      {
        title: 'Cracked or Chipped Rear Glass',
        description: 'Visible fractures or missing chips on the rear glass panel.',
      },
      {
        title: 'Loose or Lifting Rear Panel',
        description: 'The back glass is separating from the frame, creating a gap.',
      },
      {
        title: 'Damage Around Camera Openings',
        description: 'Cracks extending into or originating from the camera bar area.',
      },
      {
        title: 'Frame Deformation',
        description: 'Bends or dents in the metal frame surrounding the glass.',
      },
    ],
    diagnosticSteps: [
      {
        step: 'Confirm model and product mapping',
        title: 'Confirm model and product mapping',
        description: 'We identify the exact model and map the repair to the correct POS Back Glass part.',
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
        step: 'Confirm the correct glass part',
        title: 'Confirm the correct glass part',
        description: 'We select the appropriate replacement rear glass based on the assessment.',
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
        question: 'Is this rear glass only or the full back housing?',
        answer: `For ${config.modelName}, this service replaces the rear glass panel, carefully aligned to the frame and camera bar.`,
      },
      {
        question: `How much does ${config.modelName} Back Glass Replacement cost?`,
        answer: 'We provide a clear quote upfront based on the model and condition of the rear glass and frame. Please bring your device in for a quick assessment.',
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
        answer: 'Pixel back glass replacement typically takes around 30 minutes when the correct part is available. If additional frame realignment or battery inspection is required, turnaround may vary.',
      },
    ],
  };
}
