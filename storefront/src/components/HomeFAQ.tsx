'use client';

import { useState } from 'react';
import Script from 'next/script';
import { ChevronDown } from 'lucide-react';
import styles from './HomeFAQ.module.css';

const faqs = [
  {
    question: "Do I need an appointment, or can I walk in?",
    answer: "Walk-ins are welcome at Ali Mobile & Repair, and online bookings get priority. If you want to check parts availability or timing before visiting, call us first."
  },
  {
    question: "Can I get a quote before repair?",
    answer: "Yes. We confirm the quote before repair starts. Pricing depends on the device model, parts needed, and the condition of the device."
  },
  {
    question: "How long does a repair usually take?",
    answer: "Repair time depends on the model, issue, queue and parts availability. Same-day repair may be available for many common phone models when parts are in stock, but we confirm timing after checking the device."
  },
  {
    question: "What devices do you repair?",
    answer: "We repair a wide range of devices including iPhone, Samsung, Google Pixel, Oppo, iPad, MacBook, and selected Apple Watch models."
  },
  {
    question: "Do you repair screens, batteries, and charging ports?",
    answer: "Yes. Common repair options include screen replacement, battery replacement, charging port repair, and selected camera or housing repairs depending on the model."
  },
  {
    question: "Do you offer a warranty on repairs?",
    answer: "Yes. Eligible repairs include warranty support. Please ask our team about warranty coverage for your device and repair type."
  },
  {
    question: "What if I’m not sure what’s wrong with my device?",
    answer: "That’s okay. Bring the device in for a practical check and we’ll help identify the issue before confirming the repair."
  },
  {
    question: "Do you offer phone repair near me in Ringwood?",
    answer: "Yes. Ali Mobile & Repair is located at Kiosk C1 inside Ringwood Square Shopping Centre. If you are searching for phone repair near me around Ringwood, Ringwood East, Heathmont, Mitcham or Croydon, you can walk in or book online before visiting."
  }
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.section}>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.kicker}>Repair clarity</span>
          <h2 className={styles.title}>Frequently Asked Questions</h2>
        </div>

        <div className={styles.grid}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `home-faq-answer-${index}`;

            return (
              <article
                key={faq.question}
                className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}
              >
                <button
                  type="button"
                  className={styles.trigger}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleFaq(index)}
                >
                  <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.question}>{faq.question}</span>
                  <span className={styles.icon} aria-hidden="true">
                    <ChevronDown size={20} strokeWidth={2.5} />
                  </span>
                </button>

                <div
                  id={answerId}
                  className={`${styles.answer} ${isOpen ? styles.answerOpen : ''}`}
                >
                  <div>
                    <p>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
