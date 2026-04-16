import React from 'react';
import Link from 'next/link';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Laptop & MacBook Repair Ringwood | SSD Upgrades & Screen Replacement',
  description: 'Expert MacBook Air, MacBook Pro, and PC laptop repairs in Ringwood serving Mitcham and Croydon. Weekday same-day repairs, SSD upgrades, and logic board fixes.',
};

const defaultComputerPricing = [
  { model: "MacBook Air (M1/M2)", service: "LCD Screen Replacement", price: 549 },
  { model: "MacBook Pro 13\"", service: "Battery replacement", price: 199 },
  { model: "Windows Gaming Laptop", service: "Fan / Thermal Maintenance", price: 89 },
  { model: "Universal Laptop", service: "Keyboard / Trackpad Repair", price: 149 },
  { model: "Desktop / Mac", service: "OS Reinstall & Data Recovery", price: 120 },
];

const computerFAQs = [
  {
    question: "Do you repair liquid damaged MacBooks in Ringwood?",
    answer: "Yes, we are specialists in logic board cleaning and component-level repair for liquid-damaged MacBooks. The sooner you bring it in, the higher the chance of a successful recovery."
  },
  {
    question: "Can you fix a laptop screen on the same day?",
    answer: "Absolutely! Many common MacBook and laptop screens are kept in stock. If you drop it off during a weekday, our same-day repair policy applies and we can have it ready in just a few hours."
  },
  {
    question: "Why is my laptop running so slowly?",
    answer: "Sluggish performance is often caused by a nearly full hard drive, insufficient RAM, or outdated software. We offer complete diagnostic checks and can recommend quick hardware upgrades to boost your speed."
  },
  {
    question: "My laptop is overheating—is this bad?",
    answer: "Yes, constant overheating can lead to permanent component degradation and random shutdowns. Bring it to our Ringwood shop for thermal repasting and internal fan cleaning to protect your investment."
  },
  {
    question: "Can I upgrade my laptop's RAM or storage?",
    answer: "In most Windows laptops and older MacBooks, yes! Upgrading from an old hard drive to a modern solid-state drive (SSD) is the most cost-effective way to speed up your machine."
  }
];

export default function ComputerRepairPage() {
  return (
    <>
      <ServiceSchema 
        serviceName="Computer & MacBook Repair Services Ringwood"
        description="Professional MacBook and laptop repair services in Ringwood, Melbourne. Expert hardware upgrades, screen repairs, and motherboard troubleshooting."
        faqs={computerFAQs}
      />

      <div className="page-container">
        <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', background: 'rgba(255,149,0,0.1)', color: '#ff9500', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Certified Technicians
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>Expert MacBook & Laptop Repairs in Ringwood</h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>
          Whether it's hardware failures or software glitches, we fix them all. We serve <strong>Maroondah, Croydon, Mitcham, and Heathmont</strong> with high-quality screen replacements and data recovery.
        </p>

        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8', color: 'var(--primary)', fontWeight: 'bold' }}>
          Don't wait for days—take advantage of our Weekday Same-Day repair service for most hardware upgrades and screen repairs!
        </p>

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Why Choose Us?</h2>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <li><strong>Weekday Same-Day Repair:</strong> Available for screens and batteries in stock.</li>
          <li>Expert Data Preservation protocols</li>
          <li>Component-level motherboard repairs</li>
          <li>Local Eastern Suburbs Shop in Ringwood Square</li>
        </ul>

        <LivePricingGrid 
          title="Popular Computer Repair Pricing"
          deviceType="computer"
          defaultItems={defaultComputerPricing}
        />

        <h2 style={{ marginBottom: '1rem', marginTop: '3rem' }}>Frequently Asked Questions</h2>
        {computerFAQs.map((faq, index) => (
          <div key={index} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{faq.question}</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>{faq.answer}</p>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link href="/book-repair" className="primary-btn">
            Book My Service
          </Link>
        </div>
      </div>
    </>
  );
}
