import Link from 'next/link';
import { formatDynamicParam } from '@/lib/inventoryUtils';

interface BreadcrumbsProps {
  category: string;
  brand: string;
  model: string;
  service?: string;
}

export default function Breadcrumbs({ category, brand, model, service }: BreadcrumbsProps) {
  const fCategory = formatDynamicParam(category);
  const fBrand = formatDynamicParam(brand);
  const fModel = formatDynamicParam(model);
  const fService = service ? formatDynamicParam(service) : null;

  const breadcrumbItems = [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.alimobilerepair.com.au/" },
    { "@type": "ListItem", "position": 2, "name": "Repairs", "item": "https://www.alimobilerepair.com.au/repairs" },
    { "@type": "ListItem", "position": 3, "name": fCategory, "item": `https://www.alimobilerepair.com.au/repairs/${category}` },
    { "@type": "ListItem", "position": 4, "name": fBrand, "item": `https://www.alimobilerepair.com.au/repairs/${category}/${brand}` },
    { "@type": "ListItem", "position": 5, "name": fModel, "item": `https://www.alimobilerepair.com.au/repairs/${category}/${brand}/${model}` },
  ];

  if (fService && service) {
    breadcrumbItems.push({
      "@type": "ListItem", "position": 6, "name": fService,
      "item": `https://www.alimobilerepair.com.au/repairs/${category}/${brand}/${model}/${service}`
    });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };

  // Determine which item is the current page (last in the chain)
  const isModelPage = !fService;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <nav aria-label="breadcrumb" style={{ fontSize: '0.86rem', marginBottom: '2rem', opacity: 0.85, textAlign: 'center' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', margin: 0 }}>
          <li><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link></li>
          <li>&rsaquo;</li>
          <li><Link href="/repairs" style={{ color: 'inherit', textDecoration: 'none' }}>Repairs</Link></li>
          <li>&rsaquo;</li>
          <li><Link href={`/repairs/${category}`} style={{ color: 'inherit', textDecoration: 'none' }}>{fCategory}</Link></li>
          <li>&rsaquo;</li>
          <li><Link href={`/repairs/${category}/${brand}`} style={{ color: 'inherit', textDecoration: 'none' }}>{fBrand}</Link></li>
          <li>&rsaquo;</li>
          {isModelPage ? (
            <li aria-current="page"><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{fModel}</span></li>
          ) : (
            <>
              <li><Link href={`/repairs/${category}/${brand}/${model}`} style={{ color: 'inherit', textDecoration: 'none' }}>{fModel}</Link></li>
              <li>&rsaquo;</li>
              <li aria-current="page"><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{fService}</span></li>
            </>
          )}
        </ol>
      </nav>
    </>
  );
}
