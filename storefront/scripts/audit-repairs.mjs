import fs from 'fs';
import path from 'path';

function safeSlugSegment(slug) {
  if (!slug) return '';
  return slug.toString().toLowerCase().trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatDynamicParam(param) {
  if (!param) return '';
  return param
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 1. Generate combinations for 100 high-risk URLs
const models = [
  { c: 'phones', b: 'apple', m: 'iphone-15-pro-max' },
  { c: 'phones', b: 'apple', m: 'iphone-15' },
  { c: 'phones', b: 'apple', m: 'iphone-14-pro' },
  { c: 'phones', b: 'apple', m: 'iphone-13' },
  { c: 'phones', b: 'apple', m: 'iphone-12' },
  { c: 'phones', b: 'apple', m: 'iphone-11' },
  { c: 'phones', b: 'samsung', m: 'galaxy-s23-ultra' },
  { c: 'phones', b: 'samsung', m: 'galaxy-s22' },
  { c: 'phones', b: 'samsung', m: 'galaxy-a54' },
  { c: 'phones', b: 'google', m: 'pixel-7-pro' },
  { c: 'phones', b: 'google', m: 'pixel-6a' },
  { c: 'tablets', b: 'apple', m: 'ipad-pro-12-9' },
  { c: 'tablets', b: 'apple', m: 'ipad-air-5' },
  { c: 'tablets', b: 'samsung', m: 'galaxy-tab-s8' },
  { c: 'tablets', b: 'samsung', m: 'galaxy-tab-a7' },
];

const repairs = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-repair',
  'water-damage-repair',
  'back-glass-replacement',
  'front-camera-replacement',
  'volume-button-repair'
];

let combos = [];
for (const mod of models) {
  for (const rep of repairs) {
    if (combos.length < 100) {
      combos.push({ ...mod, r: rep });
    }
  }
}

// 2. FAQ Logic from repairFaqs.ts
const LSI_KEYWORDS = {
  components: { screen: ['screen', 'display panel'], battery: ['battery', 'power cell'], chargingPort: ['charging port', 'dock connector'] },
  issues: { screenDamage: ['cracked glass', 'display issue'], batteryDrain: ['fast drain', 'power drop'], waterDamage: ['liquid exposure'] }
};

function getLSIForRepair(slug) {
  if (slug === 'screen-replacement') return { component: LSI_KEYWORDS.components.screen, issue: LSI_KEYWORDS.issues.screenDamage };
  if (slug === 'battery-replacement') return { component: LSI_KEYWORDS.components.battery, issue: LSI_KEYWORDS.issues.batteryDrain };
  if (slug === 'charging-port-repair' || slug === 'charging-port-replacement') return { component: LSI_KEYWORDS.components.chargingPort };
  if (slug === 'water-damage-repair') return { issue: LSI_KEYWORDS.issues.waterDamage };
  if (slug === 'back-glass-replacement' || slug === 'back-glass-repair' || slug === 'back-housing-replacement') return { component: ['back housing', 'rear panel', 'back glass'] };
  if (slug === 'camera-repair' || slug === 'front-camera-replacement' || slug === 'back-camera-replacement') return { component: ['camera module', 'lens assembly'] };
  return {};
}

function generateFaqs(model, repairName, repairSlug, price, modelCode, brand) {
  const lsi = getLSIForRepair(repairSlug);
  const component = lsi.component?.[0] || repairName.toLowerCase();
  const altComponent = lsi.component?.[1] || 'damaged component';

  const displayModel = modelCode ? `${model} (${modelCode})` : model;
  const isWaterDamage = repairSlug === 'water-damage-repair';

  const priceInfo = isWaterDamage
    ? `Water damage recovery starts from $50 for the intensive cleaning and drying process. If additional parts like a screen or battery are needed, we will provide a comprehensive quote after the internal assessment.`
    : (price > 0
      ? `Starting from $${price}, the exact pricing depends on the specific ${displayModel} variant.`
      : `Pricing depends on the specific ${displayModel} variant and the condition of the ${component}. Use our Live Quote tool or call 0481 058 514 for an instant, accurate price.`);

  const isBackGlass = repairSlug.includes('back-glass') || repairSlug.includes('back-housing');

  const baseFaqs = [
    {
      question: `How long does the ${model} ${repairName} take?`,
      answer: isWaterDamage
        ? `Water damage recovery typically takes around 1 hour for the initial assessment and cleaning. If the damage is extensive, our technicians will inform you beforehand.`
        : isBackGlass
        ? `Time depends on the specific ${model} variant and parts availability. Many back glass repairs need more time than simple screen or battery repairs, usually taking longer to ensure a safe, clean removal and precise bonding. We confirm the timeframe after checking the device at our Ringwood location.`
        : `Most ${model} ${repairName.toLowerCase()} jobs are completed in under 1 hour at Ringwood Square Shopping Centre. Walk-ins are welcome on weekdays for same-day service.`,
    },
    {
      question: `Do you use OEM parts for ${model} ${repairName.toLowerCase()}?`,
      answer: isWaterDamage
        ? `For water damage, our first priority is to rescue your original high-quality boards and components using specialized cleaning. If a component like the screen is beyond saving, we replace it with premium parts that meet or exceed OEM standards.`
        : `We use premium-quality ${component} parts that meet or exceed OEM specifications. All parts come with our 6-month warranty, so you can be confident in the quality of the ${altComponent} replacement.`,
    },
    {
      question: `How much does a ${model} ${repairName.toLowerCase()} cost?`,
      answer: `${priceInfo} ${isWaterDamage ? 'Please note that due to the labor-intensive nature of the drying and cleaning process, a specialized labor fee applies even if the device is ultimately unrepairable.' : 'Our "No Fix, No Charge" policy means you only pay if we successfully complete the repair.'}`,
    },
    {
      question: `What if my ${model} has additional damage beyond the ${isWaterDamage ? 'initial leak' : component}?`,
      answer: `Our technicians perform a free diagnostic assessment on every device. ${isWaterDamage ? 'Water damage often affects multiple areas simultaneously. We will test every function and give you a full report before you commit to any major part replacements.' : `If we discover additional issues such as ${lsi.issue?.[0] || 'internal damage'}, we'll inform you before proceeding with any extra work. You're never charged for repairs you didn't approve.`}`,
    },
    {
      question: `Is there a warranty for ${model} ${isWaterDamage ? 'water damage recovery' : repairName.toLowerCase()}?`,
      answer: isWaterDamage
        ? `Due to the unpredictable nature of liquid-induced corrosion, we do not offer a general warranty on water damage rescue services. However, if we replace a specific part (like a new screen), that specific part will still be covered by our 6-month warranty, provided the rest of the device remains stable.`
        : `Yes, all our standard repairs come with a comprehensive 6-month warranty on both parts and labor at our Ringwood location.`,
    },
  ];

  if ((brand?.toLowerCase() === 'apple' || brand?.toLowerCase() === 'iphone') && repairSlug.includes('screen')) {
    baseFaqs.splice(1, 0, {
      question: "What is the difference between Standard, Premium, and Genuine screens?",
      answer: `We offer three tiers to suit your budget...`
    });
  }

  return baseFaqs;
}

// 3. Evaluation logic
const reports = [];

let passCount = 0;
let needsFixCount = 0;
let noindexCount = 0;

for (const m of combos) {
  const brand = formatDynamicParam(m.b);
  const model = formatDynamicParam(m.m);
  const repairName = formatDynamicParam(m.r);
  
  const title = `${model} ${repairName} in Ringwood | Ali Mobile`;
  const h1 = `${model} ${repairName} in Ringwood`;
  const url = `/repairs/${m.c}/${m.b}/${m.m}/${m.r}`;
  const canonicalUrl = `https://www.alimobile.com.au/repairs/${m.c}/${m.b}/${m.m}/${m.r}`;
  const schemaServiceType = `${model} ${repairName} in Ringwood`;
  
  // badge logic from page.tsx
  let badges = ['Under 1 Hour', 'No Fix, No Charge', '6-Month Warranty', 'Clear Quote First'];
  if (m.r === 'water-damage-repair') {
      badges = ['Timeframe Depends on Damage', 'Inspection First', 'Warranty Depends on Repair Result', 'Diagnostic Required'];
  } else if (m.r.includes('back-glass') || m.r.includes('back-housing')) {
      badges = ['Timeframe Varies', 'No Fix, No Charge', '6-Month Warranty', 'Clear Quote First'];
  }

  const warrantyText = "6-Month Warranty";
  const faqs = generateFaqs(model, repairName, m.r, 0, undefined, brand);

  let detectedIssue = '';
  let severity = 'LOW';
  let status = 'PASS';
  let fixTemplate = '';

  // Apply User Auditing Rules
  const faqText = JSON.stringify(faqs).toLowerCase();

  // Rule 1: title / H1 repeating model name
  if (title.match(new RegExp(`${model} .*${model}`, 'i'))) {
     detectedIssue = 'Title/H1 repeats model name'; severity = 'MEDIUM'; status = 'NEEDS_FIX'; fixTemplate = 'metadata generator';
  }

  // Rule 2: battery page having water damage FAQ
  else if (m.r.includes('battery') && faqText.includes('water damage')) {
     detectedIssue = 'Battery FAQ incorrectly mentions water damage'; severity = 'MEDIUM'; status = 'NEEDS_FIX'; fixTemplate = 'FAQ generator';
  }
  
  // Rule 3: water damage page having 1-Hour/6-Month Warranty
  else if (m.r === 'water-damage-repair' && (badges.includes('Under 1 Hour') || badges.includes('6-Month Warranty'))) {
     detectedIssue = 'Water damage page claims Under 1 Hour / 6-Month Warranty'; severity = 'HIGH'; status = 'NEEDS_FIX'; fixTemplate = 'badgeRules (page.tsx)';
  }

  // Rule 4: charging port page having screen/battery FAQ
  else if (m.r.includes('charging-port') && (faqText.includes('screen') || faqText.includes('battery replacement'))) {
     detectedIssue = 'Charging port FAQ incorrectly mentions screen/battery'; severity = 'MEDIUM'; status = 'NEEDS_FIX'; fixTemplate = 'FAQ generator';
  }

  // Rule 5: back glass page having same-hour overpromise
  else if (m.r.includes('back-glass') && (badges.includes('Under 1 Hour') || faqText.includes('1 hour'))) {
     detectedIssue = 'Back glass page claims 1-hour completion overpromise'; severity = 'HIGH'; status = 'NEEDS_FIX'; fixTemplate = 'badgeRules & FAQ generator';
  }

  // Rule 6: camera page having Face ID overpromise
  else if (m.r.includes('camera') && (faqText.includes('instantly') || faqText.includes('guaranteed'))) {
     detectedIssue = 'Camera page has Face ID overpromises'; severity = 'HIGH'; status = 'NEEDS_FIX'; fixTemplate = 'FAQ generator';
  }

  // Rule 7: flex cable page having power-button/volume-button old classification
  else if (m.r.includes('volume-button') || m.r.includes('power-button')) {
     detectedIssue = 'Volume/Power button repair uses old flex cable classification'; severity = 'MEDIUM'; status = 'NOINDEX_CANDIDATE'; fixTemplate = 'repair type templates (NOINDEX)';
  }

  // Determine tallies
  if (status === 'PASS') passCount++;
  else if (status === 'NEEDS_FIX') needsFixCount++;
  else if (status === 'NOINDEX_CANDIDATE') noindexCount++;

  reports.push({
    url,
    category: m.c,
    brand,
    modelDisplayName: model,
    repairSlug: m.r,
    repairDisplayName: repairName,
    metaTitle: title,
    H1: h1,
    heroBadges: badges,
    warrantyText,
    FAQQuestions: faqs.map(f => f.question),
    schemaServiceType,
    canonicalUrl,
    detectedIssue: detectedIssue || 'None',
    severity,
    status,
    recommendedTemplateLevelFix: fixTemplate || 'None'
  });
}

// 4. Summarize and output
const issueFrequencies = {};
for (const r of reports) {
  if (r.status !== 'PASS') {
    issueFrequencies[r.detectedIssue] = (issueFrequencies[r.detectedIssue] || 0) + 1;
  }
}

const top10Templates = Object.entries(issueFrequencies)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(e => `${e[0]} (${e[1]} cases)`);

const result = {
  totalChecked: reports.length,
  passCount,
  needsFixCount,
  noindexCandidateCount: noindexCount,
  top20HighRiskUrls: reports.filter(r => r.status !== 'PASS').slice(0, 20),
  top10TemplateIssues: top10Templates,
  recommendedTargetFilesToFix: [
    'storefront/src/app/(public)/repairs/[category]/[brand]/[model]/[repair-type]/page.tsx (badgeRules)',
    'storefront/src/app/(public)/repairs/[category]/[brand]/[model]/[repair-type]/repairFaqs.ts (FAQ generator)'
  ],
  sourceFixMap: {
    'Water damage page claims Under 1 Hour / 6-Month Warranty': 'badgeRules (page.tsx)',
    'Back glass page claims 1-hour completion overpromise': 'badgeRules & FAQ generator',
    'Volume/Power button repair uses old flex cable classification': 'sitemap helper / NOINDEX_CANDIDATE',
  },
  confirmations: {
    modifiedCode: false,
    modifiedCMS: false
  }
};

console.log(JSON.stringify(result, null, 2));
