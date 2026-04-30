import Link from "next/link";
import { Metadata } from "next";
import { Smartphone, Tablet, Laptop, Watch } from 'lucide-react';
import ChatNowButton from "@/components/ChatNowButton";
import ServiceAreas from "@/components/seo/ServiceAreas";

export const revalidate = 3600; // ISR: revalidate every hour

export const metadata: Metadata = {
  title: "Professional Device Repair Services in Ringwood | Ali Mobile",
  description:
    "Choose your device category to find expert repair services in Ringwood. Phone, Tablet, Laptop, and Smart Watch repairs with same-day turnaround.",
};

export default function RepairsHubPage() {
  return (
    <main className="page-container">
      <header style={{ marginBottom: "3rem" }}>
        <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 800,
          textAlign: "center",
          marginBottom: "0.75rem",
          letterSpacing: "-0.5px",
        }}
      >
        Professional Device Repair Services in Ringwood
      </h1>
      <p
        style={{
          textAlign: "center",
          opacity: 0.7,
          fontSize: "1.05rem",
          maxWidth: "520px",
          margin: "0 auto 3rem",
        }}
      >
        We repair all major devices — select a category below to see available services and pricing.
        </p>
      </header>

      <section className="servicesGrid" aria-label="Repair Categories">
        <Link href="/repairs/phone" className="serviceCard">
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Smartphone size={48} strokeWidth={1.5} aria-hidden="true" color="var(--primary)" />
          </div>
          <h3>Phone Repair</h3>
          <p>Broken screen? Battery draining fast? We fix all brands including iPhone, Samsung, Oppo & Pixel.</p>
          <div style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            View Pricing →
          </div>
        </Link>
        <Link href="/repairs/tablet" className="serviceCard">
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Tablet size={48} strokeWidth={1.5} aria-hidden="true" color="var(--primary)" />
          </div>
          <h3>Tablet & iPad Repair</h3>
          <p>Fast, reliable repairs for all iPad and Samsung tablet models. Most fixed in under 1 hour.</p>
          <div style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            View Pricing →
          </div>
        </Link>
        <Link href="/repairs/laptop" className="serviceCard">
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Laptop size={48} strokeWidth={1.5} aria-hidden="true" color="var(--primary)" />
          </div>
          <h3>Laptop & MacBook Repair</h3>
          <p>Screen, battery, and logic board repairs for all MacBook and laptop models.</p>
          <div style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            View Pricing →
          </div>
        </Link>
        <Link href="/repairs/watch" className="serviceCard">
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Watch size={48} strokeWidth={1.5} aria-hidden="true" color="var(--primary)" />
          </div>
          <h3>Smart Watch Repair</h3>
          <p>Apple Watch screen and battery repairs. Professional service for all series.</p>
          <div style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            View Pricing →
          </div>
        </Link>
      </section>

      <ServiceAreas />

      <div
        style={{
          marginTop: "4rem",
          background: "var(--secondary)",
          borderRadius: "20px",
          padding: "2.5rem",
          border: "1px solid var(--layer-border)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          Not sure which model you have?
        </h2>
        <p style={{ opacity: 0.7, marginBottom: "1.5rem", fontSize: "1rem" }}>
          Use our Live Quote tool or call us — we&apos;ll identify your device and give you an instant price.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", alignItems: 'center' }}>
          <Link href="/book-repair" className="primary-btn">
            Get a Live Quote
          </Link>
          <a href="tel:0481058514" className="secondary-btn">
            📞 Call 0481 058 514
          </a>
          <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>or</span>
          <ChatNowButton 
            className="primary-btn" 
            style={{ background: 'var(--foreground)', color: 'var(--background)' }}
          />
        </div>
      </div>
    </main>
  );
}
