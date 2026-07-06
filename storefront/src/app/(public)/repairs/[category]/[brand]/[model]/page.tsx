import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchRepairCatalog, fetchModelRepairTypes, type ModelEntry } from "@/lib/api";
import { formatDynamicParam, preserveRouteSegment, safeSlugSegment } from "@/lib/inventoryUtils";
import Breadcrumbs from "@/components/Breadcrumbs";
import BackButton from "@/components/BackButton";
import RepairOptionsGrid from "@/components/services/RepairOptionsGrid";
import RepairCTA from "@/components/services/RepairCTA";
import RepairResultsMatchingSection from "@/components/repair-results/RepairResultsMatchingSection";
import ScrollReveal from "@/components/ScrollReveal";
import FloatingJumpCTA from "@/components/FloatingJumpCTA";
import { ArrowRight, Battery, Camera, Clock3, Droplets, Laptop, PhoneCall, PlugZap, ShieldCheck, Smartphone, Tablet, Watch, Wrench } from "lucide-react";

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

const RELATED_MODEL_LIMIT = 5;

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

function getModelMatchParts(modelName: string) {
  const tokens = modelName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const numbers = tokens
    .flatMap((token) => token.match(/\d+/g) || [])
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));
  const alphaPrefixes = tokens
    .map((token) => token.match(/^([a-z]+)\d+/)?.[1])
    .filter((value): value is string => Boolean(value));

  return {
    tokens,
    alphaPrefixes,
    primaryNumber: numbers[0] ?? null,
  };
}

function countSharedValues(left: string[], right: string[]) {
  const rightValues = new Set(right);

  return left.filter((value) => rightValues.has(value)).length;
}

function getRelatedModelScore(currentModelName: string, candidateModelName: string) {
  const current = getModelMatchParts(currentModelName);
  const candidate = getModelMatchParts(candidateModelName);
  const sharedTokens = countSharedValues(current.tokens, candidate.tokens);
  const sharedAlphaPrefixes = countSharedValues(current.alphaPrefixes, candidate.alphaPrefixes);
  let score = sharedTokens * 12 + sharedAlphaPrefixes * 10;

  if (current.primaryNumber !== null && candidate.primaryNumber !== null) {
    const generationDistance = Math.abs(current.primaryNumber - candidate.primaryNumber);

    if (generationDistance === 0) {
      score += 50;
    } else if (generationDistance === 1) {
      score += 28;
    } else if (generationDistance === 2) {
      score += 18;
    }
  }

  return score;
}

function getOrderedSameBrandModels(
  currentModelName: string,
  currentModelSlug: string,
  siblingModels: ModelEntry[] = []
) {
  return siblingModels
    .filter((candidate) => candidate.slug !== currentModelSlug)
    .map((candidate, index) => ({
      model: candidate,
      score: getRelatedModelScore(currentModelName, candidate.model),
      index,
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((candidate) => candidate.model);
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
      title: "Service history notes",
      body: "Some iPhone repairs may show parts and service history messages in Settings. We explain available screen options and limitations before proceeding.",
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
    body: `A published ${grade} option for this exact model. Choose the matching repair below to view the current price, availability and repair notes for this option.`,
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
  const isIPadModelPage = categorySlug === "tablet" && ["ipad", "apple"].includes(brandSlug);
  const isMacBookModelPage = categorySlug === "laptop" && brandSlug === "macbook";
  const isAppleWatchModelPage = categorySlug === "watch" && ["apple", "apple-watch"].includes(brandSlug);
  const isSamsungTabletModelPage = categorySlug === "tablet" && brandSlug === "samsung";
  const isEnhancedPhoneModelPage = isPhoneModelPage || isIPadModelPage || isMacBookModelPage || isAppleWatchModelPage || isSamsungTabletModelPage;

  return {
    title: isMacBookModelPage
      ? `${modelName} Repair Options & Pricing | Ali Mobile Ringwood`
      : isSamsungTabletModelPage
      ? `${modelName} Repair Options & Pricing | Ali Mobile Ringwood`
      : isEnhancedPhoneModelPage
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
      : isIPadModelPage
      ? `Choose the available iPad repairs for ${modelName}, view current pricing, confirm the exact iPad family, generation or A-number, and book with Ali Mobile & Repair in Ringwood.`
      : isMacBookModelPage
      ? `Choose the available MacBook repairs for ${modelName}, view current pricing, confirm the exact model or A-number, and book with Ali Mobile & Repair in Ringwood.`
      : isAppleWatchModelPage
      ? `Choose the available Apple Watch repairs for ${modelName}, view current pricing, confirm the exact Series, SE or Ultra model, and book with Ali Mobile & Repair in Ringwood.`
      : isSamsungTabletModelPage
      ? `View available repair options for ${modelName}, confirm the exact model and service required, and check current pricing, parts availability and repair timing with Ali Mobile & Repair in Ringwood.`
      : isPhoneModelPage
      ? `Choose the available ${brandName} repairs for ${modelName}, view current pricing, check supported repair options, and book with Ali Mobile & Repair in Ringwood.`
      : `Choose a repair service for your ${modelName}. ${brandName} screen replacement, battery swap, charging port fix \u0026 more — most common repairs under 1 hour in Ringwood when parts are in stock, with warranty support on eligible repairs.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: isMacBookModelPage
        ? `${modelName} Repair Options & Pricing | Ali Mobile Ringwood`
        : isSamsungTabletModelPage
        ? `${modelName} Repair Options & Pricing | Ali Mobile Ringwood`
        : isEnhancedPhoneModelPage
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
        : isIPadModelPage
        ? `Choose the available iPad repairs for ${modelName}, view current pricing, confirm the exact iPad family, generation or A-number, and book with Ali Mobile & Repair in Ringwood.`
        : isMacBookModelPage
        ? `Choose the available MacBook repairs for ${modelName}, view current pricing, confirm the exact model or A-number, and book with Ali Mobile & Repair in Ringwood.`
        : isAppleWatchModelPage
        ? `Choose the available Apple Watch repairs for ${modelName}, view current pricing, confirm the exact Series, SE or Ultra model, and book with Ali Mobile & Repair in Ringwood.`
        : isSamsungTabletModelPage
        ? `View available repair options for ${modelName}, confirm the exact model and service required, and check current pricing, parts availability and repair timing with Ali Mobile & Repair in Ringwood.`
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
  const isIPadModelPage = categorySlug === "tablet" && ["ipad", "apple"].includes(brandSlug);
  const isTabletModelPage = categorySlug === "tablet";
  const isMacBookModelPage = categorySlug === "laptop" && brandSlug === "macbook";
  const isLaptopModelPage = categorySlug === "laptop";
  const isAppleWatchModelPage = categorySlug === "watch" && ["apple", "apple-watch"].includes(brandSlug);
  const isEnhancedPhoneModelPage = isPhoneModelPage || isIPadModelPage || isMacBookModelPage || isAppleWatchModelPage;
  const brandCatalogEntry = isEnhancedPhoneModelPage
    ? (await fetchRepairCatalog()).brands.find((brand) => brand.category === categorySlug && brand.slug === brandSlug)
    : null;
  const sameBrandModels = getOrderedSameBrandModels(modelName, modelSlug, brandCatalogEntry?.models);
  const visibleRelatedModels = sameBrandModels.slice(0, RELATED_MODEL_LIMIT);
  const relatedModelHubLabel = isIPhoneModelPage
    ? "iPhone"
    : isSamsungModelPage
    ? "Samsung Galaxy"
    : isGooglePixelModelPage
    ? "Google Pixel"
    : isOppoModelPage
    ? "OPPO"
    : isIPadModelPage
    ? "iPad"
    : isMacBookModelPage
    ? "MacBook"
    : isAppleWatchModelPage
    ? "Apple Watch"
    : brandName;
  const relatedModelHeading = isIPhoneModelPage
    ? "Not your iPhone model?"
    : isSamsungModelPage
    ? "Not your Samsung Galaxy model?"
    : isGooglePixelModelPage
    ? "Not your Google Pixel model?"
    : isOppoModelPage
    ? "Not your OPPO model?"
    : isTabletModelPage
    ? "Not your tablet model?"
    : isLaptopModelPage
    ? "Not your laptop model?"
    : isAppleWatchModelPage
    ? "Not your Apple Watch model?"
    : `Not your ${brandName} model?`;
  const categoryHubLabel = categorySlug === "phone"
    ? "phone repair services"
    : categorySlug === "tablet"
    ? "tablet repair services"
    : categorySlug === "laptop"
    ? "laptop repair services"
    : categorySlug === "watch"
    ? "watch repair services"
    : `${formatDynamicParam(categorySlug)} repair services`;
  const supportingRepairLinks = [
    ...(brandCatalogEntry
      ? [
          {
            href: `/repairs/${categorySlug}/${brandSlug}`,
            label: `View ${relatedModelHubLabel} repair hub`,
          },
        ]
      : []),
    {
      href: `/repairs/${categorySlug}`,
      label: `Browse ${categoryHubLabel}`,
    },
  ];
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
  const hasServiceHistoryScreenOption = screenOptions.some((option) => option.title === "Service history notes");
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
    hasServiceHistoryScreenOption
      ? {
          question: "Can you explain diagnostics or calibration after a screen repair?",
          answer: "For supported iPhone models, we explain available screen options, diagnostic or calibration steps, and any expected device messages before proceeding.",
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
  const iPadHeroCards = [
    {
      title: startingPrice ? `${modelName} repairs from $${formatStartingPrice(startingPrice)}` : `${modelName} repair pricing`,
      body: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the available iPad repair for ${modelName} below to see the current price or quote requirement for that exact service.`,
    },
    {
      title: "Exact iPad generation matters",
      body: "Compatible parts differ by iPad family, generation, screen size, A-number, and Wi-Fi or Cellular variant where relevant.",
    },
    {
      title: "Frame and charging checks first",
      body: "We inspect frame bend, touch response, charging behaviour and visible impact signs before confirming the practical iPad repair path.",
    },
  ];
  const iPadQuickAnswers = [
    {
      number: "01",
      title: "How much does the repair cost?",
      body: startingPrice
        ? `Published repair options for this ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : "Choose the repair option for this exact iPad model to see the current price or quote requirement.",
    },
    hasScreenRepair
      ? {
          number: "02",
          title: "What affects iPad screen repair?",
          body: "iPad screen repair depends on the exact generation, glass or display construction, frame condition, button or camera-area damage, and whether the correct part is available.",
        }
      : null,
    hasBatteryRepair
      ? {
          number: "03",
          title: "How is battery service confirmed?",
          body: "iPad battery service depends on the exact model, battery availability, charging behaviour and device condition. We confirm the likely repair path before work begins.",
        }
      : null,
    {
      number: "04",
      title: "How do I identify the model?",
      body: "Check Settings → General → About, or look for the A-number printed on the rear casing. Bring the iPad in if you are unsure.",
    },
    {
      number: "05",
      title: "Should I back up first?",
      body: "Standard hardware repairs normally do not require access to personal content, but backing up important data before repair is recommended because damaged devices carry data risk.",
    },
    hasWarrantyRepair
      ? {
          number: "06",
          title: "What warranty is included?",
          body: "Eligible iPad repairs include a 6-month warranty on the fitted part and workmanship. It does not cover new physical damage, bending, liquid damage, misuse or unrelated faults.",
        }
      : null,
    {
      number: "07",
      title: "Can charging symptoms be another fault?",
      body: "Yes. iPad charging issues can come from the cable, charger, USB-C or Lightning port, battery, board-level fault, case pressure or impact damage.",
    },
    {
      number: "08",
      title: "Does frame bend matter?",
      body: "Yes. A bent iPad frame can stop a new screen from sitting flush or sealing correctly. We inspect the frame before confirming the repair option.",
    },
  ].filter(Boolean) as Array<{ number: string; title: string; body: string }>;
  const iPadProcessSteps = [
    { number: "01", title: "Confirm exact iPad model", body: "We identify the family, generation, screen size and A-number where possible so the repair path matches the correct part." },
    { number: "02", title: "Inspect frame and fault signs", body: "We check glass, display, touch response, charging behaviour, buttons, camera area, frame pressure and liquid or impact signs." },
    { number: "03", title: "Confirm quote and part path", body: "The available repair option, part availability, price and expected timing are explained before work begins." },
    { number: "04", title: "Complete the selected repair", body: "The selected iPad repair is completed using the appropriate part and method for that exact model." },
    { number: "05", title: "Retest before handover", body: "Relevant display, touch, charging, camera, speaker, microphone, button and Apple Pencil interaction checks are repeated where practical." },
  ];
  const iPadServiceNotes = [
    { title: "Generation, size and A-number", body: "iPad compatibility can change between standard iPad, iPad Air, iPad Pro and iPad mini models. The A-number helps confirm the correct part path." },
    { title: "Screen, frame and charging diagnosis", body: "Bent corners, case pressure, USB-C or Lightning wear and impact around the camera or button area can change the repair scope." },
    { title: "Data and testing", body: "Standard hardware repairs normally do not require access to personal content, but backing up the iPad where possible is recommended before repair." },
    { title: "Approval before extra work", body: "If additional damage changes the repair method, price or expected result, we explain it and obtain approval before carrying out extra work." },
  ];
  const iPadFaqs = [
    { question: `How much does a ${modelName} repair cost?`, answer: startingPrice ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.` : "Choose the repair option for this exact iPad model to see the current price or quote requirement." },
    { question: "How do I identify the exact iPad model?", answer: "Check Settings → General → About, or look for the A-number printed on the rear casing of your iPad." },
    hasScreenRepair ? { question: `What affects ${modelName} screen replacement?`, answer: "Frame bend, touch response, glass/display construction, button or camera-area damage and part availability can all affect the final repair path." } : null,
    hasBatteryRepair ? { question: `Can you replace the ${modelName} battery?`, answer: "If battery service is available for this exact model, choose Battery Replacement below for the current price or quote path. We confirm availability and condition before repair." } : null,
    { question: "Is my data safe during iPad repair?", answer: "Standard hardware repairs normally do not require access to personal content. However, backing up the iPad where possible is recommended because damaged devices carry data risk." },
    { question: "Do bent frames affect iPad screen replacement?", answer: "Yes. Bent frames can prevent a new screen from sitting flush and sealing correctly. We inspect the frame condition before confirming the repair option." },
    hasWarrantyRepair ? { question: "What does the 6-month warranty cover?", answer: "Eligible repairs include a 6-month warranty covering the fitted part and our workmanship. It does not cover new physical damage, liquid damage, bending, misuse or unrelated faults." } : null,
    { question: "Can I walk in without an appointment?", answer: "Yes. Walk-ins are welcome at Ringwood Square Kiosk C1. Calling ahead can help us confirm iPad part availability before you travel." },
  ].filter(Boolean) as Array<{ question: string; answer: string }>;
  const macBookHeroCards = [
    {
      title: startingPrice ? `${modelName} repairs from $${formatStartingPrice(startingPrice)}` : `${modelName} repair pricing`,
      body: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the available MacBook repair for ${modelName} below to see the current price or quote requirement for that exact service.`,
    },
    {
      title: "A-number and year matter",
      body: "MacBook repair compatibility, parts selection and quote accuracy depend on the exact model, year, chip generation and A-number.",
    },
    {
      title: "Parts and diagnosis first",
      body: "Many MacBook parts commonly take around one to two days to obtain, then repair timing is confirmed once the correct part arrives.",
    },
  ];
  const macBookQuickAnswers = [
    { number: "01", title: "How much does the repair cost?", body: startingPrice ? `Published repair options for this ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.` : "Choose the repair option for this exact MacBook model to see the current price or quote requirement." },
    hasScreenRepair ? { number: "02", title: "What affects display repair?", body: "MacBook display repair can depend on the exact A-number, lid assembly, hinge condition, liquid damage signs, camera area and whether the correct display assembly is available." } : null,
    hasBatteryRepair ? { number: "03", title: "What affects battery service?", body: "MacBook battery service depends on the exact model, battery condition, charging response, trackpad behaviour and whether top-case related parts are involved." } : null,
    { number: "04", title: "How do I identify the model?", body: "Check About This Mac and the A-number printed on the underside. Bring the MacBook and charger if you are unsure." },
    { number: "05", title: "Should I back up first?", body: "Yes. If the MacBook still powers on, back up important data before bringing it in for battery, display, keyboard or liquid-damage assessment." },
    hasWarrantyRepair ? { number: "06", title: "What warranty is included?", body: "Eligible MacBook repairs include a 6-month warranty on the fitted part and workmanship. It does not cover liquid damage, new impact damage, misuse or unrelated faults." } : null,
    { number: "07", title: "Could charging be another fault?", body: "Yes. Charging symptoms can involve the charger, USB-C port, battery, trackpad, top case, internal connectors or board-level faults." },
    { number: "08", title: "Is keyboard work separate?", body: "MacBook keyboard work commonly uses a top case assembly, and the replacement top case does not automatically include unrelated parts unless quoted and approved." },
  ].filter(Boolean) as Array<{ number: string; title: string; body: string }>;
  const macBookProcessSteps = [
    { number: "01", title: "Confirm exact MacBook", body: "We confirm the model, year, chip generation and A-number so the quote matches the correct part path." },
    { number: "02", title: "Inspect symptoms and related parts", body: "We check display behaviour, charging response, keyboard, trackpad, battery condition, liquid signs and visible impact damage where practical." },
    { number: "03", title: "Confirm quote and timing", body: "Part availability, price and expected timing are explained before work begins." },
    { number: "04", title: "Complete approved repair", body: "The selected MacBook repair is completed using the appropriate part and method for that exact model." },
    { number: "05", title: "Retest before handover", body: "Relevant display, keyboard, trackpad, charging, battery, camera, speaker, microphone and startup checks are repeated before handover where practical." },
  ];
  const macBookServiceNotes = [
    { title: "A-number and chip generation", body: "MacBook Air and MacBook Pro parts can change by A-number, year, screen size and Intel or Apple Silicon generation." },
    { title: "Battery, keyboard and top case", body: "Battery, keyboard, trackpad and top-case repairs may be related on some models, but each repair path is quoted and approved before work starts." },
    { title: "Data and charger testing", body: "Back up important data where possible. Bring the charger if charging or power behaviour is part of the fault." },
    { title: "Liquid or board-level faults", body: "Liquid-damaged or severely damaged MacBooks may require detailed diagnosis before we can confirm whether repair is practical." },
  ];
  const macBookFaqs = [
    { question: `How much does a ${modelName} repair cost?`, answer: startingPrice ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.` : "Choose the repair option for this exact MacBook model to see the current price or quote requirement." },
    { question: "Why do I need the exact MacBook model?", answer: "MacBook repair compatibility, parts selection and quote accuracy depend on the exact model, year, chip generation and A-number." },
    hasBatteryRepair ? { question: `Can you replace the ${modelName} battery?`, answer: "If battery replacement is available for this model, choose Battery Replacement below for the current price or quote path. We check battery condition and charging response before repair." } : null,
    hasScreenRepair ? { question: `What affects ${modelName} screen repair?`, answer: "Display assembly compatibility, lid-angle symptoms, hinge condition, camera area, liquid signs and impact damage can all affect the repair path." } : null,
    { question: "How long do MacBook parts usually take to arrive?", answer: "Many MacBook parts commonly take around one to two days to obtain. We confirm timing after checking the exact model and part path." },
    { question: "Should I back up my MacBook before repair?", answer: "Yes. If the MacBook still powers on, back up important data before bringing it in for service." },
    hasWarrantyRepair ? { question: "What does the 6-month warranty cover?", answer: "Eligible repairs include a 6-month warranty covering the fitted part and workmanship. It does not cover liquid damage, new physical damage, misuse or unrelated faults." } : null,
    { question: "Can I walk in without an appointment?", answer: "Yes. Walk-ins are welcome at Ringwood Square Kiosk C1. Calling ahead can help us confirm the likely MacBook part path before you travel." },
  ].filter(Boolean) as Array<{ question: string; answer: string }>;
  const appleWatchHeroCards = [
    {
      title: startingPrice ? `${modelName} repairs from $${formatStartingPrice(startingPrice)}` : `${modelName} repair pricing`,
      body: startingPrice
        ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.`
        : `Choose the available Apple Watch repair for ${modelName} below to see the current price or quote requirement for that exact service.`,
    },
    {
      title: "Series, SE or Ultra first",
      body: "Apple Watch repair compatibility depends on the exact Series, SE or Ultra model, case size, housing condition and visible fault signs.",
    },
    {
      title: "Quote before opening",
      body: "We confirm the practical repair path and quote before opening the watch. Same-day completion is not promised for Apple Watch repairs.",
    },
  ];
  const appleWatchQuickAnswers = [
    { number: "01", title: "How much does the repair cost?", body: startingPrice ? `Published repair options for this ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.` : "Choose the repair option for this exact Apple Watch model to see the current price or quote requirement." },
    hasScreenRepair ? { number: "02", title: "What affects screen repair?", body: "Apple Watch screen repair depends on the exact model, case size, display condition, housing damage and part availability." } : null,
    hasBatteryRepair ? { number: "03", title: "What affects battery service?", body: "Apple Watch battery service depends on runtime symptoms, charging response, model, seal condition and part availability." } : null,
    { number: "04", title: "Can it be same-day?", body: "We do not promise same-day Apple Watch completion. Timing depends on the exact model, condition, parts availability and repair queue." },
    { number: "05", title: "Will it stay water-resistant?", body: "Factory water resistance cannot be guaranteed after opening or repair. We may reseal where appropriate, but adhesive replacement does not restore guaranteed factory water-resistance certification." },
    hasWarrantyRepair ? { number: "06", title: "What warranty is included?", body: "Eligible Apple Watch repairs include a 6-month warranty on the fitted part and workmanship. It does not cover new impact damage, liquid exposure, misuse or unrelated faults." } : null,
    { number: "07", title: "Can no-power be another fault?", body: "Yes. No-power or charging symptoms can involve the battery, charging hardware, display, internal connectors or board-level faults." },
    { number: "08", title: "Is repair worth it?", body: "That depends on the exact model, device condition, repair quote and replacement-device value. We explain the practical repair path after assessment." },
  ].filter(Boolean) as Array<{ number: string; title: string; body: string }>;
  const appleWatchProcessSteps = [
    { number: "01", title: "Confirm exact watch model", body: "We confirm the Series, SE or Ultra model, case size and reported fault before quoting." },
    { number: "02", title: "Inspect condition", body: "We inspect display, housing, seal condition, charging response and visible impact or liquid signs where practical." },
    { number: "03", title: "Confirm quote and scope", body: "We confirm the practical repair option, part availability, price and expected timing before opening the watch." },
    { number: "04", title: "Complete approved repair", body: "The selected Apple Watch repair is completed using the appropriate part and method for that exact model." },
    { number: "05", title: "Retest and explain limits", body: "We retest key watch functions where practical and explain water-resistance limitations before handover." },
  ];
  const appleWatchServiceNotes = [
    { title: "Model, case size and condition", body: "Apple Watch parts and repair paths vary by Series, SE, Ultra, case size and housing condition." },
    { title: "Seal and water-resistance limits", body: "After watch opening, water resistance cannot be guaranteed. Resealing does not restore factory water-resistance certification." },
    { title: "Battery and charging symptoms", body: "Runtime, no-power and charging symptoms can have several causes, so we inspect before confirming a battery or charging repair." },
    { title: "Quote before service", body: "Repair scope, price and timing are confirmed before opening the watch or ordering a specific part." },
  ];
  const appleWatchFaqs = [
    { question: `How much does a ${modelName} repair cost?`, answer: startingPrice ? `Published repair options for ${modelName} currently start from $${formatStartingPrice(startingPrice)}. Choose the exact repair below to confirm the listed price or quote requirement.` : "Choose the repair option for this exact Apple Watch model to see the current price or quote requirement." },
    { question: "How do I confirm the exact Apple Watch model?", answer: "Check the Watch app, device settings, or the case size and model details on the watch. Bring it in if you are unsure." },
    hasScreenRepair ? { question: `What affects ${modelName} screen repair?`, answer: "Display condition, housing damage, case size, seal condition and part availability can all affect the practical repair path." } : null,
    hasBatteryRepair ? { question: `Can you replace the ${modelName} battery?`, answer: "If battery service is available for this exact model, choose Battery Replacement below for the current price or quote path. We check runtime and charging response first." } : null,
    { question: "Do you offer same-day Apple Watch repairs?", answer: "We do not promise same-day completion. Timing depends on the exact model, condition, parts availability and repair queue." },
    { question: "Will my Apple Watch remain water-resistant?", answer: "Factory water resistance cannot be guaranteed after opening or repair. Adhesive replacement does not restore guaranteed factory water-resistance certification." },
    hasWarrantyRepair ? { question: "What does the 6-month warranty cover?", answer: "Eligible repairs include a 6-month warranty covering the fitted part and workmanship. It does not cover liquid exposure, new impact damage, misuse or unrelated faults." } : null,
    { question: "Can I walk in without an appointment?", answer: "Yes. Walk-ins are welcome at Ringwood Square Kiosk C1. Calling ahead can help us confirm whether assessment or part ordering is the best next step." },
  ].filter(Boolean) as Array<{ question: string; answer: string }>;
  const enhancedHeroCards = isSamsungModelPage
    ? samsungHeroCards
    : isGooglePixelModelPage
    ? googlePixelHeroCards
    : isOppoModelPage
    ? oppoHeroCards
    : isIPadModelPage
    ? iPadHeroCards
    : isMacBookModelPage
    ? macBookHeroCards
    : isAppleWatchModelPage
    ? appleWatchHeroCards
    : isIPhoneModelPage
    ? iPhoneHeroCards
    : genericPhoneHeroCards;
  const enhancedQuickAnswers = isSamsungModelPage
    ? samsungQuickAnswers
    : isGooglePixelModelPage
    ? googlePixelQuickAnswers
    : isOppoModelPage
    ? oppoQuickAnswers
    : isIPadModelPage
    ? iPadQuickAnswers
    : isMacBookModelPage
    ? macBookQuickAnswers
    : isAppleWatchModelPage
    ? appleWatchQuickAnswers
    : isIPhoneModelPage
    ? iPhoneQuickAnswers
    : genericPhoneQuickAnswers;
  const enhancedProcessSteps = isSamsungModelPage
    ? samsungProcessSteps
    : isGooglePixelModelPage
    ? googlePixelProcessSteps
    : isOppoModelPage
    ? oppoProcessSteps
    : isIPadModelPage
    ? iPadProcessSteps
    : isMacBookModelPage
    ? macBookProcessSteps
    : isAppleWatchModelPage
    ? appleWatchProcessSteps
    : isIPhoneModelPage
    ? iPhoneProcessSteps
    : genericPhoneProcessSteps;
  const enhancedServiceNotes = isSamsungModelPage
    ? samsungServiceNotes
    : isGooglePixelModelPage
    ? googlePixelServiceNotes
    : isOppoModelPage
    ? oppoServiceNotes
    : isIPadModelPage
    ? iPadServiceNotes
    : isMacBookModelPage
    ? macBookServiceNotes
    : isAppleWatchModelPage
    ? appleWatchServiceNotes
    : isIPhoneModelPage
    ? iPhoneServiceNotes
    : genericPhoneServiceNotes;
  const enhancedFaqs = isSamsungModelPage
    ? samsungFaqs
    : isGooglePixelModelPage
    ? googlePixelFaqs
    : isOppoModelPage
    ? oppoFaqs
    : isIPadModelPage
    ? iPadFaqs
    : isMacBookModelPage
    ? macBookFaqs
    : isAppleWatchModelPage
    ? appleWatchFaqs
    : isIPhoneModelPage
    ? iPhoneFaqs
    : genericPhoneFaqs;
  const enhancedBrandLabel = isSamsungModelPage
    ? "Samsung"
    : isGooglePixelModelPage
    ? "Google Pixel"
    : isOppoModelPage
    ? "Oppo"
    : isIPadModelPage
    ? "iPad"
    : isMacBookModelPage
    ? "MacBook"
    : isAppleWatchModelPage
    ? "Apple Watch"
    : isIPhoneModelPage
    ? "iPhone"
    : brandName;
  const enhancedMenuLabel = isSamsungModelPage
    ? "Samsung Repair Menu"
    : isGooglePixelModelPage
    ? "Google Pixel Repair Menu"
    : isOppoModelPage
    ? "Oppo Repair Menu"
    : isIPadModelPage
    ? "iPad Repair Menu"
    : isMacBookModelPage
    ? "MacBook Repair Menu"
    : isAppleWatchModelPage
    ? "Apple Watch Repair Menu"
    : isIPhoneModelPage
    ? "iPhone Repair Menu"
    : `${brandName} Repair Menu`;
  const enhancedRepairNoun = isSamsungModelPage
    ? "Samsung repair"
    : isGooglePixelModelPage
    ? "Google Pixel repair"
    : isOppoModelPage
    ? "Oppo repair"
    : isIPadModelPage
    ? "iPad repair"
    : isMacBookModelPage
    ? "MacBook repair"
    : isAppleWatchModelPage
    ? "Apple Watch repair"
    : isIPhoneModelPage
    ? "iPhone repair"
    : `${brandName} repair`;
  const enhancedRepairPhrase = isIPhoneModelPage || isOppoModelPage || isIPadModelPage || isAppleWatchModelPage
    ? `an ${enhancedRepairNoun}`
    : isSamsungModelPage || isGooglePixelModelPage || isMacBookModelPage
    ? `a ${enhancedRepairNoun}`
    : `your ${modelName} repair`;
  const EnhancedBadgeIcon = isIPadModelPage
    ? Tablet
    : isMacBookModelPage
    ? Laptop
    : isAppleWatchModelPage
    ? Watch
    : Smartphone;
  const screenOptionsLabel = isMacBookModelPage ? "display options" : "screen options";
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
    : isIPadModelPage
    ? {
        kicker: "iPad service notes",
        title: "Display, touch, frame and model-specific parts",
        body: "iPad screen repairs vary by family, generation, screen size and A-number. Touch response, frame bend, button area and front camera condition can affect the correct repair path.",
        firstTitle: "Exact iPad model matters",
        firstBody: "iPad, iPad Air, iPad Pro and iPad mini models can use different glass, digitiser and display assemblies.",
        secondTitle: "Confirmed before repair",
        secondBody: "We explain the available repair option, likely fit, price and timing before work begins.",
      }
    : isMacBookModelPage
    ? {
        kicker: "MacBook service notes",
        title: "Display assembly, hinge and A-number checks",
        body: "MacBook screen repairs vary by A-number, year, chip generation and display assembly. Lid angle, hinge condition, camera area and liquid signs can affect the correct repair path.",
        firstTitle: "Exact MacBook model matters",
        firstBody: "MacBook Air and MacBook Pro models can use different display assemblies across years, screen sizes and chip generations.",
        secondTitle: "Confirmed before repair",
        secondBody: "We explain the available display option, likely fit, price and timing before work begins.",
      }
    : isAppleWatchModelPage
    ? {
        kicker: "Apple Watch service notes",
        title: "Display, housing and seal-condition checks",
        body: "Apple Watch repairs vary by Series, SE or Ultra model, case size, display condition and housing damage. Seal condition can affect the practical repair path.",
        firstTitle: "Exact Apple Watch model matters",
        firstBody: "Series, SE and Ultra models can use different display assemblies, case sizes and repair methods.",
        secondTitle: "Confirmed before opening",
        secondBody: "We confirm the practical repair option, quote and timing before opening the watch.",
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
    <main className={isEnhancedPhoneModelPage ? "repair-page-shell brand-hub-page" : "repair-page-shell repair-page-shell-narrow"}>
      <Breadcrumbs category={categorySlug} brand={brandSlug} model={modelSlug} />

      {isEnhancedPhoneModelPage ? (
        <section className="repair-tech-hero repair-tech-hero-compact" aria-labelledby="model-repair-heading">
          <div className="repair-tech-hero-copy">
            <BackButton fallbackHref={`/repairs/${categorySlug}/${brandSlug}`} />
            <span className="repair-hero-badge">
              <EnhancedBadgeIcon size={16} strokeWidth={2.4} aria-hidden="true" />
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
        className={isEnhancedPhoneModelPage
          ? "brand-hub-section repair-content-band [&_.repair-option-card]:border-2 [&_.repair-option-card]:border-slate-950 [&_.repair-option-card]:bg-transparent [&_.repair-option-card]:shadow-none [&_.repair-option-card:hover]:border-blue-700 [&_.repair-option-card:hover]:bg-blue-50/50 [&_.repair-option-card:hover]:shadow-none [&_.repair-option-icon]:border-2 [&_.repair-option-icon]:border-slate-950 [&_.repair-option-icon]:bg-transparent"
          : "repair-content-band rounded-[24px] border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-7 lg:px-8"}
        aria-labelledby="repair-options-heading"
      >
        <div className={isEnhancedPhoneModelPage ? "brand-hub-section-header" : "mb-3"}>
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
        {isMacBookModelPage && (
          <div className="mt-8 text-center">
            <Link
              href="/repairs/laptop/macbook"
              className="inline-flex items-center gap-2 text-[0.95rem] font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" className="rotate-180" />
              View all MacBook repair models and service options
            </Link>
          </div>
        )}
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
            <section className="brand-hub-section" aria-labelledby="model-quick-answers-heading">
              <div className="brand-hub-section-header">
                <span className="repair-kicker repair-kicker-muted">Quick answers</span>
                <h2 id="model-quick-answers-heading">
                  What customers usually ask about {modelName}
                </h2>
                <p>
                  Tap a question to expand the short answer. This page stays focused on the model-level decisions that matter before booking.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {enhancedQuickAnswers.map((answer) => (
                  <details
                    key={answer.number}
                    className="group rounded-[22px] border-2 border-slate-950 bg-transparent px-6 py-6 shadow-none transition-colors duration-200 hover:border-blue-700 hover:bg-blue-50/50"
                  >
                    <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                      <div className="flex min-h-[118px] flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-slate-950 bg-transparent text-xs font-black text-slate-700">
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

          {visibleRelatedModels.length > 0 && (
            <ScrollReveal>
              <section className="brand-hub-section" aria-labelledby="related-models-heading">
                <div className="brand-hub-section-header">
                  <span className="repair-kicker repair-kicker-muted">Model check</span>
                  <h2 id="related-models-heading">{relatedModelHeading}</h2>
                  <p>Compare a few nearby {relatedModelHubLabel} models if this is not the exact device in front of you.</p>
                </div>
                <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-4 sm:gap-5">
                  {visibleRelatedModels.map((relatedModel) => (
                    <Link
                      key={relatedModel.slug}
                      href={`/repairs/${categorySlug}/${brandSlug}/${relatedModel.slug}`}
                      prefetch={false}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-slate-950 bg-transparent px-5 py-2 text-sm font-black text-slate-900 transition-colors duration-200 hover:border-blue-700 hover:bg-blue-50/50 hover:text-blue-700"
                    >
                      {relatedModel.model}
                    </Link>
                  ))}
                </div>
              </section>
            </ScrollReveal>
          )}

          {activeScreenOptions.length > 0 && (
            <ScrollReveal>
              <section className="brand-hub-section" aria-labelledby="model-screen-options-heading">
                <div className="brand-hub-section-header">
                  <span className="repair-kicker repair-kicker-muted">Screen options</span>
                  <h2 id="model-screen-options-heading">Available {screenOptionsLabel} for this {enhancedBrandLabel} model</h2>
                  <p>
                    Choose the matching repair below for the detailed repair page. This model page summarises the available display choices and {isIPhoneModelPage ? "the calibration notes" : "the model-specific repair notes"} that matter before you book.
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
                  <div className="mt-8" aria-labelledby="iphone-service-history-heading">
                    <div className="brand-hub-section-header">
                      <span className="repair-kicker repair-kicker-muted">Apple service notes</span>
                      <h3 id="iphone-service-history-heading">
                        Parts and Service History, diagnostics and calibration
                      </h3>
                      <p>
                        Some iPhone models may show Parts and Service History after a screen, battery, camera or other supported component has been replaced. The information displayed can vary according to the iPhone model, the selected part and the available Apple diagnostic or calibration process.
                      </p>
                    </div>
                    <div className="repair-signal-grid">
                      {hasServiceHistoryScreenOption && (
                        <article className="repair-signal-card">
                          <h3>
                            Screen option notes
                          </h3>
                          <p>
                            For supported iPhone models, we explain available screen options, diagnostic or calibration steps, and any expected device messages before proceeding.
                          </p>
                        </article>
                      )}
                      <article className="repair-signal-card">
                        <h3>
                          What may appear after repair
                        </h3>
                        <p>
                          The phone may display Parts and Service History or a related system message depending on the model and selected part.
                        </p>
                      </article>
                      <article className="repair-signal-card">
                        <h3>
                          Explained before handover
                        </h3>
                        <p>
                          Any expected system message or Parts and Service History information will be explained before the repair so the customer understands what may appear after the device is returned.
                        </p>
                      </article>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8" aria-labelledby="model-screen-service-notes-heading">
                    <div className="brand-hub-section-header">
                      <span className="repair-kicker repair-kicker-muted">{nonIPhoneScreenNote.kicker}</span>
                      <h3 id="model-screen-service-notes-heading">
                        {nonIPhoneScreenNote.title}
                      </h3>
                      <p>
                        {nonIPhoneScreenNote.body}
                      </p>
                    </div>
                    <div className="repair-signal-grid">
                      <article className="repair-signal-card">
                        <h3>
                          {nonIPhoneScreenNote.firstTitle}
                        </h3>
                        <p>
                          {nonIPhoneScreenNote.firstBody}
                        </p>
                      </article>
                      <article className="repair-signal-card">
                        <h3>
                          {nonIPhoneScreenNote.secondTitle}
                        </h3>
                        <p>
                          {nonIPhoneScreenNote.secondBody}
                        </p>
                      </article>
                    </div>
                  </div>
                )}
              </section>
            </ScrollReveal>
          )}

          <ScrollReveal>
            <section className="brand-hub-section" aria-labelledby="model-process-heading">
              <div className="brand-hub-section-header">
                <span className="repair-kicker repair-kicker-muted">Repair process</span>
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
            <section className="brand-hub-section" aria-labelledby="model-policy-heading">
              <div className="brand-hub-section-header">
                <span className="repair-kicker repair-kicker-muted">Repair policies</span>
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
            <section className="brand-hub-section py-7" aria-labelledby="model-helpful-links-heading">
              <div className="brand-hub-section-header">
                <span className="repair-kicker repair-kicker-muted">Helpful links</span>
                <h2 id="model-helpful-links-heading">Helpful repair links</h2>
                <p>Use these links if you want to compare the full brand hub or return to the main repair category.</p>
              </div>
              <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-4">
                {supportingRepairLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-slate-950 bg-transparent px-5 py-2 text-sm font-black text-slate-900 transition-colors duration-200 hover:border-blue-700 hover:bg-blue-50/50 hover:text-blue-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="brand-hub-section" aria-labelledby="model-ringwood-heading">
              <div className="brand-hub-section-header">
                <span className="repair-kicker repair-kicker-muted">Ringwood service</span>
                <h2 id="model-ringwood-heading">{modelName} repair support at Ringwood Square</h2>
                <p>
                  Walk in to Ali Mobile &amp; Repair at Ringwood Square Shopping Centre Kiosk C1, or call ahead if you want to confirm parts or timing before travelling.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
                <article className="repair-signal-card">
                  <h3 className="text-[1.08rem] font-black tracking-tight text-slate-950">
                    Local support and walk-in service
                  </h3>
                  <p className="mt-3 text-[0.98rem] leading-7 text-slate-600">
                    Ali Mobile &amp; Repair works from Ringwood Square Shopping Centre Kiosk C1. Walk-ins are welcome, free underground and outdoor parking is available, and our team can assist in English, 中文 and 粤语.
                  </p>
                  <div className="repair-chip-cloud mt-5 justify-start" aria-label="Language support">
                    <span className="text-center">
                      English
                    </span>
                    <span className="text-center">
                      中文
                    </span>
                    <span className="text-center">
                      粤语
                    </span>
                  </div>
                </article>
                <article className="repair-signal-card">
                  <h3 className="text-[1.08rem] font-black tracking-tight text-slate-950">
                    Before you travel
                  </h3>
                  <p className="mt-3 text-[0.98rem] leading-7 text-slate-600">
                    Call 0481 058 514 if you want to confirm the likely repair path, current part availability or expected timing for this model before you come in.
                  </p>
                  <div className="repair-chip-cloud mt-5 justify-start" aria-label={`Ringwood ${enhancedBrandLabel} repair highlights`}>
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
                          className="flex min-h-12 items-center gap-2 rounded-full"
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
            <section className="faq-section brand-hub-faq-section brand-hub-section" aria-labelledby="model-faq-heading">
              <span className="repair-kicker repair-kicker-muted">FAQs</span>
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
            <section className="repair-assist-panel brand-hub-panel" aria-labelledby="model-final-cta-heading">
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
      <FloatingJumpCTA targetId="repair-options" label="Choose Your Repair" />
    </main>
  );
}
