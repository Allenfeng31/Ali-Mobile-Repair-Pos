"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { analytics } from '@/lib/analytics';
import { ClipboardCheck, PhoneCall, ThumbsUp } from 'lucide-react';
import { getStartingPrice } from '@/lib/repairStartingPrices';

interface RepairVariant {
  quality_grade: string;
  price: number;
  is_recommended?: boolean;
}

interface RepairPricingAndCTAProps {
  brandName: string;
  modelName: string;
  repairName: string;
  bookingRepairName?: string;
  showBackHousingNotice?: boolean;
  variants?: RepairVariant[];
}

const TIER_DESCRIPTION_OVERRIDES: Record<string, Record<string, string>> = {
  "screen replacement": {
    "Budget": "High-quality aftermarket part. Best for quick, cost-effective fixes.",
    "Standard": "Industry-standard replacement part with reliable performance.",
    "Premium": "Top-tier aftermarket display selected for strong colour, touch response and daily reliability.",
    "Genuine": "Original equipment display where available, selected for the closest match to factory display performance."
  },
  "battery replacement": {
    "Budget": "Cost-effective replacement battery for basic daily use.",
    "Standard": "Reliable replacement battery selected for stable charging and everyday performance.",
    "Premium": "High-quality replacement battery selected for stronger daily reliability and longer service life.",
    "Genuine": "Original equipment battery where available, selected for the closest match to factory performance."
  },
  "charging port replacement": {
    "Budget": "Cost-effective charging port repair option for basic charging function.",
    "Standard": "Reliable charging port part selected for stable charging and cable connection.",
    "Premium": "High-quality charging port assembly selected for stronger fit, connection stability and daily durability.",
    "Genuine": "Original equipment charging component where available."
  },
  "back housing replacement": {
    "Budget": "Cost-effective rear glass or housing repair option for basic cosmetic restoration.",
    "Standard": "Reliable rear glass or housing replacement selected for fit and everyday use.",
    "Premium": "High-quality rear glass or housing assembly selected for better fit, finish and durability.",
    "Genuine": "Original equipment rear housing assembly where available."
  },
  "back glass / back housing replacement": {
    "Budget": "Cost-effective rear glass or housing repair option for basic cosmetic restoration.",
    "Standard": "Reliable rear glass or housing replacement selected for fit and everyday use.",
    "Premium": "High-quality rear glass or housing assembly selected for better fit, finish and durability.",
    "Genuine": "Original equipment rear housing assembly where available."
  },
  "front camera replacement": {
    "Budget": "Cost-effective front camera repair option for basic photo and video use.",
    "Standard": "Reliable front camera replacement selected for clear selfies and video calls.",
    "Premium": "High-quality front camera part selected for sharper image quality and stable daily use.",
    "Genuine": "Original equipment front camera component where available."
  },
  "back camera replacement": {
    "Budget": "Cost-effective rear camera repair option for basic photo and video use.",
    "Standard": "Reliable rear camera replacement selected for clear everyday photos and videos.",
    "Premium": "High-quality rear camera part selected for sharper image quality and stable focus performance.",
    "Genuine": "Original equipment rear camera component where available."
  }
};

export default function RepairPricingAndCTA({ 
  brandName,
  modelName, 
  repairName,
  bookingRepairName,
  showBackHousingNotice = false,
  variants = []
}: RepairPricingAndCTAProps) {
  const router = useRouter();
  const params = useParams();
  const [tierDescriptions, setTierDescriptions] = useState<Record<string, string>>({});
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showValidationHint, setShowValidationHint] = useState(false);
  const [showError, setShowError] = useState(false);

  const categorySlug = typeof params?.category === 'string' ? params.category : '';
  const brandSlug = typeof params?.brand === 'string' ? params.brand : '';
  const repairSlug = typeof params?.['repair-type'] === 'string' ? params['repair-type'] : '';

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

  const startingPrice = (displayVariants.length === 0 || displayVariants[0].price === 0)
    ? getStartingPrice(categorySlug, brandSlug, repairSlug)
    : null;

  const handleCardClick = (tierName: string) => {
    setShowValidationHint(false);
    setShowError(false);
    setSelectedTier(prev => prev === tierName ? null : tierName);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, tierName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(tierName);
    }
  };

  const handleBookRepair = () => {
    // If there are multiple tiers and none is selected, block navigation
    if (isMultiple && !selectedTier) {
      setShowValidationHint(true);
      setShowError(true);
      return;
    }

    const tierToUse = selectedTier || (displayVariants.length === 1 ? displayVariants[0].quality_grade : null);
    
    const params = new URLSearchParams();
    params.set('brand', brandName);
    params.set('model', modelName);
    params.set('service', bookingRepairName || repairName);
    if (tierToUse) {
      params.set('tier', tierToUse);
    }
    
    const url = `/book-repair?${params.toString()}`;
    
    analytics.trackBookRepair(modelName, repairName);
    router.push(url);
  };

  const getTierDescription = (tierName: string) => {
    const normalizedRepairName = (bookingRepairName || repairName).toLowerCase().trim();

    if (TIER_DESCRIPTION_OVERRIDES[normalizedRepairName]?.[tierName]) {
      return TIER_DESCRIPTION_OVERRIDES[normalizedRepairName][tierName];
    }

    return tierDescriptions[tierName];
  };

  return (
    <div className="w-full flex flex-col items-center mt-8">
      {displayVariants.length > 0 && displayVariants[0].price > 0 ? (
        <div className={`grid gap-6 w-full max-w-4xl justify-center ${isMultiple ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
          {displayVariants.map((variant) => {
            const isSelected = selectedTier === variant.quality_grade;
            
            return (
              <div 
                key={variant.quality_grade}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Select ${variant.quality_grade} tier at $${variant.price}`}
                onClick={() => handleCardClick(variant.quality_grade)}
                onKeyDown={(e) => handleCardKeyDown(e, variant.quality_grade)}
                className={`
                  relative flex flex-col p-8 rounded-2xl border 
                  cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.03]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isSelected 
                    ? 'bg-blue-600 border-blue-700 shadow-lg shadow-blue-200 ring-2 ring-blue-500' 
                    : variant.is_recommended 
                      ? 'bg-blue-50/30 border-blue-300 shadow-md ring-1 ring-blue-300 hover:bg-blue-50' 
                      : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:bg-blue-50'}
                  ${showValidationHint && !isSelected ? 'animate-pulse ring-2 ring-red-400' : ''}
                `}
              >
                {/* Recommended Badge */}
                {variant.is_recommended && (
                  <div className={`flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-bl-lg rounded-tr-xl shadow-md absolute top-0 right-0 z-10
                    ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
                  `}>
                    <ThumbsUp size={14} />
                    RECOMMENDED
                  </div>
                )}

                {/* Tier Name */}
                <div className="mb-1 text-center">
                  <h3 className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {variant.quality_grade}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-baseline justify-center mb-4">
                  <span className={`text-2xl font-extrabold ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                    ${variant.price}
                  </span>
                </div>

                {/* Description */}
                {getTierDescription(variant.quality_grade) && (
                  <p className={`text-sm leading-relaxed mt-2 flex-grow text-center ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {getTierDescription(variant.quality_grade)}
                  </p>
                )}

                {/* Selection Indicator */}
                <div className={`mt-4 text-center text-xs font-semibold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {isSelected ? '✓ Selected' : 'Tap to select'}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mb-12 mt-4 text-center max-w-md mx-auto p-10 rounded-2xl border border-slate-200 bg-slate-50/50 dark:bg-white dark:border-white shadow-sm">
          {startingPrice && (
            <div className="mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Starting from</span>
              <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-800">${startingPrice}</div>
              <div className="mt-1 text-xs text-slate-400">Final quote depends on parts, model and device condition.</div>
              <div className="my-5 h-px w-16 bg-slate-200 mx-auto"></div>
            </div>
          )}
          <p className="text-2xl font-extrabold text-blue-600 dark:text-black mb-4">
            Quote on Request
          </p>
          <p className="text-base text-slate-500 dark:text-black leading-relaxed">
            Please fill out the form below or call{' '}
            <a href="tel:0481058514" className="text-blue-600 dark:text-blue-700 font-bold hover:underline">
              0481 058 514
            </a>{' '}
            for an instant quote.
          </p>
        </div>
      )}

      {showBackHousingNotice && (
        <div className="w-full max-w-4xl mx-auto mt-6 rounded-2xl border border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.92),rgba(255,255,255,0.95))] px-4 py-4 shadow-sm shadow-blue-950/5 sm:px-5">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3 sm:gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-blue-100 bg-white text-blue-600 shadow-sm">
              <ClipboardCheck size={18} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold tracking-tight text-slate-900">
                Back glass or full housing?
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                For this iPhone model, we may recommend a full rear housing replacement instead of back glass only. This can help protect the frame, camera area, wireless charging alignment and long-term durability. We inspect the phone first and confirm the safest repair option before starting.
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-700/80">
                Final repair method and quote depend on inspection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NUCLEAR SPACER — Physical 4rem gap that CSS cannot collapse */}
      <div className="w-full h-16 clear-both" aria-hidden="true"></div>

      {/* Global CTA Group - Strictly below the spacer in document flow */}
      <div className="w-full flex flex-col items-center justify-center mb-8 gap-4 max-w-sm mx-auto">
        {showError && (
          <div className="text-red-500 text-sm font-semibold flex items-center justify-center gap-1 mb-2 animate-pulse">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Please select a screen quality tier to proceed.
          </div>
        )}
        <button 
          type="button"
          onClick={handleBookRepair}
          className="w-full text-lg md:text-xl font-bold py-4 md:py-5 px-8 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          Book Repair Now
        </button>
        <a 
          href="tel:0481058514" 
          className="w-full text-lg md:text-xl font-bold py-4 md:py-5 px-8 text-center bg-white dark:bg-white border border-slate-200 dark:border-white text-slate-700 dark:text-black rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-100 hover:border-slate-300 transition-all duration-200"
          onClick={() => analytics.trackCallNow(modelName, repairName)}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <PhoneCall size={19} strokeWidth={2.6} aria-hidden="true" />
            Call 0481 058 514
          </span>
        </a>
      </div>
    </div>
  );
}
