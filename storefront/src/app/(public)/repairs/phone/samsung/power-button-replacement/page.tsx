import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("samsung", "power-button-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="samsung" repairSlug="power-button-replacement" />; }
