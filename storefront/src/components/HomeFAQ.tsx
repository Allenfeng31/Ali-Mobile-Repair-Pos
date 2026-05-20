'use client';

import { useState } from 'react';
import Script from 'next/script';
import { ChevronDown } from 'lucide-react';
import styles from './HomeFAQ.module.css';

const faqs = [
  {
    question: "How much does it cost to fix a phone screen?",
    answer: "Prices vary by model, but we offer free quotes and a 'No Fix, No Charge' policy. You can get an instant live quote for most models right here on our website!"
  },
  {
    question: "How long does a battery replacement take?",
    answer: "Most battery and screen replacements are completed in under 1 hour at our Ringwood store, so you can often get it done while you shop at Ringwood Square."
  },
  {
    question: "Do I need to book an appointment?",
    answer: "Walk-ins are always welcome at our Kiosk in Ringwood Square Shopping Centre, but booking online guarantees priority service."
  },
  {
    question: "Will I lose my data during the repair?",
    answer: "In most cases, no. Your data is safe during standard hardware repairs like screens or batteries. We always recommend backing up your device, but we do not wipe devices for these repairs."
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

      <div className={`max-w-5xl mx-auto ${styles.inner}`}>
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
