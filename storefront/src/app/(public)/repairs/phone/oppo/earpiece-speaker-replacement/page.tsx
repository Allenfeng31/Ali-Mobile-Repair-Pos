import VirtualPhoneRepairRoutePage, { createVirtualPhoneRepairMetadata } from "@/lib/virtualPhoneRepairRoute";
export const metadata = createVirtualPhoneRepairMetadata("oppo", "earpiece-speaker-replacement");
export default function Page() { return <VirtualPhoneRepairRoutePage brand="oppo" repairSlug="earpiece-speaker-replacement" />; }
