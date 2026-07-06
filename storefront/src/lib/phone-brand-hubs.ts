export interface PhoneBrandHubContent {
  slug: string;
  brandName: string;
  metadata: {
    title: string;
    description: string;
  };
  timing: {
    screen: string;
    battery?: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
}

const BATCH_PHONE_BRAND_NAMES: Record<string, string> = {
  xiaomi: 'Xiaomi',
  nokia: 'Nokia',
  vivo: 'Vivo',
  lg: 'LG',
  oneplus: 'OnePlus',
  huawei: 'Huawei',
  htc: 'HTC',
  sony: 'Sony',
  telstra: 'Telstra',
  motorola: 'Motorola',
  microsoft: 'Microsoft',
  realme: 'Realme',
  asus: 'Asus',
  tcl: 'TCL',
  nothing: 'Nothing',
};

function buildBatchPhoneBrandFaqs(brandName: string) {
  return [
    {
      question: `Which ${brandName} phone models do you repair?`,
      answer: `This page lists the currently supported public ${brandName} phone models. If your exact model is not shown, contact the Ringwood Square store and we can confirm whether a repair path is available.`,
    },
    {
      question: `How can I identify my ${brandName} model?`,
      answer: `If the phone turns on, check Settings and About phone or About device for the model name or model number. If the device is damaged or you are unsure, contact the store or bring it to Ringwood Square and we can help identify it before quoting.`,
    },
    {
      question: `How much does a ${brandName} phone repair cost?`,
      answer: `Cost depends on the exact ${brandName} model, repair type, fault, device condition and current parts availability. Choose your model first to see live pricing where available, or a Quote option when the repair needs confirmation.`,
    },
    {
      question: `How long can a ${brandName} repair take?`,
      answer: `Timing depends on the exact model, the fault, current stock, the repair queue and the device condition found during assessment. We confirm practical timing before the repair is approved.`,
    },
    {
      question: "Do I need to make a booking?",
      answer: `Walk-ins are welcome at Ringwood Square. Booking or calling ahead can help us check stock, likely timing and the best next step for your specific ${brandName} model.`,
    },
    {
      question: "Will my data normally be affected?",
      answer: "Many hardware services do not intentionally erase data, but a data outcome cannot be guaranteed. Back up important data where possible before bringing the device in.",
    },
    {
      question: `Do ${brandName} phone repairs include a warranty?`,
      answer: `Eligible ${brandName} phone repairs include a six-month warranty, subject to the warranty conditions and exclusions explained with the repair.`,
    },
    {
      question: "What happens if the required part is not in stock?",
      answer: "We will explain stock availability, ordering options and likely timing before the repair is approved, so you can decide whether to proceed.",
    },
    {
      question: "Is it better to repair or replace my phone?",
      answer: "That depends on the phone age, overall condition, repair quote, other faults, data needs and replacement cost. After checking the model and fault, we can explain the practical options.",
    },
    {
      question: "Can water resistance be guaranteed after repair?",
      answer: "New sealing adhesive is applied during reassembly where the device design permits it, providing some protection against everyday splashes. The original factory water-resistance rating cannot be guaranteed, and the repaired phone should not be submerged or intentionally exposed to water.",
    },
  ];
}

function buildBatchPhoneBrandHubContent(slug: string, brandName: string): PhoneBrandHubContent {
  return {
    slug,
    brandName,
    metadata: {
      title: `${brandName} Phone Repair | Screen, Battery & Charging | Ali Mobile`,
      description: `${brandName} phone repair at Ringwood Square for Melbourne's eastern suburbs. Check available screen, battery, charging and rear-damage repair options by exact model.`,
    },
    timing: {
      screen: '',
    },
    faqs: buildBatchPhoneBrandFaqs(brandName),
  };
}

export function getPhoneBrandRepairKeyword(slug: string, brandName: string): string {
  switch (slug) {
    case 'iphone':
      return 'iPhone Repair';
    case 'samsung':
      return 'Samsung Phone Repair';
    case 'google-pixel':
      return 'Google Pixel Repair';
    case 'oppo':
      return 'OPPO Phone Repair';
    default:
      if (BATCH_PHONE_BRAND_NAMES[slug]) {
        return `${BATCH_PHONE_BRAND_NAMES[slug]} Phone Repair`;
      }
      return `${brandName} Phone Repair`;
  }
}

export const PHONE_BRAND_HUBS: Record<string, PhoneBrandHubContent> = {
  iphone: {
    slug: 'iphone',
    brandName: 'iPhone',
    metadata: {
      title: 'iPhone Repair | Screen, Battery & Charging | Ali Mobile',
      description: "iPhone repair at Ringwood Square for Melbourne's eastern suburbs. Check screen, battery, charging and back glass repair options by exact model."
    },
    timing: {
      screen: 'We support a broad range of current and earlier iPhone models. Choose your exact model to check the repair options currently available.',
      battery: 'Most iPhone battery replacements take less than 30 minutes once the correct battery is available.'
    },
    faqs: [
      { question: "Which iPhone models do you repair?", answer: "This page lists the currently supported public iPhone models. If your exact model is not shown, contact the Ringwood Square store and we can confirm whether a repair path is available." },
      { question: "What screen options are available for iPhone repairs?", answer: "Screen options may include aftermarket, premium aftermarket, Soft OLED, or genuine/pulled genuine options depending on the iPhone model and current availability. The quote explains which option you are choosing, and lower starting prices may refer to selected aftermarket options unless genuine or pulled genuine supply is clearly confirmed." },
      { question: "What does Parts and Service History mean on iPhone?", answer: "Some iPhone models may show Parts and Service History, Unknown Part, or related display and battery messages after repair depending on part type, pairing, calibration and iOS behaviour. We explain possible messages before repair where they are relevant to the model and repair option." },
      { question: "Will third-party iPhone repair affect Apple warranty?", answer: "Apple warranty and AppleCare decisions are controlled by Apple. Independent repair may affect how Apple handles related issues, and Ali Mobile is an independent repair shop rather than part of Apple's service-provider network. If your iPhone is still covered by Apple warranty or AppleCare, check with Apple first before choosing independent repair." },
      { question: "Will I lose my data during iPhone repair?", answer: "Most iPhone screen, battery and charging port repairs do not require a data wipe. Back up first where possible, especially if the iPhone has liquid damage, board faults or severe damage that can carry higher data risk." },
      { question: "How long can an iPhone repair take?", answer: "Timing depends on the exact model, the fault, current stock and the device condition found during assessment. We confirm practical timing before the repair is approved." },
      { question: "How much does an iPhone repair cost?", answer: "Cost depends on the exact iPhone model, repair type, fault and current parts availability. Choose your model first to see live pricing where available, or a Quote option when the repair needs confirmation." },
      { question: "Do I need to make a booking?", answer: "Walk-ins are welcome at Ringwood Square. Booking or calling ahead can help us check stock, likely timing and the best next step for your specific iPhone model." },
      { question: "Do you provide a repair warranty?", answer: "Eligible screen, battery, charging-port and back-housing repairs include a 6-month warranty on the fitted part and workmanship. Coverage has conditions and does not cover unrelated faults, later physical damage or later liquid exposure where applicable." },
      { question: "What happens if the required part is not in stock?", answer: "We will explain stock availability, ordering options and likely timing before the repair is approved, so you can decide whether to proceed." },
      { question: "Is it better to repair or replace my iPhone?", answer: "That depends on the iPhone age, overall condition, repair quote, other faults, storage or data needs, and replacement cost. After checking the model and fault, we can explain the practical options." }
    ]
  },
  samsung: {
    slug: 'samsung',
    brandName: 'Samsung Galaxy',
    metadata: {
      title: 'Samsung Phone Repair | Screen, Battery & Charging | Ali Mobile',
      description: "Samsung phone repair at Ringwood Square for Melbourne's eastern suburbs. Check available screen, battery, charging and rear-cover repair options by exact model."
    },
    timing: {
      screen: 'Most supported Samsung screen replacements can usually be completed in about 30 minutes once the correct part is available.'
    },
    faqs: [
      { question: "Which Samsung phone models do you repair?", answer: "This page lists the currently supported public Samsung phone models, including Galaxy S, A, Note and Z series devices. If your exact model is not shown, contact the Ringwood Square store and we can confirm whether a repair path is available." },
      { question: "How can I identify my Samsung model?", answer: "If the phone turns on, check Settings > About phone for the model name or model number. If the device is damaged or you are unsure, contact the store or bring it to Ringwood Square and we can help identify it before quoting." },
      { question: "How much does a Samsung phone repair cost?", answer: "Cost depends on the exact Samsung model, repair type, fault, device condition and current parts availability. Choose your model first to see live pricing where available, or a Quote option when the repair needs confirmation." },
      { question: "How long can a Samsung repair take?", answer: "Timing depends on the exact model, the fault, current stock, the repair queue and the device condition found during assessment. We confirm practical timing before the repair is approved." },
      { question: "Do I need to make a booking?", answer: "Walk-ins are welcome at Ringwood Square. Booking or calling ahead can help us check stock, likely timing and the best next step for your specific Samsung model." },
      { question: "Will my data normally be affected by a Samsung repair?", answer: "Many hardware services do not intentionally erase data, but a data outcome cannot be guaranteed. Back up important data where possible before bringing the device in." },
      { question: "Do Samsung phone repairs include a warranty?", answer: "Eligible Samsung phone repairs include a six-month warranty, subject to the warranty conditions and exclusions explained with the repair." },
      { question: "What happens if the required Samsung part is not in stock?", answer: "We will explain stock availability, ordering options and likely timing before the repair is approved, so you can decide whether to proceed." },
      { question: "Is it better to repair or replace my Samsung phone?", answer: "That depends on the phone age, overall condition, repair quote, other faults, data needs and replacement cost. After checking the model and fault, we can explain the practical options." },
      { question: "Can water resistance be guaranteed after a Samsung repair?", answer: "New sealing adhesive is applied during reassembly where the device design permits it, providing some protection against everyday splashes. The original factory water-resistance rating cannot be guaranteed, and the repaired phone should not be submerged or intentionally used in water." }
    ]
  },
  'google-pixel': {
    slug: 'google-pixel',
    brandName: 'Google Pixel',
    metadata: {
      title: 'Google Pixel Repair | Screen, Battery & Charging | Ali Mobile',
      description: "Google Pixel repair at Ringwood Square for Melbourne's eastern suburbs. Check screen, battery, charging and rear-glass repair options by exact model."
    },
    timing: {
      screen: 'Most supported Google Pixel screen replacements can usually be completed in about 30 minutes once the correct part is available.'
    },
    faqs: [
      { question: "Which Google Pixel models do you repair?", answer: "This page lists the currently supported public Google Pixel models, including standard, Pro, Pro XL and Fold models where listed. If your exact model is not shown, contact the Ringwood Square store and we can confirm whether a repair path is available." },
      { question: "How can I identify my Google Pixel model?", answer: "If the phone turns on, check Settings > About phone for the device or model information. If the device is damaged or you are unsure, contact the store or bring it to Ringwood Square and we can help identify it before quoting." },
      { question: "How much does a Google Pixel repair cost?", answer: "Cost depends on the exact Pixel model, repair type, fault, device condition and current parts availability. Choose your model first to see live pricing where available, or a Quote option when the repair needs confirmation." },
      { question: "How long can a Google Pixel repair take?", answer: "Timing depends on the exact model, the fault, current stock, the repair queue and the device condition found during assessment. We confirm practical timing before the repair is approved." },
      { question: "Do I need to make a booking?", answer: "Walk-ins are welcome at Ringwood Square. Booking or calling ahead can help us check stock, likely timing and the best next step for your specific Pixel model." },
      { question: "Will my data normally be affected by a Pixel repair?", answer: "Many hardware services do not intentionally erase data, but a data outcome cannot be guaranteed. Back up important data where possible before bringing the device in." },
      { question: "Do Google Pixel repairs include a warranty?", answer: "Eligible Google Pixel phone repairs include a six-month warranty, subject to the warranty conditions and exclusions explained with the repair." },
      { question: "What happens if the required Pixel part is not in stock?", answer: "We will explain stock availability, ordering options and likely timing before the repair is approved, so you can decide whether to proceed." },
      { question: "Is it better to repair or replace my Google Pixel?", answer: "That depends on the device age, overall condition, repair quote, other faults, data needs and replacement cost. After checking the model and fault, we can explain the practical options." },
      { question: "Can water resistance be guaranteed after a Pixel repair?", answer: "New sealing adhesive is applied during reassembly where the device design permits it, providing some protection against everyday splashes. The original factory water-resistance rating cannot be guaranteed, and the repaired phone should not be submerged or intentionally used in water." }
    ]
  },
  oppo: {
    slug: 'oppo',
    brandName: 'Oppo',
    metadata: {
      title: 'OPPO Phone Repair | Screen, Battery & Charging | Ali Mobile',
      description: "OPPO phone repair at Ringwood Square for Melbourne's eastern suburbs. Check screen, battery, charging and rear-damage repair options by exact model."
    },
    timing: {
      screen: 'Many supported Oppo screen replacements take approximately 30 minutes, while some Oppo models may require around 45 minutes once the correct part is available.'
    },
    faqs: [
      { question: "Which OPPO phone models do you repair?", answer: "The public model browser lists currently supported OPPO Find, Reno and A Series phones. If your exact model is not shown, contact the Ringwood store and we can confirm whether a repair path is available." },
      { question: "How can I identify my OPPO model?", answer: "If the device works, check Settings, then About device or About phone for the model name or model number. Menu names can vary between OPPO software versions, so contact the store or bring the phone in if you are unsure." },
      { question: "How much does an OPPO phone repair cost?", answer: "Cost depends on the exact OPPO model, repair type, fault, device condition and current parts availability. Choose your model first to see live pricing where available, or a Quote option when the repair needs confirmation." },
      { question: "How long can an OPPO repair take?", answer: "Timing depends on the exact model, fault, parts stock, current repair queue and overall device condition. We confirm practical timing before the repair is approved." },
      { question: "Do I need to make a booking?", answer: "Walk-ins are welcome at Ringwood Square. Booking or calling ahead can help us check stock, likely timing and the best next step for your OPPO model." },
      { question: "Will my data normally be affected by an OPPO repair?", answer: "Many hardware services do not intentionally erase data, but a data outcome cannot be guaranteed. Back up important data where possible before bringing the device in." },
      { question: "Do OPPO phone repairs include a warranty?", answer: "Eligible OPPO phone repairs include a six-month warranty, subject to the warranty conditions and exclusions explained with the repair." },
      { question: "What happens if the required OPPO part is not in stock?", answer: "We will explain stock availability, ordering options and likely timing before the repair is approved, so you can decide whether to proceed. We do not promise an exact delivery date before the part path is confirmed." },
      { question: "Is it better to repair or replace my OPPO phone?", answer: "That depends on the phone age, overall condition, repair quote, other faults, data needs and replacement cost. After checking the model and fault, we can explain the practical options without automatically recommending repair." },
      { question: "Can water resistance be guaranteed after an OPPO repair?", answer: "New sealing adhesive is applied during reassembly where the device design permits it, providing some protection against everyday splashes. The original factory water-resistance rating cannot be guaranteed, and the repaired phone should not be submerged or intentionally exposed to water." }
    ]
  },
  xiaomi: buildBatchPhoneBrandHubContent('xiaomi', 'Xiaomi'),
  nokia: buildBatchPhoneBrandHubContent('nokia', 'Nokia'),
  vivo: buildBatchPhoneBrandHubContent('vivo', 'Vivo'),
  lg: buildBatchPhoneBrandHubContent('lg', 'LG'),
  oneplus: buildBatchPhoneBrandHubContent('oneplus', 'OnePlus'),
  huawei: buildBatchPhoneBrandHubContent('huawei', 'Huawei'),
  htc: buildBatchPhoneBrandHubContent('htc', 'HTC'),
  sony: buildBatchPhoneBrandHubContent('sony', 'Sony'),
  telstra: buildBatchPhoneBrandHubContent('telstra', 'Telstra'),
  motorola: buildBatchPhoneBrandHubContent('motorola', 'Motorola'),
  microsoft: buildBatchPhoneBrandHubContent('microsoft', 'Microsoft'),
  realme: buildBatchPhoneBrandHubContent('realme', 'Realme'),
  asus: buildBatchPhoneBrandHubContent('asus', 'Asus'),
  tcl: buildBatchPhoneBrandHubContent('tcl', 'TCL'),
  nothing: buildBatchPhoneBrandHubContent('nothing', 'Nothing'),
};

export function getPhoneBrandHubContent(slug: string, brandName: string): PhoneBrandHubContent {
  if (PHONE_BRAND_HUBS[slug]) {
    return PHONE_BRAND_HUBS[slug];
  }
  
  return {
    slug,
    brandName,
    metadata: {
      title: `${brandName} Phone Repair | Models & Repair Options | Ali Mobile`,
      description: `${brandName} phone repair at Ringwood Square for Melbourne's eastern suburbs. Select your exact model to view available repair options and pricing.`
    },
    timing: {
      screen: ''
    },
    faqs: [
      { question: `Do I need to know my exact ${brandName} model?`, answer: "Yes, parts differ significantly across different series and generations. We need the exact model to confirm parts availability and quoting." },
      { question: `How long does a ${brandName} repair take?`, answer: "Repair timing depends on the exact model, the fault, and parts availability. We explain the practical timing once the diagnosis is complete." },
      { question: `Can you fix my ${brandName} charging port?`, answer: "Yes, if the charging port is faulty. We first check for debris or cable issues before confirming a charging port component replacement." },
      { question: `Why is my ${brandName} battery draining so fast?`, answer: "Fast drain can be a sign of battery wear, charging issues, or other board faults. We check symptoms to confirm the repair path." },
      { question: `Will my ${brandName} remain water-resistant after repair?`, answer: "Original factory water resistance cannot be guaranteed after opening or repair." },
      { question: "Can I walk in, or should I book first?", answer: "Walk-ins are welcome at our Ringwood Square kiosk. We recommend calling ahead to check stock for your specific model." }
    ]
  };
}
