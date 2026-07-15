import type { CartDevice, MultiDiscountConfig, RepairService } from '@/context/CartContext';

export const OTHER_REPAIR_SERVICE_ID = 'booking-only-other-repair';
export const OTHER_REPAIR_SERVICE_NAME = 'Other Repair';
export const OTHER_REPAIR_MIN_DESCRIPTION_LENGTH = 5;
export const OTHER_REPAIR_MAX_DESCRIPTION_LENGTH = 300;

export type OtherRepairDescriptionValidation =
  | { valid: true; value: string }
  | { valid: false; value: string };

export const isOtherRepairService = (service: RepairService) =>
  service.id === OTHER_REPAIR_SERVICE_ID && service.name === OTHER_REPAIR_SERVICE_NAME;

export function validateOtherRepairDescription(value: unknown): OtherRepairDescriptionValidation {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed.length >= OTHER_REPAIR_MIN_DESCRIPTION_LENGTH && trimmed.length <= OTHER_REPAIR_MAX_DESCRIPTION_LENGTH
    ? { valid: true, value: trimmed }
    : { valid: false, value: trimmed };
}

export function createOtherRepairService(): RepairService {
  return { id: OTHER_REPAIR_SERVICE_ID, name: OTHER_REPAIR_SERVICE_NAME, price: 0, customDescription: '' };
}

export const appendOtherRepairOption = (services: RepairService[]) =>
  services.some(isOtherRepairService) ? services : [...services, createOtherRepairService()];

export const removeOtherRepairOption = (services: RepairService[]) =>
  services.filter((service) => !isOtherRepairService(service));

export const updateOtherRepairDescription = (services: RepairService[], customDescription: string) =>
  services.map((service) => isOtherRepairService(service) ? { ...service, customDescription } : service);

export const formatOtherRepairServiceName = (service: RepairService) => {
  if (!isOtherRepairService(service)) return service.name;
  const description = validateOtherRepairDescription(service.customDescription);
  return description.value ? `${OTHER_REPAIR_SERVICE_NAME} - ${description.value}` : OTHER_REPAIR_SERVICE_NAME;
};

export const getOtherRepairPriceLabel = () => 'Quote on Request';

export const isDiscountQualifyingService = (service: RepairService) =>
  !String(service.id).startsWith('upsell-') && !isOtherRepairService(service);

const priceToCents = (value: number | undefined) => Math.round((Number(value) || 0) * 100);
const centsToPrice = (cents: number) => Number((cents / 100).toFixed(2));

export function calculateCartPricing(devices: CartDevice[], discountConfig: MultiDiscountConfig) {
  const confirmedDevices = devices.filter((device) => device.isConfirmed);
  const subtotalCents = confirmedDevices.reduce(
    (sum, device) => sum + device.services.reduce((serviceSum, service) => serviceSum + priceToCents(service.price), 0),
    0
  );
  const qualifyingRepairItemCount = confirmedDevices.reduce(
    (sum, device) => sum + device.services.filter(isDiscountQualifyingService).length,
    0
  );
  const discountRate = qualifyingRepairItemCount >= 3
    ? discountConfig.multi_discount_tier_3
    : qualifyingRepairItemCount === 2
      ? discountConfig.multi_discount_tier_2
      : 0;
  const discountCents = Math.round(subtotalCents * discountRate);

  return {
    subtotalPrice: centsToPrice(subtotalCents),
    discountRate,
    discountAmount: centsToPrice(discountCents),
    totalPrice: centsToPrice(Math.max(0, subtotalCents - discountCents)),
    qualifyingRepairItemCount,
    hasCustomQuote: confirmedDevices.some((device) => device.services.some((service) => service.price === 0)),
    hasConfirmedDevices: confirmedDevices.length > 0,
  };
}

export const updateCartDeviceServices = (devices: CartDevice[], deviceId: string, services: RepairService[]) =>
  devices.map((device) => device.id === deviceId ? { ...device, services } : device);

export function normalizeCartDevices(value: unknown): CartDevice[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object' || !Array.isArray((candidate as CartDevice).services)) return [];
    const device = candidate as CartDevice;
    return [{
      ...device,
      services: device.services.flatMap((service) => {
        if (!service || typeof service !== 'object') return [];
        if (!isOtherRepairService(service)) return [service];
        const { customDescription, ...rest } = service;
        return [{ ...rest, price: 0, ...(typeof customDescription === 'string' ? { customDescription } : {}) }];
      }),
    }];
  });
}
