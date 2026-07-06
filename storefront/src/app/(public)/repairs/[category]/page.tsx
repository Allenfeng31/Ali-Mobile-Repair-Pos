import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import ScrollReveal from '@/components/ScrollReveal';
import FloatingJumpCTA from '@/components/FloatingJumpCTA';
import { fetchRepairCatalog } from '@/lib/api';
import { formatDynamicParam, safeSlugSegment } from '@/lib/inventoryUtils';
import { ArrowRight, Clock, MapPin, MessageCircle, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react';
import HubRepairResultsSection from '@/components/repair-results/HubRepairResultsSection';
import { type RepairResultDeviceCategory } from '@/lib/repair-results';

export const revalidate = 86400;
export const dynamicParams = true;

const CATEGORIES = ['phone', 'tablet', 'laptop', 'watch'];

const CATEGORY_HERO_MEDIA = {
  phone: {
    image: '/images/repair-hero/phone-exploded-544.png?v=hero-exploded-fit-1',
    alt: 'Exploded phone repair parts showing screen, battery, charging assembly, and internal components',
    ariaLabel: 'Exploded phone repair parts preview',
    width: 544,
    height: 544,
  },
  tablet: {
    image: '/images/repair-hero/ipad-pro-exploded-544.png?v=hero-exploded-fit-1',
    alt: 'Exploded iPad Pro repair parts showing display, battery, logic board, and internal components',
    ariaLabel: 'Exploded iPad repair parts preview',
    width: 544,
    height: 544,
  },
  laptop: {
    image: '/images/repair-hero/macbook-pro-exploded-544@2x.png?v=hero-exploded-square-1',
    alt: 'Exploded MacBook Pro repair parts showing display, keyboard, logic board, battery, and chassis',
    ariaLabel: 'Exploded MacBook repair parts preview',
    width: 544,
    height: 544,
  },
  watch: {
    image: '/images/repair-hero/apple-watch-exploded-430x487.png?v=hero-exploded-fit-1',
    alt: 'Exploded Apple Watch repair parts showing display, frame, battery, sensors, and rear housing',
    ariaLabel: 'Exploded Apple Watch repair parts preview',
    width: 430,
    height: 487,
  },
};

// Predefined priority brands for UI highlighting (Most Popular section)
const POPULAR_BRANDS_KEYS = [
  'iPhone', 'iPad', 'Samsung', 'Google', 'Apple',
  'MacBook', 'Microsoft', 'Dell', 'HP', 'Lenovo', 'Asus'
];

const LAPTOP_PRIORITY_BRANDS = [
  'Dell',
  'HP',
  'Lenovo',
  'Microsoft',
  'Surface',
  'ASUS',
  'Acer',
  'Razer',
  'Alienware',
];

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category,
  }));
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const CATEGORY_SEO_DATA: Record<string, any> = {
  phone: {
    metadata: {
      title: 'Mobile Phone Repair Services by Brand & Model | Ali Mobile',
      description: 'Browse mobile phone repair pathways by brand, model and issue, including screen, battery, charging, camera and housing repairs. Choose your phone model to see supported repair options.',
    },
    hero: {
      pillType: 'primary',
      pillText: 'Phone Specialist',
      title: 'Mobile Phone Repair Services by Brand & Model',
      intro1: 'Select your mobile phone brand and exact model to view supported smartphone repair pathways for screen, battery, charging, camera and housing issues.',
      intro2: 'Check available service options and pricing for your specific phone model, then confirm parts availability and practical timing before your visit.',
    },
    schema: {
      serviceName: 'Mobile Phone Repair Services by Brand and Model',
      description: "Mobile phone repair pathways for supported iPhone, Samsung Galaxy, Google Pixel, OPPO and other models. Same-day options may be available for common screen and battery repairs when parts are in stock.",
    },
    features: [
      { t: "Same-day options when parts are in stock", d: "We confirm timing after checking the model and repair queue." },
      { t: "Premium Quality Screens & Parts Available", d: "" },
      { t: "Fast repair options for common screens and batteries", d: "" },
      { t: "No Fix, No Charge Policy", d: "" },
      { t: "180-Day Comprehensive Warranty", d: "" }
    ],
    pricing: {
      title: "Popular Phone Repair Pricing",
      deviceType: "phone",
      items: [
        { model: "iPhone 17 / 17 Pro", service: "Premium Screen replacement", price: 499, search: "iphone 17 screen" },
        { model: "iPhone 13 / 13 Pro", service: "Screen replacement", price: 189, search: "iphone 13 screen" },
        { model: "iPhone 11", service: "Screen replacement", price: 149, search: "iphone 11 screen" }
      ]
    },
    faqs: [
      { question: "How long does a phone repair take?", answer: "Common phone repairs can often be completed the same day when the correct part is available. Timing depends on the exact model, current stock, repair queue and final testing, so please call first if timing is important." },
      { question: "Will I lose my data during phone repair?", answer: "Most screen, battery and charging port repairs do not require a data wipe. We still recommend backing up where possible, especially if the phone has liquid exposure, logic board symptoms or severe damage that may carry higher data risk." },
      { question: "What should I do if my phone gets wet?", answer: "Turn the phone off if possible, do not charge it, and avoid repeatedly testing it. Bring it in for assessment early so corrosion and internal damage can be checked. Liquid exposure outcomes depend on the damage found during inspection." },
      { question: "What if my phone will not charge?", answer: "Charging faults can be caused by the cable, charger, charging port, battery, liquid exposure or a board-level issue. We start with diagnosis before replacing parts and confirm the quote before proceeding." },
      { question: "What if my phone screen is black but still makes sounds?", answer: "A black screen with sound can point to a damaged display, an internal display connection issue or a board fault. Diagnosis confirms whether screen replacement is appropriate or whether another repair path is needed." },
      { question: "Do phone repair shops look at your photos?", answer: "Normal screen, battery and charging repairs focus on hardware testing, and Ali Mobile does not need to browse personal photos for those services. Some functional tests may require customer participation or unlocking only when needed." },
      { question: "Is it worth repairing an old phone or buying a new one?", answer: "It depends on the repair cost, device condition, battery health, storage needs and how long you want to keep the phone. For older phones, a quote-first approach helps compare repair value against replacement." },
      { question: "Do I need to know the exact phone model?", answer: "Knowing the exact model helps us confirm part compatibility, pricing and timing faster. If you are unsure, bring the device to Ringwood Square or contact us and we can help identify it before quoting." }
    ]
  },
  tablet: {
    metadata: {
      title: 'Tablet Repair Services by Brand & Model | Ali Mobile',
      description: 'Browse tablet and iPad repair pathways by brand, model and issue, including screen, battery, charging port, camera and housing repairs. Choose your tablet model to see supported repair options.',
    },
    hero: {
      pillType: 'primary',
      pillText: 'Tablet Specialist',
      title: 'Tablet Repair Services by Brand & Model',
      intro1: 'Select your tablet brand and exact model to view supported tablet repair pathways for screen, battery, charging, camera and housing issues.',
      intro2: 'We confirm repair timing after checking the exact tablet model, part availability, repair queue, and device condition.',
    },
    schema: {
      serviceName: 'Tablet Repair Services by Brand and Model',
      description: "Tablet and iPad repair pathways for supported models, including screen, battery, charging and diagnostic options where available.",
    },
    features: [
      { t: "Parts availability & timing checks", d: "Timing is confirmed after model, part, and repair queue checks." },
      { t: "Quality replacement batteries", d: "Selected for compatible tablet models and confirmed before repair." },
      { t: "Detailed diagnostic checks prior to repair", d: "" },
      { t: "180-Day Comprehensive Warranty Coverage", d: "" }
    ],
    pricing: {
      title: "Popular Tablet Repair Pricing",
      deviceType: "tablet",
      items: []
    },
    faqs: [
      { question: "Do you repair cracked iPad screens in Ringwood?", answer: "Yes, we specialize in iPad screen repairs right here in Ringwood. Whether you only need the top glass or the entire LCD assembly replaced, same-day options may be available when parts are in stock." },
      { question: "What kind of replacement batteries do you use for tablets?", answer: "We use compatible replacement batteries selected for the model and confirm the available option before repair." },
      { question: "How long does an iPad repair take?", answer: "Many common iPad repairs can be completed the same day when parts are in stock, but timing depends on adhesive curing, model, repair queue, and device condition." },
      { question: "What if my tablet will not turn on or only shows a black screen?", answer: "A no-power or black-screen tablet can be related to the display, battery, charging port, liquid exposure, connector damage or board-level faults. We inspect the device first so we can confirm the likely cause and quote the right repair path." },
      { question: "What is your warranty policy for tablet repairs?", answer: "Tablet screen and battery replacements are backed by our 180-day warranty. Warranty support depends on the fault confirmed at inspection and whether it relates to the completed repair." },
      { question: "Is my tablet data safe during the repair?", answer: "Data is normally not affected during standard screen or battery repairs, but we recommend backing up first whenever possible." }
    ]
  },
  laptop: {
    metadata: {
      title: 'Laptop Repair Services by Brand & Model | Ali Mobile',
      description: 'Browse laptop and MacBook repair pathways by brand, model and issue, including screen, battery, charging, keyboard, housing and diagnostic services where supported.',
    },
    hero: {
      pillType: 'warning',
      pillText: 'Laptop Repair Hub',
      title: 'Laptop Repair Services by Brand & Model',
      intro1: 'Select your laptop brand and exact model to view supported laptop repair pathways for screen, battery, charging, keyboard, housing and diagnostic issues.',
      intro2: 'Common laptop screen and battery jobs may move faster when parts are in stock, but timing always depends on the exact model, the fault, parts availability and final testing.',
    },
    schema: {
      serviceName: 'Laptop Repair Services by Brand and Model',
      description: 'Laptop and MacBook repair pathways for supported models, including screen, battery, keyboard, charging, power and diagnostic support where available.',
    },
    features: [
      { t: "Windows and MacBook repair pathways", d: "Choose the laptop family that matches your device, or ask us to identify it at the counter." },
      { t: "Screen, battery, keyboard and charging support", d: "We explain the likely fault path before any repair begins." },
      { t: "Diagnostics before parts are ordered", d: "A practical assessment helps confirm the right repair and timing." },
      { t: "Ringwood Square kiosk", d: "Ali Mobile & Repair, Kiosk C1, Seymour St, Ringwood VIC 3134." }
    ],
    pricing: {
      title: "Laptop Repair Price Check",
      deviceType: "computer",
      items: [
        { model: "Windows laptop", service: "Screen replacement", price: 0 },
        { model: "Laptop", service: "Battery replacement", price: 0 },
        { model: "Laptop", service: "Keyboard / top-case repair", price: 0 },
        { model: "Laptop", service: "Charging / power diagnosis", price: 0 },
        { model: "MacBook", service: "Assessment and quote", price: 0 },
      ]
    },
    faqs: [
      { question: "What laptop brands do you repair?", answer: "We support Windows laptop and MacBook pathways when the current catalogue or parts setup allows. If you are not sure, bring the device in and we can identify the brand and model before you travel." },
      { question: "Do I need the exact model?", answer: "No, but it helps. If you do not know the model, we can inspect the device and identify it at the counter." },
      { question: "Can you repair a laptop that will not turn on?", answer: "Often yes, but we need a diagnostic first to check charging, battery, power and board-level symptoms." },
      { question: "How long does a laptop repair take?", answer: "Many common laptop screen or battery repairs can sometimes be completed in around 15–45 minutes once work begins when parts are in stock. Larger jobs take longer because we need to inspect, test and sometimes order parts." },
      { question: "Do you offer screen and battery replacement?", answer: "Yes, screen and battery work are part of the laptop service pathways we support. The exact option depends on brand, model and what the inspection reveals." },
      { question: "Can liquid-damaged laptops be guaranteed?", answer: "No. Liquid damage is unpredictable, and the outcome depends on corrosion, the affected boards and how quickly the device is brought in." },
      { question: "Should I back up data before repair?", answer: "Yes. We do our best to protect your data, but any repair can carry risk, especially if the device is already unstable or has liquid damage." },
      { question: "Where is the Ringwood kiosk?", answer: "Ali Mobile & Repair is at Kiosk C1 inside Ringwood Square Shopping Centre, Seymour Street, Ringwood VIC 3134. The kiosk is opposite the Bunnings entrance inside Ringwood Square Shopping Centre." }
    ]
  },
  watch: {
    metadata: {
      title: 'Apple Watch Repair Services by Model | Ali Mobile',
      description: 'Browse supported smart watch repair pathways by model and issue, including screen, battery and diagnostic services where available. Choose your watch model to see supported repair options.',
    },
    hero: {
      pillType: 'accent',
      pillText: 'Watch Specialist',
      title: 'Apple Watch Repair Services by Model',
      intro1: 'Select your watch model to view supported repair pathways for screen, battery and diagnostic issues where available.',
      intro2: 'Repair timing depends on the exact model, device condition, parts availability and inspection. We confirm the practical repair path and quote after checking the watch first.',
    },
    schema: {
      serviceName: 'Apple Watch Repair Services by Model',
      description: "Smart watch repair pathways for supported Apple Watch models, including screen, battery and diagnostic options where available.",
    },
    features: [
      { t: "Parts availability varies by brand and model", d: "Replacement parts are model-specific and we confirm availability before quoting." },
      { t: "Timing depends on model and inspection", d: "Repair complexity, stock levels and the exact fault determine the turnaround time." },
      { t: "Water-resistance limitations", d: "Original factory water resistance cannot be guaranteed after opening or repair." },
      { t: "Adhesive resealing", d: "We may reseal where appropriate, but adhesive replacement does not restore guaranteed factory water-resistance certification." }
    ],
    faqs: [
      { question: "Do you offer same-day smart watch repairs in Ringwood?", answer: "Some smart watch repairs may move faster when the exact model and part are confirmed, but we do not promise same-day completion before checking the watch, parts availability, repair queue and device condition." },
      { question: "What if my smart watch will not turn on or charge?", answer: "A no-power or charging fault needs diagnosis first so we can confirm whether the issue is related to the battery, charging path, display behaviour or another fault before quoting." },
      { question: "Why do I need the exact model and case size?", answer: "Repair compatibility, parts selection and pricing depend on the exact smartwatch brand, generation, model and case size. Apple Watch models are currently available on the public repair path." },
      { question: "Will my smart watch remain water resistant after repair?", answer: "Factory water resistance cannot be guaranteed after opening or repair. We may reseal where appropriate, but adhesive replacement does not restore guaranteed factory water-resistance certification." },
      { question: "Is a smart watch repair worth it?", answer: "That depends on the brand, model, device condition, damage, repair quote, and replacement-device value. Once we confirm the exact model and fault, we can explain the practical repair path." }
    ]
  }
};

const CATEGORY_COMMON_PROBLEMS: Record<string, Array<{ title: string; body: string }>> = {
  phone: [
    { title: 'Black screen or no display', body: 'Display faults, impact damage or internal connection issues can cause a phone to show nothing on screen.' },
    { title: "Phone won't turn on", body: 'No-power symptoms may relate to the battery, charging path, liquid exposure or board-level faults.' },
    { title: 'Not charging or loose charging connection', body: 'We check cable fit, charging port condition, debris, battery condition and charging behaviour.' },
    { title: 'Touch screen not responding', body: 'Touch faults may come from screen damage, display connectors, software issues or internal damage.' },
    { title: 'Battery drains fast or shuts down', body: 'Fast drain, swelling, shutdowns or poor battery health can point to a battery or power-management issue.' },
    { title: 'Camera, speaker or microphone issues', body: 'We can assess camera focus, sound, microphone and related flex or connector symptoms.' },
    { title: 'Water exposure or no-power symptoms', body: 'Liquid exposure needs diagnosis-first assessment. Repair and data outcomes cannot be guaranteed.' },
  ],
  tablet: [
    { title: 'Cracked tablet screen or glass', body: 'Impact damage can affect the front glass, LCD/display, touch response or frame condition.' },
    { title: 'Tablet not charging', body: 'We check the charging port, cable fit, debris, battery behaviour and charging path.' },
    { title: 'Battery drains quickly', body: 'Short battery life, shutdowns or swelling can point to battery or power-management issues.' },
    { title: 'Touch screen not responding', body: 'Touch faults can come from screen damage, connector issues or internal damage.' },
    { title: "Tablet won't turn on", body: 'No-power symptoms may involve battery, charging, liquid exposure or board-level faults.' },
    { title: 'Camera or button issues', body: 'We can assess camera, button, flex cable and related connector symptoms where supported.' },
  ],
  laptop: [
    { title: 'Cracked screen or display fault', body: 'Display damage, lines, flickering or no-image symptoms may require screen or diagnostic assessment.' },
    { title: 'Battery not holding charge', body: 'Fast drain, swelling or sudden shutdowns can point to battery or power-management issues.' },
    { title: 'Charging or USB-C power issue', body: 'We check charger fit, charging behaviour, port condition and related power symptoms.' },
    { title: 'Keyboard or top case issues', body: 'Sticky, failed or damaged keyboard symptoms may require model-specific part assessment.' },
    { title: "Laptop won't turn on", body: 'No-power symptoms may involve charging, battery, liquid exposure or board-level faults.' },
    { title: 'Trackpad, camera or speaker issues', body: 'We can assess common internal flex, connector and component symptoms where supported.' },
  ],
  watch: [
    { title: 'Cracked watch screen or glass', body: 'Impact damage can affect the display, touch response or watch housing condition.' },
    { title: 'Watch battery drains quickly', body: 'Fast battery drain, shutdowns or charging issues may require battery or diagnostic assessment.' },
    { title: 'Watch not charging', body: 'We check charging behaviour, charging contacts and visible damage where applicable.' },
    { title: 'Touch not responding', body: 'Touch faults may come from screen damage, impact, moisture exposure or internal issues.' },
    { title: 'Water exposure or no-power symptoms', body: 'Liquid exposure needs diagnosis-first assessment. Repair outcomes cannot be guaranteed.' },
  ],
};

type CategoryFaq = {
  question: string;
  answer: string;
};

function buildFaqPageSchema(faqs?: CategoryFaq[]) {
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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: catRaw } = await params;
  const category = formatDynamicParam(catRaw).toLowerCase();
  const data = CATEGORY_SEO_DATA[category];
  const canonicalPath = `/repairs/${safeSlugSegment(category)}`;

  if (!data) return { title: 'Repair Services | Ali Mobile' };
  return {
    ...data.metadata,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: data.metadata.title,
      description: data.metadata.description,
      url: canonicalPath,
      type: "website",
      locale: "en_AU",
      siteName: "Ali Mobile & Repair",
    },
  };
}

export default async function CategoryHubPage({ params }: CategoryPageProps) {
  const { category: catRaw } = await params;
  const category = formatDynamicParam(catRaw).toLowerCase();
  const data = CATEGORY_SEO_DATA[category];

  if (!data) {
    notFound();
  }

  // Fetch from the API for the dynamic brand grid
  const catalog = await fetchRepairCatalog();
  const validBrands = catalog.brands.filter(b => b.category === category);

  // Dynamically split into Popular and Other
  let topBrands;
  let laptopMacBookBrand: typeof validBrands[number] | null = null;
  if (category === 'phone') {
    const PHONE_PRIORITY = ['iPhone', 'Samsung', 'Google', 'Oppo'];
    topBrands = validBrands
      .filter(b => PHONE_PRIORITY.some(pk => b.brand.toLowerCase().includes(pk.toLowerCase())))
      .sort((a, b) => {
        const indexA = PHONE_PRIORITY.findIndex(pk => a.brand.toLowerCase().includes(pk.toLowerCase()));
        const indexB = PHONE_PRIORITY.findIndex(pk => b.brand.toLowerCase().includes(pk.toLowerCase()));
        return indexA - indexB;
      });
  } else if (category === 'laptop') {
    const nonMacBookBrands = validBrands.filter(b => !b.brand.toLowerCase().includes('macbook'));
    const macBookBrands = validBrands.filter(b => b.brand.toLowerCase().includes('macbook'));
    const sortLaptopBrands = (a: typeof validBrands[number], b: typeof validBrands[number]) => {
      const indexA = LAPTOP_PRIORITY_BRANDS.findIndex(pk => a.brand.toLowerCase().includes(pk.toLowerCase()));
      const indexB = LAPTOP_PRIORITY_BRANDS.findIndex(pk => b.brand.toLowerCase().includes(pk.toLowerCase()));
      const normalizedA = indexA === -1 ? LAPTOP_PRIORITY_BRANDS.length : indexA;
      const normalizedB = indexB === -1 ? LAPTOP_PRIORITY_BRANDS.length : indexB;
      if (normalizedA !== normalizedB) return normalizedA - normalizedB;
      return a.brand.localeCompare(b.brand);
    };
    topBrands = nonMacBookBrands.sort(sortLaptopBrands);
    laptopMacBookBrand = macBookBrands.sort(sortLaptopBrands)[0] ?? null;
  } else {
    topBrands = validBrands.filter(b =>
      POPULAR_BRANDS_KEYS.some(pk => b.brand.toLowerCase().includes(pk.toLowerCase()))
    );
  }

  const otherBrands = category === 'laptop'
    ? []
    : validBrands
      .filter(b => !topBrands.some(tb => tb.slug === b.slug))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  const heroMedia = CATEGORY_HERO_MEDIA[category as keyof typeof CATEGORY_HERO_MEDIA];
  const isLaptop = category === 'laptop';
  const isWatch = category === 'watch';
  const isTablet = category === 'tablet';
  const isPhone = category === 'phone';
  const commonProblems = CATEGORY_COMMON_PROBLEMS[category] ?? [];
  const faqPageSchema = buildFaqPageSchema(data.faqs);
  const ringwoodDirectionsHref = 'https://www.google.com/maps/dir/?api=1&destination=Ringwood+Square+Shopping+Centre+Kiosk+C1,+Seymour+St,+Ringwood+VIC+3134';
  const laptopBrandSectionCopy = 'Choose your laptop brand to view supported models, repair options and available pricing. If your model is not listed, contact us for an assessment.';
  const watchBrandSectionCopy = 'Select your exact Apple Watch model to view compatible repair options and current pricing where available.';
  const ringwoodSupportCopy = isWatch
    ? 'We confirm the exact model, device condition, parts availability and practical repair path before quoting timing or starting work. Ali Mobile & Repair operates from Ringwood Square Shopping Centre Kiosk C1, and you can call ahead or book before visiting.'
    : isPhone
    ? 'Ali Mobile & Repair is located at Kiosk C1, Ringwood Square Shopping Centre, Seymour Street, Ringwood VIC 3134. Walk-ins are welcome, and we offer free underground and outdoor parking. Our team provides English, 中文, and 粤语 support. Call 0481 058 514 to confirm parts or timing before travelling.'
    : `Ali Mobile & Repair, Kiosk C1, Ringwood Square Shopping Centre, Seymour Street, Ringwood VIC 3134. Opposite the Bunnings entrance inside Ringwood Square Shopping Centre. Call ahead if you want to confirm parts, timing or the right ${isLaptop ? 'laptop' : isTablet ? 'tablet' : 'phone'} repair path before travelling.`;
  const macBookHubHref = laptopMacBookBrand ? `/repairs/${category}/${laptopMacBookBrand.slug}` : '/repairs/laptop/macbook';

  return (
    <>
      <ServiceSchema
        serviceName={data.schema.serviceName}
        description={data.schema.description}
      />

      <main className="repair-page-shell">
        <nav className="repair-breadcrumb" aria-label="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/repairs">Repairs</Link>
          <span>/</span>
          <strong>{formatDynamicParam(category)} Repair</strong>
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
                { "@type": "ListItem", "position": 3, "name": `${formatDynamicParam(category)} Repair`, "item": `https://www.alimobile.com.au/repairs/${category}` }
              ]
            })
          }}
        />
        {faqPageSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqPageSchema)
            }}
          />
        )}
        <section
          className={`repair-tech-hero repair-tech-hero-${category}`}
          aria-labelledby="category-repair-heading"
        >
          <div className="repair-tech-hero-copy">
            <span className="repair-kicker">
              <Sparkles size={15} strokeWidth={2.4} aria-hidden="true" />
              {data.hero.pillText}
            </span>
            <h1 id="category-repair-heading">{data.hero.title}</h1>
            <p>{data.hero.intro1}</p>
            <div className="repair-hero-actions">
              <Link href="/book-repair" prefetch={true} className="repair-primary-action">
                Book a Repair
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </Link>
              <a href="tel:0481058514" className="repair-secondary-action">
                <PhoneCall size={18} strokeWidth={2.6} aria-hidden="true" />
                0481 058 514
              </a>
              {isLaptop && (
                <a href="#laptop-brands" className="repair-secondary-action">
                  Choose a Brand
                  <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {isLaptop && heroMedia ? (
            <div className="repair-laptop-hero-stack">
              <aside
                className={`repair-exploded-hero repair-exploded-hero-${category}`}
                aria-label={heroMedia.ariaLabel}
                style={{
                  '--hero-media-width': `${heroMedia.width}px`,
                  '--hero-media-height': `${heroMedia.height}px`,
                } as React.CSSProperties}
              >
                <img
                  className="repair-exploded-hero-image"
                  src={heroMedia.image}
                  alt={heroMedia.alt}
                  width={heroMedia.width}
                  height={heroMedia.height}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </aside>
              <div className="repair-laptop-proof-panel" aria-label="Laptop repair support points">
                <div>
                  <span>Windows and MacBook pathways</span>
                  <p>Choose a published model path, or ask us to identify the laptop at the Ringwood kiosk.</p>
                </div>
                <div>
                  <span>Quote-first diagnostics</span>
                  <p>Screen, battery, keyboard, charging and power faults are checked before work begins.</p>
                </div>
                <div>
                  <span>Model-first support</span>
                  <p>Exact model details help us confirm compatible parts, practical timing and the right quote path.</p>
                </div>
              </div>
            </div>
          ) : heroMedia ? (
            <aside
              className={`repair-exploded-hero repair-exploded-hero-${category}`}
              aria-label={heroMedia.ariaLabel}
              style={{
                '--hero-media-width': `${heroMedia.width}px`,
                '--hero-media-height': `${heroMedia.height}px`,
              } as React.CSSProperties}
            >
              <img
                className="repair-exploded-hero-image"
                src={heroMedia.image}
                alt={heroMedia.alt}
                width={heroMedia.width}
                height={heroMedia.height}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </aside>
          ) : (
            <div className="repair-hero-panel" aria-label="Repair service highlights">
              <div>
                <Clock size={20} strokeWidth={2.4} aria-hidden="true" />
                <span>Fast turnaround when parts are in stock</span>
              </div>
              <div>
                <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" />
                <span>No Fix, No Charge diagnostics</span>
              </div>
              <div>
                <MapPin size={20} strokeWidth={2.4} aria-hidden="true" />
                <span>Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134</span>
              </div>
            </div>
          )}
        </section>

        <section
          id={isLaptop ? 'laptop-brands' : 'brands-list'}
          className="repair-content-band"
          aria-labelledby="popular-brands-heading"
        >
          <div className="repair-section-header">
            <span>{isLaptop ? 'Choose your laptop path' : isWatch ? 'Choose your smartwatch brand' : isTablet ? 'Choose your tablet brand' : 'Choose your device path'}</span>
            <h2 id="popular-brands-heading">{isLaptop ? 'Laptop Brands and Model Paths' : isWatch ? 'Smart Watch Brand and Model Paths' : isTablet ? 'Tablet Brands and Model Paths' : 'Most Popular Brands'}</h2>
            <p>
              {isLaptop
                ? laptopBrandSectionCopy
                : isWatch
                  ? watchBrandSectionCopy
                : isTablet
                  ? 'Pick the tablet brand first, then choose your exact model to view compatible services and pricing.'
                : 'Pick the brand first, then choose your exact model for live repair options and pricing.'}
            </p>
          </div>

          {topBrands.length > 0 ? (
            <div className="brand-grid-hero" style={isWatch && topBrands.length === 1 ? { gridTemplateColumns: 'minmax(0, 480px)', justifyContent: 'center' } : undefined}>
              {topBrands.map(b => (
                <Link key={b.slug} href={`/repairs/${category}/${b.slug}`} prefetch={true} className="brand-card-hero">
                  {isWatch && b.slug === 'apple' ? (
                    <div>
                      <span style={{ display: 'block' }}>Apple Watch</span>
                      <small style={{ display: 'block', fontSize: '0.8em', marginTop: '4px', opacity: 0.8, fontWeight: 'normal' }}>
                        Apple Watch repair options currently available
                      </small>
                    </div>
                  ) : (
                    <span>{b.brand}</span>
                  )}
                  <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : validBrands.length === 0 ? (
            <div className="repair-empty-state">
              No active brands available in this category for now.
            </div>
          ) : null}

          {isLaptop ? (
            <Link
              href={macBookHubHref}
              prefetch={true}
              className="repair-macbook-card"
              aria-label="Choose your MacBook model to view repair options and pricing"
            >
              <div className="repair-macbook-card-media">
                <Image
                  className="repair-macbook-card-image"
                  src="/images/services/laptop-repair.jpg"
                  alt="Open MacBook on a repair bench showing the keyboard, logic board, and service tools"
                  width={1024}
                  height={1024}
                  sizes="(max-width: 820px) 100vw, (max-width: 1120px) 40vw, 360px"
                />
              </div>
              <div className="repair-macbook-card-body">
                <span className="repair-macbook-card-kicker">MacBook Air &amp; MacBook Pro</span>
                <h3>MacBook Repair &amp; Price Check</h3>
                <p>Choose your MacBook model to view available screen, battery, keyboard and other repair options, with live pricing where available.</p>
                <span className="repair-macbook-card-link">
                  Choose Your MacBook Model
                  <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ) : otherBrands.length > 0 && (
            <>
              <div className="repair-section-header repair-section-header-compact">
                <span>Extended catalogue</span>
                <h3>Other Supported Brands</h3>
              </div>
              <div className="brand-grid-standard">
                {otherBrands.map(b => (
                  <Link key={b.slug} href={`/repairs/${category}/${b.slug}`} prefetch={true} className="brand-card-standard">
                    {b.brand}
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {isPhone && (
          <ScrollReveal>
            <section className="repair-content-band" aria-labelledby="phone-repair-types-heading">
              <div className="repair-section-header">
                <span>Repair by issue</span>
                <h2 id="phone-repair-types-heading">Common Phone Repair Services</h2>
                <p>Select the repair type that best matches your fault to see details and book.</p>
              </div>
              <div className="repair-type-card-grid" style={{ marginTop: '2rem' }}>
                <Link href="/repairs/screen-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>01</span>
                  <strong>Screen Replacement</strong>
                  <small>Cracked glass or display faults</small>
                </Link>
                <Link href="/repairs/battery-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>02</span>
                  <strong>Battery Replacement</strong>
                  <small>Fast drain or shutdown issues</small>
                </Link>
                <Link href="/repairs/charging-port-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>03</span>
                  <strong>Charging Port Repair</strong>
                  <small>Not charging or loose connection</small>
                </Link>
                <Link href="/repairs/back-glass-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>04</span>
                  <strong>Back Glass & Housing</strong>
                  <small>Cracked rear glass or frame</small>
                </Link>
              </div>
            </section>
          </ScrollReveal>
        )}

        {isTablet && (
          <ScrollReveal>
            <section className="repair-content-band" aria-labelledby="tablet-repair-types-heading">
              <div className="repair-section-header">
                <span>Repair by issue</span>
                <h2 id="tablet-repair-types-heading">Common Tablet Repair Services</h2>
                <p>Choose the repair path that best matches your tablet issue, then we can confirm the exact model, part availability and quote in store.</p>
              </div>
              <div className="repair-type-card-grid" style={{ marginTop: '2rem' }}>
                <Link href="/repairs/screen-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>01</span>
                  <strong>Tablet Screen Repair</strong>
                  <small>For cracked glass, display lines, black screen or touch issues on supported iPad, Samsung Tablet and Lenovo Tablet models.</small>
                </Link>
                <Link href="/repairs/battery-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>02</span>
                  <strong>Tablet Battery Replacement</strong>
                  <small>For fast battery drain, swelling concerns or tablets that shut down unexpectedly after diagnosis.</small>
                </Link>
                <Link href="/repairs/charging-port-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>03</span>
                  <strong>Tablet Charging Port Repair</strong>
                  <small>For tablets that will not charge, charge intermittently, or need charging/no-power diagnosis.</small>
                </Link>
              </div>
            </section>
          </ScrollReveal>
        )}

        {isLaptop && (
          <ScrollReveal>
            <section className="repair-content-band" aria-labelledby="laptop-repair-types-heading">
              <div className="repair-section-header">
                <span>Repair by issue</span>
                <h2 id="laptop-repair-types-heading">Common Laptop Repair Services</h2>
                <p>Start with the closest laptop repair issue, then we can inspect the device and confirm whether it needs parts, cleaning, board-level assessment or a quote-first repair path.</p>
              </div>
              <div className="repair-type-card-grid" style={{ marginTop: '2rem' }}>
                <Link href="/repairs/screen-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>01</span>
                  <strong>Laptop Screen Repair</strong>
                  <small>For cracked panels, display lines, no backlight or screen damage on supported laptop and MacBook models.</small>
                </Link>
                <Link href="/repairs/battery-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>02</span>
                  <strong>Laptop Battery Replacement</strong>
                  <small>For poor battery life, swelling concerns, unexpected shutdowns or battery health issues after inspection.</small>
                </Link>
                <Link href="/repairs/charging-port-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>03</span>
                  <strong>Laptop Charging Repair</strong>
                  <small>For laptops that do not charge, USB-C charging issues, loose ports or power-related diagnosis.</small>
                </Link>
              </div>
            </section>
          </ScrollReveal>
        )}

        {isWatch && (
          <ScrollReveal>
            <section className="repair-content-band" aria-labelledby="watch-repair-types-heading">
              <div className="repair-section-header">
                <span>Repair by issue</span>
                <h2 id="watch-repair-types-heading">Common Watch Repair Services</h2>
                <p>Select the closest watch issue so we can confirm the model, size, part availability and repair path before quoting.</p>
              </div>
              <div className="repair-type-card-grid" style={{ marginTop: '2rem' }}>
                <Link href="/repairs/screen-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>01</span>
                  <strong>Watch Screen Repair</strong>
                  <small>For cracked glass, damaged display, touch issues or black-screen symptoms on supported Apple Watch models.</small>
                </Link>
                <Link href="/repairs/battery-replacement" prefetch={false} className="repair-type-mini-card">
                  <span>02</span>
                  <strong>Watch Battery Replacement</strong>
                  <small>For fast battery drain, sudden shutdowns or battery health concerns after model confirmation.</small>
                </Link>
              </div>
            </section>
          </ScrollReveal>
        )}

        {commonProblems.length > 0 && (
          <ScrollReveal>
            <section className="repair-content-band" aria-labelledby={`${category}-common-problems-heading`}>
              <div className="repair-section-header">
                <span>Common symptoms</span>
                <h2 id={`${category}-common-problems-heading`}>Common {category} problems we assess</h2>
                <p>These symptoms can have more than one cause, so we confirm the model, condition and likely repair path before work begins.</p>
              </div>
              <div className="repair-signal-grid">
                {commonProblems.map((problem, index) => (
                  <article key={problem.title} className="repair-signal-card">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <h3>{problem.title}</h3>
                    <p>{problem.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {isPhone && (
          <ScrollReveal>
            <section className="repair-assist-panel" aria-labelledby="phone-timing-heading">
              <div className="w-full">
                <span className="repair-kicker repair-kicker-muted">Parts and Timing</span>
                <h2 id="phone-timing-heading">How phone diagnosis, parts and timing work</h2>
                <p>We confirm the exact model, condition, and fault first, then explain the compatible repair options and practical timing.</p>
                <div className="repair-signal-grid mt-5">
                  <article className="repair-signal-card">
                    <span>01</span>
                    <h3>Common screen repairs</h3>
                    <p>Most supported iPhone, Samsung and Google Pixel screen replacements can usually be completed in about 30 minutes once the correct part is available. Many supported Oppo screens take about 30–45 minutes.</p>
                  </article>
                  <article className="repair-signal-card">
                    <span>02</span>
                    <h3>Same-day repairs</h3>
                    <p>Around 70% of common phone models are supported by parts that are regularly kept in stock, so many repairs can be completed the same day.</p>
                  </article>
                  <article className="repair-signal-card">
                    <span>03</span>
                    <h3>Parts ordering</h3>
                    <p>Less common models may require a part to be ordered, which usually takes around 1–2 days.</p>
                  </article>
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}

        {isWatch && (
          <>
            <ScrollReveal>
              <section className="repair-content-band" aria-labelledby="watch-model-guidance-heading">
                <div className="repair-section-header">
                  <span>Model identification</span>
                  <h2 id="watch-model-guidance-heading">Why the exact smartwatch model and case size matter</h2>
                  <p>Repair compatibility depends on the exact brand, generation, model and case size before we confirm the right repair option, quote or timing. Apple Watch models currently available on the public path can vary by Series, SE, Ultra and case size.</p>
                </div>
                <div className="repair-signal-grid">
                  <article className="repair-signal-card">
                    <span>01</span>
                    <h3>Apple Watch generation first</h3>
                    <p>Select the available Apple Watch path, then the exact generation or family before comparing repair options.</p>
                  </article>
                  <article className="repair-signal-card">
                    <span>02</span>
                    <h3>Case size affects compatibility</h3>
                    <p>Sizes such as 40mm, 41mm, 42mm, 44mm, 45mm, 46mm and 49mm can change the compatible part and quote path.</p>
                  </article>
                  <article className="repair-signal-card">
                    <span>03</span>
                    <h3>Apple Watch public path</h3>
                    <p>Apple Watch repair options are currently available on the public repair path, with compatibility confirmed by model and case size.</p>
                  </article>
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="repair-content-band" aria-labelledby="watch-common-repairs-heading">
                <div className="repair-section-header">
                  <span>Common repair needs</span>
                  <h2 id="watch-common-repairs-heading">Common smart watch repair paths</h2>
                  <p>Start with the model path that best matches the symptom so we can confirm the compatible repair option and current pricing.</p>
                </div>
                <div className="repair-signal-grid">
                  <article className="repair-signal-card">
                    <span>01</span>
                    <h3>Screen and display replacement</h3>
                    <p>Cracked glass, display faults and touch issues need the exact model and case size before the repair path is confirmed.</p>
                  </article>
                  <article className="repair-signal-card">
                    <span>02</span>
                    <h3>Battery replacement</h3>
                    <p>Battery wear, short runtime and shutdown symptoms are checked against the compatible model-specific battery path.</p>
                  </article>
                  <article className="repair-signal-card">
                    <span>03</span>
                    <h3>Charging or no-power assessment</h3>
                    <p>If the watch is not charging or not turning on, we inspect the fault first before confirming the practical repair option.</p>
                  </article>
                </div>
              </section>
            </ScrollReveal>
          </>
        )}

        {isLaptop && (
          <ScrollReveal>
            <section className="repair-workbench-shell repair-workbench-shell-laptop" aria-labelledby="laptop-workbench-heading">
              <div className="repair-workbench-heading">
                <span>Laptop repair workbench</span>
                <h2 id="laptop-workbench-heading">How we handle laptop repairs</h2>
                <p>Tell us the laptop brand, model and symptoms. We inspect the fault, explain the repair path, and only begin work after you approve the option.</p>
              </div>

              <div className="repair-workbench-grid">
                <details className="repair-workbench-box">
                  <summary>
                    <span className="repair-workbench-number">01</span>
                    <h3>Which laptop path fits your device?</h3>
                    <span className="repair-workbench-chevron" aria-hidden="true" />
                  </summary>
                  <div className="repair-workbench-box-content">
                    <article className="repair-workbench-mini-card">
                      <h3>Windows laptop repair</h3>
                      <p>Supported non-Apple laptop models can start with brand and model selection when a reviewed pathway is published.</p>
                      <span>Best for</span>
                      <p>Screen, battery, keyboard, charging and power problems on non-Apple laptops.</p>
                      <small>Choose a published brand path above, or bring the device in for identification and assessment.</small>
                    </article>
                    <article className="repair-workbench-mini-card">
                      <h3>MacBook repair pathway</h3>
                      <p>Apple laptops stay on the dedicated MacBook hub so the broad laptop page remains focused on the wider category.</p>
                      <span>Best for</span>
                      <p>MacBook screens, batteries, keyboards, trackpads and charging faults.</p>
                      <small>Use the separate MacBook page when your laptop is an Apple notebook.</small>
                    </article>
                    <article className="repair-workbench-mini-card">
                      <h3>Laptop assessment first</h3>
                      <p>If the fault is unclear, a face-to-face assessment helps confirm the problem before any work starts.</p>
                      <span>Best for</span>
                      <p>No power, intermittent startup, overheating, liquid exposure or mixed symptoms.</p>
                      <small>We explain the likely repair path before parts are ordered.</small>
                    </article>
                  </div>
                </details>

                <details className="repair-workbench-box">
                  <summary>
                    <span className="repair-workbench-number">02</span>
                    <h3>What do we check before quoting?</h3>
                    <span className="repair-workbench-chevron" aria-hidden="true" />
                  </summary>
                  <div className="repair-workbench-box-content">
                    <article className="repair-workbench-step-card">
                      <span>01</span>
                      <div>
                        <h3>Confirm brand, model and symptoms</h3>
                        <p>Tell us the exact laptop or bring it in so we can identify it from the label or model markings.</p>
                      </div>
                    </article>
                    <article className="repair-workbench-step-card">
                      <span>02</span>
                      <div>
                        <h3>Inspect the obvious fault areas</h3>
                        <p>We check screen, battery, keyboard, charging, power and visible damage before making a recommendation.</p>
                      </div>
                    </article>
                    <article className="repair-workbench-step-card">
                      <span>03</span>
                      <div>
                        <h3>Explain repair options and parts</h3>
                        <p>We outline the practical path, likely parts and whether anything needs to be ordered.</p>
                      </div>
                    </article>
                    <article className="repair-workbench-step-card">
                      <span>04</span>
                      <div>
                        <h3>Start only after approval</h3>
                        <p>Work begins once you agree to the option and timing that suits you.</p>
                      </div>
                    </article>
                    <article className="repair-workbench-step-card">
                      <span>05</span>
                      <div>
                        <h3>Test before handover</h3>
                        <p>We check power, charging, display, keyboard or other repaired functions before you collect.</p>
                      </div>
                    </article>
                  </div>
                </details>

                <details className="repair-workbench-box">
                  <summary>
                    <span className="repair-workbench-number">03</span>
                    <h3>Which symptoms matter most?</h3>
                    <span className="repair-workbench-chevron" aria-hidden="true" />
                  </summary>
                  <div className="repair-workbench-box-content">
                    <article className="repair-workbench-mini-card">
                      <h3>Cracked or damaged screen</h3>
                      <p>Bring the laptop in for model identification and a screen-path assessment before any replacement is quoted.</p>
                    </article>
                    <article className="repair-workbench-mini-card">
                      <h3>Battery not holding charge</h3>
                      <p>We check whether the battery is failing or whether another fault is affecting charging and power delivery.</p>
                    </article>
                    <article className="repair-workbench-mini-card">
                      <h3>Keyboard or key failure</h3>
                      <p>Some keyboards are repairable, while others need a top-case or related part depending on model.</p>
                    </article>
                    <article className="repair-workbench-mini-card">
                      <h3>Charging or power problems</h3>
                      <p>Loose ports, debris, cable faults and board-level issues can look similar at first.</p>
                    </article>
                    <article className="repair-workbench-mini-card">
                      <h3>Overheating or fan noise</h3>
                      <p>We inspect cooling, dust and thermal behaviour before discussing service options.</p>
                    </article>
                    <article className="repair-workbench-mini-card">
                      <h3>Liquid exposure or no power</h3>
                      <p>Liquid damage needs diagnosis first so we can explain the realistic repair path and risks.</p>
                    </article>
                  </div>
                </details>

                <details className="repair-workbench-box">
                  <summary>
                    <span className="repair-workbench-number">04</span>
                    <h3>What affects timing and warranty?</h3>
                    <span className="repair-workbench-chevron" aria-hidden="true" />
                  </summary>
                  <div className="repair-workbench-box-content">
                    <article className="repair-workbench-mini-card">
                      <h3>Parts availability</h3>
                      <p>Some jobs move faster when the right part is already on hand. Others need ordering first.</p>
                    </article>
                    <article className="repair-workbench-mini-card">
                      <h3>Model and fault complexity</h3>
                      <p>The exact laptop model and the type of fault determine the repair path and timing.</p>
                    </article>
                    <article className="repair-workbench-mini-card">
                      <h3>Warranty depends on the repair</h3>
                      <p>Warranty coverage depends on the job and the part selected, and we confirm it before you approve the work.</p>
                    </article>
                    <article className="repair-workbench-mini-card">
                      <h3>Data and liquid-damage caution</h3>
                      <p>We work carefully, but any repair can carry risk, especially where liquid damage or instability is already present.</p>
                    </article>
                  </div>
                </details>
              </div>
            </section>
          </ScrollReveal>
        )}

        <ScrollReveal>
          <section className="repair-assist-panel" aria-labelledby="model-help-heading">
            <div>
              <span className="repair-kicker repair-kicker-muted">
                <MessageCircle size={15} strokeWidth={2.4} aria-hidden="true" />
                Ringwood Square kiosk
              </span>
              <h2 id="model-help-heading">{isWatch ? 'Diagnosis, parts and Ringwood support' : 'Visit us in Ringwood Square'}</h2>
              <p>
                {ringwoodSupportCopy}
              </p>
            </div>
            <div className="repair-assist-actions">
              <Link href="/book-repair" prefetch={true} className="repair-primary-action">
                Book a Repair
              </Link>
              <a href={ringwoodDirectionsHref} className="repair-secondary-action" target="_blank" rel="noopener noreferrer">
                Get Directions
              </a>
              <a href="tel:0481058514" className="repair-secondary-action">
                Call 0481 058 514
              </a>
            </div>
          </section>
        </ScrollReveal>

        {isTablet && (
          <ScrollReveal>
            <section className="repair-assist-panel" aria-labelledby="tablet-diagnostic-heading">
              <div className="w-full">
                <span className="repair-kicker repair-kicker-muted">Tablet support</span>
                <h2 id="tablet-diagnostic-heading">Diagnosis, quoting, and repair process</h2>
                <p>
                  We confirm the exact tablet model, device condition, and part availability before finalising the quote and timing.
                </p>
                <div className="repair-signal-grid mt-5">
                  <article className="repair-signal-card">
                    <span>01</span>
                    <h3>Why exact brand and model matter</h3>
                    <p>Display assemblies, batteries, and connectors differ by brand, model, generation, screen size, and Cellular/Wi-Fi variant.</p>
                  </article>
                  <article className="repair-signal-card">
                    <span>02</span>
                    <h3>Common repair paths</h3>
                    <p>We support screen or display replacement, battery replacement, and charging/no-power diagnostic assessments.</p>
                  </article>
                  <article className="repair-signal-card">
                    <span>03</span>
                    <h3>Parts and timing</h3>
                    <p>Timing depends on model, stock, queue, device condition, and adhesive curing requirements. Some repairs are faster when parts are in stock.</p>
                  </article>
                  <article className="repair-signal-card">
                    <span>04</span>
                    <h3>Ringwood service</h3>
                    <p>We operate from Ringwood Square Shopping Centre Kiosk C1. Call or book online before you travel.</p>
                  </article>
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}

        <ScrollReveal>
          <section className="repair-content-band" aria-labelledby="why-choose-heading">
            <div className="repair-section-header">
              <span>Repair clarity</span>
              <h2 id="why-choose-heading">{isWatch ? 'How smart watch quotes, timing and water-resistance limits work' : isTablet ? 'Why Choose Our Tablet Repair Service?' : isLaptop ? 'Why Choose Our Laptop Hub?' : 'Why Choose Our Service?'}</h2>
              <p>{isWatch ? 'Quotes and repair timing depend on the exact model, the condition of the watch and the parts path we confirm after inspection.' : isTablet ? 'We carefully identify your tablet model before confirming repair compatibility.' : data.hero.intro2}</p>
            </div>

            <div className="repair-signal-grid">
              {data.features.map((f: any, idx: number) => (
                <article key={idx} className="repair-signal-card">
                  <span>{String(idx + 1).padStart(2, '0')}</span>
                  <h3>{f.t}</h3>
                  <p>{f.d ? f.d : 'We confirm repair options after checking your model, symptoms and part availability.'}</p>
                </article>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {isWatch || isTablet ? (
          <ScrollReveal>
            <section className="repair-content-band" aria-labelledby="pricing-guidance-heading">
              <div className="repair-section-header">
                <span>Model-first pricing</span>
                <h2 id="pricing-guidance-heading">{isWatch ? 'Select your Apple Watch model to view current pricing' : 'Select your brand and model to view current pricing'}</h2>
                <p>{isTablet ? 'Tablet repair compatibility and pricing are confirmed from the exact brand and model path. Choose your tablet brand above to view compatible options.' : 'Watch repair compatibility and pricing are confirmed from the exact brand and model path. Choose the available Apple Watch pathway above to view compatible repair options and current pricing.'}</p>
              </div>
            </section>
          </ScrollReveal>
        ) : (
          <ScrollReveal>
            <LivePricingGrid
              title={data.pricing.title}
              deviceType={data.pricing.deviceType}
              defaultItems={data.pricing.items}
            />
          </ScrollReveal>
        )}

        <HubRepairResultsSection
          category={category as RepairResultDeviceCategory}
          scope="repair-hub"
        />

        <ScrollReveal>
          <section className="repair-content-band" aria-labelledby="category-faq-heading">
            <div className="repair-section-header">
              <span>FAQ</span>
              <h2 id="category-faq-heading">Frequently Asked Questions</h2>
            </div>
            <div className="repair-faq-grid">
              {data.faqs.map((faq: any, index: number) => (
                <article key={index} className="repair-faq-card">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <div className="repair-final-cta">
            <Link href="/book-repair" prefetch={true} className="repair-primary-action">
              Book Your {category.charAt(0).toUpperCase() + category.slice(1)} Repair
            </Link>
          </div>
        </ScrollReveal>

        <FloatingJumpCTA
          targetId={isLaptop ? 'laptop-brands' : 'brands-list'}
          label="Choose Your Brand"
        />
      </main>
    </>
  );
}
