import { Clock3, MapPin, ShieldCheck, Tag } from 'lucide-react';

export default function SharedRepairHeroFacts({ priceLabel }: { priceLabel: string }) {
  const facts = [
    { label: 'Price', value: priceLabel, icon: Tag },
    { label: 'Repair Time', value: '30 Minutes', icon: Clock3 },
    { label: 'Warranty', value: '6 Months Warranty', icon: ShieldCheck },
    { label: 'Location', value: 'Ringwood Square', icon: MapPin },
  ];

  return <dl className="trust-badges mt-8" aria-label="Repair facts">
    {facts.map(({ label, value, icon: Icon }) => <div key={label} className="trust-badge max-w-full !flex-col !gap-1 !whitespace-normal text-center">
      <dt className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600"><Icon className="shrink-0 text-blue-600" size={16} aria-hidden="true" />{label}</dt>
      <dd className="m-0 break-words text-sm font-bold text-slate-950">{value}</dd>
    </div>)}
  </dl>;
}
