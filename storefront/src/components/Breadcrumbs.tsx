import Link from 'next/link';

interface BreadcrumbsProps {
  brand: string;
  model: string;
  service: string;
}

function formatWord(word: string) {
  if (!word) return '';
  return word.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function Breadcrumbs({ brand, model, service }: BreadcrumbsProps) {
  const fBrand = formatWord(brand);
  const fModel = formatWord(model);
  const fService = formatWord(service);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.alimobilerepair.com.au/" },
      { "@type": "ListItem", "position": 2, "name": "Repairs", "item": "https://www.alimobilerepair.com.au/repairs" },
      { "@type": "ListItem", "position": 3, "name": fBrand, "item": `https://www.alimobilerepair.com.au/repairs/${brand}` },
      { "@type": "ListItem", "position": 4, "name": fModel, "item": `https://www.alimobilerepair.com.au/repairs/${brand}/${model}` },
      { "@type": "ListItem", "position": 5, "name": fService, "item": `https://www.alimobilerepair.com.au/repairs/${brand}/${model}/${service}` }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <nav aria-label="breadcrumb" style={{ fontSize: '0.86rem', marginBottom: '2rem', opacity: 0.85, textAlign: 'center' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', margin: 0 }}>
          <li><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link></li>
          <li>&rsaquo;</li>
          <li><Link href="/repairs" style={{ color: 'inherit', textDecoration: 'none' }}>Repairs</Link></li>
          <li>&rsaquo;</li>
          <li><span style={{ color: 'inherit' }}>{fBrand}</span></li>
          <li>&rsaquo;</li>
          <li><span style={{ color: 'inherit' }}>{fModel}</span></li>
          <li>&rsaquo;</li>
          <li aria-current="page"><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{fService}</span></li>
        </ol>
      </nav>
    </>
  );
}
