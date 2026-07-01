import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPhoneBrandHubContent } from "@/lib/phone-brand-hubs";
import { REPAIR_TYPES } from "@/data/seo-data";
import { fetchRepairCatalog, fetchBrandModels, type BrandEntry } from "@/lib/api";
import { formatDynamicParam, safeSlugSegment } from "@/lib/inventoryUtils";
import { smartSortModels, groupModelsBySeries } from "@/lib/modelSortConfig";
import BrandModelSearch from "@/components/BrandModelSearch";
import HubRepairResultsSection from "@/components/repair-results/HubRepairResultsSection";
import FloatingJumpCTA from "@/components/FloatingJumpCTA";
import { type RepairResultDeviceCategory } from "@/lib/repair-results";
import BackButton from "@/components/BackButton";
import MacBookModelFinder from "./MacBookModelFinder";
import AppleWatchModelFinder from "./AppleWatchModelFinder";
import IPadModelFinder from "./iPadModelFinder";
import PhoneBrandLinks from "./PhoneBrandLinks";
import { ArrowRight, ClipboardCheck, Clock3, MapPin, Search, ShieldCheck, Smartphone } from "lucide-react";

export const dynamic = 'force-dynamic'; // Enforce absolute fresh data for model lists
export const dynamicParams = true; // Allow on-demand generation of new brand pages

interface BrandPageProps {
  params: Promise<{ category: string; brand: string }>;
}

const IPHONE_MAJOR_REPAIR_LINKS = [
  { href: "/repairs/screen-replacement", label: "Screen Replacement" },
  { href: "/repairs/battery-replacement", label: "Battery Replacement" },
  { href: "/repairs/charging-port-replacement", label: "Charging Port Replacement" },
  { href: "/repairs/back-glass-replacement", label: "Back Glass Replacement" },
];

const IPHONE_REPAIR_CATEGORY_LINKS = [
  { href: "/repairs/phone", label: "Phone Repairs" },
  { href: "/repairs/tablet", label: "Tablet Repairs" },
  { href: "/repairs/laptop/macbook", label: "MacBook Repairs" },
  { href: "/repairs/watch", label: "Watch Repairs" },
];

function buildOtherPhoneBrandLinks(brands: BrandEntry[], currentBrandSlug: string) {
  const seen = new Set<string>();

  return brands
    .filter((brand) => brand.category === "phone" && brand.slug !== currentBrandSlug)
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
  const isPhoneHub = categorySlug === "phone";
  const isIPhoneHub = isPhoneHub && brandSlug === "iphone";
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
  const otherPhoneBrandLinks = isIPhoneHub ? buildOtherPhoneBrandLinks(catalog.brands, brandSlug) : [];
  const startingRepairPrice = isPhoneHub ? getStartingRepairPrice(models) : null;
  const sortedModels = smartSortModels(models);
  const seriesGroups = groupModelsBySeries(sortedModels, brandName);
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

  return (
    <main className={`repair-page-shell ${!isPhoneHub ? "repair-page-shell-narrow" : ""} ${isIPhoneHub ? "iphone-hub-page" : ""}`}>
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
        {!isPhoneHub && !isMacBookHub && !isAppleWatchHub && !isIPadHub && (
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
          <div className="repair-hero-panel repair-hero-insight-panel" aria-label="Model selection support">
            <div className="repair-device-card" aria-hidden="true">
              <span className="repair-device-frame">
                <span />
              </span>
              <div>
                <strong>Apple Watch</strong>
                <small>Choose exact model</small>
              </div>
            </div>
            <div>
              <Search size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>Apple Watch Series, SE and Ultra</span>
            </div>
            <div>
              <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>Exact generation required</span>
            </div>
            <div>
              <ClipboardCheck size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>Case size (e.g. 41mm, 45mm, 49mm)</span>
            </div>
          </div>
        )}
        {isIPadHub && (
          <div className="repair-hero-panel repair-hero-insight-panel" aria-label="Model selection support">
            <div className="repair-device-card" aria-hidden="true">
              <span className="repair-device-frame">
                <span />
              </span>
              <div>
                <strong>iPad</strong>
                <small>Choose exact model</small>
              </div>
            </div>
            <div>
              <Search size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>iPad, iPad Air, iPad Pro, iPad mini</span>
            </div>
            <div>
              <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>Exact generation required</span>
            </div>
            <div>
              <ClipboardCheck size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>Screen size or A-number</span>
            </div>
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
          <AppleWatchModelFinder
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
                <h2 id="brand-repair-types-heading">Common Apple Watch Repair Paths</h2>
              </div>
              <p>Choose your Apple Watch model first, then compare the repair path that best matches the fault we need to assess.</p>
            </div>
            <div className="repair-type-card-grid">
              {[
                { name: "Screen and display replacement", note: "Cracked glass, display faults and touch issues need the exact model and case size before the repair path is confirmed." },
                { name: "Battery replacement", note: "Battery wear, short runtime and shutdown symptoms are checked against the compatible model-specific battery path." },
                { name: "Charging or no-power assessment", note: "If the watch is not charging or not turning on, we inspect the fault first before confirming the practical repair option." }
              ].map((path, index) => (
                <article key={path.name} className="repair-type-mini-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{path.name}</strong>
                  <small>{path.note}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel" aria-labelledby="apple-watch-diagnostic-heading">
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

          <section className="repair-assist-panel" aria-labelledby="apple-watch-ringwood-heading">
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

          <section className="faq-section" aria-labelledby="apple-watch-faq-heading">
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

          <section className="repair-assist-panel" aria-labelledby="apple-watch-final-cta-heading">
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
          <IPadModelFinder
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
                <h2 id="brand-repair-types-heading">Common iPad Repair Paths</h2>
              </div>
              <p>Choose your iPad model first, then compare the repair path that best matches the fault we need to assess.</p>
            </div>
            <div className="repair-type-card-grid">
              {[
                { name: "Screen and display replacement", note: "Cracked glass, display faults and touch issues need the exact model before the repair path is confirmed." },
                { name: "Battery replacement", note: "Battery wear, short runtime and shutdown symptoms are checked against the compatible model-specific battery path." },
                { name: "Charging or no-power diagnostic assessment", note: "If the iPad is not charging or not turning on, we inspect the fault first before confirming the practical repair option." }
              ].map((path, index) => (
                <article key={path.name} className="repair-type-mini-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{path.name}</strong>
                  <small>{path.note}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="repair-assist-panel" aria-labelledby="ipad-diagnostic-heading">
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

          <section className="repair-assist-panel" aria-labelledby="ipad-ringwood-heading">
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

          <section className="faq-section" aria-labelledby="ipad-faq-heading">
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

          <section className="repair-assist-panel" aria-labelledby="ipad-final-cta-heading">
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
      ) : isPhoneHub ? (
        <>
          <section
            id="models-list"
            className={isIPhoneHub ? "iphone-hub-section iphone-hub-models-section" : undefined}
            aria-labelledby={isIPhoneHub ? "iphone-models-heading" : undefined}
            aria-label={!isIPhoneHub ? `${brandName} models` : undefined}
          >
            {isIPhoneHub && (
              <div className="iphone-hub-section-header">
                <span className="repair-kicker">Popular models</span>
                <h2 id="iphone-models-heading">Choose your iPhone model</h2>
                <p>
                  Start with the exact iPhone model to view supported repair options, current pricing, and the right booking path.
                </p>
              </div>
            )}
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

          <section className={isIPhoneHub ? "iphone-hub-section" : "repair-types-showcase"} aria-labelledby="brand-repair-types-heading">
            <div className={isIPhoneHub ? "iphone-hub-section-header" : "repair-types-showcase-header"}>
              <div>
                <span className="repair-kicker repair-kicker-muted">Repair services</span>
                <h2 id="brand-repair-types-heading">{isIPhoneHub ? "Popular iPhone repair services" : `Common ${brandName} Repair Paths`}</h2>
              </div>
              <p>Choose your exact model first, then compare the repair path that best matches the fault we need to assess.</p>
            </div>
            <div className={isIPhoneHub ? "iphone-hub-link-grid iphone-hub-repair-link-grid" : "repair-type-card-grid"}>
              {isIPhoneHub ? (
                IPHONE_MAJOR_REPAIR_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} prefetch={false} className="iphone-hub-outline-link">
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

          <section className={`repair-assist-panel${isIPhoneHub ? " iphone-hub-section iphone-hub-panel" : ""}`} aria-labelledby="phone-diagnostic-heading">
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

          {isIPhoneHub && otherPhoneBrandLinks.length > 0 && (
            <section className="iphone-hub-section" aria-labelledby="other-phone-brands-heading">
              <div className="iphone-hub-section-header">
                <span className="repair-kicker">Explore more</span>
                <h2 id="other-phone-brands-heading">Other phone brands</h2>
                <p>
                  Browse other supported phone repair hubs if you are comparing repair options across devices.
                </p>
              </div>
              <PhoneBrandLinks links={otherPhoneBrandLinks} initialVisibleCount={6} />
              <div className="iphone-hub-subsection" aria-labelledby="other-repair-categories-heading">
                <h3 id="other-repair-categories-heading">Other repair categories</h3>
                <div className="iphone-hub-link-grid iphone-hub-category-link-grid">
                  {IPHONE_REPAIR_CATEGORY_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} prefetch={false} className="iphone-hub-outline-link">
                      <strong>{link.label}</strong>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className={`repair-assist-panel${isIPhoneHub ? " iphone-hub-section iphone-hub-panel iphone-hub-centered-panel" : ""}`} aria-labelledby="phone-ringwood-heading">
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

          <section className={`faq-section${isIPhoneHub ? " iphone-hub-section iphone-hub-faq-section" : ""}`} aria-labelledby="phone-faq-heading">
            {isIPhoneHub && <span className="repair-kicker">Common questions</span>}
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

          <section className={`repair-assist-panel${isIPhoneHub ? " iphone-hub-section iphone-hub-panel iphone-hub-centered-panel iphone-hub-final-cta" : ""}`} aria-labelledby="phone-final-cta-heading">
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
