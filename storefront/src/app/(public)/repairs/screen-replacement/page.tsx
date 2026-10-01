import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, PhoneCall } from 'lucide-react';
import { fetchRepairCatalog } from '@/lib/api';
import { fetchRepairTypeHubRepairResultSeeds } from '@/lib/repair-results.server';
import { buildRepairTypeHubCatalog, getRepairTypeHubStartingPriceLabel, resolveRepairTypeHubSelectedState, type RepairTypeHubCatalogResult } from '@/lib/repair-type-hubs';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import RepairTypeHubPage from '@/components/repair-type-hubs/RepairTypeHubPage';
import RepairTypeSupportingBrandHubLinks from '@/components/repair-type-hubs/RepairTypeSupportingBrandHubLinks';
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
    question: 'How much does phone screen repair cost?',
    answer:
      'Screen repair cost depends on the phone model, screen option, part availability and the condition of the device. Some repairs have published starting prices, while others need a quote after we confirm the exact model and damage.',
  },
  {
    question: 'What is the difference between phone screen options?',
    answer:
      'Screen options can differ in display quality, brightness, colour, touch feel, durability and price. Options may include aftermarket, premium aftermarket, Soft OLED, or genuine/pulled genuine options depending on the model and current availability. We explain which option your quote is based on before proceeding, so you can choose the repair that best suits your budget and expectations.',
  },
  {
    question: 'What if my phone screen is black but the phone still vibrates or makes sounds?',
    answer:
      'If the phone vibrates, rings or makes sounds but the screen stays black, the display may be damaged even though the phone is still running. A technician can check the screen, connectors and internal condition before confirming the repair path.',
  },
  {
    question: 'Can my phone need a screen replacement if the glass is not cracked?',
    answer:
      'Yes. A phone can need a screen replacement with intact outer glass when the internal LCD or OLED display, touch layer, or screen/display assembly has failed. A black or blank display, vertical or coloured lines, flickering, black spots or display bleed, or an image that shows but does not respond to touch can all need diagnosis before the repair path is confirmed.',
  },
  {
    question: 'Will screen replacement affect my data?',
    answer:
      'A standard screen replacement normally does not require access to personal photos, messages or apps. If a function test requires the phone to be unlocked, we explain why and can ask you to unlock it or test it with us at the counter.',
  },
  {
    question: 'How long does screen replacement take?',
    answer:
      'Same-day screen replacement may be available for many common phone models when the correct part is in stock and there is no extra damage. Timing depends on the model, part availability, repair queue and the condition of the device, so we recommend calling first.',
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

function buildHeroHighlights(data: RepairTypeHubCatalogResult) {
  const startingPrice = getRepairTypeHubStartingPriceLabel(data).replace(/^From\s+/, '');

  return [
    {
      title: 'Price',
      description: <>Screen replacement starts from <strong>{startingPrice}</strong>.</>,
    },
    {
      title: 'Repair Time',
      description: <>Most screen replacements take around <strong>30 minutes</strong>.</>,
    },
    {
      title: 'Ringwood Square',
      description: 'Walk-ins welcome at Kiosk C1 inside Ringwood Square.',
    },
  ];
}

export default async function ScreenReplacementPage({
  searchParams,
}: {
  searchParams?: Promise<{ brand?: string | string[]; model?: string | string[]; service?: string | string[] }>;
}) {
  const query = await (searchParams ?? Promise.resolve({}));
  const [catalog, repairResultSeeds] = await Promise.all([
    fetchRepairCatalog(),
    fetchRepairTypeHubRepairResultSeeds({ category: 'phone', repairTypeSlug: 'screen-replacement' }),
  ]);
  const data = buildRepairTypeHubCatalog(catalog, 'screen-replacement', { enableSecondaryPhoneHybridFallback: true });

  if (!data || data.categories.length === 0) {
    notFound();
  }
  const selectedDevice = resolveRepairTypeHubSelectedState({ catalog, data, query });

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
        url={PAGE_URL}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <RepairTypeHubPage
        data={data}
        selectedDevice={selectedDevice}
        changeModelHref="/repairs/screen-replacement#repair-type-model-finder"
        title="Phone Screen & Display Replacement"
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
        heroHighlights={buildHeroHighlights(data)}
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
              'Depending on the model and current stock, the practical repair path may involve an LCD or OLED display, Soft OLED, or another premium-quality screen/display assembly.',
          },
          {
            question: 'What is the difference between cracked outer glass and a damaged display or touch assembly?',
            answer:
              'Cracked outer glass is visible surface damage, while a damaged display or touch assembly can cause black display, lines, flicker, display bleed, or touch failure even when the glass is intact. Diagnosis confirms whether the complete screen/display assembly needs replacement.',
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
            initialResults={repairResultSeeds.length > 0 ? repairResultSeeds : undefined}
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
                  Walk-ins are welcome at Kiosk C1 inside Ringwood Square Shopping Centre. From Ringwood Square, we serve Ringwood, Mitcham, Croydon, Heathmont, Nunawading, and Melbourne&apos;s eastern suburbs; if you are looking for phone repair near Mitcham, our kiosk is a convenient nearby option. Call ahead if you want us to check likely screen availability and expected timing for your model before you travel.
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
                  <p>
                    Need help choosing a repair option?{' '}
                    <Link href="/blog/phone-repair-faq" prefetch={false}>
                      Read our Phone Repair FAQ
                    </Link>{' '}
                    for screen options, timing and data questions.
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

            <RepairTypeSupportingBrandHubLinks />
          </>
        }
        faqs={FAQS}
        faqHeading="Common questions about this repair"
      />
    </>
  );
}
