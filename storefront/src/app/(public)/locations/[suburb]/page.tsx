import React from 'react';
import { TARGET_SUBURBS } from '@/data/seo-data';
import { slugify } from '@/lib/inventoryUtils';
import Link from 'next/link';

interface LocationPageProps {
  params: {
    suburb: string;
  };
}

export function generateStaticParams() {
  return TARGET_SUBURBS.map((suburb) => ({
    suburb: slugify(suburb.name),
  }));
}

export default function LocationPage({ params }: LocationPageProps) {
  const suburbSlug = params.suburb;
  const suburbData = TARGET_SUBURBS.find(s => slugify(s.name) === suburbSlug) || { 
    name: decodeURIComponent(suburbSlug).replace(/-/g, ' '), 
    context: "Conveniently located near you." 
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-slate-900">
        Expert Phone & Device Repair near {suburbData.name}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        <section className="prose prose-slate max-w-none">
          <p className="text-xl text-slate-700 mb-6 font-medium">
            Looking for reliable, fast device repairs close to <strong>{suburbData.name}</strong>?
          </p>
          <p className="text-lg text-blue-800 bg-blue-50 p-4 rounded-xl border border-blue-100 font-semibold mb-6">
            📍 {suburbData.context}
          </p>
          
          <p className="text-slate-600 leading-relaxed mb-6">
            We service all major brands, including iPhone, Samsung, iPad, and MacBook.
            From shattered displays and fast-draining batteries to complex water damage recovery, 
            our certified technicians at Ali Mobile & Repair provide a "No FIX, No CHARGE" guarantee.
          </p>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8 mb-8">
            <h3 className="text-slate-900 font-bold mb-4 text-xl">Top Reasons Residents in {suburbData.name} Choose Us:</h3>
            <ul className="text-slate-700 space-y-3 list-none p-0 mt-0">
              <li className="flex items-center gap-3">
                <span className="text-blue-500 text-xl">✓</span>
                <strong>Easy Navigation:</strong> {suburbData.context}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-500 text-xl">✓</span>
                <strong>Lightning Fast:</strong> Most repairs completed in under an hour.
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-500 text-xl">✓</span>
                <strong>Peace of Mind:</strong> 6-Month warranty on all parts and labor.
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link 
              href="/book-repair"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Get Instant Quote
            </Link>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=Ali+Mobile+%26+Repair+Ringwood" 
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-bold hover:border-slate-300 hover:bg-slate-50 transition text-center"
            >
              Get Directions
            </a>
          </div>
        </section>
        
        <aside className="space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Our Core Services</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/repairs/iPhone" className="p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl border border-slate-100 font-semibold transition text-center flex flex-col items-center gap-2">
                <span className="text-2xl">📱</span>
                <span>iPhone Repair</span>
              </Link>
              <Link href="/repairs/MacBook" className="p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl border border-slate-100 font-semibold transition text-center flex flex-col items-center gap-2">
                <span className="text-2xl">💻</span>
                <span>MacBook Repair</span>
              </Link>
              <Link href="/repairs/iPad" className="p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl border border-slate-100 font-semibold transition text-center flex flex-col items-center gap-2">
                <span className="text-2xl">📟</span>
                <span>iPad Repair</span>
              </Link>
              <Link href="/repairs/Apple-Watch" className="p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl border border-slate-100 font-semibold transition text-center flex flex-col items-center gap-2">
                <span className="text-2xl">⌚</span>
                <span>Watch Repair</span>
              </Link>
            </div>
          </div>
          
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-3">Visit Our Store</h2>
            <p className="text-slate-300 mb-6 text-lg">Kiosk c1 Ringwood Square Shopping Centre, Ringwood 3134</p>
            <div className="flex flex-col gap-2 mb-6">
              <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Call for an instant quote</span>
              <a href="tel:0481058514" className="text-3xl font-bold text-white hover:text-blue-400 transition">📞 0481 058 514</a>
            </div>
            <p className="text-sm text-slate-400 bg-slate-800/50 p-4 rounded-lg inline-block border border-slate-700">
              Walk-ins warmly welcomed! We fix most issues on the spot.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
