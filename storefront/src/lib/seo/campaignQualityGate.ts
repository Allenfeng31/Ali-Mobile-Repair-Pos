type CampaignDraft = {
  title?: string;
  description?: string;
  content?: string;
  slug?: string;
  optimizationTask?: Record<string, unknown> | null;
};

type CampaignPayload = {
  draft?: CampaignDraft | null;
  optimizationTask?: Record<string, unknown> | null;
};

export type CampaignLike = {
  id: string;
  keyword: string;
  status?: string | null;
  payload?: CampaignPayload | null;
  source?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CampaignActionRecommendation = 'publish' | 'rewrite' | 'merge' | 'noindex' | 'block';

export type CampaignSubScores = {
  local_intent_score: number;
  repair_specificity_score: number;
  originality_score: number;
  duplicate_risk_score: number;
  conversion_value_score: number;
  internal_link_score: number;
  money_page_support_score: number;
  misleading_claim_risk_score: number;
};

export type CampaignHardFailFlags = {
  unsafe_or_misleading_claim: boolean;
  broken_or_missing_primary_target: boolean;
  spammy_query_intent: boolean;
  no_meaningful_internal_path: boolean;
  duplicate_cluster_risk: boolean;
};

export type CampaignQualityGatePhaseA = {
  quality_score: number;
  action_recommendation: CampaignActionRecommendation;
  sub_scores: CampaignSubScores;
  hard_fail_flags: CampaignHardFailFlags;
  cluster_key: string;
  cluster_size: number;
  is_cluster_winner: boolean;
  primary_target_url: string | null;
};

const SCORE_WEIGHTS = {
  local_intent_score: 15,
  repair_specificity_score: 20,
  originality_score: 15,
  duplicate_risk_score: 10,
  conversion_value_score: 15,
  internal_link_score: 10,
  money_page_support_score: 10,
  misleading_claim_risk_score: 5,
} as const;

const LOCATION_MARKERS = [
  'ringwood',
  'ringwood square',
  '3134',
  'melbourne',
  'croydon',
  'mitcham',
  'heathmont',
  'wantirna',
  'eastern suburbs',
  'near me',
];

const REPAIR_MARKERS = [
  'screen replacement',
  'battery replacement',
  'charging port',
  'water damage',
  'liquid damage',
  'camera repair',
  'back glass',
  'back housing',
  'keyboard repair',
  'logic board',
];

const BENCH_DETAIL_MARKERS = [
  'workbench',
  'bench',
  'diagnostic',
  'flex cable',
  'adhesive',
  'reseal',
  'calibration',
  'logic board',
  'microscope',
  'quote before repair',
  'no fix, no charge',
];

const SPAMMY_QUERY_PATTERNS = [
  /\bopen now\b/i,
  /\bfree\b/i,
  /\bnear me near me\b/i,
  /\bwithin 5 mi\b/i,
];

const SOFT_SPAM_PATTERNS = [
  /\bcheap\b/i,
  /\bservice center\b/i,
  /\bservice centre\b/i,
  /\bcontact number\b/i,
];

const SEVERE_MISLEADING_PATTERNS = [
  /\bapple authorized\b/i,
  /\bsamsung authorized\b/i,
  /\bfully waterproof\b/i,
  /\bguaranteed waterproof\b/i,
  /\bfactory[- ]grade\b/i,
  /\bperfect repair\b/i,
  /\blifetime warranty\b/i,
];

const MODIFIER_PATTERNS = [
  /\bringwood square\b/gi,
  /\bringwood\b/gi,
  /\bmelbourne\b/gi,
  /\b3134\b/gi,
  /\bnear me\b/gi,
  /\bsame day\b/gi,
  /\bcost\b/gi,
  /\bprice\b/gi,
  /\bopen now\b/gi,
  /\bservice center\b/gi,
  /\bservice centre\b/gi,
  /\bcontact number\b/gi,
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ');
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function includesAny(value: string, markers: string[]) {
  return markers.some((marker) => value.includes(marker));
}

function countMatches(value: string, markers: string[]) {
  return markers.reduce((count, marker) => count + (value.includes(marker) ? 1 : 0), 0);
}

function extractInternalLinks(campaign: CampaignLike) {
  const links = new Set<string>();
  const payload = toRecord(campaign.payload);
  const draft = toRecord(payload?.draft);
  const optimizationTask = toRecord(payload?.optimizationTask) || toRecord(draft?.optimizationTask);
  const proposal = toRecord(optimizationTask?.proposal);
  const internalLinks = proposal?.internalLinks;

  if (Array.isArray(internalLinks)) {
    for (const item of internalLinks) {
      if (typeof item === 'string' && item.startsWith('/')) {
        links.add(item);
      }
    }
  }

  const content = typeof draft?.content === 'string' ? draft.content : '';
  const hrefMatches = content.matchAll(/href\s*=\s*['"]([^'"]+)['"]/gi);
  for (const match of hrefMatches) {
    const href = match[1];
    if (href.startsWith('/')) {
      links.add(href);
    }
  }

  return Array.from(links);
}

function resolvePrimaryTargetUrl(campaign: CampaignLike, links: string[]) {
  const payload = toRecord(campaign.payload);
  const draft = toRecord(payload?.draft);
  const optimizationTask = toRecord(payload?.optimizationTask) || toRecord(draft?.optimizationTask);
  const targetUrl = optimizationTask?.targetUrl;

  if (typeof targetUrl === 'string' && targetUrl.startsWith('/repairs/')) {
    return targetUrl;
  }

  const repairLinks = links.filter((link) => link.startsWith('/repairs/'));
  const moneyPageLink = repairLinks.find((link) => /^\/repairs\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/.test(link));
  if (moneyPageLink) return moneyPageLink;

  if (repairLinks.length > 0) return repairLinks[0];
  return null;
}

function getClusterKey(keyword: string) {
  let key = normalize(keyword).replace(/[^a-z0-9\s]/g, ' ');
  for (const pattern of MODIFIER_PATTERNS) {
    key = key.replace(pattern, ' ');
  }
  key = key.replace(/\s+/g, ' ').trim();
  return key || normalize(keyword);
}

function buildStaticSubScores(campaign: CampaignLike) {
  const payload = toRecord(campaign.payload);
  const draft = toRecord(payload?.draft);
  const keyword = campaign.keyword || '';
  const title = typeof draft?.title === 'string' ? draft.title : '';
  const description = typeof draft?.description === 'string' ? draft.description : '';
  const contentHtml = typeof draft?.content === 'string' ? draft.content : '';
  const contentText = normalize(stripHtml(contentHtml));
  const combined = normalize(`${keyword} ${title} ${description} ${contentText}`);
  const links = extractInternalLinks(campaign);
  const primaryTargetUrl = resolvePrimaryTargetUrl(campaign, links);

  const localIntentBase = countMatches(combined, LOCATION_MARKERS);
  const localIntentScore = clamp(localIntentBase * 3, 0, SCORE_WEIGHTS.local_intent_score);

  const hasCategoryIntent = /\b(phone|iphone|samsung|pixel|oppo|tablet|ipad|laptop|macbook|watch)\b/i.test(combined);
  const hasRepairIntent = includesAny(combined, REPAIR_MARKERS);
  const hasModelIntent = /\b(iphone\s?\d+|pixel\s?\d+|macbook|apple watch|ipad)\b/i.test(combined);
  const hasBrandIntent = /\b(iphone|samsung|google|pixel|oppo|ipad|macbook|apple watch)\b/i.test(combined);
  let repairSpecificityScore = 0;
  if (hasCategoryIntent) repairSpecificityScore += 6;
  if (hasBrandIntent) repairSpecificityScore += 5;
  if (hasRepairIntent) repairSpecificityScore += 6;
  if (hasModelIntent) repairSpecificityScore += 3;
  repairSpecificityScore = clamp(repairSpecificityScore, 0, SCORE_WEIGHTS.repair_specificity_score);

  const benchDetailCount = countMatches(contentText, BENCH_DETAIL_MARKERS);
  const wordCount = contentText.split(/\s+/).filter(Boolean).length;
  const lengthBonus = wordCount >= 450 ? 3 : wordCount >= 250 ? 1 : 0;
  const originalityScore = clamp(4 + Math.min(8, benchDetailCount * 2) + lengthBonus, 0, SCORE_WEIGHTS.originality_score);

  const hasBookingPath = links.some((link) => link === '/book-repair' || link.startsWith('/book-repair?'));
  const hasRepairPath = links.some((link) => link.startsWith('/repairs/'));
  const hasDeepMoneyPage = links.some((link) => /^\/repairs\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/.test(link));
  const hasModelOrBrandPath = links.some((link) => /^\/repairs\/[^/]+\/[^/]+(\/[^/]+)?$/.test(link));

  let internalLinkScore = 0;
  if (hasRepairPath) internalLinkScore += 3;
  if (hasModelOrBrandPath) internalLinkScore += 2;
  if (hasDeepMoneyPage) internalLinkScore += 3;
  if (hasBookingPath) internalLinkScore += 2;
  internalLinkScore = clamp(internalLinkScore, 0, SCORE_WEIGHTS.internal_link_score);

  const moneyPageSupportScore = clamp(
    primaryTargetUrl ? (primaryTargetUrl.split('/').filter(Boolean).length >= 5 ? 10 : 7) : 0,
    0,
    SCORE_WEIGHTS.money_page_support_score
  );

  const severeMisleadingClaim = SEVERE_MISLEADING_PATTERNS.some((pattern) => pattern.test(contentHtml) || pattern.test(keyword));
  const softSpamCount = SOFT_SPAM_PATTERNS.filter((pattern) => pattern.test(keyword)).length;
  const misleadingClaimRiskScore = clamp(
    severeMisleadingClaim ? 0 : SCORE_WEIGHTS.misleading_claim_risk_score - Math.min(2, softSpamCount),
    0,
    SCORE_WEIGHTS.misleading_claim_risk_score
  );

  const conversionValueScore = clamp(
    (hasBookingPath ? 7 : 0) +
    (hasRepairPath ? 5 : 0) +
    (/\b(call|book|quote)\b/i.test(combined) ? 3 : 0),
    0,
    SCORE_WEIGHTS.conversion_value_score
  );

  const spammyQueryIntent = SPAMMY_QUERY_PATTERNS.some((pattern) => pattern.test(keyword));
  const noMeaningfulInternalPath = !hasBookingPath && !hasRepairPath;
  const brokenOrMissingPrimaryTarget = !primaryTargetUrl;

  return {
    subScores: {
      local_intent_score: localIntentScore,
      repair_specificity_score: repairSpecificityScore,
      originality_score: originalityScore,
      conversion_value_score: conversionValueScore,
      internal_link_score: internalLinkScore,
      money_page_support_score: moneyPageSupportScore,
      misleading_claim_risk_score: misleadingClaimRiskScore,
    },
    hardFailBase: {
      unsafe_or_misleading_claim: severeMisleadingClaim,
      broken_or_missing_primary_target: brokenOrMissingPrimaryTarget,
      spammy_query_intent: spammyQueryIntent,
      no_meaningful_internal_path: noMeaningfulInternalPath,
    },
    primaryTargetUrl,
    clusterKey: getClusterKey(keyword),
    keyword: normalize(keyword),
    softSpamCount,
  };
}

function preScore(subScores: Omit<CampaignSubScores, 'duplicate_risk_score'>) {
  return subScores.local_intent_score
    + subScores.repair_specificity_score
    + subScores.originality_score
    + subScores.conversion_value_score
    + subScores.internal_link_score
    + subScores.money_page_support_score
    + subScores.misleading_claim_risk_score;
}

function deriveActionRecommendation(args: {
  score: number;
  flags: CampaignHardFailFlags;
  isClusterWinner: boolean;
  clusterSize: number;
}) {
  const { score, flags, isClusterWinner, clusterSize } = args;
  const severeHardFail = flags.unsafe_or_misleading_claim || flags.spammy_query_intent;

  if (score < 55 || severeHardFail) return 'block' as const;
  if (flags.duplicate_cluster_risk && clusterSize > 1 && !isClusterWinner) return 'merge' as const;
  if (score >= 85 && !Object.values(flags).some(Boolean) && isClusterWinner) return 'publish' as const;
  if (score >= 70) return 'rewrite' as const;
  if (score >= 55) return 'noindex' as const;
  return 'block' as const;
}

export function scoreSeoCampaignBatch(campaigns: CampaignLike[]): Array<CampaignLike & { qualityGatePhaseA: CampaignQualityGatePhaseA }> {
  const staticEvaluations = campaigns.map((campaign) => {
    const staticEvaluation = buildStaticSubScores(campaign);
    return {
      campaign,
      ...staticEvaluation,
      staticScore: preScore(staticEvaluation.subScores),
    };
  });

  const clusterMap = new Map<string, typeof staticEvaluations>();
  for (const entry of staticEvaluations) {
    const list = clusterMap.get(entry.clusterKey) || [];
    list.push(entry);
    clusterMap.set(entry.clusterKey, list);
  }

  const clusterWinners = new Map<string, string>();
  for (const [clusterKey, entries] of clusterMap.entries()) {
    const winner = [...entries].sort((a, b) => {
      if (b.staticScore !== a.staticScore) return b.staticScore - a.staticScore;
      if (a.softSpamCount !== b.softSpamCount) return a.softSpamCount - b.softSpamCount;
      const aHasRingwood = a.keyword.includes('ringwood') ? 1 : 0;
      const bHasRingwood = b.keyword.includes('ringwood') ? 1 : 0;
      if (bHasRingwood !== aHasRingwood) return bHasRingwood - aHasRingwood;
      return a.keyword.length - b.keyword.length;
    })[0];
    clusterWinners.set(clusterKey, winner.campaign.id);
  }

  return staticEvaluations.map((entry) => {
    const clusterEntries = clusterMap.get(entry.clusterKey) || [];
    const clusterSize = clusterEntries.length;
    const winnerId = clusterWinners.get(entry.clusterKey);
    const isClusterWinner = winnerId === entry.campaign.id;
    const duplicateClusterRisk = clusterSize > 1 && !isClusterWinner;
    const duplicateRiskScore = clusterSize === 1 ? 10 : (isClusterWinner ? 8 : 2);

    const hardFailFlags: CampaignHardFailFlags = {
      ...entry.hardFailBase,
      duplicate_cluster_risk: duplicateClusterRisk,
    };

    const subScores: CampaignSubScores = {
      ...entry.subScores,
      duplicate_risk_score: duplicateRiskScore,
    };

    const qualityScore = clamp(
      Math.round(
        subScores.local_intent_score
        + subScores.repair_specificity_score
        + subScores.originality_score
        + subScores.duplicate_risk_score
        + subScores.conversion_value_score
        + subScores.internal_link_score
        + subScores.money_page_support_score
        + subScores.misleading_claim_risk_score
      ),
      0,
      100
    );

    const actionRecommendation = deriveActionRecommendation({
      score: qualityScore,
      flags: hardFailFlags,
      isClusterWinner,
      clusterSize,
    });

    return {
      ...entry.campaign,
      qualityGatePhaseA: {
        quality_score: qualityScore,
        action_recommendation: actionRecommendation,
        sub_scores: subScores,
        hard_fail_flags: hardFailFlags,
        cluster_key: entry.clusterKey,
        cluster_size: clusterSize,
        is_cluster_winner: isClusterWinner,
        primary_target_url: entry.primaryTargetUrl,
      },
    };
  });
}
