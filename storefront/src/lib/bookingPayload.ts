import type { CartDevice } from '@/context/CartContext';

type Pricing = {
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  qualifyingRepairItemCount: number;
  total: number;
};

type BookingPayloadInput = {
  customerName: string;
  phone: string;
  devices: CartDevice[];
  total: number;
  hasCustomQuote: boolean;
  pricing: Pricing;
  datetime: string;
  displayDate: string;
  notes: string;
  sessionToken: string | null;
};

export function buildBookingPayload(input: BookingPayloadInput) {
  return {
    customer_name: input.customerName,
    phone: input.phone,
    devices: input.devices.map((device) => ({
      brand: device.brand,
      model: device.model,
      category: device.category,
      services: device.services.map((service) => ({ ...service })),
    })),
    total: input.total,
    hasCustomQuote: input.hasCustomQuote,
    pricing: input.pricing,
    datetime: input.datetime,
    displayDate: input.displayDate,
    notes: input.notes,
    session_token: input.sessionToken,
  };
}
