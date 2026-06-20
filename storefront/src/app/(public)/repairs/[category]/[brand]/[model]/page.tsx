import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchRepairCatalog, fetchModelRepairTypes } from "@/lib/api";
import { formatDynamicParam, preserveRouteSegment, safeSlugSegment } from "@/lib/inventoryUtils";
import Breadcrumbs from "@/components/Breadcrumbs";
import BackButton from "@/components/BackButton";
import RepairOptionsGrid from "@/components/services/RepairOptionsGrid";
import RepairCTA from "@/components/services/RepairCTA";
import RepairResultsMatchingSection from "@/components/repair-results/RepairResultsMatchingSection";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, Battery, Camera, Clock3, Droplets, PhoneCall, PlugZap, ShieldCheck, Smartphone, Wrench } from "lucide-react";

export const revalidate = 86400;
export const dynamicParams = true;

interface ModelPageProps {
  params: Promise<{ category: string; brand: string; model: string }>;
}

type RepairTypeEntry = {
  slug: string;
  name: string;
  price: number;
  variants?: Array<{ quality_grade: string; price: number; is_recommended?: boolean }>;
};

function getRepairBySlugs(repairTypes: RepairTypeEntry[], slugs: string[]) {
  return repairTypes.find((repair) => slugs.includes(repair.slug));
}

function getStartingPrice(repairTypes: RepairTypeEntry[]): number | null {
  const prices = repairTypes
    .map((repair) => repair.price)
    .filter((price) => Number.isFinite(price) && price > 0);

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

function formatStartingPrice(price: number) {
  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 0,
  }).format(price);
}

function isIPhone12OrNewer(modelName: string) {
  const normalized = modelName.toLowerCase();
  const generationMatch = normalized.match(/iphone\s+(\d+)/i);
  if (!generationMatch) {
    return false;
  }

  return Number.parseInt(generationMatch[1], 10) >= 12;
}

function getIPhoneScreenOptions(
  variants: Array<{ quality_grade: string; price: number; is_recommended?: boolean }> = []
) {
  const normalizedGrades = variants.map((variant) => variant.quality_grade.toLowerCase());
  const options: Array<{ title: string; body: string }> = [];

  if (normalizedGrades.some((grade) => grade.includes("standard") || grade.includes("incell") || grade.includes("in-cell") || grade.includes("lcd"))) {
    options.push({
      title: "Incell LCD",
      body: "A more affordable screen option for customers who prioritise repair cost. It uses LCD display technology and may differ from the original OLED screen in colour, brightness, thickness and power efficiency.",
    });
  }

  if (normalizedGrades.some((grade) => grade.includes("premium") || grade.includes("soft oled"))) {
    options.push({
      title: "Soft OLED",
      body: "A flexible OLED screen option designed to provide display quality, touch response, thickness and viewing performance closer to the original OLED screen.",
    });
  }

  if (normalizedGrades.some((grade) => grade.includes("genuine") || grade.includes("oem"))) {
    options.push({
      title: "Genuine",
      body: "A genuine Apple screen option for customers who prefer original Apple display hardware, subject to availability for the selected model.",
    });
  }

  return options;
}

function getPublishedScreenOptions(
  variants: Array<{ quality_grade: string; price: number; is_recommended?: boolean }> = []
) {
  const uniqueGrades = Array.from(
    new Set(
      variants
        .map((variant) => variant.quality_grade?.trim())
        .filter((grade): grade is string => Boolean(grade))
    )
  );

  return uniqueGrades.map((grade) => ({
    title: grade,
    body: `A published ${grade} screen option for this exact Samsung model. Choose Screen Replacement below to view the current price, availability and repair notes for this option.`,
  }));
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();

  // Limit to top 100 models to balance build time and SEO
  const allModels = catalog.brands.flatMap(brand =>
    brand.models.map(model => ({
      category: brand.category,
      brand: brand.slug,
      model: model.slug
    }))
  );

  return allModels;
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { category: categorySlug, brand: brandSlug, model: modelSlug } = await params;
  const data = await fetchModelRepairTypes(categorySlug, brandSlug, modelSlug);

  if (!data) {
    notFound();
  }

  const modelName = data?.model || formatDynamicParam(modelSlug);
  const brandName = data?.brand || formatDynamicParam(brandSlug);
  const canonicalPath = `/repairs/${safeSlugSegment(categorySlug)}/${safeSlugSegment(brandSlug)}/${preserveRouteSegment(modelSlug)}`;
  const isPhoneModelPage = categorySlug === "phone";
  const isIPhoneModelPage = categorySlug === "phone" && brandSlug === "iphone";
  const isSamsungModelPage = categorySlug === "phone" && brandSlug === "samsung";
  const isGooglePixelModelPage = categorySlug === "phone" && ["google", "google-pixel", "googlepixel", "pixel"].includes(brandSlug);
  const isOppoModelPage = categorySlug === "phone" && brandSlug === "oppo";
  const isEnhancedPhoneModelPage = isPhoneModelPage;

  return {
    title: isEnhancedPhoneModelPage
      ? `${modelName} Repair in Ringwood | Pricing, Screen Options & Booking | Ali Mobile`
      : `${modelName} Repair in Ringwood | Fast \u0026 Reliable | Ali Mobile`,
    description: isIPhoneModelPage
      ? `Choose the available repairs for ${modelName}, view current pricing, check common timing, compare screen options where published, and book with Ali Mobile & Repair in Ringwood.`
      : isSamsungModelPage
      ? `Choose the available Samsung repairs for ${modelName}, view current pricing, check screen and battery service options, and book with Ali Mobile & Repair in Ringwood.`
      : isGooglePixelModelPage
      ? `Choose the available Google Pixel repairs for ${modelName}, view current pricing, check Pixel screen and battery service options, and book with Ali Mobile & Repair in Ringwood.`
      : isOppoModelPage
      ? `Choose the available Oppo repairs for ${modelName}, view current pricing, check Oppo screen and battery service options, and book with Ali Mobile & Repair in Ringwood.`
      : isPhoneModelPage
      ? `Choose the available ${brandName} repairs for ${modelName}, view current pricing, check supported repair options, and book with Ali Mobile & Repair in Ringwood.`
      : `Choose a repair service for your ${modelName}. ${brandName} screen replacement, battery swap, charging port fix \u0026 more — most common repairs under 1 hour in Ringwood when parts are in stock, with warranty support on eligible repairs.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: isEnhancedPhoneModelPage
        ? `${modelName} Repair in Ringwood | Pricing, Screen Options & Booking`
        : `${modelName} Repair in Ringwood | Fast \u0026 Reliable`,
      description: isIPhoneModelPage
        ? `Choose the available repairs for ${modelName}, view current pricing, check common timing, compare screen options where published, and book with Ali Mobile & Repair in Ringwood.`
        : isSamsungModelPage
        ? `Choose the available Samsung repairs for ${modelName}, view current pricing, check screen and battery service options, and book with Ali Mobile & Repair in Ringwood.`
        : isGooglePixelModelPage
        ? `Choose the available Google Pixel repairs for ${modelName}, view current pricing, check Pixel screen and battery service options, and book with Ali Mobile & Repair in Ringwood.`
        : isOppoModelPage
        ? `Choose the available Oppo repairs for ${modelName}, view current pricing, check Oppo screen and battery service options, and book with Ali Mobile & Repair in Ringwood.`
        : isPhoneModelPage
        ? `Choose the available ${brandName} repairs for ${modelName}, view current pricing, check supported repair options, and book with Ali Mobile & Repair in Ringwood.`
        : `Choose a repair service for your ${modelName}. ${brandName} screen replacement, battery swap, charging port fix \u0026 more — most common repairs under 1 hour in Ringwood when parts are in stock, with warranty support on eligible repairs.`,
      url: canonicalPath,
      type: "website",
      locale: "en_AU",
      siteName: "Ali Mobile & Repair",
    },
  };
}

export default async function ModelRepairSelectPage({ params }: ModelPageProps) {
  const { category: categorySlug, brand: brandSlug, model: modelSlug } = await params;
  const data = await fetchModelRepairTypes(categorySlug, brandSlug, modelSlug);

  if (!data) {
    notFound();
  }

  const modelName = data?.model || formatDynamicParam(modelSlug);
  const brandName = data?.brand || formatDynamicParam(brandSlug);
  const introBrandPrefix = brandName && modelName.toLowerCase().startsWith(brandName.toLowerCase()) ? "" : `${brandName} `;
  const repairTypes = data?.repairTypes || [];
  const isPhoneModelPage = categorySlug === "phone";
  const isIPhoneModelPage = categorySlug === "phone" && brandSlug === "iphone";
  const isSamsungModelPage = categorySlug === "phone" && brandSlug === "samsung";
  const isGooglePixelModelPage = categorySlug === "phone" && ["google", "google-pixel", "googlepixel", "pixel"].includes(brandSlug);
  const isOppoModelPage = categorySlug === "phone" && brandSlug === "oppo";
  const isEnhancedPhoneModelPage = isPhoneModelPage;
  const screenRepair = getRepairBySlugs(repairTypes, ["screen-replacement", "screen-repair"]);
  const batteryRepair = getRepairBySlugs(repairTypes, ["battery-replacement", "battery-service", "battery-repair"]);
  const chargingRepair = getRepairBySlugs(repairTypes, ["charging-port-replacement", "charging-port-repair", "charging-port"]);
  const backHousingRepair = getRepairBySlugs(repairTypes, ["back-housing-replacement", "back-glass-replacement", "back-glass", "back-housing"]);
  const hasScreenRepair = Boolean(screenRepair);
  const hasBatteryRepair = Boolean(batteryRepair);
  const hasWarrantyRepair = Boolean(screenRepair || batteryRepair || chargingRepair || backHousingRepair);
  const startingPrice = getStartingPrice(repairTypes);
  const hasPublishedScreenOptions = hasScreenRepair && isIPhone12OrNewer(modelName) && (screenRepair?.variants?.length || 0) > 0;
  const screenOptions = hasPublishedScreenOptions ? getIPhoneScreenOptions(screenRepair?.variants || []) : [];
  const nonIPhoneScreenOptions = !isIPhoneModelPage && hasScreenRepair && (screenRepair?.variants?.length || 0) > 0
    ? getPublishedScreenOptions(screenRepair?.variants || [])
    : [];
  const activeScreenOptions = isIPhoneModelPage ? screenOptions : nonIPhoneScreenOptions;
  const hasGenuineScreenOption = screenOptions.some((option) => option.title === "Genuine");
  const commonIssues = [
    {
      icon: Smartphone,
      text: "Cracked front glass or display faults",
    },
    {
      icon: Battery,
      text: "Rapid battery drain or unexpected shutdowns",
    },
    {
      icon: PlugZap,
      text: "Loose charging port or cable connection issues",
    },
    {
      icon: Camera,
      text: "Camera focus faults or cracked rear lenses",
    },
  ];
  const diagnosticSteps = ["Quick test", "Honest quote", "Repair options"];
  const iPhoneHeroCards = [
    {
      title: startingPrice ? `${modelName} repairs from $${formatStartingPrice(startingPrice)}` : `${modelName} repair pricing`,
      body: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the available repair for ${modelName} below to see the current price or quote requirement for that exact service.`,
    },
    {
      title: "Fast screen & battery timing",
      body: hasBatteryRepair
        ? "Most iPhone screen replacements are usually completed in about 30 minutes once the correct part is available. Most battery replacements take less than 30 minutes once the correct battery is available."
        : "Most iPhone screen replacements are usually completed in about 30 minutes once the correct part is available.",
    },
    {
      title: "Same-day repairs for common models",
      body: "Parts are normally available for most common iPhone models, allowing many repairs to be completed the same day. Less common or specific parts usually take around 1–2 days to arrive.",
    },
  ];
  const iPhoneQuickAnswers = [
    {
      number: "01",
      title: "How much does the repair cost?",
      body: startingPrice
        ? `Published repair options for this ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the repair option for this exact iPhone model to see the current price or quote requirement. Published prices include the listed fitted part and repair labour unless the page states otherwise.`,
    },
    hasScreenRepair
      ? {
          number: "02",
          title: "How long does a screen replacement take?",
          body: "Most iPhone screen replacements, including Pro and Pro Max models from iPhone 6 through iPhone 16, can usually be completed in about 30 minutes once the correct part is available. Extra time may be required if the frame is bent, liquid damage is present, internal components are also damaged or additional diagnosis is needed.",
        }
      : null,
    hasBatteryRepair
      ? {
          number: "03",
          title: "How long does a battery replacement take?",
          body: "Most iPhone battery replacements take less than 30 minutes once the correct battery is available.",
        }
      : null,
    {
      number: "04",
      title: "Can it normally be repaired today?",
      body: "Parts are normally available for most common iPhone models, allowing many repairs to be completed the same day. Less common or specific parts usually take around 1–2 days to arrive.",
    },
    {
      number: "05",
      title: "Will I lose my data or need to share my passcode?",
      body: "Most hardware repairs do not intentionally erase customer data, but a backup is recommended because damaged devices always carry some data risk. We generally do not require the customer’s lock-screen passcode, and if additional unlocked testing is needed the technician will ask first. If the customer prefers not to provide it, testing can be completed together before handover.",
    },
    hasWarrantyRepair
      ? {
          number: "06",
          title: "What warranty is included?",
          body: "Screen, battery, charging-port and back-housing repairs include a 6-month warranty on the fitted part and workmanship. The warranty does not cover new impact damage, bending, liquid damage, misuse, another repairer’s work or faults in unrelated components.",
        }
      : null,
    {
      number: "07",
      title: "What if another fault is discovered?",
      body: "If we discover additional damage that changes the repair method, price or expected result, we will explain it and obtain approval before carrying out extra work.",
    },
    {
      number: "08",
      title: "Is there an assessment fee?",
      body: "Most standard repair assessments are free. An assessment fee may apply to liquid-damaged or severely damaged iPhones where several components may be affected and a more detailed diagnosis is required.",
    },
  ].filter(Boolean) as Array<{ number: string; title: string; body: string }>;
  const iPhoneProcessSteps = [
    {
      number: "01",
      title: "Device inspection",
      body: "The technician checks the condition of the phone, the reported fault and any visible frame, battery, liquid or impact damage.",
    },
    {
      number: "02",
      title: "Repair and price confirmation",
      body: "The exact repair option, part choice, price and expected timing are confirmed before work begins.",
    },
    {
      number: "03",
      title: "Customer approval",
      body: "Any additional damage or change in repair scope is explained before further work is carried out.",
    },
    {
      number: "04",
      title: "Repair",
      body: "The selected repair is completed using the appropriate part and method for the exact iPhone model.",
    },
    {
      number: "05",
      title: "Testing and handover",
      body: "Relevant functions are tested after repair, and any aftercare, calibration, warranty or Parts and Service History information is explained before handover.",
    },
  ];
  const iPhoneServiceNotes = [
    {
      title: "Data, backup and passcode policy",
      body: "Most screen, battery and other hardware repairs do not require customer data to be erased. However, customers should back up important data before any repair because a damaged device can carry an existing risk of data loss. We generally do not require the customer’s lock-screen passcode, and we do not require the customer’s Apple Account password. If the technician needs the passcode for additional functional testing, they will ask first. If the customer prefers not to provide it, initial testing can be completed together before repair and final unlocked checks can be completed with the customer before handover.",
    },
    {
      title: "Pre and post-repair testing",
      body: "We test the device before repair where its condition allows, then repeat the relevant functional checks before handover. Depending on the repair and the phone’s condition, this can include display output, touch response, Face ID or Touch ID, cameras, speaker, microphone, proximity sensor, charging, battery and power behaviour, buttons, vibration, cable recognition and wireless charging where relevant.",
    },
    {
      title: "Assessment fees and No Fix, No Charge",
      body: "Most standard repair assessments are free. An assessment fee may apply to liquid-damaged or severely damaged phones where several components may be affected. For standard repair work, Ali Mobile follows a No Fix, No Charge policy, but a separately approved assessment fee may still apply to detailed liquid-damage or severe-damage diagnosis.",
    },
    {
      title: "Water resistance and Parts and Service History",
      body: "Factory water resistance cannot be guaranteed after a device has been opened or repaired. New adhesive may help reseal the phone, but it does not restore certified factory water resistance. Some iPhone models may show Parts and Service History after a supported component has been replaced, and any expected system message or Parts and Service History information will be explained before the repair.",
    },
  ];
  const iPhoneFaqs = [
    {
      question: `How much does a ${modelName} repair cost?`,
      answer: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement. Published prices include the fitted part and repair labour unless the page states otherwise.`
        : `Choose the repair option for this exact iPhone model to see the current price or quote requirement. Published prices include the listed fitted part and repair labour unless the page states otherwise.`,
    },
    hasScreenRepair
      ? {
          question: `How long does a ${modelName} screen replacement take?`,
          answer: "Most iPhone screen replacements, including Pro and Pro Max models from iPhone 6 through iPhone 16, can usually be completed in about 30 minutes once the correct part is available. Extra time may be required if the frame is bent, liquid damage is present, internal components are also damaged or additional diagnosis is needed.",
        }
      : null,
    hasBatteryRepair
      ? {
          question: `How long does a ${modelName} battery replacement take?`,
          answer: "Most iPhone battery replacements take less than 30 minutes once the correct battery is available.",
        }
      : null,
    {
      question: `Can my ${modelName} normally be repaired the same day?`,
      answer: "Parts are normally available for most common iPhone models, allowing many repairs to be completed the same day. Less common or specific parts usually take around 1–2 days to arrive.",
    },
    hasPublishedScreenOptions && screenOptions.length > 0
      ? {
          question: "What screen replacement options are available?",
          answer: `For this model, the currently published screen options may include ${screenOptions.map((option) => option.title).join(", ")} where available. Choose the exact screen repair below for the current option list, pricing and service notes.`,
        }
      : null,
    {
      question: "Will I lose my photos or other data?",
      answer: "Most hardware repairs do not intentionally erase customer data, but a backup is recommended because damaged devices always carry some data risk.",
    },
    {
      question: "Do you need my lock-screen passcode?",
      answer: "Usually no. If additional unlocked testing is required, the technician will ask first. Testing can also be completed with the customer if they prefer not to share the passcode.",
    },
    hasScreenRepair
      ? {
          question: `Will Face ID or Touch ID still work after a ${modelName} repair?`,
          answer: "We test the relevant functions before repair where the phone’s condition allows, then repeat the related checks after repair. If the phone arrives with no display, no power, severe liquid damage or existing sensor faults, not every function can always be confirmed at the initial stage.",
        }
      : null,
    hasGenuineScreenOption
      ? {
          question: "Can you complete diagnostics or calibration after fitting a genuine screen?",
          answer: "For supported iPhone models, we can complete the available diagnostic and calibration process after fitting a genuine screen.",
        }
      : null,
    {
      question: "What may appear in Parts and Service History?",
      answer: "Some iPhone models may show Parts and Service History after a screen, battery, camera or other supported component has been replaced. The information displayed can vary according to the iPhone model, the selected part and the available Apple diagnostic or calibration process.",
    },
    {
      question: "Will the iPhone remain water-resistant after repair?",
      answer: "Factory water resistance cannot be guaranteed after a device has been opened or repaired. New adhesive may help reseal the phone, but it does not restore certified factory water resistance.",
    },
    hasWarrantyRepair
      ? {
          question: "What does the 6-month warranty cover?",
          answer: "This repair includes a 6-month warranty covering the fitted part and our workmanship. It does not cover a new drop, cracked glass after repair, crushing, bending, liquid damage, misuse, another repairer’s work or faults in unrelated components.",
        }
      : null,
    {
      question: "What happens if the frame or another component is damaged?",
      answer: "If we discover additional damage that changes the repair method, price or expected result, we will explain it and obtain approval before carrying out extra work.",
    },
    {
      question: "Is there an assessment fee?",
      answer: "Most standard repair assessments are free. An assessment fee may apply to liquid-damaged or severely damaged phones where several components may be affected and a more detailed diagnosis is needed.",
    },
    {
      question: "Do I pay if the phone cannot be repaired?",
      answer: "For standard repair work, Ali Mobile follows a No Fix, No Charge policy. If we cannot complete the agreed repair, the customer does not pay for that repair. A separately approved assessment fee may still apply to liquid-damaged or severely damaged devices requiring detailed diagnosis.",
    },
    {
      question: "Can I walk in without an appointment?",
      answer: "Yes. Walk-ins are welcome at Ali Mobile & Repair in Ringwood Square Shopping Centre Kiosk C1. Calling ahead can still help us confirm parts availability before you travel.",
    },
  ].filter(Boolean) as Array<{ question: string; answer: string }>;
  const samsungHeroCards = [
    {
      title: startingPrice ? `${modelName} repairs from $${formatStartingPrice(startingPrice)}` : `${modelName} repair pricing`,
      body: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the available Samsung repair for ${modelName} below to see the current price or quote requirement for that exact service.`,
    },
    {
      title: "Samsung screen repair timing",
      body: hasScreenRepair
        ? "Most supported Samsung screen replacements can usually be completed in about 30 minutes once the correct part is available."
        : "Repair timing is confirmed after we identify the exact Samsung model, the fault and the required part.",
    },
    {
      title: "Model-specific Samsung parts",
      body: "Galaxy S, Note, A, J and Z series models use different parts and repair methods. Choose the exact model repair below so the quote matches the phone you have.",
    },
  ];
  const samsungQuickAnswers = [
    {
      number: "01",
      title: "How much does the repair cost?",
      body: startingPrice
        ? `Published repair options for this ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : "Choose the repair option for this exact Samsung model to see the current price or quote requirement. Published prices include the listed fitted part and repair labour unless the page states otherwise.",
    },
    hasScreenRepair
      ? {
          number: "02",
          title: "How long does a screen replacement take?",
          body: "Most supported Samsung screen replacements can usually be completed in about 30 minutes once the correct part is available. Extra time may be required if the frame is bent, the phone has liquid or impact damage, or additional diagnosis is needed.",
        }
      : null,
    hasBatteryRepair
      ? {
          number: "03",
          title: "How long does a battery replacement take?",
          body: "Samsung battery replacement timing depends on the exact model, battery availability and device condition. We confirm the likely timing before work begins.",
        }
      : null,
    {
      number: "04",
      title: "Can it normally be repaired today?",
      body: "Many common Samsung repairs can be completed the same day when parts are available. Less common or specific Samsung parts usually take around 1-2 days to arrive.",
    },
    {
      number: "05",
      title: "Why does the exact Samsung model matter?",
      body: "Samsung parts differ significantly across Galaxy S, Note, A, J and Z series models, including Z Fold and Z Flip devices. The exact model is needed to confirm compatible parts, repair method and pricing.",
    },
    hasWarrantyRepair
      ? {
          number: "06",
          title: "What warranty is included?",
          body: "Screen, battery, charging-port and back-housing repairs include a 6-month warranty on the fitted part and workmanship. The warranty does not cover new impact damage, bending, liquid damage, misuse, another repairer’s work or faults in unrelated components.",
        }
      : null,
    {
      number: "07",
      title: "Can charging symptoms be another fault?",
      body: "Yes. Charging problems can come from debris in the port, a cable or charger issue, battery wear, connector damage or a board-level fault. We inspect the likely cause before confirming a port replacement.",
    },
    {
      number: "08",
      title: "Will it remain water-resistant?",
      body: "Factory water resistance cannot be guaranteed after a Samsung phone has been opened or repaired. New adhesive may help reseal the device, but it does not restore certified factory water resistance.",
    },
  ].filter(Boolean) as Array<{ number: string; title: string; body: string }>;
  const samsungProcessSteps = [
    {
      number: "01",
      title: "Identify the exact Samsung model",
      body: "The technician confirms the Galaxy series, model and reported fault so the repair path matches the correct part and device construction.",
    },
    {
      number: "02",
      title: "Inspect related damage",
      body: "We check display condition, frame alignment, battery swelling, charging symptoms, liquid indicators and visible impact damage where the device condition allows.",
    },
    {
      number: "03",
      title: "Confirm repair and price",
      body: "The exact repair option, part availability, price and expected timing are explained before work begins.",
    },
    {
      number: "04",
      title: "Complete the selected repair",
      body: "The selected Samsung repair is completed using the appropriate part and method for that exact model.",
    },
    {
      number: "05",
      title: "Test before handover",
      body: "Relevant display, touch, charging, camera, speaker, microphone, button, vibration, battery and network checks are repeated before handover where practical.",
    },
  ];
  const samsungServiceNotes = [
    {
      title: "Samsung display and frame checks",
      body: "Samsung screen repairs can vary by model because display assemblies, frame condition and fingerprint-sensor placement differ across Galaxy series. We inspect the phone before confirming the practical repair path.",
    },
    {
      title: "Charging, battery and board symptoms",
      body: "Fast drain, no charging or intermittent charging can come from the battery, charging port, cable, connector or board-level fault. We check likely causes before replacing parts.",
    },
    {
      title: "Data, testing and passcode",
      body: "Most hardware repairs do not intentionally erase customer data, but a backup is recommended because damaged devices carry data risk. We generally do not require the lock-screen passcode and will ask first if additional unlocked testing is needed.",
    },
    {
      title: "Warranty and water resistance",
      body: "Eligible screen, battery, charging-port and back-housing repairs include a 6-month warranty on the fitted part and workmanship. Factory water resistance cannot be guaranteed after opening or repair.",
    },
  ];
  const samsungFaqs = [
    {
      question: `How much does a ${modelName} repair cost?`,
      answer: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : "Choose the repair option for this exact Samsung model to see the current price or quote requirement.",
    },
    hasScreenRepair
      ? {
          question: `How long does a ${modelName} screen replacement take?`,
          answer: "Most supported Samsung screen replacements can usually be completed in about 30 minutes once the correct part is available. Frame damage, liquid damage, folding-display construction or additional faults may require more time.",
        }
      : null,
    hasBatteryRepair
      ? {
          question: `How long does a ${modelName} battery replacement take?`,
          answer: "Samsung battery replacement timing is confirmed after checking the exact model, battery availability and device condition.",
        }
      : null,
    {
      question: `Can my ${modelName} normally be repaired the same day?`,
      answer: "Many common Samsung repairs can be completed the same day when parts are available. Less common or specific Samsung parts usually take around 1-2 days to arrive.",
    },
    activeScreenOptions.length > 0
      ? {
          question: "What screen replacement options are available?",
          answer: `For this model, the currently published Samsung screen options may include ${activeScreenOptions.map((option) => option.title).join(", ")} where available. Choose Screen Replacement below for current pricing and service notes.`,
        }
      : null,
    {
      question: "Do you repair Samsung Z Fold and Z Flip models?",
      answer: "Yes, supported Galaxy Z Fold and Z Flip models can appear in the catalogue when compatible repair paths are available. Folding devices may use different parts and repair methods from standard Galaxy phones.",
    },
    {
      question: "Can a charging issue be caused by something else?",
      answer: "Yes. A charging issue can come from debris, a faulty cable or charger, battery wear, charging-port damage, internal connectors or a board-level fault. We inspect the likely cause before confirming the repair.",
    },
    {
      question: "Will my Samsung data be erased?",
      answer: "Most hardware repairs do not intentionally erase customer data, but a backup is recommended because a damaged device can carry existing data risk.",
    },
    {
      question: "Do you need my lock-screen passcode?",
      answer: "Usually no. If additional unlocked testing is needed, the technician will ask first. Testing can also be completed with the customer if they prefer not to share the passcode.",
    },
    {
      question: "Will my Samsung remain water-resistant after repair?",
      answer: "Factory water resistance cannot be guaranteed after a device has been opened or repaired. Adhesive replacement does not restore certified factory water-resistance certification.",
    },
    hasWarrantyRepair
      ? {
          question: "What does the 6-month warranty cover?",
          answer: "This repair includes a 6-month warranty covering the fitted part and our workmanship. It does not cover a new drop, cracked glass after repair, crushing, bending, liquid damage, misuse, another repairer’s work or unrelated faults.",
        }
      : null,
    {
      question: "Can I walk in without an appointment?",
      answer: "Yes. Walk-ins are welcome at Ali Mobile & Repair in Ringwood Square Shopping Centre Kiosk C1. Calling ahead can help us confirm Samsung parts availability before you travel.",
    },
  ].filter(Boolean) as Array<{ question: string; answer: string }>;
  const googlePixelHeroCards = [
    {
      title: startingPrice ? `${modelName} repairs from $${formatStartingPrice(startingPrice)}` : `${modelName} repair pricing`,
      body: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the available Google Pixel repair for ${modelName} below to see the current price or quote requirement for that exact service.`,
    },
    {
      title: "Pixel screen repair timing",
      body: hasScreenRepair
        ? "Most supported Google Pixel screen replacements can usually be completed in about 30 minutes once the correct part is available."
        : "Repair timing is confirmed after we identify the exact Pixel model, fault and required part.",
    },
    {
      title: "Exact Pixel model matters",
      body: "Pixel standard, Pro, Fold and a-series models can use different parts and repair methods. Choose the exact model repair below so the quote matches your phone.",
    },
  ];
  const googlePixelQuickAnswers = [
    {
      number: "01",
      title: "How much does the repair cost?",
      body: startingPrice
        ? `Published repair options for this ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : "Choose the repair option for this exact Google Pixel model to see the current price or quote requirement.",
    },
    hasScreenRepair
      ? {
          number: "02",
          title: "How long does a screen replacement take?",
          body: "Most supported Google Pixel screen replacements can usually be completed in about 30 minutes once the correct part is available. Frame damage, liquid damage or additional faults may require more time.",
        }
      : null,
    hasBatteryRepair
      ? {
          number: "03",
          title: "How long does a battery replacement take?",
          body: "Pixel battery replacement timing depends on the exact model, battery availability and device condition. We confirm the likely timing before work begins.",
        }
      : null,
    {
      number: "04",
      title: "Can it normally be repaired today?",
      body: "Many common Google Pixel repairs can be completed the same day when parts are available. Less common or specific Pixel parts usually take around 1–2 days to arrive.",
    },
    {
      number: "05",
      title: "Why does the exact Pixel model matter?",
      body: "Repair compatibility varies between standard, Pro, Fold and a-series Pixel models. The exact model is needed to confirm compatible parts, repair method and pricing.",
    },
    hasWarrantyRepair
      ? {
          number: "06",
          title: "What warranty is included?",
          body: "Eligible screen, battery, charging-port and back-housing repairs include a 6-month warranty on the fitted part and workmanship. The warranty does not cover new impact damage, bending, liquid damage, misuse or unrelated faults.",
        }
      : null,
    {
      number: "07",
      title: "Can charging symptoms be another fault?",
      body: "Yes. Pixel charging problems can come from debris, a cable or charger issue, battery wear, port damage or a board-level fault. We check the likely cause before confirming the repair.",
    },
    {
      number: "08",
      title: "Will it remain water-resistant?",
      body: "Factory water resistance cannot be guaranteed after a Pixel has been opened or repaired. Adhesive replacement does not restore certified factory water-resistance certification.",
    },
  ].filter(Boolean) as Array<{ number: string; title: string; body: string }>;
  const googlePixelProcessSteps = [
    {
      number: "01",
      title: "Identify the exact Pixel model",
      body: "The technician confirms the Pixel model, series and reported fault so the repair path matches the correct part and device construction.",
    },
    {
      number: "02",
      title: "Inspect display, frame and charging symptoms",
      body: "We check display output, touch response, frame condition, battery behaviour, charging symptoms and impact or liquid signs where the device condition allows.",
    },
    {
      number: "03",
      title: "Confirm repair and price",
      body: "The exact repair option, part availability, price and expected timing are explained before work begins.",
    },
    {
      number: "04",
      title: "Complete the selected repair",
      body: "The selected Google Pixel repair is completed using the appropriate part and method for that exact model.",
    },
    {
      number: "05",
      title: "Test before handover",
      body: "Relevant display, touch, fingerprint, camera, speaker, microphone, charging, battery and network checks are repeated before handover where practical.",
    },
  ];
  const googlePixelServiceNotes = [
    {
      title: "Pixel display and frame checks",
      body: "Pixel screen repairs can vary by model because display assemblies, fingerprint behaviour, camera-bar impact and frame condition can affect the correct repair path.",
    },
    {
      title: "Battery, charging and board symptoms",
      body: "Fast drain, no charging or intermittent charging can come from battery wear, the cable, port debris, connector damage or a board-level fault. We check likely causes before replacing parts.",
    },
    {
      title: "Data, testing and passcode",
      body: "Most hardware repairs do not intentionally erase customer data, but a backup is recommended because damaged devices carry data risk. We generally do not require the lock-screen passcode and will ask first if additional unlocked testing is needed.",
    },
    {
      title: "Warranty and water resistance",
      body: "Eligible repairs include a 6-month warranty on the fitted part and workmanship. Factory water resistance cannot be guaranteed after opening or repair.",
    },
  ];
  const googlePixelFaqs = [
    {
      question: `How much does a ${modelName} repair cost?`,
      answer: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : "Choose the repair option for this exact Google Pixel model to see the current price or quote requirement.",
    },
    hasScreenRepair
      ? {
          question: `How long does a ${modelName} screen replacement take?`,
          answer: "Most supported Google Pixel screen replacements can usually be completed in about 30 minutes once the correct part is available. Frame damage, liquid damage or additional diagnosis may require more time.",
        }
      : null,
    hasBatteryRepair
      ? {
          question: `How long does a ${modelName} battery replacement take?`,
          answer: "Pixel battery replacement timing is confirmed after checking the exact model, battery availability and device condition.",
        }
      : null,
    {
      question: `Can my ${modelName} normally be repaired the same day?`,
      answer: "Many common Google Pixel repairs can be completed the same day when parts are available. Less common or specific Pixel parts usually take around 1–2 days to arrive.",
    },
    activeScreenOptions.length > 0
      ? {
          question: "What screen replacement options are available?",
          answer: `For this model, the currently published Pixel screen options may include ${activeScreenOptions.map((option) => option.title).join(", ")} where available. Choose Screen Replacement below for current pricing and service notes.`,
        }
      : null,
    {
      question: "Why do you need the exact Pixel model?",
      answer: "Repair compatibility varies between standard, Pro, Fold and a-series Pixel models. We need the exact model to quote accurately and match the right part.",
    },
    {
      question: "Does my Pixel charging port need replacing?",
      answer: "Not always. We first check for debris, cable or charger issues, battery symptoms and connector faults before confirming a charging port component replacement.",
    },
    {
      question: "Will my Google Pixel remain water-resistant after repair?",
      answer: "Factory water resistance cannot be guaranteed after opening or repair. Adhesive replacement does not restore guaranteed factory water-resistance certification.",
    },
    hasWarrantyRepair
      ? {
          question: "What does the 6-month warranty cover?",
          answer: "This repair includes a 6-month warranty covering the fitted part and our workmanship. It does not cover new physical damage, liquid damage, misuse, another repairer’s work or unrelated faults.",
        }
      : null,
    {
      question: "Can I walk in without an appointment?",
      answer: "Yes. Walk-ins are welcome at Ringwood Square Kiosk C1. Calling ahead can help us confirm part availability for your Pixel model before you travel.",
    },
  ].filter(Boolean) as Array<{ question: string; answer: string }>;
  const oppoHeroCards = [
    {
      title: startingPrice ? `${modelName} repairs from $${formatStartingPrice(startingPrice)}` : `${modelName} repair pricing`,
      body: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the available Oppo repair for ${modelName} below to see the current price or quote requirement for that exact service.`,
    },
    {
      title: "Oppo screen repair timing",
      body: hasScreenRepair
        ? "Many supported Oppo screen replacements take approximately 30 minutes, while some Oppo models may require around 45 minutes once the correct part is available."
        : "Repair timing is confirmed after we identify the exact Oppo model, fault and required part.",
    },
    {
      title: "Find, Reno and A series parts",
      body: "Oppo parts are specific to the exact model and series. Choose the exact model repair below so the quote matches the phone you have.",
    },
  ];
  const oppoQuickAnswers = [
    {
      number: "01",
      title: "How much does the repair cost?",
      body: startingPrice
        ? `Published repair options for this ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : "Choose the repair option for this exact Oppo model to see the current price or quote requirement.",
    },
    hasScreenRepair
      ? {
          number: "02",
          title: "How long does a screen replacement take?",
          body: "Many supported Oppo screen replacements take approximately 30 minutes, while some Oppo models may require around 45 minutes once the correct part is available. Frame damage, liquid damage or additional faults may require more time.",
        }
      : null,
    hasBatteryRepair
      ? {
          number: "03",
          title: "How long does a battery replacement take?",
          body: "Oppo battery replacement timing depends on the exact model, battery availability and device condition. We confirm the likely timing before work begins.",
        }
      : null,
    {
      number: "04",
      title: "Can it normally be repaired today?",
      body: "Many common Oppo repairs can be completed the same day when parts are available. Less common or specific Oppo parts usually take around 1–2 days to arrive.",
    },
    {
      number: "05",
      title: "Why does the exact Oppo model matter?",
      body: "Find, Reno, A series and other Oppo models use different parts. The exact model is needed to confirm compatible parts, repair method and pricing.",
    },
    hasWarrantyRepair
      ? {
          number: "06",
          title: "What warranty is included?",
          body: "Eligible screen, battery, charging-port and back-cover repairs include a 6-month warranty on the fitted part and workmanship. The warranty does not cover new impact damage, bending, liquid damage, misuse or unrelated faults.",
        }
      : null,
    {
      number: "07",
      title: "Can charging symptoms be another fault?",
      body: "Yes. Oppo charging problems can come from debris, a cable or charger issue, battery wear, port damage or a board-level fault. We check the likely cause before confirming the repair.",
    },
    {
      number: "08",
      title: "Can the back cover be repaired?",
      body: "Depending on the exact Oppo model, back cover or rear-glass repair may be available. The method can vary based on frame condition and camera positioning.",
    },
  ].filter(Boolean) as Array<{ number: string; title: string; body: string }>;
  const oppoProcessSteps = [
    {
      number: "01",
      title: "Identify the exact Oppo model",
      body: "The technician confirms the Oppo series, model and reported fault so the repair path matches the correct part and device construction.",
    },
    {
      number: "02",
      title: "Inspect related damage",
      body: "We check display condition, frame alignment, battery swelling, charging symptoms, liquid signs and visible impact damage where the device condition allows.",
    },
    {
      number: "03",
      title: "Confirm repair and price",
      body: "The exact repair option, part availability, price and expected timing are explained before work begins.",
    },
    {
      number: "04",
      title: "Complete the selected repair",
      body: "The selected Oppo repair is completed using the appropriate part and method for that exact model.",
    },
    {
      number: "05",
      title: "Test before handover",
      body: "Relevant display, touch, charging, camera, speaker, microphone, button, vibration, battery and network checks are repeated before handover where practical.",
    },
  ];
  const oppoServiceNotes = [
    {
      title: "Oppo model and part matching",
      body: "Oppo repairs can vary across Find, Reno, A series and other models. We identify the exact model before confirming compatible parts, pricing and repair method.",
    },
    {
      title: "Charging, battery and back-cover checks",
      body: "Charging, power and rear-cover damage can involve the cable, port, battery, frame, camera area or internal connectors. We inspect the likely cause before replacing parts.",
    },
    {
      title: "Data, testing and passcode",
      body: "Most hardware repairs do not intentionally erase customer data, but a backup is recommended because damaged devices carry data risk. We generally do not require the lock-screen passcode and will ask first if additional unlocked testing is needed.",
    },
    {
      title: "Warranty and water resistance",
      body: "Eligible repairs include a 6-month warranty on the fitted part and workmanship. Original factory water resistance cannot be guaranteed after opening or repair.",
    },
  ];
  const oppoFaqs = [
    {
      question: `How much does an ${modelName} repair cost?`,
      answer: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : "Choose the repair option for this exact Oppo model to see the current price or quote requirement.",
    },
    hasScreenRepair
      ? {
          question: `How long does an ${modelName} screen replacement take?`,
          answer: "Many supported Oppo screen replacements take approximately 30 minutes, while some Oppo models may require around 45 minutes once the correct part is available. Frame damage, liquid damage or additional diagnosis may require more time.",
        }
      : null,
    hasBatteryRepair
      ? {
          question: `How long does an ${modelName} battery replacement take?`,
          answer: "Oppo battery replacement timing is confirmed after checking the exact model, battery availability and device condition.",
        }
      : null,
    {
      question: `Can my ${modelName} normally be repaired the same day?`,
      answer: "Many common Oppo repairs can be completed the same day when parts are available. Less common or specific Oppo parts usually take around 1–2 days to arrive.",
    },
    activeScreenOptions.length > 0
      ? {
          question: "What screen replacement options are available?",
          answer: `For this model, the currently published Oppo screen options may include ${activeScreenOptions.map((option) => option.title).join(", ")} where available. Choose Screen Replacement below for current pricing and service notes.`,
        }
      : null,
    {
      question: "Do I need to know my exact Oppo model?",
      answer: "Yes. Oppo has many different Find, Reno, A series and other models. Parts are specific to each exact model, so we need to identify the device first.",
    },
    {
      question: "Can an Oppo charging port be cleaned instead?",
      answer: "Sometimes. We assess whether debris, a cable issue or a battery fault explains the charging symptom before confirming a charging-port replacement.",
    },
    {
      question: "Is Oppo back glass or back cover repairable?",
      answer: "Depending on the exact model, back cover or rear-glass repair may be available. The method varies based on frame involvement and camera positioning.",
    },
    {
      question: "Will my Oppo remain water-resistant after repair?",
      answer: "Original factory water resistance cannot be guaranteed after opening or repair.",
    },
    {
      question: "Can I walk in without an appointment?",
      answer: "Yes. Walk-ins to Ringwood Square Kiosk C1 are welcome. We recommend calling ahead so we can check stock for your specific Oppo model.",
    },
  ].filter(Boolean) as Array<{ question: string; answer: string }>;
  const genericPhoneHeroCards = [
    {
      title: startingPrice ? `${modelName} repairs from $${formatStartingPrice(startingPrice)}` : `${modelName} repair pricing`,
      body: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the available ${brandName} repair for ${modelName} below to see the current price or quote requirement for that exact service.`,
    },
    {
      title: "Model-specific repair path",
      body: `${brandName} parts and repair methods can vary by exact model, generation and construction. We confirm the compatible repair path before work begins.`,
    },
    {
      title: "Parts and timing confirmed first",
      body: "Some common repairs can be completed the same day when parts are available. Less common or specific parts usually take around 1–2 days to arrive.",
    },
  ];
  const genericPhoneQuickAnswers = [
    {
      number: "01",
      title: "How much does the repair cost?",
      body: startingPrice
        ? `Published repair options for this ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the repair option for this exact ${brandName} model to see the current price or quote requirement.`,
    },
    hasScreenRepair
      ? {
          number: "02",
          title: "How long does a screen replacement take?",
          body: `${brandName} screen replacement timing depends on the exact model, part availability, frame condition and device damage. We confirm the likely timing before work begins.`,
        }
      : null,
    hasBatteryRepair
      ? {
          number: "03",
          title: "How long does a battery replacement take?",
          body: `${brandName} battery replacement timing depends on the exact model, battery availability and device condition. We confirm the likely timing before work begins.`,
        }
      : null,
    {
      number: "04",
      title: "Can it normally be repaired today?",
      body: "Some common phone repairs can be completed the same day when parts are available. Less common or specific parts usually take around 1–2 days to arrive.",
    },
    {
      number: "05",
      title: "Why does the exact model matter?",
      body: `${brandName} parts can vary between model families, generations and regional variants. The exact model is needed to confirm compatible parts, repair method and pricing.`,
    },
    hasWarrantyRepair
      ? {
          number: "06",
          title: "What warranty is included?",
          body: "Eligible screen, battery, charging-port and back-cover repairs include a 6-month warranty on the fitted part and workmanship. The warranty does not cover new impact damage, bending, liquid damage, misuse or unrelated faults.",
        }
      : null,
    {
      number: "07",
      title: "Can charging symptoms be another fault?",
      body: "Yes. Charging problems can come from debris, a cable or charger issue, battery wear, port damage, internal connector damage or a board-level fault. We check the likely cause before confirming the repair.",
    },
    {
      number: "08",
      title: "Will it remain water-resistant?",
      body: "Factory water resistance cannot be guaranteed after a phone has been opened or repaired. New adhesive may help reseal the device, but it does not restore certified factory water resistance.",
    },
  ].filter(Boolean) as Array<{ number: string; title: string; body: string }>;
  const genericPhoneProcessSteps = [
    {
      number: "01",
      title: "Identify the exact model",
      body: `The technician confirms the ${brandName} model, variant and reported fault so the repair path matches the correct part and device construction.`,
    },
    {
      number: "02",
      title: "Inspect related damage",
      body: "We check display condition, frame alignment, battery swelling, charging symptoms, liquid signs and visible impact damage where the device condition allows.",
    },
    {
      number: "03",
      title: "Confirm repair and price",
      body: "The exact repair option, part availability, price and expected timing are explained before work begins.",
    },
    {
      number: "04",
      title: "Complete the selected repair",
      body: `The selected ${brandName} repair is completed using the appropriate part and method for that exact model.`,
    },
    {
      number: "05",
      title: "Test before handover",
      body: "Relevant display, touch, charging, camera, speaker, microphone, button, vibration, battery and network checks are repeated before handover where practical.",
    },
  ];
  const genericPhoneServiceNotes = [
    {
      title: "Exact model and part matching",
      body: `${brandName} repairs can vary by exact model, generation and construction. We identify the phone before confirming compatible parts, pricing and repair method.`,
    },
    {
      title: "Battery, charging and related faults",
      body: "Fast drain, no charging or intermittent charging can come from battery wear, the cable, port debris, connector damage or a board-level fault. We check likely causes before replacing parts.",
    },
    {
      title: "Data, testing and passcode",
      body: "Most hardware repairs do not intentionally erase customer data, but a backup is recommended because damaged devices carry data risk. We generally do not require the lock-screen passcode and will ask first if additional unlocked testing is needed.",
    },
    {
      title: "Warranty and water resistance",
      body: "Eligible repairs include a 6-month warranty on the fitted part and workmanship. Factory water resistance cannot be guaranteed after opening or repair.",
    },
  ];
  const genericPhoneFaqs = [
    {
      question: `How much does a ${modelName} repair cost?`,
      answer: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the repair option for this exact ${brandName} model to see the current price or quote requirement.`,
    },
    hasScreenRepair
      ? {
          question: `How long does a ${modelName} screen replacement take?`,
          answer: `${brandName} screen replacement timing depends on the exact model, part availability, frame condition and any liquid or impact damage. We confirm the likely timing before work begins.`,
        }
      : null,
    hasBatteryRepair
      ? {
          question: `How long does a ${modelName} battery replacement take?`,
          answer: `${brandName} battery replacement timing is confirmed after checking the exact model, battery availability and device condition.`,
        }
      : null,
    {
      question: `Can my ${modelName} normally be repaired the same day?`,
      answer: "Some common phone repairs can be completed the same day when parts are available. Less common or specific parts usually take around 1–2 days to arrive.",
    },
    activeScreenOptions.length > 0
      ? {
          question: "What screen replacement options are available?",
          answer: `For this model, the currently published screen options may include ${activeScreenOptions.map((option) => option.title).join(", ")} where available. Choose Screen Replacement below for current pricing and service notes.`,
        }
      : null,
    {
      question: "Why do you need the exact model?",
      answer: `${brandName} parts can vary between model families, generations and regional variants. We need the exact model to quote accurately and match the right part.`,
    },
    {
      question: "Can a charging issue be caused by something else?",
      answer: "Yes. A charging issue can come from debris, a faulty cable or charger, battery wear, charging-port damage, internal connectors or a board-level fault. We inspect the likely cause before confirming the repair.",
    },
    {
      question: "Will my phone remain water-resistant after repair?",
      answer: "Factory water resistance cannot be guaranteed after opening or repair. Adhesive replacement does not restore guaranteed factory water-resistance certification.",
    },
    hasWarrantyRepair
      ? {
          question: "What does the 6-month warranty cover?",
          answer: "This repair includes a 6-month warranty covering the fitted part and our workmanship. It does not cover new physical damage, liquid damage, misuse, another repairer’s work or unrelated faults.",
        }
      : null,
    {
      question: "Can I walk in without an appointment?",
      answer: "Yes. Walk-ins are welcome at Ringwood Square Kiosk C1. Calling ahead can help us confirm part availability before you travel.",
    },
  ].filter(Boolean) as Array<{ question: string; answer: string }>;
  const enhancedHeroCards = isSamsungModelPage
    ? samsungHeroCards
    : isGooglePixelModelPage
    ? googlePixelHeroCards
    : isOppoModelPage
    ? oppoHeroCards
    : isIPhoneModelPage
    ? iPhoneHeroCards
    : genericPhoneHeroCards;
  const enhancedQuickAnswers = isSamsungModelPage
    ? samsungQuickAnswers
    : isGooglePixelModelPage
    ? googlePixelQuickAnswers
    : isOppoModelPage
    ? oppoQuickAnswers
    : isIPhoneModelPage
    ? iPhoneQuickAnswers
    : genericPhoneQuickAnswers;
  const enhancedProcessSteps = isSamsungModelPage
    ? samsungProcessSteps
    : isGooglePixelModelPage
    ? googlePixelProcessSteps
    : isOppoModelPage
    ? oppoProcessSteps
    : isIPhoneModelPage
    ? iPhoneProcessSteps
    : genericPhoneProcessSteps;
  const enhancedServiceNotes = isSamsungModelPage
    ? samsungServiceNotes
    : isGooglePixelModelPage
    ? googlePixelServiceNotes
    : isOppoModelPage
    ? oppoServiceNotes
    : isIPhoneModelPage
    ? iPhoneServiceNotes
    : genericPhoneServiceNotes;
  const enhancedFaqs = isSamsungModelPage
    ? samsungFaqs
    : isGooglePixelModelPage
    ? googlePixelFaqs
    : isOppoModelPage
    ? oppoFaqs
    : isIPhoneModelPage
    ? iPhoneFaqs
    : genericPhoneFaqs;
  const enhancedBrandLabel = isSamsungModelPage
    ? "Samsung"
    : isGooglePixelModelPage
    ? "Google Pixel"
    : isOppoModelPage
    ? "Oppo"
    : isIPhoneModelPage
    ? "iPhone"
    : brandName;
  const enhancedMenuLabel = isSamsungModelPage
    ? "Samsung Repair Menu"
    : isGooglePixelModelPage
    ? "Google Pixel Repair Menu"
    : isOppoModelPage
    ? "Oppo Repair Menu"
    : isIPhoneModelPage
    ? "iPhone Repair Menu"
    : `${brandName} Repair Menu`;
  const enhancedRepairNoun = isSamsungModelPage
    ? "Samsung repair"
    : isGooglePixelModelPage
    ? "Google Pixel repair"
    : isOppoModelPage
    ? "Oppo repair"
    : isIPhoneModelPage
    ? "iPhone repair"
    : `${brandName} repair`;
  const enhancedRepairPhrase = isIPhoneModelPage || isOppoModelPage
    ? `an ${enhancedRepairNoun}`
    : isSamsungModelPage || isGooglePixelModelPage
    ? `a ${enhancedRepairNoun}`
    : `your ${modelName} repair`;
  const nonIPhoneScreenNote = isGooglePixelModelPage
    ? {
        kicker: "Pixel service notes",
        title: "Display assembly, frame and fingerprint checks",
        body: "Google Pixel screen repairs vary by exact model. Display type, frame condition, fingerprint behaviour and camera-bar impact signs can all affect the correct repair path.",
        firstTitle: "Exact Pixel model matters",
        firstBody: "Standard, Pro, Fold and a-series Pixel models can use different display assemblies and repair methods.",
        secondTitle: "Confirmed before repair",
        secondBody: "We explain the available screen option, likely fit, price and timing before work begins.",
      }
    : isOppoModelPage
    ? {
        kicker: "Oppo service notes",
        title: "Display assembly, frame and model-specific parts",
        body: "Oppo screen repairs vary across Find, Reno, A series and other models. Display type, frame condition and part availability can all affect the correct repair path.",
        firstTitle: "Exact Oppo model matters",
        firstBody: "Find, Reno, A series and other Oppo models can use different display assemblies and repair methods.",
        secondTitle: "Confirmed before repair",
        secondBody: "We explain the available screen option, likely fit, price and timing before work begins.",
      }
    : {
        kicker: isSamsungModelPage ? "Samsung service notes" : `${brandName} service notes`,
        title: "Display assembly, frame and model-specific parts",
        body: isSamsungModelPage
          ? "Samsung screen repairs vary by Galaxy series and exact model. Display type, frame condition, fingerprint-sensor placement and folding-display construction can all affect the correct repair path."
          : `${brandName} screen repairs vary by exact model. Display type, frame condition and part availability can all affect the correct repair path.`,
        firstTitle: isSamsungModelPage ? "Exact model matters" : `Exact ${brandName} model matters`,
        firstBody: isSamsungModelPage
          ? "Galaxy S, Note, A, J, Z Fold and Z Flip models can use different display assemblies and repair methods."
          : `${brandName} models can use different display assemblies and repair methods across generations and variants.`,
        secondTitle: "Confirmed before repair",
        secondBody: "We explain the available screen option, likely fit, price and timing before work begins.",
      };

  return (
    <main className={isEnhancedPhoneModelPage ? "repair-page-shell" : "repair-page-shell repair-page-shell-narrow"}>
      <Breadcrumbs category={categorySlug} brand={brandSlug} model={modelSlug} />

      {isEnhancedPhoneModelPage ? (
        <section className="repair-tech-hero repair-tech-hero-compact" aria-labelledby="model-repair-heading">
          <div className="repair-tech-hero-copy">
            <BackButton fallbackHref={`/repairs/${categorySlug}/${brandSlug}`} />
            <span className="repair-hero-badge">
              <Smartphone size={16} strokeWidth={2.4} aria-hidden="true" />
              {enhancedMenuLabel}
            </span>
            <h1 id="model-repair-heading">{modelName} repair options</h1>
            <p>
              Choose the available repair for your exact {modelName} to view current pricing, screen options where published, and the repair path that best matches the phone in front of you.
            </p>
            <div className="repair-hero-actions">
              <a href="#repair-options" className="repair-primary-action">
                View repair options
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </a>
              <a href="tel:0481058514" className="repair-secondary-action">
                <PhoneCall size={17} strokeWidth={2.6} aria-hidden="true" />
                Call 0481 058 514
              </a>
            </div>
          </div>
          <div className="repair-hero-brand-proof" aria-label={`${modelName} repair pricing and timing highlights`}>
            {enhancedHeroCards.map((card) => (
              <article key={card.title} className="repair-hero-brand-proof-card">
                <h2>{card.title}</h2>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-8 rounded-[32px] border border-blue-100 bg-white/85 px-5 py-6 shadow-[0_22px_70px_rgba(15,23,42,0.07)] sm:px-6 lg:px-7 lg:py-7" aria-labelledby="model-repair-heading">
          <div className="overflow-hidden rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.86)),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_40%)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6 lg:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <BackButton fallbackHref={`/repairs/${categorySlug}/${brandSlug}`} />
              <span className="repair-kicker">
                <Wrench size={15} strokeWidth={2.4} aria-hidden="true" />
                Repair menu
              </span>
            </div>
            <div className="mt-6 max-w-3xl">
              <h1 id="model-repair-heading" className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[0.98]">
                {modelName} repair options
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600 sm:text-[1.03rem]">
                Professional {introBrandPrefix}{modelName} repairs in Ringwood. Choose a repair type below to check pricing, parts availability and booking options.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href="tel:0481058514" className="repair-secondary-action">
                  <PhoneCall size={17} strokeWidth={2.6} aria-hidden="true" />
                  Call Now
                </a>
                <a href="#repair-options" className="repair-primary-action">
                  View repair options
                  <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        id="repair-options"
        className="repair-content-band rounded-[28px] border border-blue-100 bg-white/80 px-5 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.055)] sm:px-6"
        aria-labelledby="repair-options-heading"
      >
        <div className="mb-3">
          <span className="repair-kicker repair-kicker-muted">Repair options</span>
          <h2 id="repair-options-heading" className="sr-only">
            Repair options for {modelName}
          </h2>
        </div>
        <RepairOptionsGrid
          repairTypes={repairTypes}
          categorySlug={categorySlug}
          brandSlug={brandSlug}
          modelSlug={modelSlug}
          modelName={modelName}
        />
      </section>

      {isEnhancedPhoneModelPage ? (
        <>
          <RepairResultsMatchingSection
            category={categorySlug}
            brand={brandSlug}
            model={modelSlug}
            context="model"
          />

          <ScrollReveal>
            <section className="mt-14" aria-labelledby="model-quick-answers-heading">
              <div className="mx-auto mb-8 max-w-4xl text-center">
                <span className="repair-kicker repair-kicker-muted">Quick answers</span>
                <h2 id="model-quick-answers-heading" className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  What customers usually ask about {modelName}
                </h2>
                <p className="mt-4 text-[1.02rem] leading-7 text-slate-600">
                  Tap a question to expand the short answer. This page stays focused on the model-level decisions that matter before booking.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {enhancedQuickAnswers.map((answer) => (
                  <details
                    key={answer.number}
                    className="group rounded-[24px] border border-slate-200/90 bg-[linear-gradient(165deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] px-5 py-5 shadow-[0_16px_36px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.95)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]"
                  >
                    <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                      <div className="flex min-h-[132px] flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <span className="grid h-9 w-9 place-items-center rounded-full border border-blue-100 bg-blue-50/90 text-xs font-black text-blue-700 shadow-[0_10px_24px_rgba(59,130,246,0.12)]">
                            {answer.number}
                          </span>
                          <span className="shrink-0 pt-1 text-lg font-black leading-none text-blue-600 transition group-open:rotate-45">
                            +
                          </span>
                        </div>
                        <div className="mt-5">
                          <h3 className="max-w-[18ch] text-left text-[1.06rem] font-black leading-snug tracking-tight text-slate-950 sm:text-[1.1rem]">
                            {answer.title}
                          </h3>
                        </div>
                      </div>
                    </summary>
                    <div className="mt-4 border-t border-slate-200/80 pt-4 text-[0.97rem] leading-7 text-slate-600">
                      <p>{answer.body}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {activeScreenOptions.length > 0 && (
            <ScrollReveal>
              <section className="repair-content-band" aria-labelledby="model-screen-options-heading">
                <div className="repair-section-header">
                  <span>Screen options</span>
                  <h2 id="model-screen-options-heading">Available screen options for this {enhancedBrandLabel} model</h2>
                  <p>
                    Choose Screen Replacement below for the detailed repair page. This model page summarises the available display choices and {isIPhoneModelPage ? "the calibration notes" : "the model-specific repair notes"} that matter before you book.
                  </p>
                </div>
                <div className="repair-signal-grid">
                  {activeScreenOptions.map((option, index) => (
                    <article key={option.title} className="repair-signal-card">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <h3>{option.title}</h3>
                      <p>{option.body}</p>
                    </article>
                  ))}
                </div>
                {isIPhoneModelPage ? (
                  <article className="mt-8 grid gap-6 rounded-[30px] border border-blue-100/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84))] px-6 py-6 shadow-[0_20px_54px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.92)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                    <div className="rounded-[24px] border border-slate-200/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.95)]">
                      <span className="repair-kicker repair-kicker-muted">Apple service notes</span>
                      <h3 className="mt-4 text-[1.45rem] font-black leading-tight tracking-tight text-slate-950">
                        Parts and Service History, diagnostics and calibration
                      </h3>
                      <p className="mt-4 text-[0.98rem] leading-7 text-slate-600">
                        Some iPhone models may show Parts and Service History after a screen, battery, camera or other supported component has been replaced. The information displayed can vary according to the iPhone model, the selected part and the available Apple diagnostic or calibration process.
                      </p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      {hasGenuineScreenOption && (
                        <div className="rounded-[24px] border border-slate-200/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.97),rgba(248,250,252,0.9))] px-5 py-5 shadow-[0_18px_42px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.96)] md:col-span-2">
                          <h4 className="text-[1rem] font-black tracking-tight text-slate-950">
                            Genuine screen support
                          </h4>
                          <p className="mt-2 text-[0.96rem] leading-7 text-slate-600">
                            For supported iPhone models, we can complete the available diagnostic and calibration process after fitting a genuine screen.
                          </p>
                        </div>
                      )}
                      <div className="rounded-[24px] border border-slate-200/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.97),rgba(248,250,252,0.9))] px-5 py-5 shadow-[0_18px_42px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.96)]">
                        <h4 className="text-[1rem] font-black tracking-tight text-slate-950">
                          What may appear after repair
                        </h4>
                        <p className="mt-2 text-[0.96rem] leading-7 text-slate-600">
                          The phone may display Parts and Service History or a related system message depending on the model and selected part.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.97),rgba(248,250,252,0.9))] px-5 py-5 shadow-[0_18px_42px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.96)]">
                        <h4 className="text-[1rem] font-black tracking-tight text-slate-950">
                          Explained before handover
                        </h4>
                        <p className="mt-2 text-[0.96rem] leading-7 text-slate-600">
                          Any expected system message or Parts and Service History information will be explained before the repair so the customer understands what may appear after the device is returned.
                        </p>
                      </div>
                    </div>
                  </article>
                ) : (
                  <article className="mt-8 grid gap-6 rounded-[30px] border border-blue-100/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84))] px-6 py-6 shadow-[0_20px_54px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.92)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                    <div className="rounded-[24px] border border-slate-200/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.95)]">
                      <span className="repair-kicker repair-kicker-muted">{nonIPhoneScreenNote.kicker}</span>
                      <h3 className="mt-4 text-[1.45rem] font-black leading-tight tracking-tight text-slate-950">
                        {nonIPhoneScreenNote.title}
                      </h3>
                      <p className="mt-4 text-[0.98rem] leading-7 text-slate-600">
                        {nonIPhoneScreenNote.body}
                      </p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="rounded-[24px] border border-slate-200/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.97),rgba(248,250,252,0.9))] px-5 py-5 shadow-[0_18px_42px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.96)]">
                        <h4 className="text-[1rem] font-black tracking-tight text-slate-950">
                          {nonIPhoneScreenNote.firstTitle}
                        </h4>
                        <p className="mt-2 text-[0.96rem] leading-7 text-slate-600">
                          {nonIPhoneScreenNote.firstBody}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.97),rgba(248,250,252,0.9))] px-5 py-5 shadow-[0_18px_42px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.96)]">
                        <h4 className="text-[1rem] font-black tracking-tight text-slate-950">
                          {nonIPhoneScreenNote.secondTitle}
                        </h4>
                        <p className="mt-2 text-[0.96rem] leading-7 text-slate-600">
                          {nonIPhoneScreenNote.secondBody}
                        </p>
                      </div>
                    </div>
                  </article>
                )}
              </section>
            </ScrollReveal>
          )}

          <ScrollReveal>
            <section className="repair-content-band" aria-labelledby="model-process-heading">
              <div className="repair-section-header">
                <span>Repair process</span>
                <h2 id="model-process-heading">How a typical {modelName} repair moves from inspection to handover</h2>
                <p>
                  We confirm the selected repair, any relevant part choice, expected timing and the likely result before work begins. If the scope changes, we pause and ask first.
                </p>
              </div>
              <div className="repair-signal-grid">
                {enhancedProcessSteps.map((step) => (
                  <article key={step.number} className="repair-signal-card">
                    <span>{step.number}</span>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="repair-content-band" aria-labelledby="model-policy-heading">
              <div className="repair-section-header">
                <span>Repair policies</span>
                <h2 id="model-policy-heading">What to know before booking {enhancedRepairPhrase}</h2>
                <p>
                  These are the most important service notes customers usually ask about before approving a repair on a model page.
                </p>
              </div>
              <div className="repair-signal-grid">
                {enhancedServiceNotes.map((note, index) => (
                  <article key={note.title} className="repair-signal-card">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{note.title}</h3>
                    <p>{note.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="repair-content-band" aria-labelledby="model-ringwood-heading">
              <div className="repair-section-header">
                <span>Ringwood service</span>
                <h2 id="model-ringwood-heading">{modelName} repair support at Ringwood Square</h2>
                <p>
                  Walk in to Ali Mobile &amp; Repair at Ringwood Square Shopping Centre Kiosk C1, or call ahead if you want to confirm parts or timing before travelling.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
                <article className="rounded-[28px] border-2 border-slate-800/80 bg-white/25 px-5 py-5 shadow-[0_18px_34px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.11),inset_0_1px_0_rgba(255,255,255,0.82)]">
                  <h3 className="text-[1.08rem] font-black tracking-tight text-slate-950">
                    Local support and walk-in service
                  </h3>
                  <p className="mt-3 text-[0.98rem] leading-7 text-slate-600">
                    Ali Mobile &amp; Repair works from Ringwood Square Shopping Centre Kiosk C1. Walk-ins are welcome, free underground and outdoor parking is available, and our team can assist in English, 中文 and 粤语.
                  </p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    <span className="rounded-full border border-slate-800/45 bg-white/35 px-3 py-2 text-center text-[0.78rem] font-black text-slate-800 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
                      English
                    </span>
                    <span className="rounded-full border border-slate-800/45 bg-white/35 px-3 py-2 text-center text-[0.78rem] font-black text-slate-800 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
                      中文
                    </span>
                    <span className="rounded-full border border-slate-800/45 bg-white/35 px-3 py-2 text-center text-[0.78rem] font-black text-slate-800 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
                      粤语
                    </span>
                  </div>
                </article>
                <article className="rounded-[28px] border-2 border-slate-800/80 bg-white/25 px-5 py-5 shadow-[0_18px_34px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.11),inset_0_1px_0_rgba(255,255,255,0.82)]">
                  <h3 className="text-[1.08rem] font-black tracking-tight text-slate-950">
                    Before you travel
                  </h3>
                  <p className="mt-3 text-[0.98rem] leading-7 text-slate-600">
                    Call 0481 058 514 if you want to confirm the likely repair path, current part availability or expected timing for this model before you come in.
                  </p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2" aria-label={`Ringwood ${enhancedBrandLabel} repair highlights`}>
                    {[
                      { icon: PhoneCall, label: "0481 058 514" },
                      { icon: Clock3, label: "Walk-ins welcome" },
                      { icon: ShieldCheck, label: "6-month warranty on eligible repairs" },
                      { icon: Droplets, label: "Free underground & outdoor parking" },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <span
                          key={item.label}
                          className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-800/55 bg-white/35 px-3 py-2 text-[0.84rem] font-black leading-snug text-slate-800 shadow-[0_12px_24px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.78)]"
                        >
                          <Icon size={15} strokeWidth={2.35} aria-hidden="true" />
                          {item.label}
                        </span>
                      );
                    })}
                  </div>
                </article>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="faq-section" aria-labelledby="model-faq-heading">
              <h2 id="model-faq-heading" className="faq-heading">{modelName} repair FAQs</h2>
              <div className="faq-accordion">
                {enhancedFaqs.map((faq) => (
                  <details key={faq.question} className="faq-item">
                    <summary className="faq-question">
                      <span>{faq.question}</span>
                      <svg className="faq-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="repair-assist-panel" aria-labelledby="model-final-cta-heading">
              <div className="w-full max-w-2xl">
                <span className="repair-kicker repair-kicker-muted">Next step</span>
                <h2 id="model-final-cta-heading">Choose the exact repair option for your {modelName}</h2>
                <p>
                  Use the repair menu above to compare the available repair types, check the currently published price or quote path, and book only after you understand the likely timing, testing and service notes.
                </p>
              </div>
              <RepairCTA
                modelSlug={modelSlug}
                repairSlug="general"
                modelName={modelName}
                repairName="General Inquiry"
              />
            </section>
          </ScrollReveal>
        </>
      ) : (
        <>
          <RepairResultsMatchingSection
            category={categorySlug}
            brand={brandSlug}
            model={modelSlug}
            context="model"
          />

          <ScrollReveal>
            <section className="repair-assist-panel" aria-labelledby="common-issues-heading">
              <div className="w-full">
                <span className="repair-kicker repair-kicker-muted">Symptoms &amp; solutions</span>
                <h2 id="common-issues-heading">Common {modelName} issues we check</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {commonIssues.map((issue) => {
                    const Icon = issue.icon;

                    return (
                      <div
                        key={issue.text}
                        className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm font-semibold leading-6 text-slate-700 shadow-sm shadow-blue-950/5"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50/80 text-blue-600">
                          <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                        </span>
                        <p>{issue.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="repair-assist-panel" aria-labelledby="diagnostic-help-heading">
              <div className="w-full max-w-2xl">
                <span className="repair-kicker repair-kicker-muted">Free diagnostic</span>
                <h2 id="diagnostic-help-heading">Not sure what&apos;s wrong with your {modelName}?</h2>
                <p>Bring your {modelName} to our Ringwood kiosk for a practical, zero-obligation diagnostic before repair.</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {diagnosticSteps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm shadow-blue-950/5"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-xs text-blue-700">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <RepairCTA
                modelSlug={modelSlug}
                repairSlug="general"
                modelName={modelName}
                repairName="General Inquiry"
              />
            </section>
          </ScrollReveal>
        </>
      )}
    </main>
  );
}
