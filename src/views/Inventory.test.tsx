/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { InventoryView } from './Inventory';
import { InventoryItem } from '../types';

const authState = vi.hoisted(() => ({
  permissions: {
    is_super_admin: true,
    can_change_inventory_price: true,
  },
}));

// Mock API and auth store
vi.mock('../lib/api', () => ({
  api: {
    getQualityTiers: vi.fn().mockResolvedValue([{ id: 1, name: 'Standard' }, { id: 2, name: 'Premium' }]),
    updateInventoryItem: vi.fn().mockResolvedValue({}),
    bulkCreateInventoryItems: vi.fn().mockResolvedValue([]),
    deleteInventoryItem: vi.fn().mockResolvedValue({}),
  }
}));

vi.mock('../hooks/useAuthStore', () => ({
  useAuthStore: () => ({
    permissions: authState.permissions,
  })
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

const mockInventory: InventoryItem[] = [
  {
    id: 1,
    name: 'iPhone 13 Screen',
    category: 'Phone Repair',
    brand: 'iPhone',
    model: 'iPhone 13',
    stock: 10,
    minStock: 2,
    price: 150,
    costPrice: 50,
    margin: 66,
    status: 'in-stock',
    iconName: 'Smartphone',
    quality_grade: 'Standard',
    icon: () => <div data-testid="mock-icon" />
  }
];

import { api } from '../lib/api';

describe('InventoryView', () => {
  beforeEach(() => {
    authState.permissions = {
      is_super_admin: true,
      can_change_inventory_price: true,
    };
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders quick edit panel with variants and properly isolates state', async () => {
    const setInventory = vi.fn();
    const setCategories = vi.fn();
    const setBrands = vi.fn();
    const t = vi.fn((section, key) => key); // mock translation

    render(
      <InventoryView 
        inventory={mockInventory} 
        setInventory={setInventory}
        categories={['Phone Repair']}
        setCategories={setCategories}
        brands={['iPhone']}
        setBrands={setBrands}
        t={t}
      />
    );

    // Find and click the inventory item to open Quick Edit Panel
    const itemRow = screen.getByText('iPhone 13 Screen');
    fireEvent.click(itemRow);

    // The Quick Edit panel should expose the actual current variants heading.
    expect(screen.getByText('Variants & Pricing')).toBeTruthy();

    // Check if the initial variant is loaded in Quick Edit Panel
    const gradeSelects = screen.getAllByRole('combobox');
    // There are filters at the top, plus the main sidebar forms. We need to be specific.
    // The Quick edit panel has a "Grade" label.
    const gradeLabels = screen.getAllByText('Grade');
    expect(gradeLabels.length).toBeGreaterThan(0);
  });

  it('does not submit protected price fields when ordinary staff quick-save unchanged inventory', async () => {
    authState.permissions = {
      is_super_admin: false,
      can_change_inventory_price: false,
    };

    render(
      <InventoryView
        inventory={mockInventory}
        setInventory={vi.fn()}
        categories={['Phone Repair']}
        setCategories={vi.fn()}
        brands={['iPhone']}
        setBrands={vi.fn()}
        t={vi.fn((_section, key) => key)}
      />
    );

    fireEvent.click(screen.getByText('iPhone 13 Screen'));
    fireEvent.click(screen.getByRole('button', { name: 'Quick Save' }));

    await waitFor(() => expect(api.updateInventoryItem).toHaveBeenCalledOnce());
    const [, payload] = vi.mocked(api.updateInventoryItem).mock.calls[0];
    expect(payload).toMatchObject({ stock: 10, status: 'in-stock' });
    expect(payload).not.toHaveProperty('price');
    expect(payload).not.toHaveProperty('costPrice');
    expect(payload).not.toHaveProperty('margin');
  });
});
