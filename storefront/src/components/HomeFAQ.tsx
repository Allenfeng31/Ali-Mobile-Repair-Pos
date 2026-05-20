'use client';

import { useState } from 'react';
import Script from 'next/script';
import { ChevronDown } from 'lucide-react';

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
    <section className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-slate-50/50">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 mb-12 text-center">
        Frequently Asked Questions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              onClick={() => toggleFaq(index)}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {faq.question}
                  </h3>
                  <div className="p-1.5 rounded-full bg-slate-50 border border-slate-100/80 shrink-0">
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
