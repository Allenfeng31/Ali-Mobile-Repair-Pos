/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '../types';

const apiMocks = vi.hoisted(() => ({
  getOrders: vi.fn(),
  getSettings: vi.fn(),
}));

vi.mock('../lib/api', () => ({ api: apiMocks }));
vi.mock('../hooks/useAuthStore', () => ({ useAuthStore: () => ({ permissions: {} }) }));
vi.mock('../hooks/useScrollLock', () => ({ useScrollLock: vi.fn() }));
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));
vi.mock('../components/InvoiceModal', () => ({ InvoiceModal: () => null }));
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: { div: ({ children }: { children: React.ReactNode }) => <div>{children}</div> },
}));
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => null,
}));

import { ReportsView } from './Reports';
import { getMelbourneCalendarDate, offsetCalendarDate } from '../lib/reportsOrderRange';

const order = (id: string, total: number): Order => ({
  id,
  timestamp: '2026-08-10T01:00:00.000Z',
  subtotal: total / 1.1,
  tax: total / 11,
  surcharge: 0,
  total,
  profit: total / 2,
  type: 'repair',
  paymentMethod: 'cash',
  items: [{ id: `${id}-item`, name: `Repair ${id}`, sku: id, price: total, qty: 1, category: 'Repair' }],
});

function renderReports(setOrders = vi.fn()) {
  return render(<ReportsView orders={[]} setOrders={setOrders} t={() => ''} />);
}

function ReportsHarness() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  return <ReportsView orders={orders} setOrders={setOrders} t={() => ''} />;
}

describe('Reports range loading', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.useRealTimers();
    apiMocks.getOrders.mockReset().mockResolvedValue([]);
    apiMocks.getSettings.mockReset().mockResolvedValue({});
  });

  it('requests the visible Melbourne default range and makes its complete response available to report totals', async () => {
    const selectedRange = Array.from({ length: 11 }, (_, index) => order(`TK-${index}`, 10));
    apiMocks.getOrders.mockResolvedValue(selectedRange);
    render(<ReportsHarness />);

    await waitFor(() => expect(apiMocks.getOrders).toHaveBeenCalledTimes(1));
    const today = getMelbourneCalendarDate();
    expect(apiMocks.getOrders.mock.calls[0][0]).toMatchObject({ from: today, to: today });
    await waitFor(() => expect(screen.getAllByText('$110.00').length).toBeGreaterThan(0));
    expect(screen.getByText('11 Verified Records')).toBeInTheDocument();
  });

  it('uses range parameters for custom dates and explicit All Time history', async () => {
    renderReports();
    await waitFor(() => expect(apiMocks.getOrders).toHaveBeenCalledTimes(1));

    const today = getMelbourneCalendarDate();
    const customFrom = offsetCalendarDate(today, -7);
    const customTo = offsetCalendarDate(today, -5);
    const dateInputs = screen.getAllByDisplayValue(today);
    fireEvent.change(dateInputs[0], { target: { value: customFrom } });
    await waitFor(() => expect(apiMocks.getOrders.mock.calls.at(-1)?.[0]).toMatchObject({ from: customFrom, to: today }));
    fireEvent.change(dateInputs[1], { target: { value: customTo } });
    await waitFor(() => expect(apiMocks.getOrders.mock.calls.at(-1)?.[0]).toMatchObject({ from: customFrom, to: customTo }));

    fireEvent.click(screen.getByRole('button', { name: 'All Time' }));
    await waitFor(() => expect(apiMocks.getOrders.mock.calls.at(-1)?.[0]).toMatchObject({ from: undefined, to: undefined }));
  });

  it('keeps the existing Last 7 Days preset range and ignores a superseded response', async () => {
    let resolveInitial: (value: Order[]) => void = () => {};
    apiMocks.getOrders.mockImplementationOnce(() => new Promise<Order[]>((resolve) => { resolveInitial = resolve; }));
    apiMocks.getOrders.mockResolvedValue([order('LATEST', 50)]);
    const setOrders = vi.fn();

    renderReports(setOrders);
    await waitFor(() => expect(apiMocks.getOrders).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'Last 7 Days' }));
    const today = getMelbourneCalendarDate();
    await waitFor(() => expect(apiMocks.getOrders.mock.calls.at(-1)?.[0]).toMatchObject({ from: offsetCalendarDate(today, -7), to: today }));

    resolveInitial([order('STALE', 10)]);
    await Promise.resolve();
    expect(setOrders.mock.calls.flat().some((value) => Array.isArray(value) && value.some((entry) => entry.id === 'STALE'))).toBe(false);
  });
});
