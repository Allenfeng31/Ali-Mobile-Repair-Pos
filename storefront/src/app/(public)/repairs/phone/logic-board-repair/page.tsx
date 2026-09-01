import type { Metadata } from 'next';
import { fetchRepairCatalog } from '@/lib/api';
import LogicBoardRepairLandingPage from '@/components/services/LogicBoardRepairLandingPage';
import { compareDeterministicStrings } from '@/lib/deterministicStrings';

const PAGE_PATH = '/repairs/phone/logic-board-repair';
const REPAIR_SLUG = 'logic-board-repair';

export const metadata: Metadata = {
  title: 'Phone Logic Board Repair in Ringwood | Ali Mobile',
  description: 'Assessment-led microsoldering and logic board repair for supported phones. We diagnose the fault before quoting a repair.',
  alternates: { canonical: PAGE_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Phone Logic Board Repair in Ringwood | Ali Mobile',
    description: 'Assessment-led microsoldering and logic board repair for supported phones. We diagnose the fault before quoting a repair.',
    url: PAGE_PATH,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Phone Logic Board Repair in Ringwood | Ali Mobile',
    description: 'Assessment-led microsoldering and logic board repair for supported phones. We diagnose the fault before quoting a repair.',
  },
};

export default async function LogicBoardRepairPage() {
  const catalog = await fetchRepairCatalog();
  const candidates = catalog.brands
    .filter((brand) => brand.category === 'phone' && brand.slug !== 'iphone' && brand.slug !== 'apple')
    .flatMap((brand) => brand.models
      .filter((model) => model.repairTypes.some((repair) => repair.slug === REPAIR_SLUG))
      .map((model) => ({ canonicalBrandSlug: brand.slug, modelSlug: model.slug, displayBrand: brand.brand, displayModel: model.model })))
    .sort((left, right) => compareDeterministicStrings(`${left.canonicalBrandSlug}/${left.modelSlug}`, `${right.canonicalBrandSlug}/${right.modelSlug}`));

  return <LogicBoardRepairLandingPage canonicalPath={PAGE_PATH} candidates={candidates} />;
}
