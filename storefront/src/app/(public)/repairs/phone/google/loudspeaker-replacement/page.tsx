import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("google", "loudspeaker-replacement");
export default async function Page({ searchParams }: { searchParams: Promise<{ brand?: string | string[]; model?: string | string[]; service?: string | string[] }> }) {
  return <VirtualPhoneRepairRoutePage brand="google" repairSlug="loudspeaker-replacement" query={await searchParams} />;
}
