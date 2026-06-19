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

export const PHONE_BRAND_HUBS: Record<string, PhoneBrandHubContent> = {
  iphone: {
    slug: 'iphone',
    brandName: 'iPhone',
    metadata: {
      title: 'iPhone Repair Services Ringwood | Fast Screen & Battery Fixes',
      description: 'Expert iPhone repair services in Ringwood. Fast screen replacement, battery repair, and diagnostic assessment. Confirm your exact model for compatible repair options.'
    },
    timing: {
      screen: 'Most iPhone screen replacements, including Pro and Pro Max models from iPhone 6 through iPhone 16, can usually be completed in about 30 minutes once the correct part is available.',
      battery: 'Most iPhone battery replacements take less than 30 minutes once the correct battery is available.'
    },
    faqs: [
      { question: "How long does an iPhone screen replacement usually take?", answer: "Most iPhone screen replacements, including Pro and Pro Max models from iPhone 6 through iPhone 16, can usually be completed in about 30 minutes once the correct part is available. If the frame, battery or internal connectors are also damaged, we will confirm any additional time before starting." },
      { question: "How long does an iPhone battery replacement usually take?", answer: "Most iPhone battery replacements take less than 30 minutes once the correct battery is available." },
      { question: "Do I need to know my exact iPhone model?", answer: "Yes, compatible parts differ by iPhone generation and variant (e.g. Pro, Pro Max, mini, Plus). If you are unsure, bring it to our Ringwood Square kiosk and we will identify it for you." },
      { question: "Can a charging problem be caused by something other than the charging port?", answer: "Yes. Cleaning out debris, trying a different charger or cable, or diagnosing a battery fault often resolves charging symptoms. We assess alternatives before confirming a port replacement." },
      { question: "Is back glass replacement the same as complete housing replacement?", answer: "No. Back glass involves only the rear cover, whereas full housing replacement involves the frame. The method depends on your exact model, camera lens involvement, and frame condition." },
      { question: "Will my iPhone remain water-resistant after repair?", answer: "Factory water resistance cannot be guaranteed after opening or repair. While we may reseal the device where appropriate, adhesive replacement does not restore guaranteed factory water-resistance certification." },
      { question: "Can I walk in, or should I book first?", answer: "Walk-ins are welcome at our Ringwood Square kiosk. However, we recommend booking or calling ahead to confirm part availability for your specific iPhone model." },
      { question: "What happens if the frame or internal components are also damaged?", answer: "We conduct an inspection before repairing. If the frame or internal connectors are damaged, we will confirm the compatible repair options and any additional timing before work begins." }
    ]
  },
  samsung: {
    slug: 'samsung',
    brandName: 'Samsung Galaxy',
    metadata: {
      title: 'Samsung Phone Repair Services Ringwood | Screen & Battery Fixes',
      description: 'Expert Samsung phone repair services in Ringwood. Screen replacement, battery repair, and diagnostic assessment for Galaxy S, Z, and A series.'
    },
    timing: {
      screen: 'Most supported Samsung screen replacements can usually be completed in about 30 minutes once the correct part is available.'
    },
    faqs: [
      { question: "How long does a Samsung screen replacement take?", answer: "Most supported Samsung screen replacements can usually be completed in about 30 minutes once the correct part is available." },
      { question: "Do you repair Samsung Z Fold and Z Flip phones?", answer: "Yes, we support a range of Samsung models including Galaxy Z Fold and Z Flip. Please choose your exact model to view the compatible repair paths." },
      { question: "Do I need to know my exact Samsung model?", answer: "Yes, parts differ significantly across Galaxy S, Note, A, J, and Z series. We need the exact model to confirm parts and pricing." },
      { question: "Why is my Samsung not charging?", answer: "Charging problems can be caused by a faulty battery, debris in the charging port, or board-level faults. We inspect the charging assembly before confirming the repair." },
      { question: "Will my Samsung remain water-resistant after repair?", answer: "Factory water resistance cannot be guaranteed after opening or repair. Adhesive resealing does not restore guaranteed factory water-resistance certification." },
      { question: "Is back glass the same as housing replacement?", answer: "No. The rear cover is separate from the main housing or frame. We assess the frame condition and camera involvement before advising on the repair path." },
      { question: "Can I walk in, or should I book first?", answer: "Walk-ins are welcome at Kiosk C1 in Ringwood Square. Calling ahead allows us to confirm part availability for your specific Samsung model." }
    ]
  },
  'google-pixel': {
    slug: 'google-pixel',
    brandName: 'Google Pixel',
    metadata: {
      title: 'Google Pixel Repair Services Ringwood | Screen & Battery Fixes',
      description: 'Expert Google Pixel repair services in Ringwood. Screen replacement, battery repair, and diagnostic assessment for Pixel models.'
    },
    timing: {
      screen: 'Most supported Google Pixel screen replacements can usually be completed in about 30 minutes once the correct part is available.'
    },
    faqs: [
      { question: "How long does a Google Pixel screen replacement take?", answer: "Most supported Google Pixel screen replacements can usually be completed in about 30 minutes once the correct part is available." },
      { question: "Do I need to know my exact Google Pixel model?", answer: "Yes. Repair compatibility varies between standard, Pro, and 'a' series Pixel models. We need the exact model to quote accurately." },
      { question: "Why is my Pixel battery draining so fast?", answer: "Fast drain can be a sign of battery wear or other board faults. We check charging symptoms versus battery faults to confirm the repair path." },
      { question: "Does my Pixel charging port need replacing?", answer: "Not always. We first check for debris or cable issues before confirming a charging port component replacement." },
      { question: "Will my Google Pixel remain water-resistant after repair?", answer: "Factory water resistance cannot be guaranteed after opening or repair. Adhesive replacement does not restore guaranteed factory water-resistance certification." },
      { question: "Can I walk in, or should I book first?", answer: "Walk-ins are welcome at Ringwood Square Kiosk C1. We recommend booking to ensure we have the correct part for your Pixel model." },
      { question: "What happens if there is frame damage?", answer: "If the frame is bent or damaged, a new screen may not sit correctly. We inspect the frame condition before proceeding with a screen replacement." }
    ]
  },
  oppo: {
    slug: 'oppo',
    brandName: 'Oppo',
    metadata: {
      title: 'Oppo Phone Repair Services Ringwood | Screen & Battery Fixes',
      description: 'Expert Oppo phone repair services in Ringwood. Screen replacement, battery repair, and diagnostic assessment.'
    },
    timing: {
      screen: 'Many supported Oppo screen replacements take approximately 30 minutes, while some Oppo models may require around 45 minutes once the correct part is available.'
    },
    faqs: [
      { question: "How long does an Oppo screen replacement take?", answer: "Many supported Oppo screen replacements take approximately 30 minutes, while some Oppo models may require around 45 minutes once the correct part is available." },
      { question: "Do I need to know my exact Oppo model?", answer: "Yes, Oppo has many different models (Find, Reno, A series). Parts are specific to each exact model, so we need to identify the device first." },
      { question: "Why is my Oppo battery dying quickly?", answer: "Rapid drain or shutdowns often indicate a failing battery, but we assess whether the fault is battery wear or a charging issue." },
      { question: "Can you fix my Oppo charging port?", answer: "Yes, if the charging port is faulty, we can replace it. However, we always assess whether a simple clean or new cable resolves the issue first." },
      { question: "Is Oppo back glass repairable?", answer: "Yes, depending on the model, we can replace the back cover. The repair method varies based on frame involvement and camera positioning." },
      { question: "Will my Oppo remain water-resistant after repair?", answer: "Original factory water resistance cannot be guaranteed after opening or repair." },
      { question: "Can I walk in, or should I book first?", answer: "Walk-ins to our Ringwood Square location are welcome. We recommend calling ahead so we can check stock for your specific Oppo model." }
    ]
  }
};

export function getPhoneBrandHubContent(slug: string, brandName: string): PhoneBrandHubContent {
  if (PHONE_BRAND_HUBS[slug]) {
    return PHONE_BRAND_HUBS[slug];
  }
  
  return {
    slug,
    brandName,
    metadata: {
      title: `${brandName} Phone Repair Services Ringwood | Screen & Battery Fixes`,
      description: `Expert ${brandName} phone repair services in Ringwood. Screen replacement, battery repair, and diagnostic assessment. Confirm your exact model for compatible repair options.`
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
