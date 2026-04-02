import React from 'react';

export default function AboutUsPage() {
  return (
    <div style={{ background: 'var(--background)', color: 'var(--foreground)', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      {/* Dynamic Hero Section */}
      <section style={{ 
        padding: '120px 20px 60px', 
        textAlign: 'center', 
        background: 'radial-gradient(circle at center, var(--primary-glow) 0%, transparent 70%)' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            The Story of <span style={{ color: 'var(--primary)' }}>Ali Mobile Repair</span>
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, fontWeight: 500 }}>
            Ringwood's Trusted Local Repair Experts for Over a Decade.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '40px 20px 100px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '60px', alignItems: 'center' }} className="responsive-about">
          
          {/* Visual Side */}
          <div style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '-20px', 
              left: '-20px', 
              width: '100%', 
              height: '100%', 
              border: '2px solid var(--primary)', 
              borderRadius: '30px', 
              zIndex: 0 
            }} />
            <img 
              src="/images/about-us.jpg" 
              alt="Ali Mobile & Repair Store Front" 
              style={{ 
                width: '100%', 
                borderRadius: '30px', 
                boxShadow: '0 30px 60px rgba(0,0,0,0.3)', 
                position: 'relative', 
                zIndex: 1,
                border: '1px solid var(--layer-border)',
                transition: 'transform 0.5s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>

          {/* Text Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ fontSize: '1.1rem', lineHeight: '1.9', color: 'var(--foreground)', opacity: 0.9 }}>
              <p style={{ marginBottom: '24px' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Ali Mobile Repair</strong> is a premier destination for expert electronic repairs in the heart of Ringwood. With more than ten years of specialized experience in the industry, our journey began with a simple mission: to provide high-quality, reliable, and affordable repair solutions for the local community. Over the years, we have grown into a trusted local business that residents and visitors alike count on for their device health.
              </p>
              <p style={{ marginBottom: '24px' }}>
                Our expertise spans a wide range of devices, including the latest smartphones, tablets, and laptops. Whether it's a cracked iPhone screen, a battery that won't hold a charge, or complex water damage on a MacBook, our skilled technicians handle every repair with precision and care. We understand how essential these devices are to your daily life—whether for work, study, or staying connected with loved ones—which is why we prioritize efficiency without ever compromising on quality.
              </p>
              <p style={{ marginBottom: '24px' }}>
                What sets us apart is our deep commitment to the Ringwood community. Being a local business for many years has allowed us to build lasting relationships with our customers. We aren't just a repair shop; we are part of the neighborhood. Our <strong style={{ color: 'var(--primary)' }}>'No Fix, No Charge'</strong> policy ensures that you only pay for results, providing you with ultimate peace of mind.
              </p>
              <p>
                We take pride in offering the most competitive pricing in the area, often beating larger retail chains while providing a far more personalized and attentive service. From the moment you walk into our shop at Ringwood Square Shopping Centre, you will experience a professional and friendly service that puts your needs first. Your satisfaction is our greatest reward.
              </p>
            </div>
            
            {/* Core Values / Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }} className="mobile-values">
              {[
                { title: '10+', sub: 'Years Experience', icon: '🏆' },
                { title: 'Local', sub: 'Ringwood Based', icon: '📍' },
                { title: 'Best', sub: 'Local Pricing', icon: '💰' }
              ].map((val, idx) => (
                <div key={idx} style={{ 
                  background: 'var(--layer)', 
                  padding: '20px 15px', 
                  borderRadius: '20px', 
                  textAlign: 'center', 
                  border: '1px solid var(--layer-border)' 
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{val.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>{val.title}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 600, textTransform: 'uppercase' }}>{val.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ paddingBottom: '100px', textAlign: 'center' }}>
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto', 
          padding: '60px 40px', 
          background: 'linear-gradient(135deg, #007aff, #00c6ff)', 
          borderRadius: '40px', 
          color: 'white',
          boxShadow: '0 20px 40px rgba(0,122,255,0.3)',
          margin: '0 20px 0'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Need an Assessment?</h2>
          <p style={{ opacity: 0.9, fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Don't let a broken device slow you down. Visit us today for a free quote.
          </p>
          <a href="/book-repair" style={{ 
            display: 'inline-block', 
            padding: '1.2rem 3rem', 
            background: 'white', 
            color: '#007aff', 
            borderRadius: '50px', 
            fontWeight: 700, 
            fontSize: '1.1rem',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            Book a Repair Now
          </a>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 968px) {
          .responsive-about {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .mobile-values {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
        }
        @media (max-width: 500px) {
          .mobile-values {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
