import Link from 'next/link';

export default function PopularRepairsLinks() {
  const popularLinks = [
    { brand: 'apple', model: 'iphone-15-pro', service: 'screen-repair', label: 'iPhone 15 Pro Screen Repair' },
    { brand: 'apple', model: 'iphone-14', service: 'battery-replacement', label: 'iPhone 14 Battery Replacement' },
    { brand: 'apple', model: 'ipad-9th-generation', service: 'screen-repair', label: 'iPad 9th Gen Screen Repair' },
    { brand: 'samsung', model: 'galaxy-s24-ultra', service: 'screen-repair', label: 'Galaxy S24 Ultra Screen Repair' },
    { brand: 'google', model: 'pixel-8-pro', service: 'screen-repair', label: 'Pixel 8 Pro Screen Repair' },
  ];

  return (
    <div className="popular-repairs-links" style={{ padding: '2rem 0', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', opacity: 0.9 }}>Popular Repair Services</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: '800px', margin: '0 auto' }}>
        {popularLinks.map((link, idx) => (
          <Link 
            key={idx} 
            href={`/repairs/${link.brand}/${link.model}/${link.service}`}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '20px',
              color: 'var(--foreground)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
