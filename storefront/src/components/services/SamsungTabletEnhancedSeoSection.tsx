import React from 'react';
import type { SamsungTabletServiceSection } from '@/lib/seo/content/samsung-tablet';

export interface SamsungTabletEnhancedSeoSectionProps {
  section: SamsungTabletServiceSection;
  layoutMode?: 'default' | 'tablet-centered' | 'lenovo-tablet' | 'macbook';
}

export default function SamsungTabletEnhancedSeoSection({
  section,
  layoutMode = 'default',
}: SamsungTabletEnhancedSeoSectionProps) {
  const isTabletCenteredLayout = layoutMode === 'tablet-centered' || layoutMode === 'lenovo-tablet';
  const isLenovoTabletLayout = layoutMode === 'lenovo-tablet';
  const isMacBookLayout = layoutMode === 'macbook';

  return (
    <section
      id="samsung-tablet-enhanced-seo"
      className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      aria-label={section.heading}
    >
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

          <div
            className={
              isTabletCenteredLayout
                ? 'grid w-full grid-cols-1 items-stretch gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:grid-cols-3'
                : 'grid w-full grid-cols-1 items-stretch gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:grid-cols-3'
            }
          >
            {section.cards.map((card) => (
              <article
                key={card.title}
                className={
                  isLenovoTabletLayout
                    ? 'flex h-auto w-full flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent p-[50px]'
                    : isMacBookLayout
                    ? 'flex h-auto w-full flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-5 text-center sm:p-6 lg:p-10 xl:p-12'
                    : isTabletCenteredLayout
                    ? 'flex h-auto w-full flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent p-5 sm:p-6 lg:p-10 xl:p-12'
                    : 'flex h-full w-full flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent p-5 sm:p-6 lg:p-10 xl:p-12'
                }
              >
                <div
                  className={
                    isTabletCenteredLayout || isMacBookLayout
                      ? 'flex flex-col items-center text-center'
                      : 'flex flex-1 flex-col items-start text-left md:items-center md:text-center'
                  }
                >
                  <h3
                    className={
                      isTabletCenteredLayout || isMacBookLayout
                        ? 'text-center text-balance text-[1rem] font-black leading-[1.14] tracking-[-0.015em] text-slate-950'
                        : 'w-full text-left text-balance text-[1rem] font-black leading-[1.14] tracking-[-0.015em] text-slate-950 md:text-center'
                    }
                  >
                    {card.title}
                  </h3>
                  <p
                    className={
                      isLenovoTabletLayout
                        ? 'mt-4 text-center text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500'
                        : isMacBookLayout
                        ? 'mt-4 text-center text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500'
                        : isTabletCenteredLayout
                        ? 'mt-5 text-center text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500'
                        : 'mt-5 w-full text-left text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500 md:text-center'
                    }
                  >
                    {card.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
    </section>
  );
}
