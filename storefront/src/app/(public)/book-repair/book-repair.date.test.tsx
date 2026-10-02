/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';

const { buildBookingPayload } = vi.hoisted(() => ({ buildBookingPayload: vi.fn((input) => input) }));

vi.mock('@/components/GlobalRepairCart', () => ({ default: () => null }));
vi.mock('@/components/RingwoodSquareLocationMap', () => ({ default: () => null }));
vi.mock('@/context/CartContext', () => ({
  formatOtherRepairServiceName: () => 'Other Repair',
  isOtherRepairService: () => false,
  useCart: () => ({
    devices: [{ isConfirmed: true, category: 'phone', brand: 'Google Pixel', model: 'Pixel 10 Pro XL', services: [{ id: 1, name: 'Charging Port Replacement', price: 120 }] }],
    totalPrice: 120,
    subtotalPrice: 120,
    discountRate: 0,
    discountAmount: 0,
    qualifyingRepairItemCount: 1,
    hasConfirmedDevices: true,
    hasCustomQuote: false,
    clearCart: vi.fn(),
  }),
}));
vi.mock('@/lib/inventoryUtils', () => ({ formatDeviceTitle: (brand: string, model: string) => `${brand} ${model}` }));
vi.mock('@/lib/bookingPayload', () => ({ buildBookingPayload }));
vi.mock('@/lib/bookingCalendar', async () => {
  const actual = await vi.importActual<typeof import('@/lib/bookingCalendar')>('@/lib/bookingCalendar');
  return { ...actual, getMelbourneBookingCalendarDate: () => '2026-10-02' };
});
vi.mock('next/script', () => ({ default: () => null }));

import BookRepairPage from './page';

describe('BookRepairPage calendar-date submission', () => {
  it('keeps Friday 2 October in the heading and sends date-only booking values', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, appointment: { datetime: '2026-10-02T02:30:00.000Z' } }),
    }));

    render(<BookRepairPage />);
    fireEvent.click(screen.getByRole('button', { name: /Fri.*2.*Oct/i }));
    expect(screen.getByText('2. Select Time (October 2)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '12:30' }));
    fireEvent.change(screen.getByPlaceholderText('John Smith'), { target: { value: 'Test Customer' } });
    fireEvent.change(screen.getByPlaceholderText('04xx xxx xxx'), { target: { value: '0400000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Appointment' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Book' }));

    await waitFor(() => expect(buildBookingPayload).toHaveBeenCalledWith(expect.objectContaining({
      bookingDate: '2026-10-02',
      bookingTime: '12:30',
    })));
    expect(buildBookingPayload.mock.calls[0][0]).not.toHaveProperty('datetime');
  });
});
