import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('Root Layout GA4 Source Contract', () => {
  const layoutPath = path.join(__dirname, 'layout.tsx');
  const layoutSource = readFileSync(layoutPath, 'utf-8');

  it('imports and uses GoogleAnalytics from @next/third-parties', () => {
    expect(layoutSource).toContain('import { GoogleAnalytics } from "@next/third-parties/google"');
    expect(layoutSource).toContain('<GoogleAnalytics gaId={gaId} />');
  });

  it('uses the validated configuration helper rather than reading env directly into the component', () => {
    expect(layoutSource).toContain('import { getValidatedGoogleAnalyticsId } from "@/lib/googleAnalytics"');
    expect(layoutSource).toContain('getValidatedGoogleAnalyticsId(');
  });

  it('does not hardcode the measurement ID', () => {
    expect(layoutSource).not.toContain('G-0NZN1D3MMX');
  });

  it('does not implement manual page views or event tracking', () => {
    expect(layoutSource).not.toContain('page_view');
    expect(layoutSource).not.toContain('sendGAEvent');
    expect(layoutSource).not.toContain('usePathname');
    expect(layoutSource).not.toContain('useSearchParams');
  });

  it('does not include raw GTM or gtag scripts', () => {
    expect(layoutSource).not.toContain('gtag(');
    expect(layoutSource).not.toContain('GTM-');
    expect(layoutSource).not.toContain('googletagmanager.com');
  });

  it('remains a Server Component', () => {
    expect(layoutSource).not.toContain('"use client"');
    expect(layoutSource).not.toContain("'use client'");
  });
});
