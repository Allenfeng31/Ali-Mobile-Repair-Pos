import { describe, expect, it } from 'vitest';

import { getCanonicalPublicRepairServiceSlug } from './repairServiceIdentity';

describe('getCanonicalPublicRepairServiceSlug', () => {
  it.each([
    ['Battery', 'battery-replacement'],
    ['Battery Service', 'battery-replacement'],
    ['Battery Replacement', 'battery-replacement'],
    ['Galaxy Tab S11 Battery Service', 'battery-replacement'],
    ['Lenovo Tab P12 Battery Service', 'battery-replacement'],
    ['Screen', 'screen-replacement'],
    ['Screen Repair', 'screen-replacement'],
    ['Screen Replacement', 'screen-replacement'],
    ['Galaxy Tab S11 Screen Repair', 'screen-replacement'],
    ['Charging Port', 'charging-port-replacement'],
    ['Charging Port Repair', 'charging-port-replacement'],
    ['Charging Port Replacement', 'charging-port-replacement'],
    ['Lenovo Tab P12 Charging Port Repair', 'charging-port-replacement'],
    ['Front Camera', 'front-camera-replacement'],
    ['Front Camera Replacement', 'front-camera-replacement'],
    ['Galaxy Tab S11 Front Camera Replacement', 'front-camera-replacement'],
    ['Back Camera', 'back-camera-replacement'],
    ['Back Camera Replacement', 'back-camera-replacement'],
    ['Lenovo Tab P12 Back Camera Replacement', 'back-camera-replacement'],
  ])('maps %s to %s', (service, expectedSlug) => {
    expect(getCanonicalPublicRepairServiceSlug(service)).toBe(expectedSlug);
  });

  it.each([
    'Battery Connector',
    'Battery Data',
    'Battery Board Repair',
    'Screen Calibration',
    'Charging Assessment',
    'Front Camera Service',
    'Back Camera Service',
    '',
  ])('fails closed for unsupported service label %s', (service) => {
    expect(getCanonicalPublicRepairServiceSlug(service)).toBeNull();
  });
});
