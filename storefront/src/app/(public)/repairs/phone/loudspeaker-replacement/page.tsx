import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("other", "loudspeaker-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="other" repairSlug="loudspeaker-replacement" />; }
