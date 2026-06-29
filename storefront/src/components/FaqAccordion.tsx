import React from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
  density?: 'default' | 'comfortable';
}

export default function FaqAccordion({
  faqs,
  density = 'default',
}: FaqAccordionProps) {
  return (
    <section className={`faq-section ${density === 'comfortable' ? 'faq-section-compact' : ''}`}>
      <h2 className="faq-heading">Frequently Asked Questions</h2>
      <div className="faq-accordion">
        {faqs.map((faq, index) => (
          <details key={index} className="faq-item">
            <summary className="faq-question">
              <span>{faq.question}</span>
              <svg className="faq-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </summary>
            <div className="faq-answer">
              <p dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
