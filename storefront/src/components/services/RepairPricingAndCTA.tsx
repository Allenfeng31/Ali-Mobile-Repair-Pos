"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';
import { ShieldCheck, Info } from 'lucide-react';

interface RepairVariant {
  quality_grade: string;
  price: number;
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

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-2 mb-6">
      {displayVariants.length > 0 && displayVariants[0].price > 0 ? (
        <div className="w-full mb-8 text-left">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Pricing & Options</p>
          <div className="space-y-4">
            {displayVariants.map((variant) => (
              <div 
                key={variant.quality_grade}
                className="flex flex-col p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-on-surface">{variant.quality_grade}</span>
                  </div>
                  <span className="font-black text-2xl text-primary">${variant.price}</span>
                </div>
                {tierDescriptions[variant.quality_grade] && (
                  <p className="text-sm text-on-surface-variant/80 leading-relaxed">
                    {tierDescriptions[variant.quality_grade]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 mt-2 text-center w-full">
          <p className="text-3xl font-extrabold text-primary mb-2">
            Quote on Request
          </p>
          <p className="text-base font-medium text-on-surface opacity-80">
            Please fill out the form below or call{' '}
            <a href="tel:0481058514" className="text-primary font-bold hover:underline">
              0481 058 514
            </a>{' '}
            for an instant quote.
          </p>
        </div>
      )}

      <div className="cta-group w-full max-w-md">
        <Link 
          href={`/book-repair?brand=${encodeURIComponent(brandName)}&model=${encodeURIComponent(modelName)}&service=${encodeURIComponent(repairName)}`} 
          className="cta-book"
          onClick={() => {
            analytics.trackBookRepair(modelName, repairName);
          }}
        >
          Book Repair Now
        </Link>
        <a 
          href="tel:0481058514" 
          className="cta-call"
          onClick={() => analytics.trackCallNow(modelName, repairName)}
        >
          📞 Call 0481 058 514
        </a>
      </div>
    </div>
  );
}
