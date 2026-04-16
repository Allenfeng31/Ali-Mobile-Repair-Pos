import React from 'react';
import Link from 'next/link';
import { Smartphone, CheckCircle2 } from 'lucide-react';
import { PricingGrid } from '@/components/services/PricingGrid';
import { FAQAccordion } from '@/components/services/FAQAccordion';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Phone Repair Services in Melbourne | Ali Mobile & Repair',
  description: 'Fast and reliable phone repairs in Melbourne. Screen replacement, battery fixing, and water damage repair for iPhone, Samsung, Oppo, and Pixel devices.',
};

const phonePricing = [
  { model: "iPhone 15 Pro Max", service: "Premium Screen replacement", price: "$449" },
  { model: "iPhone 14 / 13", service: "Screen replacement", price: "$189" },
  { model: "Samsung S23 Ultra", service: "Genuine Screen + Frame", price: "$499" },
  { model: "Google Pixel 7 Pro", service: "OLED Screen Repair", price: "$299" },
  { model: "Generic Android", service: "Battery replacement", price: "$89" },
];

const phoneFAQs = [
  {
    question: "How long does a typical phone screen repair take in Melbourne?",
    answer: "Most phone screen repairs at Ali Mobile & Repair are completed in 15 to 30 minutes. We understand your time is valuable, so we maintain a large stock of premium parts to ensure same-day service for almost all models."
  },
  {
    question: "Will I lose my data during the repair process?",
    answer: "In 99% of cases, your data remains perfectly safe during screen or battery replacements. However, we always recommend performing a backup before any repair service as a standard safety precaution."
  },
  {
    question: "Do you offer a warranty on phone repairs?",
    answer: "Yes, we provide a 180-day warranty on all parts and labor for phone repairs. If you experience any issues related to the repair within this period, we will fix it free of charge."
  },
  {
    question: "Which phone brands do you repair?",
    answer: "We specialize in all major brands including Apple iPhone, Samsung Galaxy, Google Pixel, Oppo, Huawei, and many others. If you have a less common model, give us a call and we'll likely be able to source the parts."
  }
];

export default function PhoneRepairPage() {
  return (
    <div className="min-h-screen bg-surface pt-32 pb-20">
      <ServiceSchema 
        serviceName="Phone Repair Services Melbourne"
        description="Expert phone repair services for iPhone, Samsung, Pixel, and Oppo. Same-day screen and battery replacements in Ringwood, Melbourne."
        faqs={phoneFAQs}
      />

      <div className="container max-w-5xl mx-auto px-6">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Smartphone size={16} /> Melbourne's #1 Rated Repair Shop
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 tracking-tight leading-tight">
              Expert Phone Repair Services in <span className="text-primary italic">Melbourne</span>
            </h1>
            <p className="text-on-surface-variant text-lg font-medium leading-relaxed mb-8">
              Broken screen? Drained battery? Our certified technicians provide premium-grade repairs with a 180-day warranty. Most repairs completed while you wait.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <CheckCircle2 size={18} className="text-success" /> Genuine Parts
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <CheckCircle2 size={18} className="text-success" /> 30-Min TAT
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <CheckCircle2 size={18} className="text-success" /> 180-Day Warranty
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-[4/5] bg-surface-container-low rounded-[3rem] border border-outline-variant/10 relative overflow-hidden flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <Smartphone size={120} className="text-primary/20" />
            <div className="absolute bottom-8 left-8 right-8 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Starting Price</p>
              <p className="text-2xl font-black text-on-surface">$89 <span className="text-sm font-medium text-on-surface-variant">/ battery</span></p>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <PricingGrid 
          title="Popular Phone Repair Pricing"
          items={phonePricing}
        />

        {/* FAQ Section */}
        <FAQAccordion items={phoneFAQs} />

        {/* Final CTA */}
        <div className="mt-20 p-12 bg-primary text-on-primary rounded-[3.5rem] text-center shadow-2xl shadow-primary/30 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6">Ready to fix your phone?</h2>
            <p className="text-on-primary/80 font-medium mb-10 max-w-xl mx-auto text-lg">
              Visit our Ringwood Square location or book an appointment online to skip the queue and get your device back in pristine condition today.
            </p>
            <Link 
              href="/book-repair"
              className="inline-flex items-center gap-4 bg-white text-primary px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-surface-container-low transition-all active:scale-[0.98] shadow-xl"
            >
              Book This Repair Now
            </Link>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>
    </div>
  );
}
