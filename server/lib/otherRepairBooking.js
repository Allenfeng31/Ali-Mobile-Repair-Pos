const OTHER_REPAIR_SERVICE_NAME = 'Other Repair';
const OTHER_REPAIR_MIN_DESCRIPTION_LENGTH = 5;
const OTHER_REPAIR_MAX_DESCRIPTION_LENGTH = 300;
const DEFAULT_DISCOUNT_CONFIG = { multi_discount_tier_2: 0.10, multi_discount_tier_3: 0.15 };

const isOtherRepairService = (service) => service?.name === OTHER_REPAIR_SERVICE_NAME;
const getOtherRepairDescription = (service) => typeof service?.customDescription === 'string'
  ? service.customDescription.trim()
  : '';
const validateOtherRepairDescription = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return {
    valid: trimmed.length >= OTHER_REPAIR_MIN_DESCRIPTION_LENGTH && trimmed.length <= OTHER_REPAIR_MAX_DESCRIPTION_LENGTH,
    value: trimmed,
  };
};
const normaliseOtherRepairService = (service) => isOtherRepairService(service)
  ? { ...service, price: 0, customDescription: getOtherRepairDescription(service) }
  : service;
const normaliseBookingDevices = (devices = []) => devices.map((device) => ({
  ...device,
  services: Array.isArray(device?.services) ? device.services.map(normaliseOtherRepairService) : [],
}));
const validateBookingOtherRepairItems = (devices = []) => {
  const services = devices.flatMap((device) => Array.isArray(device?.services) ? device.services : []);
  const invalid = services.find((service) =>
    isOtherRepairService(service) && !validateOtherRepairDescription(service.customDescription).valid
  );
  return invalid
    ? { valid: false, error: 'Other Repair requires a description between 5 and 300 characters' }
    : { valid: true };
};
const formatBookingServiceName = (service) => isOtherRepairService(service)
  ? `${OTHER_REPAIR_SERVICE_NAME} - ${getOtherRepairDescription(service)}`
  : String(service?.name || 'Repair');
const servicePriceToCents = (service) => isOtherRepairService(service)
  ? 0
  : Math.round((Number(service?.price) || 0) * 100);
const isDiscountQualifyingService = (service) =>
  !String(service?.id || '').startsWith('upsell-') && !isOtherRepairService(service);
const calculateMultiItemPricing = (devices = [], config = DEFAULT_DISCOUNT_CONFIG) => {
  const allServices = devices.flatMap((device) => Array.isArray(device?.services) ? device.services : []);
  const subtotalCents = allServices.reduce((sum, service) => sum + servicePriceToCents(service), 0);
  const qualifyingRepairItemCount = allServices.filter(isDiscountQualifyingService).length;
  const discountRate = qualifyingRepairItemCount >= 3
    ? config.multi_discount_tier_3
    : qualifyingRepairItemCount === 2
      ? config.multi_discount_tier_2
      : 0;
  const discountCents = Math.round(subtotalCents * discountRate);
  return {
    subtotal: Number((subtotalCents / 100).toFixed(2)),
    discountRate,
    discountAmount: Number((discountCents / 100).toFixed(2)),
    qualifyingRepairItemCount,
    total: Number((Math.max(0, subtotalCents - discountCents) / 100).toFixed(2)),
  };
};

module.exports = {
  OTHER_REPAIR_SERVICE_NAME,
  OTHER_REPAIR_MIN_DESCRIPTION_LENGTH,
  OTHER_REPAIR_MAX_DESCRIPTION_LENGTH,
  isOtherRepairService,
  getOtherRepairDescription,
  validateOtherRepairDescription,
  normaliseOtherRepairService,
  normaliseBookingDevices,
  validateBookingOtherRepairItems,
  formatBookingServiceName,
  calculateMultiItemPricing,
};
