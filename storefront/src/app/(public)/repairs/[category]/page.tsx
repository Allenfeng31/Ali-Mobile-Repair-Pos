import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import ChatNowButton from '@/components/ChatNowButton';
import { fetchRepairCatalog } from '@/lib/api';
import { formatDynamicParam } from '@/lib/inventoryUtils';
import { ArrowRight, Clock, MapPin, MessageCircle, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const CATEGORIES = ['phone', 'tablet', 'laptop', 'watch'];

// Predefined priority brands for UI highlighting (Most Popular section)
const POPULAR_BRANDS_KEYS = [
  'iPhone', 'iPad', 'Samsung', 'Google', 'Apple',
  'Microsoft', 'Dell', 'HP', 'Lenovo', 'Asus'
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
      title: 'Phone Repair Ringwood | Weekday Same Day Fix | Ali Mobile & Repair',
      description: 'Fast phone repairs in Ringwood, servicing Croydon, Mitcham, and Heathmont. Weekday same-day screen and battery replacements for iPhone, Samsung, and Pixel with 180-day warranty.',
    },
    hero: {
      pillType: 'primary',
      pillText: 'Phone Specialist',
      title: 'Phone & iPhone Repair in Ringwood, Melbourne',
      intro1: 'At Ali Mobile Repair, we specialize in high-quality iPhone and Android screen replacements. Centrally located in Ringwood, we are the go-to repair shop for the Eastern Suburbs including Croydon, Mitcham, Heathmont, and Wantirna.',
      intro2: 'Take advantage of our Weekday Same-Day repair service! If we have the parts in stock, screen and battery replacements take just 15-30 minutes, and all other repairs are completed quickly! Even if we need to quickly source a part locally, we still guarantee it will be completed the exact same day!',
    },
    schema: {
      serviceName: 'Phone Repair Services Ringwood',
      description: "Expert phone repair services for iPhone, Samsung, Pixel, and Oppo serving Melbourne's Eastern Suburbs. Weekday same-day screen and battery replacements.",
    },
    features: [
      { t: "Weekday Same-Day Repair Guarantee", d: "We ensure same-day completion." },
      { t: "Premium Quality Screens & Parts Available", d: "" },
      { t: "On-the-spot Repair (15-30 min for screens and batteries)", d: "" },
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
      { question: "Do you offer same-day phone repairs?", answer: "Absolutely! During any weekday, if we have the parts in stock, repairs take just 15-30 minutes. If we need to source a specific component from our local suppliers, we still guarantee the repair will be completed on the exact same day!" },
      { question: "How long does a typical phone screen repair take at your Ringwood store?", answer: "Most phone screen repairs are completed in 15 to 30 minutes while you wait. We are centrally located in Ringwood, making us a quick drive from Croydon, Mitcham, Heathmont, and Wantirna." },
      { question: "Will I lose my data during the repair process?", answer: "In 99% of cases, your data remains perfectly safe during screen or battery replacements. However, we always recommend performing a backup before any repair service as a standard safety precaution." },
      { question: "What is your warranty on phone repairs?", answer: "We proudly offer a 180-day comprehensive warranty on all parts and labor. If you experience any technical faults related to the repair within this 6-month period, we will fix it completely free of charge." },
      { question: "Which phone brands do you repair?", answer: "We specialize in all major brands including Apple iPhone, Samsung Galaxy, Google Pixel, Oppo, and Huawei. Because we stock parts locally, we can fix these brands immediately on any weekday." }
    ]
  },
  tablet: {
    metadata: {
      title: 'iPad & Tablet Repair Ringwood | OEM Battery & Screen Fixes | Ali Mobile & Repair',
      description: 'Fast iPad and Samsung Tab repairs in Ringwood, serving Croydon and Mitcham. Weekday same-day repairs, OEM standard batteries, and 180-day warranty.',
    },
    hero: {
      pillType: 'primary',
      pillText: 'Tablet Specialist',
      title: 'Professional Tablet & iPad Repairs in Ringwood',
      intro1: 'From shattered iPad touch glasses to unresponsive Samsung Tabs batteries, we provide expert hardware repairs for the Eastern Suburbs including Croydon, Mitcham, and Wantirna.',
      intro2: 'Take advantage of our Weekday Same-Day repair service! If we have the parts in stock, screen and battery replacements take just 1-2 hours, and all other repairs are completed quickly! We carry OEM-grade parts and can return your iPad the exact same day.',
    },
    schema: {
      serviceName: 'Tablet & iPad Repair Services Ringwood',
      description: "Professional iPad and tablet repair services in Ringwood, Melbourne. Expert screen and OEM battery replacements for all makes and models.",
    },
    features: [
      { t: "Weekday Same-Day Repair", d: "Get your tablet back the same day." },
      { t: "OEM Standard Batteries", d: "Exactly the same quality and lifespan as original batteries." },
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
      { question: "Do you repair cracked iPad screens in Ringwood?", answer: "Yes, we specialize in iPad screen repairs right here in Ringwood. Whether you only need the top glass or the entire LCD assembly replaced, we offer fast, high-quality same-day service during weekdays." },
      { question: "What kind of replacement batteries do you use for tablets?", answer: "We use strictly OEM (Original Equipment Manufacturer) standard batteries for all tablet and iPad replacements. The quality and lifespan of our batteries are completely identical to the original battery your tablet came with." },
      { question: "How long does an iPad repair take?", answer: "Most iPad repairs are completed within 1-2 hours. Because iPads are sealed with strong adhesive, we take extra time to ensure the device is properly bonded and cured. Drop it off during a weekday and get it back the same day!" },
      { question: "What is your warranty policy for tablet repairs?", answer: "All tablet screen and battery replacements are backed by our 180-day comprehensive warranty. If the part malfunctions within 6 months, simply bring it back to our Ringwood shop for a free replacement." },
      { question: "Is my tablet data safe during the repair?", answer: "Your data is perfectly safe during hardware repairs like screen and battery swaps. We do not access or wipe your data. However, we always recommend cloud backups (like iCloud or Google Drive) before coming in." }
    ]
  },
  laptop: {
    metadata: {
      title: 'Laptop & MacBook Repair Ringwood | SSD Upgrades & Screen Replacement',
      description: 'Expert MacBook Air, MacBook Pro, and PC laptop repairs in Ringwood serving Mitcham and Croydon. Weekday same-day repairs, SSD upgrades, and logic board fixes.',
    },
    hero: {
      pillType: 'warning',
      pillText: 'Certified Technicians',
      title: 'Expert MacBook & Laptop Repairs in Ringwood',
      intro1: "Whether it's hardware failures or software glitches, we fix them all. We serve Maroondah, Croydon, Mitcham, and Heathmont with high-quality screen replacements and data recovery.",
      intro2: 'Take advantage of our Weekday Same-Day repair service! Screen and battery replacements are completed in just a few hours. Other hardware repairs are also completed quickly!',
    },
    schema: {
      serviceName: 'Computer & MacBook Repair Services Ringwood',
      description: "Professional MacBook and laptop repair services in Ringwood, Melbourne. Expert hardware upgrades, screen repairs, and motherboard troubleshooting.",
    },
    features: [
      { t: "Weekday Same-Day Repair", d: "Available for screens and batteries in stock." },
      { t: "Expert Data Preservation protocols", d: "" },
      { t: "Component-level motherboard repairs", d: "" },
      { t: "Local Eastern Suburbs Shop in Ringwood Square", d: "" }
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
      { question: "Do you repair liquid damaged MacBooks in Ringwood?", answer: "Yes, we are specialists in logic board cleaning and component-level repair for liquid-damaged MacBooks. The sooner you bring it in, the higher the chance of a successful recovery." },
      { question: "Can you fix a laptop screen on the same day?", answer: "Absolutely! Many common MacBook and laptop screens are kept in stock. If you drop it off during a weekday, our same-day repair policy applies and we can have it ready in just a few hours." },
      { question: "Why is my laptop running so slowly?", answer: "Sluggish performance is often caused by a nearly full hard drive, insufficient RAM, or outdated software. We offer complete diagnostic checks and can recommend quick hardware upgrades to boost your speed." },
      { question: "My laptop is overheating—is this bad?", answer: "Yes, constant overheating can lead to permanent component degradation and random shutdowns. Bring it to our Ringwood shop for thermal repasting and internal fan cleaning to protect your investment." },
      { question: "Can I upgrade my laptop's RAM or storage?", answer: "In most Windows laptops and older MacBooks, yes! Upgrading from an old hard drive to a modern solid-state drive (SSD) is the most cost-effective way to speed up your machine." }
    ]
  },
  watch: {
    metadata: {
      title: 'Apple Watch Repair Ringwood | Battery & Screen Replace | Ali Mobile',
      description: 'Fast Apple Watch repairs in Ringwood, serving Mitcham and Croydon. Weekday same-day screen replacements and battery fixing for Series and Ultra models.',
    },
    hero: {
      pillType: 'accent',
      pillText: 'Watch Specialist',
      title: 'Premium Smart Watch Repairs in Ringwood',
      intro1: 'Shattered Apple Watch screen? Battery not lasting through the day? We specialize in precision repairs for all Apple Watch models, proudly servicing Ringwood, Croydon, Mitcham, and Wantirna.',
      intro2: 'Drop off your watch on a weekday and get it back the same day! Screen and battery replacements take just 2-4 hours, and other fixes are completed quickly. Our fast turnaround keeps you connected!',
    },
    schema: {
      serviceName: 'Smart Watch Repair Services Ringwood',
      description: "Professional Apple Watch and smart watch repair services in Ringwood, Melbourne. Weekday same-day screen and battery replacements.",
    },
    features: [
      { t: "Weekday Same-Day Guarantee", d: "Quick, secure turnarounds." },
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
      { question: "Do you offer weekday same-day Apple Watch repairs in Ringwood?", answer: "Yes, we prioritize smart watch repairs during all weekdays. If we have the screen or battery in stock, we guarantee a same-day turnaround for our local Ringwood customers." },
      { question: "What should I do if my Apple Watch won't turn on?", answer: "First, try a forced restart. If it still won't hold a charge, the battery likely needs replacing. Battery degradation is normal over time, and our service restores your watch to full-day usage." },
      { question: "How long does an Apple Watch screen repair take?", answer: "Due to the precision required for sealing smart watches, most Apple watch screen repairs take around 2 to 4 hours using our specialized press equipment." },
      { question: "Will my Apple Watch remain waterproof after repair?", answer: "While we use high-quality gaskets and premium adhesives to reseal the watch exactly to OEM standards, we generally recommend avoiding complete submersion in water after any repair." },
      { question: "Is it worth repairing my smartwatch?", answer: "Absolutely! Battery or screen replacements are highly cost-effective compared to buying a brand new Apple Watch Series or Ultra. Bring it in for a quote!" }
    ]
  }
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: catRaw } = await params;
  const category = formatDynamicParam(catRaw).toLowerCase();
  const data = CATEGORY_SEO_DATA[category];

  if (!data) return { title: 'Repair Services | Ali Mobile' };
  return data.metadata;
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
  } else {
    topBrands = validBrands.filter(b =>
      POPULAR_BRANDS_KEYS.some(pk => b.brand.toLowerCase().includes(pk.toLowerCase()))
    );
  }

  const otherBrands = validBrands
    .filter(b => !topBrands.some(tb => tb.slug === b.slug))
    .sort((a, b) => a.brand.localeCompare(b.brand));

  return (
    <>
      <ServiceSchema
        serviceName={data.schema.serviceName}
        description={data.schema.description}
        faqs={data.faqs}
      />

      <main className="repair-page-shell">
        <section className="repair-tech-hero" aria-labelledby="category-repair-heading">
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

          {category === 'phone' ? (
            <aside
              className="repair-phone-cinematic-card mt-8"
              aria-label="Premium phone repair promises"
              style={{
                position: 'relative',
                minHeight: '400px',
                width: 'min(100%, 292px)',
                justifySelf: 'center',
                overflow: 'visible',
                background: 'transparent',
                border: 0,
                boxShadow: 'none',
              }}
            >
              <video
                autoPlay
                muted
                playsInline
                className="mix-blend-screen repair-phone-float-video h-[420px] w-auto scale-[1.10] translate-x-[-15px]"
                style={{ animationFillMode: 'forwards' }}
              >
                {/* 注意看这里：外层用单引号，内层用双引号，完美避开冲突 */}
                <source src="/videos/iphone-17-pro-max-v3.mov" type='video/mp4; codecs="hvc1"' />
              </video>
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
                <span>Kiosk C1, Ringwood Square</span>
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

          {otherBrands.length > 0 && (
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

        {/* Live Pricing Section fetches from Backend */}
        <LivePricingGrid
          title={data.pricing.title}
          deviceType={data.pricing.deviceType}
          defaultItems={data.pricing.items}
        />

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

        <div className="repair-final-cta">
          <Link href="/book-repair" prefetch={true} className="repair-primary-action">
            Book Your {category.charAt(0).toUpperCase() + category.slice(1)} Repair
          </Link>
        </div>
      </main>
    </>
  );
}
