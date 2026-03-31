import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Computer & MacBook Repair Melbourne | PC & Laptop Fix | Ali Mobile",
  description: "Expert computer and MacBook repair services in Melbourne. We fix screens, batteries, keyboards, and logic boards for All MacBook Pro, Air and laptops. Fast diagnosis.",
};

export default function ComputerRepairPage() {
  return (
    <>
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '80vh', maxWidth: '800px' }}>
        <link rel="canonical" href="https://www.alimobile.com.au/services/computer-repair" />
        
        <Script
          id="schema-computer-repair"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Computer Repair",
              "provider": {
                "@type": "LocalBusiness",
                "name": "Ali Mobile Repair"
              },
              "areaServed": {
                "@type": "City",
                "name": "Melbourne"
              },
              "description": "Expert MacBook and laptop repair services in Melbourne, including screen replacement, battery fixing, and logic board repair."
            })
          }}
        />

        <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Computer & MacBook Repair Services</h1>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2rem', opacity: 0.9 }}>
          Having trouble with your laptop or MacBook? At Ali Mobile Repair, we provide specialized hardware and software 
          solutions for all computer models. Whether it&apos;s a cracked MacBook screen, a failing battery, or complex 
          logic board issues, our technicians can get it fixed quickly.
        </p>

        <h2 style={{ marginBottom: '1rem' }}>Our Computer Services Include:</h2>
        <ul style={{ marginBottom: '2.5rem', paddingLeft: '1.2rem', lineHeight: '2' }}>
          <li><strong>MacBook Screen Replacement:</strong> We fix cracked or flickering displays for Retina and M1/M2/M3 models.</li>
          <li><strong>Battery Replacement:</strong> Is your laptop not holding a charge? We install premium replacement batteries.</li>
          <li><strong>Keyboard & Trackpad Fix:</strong> Sticky keys or unresponsive trackpads repaired efficiently.</li>
          <li><strong>Logic Board Repair:</strong> Micro-soldering and component-level repair for water damage or power issues.</li>
          <li><strong>Data Recovery:</strong> We help retrieve your important files from failing hard drives or SSDs.</li>
        </ul>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Get a Real-time Quote</h3>
          <p style={{ marginBottom: '1.5rem' }}>Check our live pricing from the POS system and book your repair online.</p>
          <Link href="/book-repair" className="primary-btn">Book Your Repair</Link>
        </div>
      </div>
    </>
  );
}
