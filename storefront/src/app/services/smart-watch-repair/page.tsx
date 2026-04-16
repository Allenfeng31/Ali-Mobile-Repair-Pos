import React from 'react';
import Link from 'next/link';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apple Watch Repair Ringwood | Battery & Screen Replace | Ali Mobile',
  description: 'Fast Apple Watch repairs in Ringwood, serving Mitcham and Croydon. Weekday same-day screen replacements and battery fixing for Series and Ultra models.',
};

const defaultWatchPricing = [
  { model: "Apple Watch Ultra / Ultra 2", service: "Display Assembly Fix", price: 499 },
  { model: "Apple Watch Series 9 / 8 / 7", service: "Glass & OLED replacement", price: 249 },
  { model: "Apple Watch SE", service: "Screen replacement", price: 169 },
  { model: "All Series Models", service: "Battery replacement", price: 79 },
  { model: "Watch Face", service: "Rear Housing Glass Repair", price: 120 },
];

const watchFAQs = [
  {
    question: "Do you offer weekday same-day Apple Watch repairs in Ringwood?",
    answer: "Yes, we prioritize smart watch repairs during all weekdays. If we have the screen or battery in stock, we guarantee a same-day turnaround for our local Ringwood customers."
  },
  {
    question: "What should I do if my Apple Watch won't turn on?",
    answer: "First, try a forced restart. If it still won't hold a charge, the battery likely needs replacing. Battery degradation is normal over time, and our service restores your watch to full-day usage."
  },
  {
    question: "How long does an Apple Watch screen repair take?",
    answer: "Due to the precision required for sealing smart watches, most Apple watch screen repairs take around 2 to 4 hours using our specialized press equipment."
  },
  {
    question: "Will my Apple Watch remain waterproof after repair?",
    answer: "While we use high-quality gaskets and premium adhesives to reseal the watch exactly to OEM standards, we generally recommend avoiding complete submersion in water after any repair."
  },
  {
    question: "Is it worth repairing my smartwatch?",
    answer: "Absolutely! Battery or screen replacements are highly cost-effective compared to buying a brand new Apple Watch Series or Ultra. Bring it in for a quote!"
  }
];

export default function SmartWatchRepairPage() {
  return (
    <>
      <ServiceSchema 
        serviceName="Smart Watch Repair Services Ringwood"
        description="Professional Apple Watch and smart watch repair services in Ringwood, Melbourne. Weekday same-day screen and battery replacements."
        faqs={watchFAQs}
      />

      <div className="page-container">
        <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', background: 'rgba(255,45,85,0.1)', color: 'var(--accent)', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Watch Specialist
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>Premium Smart Watch Repairs in Ringwood</h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>
          Shattered Apple Watch screen? Battery not lasting through the day? We specialize in precision repairs for all Apple Watch models, proudly servicing <strong>Ringwood, Croydon, Mitcham, and Wantirna</strong>.
        </p>

        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8', color: 'var(--accent)', fontWeight: 'bold' }}>
          Drop off your watch on a weekday and get it back the same day! Our fast turnaround keeps you connected without the long wait.
        </p>

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Why Choose Us?</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <li><strong>Weekday Same-Day Guarantee:</strong> Quick, secure turnarounds.</li>
          <li>Precision Tools & Specialised Press Equipment</li>
          <li>High-quality adhesive seals</li>
          <li>180-Day Warranty on parts and labour</li>
        </ul>

        <LivePricingGrid 
          title="Smart Watch Repair Pricing"
          deviceType="watch"
          defaultItems={defaultWatchPricing}
        />

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Frequently Asked Questions</h2>
        {watchFAQs.map((faq, index) => (
          <div key={index} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{faq.question}</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>{faq.answer}</p>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link href="/book-repair" className="primary-btn">
            Book Repair Appointment
          </Link>
        </div>
      </div>
    </>
  );
}
