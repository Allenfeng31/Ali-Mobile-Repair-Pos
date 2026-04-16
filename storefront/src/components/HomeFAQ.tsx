'use client';

import Script from 'next/script';

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

  return (
    <section style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>
        Frequently Asked Questions
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            style={{ 
              background: 'var(--layer)', 
              padding: '1.5rem', 
              borderRadius: '16px', 
              border: '1px solid var(--layer-border)' 
            }}
          >
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
              {faq.question}
            </h3>
            <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
