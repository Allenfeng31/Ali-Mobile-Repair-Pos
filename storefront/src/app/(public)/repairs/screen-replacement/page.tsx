import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, PhoneCall } from 'lucide-react';
import { fetchRepairCatalog } from '@/lib/api';
import {
  buildRepairTypeHubCatalog,
  type RepairTypeHubBrandGroup,
} from '@/lib/repair-type-hubs';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import RepairTypeHubPage from '@/components/repair-type-hubs/RepairTypeHubPage';
import RepairTypeRepairResultsSection from '@/components/repair-results/RepairTypeRepairResultsSection';
import styles from '@/components/repair-type-hubs/RepairTypeHub.module.css';

const PAGE_TITLE = 'Screen Replacement Ringwood | Ali Mobile & Repair';
const PAGE_DESCRIPTION =
  'Choose your supported phone model for screen replacement at Ali Mobile & Repair in Ringwood Square. Compare real repair paths, view starting prices where available, and book with our Ringwood team.';
const PAGE_URL = 'https://www.alimobile.com.au/repairs/screen-replacement';
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Ringwood+Square+Shopping+Centre+Kiosk+C1,+Seymour+St,+Ringwood+VIC+3134';

const FAQS = [
  {
    question: 'How long does screen replacement usually take?',
    answer:
      'Repair time depends on the exact model, current stock, screen option, and whether inspection finds frame, battery, connector, or board damage. We confirm timing after checking the phone at our Ringwood repair desk.',
  },
  {
    question: 'Can cracked glass be replaced without changing the full display?',
    answer:
      'Some devices need the full display assembly replaced rather than only the outer glass. The correct repair path depends on the model, the type of panel, and the condition of the damaged screen.',
  },
  {
    question: 'What if the frame is bent or damaged?',
    answer:
      'We inspect the frame before installation because a bent frame can affect fit, sealing, and long-term durability. If frame damage changes the repair path, we explain that before proceeding.',
  },
  {
    question: 'What screen quality options are available?',
    answer:
      'Available screen options vary by model and stock. Depending on the phone, options may include LCD, OLED, Soft OLED, or other premium-quality assemblies with different brightness, colour, touch feel, durability, and price.',
  },
  {
    question: 'Does a blank display always mean the screen is faulty?',
    answer:
      'Not always. A black or blank display can also involve connector damage, battery issues, or board-level faults after impact. Inspection helps confirm whether a screen replacement is the correct repair.',
  },
  {
    question: 'Is there warranty support for screen replacement?',
    answer:
      'Warranty support is available on eligible screen repairs. It does not cover new physical damage, pressure damage, or liquid damage after the repair. We explain the applicable warranty terms before you proceed.',
  },
  {
    question: 'Do I need to unlock my phone or worry about data?',
    answer:
      'Your data is normally not affected by screen replacement, but we still recommend backing up important data before repair. We only request passcode access when testing requires it, and we explain that at the counter.',
  },
  {
    question: 'Will the phone still be water resistant after repair?',
    answer:
      'We clean old adhesive and reseal carefully after opening the phone, but factory water resistance cannot be guaranteed after any opened phone repair.',
  },
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Ali Mobile & Repair',
    locale: 'en_AU',
    type: 'website',
  },
};

function buildBrandHubLinks(brands: RepairTypeHubBrandGroup[]) {
  const preferred = ['iphone', 'samsung', 'google', 'oppo'];
  return preferred
    .map((slug) => brands.find((brand) => brand.brandSlug === slug))
    .filter((brand): brand is RepairTypeHubBrandGroup => Boolean(brand))
    .map((brand) => ({
      href: `/repairs/phone/${brand.brandSlug}`,
      label: `${brand.brand} Repairs`,
    }));
}

function buildHeroHighlights() {
  return [
    {
      title: 'Ringwood Square',
      description: 'Walk-ins welcome at Kiosk C1 inside Ringwood Square.',
    },
    {
      title: 'Find the right model',
      description: 'Search by model name or code and open the correct repair page directly.',
    },
    {
      title: 'Technician inspection first',
      description: 'We confirm the practical screen repair path before work begins.',
    },
  ];
}

export default async function ScreenReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const data = buildRepairTypeHubCatalog(catalog, 'screen-replacement');

  if (!data || data.categories.length === 0) {
    notFound();
  }

  const phoneCategory = data.categories.find((category) => category.category === 'phone');
  if (!phoneCategory || phoneCategory.brands.length === 0) {
    notFound();
  }

  const brandHubLinks = buildBrandHubLinks(phoneCategory.brands);
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.alimobile.com.au/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Repairs',
        item: 'https://www.alimobile.com.au/repairs',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Screen Replacement',
        item: PAGE_URL,
      },
    ],
  };

  return (
    <>
      <ServiceSchema
        serviceName="Screen Replacement Services in Ringwood"
        description={PAGE_DESCRIPTION}
        faqs={FAQS}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <RepairTypeHubPage
        data={data}
        title="Screen Replacement Services in Ringwood"
        description="Choose your supported phone model for screen replacement at Ali Mobile & Repair in Ringwood Square. Parts, timing, and screen options can vary by model."
        heroKicker="Phone Screen Repairs"
        heroProof={
          <p>
            Ringwood Square Kiosk C1. Call ahead for parts and timing, or choose your phone model below.
          </p>
        }
        heroActions={
          <>
            <Link href="/book-repair" className="repair-primary-action">
              Book Repair Now
              <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
            </Link>
            <a href="tel:0481058514" className="repair-secondary-action">
              <PhoneCall size={18} strokeWidth={2.6} aria-hidden="true" />
              Call 0481 058 514
            </a>
          </>
        }
        heroHighlights={buildHeroHighlights()}
        symptoms={[
          {
            title: 'Cracked glass',
            description: 'Front glass broken after a drop, pressure, or another impact.',
          },
          {
            title: 'Black or blank display',
            description: 'No image, no backlight, or a screen that stays dark after damage.',
          },
          {
            title: 'Touch problems',
            description: 'Touch not responding properly across part or all of the panel.',
          },
          {
            title: 'Lines, spots, or flicker',
            description: 'Display lines, black spots, ink-style marks, or flickering after impact.',
          },
          {
            title: 'Screen lifting or separation',
            description: 'The display is lifting away from the frame and needs inspection before quoting.',
          },
          {
            title: 'Other damage may be involved',
            description: 'Inspection may show frame, battery, connector, or board damage as part of the issue.',
          },
        ]}
        modelGridTitle="Choose your brand and model"
        modelGridDescription="Search your phone model first, or open one brand at a time to view supported repair pages."
        technicalEyebrow="Screen Options"
        technicalTitle="Screen quality guidance before repair"
        technicalIntro="Different phones can have different screen options and different practical repair limits. These short answers cover the most common questions we explain at the counter before screen work begins."
        technicalFaqs={[
          {
            question: 'What screen options might be available for my phone?',
            answer:
              'Depending on the model and current stock, the practical repair path may involve LCD, OLED, Soft OLED, or another premium-quality assembly.',
          },
          {
            question: 'Why can two screen options feel different in use?',
            answer:
              'Brightness, colour, touch response, durability, and price can vary between available screen types, even when they fit the same phone.',
          },
          {
            question: 'Why does frame condition matter before a screen is fitted?',
            answer:
              'A bent frame or heavy impact damage can affect fit, sealing, and long-term durability, so the technician checks this before confirming the repair.',
          },
          {
            question: 'Will every model have every screen option available?',
            answer:
              'No. Not every option is available for every phone, so we explain the suitable choices for your exact model before repair starts.',
          },
        ]}
        processSteps={[
          {
            question: 'What do we check before replacing this display?',
            answer:
              'We complete a pre-repair functional test where the phone condition allows it, then inspect the display, frame, and any related impact damage before confirming the repair path.',
          },
          {
            question: 'How do we confirm the screen option?',
            answer:
              'We confirm the available screen option, price, and expected timing for that exact model before the replacement work starts.',
          },
          {
            question: 'What happens during the screen replacement?',
            answer:
              'The selected replacement screen is installed using the appropriate repair path for the device and its condition.',
          },
          {
            question: 'What gets tested before handover?',
            answer:
              'We test display quality, touch, cameras, speakers, charging, and relevant sensors, then explain any limitations, seal expectations, and aftercare before handover.',
          },
        ]}
        repairResultsSlot={
          <RepairTypeRepairResultsSection
            category="phone"
            repairType="screen-replacement"
            heading="Recent Screen Replacement Results"
            description="Published, privacy-checked before and after photos from recent screen repair jobs completed by Ali Mobile & Repair."
          />
        }
        additionalSections={
          <>
            <section className={`repair-content-band ${styles.sectionCard}`}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Ringwood Store</p>
                  <h2 className={styles.sectionTitle}>Visit Ali Mobile &amp; Repair in Ringwood Square</h2>
                </div>
                <p className={styles.sectionBody}>
                  Walk-ins are welcome at Kiosk C1 inside Ringwood Square Shopping Centre. Call ahead if you want us to check likely screen availability and expected timing for your model before you travel.
                </p>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <h3>Local details</h3>
                  <ul>
                    <li>Ali Mobile &amp; Repair, Ringwood Square Shopping Centre, Kiosk C1.</li>
                    <li>Free underground and outdoor parking available at Ringwood Square.</li>
                    <li>Walk-ins welcome, with call-ahead support for stock and timing checks.</li>
                    <li>Phone: 0481 058 514.</li>
                  </ul>
                </div>
                <div className={styles.infoCard}>
                  <h3>In-store support</h3>
                  <p>
                    We can explain model-specific screen options, likely turnaround, and practical limitations in English, 中文, and 粤语 support where needed.
                  </p>
                  <div className={`repair-hero-actions ${styles.heroActions}`}>
                    <a href={DIRECTIONS_URL} className="repair-secondary-action">
                      <MapPin size={18} strokeWidth={2.4} aria-hidden="true" />
                      Get Directions
                    </a>
                    <Link href="/book-repair" className="repair-primary-action">
                      Book Repair Now
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {brandHubLinks.length > 0 && (
              <section className={`repair-content-band ${styles.sectionCard}`}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.sectionEyebrow}>Explore More</p>
                    <h2 className={styles.sectionTitle}>Browse phone repair hubs</h2>
                  </div>
                  <p className={styles.sectionBody}>
                    If you want to compare more phone repair options before selecting a screen repair page, you can also browse the main phone hub or jump straight to a supported brand hub.
                  </p>
                </div>
                <div className={styles.supportingLinks}>
                  <Link href="/repairs/phone" className={styles.supportingLink}>
                    Phone Repairs
                  </Link>
                  {brandHubLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={styles.supportingLink}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        }
        faqs={FAQS}
      />
    </>
  );
}
