import Link from 'next/link';
import { Suspense } from 'react';
import { CheckCircle2, ClipboardCheck, PhoneCall, Zap, ShieldAlert, Cpu } from 'lucide-react';
import type { SharedRepairModelCandidate } from '@/lib/sharedRepairContext';
import LogicBoardRepairBookingControls from '@/components/services/LogicBoardRepairBookingControls';

type LogicBoardRepairLandingPageProps = Readonly<{
  canonicalPath: string;
  candidates: readonly SharedRepairModelCandidate[];
}>;

export default function LogicBoardRepairLandingPage({ canonicalPath, candidates }: LogicBoardRepairLandingPageProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Phone Repairs', href: '/repairs/phone' },
    { label: 'Logic Board Repair' },
  ];
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.label,
      item: `https://www.alimobile.com.au${item.href ?? canonicalPath}`,
    })),
  };

  return (
    <main className="repair-page-shell repair-page-shell-narrow repair-detail-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <nav aria-label="Breadcrumb" className="mb-8 flex justify-center text-center text-sm text-slate-600">
        <ol className="flex flex-wrap items-center justify-center gap-2">
          {breadcrumbs.map((item, index) => <li key={item.label} className="flex items-center gap-2">{index > 0 ? <span aria-hidden="true">›</span> : null}{item.href ? <Link href={item.href} className="font-semibold hover:text-blue-700 hover:underline">{item.label}</Link> : <span aria-current="page" className="font-bold text-blue-600">{item.label}</span>}</li>)}
        </ol>
      </nav>
      <section className="repair-hero repair-detail-hero relative text-center" aria-labelledby="logic-board-heading">
        <span className="repair-kicker mx-auto mb-5"><Cpu size={14} strokeWidth={2.6} aria-hidden="true" />Logic board assessment</span>
        <h1 id="logic-board-heading">Phone Logic Board Repair in Ringwood</h1>
        <p className="repair-detail-subtitle">Assessment-led microsoldering and board-level diagnosis. We trace the fault before quoting a repair.</p>
        <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Quote only</span>
          <h2 className="mt-3 text-xl font-black text-slate-950">Assessment before repair</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">Logic board faults require initial diagnosis. We explain your options and quote after inspecting the device.</p>
        </div>
        <div className="mt-6 flex w-full justify-center">
          <Suspense fallback={<Link href="/book-repair?category=phone&service=Logic+Board+Repair" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 font-bold !text-white">Request an assessment</Link>}>
            <LogicBoardRepairBookingControls basePath={canonicalPath} candidates={candidates} />
          </Suspense>
        </div>
      </section>
      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="symptoms-heading">
        <div className="repair-workbench-heading"><span>Common symptoms</span><h2 id="symptoms-heading">When to arrange a board assessment</h2><p>Board faults can mimic bad batteries, faulty screens or charging ports, so physical inspection is the first step.</p></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-700"><CheckCircle2 className="mb-3 text-blue-600" size={20} aria-hidden="true" />No power or refusing to turn on</article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-700"><CheckCircle2 className="mb-3 text-blue-600" size={20} aria-hidden="true" />Boot loops and unexpected restarting</article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-700"><CheckCircle2 className="mb-3 text-blue-600" size={20} aria-hidden="true" />Intermittent faults with audio, touch or signal</article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-700"><CheckCircle2 className="mb-3 text-blue-600" size={20} aria-hidden="true" />Liquid or drop-related board symptoms</article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-700"><CheckCircle2 className="mb-3 text-blue-600" size={20} aria-hidden="true" />Problems that persist after standard parts replacement</article>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-14" aria-label="Repair boundaries and process">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><Zap className="mb-4 text-blue-600" size={25} aria-hidden="true" /><h2 className="text-xl font-black text-slate-950">Assessment process</h2><p className="mt-3 text-sm font-semibold leading-6 text-slate-700">We start with an initial diagnosis to isolate the board-level cause. If it is a logic board fault, we explain your options and quote. We only proceed with microsoldering or board-level repairs after your approval.</p></article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><ShieldAlert className="mb-4 text-blue-600" size={25} aria-hidden="true" /><h2 className="text-xl font-black text-slate-950">Outcomes are not guaranteed</h2><p className="mt-3 text-sm font-semibold leading-6 text-slate-700">Logic board repair involves unpredictable variables. We cannot guarantee a successful repair, nor do we guarantee data recovery or fixed timeframes. For some severely damaged devices, board repair may not be economical.</p></article>
      </section>
      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"><div className="rounded-2xl border border-slate-200 bg-white p-6 text-center"><ClipboardCheck className="mx-auto text-blue-600" size={26} aria-hidden="true" /><h2 className="mt-3 text-xl font-black text-slate-950">Call ahead for advice</h2><p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">If you suspect a logic board fault, call us before travelling to Ringwood Square. We can advise on the assessment process and whether your device model is suitable for board-level inspection.</p><div className="mt-5 flex flex-wrap justify-center gap-3"><a href="tel:0481058514" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><PhoneCall size={18} aria-hidden="true" />Call the repair desk</a><Link href="/repairs/water-damage" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-bold text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Water damage repair</Link><Link href="/repairs/phone/charging-port-replacement" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-bold text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Charging port repair</Link></div></div></section>
    </main>
  );
}
