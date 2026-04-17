import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { LocalBusinessSchema, FAQSchema, RepairServiceSchema } from '@/components/seo/SchemaOrg';
import LivePricingGrid from '@/components/services/LivePricingGrid';
import Link from 'next/link';
import { BRANDS, DEVICE_TYPES, SERVICE_TYPES, LOCATIONS } from '@/config/services';

interface PageProps {
  params: Promise<{
    brand: string;
    slug: string;
  }>;
}

// Map slug to meaningful data or fetch from backend
async function getPageData(brandSlug: string, fullSlug: string) {
  // Logic to parse the slug (e.g., "iphone-screen-replacement-ringwood")
  // For now, we'll mock or derive from the slug
  const brand = BRANDS.find(b => b.slug === brandSlug);
  if (!brand) return null;

  // Extract parts from slug
  // Example: iphone-screen-replacement-ringwood
  const parts = fullSlug.split('-');
  const locationSlug = parts[parts.length - 1];
  const location = LOCATIONS.find(l => l.slug === locationSlug) || LOCATIONS[0];
  
  // Basic heuristics for demo/SSG
  const deviceName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const serviceName = parts.slice(1, parts.length - 1).join(' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    brand: brand.name,
    device: deviceName,
    service: serviceName,
    location: location.name,
    address: location.description,
    fullTitle: `${brand.name} ${deviceName} ${serviceName} in ${location.name}`,
    description: `Professional ${brand.name} ${deviceName} ${serviceName} in ${location.name}. Same-day fix, 6-month warranty, and No Fix No Charge policy at Ali Mobile & Repair.`,
  };
}

export async function generateStaticParams() {
  const params: { brand: string; slug: string }[] = [];

  // Generate a few high-conversion combinations for SSG
  BRANDS.forEach(brand => {
    DEVICE_TYPES.filter(d => d.brand === brand.id).forEach(device => {
      SERVICE_TYPES.forEach(service => {
        LOCATIONS.forEach(location => {
          params.push({
            brand: brand.slug,
            slug: `${device.slug}-${service.slug}-${location.slug}`,
          });
        });
      });
    });
  });

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand, slug } = await params;
  const data = await getPageData(brand, slug);
  
  if (!data) return {};

  return constructMetadata({
    title: data.fullTitle,
    description: data.description,
    location: data.location,
  });
}

export default async function ServiceLandingPage({ params }: PageProps) {
  const { brand, slug } = await params;
  const data = await getPageData(brand, slug);

  if (!data) notFound();

  const faqs = [
    {
      question: `How long does a ${data.brand} ${data.device} ${data.service} take?`,
      answer: `Most ${data.service} services are completed within 30-60 minutes. We offer same-day repair for all major issues in our ${data.location} store.`
    },
    {
      question: "Do you offer a warranty on repairs?",
      answer: "Yes, we provide a 6-month (180-day) comprehensive warranty on all parts and labor for your peace of mind."
    },
    {
      question: "What if you can't fix my device?",
      answer: "We follow a strict 'No Fix, No Charge' policy. If we are unable to repair your device, you don't pay anything."
    }
  ];

  return (
    <>
      <LocalBusinessSchema />
      <RepairServiceSchema 
        serviceName={data.fullTitle} 
        description={data.description} 
      />
      <FAQSchema faqs={faqs} />
      
      <div className="page-container">
        <nav style={{ marginBottom: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
          <Link href="/">Home</Link> {" > "} 
          <Link href="/services">Services</Link> {" > "}
          <span>{data.brand} {data.device}</span>
        </nav>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
          {data.fullTitle}
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem' }}>
          <div>
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>
              Looking for reliable <strong>{data.brand} {data.device} {data.service}</strong> in {data.location}? 
              Ali Mobile & Repair is conveniently located at <strong>{data.address}</strong>. 
              We specialize in fast, professional repairs with genuine-quality parts.
            </p>
            
            <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Our Repair Guarantee</h2>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                <li><strong>Same-Day Service:</strong> Most repairs in under 1 hour.</li>
                <li><strong>6-Month Warranty:</strong> Guaranteed peace of mind.</li>
                <li><strong>No Fix, No Charge:</strong> You only pay for results.</li>
                <li><strong>Free Diagnosis:</strong> Honest advice and transparent pricing.</li>
              </ul>
            </div>

            <p style={{ lineHeight: '1.8' }}>
              Whether you are in {data.location} or surrounding suburbs like Mitcham or Croydon, our expert technicians
              are ready to help you get your {data.device} back in perfect working condition.
            </p>
          </div>

          <aside>
            <div style={{ position: 'sticky', top: '2rem' }}>
              <Link href="/book-repair" className="primary-btn" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem' }}>
                Book Now
              </Link>
              <div style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
                <p>Open Mon-Sat: 9am - 6pm</p>
                <p>Call: 0481 058 514</p>
              </div>
            </div>
          </aside>
        </div>

        <section style={{ marginTop: '4rem' }}>
          <LivePricingGrid 
            title="Live Repair Pricing"
            deviceType={data.device.toLowerCase().includes('iphone') ? 'phone' : 'tablet'}
            defaultItems={[]} // Let it fetch based on context
          />
        </section>

        <section style={{ marginTop: '4rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{faq.question}</h3>
                <p style={{ opacity: 0.8, lineHeight: '1.6' }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
