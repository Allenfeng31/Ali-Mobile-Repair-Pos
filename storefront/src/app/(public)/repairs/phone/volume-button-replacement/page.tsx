import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("other", "volume-button-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="other" repairSlug="volume-button-replacement" />; }
