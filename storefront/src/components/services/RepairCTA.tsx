"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';
import { Check } from 'lucide-react';

interface RepairVariant {
  quality_grade: string;
  price: number;
}

interface RepairCTAProps {
  modelSlug: string;
  repairSlug: string;
  modelName: string;
  repairName: string;
  variants?: RepairVariant[];
}

// Dynamic tier descriptions fetched from backend
// previously TIER_DESCRIPTIONS

export default function RepairCTA({ 
  modelSlug, 
  repairSlug, 
  modelName, 
  repairName,
  variants = []
}: RepairCTAProps) {
  // If there's only 1 variant or if none exist, we don't strictly "require" a selection to proceed,
  // but if there are multiple, the user must select one.
  const [selectedVariant, setSelectedVariant] = useState<string | null>(variants.length === 1 ? variants[0].quality_grade : null);
  const [tierDescriptions, setTierDescriptions] = useState<Record<string, string>>({});

  React.useEffect(() => {
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
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-6">
      {displayVariants.length > 0 && displayVariants[0].price > 0 && (
        <div className="w-full mb-6 text-left">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Select Quality Tier</p>
          <div className="space-y-3">
            {displayVariants.map((variant) => (
              <label 
                key={variant.quality_grade}
                className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedVariant === variant.quality_grade 
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                    : 'border-outline-variant/20 hover:border-primary/40 bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedVariant === variant.quality_grade ? 'border-primary bg-primary' : 'border-outline-variant/50'
                  }`}>
                    {selectedVariant === variant.quality_grade && <Check size={12} strokeWidth={3} className="text-on-primary" />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-on-surface">{variant.quality_grade}</span>
                    <span 
                      title={tierDescriptions[variant.quality_grade] || 'Information about this tier'}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium opacity-70 cursor-help"
                    >
                      ?
                    </span>
                  </div>
                </div>
                <span className="font-black text-lg text-primary">${variant.price}</span>
                <input 
                  type="radio" 

                  name="quality_grade" 
                  value={variant.quality_grade}
                  checked={selectedVariant === variant.quality_grade}
                  onChange={() => setSelectedVariant(variant.quality_grade)}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="cta-group w-full">
        <Link 
          href={`/book-repair?model=${modelSlug}&repair=${repairSlug}${selectedVariant ? `&tier=${selectedVariant}` : ''}`} 
          className={`cta-book ${(!selectedVariant && displayVariants.length > 1) ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={(e) => {
            if (!selectedVariant && displayVariants.length > 1) {
              e.preventDefault();
              return;
            }
            analytics.trackBookRepair(modelName, repairName);
          }}
        >
          {(!selectedVariant && displayVariants.length > 1) ? 'Select a Tier' : 'Book Repair Now'}
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

