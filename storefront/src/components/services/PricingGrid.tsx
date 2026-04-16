import React from 'react';

interface PricingItem {
  model: string;
  service: string;
  price: string;
}

interface PricingGridProps {
  items: PricingItem[];
  title?: string;
}

export function PricingGrid({ items, title }: PricingGridProps) {
  return (
    <section className="pricing-section py-12">
      {title && <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>}
      <div className="overflow-x-auto rounded-2xl border border-outline-variant/10 shadow-sm">
        <table className="w-full text-left border-collapse bg-surface-container-lowest">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-6 py-4 font-black text-sm uppercase tracking-widest text-on-surface-variant">Model</th>
              <th className="px-6 py-4 font-black text-sm uppercase tracking-widest text-on-surface-variant">Service</th>
              <th className="px-6 py-4 font-black text-sm uppercase tracking-widest text-on-surface-variant text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4 font-bold text-on-surface">{item.model}</td>
                <td className="px-6 py-4 text-on-surface-variant">{item.service}</td>
                <td className="px-6 py-4 font-black text-primary text-right whitespace-nowrap">
                  Starting at {item.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[10px] text-on-surface-variant italic text-center">
        * Prices may vary based on part availability and specific device condition. Contact us for a precise quote.
      </p>
    </section>
  );
}
