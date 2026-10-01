import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("samsung", "power-button-replacement");
export default async function Page({ searchParams }: { searchParams: Promise<{ brand?: string | string[]; model?: string | string[]; service?: string | string[] }> }) {
  return <VirtualPhoneRepairRoutePage brand="samsung" repairSlug="power-button-replacement" query={await searchParams} />;
}
