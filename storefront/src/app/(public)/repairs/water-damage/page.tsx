import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ClipboardCheck, Droplets, MapPin, PhoneCall, ShieldAlert } from 'lucide-react';

import styles from './page.module.css';

const PAGE_URL = 'https://www.alimobile.com.au/repairs/water-damage';
const PAGE_TITLE = 'Phone Water Damage Assessment & Cleaning Ringwood | Ali Mobile';
const PAGE_DESCRIPTION =
  'Dropped your phone in water? Ali Mobile & Repair in Ringwood provides quote-first liquid damage assessment and cleaning advice. Do not charge the phone; bring it in early for diagnosis.';

const immediateSteps = [
  'Power off the phone if possible.',
  'Remove the case, SIM tray and accessories if safe.',
  'Do not charge the phone or connect it to a computer.',
  'Do not keep pressing buttons or repeatedly testing it.',
  'Bring it in early for liquid damage assessment.',
];

const avoidSteps = [
  'Do not charge the phone.',
  'Do not use a hair dryer, heat gun or direct heat.',
  'Do not rely on rice as a repair method.',
  'Do not keep turning it on to check whether it works.',
  'Do not assume it is safe because the phone still works now.',
];

const assessmentSteps = [
  'Visual inspection of the device condition and liquid exposure path.',
  'Check accessible liquid indicators and corrosion signs where possible.',
  'Open and inspect affected areas when appropriate for the model and condition.',
  'Clean, dry and treat corrosion-affected areas where appropriate.',
  'Test display, battery, charging, cameras, buttons, speakers and board-related symptoms.',
  'Explain the quote before parts replacement or further repair work.',
];

const outcomes = [
  'Minor exposure may need cleaning, drying and testing only.',
  'Some phones may need parts such as a screen, battery or charging port.',
  'Board-level damage may need further assessment before options are clear.',
  'Some phones may not be economical to repair.',
  'Some phones may be suitable only for data-focused assessment.',
];

const faqs = [
  {
    question: 'What should I do if my phone gets wet?',
    answer:
      'Turn it off if possible, do not charge it, remove safe accessories, and bring it in early for assessment. Repeated testing can make liquid damage worse.',
  },
  {
    question: 'Should I put my phone in rice?',
    answer:
      'Rice is not a repair method. It may leave dust or debris and does not remove corrosion from connectors, screens, batteries or board areas.',
  },
  {
    question: 'Can water damaged phones be repaired?',
    answer:
      'Some liquid-damaged phones can be cleaned or repaired, but the result depends on corrosion level, affected parts, time since exposure and board condition.',
  },
  {
    question: 'Can data be recovered after water damage?',
    answer:
      'Data may still be accessible in some cases, but liquid exposure, corrosion and board faults increase risk. If data matters most, tell the technician before repair decisions are made.',
  },
  {
    question: 'Is it safe to charge a wet phone?',
    answer:
      'No. Charging a wet phone can worsen corrosion or cause further electrical damage. Keep it unplugged until it has been assessed.',
  },
  {
    question: 'How long does water damage assessment take?',
    answer:
      'Timing depends on the model, condition, queue and how much inspection or cleaning is needed. Call first with the model and exposure details if timing is important.',
  },
  {
    question: 'Will my phone be waterproof again after repair?',
    answer:
      'Opening, cleaning or repairing a phone does not restore the original factory water-resistance rating. Avoid intentional liquid exposure after any repair.',
  },
];

const relatedLinks = [
  { href: '/repairs/phone', label: 'Phone repair hub', note: 'Choose your brand and model.' },
  { href: '/repairs/phone/iphone', label: 'iPhone repair hub', note: 'Check iPhone repair paths.' },
  { href: '/repairs/charging-port-replacement', label: 'Charging port repair', note: 'For charging faults after assessment.' },
  { href: '/repairs/screen-replacement', label: 'Screen replacement', note: 'For display faults after assessment.' },
  { href: '/repairs/battery-replacement', label: 'Battery replacement', note: 'For battery symptoms after assessment.' },
];

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
      name: 'Water Damage Assessment',
      item: PAGE_URL,
    },
  ],
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'Phone Water Damage Assessment & Cleaning',
  serviceType: 'Diagnostic Service',
  url: PAGE_URL,
  description:
    'Quote-first liquid damage assessment and cleaning advice for phones affected by water or other liquid exposure.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Ali Mobile & Repair',
    url: 'https://www.alimobile.com.au/',
    telephone: '0481 058 514',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ringwood Square Shopping Centre, Kiosk C1, Seymour Street',
      addressLocality: 'Ringwood',
      addressRegion: 'VIC',
      postalCode: '3134',
      addressCountry: 'AU',
    },
  },
  areaServed: [
    {
      '@type': 'Place',
      name: 'Ringwood, VIC',
    },
    {
      '@type': 'Place',
      name: "Melbourne's eastern suburbs",
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export const revalidate = 86400;

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

export default function WaterDamagePage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/repairs">Repairs</Link>
        <span>/</span>
        <strong>Water Damage Assessment</strong>
      </nav>

      <section className={styles.hero} aria-labelledby="water-damage-heading">
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>
            <Droplets size={16} strokeWidth={2.5} aria-hidden="true" />
            Liquid damage diagnosis
          </span>
          <h1 id="water-damage-heading">Phone Water Damage Assessment & Cleaning</h1>
          <p>
            If your phone gets wet, turn it off if possible and do not charge it. Ali Mobile can assess liquid damage,
            clean affected areas where appropriate, and explain repair options before proceeding.
          </p>
          <p>
            Water damage outcomes depend on corrosion level and affected components. Repair results and data outcomes
            cannot be promised after liquid exposure.
          </p>
          <div className={styles.actions}>
            <a href="tel:0481058514" className="repair-primary-action">
              <PhoneCall size={18} strokeWidth={2.6} aria-hidden="true" />
              Call 0481 058 514
            </a>
            <Link href="/book-repair" className="repair-secondary-action">
              Book Assessment
              <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className={styles.quickAnswer} aria-label="Quick answer">
          <AlertTriangle size={24} strokeWidth={2.4} aria-hidden="true" />
          <h2>Quick answer</h2>
          <p>
            Keep the phone switched off, avoid charging, and bring it in early. Tell us what liquid was involved, when it
            happened, and whether the device still powers on.
          </p>
        </aside>
      </section>

      <section className={styles.splitSection} aria-labelledby="immediate-steps-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>First steps</span>
          <h2 id="immediate-steps-heading">What to do immediately</h2>
        </div>
        <div className={styles.cardGrid}>
          {immediateSteps.map((step, index) => (
            <article key={step} className={styles.stepCard}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.warningBand} aria-labelledby="what-not-to-do-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>
            <ShieldAlert size={15} strokeWidth={2.5} aria-hidden="true" />
            Avoid extra damage
          </span>
          <h2 id="what-not-to-do-heading">What not to do</h2>
        </div>
        <div className={styles.cardGrid}>
          {avoidSteps.map((step) => (
            <article key={step} className={styles.warningCard}>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contentBand} aria-labelledby="assessment-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>
            <ClipboardCheck size={15} strokeWidth={2.5} aria-hidden="true" />
            Quote-first process
          </span>
          <h2 id="assessment-heading">How Ali Mobile assesses water damaged phones</h2>
          <p>
            Liquid damage diagnosis starts by checking what is affected before parts are replaced. The practical path
            depends on the model, exposure and condition found during inspection.
          </p>
        </div>
        <div className={styles.assessmentList}>
          {assessmentSteps.map((step) => (
            <div key={step}>{step}</div>
          ))}
        </div>
      </section>

      <section className={styles.contentBand} aria-labelledby="outcomes-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>Possible outcomes</span>
          <h2 id="outcomes-heading">What can happen after assessment</h2>
          <p>
            Liquid exposure can be minor, severe, or still developing. We explain the quote and risk before further work.
          </p>
        </div>
        <div className={styles.outcomeGrid}>
          {outcomes.map((outcome) => (
            <article key={outcome} className={styles.outcomeCard}>
              <p>{outcome}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.dataPanel} aria-labelledby="data-risk-heading">
        <div>
          <span className={styles.kicker}>Data risk</span>
          <h2 id="data-risk-heading">Tell us first if the data matters most</h2>
          <p>
            Data may still be accessible in some cases, but liquid exposure, board faults and corrosion increase risk. If
            photos, messages or app data are the priority, tell the technician before repair decisions are made.
          </p>
        </div>
      </section>

      <section className={styles.ctaPanel} aria-labelledby="quote-first-heading">
        <div>
          <span className={styles.kicker}>
            <MapPin size={15} strokeWidth={2.5} aria-hidden="true" />
            Ringwood assessment
          </span>
          <h2 id="quote-first-heading">Call or visit for quote-first liquid damage advice</h2>
          <p>
            Contact Ali Mobile & Repair with your phone model, what liquid exposure happened, when it happened, and
            whether the device still powers on. We are at Ringwood Square Shopping Centre, Kiosk C1.
          </p>
        </div>
        <div className={styles.actions}>
          <a href="tel:0481058514" className="repair-primary-action">
            <PhoneCall size={18} strokeWidth={2.6} aria-hidden="true" />
            Call Now
          </a>
          <Link href="/repairs/phone" className="repair-secondary-action">
            Choose Phone Model
          </Link>
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="water-damage-faq-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>FAQ</span>
          <h2 id="water-damage-faq-heading">Water damage phone repair questions</h2>
        </div>
        <div className={styles.faqGrid}>
          {faqs.map((faq) => (
            <article key={faq.question} className={styles.faqCard}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.relatedSection} aria-labelledby="related-links-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>Helpful links</span>
          <h2 id="related-links-heading">Related repair paths after assessment</h2>
        </div>
        <div className={styles.relatedGrid}>
          {relatedLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.relatedCard}>
              <strong>{link.label}</strong>
              <span>{link.note}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
