import React from 'react';
import Link from 'next/link';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apple Watch Repair Melbourne | Screen & Battery Fixes',
  description: 'Fast and reliable Apple Watch repairs in Melbourne. Screen replacement and battery fixing for all Series and Ultra models.',
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
    <>
      <ServiceSchema 
        serviceName="Smart Watch Repair Services Melbourne"
        description="Professional Apple Watch and smart watch repair services in Ringwood, Melbourne. Expert screen and battery replacements."
        faqs={watchFAQs}
      />

      <div className="page-container">
        <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', background: 'rgba(255,45,85,0.1)', color: 'var(--accent)', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Watch Specialist
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Premium Smart Watch Repairs</h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8' }}>
          Shattered Apple Watch screen? Battery not lasting through the day? We specialize in precision repairs for all Apple Watch Series and Ultra models, bringing them back to life.
        </p>

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Why Choose Us?</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <li>Precision Tools & Specialised Equipment</li>
          <li>High-quality adhesive seals</li>
          <li>Quick turnaround on most repairs</li>
          <li>Warranty on parts and labour</li>
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
