"use client";

import React from 'react';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';

interface RepairCTAProps {
  modelSlug: string;
  repairSlug: string;
  modelName: string;
  repairName: string;
}

export default function RepairCTA({ 
  modelSlug, 
  repairSlug, 
  modelName, 
  repairName 
}: RepairCTAProps) {
  return (
    <div className="cta-group">
      <Link 
        href={`/book-repair?model=${modelSlug}&repair=${repairSlug}`} 
        className="cta-book"
        onClick={() => analytics.trackBookRepair(modelName, repairName)}
      >
        Book Repair Now
      </Link>
      <a 
        href="tel:0481058514" 
        className="cta-call"
        onClick={() => analytics.trackCallNow(modelName, repairName)}
      >
        📞 Call 0481 058 514
      </a>
    </div>
  );
}
