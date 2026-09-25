import SharedRepairSelectedDevice, { type SharedRepairSelectedDeviceViewModel } from './SharedRepairSelectedDevice';

export default function SharedRepairHeroSelection({
  selectedDevice,
  priceLabel,
  changeModelHref,
}: {
  selectedDevice?: SharedRepairSelectedDeviceViewModel | null;
  priceLabel?: string | null;
  changeModelHref: string;
}) {
  if (selectedDevice) {
    return <SharedRepairSelectedDevice selection={{ ...selectedDevice, priceLabel }} changeModelHref={changeModelHref} />;
  }

  return (
    <div className="mx-auto mt-6 flex w-full max-w-md justify-center">
      <a
        href={changeModelHref}
        className="repair-primary-action"
      >
        Select your model
      </a>
    </div>
  );
}
