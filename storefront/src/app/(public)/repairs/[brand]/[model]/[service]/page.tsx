import LiveQuoteCalculator from "@/components/LiveQuoteCalculator";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RawItem, ParsedItem, parseItem, slugify } from "@/lib/inventoryUtils";

interface BookingParams {
  params: {
    brand: string;
    model: string;
    service: string;
  };
}

export async function generateStaticParams() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_POS_API_URL || "http://localhost:3001";
    // We fetch without store cache during build so we get the fresh list
    const res = await fetch(`${backendUrl}/api/inventory`);
    if (!res.ok) return [];
    
    const raw: RawItem[] = await res.json();
    const parsed = raw.map(parseItem).filter(Boolean) as ParsedItem[];
    
    const paths: { brand: string; model: string; service: string }[] = [];
    
    parsed.forEach(item => {
      paths.push({
        brand: slugify(item.brand),
        model: slugify(item.deviceModel),
        service: slugify(item.service),
      });
    });
    
    // Deduplicate
    const uniquePaths = Array.from(new Set(paths.map(p => JSON.stringify(p)))).map(p => JSON.parse(p));
    
    return uniquePaths;
  } catch (error) {
    console.error("Failed to generate static params for repairs:", error);
    return [];
  }
}

function formatSlug(slug: string) {
  if (!slug) return '';
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: BookingParams): Promise<Metadata> {
  const brand = formatSlug(params.brand);
  const model = formatSlug(params.model);
  const service = formatSlug(params.service);

  return {
    title: `${brand} ${model} ${service} in Melbourne | Ali Mobile & Repair`,
    description: `Need a ${service} for your ${brand} ${model}? Get it repaired quickly in Melbourne at Ali Mobile & Repair. Live pricing available, drop by today.`,
    alternates: {
      canonical: `https://www.alimobilerepair.com.au/repairs/${params.brand}/${params.model}/${params.service}`
    }
  };
}

export default async function DynamicRepairPage({ params }: BookingParams) {
  // Validate if the params actually correspond to a valid POS item
  try {
    const backendUrl = process.env.NEXT_PUBLIC_POS_API_URL || "http://localhost:3001";
    // Using a short ISR revalidation cache so incoming API hits don't overwhelm POS DB
    const res = await fetch(`${backendUrl}/api/inventory`, { next: { revalidate: 3600 } });
    
    if (res.ok) {
      const raw: RawItem[] = await res.json();
      const parsed = raw.map(parseItem).filter(Boolean) as ParsedItem[];
      
      const isValid = parsed.some(item => 
        slugify(item.brand) === params.brand &&
        slugify(item.deviceModel) === params.model &&
        slugify(item.service) === params.service
      );
      
      if (!isValid) {
        notFound(); // Returns 404 if someone tries to visit /repairs/fake/device/route
      }
    }
  } catch (e) {
    // If backend is down, we choose to render the component anyway to avoid false 404s
    console.error("Failed to validate repair route params:", e);
  }

  const brand = formatSlug(params.brand);
  const model = formatSlug(params.model);
  const service = formatSlug(params.service);

  return (
    <div className="page-container">
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {brand} {model} {service}
      </h1>
      <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.8 }}>
        Check out our live pricing below for the {brand} {model}. 
        Walk-ins are always welcome at our Melbourne store, or you can proceed to book an appointment!
      </p>

      {/* Reusable Component configured with SEO defaults */}
      <LiveQuoteCalculator 
        initialBrand={params.brand} 
        initialModel={params.model} 
        initialService={params.service} 
      />

      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <a 
          href="/book-repair" 
          className="primary-btn" 
          style={{ padding: '0.9rem 2.5rem', textDecoration: 'none', display: 'inline-block' }}
        >
          Book An Appointment
        </a>
      </div>
    </div>
  );
}
