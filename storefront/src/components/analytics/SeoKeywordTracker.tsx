"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

type SeoKeywordTrackerProps = {
  keyword: string;
  slug: string;
};

export default function SeoKeywordTracker({ keyword, slug }: SeoKeywordTrackerProps) {
  useEffect(() => {
    analytics.trackSeoKeywordView(keyword, slug);
  }, [keyword, slug]);

  return null;
}
