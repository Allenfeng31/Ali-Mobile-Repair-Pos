import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Our Repair Services | Ali Mobile & Repair Ringwood',
  description: 'Expert repair services for phones, tablets, computers, and smart watches in Melbourne. Quick turnarounds, genuine parts, and 180-day warranty.',
};

export default function ServicesHubPage() {
  return (
    <div className="page-container">
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>
        Our Repair Services
      </h1>
      <p style={{ fontSize: '1.2rem', textAlign: 'center', opacity: 0.8, marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
        Professional repairs for all your essential devices. Select a category below to view detailed pricing and information.
      </p>

      <div className="servicesGrid">
        <Link href="/services/phone-repair" className="serviceCard">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
          <h3>Phone Repair</h3>
          <p>
            Screen replacements, battery fixes, and water damage repair for iPhone, Samsung, Google Pixel, and Oppo.
          </p>
          <div style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            View Pricing →
          </div>
        </Link>
        <Link href="/services/tablet-repair" className="serviceCard">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📟</div>
          <h3>Tablet & iPad Repair</h3>
          <p>
            Professional glass, LCD, and battery replacements for all iPad generations and Samsung Tab models.
          </p>
          <div style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            View Pricing →
          </div>
        </Link>
        <Link href="/services/computer-repair" className="serviceCard">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💻</div>
          <h3>Computer & MacBook</h3>
          <p>
            Expert logic board repairs, screen replacements, and OS recovery for MacBooks and Windows laptops.
          </p>
          <div style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            View Pricing →
          </div>
        </Link>
        <Link href="/services/smart-watch-repair" className="serviceCard">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⌚</div>
          <h3>Smart Watch Repair</h3>
          <p>
            Apple Watch screen and battery replacements, precision sealed with premium adhesives and tools.
          </p>
          <div style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            View Pricing →
          </div>
        </Link>
      </div>

      <div style={{ marginTop: '5rem', background: 'var(--secondary)', borderRadius: '20px', padding: '3rem', border: '1px solid var(--layer-border)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Looking for a quick quote?</h2>
        <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '1.1rem' }}>
          Use our Live Repair Quote tool to get an instant, live price straight from our workshop database.
        </p>
        <Link href="/book-repair" className="primary-btn" style={{ display: 'inline-block' }}>
          Get a Live Quote
        </Link>
      </div>
    </div>
  );
}
