import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("google", "earpiece-speaker-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="google" repairSlug="earpiece-speaker-replacement" />; }
