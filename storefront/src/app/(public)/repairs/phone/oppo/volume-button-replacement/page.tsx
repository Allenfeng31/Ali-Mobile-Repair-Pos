import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("oppo", "volume-button-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="oppo" repairSlug="volume-button-replacement" />; }
