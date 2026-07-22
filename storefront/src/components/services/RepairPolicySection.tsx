import { CheckCircle2, ChevronDown, ClipboardCheck, ShieldAlert, ShieldCheck } from 'lucide-react';

import {
  INSPECTION_FEE_SUMMARY,
  NO_FIX_NO_CHARGE_SUMMARY,
  PREVIOUS_LIQUID_DAMAGE_LIMITATION,
  REPAIR_PATH_SUMMARY,
  STANDARD_WARRANTY_SUMMARY,
  WARRANTY_EXCLUSIONS,
  WATER_DAMAGE_WARRANTY_SUMMARY,
  type RepairPolicyVariant,
} from '@/lib/repairPolicy';

interface RepairPolicySectionProps {
  variant: RepairPolicyVariant;
}

interface PolicyDisclosureProps {
  summary: string;
  children: React.ReactNode;
}

function PolicyDisclosure({ summary, children }: PolicyDisclosureProps) {
  return (
    <details className="group overflow-hidden rounded-[28px] border-2 border-slate-200 bg-white shadow-[0_18px_45px_-38px_rgba(15,23,42,0.55)] transition-colors duration-200 hover:border-blue-300 motion-reduce:transition-none">
      <summary className="flex cursor-pointer list-none flex-col items-center gap-4 px-6 py-6 text-center text-base font-bold text-slate-900 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 sm:px-10 sm:py-8">
        <span>{summary}</span>
        <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
          <span className="group-open:hidden">Show details</span>
          <span className="hidden group-open:inline">Hide details</span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none group-open:rotate-180" />
        </span>
      </summary>
      <div className="border-t border-slate-200 px-6 pb-8 pt-6 text-sm leading-7 text-slate-600 sm:px-10 sm:pb-10 sm:pt-8">
        <div className="mx-auto max-w-3xl text-left">{children}</div>
      </div>
    </details>
  );
}

export default function RepairPolicySection({ variant }: RepairPolicySectionProps) {
  const isWaterDamageRepair = variant === 'water-damage';

  return (
    <section className="mx-auto my-[50px] w-full max-w-[1280px] px-5 lg:px-[50px]" aria-labelledby="repair-policy-heading">
      <div className="rounded-[36px] border-2 border-slate-900 bg-white p-5 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.5)] sm:p-8 lg:p-[50px]">
        <div className="flex flex-col items-center text-center">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isWaterDamageRepair ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
            {isWaterDamageRepair ? <ShieldAlert aria-hidden="true" className="h-6 w-6" /> : <ShieldCheck aria-hidden="true" className="h-6 w-6" />}
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-blue-700">Good to know</p>
          <h2 id="repair-policy-heading" className="mt-4 text-balance text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">Warranty and repair policy</h2>
        </div>

        {isWaterDamageRepair ? (
          <div className="mt-[50px] flex min-h-[180px] flex-col items-center justify-center rounded-[28px] border-2 border-rose-200 bg-rose-50 px-6 py-8 text-center sm:px-10">
            <ShieldAlert aria-hidden="true" className="h-8 w-8 text-rose-700" />
            <p className="mt-5 text-lg font-black text-rose-950">No warranty for water damage service</p>
          </div>
        ) : (
          <ul className="mt-[50px] hidden grid-cols-1 gap-[50px] lg:grid lg:grid-cols-3" aria-label="Key repair policy facts">
            <li className="flex min-h-[180px] flex-col items-center justify-center rounded-[28px] border-2 border-slate-200 bg-slate-50 px-6 py-8 text-center transition-colors duration-200 hover:border-blue-300 hover:bg-blue-50 motion-reduce:transition-none sm:px-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
                <ShieldCheck aria-hidden="true" className="h-6 w-6" />
              </span>
              <p className="mt-5 text-base font-black text-slate-950">6-month warranty</p>
              <p className="mt-4 max-w-[16rem] text-sm leading-6 text-slate-600">Parts and labour included.</p>
            </li>
            <li className="flex min-h-[180px] flex-col items-center justify-center rounded-[28px] border-2 border-slate-200 bg-slate-50 px-6 py-8 text-center transition-colors duration-200 hover:border-blue-300 hover:bg-blue-50 motion-reduce:transition-none sm:px-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
                <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
              </span>
              <p className="mt-5 text-base font-black text-slate-950">No Fix, No Charge</p>
              <p className="mt-4 max-w-[16rem] text-sm leading-6 text-slate-600">No charge if the diagnosed repair does not solve the fault.</p>
            </li>
            <li className="flex min-h-[180px] flex-col items-center justify-center rounded-[28px] border-2 border-slate-200 bg-slate-50 px-6 py-8 text-center transition-colors duration-200 hover:border-blue-300 hover:bg-blue-50 motion-reduce:transition-none sm:px-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
                <ClipboardCheck aria-hidden="true" className="h-6 w-6" />
              </span>
              <p className="mt-5 text-base font-black text-slate-950">Clear approval</p>
              <p className="mt-4 max-w-[16rem] text-sm leading-6 text-slate-600">Any inspection fee is agreed before work starts.</p>
            </li>
          </ul>
        )}

        <div className="mt-[50px] space-y-[50px]">
          <PolicyDisclosure summary={isWaterDamageRepair ? 'Water damage service coverage' : 'Warranty coverage and exclusions'}>
            <p className="text-base leading-8 text-slate-700">{isWaterDamageRepair ? WATER_DAMAGE_WARRANTY_SUMMARY : STANDARD_WARRANTY_SUMMARY}</p>
            {!isWaterDamageRepair && (
              <>
                <p className="mt-6 border-l-2 border-blue-200 pl-5 text-base leading-8 text-slate-700">{PREVIOUS_LIQUID_DAMAGE_LIMITATION}</p>
                <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
                  {WARRANTY_EXCLUSIONS.map((exclusion) => (
                    <li key={exclusion} className="flex items-start gap-3 py-3">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{exclusion}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </PolicyDisclosure>
          <PolicyDisclosure summary="No Fix, No Charge details">
            <p className="text-base leading-8 text-slate-700">{NO_FIX_NO_CHARGE_SUMMARY}</p>
          </PolicyDisclosure>
          <PolicyDisclosure summary="Inspection, repair or replacement">
            <p className="text-base leading-8 text-slate-700">{INSPECTION_FEE_SUMMARY}</p>
            <p className="mt-6 border-l-2 border-blue-200 pl-5 text-base leading-8 text-slate-700">{REPAIR_PATH_SUMMARY}</p>
          </PolicyDisclosure>
        </div>
      </div>
    </section>
  );
}
