'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="faq-section py-12">
      <h2 className="text-3xl font-black mb-8 text-center text-on-surface">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="border border-outline-variant/10 rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <span className="font-bold text-on-surface leading-tight text-lg">{item.question}</span>
              <ChevronDown 
                size={20} 
                className={cn(
                  "text-on-surface-variant transition-transform duration-300",
                  openIndex === index ? "rotate-180" : ""
                )} 
              />
            </button>
            <div 
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="p-6 pt-0 text-on-surface-variant leading-relaxed text-base">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
