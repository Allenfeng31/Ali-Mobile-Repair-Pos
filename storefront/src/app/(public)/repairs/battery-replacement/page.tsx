import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, PhoneCall } from 'lucide-react';
import { fetchRepairCatalog } from '@/lib/api';
import { buildRepairTypeHubCatalog } from '@/lib/repair-type-hubs';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import RepairTypeHubPage from '@/components/repair-type-hubs/RepairTypeHubPage';
import RepairTypeSupportingBrandHubLinks from '@/components/repair-type-hubs/RepairTypeSupportingBrandHubLinks';
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
    question: 'Why is my phone battery draining so fast?',
    answer:
      'Fast battery drain can come from battery age, background apps, system updates, charging habits or hardware faults. We check battery health, charging behaviour and device symptoms before confirming whether battery replacement is suitable.',
  },
  {
    question: 'How do I know if my phone needs a new battery?',
    answer:
      'Common signs include fast battery drain, unexpected shutdowns, slow charging, overheating or a battery health warning. We check the phone first so we can confirm whether the battery is the likely cause.',
  },
  {
    question: 'How long does battery replacement take?',
    answer:
      'Same-day battery replacement may be available for many common phone models when the correct battery is in stock and the phone has no extra damage. Timing depends on the model, part availability, repair queue and device condition.',
  },
  {
    question: 'Will battery replacement delete my data?',
    answer:
      'A standard battery replacement normally does not erase phone data, but it is always best to back up important information before any repair. We do not access personal photos, messages or apps as part of a standard battery repair.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

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
      />
      <script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
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
          <div className={styles.reasonCalloutInner}>
            <div>
              <p className={styles.reasonCalloutEyebrow}>Safety warning</p>
              <h3 className={styles.reasonCalloutTitle}>If the battery looks swollen or the screen is lifting</h3>
            </div>
            <p>
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
          {
            question: 'What do we check before opening the phone?',
            answer:
              'We complete a pre-repair functional and charging check where the phone condition allows it, then inspect battery condition, swelling signs, and any related display, frame, liquid, or impact damage.',
          },
          {
            question: 'How do we confirm the battery repair path?',
            answer:
              'We confirm battery availability, quote, and expected timing for that exact model before work proceeds.',
          },
          {
            question: 'What happens during replacement?',
            answer:
              'We safely open the device and replace the battery where that is the appropriate repair path for the inspected condition.',
          },
          {
            question: 'What gets tested before handover?',
            answer:
              'We test charging, power behaviour, display, cameras, speakers, and other relevant functions after fitting, then explain calibration expectations, limitations, and aftercare.',
          },
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
            <section className={`repair-content-band ${styles.sectionCard}`}>
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
                  <p>
                    Not sure whether to repair or replace your phone?{' '}
                    <Link href="/blog/phone-repair-faq" prefetch={false}>
                      Read our Phone Repair FAQ
                    </Link>.
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
