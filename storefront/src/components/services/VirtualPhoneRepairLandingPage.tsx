"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, ClipboardCheck, Ear, PhoneCall, Power, ShieldCheck, Volume2, Wrench } from "lucide-react";
import ReviewsSection from "@/components/ReviewsSection";
import CommonRepairProblemsSection from "@/components/services/CommonRepairProblemsSection";
import { getVirtualPhoneRepair, type VirtualPhoneRepairModelOption, type VirtualPhoneRepairSlug } from "@/lib/virtualPhoneRepairs";
import { formatScopedRepairPriceLabel } from "@/lib/scopedRepairPriceLabel";

interface VirtualPhoneRepairLandingPageProps {
  brandName?: string;
  brandSlug?: string;
  repairSlug: VirtualPhoneRepairSlug;
  canonicalPath: string;
  models: VirtualPhoneRepairModelOption[];
  isGeneric?: boolean;
}

function getSelectedModel(models: VirtualPhoneRepairModelOption[], brandParam: string | null, modelParam: string | null, fixedBrandSlug?: string) {
  if (!modelParam) return null;
  return models.find((model) => (fixedBrandSlug ? model.brandSlug === fixedBrandSlug : !brandParam || model.brandSlug === brandParam) && model.modelSlug === modelParam) ?? null;
}

function getIcon(icon: string) {
  if (icon === "earpiece") return Ear;
  if (icon === "power") return Power;
  if (icon === "volume") return Volume2;
  return Volume2;
}

export default function VirtualPhoneRepairLandingPage(props: VirtualPhoneRepairLandingPageProps) {
  return <Suspense fallback={null}><VirtualPhoneRepairLandingPageContent {...props} /></Suspense>;
}

function VirtualPhoneRepairLandingPageContent({ brandName, brandSlug, repairSlug, canonicalPath, models, isGeneric }: VirtualPhoneRepairLandingPageProps) {
  const searchParams = useSearchParams();
  const repair = getVirtualPhoneRepair(repairSlug);
  if (!repair) return null;
  const priceLabel = formatScopedRepairPriceLabel(repair.slug, 50, 'From $50', 'virtual');
  const selectedModel = getSelectedModel(models, searchParams.get("brand"), searchParams.get("model"), brandSlug);
  const params = new URLSearchParams({ category: "phone", service: repair.name });
  if (selectedModel) {
    params.set("brand", selectedModel.brandSlug === "google-pixel" ? "google" : selectedModel.brand);
    params.set("model", selectedModel.model);
  }
  const bookRepairHref = `/book-repair?${params.toString()}`;
  const repairHubHref = brandSlug ? `/repairs/phone/${brandSlug === "google" ? "google-pixel" : brandSlug}` : "/repairs/phone";
  const repairHubLabel = brandName ? `${brandName} Repairs` : null;
  const pageTitle = `${brandName ? `${brandName} ` : "Phone "}${repair.name} in Ringwood`;
  const Icon = getIcon(repair.icon);
  const relatedRepair = repair.slug === "loudspeaker-replacement" ? "earpiece-speaker-replacement" : repair.slug === "earpiece-speaker-replacement" ? "loudspeaker-replacement" : repair.slug === "power-button-replacement" ? "volume-button-replacement" : "power-button-replacement";
  const related = getVirtualPhoneRepair(relatedRepair)!;
  const relatedHref = brandSlug ? `/repairs/phone/${brandSlug === "google-pixel" ? "google" : brandSlug}/${related.slug}` : `/repairs/phone/${related.slug}`;
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Phone Repairs", href: "/repairs/phone" },
    ...(repairHubLabel ? [{ label: repairHubLabel, href: repairHubHref }] : []),
    { label: repair.name },
  ];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.alimobile.com.au";
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: `${baseUrl}${item.href ?? canonicalPath}` })) };
  const contentCards = [
    { title: "What this repair covers", body: repair.summary, Icon },
    { title: "Common signs", body: repair.signs, Icon },
    { title: "Hardware problem or another cause?", body: repair.diagnosis, Icon: ClipboardCheck },
    { title: "Inspection and repair", body: "We inspect the device, confirm the suitable repair path and quote before work begins. Repair time depends on diagnosis and part availability.", Icon: Wrench },
  ];

  return <>
    <main className="repair-page-shell repair-page-shell-narrow repair-detail-page-shell" style={{ paddingBottom: 0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <nav aria-label="Breadcrumb" className="mb-8 flex justify-center text-center text-sm text-slate-600"><ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">{breadcrumbs.map((item, index) => <li key={item.label} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true">›</span>}{item.href ? <Link href={item.href} className="font-semibold transition-colors hover:text-blue-700 hover:underline">{item.label}</Link> : <span aria-current="page" className="font-bold text-blue-600">{item.label}</span>}</li>)}</ol></nav>
      <div className="repair-detail-topbar"><Link href={repairHubHref} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><ArrowLeft size={17} aria-hidden="true" />Back to {brandName ? `${brandName} repairs` : "phone repairs"}</Link></div>
      <section className="repair-hero repair-detail-hero relative" aria-labelledby="virtual-phone-repair-heading">
        <span className="repair-detail-icon text-blue-600"><Icon size={34} strokeWidth={2.4} aria-hidden="true" /></span>
        <span className="repair-kicker mx-auto mb-5"><Icon size={14} strokeWidth={2.6} aria-hidden="true" />{repair.eyebrow}</span>
        <h1 id="virtual-phone-repair-heading">{pageTitle}</h1>
        <p className="repair-detail-subtitle">{repair.summary} Ali Mobile & Repair in Ringwood confirms final pricing after inspection if additional damage or parts are involved.</p>
        <div className="mt-8 flex w-full flex-col items-center"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6 md:p-8"><span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Inspection first</span><h2 className="mt-3 text-xl font-black leading-tight text-slate-950">{repair.name}</h2><p className="mt-4 text-3xl font-extrabold text-blue-600">{priceLabel}</p><p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-500">Final pricing is confirmed after inspection if additional damage or parts are involved.</p></div><div className="mt-6 flex w-full max-w-sm flex-col items-center justify-center gap-4"><Link href={bookRepairHref} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-center text-lg font-bold !text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Book Repair Now<ArrowRight size={20} strokeWidth={2.6} aria-hidden="true" /></Link><a href="tel:0481058514" className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-lg font-bold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><PhoneCall size={19} strokeWidth={2.6} aria-hidden="true" />Call 0481 058 514</a></div></div>
        <div className="trust-badges mt-8"><div className="trust-badge"><span className="trust-badge-icon text-blue-600"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Inspection Before Work</div><div className="trust-badge"><span className="trust-badge-icon text-blue-600"><CheckCircle2 size={20} strokeWidth={2.5} aria-hidden="true" /></span>Clear Quote First</div><div className="trust-badge"><span className="trust-badge-icon text-blue-600"><ShieldCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Repair Warranty</div><div className="trust-badge"><span className="trust-badge-icon text-blue-600"><BadgeCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Ringwood Repair Desk</div></div>
      </section>
      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="repair-guidance-heading"><div className="repair-workbench-heading"><span>Repair guidance</span><h2 id="repair-guidance-heading" className="scroll-mt-32">{repair.name}, explained clearly</h2><p>We inspect the device condition first, then provide a clear quote for the suitable repair path.</p></div><div className="grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6">{contentCards.map(({ title, body, Icon: CardIcon }) => <article key={title} className="flex h-full min-h-[188px] flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 md:p-[50px] text-center"><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><CardIcon size={20} strokeWidth={2.5} aria-hidden="true" /></span><h3 className="mt-5 text-balance text-[1rem] font-black leading-[1.14] tracking-normal text-slate-950">{title}</h3><p className="mt-4 text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500">{body}</p></article>)}</div></section>
      <CommonRepairProblemsSection modelName={brandName ?? "Phone"} repairType={repair.slug} problems={[{ title: "Inspection before replacement", description: "We check the relevant speaker or button area and explain the repair options before work begins." }, { title: "Clear quote first", description: "The $50 figure is a starting price. Final pricing depends on the device condition and suitable repair path." }]} />
      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="why-heading"><div className="repair-workbench-heading"><span>Why choose us</span><h2 id="why-heading" className="scroll-mt-32">Why choose Ali Mobile & Repair</h2><p>Our Ringwood repair desk keeps phone repairs inspection-led, quote-first and focused on supported models.</p></div><div className="grid w-full grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-3 lg:gap-6">{["Clear quote before work begins.", "Available for supported phone models.", "Repair time depends on diagnosis and part availability."].map((item) => <article key={item} className="rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 md:p-[50px] text-center text-sm font-semibold leading-6 text-slate-700">{item}</article>)}</div></section>
      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="links-heading"><div className="mx-auto flex w-full flex-col gap-6 rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 md:p-[50px] text-center"><div className="repair-workbench-heading"><span>Helpful links</span><h2 id="links-heading" className="scroll-mt-32">Explore related repair pages</h2><p>Compare relevant phone repairs or return to the appropriate repair hub.</p></div><div className="flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="/repairs/phone" className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-extrabold !text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Phone Repair Services</Link><Link href={relatedHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{related.name}</Link><Link href={repairHubHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{brandName ? `${brandName} Repair Hub` : "Phone Repair Hub"}</Link>{isGeneric && [["Samsung repair", "/repairs/phone/samsung"], ["Google Pixel repair", "/repairs/phone/google-pixel"], ["OPPO repair", "/repairs/phone/oppo"]].map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{label}</Link>)}</div></div></section>
    </main>
    <ReviewsSection />
  </>;
}
