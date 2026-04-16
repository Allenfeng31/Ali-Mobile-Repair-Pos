import React from 'react';
import Link from 'next/link';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phone & iPhone Repair in Melbourne | Ali Mobile & Repair',
  description: 'Fast and reliable phone repairs in Melbourne. Screen replacement, battery fixing, and water damage repair for iPhone, Samsung, Oppo, and Pixel devices.',
};

const defaultPhonePricing = [
  { model: "iPhone 15 Pro Max", service: "Premium Screen replacement", price: 449 },
  { model: "iPhone 14 / 13", service: "Screen replacement", price: 189 },
  { model: "Samsung S23 Ultra", service: "Genuine Screen + Frame", price: 499 },
  { model: "Google Pixel 7 Pro", service: "OLED Screen Repair", price: 299 },
  { model: "Generic Android", service: "Battery replacement", price: 89 },
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
    <>
      <ServiceSchema 
        serviceName="Phone Repair Services Melbourne"
        description="Expert phone repair services for iPhone, Samsung, Pixel, and Oppo. Same-day screen and battery replacements in Ringwood, Melbourne."
        faqs={phoneFAQs}
      />
      
      <div className="page-container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Phone & iPhone Repair in Melbourne</h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8' }}>
          At Ali Mobile React, we specialize in high-quality iPhone and Android screen replacements. 
          Whether you dropped your brand new iPhone 15 or need a quick fix for an older Samsung model, 
          our expert technicians in Ringwood will have it looking brand new in just 15-30 minutes.
        </p>

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Why Choose Us?</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <li>Premium Quality Screens & Genuine Parts Available</li>
          <li>On-the-spot Repair (15-60 min typically)</li>
          <li>No Fix, No Charge Guarantee</li>
          <li>180-Day Comprehensive Warranty</li>
          <li>Over 10 Years Industry Experience</li>
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
