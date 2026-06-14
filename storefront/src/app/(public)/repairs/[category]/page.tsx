import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import ScrollReveal from '@/components/ScrollReveal';
import { fetchRepairCatalog } from '@/lib/api';
import { formatDynamicParam, safeSlugSegment } from '@/lib/inventoryUtils';
import { ArrowRight, Clock, MapPin, MessageCircle, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
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
      title: 'Phone Repair Ringwood | Fast Screen and Battery Fixes | Ali Mobile & Repair',
      description: 'Phone repairs in Ringwood for iPhone, Samsung, Google Pixel, Oppo, and more. Same-day options may be available for common screen and battery repairs when parts are in stock.',
    },
    hero: {
      pillType: 'primary',
      pillText: 'Phone Specialist',
      title: 'Phone & iPhone Repair in Ringwood, Melbourne',
      intro1: 'At Ali Mobile Repair, we specialize in high-quality iPhone and Android screen replacements. Centrally located in Ringwood, we are the go-to repair shop for the Eastern Suburbs including Croydon, Mitcham, Heathmont, and Wantirna.',
      intro2: 'Most common screen and battery repairs can be completed the same day when parts are in stock. We confirm timing after checking the model, part availability, repair queue, and device condition.',
    },
    schema: {
      serviceName: 'Phone Repair Services Ringwood',
      description: "Expert phone repair services for iPhone, Samsung, Pixel, and Oppo serving Melbourne's Eastern Suburbs. Same-day options may be available for common screen and battery repairs when parts are in stock.",
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
      { question: "Do you offer same-day phone repairs?", answer: "Most common phone screen and battery repairs can be completed the same day when parts are in stock. We confirm timing after checking your model, part availability, repair queue, and device condition." },
      { question: "How long does a typical phone screen repair take at your Ringwood store?", answer: "Many common phone screen repairs are completed quickly while you wait, but timing depends on the model and the device condition. We are centrally located in Ringwood, making us a quick drive from Croydon, Mitcham, Heathmont, and Wantirna." },
      { question: "Will I lose my data during the repair process?", answer: "Data is normally not affected during standard screen or battery repairs, but we recommend backing up first whenever possible." },
      { question: "What is your warranty on phone repairs?", answer: "We proudly offer a 180-day comprehensive warranty on all parts and labor. If you experience any technical faults related to the repair within this 6-month period, warranty support depends on the fault confirmed at inspection and whether it relates to the completed repair." },
      { question: "Which phone brands do you repair?", answer: "We support major brands including Apple iPhone, Samsung Galaxy, Google Pixel, Oppo, and Huawei. Call ahead if you want part availability checked before visiting." }
    ]
  },
  tablet: {
    metadata: {
      title: 'iPad & Tablet Repair Ringwood | Battery & Screen Fixes | Ali Mobile & Repair',
      description: 'Tablet repairs in Ringwood for iPad and Samsung Tab. Same-day options may be available for common repairs when parts are in stock.',
    },
    hero: {
      pillType: 'primary',
      pillText: 'Tablet Specialist',
      title: 'Professional Tablet & iPad Repairs in Ringwood',
      intro1: 'From shattered iPad touch glasses to unresponsive Samsung Tabs batteries, we provide expert hardware repairs for the Eastern Suburbs including Croydon, Mitcham, and Wantirna.',
      intro2: 'Common screen and battery repairs may be completed the same day when parts are in stock. We confirm timing after checking the model, part availability, repair queue, and device condition.',
    },
    schema: {
      serviceName: 'Tablet & iPad Repair Services Ringwood',
      description: "Professional iPad and tablet repair services in Ringwood, Melbourne. Expert screen and battery replacements for supported models.",
    },
    features: [
      { t: "Same-day options when parts are in stock", d: "Timing is confirmed after model, part, and queue checks." },
      { t: "Quality replacement batteries", d: "Selected for compatible tablet models and confirmed before repair." },
      { t: "Detailed diagnostic checks prior to repair", d: "" },
      { t: "180-Day Comprehensive Warranty Coverage", d: "" }
    ],
    pricing: {
      title: "Popular Tablet Repair Pricing",
      deviceType: "tablet",
      items: [
        { model: "iPad 10th Gen", service: "Screen replacement", price: 170, search: "ipad 10 screen" },
        { model: "iPad 7 / 8 / 9", service: "Screen replacement", price: 130, search: "ipad 7 screen" },
        { model: "iPad 6", service: "Screen replacement", price: 120, search: "ipad 6 screen" },
        { model: "iPad 7 / 8 / 9", service: "Battery replacement", price: 110, search: "ipad 7 battery" },
        { model: "iPad 6", service: "Battery replacement", price: 90, search: "ipad 6 battery" },
      ]
    },
    faqs: [
      { question: "Do you repair cracked iPad screens in Ringwood?", answer: "Yes, we specialize in iPad screen repairs right here in Ringwood. Whether you only need the top glass or the entire LCD assembly replaced, same-day options may be available when parts are in stock." },
      { question: "What kind of replacement batteries do you use for tablets?", answer: "We use compatible replacement batteries selected for the model and confirm the available option before repair." },
      { question: "How long does an iPad repair take?", answer: "Many common iPad repairs can be completed the same day when parts are in stock, but timing depends on adhesive curing, model, repair queue, and device condition." },
      { question: "What is your warranty policy for tablet repairs?", answer: "Tablet screen and battery replacements are backed by our 180-day warranty. Warranty support depends on the fault confirmed at inspection and whether it relates to the completed repair." },
      { question: "Is my tablet data safe during the repair?", answer: "Data is normally not affected during standard screen or battery repairs, but we recommend backing up first whenever possible." }
    ]
  },
  laptop: {
    metadata: {
      title: 'Laptop Repair Ringwood | Screen, Battery & Keyboard Service',
      description: 'Ali Mobile & Repair at Ringwood Square provides laptop screen, battery, keyboard, charging and diagnostic support for Windows laptops and MacBooks. Choose your brand or request an assessment before you travel.',
    },
    hero: {
      pillType: 'warning',
      pillText: 'Laptop Repair Hub',
      title: 'Laptop Repair in Ringwood',
      intro1: 'Need help with a Windows laptop or MacBook? We inspect the fault first, explain the repair path, and help you choose the right brand, model or assessment before any work begins.',
      intro2: 'Common laptop screen and battery jobs may move faster when parts are in stock, but timing always depends on the exact model, the fault, parts availability and final testing.',
    },
    schema: {
      serviceName: 'Laptop Repair Services Ringwood',
      description: 'Broad laptop repair services in Ringwood for Windows laptops and MacBooks. Screen, battery, keyboard, charging, power and diagnostic support.',
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
      title: 'Apple Watch Repair Ringwood | Battery & Screen Replace | Ali Mobile',
      description: 'Apple Watch repairs in Ringwood, serving Mitcham and Croydon. Same-day options may be available for common screen or battery repairs when parts are in stock.',
    },
    hero: {
      pillType: 'accent',
      pillText: 'Watch Specialist',
      title: 'Premium Smart Watch Repairs in Ringwood',
      intro1: 'Shattered Apple Watch screen? Battery not lasting through the day? We specialize in precision repairs for all Apple Watch models, proudly servicing Ringwood, Croydon, Mitcham, and Wantirna.',
      intro2: 'Common watch screen and battery repairs may be available same day when parts are in stock. We confirm timing after checking the model, repair queue, and device condition.',
    },
    schema: {
      serviceName: 'Smart Watch Repair Services Ringwood',
      description: "Professional Apple Watch and smart watch repair services in Ringwood, Melbourne. Same-day options may be available for common screen and battery repairs when parts are in stock.",
    },
    features: [
      { t: "Same-day options when parts are in stock", d: "Timing is confirmed after model, part, and queue checks." },
      { t: "Precision Tools & Specialised Press Equipment", d: "" },
      { t: "High-quality adhesive seals", d: "" },
      { t: "180-Day Warranty on parts and labour", d: "" }
    ],
    pricing: {
      title: "Smart Watch Repair Pricing",
      deviceType: "watch",
      items: [
        { model: "Apple Watch Ultra / Ultra 2", service: "Display Assembly Fix", price: 499 },
        { model: "Apple Watch Series 9 / 8 / 7", service: "Glass & OLED replacement", price: 249 },
        { model: "Apple Watch SE", service: "Screen replacement", price: 169 },
        { model: "All Series Models", service: "Battery replacement", price: 79 },
        { model: "Watch Face", service: "Rear Housing Glass Repair", price: 120 },
      ]
    },
    faqs: [
      { question: "Do you offer weekday same-day Apple Watch repairs in Ringwood?", answer: "Same-day turnaround may be available when the screen or battery is in stock. We confirm timing after checking the model, repair queue, and device condition." },
      { question: "What should I do if my Apple Watch won't turn on?", answer: "First, try a forced restart. If it still won't hold a charge, the battery may need replacing. Battery degradation is normal over time, and inspection helps confirm the right repair option." },
      { question: "How long does an Apple Watch screen repair take?", answer: "Apple Watch screen repair timing depends on the model, part availability, sealing requirements, repair queue, and device condition." },
      { question: "Will my Apple Watch remain water resistant after repair?", answer: "Water resistance cannot be guaranteed after opening. We reseal carefully, but recommend avoiding submersion after repair." },
      { question: "Is it worth repairing my smartwatch?", answer: "Absolutely! Battery or screen replacements are highly cost-effective compared to buying a brand new Apple Watch Series or Ultra. Bring it in for a quote!" }
    ]
  }
};

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
  const laptopDirectionsHref = 'https://www.google.com/maps/dir/?api=1&destination=Ringwood+Square+Shopping+Centre+Kiosk+C1,+Seymour+St,+Ringwood+VIC+3134';
  const laptopBrandSectionCopy = 'Choose your laptop brand to view supported models, repair options and available pricing. If your model is not listed, contact us for an assessment.';
  const macBookHubHref = laptopMacBookBrand ? `/repairs/${category}/${laptopMacBookBrand.slug}` : '/repairs/laptop/macbook';

  return (
    <>
      <ServiceSchema
        serviceName={data.schema.serviceName}
        description={data.schema.description}
      />

      <main className="repair-page-shell">
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
                  <span>Ringwood Square location</span>
                  <p>Kiosk C1, Seymour Street, Ringwood VIC 3134, opposite the Bunnings entrance.</p>
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
          id={isLaptop ? 'laptop-brands' : undefined}
          className="repair-content-band"
          aria-labelledby="popular-brands-heading"
        >
          <div className="repair-section-header">
            <span>{isLaptop ? 'Choose your laptop path' : 'Choose your device path'}</span>
            <h2 id="popular-brands-heading">{isLaptop ? 'Laptop Brands and Model Paths' : 'Most Popular Brands'}</h2>
            <p>
              {isLaptop
                ? laptopBrandSectionCopy
                : 'Pick the brand first, then choose your exact model for live repair options and pricing.'}
            </p>
          </div>

          {topBrands.length > 0 ? (
            <div className="brand-grid-hero">
              {topBrands.map(b => (
                <Link key={b.slug} href={`/repairs/${category}/${b.slug}`} prefetch={true} className="brand-card-hero">
                  <span>{b.brand}</span>
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
              <h2 id="model-help-heading">Visit us in Ringwood Square</h2>
              <p>Ali Mobile &amp; Repair, Kiosk C1, Ringwood Square Shopping Centre, Seymour Street, Ringwood VIC 3134. Opposite the Bunnings entrance inside Ringwood Square Shopping Centre. Call ahead if you want to confirm parts, timing or the right laptop path before travelling.</p>
            </div>
            <div className="repair-assist-actions">
              <Link href="/book-repair" prefetch={true} className="repair-primary-action">
                Book a Repair
              </Link>
              <a href={laptopDirectionsHref} className="repair-secondary-action" target="_blank" rel="noopener noreferrer">
                Get Directions
              </a>
              <a href="tel:0481058514" className="repair-secondary-action">
                Call 0481 058 514
              </a>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className="repair-content-band" aria-labelledby="why-choose-heading">
            <div className="repair-section-header">
              <span>Repair clarity</span>
              <h2 id="why-choose-heading">Why Choose Our Laptop Hub?</h2>
              <p>{data.hero.intro2}</p>
            </div>

            <div className="repair-signal-grid">
              {data.features.map((f: any, idx: number) => (
                <article key={idx} className="repair-signal-card">
                  <span>{String(idx + 1).padStart(2, '0')}</span>
                  <h3>{f.t}</h3>
                  <p>{f.d ? f.d : 'Included standard with our service.'}</p>
                </article>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Live Pricing Section fetches from Backend */}
        <ScrollReveal>
          <LivePricingGrid
            title={data.pricing.title}
            deviceType={data.pricing.deviceType}
            defaultItems={data.pricing.items}
          />
        </ScrollReveal>

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
      </main>
    </>
  );
}
