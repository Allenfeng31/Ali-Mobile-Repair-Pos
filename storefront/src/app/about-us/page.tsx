import React from 'react';

export default function AboutUsPage() {
  return (
    <div style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Inter", sans-serif', color: 'var(--foreground)' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '10px' }}>About Us</h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--primary)', margin: '0 auto', borderRadius: '2px' }} />
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '40px', alignItems: 'start' }} className="about-content">
        <div style={{ position: 'sticky', top: '100px' }}>
          <img 
            src="/images/about-us.jpg" 
            alt="Ali Mobile Repair Store Front" 
            style={{ 
              width: '100%', 
              borderRadius: '24px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '1px solid var(--layer-border)'
            }} 
          />
          <div style={{ marginTop: '20px', padding: '20px', background: 'var(--layer)', borderRadius: '20px', border: '1px solid var(--layer-border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--primary)' }}>Quick Highlights</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', lineHeight: '2' }}>
              <li>✅ 10+ Years Professional Experience</li>
              <li>✅ Local Ringwood Business</li>
              <li>✅ Most Affordable Pricing</li>
              <li>✅ Expert Mobile & Tablet Repair</li>
              <li>✅ Quality Laptop Servicing</li>
              <li>✅ Customer-Approved Excellence</li>
            </ul>
          </div>
        </div>

        <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
          <p style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600, color: 'var(--primary)' }}>
            Serving the Ringwood community with heart and expertise for over a decade.
          </p>
          <p style={{ marginBottom: '20px' }}>
            Ali Mobile Repair is a premier destination for expert electronic repairs in the heart of Ringwood. With more than ten years of specialized experience in the industry, our journey began with a simple mission: to provide high-quality, reliable, and affordable repair solutions for the local community. Over the years, we have grown into a trusted local business that residents and visitors alike count on for their device health.
          </p>
          <p style={{ marginBottom: '20px' }}>
            Our expertise spans a wide range of devices, including the latest smartphones, tablets, and laptops. Whether it's a cracked iPhone screen, a battery that won't hold a charge, or complex water damage on a MacBook, our skilled technicians handle every repair with precision and care. We understand how essential these devices are to your daily life—whether for work, study, or staying connected with loved ones—which is why we prioritize efficiency without ever compromising on quality.
          </p>
          <p style={{ marginBottom: '20px' }}>
            What sets us apart is our deep commitment to the Ringwood community. Being a local business for many years has allowed us to build lasting relationships with our customers. We aren't just a repair shop; we are part of the neighborhood. Our 'No Fix, No Charge' policy ensures that you only pay for results, providing you with ultimate peace of mind. We take pride in offering the most competitive pricing in the area, often beating larger retail chains while providing a far more personalized and attentive service.
          </p>
          <p style={{ marginBottom: '20px' }}>
            Our dedication to excellence has been recognized by many loyal customers who have shared their positive experiences, as seen in our glowing reviews. From the moment you walk into our shop at Ringwood Square Shopping Centre, you will experience a professional and friendly service that puts your needs first. We invite you to visit us and experience firsthand why Ali Mobile Repair is Ringwood's top choice for all electronic device repairs. Your satisfaction is our greatest reward.
          </p>

          <div style={{ marginTop: '40px', padding: '30px', background: 'var(--primary)', color: 'white', borderRadius: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>Need a Repair?</h2>
            <p style={{ marginBottom: '20px', opacity: 0.9 }}>Stop by our Ringwood Square location today or book online!</p>
            <a 
              href="/book-repair" 
              style={{ padding: '12px 30px', background: 'white', color: 'var(--primary)', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}
            >
              Book Your Repair Now
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          .about-content {
            grid-template-columns: 1fr !important;
          }
          header h1 {
            font-size: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
