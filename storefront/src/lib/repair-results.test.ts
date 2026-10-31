import { describe, expect, it } from 'vitest';

import { getRepairResultFrameConfig } from './repair-results';

describe('getRepairResultFrameConfig', () => {
  it('gives laptop proof enough desktop width without changing phone or tablet frames', () => {
    expect(getRepairResultFrameConfig('laptop')).toMatchObject({
      aspectRatio: '16 / 10',
      maxWidth: '760px',
      sizes: '(min-width: 1280px) 760px, (min-width: 1024px) 68vw, (min-width: 640px) 92vw, 100vw',
    });
    expect(getRepairResultFrameConfig('tablet').maxWidth).toBe('660px');
    expect(getRepairResultFrameConfig('phone').maxWidth).toBe('420px');
  });
});
