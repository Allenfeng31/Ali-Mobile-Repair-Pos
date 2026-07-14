"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  PhoneCall,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import ReviewsSection from "@/components/ReviewsSection";
import CommonRepairProblemsSection from "@/components/services/CommonRepairProblemsSection";
import {
  CAMERA_LENS_REPAIR_NAME,
  CAMERA_LENS_REPAIR_SLUG,
  type CameraLensModelOption,
  getCameraLensPrice,
} from "@/lib/virtualCameraLens";
import { formatScopedRepairPriceLabel } from "@/lib/scopedRepairPriceLabel";

interface CameraLensLandingPageProps {
  brandName?: string;
  brandSlug?: string;
  title: string;
  intro: string;
  canonicalPath: string;
  models: CameraLensModelOption[];
  isGeneric?: boolean;
}

function getInitialSelection(
  models: CameraLensModelOption[],
  brandParam: string | null,
  modelParam: string | null,
  fixedBrandSlug?: string
) {
  if (!modelParam) return null;

  return models.find((option) => {
    const brandMatches = fixedBrandSlug
      ? option.brandSlug === fixedBrandSlug
      : !brandParam || option.brandSlug === brandParam;

    return brandMatches && option.modelSlug === modelParam;
  }) ?? null;
}

function getBookRepairHref(option: CameraLensModelOption | null, fallbackBrandName?: string) {
  const params = new URLSearchParams({
    category: "phone",
    service: CAMERA_LENS_REPAIR_NAME,
  });

  if (option) {
    params.set("brand", option.brandSlug === "google-pixel" ? "google" : option.brand);
    params.set("model", option.model);
  } else if (fallbackBrandName) {
    params.set("brand", fallbackBrandName);
  }

  return `/book-repair?${params.toString()}`;
}

function getDisplayPrice(brandName: string | undefined, selectedModel: CameraLensModelOption | null) {
  const price = getCameraLensPrice(selectedModel?.brand ?? brandName ?? "");
  return formatScopedRepairPriceLabel(CAMERA_LENS_REPAIR_SLUG, price, price > 0 ? `$${price}` : "Quote on Request", 'virtual');
}

export default function CameraLensLandingPage(props: CameraLensLandingPageProps) {
  return (
    <Suspense fallback={null}>
      <CameraLensLandingPageContent {...props} />
    </Suspense>
  );
}

function CameraLensLandingPageContent({
  brandName,
  brandSlug,
  title,
  intro,
  canonicalPath,
  models,
  isGeneric,
}: CameraLensLandingPageProps) {
  const searchParams = useSearchParams();
  const selectedModel = getInitialSelection(
    models,
    searchParams.get("brand"),
    searchParams.get("model"),
    brandSlug
  );
  const price = getDisplayPrice(brandName, selectedModel);
  const isStartingPriceOnly = price === "Starting from";
  const bookRepairHref = getBookRepairHref(selectedModel, brandName);
  const repairHubHref = brandSlug
    ? `/repairs/phone/${brandSlug === "google" ? "google-pixel" : brandSlug}`
    : "/repairs/phone";
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

      <section className="repair-hero repair-detail-hero relative" aria-labelledby="camera-lens-heading">
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

        <div className="mt-8 flex w-full flex-col items-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6 md:p-8">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              Inspection first
            </span>
            <h2 className="mt-3 text-xl font-black leading-tight text-slate-950">
              {CAMERA_LENS_REPAIR_NAME}
            </h2>
            <p className={`mt-4 text-3xl font-extrabold ${isStartingPriceOnly ? "text-slate-950" : "text-blue-600"}`}>
              {price}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-500">
              {isStartingPriceOnly
                ? "Final price is confirmed after inspection. If the camera module is damaged, we will explain the repair options before work begins."
                : "Final fitment is confirmed after inspection. If the camera module is damaged, we will advise before repair."}
            </p>
          </div>

          <div className="mt-6 flex w-full max-w-sm flex-col items-center justify-center gap-4">
            <Link
              href={bookRepairHref}
              className={`inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-center text-lg font-bold shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${forceWhiteButtonText ? "!text-white" : "text-white"}`}
            >
              Book Repair Now
              <ArrowRight size={20} strokeWidth={2.6} aria-hidden="true" />
            </Link>
            <a
              href="tel:0481058514"
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-lg font-bold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <PhoneCall size={19} strokeWidth={2.6} aria-hidden="true" />
              Call 0481 058 514
            </a>
          </div>
        </div>

        <div className="trust-badges mt-8">
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
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="camera-lens-guidance-heading">
        <div className="repair-workbench-heading">
          <span>Repair guidance</span>
          <h2 id="camera-lens-guidance-heading" className="scroll-mt-32">
            Camera lens glass repair, explained clearly
          </h2>
          <p>
            We inspect the camera area first, confirm model fitment, then quote the lens glass repair before work begins.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6">
          {[
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
          ].map(({ title: cardTitle, body, Icon }) => (
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
            </article>
          ))}
        </div>
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
