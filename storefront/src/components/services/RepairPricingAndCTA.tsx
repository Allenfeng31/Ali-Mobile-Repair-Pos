"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';
import { ThumbsUp } from 'lucide-react';

interface RepairVariant {
  quality_grade: string;
  price: number;
  is_recommended?: boolean;
}

interface RepairPricingAndCTAProps {
  brandName: string;
  modelName: string;
  repairName: string;
  variants?: RepairVariant[];
}

export default function RepairPricingAndCTA({ 
  brandName,
  modelName, 
  repairName,
  variants = []
}: RepairPricingAndCTAProps) {
  const [tierDescriptions, setTierDescriptions] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTierDescriptions = async () => {
      try {
        const res = await fetch('/api/proxy/quality-tiers');
        if (res.ok) {
          const tiers = await res.json();
          const map: Record<string, string> = {};
          tiers.forEach((t: any) => { map[t.name] = t.description; });
          setTierDescriptions(map);
        }
      } catch (err) {
        console.error('Failed to load quality tiers', err);
      }
    };
    fetchTierDescriptions();
  }, []);

  const displayVariants = variants.length > 0 ? variants : [];
  const isMultiple = displayVariants.length > 1;

  return (
    <div className="w-full flex flex-col items-center mt-8">
      {displayVariants.length > 0 && displayVariants[0].price > 0 ? (
        <div className={`grid gap-6 w-full max-w-4xl justify-center ${isMultiple ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
          {displayVariants.map((variant) => {
            const isPremium = variant.quality_grade === 'Premium' || variant.quality_grade === 'Genuine';
            
            return (
              <div 
                key={variant.quality_grade}
                className={`
                  relative flex flex-col p-8 rounded-2xl border transition-all duration-200
                  ${variant.is_recommended 
                    ? 'bg-blue-50/30 border-blue-300 shadow-md ring-1 ring-blue-300' 
                    : isPremium 
                      ? 'bg-blue-50/50 border-blue-200 shadow-sm hover:shadow-md' 
                      : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}
                `}
              >
                {/* Recommended Badge */}
                {variant.is_recommended && (
                  <div className="flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-bl-lg rounded-tr-xl shadow-md absolute top-0 right-0 bg-blue-600 text-white z-10">
                    <ThumbsUp size={14} />
                    RECOMMENDED
                  </div>
                )}

                {/* Tier Name */}
                <div className="mb-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {variant.quality_grade}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-baseline mb-4">
                  <span className="text-2xl font-extrabold text-blue-600">
                    ${variant.price}
                  </span>
                </div>

                {/* Description */}
                {tierDescriptions[variant.quality_grade] && (
                  <p className="text-sm text-slate-500 leading-relaxed mt-2 flex-grow">
                    {tierDescriptions[variant.quality_grade]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mb-12 mt-4 text-center max-w-md mx-auto p-10 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-sm">
          <p className="text-2xl font-extrabold text-blue-600 mb-4">
            Quote on Request
          </p>
          <p className="text-base text-slate-500 leading-relaxed">
            Please fill out the form below or call{' '}
            <a href="tel:0481058514" className="text-blue-600 font-bold hover:underline">
              0481 058 514
            </a>{' '}
            for an instant quote.
          </p>
        </div>
      )}

      {/* Global CTA Group - Strictly below the grid in document flow */}
      <div className="w-full flex flex-col items-center justify-center mt-12 mb-8 gap-4">
        <Link 
          href={`/book-repair?brand=${encodeURIComponent(brandName)}&model=${encodeURIComponent(modelName)}&service=${encodeURIComponent(repairName)}`} 
          className="w-full max-w-xs text-lg md:text-xl font-bold py-4 md:py-5 px-8 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          onClick={() => {
            analytics.trackBookRepair(modelName, repairName);
          }}
        >
          Book Repair Now
        </Link>
        <a 
          href="tel:0481058514" 
          className="w-full max-w-xs text-lg md:text-xl font-bold py-4 md:py-5 px-8 text-center bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          onClick={() => analytics.trackCallNow(modelName, repairName)}
        >
          📞 Call 0481 058 514
        </a>
      </div>
    </div>
  );
}
