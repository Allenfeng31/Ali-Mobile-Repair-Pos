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

  if (config.seriesFamily === 'galaxy-note') {
    return {
      quickAnswer: `Need ${config.modelName} Back Glass Replacement in Ringwood? Ali Mobile & Repair checks cracked rear glass, separated rear-panel fit, camera-opening alignment, button and USB-C port alignment, frame condition, swelling-related separation, and integrated S Pen slot-area condition before confirming the quote-only rear glass path.`,
      workbenchHeadings: {
        options: `Which back glass path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before back glass replacement?',
        symptoms: 'Which rear panel symptoms matter most?',
        outcomes: 'What can change the housing repair result?',
      },
      repairOptions: [
        {
          name: 'Rear panel and frame inspection',
          shortDescription:
            'We inspect cracked rear glass, separated rear-panel fit, and structural condition before confirming the rear glass path.',
          bestFor:
            'Phones with visible rear damage, lifted edges, or a rear panel that no longer sits flush with the frame.',
          notes:
            'Severe frame deformation can require separate assessment rather than being assumed inside every rear glass replacement.',
        },
        {
          name: 'Alignment and function review',
          shortDescription:
            'We check camera openings, buttons, the USB-C port area, and the rear fit so the rear glass path matches the actual fault.',
          bestFor:
            'Phones with impact around the camera area, buttons, or charging port where alignment is no longer reliable.',
          notes:
            'If swelling or another deeper fault has pushed the housing out of shape, we explain that before confirming the final scope.',
        },
        {
          name: 'Quote-only housing handover',
          shortDescription:
            'We confirm the replacement path before work and retest the final fit and function before pickup.',
          bestFor:
            'Customers who need the housing checked in context rather than assuming every rear-panel crack needs the same fix.',
          notes:
            `${SAMSUNG_QUOTE_ONLY_SCOPE} ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      commonProblems: [
        {
          title: 'Cracked or separated rear glass',
          description:
            'Cracks, lifting, or a separated rear panel can change the fit of the device and affect the safe repair path.',
        },
        {
          title: 'Camera-opening alignment',
          description:
            'Impact around the camera opening can change how the rear assembly sits and whether the housing alone is the correct repair.',
        },
        {
          title: 'Swelling-related separation',
          description:
            'Battery swelling can push on the rear housing, so we check whether the swelling has changed the structural fit.',
        },
        {
          title: 'Integrated S Pen slot-area condition',
          description:
            'S Pen slot-area damage is reviewed as diagnostic context, but the housing product does not automatically include S Pen service.',
        },
        {
          title: 'Water-resistance limitation',
          description:
            'Opening and resealing the phone does not restore factory IP68 performance, so we explain that limitation before repair.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Inspect rear glass and frame condition',
          description:
            'We check whether the rear panel is cracked, separated, or no longer sitting flush with the frame.',
        },
        {
          step: '02',
          title: 'Check alignment around openings and buttons',
          description:
            'Camera openings, buttons, and the USB-C port area are reviewed so the housing quote matches the visible damage.',
        },
        {
          step: '03',
          title: 'Review swelling and slot-area impact',
          description:
            'Swelling, pressure, and integrated S Pen slot-area damage are considered before the final scope is confirmed.',
        },
        {
          step: '04',
          title: 'Retest fit and function before handover',
          description:
            `We confirm the final fit and function after repair, while ${SAMSUNG_WATER_RESISTANCE_NOTE}`,
        },
      ],
      faq: [
        {
          question: `What is included in ${config.modelName} Back Glass Replacement?`,
          answer:
            'It covers the applicable rear glass or housing assembly shown by the live catalogue, but the exact included parts still depend on the supplied assembly and the final inspection.',
        },
        {
          question: `Is this the same as Back Housing Replacement on my ${config.modelName}?`,
          answer:
            'The public Note page is presented as Back Glass Replacement, while the live POS product behind it remains Back Housing Replacement. That keeps the customer-facing route consistent without inventing a second purchasable product.',
        },
        {
          question: `Does ${config.modelName} Back Glass Replacement include the complete metal frame?`,
          answer:
            'Not always. Severe frame deformation may need separate assessment, and the rear glass route does not automatically guarantee a complete metal-frame replacement.',
        },
        {
          question: `Can battery swelling cause the rear glass to lift on my ${config.modelName}?`,
          answer:
            'Yes. We inspect swelling-related pressure carefully because it can change the way the rear panel sits and whether more than the rear glass itself needs attention.',
        },
        {
          question: `Will camera openings and buttons be checked during ${config.modelName} Back Glass Replacement?`,
          answer:
            'Yes. Camera openings, buttons, and the USB-C port area are checked because alignment problems can change the repair path.',
        },
        {
          question: `Is the S Pen included in ${config.modelName} Back Glass Replacement?`,
          answer:
            'No. The S Pen is not included in the underlying POS housing product, and S Pen replacement is not a public service here.',
        },
        {
          question: `Will factory IP68 resistance be restored on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
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
