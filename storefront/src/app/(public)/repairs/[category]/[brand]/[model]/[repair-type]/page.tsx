import React from 'react';
import { REPAIR_TYPES } from '@/data/seo-data';
import { fetchRepairCatalog, fetchRepairDetails, type RepairVariant } from '@/lib/api';
import { slugify, formatDynamicParam, preserveRouteSegment, safeSlugSegment } from '@/lib/inventoryUtils';
import { RepairServiceSchema } from '@/components/seo/SchemaOrg';
import { Zap, ShieldCheck, CheckCircle, Droplet, Battery, Smartphone, Plug, Wrench, ShieldAlert, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import ChatNowButton from '@/components/ChatNowButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import ReviewsSection from '@/components/ReviewsSection';
import FaqAccordion from '@/components/FaqAccordion';
import ServiceAreas from '@/components/seo/ServiceAreas';
import CommonRepairProblemsSection from '@/components/services/CommonRepairProblemsSection';
import WhyChooseUsSection from '@/components/services/WhyChooseUsSection';
import ExploreRepairNetworkSection, { type ExploreRepairLink } from '@/components/services/ExploreRepairNetworkSection';
import SameModelRepairLinks from '@/components/services/SameModelRepairLinks';
import TechnicianWorkbenchProcess from './TechnicianWorkbenchProcess';
import { generateFaqs } from './repairFaqs';
import { getCrossModelRepairRecommendations } from '@/lib/repairRecommendations';
import { getRepairTypeHubDefinition } from '@/lib/repair-type-hubs';
import {
  getAliMobileEnhancedIphoneRepairType,
  getAliMobileEnhancedIphoneSeoPocket,
  isAliMobileEnhancedIphoneRepairPage,
} from '@/lib/seo/content/iphone';
import type {
  AliMobileEnhancedIphoneRepairType,
  RepairTypeSeoPocket,
} from '@/lib/seo/content/iphone/types';
import {
  getAliMobileEnhancedSamsungHubLinks,
  getAliMobileEnhancedSamsungRepairType,
  getAliMobileEnhancedSamsungSeoPocket,
  isAliMobileEnhancedSamsungRepairPage,
  type AliMobileEnhancedSamsungRepairType,
} from '@/lib/seo/content/samsung';
import {
  getSamsungHardwareConfig,
  GALAXY_A_MODEL_ORDER,
  SAMSUNG_GALAXY_NOTE_MODEL_ORDER,
  SAMSUNG_GALAXY_S_MODEL_ORDER,
  SAMSUNG_HARDWARE_CONFIG,
} from '@/lib/seo/content/samsung/config';
import {
  getAliMobileEnhancedGooglePixelHubLinks,
  getAliMobileEnhancedGooglePixelRepairType,
  getAliMobileEnhancedGooglePixelSeoPocket,
  isAliMobileEnhancedGooglePixelRepairPage,
  type AliMobileEnhancedGooglePixelRepairType,
} from '@/lib/seo/content/google-pixel';
import {
  ALI_MOBILE_IPAD_BUSINESS,
  getAliMobileEnhancedIpadRepairType,
  getAliMobileEnhancedIpadSeoPocket,
  getIpadModelHubLinks,
  getIpadRepairLabel,
  getIpadSameModelRepairLinks,
  getIpadSameRepairLinks,
  isAliMobileEnhancedIpadRepairPage,
  type AliMobileEnhancedIpadRepairType,
  type IpadDetailSection,
  type IpadEnhancedSeoPocket,
} from '@/lib/seo/content/ipad';
import {
  ALI_MOBILE_SAMSUNG_TABLET_BUSINESS,
  getAliMobileEnhancedSamsungTabletRepairType,
  getAliMobileEnhancedSamsungTabletSeoPocket,
  getSamsungTabletCategoryHubLinks,
  getSamsungTabletModelHubLinks,
  getSamsungTabletRepairLabel,
  getSamsungTabletSameModelRepairLinks,
  getSamsungTabletSameRepairLinks,
  isAliMobileEnhancedSamsungTabletRepairPage,
  type AliMobileEnhancedSamsungTabletRepairType,
  type SamsungTabletDetailSection,
  type SamsungTabletDiagnosticProcessSection,
  type SamsungTabletEnhancedSeoPocket,
  type SamsungTabletFinalCtaSection,
} from '@/lib/seo/content/samsung-tablet';
import {
  ALI_MOBILE_LENOVO_TABLET_BUSINESS,
  getAliMobileEnhancedLenovoTabletRepairType,
  getAliMobileEnhancedLenovoTabletSeoPocket,
  getLenovoTabletCategoryHubLinks,
  getLenovoTabletModelHubLinks,
  getLenovoTabletSameModelRepairLinks,
  getLenovoTabletSameRepairLinks,
  isAliMobileEnhancedLenovoTabletRepairPage,
  type AliMobileEnhancedLenovoTabletRepairType,
  type LenovoTabletEnhancedSeoPocket,
} from '@/lib/seo/content/lenovo-tablet';
import {
  getAliMobileEnhancedMacBookRepairType,
  getAliMobileEnhancedMacBookSeoPocket,
  getMacBookCategoryHubLinks,
  getMacBookModelHubLinks,
  getMacBookRepairLabel,
  getMacBookSameModelRepairLinks,
  isAliMobileEnhancedMacBookRepairPage,
} from '@/lib/seo/content/macbook';
import {
  getAliMobileEnhancedAppleWatchRepairType,
  getAliMobileEnhancedAppleWatchSeoPocket,
  getAppleWatchCategoryHubLinks,
  getAppleWatchModelHubLinks,
  getAppleWatchRepairLabel,
  getAppleWatchSameModelRepairLinks,
  isAliMobileEnhancedAppleWatchRepairPage,
} from '@/lib/seo/content/apple-watch';
import { getAliMobileEnhancedOppoSeoPocket, getAliMobileEnhancedOppoRepairType, isAliMobileEnhancedOppoRepairPage, getEnhancedOppoSeriesModelHubLinks, getOppoModelConfig } from '@/lib/seo/content/oppo';
import { getSelectedCrawledRepairPageContent } from '@/lib/seo/content/selectedCrawledRepairPages';
import {
  buildCanonicalModelRepairPath,
  getCanonicalBrandSlug,
  getCentralWaterDamageHref,
  getGrandfatheredWaterDamageStaticParams,
  isGooglePixelAliasBrand,
  isGrandfatheredWaterDamagePath,
  isWaterDamageRepairSlug,
} from '@/lib/waterDamageRouting';
import { CANONICAL_LOGIC_BOARD_REPAIR_SLUG, resolveLegacyLogicBoardRoute } from '@/lib/logicBoardRouting';

import IpadEnhancedSeoSection from '@/components/services/IpadEnhancedSeoSection';
import SamsungTabletEnhancedSeoSection from '@/components/services/SamsungTabletEnhancedSeoSection';

export const revalidate = 86400;

function getRepairIcon(slug: string, size = 48) {
  if (slug.includes('water')) return <Droplet size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('battery')) return <Battery size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('port')) return <Plug size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('screen') || slug.includes('glass') || slug.includes('display')) return <Smartphone size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  return <Wrench size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
}

interface RepairPageProps {
  params: Promise<{
    category: string;
    brand: string;
    model: string;
    'repair-type': string;
  }>;
}

interface SameModelRepairLink {
  href: string;
  label: string;
  slug: string;
}

interface BulletSectionContent {
  kicker: string;
  heading: string;
  intro: string;
  items: ReadonlyArray<string>;
}

interface FinalCtaSectionContent {
  kicker: string;
  heading: string;
  body: string;
  bullets: ReadonlyArray<string>;
}

function RepairDetailBulletSection({
  headingId,
  section,
  isTabletCenteredLayout = false,
  isLenovoTabletLayout = false,
  isMacBookLayout = false,
}: {
  headingId: string;
  section: BulletSectionContent;
  isTabletCenteredLayout?: boolean;
  isLenovoTabletLayout?: boolean;
  isMacBookLayout?: boolean;
}) {
  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      aria-labelledby={headingId}
    >
      <div className="mx-auto flex w-full flex-col gap-8 lg:gap-10">
        <div className="repair-workbench-heading">
          <span>{section.kicker}</span>
          <h2 id={headingId} className="scroll-mt-32">{section.heading}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty">
            {section.intro}
          </p>
        </div>

        <div
          className={
            isTabletCenteredLayout || isLenovoTabletLayout
              ? 'grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:grid-cols-3'
              : 'grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:grid-cols-3'
          }
          aria-label={section.heading}
        >
          {section.items.map((item) => (
            <article
              key={item}
              className={
                isLenovoTabletLayout
                  ? 'flex h-auto flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent p-[50px]'
                  : isMacBookLayout
                  ? 'flex h-auto flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent px-5 py-5 text-center'
                  : isTabletCenteredLayout
                  ? 'flex h-auto flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent px-6 py-6 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-[50px] xl:py-[50px]'
                  : 'flex h-full min-h-[188px] flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent px-6 py-6 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-[50px] xl:py-[50px] md:min-h-[198px]'
              }
            >
              <div
                className={
                  isTabletCenteredLayout || isLenovoTabletLayout
                    ? 'flex flex-col items-center text-center'
                    : isMacBookLayout
                    ? 'flex flex-col items-center text-center'
                    : 'flex flex-1 flex-col items-start text-left md:items-center md:text-center'
                }
              >
                <p
                  className={
                    isLenovoTabletLayout
                      ? 'text-center text-pretty text-[0.95rem] font-medium leading-[1.68] text-slate-500'
                      : isMacBookLayout
                      ? 'text-center text-pretty text-[0.95rem] font-medium leading-[1.68] text-slate-500'
                      : isTabletCenteredLayout
                      ? 'text-center text-pretty text-[0.95rem] font-medium leading-[1.68] text-slate-500'
                      : 'w-full text-left text-pretty text-[0.95rem] font-medium leading-[1.68] text-slate-500 md:mx-auto md:max-w-[22rem] md:text-center'
                  }
                >
                  {item}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RepairQuickAnswerSection({
  headingId,
  answer,
  isMacBookLayout = false,
}: {
  headingId: string;
  answer: string;
  isMacBookLayout?: boolean;
}) {
  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      aria-labelledby={headingId}
    >
      <div
        className={
          isMacBookLayout
            ? 'mx-auto flex w-full flex-col gap-6 rounded-[28px] border border-blue-100 bg-white/90 p-5 shadow-sm shadow-blue-950/5 sm:p-6 lg:p-10 xl:p-12 text-center'
            : 'mx-auto flex w-full flex-col gap-6 rounded-[28px] border border-blue-100 bg-white/90 p-5 shadow-sm shadow-blue-950/5 sm:p-6 lg:p-10 xl:p-12'
        }
      >
        <div className="repair-workbench-heading">
          <span>Quick Answer</span>
          <h2 id={headingId} className="scroll-mt-32">Quick Answer</h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty">
            {answer}
          </p>
        </div>
      </div>
    </section>
  );
}

function RepairDiagnosticProcessSection({
  headingId,
  section,
  isTabletCenteredLayout = false,
  isLenovoTabletLayout = false,
  isMacBookLayout = false,
}: {
  headingId: string;
  section: SamsungTabletDiagnosticProcessSection;
  isTabletCenteredLayout?: boolean;
  isLenovoTabletLayout?: boolean;
  isMacBookLayout?: boolean;
}) {
  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      aria-labelledby={headingId}
    >
      <div className="mx-auto flex w-full flex-col gap-8 lg:gap-10">
        <div className="repair-workbench-heading">
          <span>{section.kicker}</span>
          <h2 id={headingId} className="scroll-mt-32">{section.heading}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty">
            {section.intro}
          </p>
        </div>

        <div
          className={
            isTabletCenteredLayout || isLenovoTabletLayout
              ? 'grid w-full grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:grid-cols-3'
              : 'grid w-full grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:grid-cols-3'
          }
        >
          {section.steps.map((step) => (
            <article
              key={`${step.step}-${step.title}`}
              className={
                isLenovoTabletLayout
                  ? 'flex h-auto w-full flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-[50px] text-center'
                  : isMacBookLayout
                  ? 'flex h-full w-full flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-5 text-center sm:p-6 lg:p-10 xl:p-12'
                  : isTabletCenteredLayout
                  ? 'flex h-full w-full flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-5 text-center sm:p-6 lg:p-10 xl:p-12'
                  : 'flex h-full w-full flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent p-5 sm:p-6 lg:p-10 xl:p-12'
              }
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                {step.step}
              </span>
              <h3
                className={
                  isTabletCenteredLayout || isLenovoTabletLayout || isMacBookLayout
                    ? 'mt-5 text-center text-balance text-[1rem] font-black leading-[1.14] tracking-[-0.015em] text-slate-950'
                    : 'mt-5 text-balance text-[1rem] font-black leading-[1.14] tracking-[-0.015em] text-slate-950'
                }
              >
                {step.title}
              </h3>
              <p
                className={
                  isTabletCenteredLayout || isLenovoTabletLayout || isMacBookLayout
                    ? 'mt-4 text-center text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500'
                    : 'mt-4 text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500'
                }
              >
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RepairDetailFinalCta({
  headingId,
  section,
  bookRepairHref,
  phoneNumber,
  isCentered = false,
}: {
  headingId: string;
  section: FinalCtaSectionContent;
  bookRepairHref: string;
  phoneNumber: string;
  isCentered?: boolean;
}) {
  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      aria-labelledby={headingId}
    >
      <div className={`mx-auto flex w-full flex-col gap-6 rounded-[28px] border border-blue-100 bg-transparent p-5 shadow-sm shadow-blue-950/5 sm:p-6 lg:p-10 xl:p-12 ${isCentered ? 'items-center text-center' : ''}`}>
          <div className={`repair-workbench-heading ${isCentered ? 'items-center text-center' : ''}`}>
          <span>{section.kicker}</span>
          <h2 id={headingId} className="scroll-mt-32">{section.heading}</h2>
          <p className={`mt-4 text-pretty ${isCentered ? 'mx-auto max-w-3xl' : 'max-w-3xl'}`}>
            {section.body}
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
          {section.bullets.map((bullet) => (
            <article
              key={bullet}
              className={`rounded-2xl border border-blue-100 bg-transparent px-5 py-5 text-center text-sm font-semibold leading-6 text-slate-700 ${isCentered ? 'text-center' : ''}`}
            >
              {bullet}
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={bookRepairHref}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Book Repair
          </Link>
          <a
            href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Call {phoneNumber}
          </a>
          <ChatNowButton
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          />
        </div>
      </div>
    </section>
  );
}

const EXCLUDED_RELATED_REPAIR_PRESENTATION_TOKENS = [
  'flex-cable',
  'power-flex',
  'power-button-flex',
  'volume-flex',
  'volume-button-flex',
  'flash-flex',
  'flashlight-flex',
] as const;

function hasExcludedRelatedRepairPresentationToken(value: string) {
  const normalized = slugify(value);

  return EXCLUDED_RELATED_REPAIR_PRESENTATION_TOKENS.some((token) => (
    normalized === token ||
    normalized.startsWith(`${token}-`) ||
    normalized.endsWith(`-${token}`) ||
    normalized.includes(`-${token}-`)
  ));
}

function isExcludedRelatedRepairPresentationItem({
  slug,
  repairName,
  label,
}: {
  slug?: string;
  repairName?: string;
  label?: string;
}) {
  return [slug, repairName, label]
    .filter((value): value is string => Boolean(value))
    .some((value) => hasExcludedRelatedRepairPresentationToken(value));
}

function getRelatedRepairPresentationName(
  category: string,
  brand: string,
  modelSlug: string,
  repairSlug: string,
  repairName: string
) {
  const publicRepairSlug = getPublicRepairSlug(category, brand, modelSlug, repairSlug);

  if (publicRepairSlug === 'front-camera-replacement') {
    return 'Front Camera Repair';
  }

  if (publicRepairSlug === 'back-camera-replacement') {
    return 'Back Camera Repair';
  }

  if (publicRepairSlug === 'camera-repair') {
    return 'Camera Repair';
  }

  return getRepairDisplayName(category, brand, modelSlug, publicRepairSlug, repairName);
}

function getRelatedRepairAnchorText({
  category,
  brand,
  modelSlug,
  modelName,
  repairSlug,
  repairName,
}: {
  category: string;
  brand: string;
  modelSlug: string;
  modelName: string;
  repairSlug: string;
  repairName: string;
}) {
  const presentationName = getRelatedRepairPresentationName(category, brand, modelSlug, repairSlug, repairName);
  return `${modelName} ${presentationName.toLowerCase()}`;
}

function dedupeRelatedRepairLinks(links: SameModelRepairLink[]) {
  const seen = new Set<string>();

  return links.filter((link) => {
    if (seen.has(link.href)) {
      return false;
    }

    seen.add(link.href);
    return true;
  });
}

function getIphoneModelGeneration(modelSlug: string) {
  const match = slugify(modelSlug).match(/^iphone-(\d+)(?:-|$)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function getIphoneModelVariantKey(modelSlug: string) {
  const normalized = slugify(modelSlug);
  if (normalized.includes('pro-max')) return 'pro-max';
  if (normalized.includes('pro')) return 'pro';
  if (normalized.includes('plus')) return 'plus';
  if (normalized.includes('mini')) return 'mini';
  return 'base';
}

function getIphoneModelVariantDistance(currentVariant: string, candidateVariant: string) {
  const variantOrder = ['base', 'mini', 'plus', 'pro', 'pro-max'];
  const currentIndex = variantOrder.indexOf(currentVariant);
  const candidateIndex = variantOrder.indexOf(candidateVariant);

  if (currentIndex === -1 || candidateIndex === -1) {
    return 10;
  }

  return Math.abs(currentIndex - candidateIndex);
}

function getEnhancedIphoneModelHubLinks(
  models: ReadonlyArray<{ slug: string; model: string }>,
  currentModelSlug: string
): ExploreRepairLink[] {
  const currentGeneration = getIphoneModelGeneration(currentModelSlug);
  const currentVariant = getIphoneModelVariantKey(currentModelSlug);

  return models
    .filter((model) => model.slug !== currentModelSlug)
    .map((model) => {
      const generation = getIphoneModelGeneration(model.slug);
      const variant = getIphoneModelVariantKey(model.slug);
      const generationDistance =
        currentGeneration !== null && generation !== null ? Math.abs(generation - currentGeneration) : 10;
      const sameGenerationBoost = generationDistance === 0 ? -100 : 0;
      const futureTieBreaker =
        currentGeneration !== null && generation !== null && generation > currentGeneration ? 1 : 0;

      return {
        href: `/repairs/phone/iphone/${preserveRouteSegment(model.slug)}`,
        label: `Explore ${model.model} repairs`,
        sortScore:
          generationDistance * 100 +
          getIphoneModelVariantDistance(currentVariant, variant) * 10 +
          sameGenerationBoost +
          futureTieBreaker,
      };
    })
    .sort((left, right) => {
      if (left.sortScore !== right.sortScore) {
        return left.sortScore - right.sortScore;
      }

      return left.label.localeCompare(right.label);
    })
    .slice(0, 5)
    .map(({ href, label }) => ({ href, label }));
}

function getEnhancedRepairCategoryHubLinks(): ExploreRepairLink[] {
  return [
    { href: '/repairs/phone', label: 'Explore phone repairs' },
    { href: '/repairs/phone/iphone', label: 'Explore iPhone repairs' },
    { href: '/repairs/phone/samsung', label: 'Explore Samsung phone repairs' },
    { href: '/repairs/phone/oppo', label: 'Explore OPPO phone repairs' },
    { href: '/repairs/phone/google-pixel', label: 'Explore Google Pixel repairs' },
    { href: '/repairs/tablet/ipad', label: 'Explore iPad repairs' },
    { href: '/repairs/laptop/macbook', label: 'Explore MacBook repairs' },
    { href: '/repairs/watch/apple', label: 'Explore Apple Watch repairs' },
  ];
}

function getSamsungFoldableGeneration(modelSlug: string) {
  const match = slugify(modelSlug).match(/^galaxy-z-(?:fold|flip)-(\d+)(?:-|$)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function getSamsungVariantRank(variantClass: string) {
  const variantOrder = ['base', 'plus', 'ultra', 'fe', 'edge', 'active', 'other'];
  const index = variantOrder.indexOf(variantClass);
  return index === -1 ? variantOrder.length : index;
}

function getEnhancedSamsungFamilyModelHubLinks(
  models: ReadonlyArray<{ slug: string; model: string }>,
  currentModelSlug: string
): ExploreRepairLink[] {
  const currentConfig = getSamsungHardwareConfig(currentModelSlug);
  if (!currentConfig) {
    return [];
  }

  if (currentConfig.seriesFamily === 'galaxy-note') {
    const currentGeneration = currentConfig.generation ?? 0;
    const currentVariantRank = getSamsungVariantRank(currentConfig.variantClass);
    const familyModelOrder = SAMSUNG_GALAXY_NOTE_MODEL_ORDER;
    const currentOrderIndex = familyModelOrder.indexOf(currentConfig.modelSlug);
    const currentConnectivityClass = currentConfig.connectivityClass ?? 'unspecified';
    const seenHrefs = new Set<string>();

    return models
      .filter((model) => model.slug !== currentModelSlug)
      .map((model) => {
        const candidateConfig = getSamsungHardwareConfig(model.slug);
        if (!candidateConfig || candidateConfig.seriesFamily !== 'galaxy-note') {
          return null;
        }

        const generationDistance = Math.abs((candidateConfig.generation ?? 0) - currentGeneration);
        const sameGenerationScore = candidateConfig.generation === currentGeneration ? 0 : 1;
        const sameVariantAdjacencyScore =
          generationDistance === 1 && candidateConfig.variantClass === currentConfig.variantClass ? 0 : 1;
        const variantDistance = Math.abs(getSamsungVariantRank(candidateConfig.variantClass) - currentVariantRank);
        const candidateOrderIndex = familyModelOrder.indexOf(candidateConfig.modelSlug);
        const candidateConnectivityClass = candidateConfig.connectivityClass ?? 'unspecified';

        return {
          href: `/repairs/phone/samsung/${preserveRouteSegment(candidateConfig.modelSlug)}`,
          label: `Explore ${candidateConfig.modelName} repairs`,
          sameGenerationScore,
          sameVariantAdjacencyScore,
          generationDistance,
          orderDistance:
            currentOrderIndex >= 0 && candidateOrderIndex >= 0
              ? Math.abs(candidateOrderIndex - currentOrderIndex)
              : generationDistance,
          connectivityScore: candidateConnectivityClass === currentConnectivityClass ? 0 : 1,
          newerTieBreaker: candidateConfig.generation > currentGeneration ? 0 : 1,
          variantDistance,
          candidateOrderIndex,
          slug: candidateConfig.modelSlug,
        };
      })
      .filter((model): model is NonNullable<typeof model> => Boolean(model))
      .sort((left, right) => {
        if (left.sameGenerationScore !== right.sameGenerationScore) {
          return left.sameGenerationScore - right.sameGenerationScore;
        }

        if (left.sameVariantAdjacencyScore !== right.sameVariantAdjacencyScore) {
          return left.sameVariantAdjacencyScore - right.sameVariantAdjacencyScore;
        }

        if (left.generationDistance !== right.generationDistance) {
          return left.generationDistance - right.generationDistance;
        }

        if (left.orderDistance !== right.orderDistance) {
          return left.orderDistance - right.orderDistance;
        }

        if (left.connectivityScore !== right.connectivityScore) {
          return left.connectivityScore - right.connectivityScore;
        }

        if (left.variantDistance !== right.variantDistance) {
          return left.variantDistance - right.variantDistance;
        }

        if (left.newerTieBreaker !== right.newerTieBreaker) {
          return left.newerTieBreaker - right.newerTieBreaker;
        }

        return left.slug.localeCompare(right.slug);
      })
      .filter((link) => {
        if (seenHrefs.has(link.href)) {
          return false;
        }

        seenHrefs.add(link.href);
        return true;
      })
      .slice(0, 5)
      .map(({ href, label }) => ({ href, label }));
  }

  if (currentConfig.seriesFamily === 'galaxy-s') {
    const currentGeneration = currentConfig.generation ?? 0;
    const currentVariantRank = getSamsungVariantRank(currentConfig.variantClass);
    const familyModelOrder = SAMSUNG_GALAXY_S_MODEL_ORDER;
    const currentOrderIndex = familyModelOrder.indexOf(currentConfig.modelSlug);
    const seenHrefs = new Set<string>();

    return models
      .filter((model) => model.slug !== currentModelSlug)
      .map((model) => {
        const candidateConfig = getSamsungHardwareConfig(model.slug);
        if (!candidateConfig || candidateConfig.seriesFamily !== 'galaxy-s') {
          return null;
        }

        const generationDistance = Math.abs((candidateConfig.generation ?? 0) - currentGeneration);
        const sameGenerationScore = candidateConfig.generation === currentGeneration ? 0 : 1;
        const sameVariantAdjacencyScore =
          generationDistance === 1 && candidateConfig.variantClass === currentConfig.variantClass ? 0 : 1;
        const variantDistance = Math.abs(getSamsungVariantRank(candidateConfig.variantClass) - currentVariantRank);
        const candidateOrderIndex = familyModelOrder.indexOf(candidateConfig.modelSlug);

        return {
          href: `/repairs/phone/samsung/${preserveRouteSegment(candidateConfig.modelSlug)}`,
          label: `Explore ${candidateConfig.modelName} repairs`,
          sameGenerationScore,
          sameVariantAdjacencyScore,
          generationDistance,
          orderDistance:
            currentOrderIndex >= 0 && candidateOrderIndex >= 0
              ? Math.abs(candidateOrderIndex - currentOrderIndex)
              : generationDistance,
          newerTieBreaker: candidateConfig.generation > currentGeneration ? 0 : 1,
          variantDistance,
          candidateOrderIndex,
          slug: candidateConfig.modelSlug,
        };
      })
      .filter((model): model is NonNullable<typeof model> => Boolean(model))
      .sort((left, right) => {
        if (left.sameGenerationScore !== right.sameGenerationScore) {
          return left.sameGenerationScore - right.sameGenerationScore;
        }

        if (left.sameVariantAdjacencyScore !== right.sameVariantAdjacencyScore) {
          return left.sameVariantAdjacencyScore - right.sameVariantAdjacencyScore;
        }

        if (left.generationDistance !== right.generationDistance) {
          return left.generationDistance - right.generationDistance;
        }

        if (left.orderDistance !== right.orderDistance) {
          return left.orderDistance - right.orderDistance;
        }

        if (left.variantDistance !== right.variantDistance) {
          return left.variantDistance - right.variantDistance;
        }

        if (left.newerTieBreaker !== right.newerTieBreaker) {
          return left.newerTieBreaker - right.newerTieBreaker;
        }

        return left.slug.localeCompare(right.slug);
      })
      .filter((link) => {
        if (seenHrefs.has(link.href)) {
          return false;
        }

        seenHrefs.add(link.href);
        return true;
      })
      .slice(0, 5)
      .map(({ href, label }) => ({ href, label }));
  }

  if (currentConfig.seriesFamily === 'galaxy-a') {
    const currentGeneration = currentConfig.generation ?? 0;
    const currentOrderIndex = GALAXY_A_MODEL_ORDER.indexOf(currentConfig.modelSlug);
    const currentTensGroup = Math.floor(currentGeneration / 10);
    const currentConnectivityClass = getGalaxyAConnectivityClass(currentConfig.modelSlug);
    const seenHrefs = new Set<string>();

    return models
      .filter((model) => model.slug !== currentModelSlug)
      .map((model) => {
        const candidateConfig = getSamsungHardwareConfig(model.slug);
        if (!candidateConfig || candidateConfig.seriesFamily !== 'galaxy-a') {
          return null;
        }

        const candidateOrderIndex = GALAXY_A_MODEL_ORDER.indexOf(candidateConfig.modelSlug);
        const generationDistance = Math.abs((candidateConfig.generation ?? 0) - currentGeneration);
        const candidateTensGroup = Math.floor((candidateConfig.generation ?? 0) / 10);
        const orderDistance =
          currentOrderIndex >= 0 && candidateOrderIndex >= 0
            ? Math.abs(candidateOrderIndex - currentOrderIndex)
            : generationDistance;

        return {
          href: `/repairs/phone/samsung/${preserveRouteSegment(candidateConfig.modelSlug)}`,
          label: `Explore ${candidateConfig.modelName} repairs`,
          sameTensGroupScore: candidateTensGroup === currentTensGroup ? 0 : 1,
          generationDistance,
          orderDistance,
          connectivityScore: getGalaxyAConnectivityClass(candidateConfig.modelSlug) === currentConnectivityClass ? 0 : 1,
          newerTieBreaker: candidateConfig.generation > currentGeneration ? 0 : 1,
          slug: candidateConfig.modelSlug,
        };
      })
      .filter((model): model is NonNullable<typeof model> => Boolean(model))
      .sort((left, right) => {
        if (left.sameTensGroupScore !== right.sameTensGroupScore) {
          return left.sameTensGroupScore - right.sameTensGroupScore;
        }

        if (left.generationDistance !== right.generationDistance) {
          return left.generationDistance - right.generationDistance;
        }

        if (left.orderDistance !== right.orderDistance) {
          return left.orderDistance - right.orderDistance;
        }

        if (left.connectivityScore !== right.connectivityScore) {
          return left.connectivityScore - right.connectivityScore;
        }

        if (left.newerTieBreaker !== right.newerTieBreaker) {
          return left.newerTieBreaker - right.newerTieBreaker;
        }

        return left.slug.localeCompare(right.slug);
      })
      .filter((link) => {
        if (seenHrefs.has(link.href)) {
          return false;
        }

        seenHrefs.add(link.href);
        return true;
      })
      .slice(0, 5)
      .map(({ href, label }) => ({ href, label }));
  }

  const familyModelOrder = Object.values(SAMSUNG_HARDWARE_CONFIG)
    .filter((config) => config.deviceFamily === currentConfig.deviceFamily)
    .map((config) => config.modelSlug);
  const currentGeneration = getSamsungFoldableGeneration(currentModelSlug);
  const currentOrderIndex = familyModelOrder.indexOf(currentConfig.modelSlug);
  const seenHrefs = new Set<string>();

  return models
    .filter((model) => model.slug !== currentModelSlug)
    .filter((model) => getSamsungHardwareConfig(model.slug)?.deviceFamily === currentConfig.deviceFamily)
    .map((model) => {
      const href = `/repairs/phone/samsung/${preserveRouteSegment(model.slug)}`;
      const candidateOrderIndex = familyModelOrder.indexOf(model.slug as keyof typeof SAMSUNG_HARDWARE_CONFIG);
      const candidateGeneration = getSamsungFoldableGeneration(model.slug);
      const generationDistance = Math.abs(candidateGeneration - currentGeneration);
      const orderDistance =
        currentOrderIndex >= 0 && candidateOrderIndex >= 0
          ? Math.abs(candidateOrderIndex - currentOrderIndex)
          : Number.MAX_SAFE_INTEGER;

      return {
        href,
        label: `Explore ${model.model} repairs`,
        candidateOrderIndex,
        generationDistance,
        orderDistance,
        sortDistance:
          currentOrderIndex >= 0 && candidateOrderIndex >= 0 ? orderDistance : generationDistance,
        newerTieBreaker:
          currentOrderIndex >= 0 && candidateOrderIndex >= 0 && candidateOrderIndex > currentOrderIndex ? 0 : 1,
        slug: model.slug,
      };
    })
    .filter((model) => model.candidateOrderIndex >= 0)
    .sort((left, right) => {
      if (left.sortDistance !== right.sortDistance) {
        return left.sortDistance - right.sortDistance;
      }

      if (left.newerTieBreaker !== right.newerTieBreaker) {
        return left.newerTieBreaker - right.newerTieBreaker;
      }

      return left.slug.localeCompare(right.slug);
    })
    .filter((link) => {
      if (seenHrefs.has(link.href)) {
        return false;
      }

      seenHrefs.add(link.href);
      return true;
    })
    .slice(0, 5)
    .map(({ href, label }) => ({ href, label }));
}

function getGalaxyAModelNumber(modelSlug: string) {
  const match = slugify(modelSlug).match(/^galaxy-a(\d+)(?:-5g)?(?:-|$)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function getGalaxyAConnectivityClass(modelSlug: string) {
  return slugify(modelSlug).includes('-5g') ? '5g' : '4g';
}

function getEnhancedSamsungGalaxyARelatedRepairLinks(
  models: ReadonlyArray<{ slug: string; model: string }>,
  currentModelSlug: string,
  repairSlug: string,
  repairName: string
): SameModelRepairLink[] {
  const currentConfig = getSamsungHardwareConfig(currentModelSlug);

  if (!currentConfig || currentConfig.seriesFamily !== 'galaxy-a') {
    return [];
  }

  const currentModelNumber = getGalaxyAModelNumber(currentConfig.modelSlug);
  const currentTensGroup = Math.floor(currentModelNumber / 10);
  const currentConnectivityClass = getGalaxyAConnectivityClass(currentConfig.modelSlug);
  const seenHrefs = new Set<string>();

  return models
    .filter((model) => model.slug !== currentModelSlug)
    .map((model) => {
      const candidateConfig = getSamsungHardwareConfig(model.slug);

      if (!candidateConfig || candidateConfig.seriesFamily !== 'galaxy-a') {
        return null;
      }

      const candidateRepairSlug = getPublicRepairSlug(
        'phone',
        'samsung',
        candidateConfig.modelSlug,
        repairSlug
      ) as AliMobileEnhancedSamsungRepairType;

      if (!candidateConfig.supportedRepairTypes.includes(candidateRepairSlug)) {
        return null;
      }

      const candidateModelNumber = getGalaxyAModelNumber(candidateConfig.modelSlug);
      const candidateTensGroup = Math.floor(candidateModelNumber / 10);
      const candidateConnectivityClass = getGalaxyAConnectivityClass(candidateConfig.modelSlug);

      return {
        href: `/repairs/phone/samsung/${preserveRouteSegment(candidateConfig.modelSlug)}/${getPublicRepairSlug('phone', 'samsung', candidateConfig.modelSlug, repairSlug)}`,
        label: getRelatedRepairAnchorText({
          category: 'phone',
          brand: 'samsung',
          modelSlug: candidateConfig.modelSlug,
          modelName: candidateConfig.modelName,
          repairSlug,
          repairName,
        }),
        sameTensGroupScore: candidateTensGroup === currentTensGroup ? 0 : 1,
        generationDistance: Math.abs(candidateModelNumber - currentModelNumber),
        connectivityScore: candidateConnectivityClass === currentConnectivityClass ? 0 : 1,
        newerTieBreaker: candidateModelNumber > currentModelNumber ? 0 : 1,
        slug: candidateConfig.modelSlug,
      };
    })
    .filter((model): model is NonNullable<typeof model> => Boolean(model))
    .sort((left, right) => {
      if (left.sameTensGroupScore !== right.sameTensGroupScore) {
        return left.sameTensGroupScore - right.sameTensGroupScore;
      }

      if (left.generationDistance !== right.generationDistance) {
        return left.generationDistance - right.generationDistance;
      }

      if (left.connectivityScore !== right.connectivityScore) {
        return left.connectivityScore - right.connectivityScore;
      }

      if (left.newerTieBreaker !== right.newerTieBreaker) {
        return left.newerTieBreaker - right.newerTieBreaker;
      }

      return left.slug.localeCompare(right.slug);
    })
    .filter((link) => {
      if (seenHrefs.has(link.href)) {
        return false;
      }

      seenHrefs.add(link.href);
      return true;
    })
    .slice(0, 5)
    .map(({ href, label, slug }) => ({ href, label, slug }));
}

function getEnhancedSamsungGalaxyNoteRelatedRepairLinks(
  models: ReadonlyArray<{ slug: string; model: string }>,
  currentModelSlug: string,
  repairSlug: string,
  repairName: string
): SameModelRepairLink[] {
  const currentConfig = getSamsungHardwareConfig(currentModelSlug);

  if (!currentConfig || currentConfig.seriesFamily !== 'galaxy-note') {
    return [];
  }

  const currentGeneration = currentConfig.generation ?? 0;
  const currentVariantRank = getSamsungVariantRank(currentConfig.variantClass);
  const currentOrderIndex = SAMSUNG_GALAXY_NOTE_MODEL_ORDER.indexOf(currentConfig.modelSlug);
  const currentConnectivityClass = currentConfig.connectivityClass ?? 'unspecified';
  const seenHrefs = new Set<string>();

  return models
    .filter((model) => model.slug !== currentModelSlug)
    .map((model) => {
      const candidateConfig = getSamsungHardwareConfig(model.slug);

      if (!candidateConfig || candidateConfig.seriesFamily !== 'galaxy-note') {
        return null;
      }

      const candidateRepairSlug = getPublicRepairSlug(
        'phone',
        'samsung',
        candidateConfig.modelSlug,
        repairSlug
      ) as AliMobileEnhancedSamsungRepairType;

      if (!candidateConfig.supportedRepairTypes.includes(candidateRepairSlug)) {
        return null;
      }

      const candidateGeneration = candidateConfig.generation ?? 0;
      const candidateVariantRank = getSamsungVariantRank(candidateConfig.variantClass);
      const candidateOrderIndex = SAMSUNG_GALAXY_NOTE_MODEL_ORDER.indexOf(candidateConfig.modelSlug);
      const candidateConnectivityClass = candidateConfig.connectivityClass ?? 'unspecified';

      return {
        href: `/repairs/phone/samsung/${preserveRouteSegment(candidateConfig.modelSlug)}/${candidateRepairSlug}`,
        label: getRelatedRepairAnchorText({
          category: 'phone',
          brand: 'samsung',
          modelSlug: candidateConfig.modelSlug,
          modelName: candidateConfig.modelName,
          repairSlug: candidateRepairSlug,
          repairName,
        }),
        sameGenerationScore: candidateGeneration === currentGeneration ? 0 : 1,
        sameVariantAdjacencyScore:
          Math.abs(candidateGeneration - currentGeneration) === 1 && candidateConfig.variantClass === currentConfig.variantClass ? 0 : 1,
        generationDistance: Math.abs(candidateGeneration - currentGeneration),
        orderDistance:
          currentOrderIndex >= 0 && candidateOrderIndex >= 0
            ? Math.abs(candidateOrderIndex - currentOrderIndex)
            : Math.abs(candidateGeneration - currentGeneration),
        connectivityScore: candidateConnectivityClass === currentConnectivityClass ? 0 : 1,
        newerTieBreaker: candidateGeneration > currentGeneration ? 0 : 1,
        variantDistance: Math.abs(candidateVariantRank - currentVariantRank),
        slug: candidateConfig.modelSlug,
      };
    })
    .filter((model): model is NonNullable<typeof model> => Boolean(model))
    .sort((left, right) => {
      if (left.sameGenerationScore !== right.sameGenerationScore) {
        return left.sameGenerationScore - right.sameGenerationScore;
      }

      if (left.sameVariantAdjacencyScore !== right.sameVariantAdjacencyScore) {
        return left.sameVariantAdjacencyScore - right.sameVariantAdjacencyScore;
      }

      if (left.generationDistance !== right.generationDistance) {
        return left.generationDistance - right.generationDistance;
      }

      if (left.orderDistance !== right.orderDistance) {
        return left.orderDistance - right.orderDistance;
      }

      if (left.connectivityScore !== right.connectivityScore) {
        return left.connectivityScore - right.connectivityScore;
      }

      if (left.variantDistance !== right.variantDistance) {
        return left.variantDistance - right.variantDistance;
      }

      if (left.newerTieBreaker !== right.newerTieBreaker) {
        return left.newerTieBreaker - right.newerTieBreaker;
      }

      return left.slug.localeCompare(right.slug);
    })
    .filter((link) => {
      if (seenHrefs.has(link.href)) {
        return false;
      }

      seenHrefs.add(link.href);
      return true;
    })
    .slice(0, 5)
    .map(({ href, label, slug }) => ({ href, label, slug }));
}

function getEnhancedOppoRelatedRepairLinks(
  models: ReadonlyArray<{ slug: string; model: string }>,
  currentModelSlug: string,
  repairSlug: string,
  repairName: string
): SameModelRepairLink[] {
  const currentConfig = getOppoModelConfig(currentModelSlug);
  if (!currentConfig) return [];

  const currentSeries = currentConfig.series;
  const seenHrefs = new Set<string>();

  return models
    .filter((model) => model.slug !== currentModelSlug)
    .map((model) => {
      const candidateConfig = getOppoModelConfig(model.slug);
      if (!candidateConfig || candidateConfig.series !== currentSeries) {
        return null;
      }

      return {
        href: `/repairs/phone/oppo/${model.slug}/${repairSlug}`,
        label: getRelatedRepairAnchorText({
          category: 'phone',
          brand: 'oppo',
          modelSlug: model.slug,
          modelName: candidateConfig.displayName 
            ? (candidateConfig.displayName.toLowerCase().startsWith('oppo') ? candidateConfig.displayName : `OPPO ${candidateConfig.displayName}`)
            : (model.model.toLowerCase().startsWith('oppo') ? model.model : `OPPO ${model.model}`),
          repairSlug,
          repairName,
        }),
        slug: model.slug,
      };
    })
    .filter((model): model is NonNullable<typeof model> => Boolean(model))
    .sort((left, right) => {
       const hashLeft = (left.slug.length + currentModelSlug.length) % 3;
       const hashRight = (right.slug.length + currentModelSlug.length) % 3;
       return hashLeft - hashRight || left.slug.localeCompare(right.slug);
    })
    .filter((link) => {
      if (seenHrefs.has(link.href)) return false;
      seenHrefs.add(link.href);
      return true;
    })
    .slice(0, 5)
    .map(({ href, label, slug }) => ({ href, label, slug }));
}

type EnhancedRepairType =
  | AliMobileEnhancedIphoneRepairType
  | AliMobileEnhancedSamsungRepairType
  | AliMobileEnhancedGooglePixelRepairType;

const ENHANCED_REPAIR_TYPE_HUB_LINK_TEXT: Partial<Record<EnhancedRepairType, string>> = {
  'screen-replacement': 'View all screen replacement services',
  'battery-replacement': 'View all battery replacement services',
  'charging-port-replacement': 'View all charging port replacement services',
  'back-glass-replacement': 'View all back glass repair services',
  'back-housing-replacement': 'View all back housing replacement services',
  'front-camera-replacement': 'View all front camera replacement services',
  'back-camera-replacement': 'View all back camera replacement services',
};

const IPHONE_13_SCREEN_REPLACEMENT_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 screen replacement in Ringwood? Ali Mobile & Repair checks cracked glass, OLED faults, touch issues, frame fit, Face ID area condition, and display option availability before quoting.",
  workbenchHeadings: {
    options: "Which screen path fits this iPhone 13?",
    diagnostics: "What do we test before screen replacement?",
    symptoms: "Which display symptoms matter most?",
    outcomes: "What can affect the screen result?",
  },
  repairOptions: [
    {
      name: "Standard display path",
      shortDescription:
        "A cost-conscious iPhone 13 screen replacement option for cracked glass, touch faults, or a display that needs a practical repair.",
      bestFor:
        "Customers who want the phone working again cleanly without choosing the highest display tier.",
      notes:
        "We still test brightness, touch response, speaker mesh alignment, camera area fit, and the frame edge before handover.",
    },
    {
      name: "Premium OLED path",
      shortDescription:
        "A higher-grade OLED option for customers who care about deeper blacks, smoother viewing, and stronger colour consistency.",
      bestFor:
        "Customers who use their iPhone 13 heavily for photos, maps, work apps, videos, and daily messaging.",
      notes:
        "A bent frame can stress a fresh OLED panel, so we inspect the housing before fitting a premium display.",
    },
    {
      name: "Diagnosis before display fitting",
      shortDescription:
        "Bench testing for black screen, green lines, flicker, partial touch failure, pressure marks, or uncertain impact damage.",
      bestFor:
        "Phones where the display fault may be linked to frame damage, liquid exposure, camera area damage, or another internal fault.",
      notes:
        "If a screen assembly will not solve the issue, we explain the next likely fault before any extra work.",
    },
  ],
  commonProblems: [
    {
      title: "Cracked glass with working touch",
      description:
        "The phone may still unlock and swipe, but glass flakes, lifted corners, and pressure on the OLED layer can worsen after continued use.",
    },
    {
      title: "Green lines, flicker, or black screen",
      description:
        "OLED faults can appear after a drop even when the outside glass is not badly shattered. We test display output before quoting.",
    },
    {
      title: "Touch dead zones",
      description:
        "A damaged digitizer can leave parts of the display unresponsive. We test touch across the full panel before and after fitting.",
    },
    {
      title: "Top sensor and Face ID area risk",
      description:
        "Impact around the earpiece, front camera, or sensor area can affect Face ID-related behaviour. We inspect that area before repair.",
    },
    {
      title: "Frame bend or lifted screen edge",
      description:
        "A small housing bend can stop a replacement display from sitting cleanly, so frame fit is checked before the screen is installed.",
    },
    {
      title: "True Tone and display message checks",
      description:
        "Where supported, display data and True Tone behaviour are checked carefully. Some iOS display messages can depend on part type and device pairing.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Inspect glass, OLED, and housing fit",
      description:
        "We check cracks, display lines, pressure marks, lifted corners, frame bends, and whether the device is safe to open.",
    },
    {
      step: "02",
      title: "Test touch, Face ID area, and sensors",
      description:
        "Before quoting, we test touch response, front camera area, proximity behaviour, earpiece mesh, and visible liquid indicators.",
    },
    {
      step: "03",
      title: "Confirm display tier and limitations",
      description:
        "We explain the available screen option, part availability, warranty limits, iOS display message considerations, and expected repair time before work begins.",
    },
    {
      step: "04",
      title: "Final handover checks",
      description:
        "After fitting, we test brightness, colour, touch, charging, cameras, speaker, microphone, buttons, and normal operation before return.",
    },
  ],
  faq: [
    { question: "How long does iPhone 13 screen replacement usually take?", answer: "Timing depends on part availability and device condition. We confirm the estimated turnaround after a quick inspection at our Ringwood store. Many common screen repairs can be completed quickly when the right part is in stock." },
    { question: "Will I lose my photos or data during the screen repair?", answer: "Your data is normally not affected by a screen replacement. However, we recommend backing up your iPhone 13 to iCloud or a computer before bringing it in, as a precaution." },
    { question: "How much will my iPhone 13 screen repair cost?", answer: "The final quote depends on the display option, model, parts availability and device condition. We confirm the price with you before any repair work begins." },
    { question: "What screen quality options are available?", answer: "Available display options can vary by model and stock. We explain the suitable screen options for your iPhone 13 before repair, including differences in display quality, touch feel and budget." },
    { question: "Will my iPhone 13 still be water resistant after the screen is fixed?", answer: "We reseal the device carefully after opening it. However, factory water resistance cannot be guaranteed after any phone has been opened, so we recommend keeping your repaired iPhone away from water." },
    { question: "Will Face ID still work after screen replacement?", answer: "Face ID usually depends on the original sensor assembly, not only the screen. If the top sensor area was damaged by the impact, we will check it before and after the repair and explain any issue we find." },
    { question: "Do you test the screen before returning the phone?", answer: "Yes. We run standard post-repair checks, including touch response, brightness, display colour, speaker area, front sensor area and general screen fit before handover." },
    { question: "Will True Tone still work after the repair?", answer: "Where supported, we try to preserve True Tone by transferring compatible display data. This depends on the chosen screen option and whether the original display data is still readable." },
    { question: "Is there warranty support for iPhone 13 screen replacement?", answer: "Warranty support is available on eligible screen repairs. It does not cover new physical damage, pressure damage or liquid damage after the repair. We explain the applicable warranty terms before you proceed." },
    { question: "Do I need to book, or can I walk in?", answer: "Walk-ins are welcome at our Ringwood Square repair desk. Booking ahead is recommended because it helps us check part availability for your exact iPhone model before you visit." },
  ],
};

const IPHONE_13_BATTERY_REPLACEMENT_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 battery replacement in Ringwood? Ali Mobile & Repair checks battery health, shutdown behaviour, swelling risk, charge draw, iOS battery message expectations, and post-repair capacity calibration before handover.",
  workbenchHeadings: {
    options: "Which battery service path fits this iPhone 13?",
    diagnostics: "What do we test before battery replacement?",
    symptoms: "Which battery symptoms matter most?",
    outcomes: "What can affect battery calibration?",
  },
  repairOptions: [
    {
      name: "Battery health diagnosis",
      shortDescription:
        "We check Battery Health, cycle behaviour, unexpected shutdowns, heat, swelling signs, and charge acceptance before opening the iPhone 13.",
      bestFor:
        "Customers seeing fast drain, low battery health, sudden power drops, slow charging, or a phone that no longer lasts through the day.",
      notes:
        "A charging-port or board issue can look like battery failure, so we test the power path before quoting the replacement.",
    },
    {
      name: "Model-matched battery replacement",
      shortDescription:
        "We fit a battery matched to the iPhone 13 power requirements and explain realistic capacity expectations before the repair starts.",
      bestFor:
        "Customers who want stable daily runtime without inflated capacity claims or unclear part behaviour.",
      notes:
        "Recent iPhones can show iOS battery messages after replacement depending on part pairing and system history.",
    },
    {
      name: "Calibration and handover testing",
      shortDescription:
        "After fitting, we confirm boot stability, cable charging, charging draw, percentage reporting, and practical calibration guidance.",
      bestFor:
        "Customers who want the phone tested before handover rather than just having a part installed.",
      notes:
        "Battery percentage and health reporting can settle over the next few charge cycles after service.",
    },
  ],
  commonProblems: [
    {
      title: "Fast drain or low Battery Health",
      description:
        "A worn iPhone 13 battery can drop percentage quickly, struggle under load, or show service messages in Battery Health.",
    },
    {
      title: "Unexpected shutdowns",
      description:
        "If the battery can no longer hold stable voltage, the phone may shut down even when the displayed percentage is not empty.",
    },
    {
      title: "Swelling or lifted display risk",
      description:
        "Battery swelling can press against the display and frame. We check for pressure signs before the phone is opened.",
    },
    {
      title: "Charging fault mimic",
      description:
        "Lint, charging-port wear, cable issues, or board faults can mimic battery failure, so charging behaviour is tested first.",
    },
    {
      title: "iOS battery message behaviour",
      description:
        "An iPhone 13 may show a battery part message after replacement depending on pairing history, even when charging and runtime are normal.",
    },
    {
      title: "Capacity reading settle time",
      description:
        "Battery percentage and health reporting can take a few charge cycles to settle after service, so we explain what to expect at handover.",
    },
    {
      title: "Heat or board-level power draw",
      description:
        "If the phone still drains quickly after a known-good battery, extra heat or board-level current draw may be the next diagnostic path.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Battery Health and symptom check",
      description:
        "We review Battery Health, service messages, shutdown behaviour, heat, swelling signs, and customer-reported runtime issues.",
    },
    {
      step: "02",
      title: "Charging path validation",
      description:
        "We test cable fit, charge draw, adapter response, and whether the fault points to battery wear or another power-path issue.",
    },
    {
      step: "03",
      title: "iOS message explanation",
      description:
        "Before fitting, we explain how iOS battery part messages can appear on iPhone 13 models depending on part pairing and device history.",
    },
    {
      step: "04",
      title: "Capacity calibration handover",
      description:
        "After replacement, we test stable charging and explain the charge-cycle behaviour customers may see while the battery reading settles.",
    },
  ],
  faq: [
    {
      question: "Will my iPhone 13 show an 'Unknown Part' warning after a battery replacement at Ali Mobile Ringwood?",
      answer:
        "Some iPhone 13 devices can show an iOS battery message after battery replacement because Apple pairs certain parts to the phone. We explain the expected message behaviour before repair. The phone can still charge, run, and be tested normally after service.",
    },
    {
      question: "How does Ali Mobile handle the iPhone 13 battery health percentage calibration?",
      answer:
        "We test charge draw, boot stability, and battery reporting after fitting. Battery percentage and health readings can settle over the next few charge cycles, so we give clear handover guidance for charging, draining, and rechecking the reading.",
    },
    {
      question: "Do you use high-capacity cells for iPhone 13 battery service in Ringwood?",
      answer:
        "We use premium, model-matched iPhone 13 battery cells selected for stable output and safe fit rather than exaggerated capacity labels. If a higher-capacity option is available, we explain the trade-offs before you approve the repair.",
    },
    {
      question: "Can Ali Mobile replace my iPhone 13 battery the same day in Ringwood?",
      answer:
        "Same-day battery replacement may be available at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 when the correct battery is in stock and there is no hidden liquid, charging-port, or board damage.",
    },
    {
      question: "What battery symptoms should I check before visiting?",
      answer:
        "Fast drain, sudden shutdowns, heat, swelling, slow charging, and Battery Health service messages are common signs. We still test first because charging-port and board faults can look like battery failure.",
    },
  ],
};

const IPHONE_13_CHARGING_PORT_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 charging port repair in Ringwood? Ali Mobile & Repair checks lint blockage, Lightning tail-plug wear, charge draw, microphone routing, speaker behaviour, data connection, and accessory detection before quoting.",
  workbenchHeadings: {
    options: "Which charging-port path fits this iPhone 13?",
    diagnostics: "What do we test before port repair?",
    symptoms: "Which charging symptoms matter most?",
    outcomes: "What can affect charging-port results?",
  },
  repairOptions: [
    {
      name: "Lint clean and cable-seat check",
      shortDescription:
        "We inspect the Lightning socket for compacted lint, debris, corrosion, or a cable that no longer seats fully.",
      bestFor:
        "Phones that only charge at an angle, feel loose when plugged in, or started failing after pocket lint built up.",
      notes:
        "If cleaning solves the fault, we do not push a full flex replacement.",
    },
    {
      name: "Tail-plug flex replacement",
      shortDescription:
        "If the port pins, flex cable, or internal connector path has failed, we quote a full charging-port assembly repair.",
      bestFor:
        "Phones with worn pins, liquid residue, no wired charging, intermittent data connection, or microphone issues linked to the lower assembly.",
      notes:
        "We handle the lower assembly carefully because charging, microphone, speaker, and accessory behaviour can overlap.",
    },
    {
      name: "Board-level power diagnosis",
      shortDescription:
        "When a new port will not solve the issue, we explain the likely charging IC or board-level path before extra work.",
      bestFor:
        "Phones that do not respond to known-good cables, batteries, or port assemblies.",
      notes:
        "Micro-soldering work is quoted separately after the port-level fault is ruled out.",
    },
  ],
  commonProblems: [
    {
      title: "Cable only works at one angle",
      description:
        "This is often lint or worn Lightning contacts. We inspect the socket before recommending a replacement.",
    },
    {
      title: "No wired charging",
      description:
        "A failed tail-plug flex, battery issue, cable fault, or board-level charging fault can all cause no-charge behaviour.",
    },
    {
      title: "Computer does not detect the phone",
      description:
        "Data connection is validated because a phone can charge while still failing USB data communication.",
    },
    {
      title: "Microphone or accessory faults",
      description:
        "Lower assembly faults can affect microphone routing and compatible Lightning accessory detection.",
    },
    {
      title: "Liquid or corrosion in the port",
      description:
        "Green residue, blackened pins, or moisture history can change the repair from cleaning to replacement or board assessment.",
    },
    {
      title: "Charging IC or board-level failure",
      description:
        "If port and battery tests pass but charging remains unstable, a board-level charging path may need micro-soldering diagnosis.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Inspect socket and cable fit",
      description:
        "We check debris, pin condition, cable seating depth, corrosion, and whether known-good cables behave differently.",
    },
    {
      step: "02",
      title: "Measure charging response",
      description:
        "We test charge draw, adapter response, battery state, and whether the fault follows the port, battery, or board.",
    },
    {
      step: "03",
      title: "Validate audio and data functions",
      description:
        "Microphones, speaker behaviour, data connection, and supported Lightning accessories are checked before handover.",
    },
    {
      step: "04",
      title: "Explain replacement or board path",
      description:
        "If cleaning is not enough, we quote the flex replacement or explain why board-level work is the next step.",
    },
  ],
  faq: [
    {
      question: "Does my iPhone 13 charging port need cleaning or replacement?",
      answer:
        "Not always. Many iPhone 13 charging issues are caused by compacted lint that stops the cable seating. We inspect and clean the port first where safe, then quote flex replacement only if the pins or assembly are damaged.",
    },
    {
      question: "Can you replace an iPhone 13 charging port the same day in Ringwood?",
      answer:
        "Same-day charging port repair may be available when the correct part is in stock and the fault is limited to the lower port assembly.",
    },
    {
      question: "Do you test data connection after iPhone 13 charging port repair?",
      answer:
        "Yes. We test wired charging, cable fit, USB data connection, microphone behaviour, speaker output, and compatible Lightning accessory detection before handover.",
    },
    {
      question: "What if the iPhone 13 charging fault is board-level?",
      answer:
        "If cleaning or flex replacement will not solve the charging issue, we explain the likely board-level fault and micro-soldering path before any extra work is approved.",
    },
  ],
};

const IPHONE_13_BACK_HOUSING_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 back glass or rear housing repair in Ringwood? Ali Mobile & Repair checks cracked rear glass, camera ring fit, wireless charging coil protection, MagSafe alignment, and frame straightness before bonding.",
  workbenchHeadings: {
    options: "Which rear-housing path fits this iPhone 13?",
    diagnostics: "What do we inspect before rear repair?",
    symptoms: "Which back-glass symptoms matter most?",
    outcomes: "What can affect rear-glass alignment?",
  },
  repairOptions: [
    {
      name: "Rear glass replacement path",
      shortDescription:
        "For cracked rear glass with a usable frame, we focus on controlled removal, adhesive cleanup, and clean rear panel bonding.",
      bestFor:
        "Phones with cracked rear glass but stable side rails, working cameras, and no severe housing bend.",
      notes:
        "We protect the MagSafe and wireless charging coil area throughout the repair.",
    },
    {
      name: "Housing condition assessment",
      shortDescription:
        "If the frame is bent or crushed, we check whether rear glass alone will sit correctly before quoting.",
      bestFor:
        "Phones with corner dents, lifted back glass, camera ring gaps, or frame distortion after impact.",
      notes:
        "A bent frame can cause lifting or uneven bonding if it is ignored.",
    },
    {
      name: "Camera and coil validation",
      shortDescription:
        "After repair, we check camera ring seating, wireless charging, MagSafe alignment, buttons, and frame edges.",
      bestFor:
        "Customers who want a clean cosmetic finish plus functional wireless charging checks.",
      notes:
        "Existing impact damage to the coil or camera area is explained before final repair approval.",
    },
  ],
  commonProblems: [
    {
      title: "Cracked rear glass",
      description:
        "Broken back glass can shed sharp flakes and allow dust or moisture into the rear housing area.",
    },
    {
      title: "Wireless charging inconsistency",
      description:
        "Impact near the MagSafe coil can affect wireless charging, so we test it before and after repair.",
    },
    {
      title: "Camera ring gaps",
      description:
        "Cracks around the camera island need careful cleanup so the replacement panel sits cleanly.",
    },
    {
      title: "Frame bend or crushed corner",
      description:
        "A small housing bend can stop the rear panel from bonding flat or cause later lifting.",
    },
    {
      title: "Adhesive channel contamination",
      description:
        "Old adhesive, glass dust, and impact residue must be cleared for a stable rear bond.",
    },
    {
      title: "MagSafe alignment sensitivity",
      description:
        "Wireless charging and MagSafe behaviour depend on the coil area staying protected and correctly aligned.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Inspect rear glass and frame",
      description:
        "We check cracks, lifted corners, camera area damage, side rail bends, and whether the phone is safe to open.",
    },
    {
      step: "02",
      title: "Protect coil and camera area",
      description:
        "The wireless charging coil, MagSafe area, camera rings, and rear microphone area are handled carefully during removal.",
    },
    {
      step: "03",
      title: "Clean and align before bonding",
      description:
        "We clear adhesive channels and glass residue, then check rear panel fit before final bonding.",
    },
    {
      step: "04",
      title: "Final function checks",
      description:
        "Wireless charging, camera fit, button feel, frame edges, and normal handling are checked before return.",
    },
  ],
  faq: [
    {
      question: "Can you repair cracked iPhone 13 back glass in Ringwood?",
      answer:
        "Yes. We handle iPhone 13 rear glass and back housing repair with controlled removal, adhesive cleanup, camera ring checks, and final frame alignment before handover.",
    },
    {
      question: "Will iPhone 13 back glass repair affect wireless charging?",
      answer:
        "We protect the wireless charging coil and MagSafe area during the repair, then test wireless charging before return. Existing impact damage can still affect the coil, so we inspect first.",
    },
    {
      question: "Do you check frame alignment before iPhone 13 rear glass repair?",
      answer:
        "Yes. A bent frame can stop the rear glass from sitting flush, so we check corners, camera area, and side rails before bonding.",
    },
    {
      question: "How long does iPhone 13 back glass repair take?",
      answer:
        "Timing depends on rear glass damage, frame condition, and part availability. We confirm the expected turnaround after inspecting the phone at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    },
  ],
};

const IPHONE_13_CAMERA_REPAIR_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 camera repair in Ringwood? Ali Mobile & Repair checks rear camera focus, front camera behaviour, lens glass, camera ring impact, Face ID area risk, dust spots, and app-level camera faults before quoting.",
  workbenchHeadings: {
    options: "Which camera repair path fits this iPhone 13?",
    diagnostics: "What do we test before camera repair?",
    symptoms: "Which camera symptoms matter most?",
    outcomes: "What can affect camera repair results?",
  },
  repairOptions: [
    {
      name: "Rear camera module diagnosis",
      shortDescription:
        "We check focus, shaking, black camera view, exposure, lens switching, and whether impact damaged the rear module.",
      bestFor:
        "Phones with blurry photos, vibrating camera, black camera preview, or rear camera failure after a drop.",
      notes:
        "Lens glass and housing damage are checked because they can mimic camera module faults.",
    },
    {
      name: "Front camera and Face ID area check",
      shortDescription:
        "We inspect selfie camera behaviour, proximity area, earpiece mesh condition, and Face ID-related risk before quoting.",
      bestFor:
        "Phones with front camera faults, portrait mode problems, or impact near the top sensor area.",
      notes:
        "Some Face ID-related faults need separate assessment because the sensor area is paired and delicate.",
    },
    {
      name: "Lens glass and dust assessment",
      shortDescription:
        "We check cracked lens glass, dust spots, fogging, and whether cleaning or part replacement is the right path.",
      bestFor:
        "Customers seeing haze, spots, glare, or cracked camera lens glass.",
      notes:
        "If moisture entered through broken lens glass, we explain the extra risk before repair.",
    },
  ],
  commonProblems: [
    {
      title: "Blurry or shaking rear camera",
      description:
        "Impact can damage stabilisation or focus behaviour, causing vibration, clicking, or blurry photos.",
    },
    {
      title: "Black camera preview",
      description:
        "A black screen in the Camera app can come from a module fault, connector issue, or board-level fault.",
    },
    {
      title: "Cracked lens glass",
      description:
        "Broken lens glass can create glare, dust spots, and moisture entry even if the camera still opens.",
    },
    {
      title: "Front camera or Face ID area impact",
      description:
        "Damage near the top sensor area can affect front camera behaviour and Face ID-related functions.",
    },
    {
      title: "Dust, fog, or moisture marks",
      description:
        "Dust or fog inside the camera area can point to cracked glass, seal damage, or prior liquid exposure.",
    },
    {
      title: "Software versus hardware fault",
      description:
        "We test camera behaviour across modes because app glitches and hardware faults can look similar at first.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Test camera modes",
      description:
        "We check photo, video, portrait, zoom, flash, focus, exposure, and lens switching behaviour.",
    },
    {
      step: "02",
      title: "Inspect lens and housing",
      description:
        "Lens glass, camera rings, rear housing damage, dust, fogging, and impact signs are checked before quoting.",
    },
    {
      step: "03",
      title: "Check front camera risk",
      description:
        "For front camera issues, we inspect the top sensor area and explain Face ID-related limitations before work.",
    },
    {
      step: "04",
      title: "Confirm final camera function",
      description:
        "After repair, we retest focus, image clarity, video, flash, front camera, and normal app behaviour.",
    },
  ],
  faq: [
    {
      question: "Can you fix an iPhone 13 camera that is blurry or shaking?",
      answer:
        "Yes. We test focus, stabilisation, lens switching, and camera app behaviour to confirm whether the rear camera module, lens glass, or another fault is causing the issue.",
    },
    {
      question: "Do you repair cracked iPhone 13 camera lens glass?",
      answer:
        "Yes. We inspect the lens glass, camera ring, dust, fogging, and rear housing condition before confirming the repair path.",
    },
    {
      question: "Will front camera repair affect Face ID?",
      answer:
        "The Face ID area is delicate and can be affected by impact or prior damage. We inspect and explain any Face ID-related risk before front camera work begins.",
    },
    {
      question: "Can iPhone 13 camera repair be done same day in Ringwood?",
      answer:
        "Same-day camera repair may be available when the correct part is in stock and no hidden board or liquid damage is found.",
    },
  ],
};

const IPHONE_13_WATER_DAMAGE_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 water damage assessment in Ringwood? Ali Mobile & Repair prioritises fast triage, safe disassembly, corrosion cleaning, board inspection, data-preservation awareness, and clear reporting before major part replacement.",
  workbenchHeadings: {
    options: "Which water-damage path fits this iPhone 13?",
    diagnostics: "What do we inspect after liquid exposure?",
    symptoms: "Which liquid-damage symptoms matter most?",
    outcomes: "What can affect water-damage recovery?",
  },
  repairOptions: [
    {
      name: "Immediate liquid triage",
      shortDescription:
        "We assess power state, liquid indicators, corrosion risk, charging safety, and whether the phone should stay powered off.",
      bestFor:
        "Phones exposed to water, drinks, rain, pool water, or humidity that now show unstable behaviour.",
      notes:
        "Do not charge a liquid-exposed iPhone before assessment because it can worsen corrosion or shorts.",
    },
    {
      name: "Internal cleaning and drying",
      shortDescription:
        "The phone is opened, inspected, dried, and cleaned where corrosion is visible before part decisions are made.",
      bestFor:
        "Phones that still have data value or uncertain fault spread after liquid exposure.",
      notes:
        "Water damage recovery is unpredictable, so we explain limitations before major replacement work.",
    },
    {
      name: "Part and board assessment",
      shortDescription:
        "After cleaning, we test screen, battery, cameras, charging, speakers, and board stability to identify the next repair path.",
      bestFor:
        "Phones with no power, display faults, charging faults, speaker issues, or random restarts after liquid exposure.",
      notes:
        "Replacement parts can carry their own warranty, but liquid-damaged devices cannot be guaranteed like standard repairs.",
    },
  ],
  commonProblems: [
    {
      title: "No power after liquid exposure",
      description:
        "A no-power iPhone 13 may have battery, screen, connector, or board-level corrosion damage.",
    },
    {
      title: "Charging after water exposure",
      description:
        "Charging a wet phone can create shorts, so we check the port and board before any power testing.",
    },
    {
      title: "Display, speaker, or camera instability",
      description:
        "Liquid can affect multiple functions at once, so each module is tested after cleaning.",
    },
    {
      title: "Corrosion that grows over time",
      description:
        "Even if the phone works today, residue can continue corroding connectors and board areas later.",
    },
    {
      title: "Data recovery priority",
      description:
        "If photos or data matter most, we prioritise stabilising the device enough to back up before cosmetic decisions.",
    },
    {
      title: "Warranty limitations",
      description:
        "Liquid-damaged devices are less predictable than standard repairs, so we separate cleaning labour from any replaced-part warranty.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Confirm exposure and power risk",
      description:
        "We ask what liquid was involved, when it happened, whether it was charged, and what symptoms appeared first.",
    },
    {
      step: "02",
      title: "Open and inspect indicators",
      description:
        "Visible moisture, liquid indicators, corrosion, connector residue, and board areas are inspected before quoting parts.",
    },
    {
      step: "03",
      title: "Clean and stabilise",
      description:
        "Where appropriate, we clean corrosion and dry the device before testing modules and board stability.",
    },
    {
      step: "04",
      title: "Report repair options",
      description:
        "We explain what recovered, what remains risky, and which parts or board work would be needed next.",
    },
  ],
  faq: [
    {
      question: "What should I do first if my iPhone 13 gets wet?",
      answer:
        "Power it off if possible, do not charge it, and bring it in quickly. Charging after liquid exposure can worsen shorts or corrosion.",
    },
    {
      question: "Can Ali Mobile recover data from a water-damaged iPhone 13?",
      answer:
        "If data matters most, we prioritise stabilising the phone enough for backup where possible. Success depends on corrosion level, board condition, and how quickly the device is assessed.",
    },
    {
      question: "Is iPhone 13 water damage repair covered by the normal warranty?",
      answer:
        "Water damage recovery is unpredictable, so the cleaning and rescue work does not carry the same warranty as a standard part replacement. Any specific replaced part may have its own warranty if the rest of the phone remains stable.",
    },
    {
      question: "How long does iPhone 13 water damage assessment take in Ringwood?",
      answer:
        "Initial assessment can often begin the same day. Full recovery timing depends on corrosion, drying, cleaning, and whether parts or board-level work are required.",
    },
  ],
};

const IPHONE_REPAIR_POCKET_TEMPLATE_BY_TYPE: Record<string, RepairTypeSeoPocket> = {
  "screen-replacement": IPHONE_13_SCREEN_REPLACEMENT_SEO_POCKET,
  "battery-replacement": IPHONE_13_BATTERY_REPLACEMENT_SEO_POCKET,
  "charging-port-replacement": IPHONE_13_CHARGING_PORT_SEO_POCKET,
  "charging-port-repair": IPHONE_13_CHARGING_PORT_SEO_POCKET,
  "back-housing-replacement": IPHONE_13_BACK_HOUSING_SEO_POCKET,
  "back-glass-repair": IPHONE_13_BACK_HOUSING_SEO_POCKET,
  "rear-glass-repair": IPHONE_13_BACK_HOUSING_SEO_POCKET,
  "camera-repair": IPHONE_13_CAMERA_REPAIR_SEO_POCKET,
  "front-camera-replacement": IPHONE_13_CAMERA_REPAIR_SEO_POCKET,
  "back-camera-replacement": IPHONE_13_CAMERA_REPAIR_SEO_POCKET,
  "water-damage-repair": IPHONE_13_WATER_DAMAGE_SEO_POCKET,
};

const UPPERCASE_IPHONE_MODEL_TOKENS = new Set(["se", "x", "xr", "xs"]);
const TITLECASE_IPHONE_MODEL_TOKENS = new Set(["mini", "plus", "pro", "max", "ultra"]);

interface IPhoneHardwareProfile {
  generation: number | null;
  hasOledDisplay: boolean;
  hasMagSafe: boolean;
  chargingPort: "lightning" | "usb-c";
  hasFaceId: boolean;
}

function replaceText(value: string, from: string, to: string): string {
  return value.split(from).join(to);
}

function deriveIphoneModelNameFromSlug(modelSlug: string): string | null {
  const normalizedModelSlug = slugify(modelSlug);
  if (!normalizedModelSlug.startsWith("iphone-")) return null;

  const modelSuffix = normalizedModelSlug.slice("iphone-".length);
  if (!modelSuffix) return "iPhone";

  const formattedTokens = modelSuffix
    .split("-")
    .filter(Boolean)
    .map((token) => {
      if (/^\d+$/.test(token)) return token;
      if (/^\d+(st|nd|rd|th)$/i.test(token)) return token.toLowerCase();
      if (UPPERCASE_IPHONE_MODEL_TOKENS.has(token)) return token.toUpperCase();
      if (TITLECASE_IPHONE_MODEL_TOKENS.has(token)) {
        return token.charAt(0).toUpperCase() + token.slice(1);
      }

      return token.charAt(0).toUpperCase() + token.slice(1);
    });

  return `iPhone ${formattedTokens.join(" ")}`;
}

const LCD_IPHONE_MODEL_SLUGS = new Set([
  "iphone-6",
  "iphone-6-plus",
  "iphone-6s",
  "iphone-6s-plus",
  "iphone-7",
  "iphone-7-plus",
  "iphone-8",
  "iphone-8-plus",
  "iphone-se",
  "iphone-se-2",
  "iphone-se-3",
  "iphone-xr",
  "iphone-11",
]);

const OLED_IPHONE_MODEL_SLUGS = new Set([
  "iphone-x",
  "iphone-xs",
  "iphone-xs-max",
  "iphone-11-pro",
  "iphone-11-pro-max",
]);

const FACE_ID_IPHONE_MODEL_SLUGS = new Set([
  "iphone-x",
  "iphone-xr",
  "iphone-xs",
  "iphone-xs-max",
  "iphone-11",
  "iphone-11-pro",
  "iphone-11-pro-max",
]);

function getIPhoneHardwareProfile(modelSlug: string): IPhoneHardwareProfile {
  const normalizedModelSlug = slugify(modelSlug);
  const numberedMatch = normalizedModelSlug.match(/^iphone-(\d+)/);
  const generation = numberedMatch ? Number(numberedMatch[1]) : null;
  const isSEFamily = normalizedModelSlug.startsWith("iphone-se");
  const inferredModernSeries = generation !== null && generation >= 12;

  const hasOledDisplay = LCD_IPHONE_MODEL_SLUGS.has(normalizedModelSlug)
    ? false
    : OLED_IPHONE_MODEL_SLUGS.has(normalizedModelSlug) || inferredModernSeries;

  const hasMagSafe = inferredModernSeries && !isSEFamily;
  const chargingPort: "lightning" | "usb-c" = generation !== null && generation >= 15 && !isSEFamily
    ? "usb-c"
    : "lightning";

  const hasFaceId = FACE_ID_IPHONE_MODEL_SLUGS.has(normalizedModelSlug) || inferredModernSeries;

  return {
    generation,
    hasOledDisplay,
    hasMagSafe,
    chargingPort,
    hasFaceId,
  };
}

function applyIPhoneAccuracyRules(
  pocket: RepairTypeSeoPocket,
  modelName: string,
  repairType: string,
  modelSlug: string
): RepairTypeSeoPocket {
  const profile = getIPhoneHardwareProfile(modelSlug);
  const normalizedRepairType = slugify(repairType);
  let adjustedPocket = pocket;

  if (normalizedRepairType === "screen-replacement" && !profile.hasOledDisplay) {
    adjustedPocket = {
      ...adjustedPocket,
      quickAnswer: adjustedPocket.quickAnswer
        .replace("OLED faults", "display faults")
        .replace("and display option availability", "and LCD option availability"),
      repairOptions: adjustedPocket.repairOptions.map((option, index) => {
        if (index !== 1) return option;

        return {
          ...option,
          name: "Premium LCD path",
          shortDescription:
            `A higher-grade LCD option for customers who care about colour consistency, responsive touch, and a stable display experience on ${modelName}.`,
          bestFor:
            `Customers who use their ${modelName} heavily for photos, maps, work apps, videos, and daily messaging.`,
          notes:
            "A bent frame can stress a fresh display assembly, so we inspect the housing carefully before fitting.",
        };
      }),
      commonProblems: adjustedPocket.commonProblems.map((problem) => {
        if (problem.title !== "Green lines, flicker, or black screen") return problem;

        return {
          title: "Flicker, blank screen, or image issues",
          description:
            "Display faults can appear after a drop even when the outside glass is not badly shattered. We test output, backlight behaviour, and touch response before quoting.",
        };
      }),
      faq: adjustedPocket.faq.map((item) => {
        if (!item.question.includes("green lines, flicker, or a black screen")) return item;

        return {
          ...item,
          question: item.question.replace("green lines, flicker, or a black screen", "flicker, blank display, or touch failure"),
        };
      }),
    };

    adjustedPocket = {
      ...adjustedPocket,
      quickAnswer: replaceText(adjustedPocket.quickAnswer, "OLED", "LCD"),
      repairOptions: adjustedPocket.repairOptions.map((option) => ({
        ...option,
        name: replaceText(option.name, "OLED", "LCD"),
        shortDescription: replaceText(
          replaceText(option.shortDescription, "black screen, green lines, flicker, partial touch failure", "blank display, flicker, partial touch failure"),
          "OLED",
          "LCD"
        ),
        bestFor: replaceText(option.bestFor, "OLED", "LCD"),
        notes: replaceText(option.notes, "OLED", "LCD"),
      })),
      commonProblems: adjustedPocket.commonProblems.map((problem) => ({
        title: replaceText(problem.title, "OLED", "LCD"),
        description: replaceText(problem.description, "OLED layer", "display layer"),
      })),
      diagnosticSteps: adjustedPocket.diagnosticSteps.map((step) => ({
        ...step,
        title: replaceText(step.title, "OLED", "display"),
        description: replaceText(step.description, "OLED", "LCD"),
      })),
      faq: adjustedPocket.faq.map((item) => ({
        question: replaceText(item.question, "OLED", "LCD"),
        answer: replaceText(
          replaceText(
            replaceText(item.answer, "Green lines, flicker, black display, and touch dead zones", "Flicker, blank display, and touch dead zones"),
            "common OLED or digitizer symptoms",
            "common display or digitizer symptoms"
          ),
          "OLED",
          "LCD"
        ),
      })),
    };

    adjustedPocket = JSON.parse(
      JSON.stringify(adjustedPocket)
        .split("Green lines")
        .join("Display lines")
        .split("green lines")
        .join("display lines")
    ) as RepairTypeSeoPocket;
  }

  if (
    (normalizedRepairType === "back-housing-replacement" ||
      normalizedRepairType === "back-glass-repair" ||
      normalizedRepairType === "rear-glass-repair") &&
    !profile.hasMagSafe
  ) {
    adjustedPocket = {
      ...adjustedPocket,
      quickAnswer: adjustedPocket.quickAnswer.replace(", MagSafe alignment,", ", wireless charging area alignment,"),
      repairOptions: adjustedPocket.repairOptions.map((option) => ({
        ...option,
        shortDescription: replaceText(option.shortDescription, "MagSafe", "wireless charging"),
        notes: replaceText(option.notes, "MagSafe", "wireless charging"),
      })),
      diagnosticSteps: adjustedPocket.diagnosticSteps.map((step) => ({
        ...step,
        description: step.description.replace("MagSafe", "wireless charging"),
      })),
      commonProblems: adjustedPocket.commonProblems.map((problem) => ({
        ...problem,
        title: problem.title.replace("MagSafe", "wireless charging"),
        description: problem.description.replace("MagSafe", "wireless charging"),
      })),
      faq: adjustedPocket.faq.map((item) => ({
        ...item,
        question: item.question.replace("MagSafe", "wireless charging"),
        answer: item.answer.replace("MagSafe", "wireless charging"),
      })),
    };

    adjustedPocket = {
      ...adjustedPocket,
      commonProblems: adjustedPocket.commonProblems.map((problem) => ({
        ...problem,
        description: replaceText(
          problem.description,
          "wireless charging and wireless charging behaviour",
          "wireless charging behaviour"
        ),
      })),
    };
  }

  if (
    (normalizedRepairType === "charging-port-repair" || normalizedRepairType === "charging-port-replacement") &&
    profile.chargingPort === "usb-c"
  ) {
    adjustedPocket = {
      ...adjustedPocket,
      quickAnswer: adjustedPocket.quickAnswer.replace("Lightning", "USB-C"),
      repairOptions: adjustedPocket.repairOptions.map((option) => ({
        ...option,
        shortDescription: option.shortDescription.replace("Lightning", "USB-C"),
        notes: option.notes.replace("Lightning", "USB-C"),
      })),
      commonProblems: adjustedPocket.commonProblems.map((problem) => ({
        ...problem,
        title: problem.title.replace("Lightning", "USB-C"),
        description: problem.description.replace("Lightning", "USB-C"),
      })),
      diagnosticSteps: adjustedPocket.diagnosticSteps.map((step) => ({
        ...step,
        description: step.description.replace("Lightning", "USB-C"),
      })),
      faq: adjustedPocket.faq.map((item) => ({
        ...item,
        question: item.question.replace("charging port", "USB-C port"),
        answer: item.answer.replace("Lightning", "USB-C"),
      })),
    };
  }

  if (!profile.hasFaceId) {
    adjustedPocket = {
      ...adjustedPocket,
      quickAnswer: replaceText(adjustedPocket.quickAnswer, "Face ID area condition", "front sensor area condition"),
      repairOptions: adjustedPocket.repairOptions.map((option) => ({
        ...option,
        shortDescription: replaceText(option.shortDescription, "Face ID", "front sensor"),
        notes: replaceText(option.notes, "Face ID", "front sensor"),
      })),
      commonProblems: adjustedPocket.commonProblems.map((problem) => ({
        title: replaceText(problem.title, "Face ID", "front sensor"),
        description: replaceText(problem.description, "Face ID", "front sensor"),
      })),
      diagnosticSteps: adjustedPocket.diagnosticSteps.map((step) => ({
        ...step,
        title: replaceText(step.title, "Face ID", "front sensor"),
        description: replaceText(step.description, "Face ID", "front sensor"),
      })),
      faq: adjustedPocket.faq.map((item) => ({
        question: replaceText(item.question, "Face ID", "front sensor area"),
        answer: replaceText(item.answer, "Face ID", "front sensor"),
      })),
    };
  }

  return adjustedPocket;
}

function personalizeIphoneRepairPocket(
  pocket: RepairTypeSeoPocket,
  modelName: string,
  repairType: string,
  modelSlug: string
) {
  if (modelName === "iPhone 13") {
    return applyIPhoneAccuracyRules(pocket, modelName, repairType, modelSlug);
  }

  const personalizedPocket = JSON.parse(
    JSON.stringify(pocket).replaceAll("iPhone 13", modelName)
  ) as RepairTypeSeoPocket;

  return applyIPhoneAccuracyRules(personalizedPocket, modelName, repairType, modelSlug);
}

interface SamsungGalaxyHardwareProfile {
  display: string;
  hasSPen: boolean;
  screenForm: "flat" | "edge" | "foldable";
  cameraSummary: string;
  chargingNote: string;
  fingerprintSummary: string;
  fingerprintLabel: string;
  supportsWirelessCharging: boolean;
}

interface AndroidRepairBrandContext {
  brandName: string;
  familyName: string;
}

const SAMSUNG_GALAXY_CONTEXT: AndroidRepairBrandContext = {
  brandName: "Samsung",
  familyName: "Galaxy",
};

const SAMSUNG_NOTE_CONTEXT: AndroidRepairBrandContext = {
  brandName: "Samsung",
  familyName: "Galaxy Note",
};

const SAMSUNG_Z_CONTEXT: AndroidRepairBrandContext = {
  brandName: "Samsung",
  familyName: "Galaxy Z",
};

const GOOGLE_PIXEL_CONTEXT: AndroidRepairBrandContext = {
  brandName: "Google Pixel",
  familyName: "Pixel",
};

const OPPO_CONTEXT: AndroidRepairBrandContext = {
  brandName: "OPPO",
  familyName: "OPPO",
};

function isGalaxySPhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return /^galaxy-s\d/.test(normalized);
}

function deriveSamsungGalaxySModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^galaxy-s(\d+)(.*)$/);

  if (!match) return null;

  const generation = match[1];
  const rawSuffix = match[2];
  const compactE = rawSuffix === "e";
  const tokens = rawSuffix.split("-").filter(Boolean);
  let variantLabel = "";

  if (compactE || tokens.includes("e")) {
    variantLabel = "e";
  } else if (tokens.includes("ultra")) {
    variantLabel = " Ultra";
  } else if (tokens.includes("plus")) {
    variantLabel = "+";
  } else if (tokens.includes("fe")) {
    variantLabel = " FE";
  }

  return `Samsung Galaxy S${generation}${variantLabel}`;
}

function getSamsungGalaxySProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^galaxy-s(\d+)(.*)$/);
  if (!match) return null;

  const generation = Number.parseInt(match[1], 10);
  const rawSuffix = match[2];
  const compactE = rawSuffix === "e";
  const tokens = rawSuffix.split("-").filter(Boolean);
  const isUltra = tokens.includes("ultra");
  const isFE = tokens.includes("fe");
  const isCompactE = compactE || tokens.includes("e");
  const isLegacyEdgeSeries = generation >= 8 && generation <= 10;
  const isEdgeModel = isUltra || isLegacyEdgeSeries;
  const hasSPen = isUltra && generation >= 22;
  const hasRearFingerprint = generation <= 9;
  const hasSideFingerprint = isCompactE && generation >= 10;

  let cameraSummary = "main rear camera testing";
  if (isUltra) {
    cameraSummary = "main, ultra-wide, telephoto, and long-zoom camera testing";
  } else if (generation >= 20 || isFE) {
    cameraSummary = "main, ultra-wide, and telephoto camera testing";
  } else if (isCompactE) {
    cameraSummary = "main and ultra-wide rear camera testing";
  } else if (generation >= 10) {
    cameraSummary = "main and supporting rear camera testing";
  }

  return {
    display: hasSPen
      ? "edge Dynamic AMOLED display with S Pen input support"
      : isEdgeModel
        ? "edge AMOLED display"
        : "flat AMOLED display",
    hasSPen,
    screenForm: isEdgeModel ? "edge" : "flat",
    cameraSummary,
    chargingNote: hasSPen
      ? "USB-C charging, fast wireless charging, Wireless PowerShare, and S Pen handover checks"
      : "USB-C charging, fast wireless charging, and Wireless PowerShare checks",
    fingerprintSummary: hasRearFingerprint
      ? "rear fingerprint sensor behaviour"
      : hasSideFingerprint
        ? "side-mounted fingerprint sensor behaviour"
        : "in-display fingerprint behaviour",
    fingerprintLabel: hasRearFingerprint
      ? "rear fingerprint sensor"
      : hasSideFingerprint
        ? "side-mounted fingerprint sensor"
        : "in-display fingerprint",
    supportsWirelessCharging: true,
  };
}

function isGalaxyAPhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return /^(galaxy-)?a\d{2,3}[a-z]?(-|$)/.test(normalized);
}

function deriveSamsungGalaxyAModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?a(\d{2,3})([a-z]?)(.*)$/);
  if (!match) return null;

  const generation = match[1];
  const letterSuffix = match[2] ? match[2].toLowerCase() : "";
  const suffixTokens = match[3].split("-").filter(Boolean);
  const is5G = suffixTokens.includes("5g");
  const baseModel = `A${generation}${letterSuffix}`;

  return is5G ? `Samsung Galaxy ${baseModel} 5G` : `Samsung Galaxy ${baseModel}`;
}

function getSamsungGalaxyAProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?a(\d{2,3})([a-z]?)(.*)$/);
  if (!match) return null;

  const generation = Number.parseInt(match[1], 10);
  const suffixLetter = match[2] ? match[2].toLowerCase() : "";
  const compactModelKey = `${generation}${suffixLetter}`;

  const lcdModels = new Set([
    "3", "5", "6", "10", "11", "12", "13", "14", "15", "16",
    "20", "21", "22", "23",
  ]);
  const amoledModels = new Set([
    "24", "25", "30", "31", "32", "33", "34", "35", "36",
    "40", "41", "42",
    "50", "51", "52", "52s", "53", "54", "55", "56",
    "70", "71", "72", "73", "74", "80", "82", "90",
  ]);

  const sideFingerprintModels = new Set([
    "3", "5", "6", "10", "11", "12", "13", "14", "15", "16",
    "22", "23", "24", "25",
  ]);
  const rearFingerprintModels = new Set(["20", "21"]);

  let display = "AMOLED or LCD display (variant dependent)";
  if (amoledModels.has(compactModelKey) || (generation >= 30 && !lcdModels.has(compactModelKey))) {
    display = "flat Super AMOLED display";
  } else if (lcdModels.has(compactModelKey)) {
    display = "flat LCD display";
  }

  let fingerprintSummary = "fingerprint sensor behaviour";
  let fingerprintLabel = "fingerprint sensor";
  if (sideFingerprintModels.has(compactModelKey)) {
    fingerprintSummary = "side-mounted fingerprint sensor behaviour";
    fingerprintLabel = "side-mounted fingerprint sensor";
  } else if (rearFingerprintModels.has(compactModelKey)) {
    fingerprintSummary = "rear fingerprint sensor behaviour";
    fingerprintLabel = "rear fingerprint sensor";
  } else if (amoledModels.has(compactModelKey) || generation >= 30 || generation >= 50) {
    fingerprintSummary = "in-display fingerprint sensor behaviour";
    fingerprintLabel = "in-display fingerprint sensor";
  }

  let cameraSummary = "main rear camera testing";
  if (generation >= 50 || generation >= 70) {
    cameraSummary = "main, ultra-wide, and supporting camera testing";
  } else if (generation >= 30 || generation === 24 || generation === 25) {
    cameraSummary = "main and ultra-wide rear camera testing";
  } else if (generation >= 10) {
    cameraSummary = "main and supporting rear camera testing";
  }

  return {
    display,
    hasSPen: false,
    screenForm: "flat",
    cameraSummary,
    chargingNote: "USB-C charging and handover checks",
    fingerprintSummary,
    fingerprintLabel,
    supportsWirelessCharging: false,
  };
}

function formatModelVariantToken(token: string): string {
  if (token === "xl") return "XL";
  if (token === "fe") return "FE";
  if (token === "pro") return "Pro";
  if (token === "plus") return "Plus";
  if (token === "ultra") return "Ultra";
  if (token === "lite") return "Lite";
  if (token === "flip") return "Flip";
  if (token === "fold") return "Fold";
  if (token === "neo") return "Neo";
  if (token === "zoom") return "Zoom";
  if (token === "5g") return "5G";
  return token.charAt(0).toUpperCase() + token.slice(1);
}

function isGalaxyNotePhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return /^(galaxy-)?note-?\d+/.test(normalized);
}

function deriveSamsungGalaxyNoteModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?note-?(\d+)(.*)$/);
  if (!match) return null;

  const generation = match[1];
  const suffixTokens = match[2].split("-").filter(Boolean).map(formatModelVariantToken);
  const suffix = suffixTokens.length ? ` ${suffixTokens.join(" ")}` : "";
  return `Samsung Galaxy Note ${generation}${suffix}`;
}

function getSamsungGalaxyNoteProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?note-?(\d+)(.*)$/);
  if (!match) return null;

  const generation = Number.parseInt(match[1], 10);
  const suffixTokens = match[2].split("-").filter(Boolean);
  const isUltra = suffixTokens.includes("ultra");
  const isPlus = suffixTokens.includes("plus");
  const isLite = suffixTokens.includes("lite");
  const hasRearFingerprint = generation <= 9;
  const isEdgeModel = !isLite && (isUltra || isPlus || generation >= 8);

  return {
    display: isEdgeModel
      ? "edge AMOLED display with S Pen input support"
      : "flat AMOLED display with S Pen input support",
    hasSPen: true,
    screenForm: isEdgeModel ? "edge" : "flat",
    cameraSummary: generation >= 20
      ? "main, ultra-wide, and telephoto camera testing"
      : generation >= 10
        ? "main and supporting rear camera testing"
        : "main rear camera testing",
    chargingNote: "USB-C charging, fast wireless charging, Wireless PowerShare, and S Pen handover checks",
    fingerprintSummary: hasRearFingerprint
      ? "rear fingerprint sensor behaviour"
      : "in-display fingerprint sensor behaviour",
    fingerprintLabel: hasRearFingerprint ? "rear fingerprint sensor" : "in-display fingerprint sensor",
    supportsWirelessCharging: true,
  };
}

function isGalaxyZPhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return /^(galaxy-)?z-(fold|flip)-?\d+/.test(normalized) || /^(galaxy-)?z(fold|flip)\d+/.test(normalized);
}

function deriveSamsungGalaxyZModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?z-?(fold|flip)-?(\d+)(.*)$/);
  if (!match) return null;

  const family = formatModelVariantToken(match[1]);
  const generation = match[2];
  const suffixTokens = match[3].split("-").filter(Boolean).map(formatModelVariantToken);
  const suffix = suffixTokens.length ? ` ${suffixTokens.join(" ")}` : "";
  return `Samsung Galaxy Z ${family} ${generation}${suffix}`;
}

function getSamsungGalaxyZProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?z-?(fold|flip)-?(\d+)(.*)$/);
  if (!match) return null;

  const family = match[1];
  const generation = Number.parseInt(match[2], 10);
  const isFold = family === "fold";
  const hasSPen = isFold && generation >= 3;

  return {
    display: hasSPen
      ? "foldable Dynamic AMOLED display with cover screen and S Pen support"
      : "foldable AMOLED display with cover screen",
    hasSPen,
    screenForm: "foldable",
    cameraSummary: isFold
      ? "main, ultra-wide, and telephoto camera testing"
      : "main and ultra-wide rear camera testing",
    chargingNote: hasSPen
      ? "USB-C charging, fast wireless charging, Wireless PowerShare, and S Pen handover checks"
      : "USB-C charging, fast wireless charging, and Wireless PowerShare checks",
    fingerprintSummary: "side-mounted fingerprint sensor behaviour",
    fingerprintLabel: "side-mounted fingerprint sensor",
    supportsWirelessCharging: true,
  };
}

function isGooglePixelPhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return normalized.startsWith("pixel-") || normalized.startsWith("google-pixel-");
}

function deriveGooglePixelModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug).replace(/^google-/, "");
  if (!normalized.startsWith("pixel-")) return null;

  const tokens = normalized.replace(/^pixel-/, "").split("-").filter(Boolean).map(formatModelVariantToken);
  if (tokens.length === 0) return "Google Pixel";
  return `Google Pixel ${tokens.join(" ")}`;
}

function getGooglePixelProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug).replace(/^google-/, "");
  if (!normalized.startsWith("pixel-")) return null;

  const tokens = normalized.replace(/^pixel-/, "").split("-").filter(Boolean);
  const generationMatch = normalized.match(/pixel-(\d+)/);
  const generation = generationMatch ? Number.parseInt(generationMatch[1], 10) : 0;
  const isFold = tokens.includes("fold");
  const isPro = tokens.includes("pro");
  const isXL = tokens.includes("xl");
  const isA = tokens.includes("a");
  const hasRearFingerprint = !isFold && generation > 0 && generation <= 5;
  const supportsWirelessCharging = isFold
    ? true
    : isA
      ? generation >= 7
      : generation >= 4;

  return {
    display: isFold ? "foldable OLED display with cover screen" : "flat OLED display",
    hasSPen: false,
    screenForm: isFold ? "foldable" : "flat",
    cameraSummary: isFold || isPro || isXL
      ? "main, ultra-wide, and telephoto camera testing"
      : generation >= 6
        ? "main and ultra-wide rear camera testing"
        : "main rear camera testing",
    chargingNote: supportsWirelessCharging
      ? "USB-C charging, wireless charging, and battery-share checks"
      : "USB-C charging and handover checks",
    fingerprintSummary: hasRearFingerprint
      ? "rear fingerprint sensor behaviour"
      : isFold
        ? "side-mounted fingerprint sensor behaviour"
        : "in-display fingerprint sensor behaviour",
    fingerprintLabel: hasRearFingerprint
      ? "rear fingerprint sensor"
      : isFold
        ? "side-mounted fingerprint sensor"
        : "in-display fingerprint sensor",
    supportsWirelessCharging,
  };
}

function isOppoPhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return normalized.startsWith("find-") || normalized.startsWith("reno-") || /^a\d{2,3}/.test(normalized) || normalized.startsWith("oppo-");
}

function deriveOppoModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug).replace(/^oppo-/, "");
  if (!normalized) return null;

  const tokens = normalized.split("-").filter(Boolean);
  if (tokens.length === 0) return "OPPO";

  const modelName = tokens.map((token, idx) => {
    if (idx === 0 && token === "find") return "Find";
    if (idx === 0 && token === "reno") return "Reno";
    if (idx === 0 && /^a\d{2,3}$/.test(token)) return token.toUpperCase();
    return formatModelVariantToken(token);
  }).join(" ");

  return `OPPO ${modelName}`;
}

function getOppoProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug).replace(/^oppo-/, "");
  if (!normalized) return null;

  const tokens = normalized.split("-").filter(Boolean);
  const isFind = tokens.includes("find");
  const isReno = tokens.includes("reno");
  const aMatch = normalized.match(/^a(\d{2,3})/);
  const isASeries = Boolean(aMatch);
  const supportsWirelessCharging = isFind;
  const hasInDisplayFingerprint = isFind || isReno;

  return {
    display: hasInDisplayFingerprint
      ? "flat AMOLED display"
      : isASeries
        ? "AMOLED or LCD display (variant dependent)"
        : "flat LCD display",
    hasSPen: false,
    screenForm: "flat",
    cameraSummary: isFind
      ? "main, ultra-wide, and telephoto camera testing"
      : isReno
        ? "main and ultra-wide rear camera testing"
        : "main and supporting rear camera testing",
    chargingNote: supportsWirelessCharging
      ? "USB-C charging, wireless charging, and fast-charge checks"
      : "USB-C charging and fast-charge checks",
    fingerprintSummary: hasInDisplayFingerprint
      ? "in-display fingerprint sensor behaviour"
      : isASeries
        ? "fingerprint sensor behaviour"
        : "fingerprint sensor behaviour",
    fingerprintLabel: hasInDisplayFingerprint
      ? "in-display fingerprint sensor"
      : isASeries
        ? "fingerprint sensor"
        : "fingerprint sensor",
    supportsWirelessCharging,
  };
}

function buildSamsungS23ScreenPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  const edgeNote = profile.screenForm === "edge"
    ? profile.hasSPen
      ? "The curved edge glass and S Pen digitizer path are checked before fitting so the display sits cleanly and pen input remains stable."
      : "The curved edge glass and side-bond tension are checked before fitting so the display sits cleanly and touch remains stable."
    : profile.screenForm === "foldable"
      ? "Inner display and cover-screen seating are checked before fitting so fold movement, crease area behaviour, and frame pressure stay stable."
      : "The flat frame edge is checked before fitting so the display sits cleanly without corner lift or pressure stress.";
  const panelTerm = profile.display.toLowerCase().includes("lcd") ? "display panel" : "AMOLED panel";

  return {
    quickAnswer:
      `Need ${modelName} screen replacement in Ringwood? Ali Mobile & Repair checks cracked glass, ${profile.display}, touch response, ${profile.fingerprintSummary}, frame alignment, and moisture indicators before quoting.`,
    workbenchHeadings: {
      options: `Which screen path fits this ${modelName}?`,
      diagnostics: `What do we test before ${context.brandName} screen replacement?`,
      symptoms: `Which ${context.familyName} display symptoms matter most?`,
      outcomes: `What can affect the ${context.brandName} display result?`,
    },
    repairOptions: [
      {
        name: "Display assembly diagnosis",
        shortDescription:
          `We test the ${profile.display}, touch layer, brightness, ${profile.fingerprintLabel}, and frame condition before opening the phone.`,
        bestFor:
          "Cracked glass, black display, display lines, flicker, touch dead zones, or a phone that still vibrates but shows no image.",
        notes: edgeNote,
      },
      {
        name: `${context.brandName} display replacement path`,
        shortDescription:
          "A model-matched display assembly path focused on clean fit, stable touch response, and normal daily viewing.",
        bestFor:
          `Customers who want their ${modelName} restored with ${context.brandName}-specific display checks instead of generic phone copy.`,
        notes:
          "We avoid promising factory water resistance after opening, but adhesive cleanup and resealing are handled carefully.",
      },
      {
        name: profile.hasSPen ? "S Pen and sensor validation" : "Fingerprint and sensor validation",
        shortDescription:
          profile.hasSPen
            ? "After display work, we check touch, S Pen input, fingerprint behaviour, cameras, speaker mesh, and charging."
            : "After display work, we check touch, fingerprint behaviour, cameras, speaker mesh, and charging.",
        bestFor:
          "Phones where impact damage may have affected more than the visible glass.",
        notes:
          "If the frame, liquid indicators, or board behaviour point beyond a display assembly, we explain that before extra work.",
      },
    ],
    commonProblems: [
      {
        title: "Cracked glass with working image",
        description:
          "The phone may still work, but glass flakes, lifted edges, or pressure marks can worsen if the display is kept in use.",
      },
      {
        title: "Display lines, flicker, or black screen",
        description:
          `A damaged ${panelTerm} can show lines, flashes, tint shift, or no image after impact. We test output before quoting.`,
      },
      {
        title: "Touch or fingerprint faults",
        description:
          `Touch dead zones and ${profile.fingerprintSummary} are checked before and after display replacement.`,
      },
      {
        title: profile.hasSPen ? "S Pen input faults" : "Frame pressure risk",
        description:
          profile.hasSPen
            ? "The Ultra display path includes S Pen digitizer checks because pen input depends on the display assembly and frame condition."
            : "A bent frame can stress a replacement display, so the frame is inspected before fitting.",
      },
    ],
    diagnosticSteps: [
      {
        step: "01",
        title: "Inspect display and frame",
        description:
          "We check cracks, display output, touch response, pressure marks, corner lift, and frame distortion.",
      },
      {
        step: "02",
        title: profile.hasSPen ? "Test touch, S Pen, and sensors" : `Test touch, ${profile.fingerprintLabel}, and sensors`,
        description:
          profile.hasSPen
            ? "Touch, S Pen input, fingerprint behaviour, front camera area, speaker mesh, and visible moisture indicators are checked."
            : "Touch, fingerprint behaviour, front camera area, speaker mesh, and visible moisture indicators are checked.",
      },
      {
        step: "03",
        title: "Confirm display path",
        description:
          "We explain display availability, frame limitations, adhesive expectations, warranty scope, and expected turnaround before work begins.",
      },
      {
        step: "04",
        title: `Final ${context.brandName} handover checks`,
        description:
          "Brightness, touch, fingerprint, cameras, charging, speaker, microphone, buttons, and normal operation are checked before return.",
      },
    ],
    faq: [
      {
        question: `How long does ${modelName} screen replacement take in Ringwood?`,
        answer:
          `Same-day screen repair may be available when the correct display assembly is in stock and there is no hidden frame, liquid, or board damage.`,
      },
      {
        question: `Do you test fingerprint and touch after ${modelName} screen repair?`,
        answer:
          profile.hasSPen
            ? "Yes. We test touch, S Pen input, in-display fingerprint behaviour, brightness, cameras, charging, and normal phone functions before handover."
            : `Yes. We test touch response, ${profile.fingerprintSummary}, brightness, cameras, charging, and normal phone functions before handover.`,
      },
      {
        question: `Will my ${modelName} stay water resistant after screen replacement?`,
        answer:
          "We clean old adhesive and reseal carefully, but factory water resistance cannot be guaranteed after any opened phone repair.",
      },
    ],
  };
}

function buildSamsungS23BatteryPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  const wirelessContext = profile.supportsWirelessCharging ? ", wireless charging response," : ",";
  const wirelessPath = profile.supportsWirelessCharging ? " and wireless charging response are tested." : " are tested.";
  const wirelessProblem = profile.supportsWirelessCharging
    ? "USB-C port wear, adapter issues, wireless charging faults, or board faults can mimic battery wear."
    : "USB-C port wear, adapter issues, or board faults can mimic battery wear.";
  const wirelessHandover = profile.supportsWirelessCharging
    ? "Charging, wireless charging behaviour, boot stability, heat, and runtime expectations are checked before return."
    : "Charging, boot stability, heat, and runtime expectations are checked before return.";
  const wirelessFaq = profile.supportsWirelessCharging
    ? "Yes. We test USB-C charging, wireless charging response, charge draw, boot stability, and heat before handover."
    : "Yes. We test USB-C charging, charge draw, boot stability, and heat before handover.";

  return {
    quickAnswer:
      `Need ${modelName} battery replacement in Ringwood? Ali Mobile & Repair checks battery health behaviour, heat, swelling risk, USB-C charging draw${wirelessContext} and post-repair runtime stability before handover.`,
    workbenchHeadings: {
      options: `Which battery path fits this ${modelName}?`,
      diagnostics: `What do we test before ${context.familyName} battery service?`,
      symptoms: `Which ${context.brandName} battery symptoms matter most?`,
      outcomes: "What can affect battery results?",
    },
    repairOptions: [
      {
        name: "Battery and charging diagnosis",
        shortDescription:
          `We test drain behaviour, heat, shutdowns, swelling signs, USB-C charging draw${wirelessContext} before quoting.`,
        bestFor:
          "Fast drain, slow charging, sudden shutdowns, swelling, heat, or a phone that no longer lasts through the day.",
        notes:
          profile.supportsWirelessCharging
            ? "A USB-C port, adapter, cable, wireless coil, or board fault can look like battery failure, so we test the power path first."
            : "A USB-C port, adapter, cable, or board fault can look like battery failure, so we test the power path first.",
      },
      {
        name: "Model-matched battery replacement",
        shortDescription:
          `We fit a battery matched to the ${modelName} power requirements and check stable charging before handover.`,
        bestFor:
          "Customers who want practical daily runtime restored with clear expectations.",
        notes:
          `${context.brandName} battery service focuses on function, safety, charging behaviour, and practical runtime rather than unrelated part-pairing messages.`,
      },
      {
        name: "Runtime and heat validation",
        shortDescription:
          profile.supportsWirelessCharging
            ? "After fitting, we confirm boot stability, charge acceptance, wireless charging behaviour, and heat under normal use."
            : "After fitting, we confirm boot stability, charge acceptance, and heat under normal use.",
        bestFor:
          "Phones where battery wear may be mixed with charging or board-level symptoms.",
        notes:
          "If drain remains abnormal after a known-good battery, board-level current draw may need further diagnosis.",
      },
    ],
    commonProblems: [
      { title: "Fast drain", description: "A worn battery can drop percentage quickly or struggle under load." },
      { title: "Heat or swelling", description: "Heat and swelling are handled carefully because pressure can affect the display and frame." },
      { title: "Slow or unstable charging", description: wirelessProblem },
      { title: "Unexpected shutdowns", description: "Voltage instability can cause shutdowns even when the displayed percentage is not empty." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Check battery symptoms", description: "We review drain, heat, swelling, shutdowns, and customer-reported runtime." },
      { step: "02", title: "Test charging paths", description: `USB-C charging, adapter response, and charge draw${wirelessPath}` },
      { step: "03", title: "Inspect safety risk", description: "Swelling, frame pressure, and liquid indicators are checked before opening." },
      { step: "04", title: "Handover validation", description: wirelessHandover },
    ],
    faq: [
      { question: `Can Ali Mobile replace my ${modelName} battery same day?`, answer: "Same-day battery repair may be available when the correct battery is in stock and no hidden liquid, charging, or board fault is found." },
      { question: `Do you test charging after ${modelName} battery service?`, answer: wirelessFaq },
      { question: `What if my ${modelName} still drains quickly after battery replacement?`, answer: "If drain continues after a known-good battery, we explain the next diagnostic path, such as app load, charging-port faults, or board-level current draw." },
    ],
  };
}

function buildSamsungS23ChargingPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  return {
    quickAnswer:
      `Need ${modelName} USB-C charging port repair in Ringwood? Ali Mobile & Repair checks lint, port wear, moisture alerts, charge draw, data transfer, microphone routing, ${profile.chargingNote} before quoting.`,
    workbenchHeadings: {
      options: `Which USB-C charging path fits this ${modelName}?`,
      diagnostics: `What do we test before ${context.brandName} port repair?`,
      symptoms: "Which USB-C symptoms matter most?",
      outcomes: "What can affect charging-port results?",
    },
    repairOptions: [
      { name: "USB-C clean and cable-seat check", shortDescription: "We inspect compacted lint, debris, corrosion, and whether a known-good cable seats correctly.", bestFor: "Loose cables, charging only at one angle, or intermittent cable detection.", notes: "If cleaning solves the issue, we do not push a full port replacement." },
      { name: "USB-C sub-board or flex replacement", shortDescription: "If pins, the port assembly, or lower board path has failed, we quote the correct replacement path.", bestFor: "No wired charging, data failure, moisture-damaged pins, or microphone symptoms linked to the lower assembly.", notes: `${context.brandName} USB-C charging, microphone, speaker, and data functions can overlap in the lower assembly.` },
      { name: "Board-level charging diagnosis", shortDescription: "If a port replacement will not solve the issue, we explain the likely board-level path.", bestFor: "Phones that fail with known-good cables, adapters, batteries, and port assemblies.", notes: "Board work is quoted separately after port-level faults are ruled out." },
    ],
    commonProblems: [
      { title: "Cable only works at one angle", description: "Lint, worn USB-C contacts, or corrosion can stop the cable seating properly." },
      { title: "Moisture or debris warning", description: `${context.brandName} devices can report moisture or debris in the USB-C port; we inspect before charging attempts.` },
      { title: "No data transfer", description: "A phone may charge but still fail USB data connection to a computer or accessory." },
      { title: profile.supportsWirelessCharging ? "Wireless charging still works" : "USB-C-only charging path fault", description: profile.supportsWirelessCharging ? "If wireless charging works but USB-C does not, the wired charging path gets priority diagnosis." : "If USB-C charging fails while battery condition is normal, we isolate the wired charging path first." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Inspect USB-C socket", description: "We check cable seating, debris, corrosion, moisture alerts, and pin condition." },
      { step: "02", title: "Measure charging response", description: profile.supportsWirelessCharging ? "Charge draw, adapter response, battery condition, and wireless charging are tested." : "Charge draw, adapter response, and battery condition are tested." },
      { step: "03", title: "Validate data and audio", description: "USB data transfer, microphones, speaker behaviour, and accessory detection are checked." },
      { step: "04", title: "Confirm repair path", description: "We explain whether cleaning, port replacement, or board-level diagnosis is the right next step." },
    ],
    faq: [
      { question: `Does my ${modelName} USB-C port need cleaning or replacement?`, answer: "Not always. Many faults are caused by lint or debris, so we inspect and clean where safe before quoting replacement." },
      { question: `Do you test data transfer after ${modelName} charging port repair?`, answer: profile.supportsWirelessCharging ? "Yes. We test USB-C charging, data connection, cable fit, microphone behaviour, speaker output, wireless charging, and normal operation." : "Yes. We test USB-C charging, data connection, cable fit, microphone behaviour, speaker output, and normal operation." },
      { question: `Can a ${modelName} charging fault be board-level?`, answer: "Yes. If known-good cables, batteries, and port assemblies do not solve the issue, we explain the board-level charging path before extra work." },
    ],
  };
}

function buildSamsungS23BackHousingPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  const coilCopy = profile.supportsWirelessCharging
    ? "wireless charging coil, NFC area, antenna lines, and frame straightness"
    : "NFC area, antenna lines, and frame straightness";
  const coilNotes = profile.supportsWirelessCharging
    ? "Wireless charging coil, NFC area, antenna lines, and camera rings are protected during repair."
    : "NFC area, antenna lines, and camera rings are protected during repair.";
  const coilRisk = profile.supportsWirelessCharging
    ? "Impact near the coil can affect wireless charging or Wireless PowerShare."
    : "Impact near the rear housing can affect NFC or antenna performance.";
  const coilStep = profile.supportsWirelessCharging
    ? "Wireless charging, NFC/payment area, antenna lines, camera rings, and rear microphone areas are handled carefully."
    : "NFC/payment area, antenna lines, camera rings, and rear microphone areas are handled carefully.";
  const coilFinal = profile.supportsWirelessCharging
    ? "Wireless charging, cameras, buttons, frame edges, and normal handling are checked before return."
    : "NFC/payment response, cameras, buttons, frame edges, and normal handling are checked before return.";

  return {
    quickAnswer:
      `Need ${modelName} back glass or rear housing repair in Ringwood? Ali Mobile & Repair checks cracked rear glass, camera ring fit, ${coilCopy} before bonding.`,
    workbenchHeadings: {
      options: `Which rear-housing path fits this ${modelName}?`,
      diagnostics: `What do we inspect before ${context.brandName} rear repair?`,
      symptoms: "Which rear-glass symptoms matter most?",
      outcomes: "What can affect rear-housing alignment?",
    },
    repairOptions: [
      { name: "Rear glass replacement path", shortDescription: "For cracked back glass with a usable frame, we focus on controlled removal, cleanup, and clean rear panel bonding.", bestFor: "Cracked rear glass, lifted corners, or cosmetic damage without severe frame bend.", notes: coilNotes },
      { name: "Housing condition assessment", shortDescription: "If the side frame is bent or crushed, we check whether rear glass alone will sit correctly.", bestFor: "Corner dents, camera ring gaps, lifted back glass, or frame distortion after impact.", notes: "A bent frame can cause lifting or uneven bonding if ignored." },
      { name: profile.supportsWirelessCharging ? "Wireless charging and camera validation" : "Rear function and camera validation", shortDescription: profile.supportsWirelessCharging ? "After repair, we check rear camera fit, wireless charging, NFC/payment awareness, buttons, and frame edges." : "After repair, we check rear camera fit, NFC/payment awareness, buttons, and frame edges.", bestFor: "Customers who want cosmetic repair plus functional checks before handover.", notes: "Existing coil or camera-area impact damage is explained before final approval." },
    ],
    commonProblems: [
      { title: "Cracked rear glass", description: "Broken glass can shed sharp flakes and allow dust or moisture into the rear housing area." },
      { title: profile.supportsWirelessCharging ? "Wireless charging inconsistency" : "Rear housing signal risk", description: coilRisk },
      { title: "Camera ring gaps", description: "Cracks around the camera rings need careful cleanup so the replacement panel sits cleanly." },
      { title: "Frame bend", description: "Frame distortion can stop the rear panel from bonding flat." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Inspect glass and frame", description: "We check cracks, lifted corners, camera ring damage, side rail bends, and safety to open." },
      { step: "02", title: "Protect rear functional areas", description: coilStep },
      { step: "03", title: "Clean and align", description: "Glass residue and adhesive channels are cleared before panel fit is checked." },
      { step: "04", title: "Final function checks", description: coilFinal },
    ],
    faq: [
      { question: `Can you repair cracked ${modelName} back glass in Ringwood?`, answer: `Yes. We handle ${context.brandName} rear glass and housing repair with controlled removal, adhesive cleanup, camera ring checks, and frame alignment before handover.` },
      { question: profile.supportsWirelessCharging ? `Will ${modelName} back glass repair affect wireless charging?` : `Can rear glass damage affect ${modelName} NFC or signal behaviour?`, answer: profile.supportsWirelessCharging ? "We protect the wireless charging coil and test wireless charging before return. Existing impact damage can still affect the coil, so we inspect first." : "Yes, impact around the rear housing can also affect NFC or antenna paths. We inspect those areas before and after repair." },
      { question: `Do you check NFC or payment-related areas during ${modelName} rear repair?`, answer: "We handle the rear housing, antenna, and NFC/payment areas carefully and explain any impact-related risk found during inspection." },
    ],
  };
}

function buildSamsungS23CameraPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  return {
    quickAnswer:
      `Need ${modelName} camera repair in Ringwood? Ali Mobile & Repair checks lens glass, focus, stabilisation, ${profile.cameraSummary}, app behaviour, and rear housing impact before quoting.`,
    workbenchHeadings: {
      options: `Which camera repair path fits this ${modelName}?`,
      diagnostics: `What do we test before ${context.brandName} camera repair?`,
      symptoms: `Which ${context.familyName} camera symptoms matter most?`,
      outcomes: "What can affect camera repair results?",
    },
    repairOptions: [
      { name: "Camera app diagnosis", shortDescription: "We test focus, zoom switching, stabilisation, flash, camera app behaviour, and visible lens damage.", bestFor: "Blurry photos, shaking image, camera failed warnings, black preview, or inconsistent zoom.", notes: "Software and app-level faults are checked before quoting hardware work." },
      { name: "Lens glass repair path", shortDescription: "For cracked outer lens glass, we check dust risk, camera ring fit, and whether the camera module is still clear.", bestFor: "Cracked lens glass where the camera still opens and focuses.", notes: "Dust inside the camera path can affect the result even after lens glass repair." },
      { name: "Camera module replacement path", shortDescription: `For module-level faults, we validate ${profile.cameraSummary} before and after repair.`, bestFor: "Failed focus, shaking image, black camera, damaged module, or impact around the camera island.", notes: "If impact damaged the board or connector path, we explain that separately." },
    ],
    commonProblems: [
      { title: "Blurry or shaking camera", description: "Impact can damage focus or stabilisation, especially around the camera island." },
      { title: "Cracked lens glass", description: "Lens glass damage can let dust in and reduce photo clarity." },
      { title: "Camera failed message", description: `${context.brandName} camera app faults can be software, module, connector, or board related.` },
      { title: "Zoom or lens switching failure", description: "Multi-camera models need each lens path tested, not just the main camera." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Test camera modes", description: "Photo, video, zoom switching, focus, stabilisation, flash, and app launch are checked." },
      { step: "02", title: "Inspect lens and housing", description: "Lens glass, camera rings, rear housing impact, and dust entry are inspected." },
      { step: "03", title: "Confirm module or glass path", description: "We explain whether lens glass, module replacement, or deeper diagnosis is needed." },
      { step: "04", title: "Final image checks", description: "Focus, zoom, video, flash, and normal app behaviour are checked before return." },
    ],
    faq: [
      { question: `Can you fix a blurry or shaking ${modelName} camera?`, answer: "Yes. We test lens glass, focus, stabilisation, camera app behaviour, and module response before quoting the repair path." },
      { question: `Do you repair cracked ${modelName} camera lens glass?`, answer: "Yes, if the camera module is still healthy. We inspect for dust, focus issues, and impact around the camera ring first." },
      { question: `Do you test all ${modelName} camera lenses?`, answer: `Yes. We test ${profile.cameraSummary} so the phone is checked beyond just the main camera.` },
    ],
  };
}

function buildSamsungS23WaterPocket(
  modelName: string,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  return {
    quickAnswer:
      `Need ${modelName} water damage assessment in Ringwood? Ali Mobile & Repair prioritises power safety, USB-C moisture risk, corrosion inspection, screen and battery checks, data-preservation awareness, and clear reporting before major part replacement.`,
    workbenchHeadings: {
      options: `Which water-damage path fits this ${modelName}?`,
      diagnostics: "What do we inspect after liquid exposure?",
      symptoms: `Which ${context.brandName} liquid symptoms matter most?`,
      outcomes: "What can affect recovery?",
    },
    repairOptions: [
      { name: "Do-not-charge triage", shortDescription: "We start with safe handling, moisture indicators, USB-C port inspection, and no-charge guidance.", bestFor: "Phones exposed to water, rain, spills, or moisture warnings.", notes: "Charging a wet USB-C phone can worsen corrosion or shorts." },
      { name: "Corrosion cleaning assessment", shortDescription: "Where appropriate, we open, inspect connectors, clean corrosion, and stabilise before testing modules.", bestFor: "Phones with no power, boot loops, charging faults, screen faults, speaker issues, or camera fog after liquid exposure.", notes: "Water recovery is unpredictable, so we report what is recovered and what remains risky." },
      { name: "Data-first recovery path", shortDescription: "If photos or files matter most, we prioritise safe stabilisation for backup where possible.", bestFor: "Customers who care more about data than cosmetic or full functional repair.", notes: "Success depends on corrosion level, board condition, and how quickly the device is assessed." },
    ],
    commonProblems: [
      { title: "USB-C moisture warning", description: `${context.brandName} devices can detect moisture or debris in the USB-C port. Do not keep testing chargers before assessment.` },
      { title: "No power or boot loop", description: "Liquid can affect battery, display, connectors, or board-level power paths." },
      { title: "Screen, speaker, or camera faults", description: "Moisture can reach display connectors, speaker mesh, camera lenses, and board areas." },
      { title: "Corrosion delay", description: "A phone can appear fine at first, then fail later as corrosion develops." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Power safety check", description: "We avoid charging, check symptoms, and inspect the USB-C port and visible liquid indicators." },
      { step: "02", title: "Open and inspect", description: "Connectors, board areas, corrosion, residue, battery, and display paths are inspected before quoting parts." },
      { step: "03", title: "Clean and stabilise", description: "Where appropriate, corrosion is cleaned and the phone is dried before module testing." },
      { step: "04", title: "Report next steps", description: "We explain what recovered, what remains risky, and which parts or board work would be needed next." },
    ],
    faq: [
      { question: `What should I do first if my ${modelName} gets wet?`, answer: "Power it off if possible, do not charge it, and bring it in quickly. Charging after liquid exposure can worsen shorts or corrosion." },
      { question: `Can Ali Mobile recover data from a water-damaged ${modelName}?`, answer: "If data matters most, we prioritise stabilising the phone enough for backup where possible. Success depends on corrosion level and board condition." },
      { question: `Is ${modelName} water damage repair covered by the normal warranty?`, answer: "Water damage recovery is unpredictable, so cleaning and rescue work does not carry the same warranty as a standard part replacement." },
    ],
  };
}

function buildSamsungS23LogicBoardPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  return {
    quickAnswer:
      `Need ${modelName} logic board diagnosis in Ringwood? Ali Mobile & Repair checks no-power faults, USB-C charging paths, display connector behaviour, corrosion risk, short detection, and data-preservation priorities before quoting board work.`,
    workbenchHeadings: {
      options: `Which board diagnosis path fits this ${modelName}?`,
      diagnostics: `What do we test before ${context.brandName} board work?`,
      symptoms: "Which board-level symptoms matter most?",
      outcomes: "What can affect board repair results?",
    },
    repairOptions: [
      {
        name: "No-power board triage",
        shortDescription:
          "We test battery response, USB-C current draw, display output, heat signatures, and visible corrosion before quoting board-level work.",
        bestFor:
          "Phones that will not power on, boot loop, heat quickly, or do not respond to known-good charging parts.",
        notes:
          "We separate battery, screen, port, and board symptoms before recommending micro-soldering.",
      },
      {
        name: "Charging-path diagnosis",
        shortDescription:
          "When USB-C port and battery checks pass but charging still fails, we inspect the board-level charging path.",
        bestFor:
          "Phones with no wired charging, unstable charging, or current draw that points beyond the lower port assembly.",
        notes:
          profile.supportsWirelessCharging
            ? "Wireless charging behaviour is also checked because it can help isolate the failed path."
            : "Wired charging behaviour is checked to isolate the failed power route.",
      },
      {
        name: "Data-first board recovery",
        shortDescription:
          "If data matters most, we prioritise stabilising the board enough for backup where possible.",
        bestFor:
          "Phones with photos, messages, work files, or account data that matter more than full cosmetic restoration.",
        notes:
          "Recovery depends on board condition, corrosion, previous repair attempts, and whether storage-related circuits remain healthy.",
      },
    ],
    commonProblems: [
      { title: "No power or boot loop", description: "Board-level faults can mimic battery, display, or USB-C charging failure." },
      { title: "Short or heat under load", description: "Rapid heat, abnormal current draw, or shutdowns can point to board-level damage." },
      { title: "Liquid corrosion", description: "Moisture can corrode connectors and board paths even after the phone appears dry." },
      { title: "Data access risk", description: "When storage or power rails are affected, diagnosis should prioritise data-preservation goals." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Rule out modular parts", description: "Battery, screen, USB-C port, cables, and visible connector issues are checked first." },
      { step: "02", title: "Measure board behaviour", description: "Current draw, heat, charging response, and boot behaviour are assessed before quoting." },
      { step: "03", title: "Inspect corrosion and impact", description: "Liquid indicators, board residue, connector damage, and previous repair marks are reviewed." },
      { step: "04", title: "Report repair or recovery path", description: "We explain whether board repair, data-first recovery, or part-level repair is the practical next step." },
    ],
    faq: [
      { question: `Can Ali Mobile diagnose a no-power ${modelName}?`, answer: "Yes. We check battery, screen, USB-C charging, current draw, heat, corrosion, and board behaviour before quoting." },
      { question: `Is ${modelName} logic board repair always worth doing?`, answer: "Not always. We explain the risk, cost, data priority, and likely outcome before any board-level work is approved." },
      { question: `Can you recover data from a ${modelName} with board damage?`, answer: "Sometimes. If data matters most, we prioritise stabilising the device enough for backup where the board condition allows it." },
    ],
  };
}

function getSamsungGalaxySRepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isGalaxySPhoneSlug(normalizedModel)) return null;

  const modelName = deriveSamsungGalaxySModelName(normalizedModel);
  const profile = getSamsungGalaxySProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile);
    default:
      return null;
  }
}

function getSamsungGalaxyARepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isGalaxyAPhoneSlug(normalizedModel)) return null;

  const modelName = deriveSamsungGalaxyAModelName(normalizedModel);
  const profile = getSamsungGalaxyAProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile);
    default:
      return null;
  }
}

function getSamsungGalaxyNoteRepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isGalaxyNotePhoneSlug(normalizedModel)) return null;

  const modelName = deriveSamsungGalaxyNoteModelName(normalizedModel);
  const profile = getSamsungGalaxyNoteProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName, SAMSUNG_NOTE_CONTEXT);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    default:
      return null;
  }
}

function getSamsungGalaxyZRepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isGalaxyZPhoneSlug(normalizedModel)) return null;

  const modelName = deriveSamsungGalaxyZModelName(normalizedModel);
  const profile = getSamsungGalaxyZProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName, SAMSUNG_Z_CONTEXT);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    default:
      return null;
  }
}

function getGooglePixelRepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isGooglePixelPhoneSlug(normalizedModel)) return null;

  const modelName = deriveGooglePixelModelName(normalizedModel);
  const profile = getGooglePixelProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName, GOOGLE_PIXEL_CONTEXT);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    default:
      return null;
  }
}

function getOppoRepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isOppoPhoneSlug(normalizedModel)) return null;

  const modelName = deriveOppoModelName(normalizedModel);
  const profile = getOppoProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile, OPPO_CONTEXT);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile, OPPO_CONTEXT);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile, OPPO_CONTEXT);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile, OPPO_CONTEXT);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile, OPPO_CONTEXT);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName, OPPO_CONTEXT);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile, OPPO_CONTEXT);
    default:
      return null;
  }
}

function formatSlugWords(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((token) => {
      if (/^\d+$/.test(token)) return token;
      if (/^\d+(st|nd|rd|th)$/i.test(token)) return `${token.slice(0, -2)}${token.slice(-2).toLowerCase()}`;
      if (/^\d+mm$/i.test(token)) return `${token.slice(0, -2)}mm`;
      if (/^x\d+$/i.test(token)) return token.toUpperCase();
      if (token === "sm") return "SM";
      if (token === "ipad") return "iPad";
      if (token === "macbook") return "MacBook";
      if (token === "pro") return "Pro";
      if (token === "air") return "Air";
      if (token === "mini") return "mini";
      if (token === "ultra") return "Ultra";
      if (token === "se") return "SE";
      if (token === "mm") return "mm";
      if (token === "tab") return "Tab";
      if (token === "galaxy") return "Galaxy";
      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join(" ");
}

function deriveTabletModelName(modelSlug: string, brandSlug: string): string {
  const normalizedModel = slugify(modelSlug);
  const normalizedBrand = slugify(brandSlug);

  if (normalizedBrand === "ipad" || normalizedBrand === "apple" || normalizedModel.startsWith("ipad-")) {
    const label = normalizedModel.startsWith("ipad-")
      ? `iPad ${formatSlugWords(normalizedModel.slice("ipad-".length))}`.trim()
      : formatSlugWords(normalizedModel);
    return label.replace(/\s+/g, " ").trim();
  }

  if (normalizedBrand === "samsung" || normalizedBrand === "galaxy") {
    if (normalizedModel.includes("tab")) {
      const tabLabel = formatSlugWords(normalizedModel);
      if (tabLabel.toLowerCase().startsWith("galaxy")) return `Samsung ${tabLabel}`;
      return `Samsung Galaxy ${tabLabel}`;
    }
    return `Samsung ${formatSlugWords(normalizedModel)}`.trim();
  }

  return formatSlugWords(normalizedModel);
}

function deriveLaptopModelName(modelSlug: string): string {
  const normalizedModel = slugify(modelSlug);
  const formatted = formatSlugWords(normalizedModel);
  if (formatted.toLowerCase().startsWith("macbook")) return formatted;
  return formatted || "Laptop";
}

function deriveWatchModelName(modelSlug: string): string {
  const normalizedModel = slugify(modelSlug);
  const formatted = formatSlugWords(normalizedModel).trim();
  if (formatted.toLowerCase().startsWith("apple watch")) return formatted;
  if (formatted.toLowerCase().startsWith("watch")) return `Apple ${formatted}`;
  return `Apple Watch ${formatted}`.trim();
}

function isSamsungTabletBrand(brandSlug: string): boolean {
  const normalized = slugify(brandSlug);
  return normalized === "samsung" || normalized === "galaxy";
}

function isSamsungTabletModelSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return normalized.includes("tab") || normalized.startsWith("galaxy-tab");
}

function buildTabletRepairPocket(
  modelName: string,
  repairType: string,
  options: { isIpad: boolean; isSamsungTablet: boolean }
): RepairTypeSeoPocket {
  const normalizedRepairType = slugify(repairType);
  const productLabel = options.isIpad ? "iPad" : options.isSamsungTablet ? "Samsung tablet" : "tablet";
  const displayLabel = options.isIpad ? "display and touch layer" : "display assembly and touch layer";
  const chargingLabel = options.isIpad ? "charging port and charging draw" : "USB-C charging port and charging draw";

  if (normalizedRepairType === "screen-replacement" || normalizedRepairType === "screen-repair") {
    return {
      quickAnswer:
        `Need ${modelName} screen replacement in Ringwood? Ali Mobile & Repair checks glass damage, ${displayLabel}, frame alignment, button feel, and charging response before confirming the quote.`,
      workbenchHeadings: {
        options: `Which screen path fits this ${productLabel}?`,
        diagnostics: "What do we test before display work?",
        symptoms: "Which screen symptoms matter most?",
        outcomes: "What can affect display fit and touch?",
      },
      repairOptions: [
        { name: "Display assembly diagnosis", shortDescription: "We inspect glass cracks, touch response, display output, and frame shape before opening.", bestFor: "Cracked glass, no image, touch dead zones, or flicker.", notes: "If the frame is bent, we explain fit risk before starting." },
        { name: "Model-matched screen replacement", shortDescription: "We fit a model-matched display assembly and confirm clean bonding.", bestFor: "Tablets with clear display assembly damage and stable board behavior.", notes: "Quote and turnaround are confirmed before repair begins." },
        { name: "Post-fit function checks", shortDescription: "After fitting, we test touch, brightness, front camera area, buttons, and charging response.", bestFor: "Customers who want practical handover checks before handover.", notes: "Any additional fault found during testing is reported before extra work." },
      ],
      commonProblems: [
        { title: "Cracked glass with unstable touch", description: "Touch can worsen over time even when the display still lights up." },
        { title: "No image or flicker", description: "Display faults can come from panel impact, connector stress, or prior pressure damage." },
        { title: "Frame bend near corners", description: "A bent frame can stop the new screen from sitting flat." },
        { title: "Charging or button overlap faults", description: "Impact can also affect charging port seating or button feel, so we test both." },
      ],
      diagnosticSteps: [
        { step: "01", title: "Inspect glass, frame, and housing", description: "We check crack spread, frame shape, and whether the tablet is safe to open." },
        { step: "02", title: "Test touch and display behavior", description: "We test full-panel touch, brightness, and visible display faults before quoting." },
        { step: "03", title: "Confirm quote and repair scope", description: "We confirm part availability, quote, and expected turnaround before repair starts." },
        { step: "04", title: "Final handover checks", description: `We retest touch, display output, cameras, buttons, and ${chargingLabel} before return.` },
      ],
      faq: [
        { question: `Can you replace the screen on ${modelName} the same day?`, answer: "Same-day service depends on part availability and device condition. We confirm timing after bench inspection." },
        { question: `Do you test touch response after ${modelName} screen repair?`, answer: "Yes. We test touch coverage, display output, buttons, and charging behavior before handover." },
      ],
    };
  }

  if (normalizedRepairType === "battery-replacement" || normalizedRepairType === "battery-service") {
    return {
      quickAnswer:
        `Need ${modelName} battery replacement in Ringwood? Ali Mobile & Repair checks battery condition, swelling risk, ${chargingLabel}, and runtime symptoms before confirming the repair quote.`,
      workbenchHeadings: {
        options: `Which battery path fits this ${productLabel}?`,
        diagnostics: "What do we test before battery service?",
        symptoms: "Which battery symptoms matter most?",
        outcomes: "What can affect battery results?",
      },
      repairOptions: [
        { name: "Battery health diagnosis", shortDescription: "We test charge hold, heat behavior, swelling signs, and charging response first.", bestFor: "Fast drain, short runtime, random shutdowns, or swelling concern.", notes: "Charging-port faults can mimic battery issues, so both are checked." },
        { name: "Battery replacement path", shortDescription: "We remove the old cell safely and fit a model-matched replacement battery.", bestFor: "Tablets with confirmed battery wear and stable main board behavior.", notes: "Adhesive cleanup and safe cable handling are part of the repair path." },
        { name: "Handover charging checks", shortDescription: "We verify charging draw, boot behavior, and practical usage checks before handover.", bestFor: "Customers who want confirmed power stability before return.", notes: "Quote and scope are always confirmed before opening the tablet." },
      ],
      commonProblems: [
        { title: "Fast drain or short runtime", description: "Battery wear can reduce daily usage time and create unstable percentage drops." },
        { title: "Swelling pressure risk", description: "Battery swelling can stress the display and housing if not addressed early." },
        { title: "Charging fault mimic", description: "Port wear or debris can look like battery failure, so we test the full charging path." },
        { title: "Heat during charging", description: "Unusual heat can point to battery wear or power-path issues that need diagnosis." },
      ],
      diagnosticSteps: [
        { step: "01", title: "Check battery symptoms", description: "We review runtime behavior, charge hold, shutdown pattern, and heat signs." },
        { step: "02", title: "Validate charging path", description: "We inspect port condition and charging draw before confirming battery replacement." },
        { step: "03", title: "Confirm quote and scope", description: "We confirm pricing, part availability, and repair scope before work begins." },
        { step: "04", title: "Final power checks", description: "After fitting, we test charging behavior, startup stability, and normal operation." },
      ],
      faq: [
        { question: `Does ${modelName} battery replacement include charging checks?`, answer: "Yes. We check charging behavior before and after replacement to confirm stable power response." },
        { question: `Can swelling be checked before replacing the battery?`, answer: "Yes. We inspect for swelling pressure and explain risk before any repair starts." },
      ],
    };
  }

  if (normalizedRepairType === "charging-port" || normalizedRepairType === "charging-port-repair" || normalizedRepairType === "charging-port-replacement") {
    return {
      quickAnswer:
        `Need ${modelName} charging port repair in Ringwood? Ali Mobile & Repair checks port wear, debris, cable seating, charging draw, and surrounding housing condition before quoting.`,
      workbenchHeadings: {
        options: "Which charging-port path fits this tablet?",
        diagnostics: "What do we test before port repair?",
        symptoms: "Which charging symptoms matter most?",
        outcomes: "What can affect charging results?",
      },
      repairOptions: [
        { name: "Port inspection and clean", shortDescription: "We inspect debris, corrosion, and cable seating before recommending replacement.", bestFor: "Loose cable fit, intermittent charging, or no-charge reports.", notes: "If cleaning solves the issue, we avoid unnecessary part replacement." },
        { name: "Port replacement path", shortDescription: "If port pins or sub-board paths fail, we quote the correct replacement path.", bestFor: "No charge response, worn pins, or unstable connection behavior.", notes: "Frame and housing condition are checked to avoid connector stress." },
        { name: "Post-repair power checks", shortDescription: "After repair, we test charging draw, cable fit, and practical use behavior.", bestFor: "Customers who want charging stability confirmed before handover.", notes: "Quote confirmation is completed before opening the device." },
      ],
      commonProblems: [
        { title: "Cable only charges at one angle", description: "Debris or pin wear can interrupt normal cable seating." },
        { title: "No charging response", description: "Port, cable, battery, or board-path faults can all cause no-charge behavior." },
        { title: "Port movement in housing", description: "Housing stress or impact near the port can affect connector stability." },
        { title: "Slow or unstable charging draw", description: "Power-path testing is needed before confirming parts replacement." },
      ],
      diagnosticSteps: [
        { step: "01", title: "Inspect port and housing", description: "We check port seating, debris, visible damage, and surrounding frame condition." },
        { step: "02", title: "Test charging response", description: "We measure charging behavior with known-good cable and adapter combinations." },
        { step: "03", title: "Confirm quote before repair", description: "We confirm repair path, part availability, and quote before opening the device." },
        { step: "04", title: "Final charging checks", description: "After repair, we verify charging stability and normal operation before handover." },
      ],
      faq: [
        { question: `Can ${modelName} charging issues be fixed without replacement?`, answer: "Sometimes yes. We inspect and clean first, then quote replacement only when needed." },
        { question: `Do you test charging draw before and after port repair?`, answer: "Yes. We test charging response on the bench before return." },
      ],
    };
  }

  return {
    quickAnswer:
      `Need ${modelName} repair assessment in Ringwood? Ali Mobile & Repair checks visible faults, frame condition, charging behavior, and key functions before confirming the quote.`,
    workbenchHeadings: {
      options: "Which repair path fits this device?",
      diagnostics: "What do we test before repair?",
      symptoms: "Which symptoms matter most?",
      outcomes: "What can affect the final result?",
    },
    repairOptions: [
      { name: "General fault diagnosis", shortDescription: "We isolate the visible issue and test related functions before repair.", bestFor: "Unclear faults or multiple symptoms on one device.", notes: "Quote and scope are confirmed before work starts." },
      { name: "Part-level repair path", shortDescription: "When a module-level fault is confirmed, we quote the matching repair path.", bestFor: "Display, battery, charging, or button-related hardware issues.", notes: "We keep the repair scope practical and model-specific." },
      { name: "Final function validation", shortDescription: "Before handover, we retest core functions related to the original fault.", bestFor: "Customers who want clear post-repair checks before handover.", notes: "Any extra issue found is explained before additional work." },
    ],
    commonProblems: [
      { title: "Visible physical damage", description: "Glass cracks, housing bends, or impact marks can affect more than one function." },
      { title: "Charging instability", description: "Power issues can come from battery wear, port faults, or board-level behavior." },
      { title: "Intermittent function faults", description: "Touch, button, camera, or audio symptoms can appear together after impact." },
      { title: "Unknown repair scope", description: "We diagnose first so the quote matches the real fault before repair starts." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Inspect condition and symptoms", description: "We inspect housing, fault history, and current behavior." },
      { step: "02", title: "Run bench diagnostics", description: "We test the affected function and related components before quoting." },
      { step: "03", title: "Confirm quote and scope", description: "We confirm pricing, part availability, and expected turnaround before work." },
      { step: "04", title: "Final handover checks", description: "After repair, we retest the original fault path and normal operation." },
    ],
    faq: [
      { question: `Do you confirm the quote before repairing ${modelName}?`, answer: "Yes. We diagnose first, then confirm scope and quote before starting." },
    ],
  };
}

function buildLaptopRepairPocket(modelName: string, repairType: string): RepairTypeSeoPocket {
  const normalizedRepairType = slugify(repairType);
  const isMacBook = modelName.toLowerCase().includes("macbook");

  if (normalizedRepairType === "screen-replacement" || normalizedRepairType === "screen-repair") {
    return {
      quickAnswer:
        `Need ${modelName} screen repair in Ringwood? Ali Mobile & Repair checks panel damage, hinge alignment, top-case fit, cable condition, and quote scope before repair.`,
      workbenchHeadings: {
        options: "Which display repair path fits this laptop?",
        diagnostics: "What do we test before screen repair?",
        symptoms: "Which display symptoms matter most?",
        outcomes: "What can affect screen repair results?",
      },
      repairOptions: [
        { name: "Display fault diagnosis", shortDescription: "We test panel output, lines, flicker, backlight behavior, and external display response.", bestFor: "Cracked panel, black screen, flicker, or partial image faults.", notes: "Hinge pressure and cable movement are checked before quote confirmation." },
        { name: "Screen assembly replacement", shortDescription: "We fit the matched display assembly and align hinges and top-case seating.", bestFor: "Confirmed panel damage with stable board-level display output.", notes: "We confirm parts and quote before opening the unit." },
        { name: "Post-repair validation", shortDescription: "After fitting, we test brightness control, camera area, hinge travel, and normal boot behavior.", bestFor: "Customers who want practical handover checks before handover.", notes: "Any additional issue is reported before extra work." },
      ],
      commonProblems: [
        { title: "Cracked panel with usable image", description: "A cracked panel can worsen and stress hinge-side cables with continued use." },
        { title: "Flicker or no image", description: "Panel, cable, or board-level display paths can all cause similar symptoms." },
        { title: "Hinge or top-case stress", description: "Stiff hinges or top-case distortion can affect panel life after replacement." },
        { title: "Backlight-only faults", description: "Dim output or no image with power can indicate display-path diagnostics are needed." },
      ],
      diagnosticSteps: [
        { step: "01", title: "Inspect panel and hinge condition", description: "We inspect cracks, hinge movement, top-case shape, and cable stress points." },
        { step: "02", title: "Test display path", description: "We test panel output, backlight behavior, and related display-path symptoms." },
        { step: "03", title: "Confirm quote and scope", description: "We confirm repair scope, part path, and quote before disassembly." },
        { step: "04", title: "Final function checks", description: "We retest display stability, camera area, keyboard/trackpad response, and charging behavior." },
      ],
      faq: [
        { question: `Do you check hinge and cable condition during ${modelName} screen repair?`, answer: "Yes. Hinge movement and display cable stress are checked as part of the diagnostic process." },
      ],
    };
  }

  if (normalizedRepairType === "battery-replacement" || normalizedRepairType === "battery-service") {
    return {
      quickAnswer:
        `Need ${modelName} battery replacement in Ringwood? Ali Mobile & Repair checks cycle behavior, swelling risk, charger response, and board-level power symptoms before confirming the quote.`,
      workbenchHeadings: {
        options: "Which battery path fits this laptop?",
        diagnostics: "What do we test before battery service?",
        symptoms: "Which battery symptoms matter most?",
        outcomes: "What can affect battery replacement results?",
      },
      repairOptions: [
        { name: "Battery condition diagnosis", shortDescription: "We test charge hold, adapter response, shutdown behavior, and battery health indicators.", bestFor: "Fast drain, shutdowns, or poor runtime on battery power.", notes: "Power-path checks are done before confirming replacement." },
        { name: "Battery replacement path", shortDescription: "We replace the battery with careful cable handling and top-case inspection where required.", bestFor: "Confirmed battery wear with stable charging-path behavior.", notes: "Quote and scope are confirmed before opening the device." },
        { name: "Post-repair power checks", shortDescription: "We test charging, boot stability, and practical runtime behavior before handover.", bestFor: "Customers who want confirmed power behavior before handover.", notes: "If extra faults appear, we explain them before additional work." },
      ],
      commonProblems: [
        { title: "Fast drain off charger", description: "Battery wear can shorten runtime and cause unstable percentage drops." },
        { title: "Unexpected shutdowns", description: "Voltage instability can cause shutdowns even with remaining percentage." },
        { title: "Swelling pressure signs", description: "Swelling can affect top case, trackpad feel, and safe operation." },
        { title: "Adapter or board-path overlap", description: "Charging-path faults can mimic battery wear and need separate diagnosis." },
      ],
      diagnosticSteps: [
        { step: "01", title: "Review power symptoms", description: "We assess battery runtime, shutdown history, and heat behavior." },
        { step: "02", title: "Test charging path", description: "We validate adapter response and charging behavior before replacement." },
        { step: "03", title: "Confirm quote before repair", description: "We confirm part path, scope, and quote before disassembly." },
        { step: "04", title: "Final handover checks", description: "We retest charging, startup, keyboard, trackpad, ports, and speaker behavior." },
      ],
      faq: [
        { question: `Will you check for swelling and top-case pressure on ${modelName}?`, answer: "Yes. We check for swelling-related pressure before battery replacement." },
      ],
    };
  }

  if (normalizedRepairType.includes("keyboard") || normalizedRepairType.includes("top-case")) {
    return {
      quickAnswer:
        `Need ${modelName} keyboard or top-case repair in Ringwood? Ali Mobile & Repair checks key response, top-case condition, trackpad behavior, and cable paths before confirming quote and scope.`,
      workbenchHeadings: {
        options: "Which keyboard repair path fits this laptop?",
        diagnostics: "What do we test before keyboard work?",
        symptoms: "Which keyboard symptoms matter most?",
        outcomes: "What can affect keyboard repair results?",
      },
      repairOptions: [
        { name: "Key response diagnosis", shortDescription: "We test key registration, repeating keys, stuck keys, and backlight behavior.", bestFor: "Missing key input, sticky keys, or inconsistent typing response.", notes: "Top-case condition is checked before confirming repair path." },
        { name: "Keyboard or top-case replacement path", shortDescription: "We quote the correct keyboard-level or top-case-level replacement based on the model.", bestFor: "Failed keyboard matrix, liquid-damaged keys, or structural top-case issues.", notes: "Trackpad and cable routing checks are included before handover." },
        { name: "Post-repair typing validation", shortDescription: "After repair, we test full-keyboard input, trackpad click/gesture response, and charging behavior.", bestFor: "Customers wanting full practical checks before handover.", notes: "Quote confirmation happens before opening the laptop." },
      ],
      commonProblems: [
        { title: "Missing or repeated key input", description: "Key matrix faults can cause dropped letters or repeated presses." },
        { title: "Liquid-related key failure", description: "Liquid can affect key response and connector paths under the keyboard." },
        { title: "Trackpad overlap issues", description: "Top-case pressure or internal shifts can affect both keyboard and trackpad feel." },
        { title: "Port or speaker side effects", description: "After impact or liquid exposure, nearby components should be checked before quote finalization." },
      ],
      diagnosticSteps: [
        { step: "01", title: "Check key and top-case condition", description: "We inspect key behavior, top-case state, and visible damage patterns." },
        { step: "02", title: "Test related functions", description: "We test trackpad behavior, charger detection, and nearby component response." },
        { step: "03", title: "Confirm quote and scope", description: "We confirm whether keyboard-only or top-case-level repair is needed before work starts." },
        { step: "04", title: "Final function checks", description: "We retest typing, trackpad, ports, speaker output, and normal operation before return." },
      ],
      faq: [
        { question: `Do you test trackpad and ports during ${modelName} keyboard repair?`, answer: "Yes. We check related functions so handover includes practical validation." },
      ],
    };
  }

  if (normalizedRepairType === "water-damage-repair" || normalizedRepairType === "water-damage" || normalizedRepairType.includes("logic-board")) {
    return {
      quickAnswer:
        `Need ${modelName} board or liquid-damage diagnosis in Ringwood? Ali Mobile & Repair checks power safety, liquid indicators, connector corrosion, and short-risk symptoms before confirming repair options.`,
      workbenchHeadings: {
        options: "Which board diagnosis path fits this laptop?",
        diagnostics: "What do we inspect before board work?",
        symptoms: "Which board-level symptoms matter most?",
        outcomes: "What can affect liquid/board repair results?",
      },
      repairOptions: [
        { name: "Power-safe triage", shortDescription: "We begin with safe power handling and no-charge triage for unstable liquid-exposed devices.", bestFor: "No power, random shutdown, or liquid-exposure symptoms.", notes: "Not every liquid-damaged unit is repairable; diagnosis comes first." },
        { name: "Board and connector inspection", shortDescription: "We inspect board and connector areas for corrosion, oxidation, and short-risk signs.", bestFor: "Devices with uncertain fault spread after spill or impact events.", notes: "Repair scope is quoted only after inspection findings are clear." },
        { name: "Recovery path reporting", shortDescription: "We explain practical next steps: board repair path, module replacement path, or stop-at-diagnosis.", bestFor: "Customers needing a clear cost/risk decision before proceeding.", notes: "Quote and approval are required before board-level work starts." },
      ],
      commonProblems: [
        { title: "No power after liquid exposure", description: "Power-path faults can involve board rails, connectors, or attached modules." },
        { title: "Charging but not booting", description: "A device can show charge behavior while still failing normal startup." },
        { title: "Corrosion on connectors", description: "Residue can continue affecting reliability if not diagnosed and cleaned correctly." },
        { title: "Unstable ports or speaker response", description: "Liquid or board faults can impact multiple functions beyond power-on behavior." },
      ],
      diagnosticSteps: [
        { step: "01", title: "Disconnect power-safe path", description: "We begin with safe power isolation before deeper board checks." },
        { step: "02", title: "Inspect board and connectors", description: "We inspect corrosion/oxidation signs and short-risk areas under magnification." },
        { step: "03", title: "Confirm quote and repair scope", description: "We confirm board-level or part-level options with quote details before work." },
        { step: "04", title: "Final reporting and next step", description: "We provide a practical report on what is repairable and what remains high risk." },
      ],
      faq: [
        { question: `Can ${modelName} liquid damage always be repaired?`, answer: "Not always. We inspect first and quote only the repairs we can complete." },
      ],
    };
  }

  return {
    quickAnswer:
      `Need ${modelName} repair in Ringwood? Ali Mobile & Repair checks the visible fault, related hardware behavior, and quote scope before any repair starts.`,
    workbenchHeadings: {
      options: "Which repair path fits this laptop?",
      diagnostics: "What do we test before repair?",
      symptoms: "Which symptoms matter most?",
      outcomes: "What can affect the final result?",
    },
    repairOptions: [
      { name: "Fault diagnosis first", shortDescription: "We isolate the main fault and test related hardware before quoting.", bestFor: "Unclear or mixed symptoms that need a practical diagnosis.", notes: "Quote confirmation happens before disassembly." },
      { name: "Part-level repair path", shortDescription: "Where applicable, we quote module-level repair options matched to the model.", bestFor: "Display, battery, keyboard, or charging-path issues.", notes: "Any extra issue is explained before additional work." },
      { name: "Final handover checks", shortDescription: "After repair, we test startup, input devices, ports, and core functions.", bestFor: "Customers wanting verified operation before handover.", notes: "We keep the checks practical and repair-specific." },
    ],
    commonProblems: [
      { title: "Visible hardware damage", description: "Impact, pressure, or spill events can affect more than one subsystem." },
      { title: "Charging or power instability", description: "Power faults may involve battery, charging path, or board behavior." },
      { title: "Input and port overlap issues", description: "Keyboard, trackpad, and port faults can overlap after damage." },
      { title: "Unclear repair scope", description: "A bench diagnosis keeps the quote aligned with the real fault." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Inspect condition and symptoms", description: "We inspect hardware condition and fault history." },
      { step: "02", title: "Run bench diagnostics", description: "We test the affected system and related functions before quote approval." },
      { step: "03", title: "Confirm quote before repair", description: "We confirm repair scope and expected timing before work starts." },
      { step: "04", title: "Final handover checks", description: "We retest the repaired path and practical day-to-day functions." },
    ],
    faq: [
      { question: `Do you confirm quote and scope before repairing ${modelName}?`, answer: "Yes. Diagnosis and quote confirmation are completed before repair begins." },
    ],
  };
}

function buildWatchRepairPocket(modelName: string, repairType: string): RepairTypeSeoPocket {
  const normalizedRepairType = slugify(repairType);

  if (normalizedRepairType === "screen-replacement" || normalizedRepairType === "screen-repair") {
    return {
      quickAnswer:
        `Need ${modelName} screen repair in Ringwood? Ali Mobile & Repair checks glass damage, display output, touch response, housing condition, and seal limitations before confirming the quote.`,
      workbenchHeadings: {
        options: "Which screen path fits this watch?",
        diagnostics: "What do we test before display repair?",
        symptoms: "Which display symptoms matter most?",
        outcomes: "What can affect display and seal results?",
      },
      repairOptions: [
        { name: "Glass and display diagnosis", shortDescription: "We inspect cracks, display output, touch response, and housing fit before opening.", bestFor: "Cracked glass, no image, flicker, or weak touch response.", notes: "We confirm quote and scope before repair begins." },
        { name: "Display repair path", shortDescription: "We perform model-matched display repair with careful cable and housing handling.", bestFor: "Watches with confirmed display assembly damage.", notes: "Frame/housing condition is checked before final part commitment." },
        { name: "Post-repair function checks", shortDescription: "After repair, we test touch response, display stability, charging, and button/crown behavior.", bestFor: "Customers wanting practical checks before handover.", notes: "Seal condition is rebuilt carefully, with limitations explained at handover." },
      ],
      commonProblems: [
        { title: "Cracked glass with partial touch", description: "Touch may still work in spots but usually degrades with continued use." },
        { title: "No display or flicker", description: "Impact can affect panel output or internal display connectors." },
        { title: "Housing distortion", description: "Frame pressure can affect panel seating and repair fit." },
        { title: "Seal limitations after opening", description: "After watch opening, water resistance cannot be guaranteed." },
      ],
      diagnosticSteps: [
        { step: "01", title: "Inspect glass and housing", description: "We inspect crack spread, housing shape, and safe opening condition." },
        { step: "02", title: "Test touch and display behavior", description: "We test touch coverage, display output, and charging behavior before quoting." },
        { step: "03", title: "Confirm quote and scope", description: "We confirm part path and quote before opening the watch." },
        { step: "04", title: "Final handover checks", description: "We retest touch, display, charging, crown/button response, and explain seal limitations." },
      ],
      faq: [
        { question: `Will ${modelName} be fully waterproof after screen repair?`, answer: "We rebuild the seal carefully, but water resistance cannot be guaranteed after opening the watch." },
      ],
    };
  }

  if (normalizedRepairType === "battery-replacement" || normalizedRepairType === "battery-service") {
    return {
      quickAnswer:
        `Need ${modelName} battery replacement in Ringwood? Ali Mobile & Repair checks battery runtime behavior, swelling risk, charging response, and housing condition before confirming the quote.`,
      workbenchHeadings: {
        options: "Which battery path fits this watch?",
        diagnostics: "What do we test before battery service?",
        symptoms: "Which battery symptoms matter most?",
        outcomes: "What can affect battery and seal results?",
      },
      repairOptions: [
        { name: "Battery behavior diagnosis", shortDescription: "We check runtime, charging response, and shutdown pattern before opening.", bestFor: "Fast drain, short runtime, or no-power watch symptoms.", notes: "Quote and scope are confirmed before service starts." },
        { name: "Battery replacement path", shortDescription: "We replace the battery with careful connector and housing handling.", bestFor: "Watches with confirmed battery wear or swelling risk.", notes: "Housing and seal condition are assessed during repair." },
        { name: "Post-repair charging checks", shortDescription: "We test charging response, startup stability, and core operation before handover.", bestFor: "Customers wanting confirmed power behavior at handover.", notes: "Water-resistance limitations are explained after repair." },
      ],
      commonProblems: [
        { title: "Fast battery drain", description: "Battery wear can reduce daily usage time and charging stability." },
        { title: "Unexpected shutdowns", description: "Voltage drop can cause shutdown even with remaining percentage." },
        { title: "Battery swelling risk", description: "Swelling can place pressure on display and housing layers." },
        { title: "Charging response faults", description: "Charging issues can overlap with battery or connector path faults." },
      ],
      diagnosticSteps: [
        { step: "01", title: "Review battery symptoms", description: "We check runtime behavior, shutdown pattern, and heat signs." },
        { step: "02", title: "Validate charging behavior", description: "We test charging response before confirming battery replacement path." },
        { step: "03", title: "Confirm quote before repair", description: "We confirm pricing and scope before opening the watch." },
        { step: "04", title: "Final handover checks", description: "We retest charging and normal watch behavior, then explain seal limitations." },
      ],
      faq: [
        { question: `Do you test charging after ${modelName} battery replacement?`, answer: "Yes. We test charging response and startup behavior before handover." },
      ],
    };
  }

  return {
    quickAnswer:
      `Need ${modelName} repair assessment in Ringwood? Ali Mobile & Repair checks display, touch, battery behavior, housing condition, and repair scope before confirming the quote.`,
    workbenchHeadings: {
      options: "Which repair path fits this watch?",
      diagnostics: "What do we test before repair?",
      symptoms: "Which symptoms matter most?",
      outcomes: "What can affect final watch repair results?",
    },
    repairOptions: [
      { name: "General watch diagnosis", shortDescription: "We inspect the main fault and test related functions before quote confirmation.", bestFor: "Unclear faults across display, touch, battery, or charging behavior.", notes: "Repair scope is always confirmed before opening." },
      { name: "Part-level repair path", shortDescription: "When the fault is confirmed, we quote the matching part-level repair path.", bestFor: "Known display, battery, charging, or housing faults.", notes: "Any extra fault found is explained before additional work." },
      { name: "Final handover checks", shortDescription: "After repair, we retest key watch functions before handover.", bestFor: "Customers who want practical function checks at handover.", notes: "Water-resistance limitations are explained after opening." },
    ],
    commonProblems: [
      { title: "Display or touch instability", description: "Cracks or impact can cause image faults and weak touch response." },
      { title: "Battery runtime decline", description: "Battery wear can shorten runtime and cause shutdown symptoms." },
      { title: "Housing or frame stress", description: "Housing condition affects fit and repair stability." },
      { title: "Seal limitations", description: "After opening, water resistance cannot be guaranteed." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Inspect watch condition", description: "We inspect display, housing, and visible fault signs." },
      { step: "02", title: "Test core functions", description: "We test touch, display, charging, and normal operation before quoting." },
      { step: "03", title: "Confirm quote and scope", description: "We confirm repair scope, quote, and part path before service." },
      { step: "04", title: "Final handover checks", description: "We retest key functions and explain post-repair seal limitations." },
    ],
    faq: [
      { question: `Do you confirm quote and scope before repairing ${modelName}?`, answer: "Yes. We confirm quote and repair scope before any watch repair starts." },
    ],
  };
}

const PRIORITY_REPAIR_SEO_POCKETS: Record<string, RepairTypeSeoPocket> = {
  "phone/iphone/iphone-14-pro-max/battery-replacement": {
    quickAnswer:
      "Need iPhone 14 Pro Max battery replacement in Ringwood? We check battery health symptoms, charging behaviour, swelling signs, and shutdown patterns before confirming the repair path.",
    workbenchHeadings: {
      options: "What do we check before replacing this battery?",
      diagnostics: "How do we confirm it is a battery fault?",
      symptoms: "Which battery symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "Battery health review", shortDescription: "We check the reported battery health, service message, fast drain, and shutdown behaviour.", bestFor: "Battery health drop, short runtime, or unexpected shutdowns.", notes: "A clear quote is confirmed before replacement starts." },
      { name: "Charging path check", shortDescription: "We test cable, charging response, and port condition before assuming the battery is the only fault.", bestFor: "Phones that charge but drain quickly or only charge with certain cables.", notes: "Bring the cable or charger that shows the issue if you can." },
      { name: "Swelling and fit inspection", shortDescription: "We look for lifted screen edges, pressure marks, or heat symptoms that can point to battery swelling.", bestFor: "Devices with screen lift, heat, or sudden power loss.", notes: "Back up important data before any repair when possible." },
    ],
    commonProblems: [
      { title: "Battery health has dropped", description: "Reduced battery health can make the phone drain faster during normal daily use." },
      { title: "Unexpected shutdowns", description: "A worn battery can shut down under load even when charge remains." },
      { title: "Charging but draining quickly", description: "Fast drain while charging can point to battery wear, cable issues, or port condition." },
      { title: "Swelling warning signs", description: "Screen lift, pressure, or heat should be checked before the phone is used further." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Check the charging setup", description: "We test charging response with known-good cable and charger before confirming the battery path." },
      { step: "02", title: "Inspect battery symptoms", description: "We review shutdowns, heat, swelling signs, and reported battery health." },
      { step: "03", title: "Confirm quote and repair scope", description: "We confirm the battery replacement path and quote before opening the device." },
      { step: "04", title: "Final power checks", description: "After repair, we check startup, charging response, and normal power behaviour before handover." },
    ],
    faq: [
      { question: "Should I check the charger before booking iPhone 14 Pro Max battery replacement?", answer: "Yes. If the issue appears with one cable or charger, bring it in so we can test charging behaviour before confirming the battery replacement." },
    ],
  },
  "phone/samsung/galaxy-s22/charging-port-replacement": {
    quickAnswer:
      "Need Samsung Galaxy S22 charging port replacement in Ringwood? We check USB-C fit, cable behaviour, dust, liquid signs, and charging board symptoms before confirming the repair.",
    workbenchHeadings: {
      options: "What do we check before replacing the port?",
      diagnostics: "How do we confirm the charging fault?",
      symptoms: "Which USB-C symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "Cable and charger test", shortDescription: "We test the phone with known-good charging gear before confirming a port repair.", bestFor: "Phones that only fail with certain cables or chargers.", notes: "Bring the cable or charger that shows the fault if possible." },
      { name: "USB-C port inspection", shortDescription: "We inspect for loose fit, lint, dust, corrosion, and visible liquid signs around the port.", bestFor: "Loose USB-C connection or charging only at certain angles.", notes: "Avoid forcing the cable if the fit feels loose or gritty." },
      { name: "Charging board diagnosis", shortDescription: "We check whether symptoms point to the port, charging board path, or related connection.", bestFor: "No-charge, intermittent charging, or charging accessory warnings.", notes: "Repair scope and quote are confirmed before parts are fitted." },
    ],
    commonProblems: [
      { title: "Loose USB-C connection", description: "A worn or dirty port can make the cable feel loose or disconnect easily." },
      { title: "Angle-only charging", description: "Charging only at a certain angle often points to port wear or debris." },
      { title: "Dust or corrosion", description: "Lint, moisture, or corrosion can block stable charging contact." },
      { title: "Board-level overlap", description: "Some charging symptoms can involve the port path or charging board rather than the socket alone." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Test known-good accessories", description: "We test with reliable cable and charger before replacing parts." },
      { step: "02", title: "Inspect the USB-C port", description: "We check fit, debris, corrosion, and signs of liquid exposure." },
      { step: "03", title: "Confirm charging path", description: "We verify whether the fault matches a port or charging board repair path." },
      { step: "04", title: "Retest charging before handover", description: "After repair, we confirm stable cable fit and charging response." },
    ],
    faq: [
      { question: "Can you check my Galaxy S22 cable before replacing the charging port?", answer: "Yes. Bring the cable or charger that causes the issue and we will test it before confirming the charging port repair." },
    ],
  },
  "tablet/ipad/ipad-11th-generation/charging-port-replacement": {
    quickAnswer:
      "Need iPad 11th Generation charging port replacement in Ringwood? We check USB-C wear, charger behaviour, frame alignment, and school-use impact signs before confirming quote and stock path.",
    workbenchHeadings: {
      options: "What do we check before replacing the iPad port?",
      diagnostics: "How do we confirm the USB-C fault?",
      symptoms: "Which iPad charging symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "USB-C port fit check", shortDescription: "We inspect cable fit, port wear, debris, and visible damage around the charging socket.", bestFor: "Loose charging cable, no-charge symptoms, or intermittent charging.", notes: "Do not force the cable if the port feels tight, loose, or misaligned." },
      { name: "Charger and cable test", shortDescription: "We test with known-good charging gear before confirming the port replacement path.", bestFor: "iPads that charge with one cable but not another.", notes: "Bring the charger or school cable that shows the fault if possible." },
      { name: "Frame alignment review", shortDescription: "We check whether case pressure, drops, or frame bend affects the USB-C port fit.", bestFor: "School or child-use iPads with impact marks or bent corners.", notes: "Stock and quote are confirmed before repair if the price is not already listed." },
    ],
    commonProblems: [
      { title: "USB-C port wear", description: "Daily school or home use can loosen the port or wear charging contact points." },
      { title: "Cable test differences", description: "Charging with one cable but not another can point to cable, charger, or port condition." },
      { title: "Frame or case pressure", description: "Bent corners or tight cases can affect port alignment and cable fit." },
      { title: "Backup before service", description: "If the iPad still powers on, back up important school or family data before repair." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Test charging accessories", description: "We compare charging response with known-good cable and charger." },
      { step: "02", title: "Inspect port and frame", description: "We check USB-C fit, debris, damage, frame bend, and alignment." },
      { step: "03", title: "Confirm quote and stock path", description: "We confirm repair scope, quote, and part availability before starting." },
      { step: "04", title: "Final charging checks", description: "After repair, we test cable fit and charging response before handover." },
    ],
    faq: [
      { question: "Should I bring my iPad 11th Generation charger for a port check?", answer: "Yes. If the charging issue happens with a particular cable or charger, bring it in so we can test the full charging setup." },
    ],
  },
  "phone/iphone/iphone-15-pro-max/screen-replacement": {
    quickAnswer:
      "Need iPhone 15 Pro Max screen replacement in Ringwood? We check the display image, touch response, frame edge condition, camera area, and display option fit before confirming the repair path.",
    workbenchHeadings: {
      options: "What do we check before replacing this display?",
      diagnostics: "How do we confirm the screen fault?",
      symptoms: "Which display symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "Display and touch check", shortDescription: "We test image output, touch response, dead spots, lines, and brightness behaviour before quoting.", bestFor: "Cracked glass, black display, flicker, or touch faults.", notes: "Repair option and quote are confirmed before the screen is fitted." },
      { name: "Frame and fit inspection", shortDescription: "We check edge dents, corner pressure, and housing alignment that can affect display seating.", bestFor: "Phones with impact marks, bent corners, or lifted display edges.", notes: "Frame condition can affect the final fit and is explained before repair." },
      { name: "Camera area review", shortDescription: "We inspect the top display area and front camera opening for visible impact or pressure signs.", bestFor: "Drops near the Dynamic Island or top edge of the screen.", notes: "Back up important data before repair when possible." },
    ],
    commonProblems: [
      { title: "Cracked glass with working touch", description: "Touch may still work after a crack, but glass damage can worsen with daily use." },
      { title: "Lines, flicker, or black display", description: "OLED impact symptoms can show as green lines, flicker, dark patches, or no image." },
      { title: "Weak touch response", description: "Touch faults can appear in strips, corners, or after pressure near the damaged area." },
      { title: "Frame edge damage", description: "A bent or dented edge can affect how cleanly the new display seats." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Test display and touch", description: "We check image output, brightness, touch response, and visible OLED symptoms." },
      { step: "02", title: "Inspect frame condition", description: "We look at corners, edge dents, and camera-area pressure before confirming fit." },
      { step: "03", title: "Confirm screen option", description: "We confirm the display path, quote, and repair scope before fitting parts." },
      { step: "04", title: "Final function checks", description: "After repair, we retest touch, display output, cameras, speaker, and charging response." },
    ],
    faq: [
      { question: "How long does iPhone 15 Pro Max screen replacement usually take?", answer: "Timing depends on part availability and device condition. We confirm the estimated turnaround after a quick inspection at our Ringwood store. Many common screen repairs can be completed quickly when the right part is in stock." },
      { question: "Will I lose my photos or data during the screen repair?", answer: "Your data is normally not affected by a screen replacement. However, we recommend backing up your iPhone 15 Pro Max to iCloud or a computer before bringing it in, as a precaution." },
      { question: "How much will my iPhone 15 Pro Max screen repair cost?", answer: "The final quote depends on the display option, model, parts availability and device condition. We confirm the price with you before any repair work begins." },
      { question: "What screen quality options are available?", answer: "Available display options can vary by model and stock. We explain the suitable screen options for your iPhone 15 Pro Max before repair, including differences in display quality, touch feel and budget." },
      { question: "Will my iPhone 15 Pro Max still be water resistant after the screen is fixed?", answer: "We reseal the device carefully after opening it. However, factory water resistance cannot be guaranteed after any phone has been opened, so we recommend keeping your repaired iPhone away from water." },
      { question: "Will Face ID still work after screen replacement?", answer: "Face ID usually depends on the original sensor assembly, not only the screen. If the top sensor area was damaged by the impact, we will check it before and after the repair and explain any issue we find." },
      { question: "Do you test the screen before returning the phone?", answer: "Yes. We run standard post-repair checks, including touch response, brightness, display colour, speaker area, front sensor area and general screen fit before handover." },
      { question: "Will True Tone still work after the repair?", answer: "Where supported, we try to preserve True Tone by transferring compatible display data. This depends on the chosen screen option and whether the original display data is still readable." },
      { question: "Is there warranty support for iPhone 15 Pro Max screen replacement?", answer: "Warranty support is available on eligible screen repairs. It does not cover new physical damage, pressure damage or liquid damage after the repair. We explain the applicable warranty terms before you proceed." },
      { question: "Do I need to book, or can I walk in?", answer: "Walk-ins are welcome at our Ringwood Square repair desk. Booking ahead is recommended because it helps us check part availability for your exact iPhone model before you visit." },
    ],
  },
  "phone/google/pixel-8-pro/screen-replacement": {
    quickAnswer:
      "Need Google Pixel 8 Pro screen replacement in Ringwood? We check display output, touch response, fingerprint area behaviour, frame condition, and camera-bar impact signs before quoting.",
    workbenchHeadings: {
      options: "What do we check before replacing this Pixel screen?",
      diagnostics: "How do we confirm the display fault?",
      symptoms: "Which Pixel screen symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "Display and touch diagnosis", shortDescription: "We test image output, touch response, brightness, green lines, and black-screen symptoms.", bestFor: "Cracked glass, no image, flicker, or weak touch response.", notes: "Quote and repair scope are confirmed before screen service." },
      { name: "Fingerprint and sensor check", shortDescription: "We check the lower display area and related behaviour before and after repair.", bestFor: "Screen faults near the fingerprint area or touch dead zones.", notes: "Some symptoms need testing before the repair path is confirmed." },
      { name: "Frame and camera-bar inspection", shortDescription: "We inspect edge damage, pressure marks, and camera-bar impact signs that can affect fit.", bestFor: "Drops on the corners, back, or top camera-bar area.", notes: "Back up important photos and data before repair when possible." },
    ],
    commonProblems: [
      { title: "Cracked or lifted glass", description: "Glass damage can spread and may weaken touch response over time." },
      { title: "Black display or green lines", description: "Impact can affect OLED output even when the phone still powers on." },
      { title: "Touch dead zones", description: "Touch may fail around cracks, edges, or the fingerprint area." },
      { title: "Frame pressure", description: "Bent corners or pressure near the camera bar can affect display seating." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Test display behaviour", description: "We check image output, brightness, touch, and visible OLED damage." },
      { step: "02", title: "Inspect frame and camera bar", description: "We look for impact marks that can affect repair fit." },
      { step: "03", title: "Confirm display path", description: "We confirm quote and repair scope before fitting the replacement display." },
      { step: "04", title: "Retest core functions", description: "After repair, we retest touch, display, cameras, charging, and normal use behaviour." },
    ],
    faq: [
      { question: "Do you test touch and fingerprint behaviour on Pixel 8 Pro screen repairs?", answer: "Yes. We check touch response and related display-area behaviour before and after the screen repair." },
    ],
  },
  "phone/oppo/find-x3-pro/charging-port-replacement": {
    quickAnswer:
      "Need Oppo Find X3 Pro charging port replacement in Ringwood? We check USB-C fit, cable behaviour, dust, corrosion, charging response, and lower-board symptoms before confirming the repair.",
    workbenchHeadings: {
      options: "What do we check before replacing this port?",
      diagnostics: "How do we confirm the charging fault?",
      symptoms: "Which charging symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "Cable and charger check", shortDescription: "We compare charging response with known-good USB-C cable and power adapter.", bestFor: "Phones that charge with one cable but not another.", notes: "Bring the cable or charger that shows the issue if possible." },
      { name: "USB-C socket inspection", shortDescription: "We inspect the port for looseness, debris, bent contact signs, corrosion, or liquid marks.", bestFor: "Loose cable fit, no-charge symptoms, or angle-only charging.", notes: "Avoid forcing the cable if the connection feels unstable." },
      { name: "Charging path diagnosis", shortDescription: "We check whether symptoms point to the socket, lower board, or related charging path.", bestFor: "Intermittent charging or no response after accessory testing.", notes: "Quote and scope are confirmed before parts are fitted." },
    ],
    commonProblems: [
      { title: "Loose USB-C fit", description: "Wear or debris can stop the cable from seating cleanly." },
      { title: "Angle-only charging", description: "Charging only at certain angles often points to socket wear or obstruction." },
      { title: "Dust or corrosion", description: "Pocket lint, moisture, or corrosion can interrupt stable charging contact." },
      { title: "Accessory mismatch", description: "Some faults are cable or adapter related, so we test accessories before replacing parts." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Test known-good charging gear", description: "We check whether the phone responds with reliable USB-C cable and adapter." },
      { step: "02", title: "Inspect the charging port", description: "We look for debris, loose fit, corrosion, and visible liquid signs." },
      { step: "03", title: "Confirm repair scope", description: "We confirm whether the fault fits a port or charging path repair before quoting." },
      { step: "04", title: "Final charging test", description: "After repair, we test cable fit and charging response before handover." },
    ],
    faq: [
      { question: "Should I bring my charger for Oppo Find X3 Pro charging port diagnosis?", answer: "Yes. Bring the charger or cable that causes the issue so we can test the full charging setup before confirming repair." },
    ],
  },
  "laptop/macbook/macbook-pro-13-m1-2020/battery-replacement": {
    quickAnswer:
      "Need MacBook Pro 13 M1 2020 battery replacement in Ringwood? We check battery condition, cycle symptoms, charging response, top-case fit, and trackpad behaviour before confirming the repair.",
    workbenchHeadings: {
      options: "What do we check before replacing this MacBook battery?",
      diagnostics: "How do we confirm the battery fault?",
      symptoms: "Which MacBook battery symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "Battery condition review", shortDescription: "We check battery health, runtime symptoms, shutdowns, charging response, and swelling signs.", bestFor: "Fast drain, service battery warnings, or short runtime.", notes: "Quote and part path are confirmed before repair." },
      { name: "Charger and port test", shortDescription: "We test USB-C charging response before assuming the battery is the only issue.", bestFor: "MacBooks that charge intermittently or only with certain adapters.", notes: "Bring the charger that shows the issue if possible." },
      { name: "Top case and trackpad check", shortDescription: "We inspect the top case, trackpad pressure, and lower housing fit for swelling-related symptoms.", bestFor: "Trackpad stiffness, case lift, or visible battery swelling risk.", notes: "Back up important data before service when possible." },
    ],
    commonProblems: [
      { title: "Short battery runtime", description: "Battery wear can reduce unplugged runtime and make the MacBook shut down sooner." },
      { title: "Service battery warning", description: "macOS battery warnings can point to ageing or unstable battery condition." },
      { title: "Charging inconsistency", description: "Charging faults can involve the adapter, USB-C path, or battery condition." },
      { title: "Swelling pressure signs", description: "Battery swelling can affect the trackpad, top case, or lower housing fit." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Check power symptoms", description: "We review battery condition, runtime, shutdowns, and charging behaviour." },
      { step: "02", title: "Test charger and USB-C response", description: "We test charging with known-good gear before confirming battery replacement." },
      { step: "03", title: "Inspect case and trackpad", description: "We check for swelling pressure, trackpad stiffness, and housing fit." },
      { step: "04", title: "Final power checks", description: "After repair, we check charging response, startup, trackpad feel, and normal power behaviour." },
    ],
    faq: [
      { question: "Should I back up my MacBook before battery replacement?", answer: "Yes. If the MacBook still powers on, back up important data before bringing it in for battery service." },
    ],
  },
  "phone/samsung/galaxy-s24-ultra/screen-replacement": {
    quickAnswer:
      "Need Samsung Galaxy S24 Ultra screen replacement in Ringwood? We check OLED output, flicker and line symptoms, touch response, frame condition, and fit risk before confirming the repair path.",
    workbenchHeadings: {
      options: "What do we check before replacing this display?",
      diagnostics: "How do we confirm the screen fault?",
      symptoms: "Which display symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "OLED and touch diagnosis", shortDescription: "We test display output, touch coverage, brightness behaviour, and dead-zone patterns before quoting.", bestFor: "Black screen, line/flicker issues, touch loss, or cracked display glass.", notes: "Quote and screen path are confirmed before parts are fitted." },
      { name: "Frame and corner inspection", shortDescription: "We inspect frame edges, corners, and impact points that can affect display seating and fit.", bestFor: "Drops with visible corner dents or frame pressure around the display.", notes: "Frame-related risk is explained clearly before repair starts." },
      { name: "Post-repair function checks", shortDescription: "After fitting, we retest display output, touch response, cameras, speaker, and charging response.", bestFor: "Customers who want practical handover checks on core daily-use functions.", notes: "Back up important data before repair when possible." },
    ],
    commonProblems: [
      { title: "Flicker or line artefacts", description: "Impact can cause OLED output faults such as lines, flicker, or partial image loss." },
      { title: "Touch dead zones", description: "Touch may stop responding in strips or corners after screen or frame impact." },
      { title: "Frame pressure damage", description: "Corner dents or edge pressure can affect new display seating quality." },
      { title: "Visible crack spread", description: "Cracks can expand with daily use and make touch behaviour less stable." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Display and touch test", description: "We confirm OLED output condition, brightness behaviour, and touch coverage." },
      { step: "02", title: "Inspect frame impact points", description: "We check corners and edge fit risks before confirming screen replacement." },
      { step: "03", title: "Confirm quote and repair scope", description: "We confirm the display path and quote before fitting the replacement screen." },
      { step: "04", title: "Final handover checks", description: "We retest display, touch, camera, speaker, and charging behaviour before handover." },
    ],
    faq: [
      { question: "Do you check frame damage before Galaxy S24 Ultra screen replacement?", answer: "Yes. We inspect frame and corner condition first because impact points can affect display fit and repair stability." },
    ],
  },
  "phone/iphone/iphone-13/screen-replacement": {
    quickAnswer:
      "Need iPhone 13 screen replacement in Ringwood? We check crack spread, touch drift, display output, frame seating risk, and top camera area condition before confirming quote and repair path.",
    workbenchHeadings: {
      options: "What do we check before replacing this iPhone 13 screen?",
      diagnostics: "How do we confirm the display fault?",
      symptoms: "Which screen symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "Display and touch assessment", shortDescription: "We test image output, touch drift, dead zones, and flicker/line symptoms before repair.", bestFor: "Cracked glass, no image, touch lag, or unstable touch response.", notes: "Repair option and quote are confirmed before fitting the new display." },
      { name: "Frame seating and fit check", shortDescription: "We inspect frame edges and pressure points that can affect clean screen seating.", bestFor: "Phones with corner drops, bent edges, or lifted screen sections.", notes: "Frame fit risks are explained before service starts." },
      { name: "Top camera area review", shortDescription: "We inspect the top display area for impact around the front camera/sensor region.", bestFor: "Damage near the notch area or front glass upper edge.", notes: "Back up important data before repair when possible." },
    ],
    commonProblems: [
      { title: "Crack spread over time", description: "Small cracks can expand and gradually affect touch accuracy." },
      { title: "Touch drift or lag", description: "Touch can register inconsistently after display impact or pressure damage." },
      { title: "Flicker or black image", description: "Display impact can cause intermittent image loss or full black screen symptoms." },
      { title: "Frame seating issues", description: "Edge dents can affect how well the replacement display seats." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Test display response", description: "We confirm image condition, brightness, and touch behaviour across the panel." },
      { step: "02", title: "Inspect frame and top area", description: "We check frame fit and top camera/sensor region before confirming repair path." },
      { step: "03", title: "Confirm quote and display option", description: "We confirm display path and quote before fitting the replacement screen." },
      { step: "04", title: "Final function checks", description: "We retest display quality, touch response, cameras, speaker, and charging at handover." },
    ],
    faq: [
      { question: "How long does iPhone 13 screen replacement usually take?", answer: "Timing depends on part availability and device condition. We confirm the estimated turnaround after a quick inspection at our Ringwood store. Many common screen repairs can be completed quickly when the right part is in stock." },
      { question: "Will I lose my photos or data during the screen repair?", answer: "Your data is normally not affected by a screen replacement. However, we recommend backing up your iPhone 13 to iCloud or a computer before bringing it in, as a precaution." },
      { question: "How much will my iPhone 13 screen repair cost?", answer: "The final quote depends on the display option, model, parts availability and device condition. We confirm the price with you before any repair work begins." },
      { question: "What screen quality options are available?", answer: "Available display options can vary by model and stock. We explain the suitable screen options for your iPhone 13 before repair, including differences in display quality, touch feel and budget." },
      { question: "Will my iPhone 13 still be water resistant after the screen is fixed?", answer: "We reseal the device carefully after opening it. However, factory water resistance cannot be guaranteed after any phone has been opened, so we recommend keeping your repaired iPhone away from water." },
      { question: "Will Face ID still work after screen replacement?", answer: "Face ID usually depends on the original sensor assembly, not only the screen. If the top sensor area was damaged by the impact, we will check it before and after the repair and explain any issue we find." },
      { question: "Do you test the screen before returning the phone?", answer: "Yes. We run standard post-repair checks, including touch response, brightness, display colour, speaker area, front sensor area and general screen fit before handover." },
      { question: "Will True Tone still work after the repair?", answer: "Where supported, we try to preserve True Tone by transferring compatible display data. This depends on the chosen screen option and whether the original display data is still readable." },
      { question: "Is there warranty support for iPhone 13 screen replacement?", answer: "Warranty support is available on eligible screen repairs. It does not cover new physical damage, pressure damage or liquid damage after the repair. We explain the applicable warranty terms before you proceed." },
      { question: "Do I need to book, or can I walk in?", answer: "Walk-ins are welcome at our Ringwood Square repair desk. Booking ahead is recommended because it helps us check part availability for your exact iPhone model before you visit." },
    ],
  },
  "tablet/ipad/ipad-9th-generation/screen-replacement": {
    quickAnswer:
      "Need iPad 9th Generation screen replacement in Ringwood? We check glass damage, touch response, frame pressure, and button/camera-area condition before confirming quote and repair scope.",
    workbenchHeadings: {
      options: "What do we check before replacing this iPad screen?",
      diagnostics: "How do we confirm the display fault?",
      symptoms: "Which screen symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "Glass and touch assessment", shortDescription: "We inspect crack spread and test touch response across the full panel before quoting.", bestFor: "Cracked glass, touch dead zones, ghost touch, or weak touch response.", notes: "Quote and display path are confirmed before repair starts." },
      { name: "Frame and corner pressure check", shortDescription: "We inspect frame bend and corner pressure that can affect new screen seating.", bestFor: "Tablets with corner drops, bent edges, or visible frame stress.", notes: "Any fit risk is explained before parts are fitted." },
      { name: "Button and camera-area condition review", shortDescription: "We check home button feel and front camera area condition where impact is visible.", bestFor: "Damage near button/camera region or upper glass edge.", notes: "Back up important data before repair when possible." },
    ],
    commonProblems: [
      { title: "Cracked glass with partial touch", description: "Touch can still work in parts but usually gets less stable over time." },
      { title: "Touch response instability", description: "Impact can cause dead zones, delayed touch, or ghost input behaviour." },
      { title: "Frame bend or corner stress", description: "Frame pressure can affect how cleanly the replacement screen sits." },
      { title: "Button and camera-area overlap", description: "Damage near button or camera zones can affect nearby function checks." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Inspect glass and frame condition", description: "We assess crack spread, corner pressure, and frame shape before opening." },
      { step: "02", title: "Test display and touch behavior", description: "We test panel image output and touch response across the full screen." },
      { step: "03", title: "Confirm quote and repair scope", description: "We confirm the screen path and quote before fitting the replacement display." },
      { step: "04", title: "Final function checks", description: "After repair, we retest display, touch, front camera area, and button response." },
    ],
    faq: [
      { question: "Should I back up my iPad 9th Generation before screen replacement?", answer: "Yes. If the iPad still powers on, backing up important data before repair is recommended." },
    ],
  },
  "phone/iphone/iphone-16-pro/screen-replacement": {
    quickAnswer:
      "Need iPhone 16 Pro screen replacement in Ringwood? We check display image faults, touch response, frame fit, and the front sensor area before confirming the screen repair path.",
    workbenchHeadings: {
      options: "What do we check before replacing this iPhone 16 Pro display?",
      diagnostics: "How do we confirm the screen fault?",
      symptoms: "Which display symptoms matter most?",
      outcomes: "What do we retest before handover?",
    },
    repairOptions: [
      { name: "Display and touch diagnosis", shortDescription: "We test image output, touch coverage, brightness behaviour, black-screen symptoms, and visible crack spread before quoting.", bestFor: "Cracked glass, dead touch areas, flicker, or display image loss.", notes: "We confirm the screen repair path before parts are fitted." },
      { name: "Front sensor and frame fit check", shortDescription: "We inspect the Face ID and front sensor area, edge dents, and frame pressure that can affect display seating.", bestFor: "Top-edge damage, bent corners, or lifted display sections.", notes: "Frame fit risk is explained before work begins." },
      { name: "Final function retest", shortDescription: "After fitting, we retest touch, brightness, proximity behaviour, speaker and mic response, and front camera area function.", bestFor: "Customers who want practical post-repair checks on the main daily-use functions.", notes: "Back up important data before repair when possible." },
    ],
    commonProblems: [
      { title: "Cracked glass with unstable touch", description: "A cracked panel may still work in parts, but touch accuracy and edge response can worsen over time." },
      { title: "Black screen, lines, or weak brightness", description: "Impact can damage OLED output even when the phone still vibrates or powers on." },
      { title: "Face ID or top sensor area concern", description: "Drops near the top edge can overlap with the front sensor area, so we check that zone before repair." },
      { title: "Frame bend affecting fit", description: "Corner dents or edge pressure can stop a fresh display from seating cleanly." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Test display behaviour", description: "We check image output, touch response, brightness, and visible OLED symptoms before quoting." },
      { step: "02", title: "Inspect frame and top sensor area", description: "We look at edge dents, corner pressure, and the front sensor area before confirming fit." },
      { step: "03", title: "Confirm quote and screen path", description: "We confirm the repair scope before fitting the replacement display." },
      { step: "04", title: "Final handover checks", description: "After repair, we retest touch, brightness, proximity response, speaker, mic, and camera-area function." },
    ],
    faq: [
      { question: "How long does iPhone 16 Pro screen replacement usually take?", answer: "Timing depends on part availability and device condition. We confirm the estimated turnaround after a quick inspection at our Ringwood store. Many common screen repairs can be completed quickly when the right part is in stock." },
      { question: "Will I lose my photos or data during the screen repair?", answer: "Your data is normally not affected by a screen replacement. However, we recommend backing up your iPhone 16 Pro to iCloud or a computer before bringing it in, as a precaution." },
      { question: "How much will my iPhone 16 Pro screen repair cost?", answer: "The final quote depends on the display option, model, parts availability and device condition. We confirm the price with you before any repair work begins." },
      { question: "What screen quality options are available?", answer: "Available display options can vary by model and stock. We explain the suitable screen options for your iPhone 16 Pro before repair, including differences in display quality, touch feel and budget." },
      { question: "Will my iPhone 16 Pro still be water resistant after the screen is fixed?", answer: "We reseal the device carefully after opening it. However, factory water resistance cannot be guaranteed after any phone has been opened, so we recommend keeping your repaired iPhone away from water." },
      { question: "Will Face ID still work after screen replacement?", answer: "Face ID usually depends on the original sensor assembly, not only the screen. If the top sensor area was damaged by the impact, we will check it before and after the repair and explain any issue we find." },
      { question: "Do you test the screen before returning the phone?", answer: "Yes. We run standard post-repair checks, including touch response, brightness, display colour, speaker area, front sensor area and general screen fit before handover." },
      { question: "Will True Tone still work after the repair?", answer: "Where supported, we try to preserve True Tone by transferring compatible display data. This depends on the chosen screen option and whether the original display data is still readable." },
      { question: "Is there warranty support for iPhone 16 Pro screen replacement?", answer: "Warranty support is available on eligible screen repairs. It does not cover new physical damage, pressure damage or liquid damage after the repair. We explain the applicable warranty terms before you proceed." },
      { question: "Do I need to book, or can I walk in?", answer: "Walk-ins are welcome at our Ringwood Square repair desk. Booking ahead is recommended because it helps us check part availability for your exact iPhone model before you visit." },
    ],
  },
  "phone/samsung/galaxy-s23-ultra/screen-replacement": {
    quickAnswer:
      "Need Galaxy S23 Ultra screen replacement in Ringwood? We check AMOLED output, touch response, frame impact points, fingerprint area behaviour, and final display fit before confirming the repair path.",
    workbenchHeadings: {
      options: "What do we check before replacing this S23 Ultra screen?",
      diagnostics: "How do we confirm the display fault?",
      symptoms: "Which screen symptoms matter most?",
      outcomes: "What do we retest before handover?",
    },
    repairOptions: [
      { name: "AMOLED and touch diagnosis", shortDescription: "We test image output, black-screen symptoms, line or flicker faults, and touch coverage across the full panel.", bestFor: "Cracked glass, no image, partial touch, or unstable display output.", notes: "The screen path and quote are confirmed before parts are fitted." },
      { name: "Frame, corner, and edge response check", shortDescription: "We inspect corner dents, frame pressure, and edge response across the large curved display area.", bestFor: "Phones dropped on corners or with visible housing pressure around the screen.", notes: "Frame-related fit risks are explained before service." },
      { name: "Fingerprint and final function testing", shortDescription: "After fitting, we retest display output, touch, fingerprint-area behaviour, and core daily-use functions.", bestFor: "Customers who want practical confirmation that the main functions were rechecked before handover.", notes: "Back up important data before repair when possible." },
    ],
    commonProblems: [
      { title: "Large AMOLED line or flicker faults", description: "Impact can cause line artefacts, flicker, black patches, or full image loss on the curved display." },
      { title: "Touch or edge-response issues", description: "Dead zones can appear along the edges or corners after screen or frame damage." },
      { title: "Fingerprint-area concern", description: "Display faults near the lower screen area can overlap with fingerprint-use behaviour and need testing." },
      { title: "Frame and corner impact", description: "A bent frame or dented corner can affect how a replacement display sits." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Check display and touch behaviour", description: "We test AMOLED output, brightness, line/flicker symptoms, and touch coverage." },
      { step: "02", title: "Inspect the frame and corners", description: "We look for pressure points and impact marks that can affect display seating." },
      { step: "03", title: "Confirm quote and repair scope", description: "We confirm the screen repair path before fitting the replacement display." },
      { step: "04", title: "Retest core functions", description: "After repair, we retest touch, fingerprint-area response, display output, and main daily-use functions before handover." },
    ],
    faq: [
      { question: "Do you test fingerprint and edge response on Galaxy S23 Ultra screen repairs?", answer: "Yes. We check lower-screen behaviour, touch coverage, and edge response as part of the screen replacement process and final testing." },
    ],
  },
  "phone/google/pixel-7-pro/screen-replacement": {
    quickAnswer:
      "Need Pixel 7 Pro screen replacement in Ringwood? We check curved OLED symptoms, touch dead zones, fingerprint-area behaviour, frame pressure, and camera-area condition before confirming the repair path.",
    workbenchHeadings: {
      options: "What do we check before replacing this Pixel 7 Pro display?",
      diagnostics: "How do we confirm the screen fault?",
      symptoms: "Which Pixel display symptoms matter most?",
      outcomes: "What do we retest before handover?",
    },
    repairOptions: [
      { name: "Curved OLED diagnosis", shortDescription: "We test black-screen faults, green lines, flicker, brightness behaviour, and curved-edge touch response before quoting.", bestFor: "Cracked glass, no image, display lines, or touch loss.", notes: "We confirm the repair path before fitting the replacement screen." },
      { name: "Fingerprint and frame pressure review", shortDescription: "We inspect lower-screen behaviour, frame pressure, and edge damage that can affect display fit.", bestFor: "Phones with corner drops, lower-screen faults, or visible housing stress.", notes: "Fit risks are explained before repair begins." },
      { name: "Final daily-use function check", shortDescription: "After fitting, we retest touch, brightness, fingerprint-area behaviour, calls, charging response, and camera-area function.", bestFor: "Customers who want the main day-to-day functions checked before handover.", notes: "Back up important data before repair when possible." },
    ],
    commonProblems: [
      { title: "Green line, black screen, or flicker", description: "Curved OLED panels can show line artefacts, dark image loss, or flicker after impact." },
      { title: "Touch dead zones", description: "Touch may fail around cracked zones or near the screen edges after pressure damage." },
      { title: "Frame pressure near the camera area", description: "Drops around the upper housing can affect fit and should be checked before screen replacement." },
      { title: "Fingerprint-area overlap", description: "Display damage near the lower screen area can overlap with fingerprint-use behaviour and needs retesting." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Test display behaviour", description: "We check OLED output, brightness, touch, and visible line or flicker symptoms." },
      { step: "02", title: "Inspect frame and camera-area condition", description: "We look for corner pressure, housing stress, and impact near the camera area before confirming fit." },
      { step: "03", title: "Confirm quote and screen path", description: "We confirm the repair scope before fitting the replacement display." },
      { step: "04", title: "Final handover checks", description: "After repair, we retest touch, display output, charging response, calls, and lower-screen behaviour before handover." },
    ],
    faq: [
      { question: "Do you check fingerprint-area behaviour on Pixel 7 Pro screen repairs?", answer: "Yes. We check lower-screen behaviour as part of the display diagnosis and final function testing after the repair." },
    ],
  },
  "tablet/ipad/ipad-pro-11-inch-4th-generation/screen-replacement": {
    quickAnswer:
      "Need iPad Pro 11-inch 4th Generation screen replacement in Ringwood? We check glass, display, touch response, frame pressure, and front camera/Face ID area condition before confirming the repair path.",
    workbenchHeadings: {
      options: "What do we check before replacing this iPad Pro screen?",
      diagnostics: "How do we confirm the display fault?",
      symptoms: "Which screen symptoms matter most?",
      outcomes: "What should you prepare before booking?",
    },
    repairOptions: [
      { name: "Glass, display, and touch assessment", shortDescription: "We check crack spread, image output, touch response, and visible panel damage before quoting.", bestFor: "Cracked glass, no image, touch dead zones, or weak panel response.", notes: "We confirm the screen path before repair starts." },
      { name: "Frame pressure and camera-area review", shortDescription: "We inspect bent corners, frame pressure, and the front camera or Face ID area where impact is visible.", bestFor: "Tablets with corner drops, bent edges, or upper-screen damage.", notes: "Any fit risk is explained before parts are fitted." },
      { name: "Accessory and final function testing", shortDescription: "After fitting, we retest touch response, Apple Pencil interaction where relevant, and the core front-camera and display functions.", bestFor: "Customers who want practical daily-use functions rechecked before handover.", notes: "If the iPad still powers on, backing up important data before repair is recommended." },
    ],
    commonProblems: [
      { title: "Cracked glass with mixed touch response", description: "The display may still show an image, but touch can become unstable around damaged sections." },
      { title: "Display or touch-layer overlap", description: "Some impacts affect the glass, display image, and touch layer together, so we test all three before quoting." },
      { title: "Bent frame or corner pressure", description: "A bent edge can affect how cleanly the replacement screen sits." },
      { title: "Front camera or Face ID area concern", description: "Impact near the top of the iPad should be checked before confirming the repair scope." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Inspect glass and housing condition", description: "We assess crack spread, corner pressure, and whether the frame is safe to open." },
      { step: "02", title: "Test display and touch behaviour", description: "We check image output, touch response, and visible panel issues before confirming the repair path." },
      { step: "03", title: "Confirm quote and screen scope", description: "We confirm the repair scope before fitting the replacement screen." },
      { step: "04", title: "Retest display and accessory use", description: "After repair, we retest touch, display function, and Apple Pencil or front-camera behaviour where relevant." },
    ],
    faq: [
      { question: "Should I back up my iPad Pro 11-inch 4th Generation before screen replacement?", answer: "Yes. If the iPad still powers on, backing up important data before repair is recommended." },
    ],
  },
  "laptop/macbook/macbook-pro-1416-m1-promax-2021/screen-replacement": {
    quickAnswer:
      "Need MacBook Pro 14 or 16 M1 Pro/Max 2021 screen replacement in Ringwood? We diagnose display assembly faults, lid-angle symptoms, hinge condition, and top-case overlap before confirming the screen repair path.",
    workbenchHeadings: {
      options: "What do we check before replacing this MacBook display?",
      diagnostics: "How do we confirm the screen fault?",
      symptoms: "Which display symptoms matter most?",
      outcomes: "What should you expect before handover?",
    },
    repairOptions: [
      { name: "Display assembly diagnosis", shortDescription: "We check cracked LCD, line artefacts, backlight issues, black screen symptoms, and lid-angle related display faults before quoting.", bestFor: "Cracked screens, image loss, lines, or a display that cuts in and out when the lid moves.", notes: "We confirm whether the fault matches a display assembly repair before ordering or fitting parts." },
      { name: "Hinge and top-case condition review", shortDescription: "We inspect hinge movement, lid alignment, and visible housing stress that can affect the replacement path.", bestFor: "Drops, lid pressure, or signs that the display damage overlaps with hinge or housing condition.", notes: "Battery, keyboard, and trackpad are not included unless separately quoted." },
      { name: "Final system function testing", shortDescription: "After fitting, we retest display output, webcam, sleep/wake behaviour, and external display output where relevant.", bestFor: "Customers who want practical post-repair checks on the main screen-related functions.", notes: "Repair timing depends on part availability and bench inspection." },
    ],
    commonProblems: [
      { title: "Cracked LCD or display lines", description: "A hit to the lid can cause lines, black sections, or no image even if the machine still boots normally." },
      { title: "Backlight or lid-angle faults", description: "Some screen faults appear when the lid moves or the backlight cuts in and out." },
      { title: "Hinge or lid alignment concern", description: "Drops or closing pressure can affect hinge movement and should be checked before the display path is confirmed." },
      { title: "Top-case overlap questions", description: "Customers often ask whether battery, keyboard, or trackpad are included, so we confirm scope clearly before repair." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Check display assembly symptoms", description: "We review LCD damage, lines, backlight behaviour, and lid-angle symptoms before confirming the repair path." },
      { step: "02", title: "Inspect hinge and housing condition", description: "We check hinge movement, lid alignment, and whether housing condition affects the display replacement scope." },
      { step: "03", title: "Confirm quote and part path", description: "We confirm the screen assembly scope, quote, and part-availability timing before work begins." },
      { step: "04", title: "Final screen-related checks", description: "After repair, we retest display output, camera, sleep/wake, and external display function where relevant before handover." },
    ],
    faq: [
      { question: "Does MacBook Pro 14 or 16 M1 Pro/Max 2021 screen replacement include battery or keyboard parts?", answer: "No. Screen replacement is quoted separately from battery, keyboard, or trackpad work unless inspection shows another repair is needed and you approve it first." },
    ],
  },
};

function getPriorityRepairSeoPocket(category: string, brand: string, model: string, repairType: string) {
  if (category === 'tablet' && (brand === 'ipad' || brand === 'apple' || model.startsWith('ipad-'))) {
    return null;
  }

  return PRIORITY_REPAIR_SEO_POCKETS[`${category}/${brand}/${model}/${repairType}`] || null;
}

function getRepairTypeSeoPocket(params: {
  category: string;
  brand: string;
  model: string;
  repairType: string;
}): RepairTypeSeoPocket | null {
  const category = slugify(params.category);
  const brand = slugify(params.brand);
  const model = slugify(params.model);
  const repairType = slugify(params.repairType);

  const priorityPocket = getPriorityRepairSeoPocket(category, brand, model, repairType);
  if (priorityPocket) return priorityPocket;

  if (category === "phone" && (brand === "iphone" || brand === "apple")) {
    const modelName = deriveIphoneModelNameFromSlug(model);
    const pocket = IPHONE_REPAIR_POCKET_TEMPLATE_BY_TYPE[repairType];

    if (modelName && pocket) {
      return personalizeIphoneRepairPocket(pocket, modelName, repairType, model);
    }
  }

  if (category === "phone" && (brand === "google" || brand === "google-pixel" || brand === "googlepixel" || brand === "pixel")) {
    const googlePocket = getGooglePixelRepairPocket(model, repairType);
    if (googlePocket) return googlePocket;
  }

  if (category === "phone" && (brand === "oppo" || brand.startsWith("oppo-"))) {
    const oppoPocket = getOppoRepairPocket(model, repairType);
    if (oppoPocket) return oppoPocket;
  }

  if (category === "tablet") {
    const isIpadBrand = brand === "ipad" || brand === "apple";
    const isSamsungTablet = isSamsungTabletBrand(brand) && isSamsungTabletModelSlug(model);

    if (isIpadBrand || isSamsungTablet) {
      const modelName = deriveTabletModelName(model, brand);
      return buildTabletRepairPocket(modelName, repairType, {
        isIpad: isIpadBrand || model.startsWith("ipad"),
        isSamsungTablet,
      });
    }
  }

  if (category === "laptop") {
    const modelName = deriveLaptopModelName(model);
    if (modelName) {
      return buildLaptopRepairPocket(modelName, repairType);
    }
  }

  if (category === "watch" && (brand === "apple" || brand === "apple-watch")) {
    const modelName = deriveWatchModelName(model);
    return buildWatchRepairPocket(modelName, repairType);
  }

  return null;
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();
  const params: { category: string; brand: string; model: string; 'repair-type': string }[] = [];
  const seen = new Set<string>();

  for (const brand of catalog.brands) {
    for (const model of brand.models) {
      for (const repair of model.repairTypes) {
        if (!repair.slug || !repair.slug.trim()) continue;

        const publicRepairSlug = getPublicRepairSlug(brand.category, brand.slug, model.slug, repair.slug);
        if (!publicRepairSlug || !publicRepairSlug.trim()) continue;
        if (isWaterDamageRepairSlug(publicRepairSlug)) continue;

        const dedupeKey = [
          brand.category,
          brand.slug,
          model.slug,
          publicRepairSlug,
        ].join("|");

        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        params.push({
          category: brand.category,
          brand: brand.slug,
          model: model.slug,
          'repair-type': publicRepairSlug,
        });
      }
    }
  }

  return [
    ...params,
    ...getGrandfatheredWaterDamageStaticParams(),
  ];
}

/** Stable hash: deterministic index from a string (sum of char codes mod length). */
function stableHash(str: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash + str.charCodeAt(i) * (i + 1)) % 1_000_000;
  }
  return hash % modulo;
}

const META_DESCRIPTION_TEMPLATES = [
  (m: string, r: string) =>
    `Fast, professional ${m} ${r.toLowerCase()} in Ringwood, Melbourne. Fast quote and repair options, warranty support on eligible repairs, No Fix No Charge. Book now.`,
  (m: string, r: string) =>
    `Need a ${m} ${r.toLowerCase()}? Our Ringwood experts offer fast turnaround for many common repairs with premium-quality parts and warranty support on eligible repairs.`,
  (m: string, r: string) =>
    `Walk-in ${m} ${r.toLowerCase()} at Ali Mobile Ringwood. Same-day options may be available for common repairs when parts are in stock, with transparent pricing and free diagnostics.`,
  (m: string, r: string) =>
    `Expert ${m} ${r.toLowerCase()} service near you in Ringwood. Fast quote and repair options, warranty support on eligible parts, and free diagnostics. Get started today.`,
];

const PHONE_BACK_GLASS_PUBLIC_SLUG = "back-glass-replacement";
const PHONE_BACK_HOUSING_INTERNAL_SLUG = "back-housing-replacement";
const IPHONE_BACK_GLASS_DISPLAY_NAME = "Back Glass / Back Housing Replacement";
const NON_IPHONE_BACK_GLASS_DISPLAY_NAME = "Back Glass Replacement";
const IPHONE_BACK_HOUSING_NOTICE_MODEL_PREFIXES = [
  "iphone-8",
  "iphone-x",
  "iphone-xs",
  "iphone-xr",
  "iphone-11",
  "iphone-12",
  "iphone-13",
  "iphone-14-pro",
];

function isIphoneBackGlassPublicAlias(category: string, brand: string, repairSlug: string) {
  return category === "phone" && brand === "iphone" && repairSlug === PHONE_BACK_GLASS_PUBLIC_SLUG;
}

function isSamsungNoteBackGlassPublicAlias(
  category: string,
  brand: string,
  modelSlug: string,
  repairSlug: string
) {
  if (category !== "phone" || brand !== "samsung" || repairSlug !== PHONE_BACK_GLASS_PUBLIC_SLUG) {
    return false;
  }

  const samsungConfig = getSamsungHardwareConfig(modelSlug);
  return samsungConfig?.seriesFamily === 'galaxy-note';
}

function isGooglePixelBackGlassPublicAlias(category: string, brand: string, repairSlug: string) {
  return category === "phone" && brand === "google-pixel" && repairSlug === PHONE_BACK_GLASS_PUBLIC_SLUG;
}


function usesPhoneBackGlassPublicAlias(
  category: string,
  brand: string,
  modelSlug: string,
  repairSlug: string
) {
  return (
    isIphoneBackGlassPublicAlias(category, brand, repairSlug) ||
    isSamsungNoteBackGlassPublicAlias(category, brand, modelSlug, repairSlug) ||
    isGooglePixelBackGlassPublicAlias(category, brand, repairSlug) ||
    (category === "phone" && brand === "oppo" && repairSlug === PHONE_BACK_GLASS_PUBLIC_SLUG)
  );
}

function resolveRepairSlugForLookup(category: string, brand: string, modelSlug: string, repairSlug: string) {
  // Back Housing Replacement is normalized at the API/Data layer to back-glass-replacement.
  // The catalog natively contains 'back-glass-replacement', so we can just look it up directly.
  return repairSlug;
}

function getPublicRepairSlug(category: string, brand: string, modelSlug: string, repairSlug: string) {
  if (
    category === "phone" &&
    repairSlug === PHONE_BACK_HOUSING_INTERNAL_SLUG &&
    (
      brand === "iphone" ||
      brand === "google-pixel" ||
      brand === "oppo" ||
      getSamsungHardwareConfig(modelSlug)?.seriesFamily === 'galaxy-note'
    )
  ) {
    return PHONE_BACK_GLASS_PUBLIC_SLUG;
  }

  return repairSlug;
}

function getRepairDisplayName(
  category: string,
  brand: string,
  modelSlug: string,
  publicRepairSlug: string,
  repairName: string
) {
  if (isIphoneBackGlassPublicAlias(category, brand, publicRepairSlug)) {
    return brand === "iphone" ? IPHONE_BACK_GLASS_DISPLAY_NAME : NON_IPHONE_BACK_GLASS_DISPLAY_NAME;
  }

  if (isSamsungNoteBackGlassPublicAlias(category, brand, modelSlug, publicRepairSlug)) {
    return NON_IPHONE_BACK_GLASS_DISPLAY_NAME;
  }

  if (isGooglePixelBackGlassPublicAlias(category, brand, publicRepairSlug)) {
    return NON_IPHONE_BACK_GLASS_DISPLAY_NAME;
  }


  return repairName;
}

function shouldShowIphoneBackHousingNotice(category: string, brand: string, modelSlug: string, repairSlug: string) {
  if (category !== "phone" || brand !== "iphone") return false;
  if (repairSlug !== PHONE_BACK_GLASS_PUBLIC_SLUG && repairSlug !== PHONE_BACK_HOUSING_INTERNAL_SLUG) return false;

  const normalizedModel = slugify(modelSlug);
  return IPHONE_BACK_HOUSING_NOTICE_MODEL_PREFIXES.some((prefix) => normalizedModel === prefix || normalizedModel.startsWith(`${prefix}-`));
}

function isUnsupportedSamsungNoteRepairRoute(resolvedParams: Awaited<RepairPageProps['params']>) {
  const noteConfig = getSamsungHardwareConfig(resolvedParams.model);
  if (!noteConfig || noteConfig.seriesFamily !== 'galaxy-note') {
    return false;
  }

  return getAliMobileEnhancedSamsungRepairType({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    'repair-type': resolvedParams['repair-type'],
  }) === null;
}

function isUnsupportedGooglePixelRepairRoute(resolvedParams: Awaited<RepairPageProps['params']>) {
  if (resolvedParams.brand !== 'google-pixel' && resolvedParams.brand !== 'google') {
    return false;
  }

  return getAliMobileEnhancedGooglePixelRepairType({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    'repair-type': resolvedParams['repair-type'],
  }) === null;
}

async function resolveRepairRouteParams(rawParams: Awaited<RepairPageProps['params']>) {
  const canonicalBrand = getCanonicalBrandSlug(rawParams.brand);
  const canonicalRepairSlug = isWaterDamageRepairSlug(rawParams['repair-type'])
    ? 'water-damage-repair'
    : rawParams['repair-type'];
  const catalog = await fetchRepairCatalog();
  const brandEntry = catalog.brands.find(
    (brand) => brand.category === rawParams.category && brand.slug === canonicalBrand
  );
  const modelEntry = brandEntry?.models.find((model) => model.slug === rawParams.model);

  const logicBoardRouteDecision = resolveLegacyLogicBoardRoute({
    category: rawParams.category,
    brand: canonicalBrand,
    model: rawParams.model,
    requestedRepairSlug: rawParams['repair-type'],
    modelExists: Boolean(brandEntry && modelEntry),
    canonicalLogicBoardServiceExists: Boolean(
      modelEntry?.repairTypes.some((repair) => repair.slug === CANONICAL_LOGIC_BOARD_REPAIR_SLUG)
    ),
  });

  if (logicBoardRouteDecision.type === 'not-found') {
    notFound();
  }

  if (!brandEntry || !modelEntry) {
    notFound();
  }

  if (logicBoardRouteDecision.type === 'redirect') {
    permanentRedirect(logicBoardRouteDecision.destination);
  }

  const isGoogleAlias = isGooglePixelAliasBrand(rawParams.brand);
  if (isWaterDamageRepairSlug(rawParams['repair-type'])) {
    const canonicalPath = buildCanonicalModelRepairPath(
      rawParams.category,
      canonicalBrand,
      rawParams.model,
      canonicalRepairSlug
    );

    if (
      isGoogleAlias ||
      rawParams['repair-type'] !== canonicalRepairSlug ||
      !isGrandfatheredWaterDamagePath(canonicalPath)
    ) {
      permanentRedirect(getCentralWaterDamageHref());
    }
  }

  if (isGoogleAlias) {
    permanentRedirect(
      buildCanonicalModelRepairPath(
        rawParams.category,
        canonicalBrand,
        rawParams.model,
        canonicalRepairSlug
      )
    );
  }

  return rawParams;
}

export async function generateMetadata({ params }: RepairPageProps) {
  const resolvedParams = await resolveRepairRouteParams(await params);
  if (
    (isUnsupportedSamsungNoteRepairRoute(resolvedParams) || isUnsupportedGooglePixelRepairRoute(resolvedParams)) &&
    !isWaterDamageRepairSlug(resolvedParams['repair-type'])
  ) {
    notFound();
  }
  const internalRepairSlug = resolveRepairSlugForLookup(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );
  const details = await fetchRepairDetails(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    internalRepairSlug
  );

  if (!details) {
    notFound();
  }

  const model = details?.model || formatDynamicParam(resolvedParams.model);
  const repairName = getRepairDisplayName(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type'],
    details?.repairType || formatDynamicParam(resolvedParams['repair-type'])
  );
  const enhancedIpadSeoPocket = getAliMobileEnhancedIpadSeoPocket({
    modelSlug: resolvedParams.model,
    repairSlug: resolvedParams['repair-type'],
  });
  const enhancedLenovoTabletSeoPocket = getAliMobileEnhancedLenovoTabletSeoPocket({
    modelSlug: resolvedParams.model,
    repairSlug: resolvedParams['repair-type'],
  });
  const enhancedSamsungTabletSeoPocket = getAliMobileEnhancedSamsungTabletSeoPocket({
    modelSlug: resolvedParams.model,
    repairSlug: resolvedParams['repair-type'],
  });
  const enhancedMacBookSeoPocket = getAliMobileEnhancedMacBookSeoPocket({
    modelSlug: resolvedParams.model,
    repairSlug: resolvedParams['repair-type'],
  });
  const enhancedAppleWatchSeoPocket = getAliMobileEnhancedAppleWatchSeoPocket({
    modelSlug: resolvedParams.model,
    repairSlug: resolvedParams['repair-type'],
  });
  const selectedCrawledRepairContent = getSelectedCrawledRepairPageContent({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    repairType: resolvedParams['repair-type'],
  });
  const priceStr = details?.price ? ` from $${details.price}` : '';
  const modelCode = details?.modelCode;

  const templateIdx = stableHash(`${model}${repairName}`, META_DESCRIPTION_TEMPLATES.length);
  const title = selectedCrawledRepairContent
    ? selectedCrawledRepairContent.metaTitle
    : enhancedLenovoTabletSeoPocket
    ? enhancedLenovoTabletSeoPocket.metaTitle
    : enhancedSamsungTabletSeoPocket
    ? enhancedSamsungTabletSeoPocket.metaTitle
    : enhancedIpadSeoPocket
    ? enhancedIpadSeoPocket.metaTitle
    : enhancedMacBookSeoPocket
    ? enhancedMacBookSeoPocket.metaTitle
    : enhancedAppleWatchSeoPocket
    ? enhancedAppleWatchSeoPocket.metaTitle
    : modelCode
      ? `${model} ${repairName} | Ringwood${priceStr} | ${modelCode}`
      : `${model} ${repairName} in Ringwood${priceStr} | Ali Mobile`;
  const description = selectedCrawledRepairContent
    ? selectedCrawledRepairContent.metaDescription
    : enhancedLenovoTabletSeoPocket
    ? enhancedLenovoTabletSeoPocket.metaDescription
    : enhancedSamsungTabletSeoPocket
    ? enhancedSamsungTabletSeoPocket.metaDescription
    : enhancedIpadSeoPocket
    ? enhancedIpadSeoPocket.metaDescription
    : enhancedMacBookSeoPocket
    ? enhancedMacBookSeoPocket.metaDescription
    : enhancedAppleWatchSeoPocket
    ? enhancedAppleWatchSeoPocket.metaDescription
    : META_DESCRIPTION_TEMPLATES[templateIdx](model, repairName);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alimobile.com.au';
  const canonicalUrl = `${baseUrl}/repairs/${safeSlugSegment(resolvedParams.category)}/${safeSlugSegment(resolvedParams.brand)}/${preserveRouteSegment(resolvedParams.model)}/${preserveRouteSegment(resolvedParams['repair-type'])}`;

  const isFlexCable = resolvedParams['repair-type'].includes('flex-cable');

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    ...(isFlexCable && {
      robots: {
        index: false,
        follow: true,
      }
    })
  };
}

function WaterDamagePolicySection() {
  return (
    <div className="page-container" style={{ paddingTop: '0', paddingBottom: '0' }}>
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fee2e2',
        borderRadius: '1rem',
        padding: '2rem',
        marginTop: '0rem',
        marginBottom: '3rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <ShieldAlert size={28} color="#dc2626" />
          <h2 style={{ margin: 0, color: '#991b1b', fontSize: '1.5rem', fontWeight: 700 }}>
            Special Policy: Water Damage Recovery
          </h2>
        </div>
        <div style={{ color: '#b91c1c', lineHeight: '1.6', fontSize: '1.05rem' }}>
          <p style={{ margin: 0 }}>
            While our general motto is "No Fix, No Charge," water damage is a special case. 
            Liquid damage requires immediate intervention: we must completely disassemble your phone, dry every component, 
            and perform professional alcohol cleaning to stop corrosion. Because this specialized labor is required regardless 
            of the final outcome, a labor fee applies even if the phone is not successfully repaired. 
            Furthermore, due to the complexity of motherboard corrosion, we do not provide a general warranty for 
            water damage rescue. <em>Exception:</em> If a specific part (e.g., a screen) is replaced, that part will carry 
            our standard warranty.
          </p>
          <p style={{ margin: '0.9rem 0 0', fontSize: '0.98rem' }}>
            Need urgent advice after liquid exposure?{' '}
            <Link href="/repairs/water-damage" prefetch={false} style={{ fontWeight: 800, textDecoration: 'underline' }}>
              Read our phone water damage assessment guide
            </Link>{' '}
            before charging or testing the device.
          </p>
        </div>
      </div>
    </div>
  );
}

async function fetchRepairPageData(resolvedParams: Awaited<RepairPageProps['params']>): Promise<{
  details: {
    brand: string;
    model: string;
    modelCode?: string;
    repairType: string;
    price: number;
    variants: RepairVariant[];
    source: 'pos' | 'fallback';
  };
  otherRepairLinks: SameModelRepairLink[];
  crossModelLinks: SameModelRepairLink[];
  galaxyARelatedRepairLinks: SameModelRepairLink[];
  galaxyNoteRelatedRepairLinks: SameModelRepairLink[];
  oppoRelatedRepairLinks: SameModelRepairLink[];
  iphoneModelHubLinks: ExploreRepairLink[];
  samsungFamilyModelHubLinks: ExploreRepairLink[];
  oppoSeriesModelHubLinks: ExploreRepairLink[];
  categoryHubLinks: ExploreRepairLink[];
  ipadGenuineRepairSlugs?: string[];
  ipadGenuineModelsWithRepair?: string[];
} | null> {
  if (isUnsupportedSamsungNoteRepairRoute(resolvedParams) && !isWaterDamageRepairSlug(resolvedParams['repair-type'])) {
    return null;
  }

  const catalog = await fetchRepairCatalog();
  const brandEntry = catalog.brands.find(
    (brand) => brand.category === resolvedParams.category && brand.slug === resolvedParams.brand
  );

  if (!brandEntry) {
    console.log('[DEBUG] brandEntry is null');
    return null;
  }

  const modelEntry = brandEntry.models.find((model) => model.slug === resolvedParams.model);
  if (!modelEntry) {
    console.log('[DEBUG] modelEntry is null');
    return null;
  }

  const internalRepairSlug = resolveRepairSlugForLookup(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );
  console.log('[DEBUG] internalRepairSlug:', internalRepairSlug);
  const repairEntry = modelEntry.repairTypes.find((repair) => repair.slug === internalRepairSlug);
  if (!repairEntry) {
    console.log('[DEBUG] repairEntry is null, looking for', internalRepairSlug, 'in', modelEntry.repairTypes.map(r => r.slug));
    return null;
  }
  const isEnhancedSamsungFamilyPage = isAliMobileEnhancedSamsungRepairPage({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    'repair-type': resolvedParams['repair-type'],
  });

  const otherRepairLinks = modelEntry.repairTypes
    .filter((repair) => repair.slug !== internalRepairSlug)
    .filter((repair) => isEnhancedSamsungFamilyPage || isAliMobileEnhancedOppoRepairPage(resolvedParams) || !repair.slug.includes('logic-board'))
    .filter((repair) => resolvedParams.category === 'watch' || !repair.slug.includes('water-damage'))
    .map((repair) => ({
      href: `/repairs/${resolvedParams.category}/${resolvedParams.brand}/${resolvedParams.model}/${getPublicRepairSlug(resolvedParams.category, resolvedParams.brand, resolvedParams.model, repair.slug)}`,
      label: getRelatedRepairAnchorText({
        category: resolvedParams.category,
        brand: resolvedParams.brand,
        modelSlug: resolvedParams.model,
        modelName: resolvedParams.brand === 'oppo' && !modelEntry.model.toLowerCase().startsWith('oppo') ? `OPPO ${modelEntry.model}` : modelEntry.model,
        repairSlug: repair.slug,
        repairName: repair.name,
      }),
      slug: repair.slug,
      repairName: repair.name,
    }))
    .filter((repair) => !isExcludedRelatedRepairPresentationItem(repair))
    .map(({ href, label, slug }) => ({ href, label, slug }));



  const crossModelLinks = getCrossModelRepairRecommendations({
    category: resolvedParams.category,
    brandSlug: resolvedParams.brand,
    currentModelSlug: resolvedParams.model,
    currentModelName: modelEntry.model,
    repairSlug: internalRepairSlug,
    models: brandEntry.models,
    limit: 4,
  }).map((candidate) => ({
    href: `/repairs/${resolvedParams.category}/${resolvedParams.brand}/${candidate.modelSlug}/${getPublicRepairSlug(resolvedParams.category, resolvedParams.brand, candidate.modelSlug, candidate.repairSlug)}`,
    label: getRelatedRepairAnchorText({
      category: resolvedParams.category,
      brand: resolvedParams.brand,
      modelSlug: candidate.modelSlug,
      modelName: resolvedParams.brand === 'oppo' && !candidate.modelName.toLowerCase().startsWith('oppo') ? `OPPO ${candidate.modelName}` : candidate.modelName,
      repairSlug: candidate.repairSlug,
      repairName: repairEntry.name,
    }),
    slug: candidate.repairSlug,
    repairName: repairEntry.name,
  }))
    .filter((repair) => !isExcludedRelatedRepairPresentationItem(repair))
    .map(({ href, label, slug }) => ({ href, label, slug }));

  const galaxyARelatedRepairLinks =
    getSamsungHardwareConfig(resolvedParams.model)?.seriesFamily === 'galaxy-a'
      ? getEnhancedSamsungGalaxyARelatedRepairLinks(
          brandEntry.models,
          resolvedParams.model,
          internalRepairSlug,
          repairEntry.name
        )
      : [];
  const galaxyNoteRelatedRepairLinks =
    getSamsungHardwareConfig(resolvedParams.model)?.seriesFamily === 'galaxy-note'
      ? getEnhancedSamsungGalaxyNoteRelatedRepairLinks(
          brandEntry.models,
          resolvedParams.model,
          internalRepairSlug,
          repairEntry.name
        )
      : [];

  const oppoRelatedRepairLinks =
    isAliMobileEnhancedOppoRepairPage(resolvedParams)
      ? getEnhancedOppoRelatedRepairLinks(
          brandEntry.models,
          resolvedParams.model,
          internalRepairSlug,
          repairEntry.name
        )
      : [];

  return {
    details: {
      brand: brandEntry.brand,
      model: modelEntry.model,
      modelCode: modelEntry.modelCode,
      repairType: repairEntry.name,
      price: repairEntry.price,
      variants: repairEntry.variants || [],
      source: catalog.source,
    },
    otherRepairLinks: dedupeRelatedRepairLinks(otherRepairLinks).slice(0, (isEnhancedSamsungFamilyPage || isAliMobileEnhancedOppoRepairPage(resolvedParams)) ? 6 : 4),
    crossModelLinks: dedupeRelatedRepairLinks(crossModelLinks).slice(0, 4),
    galaxyARelatedRepairLinks,
    galaxyNoteRelatedRepairLinks,
    oppoRelatedRepairLinks,
    iphoneModelHubLinks:
      resolvedParams.category === 'phone' && resolvedParams.brand === 'iphone'
        ? getEnhancedIphoneModelHubLinks(brandEntry.models, resolvedParams.model)
        : [],
    samsungFamilyModelHubLinks:
      isEnhancedSamsungFamilyPage
        ? getEnhancedSamsungFamilyModelHubLinks(brandEntry.models, resolvedParams.model)
        : [],
    oppoSeriesModelHubLinks:
      isAliMobileEnhancedOppoRepairPage(resolvedParams)
        ? getEnhancedOppoSeriesModelHubLinks(brandEntry.models, resolvedParams.model) as any
        : [],
    categoryHubLinks:
      resolvedParams.category === 'phone' && (resolvedParams.brand === 'iphone' || isEnhancedSamsungFamilyPage || resolvedParams.brand === 'google-pixel' || isAliMobileEnhancedOppoRepairPage(resolvedParams))
        ? getEnhancedRepairCategoryHubLinks()
        : [],
    ipadGenuineRepairSlugs: catalog.source === 'pos'
      ? modelEntry.repairTypes.filter(r => (r.variants?.length ?? 0) > 0).map(r => r.slug)
      : [],
    ipadGenuineModelsWithRepair: catalog.source === 'pos'
      ? brandEntry.models.filter(m => m.repairTypes.some(r => r.slug === internalRepairSlug && (r.variants?.length ?? 0) > 0)).map(m => m.slug)
      : [],
  };
}

import { notFound, permanentRedirect } from 'next/navigation';
import RepairTypeClient from '@/components/services/RepairTypeClient';
import RepairPricingAndCTA from '@/components/services/RepairPricingAndCTA';
import RepairResultsMatchingSection from '@/components/repair-results/RepairResultsMatchingSection';
import ScrollReveal from '@/components/ScrollReveal';


export default async function RepairServicePage({ params }: RepairPageProps) {
  const resolvedParams = await resolveRepairRouteParams(await params);
  console.log('[DEBUG] checking route:', resolvedParams);
  if (
    (isUnsupportedSamsungNoteRepairRoute(resolvedParams) || isUnsupportedGooglePixelRepairRoute(resolvedParams)) &&
    !isWaterDamageRepairSlug(resolvedParams['repair-type'])
  ) {
    console.log('[DEBUG] isUnsupported route');
    notFound();
  }
  const pageData = await fetchRepairPageData(resolvedParams);

  if (!pageData) {
    console.log('[DEBUG] pageData is null');
    notFound();
  }

  const {
    details,
    otherRepairLinks,
    crossModelLinks,
    galaxyARelatedRepairLinks,
    galaxyNoteRelatedRepairLinks,
    oppoRelatedRepairLinks,
    iphoneModelHubLinks,
    samsungFamilyModelHubLinks,
    oppoSeriesModelHubLinks,
    categoryHubLinks,
  } = pageData;

  // Use POS data if available, otherwise derive from URL params
  const displayBrand = details?.brand || formatDynamicParam(resolvedParams.brand);
  let displayModel = details?.model || formatDynamicParam(resolvedParams.model);
  if (resolvedParams.brand === 'oppo' && !displayModel.toLowerCase().startsWith('oppo')) {
    displayModel = `OPPO ${displayModel}`;
  }
  const repairTypeDerived = details?.repairType || formatDynamicParam(resolvedParams['repair-type']);
  const price = details?.price || 0;
  const modelCode = details?.modelCode;
  const internalRepairSlug = resolveRepairSlugForLookup(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );
  const isGenuinePosIpadRepair = pageData.ipadGenuineRepairSlugs?.includes(internalRepairSlug) ?? false;

  const lenovoTabletEnhancedRepairType = getAliMobileEnhancedLenovoTabletRepairType(resolvedParams);
  const samsungTabletEnhancedRepairType = getAliMobileEnhancedSamsungTabletRepairType(resolvedParams);
  const ipadEnhancedRepairType = getAliMobileEnhancedIpadRepairType(resolvedParams, isGenuinePosIpadRepair);
  const macBookEnhancedRepairType = getAliMobileEnhancedMacBookRepairType(resolvedParams);
  const appleWatchEnhancedRepairType = getAliMobileEnhancedAppleWatchRepairType(resolvedParams);
  const iphoneEnhancedRepairType = getAliMobileEnhancedIphoneRepairType(resolvedParams);
  const samsungEnhancedRepairType = getAliMobileEnhancedSamsungRepairType(resolvedParams);
  const googlePixelEnhancedRepairType = getAliMobileEnhancedGooglePixelRepairType(resolvedParams);
  const oppoEnhancedRepairType = getAliMobileEnhancedOppoRepairType(resolvedParams);
  const enhancedRepairType =
    lenovoTabletEnhancedRepairType ??
    samsungTabletEnhancedRepairType ??
    ipadEnhancedRepairType ??
    macBookEnhancedRepairType ??
    appleWatchEnhancedRepairType ??
    iphoneEnhancedRepairType ??
    samsungEnhancedRepairType ??
    googlePixelEnhancedRepairType ??
    oppoEnhancedRepairType;
  const isAliMobileEnhancedLenovoTabletPage = isAliMobileEnhancedLenovoTabletRepairPage(resolvedParams);
  const isAliMobileEnhancedSamsungTabletPage = isAliMobileEnhancedSamsungTabletRepairPage(resolvedParams);
  const isAliMobileEnhancedIpadPage = isAliMobileEnhancedIpadRepairPage(resolvedParams, isGenuinePosIpadRepair);
  const isAliMobileEnhancedMacBookPage = isAliMobileEnhancedMacBookRepairPage(resolvedParams);
  const isAliMobileEnhancedAppleWatchPage = isAliMobileEnhancedAppleWatchRepairPage(resolvedParams);
  const isAliMobileEnhancedIphonePage = isAliMobileEnhancedIphoneRepairPage(resolvedParams);
  const isAliMobileEnhancedSamsungPage = isAliMobileEnhancedSamsungRepairPage(resolvedParams);
  const isAliMobileEnhancedGooglePixelPage = isAliMobileEnhancedGooglePixelRepairPage(resolvedParams);
  const isAliMobileEnhancedOppoPage = isAliMobileEnhancedOppoRepairPage(resolvedParams);
  const isIphone15ScreenMobilePilot =
    resolvedParams.category === 'phone' &&
    resolvedParams.brand === 'iphone' &&
    resolvedParams.model === 'iphone-15' &&
    resolvedParams['repair-type'] === 'screen-replacement';
  const isAliMobileEnhancedRepairPage =
    isAliMobileEnhancedLenovoTabletPage ||
    isAliMobileEnhancedSamsungTabletPage ||
    isAliMobileEnhancedIpadPage ||
    isAliMobileEnhancedMacBookPage ||
    isAliMobileEnhancedAppleWatchPage ||
    isAliMobileEnhancedIphonePage ||
    isAliMobileEnhancedSamsungPage ||
    isAliMobileEnhancedGooglePixelPage ||
    isAliMobileEnhancedOppoPage;
  const samsungHardwareConfig = isAliMobileEnhancedSamsungPage
    ? getSamsungHardwareConfig(resolvedParams.model)
    : null;
  const repairTypeHub = getRepairTypeHubDefinition(resolvedParams['repair-type']);

  const isNoteBackGlass = isSamsungNoteBackGlassPublicAlias(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );
  const baseSeoPocket = getRepairTypeSeoPocket({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    repairType: internalRepairSlug,
  });
  const iphoneSeoPocket = getAliMobileEnhancedIphoneSeoPocket({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    repairType: resolvedParams['repair-type'],
    pocket: baseSeoPocket,
  });
  const enhancedLenovoTabletSeoPocket = getAliMobileEnhancedLenovoTabletSeoPocket({
    modelSlug: resolvedParams.model,
    repairSlug: resolvedParams['repair-type'],
  });
  const enhancedSamsungTabletSeoPocket = getAliMobileEnhancedSamsungTabletSeoPocket({
    modelSlug: resolvedParams.model,
    repairSlug: resolvedParams['repair-type'],
  });
  const enhancedIpadSeoPocket = getAliMobileEnhancedIpadSeoPocket({
    modelSlug: resolvedParams.model,
    repairSlug: resolvedParams['repair-type'],
  });
  const enhancedMacBookSeoPocket = getAliMobileEnhancedMacBookSeoPocket({
    modelSlug: resolvedParams.model,
    repairSlug: resolvedParams['repair-type'],
  });
  const enhancedAppleWatchSeoPocket = getAliMobileEnhancedAppleWatchSeoPocket({
    modelSlug: resolvedParams.model,
    repairSlug: resolvedParams['repair-type'],
  });
  const selectedCrawledRepairContent = getSelectedCrawledRepairPageContent({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    repairType: resolvedParams['repair-type'],
  });
  const samsungSeoPocket = getAliMobileEnhancedSamsungSeoPocket({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    repairType: resolvedParams['repair-type'],
    pocket: enhancedLenovoTabletSeoPocket ?? enhancedSamsungTabletSeoPocket ?? enhancedIpadSeoPocket ?? enhancedMacBookSeoPocket ?? enhancedAppleWatchSeoPocket ?? iphoneSeoPocket,
  });
  const pixelSeoPocket = getAliMobileEnhancedGooglePixelSeoPocket({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    repairType: resolvedParams['repair-type'],
    pocket: samsungSeoPocket,
  });
  const inheritedSeoPocket = getAliMobileEnhancedOppoSeoPocket({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    repairType: resolvedParams['repair-type'],
    pocket: pixelSeoPocket,
  });
  const seoPocket = selectedCrawledRepairContent?.pocket ?? inheritedSeoPocket;
  const seoDisplayModel =
    enhancedLenovoTabletSeoPocket?.modelName ??
    enhancedSamsungTabletSeoPocket?.modelName ??
    enhancedIpadSeoPocket?.modelName ??
    enhancedMacBookSeoPocket?.modelName ??
    enhancedAppleWatchSeoPocket?.modelName ??
    displayModel;
  const sameModelLinks = isAliMobileEnhancedLenovoTabletPage && lenovoTabletEnhancedRepairType
    ? getLenovoTabletSameModelRepairLinks(resolvedParams.model as any, lenovoTabletEnhancedRepairType)
    : isAliMobileEnhancedSamsungTabletPage && samsungTabletEnhancedRepairType
    ? getSamsungTabletSameModelRepairLinks(resolvedParams.model as any, samsungTabletEnhancedRepairType)
    : isAliMobileEnhancedIpadPage && ipadEnhancedRepairType
    ? getIpadSameModelRepairLinks(resolvedParams.model as any, ipadEnhancedRepairType, pageData.ipadGenuineRepairSlugs ?? [])
    : isAliMobileEnhancedMacBookPage && macBookEnhancedRepairType
    ? getMacBookSameModelRepairLinks(resolvedParams.model as any, macBookEnhancedRepairType)
    : isAliMobileEnhancedAppleWatchPage && appleWatchEnhancedRepairType
    ? getAppleWatchSameModelRepairLinks(resolvedParams.model as any, appleWatchEnhancedRepairType)
    : otherRepairLinks;
  const isGalaxyAEnhancedPage = samsungHardwareConfig?.seriesFamily === 'galaxy-a';
  const isGalaxyNoteEnhancedPage = samsungHardwareConfig?.seriesFamily === 'galaxy-note';
  const lenovoTabletPublicRepairLinks = isAliMobileEnhancedLenovoTabletPage
    ? otherRepairLinks.filter((link) => (
        link.href.startsWith(`/repairs/tablet/lenovo/${preserveRouteSegment(resolvedParams.model)}/`) &&
        !['back-housing-replacement', 'back-glass-repair', 'rear-glass-repair'].includes(slugify(link.slug))
      ))
    : [];
  const displayCrossModelLinks = isAliMobileEnhancedLenovoTabletPage && lenovoTabletEnhancedRepairType
    ? getLenovoTabletSameRepairLinks(resolvedParams.model as any, lenovoTabletEnhancedRepairType)
    : isAliMobileEnhancedSamsungTabletPage && samsungTabletEnhancedRepairType
    ? getSamsungTabletSameRepairLinks(resolvedParams.model as any, samsungTabletEnhancedRepairType)
    : isAliMobileEnhancedIpadPage && ipadEnhancedRepairType
    ? getIpadSameRepairLinks(resolvedParams.model as any, ipadEnhancedRepairType, pageData.ipadGenuineModelsWithRepair ?? [])
    : isGalaxyAEnhancedPage
      ? galaxyARelatedRepairLinks
      : isGalaxyNoteEnhancedPage
        ? galaxyNoteRelatedRepairLinks
        : isAliMobileEnhancedSamsungPage
          ? []
          : isAliMobileEnhancedOppoRepairPage(resolvedParams)
            ? oppoRelatedRepairLinks
            : (resolvedParams.brand === 'oppo' ? [] : crossModelLinks);
  const samsungMidPageHubLinks =
    samsungHardwareConfig?.seriesFamily === 'galaxy-s' ||
    samsungHardwareConfig?.seriesFamily === 'galaxy-a' ||
    samsungHardwareConfig?.seriesFamily === 'galaxy-note'
      ? getAliMobileEnhancedSamsungHubLinks(resolvedParams.model)
      : [];
  const isGalaxyALogicBoardRoute =
    samsungHardwareConfig?.seriesFamily === 'galaxy-a' &&
    slugify(resolvedParams['repair-type']) === 'logic-board-repair';
  if (isGalaxyALogicBoardRoute && !samsungEnhancedRepairType) {
    notFound();
  }
  if (isAliMobileEnhancedOppoRepairPage(resolvedParams)) {
    const oppoEnhancedRepairType = getAliMobileEnhancedOppoRepairType(resolvedParams);
    if (!oppoEnhancedRepairType) {
      notFound();
    }
  }
  const exploreRepairNetworkSectionProps = isAliMobileEnhancedLenovoTabletPage && lenovoTabletEnhancedRepairType
    ? {
        sectionDescription: 'Explore related Lenovo Tablet model hubs or browse repair services for other devices.',
        modelGroupHeading: 'Related Lenovo Tablet Models',
        modelLinks: getLenovoTabletModelHubLinks(resolvedParams.model as any),
        categoryLinks: getLenovoTabletCategoryHubLinks(),
      }
    : isAliMobileEnhancedSamsungTabletPage && samsungTabletEnhancedRepairType
    ? {
        sectionDescription: 'Explore related Samsung Tablet model hubs or browse repair services for other devices.',
        modelGroupHeading: 'Related Samsung Tablet Models',
        modelLinks: getSamsungTabletModelHubLinks(resolvedParams.model as any),
        categoryLinks: getSamsungTabletCategoryHubLinks(),
      }
    : isAliMobileEnhancedIpadPage
    ? {
        sectionDescription: 'Explore related iPad model hubs or browse repair services for other devices.',
        modelGroupHeading: 'Related iPad Models',
        modelLinks: getIpadModelHubLinks(resolvedParams.model as any),
        categoryLinks: getEnhancedRepairCategoryHubLinks(),
      }
    : isAliMobileEnhancedMacBookPage && macBookEnhancedRepairType
    ? {
        sectionDescription: 'Explore related MacBook model hubs or browse repair services for other devices.',
        modelGroupHeading: 'Related MacBook Models',
        modelLinks: getMacBookModelHubLinks(resolvedParams.model as any),
        categoryLinks: getMacBookCategoryHubLinks(),
      }
    : isAliMobileEnhancedAppleWatchPage && appleWatchEnhancedRepairType
    ? {
        sectionDescription: 'Explore related Apple Watch model hubs or browse repair services for other devices.',
        modelGroupHeading: 'Related Apple Watch Models',
        modelLinks: getAppleWatchModelHubLinks(resolvedParams.model as any),
        categoryLinks: getAppleWatchCategoryHubLinks(),
      }
    : isAliMobileEnhancedIphonePage
    ? {
        sectionDescription: 'Browse other iPhone models or explore repair services for other devices.',
        modelGroupHeading: 'More iPhone Models',
        modelLinks: iphoneModelHubLinks,
        categoryLinks: categoryHubLinks,
      }
    : samsungHardwareConfig?.deviceFamily === 'z-fold'
      ? {
          sectionDescription: 'Browse other Galaxy Z Fold models or explore repair services for other devices.',
          modelGroupHeading: 'More Galaxy Z Fold Models',
          modelLinks: samsungFamilyModelHubLinks,
          categoryLinks: categoryHubLinks,
        }
    : samsungHardwareConfig?.deviceFamily === 'z-flip'
          ? {
              sectionDescription: 'Browse other Galaxy Z Flip models or explore repair services for other devices.',
              modelGroupHeading: 'More Galaxy Z Flip Models',
              modelLinks: samsungFamilyModelHubLinks,
              categoryLinks: categoryHubLinks,
            }
        : samsungHardwareConfig?.seriesFamily === 'galaxy-a'
          ? {
              sectionDescription: 'Explore Samsung repairs or browse repair services for other devices.',
              modelGroupHeading: 'More Galaxy A Models',
              modelLinks: samsungFamilyModelHubLinks,
              categoryLinks: categoryHubLinks,
            }
        : isGalaxyNoteEnhancedPage
          ? {
              sectionDescription: 'Explore Samsung repairs or browse repair services for other devices.',
              modelGroupHeading: 'More Galaxy Note Models',
              modelLinks: samsungFamilyModelHubLinks,
              categoryLinks: categoryHubLinks,
            }
        : samsungHardwareConfig?.seriesFamily === 'galaxy-s'
          ? {
              sectionDescription: 'Explore Samsung repairs or browse repair services for other devices.',
              modelGroupHeading: 'More Galaxy S Models',
              modelLinks: samsungFamilyModelHubLinks,
              categoryLinks: categoryHubLinks,
            }
          : isAliMobileEnhancedGooglePixelPage
            ? {
                sectionDescription: 'Explore Google Pixel repairs or browse repair services for other devices.',
                modelGroupHeading: 'More Google Pixel Models',
                modelLinks: [], // Empty for now as only Pixel 8 Pro is implemented
                categoryLinks: categoryHubLinks,
              }
            : isAliMobileEnhancedOppoRepairPage(resolvedParams)
              ? {
                  sectionDescription: 'Explore OPPO repairs or browse repair services for other devices.',
                  modelGroupHeading: `MORE OPPO ${getOppoModelConfig(resolvedParams.model)?.series.toUpperCase() || ''} MODELS`,
                  modelLinks: oppoSeriesModelHubLinks,
                  categoryLinks: categoryHubLinks,
                }
              : null;
  const isAliMobileEnhancedLenovoTabletExplorePage = Boolean(
    isAliMobileEnhancedLenovoTabletPage &&
      lenovoTabletEnhancedRepairType &&
      enhancedLenovoTabletSeoPocket &&
      exploreRepairNetworkSectionProps
  );
  const isAliMobileEnhancedSamsungTabletExplorePage = Boolean(
    isAliMobileEnhancedSamsungTabletPage &&
      samsungTabletEnhancedRepairType &&
      enhancedSamsungTabletSeoPocket
  );
  const isAliMobileEnhancedSamsungExplorePage = Boolean(
    isAliMobileEnhancedSamsungPage &&
      samsungHardwareConfig &&
      samsungEnhancedRepairType &&
      samsungHardwareConfig.supportedRepairTypes.includes(samsungEnhancedRepairType)
  );
  const isAliMobileEnhancedIpadExplorePage = Boolean(
    isAliMobileEnhancedIpadPage &&
      ipadEnhancedRepairType &&
      enhancedIpadSeoPocket
  );
  const isAliMobileEnhancedMacBookExplorePage = Boolean(
    isAliMobileEnhancedMacBookPage &&
      macBookEnhancedRepairType &&
      enhancedMacBookSeoPocket
  );
  const isAliMobileEnhancedAppleWatchExplorePage = Boolean(
    isAliMobileEnhancedAppleWatchPage &&
      appleWatchEnhancedRepairType &&
      enhancedAppleWatchSeoPocket
  );
  const isAliMobileEnhancedGooglePixelExplorePage = Boolean(
    isAliMobileEnhancedGooglePixelPage &&
      googlePixelEnhancedRepairType
  );
  const isAliMobileEnhancedOppoExplorePage = Boolean(
    isAliMobileEnhancedOppoRepairPage(resolvedParams)
  );
  const shouldRenderExploreRepairNetworkSection =
    Boolean(isAliMobileEnhancedLenovoTabletExplorePage && exploreRepairNetworkSectionProps) ||
    Boolean(isAliMobileEnhancedSamsungTabletExplorePage && exploreRepairNetworkSectionProps) ||
    Boolean(isAliMobileEnhancedIpadExplorePage && exploreRepairNetworkSectionProps) ||
    Boolean(isAliMobileEnhancedMacBookExplorePage && exploreRepairNetworkSectionProps) ||
    Boolean(isAliMobileEnhancedAppleWatchExplorePage && exploreRepairNetworkSectionProps) ||
    Boolean(isAliMobileEnhancedIphonePage && exploreRepairNetworkSectionProps) ||
    Boolean(isAliMobileEnhancedSamsungExplorePage && exploreRepairNetworkSectionProps) ||
    Boolean(isAliMobileEnhancedGooglePixelExplorePage && exploreRepairNetworkSectionProps) ||
    Boolean(isAliMobileEnhancedOppoExplorePage && exploreRepairNetworkSectionProps);

  // Validate repair type exists in our known list, or accept POS-provided name
  const knownRepair = REPAIR_TYPES.find(r => r.slug === internalRepairSlug);
  const bookingRepairName = usesPhoneBackGlassPublicAlias(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  ) ? (knownRepair?.name || repairTypeDerived) : undefined;
  const showBackHousingNotice = shouldShowIphoneBackHousingNotice(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );
  const isWaterDamageRepairPage = resolvedParams['repair-type'] === 'water-damage-repair';
  const finalRepairName = getRepairDisplayName(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type'],
    knownRepair?.name || repairTypeDerived
  );
  const crossModelSectionRepairName = isGalaxyAEnhancedPage
      ? getRelatedRepairPresentationName(
        resolvedParams.category,
        resolvedParams.brand,
        resolvedParams.model,
        resolvedParams['repair-type'],
        finalRepairName
      )
    : isGalaxyNoteEnhancedPage
      ? getRelatedRepairPresentationName(
          resolvedParams.category,
          resolvedParams.brand,
          resolvedParams.model,
          resolvedParams['repair-type'],
          finalRepairName
        )
      : finalRepairName;

  const faqs = seoPocket?.faq || generateFaqs(displayModel, finalRepairName, resolvedParams['repair-type'], price, modelCode, displayBrand);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alimobile.com.au';
  const repairPageUrl = `${baseUrl}/repairs/${safeSlugSegment(resolvedParams.category)}/${safeSlugSegment(resolvedParams.brand)}/${preserveRouteSegment(resolvedParams.model)}/${preserveRouteSegment(resolvedParams['repair-type'])}`;
  const bookRepairUrl = `/book-repair?${new URLSearchParams({
    brand: displayBrand,
    model: displayModel,
    service: bookingRepairName || finalRepairName,
  }).toString()}`;
  const sameModelRepairSection = sameModelLinks.length > 0 ? (
    <ScrollReveal>
      <section className={isIphone15ScreenMobilePilot ? 'w-full max-md:py-8' : 'w-full'} aria-labelledby="same-model-repairs-heading">
        <div className="flex w-full flex-col gap-6">
          <div className="w-full max-w-none">
            <span className="repair-kicker repair-kicker-muted">More repair paths</span>
            <h2
              id="same-model-repairs-heading"
              className="mt-3 break-words text-[1.35rem] font-black leading-[1.15] tracking-[-0.02em] text-slate-950 sm:text-[1.5rem] md:text-[1.9rem] md:leading-tight"
            >
              Other {seoDisplayModel} repairs
            </h2>
            <p className="mt-2 max-w-[34rem] text-[1rem] font-semibold leading-6 text-slate-700 md:text-[1.05rem] md:font-medium md:text-slate-600">
              Explore other repair paths confirmed for this model.
            </p>
          </div>

          <SameModelRepairLinks
            links={sameModelLinks}
            mobileVariant={isIphone15ScreenMobilePilot ? 'iphone15-compact-pilot' : undefined}
          />
          {samsungMidPageHubLinks.length > 0 && (
            <div className="mt-2 text-center">
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                {samsungMidPageHubLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                  >
                    {link.label} &rarr;
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </ScrollReveal>
  ) : null;
  const crossModelRepairSection = !isAliMobileEnhancedLenovoTabletPage && displayCrossModelLinks.length > 0 ? (
    <ScrollReveal>
      <section className="mt-8 w-full" aria-labelledby="cross-model-repairs-heading">
        <div className="flex w-full flex-col gap-6">
          <div className="w-full max-w-none">
            <span className="repair-kicker repair-kicker-muted">More options</span>
            <h2
              id="cross-model-repairs-heading"
              className="mt-3 break-words text-[1.3rem] font-black leading-[1.2] tracking-[-0.015em] text-slate-950 sm:text-[1.45rem] md:text-[1.9rem] md:leading-tight"
            >
              {isAliMobileEnhancedSamsungTabletPage && samsungTabletEnhancedRepairType
                ? `Same ${getSamsungTabletRepairLabel(samsungTabletEnhancedRepairType)} on other Samsung Tablet models`
                : isAliMobileEnhancedIpadPage && ipadEnhancedRepairType
                ? `Same ${getIpadRepairLabel(ipadEnhancedRepairType)} on other iPad models`
                : isGalaxyAEnhancedPage
                ? `More Galaxy A models for ${crossModelSectionRepairName}`
                : isGalaxyNoteEnhancedPage
                  ? `More Galaxy Note models for ${crossModelSectionRepairName}`
                  : `More ${displayBrand} models for ${finalRepairName}`}
            </h2>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
            {displayCrossModelLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 shadow-sm shadow-blue-950/5 transition duration-200 ease-out touch-manipulation hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50/80 text-blue-600 transition group-hover:border-blue-200 group-hover:bg-white">
                    {getRepairIcon(link.slug, 18)}
                  </span>
                  <span className="min-w-0 break-words leading-snug">{link.label}</span>
                </span>
                <span
                  className="shrink-0 rounded-full border border-blue-100 bg-white px-2 py-1 text-xs text-blue-600 transition group-hover:translate-x-0.5 group-hover:border-blue-200 group-hover:bg-blue-600 group-hover:text-white"
                  aria-hidden="true"
                >
                  &rarr;
                </span>
              </Link>
            ))}
          </div>

          {!isGalaxyAEnhancedPage && (
            <div className="mt-2 text-center">
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                <Link
                  href={`/repairs/${safeSlugSegment(resolvedParams.category)}/${safeSlugSegment(resolvedParams.brand)}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  {isAliMobileEnhancedRepairPage ? `View all ${displayBrand} repairs` : `View all ${resolvedParams.category === 'watch' && displayBrand === 'Apple' ? 'Apple Watch' : displayBrand} models`} &rarr;
                </Link>

                {isAliMobileEnhancedIphonePage && enhancedRepairType && repairTypeHub && ENHANCED_REPAIR_TYPE_HUB_LINK_TEXT[enhancedRepairType as keyof typeof ENHANCED_REPAIR_TYPE_HUB_LINK_TEXT] && (
                  <Link
                    href={`/repairs/${repairTypeHub.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    {ENHANCED_REPAIR_TYPE_HUB_LINK_TEXT[enhancedRepairType as keyof typeof ENHANCED_REPAIR_TYPE_HUB_LINK_TEXT]} &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </ScrollReveal>
  ) : null;


  return (
    <>
      <RepairServiceSchema
        serviceName={`${seoDisplayModel} ${finalRepairName} in Ringwood`}
        description={
          selectedCrawledRepairContent?.schemaDescription ??
          enhancedSamsungTabletSeoPocket?.schemaDescription ??
          enhancedIpadSeoPocket?.schemaDescription ??
          `Professional ${finalRepairName} for ${seoDisplayModel} in Ringwood. Expert technicians, fast turnaround, 6-month warranty.`
        }
        price={price > 0 ? String(price) : undefined}
        url={repairPageUrl}
      />

      <RepairTypeClient
        deviceModel={displayModel}
        repairType={finalRepairName}
        price={price}
      />

      {/* Repair detail hero */}
      <main className="repair-page-shell repair-page-shell-narrow repair-detail-page-shell" style={{ paddingBottom: '0' }}>
        <Breadcrumbs
          category={resolvedParams.category}
          brand={resolvedParams.brand}
          model={resolvedParams.model}
          service={resolvedParams['repair-type']}
          brandLabel={displayBrand}
          modelLabel={seoDisplayModel}
          serviceLabel={finalRepairName}
        />

        <section className="repair-hero repair-detail-hero relative" aria-labelledby="repair-detail-heading">
          <span className="repair-detail-icon">{getRepairIcon(resolvedParams['repair-type'])}</span>
          <h1>{seoDisplayModel} {finalRepairName} in Ringwood</h1>
          {(enhancedSamsungTabletSeoPocket?.supportLabel ?? enhancedIpadSeoPocket?.supportLabel) ? (
            <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              {enhancedSamsungTabletSeoPocket?.supportLabel ?? enhancedIpadSeoPocket?.supportLabel}
            </p>
          ) : null}
          <p className="repair-detail-subtitle">
            {selectedCrawledRepairContent?.heroSubtitle ??
              enhancedSamsungTabletSeoPocket?.heroSubtitle ??
              enhancedIpadSeoPocket?.heroSubtitle ??
              'Choose a quality tier, confirm the quote, then book the repair path that fits your device and budget.'}
          </p>

          <RepairPricingAndCTA
            brandName={displayBrand}
            modelName={displayModel}
            repairName={finalRepairName}
            bookingRepairName={bookingRepairName}
            showBackHousingNotice={showBackHousingNotice}
            showStartingPriceFallback={!(isAliMobileEnhancedSamsungPage && price === 0 && !isNoteBackGlass)}
            variants={details?.variants || []}
            sourceType={(details as any)?.sourceType}
          />

          <div className="trust-badges">
            {resolvedParams['repair-type'] === 'water-damage-repair' ? (
              <>
                <div className="trust-badge">
                  <span className="trust-badge-icon"><Zap size={20} strokeWidth={2.5} aria-hidden="true" /></span>
                  Timeframe Depends on Damage
                </div>
                <div className="trust-badge">
                  <span className="trust-badge-icon"><ShieldAlert size={20} strokeWidth={2.5} aria-hidden="true" /></span>
                  Inspection First
                </div>
                <div className="trust-badge">
                  <span className="trust-badge-icon"><CheckCircle size={20} strokeWidth={2.5} aria-hidden="true" /></span>
                  Warranty Depends on Repair Result
                </div>
                <div className="trust-badge">
                  <span className="trust-badge-icon"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>
                  Diagnostic Required
                </div>
              </>
            ) : (
              <>
                <div className="trust-badge">
                  <span className="trust-badge-icon"><Zap size={20} strokeWidth={2.5} aria-hidden="true" /></span>
                  {(resolvedParams['repair-type'].includes('back-glass') || resolvedParams['repair-type'].includes('back-housing'))
                    ? 'Timeframe Varies'
                    : (resolvedParams['repair-type'] === 'logic-board-repair' || resolvedParams['repair-type'] === 'data-recovery' || resolvedParams['repair-type'] === 'no-power')
                    ? 'Diagnostic Required'
                    : 'Fast Turnaround'}
                </div>
                <div className="trust-badge">
                  <span className="trust-badge-icon"><ShieldCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>
                  No Fix, No Charge
                </div>
                <div className="trust-badge">
                  <span className="trust-badge-icon"><CheckCircle size={20} strokeWidth={2.5} aria-hidden="true" /></span>
                  6-Month Warranty
                </div>
                <div className="trust-badge">
                  <span className="trust-badge-icon"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>
                  Clear Quote First
                </div>
              </>
            )}
          </div>
        </section>

        {isWaterDamageRepairPage && (
          <ScrollReveal>
            <WaterDamagePolicySection />
          </ScrollReveal>
        )}

        <RepairResultsMatchingSection
          category={resolvedParams.category}
          brand={resolvedParams.brand}
          model={resolvedParams.model}
          repairType={resolvedParams['repair-type']}
          context="detail"
          mobileVariant={isIphone15ScreenMobilePilot ? 'iphone15-compact-pilot' : undefined}
        />

        {(enhancedLenovoTabletSeoPocket || enhancedSamsungTabletSeoPocket || enhancedMacBookSeoPocket) && (
          <ScrollReveal>
            <RepairQuickAnswerSection
              headingId={enhancedMacBookSeoPocket ? 'macbook-quick-answer-heading' : 'tablet-quick-answer-heading'}
              answer={(enhancedLenovoTabletSeoPocket ?? enhancedSamsungTabletSeoPocket ?? enhancedMacBookSeoPocket)!.quickAnswer}
              isMacBookLayout={Boolean(enhancedMacBookSeoPocket)}
            />
          </ScrollReveal>
        )}

        {isAliMobileEnhancedRepairPage && enhancedRepairType && seoPocket && (seoPocket.commonProblems?.length ?? 0) > 0 && (
          <ScrollReveal>
            <CommonRepairProblemsSection
              modelName={seoDisplayModel}
              repairType={enhancedRepairType as any}
              problems={seoPocket.commonProblems}
              mobileVariant={isIphone15ScreenMobilePilot ? 'iphone15-compact-pilot' : undefined}
            />
          </ScrollReveal>
        )}

        {!isWaterDamageRepairPage && sameModelRepairSection}

        {!isWaterDamageRepairPage && crossModelRepairSection}

        {(enhancedLenovoTabletSeoPocket || enhancedSamsungTabletSeoPocket) && (
          <ScrollReveal>
            <RepairDiagnosticProcessSection
              headingId="tablet-diagnostic-process-heading"
              section={(enhancedLenovoTabletSeoPocket ?? enhancedSamsungTabletSeoPocket)!.diagnosticProcess}
              isTabletCenteredLayout={isAliMobileEnhancedSamsungTabletPage}
              isLenovoTabletLayout={isAliMobileEnhancedLenovoTabletPage}
            />
          </ScrollReveal>
        )}

        {enhancedMacBookSeoPocket && (
          <ScrollReveal>
            <RepairDiagnosticProcessSection
              headingId="macbook-diagnostic-process-heading"
              section={{
                kicker: 'Diagnostic process',
                heading: `${enhancedMacBookSeoPocket.modelName} ${getMacBookRepairLabel(enhancedMacBookSeoPocket.repairSlug)} diagnostic process`,
                intro: enhancedMacBookSeoPocket.quickAnswer,
                steps: enhancedMacBookSeoPocket.diagnosticSteps,
              }}
              isMacBookLayout
            />
          </ScrollReveal>
        )}

        {enhancedAppleWatchSeoPocket && (
          <ScrollReveal>
            <RepairDiagnosticProcessSection
              headingId="apple-watch-diagnostic-process-heading"
              section={{
                kicker: 'Diagnostic process',
                heading: `${enhancedAppleWatchSeoPocket.modelName} ${getAppleWatchRepairLabel(enhancedAppleWatchSeoPocket.repairSlug)} diagnostic process`,
                intro: enhancedAppleWatchSeoPocket.quickAnswer,
                steps: enhancedAppleWatchSeoPocket.diagnosticSteps,
              }}
              isMacBookLayout
            />
          </ScrollReveal>
        )}

        {(enhancedLenovoTabletSeoPocket || enhancedSamsungTabletSeoPocket) && (
          <ScrollReveal>
            <SamsungTabletEnhancedSeoSection
              section={(enhancedLenovoTabletSeoPocket ?? enhancedSamsungTabletSeoPocket)!.serviceSection}
              layoutMode={
                isAliMobileEnhancedLenovoTabletPage
                  ? 'lenovo-tablet'
                  : isAliMobileEnhancedSamsungTabletPage
                  ? 'tablet-centered'
                  : 'default'
              }
            />
          </ScrollReveal>
        )}

        {enhancedMacBookSeoPocket && (
          <ScrollReveal>
            <SamsungTabletEnhancedSeoSection
              section={enhancedMacBookSeoPocket.serviceSection}
              layoutMode="macbook"
            />
          </ScrollReveal>
        )}

        {enhancedAppleWatchSeoPocket && (
          <ScrollReveal>
            <SamsungTabletEnhancedSeoSection
              section={enhancedAppleWatchSeoPocket.serviceSection}
              layoutMode="macbook"
            />
          </ScrollReveal>
        )}

        {enhancedIpadSeoPocket && (
          <ScrollReveal>
            <IpadEnhancedSeoSection
              modelName={seoDisplayModel}
              repairName={finalRepairName}
            />
          </ScrollReveal>
        )}

        {(enhancedLenovoTabletSeoPocket || enhancedSamsungTabletSeoPocket) && (
          <ScrollReveal>
            <RepairDetailBulletSection
              headingId="tablet-local-service-heading"
              section={(enhancedLenovoTabletSeoPocket ?? enhancedSamsungTabletSeoPocket)!.localService}
              isTabletCenteredLayout={isAliMobileEnhancedSamsungTabletPage}
              isLenovoTabletLayout={isAliMobileEnhancedLenovoTabletPage}
            />
          </ScrollReveal>
        )}

        {enhancedMacBookSeoPocket && (
          <ScrollReveal>
            <RepairDetailBulletSection
              headingId="macbook-local-service-heading"
              section={enhancedMacBookSeoPocket.localService}
              isMacBookLayout
            />
          </ScrollReveal>
        )}

        {enhancedAppleWatchSeoPocket && (
          <ScrollReveal>
            <RepairDetailBulletSection
              headingId="apple-watch-local-service-heading"
              section={enhancedAppleWatchSeoPocket.localService}
              isMacBookLayout
            />
          </ScrollReveal>
        )}

        {enhancedMacBookSeoPocket && (
          <ScrollReveal>
            <FaqAccordion
              faqs={faqs}
              layout="repair-detail"
            />
          </ScrollReveal>
        )}

        {enhancedAppleWatchSeoPocket && (
          <ScrollReveal>
            <FaqAccordion
              faqs={faqs}
              layout="repair-detail"
            />
          </ScrollReveal>
        )}

        {enhancedMacBookSeoPocket && (
          <ScrollReveal>
            <ServiceAreas />
          </ScrollReveal>
        )}

        {enhancedAppleWatchSeoPocket && (
          <ScrollReveal>
            <ServiceAreas />
          </ScrollReveal>
        )}

        {enhancedMacBookSeoPocket &&
          shouldRenderExploreRepairNetworkSection &&
          exploreRepairNetworkSectionProps &&
          (exploreRepairNetworkSectionProps.modelLinks.length > 0 ||
            exploreRepairNetworkSectionProps.categoryLinks.length > 0) && (
          <ScrollReveal>
            <ExploreRepairNetworkSection
              sectionDescription={exploreRepairNetworkSectionProps.sectionDescription}
              modelGroupHeading={exploreRepairNetworkSectionProps.modelGroupHeading}
              modelLinks={exploreRepairNetworkSectionProps.modelLinks}
              categoryLinks={exploreRepairNetworkSectionProps.categoryLinks}
            />
          </ScrollReveal>
        )}

        {enhancedAppleWatchSeoPocket &&
          shouldRenderExploreRepairNetworkSection &&
          exploreRepairNetworkSectionProps &&
          (exploreRepairNetworkSectionProps.modelLinks.length > 0 ||
            exploreRepairNetworkSectionProps.categoryLinks.length > 0) && (
          <ScrollReveal>
            <ExploreRepairNetworkSection
              sectionDescription={exploreRepairNetworkSectionProps.sectionDescription}
              modelGroupHeading={exploreRepairNetworkSectionProps.modelGroupHeading}
              modelLinks={exploreRepairNetworkSectionProps.modelLinks}
              categoryLinks={exploreRepairNetworkSectionProps.categoryLinks}
            />
          </ScrollReveal>
        )}

        {enhancedMacBookSeoPocket && (
          <ScrollReveal>
            <RepairDetailFinalCta
              headingId="macbook-final-cta-heading"
              section={enhancedMacBookSeoPocket.finalCta}
              bookRepairHref={bookRepairUrl}
              phoneNumber="0481 058 514"
              isCentered
            />
          </ScrollReveal>
        )}

        {enhancedAppleWatchSeoPocket && (
          <ScrollReveal>
            <RepairDetailFinalCta
              headingId="apple-watch-final-cta-heading"
              section={enhancedAppleWatchSeoPocket.finalCta}
              bookRepairHref={bookRepairUrl}
              phoneNumber="0481 058 514"
              isCentered
            />
          </ScrollReveal>
        )}
      </main>

      {/* ─── SOCIAL PROOF ─────────────────────────────── */}
      {!isAliMobileEnhancedRepairPage && !isWaterDamageRepairPage && (
        <ScrollReveal>
          <ReviewsSection />
        </ScrollReveal>
      )}

      {seoPocket && !isAliMobileEnhancedMacBookPage && !isAliMobileEnhancedAppleWatchPage && (
        <ScrollReveal>
          <TechnicianWorkbenchProcess
            pocket={seoPocket}
            showCommonProblems={!isAliMobileEnhancedRepairPage}
            density={isAliMobileEnhancedLenovoTabletPage || isAliMobileEnhancedSamsungTabletPage ? 'comfortable' : 'default'}
            mobileVariant={isIphone15ScreenMobilePilot ? 'iphone15-compact-pilot' : undefined}
          />
        </ScrollReveal>
      )}

      {isAliMobileEnhancedRepairPage && enhancedRepairType && !isAliMobileEnhancedIpadPage && !isAliMobileEnhancedMacBookPage && !isAliMobileEnhancedAppleWatchPage && (
        <ScrollReveal>
          <WhyChooseUsSection
            modelName={seoDisplayModel}
            repairType={enhancedRepairType as any}
            contentFamily={
              isAliMobileEnhancedSamsungTabletPage
                ? 'samsung-tablet'
                : isAliMobileEnhancedLenovoTabletPage
                ? 'lenovo-tablet'
                : isAliMobileEnhancedSamsungPage
                ? 'samsung'
                : isAliMobileEnhancedGooglePixelPage
                  ? 'google-pixel'
                  : 'iphone'
            }
            density={isIphone15ScreenMobilePilot || isAliMobileEnhancedLenovoTabletPage || isAliMobileEnhancedSamsungTabletPage ? 'comfortable' : 'default'}
          />
        </ScrollReveal>
      )}

      {/* ─── FAQ SECTION ──────────────────────────────── */}
      {!isAliMobileEnhancedMacBookPage && !isAliMobileEnhancedAppleWatchPage && (
        <ScrollReveal>
          <FaqAccordion
            faqs={faqs}
            density={isAliMobileEnhancedLenovoTabletPage || isAliMobileEnhancedSamsungTabletPage ? 'comfortable' : 'default'}
            layout="repair-detail"
          />
        </ScrollReveal>
      )}

      {isWaterDamageRepairPage && sameModelRepairSection}

      {isWaterDamageRepairPage && crossModelRepairSection}

      {isAliMobileEnhancedRepairPage && !isAliMobileEnhancedMacBookPage && !isAliMobileEnhancedAppleWatchPage && !isWaterDamageRepairPage && (
        <ScrollReveal>
          <ReviewsSection />
        </ScrollReveal>
      )}

      {isAliMobileEnhancedRepairPage && !isAliMobileEnhancedMacBookPage && !isAliMobileEnhancedAppleWatchPage && (
        <ScrollReveal>
          <ServiceAreas mobileVariant={isIphone15ScreenMobilePilot ? 'iphone15-compact-pilot' : undefined} />
        </ScrollReveal>
      )}

      {!isAliMobileEnhancedMacBookPage &&
        !isAliMobileEnhancedAppleWatchPage &&
        shouldRenderExploreRepairNetworkSection &&
        exploreRepairNetworkSectionProps &&
        (exploreRepairNetworkSectionProps.modelLinks.length > 0 ||
          exploreRepairNetworkSectionProps.categoryLinks.length > 0) && (
        <ScrollReveal>
          {isAliMobileEnhancedLenovoTabletPage || isAliMobileEnhancedSamsungTabletPage ? (
            <ExploreRepairNetworkSection
              sectionDescription={exploreRepairNetworkSectionProps.sectionDescription}
              modelGroupHeading={exploreRepairNetworkSectionProps.modelGroupHeading}
              modelLinks={exploreRepairNetworkSectionProps.modelLinks}
              categoryLinks={exploreRepairNetworkSectionProps.categoryLinks}
              mobileVariant={isIphone15ScreenMobilePilot ? 'iphone15-compact-pilot' : undefined}
            />
          ) : (
            <ExploreRepairNetworkSection
              sectionDescription={exploreRepairNetworkSectionProps.sectionDescription}
              modelGroupHeading={exploreRepairNetworkSectionProps.modelGroupHeading}
              modelLinks={exploreRepairNetworkSectionProps.modelLinks}
              categoryLinks={exploreRepairNetworkSectionProps.categoryLinks}
              mobileVariant={isIphone15ScreenMobilePilot ? 'iphone15-compact-pilot' : undefined}
            />
          )}
        </ScrollReveal>
      )}

      {isWaterDamageRepairPage && (
        <ScrollReveal>
          <ReviewsSection />
        </ScrollReveal>
      )}

      {enhancedIpadSeoPocket && (
        <ScrollReveal>
          <RepairDetailFinalCta
            headingId="ipad-final-cta-heading"
            section={enhancedIpadSeoPocket.finalCta}
            bookRepairHref={bookRepairUrl}
            phoneNumber={ALI_MOBILE_IPAD_BUSINESS.phone}
            isCentered={isAliMobileEnhancedIpadPage}
          />
        </ScrollReveal>
      )}

      {(enhancedLenovoTabletSeoPocket || enhancedSamsungTabletSeoPocket) && (
        <ScrollReveal>
          <RepairDetailFinalCta
            headingId="tablet-final-cta-heading"
            section={(enhancedLenovoTabletSeoPocket ?? enhancedSamsungTabletSeoPocket)!.finalCta}
            bookRepairHref={bookRepairUrl}
            phoneNumber={
              isAliMobileEnhancedLenovoTabletPage
                ? ALI_MOBILE_LENOVO_TABLET_BUSINESS.phone
                : ALI_MOBILE_SAMSUNG_TABLET_BUSINESS.phone
            }
            isCentered
          />
        </ScrollReveal>
      )}

    </>
  );
}
