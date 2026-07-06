import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPhoneBrandHubContent, getPhoneBrandRepairKeyword } from "@/lib/phone-brand-hubs";
import { REPAIR_TYPES } from "@/data/seo-data";
import { LAPTOP_BRAND_STARTING_PRICES, WATCH_BRAND_STARTING_PRICES } from "@/lib/repairStartingPrices";
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

export const revalidate = 86400;
export const dynamicParams = true; // Allow on-demand generation of new brand pages

interface BrandPageProps {
  params: Promise<{ category: string; brand: string }>;
}

function buildFaqPageSchema(faqs?: Array<{ question: string; answer: string }> | null) {
  const mainEntity = (faqs ?? [])
    .filter((faq) => faq.question.trim() && faq.answer.trim())
    .map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    }));

  if (!mainEntity.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
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

const APPLE_WATCH_COMMON_REPAIR_PATHS: Array<{ href?: string; name: string; note: string }> = [
  {
    href: "/repairs/screen-replacement",
    name: "Apple Watch screen repair",
    note: "Cracked glass, display faults and touch issues need the exact Series, SE or Ultra model and case size before the repair path is confirmed.",
  },
  {
    href: "/repairs/battery-replacement",
    name: "Apple Watch battery replacement",
    note: "Short runtime, shutdowns and battery wear are checked against the compatible model-specific battery option.",
  },
  {
    name: "Charging / power assessment",
    note: "If the Apple Watch is not charging or not turning on, we inspect the fault first before confirming the practical quote path.",
  },
  {
    name: "Touch or display assessment",
    note: "Failed touch, black screens, display lines and flickering can have different causes, so the watch is assessed before parts are ordered.",
  },
  {
    name: "Water damage assessment",
    note: "Water exposure symptoms need diagnosis first. We explain the likely risks and do not guarantee recovery before assessment.",
  },
  {
    name: "Logic board assessment",
    note: "Power, charging, pairing and board-related symptoms are handled as assessment and quote work before any repair is approved.",
  },
];

const APPLE_WATCH_COMMON_PROBLEMS = [
  {
    title: "Cracked glass or damaged display",
    body: "Cracked Apple Watch glass, a damaged display or lifted screen can require different parts depending on the Series, SE or Ultra model and case size.",
  },
  {
    title: "Touch not responding",
    body: "Touch faults may come from the display assembly, connection issues or other internal faults, so the watch should be assessed before a repair path is confirmed.",
  },
  {
    title: "Battery draining quickly",
    body: "Short runtime, shutdowns or battery health warnings should be checked against the exact model before battery replacement is quoted.",
  },
  {
    title: "Not charging or not powering on",
    body: "Charging and no-power symptoms can come from the cable, charger, battery, internal connection or board fault. Diagnosis comes before parts ordering.",
  },
  {
    title: "Display lines or black screen",
    body: "Lines, flickering or a black screen can have different repair paths across Apple Watch generations and case sizes.",
  },
  {
    title: "Speaker, microphone or button issues",
    body: "Audio, microphone, Digital Crown or side-button symptoms need model-specific diagnosis before a practical quote can be confirmed.",
  },
  {
    title: "Water exposure symptoms",
    body: "Water exposure can affect multiple internal areas. Assessment is required first, and recovery cannot be guaranteed before inspection.",
  },
  {
    title: "Series, SE and Ultra differences",
    body: "Parts can vary by series, case size, GPS or cellular version, SE design and Ultra design, so exact model identification matters.",
  },
];

const APPLE_WATCH_FAQS = [
  {
    question: "Do you repair Apple Watches in Ringwood?",
    answer: "Yes. Ali Mobile & Repair can assess supported Apple Watch repairs at Ringwood Square Shopping Centre. Choose the exact Apple Watch model first so the practical repair path can be checked.",
  },
  {
    question: "How much does Apple Watch repair cost?",
    answer: "Price depends on the exact Apple Watch model, fault, repair type, parts availability and device condition. The final quote is confirmed after the model and repair option are checked.",
  },
  {
    question: "How long does Apple Watch repair take?",
    answer: "Timing depends on the exact model, fault, repair queue and part availability. If the required part is not in stock, we usually need 1-2 days to order parts.",
  },
  {
    question: "What if the Apple Watch part is not in stock?",
    answer: "We explain the quote status and ordering path before work is approved. Parts availability can vary by series, size, GPS or cellular version, SE design and Ultra design.",
  },
  {
    question: "Do Apple Watch repairs include warranty?",
    answer: "Supported Apple Watch repairs include a 6-month repair warranty, subject to warranty conditions and exclusions explained with the repair.",
  },
  {
    question: "Can you replace a cracked Apple Watch screen?",
    answer: "We can assess cracked glass, damaged displays, display lines and touch faults. The repair option depends on the exact Apple Watch model, case size and current part availability.",
  },
  {
    question: "Can you replace an Apple Watch battery?",
    answer: "Supported Apple Watch battery replacements are quoted after the exact model and battery symptoms are checked.",
  },
  {
    question: "Can you fix an Apple Watch that is not charging?",
    answer: "We assess charging and no-power symptoms first because the issue may involve the charger, battery, internal connection or board fault rather than a single part.",
  },
  {
    question: "Do you repair Apple Watch Series, SE and Ultra models?",
    answer: "We support selected Apple Watch Series, SE and Ultra models where compatible parts and repair paths are available. Use the model finder to choose the exact watch before checking options.",
  },
  {
    question: "Do you repair water damaged Apple Watches?",
    answer: "Water exposure requires diagnosis before repair options, risks and likely outcomes can be discussed. Recovery cannot be guaranteed, and water resistance is not guaranteed after opening or repair.",
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

const SAMSUNG_TABLET_COMMON_REPAIR_LINKS = [
  {
    href: "/repairs/screen-replacement",
    label: "Samsung tablet screen repair options",
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

const SAMSUNG_TABLET_COMMON_PROBLEMS = [
  {
    title: "Screen, glass and touch problems",
    body: "Cracked glass, display lines, black screen, flickering or failed touch can come from different Samsung Galaxy Tab faults. The exact Tab S, Tab A, Tab Active or model code should be confirmed before selecting a repair path.",
  },
  {
    title: "Battery drain, shutdown and swelling",
    body: "Fast battery drain, unexpected shutdowns, heat or a lifting back cover can require battery and device-condition assessment before parts and timing are confirmed.",
  },
  {
    title: "Charging and USB-C port problems",
    body: "Intermittent charging may involve debris, cable condition, battery health, the USB-C port or another internal fault. We check the charging path before recommending a port repair.",
  },
  {
    title: "Back cover, frame or button damage",
    body: "Back-cover lift, frame damage or button faults can affect fit, sealing and repair outcome. The tablet should be assessed before a quote is approved.",
  },
  {
    title: "Camera, speaker or microphone faults",
    body: "Video call, speaker, microphone or camera symptoms may come from the affected part, connector damage or a broader device fault.",
  },
  {
    title: "Liquid exposure or no-power faults",
    body: "Liquid exposure and no-power faults need inspection before repair options, data risk and likely outcomes can be discussed. A successful repair cannot be guaranteed before diagnosis.",
  },
];

const SAMSUNG_TABLET_FAQS = [
  {
    question: "Which Samsung tablet models do you repair?",
    answer: "We support selected Galaxy Tab S, Galaxy Tab A, Galaxy Tab Active and other Samsung tablet models where compatible parts and repair paths are available. Use the model browser above to choose the exact Samsung tablet before checking repair options.",
  },
  {
    question: "How can I identify my Samsung tablet model?",
    answer: "Check Settings -> About tablet for the model name or model number where the tablet still works. If the tablet does not power on, bring it to Ringwood Square and we can help identify the model before quoting.",
  },
  {
    question: "How much does Samsung tablet repair cost?",
    answer: "Price depends on the exact Samsung tablet model, fault, parts availability and device condition. Choose your model first to view available price or Quote status.",
  },
  {
    question: "How long can a Samsung tablet repair take?",
    answer: "Timing depends on the model, repair type, stock availability and repair queue. If a Samsung tablet part needs to be ordered, availability and likely timing are explained before approval.",
  },
  {
    question: "Can you replace a Samsung tablet charging port?",
    answer: "Charging faults are checked first because symptoms can also involve debris, cables, battery condition or board-level faults. If the charging port is the practical repair path, we explain the quote before work begins.",
  },
  {
    question: "Will my data normally be affected by Samsung tablet repair?",
    answer: "Hardware repairs do not normally require access to personal content, but important data should be backed up where possible because a data outcome cannot be guaranteed.",
  },
  {
    question: "What warranty applies to Samsung tablet repair?",
    answer: "Eligible Samsung tablet repairs include a six-month repair warranty, subject to the warranty conditions and exclusions explained with the repair.",
  },
  {
    question: "What happens if the Samsung tablet part is not in stock?",
    answer: "We explain the available repair option, Quote status and expected ordering path before work is approved.",
  },
  {
    question: "Is it better to repair or replace a Samsung tablet?",
    answer: "That depends on the model, fault, condition, repair quote, parts availability and replacement-device value. Once the model and fault are confirmed, we can explain the practical repair path.",
  },
  {
    question: "Can water resistance be guaranteed after Samsung tablet repair?",
    answer: "No. Waterproof protection cannot be guaranteed after opening or repair, and the repaired tablet should be kept away from liquids.",
  },
];

const LENOVO_TABLET_COMMON_REPAIR_LINKS = [
  {
    href: "/repairs/screen-replacement",
    label: "Lenovo tablet screen repair options",
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

const LENOVO_TABLET_COMMON_PROBLEMS = [
  {
    title: "Screen, glass and touch problems",
    body: "Cracked glass, display lines, black screen, flickering or touch that stops responding can come from different Lenovo tablet faults. The exact Tab, Yoga Tab or model code should be confirmed before selecting a repair path.",
  },
  {
    title: "Battery drain, shutdown and swelling",
    body: "Fast battery drain, unexpected shutdowns, heat or casing lift can require battery and device-condition assessment before parts and timing are confirmed.",
  },
  {
    title: "Charging and USB-C port problems",
    body: "Intermittent charging may involve debris, cable condition, battery health, the USB-C port or another internal fault. We check the charging path before recommending a port repair.",
  },
  {
    title: "Bent frame, casing or button damage",
    body: "Frame and casing condition can affect screen fit, adhesive hold and the final repair result. The tablet should be assessed before a quote is approved.",
  },
  {
    title: "Camera, speaker or microphone faults",
    body: "Video call, speaker, microphone or camera symptoms may come from the affected part, connector damage or a broader device fault.",
  },
  {
    title: "Liquid exposure or no-power faults",
    body: "Liquid exposure and no-power faults need inspection before repair options, data risk and likely outcomes can be discussed. A successful repair cannot be guaranteed before diagnosis.",
  },
];

const LENOVO_TABLET_FAQS = [
  {
    question: "Which Lenovo tablet models do you repair?",
    answer: "We support selected Lenovo Tab, Lenovo Tab M, Lenovo Tab P and Yoga Tab models where compatible parts and repair paths are available. Use the model browser above to choose the exact Lenovo tablet before checking repair options.",
  },
  {
    question: "How can I identify my Lenovo tablet model?",
    answer: "Check Settings for the model name or model number where the tablet still works. If the tablet does not power on, bring it to Ringwood Square and we can help identify the model before quoting.",
  },
  {
    question: "How much does Lenovo tablet repair cost?",
    answer: "Price depends on the exact Lenovo tablet model, fault, parts availability and device condition. Choose your model first to view available price or Quote status.",
  },
  {
    question: "How long can a Lenovo tablet repair take?",
    answer: "Timing depends on the model, repair type, stock availability and repair queue. If a Lenovo tablet part needs to be ordered, availability and likely timing are explained before approval.",
  },
  {
    question: "Can you replace a Lenovo tablet charging port?",
    answer: "Charging faults are checked first because symptoms can also involve debris, cables, battery condition or board-level faults. If the charging port is the practical repair path, we explain the quote before work begins.",
  },
  {
    question: "Will my data normally be affected by Lenovo tablet repair?",
    answer: "Hardware repairs do not normally require access to personal content, but important data should be backed up where possible because a data outcome cannot be guaranteed.",
  },
  {
    question: "What warranty applies to Lenovo tablet repair?",
    answer: "Eligible Lenovo tablet repairs include a six-month repair warranty, subject to the warranty conditions and exclusions explained with the repair.",
  },
  {
    question: "What happens if the Lenovo tablet part is not in stock?",
    answer: "We explain the available repair option, Quote status and expected ordering path before work is approved.",
  },
  {
    question: "Is it better to repair or replace a Lenovo tablet?",
    answer: "That depends on the model, fault, condition, repair quote, parts availability and replacement-device value. Once the model and fault are confirmed, we can explain the practical repair path.",
  },
  {
    question: "Can water resistance be guaranteed after Lenovo tablet repair?",
    answer: "No. Waterproof protection cannot be guaranteed after opening or repair, and the repaired tablet should be kept away from liquids.",
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

function getSamsungTabletServiceAreaDescription(areaName: string, index: number) {
  const descriptions = [
    `${areaName} customers can choose their exact Samsung tablet model before visiting our Ringwood Square repair desk.`,
    `Travelling from ${areaName}? Check Samsung tablet screen, battery and charging options by model, then call ahead about parts availability.`,
    `Customers near ${areaName} can use the Galaxy Tab model selector first, then visit Kiosk C1 for assessment and confirmed quote details.`,
    `${areaName} customers can review Samsung tablet repair paths online before contacting the Ringwood Square team for the next step.`,
    `Before travelling from ${areaName}, choose the exact Samsung tablet model and contact the store if you want likely timing checked first.`,
    `${areaName} customers can compare Samsung tablet repair options online, then visit Ringwood Square for model-specific assessment.`,
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

function getLenovoTabletServiceAreaDescription(areaName: string, index: number) {
  const descriptions = [
    `${areaName} customers can choose their exact Lenovo tablet model before visiting our Ringwood Square repair desk.`,
    `Travelling from ${areaName}? Check Lenovo tablet screen, battery and charging options by model, then call ahead about parts availability.`,
    `Customers near ${areaName} can use the Lenovo tablet model selector first, then visit Kiosk C1 for assessment and confirmed quote details.`,
    `${areaName} customers can review Lenovo tablet repair paths online before contacting the Ringwood Square team for the next step.`,
    `Before travelling from ${areaName}, choose the exact Lenovo tablet model and contact the store if you want likely timing checked first.`,
    `${areaName} customers can compare Lenovo tablet repair options online, then visit Ringwood Square for model-specific assessment.`,
  ];

  return descriptions[index % descriptions.length];
}

function getMacBookServiceAreaDescription(areaName: string, index: number) {
  const descriptions = [
    `${areaName} customers can choose their exact MacBook model before visiting our Ringwood Square repair desk.`,
    `Travelling from ${areaName}? Check MacBook screen repair, battery replacement and charging options by model, then call ahead about parts availability.`,
    `Customers near ${areaName} can use the MacBook model selector first, then visit Kiosk C1 for assessment and confirmed quote details.`,
    `Before travelling from ${areaName}, choose the exact MacBook Air or MacBook Pro model and contact the store if you want likely timing checked first.`,
  ];

  return descriptions[index % descriptions.length];
}

function getAppleWatchServiceAreaDescription(areaName: string, index: number) {
  const descriptions = [
    `${areaName} customers can choose their exact Apple Watch model before visiting our Ringwood Square repair desk.`,
    `Travelling from ${areaName}? Check Apple Watch screen repair, battery replacement and charging assessment options by model, then call ahead about parts availability.`,
    `Customers near ${areaName} can use the Apple Watch model finder first, then visit Kiosk C1 for assessment and confirmed quote details.`,
    `Before travelling from ${areaName}, choose the exact Apple Watch Series, SE or Ultra model and contact the store if you want likely timing checked first.`,
  ];

  return descriptions[index % descriptions.length];
}

const MAJOR_PHONE_BRAND_HUB_SLUGS = ["iphone", "samsung", "oppo", "google-pixel"];
const PRIORITY_PHONE_BRAND_HUB_SLUGS = new Set(["iphone", "samsung", "google-pixel", "oppo"]);
const HIGH_VALUE_PHONE_REPAIR_SHORTCUTS = [
  { slug: "screen-replacement", label: "screen repair", detail: "Cracked glass, display lines, black screens and touch faults." },
  { slug: "battery-replacement", label: "battery replacement", detail: "Fast drain, shutdowns, swelling and battery-health symptoms." },
  { slug: "charging-port-replacement", label: "charging repair", detail: "Intermittent charging, cable fit, debris checks and port faults." },
  { slug: "back-glass-replacement", label: "back glass repair", detail: "Rear glass, back-cover or housing damage where supported." },
];
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

function getLowestStartingPrice(prices: Partial<Record<string, number>>): number | null {
  const validPrices = Object.values(prices).filter((price): price is number => typeof price === "number" && Number.isFinite(price) && price > 0);
  return validPrices.length > 0 ? Math.min(...validPrices) : null;
}

function formatStartingRepairPrice(price: number): string {
  return new Intl.NumberFormat('en-AU', {
    maximumFractionDigits: 0,
  }).format(price);
}

function buildModelUrl(categorySlug: string, brandSlug: string, modelSlug: string) {
  return `/repairs/${safeSlugSegment(categorySlug)}/${safeSlugSegment(brandSlug)}/${safeSlugSegment(modelSlug)}`;
}

function buildRepairUrl(categorySlug: string, brandSlug: string, modelSlug: string, repairSlug: string) {
  return `${buildModelUrl(categorySlug, brandSlug, modelSlug)}/${safeSlugSegment(repairSlug)}`;
}

function buildExactPhoneRepairShortcuts(categorySlug: string, brandSlug: string, models: ModelEntry[]) {
  const shortcuts: Array<{ href: string; label: string; description: string }> = [];

  for (const model of smartSortModels(models).slice(0, 6)) {
    for (const repair of HIGH_VALUE_PHONE_REPAIR_SHORTCUTS) {
      if (!model.repairTypes.some((option) => option.slug === repair.slug)) continue;
      shortcuts.push({
        href: buildRepairUrl(categorySlug, brandSlug, model.slug, repair.slug),
        label: `${model.model} ${repair.label}`,
        description: repair.detail,
      });
      if (shortcuts.length >= 8) return shortcuts;
    }
  }

  return shortcuts;
}

function buildPhoneDiagnosticSteps(brandName: string, brandSlug: string) {
  const modelLabel =
    brandSlug === "iphone"
      ? "iPhone"
      : brandSlug === "samsung"
      ? "Samsung Galaxy"
      : brandSlug === "google-pixel"
      ? "Google Pixel"
      : brandSlug === "oppo"
      ? "OPPO"
      : brandName;

  return [
    {
      title: "Confirm exact model and condition",
      body: `We confirm the exact ${modelLabel} model, storage or variant where relevant, visible damage, frame condition and whether the phone powers on before quoting.`,
    },
    {
      title: "Check the symptom path",
      body: "Screen, touch, battery, charging, camera, speaker, button, no-power and liquid-exposure symptoms are checked before a single part is recommended.",
    },
    {
      title: "Match compatible parts",
      body: "Parts and repair paths can differ by model generation. We check compatibility, current stock and whether ordering is needed before work begins.",
    },
    {
      title: "Explain quote, timing and risk",
      body: "You see the available repair option, price or Quote status, practical timing and any data, frame, liquid exposure or aftercare limitations before approval.",
    },
    {
      title: "Complete approved repair",
      body: "The technician completes only the approved repair path once the correct part, device condition and quote have been confirmed.",
    },
    {
      title: "Test functions and aftercare",
      body: "Relevant functions are checked after repair where the device condition allows, then warranty conditions and safe aftercare are explained at collection.",
    },
  ];
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
    return "Ali Mobile & Repair provides Apple Watch repair in Ringwood at Ringwood Square Shopping Centre. Choose your exact Series, SE or Ultra model to check Apple Watch screen repair, battery replacement, charging issue assessment and quote options before work begins.";
  }

  if (categorySlug === "tablet" && brandSlug === "ipad") {
    return "Choose your exact iPad model to view available screen, LCD, battery, charging, front camera and back camera repair options. Our Ringwood Square repair desk supports customers across Melbourne's eastern suburbs, with quotes and parts availability confirmed before work begins.";
  }

  if (categorySlug === "tablet" && brandSlug === "samsung") {
    return "Choose your exact Samsung tablet model to view available screen, battery and charging repair options. Our Ringwood Square repair desk supports Galaxy Tab S, Tab A and Tab Active customers across Melbourne's eastern suburbs, with quotes and parts availability confirmed before work begins.";
  }

  if (categorySlug === "tablet" && brandSlug === "lenovo") {
    return "Choose your exact Lenovo tablet model to view available screen, battery and charging repair options. Our Ringwood Square repair desk supports Lenovo Tab, Tab M, Tab P and Yoga Tab customers across Melbourne's eastern suburbs, with quotes and parts availability confirmed before work begins.";
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
    title = 'Lenovo Tablet Repair | Screen, Battery & Charging | Ali Mobile';
    description = "Lenovo Tablet repair at Ringwood Square for Melbourne's eastern suburbs. Choose your Lenovo Tab, Tab M, Tab P or Yoga Tab model for screen, battery and charging options.";
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
  const isPriorityPhoneHub = categorySlug === "phone" && PRIORITY_PHONE_BRAND_HUB_SLUGS.has(brandSlug);
  const phoneHubDisplayName = isSamsungPhoneHub ? "Samsung Galaxy" : isOppoPhoneHub ? "OPPO" : brandName;
  const batchPhoneBrandConfig = getBatchPhoneBrandConfig(categorySlug, brandSlug);
  const isEnhancedPhoneHub = isIPhoneHub || isSamsungPhoneHub || isGooglePixelHub || isOppoPhoneHub || Boolean(batchPhoneBrandConfig);
  const usesBrandHubDesign = isPhoneHub || isTabletBrandHub || isAppleWatchHub || isMacBookHub;
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
      : categorySlug === "tablet" && brandSlug === "lenovo"
      ? "Choose Your Lenovo Tablet"
      : categorySlug === "laptop" && brandSlug === "macbook"
      ? "Choose Your MacBook"
      : categorySlug === "watch" && ["apple", "apple-watch"].includes(brandSlug)
      ? "Choose Your Apple Watch"
      : "Choose Your Model";
  const phoneContent = isPhoneHub ? getPhoneBrandHubContent(brandSlug, brandName) : null;
  const phoneFaqPageSchema = buildFaqPageSchema(phoneContent?.faqs);
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
  const startingRepairPrice = isPhoneHub ? getStartingRepairPrice(models) : null;
  const sortedModels = smartSortModels(models);
  const flatModelGroup = [{ series: `${brandName} Models`, models: sortedModels }];
  const seriesGroups = isMacBookHub ? buildMacBookFamilyGroups(models) : flatModelGroup;
  const brandHubSeriesGroups = usesBrandHubDesign ? buildBrandHubSeriesGroups(categorySlug, brandSlug, models) : [];
  const phoneServiceAreaSource = isEnhancedPhoneHub ? buildFeaturedServiceAreaSource() : [];
  const ipadServiceAreas: IPhoneServiceAreaLinkCard[] = isIPadHub
    ? buildFeaturedServiceAreaSource().map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getIPadServiceAreaDescription(area.name, index),
      }))
    : [];
  const samsungTabletServiceAreas: IPhoneServiceAreaLinkCard[] = isSamsungTabletHub
    ? buildFeaturedServiceAreaSource().map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getSamsungTabletServiceAreaDescription(area.name, index),
      }))
    : [];
  const lenovoTabletServiceAreas: IPhoneServiceAreaLinkCard[] = isLenovoTabletHub
    ? buildFeaturedServiceAreaSource().map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getLenovoTabletServiceAreaDescription(area.name, index),
      }))
    : [];
  const macbookServiceAreas: IPhoneServiceAreaLinkCard[] = isMacBookHub
    ? buildFeaturedServiceAreaSource().slice(0, 4).map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getMacBookServiceAreaDescription(area.name, index),
      }))
    : [];
  const appleWatchServiceAreas: IPhoneServiceAreaLinkCard[] = isAppleWatchHub
    ? buildFeaturedServiceAreaSource().slice(0, 4).map((area, index) => ({
        href: `/locations/${area.slug}`,
        name: area.name,
        description: getAppleWatchServiceAreaDescription(area.name, index),
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
    : isSamsungTabletHub
    ? { category: "tablet", brand: "samsung" }
    : isLenovoTabletHub
    ? { category: "tablet", brand: "lenovo" }
    : isMacBookHub
    ? { category: "laptop", brand: "macbook" }
    : isAppleWatchHub
    ? { category: "watch", brand: "apple" }
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
        heading: "Common Samsung Galaxy problems we assess",
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
  const exactPhoneRepairShortcuts = isPriorityPhoneHub
    ? buildExactPhoneRepairShortcuts(categorySlug, brandSlug, models)
    : [];
  const phoneDiagnosticSteps = isPriorityPhoneHub ? buildPhoneDiagnosticSteps(brandName, brandSlug) : [];
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
  const macbookRepairPaths: Array<{ href?: string; name: string; note: string }> = [
    {
      href: "/repairs/screen-replacement",
      name: "MacBook screen repair",
      note: "Cracked panels, display lines, image faults and lid assembly options matched to the exact MacBook model.",
    },
    {
      href: "/repairs/battery-replacement",
      name: "Battery replacement",
      note: "Battery wear, short runtime, shutdowns and charging drop-off checked against the correct MacBook generation.",
    },
    {
      name: "Keyboard / top case assessment",
      note: "Keyboard repair options can depend on top case design, model year and part availability before a quote is confirmed.",
    },
    {
      href: "/repairs/charging-port-replacement",
      name: "Charging port / USB-C repair",
      note: "USB-C, MagSafe and power-delivery faults are assessed after confirming the model and likely repair path.",
    },
    {
      name: "Trackpad / flex cable assessment",
      note: "Trackpad, click, pointer or flex-related symptoms are checked as model-specific assessment work.",
    },
    {
      name: "Water damage assessment",
      note: "Liquid exposure and no-power faults require inspection before practical options, risks and quote limits are discussed.",
    },
    {
      name: "Logic board assessment",
      note: "Startup, charging, fan, overheating and board-related symptoms are diagnosed before any repair path is approved.",
    },
  ];
  const macbookCommonProblems = [
    {
      title: "Cracked screen or display lines",
      body: "A cracked display, coloured lines, black screen or backlight fault can require different parts depending on the exact MacBook Air or MacBook Pro model.",
    },
    {
      title: "Battery not holding charge",
      body: "Short runtime, shutdowns, charging drop-off or battery service warnings should be checked against the model year and battery option before quote approval.",
    },
    {
      title: "Keyboard keys not responding",
      body: "Sticky, failed or repeating keys may involve keyboard or top case assessment. The available path depends on the model, part option and device condition.",
    },
    {
      title: "USB-C or charging faults",
      body: "Intermittent charging, no charging or MagSafe and USB-C symptoms can come from the port, cable, battery or board, so diagnosis comes before parts ordering.",
    },
    {
      title: "Trackpad and flex symptoms",
      body: "Click, cursor, flex cable or input faults can look similar from the outside. We check the model-specific path before recommending repair work.",
    },
    {
      title: "Liquid, no power or startup issues",
      body: "Liquid exposure, no-power faults, fan noise, heat or startup loops need assessment before likely outcomes and repair limits can be discussed.",
    },
  ];
  const macbookFaqs = [
    {
      question: "Do I need the exact MacBook model before repair?",
      answer:
        "Yes. MacBook repair compatibility, quote accuracy and parts selection depend on the exact model, year, screen size, chip generation and A-number.",
    },
    {
      question: "Do you repair MacBook Air and MacBook Pro models?",
      answer:
        "We list supported MacBook Air and MacBook Pro models in the model finder. Choose the exact model first so the available screen, battery, keyboard, charging or diagnostic path can be checked.",
    },
    {
      question: "Can you repair a cracked MacBook screen?",
      answer:
        "We can assess cracked MacBook screens, display lines and black-screen faults. The repair option and quote depend on the exact model and current part availability.",
    },
    {
      question: "Can you replace a MacBook battery?",
      answer:
        "Supported MacBook battery replacements are quoted after the model and battery condition are checked. Availability and timing can vary between MacBook generations.",
    },
    {
      question: "Can you quote a MacBook keyboard repair immediately?",
      answer:
        "We can explain the likely repair path, but the exact quote usually needs model confirmation because keyboard work can involve top case parts and model-specific availability.",
    },
    {
      question: "Do MacBook parts need to be ordered?",
      answer:
        "Many MacBook repairs depend on the exact model and part availability. If the required part is not in stock, we usually need one to two days to order parts before completing the repair.",
    },
    {
      question: "Can you fix MacBook charging port or USB-C problems?",
      answer:
        "We assess charging, USB-C, MagSafe and power-delivery symptoms first because the issue may involve the cable, battery, port or board rather than the port alone.",
    },
    {
      question: "Can you assess liquid damage or no-power MacBook faults?",
      answer:
        "Yes, but liquid exposure and no-power faults require diagnosis before repair options, data risk and likely outcomes can be discussed. A successful repair cannot be guaranteed before assessment.",
    },
    {
      question: "Is the MacBook repair covered by warranty?",
      answer:
        "Supported MacBook repairs include a 6-month repair warranty, subject to the warranty conditions and exclusions explained with the repair.",
    },
    {
      question: "What if my MacBook model is not listed yet?",
      answer:
        "If your MacBook is not shown in the selector, contact Ali Mobile & Repair before you travel so we can check the model, likely repair path and parts availability.",
    },
    {
      question: "Where is Ali Mobile & Repair for MacBook repair?",
      answer:
        "Visit Ali Mobile & Repair at Ringwood Square Shopping Centre, Kiosk C1, Seymour Street, Ringwood VIC 3134. Walk-ins are welcome, and calling ahead helps confirm parts and timing.",
    },
  ];
  const macbookStartingRepairPrice = isMacBookHub ? getLowestStartingPrice(LAPTOP_BRAND_STARTING_PRICES.macbook) : null;
  const macbookHeroInsightCards = isMacBookHub
    ? [
        {
          title: macbookStartingRepairPrice
            ? `MacBook Repairs from $${formatStartingRepairPrice(macbookStartingRepairPrice)}`
            : "MacBook Repair Quote First",
          body: "We check the exact MacBook model, fault and part option before confirming the repair quote.",
        },
        {
          title: "6-Month Repair Warranty",
          body: "Supported MacBook repairs include a 6-month repair warranty, subject to warranty conditions and exclusions explained with the repair.",
        },
        {
          title: "Parts Checked Before Repair",
          body: "Many MacBook repairs depend on the exact model and part availability. If the required part is not in stock, we usually need 1-2 days to order parts before completing the repair.",
        },
      ]
    : [];
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
  const lenovoTabletHeroInsightCards = isLenovoTabletHub
    ? [
        {
          title: "Lenovo Tablet Repairs from $50",
          body: "Selected Lenovo tablet repair services start from $50. Choose your exact model to view current repair options and pricing.",
        },
        {
          title: "6-Month Repair Warranty",
          body: "Eligible Lenovo tablet repairs include a six-month warranty, subject to the warranty conditions and exclusions explained with the repair.",
        },
        {
          title: "Timing Depends on Parts Availability",
          body: "Many common Lenovo tablet repairs can be completed the same day when parts are available. Less common parts usually take around 1-2 days to arrive.",
        },
      ]
    : [];
  const samsungTabletHeroInsightCards = isSamsungTabletHub
    ? [
        {
          title: "Samsung Tablet Repairs from $50",
          body: "Selected Samsung tablet repair services start from $50. Choose your exact model to view current repair options and pricing.",
        },
        {
          title: "6-Month Repair Warranty",
          body: "Eligible Samsung tablet repairs include a six-month warranty, subject to the warranty conditions and exclusions explained with the repair.",
        },
        {
          title: "Around 45 Minutes Once Parts Are In Stock",
          body: "Many Samsung tablet repairs can take around 45 minutes once the required part is in stock. If the required part is not in stock, parts usually need 1-2 days to order.",
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
  const appleWatchStartingRepairPrice = isAppleWatchHub ? getLowestStartingPrice(WATCH_BRAND_STARTING_PRICES.apple) : null;
  const appleWatchHeroInsightCards = isAppleWatchHub
    ? [
        {
          title: appleWatchStartingRepairPrice
            ? `Apple Watch Repairs from $${formatStartingRepairPrice(appleWatchStartingRepairPrice)}`
            : "Apple Watch Repair Quote First",
          body: "We check the exact Apple Watch model, fault and part option before confirming the repair quote.",
        },
        {
          title: "6-Month Repair Warranty",
          body: "Supported Apple Watch repairs include a 6-month repair warranty, subject to warranty conditions and exclusions explained with the repair.",
        },
        {
          title: "Parts Checked Before Repair",
          body: "Apple Watch repair timing depends on the exact model, fault and part availability. If the required part is not in stock, we usually need 1-2 days to order parts.",
        },
      ]
    : [];
  const canonicalUrl = `https://www.alimobile.com.au/repairs/${safeSlugSegment(categorySlug)}/${safeSlugSegment(brandSlug)}`;
  const serviceSchemaAreaSource = buildFeaturedServiceAreaSource().slice(0, 6);
  const brandHubServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonicalUrl}#service`,
    name: `${brandHubHeading} at Ali Mobile & Repair`,
    serviceType: brandHubHeading,
    url: canonicalUrl,
    description: isMacBookHub
      ? "MacBook repair support at Ringwood Square Shopping Centre, with model confirmation, quote approval and parts availability checked before work begins."
      : brandHubHeroDescription,
    provider: {
      "@type": "LocalBusiness",
      name: "Ali Mobile & Repair",
      url: "https://www.alimobile.com.au/",
      telephone: "0481 058 514",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Ringwood Square Shopping Centre, Kiosk C1, Seymour Street",
        addressLocality: "Ringwood",
        addressRegion: "VIC",
        postalCode: "3134",
        addressCountry: "AU",
      },
    },
    areaServed: serviceSchemaAreaSource.map((area) => ({
      "@type": "Place",
      name: `${area.name}, VIC`,
    })),
    ...(isPhoneHub
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `${phoneHubDisplayName} repair services`,
            itemListElement: phoneRepairTypeLinks.map((link, index) => ({
              "@type": "Offer",
              position: index + 1,
              itemOffered: {
                "@type": "Service",
                name: link.label,
                url: `https://www.alimobile.com.au${link.href}`,
              },
            })),
          },
        }
      : {}),
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(brandHubServiceSchema)
        }}
      />
      {phoneFaqPageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(phoneFaqPageSchema)
          }}
        />
      )}

      <section
        className="repair-tech-hero repair-tech-hero-compact"
        aria-labelledby="brand-repair-heading"
      >
        <div className="repair-tech-hero-copy">
          <BackButton fallbackHref={`/repairs/${categorySlug}`} />
          <span className="repair-hero-badge">
            <Smartphone size={16} strokeWidth={2.4} aria-hidden="true" />
            {isMacBookHub ? "MacBook Model Hub" : isAppleWatchHub ? "Apple Watch Model Hub" : isIPadHub ? "iPad Model Hub" : isSamsungTabletHub ? "Samsung Tablet Model Hub" : isLenovoTabletHub ? "Lenovo Tablet Model Hub" : `${brandName} Model Hub`}
          </span>
          <h1 id="category-repair-heading">
            {isMacBookHub
              ? "MacBook Repair in Ringwood"
              : brandHubHeading}
          </h1>
          <p>
            {isMacBookHub
              ? "Ali Mobile & Repair provides MacBook repair in Ringwood at Ringwood Square Shopping Centre. Choose your exact MacBook Air or MacBook Pro model to check screen repair, battery replacement, keyboard or top case, charging port and USB-C assessment options before we confirm the quote and parts path."
              : brandHubHeroDescription}
          </p>
          <div className="repair-hero-actions">
            <a href="#models-list" className="repair-primary-action">
              {isIPhoneHub ? "Choose your iPhone model" : isMacBookHub ? "Choose your MacBook model" : isSamsungTabletHub ? "Choose your Samsung tablet model" : isLenovoTabletHub ? "Choose your Lenovo tablet model" : "View model option"}
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
        {isMacBookHub && (
          <div className="repair-hero-brand-proof" aria-label="MacBook repair pricing, warranty and parts highlights">
            {macbookHeroInsightCards.map((card) => (
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
        {isSamsungTabletHub && (
          <div className="repair-hero-brand-proof" aria-label="Samsung tablet model selection support">
            {samsungTabletHeroInsightCards.map((card) => (
              <article key={card.title} className="repair-hero-brand-proof-card">
                <h2>{card.title}</h2>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        )}
        {isLenovoTabletHub && (
          <div className="repair-hero-brand-proof" aria-label="Lenovo tablet model selection support">
            {lenovoTabletHeroInsightCards.map((card) => (
              <article key={card.title} className="repair-hero-brand-proof-card">
                <h2>{card.title}</h2>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        )}
        {isTabletBrandHub && !isIPadHub && !isSamsungTabletHub && !isLenovoTabletHub && (
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
            initialResults={serverRepairResults}
            showResultSummary
          />

          <section className="brand-hub-section" aria-labelledby="brand-repair-types-heading">
            <div className="brand-hub-section-header">
              <div>
                <span className="repair-kicker">Common services</span>
                <h2 id="brand-repair-types-heading">Common MacBook repair paths</h2>
              </div>
              <p>
                Choose your exact MacBook model first, then compare the repair path that best matches the fault we need to assess.
              </p>
            </div>
            <div className="repair-signal-grid">
              {macbookRepairPaths.map((path, index) => (
                path.href ? (
                  <Link key={path.name} href={path.href} prefetch={false} className="repair-signal-card">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{path.name}</h3>
                    <p>{path.note}</p>
                  </Link>
                ) : (
                  <article key={path.name} className="repair-signal-card">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{path.name}</h3>
                    <p>{path.note}</p>
                  </article>
                )
              ))}
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="macbook-common-problems-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Common MacBook problems</span>
              <h2 id="macbook-common-problems-heading">MacBook problems we assess</h2>
              <p>
                Similar MacBook symptoms can have different causes, so the exact model and device condition guide the repair recommendation.
              </p>
            </div>
            <div className="repair-signal-grid">
              {macbookCommonProblems.map((problem, index) => (
                <article key={problem.title} className="repair-signal-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{problem.title}</h3>
                  <p>{problem.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel" aria-labelledby="macbook-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="macbook-diagnostic-heading">How MacBook diagnosis, parts and quoting work</h2>
              <p>
                We confirm the exact model and fault first, then explain the compatible repair options, parts availability and practical quote path before any work is approved.
              </p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Confirm exact model</h3>
                  <p>We check the MacBook model, year, screen size, chip generation and A-number before confirming compatibility.</p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Confirm the fault</h3>
                  <p>Screen, battery, keyboard, USB-C, liquid and no-power symptoms are assessed before a repair path is recommended.</p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>Check part availability</h3>
                  <p>Parts vary by model year and design. If the required part is not in stock, we usually need 1-2 days to order it.</p>
                </article>
                <article className="repair-signal-card">
                  <span>04</span>
                  <h3>Approve quote first</h3>
                  <p>We explain quote status, parts path, timing and warranty conditions before repair work begins.</p>
                </article>
                <article className="repair-signal-card">
                  <span>05</span>
                  <h3>Complete repair when ready</h3>
                  <p>Once the correct part and repair path are confirmed, the technician completes the agreed work.</p>
                </article>
                <article className="repair-signal-card">
                  <span>06</span>
                  <h3>Test key functions</h3>
                  <p>We test charging, keyboard, trackpad, display, speakers, camera and basic functions where the repair path allows.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel" aria-labelledby="macbook-ringwood-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Ringwood service</span>
              <h2 id="macbook-ringwood-heading">MacBook repair support at Ringwood Square</h2>
              <p>
                Ali Mobile &amp; Repair works from Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134. Walk-ins are welcome, and calling ahead helps confirm MacBook parts and likely timing before you travel.
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
                English, 中文 and 粤语 support
              </span>
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="macbook-service-area-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Nearby support</span>
              <h2 id="macbook-service-area-heading">MacBook repair support near Ringwood</h2>
              <p>
                Choose the exact MacBook model first, then contact or visit our Ringwood Square repair desk to confirm the quote and parts path.
              </p>
            </div>
            <IPhoneServiceAreaLinks cards={macbookServiceAreas} />
          </section>

          <section className="brand-hub-section" aria-labelledby="macbook-explore-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Explore more</span>
              <h2 id="macbook-explore-heading">Other repair categories</h2>
              <p>
                Browse other supported repair categories if you are comparing repair options across devices.
              </p>
            </div>
            <div className="brand-hub-link-grid brand-hub-category-link-grid">
              {BRAND_HUB_REPAIR_CATEGORY_LINKS.map((link) => (
                <Link key={link.href} href={link.href} prefetch={false} className="brand-hub-outline-link">
                  <strong>{link.label}</strong>
                </Link>
              ))}
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
            initialResults={serverRepairResults}
            showResultSummary
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
              {APPLE_WATCH_COMMON_REPAIR_PATHS.map((path, index) => (
                path.href ? (
                  <Link key={path.name} href={path.href} prefetch={false} className="repair-signal-card">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{path.name}</h3>
                    <p>{path.note}</p>
                  </Link>
                ) : (
                  <article key={path.name} className="repair-signal-card">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{path.name}</h3>
                    <p>{path.note}</p>
                  </article>
                )
              ))}
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="apple-watch-common-problems-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Common Apple Watch problems</span>
              <h2 id="apple-watch-common-problems-heading">Apple Watch problems we assess</h2>
              <p>
                Similar Apple Watch symptoms can have different causes, so the exact model, case size and condition guide the repair recommendation.
              </p>
            </div>
            <div className="repair-signal-grid">
              {APPLE_WATCH_COMMON_PROBLEMS.map((problem, index) => (
                <article key={problem.title} className="repair-signal-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{problem.title}</h3>
                  <p>{problem.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel" aria-labelledby="apple-watch-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="apple-watch-diagnostic-heading">How Apple Watch diagnosis, parts and quoting work</h2>
              <p>
                We confirm the exact model, case size and condition first, then explain the compatible repair options, parts availability and practical quote path before any work is approved.
              </p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Check exact model and size</h3>
                  <p>Parts can vary by series, case size, GPS or cellular version, SE design and Ultra design.</p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Confirm the fault</h3>
                  <p>We assess screen, battery, touch, charging, power and water exposure symptoms before recommending a repair option.</p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>Check quote and parts</h3>
                  <p>We confirm the practical quote path and whether the required part is available before work begins.</p>
                </article>
                <article className="repair-signal-card">
                  <span>04</span>
                  <h3>Order parts if needed</h3>
                  <p>If the required part is not in stock, we usually need 1-2 days to order parts before completing the repair.</p>
                </article>
                <article className="repair-signal-card">
                  <span>05</span>
                  <h3>Complete approved repair</h3>
                  <p>Once the correct part and repair path are confirmed, the technician completes the agreed work.</p>
                </article>
                <article className="repair-signal-card">
                  <span>06</span>
                  <h3>Test key functions</h3>
                  <p>We test display, touch, charging, pairing and basic functions where the repair path allows.</p>
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
                Ali Mobile &amp; Repair works from Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134. Walk-ins are welcome, and calling ahead helps confirm Apple Watch parts and likely timing before you travel.
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
                English, 中文 and 粤语 support
              </span>
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="apple-watch-service-area-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Nearby support</span>
              <h2 id="apple-watch-service-area-heading">Apple Watch repair support near Ringwood</h2>
              <p>
                Choose the exact Apple Watch model first, then contact or visit our Ringwood Square repair desk to confirm the quote and parts path.
              </p>
            </div>
            <IPhoneServiceAreaLinks cards={appleWatchServiceAreas} />
          </section>

          <section className="faq-section brand-hub-section brand-hub-faq-section" aria-labelledby="apple-watch-faq-heading">
            <span className="repair-kicker">Common questions</span>
            <h2 id="apple-watch-faq-heading" className="faq-heading">Apple Watch repair FAQs</h2>
            <div className="faq-accordion">
              {APPLE_WATCH_FAQS.map((faq) => (
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
      ) : isSamsungTabletHub ? (
        <>
          <section
            id="models-list"
            className="brand-hub-section brand-hub-models-section"
            aria-labelledby="samsung-tablet-model-finder-heading"
          >
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Model identification</span>
              <h2 id="samsung-tablet-model-finder-heading">Find your exact Samsung tablet model</h2>
              <p>
                Choose Galaxy Tab S, Galaxy Tab A, Galaxy Tab Active or use the model name to confirm the exact tablet before checking compatible repair options.
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

          <section className="brand-hub-section" aria-labelledby="samsung-tablet-repair-types-heading">
            <div className="brand-hub-section-header">
              <div>
                <span className="repair-kicker">Common services</span>
                <h2 id="samsung-tablet-repair-types-heading">Common Samsung Tablet Repair Paths</h2>
              </div>
              <p>Start with your exact Samsung tablet model, then choose the repair path that best matches the fault. Available screen, battery and charging options can vary by model, device condition and current parts availability.</p>
            </div>
            <div className="brand-hub-link-grid brand-hub-repair-link-grid">
              {SAMSUNG_TABLET_COMMON_REPAIR_LINKS.map((link) => (
                <Link key={link.label} href={link.href} prefetch={false} className="brand-hub-outline-link">
                  <strong>{link.label}</strong>
                </Link>
              ))}
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="samsung-tablet-common-problems-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">COMMON SAMSUNG TABLET PROBLEMS</span>
              <h2 id="samsung-tablet-common-problems-heading">Common Samsung tablet problems we assess</h2>
            </div>
            <div className="repair-signal-grid">
              {SAMSUNG_TABLET_COMMON_PROBLEMS.map((problem, index) => (
                <article key={problem.title} className="repair-signal-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{problem.title}</h3>
                  <p>{problem.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel" aria-labelledby="samsung-tablet-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="samsung-tablet-diagnostic-heading">How Samsung tablet diagnosis, parts and quoting work</h2>
              <p>
                We confirm the exact Samsung tablet model and fault before discussing the suitable repair path. Pricing, Quote status, parts availability and practical timing are explained before any work is approved.
              </p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Confirm the model and fault</h3>
                  <p>We check the Galaxy Tab family, model name, symptoms and overall device condition. Similar symptoms can have different causes, so diagnosis comes before parts approval.</p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Review the quote and parts</h3>
                  <p>You will be shown the available repair option, price or Quote status before work begins. If a Samsung tablet part needs to be ordered, expected availability and likely timing will be explained before approval.</p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>Repair, testing and collection</h3>
                  <p>After approval, the repair is completed and relevant functions are checked. We will let you know when the Samsung tablet is ready for collection and explain any important aftercare or warranty information.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="samsung-tablet-explore-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Explore more</span>
              <h2 id="samsung-tablet-explore-heading">Other tablet brands</h2>
              <p>
                Browse other supported tablet repair hubs if you are comparing repair options across devices.
              </p>
            </div>
            {otherTabletBrandLinks.length > 0 && (
              <BrandHubLinks links={otherTabletBrandLinks} initialVisibleCount={4} />
            )}
            <div className="brand-hub-subsection" aria-labelledby="samsung-tablet-other-repair-categories-heading">
              <h3 id="samsung-tablet-other-repair-categories-heading">Other repair categories</h3>
              <div className="brand-hub-link-grid brand-hub-category-link-grid">
                {BRAND_HUB_REPAIR_CATEGORY_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} prefetch={false} className="brand-hub-outline-link">
                    <strong>{link.label}</strong>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel" aria-labelledby="samsung-tablet-ringwood-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Ringwood service</span>
              <h2 id="samsung-tablet-ringwood-heading">Samsung tablet repair support at Ringwood Square</h2>
              <p>Ali Mobile &amp; Repair operates from Kiosk C1 at Ringwood Square Shopping Centre and supports Samsung tablet customers across Melbourne's eastern suburbs. Walk-ins are welcome, with free underground and outdoor parking available. You can call ahead to confirm parts availability or likely timing before travelling.</p>
              <p>Our team provides support in English, 中文, and 粤语.</p>
              <p>
                <Link href="/locations/ringwood" prefetch={false}>Ringwood store information and directions</Link>
              </p>
            </div>
            <div className="repair-chip-cloud" aria-label="Samsung tablet repair support actions">
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
            <div className="repair-signal-grid mt-5">
              <article className="repair-signal-card">
                <span>01</span>
                <h3>Before you visit</h3>
                <ul>
                  <li>Choose or note the exact Samsung tablet model.</li>
                  <li>Bring the charger and cable for charging or battery symptoms.</li>
                  <li>Back up important data when the tablet allows it.</li>
                  <li>Call ahead to confirm parts availability or likely timing.</li>
                </ul>
              </article>
              <article className="repair-signal-card">
                <span>02</span>
                <h3>Repair support and aftercare</h3>
                <div>
                  <p><strong>Six-month repair warranty</strong></p>
                  <p>Eligible Samsung tablet repairs include a six-month warranty, subject to the warranty conditions and exclusions explained with the repair.</p>
                  <p><strong>Data and functional testing</strong></p>
                  <p>Important data should be backed up where possible. After the repair, relevant functions are checked, but a data outcome cannot be guaranteed.</p>
                  <p><strong>Frame, adhesive and liquid limitations</strong></p>
                  <p>Replacement adhesive is applied where required during reassembly. Frame or back-cover damage can affect fit and repair result. Waterproof protection cannot be guaranteed, and the repaired tablet should be kept away from liquids.</p>
                </div>
              </article>
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="samsung-tablet-service-areas-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">LOCAL SAMSUNG TABLET REPAIR SUPPORT</span>
              <h2 id="samsung-tablet-service-areas-heading">Samsung tablet repair for Ringwood and nearby suburbs</h2>
              <p>
                Our repair desk is located inside Ringwood Square Shopping Centre. Customers from nearby eastern suburbs can choose their exact Samsung tablet model online, then contact the store to confirm available repairs, parts and likely timing before travelling.
              </p>
            </div>
            <IPhoneServiceAreaLinks cards={samsungTabletServiceAreas} />
          </section>

          <section className="faq-section brand-hub-section brand-hub-faq-section" aria-labelledby="samsung-tablet-faq-heading">
            <span className="repair-kicker">Common questions</span>
            <h2 id="samsung-tablet-faq-heading" className="faq-heading">Samsung tablet repair FAQs</h2>
            <div className="faq-accordion">
              {SAMSUNG_TABLET_FAQS.map((faq) => (
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

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel brand-hub-final-cta" aria-labelledby="samsung-tablet-final-cta-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Next step</span>
              <h2 id="samsung-tablet-final-cta-heading">Choose your model to see the right repair options</h2>
              <p>
                Start with the Samsung tablet model selector above to check compatible repair paths, then book or call once you have the exact model.
              </p>
            </div>
            <div className="repair-hero-actions">
              <a href="#models-list" className="repair-primary-action">
                Choose Your Samsung Tablet Model
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </a>
              <Link href="/book-repair" className="repair-secondary-action">
                Book a Repair
              </Link>
            </div>
          </section>
        </>
      ) : isLenovoTabletHub ? (
        <>
          <section
            id="models-list"
            className="brand-hub-section brand-hub-models-section"
            aria-labelledby="lenovo-tablet-model-finder-heading"
          >
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Model identification</span>
              <h2 id="lenovo-tablet-model-finder-heading">Find your exact Lenovo tablet model</h2>
              <p>
                Choose Lenovo Tab, Tab M, Tab P, Yoga Tab or use the model name to confirm the exact tablet before checking compatible repair options.
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

          <section className="brand-hub-section" aria-labelledby="lenovo-tablet-repair-types-heading">
            <div className="brand-hub-section-header">
              <div>
                <span className="repair-kicker">Common services</span>
                <h2 id="lenovo-tablet-repair-types-heading">Common Lenovo Tablet Repair Paths</h2>
              </div>
              <p>Start with your exact Lenovo tablet model, then choose the repair path that best matches the fault. Available screen, battery and charging options can vary by model, device condition and current parts availability.</p>
            </div>
            <div className="brand-hub-link-grid brand-hub-repair-link-grid">
              {LENOVO_TABLET_COMMON_REPAIR_LINKS.map((link) => (
                <Link key={link.label} href={link.href} prefetch={false} className="brand-hub-outline-link">
                  <strong>{link.label}</strong>
                </Link>
              ))}
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="lenovo-tablet-common-problems-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">COMMON LENOVO TABLET PROBLEMS</span>
              <h2 id="lenovo-tablet-common-problems-heading">Common Lenovo tablet problems we assess</h2>
            </div>
            <div className="repair-signal-grid">
              {LENOVO_TABLET_COMMON_PROBLEMS.map((problem, index) => (
                <article key={problem.title} className="repair-signal-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{problem.title}</h3>
                  <p>{problem.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel" aria-labelledby="lenovo-tablet-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="lenovo-tablet-diagnostic-heading">How Lenovo tablet diagnosis, parts and quoting work</h2>
              <p>
                We confirm the exact Lenovo tablet model and fault before discussing the suitable repair path. Pricing, Quote status, parts availability and practical timing are explained before any work is approved.
              </p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Confirm the model and fault</h3>
                  <p>We check the Lenovo tablet family, model name, symptoms and overall device condition. Similar symptoms can have different causes, so diagnosis comes before parts approval.</p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Review the quote and parts</h3>
                  <p>You will be shown the available repair option, price or Quote status before work begins. If a Lenovo tablet part needs to be ordered, expected availability and likely timing will be explained before approval.</p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>Repair, testing and collection</h3>
                  <p>After approval, the repair is completed and relevant functions are checked. We will let you know when the Lenovo tablet is ready for collection and explain any important aftercare or warranty information.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="lenovo-tablet-explore-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">Explore more</span>
              <h2 id="lenovo-tablet-explore-heading">Other tablet brands</h2>
              <p>
                Browse other supported tablet repair hubs if you are comparing repair options across devices.
              </p>
            </div>
            {otherTabletBrandLinks.length > 0 && (
              <BrandHubLinks links={otherTabletBrandLinks} initialVisibleCount={4} />
            )}
            <div className="brand-hub-subsection" aria-labelledby="lenovo-tablet-other-repair-categories-heading">
              <h3 id="lenovo-tablet-other-repair-categories-heading">Other repair categories</h3>
              <div className="brand-hub-link-grid brand-hub-category-link-grid">
                {BRAND_HUB_REPAIR_CATEGORY_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} prefetch={false} className="brand-hub-outline-link">
                    <strong>{link.label}</strong>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel" aria-labelledby="lenovo-tablet-ringwood-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Ringwood service</span>
              <h2 id="lenovo-tablet-ringwood-heading">Lenovo tablet repair support at Ringwood Square</h2>
              <p>Ali Mobile &amp; Repair operates from Kiosk C1 at Ringwood Square Shopping Centre and supports Lenovo tablet customers across Melbourne's eastern suburbs. Walk-ins are welcome, with free underground and outdoor parking available. You can call ahead to confirm parts availability or likely timing before travelling.</p>
              <p>Our team provides support in English, 中文, and 粤语.</p>
              <p>
                <Link href="/locations/ringwood" prefetch={false}>Ringwood store information and directions</Link>
              </p>
            </div>
            <div className="repair-chip-cloud" aria-label="Lenovo tablet repair support actions">
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
            <div className="repair-signal-grid mt-5">
              <article className="repair-signal-card">
                <span>01</span>
                <h3>Before you visit</h3>
                <ul>
                  <li>Choose or note the exact Lenovo tablet model.</li>
                  <li>Bring the charger and cable for charging or battery symptoms.</li>
                  <li>Back up important data when the tablet allows it.</li>
                  <li>Call ahead to confirm parts availability or likely timing.</li>
                </ul>
              </article>
              <article className="repair-signal-card">
                <span>02</span>
                <h3>Repair support and aftercare</h3>
                <div>
                  <p><strong>Six-month repair warranty</strong></p>
                  <p>Eligible Lenovo tablet repairs include a six-month warranty, subject to the warranty conditions and exclusions explained with the repair.</p>
                  <p><strong>Data and functional testing</strong></p>
                  <p>Important data should be backed up where possible. After the repair, relevant functions are checked, but a data outcome cannot be guaranteed.</p>
                  <p><strong>Frame, adhesive and liquid limitations</strong></p>
                  <p>Replacement adhesive is applied where required during reassembly. Frame or casing damage can affect fit and repair result. Waterproof protection cannot be guaranteed, and the repaired tablet should be kept away from liquids.</p>
                </div>
              </article>
            </div>
          </section>

          <section className="brand-hub-section" aria-labelledby="lenovo-tablet-service-areas-heading">
            <div className="brand-hub-section-header">
              <span className="repair-kicker">LOCAL LENOVO TABLET REPAIR SUPPORT</span>
              <h2 id="lenovo-tablet-service-areas-heading">Lenovo tablet repair for Ringwood and nearby suburbs</h2>
              <p>
                Our repair desk is located inside Ringwood Square Shopping Centre. Customers from nearby eastern suburbs can choose their exact Lenovo tablet model online, then contact the store to confirm available repairs, parts and likely timing before travelling.
              </p>
            </div>
            <IPhoneServiceAreaLinks cards={lenovoTabletServiceAreas} />
          </section>

          <section className="faq-section brand-hub-section brand-hub-faq-section" aria-labelledby="lenovo-tablet-faq-heading">
            <span className="repair-kicker">Common questions</span>
            <h2 id="lenovo-tablet-faq-heading" className="faq-heading">Lenovo tablet repair FAQs</h2>
            <div className="faq-accordion">
              {LENOVO_TABLET_FAQS.map((faq) => (
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

          <section className="repair-assist-panel brand-hub-section brand-hub-panel brand-hub-centered-panel brand-hub-final-cta" aria-labelledby="lenovo-tablet-final-cta-heading">
            <div className="w-full max-w-2xl">
              <span className="repair-kicker repair-kicker-muted">Next step</span>
              <h2 id="lenovo-tablet-final-cta-heading">Choose your model to see the right repair options</h2>
              <p>
                Start with the Lenovo tablet model selector above to check compatible repair paths, then book or call once you have the exact model.
              </p>
            </div>
            <div className="repair-hero-actions">
              <a href="#models-list" className="repair-primary-action">
                Choose Your Lenovo Tablet Model
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </a>
              <Link href="/book-repair" className="repair-secondary-action">
                Book a Repair
              </Link>
            </div>
          </section>
        </>
      ) : isSamsungTabletHub ? (
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
                <span className="repair-kicker">Browse all models</span>
                <h2 id="brand-models-heading">Find your {phoneHubDisplayName} model</h2>
                <p>
                  {isIPhoneHub
                    ? "We support a broad range of current and earlier iPhone models. Choose your exact model to check the repair options currently available."
                    : `Start with the exact ${phoneHubDisplayName} model to view supported repair options, current pricing, and the right booking path.`}
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
              <h2 id="phone-diagnostic-heading">How {phoneHubDisplayName} diagnosis, parts and timing work</h2>
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
                {phoneDiagnosticSteps.length > 0 ? (
                  phoneDiagnosticSteps.map((step, index) => (
                    <article key={step.title} className="repair-signal-card">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </article>
                  ))
                ) : (
                  <>
                    <article className="repair-signal-card">
                      <span>01</span>
                      <h3>{isEnhancedPhoneHub ? "Confirm the model and fault" : "Model-specific diagnosis"}</h3>
                      <p>
                        {batchPhoneBrandConfig
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
                  </>
                )}
              </div>
            </div>
          </section>

          {exactPhoneRepairShortcuts.length > 0 && (
            <section className="brand-hub-section" aria-labelledby="exact-phone-repair-shortcuts-heading">
              <div className="brand-hub-section-header">
                <div>
                  <span className="repair-kicker">Common combinations</span>
                  <h2 id="exact-phone-repair-shortcuts-heading">Common {phoneHubDisplayName} model and repair combinations</h2>
                </div>
                <p>
                  A few common model-and-repair paths customers ask about. If you are unsure, choose your exact model above first.
                </p>
              </div>
              <div className="brand-hub-link-grid brand-hub-repair-link-grid">
                {exactPhoneRepairShortcuts.map((link) => (
                  <Link key={link.href} href={link.href} prefetch={false} className="brand-hub-outline-link">
                    <strong>{link.label}</strong>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className={usesBrandHubDesign ? "brand-hub-section" : "repair-types-showcase"} aria-labelledby="brand-repair-types-heading">
            <div className={usesBrandHubDesign ? "brand-hub-section-header" : "repair-types-showcase-header"}>
              <div>
                <span className="repair-kicker repair-kicker-muted">Repair services</span>
                <h2 id="brand-repair-types-heading">{usesBrandHubDesign ? `Popular ${phoneHubDisplayName} repair services` : `Common ${brandName} Repair Paths`}</h2>
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
              <h2 id="phone-ringwood-heading">{phoneHubDisplayName} repair support at Ringwood Square</h2>
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
            <h2 id="phone-faq-heading" className="faq-heading">{phoneHubDisplayName} repair FAQs</h2>
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
                Choose Your {phoneHubDisplayName} Model
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
