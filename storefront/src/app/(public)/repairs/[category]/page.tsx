import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import ChatNowButton from '@/components/ChatNowButton';
import { fetchRepairCatalog } from '@/lib/api';
import { formatDynamicParam } from '@/lib/inventoryUtils';

export const revalidate = 3600;
export const dynamicParams = true;

const CATEGORIES = ['phone', 'tablet', 'laptop', 'watch'];

export async function generateStaticParams() {
  return [];
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

function getPillStyle(type: string) {
  if (type === 'primary') return { background: 'rgba(0,122,255,0.1)', color: 'var(--primary)' };
  if (type === 'warning') return { background: 'rgba(255,149,0,0.1)', color: '#ff9500' };
  if (type === 'accent')  return { background: 'rgba(255,45,85,0.1)', color: 'var(--accent)' };
  return { background: 'var(--layer)', color: 'var(--foreground)' };
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

  const topBrandsMap: Record<string, string[]> = {
    phone: ['iPhone', 'Samsung', 'Google', 'Oppo'],
    tablet: ['Apple', 'iPad', 'Samsung', 'Microsoft'],
    laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Microsoft'],
    watch: ['Apple', 'Samsung', 'Garmin']
  };

  const currentTopBrandsList = topBrandsMap[category] || [];
  
  const topBrands = validBrands.filter(b => currentTopBrandsList.includes(b.brand));
  const otherBrands = validBrands
    .filter(b => !currentTopBrandsList.includes(b.brand))
    .sort((a, b) => a.brand.localeCompare(b.brand));

  return (
    <>
      <ServiceSchema 
        serviceName={data.schema.serviceName}
        description={data.schema.description}
        faqs={data.faqs}
      />
      
      <div className="page-container">
        {/* HERO INTRO */}
        <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase', ...getPillStyle(data.hero.pillType) }}>
          {data.hero.pillText}
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>{data.hero.title}</h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>
          {/* using dangerouslySetInnerHTML to allow strong tags from standard text if needed, but the data has simple strings without tags right now, so we will use text directly */}
          {data.hero.intro1}
        </p>

        {/* BRAND GRID (NEW CORE SECTION) */}
        <div style={{ marginTop: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Most Popular Brands</h2>
        </div>
        
        {topBrands.length > 0 ? (
          <div className="brand-grid-hero">
            {topBrands.map(b => (
              <Link key={b.slug} href={`/repairs/${category}/${b.slug}`} className="brand-card-hero">
                {b.brand}
              </Link>
            ))}
          </div>
        ) : validBrands.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground)', opacity: 0.7 }}>
            No active brands available in this category for now.
          </div>
        )}

        {otherBrands.length > 0 && (
          <>
            <div style={{ marginTop: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.4rem', opacity: 0.8, marginBottom: '0.5rem' }}>Other Supported Brands</h3>
            </div>
            <div className="brand-grid-standard">
              {otherBrands.map(b => (
                <Link key={b.slug} href={`/repairs/${category}/${b.slug}`} className="brand-card-standard">
                  {b.brand}
                </Link>
              ))}
            </div>
          </>
        )}

        <div
          style={{
            marginTop: "1rem",
            marginBottom: "3rem",
            background: "var(--secondary)",
            borderRadius: "20px",
            padding: "2.5rem",
            border: "1px solid var(--layer-border)",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            Not sure which model you have?
          </h2>
          <p style={{ opacity: 0.7, marginBottom: "1.5rem", fontSize: "1rem" }}>
            Use our Live Quote tool or call us — we'll identify your device and give you an instant price.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", alignItems: 'center' }}>
            <Link href="/book-repair" className="primary-btn">
              Get a Live Quote
            </Link>
            <a href="tel:0481058514" className="secondary-btn">
              📞 Call 0481 058 514
            </a>
            <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>or</span>
            <ChatNowButton 
              className="primary-btn" 
              style={{ background: 'var(--foreground)', color: 'var(--background)' }}
            />
          </div>
        </div>

        {/* SEO CONTENT (BOTTOM) */}
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8', color: 'var(--primary)', fontWeight: 'bold' }}>
          {data.hero.intro2}
        </p>

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Why Choose Us?</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1.1rem' }}>
          {data.features.map((f: any, idx: number) => (
             <li key={idx}><strong>{f.t}:</strong> {f.d ? f.d : "Included standard with our service."}</li>
          ))}
        </ul>

        {/* Live Pricing Section fetches from Backend */}
        <LivePricingGrid 
          title={data.pricing.title}
          deviceType={data.pricing.deviceType}
          defaultItems={data.pricing.items}
        />

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Frequently Asked Questions</h2>
        {data.faqs.map((faq: any, index: number) => (
          <div key={index} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{faq.question}</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>{faq.answer}</p>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link href="/book-repair" className="primary-btn">
            Book Your {category.charAt(0).toUpperCase() + category.slice(1)} Repair
          </Link>
        </div>
      </div>
    </>
  );
}
