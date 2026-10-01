import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("oppo", "volume-button-replacement");
export default async function Page({ searchParams }: { searchParams: Promise<{ brand?: string | string[]; model?: string | string[]; service?: string | string[] }> }) {
  return <VirtualPhoneRepairRoutePage brand="oppo" repairSlug="volume-button-replacement" query={await searchParams} />;
}
