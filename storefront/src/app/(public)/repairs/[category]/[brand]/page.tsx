import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPhoneBrandHubContent, getPhoneBrandRepairKeyword } from "@/lib/phone-brand-hubs";
import { REPAIR_TYPES } from "@/data/seo-data";
import { SERVICE_AREAS } from "@/data/serviceAreas";
import { fetchRepairCatalog, fetchBrandModels, type BrandEntry, type ModelEntry } from "@/lib/api";
import { formatDynamicParam, safeSlugSegment } from "@/lib/inventoryUtils";
import { smartSortModels } from "@/lib/modelSortConfig";
import { getMacBookFamilyKey, MACBOOK_FAMILY_LABELS, MACBOOK_FAMILY_ORDER } from "@/lib/macbookModelFamilies";
import {
  getIPadSeriesKey,
  getLenovoTabletSeriesKey,
  getSamsungTabletSeriesKey,
  IPAD_BRAND_HUB_SERIES_ORDER,
  IPAD_SERIES_LABELS,
  LENOVO_TABLET_BRAND_HUB_SERIES_ORDER,
  LENOVO_TABLET_SERIES_LABELS,
  SAMSUNG_TABLET_BRAND_HUB_SERIES_ORDER,
  SAMSUNG_TABLET_SERIES_LABELS,
} from "@/lib/tabletModelFamilies";
import BrandModelSearch from "@/components/BrandModelSearch";
import HubRepairResultsSection, { type HubRepairResultItem } from "@/components/repair-results/HubRepairResultsSection";
import FloatingJumpCTA from "@/components/FloatingJumpCTA";
import { type RepairResultDeviceCategory } from "@/lib/repair-results";
import { fetchHubRepairResults } from "@/lib/repair-results";
import BackButton from "@/components/BackButton";
import MacBookModelFinder from "./MacBookModelFinder";
import BrandHubLinks from "./BrandHubLinks";
import BrandHubModelSeriesBrowser, { type BrandHubSeriesGroup } from "./BrandHubModelSeriesBrowser";
import IPhoneServiceAreaLinks, { type IPhoneServiceAreaLinkCard } from "./IPhoneServiceAreaLinks";
import { ArrowRight, ClipboardCheck, Clock3, MapPin, Search, ShieldCheck, Smartphone } from "lucide-react";

export const dynamic = 'force-dynamic'; // Enforce absolute fresh data for model lists
export const dynamicParams = true; // Allow on-demand generation of new brand pages

interface BrandPageProps {
  params: Promise<{ category: string; brand: string }>;
}

const BRAND_HUB_REPAIR_TYPE_LINKS = [
  { href: "/repairs/screen-replacement", label: "Screen Replacement" },
  { href: "/repairs/battery-replacement", label: "Battery Replacement" },
  { href: "/repairs/charging-port-replacement", label: "Charging Port Replacement" },
  { href: "/repairs/back-glass-replacement", label: "Back Glass Replacement" },
];

const IPHONE_REPAIR_TYPE_LINKS = [
  { href: "/repairs/screen-replacement", label: "iPhone screen repair options" },
  { href: "/repairs/battery-replacement", label: "Battery replacement options" },
  { href: "/repairs/charging-port-replacement", label: "Charging port repair" },
  { href: "/repairs/back-glass-replacement", label: "Back glass repair" },
];

const SAMSUNG_REPAIR_TYPE_LINKS = [
  { href: "/repairs/screen-replacement", label: "Samsung screen repair options" },
  { href: "/repairs/battery-replacement", label: "Battery replacement options" },
  { href: "/repairs/charging-port-replacement", label: "Charging repair options" },
  { href: "/repairs/back-glass-replacement", label: "Rear glass and back-cover repair options" },
];

const GOOGLE_PIXEL_REPAIR_TYPE_LINKS = [
  { href: "/repairs/screen-replacement", label: "Google Pixel screen repair options" },
  { href: "/repairs/battery-replacement", label: "Battery replacement options" },
  { href: "/repairs/charging-port-replacement", label: "Charging repair options" },
  { href: "/repairs/back-glass-replacement", label: "Rear glass and housing repair options" },
];

const OPPO_REPAIR_TYPE_LINKS = [
  { href: "/repairs/screen-replacement", label: "OPPO screen repair options" },
  { href: "/repairs/battery-replacement", label: "Battery replacement options" },
  { href: "/repairs/charging-port-replacement", label: "Charging repair options" },
  { href: "/repairs/back-glass-replacement", label: "Rear glass and back-cover repair options" },
];

const BRAND_HUB_REPAIR_CATEGORY_LINKS = [
  { href: "/repairs/phone", label: "Phone Repairs" },
  { href: "/repairs/tablet", label: "Tablet Repairs" },
  { href: "/repairs/laptop/macbook", label: "MacBook Repairs" },
  { href: "/repairs/watch", label: "Watch Repairs" },
];

const IPHONE_COMMON_PROBLEMS = [
  {
    title: "Screen and touch problems",
    body: "Cracked glass, a black display, coloured lines or touch that stops responding can point to different screen faults. Select the exact model so the suitable display option can be checked.",
  },
  {
    title: "Battery and shutdown problems",
    body: "Fast battery drain, unexpected shutdowns or a screen beginning to lift may require a battery and device-condition assessment before a quote is confirmed.",
  },
  {
    title: "Charging problems",
    body: "A phone that charges intermittently or not at all may have debris, cable, battery, port or board-related issues. The charging path should be checked before a port replacement is recommended.",
  },
  {
    title: "Back glass damage",
    body: "Cracked rear glass or housing damage can affect handling and expose internal areas. The available repair path depends on the model and the condition of the frame.",
  },
  {
    title: "Camera problems",
    body: "Blurred images, failed focus, shaking or a blank camera preview may come from the camera module, lens damage or another device fault.",
  },
  {
    title: "Liquid exposure or no power",
    body: "Liquid exposure and no-power faults require inspection before repair options, data risk and likely outcomes can be discussed. A successful repair cannot be guaranteed before diagnosis.",
  },
];

const SAMSUNG_COMMON_PROBLEMS = [
  {
    title: "Screen, touch and display lines",
    body: "Cracked glass, a black display, flickering, coloured lines or touch that stops responding can come from different screen faults. Select the exact Galaxy model so the suitable repair path can be checked.",
  },
  {
    title: "Battery, shutdown and swelling",
    body: "Fast battery drain, unexpected shutdowns, overheating or a back cover beginning to lift may require a battery and device-condition assessment before a quote is confirmed.",
  },
  {
    title: "Charging problems",
    body: "Intermittent or failed charging may relate to debris, the cable, battery, charging port or another internal fault. The charging path should be checked before a port replacement is recommended.",
  },
  {
    title: "Rear glass or back-cover damage",
    body: "Cracked rear glass, a loose back cover or frame damage can affect handling and expose internal areas. The available repair option depends on the model and device condition.",
  },
  {
    title: "Camera problems",
    body: "Blurred images, failed focus, shaking or a blank camera preview may come from lens damage, the camera module or another device fault.",
  },
  {
    title: "Fold, Flip, liquid or no-power faults",
    body: "Fold and Flip display faults, liquid exposure and no-power problems require assessment before repair options, data risk and likely outcomes can be discussed. A successful repair cannot be guaranteed before diagnosis.",
  },
];

const GOOGLE_PIXEL_COMMON_PROBLEMS = [
  {
    title: "Screen and touch problems",
    body: "Cracked glass, a black display, coloured lines, flickering or touch that stops responding can come from different screen faults. Select the exact Pixel model so the suitable repair path can be checked.",
  },
  {
    title: "Battery, shutdown and heat problems",
    body: "Fast battery drain, unexpected shutdowns, overheating or a screen beginning to lift may require a battery and device-condition assessment before a quote is confirmed.",
  },
  {
    title: "Charging problems",
    body: "Intermittent or failed charging may relate to debris, the cable, battery, charging port or another internal fault. The charging path should be checked before a port replacement is recommended.",
  },
  {
    title: "Rear glass or housing damage",
    body: "Cracked rear glass, housing damage or a loose rear panel can affect handling and expose internal areas. The available repair option depends on the Pixel model and device condition.",
  },
  {
    title: "Camera problems",
    body: "Blurred images, failed focus, shaking, damaged lenses or a blank camera preview may come from the camera module, lens damage or another device fault.",
  },
  {
    title: "Pixel Fold, liquid or no-power faults",
    body: "Pixel Fold display faults, liquid exposure and no-power problems require assessment before repair options, data risk and likely outcomes can be discussed. A successful repair cannot be guaranteed before diagnosis.",
  },
];

const OPPO_COMMON_PROBLEMS = [
  {
    title: "Screen, touch and display problems",
    body: "Cracked glass, a black display, coloured lines, flickering or touch that stops responding can come from different screen faults. Select the exact OPPO model so the suitable repair path can be checked.",
  },
  {
    title: "Battery, shutdown and heat problems",
    body: "Fast battery drain, unexpected shutdowns, overheating or a rear panel beginning to lift may require a battery and device-condition assessment before a quote is confirmed.",
  },
  {
    title: "Charging problems",
    body: "Intermittent or failed charging may relate to debris, the cable, battery, charging port or another internal fault. The charging path should be assessed before a port replacement is recommended.",
  },
  {
    title: "Rear glass or back-cover damage",
    body: "Cracked rear glass, a loose back cover or housing damage can affect handling and expose internal areas. The available repair option depends on the OPPO model and overall device condition.",
  },
  {
    title: "Camera problems",
    body: "Blurred images, failed focus, shaking, damaged lenses or a blank camera preview may come from lens damage, the camera module or another device fault.",
  },
  {
    title: "Liquid exposure or no-power faults",
    body: "Liquid exposure and no-power problems require assessment before repair options, data risk and likely outcomes can be discussed. A successful repair cannot be guaranteed before diagnosis.",
  },
];

const IPAD_COMMON_REPAIR_LINKS = [
  {
    href: "/repairs/screen-replacement",
    label: "iPad screen repair options",
  },
  {
    href: "/repairs/battery-replacement",
    label: "battery replacement options",
  },
  {
    href: "/repairs/charging-port-replacement",
    label: "charging port repair options",
  },
];

const IPAD_STATIC_REPAIR_OPTIONS = [
  { label: "back camera repair options", hiddenBehindMore: false },
  { label: "front camera repair options", hiddenBehindMore: true },
];

const IPAD_COMMON_PROBLEMS = [
  {
    title: "Screen, glass and touch problems",
    body: "Cracked glass, black display, coloured lines, flickering or failed touch can come from different screen faults. The exact iPad model must be confirmed before the repair path is selected.",
  },
  {
    title: "Battery, shutdown and swelling",
    body: "Fast battery drain, shutdowns, overheating or a lifting screen may require a battery and device-condition assessment.",
  },
  {
    title: "Charging problems",
    body: "Charging faults may involve the cable, adapter, debris, battery, charging port or another internal issue. Do not automatically recommend port replacement.",
  },
  {
    title: "Bent frame or casing damage",
    body: "Bent frames and casing damage can affect screen fit and repair outcome. The device condition must be assessed first.",
  },
  {
    title: "Camera, speaker or microphone problems",
    body: "Camera, sound and microphone symptoms may come from the affected component, connected parts or another device fault.",
  },
  {
    title: "Liquid exposure or no-power faults",
    body: "Assessment is required before repair options, data risks and likely outcomes can be discussed. Do not guarantee successful repair.",
  },
];

const IPAD_FAQS = [
  {
    question: "Which iPad models do you repair?",
    answer: "We support selected iPad, iPad Air, iPad mini and iPad Pro models. Use the model browser above to choose your exact iPad before checking available repair options.",
  },
  {
    question: "How can I identify my exact iPad model?",
    answer: "Check Settings -> General -> About for the model name, or use the A-number printed on the iPad casing to help identify the exact version.",
  },
  {
    question: "How much does an iPad repair cost?",
    answer: "Price depends on the exact iPad model, fault, device condition and current parts availability. Choose your model in the browser to view the available price or Quote status.",
  },
  {
    question: "How long can an iPad repair take?",
    answer: "Timing depends on the model, repair type, parts stock, device condition and repair queue. If a part needs to be ordered, likely timing is explained before approval.",
  },
  {
    question: "Do I need to make a booking?",
    answer: "Walk-ins are welcome at Ringwood Square, and calling ahead is useful when you want to confirm parts availability or likely timing before travelling.",
  },
  {
    question: "Will my data normally be affected by an iPad repair?",
    answer: "Hardware repairs do not normally require access to personal content, but important data should be backed up where possible because a data outcome cannot be guaranteed.",
  },
  {
    question: "What warranty applies to an iPad repair?",
    answer: "iPad repairs include a six-month repair warranty, subject to the warranty conditions and exclusions explained with the repair.",
  },
  {
    question: "What happens if the required iPad part is not in stock?",
    answer: "We explain the available repair option, Quote status and expected parts ordering path before work is approved.",
  },
  {
    question: "Is it better to repair or replace my iPad?",
    answer: "That depends on the iPad model, fault, condition, repair quote, parts availability and replacement-device value. Once the model and fault are confirmed, we can explain the practical repair path.",
  },
  {
    question: "Can water resistance be guaranteed after an iPad repair?",
    answer: "No. Waterproof protection cannot be guaranteed after opening or repair, and the repaired iPad should be kept away from liquids.",
  },
];

type BatchPhoneBrandSlug =
  | "xiaomi"
  | "nokia"
  | "vivo"
  | "lg"
  | "oneplus"
  | "huawei"
  | "htc"
  | "sony"
  | "telstra"
  | "motorola"
  | "microsoft"
  | "realme"
  | "asus"
  | "tcl"
  | "nothing";

interface BatchPhoneBrandHubConfig {
  displayName: string;
  heroDescription: string;
  repairLinks: typeof BRAND_HUB_REPAIR_TYPE_LINKS;
  commonRepairsIntro: string;
  commonProblems: typeof OPPO_COMMON_PROBLEMS;
  diagnosisIntro: string;
  modelFaultCopy: string;
  serviceAreaDescriptions: string[];
}

const BATCH_PHONE_BRAND_NAMES: Record<BatchPhoneBrandSlug, string> = {
  xiaomi: "Xiaomi",
  nokia: "Nokia",
  vivo: "Vivo",
  lg: "LG",
  oneplus: "OnePlus",
  huawei: "Huawei",
  htc: "HTC",
  sony: "Sony",
  telstra: "Telstra",
  motorola: "Motorola",
  microsoft: "Microsoft",
  realme: "Realme",
  asus: "Asus",
  tcl: "TCL",
  nothing: "Nothing",
};

const BATCH_PHONE_BRAND_SLUGS = Object.keys(BATCH_PHONE_BRAND_NAMES) as BatchPhoneBrandSlug[];
const COMPACT_PHONE_BRAND_SLUGS = new Set<BatchPhoneBrandSlug>([
  "huawei",
  "htc",
  "sony",
  "telstra",
  "motorola",
  "microsoft",
  "realme",
  "asus",
  "tcl",
  "nothing",
]);

function isBatchPhoneBrandSlug(slug: string): slug is BatchPhoneBrandSlug {
  return BATCH_PHONE_BRAND_SLUGS.includes(slug as BatchPhoneBrandSlug);
}

function buildBatchPhoneRepairLinks(brandName: string) {
  return [
    { href: "/repairs/screen-replacement", label: `${brandName} screen repair options` },
    { href: "/repairs/battery-replacement", label: "Battery replacement options" },
    { href: "/repairs/charging-port-replacement", label: "Charging repair options" },
    { href: "/repairs/back-glass-replacement", label: "Rear glass and back-cover repair options" },
  ];
}

function buildBatchPhoneCommonProblems(brandName: string, isCompact: boolean) {
  return [
    {
      title: "Screen, touch and display problems",
      body: `Cracked glass, a black display, display lines, flickering or touch that stops responding can come from different screen faults. Select the exact ${brandName} model so the suitable repair path can be checked.`,
    },
    {
      title: "Battery, shutdown and heat problems",
      body: `Fast battery drain, unexpected shutdowns, overheating or a rear panel beginning to lift may require a battery and device-condition assessment before a quote is confirmed.`,
    },
    {
      title: "Charging problems",
      body: `Intermittent or failed charging may relate to debris, the cable, battery, charging port or another internal fault. The charging path should be assessed before a port replacement is recommended.`,
    },
    {
      title: isCompact ? "Rear glass, cover or housing damage" : "Rear glass or back-cover damage",
      body: `Cracked rear glass, a loose back cover or housing damage can affect handling and expose internal areas. The available repair option depends on the ${brandName} model and overall device condition.`,
    },
    {
      title: "Camera problems",
      body: "Blurred images, failed focus, shaking, damaged lenses or a blank camera preview may come from lens damage, the camera module or another device fault.",
    },
    {
      title: "Liquid exposure or no-power faults",
      body: "Liquid exposure and no-power problems require assessment before repair options, data risk and likely outcomes can be discussed. A successful repair cannot be guaranteed before diagnosis.",
    },
  ];
}

function buildBatchPhoneServiceAreaDescriptions(brandName: string) {
  return [
    `${brandName} customers in AREA can choose their exact phone model before visiting our Ringwood Square repair desk.`,
    `Travelling from AREA? Check ${brandName} screen, battery, charging and rear-damage options by model, then call ahead about parts availability.`,
    `Customers near AREA can use the ${brandName} model selector first, then visit Kiosk C1 for assessment and confirmed quote details.`,
    `AREA customers can review ${brandName} repair paths online before contacting the Ringwood Square team for the next step.`,
    `Before travelling from AREA, choose the exact ${brandName} model and contact the store if you want likely timing checked first.`,
    `AREA customers can compare ${brandName} repair options online, then visit Ringwood Square for model-specific assessment.`,
  ];
}

const BATCH_PHONE_BRAND_HUB_CONFIG: Record<BatchPhoneBrandSlug, BatchPhoneBrandHubConfig> = BATCH_PHONE_BRAND_SLUGS.reduce((config, slug) => {
  const displayName = BATCH_PHONE_BRAND_NAMES[slug];
  const isCompact = COMPACT_PHONE_BRAND_SLUGS.has(slug);
  config[slug] = {
    displayName,
    heroDescription: isCompact
      ? `Choose your exact ${displayName} model to view available screen, battery, charging and rear-damage repair options. Our Ringwood Square repair desk can confirm quotes, parts availability and practical timing before work begins.`
      : `Choose your exact ${displayName} model to view available screen, battery, charging and rear-damage repair options. Our Ringwood Square repair desk supports customers across Melbourne's eastern suburbs, with quotes and parts availability confirmed before work begins.`,
    repairLinks: buildBatchPhoneRepairLinks(displayName),
    commonRepairsIntro: isCompact
      ? `Select your exact ${displayName} model first, then review the available repair path. Repair availability can vary by model, fault, device condition and current parts stock.`
      : `Start with your ${displayName} model, then choose the repair path that best matches the fault. Available screen, battery, charging and rear-damage options can vary by model, device condition and current parts availability.`,
    commonProblems: buildBatchPhoneCommonProblems(displayName, isCompact),
    diagnosisIntro: isCompact
      ? `We confirm the exact ${displayName} model and fault before discussing the repair path. Pricing, Quote status, parts availability and likely timing are explained before any work is approved.`
      : `We confirm the exact ${displayName} model and fault before discussing the suitable repair path. Pricing, Quote status, parts availability and practical timing are explained before any work is approved.`,
    modelFaultCopy: `We check the exact ${displayName} model, the symptoms and the device condition. Similar symptoms can have different causes, so the recommended repair is based on the assessment rather than the symptom alone.`,
    serviceAreaDescriptions: buildBatchPhoneServiceAreaDescriptions(displayName),
  };
  return config;
}, {} as Record<BatchPhoneBrandSlug, BatchPhoneBrandHubConfig>);

function getBatchPhoneBrandConfig(categorySlug: string, brandSlug: string) {
  if (categorySlug !== "phone" || !isBatchPhoneBrandSlug(brandSlug)) {
    return null;
  }

  return BATCH_PHONE_BRAND_HUB_CONFIG[brandSlug];
}

function getBatchPhoneServiceAreaDescription(config: BatchPhoneBrandHubConfig, areaName: string, index: number) {
  return config.serviceAreaDescriptions[index % config.serviceAreaDescriptions.length].replace("AREA", areaName);
}

const PHONE_FEATURED_SERVICE_AREA_SLUGS = ["ringwood-east", "heathmont", "mitcham", "croydon"];

function buildFeaturedServiceAreaSource() {
  return [
    ...PHONE_FEATURED_SERVICE_AREA_SLUGS.map((slug) => SERVICE_AREAS.find((area) => area.slug === slug))
      .filter((area): area is (typeof SERVICE_AREAS)[number] => Boolean(area)),
    ...SERVICE_AREAS.filter(
      (area) =>
        area.slug !== "ringwood" &&
        !PHONE_FEATURED_SERVICE_AREA_SLUGS.includes(area.slug)
    ),
  ];
}

function getIPhoneServiceAreaDescription(areaName: string, index: number) {
  const descriptions = [
    `${areaName} customers can choose their exact iPhone model and check available repair options before visiting our Ringwood Square repair desk.`,
    `Travelling from ${areaName}? Review the repair options for your iPhone, then call ahead to confirm parts or likely timing.`,
    `Customers near ${areaName} can use the model selector first, then visit the Ringwood Square kiosk for assessment and confirmed pricing.`,
    `${areaName} customers can request a quote after choosing the iPhone model that matches their device.`,
    `Before travelling from ${areaName}, check the supported iPhone repairs and contact our Ringwood Square team about parts availability.`,
    `${areaName} customers can compare iPhone repair paths online, then book or call the Ringwood desk for the next step.`,
  ];

  return descriptions[index % descriptions.length];
}

function getSamsungServiceAreaDescription(areaName: string, index: number) {
  const descriptions = [
    `${areaName} customers can choose their exact Samsung Galaxy model before visiting our Ringwood Square repair desk.`,
    `Travelling from ${areaName}? Check Samsung screen, battery, charging and rear-cover options by model, then call ahead about parts availability.`,
    `Customers near ${areaName} can use the Samsung model selector first, then visit Kiosk C1 for assessment and confirmed quote details.`,
    `${areaName} customers can review Samsung repair paths online before contacting the Ringwood Square team for the next step.`,
    `Before travelling from ${areaName}, choose the exact Galaxy model and contact the store if you want likely timing checked first.`,
    `${areaName} customers can compare Samsung repair options online, then visit Ringwood Square for model-specific assessment.`,
  ];

  return descriptions[index % descriptions.length];
}

function getGooglePixelServiceAreaDescription(areaName: string, index: number) {
  const descriptions = [
    `${areaName} customers can choose their exact Google Pixel model before visiting our Ringwood Square repair desk.`,
    `Travelling from ${areaName}? Check Pixel screen, battery, charging and rear-damage options by model, then call ahead about parts availability.`,
    `Customers near ${areaName} can use the Pixel model selector first, then visit Kiosk C1 for assessment and confirmed quote details.`,
    `${areaName} customers can review Google Pixel repair paths online before contacting the Ringwood Square team for the next step.`,
    `Before travelling from ${areaName}, choose the exact Pixel model and contact the store if you want likely timing checked first.`,
    `${areaName} customers can compare Pixel repair options online, then visit Ringwood Square for model-specific assessment.`,
  ];

  return descriptions[index % descriptions.length];
}

function getOppoServiceAreaDescription(areaName: string, index: number) {
  const descriptions = [
    `${areaName} customers can choose their exact OPPO model before visiting our Ringwood Square repair desk.`,
    `Travelling from ${areaName}? Check OPPO screen, battery, charging and rear-damage options by model, then call ahead about parts availability.`,
    `Customers near ${areaName} can use the OPPO model selector first, then visit Kiosk C1 for assessment and confirmed quote details.`,
    `${areaName} customers can review OPPO repair paths online before contacting the Ringwood Square team for the next step.`,
    `Before travelling from ${areaName}, choose the exact OPPO model and contact the store if you want likely timing checked first.`,
    `${areaName} customers can compare OPPO repair options online, then visit Ringwood Square for model-specific assessment.`,
  ];

  return descriptions[index % descriptions.length];
}

function getIPadServiceAreaDescription(areaName: string, index: number) {
  const descriptions = [
    `${areaName} customers can choose their exact iPad model before visiting our Ringwood Square repair desk.`,
    `Travelling from ${areaName}? Check iPad screen, LCD, battery, charging and camera options by model, then call ahead about parts availability.`,
    `Customers near ${areaName} can use the iPad model selector first, then visit Kiosk C1 for assessment and confirmed quote details.`,
    `${areaName} customers can review iPad repair paths online before contacting the Ringwood Square team for the next step.`,
    `Before travelling from ${areaName}, choose the exact iPad model and contact the store if you want likely timing checked first.`,
    `${areaName} customers can compare iPad repair options online, then visit Ringwood Square for model-specific assessment.`,
  ];

  return descriptions[index % descriptions.length];
}

const MAJOR_PHONE_BRAND_HUB_SLUGS = ["iphone", "samsung", "oppo", "google-pixel"];
const SAMSUNG_SERIES_ORDER = ["s", "a", "note", "z"];
const APPLE_WATCH_SERIES_ORDER = [
  "series-3",
  "series-4",
  "series-5",
  "series-6",
  "se-1",
  "series-7",
  "series-8",
  "series-9",
  "series-10",
  "se-2",
  "ultra",
  "ultra-2",
  "other",
];
const SAMSUNG_SERIES_LABELS: Record<string, string> = {
  s: "Galaxy S Series",
  a: "Galaxy A Series",
  note: "Galaxy Note Series",
  z: "Galaxy Z Series",
  other: "Other Samsung Models",
};

const OPPO_SERIES_LABELS: Record<string, string> = {
  find: "Find Series",
  reno: "Reno Series",
  a: "A Series",
  other: "Other Oppo Models",
};

const APPLE_WATCH_SERIES_LABELS: Record<string, string> = {
  "series-3": "Apple Watch Series 3",
  "series-4": "Apple Watch Series 4",
  "series-5": "Apple Watch Series 5",
  "series-6": "Apple Watch Series 6",
  "se-1": "Apple Watch SE (1st generation)",
  "series-7": "Apple Watch Series 7",
  "series-8": "Apple Watch Series 8",
  "series-9": "Apple Watch Series 9",
  "series-10": "Apple Watch Series 10",
  "se-2": "Apple Watch SE (2nd generation)",
  ultra: "Apple Watch Ultra",
  "ultra-2": "Apple Watch Ultra 2",
  other: "Other Apple Watch Models",
};

function buildOtherPhoneBrandLinks(brands: BrandEntry[], currentBrandSlug: string) {
  const seen = new Set<string>();

  return brands
    .filter(
      (brand) =>
        brand.category === "phone" &&
        brand.slug !== currentBrandSlug &&
        brand.models.length > 0
    )
    .sort((a, b) => {
      const aMajorIndex = MAJOR_PHONE_BRAND_HUB_SLUGS.indexOf(a.slug);
      const bMajorIndex = MAJOR_PHONE_BRAND_HUB_SLUGS.indexOf(b.slug);

      if (aMajorIndex !== -1 || bMajorIndex !== -1) {
        if (aMajorIndex === -1) return 1;
        if (bMajorIndex === -1) return -1;
        return aMajorIndex - bMajorIndex;
      }

      return brands.indexOf(a) - brands.indexOf(b);
    })
    .map((brand) => ({
      href: `/repairs/phone/${safeSlugSegment(brand.slug)}`,
      label: `${brand.brand} Repairs`,
    }))
    .filter((link) => {
      if (seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    });
}

function buildOtherTabletBrandLinks(brands: BrandEntry[], currentBrandSlug: string) {
  const seen = new Set<string>();

  return brands
    .filter(
      (brand) =>
        brand.category === "tablet" &&
        brand.slug !== currentBrandSlug &&
        brand.models.length > 0
    )
    .map((brand) => ({
      href: `/repairs/tablet/${safeSlugSegment(brand.slug)}`,
      label: `${brand.brand} Tablet Repairs`,
    }))
    .filter((link) => {
      if (seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    });
}

function buildOtherWatchBrandLinks(brands: BrandEntry[], currentBrandSlug: string) {
  const seen = new Set<string>();

  return brands
    .filter(
      (brand) =>
        brand.category === "watch" &&
        brand.slug !== currentBrandSlug &&
        brand.models.length > 0
    )
    .map((brand) => ({
      href: `/repairs/watch/${safeSlugSegment(brand.slug)}`,
      label: `${brand.brand} Watch Repairs`,
    }))
    .filter((link) => {
      if (seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    });
}

function getSamsungSeriesKey(model: ModelEntry) {
  const name = model.model.toLowerCase();
  const slug = model.slug.toLowerCase();

  if (slug.startsWith("galaxy-s") || name.includes("galaxy s")) return "s";
  if (slug.startsWith("galaxy-a") || name.includes("galaxy a")) return "a";
  if (slug.startsWith("galaxy-note") || name.includes("galaxy note") || name.includes("note")) return "note";
  if (slug.startsWith("galaxy-z") || name.includes("galaxy z") || name.includes("fold") || name.includes("flip")) return "z";
  return "other";
}

function getOppoSeriesKey(model: ModelEntry) {
  const name = model.model.toLowerCase();
  const slug = model.slug.toLowerCase();

  if (name.includes("find") || slug.includes("find")) return "find";
  if (name.includes("reno") || slug.includes("reno")) return "reno";
  if (/^a\d+/i.test(name) || /^a\d+/i.test(slug)) return "a";
  return "other";
}

function getAppleWatchSeriesKey(model: ModelEntry) {
  const name = model.model.toLowerCase();
  const slug = model.slug.toLowerCase();

  if (name.includes("ultra 2") || slug.includes("ultra-2")) return "ultra-2";
  if (name.includes("ultra") || slug.includes("ultra")) return "ultra";
  if (name.includes("se") && (name.includes("2nd") || slug.includes("2nd"))) return "se-2";
  if (name.includes("se") && (name.includes("1st") || slug.includes("1st"))) return "se-1";

  const seriesMatch = name.match(/series\s+(\d+)/);
  if (seriesMatch) return `series-${seriesMatch[1]}`;

  return "other";
}

function toBrandHubSeriesModels(models: ModelEntry[]) {
  return models.map((model) => ({
    model: model.model,
    slug: model.slug,
    modelCode: model.modelCode,
  }));
}

function buildMacBookFamilyGroups(models: ModelEntry[]) {
  const sorted = smartSortModels(models);
  const groups = new Map<string, ModelEntry[]>();

  for (const model of sorted) {
    const key = getMacBookFamilyKey(model.model, model.slug);
    const current = groups.get(key) ?? [];
    current.push(model);
    groups.set(key, current);
  }

  return MACBOOK_FAMILY_ORDER.flatMap((key) => {
    const groupedModels = groups.get(key);
    if (!groupedModels || groupedModels.length === 0) return [];
    return [{
      series: MACBOOK_FAMILY_LABELS[key],
      models: groupedModels,
    }];
  });
}

function buildBrandHubSeriesGroups(categorySlug: string, brandSlug: string, models: ModelEntry[]): BrandHubSeriesGroup[] {
  if (categorySlug === "watch" && brandSlug === "apple") {
    const groups = new Map<string, ModelEntry[]>();

    for (const model of models) {
      const key = getAppleWatchSeriesKey(model);
      const current = groups.get(key) ?? [];
      current.push(model);
      groups.set(key, current);
    }

    return APPLE_WATCH_SERIES_ORDER.flatMap((key) => {
      const groupedModels = groups.get(key);
      if (!groupedModels || groupedModels.length === 0) return [];
      return [{
        key,
        label: APPLE_WATCH_SERIES_LABELS[key],
        models: toBrandHubSeriesModels(groupedModels),
      }];
    });
  }

  if (categorySlug === "tablet" && brandSlug === "ipad") {
    const sorted = smartSortModels(models);
    const groups = new Map<string, ModelEntry[]>();

    for (const model of sorted) {
      const key = getIPadSeriesKey(model.model, model.slug);
      const current = groups.get(key) ?? [];
      current.push(model);
      groups.set(key, current);
    }

    return IPAD_BRAND_HUB_SERIES_ORDER.flatMap((key) => {
      const groupedModels = groups.get(key);
      if (!groupedModels || groupedModels.length === 0) return [];
      return [{
        key,
        label: IPAD_SERIES_LABELS[key],
        models: toBrandHubSeriesModels(groupedModels),
      }];
    });
  }

  if (categorySlug === "tablet" && (brandSlug === "samsung" || brandSlug === "lenovo")) {
    const sorted = smartSortModels(models);
    const groups = new Map<string, ModelEntry[]>();

    for (const model of sorted) {
      const key = brandSlug === "samsung"
        ? getSamsungTabletSeriesKey(model.model, model.slug)
        : getLenovoTabletSeriesKey(model.model, model.slug);
      const current = groups.get(key) ?? [];
      current.push(model);
      groups.set(key, current);
    }

    const orderedKeys = brandSlug === "samsung" ? SAMSUNG_TABLET_BRAND_HUB_SERIES_ORDER : LENOVO_TABLET_BRAND_HUB_SERIES_ORDER;
    const labels = brandSlug === "samsung" ? SAMSUNG_TABLET_SERIES_LABELS : LENOVO_TABLET_SERIES_LABELS;

    return orderedKeys.flatMap((key) => {
      const groupedModels = groups.get(key);
      if (!groupedModels || groupedModels.length === 0) return [];
      return [{
        key,
        label: labels[key],
        models: toBrandHubSeriesModels(groupedModels),
      }];
    });
  }

  if (categorySlug !== "phone" || (brandSlug !== "samsung" && brandSlug !== "oppo")) {
    return [];
  }

  const sorted = smartSortModels(models);
  const groups = new Map<string, ModelEntry[]>();

  for (const model of sorted) {
    const key = brandSlug === "samsung" ? getSamsungSeriesKey(model) : getOppoSeriesKey(model);
    const current = groups.get(key) ?? [];
    current.push(model);
    groups.set(key, current);
  }

  if (brandSlug === "samsung") {
    const orderedKeys = [...SAMSUNG_SERIES_ORDER, ...(groups.has("other") ? ["other"] : [])];
    return orderedKeys.map((key) => ({
      key,
      label: SAMSUNG_SERIES_LABELS[key],
      models: toBrandHubSeriesModels(groups.get(key) ?? []),
    }));
  }

  return ["find", "reno", "a", "other"]
    .flatMap((key) => {
      const groupedModels = groups.get(key);
      if (!groupedModels || groupedModels.length === 0) return [];
      return [{
        key,
        label: OPPO_SERIES_LABELS[key],
        models: toBrandHubSeriesModels(groupedModels),
      }];
    });
}

function getStartingRepairPrice(
  models: Array<{ repairTypes: Array<{ price: number }> }>
): number | null {
  const prices = models
    .flatMap((model) => model.repairTypes)
    .map((repair) => repair.price)
    .filter((price) => Number.isFinite(price) && price > 0);

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

function formatStartingRepairPrice(price: number): string {
  return new Intl.NumberFormat('en-AU', {
    maximumFractionDigits: 0,
  }).format(price);
}

function getBrandHubHeroDescription(
  categorySlug: string,
  brandSlug: string,
  brandName: string,
  modelCount: number
): string {
  if (categorySlug === "phone") {
    switch (brandSlug) {
      case "iphone":
        return "Choose your exact iPhone model to view screen, battery, charging and back glass repair options. Our Ringwood Square repair desk supports customers across Melbourne's eastern suburbs, with quotes and parts availability confirmed before work begins.";
      case "samsung":
        return "Choose your exact Samsung Galaxy model to view available screen, battery, charging and rear-cover repair options. Our Ringwood Square repair desk supports customers across Melbourne's eastern suburbs, with quotes and parts availability confirmed before work begins.";
      case "google-pixel":
        return "Choose your exact Google Pixel model to view available screen, battery, charging and rear-damage repair options. Our Ringwood Square repair desk supports customers across Melbourne's eastern suburbs, with quotes and parts availability confirmed before work begins.";
      case "oppo":
        return "Choose your exact OPPO model to view available screen, battery, charging and rear-damage repair options. Our Ringwood Square repair desk supports customers across Melbourne's eastern suburbs, with quotes and parts availability confirmed before work begins.";
      default:
        if (isBatchPhoneBrandSlug(brandSlug)) {
          return BATCH_PHONE_BRAND_HUB_CONFIG[brandSlug].heroDescription;
        }
        return `Explore ${brandName} phone repair options for ${modelCount} supported models. Visit our Ringwood Square repair desk or choose your exact model to check available services and pricing.`;
    }
  }

  if (categorySlug === "watch" && brandSlug === "apple") {
    return "Explore Apple Watch repair options for supported Series, SE and Ultra models, including screen, battery and no-power diagnostics. Visit Ringwood Square or choose your exact watch model to check pricing.";
  }

  if (categorySlug === "tablet" && brandSlug === "ipad") {
    return "Choose your exact iPad model to view available screen, LCD, battery, charging, front camera and back camera repair options. Our Ringwood Square repair desk supports customers across Melbourne's eastern suburbs, with quotes and parts availability confirmed before work begins.";
  }

  if (categorySlug === "tablet" && brandSlug === "samsung") {
    return "Explore Samsung Tablet repair options for supported Galaxy Tab models, including screen, battery and charging-related repairs. Visit Ringwood Square or choose your exact model to check pricing.";
  }

  if (categorySlug === "tablet" && brandSlug === "lenovo") {
    return "Explore Lenovo Tablet repair options for supported Tab, Yoga and other Lenovo tablet models. Visit Ringwood Square or choose your exact model to check available services and pricing.";
  }

  return `Select your exact ${brandName} model below to view repair options and pricing at Ringwood Square.`;
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();
  return catalog.brands.map((b) => ({
    category: b.category,
    brand: b.slug,
  }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { brand } = await fetchBrandModels(resolvedParams.category, resolvedParams.brand);
  if (!brand) {
    notFound();
  }
  const brandName = brand?.brand || formatDynamicParam(resolvedParams.brand);
  const canonicalPath = `/repairs/${safeSlugSegment(resolvedParams.category)}/${safeSlugSegment(resolvedParams.brand)}`;
  const isAppleWatch = resolvedParams.category === "watch" && resolvedParams.brand === "apple";
  const isIPad = resolvedParams.category === "tablet" && resolvedParams.brand === "ipad";
  const isSamsungTablet = resolvedParams.category === "tablet" && resolvedParams.brand === "samsung";
  const isLenovoTablet = resolvedParams.category === "tablet" && resolvedParams.brand === "lenovo";
  const isPhone = resolvedParams.category === "phone";

  const isMacBookHub = resolvedParams.category === "laptop" && resolvedParams.brand === "macbook";

  let title, description;

  if (isPhone) {
    const phoneContent = getPhoneBrandHubContent(resolvedParams.brand, brandName);
    title = phoneContent.metadata.title;
    description = phoneContent.metadata.description;
  } else if (isAppleWatch) {
    title = 'Apple Watch Repair | Screen, Battery & Diagnostics | Ali Mobile';
    description = "Apple Watch repair at Ringwood Square for Melbourne's eastern suburbs. Choose your model for screen, battery and diagnostic quote options.";
  } else if (isIPad) {
    title = 'iPad Repair | Screen, Battery & Charging | Ali Mobile';
    description = "iPad repair at Ringwood Square for Melbourne's eastern suburbs. Check screen, LCD, battery, charging and camera repair options by exact model.";
  } else if (isSamsungTablet) {
    title = 'Samsung Tablet Repair | Screen, Battery & Charging | Ali Mobile';
    description = "Samsung Tablet repair at Ringwood Square for Melbourne's eastern suburbs. Choose your Galaxy Tab model for screen, battery and charging options.";
  } else if (isLenovoTablet) {
    title = 'Lenovo Tablet Repair | Models & Repair Options | Ali Mobile';
    description = "Lenovo Tablet repair at Ringwood Square for Melbourne's eastern suburbs. Select your exact model to view available repair options and pricing.";
  } else if (isMacBookHub) {
    title = 'MacBook Repair in Ringwood | Ali Mobile & Repair';
    description = 'MacBook repair services in Ringwood for supported screen, battery, keyboard or top case, charging and diagnostic issues. Visit Ali Mobile & Repair at Ringwood Square to confirm the model, parts availability and suitable repair options.';
  } else {
    title = `${brandName} Repair Services in Ringwood | Fast & Reliable | Ali Mobile`;
    description = `Expert ${brandName} repair services in Ringwood, Melbourne. Screen replacement, battery repair, charging port fix, and more. Most common repairs under 1 hour when parts are in stock, with warranty support on eligible repairs.`;
  }

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: isIPad ? "https://www.alimobile.com.au/repairs/tablet/ipad" : canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: isIPad ? "https://www.alimobile.com.au/repairs/tablet/ipad" : canonicalPath,
      type: "website",
      locale: "en_AU",
      siteName: "Ali Mobile & Repair",
    },
  };
  return metadata;
}

export default async function BrandSubHubPage({ params }: BrandPageProps) {
  const resolvedParams = await params;
  const catalog = await fetchRepairCatalog();
  const brandEntry = catalog.brands.find(
    (brand) => brand.category === resolvedParams.category && brand.slug === resolvedParams.brand
  ) || null;
  if (!brandEntry) {
    notFound();
  }

  const brandName = brandEntry?.brand || formatDynamicParam(resolvedParams.brand);
  const models = brandEntry?.models || [];
  const categorySlug = resolvedParams.category;
  const brandSlug = resolvedParams.brand;
  const isMacBookHub = categorySlug === "laptop" && brandSlug === "macbook";
  const isAppleWatchHub = categorySlug === "watch" && brandSlug === "apple";
  const isIPadHub = categorySlug === "tablet" && brandSlug === "ipad";
  const isSamsungTabletHub = categorySlug === "tablet" && brandSlug === "samsung";
  const isLenovoTabletHub = categorySlug === "tablet" && brandSlug === "lenovo";
  const isTabletBrandHub = isIPadHub || isSamsungTabletHub || isLenovoTabletHub;
  const isPhoneHub = categorySlug === "phone";
  const isIPhoneHub = categorySlug === "phone" && brandSlug === "iphone";
  const isSamsungPhoneHub = categorySlug === "phone" && brandSlug === "samsung";
  const isGooglePixelHub = categorySlug === "phone" && brandSlug === "google-pixel";
  const isOppoPhoneHub = categorySlug === "phone" && brandSlug === "oppo";
  const batchPhoneBrandConfig = getBatchPhoneBrandConfig(categorySlug, brandSlug);
  const isEnhancedPhoneHub = isIPhoneHub || isSamsungPhoneHub || isGooglePixelHub || isOppoPhoneHub || Boolean(batchPhoneBrandConfig);
  const usesBrandHubDesign = isPhoneHub || isTabletBrandHub || isAppleWatchHub;
  const usesFlatBrandHubModels = isPhoneHub && usesBrandHubDesign && !MAJOR_PHONE_BRAND_HUB_SLUGS.includes(brandSlug);
  const floatingJumpLabel =
    categorySlug === "phone" && brandSlug === "iphone"
      ? "Choose Your iPhone"
      : categorySlug === "phone" && brandSlug === "samsung"
      ? "Choose Your Samsung"
      : categorySlug === "phone" && ["google", "google-pixel"].includes(brandSlug)
      ? "Choose Your Google Pixel"
      : categorySlug === "phone" && brandSlug === "oppo"
      ? "Choose Your Oppo"
      : categorySlug === "tablet" && ["ipad", "apple"].includes(brandSlug)
      ? "Choose Your iPad"
      : categorySlug === "laptop" && brandSlug === "macbook"
      ? "Choose Your MacBook"
      : categorySlug === "watch" && ["apple", "apple-watch"].includes(brandSlug)
      ? "Choose Your Apple Watch"
      : "Choose Your Model";
  const phoneContent = isPhoneHub ? getPhoneBrandHubContent(brandSlug, brandName) : null;
  const brandHubHeading = isPhoneHub
    ? getPhoneBrandRepairKeyword(brandSlug, brandName)
    : isAppleWatchHub
    ? "Apple Watch Repair"
    : isIPadHub
    ? "iPad Repair"
    : isSamsungTabletHub
    ? "Samsung Tablet Repair"
    : isLenovoTabletHub
    ? "Lenovo Tablet Repair"
    : `${brandName} Repair Services`;
  const brandHubHeroDescription = getBrandHubHeroDescription(categorySlug, brandSlug, brandName, models.length);
  const otherPhoneBrandLinks = isPhoneHub ? buildOtherPhoneBrandLinks(catalog.brands, brandSlug) : [];
  const otherTabletBrandLinks = isTabletBrandHub ? buildOtherTabletBrandLinks(catalog.brands, brandSlug) : [];
  const otherWatchBrandLinks = isAppleWatchHub ? buildOtherWatchBrandLinks(catalog.brands, brandSlug) : [];
  const startingRepairPrice = isPhoneHub ? getStartingRepairPrice(models) : null;
  const sortedModels = smartSortModels(models);
  const seriesGroups = isMacBookHub ? buildMacBookFamilyGroups(models) : [];
  const flatModelGroup = [{ series: `${brandName} Models`, models: sortedModels }];
  const brandHubSeriesGroups = usesBrandHubDesign ? buildBrandHubSeriesGroups(categorySlug, brandSlug, models) : [];
  const phoneServiceAreaSource = isEnhancedPhoneHub ? buildFeaturedServiceAreaSource() : [];
  const ipadServiceAreas: IPhoneServiceAreaLinkCard[] = isIPadHub
    ? buildFeaturedServiceAreaSource().map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getIPadServiceAreaDescription(area.name, index),
      }))
    : [];
  const iphoneServiceAreas: IPhoneServiceAreaLinkCard[] = isIPhoneHub
    ? phoneServiceAreaSource.map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getIPhoneServiceAreaDescription(area.name, index),
      }))
    : [];
  const samsungServiceAreas: IPhoneServiceAreaLinkCard[] = isSamsungPhoneHub
    ? phoneServiceAreaSource.map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getSamsungServiceAreaDescription(area.name, index),
      }))
    : [];
  const googlePixelServiceAreas: IPhoneServiceAreaLinkCard[] = isGooglePixelHub
    ? phoneServiceAreaSource.map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getGooglePixelServiceAreaDescription(area.name, index),
      }))
    : [];
  const oppoServiceAreas: IPhoneServiceAreaLinkCard[] = isOppoPhoneHub
    ? phoneServiceAreaSource.map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getOppoServiceAreaDescription(area.name, index),
      }))
    : [];
  const batchPhoneServiceAreas: IPhoneServiceAreaLinkCard[] = batchPhoneBrandConfig
    ? phoneServiceAreaSource.map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getBatchPhoneServiceAreaDescription(batchPhoneBrandConfig, area.name, index),
      }))
    : [];
  const serverRepairResultsTarget:
    | { category: RepairResultDeviceCategory; brand: string }
    | null = isIPhoneHub
    ? { category: "phone", brand: "iphone" }
    : isSamsungPhoneHub
    ? { category: "phone", brand: "samsung" }
    : isGooglePixelHub
    ? { category: "phone", brand: "google-pixel" }
    : isOppoPhoneHub
    ? { category: "phone", brand: "oppo" }
    : batchPhoneBrandConfig
    ? { category: "phone", brand: brandSlug }
    : isIPadHub
    ? { category: "tablet", brand: "ipad" }
    : null;
  const serverRepairResults: HubRepairResultItem[] | undefined = serverRepairResultsTarget
    ? (await fetchHubRepairResults(serverRepairResultsTarget.category, serverRepairResultsTarget.brand)).map((result) => ({
        id: result.id,
        device_category: result.device_category,
        brand: result.brand,
        model: result.model,
        repair_type: result.repair_type,
        repair_type_slug: result.repair_type_slug,
        image_pair_alt_text: result.image_pair_alt_text,
        title: result.title,
        short_description: result.short_description,
        related_repair_url: result.related_repair_url,
      }))
    : undefined;
  const phoneCommonProblems = isIPhoneHub
    ? {
        headingId: "iphone-common-problems-heading",
        kicker: "COMMON IPHONE PROBLEMS",
        heading: "Common iPhone problems we assess",
        items: IPHONE_COMMON_PROBLEMS,
      }
    : isSamsungPhoneHub
    ? {
        headingId: "samsung-common-problems-heading",
        kicker: "COMMON SAMSUNG PHONE PROBLEMS",
        heading: "Common Samsung phone problems we assess",
        items: SAMSUNG_COMMON_PROBLEMS,
      }
    : isGooglePixelHub
    ? {
        headingId: "google-pixel-common-problems-heading",
        kicker: "COMMON GOOGLE PIXEL PROBLEMS",
        heading: "Common Google Pixel problems we assess",
        items: GOOGLE_PIXEL_COMMON_PROBLEMS,
      }
    : isOppoPhoneHub
    ? {
        headingId: "oppo-common-problems-heading",
        kicker: "COMMON OPPO PHONE PROBLEMS",
        heading: "Common OPPO phone problems we assess",
        items: OPPO_COMMON_PROBLEMS,
      }
    : batchPhoneBrandConfig
    ? {
        headingId: `${brandSlug}-common-problems-heading`,
        kicker: `COMMON ${batchPhoneBrandConfig.displayName.toUpperCase()} PHONE PROBLEMS`,
        heading: `Common ${batchPhoneBrandConfig.displayName} phone problems we assess`,
        items: batchPhoneBrandConfig.commonProblems,
      }
    : null;
  const phoneRepairTypeLinks = isIPhoneHub
    ? IPHONE_REPAIR_TYPE_LINKS
    : isSamsungPhoneHub
    ? SAMSUNG_REPAIR_TYPE_LINKS
    : isGooglePixelHub
    ? GOOGLE_PIXEL_REPAIR_TYPE_LINKS
    : isOppoPhoneHub
    ? OPPO_REPAIR_TYPE_LINKS
    : batchPhoneBrandConfig
    ? batchPhoneBrandConfig.repairLinks
    : BRAND_HUB_REPAIR_TYPE_LINKS;
  const phoneCommonRepairsIntro = isIPhoneHub
    ? "Start with your iPhone model, then choose the repair path that best matches the fault. Screen, battery, charging and back glass options can vary by model and current parts availability."
    : isSamsungPhoneHub
    ? "Start with your Samsung model, then choose the repair path that best matches the fault. Available screen, battery, charging and rear-damage options can vary by model, device condition and current parts availability."
    : isGooglePixelHub
    ? "Start with your Google Pixel model, then choose the repair path that best matches the fault. Available screen, battery, charging and rear-damage options can vary by model, device condition and current parts availability."
    : isOppoPhoneHub
    ? "Start with your OPPO model, then choose the repair path that best matches the fault. Available screen, battery, charging and rear-damage options can vary by model, device condition and current parts availability."
    : batchPhoneBrandConfig
    ? batchPhoneBrandConfig.commonRepairsIntro
    : "Choose your exact model first, then compare the repair path that best matches the fault we need to assess.";
  const macbookRepairPaths = [
    {
      name: "Screen and display faults",
      note: "Cracked panels, image issues, backlight faults and display assemblies matched to the exact model.",
    },
    {
      name: "Battery replacement",
      note: "Battery wear, charging drop-off and shutdown symptoms checked against the correct MacBook generation.",
    },
    {
      name: "Keyboard and top case path",
      note: "Keyboard issues often use a top case assembly, and the replacement top case does not include the battery.",
    },
    {
      name: "Charging and power faults",
      note: "USB-C, MagSafe and power-delivery issues are assessed after confirming the model and the likely fault path.",
    },
    {
      name: "Liquid damage assessment",
      note: "We inspect spill-related damage first and explain the practical repair path before extra work is approved.",
    },
    {
      name: "Trackpad and speaker issues",
      note: "Input and audio faults are checked as model-specific repair paths after diagnosis.",
    },
  ];
  const macbookFaqs = [
    {
      question: "Why do I need the exact MacBook model before repair?",
      answer:
        "MacBook repair compatibility, parts selection and quote accuracy all depend on the exact model and A-number.",
    },
    {
      question: "Can you quote a MacBook keyboard repair straight away?",
      answer:
        "We can outline the likely repair path, but the exact model still needs to be confirmed because keyboard work commonly uses a top case assembly and parts availability varies by model.",
    },
    {
      question: "How long do MacBook parts usually take to arrive?",
      answer:
        "Many MacBook parts commonly take around one to two days to obtain, then installation is often about one hour once the correct part arrives.",
    },
    {
      question: "What if my MacBook model is not listed yet?",
      answer:
        "If your MacBook is not shown in the selector, contact Ali Mobile & Repair for an assessment before you travel and we can confirm the next step.",
    },
  ];
  const phoneHeroInsightCards = isPhoneHub
    ? brandSlug === "iphone"
      ? [
          {
            title: startingRepairPrice ? `iPhone Repairs from $${formatStartingRepairPrice(startingRepairPrice)}` : "iPhone Repair Pricing",
            body: startingRepairPrice
              ? `Selected iPhone repair services start from $${formatStartingRepairPrice(startingRepairPrice)}. Choose your exact model to view current repair options and pricing.`
              : "Choose your exact iPhone model to view current repair options and pricing.",
          },
          {
            title: "Fast Screen & Battery Repairs",
            body: "Most iPhone screen replacements take about 30 minutes, while most iPhone battery replacements take less than 30 minutes once the correct part is available.",
          },
          {
            title: "Same-Day Repairs for Common Models",
            body: "Many common iPhone repairs can be completed the same day when parts are available. Less common parts usually take around 1–2 days to arrive.",
          },
        ]
      : [
          {
            title: startingRepairPrice ? `${brandName} Repairs from $${formatStartingRepairPrice(startingRepairPrice)}` : `${brandName} Repair Pricing`,
            body: startingRepairPrice
              ? `Selected ${brandName} repair services start from $${formatStartingRepairPrice(startingRepairPrice)}. Choose your exact model to view current repair options and pricing.`
              : `Choose your exact ${brandName} model to view current repair options and pricing.`,
          },
          {
            title: phoneContent?.timing.battery ? "Fast Screen & Battery Repairs" : "Fast Screen Repairs",
            body: phoneContent?.timing.battery
              ? `${phoneContent.timing.screen} ${phoneContent.timing.battery}`
              : phoneContent?.timing.screen || `Many supported ${brandName} repairs can be completed quickly once the exact model and correct part are confirmed.`,
          },
          {
            title: "Same-Day Repairs for Common Models",
            body: `Many common ${brandName} repairs can be completed the same day when parts are available. Less common parts usually take around 1–2 days to arrive.`,
          },
        ]
    : [];
  const ipadHeroInsightCards = isIPadHub
    ? [
        {
          title: "iPad Repairs from $50",
          body: "Selected iPad repair services start from $50. Choose your exact model to view current repair options and pricing.",
        },
        {
          title: "Fast Screen & Battery Repairs",
          body: "Most iPad screen and battery repairs take about 45 minutes once the correct part is available.",
        },
        {
          title: "Same-Day Repairs for Common Models",
          body: "Many common iPad repairs can be completed the same day when parts are available. Less common parts usually take around 1-2 days to arrive.",
        },
      ]
    : [];
  const tabletHeroInsightCards = isTabletBrandHub && !isIPadHub
    ? [
        {
          title: `${brandName} tablet model support`,
          body: "Search by model name or code",
        },
        {
          title: "Transparent repair paths before booking",
          body: "Choose the exact tablet model first so the compatible repair path can be checked before booking.",
        },
        {
          title: "Exact model unlocks service pricing",
          body: "Model-specific parts, timing and quote information depend on the confirmed tablet model.",
        },
      ]
    : [];
  const appleWatchHeroInsightCards = isAppleWatchHub
    ? [
        {
          title: "Choose exact model",
          body: "Apple Watch Series, SE and Ultra",
        },
        {
          title: "Exact generation required",
          body: "Confirm the exact Apple Watch generation and case size before choosing the repair path.",
        },
        {
          title: "Case size",
          body: "Use the model selector to match sizes such as 38mm, 40mm, 41mm, 42mm, 44mm, 45mm, 46mm or 49mm.",
        },
      ]
    : [];

  return (
    <main className={`repair-page-shell ${!usesBrandHubDesign ? "repair-page-shell-narrow" : ""} ${usesBrandHubDesign ? "brand-hub-page" : ""} ${isIPadHub ? "tablet-brand-hub-page" : ""} ${isAppleWatchHub ? "watch-brand-hub-page" : ""}`}>
      <nav className="repair-breadcrumb" aria-label="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/repairs">Repairs</Link>
        <span>/</span>
        <Link href={`/repairs/${categorySlug}`}>{formatDynamicParam(categorySlug)} Repair</Link>
        <span>/</span>
        <strong>{brandName} Repair</strong>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.alimobile.com.au/" },
              { "@type": "ListItem", "position": 2, "name": "Repairs", "item": "https://www.alimobile.com.au/repairs" },
              { "@type": "ListItem", "position": 3, "name": `${formatDynamicParam(categorySlug)} Repair`, "item": `https://www.alimobile.com.au/repairs/${categorySlug}` },
              { "@type": "ListItem", "position": 4, "name": `${brandName} Repair`, "item": `https://www.alimobile.com.au/repairs/${categorySlug}/${brandSlug}` }
            ]
          })
        }}
      />

      <section
        className="repair-tech-hero repair-tech-hero-compact"
        aria-labelledby="brand-repair-heading"
        style={isMacBookHub ? { gridTemplateColumns: "minmax(0, 1fr)" } : undefined}
      >
        <div className="repair-tech-hero-copy">
          <BackButton fallbackHref={`/repairs/${categorySlug}`} />
          <span className="repair-hero-badge">
            <Smartphone size={16} strokeWidth={2.4} aria-hidden="true" />
            {isMacBookHub ? "MacBook Model Hub" : isAppleWatchHub ? "Apple Watch Model Hub" : isIPadHub ? "iPad Model Hub" : `${brandName} Model Hub`}
          </span>
          <h1 id="category-repair-heading">
            {isMacBookHub
              ? "MacBook Repair in Ringwood"
              : brandHubHeading}
          </h1>
          <p>
            {isMacBookHub
              ? 'Professional MacBook repair in Ringwood Square. We support screen, battery, keyboard/top case, charging, and diagnostic services. Use your model name or A-number below to find your MacBook and view repair options. Timing depends on parts availability and exact model confirmation.'
              : brandHubHeroDescription}
          </p>
          <div className="repair-hero-actions">
            <a href="#models-list" className="repair-primary-action">
              {isIPhoneHub ? "Choose your iPhone model" : "View model option"}
            </a>
            <Link href="/book-repair" className="repair-secondary-action">
              {isIPhoneHub ? "Get a repair quote" : "Live Quote"}
              <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
            </Link>
          </div>
        </div>
        {isPhoneHub && (
          <div className="repair-hero-brand-proof" aria-label={`${brandName} repair pricing and timing highlights`}>
            {phoneHeroInsightCards.map((card) => (
              <article key={card.title} className="repair-hero-brand-proof-card">
                <h2>{card.title}</h2>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        )}
        {!isPhoneHub && !isMacBookHub && !isAppleWatchHub && !isTabletBrandHub && (
          <div className="repair-hero-panel repair-hero-insight-panel" aria-label="Model selection support">
            <div className="repair-device-card" aria-hidden="true">
              <span className="repair-device-frame">
                <span />
              </span>
              <div>
                <strong>{brandName}</strong>
                <small>Choose model first</small>
              </div>
            </div>
            <div>
              <Search size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>Search by model name or code</span>
            </div>
            <div>
              <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>Transparent repair paths before booking</span>
            </div>
            <div>
              <ClipboardCheck size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>Exact model unlocks service pricing</span>
            </div>
          </div>
        )}
        {isAppleWatchHub && (
          <div className="repair-hero-brand-proof" aria-label="Apple Watch model selection support">
            {appleWatchHeroInsightCards.map((card) => (
              <article key={card.title} className="repair-hero-brand-proof-card">
                <h2>{card.title}</h2>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        )}
        {isIPadHub && (
          <div className="repair-hero-brand-proof" aria-label="iPad model selection support">
            {ipadHeroInsightCards.map((card) => (
              <article key={card.title} className="repair-hero-brand-proof-card">
                <h2>{card.title}</h2>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        )}
        {isTabletBrandHub && !isIPadHub && (
          <div className="repair-hero-brand-proof" aria-label={`${brandName} tablet model selection support`}>
            {tabletHeroInsightCards.map((card) => (
              <article key={card.title} className="repair-hero-brand-proof-card">
                <h2>{card.title}</h2>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {isMacBookHub ? (
        <>
          <MacBookModelFinder
            seriesGroups={seriesGroups}
            categorySlug={categorySlug}
            brandSlug={brandSlug}
          />

          <HubRepairResultsSection
            category={categorySlug as RepairResultDeviceCategory}
            brand={brandSlug}
            scope="brand-hub"
          />

          <section className="repair-types-showcase" aria-labelledby="brand-repair-types-heading">
            <div className="repair-types-showcase-header">
              <div>
                <span className="repair-kicker repair-kicker-muted">Common services</span>
                <h2 id="brand-repair-types-heading">Common MacBook repair paths</h2>
              </div>
              <p>Choose your MacBook model first, then compare the repair path that best matches the fault we need to assess.</p>
            </div>
            <div className="repair-type-card-grid">
              {macbookRepairPaths.map((path, index) => (
                <article key={path.name} className="repair-type-mini-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{path.name}</strong>
                  <small>{path.note}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel" aria-labelledby="macbook-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="macbook-diagnostic-heading">How MacBook diagnosis, parts and quoting work</h2>
              <p>
                We confirm the exact model first, then explain the compatible repair options, parts availability and practical quote path before any work is approved.
              </p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Model-specific diagnosis</h3>
                  <p>The exact model matters before we confirm repair compatibility, quote accuracy or the likely part path.</p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Parts and timing</h3>
                  <p>Parts commonly require around one to two days to obtain, and installation is generally about one hour after the correct part arrives.</p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>Keyboard and top case notes</h3>
                  <p>MacBook keyboard work commonly uses a top case assembly, and the replacement top case does not include the battery.</p>
                </article>
                <article className="repair-signal-card">
                  <span>04</span>
                  <h3>Warranty and limits</h3>
                  <p>Keyboard repair warranty is six months, and we do not promise exact completion timing before the model and parts are confirmed.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="repair-assist-panel" aria-labelledby="macbook-ringwood-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Ringwood service</span>
              <h2 id="macbook-ringwood-heading">MacBook repair support at Ringwood Square</h2>
              <p>
                Ali Mobile &amp; Repair works from Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134. If your model is not listed or the fault needs assessment first, contact us before you travel.
              </p>
            </div>
            <div className="repair-chip-cloud" aria-label="MacBook repair support actions">
              <span>
                <MapPin size={15} strokeWidth={2.2} aria-hidden="true" />
                Ringwood Square Kiosk C1
              </span>
              <span>
                <Clock3 size={15} strokeWidth={2.2} aria-hidden="true" />
                Clear quote before approval
              </span>
              <span>
                <ShieldCheck size={15} strokeWidth={2.2} aria-hidden="true" />
                Privacy-checked repair workflow
              </span>
            </div>
          </section>

          <section className="faq-section" aria-labelledby="macbook-faq-heading">
            <h2 id="macbook-faq-heading" className="faq-heading">MacBook repair FAQs</h2>
            <div className="faq-accordion">
              {macbookFaqs.map((faq) => (
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

          <section className="repair-assist-panel" aria-labelledby="macbook-final-cta-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Next step</span>
              <h2 id="macbook-final-cta-heading">Choose your model to see the right repair options</h2>
              <p>
                Start with the MacBook model selector above to check compatible repair paths, then book or call once you have the exact model.
              </p>
            </div>
            <div className="repair-hero-actions">
              <a href="#models-list" className="repair-primary-action">
                Choose Your MacBook Model
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </a>
              <Link href="/book-repair" className="repair-secondary-action">
                Book a Repair
              </Link>
            </div>
          </section>
        </>
      ) : isAppleWatchHub ? (
        <>
          <section
            id="models-list"
            className="brand-hub-section brand-hub-models-section"
            aria-labelledby="apple-watch-model-finder-heading"
          >
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Model identification</span>
              <h2 id="apple-watch-model-finder-heading">Find your exact Apple Watch model</h2>
              <p>
                Check your watch model and generation in the Watch app or device settings, or search by model code if available.
              </p>
            </div>
            <BrandHubModelSeriesBrowser
              brandSlug={brandSlug}
              categorySlug={categorySlug}
              seriesGroups={brandHubSeriesGroups}
            />
          </section>

          <HubRepairResultsSection
            category={categorySlug as RepairResultDeviceCategory}
            brand={brandSlug}
            scope="brand-hub"
          />

          <section className="brand-hub-section" aria-labelledby="brand-repair-types-heading">
            <div className="brand-hub-section-header">
              <div>
                <span className="repair-kicker">Common services</span>
                <h2 id="brand-repair-types-heading">Common Apple Watch Repair Paths</h2>
              </div>
              <p>Choose your Apple Watch model first, then compare the repair path that best matches the fault we need to assess.</p>
            </div>
            <div className="repair-signal-grid">
              {[
                { name: "Screen and display replacement", note: "Cracked glass, display faults and touch issues need the exact model and case size before the repair path is confirmed." },
                { name: "Battery replacement", note: "Battery wear, short runtime and shutdown symptoms are checked against the compatible model-specific battery path." },
                { name: "Charging or no-power assessment", note: "If the watch is not charging or not turning on, we inspect the fault first before confirming the practical repair option." }
              ].map((path, index) => (
                <article key={path.name} className="repair-signal-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{path.name}</h3>
                  <p>{path.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel" aria-labelledby="apple-watch-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="apple-watch-diagnostic-heading">How Apple Watch diagnosis, parts and quoting work</h2>
              <p>
                We confirm the exact model and condition first, then explain the compatible repair options, parts availability and practical quote path before any work is approved.
              </p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Why generation and case size matter</h3>
                  <p>Parts and repair compatibility vary across Series, SE, Ultra, exact generation, and case size.</p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Parts and timing</h3>
                  <p>Parts availability varies. Timing depends on the exact model, inspection, stock, and repair complexity.</p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>Water resistance limits</h3>
                  <p>Original Apple factory water resistance cannot be guaranteed after opening or repair. Adhesive resealing does not restore guaranteed factory water-resistance certification.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="apple-watch-explore-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Explore more</span>
              <h2 id="apple-watch-explore-heading">More repair categories</h2>
              <p>
                Explore the main repair categories if you are comparing repair options across device types.
              </p>
            </div>
            {otherWatchBrandLinks.length > 0 && (
              <BrandHubLinks links={otherWatchBrandLinks} initialVisibleCount={4} />
            )}
            <div className="brand-hub-link-grid brand-hub-category-link-grid">
              {BRAND_HUB_REPAIR_CATEGORY_LINKS.map((link) => (
                <Link key={link.href} href={link.href} prefetch={false} className="brand-hub-outline-link">
                  <strong>{link.label}</strong>
                </Link>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel" aria-labelledby="apple-watch-ringwood-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Ringwood service</span>
              <h2 id="apple-watch-ringwood-heading">Apple Watch repair support at Ringwood Square</h2>
              <p>
                Ali Mobile &amp; Repair works from Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.
              </p>
            </div>
            <div className="repair-chip-cloud" aria-label="Apple Watch repair support actions">
              <span>
                <MapPin size={15} strokeWidth={2.2} aria-hidden="true" />
                Ringwood Square Kiosk C1
              </span>
              <span>
                <Clock3 size={15} strokeWidth={2.2} aria-hidden="true" />
                Clear quote before approval
              </span>
              <span>
                <ShieldCheck size={15} strokeWidth={2.2} aria-hidden="true" />
                Privacy-checked repair workflow
              </span>
            </div>
          </section>

          <section className="faq-section brand-hub-section brand-hub-faq-section" aria-labelledby="apple-watch-faq-heading">
            <span className="repair-kicker">Common questions</span>
            <h2 id="apple-watch-faq-heading" className="faq-heading">Apple Watch repair FAQs</h2>
            <div className="faq-accordion">
              {[
                { question: "Do you offer same-day Apple Watch repairs?", answer: "We do not promise same-day completion. Timing depends on the exact model, condition, parts availability, and the repair queue." },
                { question: "Are you an Apple-authorised service provider?", answer: "No, we are an independent repair service provider offering high-quality repairs." },
                { question: "Will my Apple Watch remain water resistant?", answer: "Factory water resistance cannot be guaranteed after opening or repair. We may reseal where appropriate, but adhesive replacement does not restore guaranteed factory water-resistance certification." },
                { question: "Is an Apple Watch repair worth it?", answer: "That depends on the exact model, device condition, damage, repair quote, and replacement-device value. Once we confirm the exact model and fault, we can explain the practical repair path." }
              ].map((faq) => (
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

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel brand-hub-final-cta" aria-labelledby="apple-watch-final-cta-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Next step</span>
              <h2 id="apple-watch-final-cta-heading">Choose your model to see the right repair options</h2>
              <p>
                Start with the Apple Watch model selector above to check compatible repair paths, then book or call once you have the exact model.
              </p>
            </div>
            <div className="repair-hero-actions">
              <a href="#models-list" className="repair-primary-action">
                Choose Your Apple Watch Model
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </a>
              <Link href="/book-repair" className="repair-secondary-action">
                Book a Repair
              </Link>
            </div>
          </section>
        </>
      ) : isIPadHub ? (
        <>
          <section
            id="models-list"
            className="brand-hub-section brand-hub-models-section"
            aria-labelledby="ipad-model-finder-heading"
          >
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Model identification</span>
              <h2 id="ipad-model-finder-heading">Find your exact iPad model</h2>
              <p>
                Choose iPad, iPad Air, iPad Pro, iPad mini or use the A-number to confirm the exact model.
              </p>
            </div>
            <BrandHubModelSeriesBrowser
              brandSlug={brandSlug}
              categorySlug={categorySlug}
              seriesGroups={brandHubSeriesGroups}
            />
          </section>

          <HubRepairResultsSection
            category={categorySlug as RepairResultDeviceCategory}
            brand={brandSlug}
            scope="brand-hub"
            initialResults={serverRepairResults}
            showResultSummary
          />

          <section className="brand-hub-section" aria-labelledby="brand-repair-types-heading">
            <div className="brand-hub-section-header">
              <div>
                <span className="repair-kicker">Common services</span>
                <h2 id="brand-repair-types-heading">Common iPad Repair Paths</h2>
              </div>
              <p>Start with your exact iPad model, then choose the repair path that best matches the fault. Available screen, LCD, battery, charging, front camera and back camera options can vary by model, device condition and current parts availability.</p>
            </div>
            <div className="brand-hub-link-grid brand-hub-repair-link-grid">
              {IPAD_COMMON_REPAIR_LINKS.map((link) => (
                <Link key={link.label} href={link.href} prefetch={false} className="brand-hub-outline-link">
                  <strong>{link.label}</strong>
                </Link>
              ))}
              {IPAD_STATIC_REPAIR_OPTIONS.filter((option) => !option.hiddenBehindMore).map((option) => (
                <span key={option.label} className="brand-hub-outline-link brand-hub-outline-link-static">
                  <strong>{option.label}</strong>
                </span>
              ))}
            </div>
            <details className="ipad-common-repair-more">
              <summary className="brand-hub-show-more">More options</summary>
              <div className="brand-hub-link-grid brand-hub-repair-link-grid">
                {IPAD_STATIC_REPAIR_OPTIONS.filter((option) => option.hiddenBehindMore).map((option) => (
                  <span key={option.label} className="brand-hub-outline-link brand-hub-outline-link-static">
                    <strong>{option.label}</strong>
                  </span>
                ))}
              </div>
            </details>
          </section>

          <section className="brand-hub-section" aria-labelledby="ipad-common-problems-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">COMMON IPAD PROBLEMS</span>
              <h2 id="ipad-common-problems-heading">Common iPad problems we assess</h2>
            </div>
            <div className="repair-signal-grid">
              {IPAD_COMMON_PROBLEMS.map((problem, index) => (
                <article key={problem.title} className="repair-signal-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{problem.title}</h3>
                  <p>{problem.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel" aria-labelledby="ipad-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="ipad-diagnostic-heading">How iPad diagnosis, parts and quoting work</h2>
              <p>
                We confirm the exact iPad model and fault before discussing the suitable repair path. Pricing, Quote status, parts availability and practical timing are explained before any work is approved.
              </p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Confirm the model and fault</h3>
                  <p>We check the exact iPad model, the symptoms and the overall device condition. Similar symptoms can have different causes, and frame condition can affect the suitable repair path.</p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Review the quote and parts</h3>
                  <p>You will be shown the available repair option, price or Quote status before work begins. If a part needs to be ordered, expected availability and likely timing will be explained before approval.</p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>Repair, testing and collection</h3>
                  <p>After approval, the repair is completed and relevant functions are checked. We will let you know when the iPad is ready for collection and explain any important aftercare or warranty information.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="ipad-explore-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Explore more</span>
              <h2 id="ipad-explore-heading">Other tablet brands</h2>
              <p>
                Browse other supported tablet repair hubs if you are comparing repair options across devices.
              </p>
            </div>
            {otherTabletBrandLinks.length > 0 && (
              <BrandHubLinks links={otherTabletBrandLinks} initialVisibleCount={4} />
            )}
            <div className="brand-hub-subsection" aria-labelledby="ipad-other-repair-categories-heading">
              <h3 id="ipad-other-repair-categories-heading">Other repair categories</h3>
              <div className="brand-hub-link-grid brand-hub-category-link-grid">
                {BRAND_HUB_REPAIR_CATEGORY_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} prefetch={false} className="brand-hub-outline-link">
                    <strong>{link.label}</strong>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel" aria-labelledby="ipad-ringwood-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Ringwood service</span>
              <h2 id="ipad-ringwood-heading">iPad repair support at Ringwood Square</h2>
              <p>Ali Mobile &amp; Repair operates from Kiosk C1 at Ringwood Square Shopping Centre and supports iPad customers across Melbourne's eastern suburbs. Walk-ins are welcome, with free underground and outdoor parking available. You can call ahead to confirm parts availability or likely timing before travelling.</p>
              <p>Our team provides support in English, 中文, and 粤语.</p>
              <p>
                <Link href="/locations/ringwood" prefetch={false}>Ringwood store information and directions</Link>
              </p>
            </div>
            <div className="repair-chip-cloud" aria-label="iPad repair support actions">
              <span>
                <MapPin size={15} strokeWidth={2.2} aria-hidden="true" />
                Ringwood Square Kiosk C1
              </span>
              <span>
                <Clock3 size={15} strokeWidth={2.2} aria-hidden="true" />
                Clear quote before approval
              </span>
              <span>
                <ShieldCheck size={15} strokeWidth={2.2} aria-hidden="true" />
                Privacy-checked repair workflow
              </span>
            </div>
            <div className="repair-signal-grid mt-5">
              <article className="repair-signal-card">
                <span>01</span>
                <h3>Before you visit</h3>
                <ul>
                  <li>Choose or note the exact iPad model.</li>
                  <li>The model number beginning with A can help identify the version.</li>
                  <li>Back up important data when the iPad allows it.</li>
                  <li>Bring the relevant charging cable or adapter for intermittent faults.</li>
                  <li>Call ahead to confirm parts availability or likely timing.</li>
                </ul>
              </article>
              <article className="repair-signal-card">
                <span>02</span>
                <h3>Repair support and aftercare</h3>
                <div>
                  <p><strong>Six-month repair warranty</strong></p>
                  <p>iPad repairs include a six-month warranty, subject to the warranty conditions and exclusions explained with the repair.</p>
                  <p><strong>Data and functional testing</strong></p>
                  <p>Important data should be backed up where possible. After the repair, relevant functions are checked, but a data outcome cannot be guaranteed.</p>
                  <p><strong>Frame, adhesive and liquid limitations</strong></p>
                  <p>Replacement adhesive is applied where required during reassembly. A bent or damaged frame can affect fit and the repair result. Waterproof protection cannot be guaranteed, and the repaired iPad should be kept away from liquids.</p>
                </div>
              </article>
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="ipad-service-areas-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">LOCAL IPAD REPAIR SUPPORT</span>
              <h2 id="ipad-service-areas-heading">iPad repair for Ringwood and nearby suburbs</h2>
              <p>
                Our repair desk is located inside Ringwood Square Shopping Centre. Customers from nearby eastern suburbs can choose their exact iPad model online, then contact the store to confirm available repairs, parts and likely timing before travelling.
              </p>
            </div>
            <IPhoneServiceAreaLinks cards={ipadServiceAreas} />
          </section>

          <section className="faq-section brand-hub-section brand-hub-faq-section" aria-labelledby="ipad-faq-heading">
            <span className="repair-kicker">Common questions</span>
            <h2 id="ipad-faq-heading" className="faq-heading">iPad repair FAQs</h2>
            <div className="faq-accordion">
              {IPAD_FAQS.map((faq) => (
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

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel brand-hub-final-cta" aria-labelledby="ipad-final-cta-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Next step</span>
              <h2 id="ipad-final-cta-heading">Choose your model to see the right repair options</h2>
              <p>
                Start with the iPad model selector above to check compatible repair paths, then book or call once you have the exact model.
              </p>
            </div>
            <div className="repair-hero-actions">
              <a href="#models-list" className="repair-primary-action">
                Choose Your iPad Model
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </a>
              <Link href="/book-repair" className="repair-secondary-action">
                Book a Repair
              </Link>
            </div>
          </section>
        </>
      ) : isSamsungTabletHub || isLenovoTabletHub ? (
        <>
          <section
            id="models-list"
            className="brand-hub-section brand-hub-models-section"
            aria-labelledby="tablet-brand-models-heading"
          >
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Model identification</span>
              <h2 id="tablet-brand-models-heading">Choose your {brandName} tablet model</h2>
              <p>
                Select the exact {brandName} tablet model before checking compatible repair options, quote information and booking paths.
              </p>
            </div>
            <BrandHubModelSeriesBrowser
              brandSlug={brandSlug}
              categorySlug={categorySlug}
              seriesGroups={brandHubSeriesGroups}
            />
          </section>

          <HubRepairResultsSection
            category={categorySlug as RepairResultDeviceCategory}
            brand={brandSlug}
            scope="brand-hub"
          />

          <section className="brand-hub-section" aria-labelledby="tablet-brand-repair-types-heading">
            <div className="brand-hub-section-header">
              <div>
                <span className="repair-kicker">Common services</span>
                <h2 id="tablet-brand-repair-types-heading">All {brandName} Repair Types</h2>
              </div>
              <p>Choose your exact model first, then we show the right repair path, quote range, and booking options.</p>
            </div>
            <div className="repair-signal-grid">
              {REPAIR_TYPES.map((rt, index) => (
                <article key={rt.slug} className="repair-signal-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{rt.name}</h3>
                  <p>Model-specific quote</p>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel" aria-labelledby="tablet-brand-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="tablet-brand-diagnostic-heading">How {brandName} diagnosis, parts and timing work</h2>
              <p>
                We confirm the exact model first, then explain the compatible repair options and practical timing.
              </p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Model-specific diagnosis</h3>
                  <p>Compatible parts differ by model. The exact model matters before we confirm repair compatibility.</p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Parts and timing</h3>
                  <p>Repair timing depends on the exact model and parts availability. We confirm the timeline once diagnosis is complete.</p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>Quote before approval</h3>
                  <p>Choose your exact tablet model first so we can explain the practical quote path before any work is approved.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="tablet-brand-explore-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Explore more</span>
              <h2 id="tablet-brand-explore-heading">Other tablet brands</h2>
              <p>
                Browse other supported tablet repair hubs if you are comparing repair options across devices.
              </p>
            </div>
            {otherTabletBrandLinks.length > 0 && (
              <BrandHubLinks links={otherTabletBrandLinks} initialVisibleCount={4} />
            )}
            <div className="brand-hub-subsection" aria-labelledby="tablet-brand-other-repair-categories-heading">
              <h3 id="tablet-brand-other-repair-categories-heading">Other repair categories</h3>
              <div className="brand-hub-link-grid brand-hub-category-link-grid">
                {BRAND_HUB_REPAIR_CATEGORY_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} prefetch={false} className="brand-hub-outline-link">
                    <strong>{link.label}</strong>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel" aria-labelledby="tablet-brand-ringwood-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Ringwood service</span>
              <h2 id="tablet-brand-ringwood-heading">{brandName} repair support at Ringwood Square</h2>
              <p>
                Ali Mobile & Repair works from Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.
              </p>
            </div>
            <div className="repair-chip-cloud" aria-label={`${brandName} tablet repair support actions`}>
              <span>
                <MapPin size={15} strokeWidth={2.2} aria-hidden="true" />
                Ringwood Square Kiosk C1
              </span>
              <span>
                <Clock3 size={15} strokeWidth={2.2} aria-hidden="true" />
                Clear quote before approval
              </span>
              <span>
                <ShieldCheck size={15} strokeWidth={2.2} aria-hidden="true" />
                Model-specific repair path
              </span>
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel brand-hub-final-cta" aria-labelledby="tablet-brand-final-cta-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Next step</span>
              <h2 id="tablet-brand-final-cta-heading">Choose your model to see the right repair options</h2>
              <p>
                Start with the {brandName} tablet model selector above to check compatible repair paths, then book or call once you have the exact model.
              </p>
            </div>
            <div className="repair-hero-actions">
              <a href="#models-list" className="repair-primary-action">
                Choose Your {brandName} Model
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </a>
              <Link href="/book-repair" className="repair-secondary-action">
                Book a Repair
              </Link>
            </div>
          </section>
        </>
      ) : isPhoneHub ? (
        <>
          <section
            id="models-list"
            className={usesBrandHubDesign ? "brand-hub-section brand-hub-models-section" : undefined}
            aria-labelledby={usesBrandHubDesign ? "brand-models-heading" : undefined}
            aria-label={!usesBrandHubDesign ? `${brandName} models` : undefined}
          >
            {usesBrandHubDesign && (
              <div className="brand-hub-section-header">
                <span className="repair-kicker">Popular models</span>
                <h2 id="brand-models-heading">Choose your {brandName} model</h2>
                <p>
                  {isIPhoneHub
                    ? "We support a broad range of current and earlier iPhone models. Choose your exact model to check the repair options currently available."
                    : `Start with the exact ${brandName} model to view supported repair options, current pricing, and the right booking path.`}
                </p>
              </div>
            )}
            {usesBrandHubDesign && (brandSlug === "samsung" || brandSlug === "oppo") ? (
              <BrandHubModelSeriesBrowser
                brandSlug={brandSlug}
                categorySlug={categorySlug}
                seriesGroups={brandHubSeriesGroups}
              />
            ) : (
              <BrandModelSearch
                seriesGroups={usesFlatBrandHubModels ? flatModelGroup : seriesGroups}
                categorySlug={categorySlug}
                brandSlug={brandSlug}
              />
            )}
          </section>

          <HubRepairResultsSection
            category={categorySlug as RepairResultDeviceCategory}
            brand={brandSlug}
            scope="brand-hub"
            initialResults={serverRepairResults}
            showResultSummary={isEnhancedPhoneHub}
          />

          <section className={usesBrandHubDesign ? "brand-hub-section" : "repair-types-showcase"} aria-labelledby="brand-repair-types-heading">
            <div className={usesBrandHubDesign ? "brand-hub-section-header" : "repair-types-showcase-header"}>
              <div>
                <span className="repair-kicker repair-kicker-muted">Repair services</span>
                <h2 id="brand-repair-types-heading">{usesBrandHubDesign ? `Popular ${brandName} repair services` : `Common ${brandName} Repair Paths`}</h2>
              </div>
              <p>{phoneCommonRepairsIntro}</p>
            </div>
            <div className={usesBrandHubDesign ? "brand-hub-link-grid brand-hub-repair-link-grid" : "repair-type-card-grid"}>
              {usesBrandHubDesign ? (
                phoneRepairTypeLinks.map((link) => (
                  <Link key={link.href} href={link.href} prefetch={false} className="brand-hub-outline-link">
                    <strong>{link.label}</strong>
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/repairs/screen-replacement" prefetch={false} className="repair-type-mini-card">
                    <span>01</span>
                    <strong>Screen Replacement</strong>
                    <small>Cracked glass, display faults and touch issues</small>
                  </Link>
                  <Link href="/repairs/battery-replacement" prefetch={false} className="repair-type-mini-card">
                    <span>02</span>
                    <strong>Battery Replacement</strong>
                    <small>Fast drain, shutdowns, or swelling</small>
                  </Link>
                  <Link href="/repairs/charging-port-replacement" prefetch={false} className="repair-type-mini-card">
                    <span>03</span>
                    <strong>Charging Port Repair</strong>
                    <small>Not charging, debris cleaning, or cable fault</small>
                  </Link>
                  <Link href="/repairs/back-glass-replacement" prefetch={false} className="repair-type-mini-card">
                    <span>04</span>
                    <strong>Back Glass & Housing</strong>
                    <small>Rear cover or complete housing replacement</small>
                  </Link>
                </>
              )}
            </div>
          </section>

          {phoneCommonProblems && (
            <section className="brand-hub-section" aria-labelledby={phoneCommonProblems.headingId}>
              <div className="brand-hub-section-header">
                <span className="repair-kicker">{phoneCommonProblems.kicker}</span>
                <h2 id={phoneCommonProblems.headingId}>{phoneCommonProblems.heading}</h2>
              </div>
              <div className="repair-signal-grid">
                {phoneCommonProblems.items.map((problem, index) => (
                  <article key={problem.title} className="repair-signal-card">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{problem.title}</h3>
                    <p>{problem.body}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className={`repair-assist-panel${usesBrandHubDesign ? " brand-hub-section brand-hub-panel" : ""}`} aria-labelledby="phone-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="phone-diagnostic-heading">How {brandName} diagnosis, parts and timing work</h2>
              <p>
                {isIPhoneHub
                  ? "We confirm the exact iPhone model and fault before discussing the suitable repair path. Pricing, Quote status, parts availability and practical timing are explained before any work is approved."
                  : isSamsungPhoneHub
                  ? "We confirm the exact Samsung model and fault before discussing the suitable repair path. Pricing, Quote status, parts availability and practical timing are explained before any work is approved."
                  : isGooglePixelHub
                  ? "We confirm the exact Google Pixel model and fault before discussing the suitable repair path. Pricing, Quote status, parts availability and practical timing are explained before any work is approved."
                  : isOppoPhoneHub
                  ? "We confirm the exact OPPO model and fault before discussing the suitable repair path. Pricing, Quote status, parts availability and practical timing are explained before any work is approved."
                  : batchPhoneBrandConfig
                  ? batchPhoneBrandConfig.diagnosisIntro
                  : "We confirm the exact model first, then explain the compatible repair options and practical timing."}
              </p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>{isEnhancedPhoneHub ? "Confirm the model and fault" : "Model-specific diagnosis"}</h3>
                  <p>
                    {isIPhoneHub
                      ? "We check the exact iPhone model, the symptoms and the device condition. Similar symptoms can have different causes, so the recommended repair is based on the assessment rather than the symptom alone."
                      : isSamsungPhoneHub
                      ? "We check the exact Samsung model, the symptoms and the device condition. Similar symptoms can have different causes, so the recommended repair is based on the assessment rather than the symptom alone."
                      : isGooglePixelHub
                      ? "We check the exact Pixel model, the symptoms and the device condition. Similar symptoms can have different causes, so the recommended repair is based on the assessment rather than the symptom alone."
                      : isOppoPhoneHub
                      ? "We check the exact OPPO model, the symptoms and the device condition. Similar symptoms can have different causes, so the recommended repair is based on the assessment rather than the symptom alone."
                      : batchPhoneBrandConfig
                      ? batchPhoneBrandConfig.modelFaultCopy
                      : "Compatible parts differ by model. The exact model matters before we confirm repair compatibility."}
                  </p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>{isEnhancedPhoneHub ? "Review the quote and parts" : "Screen replacement timing"}</h3>
                  <p>
                    {isEnhancedPhoneHub
                      ? "You will be shown the available repair option, price or Quote status before work begins. If a part needs to be ordered, we will explain the expected availability and likely timing before you approve the repair."
                      : phoneContent?.timing.screen || 'Repair timing depends on the exact model and parts availability. We confirm the timeline once diagnosis is complete.'}
                  </p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>{isEnhancedPhoneHub ? "Repair, testing and collection" : "Battery replacement timing"}</h3>
                  <p>
                    {isEnhancedPhoneHub
                      ? "After approval, the repair is completed and relevant device functions are checked. We will let you know when the device is ready for collection and explain any important aftercare or warranty information."
                      : phoneContent?.timing.battery || 'Many common battery replacements can be completed quickly when the correct part is in stock.'}
                  </p>
                </article>
              </div>
            </div>
          </section>

          {usesBrandHubDesign && otherPhoneBrandLinks.length > 0 && (
            <section className="brand-hub-section" aria-labelledby="other-phone-brands-heading">
              <div className="brand-hub-section-header">
                <span className="repair-kicker">Explore more</span>
                <h2 id="other-phone-brands-heading">Other phone brands</h2>
                <p>
                  Browse other supported phone repair hubs if you are comparing repair options across devices.
                </p>
              </div>
              <BrandHubLinks links={otherPhoneBrandLinks} initialVisibleCount={4} />
              <div className="brand-hub-subsection" aria-labelledby="other-repair-categories-heading">
                <h3 id="other-repair-categories-heading">Other repair categories</h3>
                <div className="brand-hub-link-grid brand-hub-category-link-grid">
                  {BRAND_HUB_REPAIR_CATEGORY_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} prefetch={false} className="brand-hub-outline-link">
                      <strong>{link.label}</strong>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className={`repair-assist-panel${usesBrandHubDesign ? " brand-hub-section brand-hub-panel brand-hub-centered-panel" : ""}`} aria-labelledby="phone-ringwood-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Ringwood service</span>
              <h2 id="phone-ringwood-heading">{brandName} repair support at Ringwood Square</h2>
              {isEnhancedPhoneHub ? (
                <>
                  <p>Ali Mobile & Repair operates from Kiosk C1 at Ringwood Square Shopping Centre and supports customers across Melbourne's eastern suburbs. Walk-ins are welcome, with free underground and outdoor parking available. You can call ahead to confirm parts or likely timing before travelling.</p>
                  <p>Our team provides support in English, 中文, and 粤语.</p>
                  <p>
                    <Link href="/locations/ringwood" prefetch={false}>Ringwood store information and directions</Link>
                  </p>
                </>
              ) : (
                <p>Ali Mobile & Repair works from Ringwood Square Shopping Centre Kiosk C1. Walk-ins are welcome, and we offer free underground and outdoor parking. Our team provides English, 中文, and 粤语 support. Call 0481 058 514 to confirm parts or timing before travelling.</p>
              )}
            </div>
            <div className="repair-chip-cloud" aria-label="Phone repair support actions">
              <span><MapPin size={15} strokeWidth={2.2} aria-hidden="true" /> Ringwood Square Kiosk C1</span>
              <span><Clock3 size={15} strokeWidth={2.2} aria-hidden="true" /> Walk-ins welcome</span>
              <span><ShieldCheck size={15} strokeWidth={2.2} aria-hidden="true" /> Clear quote before approval</span>
            </div>
            {isEnhancedPhoneHub && (
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Before you visit</h3>
                  <ul>
                    <li>{isSamsungPhoneHub ? "Choose or note your exact Samsung model where possible." : isGooglePixelHub ? "Choose or note your exact Google Pixel model where possible." : isOppoPhoneHub ? "Choose or note your exact OPPO model where possible." : batchPhoneBrandConfig ? `Choose or note your exact ${batchPhoneBrandConfig.displayName} model where possible.` : "Choose or note your exact iPhone model where possible."}</li>
                    <li>Back up important data before hardware service when the device allows it.</li>
                    <li>Bring the charging cable or accessory involved if the fault is intermittent.</li>
                    <li>Call ahead when you want to confirm parts availability or likely timing before travelling.</li>
                  </ul>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Repair support and aftercare</h3>
                  <div>
                    <p><strong>Six-month phone repair warranty</strong></p>
                    <p>Phone repairs include a six-month warranty, subject to the warranty conditions and exclusions explained with the repair.</p>
                    <p><strong>Data and functional testing</strong></p>
                    <p>Important data should be backed up where possible. After the repair, the relevant device functions are checked, but a data outcome cannot be guaranteed.</p>
                    <p><strong>Resealing after repair</strong></p>
                    <p>
                      {isSamsungPhoneHub || isGooglePixelHub || isOppoPhoneHub || batchPhoneBrandConfig
                        ? "New sealing adhesive is applied during reassembly where the device design permits it, providing some protection against everyday splashes. The original factory water-resistance rating cannot be guaranteed, and the repaired phone should not be submerged or intentionally used in water."
                        : "New sealing adhesive is applied during reassembly to provide some protection against everyday splashes. The original factory water-resistance rating cannot be guaranteed, and the repaired iPhone should not be submerged or intentionally used in water."}
                    </p>
                  </div>
                </article>
              </div>
            )}
          </section>

          {isIPhoneHub && (
            <section className="brand-hub-section" aria-labelledby="iphone-service-areas-heading">
              <div className="brand-hub-section-header">
                <span className="repair-kicker">LOCAL IPHONE REPAIR SUPPORT</span>
                <h2 id="iphone-service-areas-heading">iPhone repair for Ringwood and nearby suburbs</h2>
                <p>
                  Our repair desk is located inside Ringwood Square Shopping Centre. Customers from nearby eastern suburbs can choose their exact iPhone model online, then contact the store to confirm available repairs, parts and likely timing before travelling.
                </p>
              </div>
              <IPhoneServiceAreaLinks cards={iphoneServiceAreas} />
            </section>
          )}

          {isSamsungPhoneHub && (
            <section className="brand-hub-section" aria-labelledby="samsung-service-areas-heading">
              <div className="brand-hub-section-header">
                <span className="repair-kicker">LOCAL SAMSUNG REPAIR SUPPORT</span>
                <h2 id="samsung-service-areas-heading">Samsung phone repair for Ringwood and nearby suburbs</h2>
                <p>
                  Our repair desk is located inside Ringwood Square Shopping Centre. Customers from nearby eastern suburbs can choose their exact Samsung Galaxy model online, then contact the store to confirm repair options, parts and likely timing before travelling.
                </p>
              </div>
              <IPhoneServiceAreaLinks cards={samsungServiceAreas} />
            </section>
          )}

          {isGooglePixelHub && (
            <section className="brand-hub-section" aria-labelledby="google-pixel-service-areas-heading">
              <div className="brand-hub-section-header">
                <span className="repair-kicker">LOCAL GOOGLE PIXEL REPAIR SUPPORT</span>
                <h2 id="google-pixel-service-areas-heading">Google Pixel repair for Ringwood and nearby suburbs</h2>
                <p>
                  Our repair desk is located inside Ringwood Square Shopping Centre. Customers from nearby eastern suburbs can choose their exact Google Pixel model online, then contact the store to confirm repair options, parts and likely timing before travelling.
                </p>
              </div>
              <IPhoneServiceAreaLinks cards={googlePixelServiceAreas} />
            </section>
          )}

          {isOppoPhoneHub && (
            <section className="brand-hub-section" aria-labelledby="oppo-service-areas-heading">
              <div className="brand-hub-section-header">
                <span className="repair-kicker">LOCAL OPPO REPAIR SUPPORT</span>
                <h2 id="oppo-service-areas-heading">OPPO phone repair for Ringwood and nearby suburbs</h2>
                <p>
                  Our repair desk is located inside Ringwood Square Shopping Centre. Customers from nearby eastern suburbs can choose their exact OPPO model online, then contact the store to confirm repair options, parts and likely timing before travelling.
                </p>
              </div>
              <IPhoneServiceAreaLinks cards={oppoServiceAreas} />
            </section>
          )}

          {batchPhoneBrandConfig && (
            <section className="brand-hub-section" aria-labelledby={`${brandSlug}-service-areas-heading`}>
              <div className="brand-hub-section-header">
                <span className="repair-kicker">LOCAL {batchPhoneBrandConfig.displayName.toUpperCase()} REPAIR SUPPORT</span>
                <h2 id={`${brandSlug}-service-areas-heading`}>{batchPhoneBrandConfig.displayName} phone repair for Ringwood and nearby suburbs</h2>
                <p>
                  Our repair desk is located inside Ringwood Square Shopping Centre. Customers from nearby eastern suburbs can choose their exact {batchPhoneBrandConfig.displayName} model online, then contact the store to confirm repair options, parts and likely timing before travelling.
                </p>
              </div>
              <IPhoneServiceAreaLinks cards={batchPhoneServiceAreas} />
            </section>
          )}

          <section className={`faq-section${usesBrandHubDesign ? " brand-hub-section brand-hub-faq-section" : ""}`} aria-labelledby="phone-faq-heading">
            {usesBrandHubDesign && <span className="repair-kicker">Common questions</span>}
            <h2 id="phone-faq-heading" className="faq-heading">{brandName} repair FAQs</h2>
            <div className="faq-accordion">
              {phoneContent?.faqs.map((faq) => (
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

          <section className={`repair-assist-panel${usesBrandHubDesign ? " brand-hub-section brand-hub-panel brand-hub-centered-panel brand-hub-final-cta" : ""}`} aria-labelledby="phone-final-cta-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Next step</span>
              <h2 id="phone-final-cta-heading">Choose your model to see the right repair options</h2>
              <p>
                {isIPhoneHub
                  ? "Choose your iPhone model to see the repair options available for your device, then book online or contact the Ringwood repair desk for the next step."
                  : <>Start with the {brandName} model selector above to check compatible repair paths, then book or call once you have the exact model.</>}
              </p>
            </div>
            <div className="repair-hero-actions">
              <a href="#models-list" className="repair-primary-action">
                Choose Your {brandName} Model
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </a>
              <Link href="/book-repair" className="repair-secondary-action">
                Book a Repair
              </Link>
            </div>
          </section>
        </>
      ) : (
        <>
          <section id="models-list" className="repair-content-band" aria-label={`${brandName} models`}>
            <BrandModelSearch
              seriesGroups={seriesGroups}
              categorySlug={categorySlug}
              brandSlug={brandSlug}
            />
          </section>

          <HubRepairResultsSection
            category={categorySlug as RepairResultDeviceCategory}
            brand={brandSlug}
            scope="brand-hub"
          />

          <section className="repair-types-showcase" aria-labelledby="brand-repair-types-heading">
            <div className="repair-types-showcase-header">
              <div>
                <span className="repair-kicker repair-kicker-muted">Common services</span>
                <h2 id="brand-repair-types-heading">All {brandName} Repair Types</h2>
              </div>
              <p>Choose your exact model first, then we show the right repair path, quote range, and booking options.</p>
            </div>
            <div className="repair-type-card-grid">
              {REPAIR_TYPES.map((rt, index) => (
                <article key={rt.slug} className="repair-type-mini-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{rt.name}</strong>
                  <small>Model-specific quote</small>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
      <FloatingJumpCTA targetId="models-list" label={floatingJumpLabel} />
    </main>
  );
}
