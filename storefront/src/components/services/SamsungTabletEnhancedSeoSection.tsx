import React from 'react';
import type { SamsungTabletServiceSection } from '@/lib/seo/content/samsung-tablet';

export interface SamsungTabletEnhancedSeoSectionProps {
  section: SamsungTabletServiceSection;
}

export default function SamsungTabletEnhancedSeoSection({
  section,
}: SamsungTabletEnhancedSeoSectionProps) {
  return (
    <section
      id="samsung-tablet-enhanced-seo"
      className="w-full"
      aria-label={section.heading}
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto flex w-full flex-col gap-8 lg:gap-10">
          <div className="flex flex-col items-center text-center">
            <span className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              {section.eyebrow}
            </span>
            <h2 className="text-balance text-[1.5rem] font-black leading-[1.12] tracking-[-0.015em] text-slate-950 sm:text-[1.75rem] md:max-w-3xl lg:text-[2.25rem]">
              {section.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-pretty text-[0.98rem] font-medium leading-7 text-slate-500">
              {section.intro}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 items-stretch md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
            {section.cards.map((card) => (
              <article
                key={card.title}
                className="flex h-full w-full flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent p-5 sm:p-6 lg:p-10 xl:p-12"
              >
                <div className="flex flex-1 flex-col items-start text-left md:items-center md:text-center">
                  <h3 className="w-full text-left text-balance text-[1rem] font-black leading-[1.14] tracking-[-0.015em] text-slate-950 md:text-center">
                    {card.title}
                  </h3>
                  <p className="mt-5 w-full text-left text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500 md:text-center">
                    {card.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

