"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { analytics } from '@/lib/analytics';
import { PhoneCall, ThumbsUp } from 'lucide-react';

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
  const router = useRouter();
  const [tierDescriptions, setTierDescriptions] = useState<Record<string, string>>({});
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showValidationHint, setShowValidationHint] = useState(false);
  const [showError, setShowError] = useState(false);

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
    params.set('service', repairName);
    if (tierToUse) {
      params.set('tier', tierToUse);
    }
    
    const url = `/book-repair?${params.toString()}`;
    
    analytics.trackBookRepair(modelName, repairName);
    router.push(url);
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
                {tierDescriptions[variant.quality_grade] && (
                  <p className={`text-sm leading-relaxed mt-2 flex-grow text-center ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {tierDescriptions[variant.quality_grade]}
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
