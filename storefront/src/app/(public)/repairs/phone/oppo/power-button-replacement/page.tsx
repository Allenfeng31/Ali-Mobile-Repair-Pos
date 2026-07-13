import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("oppo", "power-button-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="oppo" repairSlug="power-button-replacement" />; }
