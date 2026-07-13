import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("oppo", "loudspeaker-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="oppo" repairSlug="loudspeaker-replacement" />; }
