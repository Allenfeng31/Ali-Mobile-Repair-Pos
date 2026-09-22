import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export type SharedRepairSelectedDeviceViewModel = Readonly<{
  selectedDevice: Readonly<{
    brand: string;
    brandSlug: string;
    model: string;
    modelSlug: string;
  }>;
  selectedRepair: Readonly<{
    name: string;
    serviceSlug: string;
  }>;
  booking: Readonly<{
    href: string;
    isAvailable: boolean;
  }>;
}>;

export default function SharedRepairSelectedDevice({
  selection,
  changeModelHref,
}: {
  selection: SharedRepairSelectedDeviceViewModel;
  changeModelHref: string;
}) {
  return (
    <section data-shared-repair-selected-device className="mx-auto mt-6 w-full max-w-md rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6" aria-labelledby="shared-repair-selected-device-heading">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Selected device</span>
      <h2 id="shared-repair-selected-device-heading" className="mt-2 text-xl font-black leading-tight text-slate-950">
        {selection.selectedDevice.brand} {selection.selectedDevice.model}
      </h2>
      <p className="mt-2 text-sm font-semibold text-slate-600">{selection.selectedRepair.name}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {selection.booking.isAvailable ? <Link href={selection.booking.href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold !text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
          Book Repair Now <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
        </Link> : null}
        <a href={changeModelHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 font-bold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
          <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />Change model
        </a>
      </div>
    </section>
  );
}
