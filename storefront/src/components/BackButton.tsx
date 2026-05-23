"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton({ fallbackHref }: { fallbackHref?: string }) {
  const router = useRouter();

  return (
    <button 
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else if (fallbackHref) {
          router.push(fallbackHref);
        } else {
          router.push('/repairs');
        }
      }}
      className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[var(--foreground)] opacity-60 hover:opacity-100 transition-opacity mb-5 self-start"
      aria-label="Go back"
    >
      <ChevronLeft size={18} strokeWidth={2.5} />
      <span>Back</span>
    </button>
  );
}
