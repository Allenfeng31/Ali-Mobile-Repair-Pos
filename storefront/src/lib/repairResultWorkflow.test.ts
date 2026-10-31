import { describe, expect, it } from 'vitest';

import {
  applyRepairResultTaxonomyChange,
  createInitialRepairResultForm,
  generateRepairResultSeo,
  type RepairResultTaxonomy,
} from './repairResultWorkflow';

const taxonomy: RepairResultTaxonomy = {
  categories: [{
    value: 'phone',
    label: 'Phone',
    brands: [{
      name: 'Google Pixel',
      slug: 'google-pixel',
      models: [{
        name: 'Pixel 9 Pro',
        slug: 'pixel-9-pro',
        repairTypes: [{
          name: 'Screen Replacement',
          slug: 'screen-replacement',
          relatedRepairUrl: '/repairs/phone/google-pixel/pixel-9-pro/screen-replacement',
        }],
      }],
    }],
  }],
};

describe('repair result workflow descriptions', () => {
  it('keeps the existing title identity while generating neutral description and image alt text without Ringwood', () => {
    const generated = generateRepairResultSeo('Pixel 9 Pro', 'Screen Replacement', 'screen-replacement');

    expect(generated.title).toBe('Pixel 9 Pro Screen Replacement in Ringwood');
    expect(generated.short_description).toContain('Pixel 9 Pro');
    expect(generated.short_description).toContain('Screen Replacement');
    expect(generated.short_description).not.toMatch(/Ringwood|cracked|restored|successful/i);
    expect(generated.image_pair_alt_text).toBe('Before and after photos of a Pixel 9 Pro Screen Replacement.');
  });

  it('prepopulates the neutral text only after a complete canonical selection', () => {
    let form = createInitialRepairResultForm();
    form = applyRepairResultTaxonomyChange(form, taxonomy, 'brand_slug', 'google-pixel').form;
    form = applyRepairResultTaxonomyChange(form, taxonomy, 'model_slug', 'pixel-9-pro').form;
    const result = applyRepairResultTaxonomyChange(form, taxonomy, 'repair_type_slug', 'screen-replacement');

    expect(result.generatedSeo?.short_description).toContain('Pixel 9 Pro');
    expect(result.form.related_repair_url).toBe('/repairs/phone/google-pixel/pixel-9-pro/screen-replacement');
  });
});
