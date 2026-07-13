import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("google", "volume-button-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="google" repairSlug="volume-button-replacement" />; }
