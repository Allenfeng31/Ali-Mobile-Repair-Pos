import { describe, expect, it } from 'vitest';

import { metadata as screenMetadata } from './screen-replacement/page';
import { metadata as batteryMetadata } from './battery-replacement/page';
import { metadata as chargingMetadata } from './charging-port-replacement/page';
import { metadata as backGlassMetadata } from './back-glass-replacement/page';

describe('Repair Type Hub hybrid query canonical policy', () => {
  it.each([
    ['Screen', screenMetadata, 'https://www.alimobile.com.au/repairs/screen-replacement'],
    ['Battery', batteryMetadata, 'https://www.alimobile.com.au/repairs/battery-replacement'],
    ['Charging Port', chargingMetadata, 'https://www.alimobile.com.au/repairs/charging-port-replacement'],
    ['Back Glass', backGlassMetadata, 'https://www.alimobile.com.au/repairs/back-glass-replacement'],
  ])('%s keeps a clean canonical despite selected query UI state', (_label, metadata, canonical) => {
    expect(metadata.alternates?.canonical).toBe(canonical);
  });
});
