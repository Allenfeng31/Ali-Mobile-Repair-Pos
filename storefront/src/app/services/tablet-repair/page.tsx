import React from 'react';
import Link from 'next/link';
import { Tablet, CheckCircle2 } from 'lucide-react';
import { PricingGrid } from '@/components/services/PricingGrid';
import { FAQAccordion } from '@/components/services/FAQAccordion';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Tablet & iPad Repair Services in Melbourne | Ali Mobile & Repair',
  description: 'Fast iPad and Samsung Tab repairs in Melbourne. Screen replacement, battery fixing, and charging port repair for all tablet models.',
};

const tabletPricing = [
  { model: "iPad Pro 12.9\" (6th Gen)", service: "Screen & Digitizer Repair", price: "$399" },
  { model: "iPad Air 5 / 4", service: "LCD & Glass Replacement", price: "$229" },
  { model: "iPad 10th / 9th Gen", service: "Glass (Digitizer) Replacement", price: "$129" },
  { model: "Samsung Tab S9 Ultra", service: "Genuine Display Assembly", price: "$449" },
  { model: "All Tablets", service: "Battery replacement", price: "$99" },
];

const tabletFAQs = [
  {
    question: "Do you repair cracked iPad screens in Melbourne?",
    answer: "Yes, we specialize in iPad screen repairs. Whether you only need the top glass or the entire LCD assembly replaced, we offer fast, high-quality service at our Ringwood location."
  },
  {
    question: "How long does an iPad repair take?",
    answer: "Most iPad repairs are completed within 1-2 hours. Because iPads are sealed with strong adhesive, we take extra time to ensure the device is properly bonded and cured before returning it to you."
  },
  {
    question: "Is my tablet data safe during the repair?",
    answer: "Your data is generally safe during hardware repairs. However, we always recommend cloud backups (like iCloud or Google Drive) before coming in for any service."
  }
];

export default function TabletRepairPage() {
  return (
    <div className="min-h-screen bg-surface pt-32 pb-20">
      <ServiceSchema 
        serviceName="Tablet & iPad Repair Services Melbourne"
        description="Professional iPad and tablet repair services in Ringwood, Melbourne. Expert screen and battery replacements for all makes and models."
        faqs={tabletFAQs}
      />

      <div className="container max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:row items-center gap-12 mb-20">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Tablet size={16} /> Tablet Specialist
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 tracking-tight leading-tight">
              Professional Tablet & <span className="text-primary italic">iPad</span> Repairs
            </h1>
            <p className="text-on-surface-variant text-lg font-medium leading-relaxed mb-8">
              From shattered iPad screens to unresponsive Samsung Tabs, we provide expert level hardware repairs to get your tablet back in your hands quickly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <CheckCircle2 size={18} className="text-success" /> Quality Components
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <CheckCircle2 size={18} className="text-success" /> Same Day Service
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-[4/5] bg-surface-container-low rounded-[3rem] border border-outline-variant/10 relative overflow-hidden flex items-center justify-center p-8">
            <Tablet size={120} className="text-primary/10" />
            <div className="absolute bottom-8 left-8 right-8 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Starting Price</p>
              <p className="text-2xl font-black text-on-surface">$129 <span className="text-sm font-medium text-on-surface-variant">/ screen</span></p>
            </div>
          </div>
        </div>

        <PricingGrid title="Popular Tablet Repair Pricing" items={tabletPricing} />
        <FAQAccordion items={tabletFAQs} />
        
        <div className="mt-20 p-12 bg-surface-container-low rounded-[3.5rem] text-center border border-outline-variant/10">
          <h2 className="text-3xl font-black text-on-surface mb-4">Tablet acting up?</h2>
          <p className="text-on-surface-variant font-medium mb-10 max-w-xl mx-auto">
            Book a session with our Ringwood expert today and get a full health check for your device.
          </p>
          <Link href="/book-repair" className="inline-flex items-center gap-4 bg-primary text-on-primary px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
