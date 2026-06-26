import type { RepairTypeSeoPocket, SamsungHardwareConfig } from './types';
import {
  SAMSUNG_FOLD_TESTING_NOTE,
  SAMSUNG_QUOTE_ONLY_SCOPE,
  SAMSUNG_WATER_RESISTANCE_NOTE,
} from './shared';

export function buildSamsungScreenReplacementPocket(
  config: SamsungHardwareConfig
): RepairTypeSeoPocket {
  if (config.deviceFamily === 'z-flip') {
    return {
      quickAnswer:
        `Need ${config.modelName} screen replacement in Ringwood? Ali Mobile & Repair keeps this route quote-only while we separate the inner foldable main display, the smaller outer cover display, protector or crease-area concerns, and hinge or frame findings before confirming scope.`,
      workbenchHeadings: {
        options: `Which screen assessment path fits this ${config.modelName}?`,
        diagnostics: 'What do we inspect before flip-screen work?',
        symptoms: 'Which display symptoms matter most on a Galaxy Z Flip?',
        outcomes: 'What can change the final screen scope?',
      },
      repairOptions: [
        {
          name: 'Inner Foldable Main Display Assessment',
          shortDescription:
            'We inspect black areas, lines, flickering, touch failure, crease-area damage, and hinge-side pressure affecting the primary folding screen.',
          bestFor:
            'Phones with faults on the main inner folding display, especially where the issue becomes clear when the phone is opened.',
          notes:
            'The inner display is the primary folding screen, and inspection includes the display path, protector condition, hinge feel, and related frame pressure before quoting.',
        },
        {
          name: 'Outer Cover Display Assessment',
          shortDescription:
            'We isolate cracked cover-screen glass, small-display touch failure, black image, lines, flickering, and damage that may be limited to the outer cover display.',
          bestFor:
            'Phones where the smaller cover display has visible impact damage or image faults while the inner folding display may behave differently.',
          notes:
            'The smaller cover display is a separate component, and one screen repair does not automatically repair the other display.',
        },
        {
          name: 'Inner Protector, Crease, and Hinge Inspection',
          shortDescription:
            'We inspect protector lift, bubbling, crease behaviour, hinge movement, and frame alignment before recommending display work.',
          bestFor:
            'Phones where the complaint may involve the protector, a visible crease, fold-area pressure, or hinge/frame overlap rather than direct display failure alone.',
          notes:
            'The protector should not be casually peeled, hinge or frame damage may need separate assessment, and a normal visible crease is not automatically damage.',
        },
      ],
      commonProblems: [
        {
          title: 'Inner main display lines, black areas, or touch loss',
          description:
            'The primary folding screen can fail with black patches, lines, flicker, or touch loss after fold-area stress or impact.',
        },
        {
          title: 'Small cover-display damage',
          description:
            'The smaller outer cover display can crack or lose image separately from the inner main display, so we quote the scope only after separating the two paths.',
        },
        {
          title: 'Protector lift or crease concerns',
          description:
            'Protector lift or a visible crease is not automatically the same as display failure, so we inspect both before recommending parts.',
        },
        {
          title: 'Hinge or frame overlap',
          description:
            'Hinge or frame damage can change the correct repair scope, and hinge work is not automatically included with screen replacement.',
        },
        {
          title: 'Quote-only scope differences',
          description:
            'Inner-display and cover-display scope can differ substantially, so final pricing follows technician inspection.',
        },
      ],
      diagnosticSteps: [
        {
          step: '01',
          title: 'Test the phone open and closed',
          description:
            'We compare how the main folding display and the cover display behave with the device open and closed where relevant.',
        },
        {
          step: '02',
          title: 'Separate inner and cover-display faults',
          description:
            'We confirm whether the issue sits in the primary inner display, the smaller cover display, or a different fold-area problem before quoting.',
        },
        {
          step: '03',
          title: 'Inspect protector, crease, hinge, and frame',
          description:
            'Protector condition, crease behaviour, hinge movement, and frame alignment are inspected before screen work is approved.',
        },
        {
          step: '04',
          title: 'Confirm quote-only scope and testing plan',
          description:
            `${SAMSUNG_FOLD_TESTING_NOTE} ${SAMSUNG_QUOTE_ONLY_SCOPE}`,
        },
      ],
      faq: [
        {
          question: `How do you tell whether my ${config.modelName} needs inner or cover-screen work?`,
          answer:
            'We compare the primary inner folding screen with the smaller cover display, then inspect the protector, crease area, hinge, and frame before confirming scope.',
        },
        {
          question: `Does one ${config.modelName} screen replacement cover both displays?`,
          answer:
            'No. The inner folding display and the smaller cover display are separate components, and replacing one does not automatically repair the other.',
        },
        {
          question: `Should I peel the protector off my ${config.modelName} if it is lifting?`,
          answer:
            'No. The protector should not be casually peeled because that can change the foldable display risk and the diagnostic picture.',
        },
        {
          question: `Is the crease on my ${config.modelName} always a sign of damage?`,
          answer:
            'No. A visible crease is not automatically damage. We look for image, touch, protector, hinge, and frame symptoms before deciding whether repair is needed.',
        },
        {
          question: `Is hinge repair included with ${config.modelName} screen replacement?`,
          answer:
            'Not automatically. Hinge or frame damage may require separate assessment, and screen work does not guarantee hinge restoration.',
        },
        {
          question: `Why is the ${config.modelName} screen page quote-only?`,
          answer:
            'Flip-screen scope can vary between the inner folding display, the smaller cover display, protector findings, and hinge or frame overlap, so the route remains quote-only until inspection.',
        },
        {
          question: `How long does ${config.modelName} screen repair take?`,
          answer:
            'Timing depends on which screen path is confirmed, part availability, and whether hinge, frame, or protector findings change the scope after assessment.',
        },
        {
          question: `Will screen repair restore factory water resistance on my ${config.modelName}?`,
          answer: SAMSUNG_WATER_RESISTANCE_NOTE,
        },
      ],
    };
  }

  return {
    quickAnswer:
      `Need ${config.modelName} screen replacement in Ringwood? Ali Mobile & Repair keeps this route quote-only while we separate inner foldable display faults, outer cover-display faults, protector or fold-area concerns, and hinge-related impact before confirming scope.`,
    workbenchHeadings: {
      options: `Which screen assessment path fits this ${config.modelName}?`,
      diagnostics: 'What do we inspect before foldable screen work?',
      symptoms: 'Which display symptoms matter most on a foldable phone?',
      outcomes: 'What can change the final screen scope?',
    },
    repairOptions: [
      {
        name: 'Inner Foldable Display Assessment',
        shortDescription:
          'We inspect black areas, lines, flickering, touch failure, fold-area damage, and hinge-side impact affecting the inner display assembly.',
        bestFor:
          'Phones with inner-screen image loss, unstable touch, crease-area damage, or symptoms spreading from the hinge side.',
        notes:
          'Inspection covers the inner display, the factory inner protector, hinge behaviour, and connected assemblies before a quote is confirmed.',
      },
      {
        name: 'Outer Cover Display Assessment',
        shortDescription:
          'We isolate cracked cover-screen glass, outer touch failure, black image, lines, flickering, and impact that may be limited to the outer display.',
        bestFor:
          'Phones with damage visible on the cover display while the inner foldable display may still behave differently.',
        notes:
          'Inner and outer displays are different components, and one display replacement does not repair the other.',
      },
      {
        name: 'Inner Protector and Fold-Area Inspection',
        shortDescription:
          'We inspect lifting, bubbling, protector damage, crease visibility, hinge feel, and fold-area stress before recommending any display work.',
        bestFor:
          'Phones where the inner protector, visible crease, or hinge-side pressure may be part of the complaint.',
        notes:
          'The factory inner protector should not be casually peeled, and a visible crease is not automatically a display failure.',
      },
    ],
    commonProblems: [
      {
        title: 'Inner display black areas, lines, or touch loss',
        description:
          'The foldable inner display can fail with black patches, coloured lines, flicker, or partial touch loss after impact or fold-area stress.',
      },
      {
        title: 'Outer cover screen damage',
        description:
          'A cracked or flickering cover display can be limited to the outer screen, so we separate that path from inner-screen faults before quoting.',
      },
      {
        title: 'Protector lift or bubbling',
        description:
          'The inner factory protector can lift or bubble around the fold area. That does not automatically mean the inner display itself has failed.',
      },
      {
        title: 'Hinge-area impact overlap',
        description:
          'Impact near the hinge can affect the display path, but hinge repair is not automatically included with screen work.',
      },
      {
        title: 'Quote-only scope differences',
        description:
          'Inner and outer display work can differ substantially in scope and pricing, so final quoting follows technician inspection.',
      },
    ],
    diagnosticSteps: [
      {
        step: '01',
        title: 'Test the phone open and closed',
        description:
          'We check image output, touch response, and symptom repeatability with the phone both unfolded and folded where relevant.',
      },
      {
        step: '02',
        title: 'Separate inner and outer display behaviour',
        description:
          'We confirm whether the complaint sits in the inner foldable display, the outer cover display, or both, without assuming a shared part or shared price.',
      },
      {
        step: '03',
        title: 'Inspect protector, crease, hinge, and frame',
        description:
          'We inspect the inner protector, fold area, hinge feel, alignment, and impact signs before confirming whether screen work alone is appropriate.',
      },
      {
        step: '04',
        title: 'Confirm quote-only scope and final testing plan',
        description:
          `${SAMSUNG_FOLD_TESTING_NOTE} ${SAMSUNG_QUOTE_ONLY_SCOPE}`,
      },
    ],
    faq: [
      {
        question: `How do you tell whether my ${config.modelName} needs inner or outer screen work?`,
        answer:
          'We test the phone in open and closed positions, compare the inner foldable display with the outer cover display, and inspect the fold area before confirming scope.',
      },
      {
        question: `Does one ${config.modelName} screen replacement cover both displays?`,
        answer:
          'No. The inner foldable display and the outer cover display are different components, and replacing one does not automatically repair the other.',
      },
      {
        question: `Is the crease on my ${config.modelName} always a sign of display failure?`,
        answer:
          'No. A visible crease is not automatically a fault. We look for image, touch, protector, and hinge-related symptoms before deciding whether repair is needed.',
      },
      {
        question: `Should I peel the factory inner protector off my ${config.modelName}?`,
        answer:
          'No. The factory inner protector should not be casually removed because that can make the foldable display riskier to handle and can change the diagnostic picture.',
      },
      {
        question: `Is hinge repair included with ${config.modelName} screen replacement?`,
        answer:
          'Not automatically. Hinge-related issues may need separate assessment, and screen work does not guarantee hinge restoration.',
      },
      {
        question: `Why is the ${config.modelName} screen page quote-only?`,
        answer:
          'Foldable screen scope can vary widely between inner-display, outer-display, protector, and hinge-related findings, so we keep the route quote-only until a technician inspects the phone.',
      },
      {
        question: `How long does ${config.modelName} screen repair take?`,
        answer:
          'Timing depends on which display path is confirmed, part availability, and whether hinge, protector, or housing-related findings change the scope after assessment.',
      },
      {
        question: `Will screen repair restore factory water resistance on my ${config.modelName}?`,
        answer: SAMSUNG_WATER_RESISTANCE_NOTE,
      },
    ],
  };
}
