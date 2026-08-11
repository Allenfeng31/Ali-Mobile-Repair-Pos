/**
 * @vitest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';

import { InvoiceModal } from './InvoiceModal';
import type { Order } from '../types';

vi.mock('../lib/api', () => ({
  api: { getSettings: vi.fn().mockResolvedValue({}) },
}));

const historicalOrder: Order = {
  id: 'TK-1770',
  timestamp: '2026-08-10T00:00:00.000Z',
  subtotal: 200,
  tax: 20,
  surcharge: 3.3,
  total: 223.3,
  profit: 0,
  type: 'repair',
  paymentMethod: 'eftpos',
  items: [
    { id: 'screen', name: 'iPhone 12 Pro Screen Replacement', sku: 'screen', price: 139, qty: 1, category: 'Repair' },
    { id: 'housing', name: 'iPhone 12 Pro Back Housing Replacement', sku: 'housing', price: 190, qty: 1, category: 'Repair' },
    { id: 'savings', name: 'Line Item Savings', sku: 'DISCOUNT', price: -109, qty: 1, category: 'Adjustment' },
  ],
};

describe('InvoiceModal historical line items', () => {
  it('renders historical names, quantities, prices, and a negative savings row without recalculation', () => {
    render(<InvoiceModal isOpen onClose={vi.fn()} order={historicalOrder} t={(_section, key) => key} />);

    const table = screen.getByRole('table');
    expect(within(table).getByText('iPhone 12 Pro Screen Replacement')).toBeInTheDocument();
    expect(within(table).getByText('$139.00')).toBeInTheDocument();
    expect(within(table).getByText('iPhone 12 Pro Back Housing Replacement')).toBeInTheDocument();
    expect(within(table).getByText('$190.00')).toBeInTheDocument();
    expect(within(table).getByText('(DEDUCTION) Line Item Savings')).toBeInTheDocument();
    expect(within(table).getByText('-$109.00')).toBeInTheDocument();
    expect(within(table).getAllByText('1')).toHaveLength(2);
    expect(screen.getByText('Subtotal:').nextElementSibling).toHaveTextContent('$200.00');
    expect(screen.getByText('Tax (GST):').nextElementSibling).toHaveTextContent('$20.00');
    expect(screen.getByText('Surcharge (EFTPOS):').nextElementSibling).toHaveTextContent('$3.30');
    expect(screen.getByText('TOTAL:').nextElementSibling).toHaveTextContent('$223.30');
  });
});
