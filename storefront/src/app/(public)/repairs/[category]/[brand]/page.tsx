import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPhoneBrandHubContent } from "@/lib/phone-brand-hubs";
import { REPAIR_TYPES } from "@/data/seo-data";
import { fetchRepairCatalog, fetchBrandModels, type BrandEntry, type ModelEntry } from "@/lib/api";
import { formatDynamicParam, safeSlugSegment } from "@/lib/inventoryUtils";
import { smartSortModels, groupModelsBySeries } from "@/lib/modelSortConfig";
import BrandModelSearch from "@/components/BrandModelSearch";
import HubRepairResultsSection from "@/components/repair-results/HubRepairResultsSection";
import FloatingJumpCTA from "@/components/FloatingJumpCTA";
import { type RepairResultDeviceCategory } from "@/lib/repair-results";
import BackButton from "@/components/BackButton";
import MacBookModelFinder from "./MacBookModelFinder";
import BrandHubLinks from "./BrandHubLinks";
import BrandHubModelSeriesBrowser, { type BrandHubSeriesGroup } from "./BrandHubModelSeriesBrowser";
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

const BRAND_HUB_REPAIR_CATEGORY_LINKS = [
  { href: "/repairs/phone", label: "Phone Repairs" },
  { href: "/repairs/tablet", label: "Tablet Repairs" },
  { href: "/repairs/laptop/macbook", label: "MacBook Repairs" },
  { href: "/repairs/watch", label: "Watch Repairs" },
];

const MAJOR_PHONE_BRAND_HUB_SLUGS = ["iphone", "samsung", "oppo", "google-pixel"];
const SAMSUNG_SERIES_ORDER = ["s", "a", "note", "z"];
const SAMSUNG_TABLET_SERIES_ORDER = ["tab-s", "tab-a", "tab-active", "other"];
const LENOVO_TABLET_SERIES_ORDER = ["tab-p", "tab-m", "tab-e", "yoga", "other"];
const IPAD_SERIES_ORDER = ["ipad", "air", "mini", "pro", "other"];
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
const IPAD_BASE_MODEL_SLUGS = new Set([
  "ipad-5th-generation",
  "ipad-6th-generation",
  "ipad-7th-generation",
  "ipad-8th-generation",
  "ipad-9th-generation",
  "ipad-10th-generation",
  "ipad-11th-generation",
]);

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

const IPAD_SERIES_LABELS: Record<string, string> = {
  ipad: "iPad",
  air: "iPad Air",
  mini: "iPad mini",
  pro: "iPad Pro",
  other: "Other iPad Models",
};

const SAMSUNG_TABLET_SERIES_LABELS: Record<string, string> = {
  "tab-s": "Galaxy Tab S Series",
  "tab-a": "Galaxy Tab A Series",
  "tab-active": "Galaxy Tab Active Series",
  other: "Other Samsung Tablets",
};

const LENOVO_TABLET_SERIES_LABELS: Record<string, string> = {
  "tab-p": "Lenovo Tab P Series",
  "tab-m": "Lenovo Tab M Series",
  "tab-e": "Lenovo Tab E Series",
  yoga: "Lenovo Yoga Tab Series",
  other: "Other Lenovo Tablets",
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

function getIPadSeriesKey(model: ModelEntry) {
  const name = model.model.toLowerCase();
  const slug = model.slug.toLowerCase();

  if (
    IPAD_BASE_MODEL_SLUGS.has(slug) ||
    (name.startsWith("ipad ") &&
      !name.includes("ipad air") &&
      !name.includes("ipad mini") &&
      !name.includes("ipad pro"))
  ) {
    return "ipad";
  }

  if (name.includes("ipad air") || slug.includes("ipad-air")) return "air";
  if (name.includes("ipad mini") || slug.includes("ipad-mini")) return "mini";
  if (name.includes("ipad pro") || slug.includes("ipad-pro")) return "pro";
  return "other";
}

function getSamsungTabletSeriesKey(model: ModelEntry) {
  const name = model.model.toLowerCase();
  const slug = model.slug.toLowerCase();

  if (name.includes("active") || slug.includes("active")) return "tab-active";
  if (/\btab\s+s/i.test(name) || slug.startsWith("galaxy-tab-s")) return "tab-s";
  if (/\btab\s+a/i.test(name) || slug.startsWith("galaxy-tab-a")) return "tab-a";
  return "other";
}

function getLenovoTabletSeriesKey(model: ModelEntry) {
  const name = model.model.toLowerCase();
  const slug = model.slug.toLowerCase();

  if (/\btab\s+p/i.test(name) || slug.includes("tab-p")) return "tab-p";
  if (/\btab\s+m/i.test(name) || slug.includes("tab-m")) return "tab-m";
  if (/\btab\s+e/i.test(name) || slug.includes("tab-e")) return "tab-e";
  if (name.includes("yoga") || slug.includes("yoga")) return "yoga";
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
      const key = getIPadSeriesKey(model);
      const current = groups.get(key) ?? [];
      current.push(model);
      groups.set(key, current);
    }

    return IPAD_SERIES_ORDER.flatMap((key) => {
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
      const key = brandSlug === "samsung" ? getSamsungTabletSeriesKey(model) : getLenovoTabletSeriesKey(model);
      const current = groups.get(key) ?? [];
      current.push(model);
      groups.set(key, current);
    }

    const orderedKeys = brandSlug === "samsung" ? SAMSUNG_TABLET_SERIES_ORDER : LENOVO_TABLET_SERIES_ORDER;
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
  const isPhone = resolvedParams.category === "phone";

  const isMacBookHub = resolvedParams.category === "laptop" && resolvedParams.brand === "macbook";

  let title, description;

  if (isPhone) {
    const phoneContent = getPhoneBrandHubContent(resolvedParams.brand, brandName);
    title = phoneContent.metadata.title;
    description = phoneContent.metadata.description;
  } else if (isAppleWatch) {
    title = 'Apple Watch Repair Services in Ringwood | Models & Repair Options | Ali Mobile';
    description = 'Expert Apple Watch repair services in Ringwood, Melbourne. Screen replacement, battery repair, and diagnostic assessment. Confirm your exact model for compatible repair options.';
  } else if (isIPad) {
    title = 'iPad Repair Services in Ringwood | Models & Repair Options | Ali Mobile';
    description = 'Expert iPad repair services in Ringwood, Melbourne. Screen replacement, battery repair, and diagnostic assessment. Confirm your exact iPad family, generation, screen size or A-number for compatible repair options and current pricing.';
  } else if (isSamsungTablet) {
    title = 'Samsung Galaxy Tab Repair Services | Models & Repair Options | Ali Mobile';
    description = 'Explore repair options for supported Samsung Galaxy Tab models, including screen, battery, charging and diagnostic services. Confirm the exact model, parts availability, pricing and repair timing with Ali Mobile & Repair in Ringwood.';
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
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
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
  const otherPhoneBrandLinks = isPhoneHub ? buildOtherPhoneBrandLinks(catalog.brands, brandSlug) : [];
  const otherTabletBrandLinks = isTabletBrandHub ? buildOtherTabletBrandLinks(catalog.brands, brandSlug) : [];
  const otherWatchBrandLinks = isAppleWatchHub ? buildOtherWatchBrandLinks(catalog.brands, brandSlug) : [];
  const startingRepairPrice = isPhoneHub ? getStartingRepairPrice(models) : null;
  const sortedModels = smartSortModels(models);
  const seriesGroups = groupModelsBySeries(sortedModels, brandName);
  const flatModelGroup = [{ series: `${brandName} Models`, models: sortedModels }];
  const brandHubSeriesGroups = usesBrandHubDesign ? buildBrandHubSeriesGroups(categorySlug, brandSlug, models) : [];
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
          title: "Choose exact model",
          body: "iPad, iPad Air, iPad Pro, iPad mini",
        },
        {
          title: "Exact generation required",
          body: "Confirm the iPad family, generation, screen size or A-number before choosing the repair path.",
        },
        {
          title: "Screen size or A-number",
          body: "Use Settings, the rear casing A-number, or screen size details to match the right model.",
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
              : isAppleWatchHub
              ? "Apple Watch Repair Services in Ringwood"
              : isIPadHub
              ? "iPad Repair Services in Ringwood"
              : `${brandName} Repair Services`}
          </h1>
          <p>
            {isMacBookHub
              ? 'Professional MacBook repair in Ringwood Square. We support screen, battery, keyboard/top case, charging, and diagnostic services. Use your model name or A-number below to find your MacBook and view repair options. Timing depends on parts availability and exact model confirmation.'
              : isAppleWatchHub
              ? 'Select your exact model below to view repair options and pricing at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.'
              : isIPadHub
              ? 'Select your exact model below to view repair options and pricing at Ringwood Square Shopping Centre. We confirm your exact iPad family, generation, screen size or A-number before confirming the repair path.'
              : 'Select your exact model below to view repair options and pricing at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.'}
          </p>
          <div className="repair-hero-actions">
            <a href="#models-list" className="repair-primary-action">
              View model option
            </a>
            <Link href="/book-repair" className="repair-secondary-action">
              Live Quote
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
          />

          <section className="brand-hub-section" aria-labelledby="brand-repair-types-heading">
            <div className="brand-hub-section-header">
              <div>
                <span className="repair-kicker">Common services</span>
                <h2 id="brand-repair-types-heading">Common iPad Repair Paths</h2>
              </div>
              <p>Choose your iPad model first, then compare the repair path that best matches the fault we need to assess.</p>
            </div>
            <div className="repair-signal-grid">
              {[
                { name: "Screen and display replacement", note: "Cracked glass, display faults and touch issues need the exact model before the repair path is confirmed." },
                { name: "Battery replacement", note: "Battery wear, short runtime and shutdown symptoms are checked against the compatible model-specific battery path." },
                { name: "Charging or no-power diagnostic assessment", note: "If the iPad is not charging or not turning on, we inspect the fault first before confirming the practical repair option." }
              ].map((path, index) => (
                <article key={path.name} className="repair-signal-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{path.name}</h3>
                  <p>{path.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel brand-hub-section brand-hub-panel" aria-labelledby="ipad-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="ipad-diagnostic-heading">How iPad diagnosis, parts and quoting work</h2>
              <p>
                We confirm the exact model, device condition, frame condition, fault and parts availability first. Then we explain the compatible repair options and practical quote path before any work is approved.
              </p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Why the exact model matters</h3>
                  <p>Compatible parts differ by iPad family, generation, screen size, A-number, and Wi-Fi or Cellular variant where relevant.</p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Parts, timing and adhesive</h3>
                  <p>Parts availability varies. Timing depends on model, stock, queue and device condition. Some repairs require adhesive fitting and curing time, so we do not promise same-day completion before checking the device and part.</p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>Data and backup guidance</h3>
                  <p>Standard hardware repairs normally do not require access to personal content. However, we recommend backing up the iPad where possible before repair, as data preservation cannot be guaranteed.</p>
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
              <p>
                Ali Mobile &amp; Repair works from Ringwood Square Shopping Centre Kiosk C1.
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
          </section>

          <section className="faq-section brand-hub-section brand-hub-faq-section" aria-labelledby="ipad-faq-heading">
            <span className="repair-kicker">Common questions</span>
            <h2 id="ipad-faq-heading" className="faq-heading">iPad repair FAQs</h2>
            <div className="faq-accordion">
              {[
                { question: "How do I identify the exact iPad model?", answer: "Check Settings → General → About, or look for the A-number printed on the rear casing of your iPad." },
                { question: "Can you confirm screen or battery repair timing immediately?", answer: "We do not promise same-day completion before checking the device and part. Timing depends on the exact model, condition, parts availability, and the repair queue." },
                { question: "Is my data safe during an iPad repair?", answer: "Standard hardware repairs normally do not require access to personal content. However, we recommend backing up the iPad where possible before repair, as we cannot guarantee data preservation." },
                { question: "Do bent frames affect iPad screen replacement?", answer: "Yes, bent frames can prevent a new screen from sitting flush and sealing correctly. We inspect the frame condition before confirming the repair option." },
                { question: "Is an iPad repair worth it?", answer: "That depends on the exact model, device condition, damage, repair quote, and replacement-device value. Once we confirm the exact model and fault, we can explain the practical repair path." }
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
                  Start with the exact {brandName} model to view supported repair options, current pricing, and the right booking path.
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
          />

          <section className={usesBrandHubDesign ? "brand-hub-section" : "repair-types-showcase"} aria-labelledby="brand-repair-types-heading">
            <div className={usesBrandHubDesign ? "brand-hub-section-header" : "repair-types-showcase-header"}>
              <div>
                <span className="repair-kicker repair-kicker-muted">Repair services</span>
                <h2 id="brand-repair-types-heading">{usesBrandHubDesign ? `Popular ${brandName} repair services` : `Common ${brandName} Repair Paths`}</h2>
              </div>
              <p>Choose your exact model first, then compare the repair path that best matches the fault we need to assess.</p>
            </div>
            <div className={usesBrandHubDesign ? "brand-hub-link-grid brand-hub-repair-link-grid" : "repair-type-card-grid"}>
              {usesBrandHubDesign ? (
                BRAND_HUB_REPAIR_TYPE_LINKS.map((link) => (
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

          <section className={`repair-assist-panel${usesBrandHubDesign ? " brand-hub-section brand-hub-panel" : ""}`} aria-labelledby="phone-diagnostic-heading">
            <div className="w-full">
              <span className="repair-kicker repair-kicker-muted">Diagnosis and quoting</span>
              <h2 id="phone-diagnostic-heading">How {brandName} diagnosis, parts and timing work</h2>
              <p>We confirm the exact model first, then explain the compatible repair options and practical timing.</p>
              <div className="repair-signal-grid mt-5">
                <article className="repair-signal-card">
                  <span>01</span>
                  <h3>Model-specific diagnosis</h3>
                  <p>Compatible parts differ by model. The exact model matters before we confirm repair compatibility.</p>
                </article>
                <article className="repair-signal-card">
                  <span>02</span>
                  <h3>Screen replacement timing</h3>
                  <p>{phoneContent?.timing.screen || 'Repair timing depends on the exact model and parts availability. We confirm the timeline once diagnosis is complete.'}</p>
                </article>
                <article className="repair-signal-card">
                  <span>03</span>
                  <h3>Battery replacement timing</h3>
                  <p>{phoneContent?.timing.battery || 'Many common battery replacements can be completed quickly when the correct part is in stock.'}</p>
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
              <p>Ali Mobile & Repair works from Ringwood Square Shopping Centre Kiosk C1. Walk-ins are welcome, and we offer free underground and outdoor parking. Our team provides English, 中文, and 粤语 support. Call 0481 058 514 to confirm parts or timing before travelling.</p>
            </div>
            <div className="repair-chip-cloud" aria-label="Phone repair support actions">
              <span><MapPin size={15} strokeWidth={2.2} aria-hidden="true" /> Ringwood Square Kiosk C1</span>
              <span><Clock3 size={15} strokeWidth={2.2} aria-hidden="true" /> Walk-ins welcome</span>
              <span><ShieldCheck size={15} strokeWidth={2.2} aria-hidden="true" /> Clear quote before approval</span>
            </div>
          </section>

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
              <p>Start with the {brandName} model selector above to check compatible repair paths, then book or call once you have the exact model.</p>
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
