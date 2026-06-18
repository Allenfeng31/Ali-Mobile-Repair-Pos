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

const PAGE_TITLE = 'Battery Replacement Ringwood | Ali Mobile & Repair';
const PAGE_DESCRIPTION =
  'Choose your supported phone model for battery replacement at Ali Mobile & Repair in Ringwood Square. Compare real repair paths, view starting prices where available, and book with our Ringwood team.';
const PAGE_URL = 'https://www.alimobile.com.au/repairs/battery-replacement';
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Ringwood+Square+Shopping+Centre+Kiosk+C1,+Seymour+St,+Ringwood+VIC+3134';

const FAQS = [
  {
    question: 'Does fast battery drain always mean I need a battery replacement?',
    answer:
      'Not always. Fast drain can also be affected by charging accessories, charging-port condition, software activity, display faults, or board-level issues. We inspect the phone before confirming that battery replacement is the right fix.',
  },
  {
    question: 'What if the battery is swollen or the screen is lifting?',
    answer:
      'A swollen battery can place pressure on the display and frame. Do not press a lifted screen back into place, and arrange an assessment promptly so we can check the safest repair path.',
  },
  {
    question: 'Can a worn battery cause unexpected shutdowns or restarts?',
    answer:
      'Yes, a weakened battery can contribute to shutdowns or restarting under load, but we still test the charging path and overall power behaviour because those symptoms can overlap with other faults.',
  },
  {
    question: 'Could a charging problem be something other than the battery?',
    answer:
      'Yes. Slow or unstable charging can also involve the cable, charger, charging port, software behaviour, or board-level issues. We test first so the repair recommendation matches the actual fault.',
  },
  {
    question: 'How useful is Battery Health when diagnosing the phone?',
    answer:
      'Battery Health can be a helpful indicator, but it is not the only diagnostic evidence. We also look at shutdown behaviour, heat, swelling signs, charging response, and the overall condition of the device before confirming the repair.',
  },
  {
    question: 'Do I need to unlock my phone or worry about data?',
    answer:
      'Your data is normally not affected by battery replacement, but we still recommend backing up important data before repair. We only request passcode access when testing requires it, and we explain that at the counter.',
  },
  {
    question: 'How long does battery replacement usually take?',
    answer:
      'Timing depends on the exact model, current stock, and whether inspection finds swelling, liquid exposure, charging faults, or other damage. We confirm expected timing after checking the phone at our Ringwood repair desk.',
  },
  {
    question: 'Is there warranty support for battery replacement?',
    answer:
      'Warranty support is available on eligible battery repairs. It does not cover new physical damage, pressure damage, or liquid damage after the repair. We explain the applicable warranty terms before you proceed.',
  },
  {
    question: 'Will the phone still be water resistant after battery replacement?',
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
      title: 'Battery and power diagnosis',
      description: 'We inspect the device before confirming the repair path.',
    },
  ];
}

export default async function BatteryReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const data = buildRepairTypeHubCatalog(catalog, 'battery-replacement');

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
        name: 'Battery Replacement',
        item: PAGE_URL,
      },
    ],
  };

  return (
    <>
      <ServiceSchema
        serviceName="Battery Replacement Services in Ringwood"
        description={PAGE_DESCRIPTION}
        faqs={FAQS}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <RepairTypeHubPage
        data={data}
        title="Battery Replacement Services in Ringwood"
        description="Choose your supported phone model for battery replacement at Ali Mobile & Repair in Ringwood Square. Battery availability, price, and timing can vary by model."
        heroKicker="Phone Battery Repairs"
        heroProof={
          <p>
            Ringwood Square Kiosk C1. Call ahead for battery availability and timing, or choose your phone model below.
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
          {
            title: 'Fast battery drain',
            description: 'The phone loses charge unusually quickly during normal use.',
          },
          {
            title: 'Shutdowns or restarts',
            description: 'The device switches off or restarts unexpectedly, especially under load.',
          },
          {
            title: 'Low battery health',
            description: 'Battery capacity has dropped and the phone no longer lasts through the day.',
          },
          {
            title: 'Swelling or screen lifting',
            description: 'A swollen battery can lift the display and needs prompt assessment.',
          },
          {
            title: 'Slow charging or running hot',
            description: 'Charging feels unstable, unusually slow, or the phone becomes warmer than normal.',
          },
          {
            title: 'Other faults can look similar',
            description: 'Charging accessories, charging ports, software activity, display issues, or board faults can overlap with battery symptoms.',
          },
        ]}
        preModelGridContent={
          <div className={styles.contentStack}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Safety Warning</p>
                <h2 className={styles.sectionTitle}>If the battery looks swollen or the screen is lifting</h2>
              </div>
            </div>
            <p className={styles.sectionBody}>
              Do not press a lifted screen back into place, and avoid puncturing, bending, or continuing to charge a visibly swollen device. Arrange an assessment promptly so we can check the safest repair path and whether the display, frame, or other internal parts have also been affected.
            </p>
          </div>
        }
        modelGridTitle="Choose your brand and model"
        modelGridDescription="Search your phone model first, or open one brand at a time to view supported repair pages."
        technicalEyebrow="Battery Guidance"
        technicalTitle="Battery quality and diagnostic guidance"
        technicalIntro="Battery problems are not always as simple as one health number or one symptom. These quick answers explain what we normally check before confirming a battery repair."
        technicalFaqs={[
          {
            question: 'Does Battery Health tell the whole story?',
            answer:
              'No. Battery Health can help, but we also look at shutdown behaviour, heat, charging response, swelling signs, and how the phone behaves in normal use.',
          },
          {
            question: 'Why can battery availability and price vary by model?',
            answer:
              'Replacement options and stock can differ between phone models, so we confirm the available part and the practical quote for your exact device before work proceeds.',
          },
          {
            question: 'Why does a swollen battery need extra inspection?',
            answer:
              'A swollen battery can affect the display, frame, or internal components, so we check the full condition of the phone before confirming the repair path.',
          },
          {
            question: 'Could a no-power or charging fault be something other than the battery?',
            answer:
              'Yes. Some no-power or charging problems need further diagnosis because the battery is not always the only cause.',
          },
        ]}
        processSteps={[
          'Complete a pre-repair functional and charging check where the phone condition allows it.',
          'Inspect battery condition, swelling signs, and any related display, frame, liquid, or impact damage.',
          'Confirm battery availability, quote, and expected timing for that exact model.',
          'Safely open the device and replace the battery where that is the appropriate repair path.',
          'Test charging, power behaviour, display, cameras, speakers, and other relevant functions after fitting.',
          'Explain calibration expectations, limitations, and aftercare before handover.',
        ]}
        repairResultsSlot={
          <RepairTypeRepairResultsSection
            category="phone"
            repairType="battery-replacement"
            heading="Recent Battery Replacement Results"
            description="Published, privacy-checked before and after photos from recent battery replacement jobs completed by Ali Mobile & Repair."
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
                  Walk-ins are welcome at Kiosk C1 inside Ringwood Square Shopping Centre. Call ahead if you want us to check likely battery availability and expected timing for your model before you travel.
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
                    We can explain model-specific battery options, likely turnaround, and practical limitations in English, 中文, and 粤语 support where needed.
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

            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Explore More</p>
                  <h2 className={styles.sectionTitle}>Browse related repair hubs</h2>
                </div>
                <p className={styles.sectionBody}>
                  If you want to compare more phone repair options before choosing a battery repair page, you can browse the main phone hub, supported brand hubs, or our approved Screen Replacement hub.
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
                <Link href="/repairs/screen-replacement" className={styles.supportingLink}>
                  Screen Replacement
                </Link>
              </div>
            </section>

          </>
        }
        faqs={FAQS}
      />
    </>
  );
}
