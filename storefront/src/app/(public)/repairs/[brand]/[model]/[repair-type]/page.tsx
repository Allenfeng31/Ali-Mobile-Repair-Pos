import React from 'react';
import { BRANDS, MODELS, REPAIR_TYPES, LSI_KEYWORDS } from '@/data/seo-data';
import { slugify, detectDeviceType } from '@/lib/inventoryUtils';
import { RepairServiceSchema } from '@/components/seo/SchemaOrg';
import Link from 'next/link';

interface RepairPageProps {
  params: {
    brand: string;
    model: string;
    'repair-type': string;
  };
}

export function generateStaticParams() {
  const params: { brand: string; model: string; 'repair-type': string }[] = [];

  for (const brand of BRANDS) {
    const models = MODELS[brand] || [];
    for (const model of models) {
      for (const repair of REPAIR_TYPES) {
        params.push({
          brand: slugify(brand),
          model: slugify(model),
          'repair-type': repair.slug,
        });
      }
    }
  }

  return params;
}

function getLSICategoryForRepair(slug: string): { component?: string[], issue?: string[] } {
  if (slug === 'screen-replacement') return { component: LSI_KEYWORDS.components.screen, issue: LSI_KEYWORDS.issues.screenDamage };
  if (slug === 'battery-replacement') return { component: LSI_KEYWORDS.components.battery, issue: LSI_KEYWORDS.issues.batteryDrain };
  if (slug === 'charging-port-repair') return { component: LSI_KEYWORDS.components.chargingPort };
  if (slug === 'water-damage-repair') return { issue: LSI_KEYWORDS.issues.waterDamage };
  return {};
}

const generateLsiContent = (model: string, repairType: { name: string, slug: string }, deviceType: "phone" | "tablet" | "computer" | "watch") => {
  const lsi = getLSICategoryForRepair(repairType.slug);
  const deviceWords = LSI_KEYWORDS.devices[deviceType as keyof typeof LSI_KEYWORDS.devices] || ["device", "unit"];
  const actionWords = LSI_KEYWORDS.actions.repair;

  // Select some random-ish or sequential LSI words based on string length to guarantee stability during static gen
  const c1 = lsi.component?.[0] || repairType.name.toLowerCase();
  const c2 = lsi.component?.[1] || "damaged part";
  const i1 = lsi.issue?.[0] || `broken ${c1}`;
  const d1 = deviceWords[0] || "device";
  const d2 = deviceWords[1] || "unit";
  const a1 = actionWords[0];
  const a2 = actionWords[1];

  return (
    <div className="prose prose-slate max-w-none text-lg text-slate-700 leading-relaxed space-y-6">
      <p>
        Are you dealing with a <strong>{i1}</strong> on your {model}? You need a reliable and professional <strong>{model} {repairType.name}</strong>. 
        Our certified technicians in Ringwood specialize in high-quality {c1} {a1}s and complete {d1} {a2} services. 
      </p>
      <p>
        We know how frustrating it is when your essential {d2} isn't working perfectly. Whether you're facing issues with the {c2} or 
        need a complete {repairType.name.toLowerCase()}, we use premium quality parts to restore your tool to factory condition.
      </p>
      <p>
        At Ali Mobile & Repair, we stand by our <strong>"No FIX, No CHARGE"</strong> policy. You get a risk-free comprehensive {LSI_KEYWORDS.actions.evaluate[0]}, 
        and all our {repairType.name.toLowerCase()}s come with a solid 6-month warranty. Most {a1}s are completed in under an hour right 
        here at Ringwood Square Shopping Centre!
      </p>
    </div>
  );
};

export default function RepairServicePage({ params }: RepairPageProps) {
  const repairTypeSlug = params['repair-type'];
  const repairType = REPAIR_TYPES.find(r => r.slug === repairTypeSlug);
  
  // Reverse lookup for Model and Brand to display readable names
  let displayBrand = "Device";
  let displayModel = decodeURIComponent(params.model).replace(/-/g, ' '); 

  for (const b of BRANDS) {
    if (slugify(b) === params.brand) displayBrand = b;
    const m = MODELS[b]?.find(x => slugify(x) === params.model);
    if (m) displayModel = m;
  }

  const detectedType = detectDeviceType(displayBrand) || "phone";

  if (!repairType) return <div className="p-20 text-center text-2xl font-bold">Service Not Found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <RepairServiceSchema 
        serviceName={`${displayModel} ${repairType.name} Repair in Ringwood`} 
        description={`Professional ${repairType.name} service for your ${displayModel} in Ringwood. Expert technicians, fast turnaround, 6-month warranty.`} 
      />
      <h1 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">
        {displayModel} {repairType.name} in Ringwood
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        <section>
          {generateLsiContent(displayModel, repairType, detectedType)}
          
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-blue-900 mb-3">Why wait? Fix it today!</h3>
            <p className="text-blue-800 mb-0">Our expert technicians have repaired thousands of {displayBrand} devices. We likely have the exact parts for your {displayModel} in stock.</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link 
              href="/book-repair"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Get Instant Quote
            </Link>
            <a 
              href="tel:0481058514" 
              className="border-2 border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-bold hover:border-slate-300 hover:bg-slate-50 transition text-center"
            >
              Call 0481 058 514
            </a>
          </div>
        </section>
        
        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900 relative z-10">Our Guarantees</h2>
            <ul className="space-y-4 relative z-10 text-slate-700 font-medium list-none p-0">
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">⚡</span>
                Under 1 Hour Repair
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">🛡️</span>
                6-Month Warranty
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">💯</span>
                No FIX, No CHARGE
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">📍</span>
                Convenient Ringwood Square Location
              </li>
            </ul>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-3">Not the {displayModel}?</h3>
             <p className="text-slate-600 text-sm mb-4">Check out other {displayBrand} models we repair, or contact us if you can't find your device.</p>
             <Link href={`/repairs/${slugify(displayBrand)}`} className="text-blue-600 font-semibold hover:underline">
               Browse all {displayBrand} repairs →
             </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
