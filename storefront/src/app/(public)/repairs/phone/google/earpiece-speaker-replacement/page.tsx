import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("google", "earpiece-speaker-replacement");
export default async function Page({ searchParams }: { searchParams: Promise<{ model?: string | string[] }> }) {
  const model = (await searchParams).model;
  return <VirtualPhoneRepairRoutePage brand="google" repairSlug="earpiece-speaker-replacement" selectedModelSlug={typeof model === 'string' ? model : null} />;
}
