import React from 'react';
import Link from 'next/link';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phone Repair Ringwood | Weekday Same Day Fix | Ali Mobile & Repair',
  description: 'Fast phone repairs in Ringwood, servicing Croydon, Mitcham, and Heathmont. Weekday same-day screen and battery replacements for iPhone, Samsung, and Pixel with 180-day warranty.',
};

const defaultPhonePricing = [
  { model: "iPhone 17 / 17 Pro", service: "Premium Screen replacement", price: 499, search: "iphone 17 screen" },
  { model: "iPhone 13 / 13 Pro", service: "Screen replacement", price: 189, search: "iphone 13 screen" },
  { model: "iPhone 11", service: "Screen replacement", price: 149, search: "iphone 11 screen" }
];

const phoneFAQs = [
  {
    question: "Do you offer same-day phone repairs?",
    answer: "Absolutely! During any weekday, if we have the parts in stock, repairs take just 15-30 minutes. If we need to source a specific component from our local suppliers, we still guarantee the repair will be completed on the exact same day!"
  },
  {
    question: "How long does a typical phone screen repair take at your Ringwood store?",
    answer: "Most phone screen repairs are completed in 15 to 30 minutes while you wait. We are centrally located in Ringwood, making us a quick drive from Croydon, Mitcham, Heathmont, and Wantirna."
  },
  {
    question: "Will I lose my data during the repair process?",
    answer: "In 99% of cases, your data remains perfectly safe during screen or battery replacements. However, we always recommend performing a backup before any repair service as a standard safety precaution."
  },
  {
    question: "What is your warranty on phone repairs?",
    answer: "We proudly offer a 180-day comprehensive warranty on all parts and labor. If you experience any technical faults related to the repair within this 6-month period, we will fix it completely free of charge."
  },
  {
    question: "Which phone brands do you repair?",
    answer: "We specialize in all major brands including Apple iPhone, Samsung Galaxy, Google Pixel, Oppo, and Huawei. Because we stock parts locally, we can fix these brands immediately on any weekday."
  }
];

export default function PhoneRepairPage() {
  return (
    <>
      <ServiceSchema 
        serviceName="Phone Repair Services Ringwood"
        description="Expert phone repair services for iPhone, Samsung, Pixel, and Oppo serving Melbourne's Eastern Suburbs. Weekday same-day screen and battery replacements."
        faqs={phoneFAQs}
      />
      
      <div className="page-container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>Phone & iPhone Repair in Ringwood, Melbourne</h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>
          At Ali Mobile Repair, we specialize in high-quality iPhone and Android screen replacements. 
          Centrally located in Ringwood, we are the go-to repair shop for the Eastern Suburbs including <strong>Croydon, Mitcham, Heathmont, and Wantirna</strong>.
        </p>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8', color: 'var(--primary)', fontWeight: 'bold' }}>
          Take advantage of our Weekday Same-Day repair service! If we have the parts in stock, screen and battery replacements take just 15-30 minutes, and all other repairs are completed quickly! Even if we need to quickly source a part locally, we still guarantee it will be completed the exact same day!
        </p>

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Why Choose Us?</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <li><strong>Weekday Same-Day Repair Guarantee:</strong> We ensure same-day completion.</li>
          <li>Premium Quality Screens & Parts Available</li>
          <li>On-the-spot Repair (15-30 min for screens and batteries)</li>
          <li>No Fix, No Charge Policy</li>
          <li>180-Day Comprehensive Warranty</li>
        </ul>

        {/* Live Pricing Section fetches from Backend */}
        <LivePricingGrid 
          title="Popular Phone Repair Pricing"
          deviceType="phone"
          defaultItems={defaultPhonePricing}
        />

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Frequently Asked Questions</h2>
        {phoneFAQs.map((faq, index) => (
          <div key={index} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{faq.question}</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>{faq.answer}</p>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link href="/book-repair" className="primary-btn">
            Book Your Phone Repair
          </Link>
        </div>
      </div>
    </>
  );
}
