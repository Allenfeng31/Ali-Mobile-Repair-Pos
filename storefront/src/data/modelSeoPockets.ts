import { slugify } from "@/lib/inventoryUtils";

export interface ModelSeoFaq {
  question: string;
  answer: string;
}

export interface ModelSeoPocket {
  slug: string;
  label: string;
  quickAnswer: string;
  workbench: Array<{
    title: string;
    description: string;
  }>;
  faqs: ModelSeoFaq[];
}

export interface ModelSeoPocketSuite {
  defaultFaqs: ModelSeoFaq[];
  pockets: ModelSeoPocket[];
}

export const IPHONE_13_GENERAL_TRUST_FAQS: ModelSeoFaq[] = [
  {
    question: "Is my data safe during an iPhone 13 repair?",
    answer:
      "Yes. Most iPhone 13 repairs do not require us to access your photos, messages, accounts, or apps. We recommend keeping your passcode private unless a function test genuinely needs it, and we will explain that before testing.",
  },
  {
    question: "Where is your Ringwood repair location?",
    answer:
      "Ali Mobile & Repair is at Ringwood Square Shopping Centre, Kiosk C1, Seymour St, Ringwood VIC 3134. Walk-ins are welcome, and booking helps us prepare the right part before you arrive.",
  },
  {
    question: "Can you repair an iPhone 13 the same day in Ringwood?",
    answer:
      "Most common iPhone 13 repairs can be completed the same day when the correct part is in stock and there is no hidden liquid or frame damage. Many jobs are completed in under 1 hour.",
  },
  {
    question: "Do iPhone 13 repairs include a warranty?",
    answer:
      "Standard iPhone 13 repairs include a 6-month warranty on the fitted part and labour. Liquid damage, impact damage after repair, and unrelated faults are assessed separately.",
  },
  {
    question: "Do you quote before starting work?",
    answer:
      "Yes. We check the fault, explain the likely repair path, confirm the price, and only proceed after you approve the work.",
  },
];

const IPHONE_13_REPAIR_POCKETS: ModelSeoPocket[] = [
  {
    slug: "screen-replacement",
    label: "Screen",
    quickAnswer:
      "For iPhone 13 screen replacement in Ringwood, we check cracked glass, OLED lines, touch response, Face ID area condition, frame fit, and display tier availability before quoting.",
    workbench: [
      {
        title: "Display tier matching",
        description:
          "We explain Standard, Premium OLED, and Genuine display paths when available, then match the option to your budget and how you use the phone.",
      },
      {
        title: "Face ID and sensor area checks",
        description:
          "Impact around the earpiece, proximity sensor, or front camera area is checked before fitting because those parts can affect Face ID-related behaviour.",
      },
      {
        title: "Frame pressure control",
        description:
          "A bent housing can stress a new OLED panel, so we inspect the edge fit and adhesive channel before the replacement screen is seated.",
      },
    ],
    faqs: [
      {
        question: "How long does iPhone 13 screen replacement take in Ringwood?",
        answer:
          "If the correct display is in stock and there is no hidden frame or liquid damage, iPhone 13 screen replacement is usually completed in under 1 hour at our Ringwood kiosk.",
      },
      {
        question: "Can you fix green lines, flicker, or a black iPhone 13 screen?",
        answer:
          "Yes. Green lines, flicker, a black display, and touch dead zones are common OLED or digitizer symptoms. We test the phone first to confirm that a screen assembly is the right fix.",
      },
      {
        question: "Will True Tone still work after an iPhone 13 screen repair?",
        answer:
          "Where supported, we check display data and True Tone behaviour during the repair. The result can depend on part option, phone condition, and whether the original display data is readable.",
      },
      {
        question: "Will my iPhone 13 stay water resistant after screen replacement?",
        answer:
          "We clean old adhesive and reseal carefully, but factory water resistance cannot be guaranteed after any phone has been opened. Keep the device away from water after repair.",
      },
    ],
  },
  {
    slug: "battery-replacement",
    label: "Battery",
    quickAnswer:
      "For iPhone 13 battery replacement in Ringwood, we check battery health, charge cycles, swelling risk, iOS battery messaging, charging draw, and post-fit capacity calibration before handover.",
    workbench: [
      {
        title: "Capacity and swelling diagnosis",
        description:
          "We check Battery Health, shutdown behaviour, heat, swelling signs, and charging current before opening the device so the repair target is clear.",
      },
      {
        title: "iOS Unknown Part logic",
        description:
          "Recent iPhones can show an iOS battery message after replacement depending on part pairing and system history. We explain this clearly before work begins so there are no surprises.",
      },
      {
        title: "Calibration and charging validation",
        description:
          "After fitting, we confirm the phone charges normally, holds stable power, and has a practical calibration path for Battery Health and capacity readings.",
      },
    ],
    faqs: [
      {
        question: "Can you replace an iPhone 13 battery the same day in Ringwood?",
        answer:
          "Yes, most iPhone 13 battery replacements are completed the same day when stock is available and the phone has no hidden liquid or board damage. Many jobs are finished in under 1 hour.",
      },
      {
        question: "Will my iPhone 13 show an Unknown Part battery warning?",
        answer:
          "Some iPhone 13 devices may show an iOS battery message after replacement because Apple pairs certain parts to the device. The phone can still charge and run normally; we explain the expected message behaviour before repair.",
      },
      {
        question: "Do you calibrate the iPhone 13 battery after replacement?",
        answer:
          "We test charging draw, boot stability, and battery reporting after installation. Battery percentage and health reporting can settle over the next few charge cycles, so we give practical calibration guidance at pickup.",
      },
      {
        question: "What battery symptoms mean my iPhone 13 needs replacement?",
        answer:
          "Fast drain, unexpected shutdowns, slow charging, swelling, heat, and Battery Health warnings are common signs. We still test first because a charging port or board fault can mimic battery failure.",
      },
    ],
  },
  {
    slug: "rear-glass-repair",
    label: "Rear glass",
    quickAnswer:
      "For iPhone 13 rear glass repair, we focus on controlled laser back-glass removal, wireless charging coil protection, camera ring care, and frame alignment before resealing the rear panel.",
    workbench: [
      {
        title: "Laser back-glass removal precision",
        description:
          "The damaged rear glass is separated with controlled heat and laser-assisted removal so adhesive can be cleared without forcing the housing.",
      },
      {
        title: "Wireless charging coil protection",
        description:
          "We protect the MagSafe and wireless charging coil area during removal, then validate wireless charging behaviour before handover.",
      },
      {
        title: "Frame and camera alignment",
        description:
          "Rear glass fit, camera ring seating, button edges, and frame alignment are checked so the replacement sits cleanly and does not lift at the corners.",
      },
    ],
    faqs: [
      {
        question: "Can you repair cracked iPhone 13 rear glass in Ringwood?",
        answer:
          "Yes. We handle iPhone 13 rear glass damage with a controlled removal process, careful adhesive cleanup, and fit checks around the camera rings and frame.",
      },
      {
        question: "Will rear glass repair damage wireless charging?",
        answer:
          "We protect the wireless charging coil and MagSafe area during the repair, then test wireless charging before return. Existing impact damage can still affect the coil, so we inspect first.",
      },
      {
        question: "Do you use laser removal for iPhone 13 back glass?",
        answer:
          "Where suitable, laser-assisted back-glass removal helps soften the adhesive pattern and reduce unnecessary force on the housing. We choose the method based on the phone's condition.",
      },
      {
        question: "Will the iPhone 13 frame be checked during rear glass repair?",
        answer:
          "Yes. A bent frame can stop the rear glass from sitting flush, so we check alignment around the corners, camera area, and side rails before final bonding.",
      },
    ],
  },
  {
    slug: "charging-port-repair",
    label: "Charging port",
    quickAnswer:
      "For iPhone 13 charging port repair, we separate simple tail-plug lint faults from full flex cable failure, then validate charging, microphone, speaker, headphone accessory, and data connection behaviour.",
    workbench: [
      {
        title: "Lint clean before replacement",
        description:
          "Many charging faults are packed lint or debris inside the Lightning port. We inspect and clean the tail-plug first where safe before recommending a full flex cable replacement.",
      },
      {
        title: "Flex cable and micro-soldering standards",
        description:
          "If the port assembly has failed, the replacement path follows clean disassembly, connector inspection, board-safe handling, and micro-soldering standards where board-level work is required.",
      },
      {
        title: "Charging, audio, and data validation",
        description:
          "After repair, we test wired charging, cable fit, computer/data connection, microphones, speaker behaviour, and compatible headphone or accessory detection.",
      },
    ],
    faqs: [
      {
        question: "Does my iPhone 13 charging port need cleaning or replacement?",
        answer:
          "Not always. Pocket lint can stop the cable from seating properly, so we inspect and clean the port first where safe. If pins, flex cable, or internal connections are damaged, we quote replacement.",
      },
      {
        question: "Can you replace the iPhone 13 charging port the same day?",
        answer:
          "Most iPhone 13 charging port repairs can be completed the same day when parts are available and the fault is limited to the port assembly rather than board damage.",
      },
      {
        question: "Do you test data and headphone accessory connection after repair?",
        answer:
          "Yes. We validate wired charging, cable grip, computer/data connectivity, microphone behaviour, speaker output, and supported Lightning headphone or accessory detection before pickup.",
      },
      {
        question: "What if the iPhone 13 charging issue is board-level?",
        answer:
          "If cleaning or flex replacement will not solve the issue, we explain the likely board-level fault and the micro-soldering path before any extra work is approved.",
      },
    ],
  },
];

const REPAIR_POCKET_ALIASES: Record<string, string> = {
  "back-glass-repair": "rear-glass-repair",
  "back-housing-replacement": "rear-glass-repair",
  "charging-port-replacement": "charging-port-repair",
};

export function normalizeRepairPocketSlug(slug: string) {
  const normalized = slugify(slug);
  return REPAIR_POCKET_ALIASES[normalized] || normalized;
}

export function getIphone13ModelSeoPocketSuite(params: {
  category: string;
  brand: string;
  model: string;
}): ModelSeoPocketSuite | null {
  const category = slugify(params.category);
  const brand = slugify(params.brand);
  const model = slugify(params.model);

  if (
    category !== "phone" ||
    (brand !== "iphone" && brand !== "apple") ||
    model !== "iphone-13"
  ) {
    return null;
  }

  return {
    defaultFaqs: IPHONE_13_GENERAL_TRUST_FAQS,
    pockets: IPHONE_13_REPAIR_POCKETS,
  };
}
