const TIER_DESCRIPTION_OVERRIDES: Record<string, Record<string, string>> = {
  'screen replacement': {
    Budget: 'High-quality aftermarket part. Best for quick, cost-effective fixes.',
    Standard: 'Industry-standard replacement part with reliable performance.',
    Premium: 'Top-tier aftermarket display selected for strong colour, touch response and daily reliability.',
    Genuine: 'Original equipment display where available, selected for the closest match to factory display performance.',
  },
  'battery replacement': {
    Budget: 'Cost-effective replacement battery for basic daily use.',
    Standard: 'Reliable replacement battery selected for stable charging and everyday performance.',
    Premium: 'High-quality replacement battery selected for stronger daily reliability and longer service life.',
    Genuine: 'Original equipment battery where available, selected for the closest match to factory performance.',
  },
  'charging port replacement': {
    Budget: 'Cost-effective charging port repair option for basic charging function.',
    Standard: 'Reliable charging port part selected for stable charging and cable connection.',
    Premium: 'High-quality charging port assembly selected for stronger fit, connection stability and daily durability.',
    Genuine: 'Original equipment charging component where available.',
  },
  'back housing replacement': {
    Budget: 'Cost-effective rear glass or housing repair option for basic cosmetic restoration.',
    Standard: 'Reliable rear glass or housing replacement selected for fit and everyday use.',
    Premium: 'High-quality rear glass or housing assembly selected for better fit, finish and durability.',
    Genuine: 'Original equipment rear housing assembly where available.',
  },
  'back glass / back housing replacement': {
    Budget: 'Cost-effective rear glass or housing repair option for basic cosmetic restoration.',
    Standard: 'Reliable rear glass or housing replacement selected for fit and everyday use.',
    Premium: 'High-quality rear glass or housing assembly selected for better fit, finish and durability.',
    Genuine: 'Original equipment rear housing assembly where available.',
  },
  'front camera replacement': {
    Budget: 'Cost-effective front camera repair option for basic photo and video use.',
    Standard: 'Reliable front camera replacement selected for clear selfies and video calls.',
    Premium: 'High-quality front camera part selected for sharper image quality and stable daily use.',
    Genuine: 'Original equipment front camera component where available.',
  },
  'back camera replacement': {
    Budget: 'Cost-effective rear camera repair option for basic photo and video use.',
    Standard: 'Reliable rear camera replacement selected for clear everyday photos and videos.',
    Premium: 'High-quality rear camera part selected for sharper image quality and stable focus performance.',
    Genuine: 'Original equipment rear camera component where available.',
  },
};

export function getRepairTierDescription(
  repairName: string,
  tierName: string,
  tierDescriptions: Record<string, string> = {},
) {
  return TIER_DESCRIPTION_OVERRIDES[repairName.toLowerCase().trim()]?.[tierName] ?? tierDescriptions[tierName];
}
