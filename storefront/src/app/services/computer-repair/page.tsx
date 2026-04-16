import React from 'react';
import Link from 'next/link';
import { Laptop, CheckCircle2 } from 'lucide-react';
import { PricingGrid } from '@/components/services/PricingGrid';
import { FAQAccordion } from '@/components/services/FAQAccordion';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MacBook & Laptop Repair Melbourne | Professional Service',
  description: 'Expert MacBook Air, MacBook Pro, and PC laptop repairs in Melbourne. Screen replacement, battery fixing, and logic board repair.',
};

const computerPricing = [
  { model: "MacBook Air (M1/M2)", service: "LCD Screen Replacement", price: "$549" },
  { model: "MacBook Pro 13\"", service: "Battery replacement", price: "$199" },
  { model: "Windows Gaming Laptop", service: "Fan / Thermal Maintenance", price: "$89" },
  { model: "Universal Laptop", service: "Keyboard / Trackpad Repair", price: "$149" },
  { model: "Desktop / Mac", service: "OS Reinstall & Data Recovery", price: "$120" },
];

const computerFAQs = [
  {
    question: "Do you repair liquid damaged MacBooks?",
    answer: "Yes, we are specialists in logic board cleaning and component-level repair for liquid-damaged MacBooks. The sooner you bring it in, the higher the chance of a successful recovery."
  },
  {
    question: "Can you fix a laptop screen on the same day?",
    answer: "Many common MacBook and laptop screens are kept in stock and can be replaced within 2-4 hours. For rarer models, we can typically source parts within 24-48 hours."
  }
];

export default function ComputerRepairPage() {
  return (
    <div className="min-h-screen bg-surface pt-32 pb-20">
      <ServiceSchema 
        serviceName="Computer & MacBook Repair Services Melbourne"
        description="Professional MacBook and laptop repair services in Ringwood, Melbourne. Expert hardware and software troubleshooting."
        faqs={computerFAQs}
      />

      <div className="container max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:row items-center gap-12 mb-20">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Laptop size={16} /> Certified Technicians
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 tracking-tight leading-tight">
              Expert <span className="text-primary italic">MacBook</span> & Laptop Repairs
            </h1>
            <p className="text-on-surface-variant text-lg font-medium leading-relaxed mb-8">
              Hardware failures or software glitches, we fix them all. Specializing in component-level logic board repairs and high-quality screen replacements.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <CheckCircle2 size={18} className="text-success" /> Data Preservation
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <CheckCircle2 size={18} className="text-success" /> Local Melbourne Shop
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-[4/5] bg-surface-container-low rounded-[3rem] border border-outline-variant/10 flex items-center justify-center">
            <Laptop size={120} className="text-primary/10" />
          </div>
        </div>

        <PricingGrid title="Popular Computer Repair Pricing" items={computerPricing} />
        <FAQAccordion items={computerFAQs} />
        
        <div className="mt-20 p-12 bg-primary text-on-primary rounded-[3.5rem] text-center shadow-xl">
          <h2 className="text-3xl font-black mb-4">Laptop not booting up?</h2>
          <p className="opacity-80 font-medium mb-10 max-w-xl mx-auto">
            Get a professional diagnosis and a transparent repair quote from our Melbourne team.
          </p>
          <Link href="/book-repair" className="bg-white text-primary px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest">
            Book My Service
          </Link>
        </div>
      </div>
    </div>
  );
}
