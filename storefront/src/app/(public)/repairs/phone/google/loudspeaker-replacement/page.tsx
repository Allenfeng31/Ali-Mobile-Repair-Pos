import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("google", "loudspeaker-replacement");
export default async function Page({ searchParams }: { searchParams: Promise<{ model?: string | string[] }> }) {
  const model = (await searchParams).model;
  return <VirtualPhoneRepairRoutePage brand="google" repairSlug="loudspeaker-replacement" selectedModelSlug={typeof model === 'string' ? model : null} />;
}
