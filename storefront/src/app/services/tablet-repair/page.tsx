import React from 'react';
import Link from 'next/link';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Tablet & iPad Repair Services in Melbourne | Ali Mobile & Repair',
  description: 'Fast iPad and Samsung Tab repairs in Melbourne. Screen replacement, battery fixing, and charging port repair for all tablet models.',
};

const defaultTabletPricing = [
  { model: "iPad Pro 12.9\" (6th Gen)", service: "Screen & Digitizer Repair", price: 399 },
  { model: "iPad Air 5 / 4", service: "LCD & Glass Replacement", price: 229 },
  { model: "iPad 10th / 9th Gen", service: "Glass (Digitizer) Replacement", price: 129 },
  { model: "Samsung Tab S9 Ultra", service: "Genuine Display Assembly", price: 449 },
  { model: "All Tablets", service: "Battery replacement", price: 99 },
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
    <>
      <ServiceSchema 
        serviceName="Tablet & iPad Repair Services Melbourne"
        description="Professional iPad and tablet repair services in Ringwood, Melbourne. Expert screen and battery replacements for all makes and models."
        faqs={tabletFAQs}
      />

      <div className="page-container">
        <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', background: 'rgba(0,122,255,0.1)', color: 'var(--primary)', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Tablet Specialist
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Professional Tablet & iPad Repairs</h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8' }}>
          From shattered iPad touch glasses to unresponsive Samsung Tabs displays, we provide expert level hardware repairs to get your tablet back in your hands quickly. We use premium components to ensure your tablet functions perfectly.
        </p>

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Why Choose Us?</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <li>Quality Components for iPads & Tabs</li>
          <li>Most screen replacements done the same day</li>
          <li>Detailed diagnostic checks prior to repair</li>
          <li>180-Day Comprehensive Warranty</li>
        </ul>

        {/* Live Pricing Section */}
        <LivePricingGrid 
          title="Popular Tablet Repair Pricing"
          deviceType="tablet"
          defaultItems={defaultTabletPricing}
        />

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Frequently Asked Questions</h2>
        {tabletFAQs.map((faq, index) => (
          <div key={index} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{faq.question}</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>{faq.answer}</p>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link href="/book-repair" className="primary-btn">
            Book Appointment
          </Link>
        </div>
      </div>
    </>
  );
}
