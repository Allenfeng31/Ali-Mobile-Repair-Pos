import React from 'react';
import Link from 'next/link';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'iPad & Tablet Repair Ringwood | OEM Battery & Screen Fixes | Ali Mobile & Repair',
  description: 'Fast iPad and Samsung Tab repairs in Ringwood, serving Croydon and Mitcham. Weekday same-day repairs, OEM standard batteries, and 180-day warranty.',
};

const defaultTabletPricing = [
  { model: "iPad 10th Gen", service: "Screen replacement", price: 170, search: "ipad 10 screen" },
  { model: "iPad 7 / 8 / 9", service: "Screen replacement", price: 130, search: "ipad 7 screen" },
  { model: "iPad 6", service: "Screen replacement", price: 120, search: "ipad 6 screen" },
  { model: "iPad 7 / 8 / 9", service: "Battery replacement", price: 110, search: "ipad 7 battery" },
  { model: "iPad 6", service: "Battery replacement", price: 90, search: "ipad 6 battery" },
];

const tabletFAQs = [
  {
    question: "Do you repair cracked iPad screens in Ringwood?",
    answer: "Yes, we specialize in iPad screen repairs right here in Ringwood. Whether you only need the top glass or the entire LCD assembly replaced, we offer fast, high-quality same-day service during weekdays."
  },
  {
    question: "What kind of replacement batteries do you use for tablets?",
    answer: "We use strictly OEM (Original Equipment Manufacturer) standard batteries for all tablet and iPad replacements. The quality and lifespan of our batteries are completely identical to the original battery your tablet came with."
  },
  {
    question: "How long does an iPad repair take?",
    answer: "Most iPad repairs are completed within 1-2 hours. Because iPads are sealed with strong adhesive, we take extra time to ensure the device is properly bonded and cured. Drop it off during a weekday and get it back the same day!"
  },
  {
    question: "What is your warranty policy for tablet repairs?",
    answer: "All tablet screen and battery replacements are backed by our 180-day comprehensive warranty. If the part malfunctions within 6 months, simply bring it back to our Ringwood shop for a free replacement."
  },
  {
    question: "Is my tablet data safe during the repair?",
    answer: "Your data is perfectly safe during hardware repairs like screen and battery swaps. We do not access or wipe your data. However, we always recommend cloud backups (like iCloud or Google Drive) before coming in."
  }
];

export default function TabletRepairPage() {
  return (
    <>
      <ServiceSchema 
        serviceName="Tablet & iPad Repair Services Ringwood"
        description="Professional iPad and tablet repair services in Ringwood, Melbourne. Expert screen and OEM battery replacements for all makes and models."
        faqs={tabletFAQs}
      />

      <div className="page-container">
        <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', background: 'rgba(0,122,255,0.1)', color: 'var(--primary)', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Tablet Specialist
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>Professional Tablet & iPad Repairs in Ringwood</h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>
          From shattered iPad touch glasses to unresponsive Samsung Tabs batteries, we provide expert hardware repairs for the Eastern Suburbs including <strong>Croydon, Mitcham, and Wantirna</strong>.
        </p>

        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8', color: 'var(--primary)', fontWeight: 'bold' }}>
          Take advantage of our Weekday Same-Day repair service! We carry OEM-grade parts and can return your iPad the exact same day.
        </p>

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Why Choose Us?</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <li><strong>Weekday Same-Day Repair:</strong> Get your tablet back the same day.</li>
          <li><strong>OEM Standard Batteries:</strong> Exactly the same quality and lifespan as original batteries.</li>
          <li>Detailed diagnostic checks prior to repair</li>
          <li>180-Day Comprehensive Warranty Coverage</li>
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
