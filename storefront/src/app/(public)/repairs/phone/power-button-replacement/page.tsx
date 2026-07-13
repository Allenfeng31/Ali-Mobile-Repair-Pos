import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("other", "power-button-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="other" repairSlug="power-button-replacement" />; }
