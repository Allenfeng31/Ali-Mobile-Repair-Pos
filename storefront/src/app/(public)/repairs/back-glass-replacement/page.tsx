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

const PAGE_TITLE = 'Phone Back Glass Repair Ringwood | Ali Mobile & Repair';
const PAGE_DESCRIPTION =
  'Phone back glass and housing repair in Ringwood for supported iPhone, Samsung, Google Pixel, Oppo and other models. We assess rear-glass, frame, camera-lens and housing damage before confirming the correct repair method.';
const PAGE_URL = 'https://www.alimobile.com.au/repairs/back-glass-replacement';
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Ringwood+Square+Shopping+Centre+Kiosk+C1,+Seymour+St,+Ringwood+VIC+3134';

const FAQS = [
  {
    question: 'Is back glass the same as the phone housing?',
    answer:
      'Not always. Some phones have a separate rear glass or back cover, while others may need a larger housing assembly because the rear section, frame, or mounting structure is part of the repair.',
  },
  {
    question: 'Does every iPhone use rear-glass-only replacement?',
    answer:
      'No. Some relevant iPhone generations may require a back-housing assembly rather than rear glass alone, so we confirm the correct method for the exact model before repair begins.',
  },
  {
    question: 'Can a bent frame require a complete housing repair?',
    answer:
      'Yes. If the frame or surrounding structure is distorted, a housing repair path may be more appropriate than replacing only the damaged rear panel.',
  },
  {
    question: 'Can rear damage affect wireless charging?',
    answer:
      'Yes. Rear impact can affect the wireless-charging area, internal mounts, or related components, so we check for broader damage before confirming the repair.',
  },
  {
    question: 'Can the camera lens be damaged at the same time?',
    answer:
      'Yes. Rear damage can also involve the camera-lens surround, lens glass, or nearby frame area, which may change the repair recommendation.',
  },
  {
    question: 'Will the phone remain water-resistant after repair?',
    answer:
      'Factory water resistance cannot be guaranteed after a device has been opened or repaired. New adhesive may help reseal the device, but it does not restore certified factory water resistance.',
  },
  {
    question: 'How is the correct repair method confirmed?',
    answer:
      'We assess the exact model, rear construction, frame condition, and any related component damage before confirming whether the practical repair is back glass, back cover, or housing replacement.',
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
      description: 'Search by model name or code and open the correct rear-glass or housing repair page directly.',
    },
    {
      title: 'Model-specific method',
      description: 'We confirm whether the practical repair is back glass, back cover, or housing replacement before work begins.',
    },
  ];
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

export default async function BackGlassReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const data = buildRepairTypeHubCatalog(catalog, 'back-glass-replacement');

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
        name: 'Back Glass & Housing Repair',
        item: PAGE_URL,
      },
    ],
  };

  return (
    <>
      <ServiceSchema
        serviceName="Back Glass and Housing Repair Services in Ringwood"
        description={PAGE_DESCRIPTION}
        faqs={FAQS}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <RepairTypeHubPage
        data={data}
        title="Back Glass & Housing Repair in Ringwood"
        description="Choose your supported phone model for back glass or housing repair at Ali Mobile & Repair in Ringwood Square. We assess rear-glass damage, housing condition, frame impact, and related component risk before confirming the repair method."
        heroKicker="Phone Rear Damage Repairs"
        heroProof={
          <p>
            Ringwood Square Kiosk C1. Call ahead if you want us to check model-specific housing or rear-part availability before you visit.
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
            title: 'Shattered rear glass',
            description: 'The back glass is cracked, splintered, or broken after impact.',
          },
          {
            title: 'Loose or missing rear cover pieces',
            description: 'The rear panel is lifting, separating, or missing sections that expose the phone body.',
          },
          {
            title: 'Bent or damaged frame',
            description: 'Rear impact has also affected the outer frame or housing structure around the phone.',
          },
          {
            title: 'Exposed internal components',
            description: 'Damage to the rear section can leave internal areas less protected and may require broader repair.',
          },
          {
            title: 'Camera-lens surround damage',
            description: 'Rear impact can damage the camera ring, lens opening, or adjacent housing section.',
          },
          {
            title: 'Wireless charging issues after rear impact',
            description: 'Back damage can affect the charging area or internal mounting around it.',
          },
          {
            title: 'Housing damage near buttons or port areas',
            description: 'The outer shell may also be damaged around button cut-outs, charging-port mounts, or edge sections.',
          },
        ]}
        modelGridTitle="Choose your brand and model"
        modelGridDescription="Search your phone model first, or open one brand at a time to view supported rear-glass and housing repair pages."
        technicalEyebrow="Rear Damage Guidance"
        technicalTitle="Back glass and housing guidance before repair"
        technicalIntro="Rear damage is not repaired the same way on every phone. These short answers explain how we separate rear-glass, back-cover, housing, frame, and related component damage before confirming the repair."
        technicalFaqs={[
          {
            question: 'Do all non-iPhone phones use the same rear repair method?',
            answer:
              'No. Many supported non-iPhone phones may use rear glass or back-cover replacement, but the correct repair depends on the actual device construction and the available catalogue repair for that model.',
          },
          {
            question: 'Why can some iPhones need back-housing replacement?',
            answer:
              'For some relevant iPhone generations, the practical repair path may involve a back-housing assembly rather than rear glass alone, especially when the structure around the rear section is part of the repair.',
          },
          {
            question: 'What extra damage can come with a broken rear panel?',
            answer:
              'Rear impact can also affect the frame, camera-lens area, wireless-charging assembly, flash or microphone sections, buttons, charging-port mounting area, or internal connectors.',
          },
          {
            question: 'What about water resistance after opening the phone?',
            answer:
              'Factory water resistance cannot be guaranteed after a device has been opened or repaired. New adhesive may help reseal the device, but it does not restore certified factory water resistance.',
          },
        ]}
        processSteps={[
          {
            question: 'What do we check before quoting rear-glass or housing work?',
            answer:
              'We inspect the exact model, rear construction, frame condition, and any related damage around the camera, charging area, or housing structure before confirming the repair path.',
          },
          {
            question: 'How do we decide between back glass and housing replacement?',
            answer:
              'The correct method depends on the device construction and the repair combination that actually exists for that model in the catalogue. Some phones can use a rear-glass or back-cover repair, while some relevant iPhones may require a housing assembly.',
          },
          {
            question: 'What happens if other rear components are damaged too?',
            answer:
              'If the impact has affected the frame, camera surround, wireless-charging area, or other nearby mounts and connectors, we explain that before work begins so the repair recommendation matches the full damage.',
          },
          {
            question: 'What gets checked before handover?',
            answer:
              'We check the fitted rear section, overall housing condition, and relevant device functions, then explain any sealing limitations and aftercare before handover.',
          },
        ]}
        repairResultsSlot={
          <RepairTypeRepairResultsSection
            category="phone"
            repairType="back-glass-replacement"
            heading="Recent Back Glass & Housing Repair Results"
            description="Published, privacy-checked before and after photos from recent rear-damage repairs completed by Ali Mobile & Repair."
          />
        }
        additionalSections={
          <>
            <section className={`repair-content-band ${styles.sectionCard}`}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Pricing &amp; Quotes</p>
                  <h2 className={styles.sectionTitle}>Live pricing where available, model-specific confirmation where method varies</h2>
                </div>
                <p className={styles.sectionBody}>
                  Supported model pages link directly to the current canonical repair detail route. Where public pricing is available you can review it there, and where the correct method still depends on rear construction we confirm that before quoting.
                </p>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <h3>Exact repair slug preserved</h3>
                  <p>
                    The finder above opens the live canonical repair page for your exact model, preserving the actual rear-glass or housing repair slug returned by the existing catalogue.
                  </p>
                </div>
                <div className={styles.infoCard}>
                  <h3>Method confirmed before work</h3>
                  <p>
                    If inspection shows that rear-glass-only replacement is unsuitable and a housing path is more appropriate, we explain that before confirming the repair.
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
                  Walk-ins are welcome at Kiosk C1 inside Ringwood Square Shopping Centre. Call ahead if you want us to check likely rear-part availability for your model before you travel.
                </p>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <h3>Local details</h3>
                  <ul>
                    <li>Ali Mobile &amp; Repair, Ringwood Square Shopping Centre, Kiosk C1.</li>
                    <li>Free underground and outdoor parking available at Ringwood Square.</li>
                    <li>Walk-ins welcome, with call-ahead support for stock and rear-damage assessment questions.</li>
                    <li>Phone: 0481 058 514.</li>
                  </ul>
                </div>
                <div className={styles.infoCard}>
                  <h3>In-store support</h3>
                  <p>
                    We can explain model-specific rear-glass and housing repair options, likely turnaround, and practical limitations in English, 中文, and 粤语 support where needed.
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

            <section className={`repair-content-band ${styles.sectionCard}`}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Explore More</p>
                  <h2 className={styles.sectionTitle}>Related repair paths</h2>
                </div>
                <p className={styles.sectionBody}>
                  If you want to compare a broader phone repair path before booking, you can browse the main phone hub, a supported brand hub, or related Screen, Battery, and Charging Port repair hubs.
                </p>
              </div>
              <div className={styles.supportingLinks}>
                <Link href="/repairs/phone" className={styles.supportingLink}>
                  Phone Repairs
                </Link>
                <Link href="/repairs/screen-replacement" className={styles.supportingLink}>
                  Screen Replacement
                </Link>
                <Link href="/repairs/battery-replacement" className={styles.supportingLink}>
                  Battery Replacement
                </Link>
                <Link href="/repairs/charging-port-replacement" className={styles.supportingLink}>
                  Charging Port Repair
                </Link>
                {brandHubLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={styles.supportingLink}>
                    {link.label}
                  </Link>
                ))}
                <Link href="/book-repair" className={styles.supportingLink}>
                  Book Repair
                </Link>
              </div>
            </section>

            <section className={`repair-content-band ${styles.sectionCard}`}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Next Step</p>
                  <h2 className={styles.sectionTitle}>Need us to confirm the rear repair method first?</h2>
                </div>
                <p className={styles.sectionBody}>
                  Bring the phone to our Ringwood Square kiosk or call ahead with your exact model. We will check whether the practical path is back glass, back cover, or housing replacement before work starts.
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
      />
    </>
  );
}
