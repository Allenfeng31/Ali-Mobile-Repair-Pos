import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("google", "power-button-replacement");
export default async function Page({ searchParams }: { searchParams: Promise<{ model?: string | string[] }> }) {
  const model = (await searchParams).model;
  return <VirtualPhoneRepairRoutePage brand="google" repairSlug="power-button-replacement" selectedModelSlug={typeof model === 'string' ? model : null} />;
}
