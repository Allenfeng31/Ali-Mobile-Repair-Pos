import { LucideIcon } from 'lucide-react';

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  category: string;
}

export interface Order {
  id: string;
  timestamp: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  surcharge?: number;
  total: number;
  profit: number;
  type: 'repair' | 'sale' | 'service' | 'deposit';
  paymentMethod?: 'cash' | 'eftpos' | 'mixed';
  mixedCash?: number;
  mixedEftpos?: number;
  status?: 'completed' | 'refunded' | 'layaway';
  depositAmount?: number;
  outstandingAmount?: number;
  reservationCustomers?: { id: string; name: string }[];
}

export interface CustomerReservation {
  id: string;
  customers: { id: string; name: string; phone: string }[];
  items: any[];
  depositPaid: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed';
}

export interface InventoryItem {
  id: number;
  name: string;
  model: string;
  brand?: string;
  sku?: string;
  stock: number;
  minStock: number;
  costPrice: number;
  price: number;
  margin: number;
  icon: string;
  status: string;
  category: string;
}

export interface RepairRecord {
  id: string;
  timestamp: string;
  repairItem: string;
  modelNumber: string;
  price: number;
  liquidDamage: boolean;
  password?: string;
  imei?: string;
  remark?: string;
  status: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  repairs: RepairRecord[];
  totalSpent: number;
  status: string;
  statusColor: string;
  lastVisit: string;
  initials: string;
  lastReviewSent?: string;
}
