import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, PhoneCall } from 'lucide-react';
import { fetchRepairCatalog } from '@/lib/api';
import { fetchRepairTypeHubRepairResultSeeds } from '@/lib/repair-results.server';
import { buildRepairTypeHubCatalog } from '@/lib/repair-type-hubs';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import RepairTypeHubPage from '@/components/repair-type-hubs/RepairTypeHubPage';
import RepairTypeSupportingBrandHubLinks from '@/components/repair-type-hubs/RepairTypeSupportingBrandHubLinks';
import RepairTypeRepairResultsSection from '@/components/repair-results/RepairTypeRepairResultsSection';
import styles from '@/components/repair-type-hubs/RepairTypeHub.module.css';

const PAGE_TITLE = 'Charging Port Repair Ringwood | Ali Mobile & Repair';
const PAGE_DESCRIPTION =
  'Charging port repair in Ringwood for supported iPhone, Samsung, Google Pixel, Oppo and other phone models. We assess cleaning, port damage, battery faults and board-level charging issues before confirming the repair.';
const PAGE_URL = 'https://www.alimobile.com.au/repairs/charging-port-replacement';
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Ringwood+Square+Shopping+Centre+Kiosk+C1,+Seymour+St,+Ringwood+VIC+3134';

const FAQS = [
  {
    question: 'Why won’t my phone charge?',
    answer:
      'Charging problems can be caused by the cable, charger, charging port, battery, liquid exposure or board-level faults. We first check the charging behaviour, port condition and device symptoms before recommending a repair.',
  },
  {
    question: 'Is it the cable, battery or charging port?',
    answer:
      'A loose cable fit, intermittent charging, debris in the port or charging only at certain angles can point to a port issue. Fast battery drain or shutdowns may point to the battery. We test the phone first so the repair path is clear.',
  },
  {
    question: 'What does liquid detected in the charging port mean?',
    answer:
      'A liquid warning means the phone has detected moisture or a possible connection issue around the charging area. Avoid charging the phone while the warning is present and bring it in for assessment if the issue continues.',
  },
  {
    question: 'How much does charging port repair cost?',
    answer:
      'Charging port repair cost depends on the phone model, part availability and whether the issue is limited to the port or connected to another fault. We confirm the model and symptoms before giving the final quote.',
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

function buildHeroHighlights() {
  return [
    {
      title: 'Ringwood Square',
      description: 'Walk-ins welcome at Kiosk C1 inside Ringwood Square.',
    },
    {
      title: 'Find the right model',
      description: 'Search by model name or code and open the correct charging repair page directly.',
    },
    {
      title: 'Cleaning or replacement',
      description: 'We test the charging path before confirming whether cleaning, parts, or further diagnosis is needed.',
    },
  ];
}

export default async function ChargingPortReplacementPage() {
  const [catalog, repairResultSeeds] = await Promise.all([
    fetchRepairCatalog(),
    fetchRepairTypeHubRepairResultSeeds({ category: 'phone', repairTypeSlug: 'charging-port-replacement' }),
  ]);
  const data = buildRepairTypeHubCatalog(catalog, 'charging-port-replacement');

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
        name: 'Charging Port Repair',
        item: PAGE_URL,
      },
    ],
  };

  return (
    <>
      <ServiceSchema
        serviceName="Charging Port Repair Services in Ringwood"
        description={PAGE_DESCRIPTION}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <RepairTypeHubPage
        data={data}
        title="Charging Port Repair Services in Ringwood"
        description="Choose your supported phone model for charging port repair at Ali Mobile & Repair in Ringwood Square. We check whether the issue is debris, port damage, charging accessories, battery condition, or a broader charging fault before confirming the repair."
        heroKicker="Phone Charging Repairs"
        heroProof={
          <p>
            Ringwood Square Kiosk C1. Call ahead if you want us to check model-specific charging-part availability before you visit.
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
            title: 'Cable only works at an angle',
            description: 'The charging cable needs pressure or a certain position before the phone starts charging.',
          },
          {
            title: 'Device does not recognise the charger',
            description: 'The phone fails to detect the cable or repeatedly connects and disconnects.',
          },
          {
            title: 'Intermittent charging',
            description: 'Charging starts and stops without a stable connection.',
          },
          {
            title: 'Visible debris or port damage',
            description: 'The port looks blocked, worn, bent, loose, or physically damaged after use or impact.',
          },
          {
            title: 'Slow charging',
            description: 'Charging speed has dropped noticeably and may involve the port, accessories, battery, or board-level causes.',
          },
          {
            title: 'Wireless charging works but cable charging does not',
            description: 'A mismatch between wired and wireless charging can point to a port-path fault that still needs proper diagnosis.',
          },
          {
            title: 'Charging stopped after liquid or impact damage',
            description: 'Water exposure or a drop can affect the port, connector, housing mount, or charging circuit.',
          },
        ]}
        modelGridTitle="Choose your brand and model"
        modelGridDescription="Search your phone model first, or open one brand at a time to view supported charging repair pages."
        technicalEyebrow="Charging Diagnosis"
        technicalTitle="Charging fault guidance before repair"
        technicalIntro="Charging problems can start with something as simple as packed lint, but they can also involve parts deeper in the charging path. These answers explain how we separate the common causes before confirming the repair."
        technicalFaqs={[
          {
            question: 'Could the port just need cleaning first?',
            answer:
              'Yes. Packed lint or debris can stop the cable from seating properly, so we inspect the port and confirm whether careful cleaning is the appropriate first step.',
          },
          {
            question: 'When is the charging-port assembly itself the likely fault?',
            answer:
              'If the port contacts are worn, bent, loose, damaged by impact, or affected by corrosion, the charging-port assembly may need replacement.',
          },
          {
            question: 'What else can look like a port fault?',
            answer:
              'A damaged cable or adapter, a weak battery, a connector or flex fault, or a board-level charging issue can all mimic a bad charging port.',
          },
          {
            question: 'What if liquid or impact damage is involved?',
            answer:
              'Liquid or heavy impact can affect the charging path beyond the visible port area, so we confirm the practical repair path before replacing parts.',
          },
        ]}
        processSteps={[
          {
            question: 'What do we check before replacing any charging part?',
            answer:
              'We test the charging behaviour, inspect the port opening, and look for debris, wear, liquid exposure, impact damage, or signs that the fault may sit elsewhere in the charging path.',
          },
          {
            question: 'How do we separate cleaning from replacement?',
            answer:
              'If debris or a poor cable fit is the main issue, cleaning may be appropriate. If the port contacts or housing mount are damaged, we explain why replacement is the safer path.',
          },
          {
            question: 'What happens if the problem is not limited to the port?',
            answer:
              'If testing suggests a battery, connector, flex, or board-level charging fault, we explain that before work begins so the recommended repair matches the actual problem.',
          },
          {
            question: 'What gets checked before handover?',
            answer:
              'We re-test charging stability, cable fit, and related device functions, then explain any limitations or follow-up recommendations before handover.',
          },
        ]}
        repairResultsSlot={
          <RepairTypeRepairResultsSection
            category="phone"
            repairType="charging-port-replacement"
            heading="Recent Charging Port Repair Results"
            initialResults={repairResultSeeds.length > 0 ? repairResultSeeds : undefined}
            description="Published, privacy-checked before and after photos from recent charging-related repairs completed by Ali Mobile & Repair."
          />
        }
        additionalSections={
          <>
            <section className={`repair-content-band ${styles.sectionCard}`}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Pricing &amp; Quotes</p>
                  <h2 className={styles.sectionTitle}>Live pricing where available, confirmed quotes where diagnosis matters</h2>
                </div>
                <p className={styles.sectionBody}>
                  Supported model pages link directly to the current canonical repair detail route. Where public pricing is available you can review it there, and where the charging fault still needs diagnosis we confirm the correct repair path before quoting.
                </p>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <h3>Model-specific repair pages</h3>
                  <p>
                    Use the finder above to open the exact charging repair page for your phone model. That keeps the repair slug and pricing path aligned with the live catalogue.
                  </p>
                </div>
                <div className={styles.infoCard}>
                  <h3>Diagnosis before replacement</h3>
                  <p>
                    If testing suggests debris cleaning, a charging-port assembly, a battery issue, or a board-level fault, we explain that before confirming the quote.
                  </p>
                  <p>
                    Not sure if it is a charging port fault or liquid damage?{' '}
                    <Link href="/repairs/water-damage">
                      Read our liquid damage assessment advice.
                    </Link>
                  </p>
                </div>
              </div>
            </section>

            <section className={`repair-content-band ${styles.sectionCard}`}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Ringwood Store</p>
                  <h2 className={styles.sectionTitle}>Visit Ali Mobile &amp; Repair in Ringwood Square</h2>
                </div>
                <p className={styles.sectionBody}>
                  Walk-ins are welcome at Kiosk C1 inside Ringwood Square Shopping Centre. Call ahead if you want us to check likely charging-part availability for your model before you travel.
                </p>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <h3>Local details</h3>
                  <ul>
                    <li>Ali Mobile &amp; Repair, Ringwood Square Shopping Centre, Kiosk C1.</li>
                    <li>Free underground and outdoor parking available at Ringwood Square.</li>
                    <li>Walk-ins welcome, with call-ahead support for stock and charging diagnosis questions.</li>
                    <li>Phone: 0481 058 514.</li>
                  </ul>
                </div>
                <div className={styles.infoCard}>
                  <h3>In-store support</h3>
                  <p>
                    We can explain charging-port condition, likely turnaround, and practical limitations in English, 中文, and 粤语 support where needed.
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

            <section className={`repair-content-band ${styles.sectionCard}`}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Next Step</p>
                  <h2 className={styles.sectionTitle}>Need us to confirm the charging fault first?</h2>
                </div>
                <p className={styles.sectionBody}>
                  Bring the phone to our Ringwood Square kiosk or call ahead with your exact model. We will check whether cleaning, charging-port replacement, or broader charging diagnosis is the practical repair path before work starts.
                </p>
              </div>
              <div className={`repair-hero-actions ${styles.heroActions}`}>
                <Link href="/book-repair" className="repair-primary-action">
                  Book Repair Now
                </Link>
                <a href="tel:0481058514" className="repair-secondary-action">
                  <PhoneCall size={18} strokeWidth={2.6} aria-hidden="true" />
                  Call 0481 058 514
                </a>
              </div>
            </section>
          </>
        }
        faqs={FAQS}
        faqHeading="Common questions about this repair"
      />
    </>
  );
}
