import { describe, expect, it } from 'vitest';

import { SAMSUNG_TABLET_MODEL_CONFIG_LIST } from './seo/content/samsung-tablet/config';
import { SAMSUNG_TABLET_REPAIR_TYPES } from './seo/content/samsung-tablet/types';
import { getSamsungTabletModelHubPresentation } from './samsungTabletModelHubPresentation';

describe('Samsung Tablet Model Hub presentation', () => {
  it('uses the commercial model name and established model-code line for all 39 canonical models', () => {
    expect(SAMSUNG_TABLET_MODEL_CONFIG_LIST).toHaveLength(39);

    for (const model of SAMSUNG_TABLET_MODEL_CONFIG_LIST) {
      const presentation = getSamsungTabletModelHubPresentation({
        modelSlug: model.modelSlug,
        fallbackModelName: 'incorrect fallback',
        repairTypes: SAMSUNG_TABLET_REPAIR_TYPES.map((slug) => ({ slug })),
      });

      expect(presentation.commercialModelName).toBe(model.modelName.replace(/\s+\([^)]*\)$/, ''));
      expect(presentation.commercialModelName).not.toMatch(/\(SM-/);
      expect(presentation.modelNumbersLabel).toBe(`Model Numbers: ${model.modelCodes.join(' / ')}`);
      expect(presentation.heroDescription).not.toMatch(/Ringwood|suburb|near me/i);
    }
  });

  it('mentions only supported catalogue repair types in the Hero description', () => {
    const presentation = getSamsungTabletModelHubPresentation({
      modelSlug: 'galaxy-tab-s11-sm-x730-sm-x736',
      fallbackModelName: 'Galaxy Tab S11 (SM-X730 / SM-X736)',
      repairTypes: [
        { slug: 'screen-replacement' },
        { slug: 'battery-replacement' },
        { slug: 'charging-port-replacement' },
        { slug: 'front-camera-replacement' },
      ],
    });

    expect(presentation).toMatchObject({
      commercialModelName: 'Galaxy Tab S11',
      modelNumbersLabel: 'Model Numbers: SM-X730 / SM-X736',
      heroDescription: 'We repair Galaxy Tab S11 screens, batteries, charging ports, and front cameras. Explore the available repair options for your model, check pricing and find out what each repair involves.',
    });
    expect(presentation.heroDescription).not.toContain('back cameras');
  });
});
