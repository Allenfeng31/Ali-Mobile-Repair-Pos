export type MacBookRepairSlug =
  | 'screen-replacement'
  | 'battery-replacement'
  | 'charging-port-replacement';

type MacBookModelSlug =
  | 'macbook-air-11-2014-2015'
  | 'macbook-air-13-2014-2017'
  | 'macbook-air-13-2018-2020'
  | 'macbook-air-13-m1-2020'
  | 'macbook-air-m2-13-2022'
  | 'macbook-air-m2-15-2023'
  | 'macbook-air-m3-13-2024'
  | 'macbook-air-m3-15-2024'
  | 'macbook-pro-13-2014-2015'
  | 'macbook-pro-15-2014-2015'
  | 'macbook-pro-13-2016-2017'
  | 'macbook-pro-15-2016-2017'
  | 'macbook-pro-13-2018-2020'
  | 'macbook-pro-16-2019'
  | 'macbook-pro-13-m1-2020'
  | 'macbook-pro-14-16-m1-pro-max-2021'
  | 'macbook-pro-13-m2-2022'
  | 'macbook-pro-14-16-m2-pro-max-2023'
  | 'macbook-pro-14-16-m3-pro-max-2024'
  | 'macbook-12-2015-2019';

interface MacBookModelConfig {
  slug: MacBookModelSlug;
  modelName: string;
  family: 'MacBook Air' | 'MacBook Pro' | 'MacBook';
  generationNote: string;
  chargingContext: string;
  screenCaution: string;
  batteryCaution: string;
  portCaution: string;
  localContext: string;
}

interface RepairTypeSeoPocket {
  quickAnswer: string;
  workbenchHeadings?: {
    options: string;
    diagnostics: string;
    symptoms: string;
    outcomes: string;
  };
  repairOptions: Array<{
    name: string;
    shortDescription: string;
    bestFor: string;
    notes: string;
  }>;
  commonProblems: Array<{
    title: string;
    description: string;
  }>;
  diagnosticSteps: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

interface DetailSection {
  kicker: string;
  heading: string;
  intro: string;
  items: ReadonlyArray<string>;
}

interface ServiceSection {
  eyebrow: string;
  heading: string;
  intro: string;
  cards: ReadonlyArray<{
    title: string;
    description: string;
  }>;
}

interface FinalCtaSection {
  kicker: string;
  heading: string;
  body: string;
  bullets: ReadonlyArray<string>;
}

export interface MacBookEnhancedSeoPocket extends RepairTypeSeoPocket {
  modelName: string;
  repairSlug: MacBookRepairSlug;
  metaTitle: string;
  metaDescription: string;
  serviceSection: ServiceSection;
  localService: DetailSection;
  finalCta: FinalCtaSection;
}

export interface MacBookExploreLink {
  href: string;
  label: string;
  slug: string;
}

export const MACBOOK_REPAIRS: ReadonlyArray<MacBookRepairSlug> = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
];

export const MACBOOK_MODELS: ReadonlyArray<MacBookModelSlug> = [
  'macbook-air-11-2014-2015',
  'macbook-air-13-2014-2017',
  'macbook-air-13-2018-2020',
  'macbook-air-13-m1-2020',
  'macbook-air-m2-13-2022',
  'macbook-air-m2-15-2023',
  'macbook-air-m3-13-2024',
  'macbook-air-m3-15-2024',
  'macbook-pro-13-2014-2015',
  'macbook-pro-15-2014-2015',
  'macbook-pro-13-2016-2017',
  'macbook-pro-15-2016-2017',
  'macbook-pro-13-2018-2020',
  'macbook-pro-16-2019',
  'macbook-pro-13-m1-2020',
  'macbook-pro-14-16-m1-pro-max-2021',
  'macbook-pro-13-m2-2022',
  'macbook-pro-14-16-m2-pro-max-2023',
  'macbook-pro-14-16-m3-pro-max-2024',
  'macbook-12-2015-2019',
];

const PUBLIC_MACBOOK_MODEL_ALIASES = {
  'macbook-air-11-inch-2014-2015': 'macbook-air-11-2014-2015',
  'macbook-air-13-inch-2014-2017': 'macbook-air-13-2014-2017',
  'macbook-air-13-inch-2018-2020': 'macbook-air-13-2018-2020',
  'macbook-air-13-inch-m1-2020': 'macbook-air-13-m1-2020',
  'macbook-air-m2-13-inch-2022': 'macbook-air-m2-13-2022',
  'macbook-air-m2-15-inch-2023': 'macbook-air-m2-15-2023',
  'macbook-air-m3-13-inch-2024': 'macbook-air-m3-13-2024',
  'macbook-air-m3-15-inch-2024': 'macbook-air-m3-15-2024',
  'macbook-pro-13-inch-2014-2015': 'macbook-pro-13-2014-2015',
  'macbook-pro-15-inch-2014-2015': 'macbook-pro-15-2014-2015',
  'macbook-pro-13-inch-2016-2017': 'macbook-pro-13-2016-2017',
  'macbook-pro-15-inch-2016-2017': 'macbook-pro-15-2016-2017',
  'macbook-pro-13-inch-2018-2020': 'macbook-pro-13-2018-2020',
  'macbook-pro-16-inch-2019': 'macbook-pro-16-2019',
  'macbook-pro-13-inch-m1-2020': 'macbook-pro-13-m1-2020',
  'macbook-pro-1416-inch-m1-promax-2021': 'macbook-pro-14-16-m1-pro-max-2021',
  'macbook-pro-13-inch-m2-2022': 'macbook-pro-13-m2-2022',
  'macbook-pro-1416-inch-m2-promax-2023': 'macbook-pro-14-16-m2-pro-max-2023',
  'macbook-pro-1416-inch-m3-promax-2024': 'macbook-pro-14-16-m3-pro-max-2024',
  'macbook-12-inch-2015-2019': 'macbook-12-2015-2019',
} as const satisfies Record<string, MacBookModelSlug>;

const PUBLIC_MACBOOK_MODEL_SLUGS_BY_CONTENT_KEY = Object.fromEntries(
  Object.entries(PUBLIC_MACBOOK_MODEL_ALIASES).map(([publicSlug, contentSlug]) => [contentSlug, publicSlug])
) as Record<MacBookModelSlug, string>;

const MODEL_CONFIGS: Record<MacBookModelSlug, MacBookModelConfig> = {
  'macbook-air-11-2014-2015': {
    slug: 'macbook-air-11-2014-2015',
    modelName: 'MacBook Air 11-inch 2014-2015',
    family: 'MacBook Air',
    generationNote: 'compact Intel Air chassis',
    chargingContext: 'MagSafe-era charging behaviour',
    screenCaution: 'thin lid edges and older hinge movement',
    batteryCaution: 'age-related runtime drop and possible trackpad pressure',
    portCaution: 'MagSafe seating, adapter condition, and I/O-side wear',
    localContext: 'often brought in as a light travel or school MacBook',
  },
  'macbook-air-13-2014-2017': {
    slug: 'macbook-air-13-2014-2017',
    modelName: 'MacBook Air 13-inch 2014-2017',
    family: 'MacBook Air',
    generationNote: 'classic Intel Air body',
    chargingContext: 'MagSafe-era charging behaviour',
    screenCaution: 'lid alignment, hinge looseness, and display cable age',
    batteryCaution: 'older battery age, charge hold, and swollen-cell pressure',
    portCaution: 'MagSafe connector fit and left-side port condition',
    localContext: 'still common around Ringwood as a study and home laptop',
  },
  'macbook-air-13-2018-2020': {
    slug: 'macbook-air-13-2018-2020',
    modelName: 'MacBook Air 13-inch 2018-2020',
    family: 'MacBook Air',
    generationNote: 'Retina Intel Air design',
    chargingContext: 'USB-C charging behaviour',
    screenCaution: 'Retina display output, lid angle symptoms, and hinge feel',
    batteryCaution: 'battery condition alongside USB-C charging response',
    portCaution: 'USB-C port seating and cable angle behaviour',
    localContext: 'often used for school, uni, and lightweight office work',
  },
  'macbook-air-13-m1-2020': {
    slug: 'macbook-air-13-m1-2020',
    modelName: 'MacBook Air 13-inch M1 2020',
    family: 'MacBook Air',
    generationNote: 'Apple-silicon Air platform',
    chargingContext: 'USB-C charging behaviour',
    screenCaution: 'display assembly symptoms with Apple-silicon startup checks',
    batteryCaution: 'runtime changes on an otherwise efficient M1 Air',
    portCaution: 'USB-C charging response on both cable orientation and adapter combinations',
    localContext: 'a common everyday MacBook for students and remote work',
  },
  'macbook-air-m2-13-2022': {
    slug: 'macbook-air-m2-13-2022',
    modelName: 'MacBook Air M2 13-inch 2022',
    family: 'MacBook Air',
    generationNote: 'thin Apple-silicon Air redesign',
    chargingContext: 'MagSafe 3 and USB-C charging behaviour',
    screenCaution: 'thin lid condition and camera-notch area checks',
    batteryCaution: 'battery runtime against MagSafe 3 and USB-C charging response',
    portCaution: 'MagSafe 3 seating plus USB-C port behaviour',
    localContext: 'often brought in for work, school, and travel use',
  },
  'macbook-air-m2-15-2023': {
    slug: 'macbook-air-m2-15-2023',
    modelName: 'MacBook Air M2 15-inch 2023',
    family: 'MacBook Air',
    generationNote: 'larger Apple-silicon Air body',
    chargingContext: 'MagSafe 3 and USB-C charging behaviour',
    screenCaution: 'wide thin lid pressure and hinge alignment',
    batteryCaution: 'large-screen runtime expectations and charging consistency',
    portCaution: 'MagSafe 3 connection plus USB-C accessory charging response',
    localContext: 'often used as a light but larger work laptop',
  },
  'macbook-air-m3-13-2024': {
    slug: 'macbook-air-m3-13-2024',
    modelName: 'MacBook Air M3 13-inch 2024',
    family: 'MacBook Air',
    generationNote: 'newer Apple-silicon Air platform',
    chargingContext: 'MagSafe 3 and USB-C charging behaviour',
    screenCaution: 'thin lid marks, camera area, and display output',
    batteryCaution: 'newer battery behaviour compared with adapter and cable response',
    portCaution: 'MagSafe 3 seating and USB-C port consistency',
    localContext: 'often brought in early after drops or charging accidents',
  },
  'macbook-air-m3-15-2024': {
    slug: 'macbook-air-m3-15-2024',
    modelName: 'MacBook Air M3 15-inch 2024',
    family: 'MacBook Air',
    generationNote: 'larger newer Apple-silicon Air',
    chargingContext: 'MagSafe 3 and USB-C charging behaviour',
    screenCaution: 'larger thin lid pressure and even hinge travel',
    batteryCaution: 'daily runtime symptoms against charger and adapter behaviour',
    portCaution: 'MagSafe 3 fit and USB-C port stability',
    localContext: 'often used as a main home or business laptop',
  },
  'macbook-pro-13-2014-2015': {
    slug: 'macbook-pro-13-2014-2015',
    modelName: 'MacBook Pro 13-inch 2014-2015',
    family: 'MacBook Pro',
    generationNote: 'Retina Intel Pro body',
    chargingContext: 'MagSafe-era charging behaviour',
    screenCaution: 'Retina panel faults, hinge condition, and older lid wear',
    batteryCaution: 'battery age, top-case pressure, and MagSafe response',
    portCaution: 'MagSafe seating and nearby I/O wear',
    localContext: 'often brought in as a long-serving work or study MacBook',
  },
  'macbook-pro-15-2014-2015': {
    slug: 'macbook-pro-15-2014-2015',
    modelName: 'MacBook Pro 15-inch 2014-2015',
    family: 'MacBook Pro',
    generationNote: 'larger Retina Intel Pro body',
    chargingContext: 'MagSafe-era charging behaviour',
    screenCaution: 'larger display assembly, hinge load, and lid condition',
    batteryCaution: 'older high-use battery behaviour and swelling pressure',
    portCaution: 'MagSafe fit and side-port condition',
    localContext: 'often used for creative work, study, or older business setups',
  },
  'macbook-pro-13-2016-2017': {
    slug: 'macbook-pro-13-2016-2017',
    modelName: 'MacBook Pro 13-inch 2016-2017',
    family: 'MacBook Pro',
    generationNote: 'early USB-C Intel Pro design',
    chargingContext: 'USB-C charging behaviour',
    screenCaution: 'lid-angle display symptoms and USB-C-era housing fit',
    batteryCaution: 'battery condition alongside USB-C charging and trackpad feel',
    portCaution: 'USB-C port wear, cable seating, and adapter response',
    localContext: 'often arrives with mixed charging, display, or keyboard-use history',
  },
  'macbook-pro-15-2016-2017': {
    slug: 'macbook-pro-15-2016-2017',
    modelName: 'MacBook Pro 15-inch 2016-2017',
    family: 'MacBook Pro',
    generationNote: 'larger early USB-C Intel Pro',
    chargingContext: 'USB-C charging behaviour',
    screenCaution: 'larger display pressure, hinge movement, and lid-angle behaviour',
    batteryCaution: 'power draw, battery wear, and USB-C charging consistency',
    portCaution: 'USB-C port bank behaviour and adapter fit',
    localContext: 'often used for heavier creative or office workloads',
  },
  'macbook-pro-13-2018-2020': {
    slug: 'macbook-pro-13-2018-2020',
    modelName: 'MacBook Pro 13-inch 2018-2020',
    family: 'MacBook Pro',
    generationNote: 'later Intel USB-C Pro',
    chargingContext: 'USB-C charging behaviour',
    screenCaution: 'Retina display output, lid angle, and camera-area function',
    batteryCaution: 'runtime, top-case pressure, and USB-C power response',
    portCaution: 'USB-C charging and accessory port consistency',
    localContext: 'often brought in as a daily work MacBook',
  },
  'macbook-pro-16-2019': {
    slug: 'macbook-pro-16-2019',
    modelName: 'MacBook Pro 16-inch 2019',
    family: 'MacBook Pro',
    generationNote: 'larger Intel Pro workstation body',
    chargingContext: 'USB-C charging behaviour',
    screenCaution: 'large display assembly, hinge load, and heat-use history',
    batteryCaution: 'high-power battery demand and USB-C charging response',
    portCaution: 'USB-C power delivery, cable seating, and port bank behaviour',
    localContext: 'often used for creative, development, and business workloads',
  },
  'macbook-pro-13-m1-2020': {
    slug: 'macbook-pro-13-m1-2020',
    modelName: 'MacBook Pro 13-inch M1 2020',
    family: 'MacBook Pro',
    generationNote: 'Apple-silicon 13-inch Pro',
    chargingContext: 'USB-C charging behaviour',
    screenCaution: 'display output with Apple-silicon boot and sleep/wake checks',
    batteryCaution: 'efficient M1 runtime compared with real charging behaviour',
    portCaution: 'USB-C charging response and adapter combinations',
    localContext: 'often brought in as a compact work MacBook Pro',
  },
  'macbook-pro-14-16-m1-pro-max-2021': {
    slug: 'macbook-pro-14-16-m1-pro-max-2021',
    modelName: 'MacBook Pro 14/16-inch M1 Pro/Max 2021',
    family: 'MacBook Pro',
    generationNote: 'Apple-silicon Pro/Max family page',
    chargingContext: 'MagSafe 3 and USB-C charging behaviour',
    screenCaution: 'display assembly, lid alignment, and camera-notch area for both 14-inch and 16-inch variants',
    batteryCaution: 'Pro/Max power demand across both 14-inch and 16-inch variants',
    portCaution: 'MagSafe 3 seating plus USB-C charging behaviour',
    localContext: 'often used for demanding creative, study, and business work',
  },
  'macbook-pro-13-m2-2022': {
    slug: 'macbook-pro-13-m2-2022',
    modelName: 'MacBook Pro 13-inch M2 2022',
    family: 'MacBook Pro',
    generationNote: 'Apple-silicon 13-inch Pro update',
    chargingContext: 'USB-C charging behaviour',
    screenCaution: 'Retina panel output and sleep/wake behaviour',
    batteryCaution: 'M2 runtime symptoms against charger and adapter response',
    portCaution: 'USB-C cable fit and charging draw consistency',
    localContext: 'often brought in as a compact work or study Pro model',
  },
  'macbook-pro-14-16-m2-pro-max-2023': {
    slug: 'macbook-pro-14-16-m2-pro-max-2023',
    modelName: 'MacBook Pro 14/16-inch M2 Pro/Max 2023',
    family: 'MacBook Pro',
    generationNote: 'M2 Pro/Max family page',
    chargingContext: 'MagSafe 3 and USB-C charging behaviour',
    screenCaution: 'display output, camera-notch area, and lid alignment for this MacBook Pro generation',
    batteryCaution: 'larger Pro/Max workload symptoms without assuming one size',
    portCaution: 'MagSafe 3 and USB-C charging-path checks',
    localContext: 'often used for heavier office, design, and media workloads',
  },
  'macbook-pro-14-16-m3-pro-max-2024': {
    slug: 'macbook-pro-14-16-m3-pro-max-2024',
    modelName: 'MacBook Pro 14/16-inch M3 Pro/Max 2024',
    family: 'MacBook Pro',
    generationNote: 'newer M3 Pro/Max family page',
    chargingContext: 'MagSafe 3 and USB-C charging behaviour',
    screenCaution: 'newer display assembly condition across both 14-inch and 16-inch variants',
    batteryCaution: 'newer Pro/Max runtime symptoms checked against actual charger behaviour',
    portCaution: 'MagSafe 3 seating and USB-C charging consistency',
    localContext: 'often brought in soon after impact, travel damage, or charging accidents',
  },
  'macbook-12-2015-2019': {
    slug: 'macbook-12-2015-2019',
    modelName: 'MacBook 12-inch 2015-2019',
    family: 'MacBook',
    generationNote: 'thin 12-inch Intel MacBook',
    chargingContext: 'single USB-C charging behaviour',
    screenCaution: 'very thin lid, hinge feel, and display cable behaviour',
    batteryCaution: 'thin-body battery pressure and single-port charging checks',
    portCaution: 'single USB-C port seating and cable angle behaviour',
    localContext: 'often brought in as a compact travel MacBook',
  },
};

const REPAIR_LABELS: Record<MacBookRepairSlug, string> = {
  'screen-replacement': 'screen replacement',
  'battery-replacement': 'battery replacement',
  'charging-port-replacement': 'charging port repair',
};

const PAGE_KEYS: ReadonlyArray<`${MacBookModelSlug}|${MacBookRepairSlug}`> = [
  'macbook-air-11-2014-2015|screen-replacement',
  'macbook-air-11-2014-2015|battery-replacement',
  'macbook-air-11-2014-2015|charging-port-replacement',
  'macbook-air-13-2014-2017|screen-replacement',
  'macbook-air-13-2014-2017|battery-replacement',
  'macbook-air-13-2014-2017|charging-port-replacement',
  'macbook-air-13-2018-2020|screen-replacement',
  'macbook-air-13-2018-2020|battery-replacement',
  'macbook-air-13-2018-2020|charging-port-replacement',
  'macbook-air-13-m1-2020|screen-replacement',
  'macbook-air-13-m1-2020|battery-replacement',
  'macbook-air-13-m1-2020|charging-port-replacement',
  'macbook-air-m2-13-2022|screen-replacement',
  'macbook-air-m2-13-2022|battery-replacement',
  'macbook-air-m2-13-2022|charging-port-replacement',
  'macbook-air-m2-15-2023|screen-replacement',
  'macbook-air-m2-15-2023|battery-replacement',
  'macbook-air-m2-15-2023|charging-port-replacement',
  'macbook-air-m3-13-2024|screen-replacement',
  'macbook-air-m3-13-2024|battery-replacement',
  'macbook-air-m3-13-2024|charging-port-replacement',
  'macbook-air-m3-15-2024|screen-replacement',
  'macbook-air-m3-15-2024|battery-replacement',
  'macbook-air-m3-15-2024|charging-port-replacement',
  'macbook-pro-13-2014-2015|screen-replacement',
  'macbook-pro-13-2014-2015|battery-replacement',
  'macbook-pro-13-2014-2015|charging-port-replacement',
  'macbook-pro-15-2014-2015|screen-replacement',
  'macbook-pro-15-2014-2015|battery-replacement',
  'macbook-pro-15-2014-2015|charging-port-replacement',
  'macbook-pro-13-2016-2017|screen-replacement',
  'macbook-pro-13-2016-2017|battery-replacement',
  'macbook-pro-13-2016-2017|charging-port-replacement',
  'macbook-pro-15-2016-2017|screen-replacement',
  'macbook-pro-15-2016-2017|battery-replacement',
  'macbook-pro-15-2016-2017|charging-port-replacement',
  'macbook-pro-13-2018-2020|screen-replacement',
  'macbook-pro-13-2018-2020|battery-replacement',
  'macbook-pro-13-2018-2020|charging-port-replacement',
  'macbook-pro-16-2019|screen-replacement',
  'macbook-pro-16-2019|battery-replacement',
  'macbook-pro-16-2019|charging-port-replacement',
  'macbook-pro-13-m1-2020|screen-replacement',
  'macbook-pro-13-m1-2020|battery-replacement',
  'macbook-pro-13-m1-2020|charging-port-replacement',
  'macbook-pro-14-16-m1-pro-max-2021|screen-replacement',
  'macbook-pro-14-16-m1-pro-max-2021|battery-replacement',
  'macbook-pro-14-16-m1-pro-max-2021|charging-port-replacement',
  'macbook-pro-13-m2-2022|screen-replacement',
  'macbook-pro-13-m2-2022|battery-replacement',
  'macbook-pro-13-m2-2022|charging-port-replacement',
  'macbook-pro-14-16-m2-pro-max-2023|screen-replacement',
  'macbook-pro-14-16-m2-pro-max-2023|battery-replacement',
  'macbook-pro-14-16-m2-pro-max-2023|charging-port-replacement',
  'macbook-pro-14-16-m3-pro-max-2024|screen-replacement',
  'macbook-pro-14-16-m3-pro-max-2024|battery-replacement',
  'macbook-pro-14-16-m3-pro-max-2024|charging-port-replacement',
  'macbook-12-2015-2019|screen-replacement',
  'macbook-12-2015-2019|battery-replacement',
  'macbook-12-2015-2019|charging-port-replacement',
];

function isMacBookModelSlug(value: string): value is MacBookModelSlug {
  return Object.prototype.hasOwnProperty.call(MODEL_CONFIGS, value);
}

function isMacBookRepairSlug(value: string): value is MacBookRepairSlug {
  return MACBOOK_REPAIRS.includes(value as MacBookRepairSlug);
}

function resolveMacBookContentModelSlug(value: string): MacBookModelSlug | null {
  if (isMacBookModelSlug(value)) return value;

  return PUBLIC_MACBOOK_MODEL_ALIASES[value as keyof typeof PUBLIC_MACBOOK_MODEL_ALIASES] ?? null;
}

type MacBookPageKey = `${MacBookModelSlug}|${MacBookRepairSlug}`;

const MACBOOK_PAGE_CONTENT = {
  "macbook-air-11-2014-2015|screen-replacement": {
    modelName: "MacBook Air 11-inch 2014-2015",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Air 11-inch 2014-2015 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Cracked or flickering MacBook Air 11-inch 2014-2015? Ringwood assessment covers the lid, panel output, and thin lid edge, hinge movement, and ageing display cable before the quote is confirmed.",
    quickAnswer: "Cracks or lines on the MacBook Air 11-inch 2014-2015 need more than a glass check. We look at the lid edge, hinge movement, image output, and camera area before confirming the screen path.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Start with the symptom, not the part. We test brightness, lines, flicker, external output, and thin lid edges, older hinge movement, and display cable age on this older compact Air chassis.",
bestFor: "Cracked displays, black image, line faults, flicker, or faults that change when the lid moves.",
notes: "Quote, part path, and fit risk are confirmed before approved repair work starts." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Air 11-inch 2014-2015.",
bestFor: "Customers who want the main screen-related functions checked before handover.",
notes: "Any unrelated housing, battery, or board concern is explained separately before extra work." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Air 11-inch 2014-2015 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because thin lid edges, older hinge movement, and display cable age can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this compact Intel Air body can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and thin lid edges, older hinge movement, and display cable age." },
      { step: "02",
title: "Confirm display symptoms",
description: "We test brightness, lines, flicker, external display behaviour, and sleep/wake response where they apply." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Air 11-inch 2014-2015." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Air 11-inch 2014-2015 screen changes as the lid moves?",
        answer: "We test the MacBook Air 11-inch 2014-2015 panel output, lid angle, hinge feel, and thin lid edge, hinge movement, and ageing display cable. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Air 11-inch 2014-2015 screen repair uncover another fault?",
        answer: "Yes. During MacBook Air 11-inch 2014-2015 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Air 11-inch 2014-2015 with an external display?",
        answer: "Where it helps the MacBook Air 11-inch 2014-2015 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Air 11-inch 2014-2015 lid, hinge, frame, and camera area?",
        answer: "Yes. The older Intel Air is checked for thin lid edges and older hinge movement, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Air 11-inch 2014-2015 before screen work?",
        answer: "If the MacBook Air 11-inch 2014-2015 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Air 11-inch 2014-2015 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Air 11-inch 2014-2015 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 11-inch 2014-2015 screen replacement in Ringwood",
      intro: "MacBook Air 11-inch 2014-2015 screen assessment starts with the customer-visible symptom, then checks thin lid edge, hinge movement, and ageing display cable before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the exact Air family and visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how thin lid edges, older hinge movement, and display cable age can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 11-inch 2014-2015 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 11-inch 2014-2015 to Ringwood Square for screen replacement",
      intro: "Ringwood locals usually bring this MacBook Air in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe charger you normally use, especially if the light flickers or the lead has to sit at an angle.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Air 11-inch 2014-2015 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 11-inch 2014-2015 screen replacement?",
      body: "Book the MacBook Air 11-inch 2014-2015 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Air 11-inch 2014-2015 screen replacement.",
        "Tell us if the MacBook Air 11-inch 2014-2015 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Air 11-inch 2014-2015 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-air-11-2014-2015|battery-replacement": {
    modelName: "MacBook Air 11-inch 2014-2015",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Air 11-inch 2014-2015 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Short runtime on a MacBook Air 11-inch 2014-2015? We check battery wear, swelling signs, and MagSafe charger response before confirming the quote.",
    quickAnswer: "If this 11-inch Air drops charge quickly, we check the old battery, MagSafe response, and trackpad pressure before recommending replacement.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "The bench check is practical and model-aware. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and age-related runtime drop, possible cell swelling, and trackpad pressure.",
bestFor: "Short runtime, sudden shutdowns, service warnings, swelling concern, or poor charge hold.",
notes: "Charging response is checked as well, because a power issue is not always only the battery." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this older compact Air chassis, we confirm availability, quote, and the practical handover checks.",
bestFor: "MacBooks with confirmed battery wear and stable charging behaviour.",
notes: "Timing is confirmed after inspection and part availability, not promised before assessment." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Air 11-inch 2014-2015 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check age-related runtime drop, possible cell swelling, and trackpad pressure before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe-era charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Air 11-inch 2014-2015 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We test MagSafe-era charging, inspect for pressure signs, and confirm battery replacement is the right path." },
      { step: "03",
title: "Run handover power checks",
description: "Before handover, we check charging response, startup stability, trackpad feel, and practical battery behaviour." }
    ],
    faq: [
      {
        question: "What makes MacBook Air 11-inch 2014-2015 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe charger response on the MacBook Air 11-inch 2014-2015 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Air 11-inch 2014-2015 for battery service?",
        answer: "Back up important files first if the MacBook Air 11-inch 2014-2015 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Air 11-inch 2014-2015?",
        answer: "Yes. Pressure around the MacBook Air 11-inch 2014-2015 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Air 11-inch 2014-2015 battery wear from charger or board faults?",
        answer: "We test MacBook Air 11-inch 2014-2015 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Air 11-inch 2014-2015 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Air 11-inch 2014-2015 battery replacement?",
        answer: "Back up important files if the MacBook Air 11-inch 2014-2015 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 11-inch 2014-2015 battery replacement in Ringwood",
      intro: "MacBook Air 11-inch 2014-2015 battery diagnosis links real runtime behaviour with MagSafe charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "The MacBook Air generation and outer condition are checked before the quote is confirmed." },
        { title: "Repair risk explained",
description: "We explain how age-related runtime drop, possible cell swelling, and trackpad pressure can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 11-inch 2014-2015 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 11-inch 2014-2015 to Ringwood Square for battery replacement",
      intro: "Ringwood locals usually bring this MacBook Air in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe charger you normally use, especially if the light flickers or the lead has to sit at an angle.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Air 11-inch 2014-2015 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 11-inch 2014-2015 battery replacement?",
      body: "Bring the MacBook Air 11-inch 2014-2015 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Air 11-inch 2014-2015 battery replacement.",
        "Bring the charger used most often with the MacBook Air 11-inch 2014-2015 so power behaviour can be checked properly.",
        "The MacBook Air 11-inch 2014-2015 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-air-11-2014-2015|charging-port-replacement": {
    modelName: "MacBook Air 11-inch 2014-2015",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Air 11-inch 2014-2015 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "Loose or unreliable charging on MacBook Air 11-inch 2014-2015? We test the MagSafe charger, connector fit, battery response, and port area before quoting.",
    quickAnswer: "If the MagSafe lead only works at a certain angle, we inspect the connector, adapter response, and battery behaviour before quoting.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We keep the diagnosis plain and tied to how you use the MacBook. We test known-good charging gear, inspect debris or damage, and check MagSafe seating, adapter light behaviour, and left-side I/O wear.",
bestFor: "No charge response, loose cable fit, charging at one angle, or intermittent power.",
notes: "If the cable, adapter, or debris is the cause, we do not push unnecessary port work." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Air 11-inch 2014-2015 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Repeated charger dropouts, unstable power delivery, or visible connector wear.",
notes: "A port repair is not promised to fix board-level or battery-related no-power faults." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Air 11-inch 2014-2015 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "The cause can be the adapter, cable, battery, port, or deeper power path, so we test before quoting." },
      { title: "Loose or unreliable fit",
description: "MagSafe seating, adapter light behaviour, and left-side I/O wear can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe seating, adapter light behaviour, and left-side I/O wear." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe-era charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Air 11-inch 2014-2015." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Air 11-inch 2014-2015 charging fault is the port or the charger?",
        answer: "We test the MacBook Air 11-inch 2014-2015 with known-good gear, inspect MagSafe seating and adapter-light behaviour, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Air 11-inch 2014-2015 for charging repair?",
        answer: "Bring the MagSafe charger you normally use, especially if the light flickers or the lead has to sit at an angle. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Air 11-inch 2014-2015 port works but another does not?",
        answer: "We compare the available charging points for this older Intel Air and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Air 11-inch 2014-2015?",
        answer: "For this MagSafe-era model, adapter fit and connector behaviour matter during diagnosis."
      },
      {
        question: "Can debris or physical damage stop the MacBook Air 11-inch 2014-2015 charging?",
        answer: "Yes. We check the MacBook Air 11-inch 2014-2015 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Air 11-inch 2014-2015 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Air 11-inch 2014-2015 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 11-inch 2014-2015 charging port repair in Ringwood",
      intro: "MacBook Air 11-inch 2014-2015 charging repair is scoped from the charger setup first, then MagSafe seating and adapter-light behaviour, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We identify the Air model first, then inspect visible damage before quoting." },
        { title: "Repair risk explained",
description: "We explain how MagSafe seating, adapter light behaviour, and left-side I/O wear can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 11-inch 2014-2015 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 11-inch 2014-2015 to Ringwood Square for charging port repair",
      intro: "Ringwood locals usually bring this MacBook Air in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the MagSafe charger you normally use, especially if the light flickers or the lead has to sit at an angle.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Air 11-inch 2014-2015 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 11-inch 2014-2015 charging port repair?",
      body: "Bring the MacBook Air 11-inch 2014-2015 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Air 11-inch 2014-2015 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Air 11-inch 2014-2015 charging fault.",
        "The MacBook Air 11-inch 2014-2015 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-air-13-2014-2017|screen-replacement": {
    modelName: "MacBook Air 13-inch 2014-2017",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Air 13-inch 2014-2017 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Lines, black image, or lid-angle faults on a MacBook Air 13-inch 2014-2017 are checked against housing condition and display behaviour before repair approval.",
    quickAnswer: "If your MacBook Air 13-inch 2014-2017 flickers when the lid moves, bring it in open if possible. We compare the visible fault with lid alignment, hinge looseness, and display-cable age before quoting.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Before quoting, we separate the visible fault from the cause. We test brightness, lines, flicker, external output, and lid alignment, hinge looseness, and display cable age on this classic Air chassis.",
bestFor: "Screens with cracks, dark sections, display lines, flicker, or lid-angle cut-outs.",
notes: "We confirm the quote, suitable part path, and any fit concern before work begins." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Air 13-inch 2014-2017.",
bestFor: "Useful when you want display, camera-area, and lid behaviour checked before handover.",
notes: "If another housing, battery, or board issue appears, we explain it before extra work is considered." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Air 13-inch 2014-2017 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because lid alignment, hinge looseness, and display cable age can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this classic Intel Air design can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and lid alignment, hinge looseness, and display cable age." },
      { step: "02",
title: "Confirm display symptoms",
description: "Display output, brightness control, flicker, lines, external monitor behaviour, and sleep/wake response are checked." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Air 13-inch 2014-2017." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Air 13-inch 2014-2017 screen changes as the lid moves?",
        answer: "We test the MacBook Air 13-inch 2014-2017 panel output, lid angle, hinge feel, and lid alignment, hinge looseness, and display-cable age. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Air 13-inch 2014-2017 screen repair uncover another fault?",
        answer: "Yes. During MacBook Air 13-inch 2014-2017 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Air 13-inch 2014-2017 with an external display?",
        answer: "Where it helps the MacBook Air 13-inch 2014-2017 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Air 13-inch 2014-2017 lid, hinge, frame, and camera area?",
        answer: "Yes. The classic Intel Air is checked for lid alignment and display-cable age, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Air 13-inch 2014-2017 before screen work?",
        answer: "If the MacBook Air 13-inch 2014-2017 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Air 13-inch 2014-2017 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Air 13-inch 2014-2017 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 13-inch 2014-2017 screen replacement in Ringwood",
      intro: "MacBook Air 13-inch 2014-2017 screen assessment starts with the customer-visible symptom, then checks lid alignment, hinge looseness, and display-cable age before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "Model family, housing condition, and symptoms are matched before pricing is confirmed." },
        { title: "Repair risk explained",
description: "We explain how lid alignment, hinge looseness, and display cable age can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 13-inch 2014-2017 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 13-inch 2014-2017 to Ringwood Square for screen replacement",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe adapter and mention if charging changes when the lead is moved.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Air 13-inch 2014-2017 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 13-inch 2014-2017 screen replacement?",
      body: "Book the MacBook Air 13-inch 2014-2017 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Air 13-inch 2014-2017 screen replacement.",
        "Tell us if the MacBook Air 13-inch 2014-2017 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Air 13-inch 2014-2017 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-air-13-2014-2017|battery-replacement": {
    modelName: "MacBook Air 13-inch 2014-2017",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Air 13-inch 2014-2017 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Battery replacement for MacBook Air 13-inch 2014-2017 is scoped after runtime, shutdown, charger, and top-case pressure checks.",
    quickAnswer: "A classic 13-inch Air can keep working for years with a tired battery. We test charge hold, swelling signs, and MagSafe behaviour first.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "A quick look is not enough for this repair path. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and older battery age, charge hold, and swollen-cell pressure.",
bestFor: "Fast battery drain, shutdowns under load, warning messages, or pressure around the trackpad.",
notes: "We test the charger behaviour too, so a cable or port issue is not mistaken for battery wear." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this classic Air chassis, we confirm availability, quote, and the practical handover checks.",
bestFor: "Battery-wear cases where the charger and port response look stable.",
notes: "We confirm timing once the MacBook has been checked and the part path is known." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Air 13-inch 2014-2017 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check older battery age, charge hold, and swollen-cell pressure before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe-era charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Air 13-inch 2014-2017 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We test MagSafe-era charging, inspect for pressure signs, and confirm battery replacement is the right path." },
      { step: "03",
title: "Run handover power checks",
description: "Handover checks cover charging response, startup behaviour, trackpad feel, and basic battery stability." }
    ],
    faq: [
      {
        question: "What makes MacBook Air 13-inch 2014-2017 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe charger response on the MacBook Air 13-inch 2014-2017 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Air 13-inch 2014-2017 for battery service?",
        answer: "Back up important files first if the MacBook Air 13-inch 2014-2017 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Air 13-inch 2014-2017?",
        answer: "Yes. Pressure around the MacBook Air 13-inch 2014-2017 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Air 13-inch 2014-2017 battery wear from charger or board faults?",
        answer: "We test MacBook Air 13-inch 2014-2017 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Air 13-inch 2014-2017 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Air 13-inch 2014-2017 battery replacement?",
        answer: "Back up important files if the MacBook Air 13-inch 2014-2017 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 13-inch 2014-2017 battery replacement in Ringwood",
      intro: "MacBook Air 13-inch 2014-2017 battery diagnosis links real runtime behaviour with MagSafe charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm which Air generation is on the bench before giving the repair path." },
        { title: "Repair risk explained",
description: "We explain how older battery age, charge hold, and swollen-cell pressure can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 13-inch 2014-2017 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 13-inch 2014-2017 to Ringwood Square for battery replacement",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe adapter and mention if charging changes when the lead is moved.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Air 13-inch 2014-2017 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 13-inch 2014-2017 battery replacement?",
      body: "Bring the MacBook Air 13-inch 2014-2017 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Air 13-inch 2014-2017 battery replacement.",
        "Bring the charger used most often with the MacBook Air 13-inch 2014-2017 so power behaviour can be checked properly.",
        "The MacBook Air 13-inch 2014-2017 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-air-13-2014-2017|charging-port-replacement": {
    modelName: "MacBook Air 13-inch 2014-2017",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Air 13-inch 2014-2017 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "MacBook Air 13-inch 2014-2017 charging faults are checked for adapter, cable, port, and battery causes before repair approval.",
    quickAnswer: "Classic Air charging faults can be charger, connector, or battery related. We test the MagSafe setup before recommending repair.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We check the obvious fault and the nearby risks first. We test known-good charging gear, inspect debris or damage, and check MagSafe connector fit, adapter condition, and left-side port wear.",
bestFor: "MacBooks with no charge, wobbly cable fit, or power that cuts in and out.",
notes: "When a charger or cleaning fix explains the fault, we keep the repair scope smaller." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Air 13-inch 2014-2017 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Charging faults that keep returning after cable and adapter checks.",
notes: "Board-level or battery-related no-power faults are explained separately from port repair." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Air 13-inch 2014-2017 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "A no-charge fault can come from several places, so charger, cable, battery, and port checks come first." },
      { title: "Loose or unreliable fit",
description: "MagSafe connector fit, adapter condition, and left-side port wear can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe connector fit, adapter condition, and left-side port wear." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe-era charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Air 13-inch 2014-2017." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Air 13-inch 2014-2017 charging fault is the port or the charger?",
        answer: "We test the MacBook Air 13-inch 2014-2017 with known-good gear, inspect MagSafe fit and the left-side port area, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Air 13-inch 2014-2017 for charging repair?",
        answer: "Bring the MagSafe adapter and mention if charging changes when the lead is moved. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Air 13-inch 2014-2017 port works but another does not?",
        answer: "We compare the available charging points for this classic Intel Air and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Air 13-inch 2014-2017?",
        answer: "For this MagSafe-era model, adapter fit and connector behaviour matter during diagnosis."
      },
      {
        question: "Can debris or physical damage stop the MacBook Air 13-inch 2014-2017 charging?",
        answer: "Yes. We check the MacBook Air 13-inch 2014-2017 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Air 13-inch 2014-2017 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Air 13-inch 2014-2017 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 13-inch 2014-2017 charging port repair in Ringwood",
      intro: "MacBook Air 13-inch 2014-2017 charging repair is scoped from the charger setup first, then MagSafe fit and the left-side port area, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "The visible condition and model family are checked together before the repair path is set." },
        { title: "Repair risk explained",
description: "We explain how MagSafe connector fit, adapter condition, and left-side port wear can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 13-inch 2014-2017 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 13-inch 2014-2017 to Ringwood Square for charging port repair",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the MagSafe adapter and mention if charging changes when the lead is moved.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Air 13-inch 2014-2017 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 13-inch 2014-2017 charging port repair?",
      body: "Bring the MacBook Air 13-inch 2014-2017 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Air 13-inch 2014-2017 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Air 13-inch 2014-2017 charging fault.",
        "The MacBook Air 13-inch 2014-2017 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-air-13-2018-2020|screen-replacement": {
    modelName: "MacBook Air 13-inch 2018-2020",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Air 13-inch 2018-2020 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Display trouble on this USB-C Intel Air gets a bench check for image output, hinge movement, and nearby camera-area behaviour before pricing is confirmed.",
    quickAnswer: "A Retina Air screen that cuts out can come from panel damage or movement around the lid. We test both before approving screen work.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Start with the symptom, not the part. We test brightness, lines, flicker, external output, and Retina output, lid-angle symptoms, and hinge feel on this Retina Intel Air platform.",
bestFor: "MacBooks showing panel cracks, no image, coloured lines, flicker, or movement-related faults.",
notes: "The repair scope, quote, and lid-fit risk are explained before approval." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Air 13-inch 2018-2020.",
bestFor: "For customers who want the visible screen functions retested before handover.",
notes: "Separate faults are reported before we discuss any extra repair scope." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Air 13-inch 2018-2020 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because Retina output, lid-angle symptoms, and hinge feel can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this Retina Intel Air design can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and Retina output, lid-angle symptoms, and hinge feel." },
      { step: "02",
title: "Confirm display symptoms",
description: "We compare the built-in screen with external output, then check brightness, lines, flicker, and sleep/wake behaviour." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Air 13-inch 2018-2020." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Air 13-inch 2018-2020 screen changes as the lid moves?",
        answer: "We test the MacBook Air 13-inch 2018-2020 panel output, lid angle, hinge feel, and Retina output, lid-angle symptoms, and hinge feel. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Air 13-inch 2018-2020 screen repair uncover another fault?",
        answer: "Yes. During MacBook Air 13-inch 2018-2020 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Air 13-inch 2018-2020 with an external display?",
        answer: "Where it helps the MacBook Air 13-inch 2018-2020 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Air 13-inch 2018-2020 lid, hinge, frame, and camera area?",
        answer: "Yes. The USB-C Intel Air is checked for Retina output and lid-angle behaviour, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Air 13-inch 2018-2020 before screen work?",
        answer: "If the MacBook Air 13-inch 2018-2020 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Air 13-inch 2018-2020 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Air 13-inch 2018-2020 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 13-inch 2018-2020 screen replacement in Ringwood",
      intro: "MacBook Air 13-inch 2018-2020 screen assessment starts with the customer-visible symptom, then checks Retina output, lid-angle symptoms, and hinge feel before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the exact Air family and visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how Retina output, lid-angle symptoms, and hinge feel can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 13-inch 2018-2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 13-inch 2018-2020 to Ringwood Square for screen replacement",
      intro: "This USB-C Intel Air often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the USB-C cable and charger that reproduce the issue, not just a spare one.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Air 13-inch 2018-2020 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 13-inch 2018-2020 screen replacement?",
      body: "Book the MacBook Air 13-inch 2018-2020 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Air 13-inch 2018-2020 screen replacement.",
        "Tell us if the MacBook Air 13-inch 2018-2020 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Air 13-inch 2018-2020 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-air-13-2018-2020|battery-replacement": {
    modelName: "MacBook Air 13-inch 2018-2020",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Air 13-inch 2018-2020 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Ringwood battery help for this USB-C Intel Air, with power testing before any approved replacement work begins.",
    quickAnswer: "On the Retina Intel Air, poor runtime can be battery wear or USB-C charging trouble. We separate those before quoting.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "The bench check is practical and model-aware. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and battery condition alongside USB-C charging response.",
bestFor: "MacBooks with poor charge hold, unexpected shutdowns, swelling signs, or battery warnings.",
notes: "The charger and port response are checked before we treat the battery as the confirmed fault." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this Retina Intel Air platform, we confirm availability, quote, and the practical handover checks.",
bestFor: "MacBooks where inspection points to battery wear rather than charger trouble.",
notes: "Turnaround is discussed after inspection and availability checks." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Air 13-inch 2018-2020 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check battery condition alongside USB-C charging response before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Air 13-inch 2018-2020 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We test USB-C charging, inspect for pressure signs, and confirm battery replacement is the right path." },
      { step: "03",
title: "Run handover power checks",
description: "We retest startup, charging response, trackpad feel, and normal battery behaviour before handover." }
    ],
    faq: [
      {
        question: "What makes MacBook Air 13-inch 2018-2020 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and USB-C charger response on the MacBook Air 13-inch 2018-2020 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Air 13-inch 2018-2020 for battery service?",
        answer: "Back up important files first if the MacBook Air 13-inch 2018-2020 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Air 13-inch 2018-2020?",
        answer: "Yes. Pressure around the MacBook Air 13-inch 2018-2020 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Air 13-inch 2018-2020 battery wear from charger or board faults?",
        answer: "We test MacBook Air 13-inch 2018-2020 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Air 13-inch 2018-2020 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Air 13-inch 2018-2020 battery replacement?",
        answer: "Back up important files if the MacBook Air 13-inch 2018-2020 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 13-inch 2018-2020 battery replacement in Ringwood",
      intro: "MacBook Air 13-inch 2018-2020 battery diagnosis links real runtime behaviour with USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "The MacBook Air generation and outer condition are checked before the quote is confirmed." },
        { title: "Repair risk explained",
description: "We explain how battery condition alongside USB-C charging response can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 13-inch 2018-2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 13-inch 2018-2020 to Ringwood Square for battery replacement",
      intro: "This USB-C Intel Air often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the USB-C cable and charger that reproduce the issue, not just a spare one.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Air 13-inch 2018-2020 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 13-inch 2018-2020 battery replacement?",
      body: "Bring the MacBook Air 13-inch 2018-2020 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Air 13-inch 2018-2020 battery replacement.",
        "Bring the charger used most often with the MacBook Air 13-inch 2018-2020 so power behaviour can be checked properly.",
        "The MacBook Air 13-inch 2018-2020 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-air-13-2018-2020|charging-port-replacement": {
    modelName: "MacBook Air 13-inch 2018-2020",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Air 13-inch 2018-2020 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "Ringwood charging-port help for this USB-C Intel Air, with cable-angle and power-response checks before parts are considered.",
    quickAnswer: "For this USB-C Air, cable fit and adapter behaviour are checked before a charging-port repair is approved.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We keep the diagnosis plain and tied to how you use the MacBook. We test known-good charging gear, inspect debris or damage, and check USB-C seating and cable-angle behaviour.",
bestFor: "Charging faults where cable movement changes the connection.",
notes: "If testing points to the cable, adapter, or debris, we explain that before quoting port work." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Air 13-inch 2018-2020 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Cases where the connector feels worn or power delivery is unstable.",
notes: "We do not treat port replacement as a guaranteed fix for deeper power faults." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Air 13-inch 2018-2020 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "We test the simple causes before quoting because the issue may not be the port itself." },
      { title: "Loose or unreliable fit",
description: "USB-C seating and cable-angle behaviour can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and USB-C seating and cable-angle behaviour." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and USB-C charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Air 13-inch 2018-2020." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Air 13-inch 2018-2020 charging fault is the port or the charger?",
        answer: "We test the MacBook Air 13-inch 2018-2020 with known-good gear, inspect USB-C seating and cable-angle behaviour, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Air 13-inch 2018-2020 for charging repair?",
        answer: "Bring the USB-C cable and charger that reproduce the issue, not just a spare one. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Air 13-inch 2018-2020 port works but another does not?",
        answer: "We compare the available charging points for this USB-C Intel Air and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Air 13-inch 2018-2020?",
        answer: "For this USB-C model, cable orientation, adapter behaviour, and port fit are compared before quoting."
      },
      {
        question: "Can debris or physical damage stop the MacBook Air 13-inch 2018-2020 charging?",
        answer: "Yes. We check the MacBook Air 13-inch 2018-2020 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Air 13-inch 2018-2020 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Air 13-inch 2018-2020 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 13-inch 2018-2020 charging port repair in Ringwood",
      intro: "MacBook Air 13-inch 2018-2020 charging repair is scoped from the charger setup first, then USB-C seating and cable-angle behaviour, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We identify the Air model first, then inspect visible damage before quoting." },
        { title: "Repair risk explained",
description: "We explain how USB-C seating and cable-angle behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 13-inch 2018-2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 13-inch 2018-2020 to Ringwood Square for charging port repair",
      intro: "This USB-C Intel Air often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the USB-C cable and charger that reproduce the issue, not just a spare one.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Air 13-inch 2018-2020 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 13-inch 2018-2020 charging port repair?",
      body: "Bring the MacBook Air 13-inch 2018-2020 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Air 13-inch 2018-2020 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Air 13-inch 2018-2020 charging fault.",
        "The MacBook Air 13-inch 2018-2020 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-air-13-m1-2020|screen-replacement": {
    modelName: "MacBook Air 13-inch M1 2020",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Air 13-inch M1 2020 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "A dropped MacBook Air 13-inch M1 2020 can hide more than glass damage; we inspect the lid fit, panel symptoms, and startup response first.",
    quickAnswer: "On the M1 Air, a dark or lined display is checked with startup and sleep/wake behaviour so the repair is not guessed from the crack alone.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Before quoting, we separate the visible fault from the cause. We test brightness, lines, flicker, external output, and display assembly symptoms with Apple-silicon startup checks on this M1 Air platform.",
bestFor: "Display faults where damage, lines, black image, or lid movement affects normal use.",
notes: "Part availability, quoted scope, and fit risk are checked before the MacBook is opened." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Air 13-inch M1 2020.",
bestFor: "Helpful when the display fault affected normal work and you want handover checks done.",
notes: "A screen repair does not hide other issues; we explain unrelated findings before proceeding." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Air 13-inch M1 2020 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because display assembly symptoms with Apple-silicon startup checks can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this Apple-silicon Air platform can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and display assembly symptoms with Apple-silicon startup checks." },
      { step: "02",
title: "Confirm display symptoms",
description: "The display check covers image output, brightness changes, line faults, flicker, and lid-related sleep or wake response." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Air 13-inch M1 2020." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Air 13-inch M1 2020 screen changes as the lid moves?",
        answer: "We test the MacBook Air 13-inch M1 2020 panel output, lid angle, hinge feel, and display output with Apple-silicon startup checks. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Air 13-inch M1 2020 screen repair uncover another fault?",
        answer: "Yes. During MacBook Air 13-inch M1 2020 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Air 13-inch M1 2020 with an external display?",
        answer: "Where it helps the MacBook Air 13-inch M1 2020 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Air 13-inch M1 2020 lid, hinge, frame, and camera area?",
        answer: "Yes. The Apple-silicon Air is checked for Apple-silicon startup and display-output checks, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Air 13-inch M1 2020 before screen work?",
        answer: "If the MacBook Air 13-inch M1 2020 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Air 13-inch M1 2020 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Air 13-inch M1 2020 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 13-inch M1 2020 screen replacement in Ringwood",
      intro: "MacBook Air 13-inch M1 2020 screen assessment starts with the customer-visible symptom, then checks display output with Apple-silicon startup checks before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "Model family, housing condition, and symptoms are matched before pricing is confirmed." },
        { title: "Repair risk explained",
description: "We explain how display assembly symptoms with Apple-silicon startup checks can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 13-inch M1 2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 13-inch M1 2020 to Ringwood Square for screen replacement",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the charger setup that gave the warning, plus the MacBook if it still powers on.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Air 13-inch M1 2020 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 13-inch M1 2020 screen replacement?",
      body: "Book the MacBook Air 13-inch M1 2020 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Air 13-inch M1 2020 screen replacement.",
        "Tell us if the MacBook Air 13-inch M1 2020 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Air 13-inch M1 2020 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-air-13-m1-2020|battery-replacement": {
    modelName: "MacBook Air 13-inch M1 2020",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Air 13-inch M1 2020 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "A MacBook Air 13-inch M1 2020 that drains quickly or shuts down is checked against charging behaviour before the battery path is confirmed.",
    quickAnswer: "The M1 Air is efficient, so sudden runtime changes are worth checking properly against charger response and shutdown history.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "A quick look is not enough for this repair path. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and runtime changes on an efficient M1 Air.",
bestFor: "Battery complaints involving short runtime, heat, shutdowns, or possible top-case pressure.",
notes: "We include charging checks before recommending battery replacement." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this M1 Air platform, we confirm availability, quote, and the practical handover checks.",
bestFor: "Confirmed battery faults after charging response has been checked.",
notes: "We do not promise timing until the repair scope and parts are confirmed." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Air 13-inch M1 2020 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check runtime changes on an efficient M1 Air before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Air 13-inch M1 2020 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "USB-C charging response and pressure signs are checked before battery replacement is approved." },
      { step: "03",
title: "Run handover power checks",
description: "Final checks include charge response, stable startup, trackpad feel, and day-to-day battery behaviour." }
    ],
    faq: [
      {
        question: "What makes MacBook Air 13-inch M1 2020 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and USB-C charger response on the MacBook Air 13-inch M1 2020 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Air 13-inch M1 2020 for battery service?",
        answer: "Back up important files first if the MacBook Air 13-inch M1 2020 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Air 13-inch M1 2020?",
        answer: "Yes. Pressure around the MacBook Air 13-inch M1 2020 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Air 13-inch M1 2020 battery wear from charger or board faults?",
        answer: "We test MacBook Air 13-inch M1 2020 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Air 13-inch M1 2020 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Air 13-inch M1 2020 battery replacement?",
        answer: "Back up important files if the MacBook Air 13-inch M1 2020 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 13-inch M1 2020 battery replacement in Ringwood",
      intro: "MacBook Air 13-inch M1 2020 battery diagnosis links real runtime behaviour with USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm which Air generation is on the bench before giving the repair path." },
        { title: "Repair risk explained",
description: "We explain how runtime changes on an efficient M1 Air can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 13-inch M1 2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 13-inch M1 2020 to Ringwood Square for battery replacement",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the charger setup that gave the warning, plus the MacBook if it still powers on.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Air 13-inch M1 2020 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 13-inch M1 2020 battery replacement?",
      body: "Bring the MacBook Air 13-inch M1 2020 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Air 13-inch M1 2020 battery replacement.",
        "Bring the charger used most often with the MacBook Air 13-inch M1 2020 so power behaviour can be checked properly.",
        "The MacBook Air 13-inch M1 2020 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-air-13-m1-2020|charging-port-replacement": {
    modelName: "MacBook Air 13-inch M1 2020",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Air 13-inch M1 2020 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "A MacBook Air 13-inch M1 2020 that only charges at one angle needs connector, charger, and battery testing before repair is approved.",
    quickAnswer: "The M1 Air charging path is tested with known-good USB-C gear so we can separate cable faults from port issues.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We check the obvious fault and the nearby risks first. We test known-good charging gear, inspect debris or damage, and check USB-C response on both cable orientation and adapter combinations.",
bestFor: "Loose fit, no charging light or response, and unreliable power delivery.",
notes: "We avoid port replacement when cleaning or charger testing resolves the symptom." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Air 13-inch M1 2020 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "MacBooks with repeated dropouts after known-good charging gear is tested.",
notes: "If the fault sits beyond the port, we explain that before work continues." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Air 13-inch M1 2020 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "Adapter, cable, battery, connector, and power-path faults are separated during diagnosis." },
      { title: "Loose or unreliable fit",
description: "USB-C response on both cable orientation and adapter combinations can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and USB-C response on both cable orientation and adapter combinations." },
      { step: "02",
title: "Test known-good gear",
description: "We compare USB-C cable fit, adapter behaviour, and charging response before quoting." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Air 13-inch M1 2020." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Air 13-inch M1 2020 charging fault is the port or the charger?",
        answer: "We test the MacBook Air 13-inch M1 2020 with known-good gear, inspect USB-C response with different cable orientations, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Air 13-inch M1 2020 for charging repair?",
        answer: "Bring the charger setup that gave the warning, plus the MacBook if it still powers on. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Air 13-inch M1 2020 port works but another does not?",
        answer: "We compare the available charging points for this Apple-silicon Air and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Air 13-inch M1 2020?",
        answer: "For this USB-C model, cable orientation, adapter behaviour, and port fit are compared before quoting."
      },
      {
        question: "Can debris or physical damage stop the MacBook Air 13-inch M1 2020 charging?",
        answer: "Yes. We check the MacBook Air 13-inch M1 2020 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Air 13-inch M1 2020 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Air 13-inch M1 2020 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air 13-inch M1 2020 charging port repair in Ringwood",
      intro: "MacBook Air 13-inch M1 2020 charging repair is scoped from the charger setup first, then USB-C response with different cable orientations, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "The visible condition and model family are checked together before the repair path is set." },
        { title: "Repair risk explained",
description: "We explain how USB-C response on both cable orientation and adapter combinations can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air 13-inch M1 2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air 13-inch M1 2020 to Ringwood Square for charging port repair",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the charger setup that gave the warning, plus the MacBook if it still powers on.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Air 13-inch M1 2020 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air 13-inch M1 2020 charging port repair?",
      body: "Bring the MacBook Air 13-inch M1 2020 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Air 13-inch M1 2020 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Air 13-inch M1 2020 charging fault.",
        "The MacBook Air 13-inch M1 2020 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-air-m2-13-2022|screen-replacement": {
    modelName: "MacBook Air M2 13-inch 2022",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Air M2 13-inch 2022 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Ringwood screen help for MacBook Air M2 13-inch 2022, with careful checks for thin lid condition and the camera-notch area, display output, and practical handover testing.",
    quickAnswer: "The M2 Air's thin lid makes pressure marks worth checking. We inspect the panel, camera-notch area, and hinge feel before confirming the quote.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Start with the symptom, not the part. We test brightness, lines, flicker, external output, and thin lid condition and the camera-notch area on this M2 thin-body Air.",
bestFor: "Cracked panels, unstable image, flickering output, or screen faults linked to lid position.",
notes: "You get the quote and screen-fit notes before approved repair work starts." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Air M2 13-inch 2022.",
bestFor: "For MacBooks where screen output, lid feel, and startup need one final check.",
notes: "If testing shows another fault, we separate it from the approved screen work." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Air M2 13-inch 2022 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because thin lid condition and the camera-notch area can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this thin Apple-silicon Air redesign can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and thin lid condition and the camera-notch area." },
      { step: "02",
title: "Confirm display symptoms",
description: "We look at screen image, backlight behaviour, flicker, external display output, and whether sleep/wake acts normally." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Air M2 13-inch 2022." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Air M2 13-inch 2022 screen changes as the lid moves?",
        answer: "We test the MacBook Air M2 13-inch 2022 panel output, lid angle, hinge feel, and thin lid condition and the camera-notch area. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Air M2 13-inch 2022 screen repair uncover another fault?",
        answer: "Yes. During MacBook Air M2 13-inch 2022 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Air M2 13-inch 2022 with an external display?",
        answer: "Where it helps the MacBook Air M2 13-inch 2022 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Air M2 13-inch 2022 lid, hinge, frame, and camera area?",
        answer: "Yes. The thin Apple-silicon Air is checked for thin lid condition and camera-notch area, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Air M2 13-inch 2022 before screen work?",
        answer: "If the MacBook Air M2 13-inch 2022 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Air M2 13-inch 2022 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Air M2 13-inch 2022 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M2 13-inch 2022 screen replacement in Ringwood",
      intro: "MacBook Air M2 13-inch 2022 screen assessment starts with the customer-visible symptom, then checks thin lid condition and the camera-notch area before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the exact Air family and visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how thin lid condition and the camera-notch area can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M2 13-inch 2022 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M2 13-inch 2022 to Ringwood Square for screen replacement",
      intro: "Because this is thin M2 Air often carried between work, school, and travel, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe lead and any USB-C charger involved so both charging paths can be checked.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Air M2 13-inch 2022 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M2 13-inch 2022 screen replacement?",
      body: "Book the MacBook Air M2 13-inch 2022 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Air M2 13-inch 2022 screen replacement.",
        "Tell us if the MacBook Air M2 13-inch 2022 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Air M2 13-inch 2022 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-air-m2-13-2022|battery-replacement": {
    modelName: "MacBook Air M2 13-inch 2022",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Air M2 13-inch 2022 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Battery symptoms on MacBook Air M2 13-inch 2022 are compared with adapter response and practical startup behaviour before quoting.",
    quickAnswer: "For the M2 13-inch Air, we compare battery symptoms with MagSafe 3 and USB-C response before approving replacement.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "The bench check is practical and model-aware. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and battery runtime against MagSafe 3 and USB-C charging response.",
bestFor: "Customers seeing runtime drops, charging percentage jumps, or swelling concerns.",
notes: "Battery work is not approved until charging response has been checked." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this M2 thin-body Air, we confirm availability, quote, and the practical handover checks.",
bestFor: "Battery replacement cases with no obvious separate charging fault.",
notes: "Availability and condition decide timing, so we confirm that after assessment." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Air M2 13-inch 2022 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check battery runtime against MagSafe 3 and USB-C charging response before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe 3 and USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Air M2 13-inch 2022 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We test MagSafe 3 and USB-C charging, inspect for pressure signs, and confirm battery replacement is the right path." },
      { step: "03",
title: "Run handover power checks",
description: "The MacBook is checked for startup stability, charging response, trackpad pressure, and practical runtime behaviour." }
    ],
    faq: [
      {
        question: "What makes MacBook Air M2 13-inch 2022 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe 3 or USB-C charger response on the MacBook Air M2 13-inch 2022 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Air M2 13-inch 2022 for battery service?",
        answer: "Back up important files first if the MacBook Air M2 13-inch 2022 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Air M2 13-inch 2022?",
        answer: "Yes. Pressure around the MacBook Air M2 13-inch 2022 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Air M2 13-inch 2022 battery wear from charger or board faults?",
        answer: "We test MacBook Air M2 13-inch 2022 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Air M2 13-inch 2022 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe 3 and USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Air M2 13-inch 2022 battery replacement?",
        answer: "Back up important files if the MacBook Air M2 13-inch 2022 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M2 13-inch 2022 battery replacement in Ringwood",
      intro: "MacBook Air M2 13-inch 2022 battery diagnosis links real runtime behaviour with MagSafe 3 or USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "The MacBook Air generation and outer condition are checked before the quote is confirmed." },
        { title: "Repair risk explained",
description: "We explain how battery runtime against MagSafe 3 and USB-C charging response can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M2 13-inch 2022 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M2 13-inch 2022 to Ringwood Square for battery replacement",
      intro: "Because this is thin M2 Air often carried between work, school, and travel, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe lead and any USB-C charger involved so both charging paths can be checked.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Air M2 13-inch 2022 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M2 13-inch 2022 battery replacement?",
      body: "Bring the MacBook Air M2 13-inch 2022 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Air M2 13-inch 2022 battery replacement.",
        "Bring the charger used most often with the MacBook Air M2 13-inch 2022 so power behaviour can be checked properly.",
        "The MacBook Air M2 13-inch 2022 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-air-m2-13-2022|charging-port-replacement": {
    modelName: "MacBook Air M2 13-inch 2022",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Air M2 13-inch 2022 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "MacBook Air M2 13-inch 2022 USB-C charging issues are separated from battery faults and accessory problems before quoting.",
    quickAnswer: "On the M2 Air, both MagSafe 3 and USB-C behaviour matter. We check each path before confirming the scope.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We keep the diagnosis plain and tied to how you use the MacBook. We test known-good charging gear, inspect debris or damage, and check MagSafe 3 seating plus USB-C port behaviour.",
bestFor: "Intermittent charging, angle-sensitive cables, or ports that feel worn.",
notes: "A cable or adapter fault is separated from true port damage before repair is approved." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Air M2 13-inch 2022 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Visible connector wear, poor cable hold, or unstable charging response.",
notes: "Battery and board faults need separate assessment from connector repair." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Air M2 13-inch 2022 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "No-power symptoms need testing before we name the port as the repair path." },
      { title: "Loose or unreliable fit",
description: "MagSafe 3 seating plus USB-C port behaviour can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe 3 seating plus USB-C port behaviour." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe 3 and USB-C charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Air M2 13-inch 2022." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Air M2 13-inch 2022 charging fault is the port or the charger?",
        answer: "We test the MacBook Air M2 13-inch 2022 with known-good gear, inspect MagSafe 3 seating plus USB-C port behaviour, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Air M2 13-inch 2022 for charging repair?",
        answer: "Bring the MagSafe lead and any USB-C charger involved so both charging paths can be checked. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Air M2 13-inch 2022 port works but another does not?",
        answer: "We compare the available charging points for this thin Apple-silicon Air and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Air M2 13-inch 2022?",
        answer: "Because this model can involve MagSafe 3 and USB-C charging, we check both paths when your symptoms point that way."
      },
      {
        question: "Can debris or physical damage stop the MacBook Air M2 13-inch 2022 charging?",
        answer: "Yes. We check the MacBook Air M2 13-inch 2022 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Air M2 13-inch 2022 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Air M2 13-inch 2022 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M2 13-inch 2022 charging port repair in Ringwood",
      intro: "MacBook Air M2 13-inch 2022 charging repair is scoped from the charger setup first, then MagSafe 3 seating plus USB-C port behaviour, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We identify the Air model first, then inspect visible damage before quoting." },
        { title: "Repair risk explained",
description: "We explain how MagSafe 3 seating plus USB-C port behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M2 13-inch 2022 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M2 13-inch 2022 to Ringwood Square for charging port repair",
      intro: "Because this is thin M2 Air often carried between work, school, and travel, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the MagSafe lead and any USB-C charger involved so both charging paths can be checked.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Air M2 13-inch 2022 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M2 13-inch 2022 charging port repair?",
      body: "Bring the MacBook Air M2 13-inch 2022 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Air M2 13-inch 2022 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Air M2 13-inch 2022 charging fault.",
        "The MacBook Air M2 13-inch 2022 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-air-m2-15-2023|screen-replacement": {
    modelName: "MacBook Air M2 15-inch 2023",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Air M2 15-inch 2023 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Screen repair for the MacBook Air M2 15-inch 2023 starts with the fault you can see, then checks lid pressure and related display functions before quoting.",
    quickAnswer: "For the 15-inch Air, lid pressure can spread across a wider panel. We check image output and alignment before any approved replacement.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Before quoting, we separate the visible fault from the cause. We test brightness, lines, flicker, external output, and wide thin-lid pressure and hinge alignment on this larger M2 Air body.",
bestFor: "Visible screen damage, black display, line faults, or intermittent image as the lid moves.",
notes: "We separate the screen quote from any housing fit risk before proceeding." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Air M2 15-inch 2023.",
bestFor: "For customers who want practical screen and startup checks before handover.",
notes: "Extra housing, power, or board concerns are discussed before any added work." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Air M2 15-inch 2023 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because wide thin-lid pressure and hinge alignment can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this larger Apple-silicon Air body can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and wide thin-lid pressure and hinge alignment." },
      { step: "02",
title: "Confirm display symptoms",
description: "Brightness, line faults, flicker, external display response, and sleep/wake behaviour are tested before quoting." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Air M2 15-inch 2023." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Air M2 15-inch 2023 screen changes as the lid moves?",
        answer: "We test the MacBook Air M2 15-inch 2023 panel output, lid angle, hinge feel, and wide thin-lid pressure and hinge alignment. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Air M2 15-inch 2023 screen repair uncover another fault?",
        answer: "Yes. During MacBook Air M2 15-inch 2023 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Air M2 15-inch 2023 with an external display?",
        answer: "Where it helps the MacBook Air M2 15-inch 2023 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Air M2 15-inch 2023 lid, hinge, frame, and camera area?",
        answer: "Yes. The larger Apple-silicon Air is checked for wide thin-lid pressure and hinge alignment, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Air M2 15-inch 2023 before screen work?",
        answer: "If the MacBook Air M2 15-inch 2023 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Air M2 15-inch 2023 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Air M2 15-inch 2023 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M2 15-inch 2023 screen replacement in Ringwood",
      intro: "MacBook Air M2 15-inch 2023 screen assessment starts with the customer-visible symptom, then checks wide thin-lid pressure and hinge alignment before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "Model family, housing condition, and symptoms are matched before pricing is confirmed." },
        { title: "Repair risk explained",
description: "We explain how wide thin-lid pressure and hinge alignment can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M2 15-inch 2023 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M2 15-inch 2023 to Ringwood Square for screen replacement",
      intro: "Ringwood locals usually bring this MacBook Air in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the sleeve or case if the fault started after travel or pressure in a bag.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Air M2 15-inch 2023 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M2 15-inch 2023 screen replacement?",
      body: "Book the MacBook Air M2 15-inch 2023 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Air M2 15-inch 2023 screen replacement.",
        "Tell us if the MacBook Air M2 15-inch 2023 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Air M2 15-inch 2023 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-air-m2-15-2023|battery-replacement": {
    modelName: "MacBook Air M2 15-inch 2023",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Air M2 15-inch 2023 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Power complaints on the MacBook Air M2 15-inch 2023 get a bench check for runtime, heat, swelling, and charger consistency.",
    quickAnswer: "A larger M2 Air with short runtime gets checked for actual battery wear, heat, and charging consistency before repair starts.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "A quick look is not enough for this repair path. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and large-screen runtime expectations and charging consistency.",
bestFor: "Poor battery life, service messages, shutdowns, or trackpad pressure that needs checking.",
notes: "We compare battery symptoms with the charger response before confirming the path." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this larger M2 Air body, we confirm availability, quote, and the practical handover checks.",
bestFor: "MacBooks showing battery wear after the power path has been checked.",
notes: "The repair window is confirmed after we inspect the MacBook and check availability." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Air M2 15-inch 2023 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check large-screen runtime expectations and charging consistency before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe 3 and USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Air M2 15-inch 2023 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "MagSafe 3 and USB-C response are checked with pressure signs before battery repair is approved." },
      { step: "03",
title: "Run handover power checks",
description: "We finish with charging, startup, trackpad, and battery behaviour checks before handover." }
    ],
    faq: [
      {
        question: "What makes MacBook Air M2 15-inch 2023 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe 3 or USB-C charger response on the MacBook Air M2 15-inch 2023 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Air M2 15-inch 2023 for battery service?",
        answer: "Back up important files first if the MacBook Air M2 15-inch 2023 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Air M2 15-inch 2023?",
        answer: "Yes. Pressure around the MacBook Air M2 15-inch 2023 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Air M2 15-inch 2023 battery wear from charger or board faults?",
        answer: "We test MacBook Air M2 15-inch 2023 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Air M2 15-inch 2023 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe 3 and USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Air M2 15-inch 2023 battery replacement?",
        answer: "Back up important files if the MacBook Air M2 15-inch 2023 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M2 15-inch 2023 battery replacement in Ringwood",
      intro: "MacBook Air M2 15-inch 2023 battery diagnosis links real runtime behaviour with MagSafe 3 or USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm which Air generation is on the bench before giving the repair path." },
        { title: "Repair risk explained",
description: "We explain how large-screen runtime expectations and charging consistency can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M2 15-inch 2023 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M2 15-inch 2023 to Ringwood Square for battery replacement",
      intro: "Ringwood locals usually bring this MacBook Air in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the sleeve or case if the fault started after travel or pressure in a bag.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Air M2 15-inch 2023 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M2 15-inch 2023 battery replacement?",
      body: "Bring the MacBook Air M2 15-inch 2023 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Air M2 15-inch 2023 battery replacement.",
        "Bring the charger used most often with the MacBook Air M2 15-inch 2023 so power behaviour can be checked properly.",
        "The MacBook Air M2 15-inch 2023 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-air-m2-15-2023|charging-port-replacement": {
    modelName: "MacBook Air M2 15-inch 2023",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Air M2 15-inch 2023 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "Charging repair for the MacBook Air M2 15-inch 2023 starts with the cable fit, visible port condition, and power response you can reproduce.",
    quickAnswer: "A larger M2 Air that charges unreliably gets MagSafe 3, USB-C, and accessory behaviour checked at the bench.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We check the obvious fault and the nearby risks first. We test known-good charging gear, inspect debris or damage, and check MagSafe 3 connection plus USB-C accessory charging response.",
bestFor: "Charging complaints where the adapter and cable need to be separated from the port.",
notes: "If simple testing explains the issue, we keep the recommendation practical." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Air M2 15-inch 2023 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Port-level symptoms that remain after simple charger checks.",
notes: "The quote stays tied to the confirmed charging-path fault, not a blanket no-power promise." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Air M2 15-inch 2023 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "We compare charging gear, battery behaviour, and port fit before quoting the work." },
      { title: "Loose or unreliable fit",
description: "MagSafe 3 connection plus USB-C accessory charging response can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe 3 connection plus USB-C accessory charging response." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe 3 and USB-C charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Air M2 15-inch 2023." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Air M2 15-inch 2023 charging fault is the port or the charger?",
        answer: "We test the MacBook Air M2 15-inch 2023 with known-good gear, inspect MagSafe 3 connection and USB-C accessory charging response, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Air M2 15-inch 2023 for charging repair?",
        answer: "Bring the sleeve or case if the fault started after travel or pressure in a bag. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Air M2 15-inch 2023 port works but another does not?",
        answer: "We compare the available charging points for this larger Apple-silicon Air and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Air M2 15-inch 2023?",
        answer: "Because this model can involve MagSafe 3 and USB-C charging, we check both paths when your symptoms point that way."
      },
      {
        question: "Can debris or physical damage stop the MacBook Air M2 15-inch 2023 charging?",
        answer: "Yes. We check the MacBook Air M2 15-inch 2023 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Air M2 15-inch 2023 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Air M2 15-inch 2023 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M2 15-inch 2023 charging port repair in Ringwood",
      intro: "MacBook Air M2 15-inch 2023 charging repair is scoped from the charger setup first, then MagSafe 3 connection and USB-C accessory charging response, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "The visible condition and model family are checked together before the repair path is set." },
        { title: "Repair risk explained",
description: "We explain how MagSafe 3 connection plus USB-C accessory charging response can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M2 15-inch 2023 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M2 15-inch 2023 to Ringwood Square for charging port repair",
      intro: "Ringwood locals usually bring this MacBook Air in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the sleeve or case if the fault started after travel or pressure in a bag.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Air M2 15-inch 2023 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M2 15-inch 2023 charging port repair?",
      body: "Bring the MacBook Air M2 15-inch 2023 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Air M2 15-inch 2023 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Air M2 15-inch 2023 charging fault.",
        "The MacBook Air M2 15-inch 2023 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-air-m3-13-2024|screen-replacement": {
    modelName: "MacBook Air M3 13-inch 2024",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Air M3 13-inch 2024 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "For a MacBook Air M3 13-inch 2024 with display lines or cracked glass, we separate panel damage from lid or hinge issues before repair begins.",
    quickAnswer: "A newer 13-inch Air with a damaged screen gets a careful look around the camera area, lid marks, and display output before repair starts.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Start with the symptom, not the part. We test brightness, lines, flicker, and external output on this newer M3 Air platform.",
bestFor: "Cracked displays, black image, line faults, flicker, or faults that change when the lid moves.",
notes: "Quote, part path, and fit risk are confirmed before approved repair work starts." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Air M3 13-inch 2024.",
bestFor: "Customers who want the main screen-related functions checked before handover.",
notes: "Any unrelated housing, battery, or board concern is explained separately before extra work." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Air M3 13-inch 2024 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because hinge alignment and display cable behaviour can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this newer Apple-silicon Air platform can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and display output." },
      { step: "02",
title: "Confirm display symptoms",
description: "We test brightness, lines, flicker, external display behaviour, and sleep/wake response where they apply." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Air M3 13-inch 2024." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Air M3 13-inch 2024 screen changes as the lid moves?",
        answer: "We test the MacBook Air M3 13-inch 2024 panel output, lid angle, and hinge feel. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Air M3 13-inch 2024 screen repair uncover another fault?",
        answer: "Yes. During MacBook Air M3 13-inch 2024 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Air M3 13-inch 2024 with an external display?",
        answer: "Where it helps the MacBook Air M3 13-inch 2024 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Air M3 13-inch 2024 lid, hinge, frame, and camera area?",
        answer: "Yes. The newer Apple-silicon Air is checked for lid alignment and display output, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Air M3 13-inch 2024 before screen work?",
        answer: "If the MacBook Air M3 13-inch 2024 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Air M3 13-inch 2024 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Air M3 13-inch 2024 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M3 13-inch 2024 screen replacement in Ringwood",
      intro: "MacBook Air M3 13-inch 2024 screen assessment starts with the customer-visible symptom, then checks lid condition and display output before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the exact Air family and visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how lid condition and display output can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M3 13-inch 2024 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M3 13-inch 2024 to Ringwood Square for screen replacement",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the original charger if available, plus any cable that feels loose.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Air M3 13-inch 2024 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M3 13-inch 2024 screen replacement?",
      body: "Book the MacBook Air M3 13-inch 2024 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Air M3 13-inch 2024 screen replacement.",
        "Tell us if the MacBook Air M3 13-inch 2024 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Air M3 13-inch 2024 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-air-m3-13-2024|battery-replacement": {
    modelName: "MacBook Air M3 13-inch 2024",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Air M3 13-inch 2024 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Ali Mobile & Repair assesses MacBook Air M3 13-inch 2024 battery faults in Ringwood Square while preserving live quote and price behaviour.",
    quickAnswer: "On a newer M3 Air, we do not assume the battery is faulty from one warning. Charger and cable behaviour are checked too.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "The bench check is practical and model-aware. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and newer battery behaviour compared with adapter and cable response.",
bestFor: "Short runtime, sudden shutdowns, service warnings, swelling concern, or poor charge hold.",
notes: "Charging response is checked as well, because a power issue is not always only the battery." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this newer M3 Air platform, we confirm availability, quote, and the practical handover checks.",
bestFor: "MacBooks with confirmed battery wear and stable charging behaviour.",
notes: "Timing is confirmed after inspection and part availability, not promised before assessment." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Air M3 13-inch 2024 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check newer battery behaviour compared with adapter and cable response before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe 3 and USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Air M3 13-inch 2024 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We compare both charging paths with swelling signs before confirming battery replacement." },
      { step: "03",
title: "Run handover power checks",
description: "Before handover, we check charging response, startup stability, trackpad feel, and practical battery behaviour." }
    ],
    faq: [
      {
        question: "What makes MacBook Air M3 13-inch 2024 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe 3 or USB-C charger response on the MacBook Air M3 13-inch 2024 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Air M3 13-inch 2024 for battery service?",
        answer: "Back up important files first if the MacBook Air M3 13-inch 2024 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Air M3 13-inch 2024?",
        answer: "Yes. Pressure around the MacBook Air M3 13-inch 2024 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Air M3 13-inch 2024 battery wear from charger or board faults?",
        answer: "We test MacBook Air M3 13-inch 2024 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Air M3 13-inch 2024 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe 3 and USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Air M3 13-inch 2024 battery replacement?",
        answer: "Back up important files if the MacBook Air M3 13-inch 2024 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M3 13-inch 2024 battery replacement in Ringwood",
      intro: "MacBook Air M3 13-inch 2024 battery diagnosis links real runtime behaviour with MagSafe 3 or USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "The MacBook Air generation and outer condition are checked before the quote is confirmed." },
        { title: "Repair risk explained",
description: "We explain how newer battery behaviour compared with adapter and cable response can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M3 13-inch 2024 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M3 13-inch 2024 to Ringwood Square for battery replacement",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the original charger if available, plus any cable that feels loose.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Air M3 13-inch 2024 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M3 13-inch 2024 battery replacement?",
      body: "Bring the MacBook Air M3 13-inch 2024 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Air M3 13-inch 2024 battery replacement.",
        "Bring the charger used most often with the MacBook Air M3 13-inch 2024 so power behaviour can be checked properly.",
        "The MacBook Air M3 13-inch 2024 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-air-m3-13-2024|charging-port-replacement": {
    modelName: "MacBook Air M3 13-inch 2024",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Air M3 13-inch 2024 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "Ali Mobile & Repair checks MacBook Air M3 13-inch 2024 charging faults in Ringwood Square without hardcoding price or outcome.",
    quickAnswer: "For a newer 13-inch M3 Air, loose charging is checked across the cable, MagSafe seat, and USB-C response first.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We keep the diagnosis plain and tied to how you use the MacBook. We test known-good charging gear, inspect debris or damage, and check MagSafe 3 seating and USB-C port consistency.",
bestFor: "No charge response, loose cable fit, charging at one angle, or intermittent power.",
notes: "If the cable, adapter, or debris is the cause, we do not push unnecessary port work." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Air M3 13-inch 2024 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Repeated charger dropouts, unstable power delivery, or visible connector wear.",
notes: "A port repair is not promised to fix board-level or battery-related no-power faults." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Air M3 13-inch 2024 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "The cause can be the adapter, cable, battery, port, or deeper power path, so we test before quoting." },
      { title: "Loose or unreliable fit",
description: "MagSafe 3 seating and USB-C port consistency can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe 3 seating and USB-C port consistency." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe 3 and USB-C charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Air M3 13-inch 2024." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Air M3 13-inch 2024 charging fault is the port or the charger?",
        answer: "We test the MacBook Air M3 13-inch 2024 with known-good gear, inspect MagSafe 3 seating and USB-C port consistency, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Air M3 13-inch 2024 for charging repair?",
        answer: "Bring the original charger if available, plus any cable that feels loose. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Air M3 13-inch 2024 port works but another does not?",
        answer: "We compare the available charging points for this newer Apple-silicon Air and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Air M3 13-inch 2024?",
        answer: "Because this model can involve MagSafe 3 and USB-C charging, we check both paths when your symptoms point that way."
      },
      {
        question: "Can debris or physical damage stop the MacBook Air M3 13-inch 2024 charging?",
        answer: "Yes. We check the MacBook Air M3 13-inch 2024 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Air M3 13-inch 2024 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Air M3 13-inch 2024 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M3 13-inch 2024 charging port repair in Ringwood",
      intro: "MacBook Air M3 13-inch 2024 charging repair is scoped from the charger setup first, then MagSafe 3 seating and USB-C port consistency, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We identify the Air model first, then inspect visible damage before quoting." },
        { title: "Repair risk explained",
description: "We explain how MagSafe 3 seating and USB-C port consistency can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M3 13-inch 2024 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M3 13-inch 2024 to Ringwood Square for charging port repair",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the original charger if available, plus any cable that feels loose.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Air M3 13-inch 2024 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M3 13-inch 2024 charging port repair?",
      body: "Bring the MacBook Air M3 13-inch 2024 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Air M3 13-inch 2024 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Air M3 13-inch 2024 charging fault.",
        "The MacBook Air M3 13-inch 2024 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-air-m3-15-2024|screen-replacement": {
    modelName: "MacBook Air M3 15-inch 2024",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Air M3 15-inch 2024 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Ali Mobile & Repair checks MacBook Air M3 15-inch 2024 screen faults in Ringwood Square without changing the live quote or price logic.",
    quickAnswer: "With the larger M3 Air, we check whether the fault is panel damage, hinge pressure, or a related display symptom before quoting.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Before quoting, we separate the visible fault from the cause. We test brightness, lines, flicker, external output, and larger thin-lid pressure and even hinge travel on this larger M3 Air body.",
bestFor: "Screens with cracks, dark sections, display lines, flicker, or lid-angle cut-outs.",
notes: "We confirm the quote, suitable part path, and any fit concern before work begins." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Air M3 15-inch 2024.",
bestFor: "Useful when you want display, camera-area, and lid behaviour checked before handover.",
notes: "If another housing, battery, or board issue appears, we explain it before extra work is considered." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Air M3 15-inch 2024 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because larger thin-lid pressure and even hinge travel can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this larger newer Apple-silicon Air can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and larger thin-lid pressure and even hinge travel." },
      { step: "02",
title: "Confirm display symptoms",
description: "Display output, brightness control, flicker, lines, external monitor behaviour, and sleep/wake response are checked." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Air M3 15-inch 2024." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Air M3 15-inch 2024 screen changes as the lid moves?",
        answer: "We test the MacBook Air M3 15-inch 2024 panel output, lid angle, hinge feel, and larger thin-lid pressure and even hinge travel. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Air M3 15-inch 2024 screen repair uncover another fault?",
        answer: "Yes. During MacBook Air M3 15-inch 2024 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Air M3 15-inch 2024 with an external display?",
        answer: "Where it helps the MacBook Air M3 15-inch 2024 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Air M3 15-inch 2024 lid, hinge, frame, and camera area?",
        answer: "Yes. The larger newer Apple-silicon Air is checked for larger thin-lid pressure and hinge travel, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Air M3 15-inch 2024 before screen work?",
        answer: "If the MacBook Air M3 15-inch 2024 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Air M3 15-inch 2024 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Air M3 15-inch 2024 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M3 15-inch 2024 screen replacement in Ringwood",
      intro: "MacBook Air M3 15-inch 2024 screen assessment starts with the customer-visible symptom, then checks larger thin-lid pressure and even hinge travel before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "Model family, housing condition, and symptoms are matched before pricing is confirmed." },
        { title: "Repair risk explained",
description: "We explain how larger thin-lid pressure and even hinge travel can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M3 15-inch 2024 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M3 15-inch 2024 to Ringwood Square for screen replacement",
      intro: "This larger newer Apple-silicon Air often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Tell us whether the symptom changes between MagSafe and USB-C; that detail matters.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Air M3 15-inch 2024 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M3 15-inch 2024 screen replacement?",
      body: "Book the MacBook Air M3 15-inch 2024 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Air M3 15-inch 2024 screen replacement.",
        "Tell us if the MacBook Air M3 15-inch 2024 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Air M3 15-inch 2024 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-air-m3-15-2024|battery-replacement": {
    modelName: "MacBook Air M3 15-inch 2024",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Air M3 15-inch 2024 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "For MacBook Air M3 15-inch 2024 battery concerns, we separate actual cell wear from cable, charger, or port behaviour before repair.",
    quickAnswer: "The 15-inch M3 Air battery path is confirmed after runtime, adapter response, and daily-use symptoms are compared.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "A quick look is not enough for this repair path. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and daily runtime symptoms against charger and adapter behaviour.",
bestFor: "Fast battery drain, shutdowns under load, warning messages, or pressure around the trackpad.",
notes: "We test the charger behaviour too, so a cable or port issue is not mistaken for battery wear." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this larger M3 Air body, we confirm availability, quote, and the practical handover checks.",
bestFor: "Battery-wear cases where the charger and port response look stable.",
notes: "We confirm timing once the MacBook has been checked and the part path is known." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Air M3 15-inch 2024 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check daily runtime symptoms against charger and adapter behaviour before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe 3 and USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Air M3 15-inch 2024 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "The MagSafe 3 and USB-C checks help separate battery wear from charging-accessory faults." },
      { step: "03",
title: "Run handover power checks",
description: "Handover checks cover charging response, startup behaviour, trackpad feel, and basic battery stability." }
    ],
    faq: [
      {
        question: "What makes MacBook Air M3 15-inch 2024 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe 3 or USB-C charger response on the MacBook Air M3 15-inch 2024 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Air M3 15-inch 2024 for battery service?",
        answer: "Back up important files first if the MacBook Air M3 15-inch 2024 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Air M3 15-inch 2024?",
        answer: "Yes. Pressure around the MacBook Air M3 15-inch 2024 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Air M3 15-inch 2024 battery wear from charger or board faults?",
        answer: "We test MacBook Air M3 15-inch 2024 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Air M3 15-inch 2024 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe 3 and USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Air M3 15-inch 2024 battery replacement?",
        answer: "Back up important files if the MacBook Air M3 15-inch 2024 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M3 15-inch 2024 battery replacement in Ringwood",
      intro: "MacBook Air M3 15-inch 2024 battery diagnosis links real runtime behaviour with MagSafe 3 or USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm which Air generation is on the bench before giving the repair path." },
        { title: "Repair risk explained",
description: "We explain how daily runtime symptoms against charger and adapter behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M3 15-inch 2024 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M3 15-inch 2024 to Ringwood Square for battery replacement",
      intro: "This larger newer Apple-silicon Air often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Tell us whether the symptom changes between MagSafe and USB-C; that detail matters.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Air M3 15-inch 2024 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M3 15-inch 2024 battery replacement?",
      body: "Bring the MacBook Air M3 15-inch 2024 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Air M3 15-inch 2024 battery replacement.",
        "Bring the charger used most often with the MacBook Air M3 15-inch 2024 so power behaviour can be checked properly.",
        "The MacBook Air M3 15-inch 2024 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-air-m3-15-2024|charging-port-replacement": {
    modelName: "MacBook Air M3 15-inch 2024",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Air M3 15-inch 2024 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "MagSafe 3 or USB-C charging on MacBook Air M3 15-inch 2024 is tested with known-good gear before port-level work is recommended.",
    quickAnswer: "The 15-inch M3 Air charging check starts with the charger setup you use every day, then moves to port and battery behaviour.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We check the obvious fault and the nearby risks first. We test known-good charging gear, inspect debris or damage, and check MagSafe 3 fit and USB-C port stability.",
bestFor: "MacBooks with no charge, wobbly cable fit, or power that cuts in and out.",
notes: "When a charger or cleaning fix explains the fault, we keep the repair scope smaller." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Air M3 15-inch 2024 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Charging faults that keep returning after cable and adapter checks.",
notes: "Board-level or battery-related no-power faults are explained separately from port repair." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Air M3 15-inch 2024 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "A no-charge fault can come from several places, so charger, cable, battery, and port checks come first." },
      { title: "Loose or unreliable fit",
description: "MagSafe 3 fit and USB-C port stability can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe 3 fit and USB-C port stability." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe 3 and USB-C charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Air M3 15-inch 2024." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Air M3 15-inch 2024 charging fault is the port or the charger?",
        answer: "We test the MacBook Air M3 15-inch 2024 with known-good gear, inspect MagSafe 3 fit and USB-C port stability, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Air M3 15-inch 2024 for charging repair?",
        answer: "Tell us whether the symptom changes between MagSafe and USB-C; that detail matters. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Air M3 15-inch 2024 port works but another does not?",
        answer: "We compare the available charging points for this larger newer Apple-silicon Air and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Air M3 15-inch 2024?",
        answer: "Because this model can involve MagSafe 3 and USB-C charging, we check both paths when your symptoms point that way."
      },
      {
        question: "Can debris or physical damage stop the MacBook Air M3 15-inch 2024 charging?",
        answer: "Yes. We check the MacBook Air M3 15-inch 2024 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Air M3 15-inch 2024 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Air M3 15-inch 2024 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Air M3 15-inch 2024 charging port repair in Ringwood",
      intro: "MacBook Air M3 15-inch 2024 charging repair is scoped from the charger setup first, then MagSafe 3 fit and USB-C port stability, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "The visible condition and model family are checked together before the repair path is set." },
        { title: "Repair risk explained",
description: "We explain how MagSafe 3 fit and USB-C port stability can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Air M3 15-inch 2024 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Air M3 15-inch 2024 to Ringwood Square for charging port repair",
      intro: "This larger newer Apple-silicon Air often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Tell us whether the symptom changes between MagSafe and USB-C; that detail matters.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Air M3 15-inch 2024 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Air M3 15-inch 2024 charging port repair?",
      body: "Bring the MacBook Air M3 15-inch 2024 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Air M3 15-inch 2024 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Air M3 15-inch 2024 charging fault.",
        "The MacBook Air M3 15-inch 2024 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-13-2014-2015|screen-replacement": {
    modelName: "MacBook Pro 13-inch 2014-2015",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 13-inch 2014-2015 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "When a MacBook Pro 13-inch 2014-2015 screen goes dark, flickers, or reacts to lid movement, we inspect the display path before approving parts.",
    quickAnswer: "This older 13-inch Pro can show Retina panel faults and lid wear together. We inspect both before confirming the screen repair path.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Start with the symptom, not the part. We test brightness, lines, flicker, external output, and Retina panel faults, hinge condition, and older lid wear on this Retina Intel Pro chassis.",
bestFor: "MacBooks showing panel cracks, no image, coloured lines, flicker, or movement-related faults.",
notes: "The repair scope, quote, and lid-fit risk are explained before approval." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 13-inch 2014-2015.",
bestFor: "For customers who want the visible screen functions retested before handover.",
notes: "Separate faults are reported before we discuss any extra repair scope." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 13-inch 2014-2015 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because Retina panel faults, hinge condition, and older lid wear can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this Retina Intel Pro body can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and Retina panel faults, hinge condition, and older lid wear." },
      { step: "02",
title: "Confirm display symptoms",
description: "We compare the built-in screen with external output, then check brightness, lines, flicker, and sleep/wake behaviour." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 13-inch 2014-2015." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 13-inch 2014-2015 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 13-inch 2014-2015 panel output, lid angle, hinge feel, and Retina panel faults, hinge condition, and older lid wear. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 13-inch 2014-2015 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 13-inch 2014-2015 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 13-inch 2014-2015 with an external display?",
        answer: "Where it helps the MacBook Pro 13-inch 2014-2015 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 13-inch 2014-2015 lid, hinge, frame, and camera area?",
        answer: "Yes. The Retina Intel Pro is checked for Retina panel faults and older lid wear, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 13-inch 2014-2015 before screen work?",
        answer: "If the MacBook Pro 13-inch 2014-2015 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 13-inch 2014-2015 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 13-inch 2014-2015 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch 2014-2015 screen replacement in Ringwood",
      intro: "MacBook Pro 13-inch 2014-2015 screen assessment starts with the customer-visible symptom, then checks Retina panel faults, hinge condition, and older lid wear before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the exact Pro family and visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how Retina panel faults, hinge condition, and older lid wear can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch 2014-2015 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch 2014-2015 to Ringwood Square for screen replacement",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe adapter and tell us if the fault appears after heavier use.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 13-inch 2014-2015 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch 2014-2015 screen replacement?",
      body: "Book the MacBook Pro 13-inch 2014-2015 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch 2014-2015 screen replacement.",
        "Tell us if the MacBook Pro 13-inch 2014-2015 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 13-inch 2014-2015 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-13-2014-2015|battery-replacement": {
    modelName: "MacBook Pro 13-inch 2014-2015",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 13-inch 2014-2015 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Older Pro battery behaviour on MacBook Pro 13-inch 2014-2015 is checked for pressure, runtime, and MagSafe response before approval.",
    quickAnswer: "Older Retina Pro battery faults can involve swelling or MagSafe response. We inspect both before quoting replacement.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "The bench check is practical and model-aware. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and battery age, top-case pressure, and MagSafe response.",
bestFor: "MacBooks with poor charge hold, unexpected shutdowns, swelling signs, or battery warnings.",
notes: "The charger and port response are checked before we treat the battery as the confirmed fault." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this Retina Intel Pro chassis, we confirm availability, quote, and the practical handover checks.",
bestFor: "MacBooks where inspection points to battery wear rather than charger trouble.",
notes: "Turnaround is discussed after inspection and availability checks." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 13-inch 2014-2015 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check battery age, top-case pressure, and MagSafe response before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe-era charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 13-inch 2014-2015 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We test MagSafe-era charging, inspect for pressure signs, and confirm battery replacement is the right path." },
      { step: "03",
title: "Run handover power checks",
description: "We retest startup, charging response, trackpad feel, and normal battery behaviour before handover." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 13-inch 2014-2015 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe charger response on the MacBook Pro 13-inch 2014-2015 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 13-inch 2014-2015 for battery service?",
        answer: "Back up important files first if the MacBook Pro 13-inch 2014-2015 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 13-inch 2014-2015?",
        answer: "Yes. Pressure around the MacBook Pro 13-inch 2014-2015 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 13-inch 2014-2015 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 13-inch 2014-2015 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 13-inch 2014-2015 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 13-inch 2014-2015 battery replacement?",
        answer: "Back up important files if the MacBook Pro 13-inch 2014-2015 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch 2014-2015 battery replacement in Ringwood",
      intro: "MacBook Pro 13-inch 2014-2015 battery diagnosis links real runtime behaviour with MagSafe charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "The MacBook Pro model and outer condition are checked before the quote is confirmed." },
        { title: "Repair risk explained",
description: "We explain how battery age, top-case pressure, and MagSafe response can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch 2014-2015 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch 2014-2015 to Ringwood Square for battery replacement",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe adapter and tell us if the fault appears after heavier use.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 13-inch 2014-2015 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch 2014-2015 battery replacement?",
      body: "Bring the MacBook Pro 13-inch 2014-2015 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch 2014-2015 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 13-inch 2014-2015 so power behaviour can be checked properly.",
        "The MacBook Pro 13-inch 2014-2015 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-13-2014-2015|charging-port-replacement": {
    modelName: "MacBook Pro 13-inch 2014-2015",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 13-inch 2014-2015 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "MagSafe behaviour on MacBook Pro 13-inch 2014-2015 is checked around the connector, adapter, and battery before repair scope is set.",
    quickAnswer: "Older Retina Pro MagSafe faults are inspected around the connector and nearby I/O before repair is recommended.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We keep the diagnosis plain and tied to how you use the MacBook. We test known-good charging gear, inspect debris or damage, and check MagSafe seating and nearby I/O wear.",
bestFor: "Charging faults where cable movement changes the connection.",
notes: "If testing points to the cable, adapter, or debris, we explain that before quoting port work." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 13-inch 2014-2015 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Cases where the connector feels worn or power delivery is unstable.",
notes: "We do not treat port replacement as a guaranteed fix for deeper power faults." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 13-inch 2014-2015 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "We test the simple causes before quoting because the issue may not be the port itself." },
      { title: "Loose or unreliable fit",
description: "MagSafe seating and nearby I/O wear can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe seating and nearby I/O wear." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe-era charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 13-inch 2014-2015." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 13-inch 2014-2015 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 13-inch 2014-2015 with known-good gear, inspect MagSafe seating and nearby I/O wear, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 13-inch 2014-2015 for charging repair?",
        answer: "Bring the MagSafe adapter and tell us if the fault appears after heavier use. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 13-inch 2014-2015 port works but another does not?",
        answer: "We compare the available charging points for this Retina Intel Pro and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 13-inch 2014-2015?",
        answer: "For this MagSafe-era model, adapter fit and connector behaviour matter during diagnosis."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 13-inch 2014-2015 charging?",
        answer: "Yes. We check the MacBook Pro 13-inch 2014-2015 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 13-inch 2014-2015 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 13-inch 2014-2015 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch 2014-2015 charging port repair in Ringwood",
      intro: "MacBook Pro 13-inch 2014-2015 charging repair is scoped from the charger setup first, then MagSafe seating and nearby I/O wear, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We identify the Pro generation first, then inspect the visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how MagSafe seating and nearby I/O wear can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch 2014-2015 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch 2014-2015 to Ringwood Square for charging port repair",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the MagSafe adapter and tell us if the fault appears after heavier use.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 13-inch 2014-2015 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch 2014-2015 charging port repair?",
      body: "Bring the MacBook Pro 13-inch 2014-2015 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch 2014-2015 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 13-inch 2014-2015 charging fault.",
        "The MacBook Pro 13-inch 2014-2015 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-15-2014-2015|screen-replacement": {
    modelName: "MacBook Pro 15-inch 2014-2015",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 15-inch 2014-2015 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Screen faults on the MacBook Pro 15-inch 2014-2015 are checked for panel damage, lid alignment, and startup behaviour before any work starts.",
    quickAnswer: "A 15-inch Retina Pro has more lid load than a small Air, so we check hinge feel, panel output, and housing condition before approval.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Before quoting, we separate the visible fault from the cause. We test brightness, lines, flicker, external output, and larger display assembly, hinge load, and lid condition on this larger Retina Intel Pro.",
bestFor: "Display faults where damage, lines, black image, or lid movement affects normal use.",
notes: "Part availability, quoted scope, and fit risk are checked before the MacBook is opened." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 15-inch 2014-2015.",
bestFor: "Helpful when the display fault affected normal work and you want handover checks done.",
notes: "A screen repair does not hide other issues; we explain unrelated findings before proceeding." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 15-inch 2014-2015 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because larger display assembly, hinge load, and lid condition can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this larger Retina Intel Pro body can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and larger display assembly, hinge load, and lid condition." },
      { step: "02",
title: "Confirm display symptoms",
description: "The display check covers image output, brightness changes, line faults, flicker, and lid-related sleep or wake response." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 15-inch 2014-2015." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 15-inch 2014-2015 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 15-inch 2014-2015 panel output, lid angle, hinge feel, and larger display assembly, hinge load, and lid condition. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 15-inch 2014-2015 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 15-inch 2014-2015 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 15-inch 2014-2015 with an external display?",
        answer: "Where it helps the MacBook Pro 15-inch 2014-2015 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 15-inch 2014-2015 lid, hinge, frame, and camera area?",
        answer: "Yes. The larger Retina Intel Pro is checked for larger display assembly and hinge load, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 15-inch 2014-2015 before screen work?",
        answer: "If the MacBook Pro 15-inch 2014-2015 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 15-inch 2014-2015 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 15-inch 2014-2015 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 15-inch 2014-2015 screen replacement in Ringwood",
      intro: "MacBook Pro 15-inch 2014-2015 screen assessment starts with the customer-visible symptom, then checks larger display assembly, hinge load, and lid condition before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "Model family, housing condition, and reported symptoms are matched before the quote." },
        { title: "Repair risk explained",
description: "We explain how larger display assembly, hinge load, and lid condition can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 15-inch 2014-2015 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 15-inch 2014-2015 to Ringwood Square for screen replacement",
      intro: "Because this is older 15-inch Pro often kept for creative, study, or business work, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the charger and mention if shutdowns happen during heavier workloads.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 15-inch 2014-2015 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 15-inch 2014-2015 screen replacement?",
      body: "Book the MacBook Pro 15-inch 2014-2015 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 15-inch 2014-2015 screen replacement.",
        "Tell us if the MacBook Pro 15-inch 2014-2015 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 15-inch 2014-2015 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-15-2014-2015|battery-replacement": {
    modelName: "MacBook Pro 15-inch 2014-2015",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 15-inch 2014-2015 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "A larger MacBook Pro with sudden shutdowns needs battery and charging checks before replacement is recommended.",
    quickAnswer: "A 15-inch 2014-2015 Pro may drain under heavier work. We check battery wear, charger response, and pressure signs first.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "A quick look is not enough for this repair path. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and older high-use battery behaviour and swelling pressure.",
bestFor: "Battery complaints involving short runtime, heat, shutdowns, or possible top-case pressure.",
notes: "We include charging checks before recommending battery replacement." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this larger Retina Intel Pro, we confirm availability, quote, and the practical handover checks.",
bestFor: "Confirmed battery faults after charging response has been checked.",
notes: "We do not promise timing until the repair scope and parts are confirmed." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 15-inch 2014-2015 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check older high-use battery behaviour and swelling pressure before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe-era charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 15-inch 2014-2015 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We test MagSafe-era charging, inspect for pressure signs, and confirm battery replacement is the right path." },
      { step: "03",
title: "Run handover power checks",
description: "Final checks include charge response, stable startup, trackpad feel, and day-to-day battery behaviour." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 15-inch 2014-2015 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe charger response on the MacBook Pro 15-inch 2014-2015 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 15-inch 2014-2015 for battery service?",
        answer: "Back up important files first if the MacBook Pro 15-inch 2014-2015 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 15-inch 2014-2015?",
        answer: "Yes. Pressure around the MacBook Pro 15-inch 2014-2015 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 15-inch 2014-2015 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 15-inch 2014-2015 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 15-inch 2014-2015 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 15-inch 2014-2015 battery replacement?",
        answer: "Back up important files if the MacBook Pro 15-inch 2014-2015 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 15-inch 2014-2015 battery replacement in Ringwood",
      intro: "MacBook Pro 15-inch 2014-2015 battery diagnosis links real runtime behaviour with MagSafe charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm which Pro generation is on the bench before giving the repair path." },
        { title: "Repair risk explained",
description: "We explain how older high-use battery behaviour and swelling pressure can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 15-inch 2014-2015 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 15-inch 2014-2015 to Ringwood Square for battery replacement",
      intro: "Because this is older 15-inch Pro often kept for creative, study, or business work, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the charger and mention if shutdowns happen during heavier workloads.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 15-inch 2014-2015 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 15-inch 2014-2015 battery replacement?",
      body: "Bring the MacBook Pro 15-inch 2014-2015 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 15-inch 2014-2015 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 15-inch 2014-2015 so power behaviour can be checked properly.",
        "The MacBook Pro 15-inch 2014-2015 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-15-2014-2015|charging-port-replacement": {
    modelName: "MacBook Pro 15-inch 2014-2015",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 15-inch 2014-2015 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "Charging complaints on the larger MacBook Pro 15-inch 2014-2015 are checked against workload power demand and connector fit.",
    quickAnswer: "On the 15-inch Retina Pro, charging issues are checked with workload power demand and MagSafe fit in mind.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We check the obvious fault and the nearby risks first. We test known-good charging gear, inspect debris or damage, and check MagSafe fit and side-port condition.",
bestFor: "Loose fit, no charging light or response, and unreliable power delivery.",
notes: "We avoid port replacement when cleaning or charger testing resolves the symptom." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 15-inch 2014-2015 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "MacBooks with repeated dropouts after known-good charging gear is tested.",
notes: "If the fault sits beyond the port, we explain that before work continues." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 15-inch 2014-2015 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "Adapter, cable, battery, connector, and power-path faults are separated during diagnosis." },
      { title: "Loose or unreliable fit",
description: "MagSafe fit and side-port condition can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe fit and side-port condition." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe-era charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 15-inch 2014-2015." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 15-inch 2014-2015 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 15-inch 2014-2015 with known-good gear, inspect MagSafe fit and side-port condition, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 15-inch 2014-2015 for charging repair?",
        answer: "Bring the charger and mention if shutdowns happen during heavier workloads. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 15-inch 2014-2015 port works but another does not?",
        answer: "We compare the available charging points for this larger Retina Intel Pro and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 15-inch 2014-2015?",
        answer: "For this MagSafe-era model, adapter fit and connector behaviour matter during diagnosis."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 15-inch 2014-2015 charging?",
        answer: "Yes. We check the MacBook Pro 15-inch 2014-2015 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 15-inch 2014-2015 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 15-inch 2014-2015 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 15-inch 2014-2015 charging port repair in Ringwood",
      intro: "MacBook Pro 15-inch 2014-2015 charging repair is scoped from the charger setup first, then MagSafe fit and side-port condition, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "The visible condition and model family are checked together before pricing is confirmed." },
        { title: "Repair risk explained",
description: "We explain how MagSafe fit and side-port condition can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 15-inch 2014-2015 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 15-inch 2014-2015 to Ringwood Square for charging port repair",
      intro: "Because this is older 15-inch Pro often kept for creative, study, or business work, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the charger and mention if shutdowns happen during heavier workloads.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 15-inch 2014-2015 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 15-inch 2014-2015 charging port repair?",
      body: "Bring the MacBook Pro 15-inch 2014-2015 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 15-inch 2014-2015 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 15-inch 2014-2015 charging fault.",
        "The MacBook Pro 15-inch 2014-2015 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-13-2016-2017|screen-replacement": {
    modelName: "MacBook Pro 13-inch 2016-2017",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 13-inch 2016-2017 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Ringwood support for MacBook Pro 13-inch 2016-2017 display damage, with the quote tied to inspected symptoms rather than guesswork.",
    quickAnswer: "Early USB-C Pro display faults often need lid-angle testing. We check the screen symptom and housing fit before any work begins.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Start with the symptom, not the part. We test brightness, lines, flicker, external output, and lid-angle display symptoms and USB-C-era housing fit on this early USB-C Pro generation.",
bestFor: "Cracked panels, unstable image, flickering output, or screen faults linked to lid position.",
notes: "You get the quote and screen-fit notes before approved repair work starts." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 13-inch 2016-2017.",
bestFor: "For MacBooks where screen output, lid feel, and startup need one final check.",
notes: "If testing shows another fault, we separate it from the approved screen work." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 13-inch 2016-2017 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because lid-angle display symptoms and USB-C-era housing fit can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this early USB-C Intel Pro design can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and lid-angle display symptoms and USB-C-era housing fit." },
      { step: "02",
title: "Confirm display symptoms",
description: "We look at screen image, backlight behaviour, flicker, external display output, and whether sleep/wake acts normally." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 13-inch 2016-2017." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 13-inch 2016-2017 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 13-inch 2016-2017 panel output, lid angle, hinge feel, and lid-angle display symptoms and USB-C-era housing fit. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 13-inch 2016-2017 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 13-inch 2016-2017 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 13-inch 2016-2017 with an external display?",
        answer: "Where it helps the MacBook Pro 13-inch 2016-2017 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 13-inch 2016-2017 lid, hinge, frame, and camera area?",
        answer: "Yes. The early USB-C Intel Pro is checked for lid-angle symptoms and USB-C-era housing fit, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 13-inch 2016-2017 before screen work?",
        answer: "If the MacBook Pro 13-inch 2016-2017 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 13-inch 2016-2017 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 13-inch 2016-2017 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch 2016-2017 screen replacement in Ringwood",
      intro: "MacBook Pro 13-inch 2016-2017 screen assessment starts with the customer-visible symptom, then checks lid-angle display symptoms and USB-C-era housing fit before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the exact Pro family and visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how lid-angle display symptoms and USB-C-era housing fit can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch 2016-2017 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch 2016-2017 to Ringwood Square for screen replacement",
      intro: "Ringwood locals usually bring this MacBook Pro in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring every USB-C cable or charger that behaves differently, including docks.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 13-inch 2016-2017 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch 2016-2017 screen replacement?",
      body: "Book the MacBook Pro 13-inch 2016-2017 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch 2016-2017 screen replacement.",
        "Tell us if the MacBook Pro 13-inch 2016-2017 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 13-inch 2016-2017 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-13-2016-2017|battery-replacement": {
    modelName: "MacBook Pro 13-inch 2016-2017",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 13-inch 2016-2017 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Battery diagnosis for MacBook Pro 13-inch 2016-2017 covers USB-C power response, trackpad feel, and shutdown history before quoting.",
    quickAnswer: "For the 13-inch USB-C Pro, battery symptoms are checked beside port behaviour and trackpad feel before approval.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "The bench check is practical and model-aware. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and battery condition alongside USB-C charging and trackpad feel.",
bestFor: "Customers seeing runtime drops, charging percentage jumps, or swelling concerns.",
notes: "Battery work is not approved until charging response has been checked." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this early USB-C Pro generation, we confirm availability, quote, and the practical handover checks.",
bestFor: "Battery replacement cases with no obvious separate charging fault.",
notes: "Availability and condition decide timing, so we confirm that after assessment." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 13-inch 2016-2017 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check battery condition alongside USB-C charging and trackpad feel before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 13-inch 2016-2017 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We compare USB-C charging behaviour with swelling signs before confirming the battery path." },
      { step: "03",
title: "Run handover power checks",
description: "The MacBook is checked for startup stability, charging response, trackpad pressure, and practical runtime behaviour." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 13-inch 2016-2017 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and USB-C charger response on the MacBook Pro 13-inch 2016-2017 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 13-inch 2016-2017 for battery service?",
        answer: "Back up important files first if the MacBook Pro 13-inch 2016-2017 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 13-inch 2016-2017?",
        answer: "Yes. Pressure around the MacBook Pro 13-inch 2016-2017 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 13-inch 2016-2017 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 13-inch 2016-2017 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 13-inch 2016-2017 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 13-inch 2016-2017 battery replacement?",
        answer: "Back up important files if the MacBook Pro 13-inch 2016-2017 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch 2016-2017 battery replacement in Ringwood",
      intro: "MacBook Pro 13-inch 2016-2017 battery diagnosis links real runtime behaviour with USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "The MacBook Pro model and outer condition are checked before the quote is confirmed." },
        { title: "Repair risk explained",
description: "We explain how battery condition alongside USB-C charging and trackpad feel can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch 2016-2017 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch 2016-2017 to Ringwood Square for battery replacement",
      intro: "Ringwood locals usually bring this MacBook Pro in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring every USB-C cable or charger that behaves differently, including docks.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 13-inch 2016-2017 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch 2016-2017 battery replacement?",
      body: "Bring the MacBook Pro 13-inch 2016-2017 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch 2016-2017 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 13-inch 2016-2017 so power behaviour can be checked properly.",
        "The MacBook Pro 13-inch 2016-2017 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-13-2016-2017|charging-port-replacement": {
    modelName: "MacBook Pro 13-inch 2016-2017",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 13-inch 2016-2017 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "Early USB-C charging faults on MacBook Pro 13-inch 2016-2017 need cable, adapter, and port checks before quoting.",
    quickAnswer: "Early USB-C Pro charging faults often change by cable or side. Bring the setup so we can reproduce it before quoting.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We keep the diagnosis plain and tied to how you use the MacBook. We test known-good charging gear, inspect debris or damage, and check USB-C port wear, cable seating, and adapter response.",
bestFor: "Intermittent charging, angle-sensitive cables, or ports that feel worn.",
notes: "A cable or adapter fault is separated from true port damage before repair is approved." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 13-inch 2016-2017 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Visible connector wear, poor cable hold, or unstable charging response.",
notes: "Battery and board faults need separate assessment from connector repair." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 13-inch 2016-2017 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "No-power symptoms need testing before we name the port as the repair path." },
      { title: "Loose or unreliable fit",
description: "USB-C port wear, cable seating, and adapter response can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and USB-C port wear, cable seating, and adapter response." },
      { step: "02",
title: "Test known-good gear",
description: "Known-good USB-C gear is tested before the repair path is set." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 13-inch 2016-2017." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 13-inch 2016-2017 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 13-inch 2016-2017 with known-good gear, inspect USB-C port wear, cable seating, and adapter response, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 13-inch 2016-2017 for charging repair?",
        answer: "Bring every USB-C cable or charger that behaves differently, including docks. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 13-inch 2016-2017 port works but another does not?",
        answer: "We compare the available charging points for this early USB-C Intel Pro and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 13-inch 2016-2017?",
        answer: "For this USB-C model, cable orientation, adapter behaviour, and port fit are compared before quoting."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 13-inch 2016-2017 charging?",
        answer: "Yes. We check the MacBook Pro 13-inch 2016-2017 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 13-inch 2016-2017 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 13-inch 2016-2017 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch 2016-2017 charging port repair in Ringwood",
      intro: "MacBook Pro 13-inch 2016-2017 charging repair is scoped from the charger setup first, then USB-C port wear, cable seating, and adapter response, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We identify the Pro generation first, then inspect the visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how USB-C port wear, cable seating, and adapter response can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch 2016-2017 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch 2016-2017 to Ringwood Square for charging port repair",
      intro: "Ringwood locals usually bring this MacBook Pro in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring every USB-C cable or charger that behaves differently, including docks.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 13-inch 2016-2017 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch 2016-2017 charging port repair?",
      body: "Bring the MacBook Pro 13-inch 2016-2017 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch 2016-2017 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 13-inch 2016-2017 charging fault.",
        "The MacBook Pro 13-inch 2016-2017 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-15-2016-2017|screen-replacement": {
    modelName: "MacBook Pro 15-inch 2016-2017",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 15-inch 2016-2017 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "A MacBook Pro 15-inch 2016-2017 screen replacement is scoped after checking the lid, hinge feel, image output, and any pressure marks.",
    quickAnswer: "On the 15-inch USB-C Pro, flicker or black image is checked with hinge movement and larger-lid pressure before quoting.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Before quoting, we separate the visible fault from the cause. We test brightness, lines, flicker, external output, and larger display pressure, hinge movement, and lid-angle behaviour on this larger early USB-C Pro.",
bestFor: "Visible screen damage, black display, line faults, or intermittent image as the lid moves.",
notes: "We separate the screen quote from any housing fit risk before proceeding." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 15-inch 2016-2017.",
bestFor: "For customers who want practical screen and startup checks before handover.",
notes: "Extra housing, power, or board concerns are discussed before any added work." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 15-inch 2016-2017 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because larger display pressure, hinge movement, and lid-angle behaviour can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this larger early USB-C Intel Pro can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and larger display pressure, hinge movement, and lid-angle behaviour." },
      { step: "02",
title: "Confirm display symptoms",
description: "Brightness, line faults, flicker, external display response, and sleep/wake behaviour are tested before quoting." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 15-inch 2016-2017." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 15-inch 2016-2017 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 15-inch 2016-2017 panel output, lid angle, hinge feel, and larger display pressure, hinge movement, and lid-angle behaviour. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 15-inch 2016-2017 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 15-inch 2016-2017 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 15-inch 2016-2017 with an external display?",
        answer: "Where it helps the MacBook Pro 15-inch 2016-2017 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 15-inch 2016-2017 lid, hinge, frame, and camera area?",
        answer: "Yes. The larger early USB-C Intel Pro is checked for larger display pressure and hinge movement, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 15-inch 2016-2017 before screen work?",
        answer: "If the MacBook Pro 15-inch 2016-2017 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 15-inch 2016-2017 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 15-inch 2016-2017 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 15-inch 2016-2017 screen replacement in Ringwood",
      intro: "MacBook Pro 15-inch 2016-2017 screen assessment starts with the customer-visible symptom, then checks larger display pressure, hinge movement, and lid-angle behaviour before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "Model family, housing condition, and reported symptoms are matched before the quote." },
        { title: "Repair risk explained",
description: "We explain how larger display pressure, hinge movement, and lid-angle behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 15-inch 2016-2017 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 15-inch 2016-2017 to Ringwood Square for screen replacement",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Tell us which side normally charges and bring the charger used at your desk.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 15-inch 2016-2017 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 15-inch 2016-2017 screen replacement?",
      body: "Book the MacBook Pro 15-inch 2016-2017 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 15-inch 2016-2017 screen replacement.",
        "Tell us if the MacBook Pro 15-inch 2016-2017 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 15-inch 2016-2017 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-15-2016-2017|battery-replacement": {
    modelName: "MacBook Pro 15-inch 2016-2017",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 15-inch 2016-2017 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "High-use MacBook Pro 15-inch 2016-2017 battery faults are assessed with charger testing and power behaviour checks first.",
    quickAnswer: "The larger 2016-2017 USB-C Pro can draw more power, so shutdowns and charging consistency are checked together.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "A quick look is not enough for this repair path. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and power draw, battery wear, and USB-C charging consistency.",
bestFor: "Poor battery life, service messages, shutdowns, or trackpad pressure that needs checking.",
notes: "We compare battery symptoms with the charger response before confirming the path." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this larger early USB-C Pro, we confirm availability, quote, and the practical handover checks.",
bestFor: "MacBooks showing battery wear after the power path has been checked.",
notes: "The repair window is confirmed after we inspect the MacBook and check availability." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 15-inch 2016-2017 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check power draw, battery wear, and USB-C charging consistency before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 15-inch 2016-2017 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "The USB-C charger response is checked alongside pressure signs before quoting battery work." },
      { step: "03",
title: "Run handover power checks",
description: "We finish with charging, startup, trackpad, and battery behaviour checks before handover." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 15-inch 2016-2017 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and USB-C charger response on the MacBook Pro 15-inch 2016-2017 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 15-inch 2016-2017 for battery service?",
        answer: "Back up important files first if the MacBook Pro 15-inch 2016-2017 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 15-inch 2016-2017?",
        answer: "Yes. Pressure around the MacBook Pro 15-inch 2016-2017 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 15-inch 2016-2017 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 15-inch 2016-2017 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 15-inch 2016-2017 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 15-inch 2016-2017 battery replacement?",
        answer: "Back up important files if the MacBook Pro 15-inch 2016-2017 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 15-inch 2016-2017 battery replacement in Ringwood",
      intro: "MacBook Pro 15-inch 2016-2017 battery diagnosis links real runtime behaviour with USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm which Pro generation is on the bench before giving the repair path." },
        { title: "Repair risk explained",
description: "We explain how power draw, battery wear, and USB-C charging consistency can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 15-inch 2016-2017 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 15-inch 2016-2017 to Ringwood Square for battery replacement",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Tell us which side normally charges and bring the charger used at your desk.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 15-inch 2016-2017 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 15-inch 2016-2017 battery replacement?",
      body: "Bring the MacBook Pro 15-inch 2016-2017 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 15-inch 2016-2017 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 15-inch 2016-2017 so power behaviour can be checked properly.",
        "The MacBook Pro 15-inch 2016-2017 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-15-2016-2017|charging-port-replacement": {
    modelName: "MacBook Pro 15-inch 2016-2017",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 15-inch 2016-2017 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "The MacBook Pro 15-inch 2016-2017 charging path is reviewed across cable fit, port-bank behaviour, and battery reporting first.",
    quickAnswer: "The larger early USB-C Pro gets port-bank, adapter, and battery checks before charging repair is approved.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We check the obvious fault and the nearby risks first. We test known-good charging gear, inspect debris or damage, and check USB-C port-bank behaviour and adapter fit.",
bestFor: "Charging complaints where the adapter and cable need to be separated from the port.",
notes: "If simple testing explains the issue, we keep the recommendation practical." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 15-inch 2016-2017 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Port-level symptoms that remain after simple charger checks.",
notes: "The quote stays tied to the confirmed charging-path fault, not a blanket no-power promise." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 15-inch 2016-2017 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "We compare charging gear, battery behaviour, and port fit before quoting the work." },
      { title: "Loose or unreliable fit",
description: "USB-C port-bank behaviour and adapter fit can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and USB-C port-bank behaviour and adapter fit." },
      { step: "02",
title: "Test known-good gear",
description: "USB-C adapter and cable behaviour are checked against the reported symptom." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 15-inch 2016-2017." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 15-inch 2016-2017 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 15-inch 2016-2017 with known-good gear, inspect USB-C port-bank behaviour and adapter fit, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 15-inch 2016-2017 for charging repair?",
        answer: "Tell us which side normally charges and bring the charger used at your desk. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 15-inch 2016-2017 port works but another does not?",
        answer: "We compare the available charging points for this larger early USB-C Intel Pro and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 15-inch 2016-2017?",
        answer: "For this USB-C model, cable orientation, adapter behaviour, and port fit are compared before quoting."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 15-inch 2016-2017 charging?",
        answer: "Yes. We check the MacBook Pro 15-inch 2016-2017 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 15-inch 2016-2017 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 15-inch 2016-2017 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 15-inch 2016-2017 charging port repair in Ringwood",
      intro: "MacBook Pro 15-inch 2016-2017 charging repair is scoped from the charger setup first, then USB-C port-bank behaviour and adapter fit, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "The visible condition and model family are checked together before pricing is confirmed." },
        { title: "Repair risk explained",
description: "We explain how USB-C port-bank behaviour and adapter fit can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 15-inch 2016-2017 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 15-inch 2016-2017 to Ringwood Square for charging port repair",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Tell us which side normally charges and bring the charger used at your desk.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 15-inch 2016-2017 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 15-inch 2016-2017 charging port repair?",
      body: "Bring the MacBook Pro 15-inch 2016-2017 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 15-inch 2016-2017 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 15-inch 2016-2017 charging fault.",
        "The MacBook Pro 15-inch 2016-2017 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-13-2018-2020|screen-replacement": {
    modelName: "MacBook Pro 13-inch 2018-2020",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 13-inch 2018-2020 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "If the MacBook Pro 13-inch 2018-2020 display is cracked, lined, or fading in and out, we confirm the repair path at the bench first.",
    quickAnswer: "For a later Intel 13-inch Pro, we test Retina output, camera-area behaviour, and lid angle before confirming screen replacement.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Start with the symptom, not the part. We test brightness, lines, flicker, external output, and Retina output, lid angle, and camera-area function on this later Intel USB-C Pro.",
bestFor: "Cracked displays, black image, line faults, flicker, or faults that change when the lid moves.",
notes: "Quote, part path, and fit risk are confirmed before approved repair work starts." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 13-inch 2018-2020.",
bestFor: "Customers who want the main screen-related functions checked before handover.",
notes: "Any unrelated housing, battery, or board concern is explained separately before extra work." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 13-inch 2018-2020 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because Retina output, lid angle, and camera-area function can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this later Intel USB-C Pro can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and Retina output, lid angle, and camera-area function." },
      { step: "02",
title: "Confirm display symptoms",
description: "We test brightness, lines, flicker, external display behaviour, and sleep/wake response where they apply." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 13-inch 2018-2020." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 13-inch 2018-2020 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 13-inch 2018-2020 panel output, lid angle, hinge feel, and Retina output, lid angle, and camera-area function. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 13-inch 2018-2020 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 13-inch 2018-2020 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 13-inch 2018-2020 with an external display?",
        answer: "Where it helps the MacBook Pro 13-inch 2018-2020 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 13-inch 2018-2020 lid, hinge, frame, and camera area?",
        answer: "Yes. The later Intel USB-C Pro is checked for Retina output, lid angle, and camera-area function, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 13-inch 2018-2020 before screen work?",
        answer: "If the MacBook Pro 13-inch 2018-2020 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 13-inch 2018-2020 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 13-inch 2018-2020 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch 2018-2020 screen replacement in Ringwood",
      intro: "MacBook Pro 13-inch 2018-2020 screen assessment starts with the customer-visible symptom, then checks Retina output, lid angle, and camera-area function before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the exact Pro family and visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how Retina output, lid angle, and camera-area function can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch 2018-2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch 2018-2020 to Ringwood Square for screen replacement",
      intro: "This later Intel USB-C Pro often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring any USB-C hub or dock used when the issue first appeared.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 13-inch 2018-2020 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch 2018-2020 screen replacement?",
      body: "Book the MacBook Pro 13-inch 2018-2020 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch 2018-2020 screen replacement.",
        "Tell us if the MacBook Pro 13-inch 2018-2020 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 13-inch 2018-2020 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-13-2018-2020|battery-replacement": {
    modelName: "MacBook Pro 13-inch 2018-2020",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 13-inch 2018-2020 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Daily-work MacBook Pro 13-inch 2018-2020 battery repair starts by checking runtime, adapter response, and any top-case pressure signs.",
    quickAnswer: "On the later Intel 13-inch Pro, runtime complaints are compared with USB-C power response and top-case pressure.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "The bench check is practical and model-aware. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and runtime, top-case pressure, and USB-C power response.",
bestFor: "Short runtime, sudden shutdowns, service warnings, swelling concern, or poor charge hold.",
notes: "Charging response is checked as well, because a power issue is not always only the battery." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this later Intel USB-C Pro, we confirm availability, quote, and the practical handover checks.",
bestFor: "MacBooks with confirmed battery wear and stable charging behaviour.",
notes: "Timing is confirmed after inspection and part availability, not promised before assessment." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 13-inch 2018-2020 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check runtime, top-case pressure, and USB-C power response before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 13-inch 2018-2020 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We test USB-C charging, inspect for pressure signs, and confirm battery replacement is the right path." },
      { step: "03",
title: "Run handover power checks",
description: "Before handover, we check charging response, startup stability, trackpad feel, and practical battery behaviour." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 13-inch 2018-2020 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and USB-C charger response on the MacBook Pro 13-inch 2018-2020 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 13-inch 2018-2020 for battery service?",
        answer: "Back up important files first if the MacBook Pro 13-inch 2018-2020 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 13-inch 2018-2020?",
        answer: "Yes. Pressure around the MacBook Pro 13-inch 2018-2020 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 13-inch 2018-2020 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 13-inch 2018-2020 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 13-inch 2018-2020 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 13-inch 2018-2020 battery replacement?",
        answer: "Back up important files if the MacBook Pro 13-inch 2018-2020 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch 2018-2020 battery replacement in Ringwood",
      intro: "MacBook Pro 13-inch 2018-2020 battery diagnosis links real runtime behaviour with USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "The MacBook Pro model and outer condition are checked before the quote is confirmed." },
        { title: "Repair risk explained",
description: "We explain how runtime, top-case pressure, and USB-C power response can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch 2018-2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch 2018-2020 to Ringwood Square for battery replacement",
      intro: "This later Intel USB-C Pro often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring any USB-C hub or dock used when the issue first appeared.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 13-inch 2018-2020 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch 2018-2020 battery replacement?",
      body: "Bring the MacBook Pro 13-inch 2018-2020 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch 2018-2020 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 13-inch 2018-2020 so power behaviour can be checked properly.",
        "The MacBook Pro 13-inch 2018-2020 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-13-2018-2020|charging-port-replacement": {
    modelName: "MacBook Pro 13-inch 2018-2020",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 13-inch 2018-2020 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "USB-C dropouts on MacBook Pro 13-inch 2018-2020 are checked alongside dock or accessory behaviour before repair approval.",
    quickAnswer: "For the later Intel 13-inch Pro, dock or accessory behaviour can matter, so we test more than one charging setup.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We keep the diagnosis plain and tied to how you use the MacBook. We test known-good charging gear, inspect debris or damage, and check USB-C charging and accessory port consistency.",
bestFor: "No charge response, loose cable fit, charging at one angle, or intermittent power.",
notes: "If the cable, adapter, or debris is the cause, we do not push unnecessary port work." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 13-inch 2018-2020 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Repeated charger dropouts, unstable power delivery, or visible connector wear.",
notes: "A port repair is not promised to fix board-level or battery-related no-power faults." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 13-inch 2018-2020 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "The cause can be the adapter, cable, battery, port, or deeper power path, so we test before quoting." },
      { title: "Loose or unreliable fit",
description: "USB-C charging and accessory port consistency can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and USB-C charging and accessory port consistency." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and USB-C charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 13-inch 2018-2020." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 13-inch 2018-2020 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 13-inch 2018-2020 with known-good gear, inspect USB-C charging and accessory port consistency, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 13-inch 2018-2020 for charging repair?",
        answer: "Bring any USB-C hub or dock used when the issue first appeared. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 13-inch 2018-2020 port works but another does not?",
        answer: "We compare the available charging points for this later Intel USB-C Pro and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 13-inch 2018-2020?",
        answer: "For this USB-C model, cable orientation, adapter behaviour, and port fit are compared before quoting."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 13-inch 2018-2020 charging?",
        answer: "Yes. We check the MacBook Pro 13-inch 2018-2020 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 13-inch 2018-2020 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 13-inch 2018-2020 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch 2018-2020 charging port repair in Ringwood",
      intro: "MacBook Pro 13-inch 2018-2020 charging repair is scoped from the charger setup first, then USB-C charging and accessory port consistency, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We identify the Pro generation first, then inspect the visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how USB-C charging and accessory port consistency can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch 2018-2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch 2018-2020 to Ringwood Square for charging port repair",
      intro: "This later Intel USB-C Pro often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring any USB-C hub or dock used when the issue first appeared.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 13-inch 2018-2020 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch 2018-2020 charging port repair?",
      body: "Bring the MacBook Pro 13-inch 2018-2020 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch 2018-2020 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 13-inch 2018-2020 charging fault.",
        "The MacBook Pro 13-inch 2018-2020 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-16-2019|screen-replacement": {
    modelName: "MacBook Pro 16-inch 2019",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 16-inch 2019 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "MacBook Pro 16-inch 2019 screen symptoms are checked alongside heat-use history, hinge load, and normal startup behaviour before quoting.",
    quickAnswer: "A 16-inch Intel Pro screen issue is checked with the larger display assembly and heat-use history in mind before quoting.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Before quoting, we separate the visible fault from the cause. We test brightness, lines, flicker, external output, and large display assembly, hinge load, and heat-use history on this 16-inch Intel Pro workstation body.",
bestFor: "Screens with cracks, dark sections, display lines, flicker, or lid-angle cut-outs.",
notes: "We confirm the quote, suitable part path, and any fit concern before work begins." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 16-inch 2019.",
bestFor: "Useful when you want display, camera-area, and lid behaviour checked before handover.",
notes: "If another housing, battery, or board issue appears, we explain it before extra work is considered." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 16-inch 2019 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because large display assembly, hinge load, and heat-use history can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this larger Intel Pro workstation body can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and large display assembly, hinge load, and heat-use history." },
      { step: "02",
title: "Confirm display symptoms",
description: "Display output, brightness control, flicker, lines, external monitor behaviour, and sleep/wake response are checked." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 16-inch 2019." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 16-inch 2019 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 16-inch 2019 panel output, lid angle, hinge feel, and large display assembly, hinge load, and heat-use history. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 16-inch 2019 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 16-inch 2019 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 16-inch 2019 with an external display?",
        answer: "Where it helps the MacBook Pro 16-inch 2019 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 16-inch 2019 lid, hinge, frame, and camera area?",
        answer: "Yes. The larger Intel Pro workstation is checked for large display assembly, hinge load, and heat-use history, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 16-inch 2019 before screen work?",
        answer: "If the MacBook Pro 16-inch 2019 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 16-inch 2019 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 16-inch 2019 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 16-inch 2019 screen replacement in Ringwood",
      intro: "MacBook Pro 16-inch 2019 screen assessment starts with the customer-visible symptom, then checks large display assembly, hinge load, and heat-use history before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "Model family, housing condition, and reported symptoms are matched before the quote." },
        { title: "Repair risk explained",
description: "We explain how large display assembly, hinge load, and heat-use history can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 16-inch 2019 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 16-inch 2019 to Ringwood Square for screen replacement",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the higher-wattage charger you rely on, not only a travel adapter.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 16-inch 2019 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 16-inch 2019 screen replacement?",
      body: "Book the MacBook Pro 16-inch 2019 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 16-inch 2019 screen replacement.",
        "Tell us if the MacBook Pro 16-inch 2019 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 16-inch 2019 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-16-2019|battery-replacement": {
    modelName: "MacBook Pro 16-inch 2019",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 16-inch 2019 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "MacBook Pro 16-inch 2019 battery replacement is confirmed after power delivery, heat-use, and charge reporting are reviewed.",
    quickAnswer: "A 16-inch Intel Pro battery diagnosis includes power delivery, heat-use history, and shutdown behaviour before quoting.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "A quick look is not enough for this repair path. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and high-power battery demand and USB-C charging response.",
bestFor: "Fast battery drain, shutdowns under load, warning messages, or pressure around the trackpad.",
notes: "We test the charger behaviour too, so a cable or port issue is not mistaken for battery wear." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this 16-inch Intel Pro workstation body, we confirm availability, quote, and the practical handover checks.",
bestFor: "Battery-wear cases where the charger and port response look stable.",
notes: "We confirm timing once the MacBook has been checked and the part path is known." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 16-inch 2019 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check high-power battery demand and USB-C charging response before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 16-inch 2019 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "USB-C charging response and pressure signs are checked before battery replacement is approved." },
      { step: "03",
title: "Run handover power checks",
description: "Handover checks cover charging response, startup behaviour, trackpad feel, and basic battery stability." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 16-inch 2019 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and USB-C charger response on the MacBook Pro 16-inch 2019 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 16-inch 2019 for battery service?",
        answer: "Back up important files first if the MacBook Pro 16-inch 2019 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 16-inch 2019?",
        answer: "Yes. Pressure around the MacBook Pro 16-inch 2019 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 16-inch 2019 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 16-inch 2019 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 16-inch 2019 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 16-inch 2019 battery replacement?",
        answer: "Back up important files if the MacBook Pro 16-inch 2019 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 16-inch 2019 battery replacement in Ringwood",
      intro: "MacBook Pro 16-inch 2019 battery diagnosis links real runtime behaviour with USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm which Pro generation is on the bench before giving the repair path." },
        { title: "Repair risk explained",
description: "We explain how high-power battery demand and USB-C charging response can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 16-inch 2019 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 16-inch 2019 to Ringwood Square for battery replacement",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the higher-wattage charger you rely on, not only a travel adapter.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 16-inch 2019 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 16-inch 2019 battery replacement?",
      body: "Bring the MacBook Pro 16-inch 2019 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 16-inch 2019 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 16-inch 2019 so power behaviour can be checked properly.",
        "The MacBook Pro 16-inch 2019 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-16-2019|charging-port-replacement": {
    modelName: "MacBook Pro 16-inch 2019",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 16-inch 2019 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "MacBook Pro 16-inch 2019 charging repair is scoped after power delivery, cable seating, and battery reporting checks.",
    quickAnswer: "A 16-inch Intel Pro needs power-delivery checks before port work, especially if charging drops under load.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We check the obvious fault and the nearby risks first. We test known-good charging gear, inspect debris or damage, and check USB-C power delivery, cable seating, and port-bank behaviour.",
bestFor: "MacBooks with no charge, wobbly cable fit, or power that cuts in and out.",
notes: "When a charger or cleaning fix explains the fault, we keep the repair scope smaller." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 16-inch 2019 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Charging faults that keep returning after cable and adapter checks.",
notes: "Board-level or battery-related no-power faults are explained separately from port repair." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 16-inch 2019 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "A no-charge fault can come from several places, so charger, cable, battery, and port checks come first." },
      { title: "Loose or unreliable fit",
description: "USB-C power delivery, cable seating, and port-bank behaviour can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and USB-C power delivery, cable seating, and port-bank behaviour." },
      { step: "02",
title: "Test known-good gear",
description: "We compare USB-C cable fit, adapter behaviour, and charging response before quoting." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 16-inch 2019." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 16-inch 2019 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 16-inch 2019 with known-good gear, inspect USB-C power delivery, cable seating, and port-bank behaviour, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 16-inch 2019 for charging repair?",
        answer: "Bring the higher-wattage charger you rely on, not only a travel adapter. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 16-inch 2019 port works but another does not?",
        answer: "We compare the available charging points for this larger Intel Pro workstation and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 16-inch 2019?",
        answer: "For this USB-C model, cable orientation, adapter behaviour, and port fit are compared before quoting."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 16-inch 2019 charging?",
        answer: "Yes. We check the MacBook Pro 16-inch 2019 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 16-inch 2019 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 16-inch 2019 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 16-inch 2019 charging port repair in Ringwood",
      intro: "MacBook Pro 16-inch 2019 charging repair is scoped from the charger setup first, then USB-C power delivery, cable seating, and port-bank behaviour, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "The visible condition and model family are checked together before pricing is confirmed." },
        { title: "Repair risk explained",
description: "We explain how USB-C power delivery, cable seating, and port-bank behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 16-inch 2019 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 16-inch 2019 to Ringwood Square for charging port repair",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the higher-wattage charger you rely on, not only a travel adapter.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 16-inch 2019 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 16-inch 2019 charging port repair?",
      body: "Bring the MacBook Pro 16-inch 2019 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 16-inch 2019 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 16-inch 2019 charging fault.",
        "The MacBook Pro 16-inch 2019 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-13-m1-2020|screen-replacement": {
    modelName: "MacBook Pro 13-inch M1 2020",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 13-inch M1 2020 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Display work on the MacBook Pro 13-inch M1 2020 is confirmed only after screen output, sleep/wake behaviour, and housing condition are reviewed.",
    quickAnswer: "The M1 13-inch Pro screen path starts with display output, startup checks, and sleep/wake behaviour rather than a quick visual guess.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Start with the symptom, not the part. We test brightness, lines, flicker, external output, and display output with Apple-silicon boot and sleep/wake checks on this M1 13-inch Pro platform.",
bestFor: "MacBooks showing panel cracks, no image, coloured lines, flicker, or movement-related faults.",
notes: "The repair scope, quote, and lid-fit risk are explained before approval." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 13-inch M1 2020.",
bestFor: "For customers who want the visible screen functions retested before handover.",
notes: "Separate faults are reported before we discuss any extra repair scope." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 13-inch M1 2020 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because display output with Apple-silicon boot and sleep/wake checks can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this Apple-silicon 13-inch Pro can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and display output with Apple-silicon boot and sleep/wake checks." },
      { step: "02",
title: "Confirm display symptoms",
description: "We compare the built-in screen with external output, then check brightness, lines, flicker, and sleep/wake behaviour." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 13-inch M1 2020." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 13-inch M1 2020 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 13-inch M1 2020 panel output, lid angle, hinge feel, and display output with Apple-silicon boot and sleep/wake checks. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 13-inch M1 2020 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 13-inch M1 2020 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 13-inch M1 2020 with an external display?",
        answer: "Where it helps the MacBook Pro 13-inch M1 2020 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 13-inch M1 2020 lid, hinge, frame, and camera area?",
        answer: "Yes. The Apple-silicon 13-inch Pro is checked for Apple-silicon boot and sleep/wake display checks, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 13-inch M1 2020 before screen work?",
        answer: "If the MacBook Pro 13-inch M1 2020 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 13-inch M1 2020 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 13-inch M1 2020 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch M1 2020 screen replacement in Ringwood",
      intro: "MacBook Pro 13-inch M1 2020 screen assessment starts with the customer-visible symptom, then checks display output with Apple-silicon boot and sleep/wake checks before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the exact Pro family and visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how display output with Apple-silicon boot and sleep/wake checks can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch M1 2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch M1 2020 to Ringwood Square for screen replacement",
      intro: "Because this is compact M1 Pro used for steady work or study, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Mention whether the issue appears after sleep, restart, or a flat battery.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 13-inch M1 2020 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch M1 2020 screen replacement?",
      body: "Book the MacBook Pro 13-inch M1 2020 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch M1 2020 screen replacement.",
        "Tell us if the MacBook Pro 13-inch M1 2020 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 13-inch M1 2020 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-13-m1-2020|battery-replacement": {
    modelName: "MacBook Pro 13-inch M1 2020",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 13-inch M1 2020 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "An efficient Apple-silicon 13-inch Pro can still develop battery faults; we check real symptoms before recommending replacement.",
    quickAnswer: "The M1 13-inch Pro usually has strong runtime, so a sudden change gets checked against charger and startup behaviour first.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "The bench check is practical and model-aware. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and efficient M1 runtime compared with real charging behaviour.",
bestFor: "MacBooks with poor charge hold, unexpected shutdowns, swelling signs, or battery warnings.",
notes: "The charger and port response are checked before we treat the battery as the confirmed fault." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this M1 13-inch Pro platform, we confirm availability, quote, and the practical handover checks.",
bestFor: "MacBooks where inspection points to battery wear rather than charger trouble.",
notes: "Turnaround is discussed after inspection and availability checks." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 13-inch M1 2020 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check efficient M1 runtime compared with real charging behaviour before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 13-inch M1 2020 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We compare USB-C charging behaviour with swelling signs before confirming the battery path." },
      { step: "03",
title: "Run handover power checks",
description: "We retest startup, charging response, trackpad feel, and normal battery behaviour before handover." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 13-inch M1 2020 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and USB-C charger response on the MacBook Pro 13-inch M1 2020 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 13-inch M1 2020 for battery service?",
        answer: "Back up important files first if the MacBook Pro 13-inch M1 2020 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 13-inch M1 2020?",
        answer: "Yes. Pressure around the MacBook Pro 13-inch M1 2020 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 13-inch M1 2020 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 13-inch M1 2020 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 13-inch M1 2020 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 13-inch M1 2020 battery replacement?",
        answer: "Back up important files if the MacBook Pro 13-inch M1 2020 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch M1 2020 battery replacement in Ringwood",
      intro: "MacBook Pro 13-inch M1 2020 battery diagnosis links real runtime behaviour with USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "The MacBook Pro model and outer condition are checked before the quote is confirmed." },
        { title: "Repair risk explained",
description: "We explain how efficient M1 runtime compared with real charging behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch M1 2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch M1 2020 to Ringwood Square for battery replacement",
      intro: "Because this is compact M1 Pro used for steady work or study, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Mention whether the issue appears after sleep, restart, or a flat battery.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 13-inch M1 2020 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch M1 2020 battery replacement?",
      body: "Bring the MacBook Pro 13-inch M1 2020 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch M1 2020 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 13-inch M1 2020 so power behaviour can be checked properly.",
        "The MacBook Pro 13-inch M1 2020 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-13-m1-2020|charging-port-replacement": {
    modelName: "MacBook Pro 13-inch M1 2020",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 13-inch M1 2020 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "Charging trouble on this Apple-silicon 13-inch Pro is checked with adapter combinations before port work is approved.",
    quickAnswer: "The M1 13-inch Pro charging path is checked with adapter combinations and startup response before repair scope is set.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We keep the diagnosis plain and tied to how you use the MacBook. We test known-good charging gear, inspect debris or damage, and check USB-C charging response and adapter combinations.",
bestFor: "Charging faults where cable movement changes the connection.",
notes: "If testing points to the cable, adapter, or debris, we explain that before quoting port work." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 13-inch M1 2020 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Cases where the connector feels worn or power delivery is unstable.",
notes: "We do not treat port replacement as a guaranteed fix for deeper power faults." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 13-inch M1 2020 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "We test the simple causes before quoting because the issue may not be the port itself." },
      { title: "Loose or unreliable fit",
description: "USB-C charging response and adapter combinations can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and USB-C charging response and adapter combinations." },
      { step: "02",
title: "Test known-good gear",
description: "Known-good USB-C gear is tested before the repair path is set." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 13-inch M1 2020." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 13-inch M1 2020 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 13-inch M1 2020 with known-good gear, inspect USB-C charging response and adapter combinations, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 13-inch M1 2020 for charging repair?",
        answer: "Mention whether the issue appears after sleep, restart, or a flat battery. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 13-inch M1 2020 port works but another does not?",
        answer: "We compare the available charging points for this Apple-silicon 13-inch Pro and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 13-inch M1 2020?",
        answer: "For this USB-C model, cable orientation, adapter behaviour, and port fit are compared before quoting."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 13-inch M1 2020 charging?",
        answer: "Yes. We check the MacBook Pro 13-inch M1 2020 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 13-inch M1 2020 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 13-inch M1 2020 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch M1 2020 charging port repair in Ringwood",
      intro: "MacBook Pro 13-inch M1 2020 charging repair is scoped from the charger setup first, then USB-C charging response and adapter combinations, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We identify the Pro generation first, then inspect the visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how USB-C charging response and adapter combinations can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch M1 2020 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch M1 2020 to Ringwood Square for charging port repair",
      intro: "Because this is compact M1 Pro used for steady work or study, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Mention whether the issue appears after sleep, restart, or a flat battery.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 13-inch M1 2020 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch M1 2020 charging port repair?",
      body: "Bring the MacBook Pro 13-inch M1 2020 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch M1 2020 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 13-inch M1 2020 charging fault.",
        "The MacBook Pro 13-inch M1 2020 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-14-16-m1-pro-max-2021|screen-replacement": {
    modelName: "MacBook Pro 14/16-inch M1 Pro/Max 2021",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 14/16-inch M1 Pro/Max 2021 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "This Apple-silicon Pro generation screen assessment focuses on the visible fault, lid alignment, and camera-notch area before approval.",
    quickAnswer: "On this M1 Pro/Max generation, we check the display assembly, notch area, and lid alignment before approving screen work.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Before quoting, we separate the visible fault from the cause. We test brightness, lines, flicker, external output, and display assembly condition, lid alignment, and camera-notch area on this M1 Pro/Max generation.",
bestFor: "Display faults where damage, lines, black image, or lid movement affects normal use.",
notes: "Part availability, quoted scope, and fit risk are checked before the MacBook is opened." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 14/16-inch M1 Pro/Max 2021.",
bestFor: "Helpful when the display fault affected normal work and you want handover checks done.",
notes: "A screen repair does not hide other issues; we explain unrelated findings before proceeding." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 14/16-inch M1 Pro/Max 2021 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because display assembly condition, lid alignment, and camera-notch area can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this Apple-silicon Pro/Max generation can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and display assembly condition, lid alignment, and camera-notch area." },
      { step: "02",
title: "Confirm display symptoms",
description: "The display check covers image output, brightness changes, line faults, flicker, and lid-related sleep or wake response." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 14/16-inch M1 Pro/Max 2021." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 14/16-inch M1 Pro/Max 2021 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 14/16-inch M1 Pro/Max 2021 panel output, lid angle, hinge feel, and display assembly condition, lid alignment, and camera-notch area. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 14/16-inch M1 Pro/Max 2021 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 14/16-inch M1 Pro/Max 2021 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 14/16-inch M1 Pro/Max 2021 with an external display?",
        answer: "Where it helps the MacBook Pro 14/16-inch M1 Pro/Max 2021 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 14/16-inch M1 Pro/Max 2021 lid, hinge, frame, and camera area?",
        answer: "Yes. The Apple-silicon Pro generation is checked for display assembly, lid alignment, and camera-notch area, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 14/16-inch M1 Pro/Max 2021 before screen work?",
        answer: "If the MacBook Pro 14/16-inch M1 Pro/Max 2021 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 14/16-inch M1 Pro/Max 2021 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 14/16-inch M1 Pro/Max 2021 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 14/16-inch M1 Pro/Max 2021 screen replacement in Ringwood",
      intro: "MacBook Pro 14/16-inch M1 Pro/Max 2021 screen assessment starts with the customer-visible symptom, then checks display assembly condition, lid alignment, and camera-notch area before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "Model family, housing condition, and reported symptoms are matched before the quote." },
        { title: "Repair risk explained",
description: "We explain how display assembly condition, lid alignment, and camera-notch area can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 14/16-inch M1 Pro/Max 2021 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 14/16-inch M1 Pro/Max 2021 to Ringwood Square for screen replacement",
      intro: "Ringwood locals usually bring this MacBook Pro in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe 3 lead and any USB-C charger or dock used with it.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 14/16-inch M1 Pro/Max 2021 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 14/16-inch M1 Pro/Max 2021 screen replacement?",
      body: "Book the MacBook Pro 14/16-inch M1 Pro/Max 2021 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 14/16-inch M1 Pro/Max 2021 screen replacement.",
        "Tell us if the MacBook Pro 14/16-inch M1 Pro/Max 2021 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 14/16-inch M1 Pro/Max 2021 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-14-16-m1-pro-max-2021|battery-replacement": {
    modelName: "MacBook Pro 14/16-inch M1 Pro/Max 2021",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 14/16-inch M1 Pro/Max 2021 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Battery concerns on this Pro generation are checked against MagSafe 3, USB-C, and workload behaviour before quoting.",
    quickAnswer: "For this M1 Pro/Max generation, battery symptoms are read alongside MagSafe 3, USB-C, and heavier workload habits.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "A quick look is not enough for this repair path. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and Pro/Max workload demand checked against actual charging behaviour.",
bestFor: "Battery complaints involving short runtime, heat, shutdowns, or possible top-case pressure.",
notes: "We include charging checks before recommending battery replacement." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this M1 Pro/Max generation, we confirm availability, quote, and the practical handover checks.",
bestFor: "Confirmed battery faults after charging response has been checked.",
notes: "We do not promise timing until the repair scope and parts are confirmed." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 14/16-inch M1 Pro/Max 2021 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check Pro/Max workload demand checked against actual charging behaviour before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe 3 and USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 14/16-inch M1 Pro/Max 2021 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We test MagSafe 3 and USB-C charging, inspect for pressure signs, and confirm battery replacement is the right path." },
      { step: "03",
title: "Run handover power checks",
description: "Final checks include charge response, stable startup, trackpad feel, and day-to-day battery behaviour." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 14/16-inch M1 Pro/Max 2021 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe 3 or USB-C charger response on the MacBook Pro 14/16-inch M1 Pro/Max 2021 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 14/16-inch M1 Pro/Max 2021 for battery service?",
        answer: "Back up important files first if the MacBook Pro 14/16-inch M1 Pro/Max 2021 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 14/16-inch M1 Pro/Max 2021?",
        answer: "Yes. Pressure around the MacBook Pro 14/16-inch M1 Pro/Max 2021 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 14/16-inch M1 Pro/Max 2021 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 14/16-inch M1 Pro/Max 2021 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 14/16-inch M1 Pro/Max 2021 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe 3 and USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 14/16-inch M1 Pro/Max 2021 battery replacement?",
        answer: "Back up important files if the MacBook Pro 14/16-inch M1 Pro/Max 2021 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 14/16-inch M1 Pro/Max 2021 battery replacement in Ringwood",
      intro: "MacBook Pro 14/16-inch M1 Pro/Max 2021 battery diagnosis links real runtime behaviour with MagSafe 3 or USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm which Pro generation is on the bench before giving the repair path." },
        { title: "Repair risk explained",
description: "We explain how Pro/Max workload demand checked against actual charging behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 14/16-inch M1 Pro/Max 2021 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 14/16-inch M1 Pro/Max 2021 to Ringwood Square for battery replacement",
      intro: "Ringwood locals usually bring this MacBook Pro in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe 3 lead and any USB-C charger or dock used with it.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 14/16-inch M1 Pro/Max 2021 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 14/16-inch M1 Pro/Max 2021 battery replacement?",
      body: "Bring the MacBook Pro 14/16-inch M1 Pro/Max 2021 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 14/16-inch M1 Pro/Max 2021 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 14/16-inch M1 Pro/Max 2021 so power behaviour can be checked properly.",
        "The MacBook Pro 14/16-inch M1 Pro/Max 2021 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-14-16-m1-pro-max-2021|charging-port-replacement": {
    modelName: "MacBook Pro 14/16-inch M1 Pro/Max 2021",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 14/16-inch M1 Pro/Max 2021 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "For this Pro generation, charging checks include MagSafe 3 seating, USB-C behaviour, and startup response.",
    quickAnswer: "This M1 Pro/Max generation can charge through MagSafe 3 or USB-C, so both paths are checked before port work.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We check the obvious fault and the nearby risks first. We test known-good charging gear, inspect debris or damage, and check MagSafe 3 seating plus USB-C charging behaviour.",
bestFor: "Loose fit, no charging light or response, and unreliable power delivery.",
notes: "We avoid port replacement when cleaning or charger testing resolves the symptom." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 14/16-inch M1 Pro/Max 2021 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "MacBooks with repeated dropouts after known-good charging gear is tested.",
notes: "If the fault sits beyond the port, we explain that before work continues." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 14/16-inch M1 Pro/Max 2021 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "Adapter, cable, battery, connector, and power-path faults are separated during diagnosis." },
      { title: "Loose or unreliable fit",
description: "MagSafe 3 seating plus USB-C charging behaviour can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe 3 seating plus USB-C charging behaviour." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe 3 and USB-C charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 14/16-inch M1 Pro/Max 2021." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 14/16-inch M1 Pro/Max 2021 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 14/16-inch M1 Pro/Max 2021 with known-good gear, inspect MagSafe 3 seating plus USB-C charging behaviour, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 14/16-inch M1 Pro/Max 2021 for charging repair?",
        answer: "Bring the MagSafe 3 lead and any USB-C charger or dock used with it. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 14/16-inch M1 Pro/Max 2021 port works but another does not?",
        answer: "We compare the available charging points for this Apple-silicon Pro generation and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 14/16-inch M1 Pro/Max 2021?",
        answer: "Because this model can involve MagSafe 3 and USB-C charging, we check both paths when your symptoms point that way."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 14/16-inch M1 Pro/Max 2021 charging?",
        answer: "Yes. We check the MacBook Pro 14/16-inch M1 Pro/Max 2021 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 14/16-inch M1 Pro/Max 2021 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 14/16-inch M1 Pro/Max 2021 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 14/16-inch M1 Pro/Max 2021 charging port repair in Ringwood",
      intro: "MacBook Pro 14/16-inch M1 Pro/Max 2021 charging repair is scoped from the charger setup first, then MagSafe 3 seating plus USB-C charging behaviour, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "The visible condition and model family are checked together before pricing is confirmed." },
        { title: "Repair risk explained",
description: "We explain how MagSafe 3 seating plus USB-C charging behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 14/16-inch M1 Pro/Max 2021 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 14/16-inch M1 Pro/Max 2021 to Ringwood Square for charging port repair",
      intro: "Ringwood locals usually bring this MacBook Pro in when the fault is starting to interrupt work, study, or travel plans. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the MagSafe 3 lead and any USB-C charger or dock used with it.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 14/16-inch M1 Pro/Max 2021 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 14/16-inch M1 Pro/Max 2021 charging port repair?",
      body: "Bring the MacBook Pro 14/16-inch M1 Pro/Max 2021 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 14/16-inch M1 Pro/Max 2021 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 14/16-inch M1 Pro/Max 2021 charging fault.",
        "The MacBook Pro 14/16-inch M1 Pro/Max 2021 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-13-m2-2022|screen-replacement": {
    modelName: "MacBook Pro 13-inch M2 2022",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 13-inch M2 2022 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "A MacBook Pro 13-inch M2 2022 with a damaged display gets model-aware checks for panel output, lid fit, and charging response at handover.",
    quickAnswer: "For the 13-inch M2 Pro, a lined or dark panel is checked against sleep/wake behaviour and normal startup first.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Start with the symptom, not the part. We test brightness, lines, flicker, external output, and Retina panel output and sleep/wake behaviour on this M2 13-inch Pro update.",
bestFor: "Cracked panels, unstable image, flickering output, or screen faults linked to lid position.",
notes: "You get the quote and screen-fit notes before approved repair work starts." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 13-inch M2 2022.",
bestFor: "For MacBooks where screen output, lid feel, and startup need one final check.",
notes: "If testing shows another fault, we separate it from the approved screen work." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 13-inch M2 2022 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because Retina panel output and sleep/wake behaviour can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this Apple-silicon 13-inch Pro update can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and Retina panel output and sleep/wake behaviour." },
      { step: "02",
title: "Confirm display symptoms",
description: "We look at screen image, backlight behaviour, flicker, external display output, and whether sleep/wake acts normally." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 13-inch M2 2022." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 13-inch M2 2022 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 13-inch M2 2022 panel output, lid angle, hinge feel, and Retina panel output and sleep/wake behaviour. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 13-inch M2 2022 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 13-inch M2 2022 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 13-inch M2 2022 with an external display?",
        answer: "Where it helps the MacBook Pro 13-inch M2 2022 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 13-inch M2 2022 lid, hinge, frame, and camera area?",
        answer: "Yes. The Apple-silicon 13-inch Pro update is checked for Retina panel output and sleep/wake behaviour, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 13-inch M2 2022 before screen work?",
        answer: "If the MacBook Pro 13-inch M2 2022 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 13-inch M2 2022 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 13-inch M2 2022 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch M2 2022 screen replacement in Ringwood",
      intro: "MacBook Pro 13-inch M2 2022 screen assessment starts with the customer-visible symptom, then checks Retina panel output and sleep/wake behaviour before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the exact Pro family and visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how Retina panel output and sleep/wake behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch M2 2022 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch M2 2022 to Ringwood Square for screen replacement",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the USB-C charger and mention any recent power warnings or restarts.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 13-inch M2 2022 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch M2 2022 screen replacement?",
      body: "Book the MacBook Pro 13-inch M2 2022 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch M2 2022 screen replacement.",
        "Tell us if the MacBook Pro 13-inch M2 2022 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 13-inch M2 2022 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-13-m2-2022|battery-replacement": {
    modelName: "MacBook Pro 13-inch M2 2022",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 13-inch M2 2022 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "The MacBook Pro 13-inch M2 2022 battery path is decided after practical checks, not just a warning message.",
    quickAnswer: "The M2 13-inch Pro battery quote follows real power checks, not just a warning message or quick glance.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "The bench check is practical and model-aware. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and M2 runtime symptoms against charger and adapter response.",
bestFor: "Customers seeing runtime drops, charging percentage jumps, or swelling concerns.",
notes: "Battery work is not approved until charging response has been checked." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this M2 13-inch Pro update, we confirm availability, quote, and the practical handover checks.",
bestFor: "Battery replacement cases with no obvious separate charging fault.",
notes: "Availability and condition decide timing, so we confirm that after assessment." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 13-inch M2 2022 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check M2 runtime symptoms against charger and adapter response before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 13-inch M2 2022 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "The USB-C charger response is checked alongside pressure signs before quoting battery work." },
      { step: "03",
title: "Run handover power checks",
description: "The MacBook is checked for startup stability, charging response, trackpad pressure, and practical runtime behaviour." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 13-inch M2 2022 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and USB-C charger response on the MacBook Pro 13-inch M2 2022 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 13-inch M2 2022 for battery service?",
        answer: "Back up important files first if the MacBook Pro 13-inch M2 2022 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 13-inch M2 2022?",
        answer: "Yes. Pressure around the MacBook Pro 13-inch M2 2022 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 13-inch M2 2022 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 13-inch M2 2022 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 13-inch M2 2022 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 13-inch M2 2022 battery replacement?",
        answer: "Back up important files if the MacBook Pro 13-inch M2 2022 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch M2 2022 battery replacement in Ringwood",
      intro: "MacBook Pro 13-inch M2 2022 battery diagnosis links real runtime behaviour with USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "The MacBook Pro model and outer condition are checked before the quote is confirmed." },
        { title: "Repair risk explained",
description: "We explain how M2 runtime symptoms against charger and adapter response can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch M2 2022 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch M2 2022 to Ringwood Square for battery replacement",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the USB-C charger and mention any recent power warnings or restarts.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 13-inch M2 2022 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch M2 2022 battery replacement?",
      body: "Bring the MacBook Pro 13-inch M2 2022 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch M2 2022 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 13-inch M2 2022 so power behaviour can be checked properly.",
        "The MacBook Pro 13-inch M2 2022 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-13-m2-2022|charging-port-replacement": {
    modelName: "MacBook Pro 13-inch M2 2022",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 13-inch M2 2022 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "MacBook Pro 13-inch M2 2022 USB-C charging repair starts with cable fit and power draw checks before quoting.",
    quickAnswer: "For the M2 13-inch Pro, USB-C cable fit and charge reporting are checked before recommending repair.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We keep the diagnosis plain and tied to how you use the MacBook. We test known-good charging gear, inspect debris or damage, and check USB-C cable fit and charging draw consistency.",
bestFor: "Intermittent charging, angle-sensitive cables, or ports that feel worn.",
notes: "A cable or adapter fault is separated from true port damage before repair is approved." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 13-inch M2 2022 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Visible connector wear, poor cable hold, or unstable charging response.",
notes: "Battery and board faults need separate assessment from connector repair." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 13-inch M2 2022 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "No-power symptoms need testing before we name the port as the repair path." },
      { title: "Loose or unreliable fit",
description: "USB-C cable fit and charging draw consistency can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and USB-C cable fit and charging draw consistency." },
      { step: "02",
title: "Test known-good gear",
description: "USB-C adapter and cable behaviour are checked against the reported symptom." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 13-inch M2 2022." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 13-inch M2 2022 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 13-inch M2 2022 with known-good gear, inspect USB-C cable fit and charging draw consistency, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 13-inch M2 2022 for charging repair?",
        answer: "Bring the USB-C charger and mention any recent power warnings or restarts. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 13-inch M2 2022 port works but another does not?",
        answer: "We compare the available charging points for this Apple-silicon 13-inch Pro update and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 13-inch M2 2022?",
        answer: "For this USB-C model, cable orientation, adapter behaviour, and port fit are compared before quoting."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 13-inch M2 2022 charging?",
        answer: "Yes. We check the MacBook Pro 13-inch M2 2022 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 13-inch M2 2022 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 13-inch M2 2022 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 13-inch M2 2022 charging port repair in Ringwood",
      intro: "MacBook Pro 13-inch M2 2022 charging repair is scoped from the charger setup first, then USB-C cable fit and charging draw consistency, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We identify the Pro generation first, then inspect the visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how USB-C cable fit and charging draw consistency can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 13-inch M2 2022 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 13-inch M2 2022 to Ringwood Square for charging port repair",
      intro: "At Ringwood Square, the useful details are simple: what changed, which charger or cable was used, and whether the MacBook still starts. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the USB-C charger and mention any recent power warnings or restarts.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 13-inch M2 2022 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 13-inch M2 2022 charging port repair?",
      body: "Bring the MacBook Pro 13-inch M2 2022 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 13-inch M2 2022 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 13-inch M2 2022 charging fault.",
        "The MacBook Pro 13-inch M2 2022 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-14-16-m2-pro-max-2023|screen-replacement": {
    modelName: "MacBook Pro 14/16-inch M2 Pro/Max 2023",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 14/16-inch M2 Pro/Max 2023 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Ringwood screen repair advice for MacBook Pro 14/16-inch M2 Pro/Max 2023: inspect the display fault, explain the scope, then confirm quote and timing.",
    quickAnswer: "This M2 Pro/Max generation gets a screen check around the lid, camera-notch area, and display output before repair is confirmed.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Before quoting, we separate the visible fault from the cause. We test brightness, lines, flicker, external output, and display output, camera-notch area, and lid alignment for this MacBook Pro generation on this M2 Pro/Max generation.",
bestFor: "Visible screen damage, black display, line faults, or intermittent image as the lid moves.",
notes: "We separate the screen quote from any housing fit risk before proceeding." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 14/16-inch M2 Pro/Max 2023.",
bestFor: "For customers who want practical screen and startup checks before handover.",
notes: "Extra housing, power, or board concerns are discussed before any added work." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 14/16-inch M2 Pro/Max 2023 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because display output, camera-notch area, and lid alignment for this MacBook Pro generation can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this M2 Pro/Max generation can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and display output, camera-notch area, and lid alignment for this MacBook Pro generation." },
      { step: "02",
title: "Confirm display symptoms",
description: "Brightness, line faults, flicker, external display response, and sleep/wake behaviour are tested before quoting." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 14/16-inch M2 Pro/Max 2023." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 14/16-inch M2 Pro/Max 2023 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 14/16-inch M2 Pro/Max 2023 panel output, lid angle, hinge feel, and display output, camera-notch area, and lid alignment for this MacBook Pro generation. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 14/16-inch M2 Pro/Max 2023 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 14/16-inch M2 Pro/Max 2023 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 14/16-inch M2 Pro/Max 2023 with an external display?",
        answer: "Where it helps the MacBook Pro 14/16-inch M2 Pro/Max 2023 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 14/16-inch M2 Pro/Max 2023 lid, hinge, frame, and camera area?",
        answer: "Yes. The M2 Pro/Max generation is checked for display output, camera-notch area, and lid alignment, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 14/16-inch M2 Pro/Max 2023 before screen work?",
        answer: "If the MacBook Pro 14/16-inch M2 Pro/Max 2023 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 14/16-inch M2 Pro/Max 2023 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 14/16-inch M2 Pro/Max 2023 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 14/16-inch M2 Pro/Max 2023 screen replacement in Ringwood",
      intro: "MacBook Pro 14/16-inch M2 Pro/Max 2023 screen assessment starts with the customer-visible symptom, then checks display output, camera-notch area, and lid alignment for this MacBook Pro generation before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "Model family, housing condition, and reported symptoms are matched before the quote." },
        { title: "Repair risk explained",
description: "We explain how display output, camera-notch area, and lid alignment for this MacBook Pro generation can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 14/16-inch M2 Pro/Max 2023 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 14/16-inch M2 Pro/Max 2023 to Ringwood Square for screen replacement",
      intro: "This M2 Pro/Max generation often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe 3 lead, USB-C charger, and any dock that changes charging behaviour.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 14/16-inch M2 Pro/Max 2023 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 14/16-inch M2 Pro/Max 2023 screen replacement?",
      body: "Book the MacBook Pro 14/16-inch M2 Pro/Max 2023 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 14/16-inch M2 Pro/Max 2023 screen replacement.",
        "Tell us if the MacBook Pro 14/16-inch M2 Pro/Max 2023 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 14/16-inch M2 Pro/Max 2023 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-14-16-m2-pro-max-2023|battery-replacement": {
    modelName: "MacBook Pro 14/16-inch M2 Pro/Max 2023",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 14/16-inch M2 Pro/Max 2023 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "M2 Pro battery complaints are reviewed with charger behaviour, shutdown history, and quote confirmation first.",
    quickAnswer: "M2 Pro/Max battery concerns are checked against charging setup, workload symptoms, and practical handover tests.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "A quick look is not enough for this repair path. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and Pro/Max workload symptoms checked without assuming one size.",
bestFor: "Poor battery life, service messages, shutdowns, or trackpad pressure that needs checking.",
notes: "We compare battery symptoms with the charger response before confirming the path." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this M2 Pro/Max generation, we confirm availability, quote, and the practical handover checks.",
bestFor: "MacBooks showing battery wear after the power path has been checked.",
notes: "The repair window is confirmed after we inspect the MacBook and check availability." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 14/16-inch M2 Pro/Max 2023 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check Pro/Max workload symptoms checked without assuming one size before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe 3 and USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 14/16-inch M2 Pro/Max 2023 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "MagSafe 3 and USB-C response are checked with pressure signs before battery repair is approved." },
      { step: "03",
title: "Run handover power checks",
description: "We finish with charging, startup, trackpad, and battery behaviour checks before handover." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 14/16-inch M2 Pro/Max 2023 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe 3 or USB-C charger response on the MacBook Pro 14/16-inch M2 Pro/Max 2023 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 14/16-inch M2 Pro/Max 2023 for battery service?",
        answer: "Back up important files first if the MacBook Pro 14/16-inch M2 Pro/Max 2023 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 14/16-inch M2 Pro/Max 2023?",
        answer: "Yes. Pressure around the MacBook Pro 14/16-inch M2 Pro/Max 2023 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 14/16-inch M2 Pro/Max 2023 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 14/16-inch M2 Pro/Max 2023 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 14/16-inch M2 Pro/Max 2023 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe 3 and USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 14/16-inch M2 Pro/Max 2023 battery replacement?",
        answer: "Back up important files if the MacBook Pro 14/16-inch M2 Pro/Max 2023 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 14/16-inch M2 Pro/Max 2023 battery replacement in Ringwood",
      intro: "MacBook Pro 14/16-inch M2 Pro/Max 2023 battery diagnosis links real runtime behaviour with MagSafe 3 or USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm which Pro generation is on the bench before giving the repair path." },
        { title: "Repair risk explained",
description: "We explain how Pro/Max workload symptoms checked without assuming one size can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 14/16-inch M2 Pro/Max 2023 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 14/16-inch M2 Pro/Max 2023 to Ringwood Square for battery replacement",
      intro: "This M2 Pro/Max generation often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the MagSafe 3 lead, USB-C charger, and any dock that changes charging behaviour.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 14/16-inch M2 Pro/Max 2023 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 14/16-inch M2 Pro/Max 2023 battery replacement?",
      body: "Bring the MacBook Pro 14/16-inch M2 Pro/Max 2023 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 14/16-inch M2 Pro/Max 2023 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 14/16-inch M2 Pro/Max 2023 so power behaviour can be checked properly.",
        "The MacBook Pro 14/16-inch M2 Pro/Max 2023 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-14-16-m2-pro-max-2023|charging-port-replacement": {
    modelName: "MacBook Pro 14/16-inch M2 Pro/Max 2023",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 14/16-inch M2 Pro/Max 2023 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "M2 Pro/Max charging symptoms are separated from charger, dock, and battery behaviour before parts are discussed.",
    quickAnswer: "M2 Pro/Max charging faults are separated from dock, cable, and battery behaviour before parts are discussed.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We check the obvious fault and the nearby risks first. We test known-good charging gear, inspect debris or damage, and check MagSafe 3 and USB-C charging-path checks.",
bestFor: "Charging complaints where the adapter and cable need to be separated from the port.",
notes: "If simple testing explains the issue, we keep the recommendation practical." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 14/16-inch M2 Pro/Max 2023 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Port-level symptoms that remain after simple charger checks.",
notes: "The quote stays tied to the confirmed charging-path fault, not a blanket no-power promise." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 14/16-inch M2 Pro/Max 2023 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "We compare charging gear, battery behaviour, and port fit before quoting the work." },
      { title: "Loose or unreliable fit",
description: "MagSafe 3 and USB-C charging-path checks can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe 3 and USB-C charging-path checks." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe 3 and USB-C charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 14/16-inch M2 Pro/Max 2023." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 14/16-inch M2 Pro/Max 2023 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 14/16-inch M2 Pro/Max 2023 with known-good gear, inspect MagSafe 3 and USB-C charging-path checks, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 14/16-inch M2 Pro/Max 2023 for charging repair?",
        answer: "Bring the MagSafe 3 lead, USB-C charger, and any dock that changes charging behaviour. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 14/16-inch M2 Pro/Max 2023 port works but another does not?",
        answer: "We compare the available charging points for this M2 Pro/Max generation and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 14/16-inch M2 Pro/Max 2023?",
        answer: "Because this model can involve MagSafe 3 and USB-C charging, we check both paths when your symptoms point that way."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 14/16-inch M2 Pro/Max 2023 charging?",
        answer: "Yes. We check the MacBook Pro 14/16-inch M2 Pro/Max 2023 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 14/16-inch M2 Pro/Max 2023 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 14/16-inch M2 Pro/Max 2023 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 14/16-inch M2 Pro/Max 2023 charging port repair in Ringwood",
      intro: "MacBook Pro 14/16-inch M2 Pro/Max 2023 charging repair is scoped from the charger setup first, then MagSafe 3 and USB-C charging-path checks, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "The visible condition and model family are checked together before pricing is confirmed." },
        { title: "Repair risk explained",
description: "We explain how MagSafe 3 and USB-C charging-path checks can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 14/16-inch M2 Pro/Max 2023 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 14/16-inch M2 Pro/Max 2023 to Ringwood Square for charging port repair",
      intro: "This M2 Pro/Max generation often arrives with a clear story from home, school, or work; we use that story to guide the inspection. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the MagSafe 3 lead, USB-C charger, and any dock that changes charging behaviour.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 14/16-inch M2 Pro/Max 2023 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 14/16-inch M2 Pro/Max 2023 charging port repair?",
      body: "Bring the MacBook Pro 14/16-inch M2 Pro/Max 2023 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 14/16-inch M2 Pro/Max 2023 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 14/16-inch M2 Pro/Max 2023 charging fault.",
        "The MacBook Pro 14/16-inch M2 Pro/Max 2023 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-pro-14-16-m3-pro-max-2024|screen-replacement": {
    modelName: "MacBook Pro 14/16-inch M3 Pro/Max 2024",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook Pro 14/16-inch M3 Pro/Max 2024 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "Screen damage on this newer Pro generation is checked carefully around the lid and display assembly before quoting.",
    quickAnswer: "A newer M3 Pro/Max display fault is inspected carefully before quoting, especially around the lid and camera-notch area.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Start with the symptom, not the part. We test brightness, lines, flicker, external output, and newer display assembly condition for this MacBook Pro generation on this M3 Pro/Max generation.",
bestFor: "Cracked displays, black image, line faults, flicker, or faults that change when the lid moves.",
notes: "Quote, part path, and fit risk are confirmed before approved repair work starts." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook Pro 14/16-inch M3 Pro/Max 2024.",
bestFor: "Customers who want the main screen-related functions checked before handover.",
notes: "Any unrelated housing, battery, or board concern is explained separately before extra work." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook Pro 14/16-inch M3 Pro/Max 2024 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because newer display assembly condition for this MacBook Pro generation can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this newer M3 Pro/Max generation can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and newer display assembly condition for this MacBook Pro generation." },
      { step: "02",
title: "Confirm display symptoms",
description: "We test brightness, lines, flicker, external display behaviour, and sleep/wake response where they apply." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook Pro 14/16-inch M3 Pro/Max 2024." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook Pro 14/16-inch M3 Pro/Max 2024 screen changes as the lid moves?",
        answer: "We test the MacBook Pro 14/16-inch M3 Pro/Max 2024 panel output, lid angle, hinge feel, and newer display assembly condition for this MacBook Pro generation. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook Pro 14/16-inch M3 Pro/Max 2024 screen repair uncover another fault?",
        answer: "Yes. During MacBook Pro 14/16-inch M3 Pro/Max 2024 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook Pro 14/16-inch M3 Pro/Max 2024 with an external display?",
        answer: "Where it helps the MacBook Pro 14/16-inch M3 Pro/Max 2024 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook Pro 14/16-inch M3 Pro/Max 2024 lid, hinge, frame, and camera area?",
        answer: "Yes. The newer M3 Pro/Max generation is checked for newer display assembly condition, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook Pro 14/16-inch M3 Pro/Max 2024 before screen work?",
        answer: "If the MacBook Pro 14/16-inch M3 Pro/Max 2024 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook Pro 14/16-inch M3 Pro/Max 2024 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook Pro 14/16-inch M3 Pro/Max 2024 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 14/16-inch M3 Pro/Max 2024 screen replacement in Ringwood",
      intro: "MacBook Pro 14/16-inch M3 Pro/Max 2024 screen assessment starts with the customer-visible symptom, then checks newer display assembly condition for this MacBook Pro generation before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the exact Pro family and visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how newer display assembly condition for this MacBook Pro generation can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 14/16-inch M3 Pro/Max 2024 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 14/16-inch M3 Pro/Max 2024 to Ringwood Square for screen replacement",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the charger setup connected when the symptom appeared.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook Pro 14/16-inch M3 Pro/Max 2024 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 14/16-inch M3 Pro/Max 2024 screen replacement?",
      body: "Book the MacBook Pro 14/16-inch M3 Pro/Max 2024 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 14/16-inch M3 Pro/Max 2024 screen replacement.",
        "Tell us if the MacBook Pro 14/16-inch M3 Pro/Max 2024 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook Pro 14/16-inch M3 Pro/Max 2024 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-pro-14-16-m3-pro-max-2024|battery-replacement": {
    modelName: "MacBook Pro 14/16-inch M3 Pro/Max 2024",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook Pro 14/16-inch M3 Pro/Max 2024 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Newer Pro runtime issues on MacBook Pro 14/16-inch M3 Pro/Max 2024 are checked carefully before any battery replacement is approved.",
    quickAnswer: "A newer M3 Pro/Max with runtime issues gets a careful power check before any battery replacement is approved.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "The bench check is practical and model-aware. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and newer Pro/Max runtime symptoms checked against actual charger behaviour.",
bestFor: "Short runtime, sudden shutdowns, service warnings, swelling concern, or poor charge hold.",
notes: "Charging response is checked as well, because a power issue is not always only the battery." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this M3 Pro/Max generation, we confirm availability, quote, and the practical handover checks.",
bestFor: "MacBooks with confirmed battery wear and stable charging behaviour.",
notes: "Timing is confirmed after inspection and part availability, not promised before assessment." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook Pro 14/16-inch M3 Pro/Max 2024 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check newer Pro/Max runtime symptoms checked against actual charger behaviour before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "MagSafe 3 and USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook Pro 14/16-inch M3 Pro/Max 2024 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We compare both charging paths with swelling signs before confirming battery replacement." },
      { step: "03",
title: "Run handover power checks",
description: "Before handover, we check charging response, startup stability, trackpad feel, and practical battery behaviour." }
    ],
    faq: [
      {
        question: "What makes MacBook Pro 14/16-inch M3 Pro/Max 2024 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and MagSafe 3 or USB-C charger response on the MacBook Pro 14/16-inch M3 Pro/Max 2024 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook Pro 14/16-inch M3 Pro/Max 2024 for battery service?",
        answer: "Back up important files first if the MacBook Pro 14/16-inch M3 Pro/Max 2024 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook Pro 14/16-inch M3 Pro/Max 2024?",
        answer: "Yes. Pressure around the MacBook Pro 14/16-inch M3 Pro/Max 2024 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook Pro 14/16-inch M3 Pro/Max 2024 battery wear from charger or board faults?",
        answer: "We test MacBook Pro 14/16-inch M3 Pro/Max 2024 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook Pro 14/16-inch M3 Pro/Max 2024 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because MagSafe 3 and USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook Pro 14/16-inch M3 Pro/Max 2024 battery replacement?",
        answer: "Back up important files if the MacBook Pro 14/16-inch M3 Pro/Max 2024 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 14/16-inch M3 Pro/Max 2024 battery replacement in Ringwood",
      intro: "MacBook Pro 14/16-inch M3 Pro/Max 2024 battery diagnosis links real runtime behaviour with MagSafe 3 or USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "The MacBook Pro model and outer condition are checked before the quote is confirmed." },
        { title: "Repair risk explained",
description: "We explain how newer Pro/Max runtime symptoms checked against actual charger behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 14/16-inch M3 Pro/Max 2024 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 14/16-inch M3 Pro/Max 2024 to Ringwood Square for battery replacement",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the charger setup connected when the symptom appeared.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook Pro 14/16-inch M3 Pro/Max 2024 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 14/16-inch M3 Pro/Max 2024 battery replacement?",
      body: "Bring the MacBook Pro 14/16-inch M3 Pro/Max 2024 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook Pro 14/16-inch M3 Pro/Max 2024 battery replacement.",
        "Bring the charger used most often with the MacBook Pro 14/16-inch M3 Pro/Max 2024 so power behaviour can be checked properly.",
        "The MacBook Pro 14/16-inch M3 Pro/Max 2024 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-pro-14-16-m3-pro-max-2024|charging-port-replacement": {
    modelName: "MacBook Pro 14/16-inch M3 Pro/Max 2024",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook Pro 14/16-inch M3 Pro/Max 2024 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "Newer Pro charging faults on MacBook Pro 14/16-inch M3 Pro/Max 2024 are checked at the bench before repair scope is confirmed.",
    quickAnswer: "A newer M3 Pro/Max charging issue gets MagSafe 3 and USB-C checks before any approved repair begins.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We keep the diagnosis plain and tied to how you use the MacBook. We test known-good charging gear, inspect debris or damage, and check MagSafe 3 seating and USB-C charging consistency.",
bestFor: "No charge response, loose cable fit, charging at one angle, or intermittent power.",
notes: "If the cable, adapter, or debris is the cause, we do not push unnecessary port work." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook Pro 14/16-inch M3 Pro/Max 2024 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Repeated charger dropouts, unstable power delivery, or visible connector wear.",
notes: "A port repair is not promised to fix board-level or battery-related no-power faults." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook Pro 14/16-inch M3 Pro/Max 2024 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "The cause can be the adapter, cable, battery, port, or deeper power path, so we test before quoting." },
      { title: "Loose or unreliable fit",
description: "MagSafe 3 seating and USB-C charging consistency can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and MagSafe 3 seating and USB-C charging consistency." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and MagSafe 3 and USB-C charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook Pro 14/16-inch M3 Pro/Max 2024." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook Pro 14/16-inch M3 Pro/Max 2024 charging fault is the port or the charger?",
        answer: "We test the MacBook Pro 14/16-inch M3 Pro/Max 2024 with known-good gear, inspect MagSafe 3 seating and USB-C charging consistency, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook Pro 14/16-inch M3 Pro/Max 2024 for charging repair?",
        answer: "Bring the charger setup connected when the symptom appeared. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook Pro 14/16-inch M3 Pro/Max 2024 port works but another does not?",
        answer: "We compare the available charging points for this newer M3 Pro/Max generation and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook Pro 14/16-inch M3 Pro/Max 2024?",
        answer: "Because this model can involve MagSafe 3 and USB-C charging, we check both paths when your symptoms point that way."
      },
      {
        question: "Can debris or physical damage stop the MacBook Pro 14/16-inch M3 Pro/Max 2024 charging?",
        answer: "Yes. We check the MacBook Pro 14/16-inch M3 Pro/Max 2024 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook Pro 14/16-inch M3 Pro/Max 2024 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook Pro 14/16-inch M3 Pro/Max 2024 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook Pro 14/16-inch M3 Pro/Max 2024 charging port repair in Ringwood",
      intro: "MacBook Pro 14/16-inch M3 Pro/Max 2024 charging repair is scoped from the charger setup first, then MagSafe 3 seating and USB-C charging consistency, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We identify the Pro generation first, then inspect the visible condition before quoting." },
        { title: "Repair risk explained",
description: "We explain how MagSafe 3 seating and USB-C charging consistency can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook Pro 14/16-inch M3 Pro/Max 2024 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook Pro 14/16-inch M3 Pro/Max 2024 to Ringwood Square for charging port repair",
      intro: "The counter check is practical: reproduce the fault where possible, explain the likely path, then confirm the quote. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the charger setup connected when the symptom appeared.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook Pro 14/16-inch M3 Pro/Max 2024 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook Pro 14/16-inch M3 Pro/Max 2024 charging port repair?",
      body: "Bring the MacBook Pro 14/16-inch M3 Pro/Max 2024 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook Pro 14/16-inch M3 Pro/Max 2024 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook Pro 14/16-inch M3 Pro/Max 2024 charging fault.",
        "The MacBook Pro 14/16-inch M3 Pro/Max 2024 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  },
  "macbook-12-2015-2019|screen-replacement": {
    modelName: "MacBook 12-inch 2015-2019",
    repairSlug: "screen-replacement",
    metaTitle: "MacBook 12-inch 2015-2019 screen replacement in Ringwood | Ali Mobile",
    metaDescription: "The slim MacBook 12-inch 2015-2019 lid needs a careful display check before screen work is confirmed in Ringwood.",
    quickAnswer: "The 12-inch MacBook has a very slim lid, so screen faults are checked with hinge feel and display-cable behaviour before repair approval.",
    repairOptions: [
      { name: "Display and lid assessment",
shortDescription: "Before quoting, we separate the visible fault from the cause. We test brightness, lines, flicker, external output, and very thin lid, hinge feel, and display cable behaviour on this thin 12-inch MacBook.",
bestFor: "Screens with cracks, dark sections, display lines, flicker, or lid-angle cut-outs.",
notes: "We confirm the quote, suitable part path, and any fit concern before work begins." },
      { name: "Handover screen checks",
shortDescription: "After approved work, we retest display output, camera area, sleep/wake response, hinge feel, and charging behaviour on the MacBook 12-inch 2015-2019.",
bestFor: "Useful when you want display, camera-area, and lid behaviour checked before handover.",
notes: "If another housing, battery, or board issue appears, we explain it before extra work is considered." }
    ],
    commonProblems: [
      { title: "Cracked display or dark image",
description: "A hit to the lid can leave the MacBook 12-inch 2015-2019 with black sections, lines, or unstable image even when it still powers on." },
      { title: "Fault changes when the lid moves",
description: "We pay attention to lid angle because very thin lid, hinge feel, and display cable behaviour can affect the final repair scope." },
      { title: "Housing pressure near the hinge",
description: "Corner dents, hinge stiffness, or lid pressure on this thin 12-inch Intel MacBook can change how cleanly a replacement display sits." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the lid and panel",
description: "We check visible damage, hinge movement, lid alignment, camera area, and very thin lid, hinge feel, and display cable behaviour." },
      { step: "02",
title: "Confirm display symptoms",
description: "Display output, brightness control, flicker, lines, external monitor behaviour, and sleep/wake response are checked." },
      { step: "03",
title: "Retest before handover",
description: "After approved work, we check display output, hinge travel, startup, and normal use on the MacBook 12-inch 2015-2019." }
    ],
    faq: [
      {
        question: "What does Ali Mobile check when the MacBook 12-inch 2015-2019 screen changes as the lid moves?",
        answer: "We test the MacBook 12-inch 2015-2019 panel output, lid angle, hinge feel, and very thin lid, hinge feel, and display cable behaviour. Any housing risk is explained before quoting."
      },
      {
        question: "Could MacBook 12-inch 2015-2019 screen repair uncover another fault?",
        answer: "Yes. During MacBook 12-inch 2015-2019 screen inspection, charging, battery, camera-area, or board symptoms stay separate from the approved screen scope until you choose the next step."
      },
      {
        question: "Do you test the MacBook 12-inch 2015-2019 with an external display?",
        answer: "Where it helps the MacBook 12-inch 2015-2019 diagnosis, yes. External-display behaviour can separate a display assembly problem from startup or deeper graphics symptoms."
      },
      {
        question: "Will you check the MacBook 12-inch 2015-2019 lid, hinge, frame, and camera area?",
        answer: "Yes. The thin 12-inch Intel MacBook is checked for very thin lid, hinge feel, and display cable behaviour, because fit issues can affect the repair scope."
      },
      {
        question: "Should I back up the MacBook 12-inch 2015-2019 before screen work?",
        answer: "If the MacBook 12-inch 2015-2019 still powers on, back up important files first. Screen repair is hardware work, so data retention is not guaranteed."
      },
      {
        question: "Can you confirm timing for MacBook 12-inch 2015-2019 screen replacement before seeing it?",
        answer: "No fixed timing is promised for the MacBook 12-inch 2015-2019 before inspection. We confirm quote, part availability, and likely timing after the bench check."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook 12-inch 2015-2019 screen replacement in Ringwood",
      intro: "MacBook 12-inch 2015-2019 screen assessment starts with the customer-visible symptom, then checks very thin lid, hinge feel, and display cable behaviour before a quote is confirmed.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the model family and visible condition before quoting this MacBook." },
        { title: "Repair risk explained",
description: "We explain how very thin lid, hinge feel, and display cable behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook 12-inch 2015-2019 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook 12-inch 2015-2019 to Ringwood Square for screen replacement",
      intro: "Because this is compact travel MacBook where one port carries the whole power path, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the screen replacement scope before approved work begins.",
      items: [
          "Bring the one USB-C charger and cable because the single port does all charging work.",
          "If the display still works enough to use, back up important files before visiting.",
          "Tell us whether the MacBook 12-inch 2015-2019 fault changes when the lid moves or after startup."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook 12-inch 2015-2019 screen replacement?",
      body: "Book the MacBook 12-inch 2015-2019 screen check when the display fault is visible; we inspect the lid, explain the quote, and avoid starting work until the scope is approved.",
      bullets: [
        "Use the booking path for this MacBook 12-inch 2015-2019 screen replacement.",
        "Tell us if the MacBook 12-inch 2015-2019 display changes with lid movement, pressure, startup, or external output.",
        "The MacBook 12-inch 2015-2019 screen scope stays separate from unrelated power or board findings."
      ]
    },
  },
  "macbook-12-2015-2019|battery-replacement": {
    modelName: "MacBook 12-inch 2015-2019",
    repairSlug: "battery-replacement",
    metaTitle: "MacBook 12-inch 2015-2019 battery replacement in Ringwood | Ali Mobile",
    metaDescription: "Battery work on the MacBook 12-inch 2015-2019 includes single-port charging checks before the repair scope is confirmed.",
    quickAnswer: "With the 12-inch MacBook, battery and charging checks are tied together because the single USB-C port does all power work.",
    repairOptions: [
      { name: "Battery and power diagnosis",
shortDescription: "A quick look is not enough for this repair path. We compare runtime, percentage jumps, shutdowns, heat, trackpad feel, and thin-body battery pressure and single-port charging checks.",
bestFor: "Fast battery drain, shutdowns under load, warning messages, or pressure around the trackpad.",
notes: "We test the charger behaviour too, so a cable or port issue is not mistaken for battery wear." },
      { name: "Approved battery repair path",
shortDescription: "Once the fault matches battery wear on this thin 12-inch MacBook, we confirm availability, quote, and the practical handover checks.",
bestFor: "Battery-wear cases where the charger and port response look stable.",
notes: "We confirm timing once the MacBook has been checked and the part path is known." }
    ],
    commonProblems: [
      { title: "Fast drain or sudden shutdown",
description: "MacBook 12-inch 2015-2019 battery wear may show as percentage jumps, short runtime, or shutdowns during normal use." },
      { title: "Swelling or trackpad pressure",
description: "Battery swelling can press into the top case, so we check thin-body battery pressure and single-port charging checks before the MacBook is used further." },
      { title: "Charging fault mistaken for battery wear",
description: "single USB-C charging issues can make a weak adapter, cable, or port fault look like a tired battery." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Review power symptoms",
description: "We ask about runtime, shutdown timing, heat, charger behaviour, and how the MacBook 12-inch 2015-2019 is normally used." },
      { step: "02",
title: "Check charging and swelling",
description: "We test single USB-C charging, inspect for pressure signs, and confirm battery replacement is the right path." },
      { step: "03",
title: "Run handover power checks",
description: "Handover checks cover charging response, startup behaviour, trackpad feel, and basic battery stability." }
    ],
    faq: [
      {
        question: "What makes MacBook 12-inch 2015-2019 battery wear different from a charger problem?",
        answer: "We compare runtime, shutdown timing, pressure signs, and single USB-C charger response on the MacBook 12-inch 2015-2019 before recommending battery replacement."
      },
      {
        question: "What should I do before bringing in the MacBook 12-inch 2015-2019 for battery service?",
        answer: "Back up important files first if the MacBook 12-inch 2015-2019 still starts, then bring the charger setup. We confirm timing and scope only after inspection and part availability."
      },
      {
        question: "Is swelling or trackpad pressure serious on the MacBook 12-inch 2015-2019?",
        answer: "Yes. Pressure around the MacBook 12-inch 2015-2019 top case or trackpad is checked carefully, and we explain the safe repair path before further use."
      },
      {
        question: "How do you separate MacBook 12-inch 2015-2019 battery wear from charger or board faults?",
        answer: "We test MacBook 12-inch 2015-2019 charger response, battery reporting, shutdown history, and visible pressure signs before treating the battery as the confirmed fault."
      },
      {
        question: "Should I bring the charger for MacBook 12-inch 2015-2019 battery diagnosis?",
        answer: "Yes. Bring the charger or cable you normally use, because single USB-C charging can make charger issues look like battery failure."
      },
      {
        question: "Do I need a backup before MacBook 12-inch 2015-2019 battery replacement?",
        answer: "Back up important files if the MacBook 12-inch 2015-2019 still starts. Timing, quote, and part availability are confirmed after inspection, without a guaranteed data outcome."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook 12-inch 2015-2019 battery replacement in Ringwood",
      intro: "MacBook 12-inch 2015-2019 battery diagnosis links real runtime behaviour with single USB-C charger response and pressure checks before replacement is recommended.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the model family and visible condition before quoting this MacBook." },
        { title: "Repair risk explained",
description: "We explain how thin-body battery pressure and single-port charging checks can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook 12-inch 2015-2019 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook 12-inch 2015-2019 to Ringwood Square for battery replacement",
      intro: "Because this is compact travel MacBook where one port carries the whole power path, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the battery replacement scope before approved work begins.",
      items: [
          "Bring the one USB-C charger and cable because the single port does all charging work.",
          "If it powers on, save important work before battery or power testing begins.",
          "Note when the MacBook 12-inch 2015-2019 shuts down, heats up, or loses charge fastest."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook 12-inch 2015-2019 battery replacement?",
      body: "Bring the MacBook 12-inch 2015-2019 in with its charger so the battery and power symptoms can be tested together before any battery replacement is approved.",
      bullets: [
        "Use the booking path for this MacBook 12-inch 2015-2019 battery replacement.",
        "Bring the charger used most often with the MacBook 12-inch 2015-2019 so power behaviour can be checked properly.",
        "The MacBook 12-inch 2015-2019 battery quote is confirmed after inspection, not before part availability is checked."
      ]
    },
  },
  "macbook-12-2015-2019|charging-port-replacement": {
    modelName: "MacBook 12-inch 2015-2019",
    repairSlug: "charging-port-replacement",
    metaTitle: "MacBook 12-inch 2015-2019 charging port repair in Ringwood | Ali Mobile",
    metaDescription: "With the MacBook 12-inch 2015-2019, the single USB-C port is checked carefully before charging repair is recommended.",
    quickAnswer: "The 12-inch MacBook depends on one USB-C port, so charging symptoms are checked carefully before a repair path is confirmed.",
    repairOptions: [
      { name: "Cable, adapter, and port check",
shortDescription: "We check the obvious fault and the nearby risks first. We test known-good charging gear, inspect debris or damage, and check single USB-C port seating and cable-angle behaviour.",
bestFor: "MacBooks with no charge, wobbly cable fit, or power that cuts in and out.",
notes: "When a charger or cleaning fix explains the fault, we keep the repair scope smaller." },
      { name: "Charging-path repair decision",
shortDescription: "We confirm whether the MacBook 12-inch 2015-2019 fault suits port-level repair, cleaning, battery checks, or further power-path diagnosis.",
bestFor: "Charging faults that keep returning after cable and adapter checks.",
notes: "Board-level or battery-related no-power faults are explained separately from port repair." }
    ],
    commonProblems: [
      { title: "Cable only works at an angle",
description: "A worn, dirty, or damaged charging connection on the MacBook 12-inch 2015-2019 can cut in and out as the cable moves." },
      { title: "No charge or no power response",
description: "A no-charge fault can come from several places, so charger, cable, battery, and port checks come first." },
      { title: "Loose or unreliable fit",
description: "single USB-C port seating and cable-angle behaviour can decide whether the connector sits firmly enough for stable charging." }
    ],
    diagnosticSteps: [
      { step: "01",
title: "Inspect the charging area",
description: "We check cable fit, visible damage, debris, liquid signs, and single USB-C port seating and cable-angle behaviour." },
      { step: "02",
title: "Test known-good gear",
description: "Chargers, cables, and single USB-C charging behaviour are compared before the repair path is confirmed." },
      { step: "03",
title: "Retest charging stability",
description: "After approved work, we check cable fit, startup response, and battery reporting on the MacBook 12-inch 2015-2019." }
    ],
    faq: [
      {
        question: "How do you tell whether the MacBook 12-inch 2015-2019 charging fault is the port or the charger?",
        answer: "We test the MacBook 12-inch 2015-2019 with known-good gear, inspect single USB-C port seating and cable-angle behaviour, and compare battery reporting before quoting port-level work."
      },
      {
        question: "What helps most when I bring in the MacBook 12-inch 2015-2019 for charging repair?",
        answer: "Bring the one USB-C charger and cable because the single port does all charging work. That lets us reproduce the charging behaviour instead of guessing from a clean bench cable."
      },
      {
        question: "What if one MacBook 12-inch 2015-2019 port works but another does not?",
        answer: "We compare the available charging points for this thin 12-inch Intel MacBook and note whether the problem follows the cable, charger, port, or accessory."
      },
      {
        question: "How do MagSafe and USB-C checks apply to the MacBook 12-inch 2015-2019?",
        answer: "On this 12-inch MacBook, the single USB-C port carries the full charging path, so cable fit matters a lot."
      },
      {
        question: "Can debris or physical damage stop the MacBook 12-inch 2015-2019 charging?",
        answer: "Yes. We check the MacBook 12-inch 2015-2019 charging area for lint, movement, bent contact signs, corrosion, and visible impact before quoting parts."
      },
      {
        question: "Could a MacBook 12-inch 2015-2019 no-power fault be board-level instead of the port?",
        answer: "Yes. MacBook 12-inch 2015-2019 port repair is not promised as a blanket no-power fix. Back up first if it still starts; quote, parts, and timing follow inspection."
      }
    ],
    serviceSection: {
      eyebrow: "Model-aware MacBook repair",
      heading: "MacBook 12-inch 2015-2019 charging port repair in Ringwood",
      intro: "MacBook 12-inch 2015-2019 charging repair is scoped from the charger setup first, then single USB-C port seating and cable-angle behaviour, battery response, and startup behaviour.",
      cards: [
        { title: "Exact MacBook identified",
description: "We confirm the model family and visible condition before quoting this MacBook." },
        { title: "Repair risk explained",
description: "We explain how single USB-C port seating and cable-angle behaviour can affect the scope before any approved work starts." },
        { title: "Practical handover checks",
description: "Startup, charging response, and the reported fault are checked again before the MacBook 12-inch 2015-2019 is handed back." },
      ],
    },
    localService: {
      kicker: "Ringwood MacBook support",
      heading: "Bring your MacBook 12-inch 2015-2019 to Ringwood Square for charging port repair",
      intro: "Because this is compact travel MacBook where one port carries the whole power path, we keep the advice direct and avoid promising outcomes before the MacBook is checked. Ali Mobile & Repair checks the charging port repair scope before approved work begins.",
      items: [
          "Bring the one USB-C charger and cable because the single port does all charging work.",
          "If it still turns on, back up first; charging repairs are still hardware work.",
          "Show us the cable angle, charger, or port behaviour that makes the MacBook 12-inch 2015-2019 fail."
        ]
    },
    finalCta: {
      kicker: "Next step",
      heading: "Ready to organise MacBook 12-inch 2015-2019 charging port repair?",
      body: "Bring the MacBook 12-inch 2015-2019 with the charger or cable that fails, and we will confirm whether the charging path suits port repair before work begins.",
      bullets: [
        "Use the booking path for this MacBook 12-inch 2015-2019 charging port repair.",
        "Bring the cable, adapter, dock, or MagSafe lead that shows the MacBook 12-inch 2015-2019 charging fault.",
        "The MacBook 12-inch 2015-2019 charging quote is tied to the inspected fault, not a blanket no-power promise."
      ]
    },
  }
} satisfies Record<MacBookPageKey, MacBookEnhancedSeoPocket>;

const PUBLIC_MACBOOK_ALIAS_COUNT = Object.keys(PUBLIC_MACBOOK_MODEL_ALIASES).length;
const PUBLIC_MACBOOK_ROUTE_COUNT = Object.keys(PUBLIC_MACBOOK_MODEL_ALIASES).reduce((count, publicSlug) => {
  const contentSlug = resolveMacBookContentModelSlug(publicSlug);

  if (!contentSlug) return count;

  return count + MACBOOK_REPAIRS.filter((repair) => Boolean(MACBOOK_PAGE_CONTENT[`${contentSlug}|${repair}`])).length;
}, 0);

if (
  PUBLIC_MACBOOK_ALIAS_COUNT !== 20 ||
  MACBOOK_MODELS.length !== 20 ||
  PUBLIC_MACBOOK_ROUTE_COUNT !== 60
) {
  throw new Error('MacBook enhanced content alias coverage must remain 20 public aliases, 20 content models, and 60 public repair routes.');
}

export function isAliMobileEnhancedMacBookRepairPage({
  category,
  brand,
  model,
  'repair-type': repairType,
}: {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}) {
  const contentModelSlug = resolveMacBookContentModelSlug(model);

  return (
    category === 'laptop' &&
    brand === 'macbook' &&
    Boolean(contentModelSlug) &&
    isMacBookRepairSlug(repairType) &&
    PAGE_KEYS.includes(`${contentModelSlug}|${repairType}` as MacBookPageKey)
  );
}

export function getAliMobileEnhancedMacBookRepairType(params: {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}): MacBookRepairSlug | null {
  return isAliMobileEnhancedMacBookRepairPage(params)
    ? (params['repair-type'] as MacBookRepairSlug)
    : null;
}

export function getAliMobileEnhancedMacBookSeoPocket({
  modelSlug,
  repairSlug,
}: {
  modelSlug: string;
  repairSlug: string;
}): MacBookEnhancedSeoPocket | null {
  const contentModelSlug = resolveMacBookContentModelSlug(modelSlug);

  if (!contentModelSlug || !isMacBookRepairSlug(repairSlug)) {
    return null;
  }

  if (!PAGE_KEYS.includes(`${contentModelSlug}|${repairSlug}` as MacBookPageKey)) {
    return null;
  }

  return MACBOOK_PAGE_CONTENT[`${contentModelSlug}|${repairSlug}` as MacBookPageKey] ?? null;
}

export function getMacBookRepairLabel(repairSlug: MacBookRepairSlug) {
  return REPAIR_LABELS[repairSlug];
}

export function getMacBookSameModelRepairLinks(modelSlug: string, currentRepair: MacBookRepairSlug): MacBookExploreLink[] {
  const contentModelSlug = resolveMacBookContentModelSlug(modelSlug);

  if (!contentModelSlug) return [];

  const config = MODEL_CONFIGS[contentModelSlug];
  const routeModelSlug = modelSlug in PUBLIC_MACBOOK_MODEL_ALIASES || isMacBookModelSlug(modelSlug)
    ? modelSlug
    : contentModelSlug;

  return MACBOOK_REPAIRS
    .filter((repair) => repair !== currentRepair)
    .map((repair) => ({
      href: `/repairs/laptop/macbook/${routeModelSlug}/${repair}`,
      label: `${config.modelName} ${REPAIR_LABELS[repair]}`,
      slug: repair,
    }));
}

export function getMacBookModelHubLinks(currentModelSlug: string): MacBookExploreLink[] {
  const currentContentModelSlug = resolveMacBookContentModelSlug(currentModelSlug);

  return MACBOOK_MODELS
    .filter((model) => model !== currentContentModelSlug)
    .slice(0, 6)
    .map((model) => ({
      href: `/repairs/laptop/macbook/${PUBLIC_MACBOOK_MODEL_SLUGS_BY_CONTENT_KEY[model]}`,
      label: `Explore ${MODEL_CONFIGS[model].modelName} repairs`,
      slug: model,
    }));
}

export function getMacBookCategoryHubLinks(): MacBookExploreLink[] {
  return [
    { href: '/repairs/laptop/macbook', label: 'Explore MacBook repairs', slug: 'macbook' },
    { href: '/repairs/laptop', label: 'Explore laptop repairs', slug: 'laptop' },
    { href: '/repairs/phone/iphone', label: 'Explore iPhone repairs', slug: 'iphone' },
    { href: '/repairs/tablet/ipad', label: 'Explore iPad repairs', slug: 'ipad' },
    { href: '/repairs/phone/samsung', label: 'Explore Samsung phone repairs', slug: 'samsung' },
    { href: '/repairs/watch/apple-watch', label: 'Explore Apple Watch repairs', slug: 'apple-watch' },
  ];
}

export const MACBOOK_EXPLICIT_ENTRY_COUNT = PAGE_KEYS.length;
