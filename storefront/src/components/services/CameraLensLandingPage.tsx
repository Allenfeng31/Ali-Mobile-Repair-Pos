import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  PhoneCall,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import ReviewsSection from "@/components/ReviewsSection";
import FaqAccordion from "@/components/FaqAccordion";
import CommonRepairProblemsSection from "@/components/services/CommonRepairProblemsSection";
import { ServiceSchema } from "@/components/services/ServiceSchema";
import SharedRepairBookingControls from "@/components/services/SharedRepairBookingControls";
import type { SharedRepairPageV2QuickAnswers } from "@/components/services/SharedRepairPageV2BookingControls";
import SharedRepairSelectedDevice, { type SharedRepairSelectedDeviceViewModel } from "@/components/services/SharedRepairSelectedDevice";
import CameraModuleRepairSelectionExperience from "@/components/services/CameraModuleRepairSelectionExperience";
import SharedRepairHeroFacts from "@/components/services/SharedRepairHeroFacts";
import SharedRepairPageResultsSection from "@/components/repair-results/SharedRepairPageResultsSection";
import {
  CAMERA_LENS_REPAIR_NAME,
  CAMERA_LENS_REPAIR_SLUG,
  type CameraLensModelOption,
  getCameraLensPrice,
} from "@/lib/virtualCameraLens";
import { getSharedRepairBookingHref } from "@/lib/sharedRepairBooking";
import type { SharedRepairPageCandidate, SharedRepairPageSupportedModel, SharedRepairPageV2PricingStrategy } from "@/lib/sharedRepairPageV2";
import { buildBrandSharedMasterModels } from "@/lib/brandSharedMasterModels";
import { SAMSUNG_CAMERA_LENS_CONTENT } from "@/data/samsungSharedRepairContent";
import { GOOGLE_PIXEL_CAMERA_LENS_CONTENT } from "@/data/googlePixelSharedRepairContent";
import { OPPO_CAMERA_LENS_CONTENT } from "@/data/oppoSharedRepairContent";
import { resolveSharedRepairContext, type SharedRepairRouteContext } from "@/lib/sharedRepairContext";
import type { RepairResultMatchingItem } from "@/lib/repair-results";

interface CameraLensLandingPageProps {
  brandName?: string;
  brandSlug?: string;
  title: string;
  intro: string;
  canonicalPath: string;
  models: CameraLensModelOption[];
  isGeneric?: boolean;
  showSharedRepairControls?: boolean;
  selectedDevice?: SharedRepairSelectedDeviceViewModel | null;
  sharedPageV2?: {
    supportedModels: SharedRepairPageSupportedModel[];
    priceCandidates: SharedRepairPageCandidate[];
    initialResults: RepairResultMatchingItem[];
    selectedModelSlug: string | null;
    quickAnswers: SharedRepairPageV2QuickAnswers;
    pricingStrategy: SharedRepairPageV2PricingStrategy;
  };
}

export function resolveCameraLensSelectedDevice({
  route,
  models,
  query,
}: {
  route: SharedRepairRouteContext;
  models: readonly CameraLensModelOption[];
  query: Readonly<{
    brand?: string | readonly string[];
    model?: string | readonly string[];
    service?: string | readonly string[];
  }>;
}) {
  const context = resolveSharedRepairContext({
    route,
    repairSlug: CAMERA_LENS_REPAIR_SLUG,
    bookingService: CAMERA_LENS_REPAIR_NAME,
    query,
    candidates: models.map((model) => ({
      canonicalBrandSlug: model.brandSlug,
      modelSlug: model.modelSlug,
      displayBrand: model.brand,
      displayModel: model.model,
    })),
  });
  const selectedModelSlug = context.reason === "model-context" ? context.modelSlug : null;
  const selectedDevice = context.reason === "model-context"
    && context.canonicalBrandSlug
    && context.modelSlug
    && context.displayBrand
    && context.displayModel
    ? {
        selectedDevice: {
          brand: context.displayBrand,
          brandSlug: context.canonicalBrandSlug,
          model: context.displayModel,
          modelSlug: context.modelSlug,
        },
        selectedRepair: { name: CAMERA_LENS_REPAIR_NAME, serviceSlug: CAMERA_LENS_REPAIR_SLUG },
        booking: {
          href: getSharedRepairBookingHref({
            repairName: CAMERA_LENS_REPAIR_NAME,
            repairSlug: CAMERA_LENS_REPAIR_SLUG,
            selectedModel: {
              brand: context.displayBrand,
              brandSlug: context.canonicalBrandSlug,
              model: context.displayModel,
              modelSlug: context.modelSlug,
            },
          }),
          isAvailable: true,
        },
      } satisfies SharedRepairSelectedDeviceViewModel
    : null;

  return { context, selectedModelSlug, selectedDevice };
}

function getDisplayPrice(brandName: string | undefined) {
  const price = getCameraLensPrice(brandName ?? "");
  return price > 0 ? `$${price}` : "Quote on Request";
}

export default function CameraLensLandingPage({
  brandName,
  brandSlug,
  title,
  intro,
  canonicalPath,
  models,
  isGeneric,
  showSharedRepairControls = false,
  selectedDevice = null,
  sharedPageV2,
}: CameraLensLandingPageProps) {
  const hasSharedRepairControls = Boolean(sharedPageV2) || showSharedRepairControls || brandSlug === "samsung";
  const samsungContent = brandSlug === "samsung" && sharedPageV2 ? SAMSUNG_CAMERA_LENS_CONTENT : null;
  const googlePixelContent = brandSlug === "google-pixel" && sharedPageV2 ? GOOGLE_PIXEL_CAMERA_LENS_CONTENT : null;
  const oppoContent = brandSlug === "oppo" && sharedPageV2 ? OPPO_CAMERA_LENS_CONTENT : null;
  const brandContent = samsungContent ?? googlePixelContent ?? oppoContent;
  const price = getDisplayPrice(brandName);
  const selectedLensDevice = selectedDevice && price.startsWith('$')
    ? { ...selectedDevice, priceLabel: price }
    : selectedDevice;
  const brandMasterHierarchy = sharedPageV2 ? {
    models: buildBrandSharedMasterModels({
      supportedModels: sharedPageV2.supportedModels,
      priceCandidates: sharedPageV2.priceCandidates,
      repairName: CAMERA_LENS_REPAIR_NAME,
      fixedPrice: sharedPageV2.pricingStrategy.mode === 'fixed' ? sharedPageV2.pricingStrategy.fixedPrice : 50,
    }),
    selectedBrandSlug: selectedDevice ? brandSlug ?? null : null,
    selectedModelSlug: selectedDevice ? sharedPageV2.selectedModelSlug : null,
    selectedDevice: selectedLensDevice,
  } : null;
  const isStartingPriceOnly = price === "Starting from";
  const fallbackBookingHref = getSharedRepairBookingHref({ repairName: CAMERA_LENS_REPAIR_NAME, fallbackBrandName: brandName });
  const repairHubHref = brandSlug
    ? `/repairs/phone/${brandSlug === "google" ? "google-pixel" : brandSlug}`
    : "/repairs/phone";
  const brandCameraHubHref = brandSlug === 'google-pixel'
    ? '/repairs/phone/google-pixel'
    : brandSlug === 'oppo'
      ? '/repairs/phone/oppo'
      : '/repairs/phone/samsung';
  const forceWhiteButtonText = brandSlug === "samsung" || brandSlug === "oppo" || brandSlug === "google";
  const repairHubLabel = brandName ? `${brandName} Repairs` : null;
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Phone Repairs", href: "/repairs/phone" },
    ...(repairHubLabel ? [{ label: repairHubLabel, href: repairHubHref }] : []),
    { label: CAMERA_LENS_REPAIR_NAME },
  ];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.alimobile.com.au";
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href ?? canonicalPath}`,
    })),
  };
  const commonProblems = [
    { title: "Cracked rear camera lens glass", description: "Chips or cracks can leave sharp edges and expose the camera opening to further contamination." },
    { title: "Blurry or hazy photos", description: "Haze may come from damaged outer glass, residue, dust, or an issue inside the camera module." },
    { title: "Glare or light streaks", description: "Cracked or marked lens glass can scatter light, especially around lamps and night photos." },
  ];

  return (
    <>
    {brandName ? <ServiceSchema serviceName={`${brandName} ${CAMERA_LENS_REPAIR_NAME}`} description={intro} url={`https://www.alimobile.com.au${canonicalPath}`} /> : null}
    <main className="repair-page-shell repair-page-shell-narrow repair-detail-page-shell" style={{ paddingBottom: 0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <nav aria-label="Breadcrumb" className="mb-8 flex justify-center text-center text-sm text-slate-600">
        <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
          {breadcrumbItems.map((item, index) => (
            <li key={item.label} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">›</span>}
              {item.href ? (
                <Link href={item.href} className="font-semibold transition-colors hover:text-blue-700 hover:underline">{item.label}</Link>
              ) : (
                <span aria-current="page" className="font-bold text-blue-600">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="repair-detail-topbar">
        <Link href={repairHubHref} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to {brandName ? `${brandName} repairs` : "phone repairs"}
        </Link>
      </div>

      {brandMasterHierarchy ? <CameraModuleRepairSelectionExperience
        useMasterFacts
        brandOnlySelection
        title={title}
        description={intro}
        eyebrow="Camera lens glass repair"
        icon="camera"
        bookingService={CAMERA_LENS_REPAIR_NAME}
        canonicalPath={canonicalPath}
        hierarchy={brandMasterHierarchy}
      /> : <section className="repair-hero repair-detail-hero relative" aria-labelledby="camera-lens-heading">
        <span className="repair-detail-icon text-blue-600">
          <Camera size={34} strokeWidth={2.4} aria-hidden="true" />
        </span>

        <span className="repair-kicker mx-auto mb-5">
          <Camera size={14} strokeWidth={2.6} aria-hidden="true" />
          Camera lens glass repair
        </span>

        <h1 id="camera-lens-heading">
          {title}
        </h1>
        <p className="repair-detail-subtitle">
          {intro}
        </p>

        {!selectedDevice ? <div className="mt-8 flex w-full flex-col items-center">
          {!isGeneric ? <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6 md:p-8">
            <span className="w-full text-center text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              Inspection first
            </span>
            <h2 className="mt-3 w-full text-center text-xl font-black leading-tight text-slate-950">
              {CAMERA_LENS_REPAIR_NAME}
            </h2>
            <p className={`mt-4 w-full text-center text-3xl font-extrabold ${isStartingPriceOnly ? "text-slate-950" : "text-blue-600"}`}>
              {price}
            </p>
            <p className="mt-3 w-full max-w-[32rem] text-center text-pretty text-sm font-semibold leading-6 text-slate-500">
              Final quote depends on parts, model and device condition.
            </p>
          </div> : null}

          {!selectedDevice ? <div id="shared-repair-model-selection" className="mt-6 flex w-full max-w-sm flex-col items-center justify-center gap-4">
            <Suspense fallback={<Link href={fallbackBookingHref} className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-blue-600 px-8 py-4 text-center text-lg font-bold !text-white shadow-lg shadow-blue-200">Book Repair Now</Link>}>
              <SharedRepairBookingControls basePath={canonicalPath} brandSlug={brandSlug} fallbackBookingBrand={brandName} models={models} repairName={CAMERA_LENS_REPAIR_NAME} showModelControls={hasSharedRepairControls} />
            </Suspense>
            <a
              href="tel:0481058514"
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-lg font-bold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <PhoneCall size={19} strokeWidth={2.6} aria-hidden="true" />
              Call 0481 058 514
            </a>
          </div> : null}
        </div> : null}

        {selectedLensDevice ? <SharedRepairSelectedDevice selection={selectedLensDevice} changeModelHref={`${canonicalPath}#shared-repair-model-selection`} /> : null}

        {isGeneric ? <SharedRepairHeroFacts priceLabel={price} /> : <div className="trust-badges mt-8">
          <div className="trust-badge">
            <span className="trust-badge-icon text-blue-600"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>
            Inspection Before Work
          </div>
          <div className="trust-badge">
            <span className="trust-badge-icon text-blue-600"><CheckCircle2 size={20} strokeWidth={2.5} aria-hidden="true" /></span>
            Clear Quote First
          </div>
          <div className="trust-badge">
            <span className="trust-badge-icon text-blue-600"><ShieldCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>
            Repair Warranty
          </div>
          <div className="trust-badge">
            <span className="trust-badge-icon text-blue-600"><BadgeCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>
            Ringwood Repair Desk
          </div>
        </div>}
      </section>}

      {sharedPageV2 ? <SharedRepairPageResultsSection initialResults={sharedPageV2.initialResults} repairName={CAMERA_LENS_REPAIR_NAME} /> : null}

      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="camera-lens-guidance-heading">
        <div className="repair-workbench-heading">
          <span>Repair guidance</span>
          <h2 id="camera-lens-guidance-heading" className="scroll-mt-32">
            Camera lens glass repair, explained clearly
          </h2>
          <p>{brandContent?.guidanceIntro ?? "We inspect the camera area first, confirm model fitment, then quote the lens glass repair before work begins."}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6">
          {(brandContent ? Array.from(brandContent.cards.slice(0, 2), (card: { title: string; body: string }) => ({ ...card, Icon: card.title.startsWith('Protective') ? Camera : Wrench })) : [
            {
              title: "Camera lens glass or camera module?",
              body: "This service is for damaged outer camera lens glass. If the internal camera module is affected, we confirm that separately before work begins.",
              Icon: Camera,
            },
            {
              title: "What happens during repair",
              body: "We inspect the camera area, confirm model fitment and price, replace the outer lens glass where suitable, then check camera output before handover.",
              Icon: Wrench,
            },
          ]).map(({ title: cardTitle, body, Icon }) => (
            <article
              key={cardTitle}
              className="flex h-full min-h-[188px] flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 md:p-[50px] text-center"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Icon size={20} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-balance text-[1rem] font-black leading-[1.14] tracking-normal text-slate-950">
                {cardTitle}
              </h3>
              <p className="mt-4 text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500">
                {body}
              </p>
              {brandContent && cardTitle === brandContent.cards[0].title ? <Link href={brandCameraHubHref} className="mt-4 text-sm font-bold text-blue-700 underline underline-offset-4 hover:text-blue-800">Explore {brandName} back camera repair options</Link> : null}
            </article>
          ))}
        </div>
        {hasSharedRepairControls ? <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6"><article className="flex min-h-[188px] flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 text-center md:p-[50px]"><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span><h3 className="mt-5 text-balance text-[1rem] font-black leading-[1.14] tracking-normal text-slate-950">{brandContent?.cards[2].title ?? 'Lens glass or a deeper camera fault?'}</h3><p className="mt-4 text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500">{brandContent?.cards[2].body ?? 'We check the protective lens glass, camera opening, frame or housing condition and camera output. Blurry images, focus failure, shake or a black preview can involve the camera module instead of lens glass alone.'}</p></article><article className="flex min-h-[188px] flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 text-center md:p-[50px]"><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><CheckCircle2 size={20} strokeWidth={2.5} aria-hidden="true" /></span><h3 className="mt-5 text-balance text-[1rem] font-black leading-[1.14] tracking-normal text-slate-950">{brandContent?.cards[3].title ?? 'Checks after suitable repair'}</h3><p className="mt-4 text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500">{brandContent?.cards[3].body ?? 'We check camera image output, focus, photo and video clarity, plus whether the lens opening is clean and correctly positioned.'}</p></article></div> : null}
      </section>

      <CommonRepairProblemsSection
        modelName={brandName ?? "Phone"}
        repairType="camera-lens-replacement"
        problems={commonProblems}
      />

      <section
        className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
        aria-labelledby="camera-lens-why-heading"
      >
        <div className="mx-auto flex w-full flex-col gap-8">
          <div className="repair-workbench-heading">
            <span>Why choose us</span>
            <h2 id="camera-lens-why-heading" className="scroll-mt-32">
              Why choose Ali Mobile & Repair
            </h2>
            <p>
              Our Ringwood repair desk keeps camera lens work inspection-led, quote-first, and focused on the repair path that suits the device condition.
            </p>
            {hasSharedRepairControls ? <p className="mt-4">Warranty applies to eligible standard repairs and the completed repair scope. We confirm the suitable repair path before work begins.</p> : null}
          </div>

          <div className="grid w-full grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-3 lg:gap-6">
            {[
              "Clear quote before work begins.",
              "Available for supported phone models.",
              "Camera output tested after suitable lens glass repair.",
            ].map((item) => (
              <article
                key={item}
                className="rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 md:p-[50px] text-center text-sm font-semibold leading-6 text-slate-700"
              >
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      {brandName ? <FaqAccordion
        density="comfortable"
        layout="repair-detail"
        faqs={brandContent ? [...brandContent.faqs] : [
          { question: `How much is ${brandName} camera lens replacement?`, answer: `${brandName} outer camera lens glass replacement is $50 where the protective lens-glass repair is suitable. We inspect model fitment and camera-area damage before work begins.` },
          { question: 'Can scratched or foggy photos need camera lens repair?', answer: 'They can when damaged outer lens glass, residue, or contamination is affecting the camera opening, but focus failure, shake, or a black preview can indicate a camera-module fault instead.' },
          { question: 'Will camera lens replacement delete my data?', answer: 'Camera lens glass repair does not normally erase data, but backing up important information before any repair is recommended.' },
          { question: 'How long does camera lens repair take?', answer: 'Timing depends on the exact model, lens fitment, part availability, and whether inspection finds deeper camera-area damage. We confirm timing before work begins.' },
        ]}
      /> : null}
      {brandName ? <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="camera-lens-location-heading">
        <div className="mx-auto rounded-[28px] border-[2px] border-slate-800 p-6 text-center md:p-[50px]">
          <h2 id="camera-lens-location-heading" className="text-2xl font-black text-slate-950">{brandName} camera lens repair in Ringwood</h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-600">Ali Mobile &amp; Repair is at Ringwood Square Shopping Centre, Kiosk C1, Ringwood VIC, serving nearby Mitcham, Croydon, Heathmont, Nunawading, and Melbourne&apos;s eastern suburbs.</p>
        </div>
      </section> : null}

      <section
        className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
        aria-labelledby="camera-lens-links-heading"
      >
        <div className="mx-auto flex w-full flex-col gap-6 rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 md:p-[50px] text-center">
          <div className="repair-workbench-heading">
            <span>Helpful links</span>
            <h2 id="camera-lens-links-heading" className="scroll-mt-32">
              Explore related repair pages
            </h2>
            <p>
              Browse phone repairs or return to the relevant repair hub to compare other repair options.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/repairs/phone"
              className={`inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-extrabold transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${forceWhiteButtonText ? "!text-white" : "text-white"}`}
            >
              Phone Repair Services
            </Link>
            <Link
              href={repairHubHref}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {brandName ? `${brandName} Repair Hub` : "Phone Repair Hub"}
            </Link>
            {isGeneric && [
              ["Samsung Repair Hub", "/repairs/phone/samsung"],
              ["Google Pixel Repair Hub", "/repairs/phone/google-pixel"],
              ["OPPO Repair Hub", "/repairs/phone/oppo"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
    <ReviewsSection />
    </>
  );
}
