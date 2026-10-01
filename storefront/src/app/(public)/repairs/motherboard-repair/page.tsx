import type { Metadata } from 'next';

import { fetchRepairCatalog } from '@/lib/api';
import { getMotherboardEligibleDevices, resolveMotherboardSelection } from '@/lib/motherboardRepair';
import MotherboardRepairLandingPage from '@/components/services/MotherboardRepairLandingPage';

const PAGE_PATH = '/repairs/motherboard-repair';
const PAGE_TITLE = 'Motherboard & Logic Board Repair | Ali Mobile';
const PAGE_DESCRIPTION = 'Quote-first motherboard and logic board diagnosis for supported phones and MacBooks in Ringwood. We assess board-level faults before confirming repair options.';

type SearchParams = Record<string, string | string[] | undefined>;

function hasQuery(searchParams: SearchParams) {
  return Object.values(searchParams).some((value) => value !== undefined);
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const selectedState = hasQuery(await searchParams);

  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    alternates: { canonical: PAGE_PATH },
    robots: { index: !selectedState, follow: true },
    openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH, type: 'website' },
    twitter: { card: 'summary', title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  };
}

export default async function MotherboardRepairPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [catalog, query] = await Promise.all([fetchRepairCatalog(), searchParams]);
  const eligibleDevices = getMotherboardEligibleDevices(catalog.brands);
  const selection = resolveMotherboardSelection(catalog.brands, query);

  return <MotherboardRepairLandingPage canonicalPath={PAGE_PATH} eligibleDevices={eligibleDevices} selection={selection} />;
}
