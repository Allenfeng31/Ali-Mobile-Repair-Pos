import LiveQuoteCalculator from "@/components/LiveQuoteCalculator";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface BookingParams {
  params: {
    brand: string;
    model: string;
    service: string;
  };
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

export default function DynamicRepairPage({ params }: BookingParams) {
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
