import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, PhoneCall } from 'lucide-react';
import { fetchRepairCatalog } from '@/lib/api';
import {
  buildRepairTypeHubCatalog,
  getRepairTypeHubDefinition,
  type RepairTypeHubBrandGroup,
  type RepairTypeHubModelLink,
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

function flattenBrandModels(brands: RepairTypeHubBrandGroup[]) {
  return brands.flatMap((brand) => brand.models);
}

function buildPricingItems(models: RepairTypeHubModelLink[]) {
  const selected: RepairTypeHubModelLink[] = [];
  const seen = new Set<string>();

  const byBrandLead = models.reduce<RepairTypeHubModelLink[]>((acc, model) => {
    if (acc.some((entry) => entry.brandSlug === model.brandSlug)) {
      return acc;
    }

    const sameBrand = models.filter((entry) => entry.brandSlug === model.brandSlug);
    acc.push(sameBrand.find((entry) => entry.price > 0) ?? sameBrand[0]);
    return acc;
  }, []);

  const pricedRemainder = models.filter((model) => model.price > 0);
  const quoteRemainder = models.filter((model) => model.price <= 0);

  for (const model of [...byBrandLead, ...pricedRemainder, ...quoteRemainder]) {
    if (seen.has(model.href)) continue;
    seen.add(model.href);
    selected.push(model);
    if (selected.length === 8) break;
  }

  return selected.map((model) => ({
    label: model.model,
    description: model.repairName,
    value: model.price > 0 ? `Starting at $${model.price}` : 'Quote only',
    href: model.href,
  }));
}

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
      title: 'Live model-based pricing',
      description: 'Choose your exact phone model before you book.',
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
  const hub = getRepairTypeHubDefinition('screen-replacement');

  if (!data || !hub || data.categories.length === 0) {
    notFound();
  }

  const phoneCategory = data.categories.find((category) => category.category === 'phone');
  if (!phoneCategory || phoneCategory.brands.length === 0) {
    notFound();
  }

  const phoneModels = flattenBrandModels(phoneCategory.brands);
  const pricingItems = buildPricingItems(phoneModels);
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
        description="Choose a supported phone model for screen replacement at Ali Mobile & Repair in Ringwood Square. Screen options, timing, and available part quality can vary by model, stock, and the condition of the phone after inspection."
        heroKicker="Phone Screen Repairs"
        heroProof={
          <p>
            In Ringwood Square. Call ahead for parts and timing, or choose your phone model below to go straight to the right repair page.
          </p>
        }
        heroActions={
          <>
            <Link href="/book-repair" className={styles.primaryButton}>
              Book Repair Now
              <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
            </Link>
            <a href="tel:0481058514" className={styles.secondaryButton}>
              <PhoneCall size={18} strokeWidth={2.6} aria-hidden="true" />
              Call 0481 058 514
            </a>
          </>
        }
        heroHighlights={buildHeroHighlights()}
        symptoms={[
          'Cracked front glass after a drop or impact.',
          'Blank display, no image, or a screen that stays black.',
          'Touch not responding properly across part or all of the panel.',
          'Lines, black spots, ink-style marks, or flickering on the display.',
          'Display separation after impact or pressure.',
          'Screen lifting that may also point to a swollen battery and needs inspection before quoting.',
          'Inspection may show that frame, battery, connector, or board damage is part of the problem rather than the screen alone.',
        ]}
        modelGridTitle="Find your device"
        modelGridDescription="Search your phone model or expand one brand at a time. Every link goes straight to the existing canonical repair detail page."
        pricing={{
          title: 'Popular live pricing',
          items: pricingItems,
        }}
        technicalContent={
          <div className={styles.contentStack}>
            <div className={styles.contentBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Screen Options</p>
                  <h2 className={styles.sectionTitle}>Screen quality guidance before repair</h2>
                </div>
              </div>
              <p className={styles.sectionBody}>
                Screen options can vary by phone model and current stock. Depending on the device, the available path may involve LCD, OLED, Soft OLED, or another premium-quality assembly, and each option can differ in brightness, colour, touch response, durability, and price.
              </p>
              <p className={styles.sectionBody}>
                Not every option is available for every phone. Before installation, the technician checks the frame condition and overall fit because a bent frame or heavy impact damage can affect how well a replacement screen sits and how durable the finished repair will be.
              </p>
              <p className={styles.sectionBody}>
                We explain the suitable options for your model before repair starts so you can make an informed decision about price, expected finish, and practical limitations.
              </p>
            </div>
          </div>
        }
        processSteps={[
          'Complete a pre-repair functional test where the phone condition allows it.',
          'Inspect the display, frame, and any related impact damage.',
          'Confirm the available screen option, price, and expected timing for that exact model.',
          'Install the selected replacement screen using the appropriate repair path.',
          'Test display quality, touch, cameras, speakers, charging, and relevant sensors after fitting.',
          'Explain any limitations, seal expectations, and aftercare before handover.',
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
            <section className={styles.sectionCard}>
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
                  <div className={styles.heroActions}>
                    <a href={DIRECTIONS_URL} className={styles.secondaryButton}>
                      <MapPin size={18} strokeWidth={2.4} aria-hidden="true" />
                      Get Directions
                    </a>
                    <Link href="/book-repair" className={styles.primaryButton}>
                      Book Repair Now
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {brandHubLinks.length > 0 && (
              <section className={styles.sectionCard}>
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
