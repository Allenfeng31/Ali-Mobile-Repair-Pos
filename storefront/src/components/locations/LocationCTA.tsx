"use client";

import React from 'react';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';

/**
 * LocationContent represents the core CTA buttons on the location page.
 * We move this to a client component to handle analytics tracking 
 * without breaking the SSR of the main location page.
 */
export default function LocationCTA() {
  return (
    <div className="flex flex-wrap gap-4">
      <Link 
        href="/book-repair"
        className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        onClick={() => analytics.trackGetQuote()}
      >
        Get Instant Quote
      </Link>
      <a 
        href="https://www.google.com/maps/dir/?api=1&destination=Ali+Mobile+%26+Repair+Ringwood" 
        target="_blank"
        rel="noopener noreferrer"
        className="border-2 border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-bold hover:border-slate-300 hover:bg-slate-50 transition text-center"
        onClick={() => analytics.trackNavigate()}
      >
        Get Directions
      </a>
    </div>
  );
}

export function LocationCallCTA() {
  return (
    <a 
      href="tel:0481058514" 
      className="text-3xl font-bold text-white hover:text-blue-400 transition"
      onClick={() => analytics.trackCallNow()}
    >
      📞 0481 058 514
    </a>
  );
}
