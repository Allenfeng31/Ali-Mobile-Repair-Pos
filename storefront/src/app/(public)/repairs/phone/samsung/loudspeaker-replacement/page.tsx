import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("samsung", "loudspeaker-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="samsung" repairSlug="loudspeaker-replacement" />; }
