import { isBatchOneSecondaryPhoneBrand } from '@/lib/secondaryPhoneModelIdentity';

type Batch1RepairSlug = 'screen-replacement' | 'battery-replacement' | 'charging-port-replacement';

interface SecondaryPhoneRepairDetailContent {
  heroSubtitle: string;
  section: {
    kicker: string;
    heading: string;
    intro: string;
    items: readonly string[];
  };
}

const HERO_SUBTITLE = 'Confirm your device details and request a repair quote. Parts availability and repair options will be confirmed after assessment.';

function getServiceSection(
  repairSlug: Batch1RepairSlug,
  modelName: string,
): SecondaryPhoneRepairDetailContent['section'] {
  if (repairSlug === 'screen-replacement') {
    return {
      kicker: 'Screen repair guide',
      heading: `${modelName} screen symptoms and assessment`,
      intro: 'Glass damage, display failure and touch issues can look similar but may require different repair work. We inspect the device before confirming the repair plan and quote.',
      items: [
        'Cracked outer glass can occur while the image and touch response still work. Inspection is needed because visible glass damage does not show whether the display assembly or frame is also affected.',
        'Black areas, lines, flicker, colour changes or no image can indicate display failure. Intermittent, unresponsive or unintended touch input can indicate a related touch issue.',
        'The technician checks the image, touch response, visible frame condition and signs of additional damage before confirming the suitable repair option.',
        'The service may involve fitting a compatible screen assembly. Model variant, frame condition, part compatibility and additional faults can change the final repair scope.',
      ],
    };
  }

  if (repairSlug === 'battery-replacement') {
    return {
      kicker: 'Battery repair guide',
      heading: `${modelName} battery symptoms and assessment`,
      intro: 'Battery deterioration can resemble charging or other power faults. We check the device before confirming that battery replacement is the appropriate repair.',
      items: [
        'Rapid battery drain, unexpected shutdowns, irregular charge percentage or reduced runtime can be consistent with battery deterioration, but these symptoms do not confirm the cause by themselves.',
        'Failure to charge or power on can also involve a charging fault, accessory, connector or another power fault, so the battery is not assumed to be the only cause.',
        'The technician checks charging response, power behaviour, visible device condition and available battery information before recommending replacement.',
        'Battery replacement may involve opening the device, removing the fitted battery and installing a compatible replacement. Device condition, model variant and part compatibility are confirmed first.',
      ],
    };
  }

  return {
    kicker: 'Charging port repair guide',
    heading: `${modelName} charging port symptoms and assessment`,
    intro: 'Intermittent charging, a loose connection or a device that does not charge can have several causes. We test the charging path before confirming whether port work is appropriate.',
    items: [
      'Charging only at a certain angle, a loose cable connection, repeated disconnects or no charging response can indicate a port issue, but the symptom alone does not confirm the fault.',
      'The technician checks suitable charging accessories, charging response and the visible condition of the port before recommending repair.',
      'Battery condition, contamination, connector damage, liquid exposure or another power fault may require cleaning or further diagnosis instead of immediate port replacement.',
      'The service may involve cleaning where appropriate, repairing a connection or fitting a compatible charging-port assembly. The final scope depends on inspection and model compatibility.',
    ],
  };
}

export function getBatch1SecondaryPhoneRepairDetailContent({
  brandSlug,
  modelName,
  repairSlug,
}: {
  brandSlug: string;
  modelName: string;
  repairSlug: string;
}): SecondaryPhoneRepairDetailContent | null {
  if (!isBatchOneSecondaryPhoneBrand(brandSlug)) return null;
  if (!['screen-replacement', 'battery-replacement', 'charging-port-replacement'].includes(repairSlug)) return null;

  return {
    heroSubtitle: HERO_SUBTITLE,
    section: getServiceSection(repairSlug as Batch1RepairSlug, modelName),
  };
}
