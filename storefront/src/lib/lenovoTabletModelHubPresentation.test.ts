import { describe, expect, it } from 'vitest';

import { LENOVO_TABLET_STANDARD_REPAIR_MODEL_CONFIG_LIST } from './seo/content/lenovo-tablet/config';
import { LENOVO_TABLET_REPAIR_TYPES } from './seo/content/lenovo-tablet/types';
import {
  getLenovoTabletModelHubMetadata,
  getLenovoTabletModelHubPresentation,
} from './lenovoTabletModelHubPresentation';

describe('Lenovo Tablet Model Hub presentation', () => {
  it('uses the commercial name and configured model-number line for all 19 canonical models', () => {
    expect(LENOVO_TABLET_STANDARD_REPAIR_MODEL_CONFIG_LIST).toHaveLength(19);

    for (const model of LENOVO_TABLET_STANDARD_REPAIR_MODEL_CONFIG_LIST) {
      const presentation = getLenovoTabletModelHubPresentation({
        modelSlug: model.modelSlug,
        fallbackModelName: 'incorrect fallback',
        repairTypes: LENOVO_TABLET_REPAIR_TYPES.map((slug) => ({ slug })),
      });

      expect(presentation.commercialModelName).toBe(model.modelName.replace(/\s+\([^)]*\)$/, ''));
      expect(presentation.commercialModelName).not.toMatch(/\((?:TB|YT)-/);
      expect(presentation.modelNumbersLabel).toBe(
        model.modelCodes.length ? `Model Numbers: ${model.modelCodes.join(' / ')}` : null,
      );
      expect(presentation.heroDescription).not.toMatch(/Ringwood|suburb|near me/i);
    }
  });

  it('mentions only services supported by the exact Lenovo model', () => {
    const presentation = getLenovoTabletModelHubPresentation({
      modelSlug: 'lenovo-tab-m11',
      fallbackModelName: 'Lenovo Tab M11',
      repairTypes: [
        { slug: 'screen-replacement' },
        { slug: 'battery-replacement' },
        { slug: 'charging-port-replacement' },
      ],
    });

    expect(presentation).toMatchObject({
      commercialModelName: 'Lenovo Tab M11',
      modelNumbersLabel: null,
      heroDescription: 'We repair Lenovo Tab M11 screens, batteries, and charging ports. Explore the available repair options for your model, check pricing and find out what each repair involves.',
    });
    expect(presentation.heroDescription).not.toContain('cameras');
  });

  it('creates commercial, POS-supported metadata without model codes, geography, or pricing claims', () => {
    expect(getLenovoTabletModelHubMetadata({
      modelSlug: 'lenovo-tab-p12-tb-370fu',
      fallbackModelName: 'incorrect fallback',
      repairTypes: [
        { slug: 'screen-replacement', repairOrigin: 'pos' },
        { slug: 'battery-replacement', repairOrigin: 'pos' },
        { slug: 'charging-port-replacement', repairOrigin: 'pos' },
        { slug: 'front-camera-replacement', repairOrigin: 'pos' },
        { slug: 'back-camera-replacement', repairOrigin: 'pos' },
        { slug: 'water-damage-repair', repairOrigin: 'synthetic-core' },
      ],
    })).toEqual({
      title: 'Lenovo Tab P12 Repair & Pricing | Ali Mobile',
      description: 'Explore Lenovo Tab P12 screen, battery, charging port and camera repair options. Check available pricing and find the right repair for your tablet.',
    });

    expect(getLenovoTabletModelHubMetadata({
      modelSlug: 'lenovo-tab-m11',
      fallbackModelName: 'Lenovo Tab M11',
      repairTypes: [
        { slug: 'screen-replacement', repairOrigin: 'pos' },
        { slug: 'battery-replacement', repairOrigin: 'pos' },
        { slug: 'charging-port-replacement', repairOrigin: 'pos' },
      ],
    })).toEqual({
      title: 'Lenovo Tab M11 Repair & Pricing | Ali Mobile',
      description: 'Explore Lenovo Tab M11 screen, battery and charging port repair options. Check available pricing and find the right repair for your tablet.',
    });
  });

  it('does not invent repair coverage when no POS-supported service is available', () => {
    expect(getLenovoTabletModelHubMetadata({
      modelSlug: 'lenovo-tab-p12-tb-370fu',
      fallbackModelName: 'Lenovo Tab P12 (TB-370FU)',
      repairTypes: [{ slug: 'screen-replacement', repairOrigin: 'synthetic-backfill' }],
    }).description).toBe(
      'Explore available repair options for your Lenovo Tab P12. Check available pricing and find the right repair for your tablet.',
    );
  });
});
