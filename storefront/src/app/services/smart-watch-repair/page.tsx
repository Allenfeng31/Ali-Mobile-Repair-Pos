import React from 'react';
import Link from 'next/link';
import { Watch, CheckCircle2 } from 'lucide-react';
import { PricingGrid } from '@/components/services/PricingGrid';
import { FAQAccordion } from '@/components/services/FAQAccordion';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apple Watch Repair Melbourne | Screen & Battery Fixes',
  description: 'Fast and reliable Apple Watch repairs in Melbourne. Screen replacement and battery fixing for all Series and Ultra models.',
};

const watchPricing = [
  { model: "Apple Watch Ultra / Ultra 2", service: "Display Assembly Fix", price: "$499" },
  { model: "Apple Watch Series 9 / 8 / 7", service: "Glass & OLED replacement", price: "$249" },
  { model: "Apple Watch SE", service: "Screen replacement", price: "$169" },
  { model: "All Series Models", service: "Battery replacement", price: "$79" },
  { model: "Watch Face", service: "Rear Housing Glass Repair", price: "$120" },
];

const watchFAQs = [
  {
    question: "How long does an Apple Watch screen repair take?",
    answer: "Due to the precision required for sealing smart watches, most Apple Watch repairs take between 2 to 4 hours. We use specialized equipment to ensure the device remains properly aligned."
  },
  {
    question: "Will my Apple Watch remain waterproof after repair?",
    answer: "While we use high-quality gaskets and adhesives to reseal the watch, we generally recommend avoiding complete submersion in water after any repair that involves opening the device."
  }
];

export default function SmartWatchRepairPage() {
  return (
    <div className="min-h-screen bg-surface pt-32 pb-20">
      <ServiceSchema 
        serviceName="Smart Watch Repair Services Melbourne"
        description="Professional Apple Watch and smart watch repair services in Ringwood, Melbourne. Expert screen and battery replacements."
        faqs={watchFAQs}
      />

      <div className="container max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:row items-center gap-12 mb-20">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Watch size={16} /> Watch Specialist
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 tracking-tight leading-tight">
              Premium <span className="text-primary italic">Smart Watch</span> Repairs
            </h1>
            <p className="text-on-surface-variant text-lg font-medium leading-relaxed mb-8">
              Shattered Apple Watch screen? Battery not lasting through the day? We specialize in precision repairs for all Series and Ultra models.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-on-surface justify-center md:justify-start">
              <CheckCircle2 size={18} className="text-success" /> Precision Tools
              <CheckCircle2 size={18} className="text-success" /> Factory Seals
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-[4/5] bg-surface-container-low rounded-[3rem] border border-outline-variant/10 flex items-center justify-center">
            <Watch size={120} className="text-primary/10" />
          </div>
        </div>

        <PricingGrid title="Smart Watch Repair Pricing" items={watchPricing} />
        <FAQAccordion items={watchFAQs} />
        
        <div className="mt-20 p-12 bg-surface-container-low rounded-[3.5rem] text-center border border-outline-variant/10">
          <h2 className="text-3xl font-black text-on-surface mb-4">Ready to fix your watch?</h2>
          <Link href="/book-repair" className="inline-flex items-center gap-4 bg-primary text-on-primary px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
            Book Repair Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
