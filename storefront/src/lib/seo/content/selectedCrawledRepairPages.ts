import type { RepairTypeSeoPocket } from '@/lib/seo/content/iphone/types';

type ScopedRepairPageContent = {
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  schemaDescription: string;
  pocket?: RepairTypeSeoPocket;
};

type ScopedModelHubContent = {
  metaTitle: string;
  metaDescription: string;
  heroIntro: string;
};

function repairPageKey(category: string, brand: string, model: string, repairType: string) {
  return `${category}/${brand}/${model}/${repairType}`;
}

const SCOPED_REPAIR_PAGE_CONTENT: Record<string, ScopedRepairPageContent> = {
  'phone/realme/8-5g/screen-replacement': {
    metaTitle: 'Realme 8 5G Screen Replacement in Ringwood | Ali Mobile & Repair',
    metaDescription:
      'Realme 8 5G screen replacement in Ringwood for cracked glass, black display, flickering, or touch-response problems, with inspection before repair.',
    heroSubtitle:
      'For a cracked, black, flickering, or unresponsive Realme 8 5G display, we inspect the screen, touch response, and surrounding condition before confirming the repair path.',
    schemaDescription:
      'Realme 8 5G screen replacement in Ringwood with inspection of cracked glass, display output, flickering, touch response, and surrounding condition before repair.',
    pocket: {
      quickAnswer:
        'A Realme 8 5G screen fault can involve cracked glass, a black display, flickering, or touch-response problems. We inspect the display assembly and device condition before confirming the repair scope.',
      workbenchHeadings: {
        options: 'Which Realme 8 5G screen repair path fits the fault?',
        diagnostics: 'What is checked before Realme 8 5G screen repair?',
        symptoms: 'Which Realme 8 5G display symptoms matter most?',
        outcomes: 'What can change the confirmed screen repair scope?',
      },
      repairOptions: [
        {
          name: 'Display and touch inspection',
          shortDescription: 'We check visible cracking, display output, flickering, and touch response before confirming a screen repair path.',
          bestFor: 'A cracked panel, black screen, unstable image, or touch areas that do not respond consistently.',
          notes: 'The device condition and related impact are considered before the repair scope is confirmed.',
        },
        {
          name: 'Quote-first repair confirmation',
          shortDescription: 'The selected repair is confirmed only after the model, display fault, and surrounding condition have been checked.',
          bestFor: 'Devices with more than one symptom or visible frame damage near the display.',
          notes: 'Timing and parts availability are confirmed after diagnosis rather than promised in advance.',
        },
      ],
      commonProblems: [
        { title: 'Cracked display', description: 'Cracks can affect the front glass, display output, or touch response, so the full screen condition is checked.' },
        { title: 'Black display', description: 'A black display can follow impact or a display fault and needs inspection before a replacement path is confirmed.' },
        { title: 'Flickering image', description: 'Flickering or unstable output can point to the display path or another related issue, so we reproduce the symptom first.' },
        { title: 'Touch-response problems', description: 'Delayed, intermittent, or unresponsive touch is checked across the screen before the repair scope is quoted.' },
      ],
      diagnosticSteps: [
        { step: '01', title: 'Confirm the Realme 8 5G model', description: 'We confirm the exact model before matching the repair path.' },
        { step: '02', title: 'Inspect the display and frame', description: 'Cracking, image output, touch response, and visible impact are checked together.' },
        { step: '03', title: 'Reproduce the reported symptom', description: 'We test the reported black display, flicker, or touch issue before confirming repair.' },
        { step: '04', title: 'Confirm the quote and repair scope', description: 'The practical repair path, parts availability, and timing are discussed after inspection.' },
      ],
      faq: [
        { question: 'Does every cracked Realme 8 5G screen need the same repair?', answer: 'No. Cracking, display output, touch response, frame condition, and the confirmed fault determine the practical repair path.' },
        { question: 'Can a black or flickering display be checked before repair?', answer: 'Yes. We inspect and reproduce the display symptom before confirming the repair scope.' },
      ],
    },
  },
  'phone/samsung/galaxy-z-fold-5/charging-port-replacement': {
    metaTitle: 'Galaxy Z Fold 5 Charging Port Replacement in Ringwood | Ali Mobile & Repair',
    metaDescription:
      'Galaxy Z Fold 5 charging port diagnosis in Ringwood for unstable charging, cable connection problems, or port obstruction and damage checks. Timing depends on diagnosis and parts.',
    heroSubtitle:
      'For Galaxy Z Fold 5 charging problems, we assess unstable charging, cable connection, port obstruction or damage, then test charging behaviour before confirming the repair scope.',
    schemaDescription:
      'Galaxy Z Fold 5 charging port diagnosis in Ringwood for unstable charging, cable connection problems, port obstruction or damage, and charging behaviour testing before repair.',
  },
  'phone/oppo/reno-9-pro/charging-port-replacement': {
    metaTitle: 'OPPO Reno 9 Pro Charging Port Replacement in Ringwood | Ali Mobile & Repair',
    metaDescription:
      'OPPO Reno 9 Pro charging port diagnosis in Ringwood for intermittent charging, loose cable fit, angle-dependent charging, debris, port damage, or internal charging-component faults.',
    heroSubtitle:
      'For OPPO Reno 9 Pro charging faults, we check intermittent charging, loose cable fit, angle-dependent connection, debris, port condition, and related internal charging components before confirming repair.',
    schemaDescription:
      'OPPO Reno 9 Pro charging port diagnosis in Ringwood for intermittent charging, loose cable fit, angle-dependent charging, debris, port condition, and related charging-component faults.',
    pocket: {
      quickAnswer:
        'OPPO Reno 9 Pro charging issues can involve intermittent charging, loose cable fit, charging only at certain angles, debris, port damage, or an internal charging-component fault. We diagnose the path before confirming replacement.',
      workbenchHeadings: {
        options: 'Which OPPO Reno 9 Pro charging path fits the fault?',
        diagnostics: 'What is checked before OPPO Reno 9 Pro charging-port repair?',
        symptoms: 'Which OPPO Reno 9 Pro charging symptoms matter most?',
        outcomes: 'What can change the confirmed charging repair scope?',
      },
      repairOptions: [
        {
          name: 'Cable fit and obstruction inspection',
          shortDescription: 'We check cable seating, angle-dependent charging, visible debris, and port condition before assuming a replacement is required.',
          bestFor: 'A loose cable, charging that cuts in and out, or a connection that works only at certain angles.',
          notes: 'Debris or wear can resemble a deeper port fault, so inspection comes first.',
        },
        {
          name: 'Charging-component diagnosis',
          shortDescription: 'We separate port symptoms from cable, battery, connector, and internal charging-component causes before confirming the repair path.',
          bestFor: 'No charging, intermittent charging, or a fault that persists across compatible accessories.',
          notes: 'The final scope, parts availability, and timing depend on diagnosis.',
        },
      ],
      commonProblems: [
        { title: 'Intermittent charging', description: 'Charging that starts and stops can involve cable movement, port condition, or another charging-path fault.' },
        { title: 'Loose cable fit', description: 'A cable that will not seat firmly can be caused by debris, wear, or damage within the port area.' },
        { title: 'Charging only at certain angles', description: 'Angle-dependent charging is checked with the connection and port condition before replacement is confirmed.' },
        { title: 'Debris, port, or internal-component fault', description: 'We distinguish compacted debris and port damage from related internal charging-component causes.' },
      ],
      diagnosticSteps: [
        { step: '01', title: 'Confirm the reported charging behaviour', description: 'We reproduce the intermittent, loose-fit, or angle-dependent connection where practical.' },
        { step: '02', title: 'Inspect the cable fit and port area', description: 'Cable seating, debris, and visible port condition are checked before a repair path is selected.' },
        { step: '03', title: 'Separate related charging causes', description: 'Battery, connector, and internal charging-component symptoms are considered before confirming the scope.' },
        { step: '04', title: 'Confirm the quote and next step', description: 'The practical repair option, parts availability, and timing are explained after diagnosis.' },
      ],
      faq: [
        { question: 'Does a loose OPPO Reno 9 Pro cable always mean the port needs replacement?', answer: 'No. Debris, cable fit, wear, and related charging-path faults are checked before a replacement path is confirmed.' },
        { question: 'Why can OPPO Reno 9 Pro charging work only at certain angles?', answer: 'Angle-dependent charging can involve the connection, port condition, or another charging component, so the device is inspected before quoting repair.' },
      ],
    },
  },
};

const SCOPED_MODEL_HUB_CONTENT: Record<string, ScopedModelHubContent> = {
  'phone/oppo/a31': {
    metaTitle: 'OPPO A31 Repair Options in Ringwood | Ali Mobile & Repair',
    metaDescription:
      'OPPO A31 repair options in Ringwood. Compare available screen, battery, charging, and camera-related services, check current pricing, and book the right repair path.',
    heroIntro:
      'Choose the available repair for your OPPO A31 to compare screen, battery, charging, and camera-related services. Each option links to its exact canonical repair page with current pricing or quote guidance.',
  },
};

export function getSelectedCrawledRepairPageContent({
  category,
  brand,
  model,
  repairType,
}: {
  category: string;
  brand: string;
  model: string;
  repairType: string;
}) {
  return SCOPED_REPAIR_PAGE_CONTENT[repairPageKey(category, brand, model, repairType)] ?? null;
}

export function getSelectedCrawledModelHubContent({
  category,
  brand,
  model,
}: {
  category: string;
  brand: string;
  model: string;
}) {
  return SCOPED_MODEL_HUB_CONTENT[`${category}/${brand}/${model}`] ?? null;
}
