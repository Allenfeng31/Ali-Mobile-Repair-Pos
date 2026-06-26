import type { RepairTypeSeoPocket, SamsungHardwareConfig } from './types';
import {
  SAMSUNG_QUOTE_ONLY_SCOPE,
  SAMSUNG_WATER_RESISTANCE_NOTE,
} from './shared';

export function buildSamsungBackHousingReplacementPocket(
  config: SamsungHardwareConfig
): RepairTypeSeoPocket {
  const isFoldable = config.displayForm === 'foldable';
  const hasIntegratedSPen = config.sPenCapability === 'integrated-slot';

  const hingeCheck = isFoldable ? ', hinge-enclosure damage' : '';
  const sPenCheck = hasIntegratedSPen ? ', S Pen slot alignment' : '';
  const checks = `rear-panel damage, frame or housing deformation${hingeCheck}${sPenCheck}, camera-area impact, and wireless-charging behaviour`;

  if (config.seriesFamily === 'galaxy-a') {
    return {
      quickAnswer: `Need ${config.modelName} Back Housing Replacement in Ringwood? Ali Mobile & Repair checks for cracked or damaged rear housing, lifted or separated rear panels, camera-opening alignment, button and port alignment, and frame condition before replacing the housing assembly.`,
      workbenchHeadings: {
        options: `Which housing path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before housing replacement?',
        symptoms: 'Which rear panel symptoms matter most?',
        outcomes: 'What can change the housing repair result?',
      },
      repairOptions: [
        {
          name: 'Rear panel and frame inspection',
          shortDescription: 'We inspect cracked or damaged rear housing and overall frame condition.',
          bestFor: 'Phones with shattered rear panels or dented frames.',
          notes: 'Frame condition dictates whether the rear housing can be safely replaced and sealed.',
        },
        {
          name: 'Alignment check',
          shortDescription: 'We check camera-opening alignment and button and port alignment.',
          bestFor: 'Phones that have suffered impact near lenses or buttons.',
          notes: 'Proper alignment is critical for the new Back Housing Replacement to sit flush.',
        },
        {
          name: 'Pressure and seal review',
          shortDescription: 'We inspect for lifted or separated rear panels and swelling-related pressure.',
          bestFor: 'Phones where the back is peeling off.',
          notes: 'Seal limitations mean factory water resistance is not guaranteed after structural damage or repair. We also perform pre- and post-repair testing.',
        },
      ],
      commonProblems: [
        {
          title: 'Cracked or damaged rear housing',
          description: 'Impact can shatter the rear panel, risking internal damage.',
        },
        {
          title: 'Lifted or separated rear panel',
          description: 'The back peeling off can indicate swelling-related pressure or degraded adhesive.',
        },
        {
          title: 'Frame condition issues',
          description: 'A bent frame can prevent a new rear panel from seating correctly.',
        },
        {
          title: 'Camera-opening alignment',
          description: 'Damage around the lens cutouts can affect rear camera safety.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Assess rear damage',
          description: 'We check for cracked or damaged rear housing and lifted or separated rear panels.',
        },
        {
          step: '02',
          title: 'Inspect frame and swelling',
          description: 'We review frame condition and check for swelling-related pressure.',
        },
        {
          step: '03',
          title: 'Check alignment',
          description: 'We verify camera-opening alignment and button and port alignment.',
        },
        {
          step: '04',
          title: 'Post-repair validation',
          description: 'We perform pre- and post-repair testing, noting seal limitations.',
        },
      ],
      faq: [
        {
          question: `What is included in ${config.modelName} Back Housing Replacement?`,
          answer:
            'The exact included parts depend on the supplied catalogue-backed assembly. We inspect the rear panel, rear housing, frame fit, camera openings, and button alignment before confirming the final scope.',
        },
        {
          question: `Is this the same as Back Glass Replacement for my ${config.modelName}?`,
          answer:
            'No. Back Housing is the approved POS taxonomy for this Galaxy A route, and we do not advertise an isolated Back Glass Replacement service here.',
        },
        {
          question: `Does ${config.modelName} back housing repair include the complete metal frame?`,
          answer:
            'Not automatically. Severe frame deformation may require separate inspection, so we confirm the safe repair path before promising any particular assembly outcome.',
        },
        {
          question: `Can battery swelling cause the rear housing on my ${config.modelName} to lift?`,
          answer:
            'Yes. Swelling can push on the rear section, affect the way the housing sits, and change the safe repair path, so we inspect for pressure before quoting.',
        },
        {
          question: `Will camera openings and buttons be checked during ${config.modelName} back housing work?`,
          answer:
            'Yes. We check camera openings, button alignment, port alignment, and overall fit because housing damage can affect more than the visible rear panel.',
        },
        {
          question: `Will back housing replacement restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
        {
          question: `How is the final ${config.modelName} back housing quote confirmed?`,
          answer:
            'The quote follows the live catalogue-backed Back Housing listing and the inspected assembly path. We confirm the current route before work begins so the price matches the actual repair scope.',
        },
      ],
    };
  }

  return {
    quickAnswer:
      `Need ${config.modelName} back housing replacement in Ringwood? Ali Mobile & Repair checks ${checks} before confirming the quote-only scope.`,
    workbenchHeadings: {
      options: `Which back housing path fits this ${config.modelName}?`,
      diagnostics: 'What do we inspect before back housing work?',
      symptoms: 'Which rear housing symptoms matter most?',
      outcomes: 'What can change the final housing scope?',
    },
    repairOptions: [
      {
        name: 'Rear panel and housing assessment',
        shortDescription:
          'We inspect cracked rear glass or panel sections, sharp edges, lift, and frame distortion before confirming whether housing work is appropriate.',
        bestFor:
          'Phones with visible rear damage, separation, or a back section that no longer sits correctly.',
        notes:
          'Back Housing Replacement is kept as the canonical route because scope can extend beyond cosmetic rear-panel damage.',
      },
      {
        name: isFoldable ? 'Hinge enclosure and camera-area review' : 'Camera-area and structural review',
        shortDescription:
          `We check whether ${isFoldable ? 'hinge-side impact, enclosure damage, or ' : ''}camera-area distortion changes the repair path before quoting.`,
        bestFor:
          `Phones with impact around the ${isFoldable ? 'hinge enclosure, ' : ''}rear camera area, or corners that affect rear fit.`,
        notes:
          isFoldable
            ? 'Housing work does not automatically include hinge repair, and hinge damage may require separate assessment.'
            : 'Housing work does not automatically include rear cameras, which are assessed separately if internal faults exist.',
      },
      {
        name: 'Wireless-charging and structural validation',
        shortDescription:
          'We check rear fit and wireless-charging behaviour so the quote reflects function as well as cosmetic restoration.',
        bestFor:
          'Phones where rear damage may have affected charging alignment or the way the back structure sits.',
        notes:
          `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
      },
    ],
    commonProblems: [
      {
        title: 'Rear glass or rear panel damage',
        description:
          'Cracks, lift, missing glass, or sharp rear edges can affect safe handling and may overlap with broader housing damage.',
      },
      {
        title: 'Frame or housing deformation',
        description:
          'Rear impact can change how the housing sits, which matters before any new rear assembly is fitted.',
      },
      ...(isFoldable
        ? [
            {
              title: 'Hinge enclosure damage',
              description:
                'Damage near the hinge enclosure can look like rear housing work but may need a separate hinge assessment.',
            },
          ]
        : []),
      ...(hasIntegratedSPen
        ? [
            {
              title: 'S Pen slot deformation',
              description:
                'Impact near the S Pen slot can prevent the stylus from seating correctly, which requires housing-level correction.',
            },
          ]
        : []),
      {
        title: 'Camera-area impact',
        description:
          'The rear camera area is checked for deformation because housing damage there can affect more than the external finish.',
      },
      {
        title: 'Wireless-charging concerns',
        description:
          'Rear damage can change charging behaviour, so wireless charging is diagnosed where relevant before final scope is confirmed.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: 'Inspect the rear housing and frame',
        description:
          'We check rear-panel damage, structural fit, edge lift, and whether the frame or housing is bent or distorted.',
      },
      {
        step: '02',
        title: isFoldable ? 'Review hinge enclosure and camera-area impact' : 'Review camera-area impact',
        description:
          `Camera-area ${isFoldable ? 'and hinge-side ' : ''}damage are inspected so we do not confuse housing work with separate faults.`,
      },
      {
        step: '03',
        title: 'Test wireless charging and related fit',
        description:
          'Where relevant, we verify whether rear damage has affected charging alignment or general rear fit before quoting.',
      },
      {
        step: '04',
        title: 'Confirm the quote-only repair path',
        description:
          `Back housing work does not automatically include ${isFoldable ? 'hinge repair' : 'internal camera replacement'}, and final scope is only confirmed after technician inspection.`,
      },
    ],
    faq: [
      ...(isFoldable
        ? [
            {
              question: `Is ${config.modelName} Back Housing Replacement the same as hinge repair?`,
              answer:
                'No. Back Housing Replacement covers the rear housing path. Hinge damage may require separate assessment and is not automatically included.',
            },
          ]
        : []),
      ...(hasIntegratedSPen
        ? [
            {
              question: `Will back housing repair fix a stuck S Pen on my ${config.modelName}?`,
              answer:
                'If the S Pen is stuck due to housing deformation, a new housing assembly will correct the slot alignment. We inspect this before quoting.',
            },
          ]
        : []),
      {
        question: `Can rear-panel damage on my ${config.modelName} affect wireless charging?`,
        answer:
          'Yes. Rear damage can change alignment or fit, so we diagnose wireless charging behaviour where relevant before confirming the scope.',
      },
      {
        question: `Does ${config.modelName} back housing work automatically include the rear cameras?`,
        answer:
          'Not automatically. We inspect camera-area damage, but rear camera repair is confirmed separately if internal camera faults are present.',
      },
      {
        question: `Why is ${config.modelName} back housing work quote-only?`,
        answer:
          `Rear-panel damage, frame condition, ${isFoldable ? 'hinge enclosure findings, ' : ''}${hasIntegratedSPen ? 'S Pen slot alignment, ' : ''}and wireless-charging behaviour can all change the final repair scope and price.`,
      },
      {
        question: `Will back housing replacement restore factory water resistance on my ${config.modelName}?`,
        answer: SAMSUNG_WATER_RESISTANCE_NOTE,
      },
    ],
  };
}
