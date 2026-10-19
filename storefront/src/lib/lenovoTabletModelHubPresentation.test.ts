import { describe, expect, it } from 'vitest';

import { LENOVO_TABLET_STANDARD_REPAIR_MODEL_CONFIG_LIST } from './seo/content/lenovo-tablet/config';
import { LENOVO_TABLET_REPAIR_TYPES } from './seo/content/lenovo-tablet/types';
import { getLenovoTabletModelHubPresentation } from './lenovoTabletModelHubPresentation';

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
});
