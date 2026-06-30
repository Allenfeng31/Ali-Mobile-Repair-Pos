"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getIphoneWhyChooseContent, IPHONE_WHY_CHOOSE_SHARED_HIGHLIGHTS } from '@/lib/seo/content/iphone/why-choose';
import type { AliMobileEnhancedIphoneRepairType } from '@/lib/seo/content/iphone';
import {
  getIpadHardwareConfigByModelName,
  getIpadWhyChooseConfig,
  IPAD_WHY_CHOOSE_SHARED_HIGHLIGHTS,
  type AliMobileEnhancedIpadRepairType,
} from '@/lib/seo/content/ipad';
import { getSamsungWhyChooseContent, getSamsungWhyChooseSharedHighlights } from '@/lib/seo/content/samsung/why-choose';
import type { AliMobileEnhancedSamsungRepairType } from '@/lib/seo/content/samsung';
import {
  getSamsungTabletModelConfigByModelName,
} from '@/lib/seo/content/samsung-tablet/config';
import {
  getSamsungTabletWhyChooseConfig,
  SAMSUNG_TABLET_WHY_CHOOSE_SHARED_HIGHLIGHTS,
} from '@/lib/seo/content/samsung-tablet/why-choose';
import type { AliMobileEnhancedSamsungTabletRepairType } from '@/lib/seo/content/samsung-tablet';
import {
  getLenovoTabletModelConfigByModelName,
} from '@/lib/seo/content/lenovo-tablet/config';
import {
  getLenovoTabletWhyChooseConfig,
  LENOVO_TABLET_WHY_CHOOSE_SHARED_HIGHLIGHTS,
} from '@/lib/seo/content/lenovo-tablet/why-choose';
import type { AliMobileEnhancedLenovoTabletRepairType } from '@/lib/seo/content/lenovo-tablet';
import { getGooglePixelWhyChooseConfig } from '@/lib/seo/content/google-pixel/why-choose';
import type { AliMobileEnhancedGooglePixelRepairType } from '@/lib/seo/content/google-pixel';
import { getGooglePixelHardwareConfigByModelName } from '@/lib/seo/content/google-pixel/config';

export type WhyChooseUsRepairType =
  | AliMobileEnhancedIphoneRepairType
  | AliMobileEnhancedSamsungRepairType
  | AliMobileEnhancedSamsungTabletRepairType
  | AliMobileEnhancedLenovoTabletRepairType
  | AliMobileEnhancedGooglePixelRepairType
  | AliMobileEnhancedIpadRepairType;
export type WhyChooseUsContentFamily =
  | 'iphone'
  | 'samsung'
  | 'samsung-tablet'
  | 'lenovo-tablet'
  | 'google-pixel'
  | 'ipad';

interface WhyChooseUsSectionProps {
  modelName: string;
  repairType: WhyChooseUsRepairType;
  contentFamily?: WhyChooseUsContentFamily;
  density?: 'default' | 'comfortable';
}

export default function WhyChooseUsSection({
  modelName,
  repairType,
  contentFamily = 'iphone',
  density = 'default',
}: WhyChooseUsSectionProps) {
  const isLenovoTabletLayout = contentFamily === 'lenovo-tablet';
  const content = contentFamily === 'samsung'
    ? getSamsungWhyChooseContent(modelName)[repairType as AliMobileEnhancedSamsungRepairType]
    : contentFamily === 'samsung-tablet'
      ? getSamsungTabletWhyChooseConfig(
          getSamsungTabletModelConfigByModelName(modelName)!,
          repairType as AliMobileEnhancedSamsungTabletRepairType
        )
    : contentFamily === 'lenovo-tablet'
      ? getLenovoTabletWhyChooseConfig(
          getLenovoTabletModelConfigByModelName(modelName)!,
          repairType as AliMobileEnhancedLenovoTabletRepairType
        )
    : contentFamily === 'ipad'
      ? getIpadWhyChooseConfig(
          getIpadHardwareConfigByModelName(modelName)!,
          repairType as AliMobileEnhancedIpadRepairType
        )
    : contentFamily === 'google-pixel'
      ? getGooglePixelWhyChooseConfig(getGooglePixelHardwareConfigByModelName(modelName)!, repairType as AliMobileEnhancedGooglePixelRepairType)
      : getIphoneWhyChooseContent(modelName)[repairType as AliMobileEnhancedIphoneRepairType];
  const sharedHighlights = contentFamily === 'samsung'
    ? getSamsungWhyChooseSharedHighlights(modelName)
    : contentFamily === 'samsung-tablet'
      ? SAMSUNG_TABLET_WHY_CHOOSE_SHARED_HIGHLIGHTS
    : contentFamily === 'lenovo-tablet'
      ? LENOVO_TABLET_WHY_CHOOSE_SHARED_HIGHLIGHTS
    : contentFamily === 'ipad'
      ? IPAD_WHY_CHOOSE_SHARED_HIGHLIGHTS
    : contentFamily === 'google-pixel'
      ? IPHONE_WHY_CHOOSE_SHARED_HIGHLIGHTS // Assuming Google Pixel can use the same shared highlights or similar for now
      : IPHONE_WHY_CHOOSE_SHARED_HIGHLIGHTS;
  const headingId = `why-choose-us-${repairType}`;
  const [openCardIndex, setOpenCardIndex] = useState<number | null>(null);

  if (!content) {
    return null;
  }

  return (
    <section
      className="mx-auto flex w-full justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      aria-labelledby={headingId}
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-8 text-center lg:gap-10">
        <div className="repair-workbench-heading">
          <span>{content.kicker}</span>
          <h2 id={headingId} className="scroll-mt-32">{content.heading}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty">
            {content.intro} Customers can walk in to our Ringwood Square store, book online, or contact
            the store before visiting.
          </p>
        </div>

        <div
          className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-3"
          aria-label={`${modelName} repair support highlights`}
        >
          {sharedHighlights.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-transparent px-1 py-1 text-center text-sm font-extrabold text-slate-700"
            >
              <Icon size={15} strokeWidth={2.2} aria-hidden="true" className="text-blue-600" /> {text}
            </span>
          ))}
        </div>

        <div
          className="mx-auto grid w-full max-w-sm justify-items-center gap-5 md:max-w-5xl md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:max-w-[1180px] xl:grid-cols-3"
          aria-label={`${modelName} repair assessment details`}
        >
          {content.cards.map((card, index) => {
            const Icon = card.icon;
            const isOpen = openCardIndex === index;
            const panelId = `why-choose-panel-${repairType}-${index}`;

            if (isLenovoTabletLayout) {
              return (
                <article
                  key={card.title}
                  className="flex h-auto w-full max-w-sm flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent px-[50px] py-[50px] text-center"
                >
                  <div className="flex flex-col items-center text-center">
                    <h3 className="flex items-center justify-center gap-2 text-center text-[1.02rem] font-black leading-[1.16] tracking-[-0.015em] text-slate-950">
                      <Icon size={18} strokeWidth={2.2} aria-hidden="true" className="mt-0.5 shrink-0 text-blue-600" />
                      {card.title}
                    </h3>
                    <ul className="mt-4 list-none space-y-4 pl-0 text-center text-[0.96rem] font-medium leading-[1.68] text-slate-500">
                      {card.points.map((point) => (
                        <li key={point} className="text-center">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            }

            return (
              <article
                key={card.title}
                className={`flex h-full w-full max-w-sm flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent text-left md:text-center ${
                  density === 'comfortable'
                    ? 'px-5 py-4 sm:px-6 sm:py-5 md:px-6 md:py-6 lg:px-10 lg:py-10 xl:px-12 xl:py-12'
                    : 'px-5 py-4 sm:px-6 sm:py-5 md:min-h-[388px] md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-[50px] xl:py-[50px]'
                }`}
              >
                <div className="flex flex-1 flex-col md:items-center md:text-center">
                  <button
                    type="button"
                    className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:hidden"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenCardIndex((current) => current === index ? null : index)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon size={18} strokeWidth={2.2} aria-hidden="true" className="shrink-0 text-blue-600" />
                      <span className="text-[1rem] font-black leading-[1.16] tracking-[-0.015em] text-slate-950">
                        {card.title}
                      </span>
                    </span>
                    <ChevronDown
                      size={18}
                      strokeWidth={2.2}
                      aria-hidden="true"
                      className={`shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <h3 className="hidden min-h-[4rem] items-start justify-center gap-2 text-center text-[1.02rem] font-black leading-[1.16] tracking-[-0.015em] text-slate-950 md:flex">
                    <Icon size={18} strokeWidth={2.2} aria-hidden="true" className="mt-0.5 shrink-0 text-blue-600" />
                    {card.title}
                  </h3>
                  <div
                    id={panelId}
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 ease-out motion-reduce:transition-none ${isOpen ? 'mt-4 grid-rows-[1fr] opacity-100 visible' : 'mt-0 grid-rows-[0fr] opacity-0 invisible'} md:mt-5 md:grid-rows-[1fr] md:opacity-100 md:visible`}
                  >
                    <div className="overflow-hidden md:overflow-visible">
                      <ul className="list-none space-y-4 pl-0 text-left text-[0.96rem] font-medium leading-[1.68] text-slate-500 md:text-center">
                        {card.points.map((point) => (
                          <li key={point} className="text-left md:text-center">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {content.footnote ? (
          <p className="mx-auto max-w-3xl text-center text-[0.98rem] font-medium leading-7 text-slate-500">
            {content.footnote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
