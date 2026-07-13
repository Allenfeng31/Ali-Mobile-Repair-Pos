import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("google", "power-button-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="google" repairSlug="power-button-replacement" />; }
