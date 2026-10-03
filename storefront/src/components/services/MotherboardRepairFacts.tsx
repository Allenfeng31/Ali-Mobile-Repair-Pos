import { ClipboardCheck, Clock3, MapPin, MessageSquareQuote } from 'lucide-react';

const FACTS = [
  { label: 'Pricing', value: 'Quote on Request', icon: MessageSquareQuote },
  { label: 'Repair Time', value: 'Around 2–3 Weeks', icon: Clock3 },
  { label: 'Assessment', value: 'Board-Level Diagnosis', icon: ClipboardCheck },
  { label: 'Location', value: 'Ringwood Square', icon: MapPin },
] as const;

export default function MotherboardRepairFacts() {
  return <dl data-motherboard-repair-facts className="trust-badges mt-8" aria-label="Motherboard repair facts">
    {FACTS.map(({ label, value, icon: Icon }) => <div key={label} className="trust-badge max-w-full !flex-col !gap-1 !whitespace-normal text-center">
      <dt className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600"><Icon className="shrink-0 text-blue-600" size={16} aria-hidden="true" />{label}</dt>
      <dd className="m-0 break-words text-sm font-bold text-slate-950">{value}</dd>
    </div>)}
  </dl>;
}
