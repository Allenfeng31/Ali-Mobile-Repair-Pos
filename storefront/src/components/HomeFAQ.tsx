'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './HomeFAQ.module.css';

const faqs = [
  {
    question: "Do I need an appointment, or can I walk in?",
    answer: "Walk-ins are welcome at Ali Mobile & Repair. You can also check available repair pricing and book online before visiting. If you want to confirm parts availability or repair timing, please call ahead."
  },
  {
    question: "Can I check the repair price before coming in?",
    answer: "Yes. You can check available repair prices through our online booking flow and continue directly to booking. For repairs that do not have a listed price, we will provide a quote before repair work starts."
  },
  {
    question: "How long does a repair usually take?",
    answer: "Many phone repairs take around 15–60 minutes. Tablet and iPad repairs and laptop or MacBook repairs typically take around 1–2 hours, while selected Apple Watch repairs are around 45 minutes. Actual timing depends on the model, repair type, fault, parts availability and whether diagnostics or specialist work is required."
  },
  {
    question: "What devices and repairs do you offer?",
    answer: "We repair phones, iPad and other tablets, laptops and MacBook models, and selected Apple Watch models. Common repairs include screen replacement, battery replacement, charging port repair, camera repairs and selected back glass or housing repairs, depending on the device and model."
  },
  {
    question: "Do you offer a warranty on repairs?",
    answer: "Yes. Standard repairs include a 6-month warranty. Water-damage repairs have no warranty."
  },
  {
    question: "What if my device is not working or has water damage?",
    answer: "Bring the device in for an assessment if you are not sure what is wrong. Water-damaged or non-working devices may require diagnostics, cleaning or further inspection, and repair time and pricing depend on the condition of the device. Recovery or successful repair cannot be guaranteed, and water-damage repairs have no warranty."
  },
  {
    question: "Where is Ali Mobile & Repair located?",
    answer: "Ali Mobile & Repair is located at Kiosk C1 inside Ringwood Square Shopping Centre, Ringwood VIC. Walk-ins are welcome, or you can check pricing and book online before visiting."
  }
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.section}>
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
