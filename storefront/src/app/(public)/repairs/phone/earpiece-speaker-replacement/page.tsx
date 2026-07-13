import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("other", "earpiece-speaker-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="other" repairSlug="earpiece-speaker-replacement" />; }
