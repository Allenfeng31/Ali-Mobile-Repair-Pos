import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, PhoneCall } from 'lucide-react';
import { fetchRepairCatalog } from '@/lib/api';
import {
  buildRepairTypeHubCatalog,
  type RepairTypeHubBrandGroup,
  type RepairTypeHubModelLink,
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
        description="Choose a supported phone model for battery replacement at Ali Mobile & Repair in Ringwood Square. Battery availability, price, and expected timing can vary by model, stock, and the condition of the phone after inspection."
        heroKicker="Phone Battery Repairs"
        intro={
          <>
            <p>
              Visit Ali Mobile &amp; Repair at Ringwood Square Shopping Centre, Kiosk C1, for phone battery replacement guidance backed by the live repair catalogue. We confirm the likely repair path for your model before any work starts.
            </p>
            <p>
              Fast drain, shutdowns, swelling, heat, and unstable charging can point toward battery wear, but they can also overlap with charging accessories, charging-port issues, software activity, or board-level faults that need inspection first.
            </p>
          </>
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
        heroStats={[
          { label: 'Phone brands', value: phoneCategory.brands.length },
          { label: 'Supported models', value: phoneModels.length },
          { label: 'Popular price cards', value: pricingItems.length },
        ]}
        symptoms={[
          'Battery draining quickly or dropping percentage faster than normal use suggests.',
          'Unexpected shutdowns or random restarts, especially under load.',
          'Reduced battery health or a phone that no longer lasts through normal daily use.',
          'Battery swelling or a lifted screen edge that needs prompt assessment.',
          'Slow charging, unstable charging, or the phone becoming unusually warm.',
          'These symptoms can also involve charging accessories, charging-port faults, software or background activity, display issues, board-level faults, or hidden liquid and impact damage.',
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
        modelGridTitle="Choose your phone model"
        modelGridDescription="Search real phone models that currently have a live battery repair path in our catalogue. Every model card goes straight to the existing canonical repair detail page for that exact model and repair slug."
        pricing={{
          title: 'Popular live pricing',
          items: pricingItems,
        }}
        technicalContent={
          <div className={styles.contentStack}>
            <div className={styles.contentBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Battery Guidance</p>
                  <h2 className={styles.sectionTitle}>Battery quality and diagnostic guidance</h2>
                </div>
              </div>
              <p className={styles.sectionBody}>
                Battery capacity and performance decline over time, but battery-health indicators are only one part of the diagnosis. We also look at shutdown behaviour, heat, charging response, swelling signs, and how the phone behaves under normal use before confirming the repair recommendation.
              </p>
              <p className={styles.sectionBody}>
                Replacement options and availability can vary by model. A swollen battery may affect the display, frame, or internal components, and some no-power or charging faults need further diagnosis because the battery is not always the only cause.
              </p>
              <p className={styles.sectionBody}>
                We inspect the device first, then confirm the quote, battery availability, and the practical repair path before work proceeds.
              </p>
            </div>
          </div>
        }
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

            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>FAQs</p>
                  <h2 className={styles.sectionTitle}>Battery replacement questions we answer every day</h2>
                </div>
              </div>
              <div className={styles.faqStack}>
                {FAQS.map((faq) => (
                  <details key={faq.question} className={styles.faqItem}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </>
        }
      />
    </>
  );
}
