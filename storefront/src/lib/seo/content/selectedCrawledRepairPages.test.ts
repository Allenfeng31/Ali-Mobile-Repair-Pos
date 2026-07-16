import { describe, expect, it } from 'vitest';
import { getAliMobileEnhancedIpadSeoPocket } from '@/lib/seo/content/ipad';
import {
  getSelectedCrawledModelHubContent,
  getSelectedCrawledRepairPageContent,
} from './selectedCrawledRepairPages';

const getRepairContent = (category: string, brand: string, model: string, repairType: string) =>
  getSelectedCrawledRepairPageContent({ category, brand, model, repairType });

describe('selected crawled repair page content', () => {
  it('scopes new repair-page content to the approved Realme, Galaxy Z Fold5, and OPPO Reno9 Pro routes only', () => {
    expect(getRepairContent('phone', 'realme', '8-5g', 'screen-replacement')).not.toBeNull();
    expect(getRepairContent('phone', 'samsung', 'galaxy-z-fold-5', 'charging-port-replacement')).not.toBeNull();
    expect(getRepairContent('phone', 'oppo', 'reno-9-pro', 'charging-port-replacement')).not.toBeNull();

    expect(getRepairContent('phone', 'realme', '8-5g', 'battery-replacement')).toBeNull();
    expect(getRepairContent('phone', 'oppo', 'a31', 'screen-replacement')).toBeNull();
    expect(getRepairContent('phone', 'samsung', 'galaxy-z-fold-4', 'charging-port-replacement')).toBeNull();
  });

  it('keeps approved metadata natural, model-specific, and free of unsupported promises', () => {
    const pages = [
      getRepairContent('phone', 'realme', '8-5g', 'screen-replacement'),
      getRepairContent('phone', 'samsung', 'galaxy-z-fold-5', 'charging-port-replacement'),
      getRepairContent('phone', 'oppo', 'reno-9-pro', 'charging-port-replacement'),
    ];

    expect(pages.every(Boolean)).toBe(true);
    expect(pages.map((page) => page!.metaTitle)).toEqual([
      'Realme 8 5G Screen Replacement in Ringwood | Ali Mobile & Repair',
      'Galaxy Z Fold 5 Charging Port Replacement in Ringwood | Ali Mobile & Repair',
      'OPPO Reno 9 Pro Charging Port Replacement in Ringwood | Ali Mobile & Repair',
    ]);

    const renderedCopy = JSON.stringify(pages);
    expect(renderedCopy).not.toMatch(/same-day|data preservation|restores reliable|genuine|original parts|water resistance/i);
  });

  it('adds scoped OPPO A31 model-hub copy without changing canonical or robots ownership', () => {
    const a31 = getSelectedCrawledModelHubContent({ category: 'phone', brand: 'oppo', model: 'a31' });

    expect(a31).toMatchObject({
      metaTitle: 'OPPO A31 Repair Options in Ringwood | Ali Mobile & Repair',
    });
    expect(a31?.metaDescription).toContain('screen, battery, charging, and camera-related services');
    expect(a31?.heroIntro).toContain('exact canonical repair page');
    expect(a31).not.toHaveProperty('canonical');
    expect(a31).not.toHaveProperty('robots');
    expect(getSelectedCrawledModelHubContent({ category: 'phone', brand: 'oppo', model: 'a32' })).toBeNull();
  });

  it('preserves the existing iPad 6th Generation front-camera constraints', () => {
    const ipad = getAliMobileEnhancedIpadSeoPocket({
      modelSlug: 'ipad-6th-generation',
      repairSlug: 'front-camera-replacement',
    });
    const renderedCopy = JSON.stringify(ipad);

    expect(ipad?.metaTitle).toBe('iPad 6th Generation Front Camera Replacement in Ringwood | Ali Mobile & Repair');
    expect(renderedCopy).toMatch(/black preview|blurry image|video-call/i);
    expect(renderedCopy).not.toMatch(/Face ID/i);
  });
});
