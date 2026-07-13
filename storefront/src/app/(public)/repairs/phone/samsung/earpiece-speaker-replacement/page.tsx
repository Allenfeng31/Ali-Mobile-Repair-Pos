import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("samsung", "earpiece-speaker-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="samsung" repairSlug="earpiece-speaker-replacement" />; }
