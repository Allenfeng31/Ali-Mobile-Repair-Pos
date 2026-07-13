import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("google", "loudspeaker-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="google" repairSlug="loudspeaker-replacement" />; }
