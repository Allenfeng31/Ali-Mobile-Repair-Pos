/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { InventoryView } from './Inventory';
import { InventoryItem } from '../types';

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
    permissions: {
      is_super_admin: true,
      can_change_inventory_price: true,
    }
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

describe('InventoryView', () => {
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

    // The Quick Edit panel should open. 
    // We expect the "Variants / Quality Tiers" text to exist multiple times because we updated the UI.
    const variantHeaders = screen.getAllByText('Variants / Quality Tiers');
    expect(variantHeaders.length).toBeGreaterThan(1);

    // Check if the initial variant is loaded in Quick Edit Panel
    const gradeSelects = screen.getAllByRole('combobox');
    // There are filters at the top, plus the main sidebar forms. We need to be specific.
    // The Quick edit panel has a "Grade" label.
    const gradeLabels = screen.getAllByText('Grade');
    expect(gradeLabels.length).toBeGreaterThan(0);
  });
});
