import { getRepairResults, type GetRepairResultsParams } from '@/lib/repair-results-cache';
import RepairResultsClientSection from './RepairResultsClientSection';

interface RepairResultsServerSectionProps {
  context: GetRepairResultsParams['context'];
  category?: string;
  brand?: string;
  model?: string;
  repairType?: string;
}

export default async function RepairResultsServerSection(props: RepairResultsServerSectionProps) {
  const results = await getRepairResults({
    context: props.context,
    category: props.category,
    brand: props.brand,
    model: props.model,
    repairType: props.repairType,
  });

  if (results.length === 0) return null;

  return <RepairResultsClientSection results={results} />;
}
