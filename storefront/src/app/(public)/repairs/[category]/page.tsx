import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import ChatNowButton from '@/components/ChatNowButton';
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
      title: 'Laptop & MacBook Repair Ringwood | SSD Upgrades & Screen Replacement',
      description: 'Laptop repairs in Ringwood for MacBook and PC models. Same-day options may be available for common screen or battery work when parts are in stock.',
    },
    hero: {
      pillType: 'warning',
      pillText: 'Certified Technicians',
      title: 'Expert MacBook & Laptop Repairs in Ringwood',
      intro1: "Whether it's hardware failures or software glitches, we inspect the issue and explain practical repair options. We serve Maroondah, Croydon, Mitcham, and Heathmont with high-quality screen replacements and data recovery assessment where possible.",
      intro2: 'Same-day options may be available for common screen and battery repairs when parts are in stock. We confirm timing after checking the model, part availability, repair queue, and device condition.',
    },
    schema: {
      serviceName: 'Computer & MacBook Repair Services Ringwood',
      description: "Professional MacBook and laptop repair services in Ringwood, Melbourne. Expert hardware upgrades, screen repairs, and motherboard troubleshooting.",
    },
    features: [
      { t: "Same-day options when parts are in stock", d: "Available for common screens and batteries after model and queue checks." },
      { t: "Expert Data Preservation protocols", d: "" },
      { t: "Component-level motherboard repairs", d: "" },
      { t: "Local Eastern Suburbs Shop at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134", d: "" }
    ],
    pricing: {
      title: "Popular Computer Repair Pricing",
      deviceType: "computer",
      items: [
        { model: "MacBook Air (M1/M2)", service: "LCD Screen Replacement", price: 549 },
        { model: "MacBook Pro 13\"", service: "Battery replacement", price: 199 },
        { model: "Windows Gaming Laptop", service: "Fan / Thermal Maintenance", price: 89 },
        { model: "Universal Laptop", service: "Keyboard / Trackpad Repair", price: 149 },
        { model: "Desktop / Mac", service: "OS Reinstall & Data Recovery", price: 120 },
      ]
    },
    faqs: [
      { question: "Do you repair liquid damaged MacBooks in Ringwood?", answer: "Yes, we inspect liquid-damaged MacBooks for logic board cleaning and component-level repair options. The sooner you bring it in, the better the chance of limiting corrosion, but inspection is required before quoting timing or outcome." },
      { question: "Can you fix a laptop screen on the same day?", answer: "Many common MacBook and laptop screens can be completed the same day when the part is in stock. We confirm timing after checking the model, repair queue, and device condition." },
      { question: "Why is my laptop running so slowly?", answer: "Sluggish performance is often caused by a nearly full hard drive, insufficient RAM, or outdated software. We offer complete diagnostic checks and can recommend quick hardware upgrades to boost your speed." },
      { question: "My laptop is overheating—is this bad?", answer: "Yes, constant overheating can lead to permanent component degradation and random shutdowns. Bring it to our Ringwood shop for thermal repasting and internal fan cleaning to protect your investment." },
      { question: "Can I upgrade my laptop's RAM or storage?", answer: "In most Windows laptops and older MacBooks, yes! Upgrading from an old hard drive to a modern solid-state drive (SSD) is the most cost-effective way to speed up your machine." }
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
    topBrands = validBrands.filter(b => b.brand.toLowerCase().includes('macbook'));
  } else {
    topBrands = validBrands.filter(b =>
      POPULAR_BRANDS_KEYS.some(pk => b.brand.toLowerCase().includes(pk.toLowerCase()))
    );
  }

  const otherBrands = validBrands
    .filter(b => !topBrands.some(tb => tb.slug === b.slug))
    .sort((a, b) => a.brand.localeCompare(b.brand));
  const heroMedia = CATEGORY_HERO_MEDIA[category as keyof typeof CATEGORY_HERO_MEDIA];

  return (
    <>
      <ServiceSchema
        serviceName={data.schema.serviceName}
        description={data.schema.description}
        faqs={data.faqs}
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
                Get a Live Quote
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </Link>
              <a href="tel:0481058514" className="repair-secondary-action">
                <PhoneCall size={18} strokeWidth={2.6} aria-hidden="true" />
                0481 058 514
              </a>
            </div>
          </div>

          {heroMedia ? (
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

        <section className="repair-content-band" aria-labelledby="popular-brands-heading">
          <div className="repair-section-header">
            <span>Choose your device path</span>
            <h2 id="popular-brands-heading">Most Popular Brands</h2>
            <p>Pick the brand first, then choose your exact model for live repair options and pricing.</p>
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
          ) : validBrands.length === 0 && (
            <div className="repair-empty-state">
              No active brands available in this category for now.
            </div>
          )}

          {category !== 'laptop' && otherBrands.length > 0 && (
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

        <ScrollReveal>
          <section className="repair-assist-panel" aria-labelledby="model-help-heading">
            <div>
              <span className="repair-kicker repair-kicker-muted">
                <MessageCircle size={15} strokeWidth={2.4} aria-hidden="true" />
                Model check
              </span>
              <h2 id="model-help-heading">Not sure which model you have?</h2>
              <p>Use our Live Quote tool or call us. We can identify your device and give you a practical price before you travel.</p>
            </div>
            <div className="repair-assist-actions">
              <Link href="/book-repair" prefetch={true} className="repair-primary-action">
                Get a Live Quote
              </Link>
              <ChatNowButton className="repair-secondary-action" />
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className="repair-content-band" aria-labelledby="why-choose-heading">
            <div className="repair-section-header">
              <span>Repair clarity</span>
              <h2 id="why-choose-heading">Why Choose Us?</h2>
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
