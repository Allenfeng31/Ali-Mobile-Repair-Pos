const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');

const SEED_DATA = [
  // Preserved older priced records
  { id: 1263, name: 'MacBook Pro 14"/16" M3 Pro/Max (2023) Screen Replacement', model: 'C MacBook||MacBook Pro 14"/16" M3 Pro/Max (2023) Screen Replacement', sku: 'MB-1263', stock: 1, minStock: 0, costPrice: 500, price: 780, margin: 35, iconName: 'Smartphone', status: 'low-stock', category: 'Screen Replacement', device_model: 'A2992, A2991' },
  { id: 1264, name: 'MacBook Pro 14"/16" M3 Pro/Max (2023) Battery Replacement', model: 'C MacBook||MacBook Pro 14"/16" M3 Pro/Max (2023) Battery Replacement', sku: 'MB-1264', stock: 1, minStock: 0, costPrice: 100, price: 240, margin: 58, iconName: 'Battery', status: 'low-stock', category: 'Battery Replacement', device_model: 'A2992, A2991' },
  { id: 3902, name: 'MacBook Pro 14"/16" M3 Pro/Max (2023) Screen Replacement', model: 'C MacBook||MacBook Pro 14"/16" M3 Pro/Max (2023) Screen Replacement', sku: 'MB-3902', stock: 1, minStock: 0, costPrice: 480, price: 750, margin: 36, iconName: 'Smartphone', status: 'low-stock', category: 'Screen Replacement', device_model: 'A2992, A2991' },

  // IDs 4223-4227: MacBook Pro 14" M4 (2024)
  { id: 4223, name: 'MacBook Pro 14" M4 (2024) Screen Replacement', model: 'C MacBook||MacBook Pro 14" M4 (2024)', sku: 'MB-4223', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Smartphone', status: 'In Stock', category: 'Screen Replacement', device_model: 'A3112' },
  { id: 4224, name: 'MacBook Pro 14" M4 (2024) Battery Replacement', model: 'C MacBook||MacBook Pro 14" M4 (2024)', sku: 'MB-4224', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Battery', status: 'In Stock', category: 'Battery Replacement', device_model: 'A3112' },
  { id: 4225, name: 'MacBook Pro 14" M4 (2024) Charging Port Replacement', model: 'C MacBook||MacBook Pro 14" M4 (2024)', sku: 'MB-4225', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Zap', status: 'In Stock', category: 'Charging Port Replacement', device_model: 'A3112' },
  { id: 4226, name: 'MacBook Pro 14" M4 (2024) Water Damage Cleaning / Assessment', model: 'C MacBook||MacBook Pro 14" M4 (2024)', sku: 'MB-4226', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Wrench', status: 'In Stock', category: 'Water Damage Cleaning / Assessment', device_model: 'A3112' },
  { id: 4227, name: 'MacBook Pro 14" M4 (2024) Motherboard & Logic Board Repair', model: 'C MacBook||MacBook Pro 14" M4 (2024)', sku: 'MB-4227', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Cpu', status: 'In Stock', category: 'Motherboard & Logic Board Repair', device_model: 'A3112' },

  // IDs 4228-4232: MacBook Pro 14"/16" M4 Pro/Max (2024)
  { id: 4228, name: 'MacBook Pro 14"/16" M4 Pro/Max (2024) Screen Replacement', model: 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)', sku: 'MB-4228', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Smartphone', status: 'In Stock', category: 'Screen Replacement', device_model: 'A3185, A3186' },
  { id: 4229, name: 'MacBook Pro 14"/16" M4 Pro/Max (2024) Battery Replacement', model: 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)', sku: 'MB-4229', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Battery', status: 'In Stock', category: 'Battery Replacement', device_model: 'A3185, A3186' },
  { id: 4230, name: 'MacBook Pro 14"/16" M4 Pro/Max (2024) Charging Port Replacement', model: 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)', sku: 'MB-4230', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Zap', status: 'In Stock', category: 'Charging Port Replacement', device_model: 'A3185, A3186' },
  { id: 4231, name: 'MacBook Pro 14"/16" M4 Pro/Max (2024) Water Damage Cleaning / Assessment', model: 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)', sku: 'MB-4231', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Wrench', status: 'In Stock', category: 'Water Damage Cleaning / Assessment', device_model: 'A3185, A3186' },
  { id: 4232, name: 'MacBook Pro 14"/16" M4 Pro/Max (2024) Motherboard & Logic Board Repair', model: 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)', sku: 'MB-4232', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Cpu', status: 'In Stock', category: 'Motherboard & Logic Board Repair', device_model: 'A3185, A3186' },

  // IDs 4233-4237: MacBook Pro 14" M5 (2025)
  { id: 4233, name: 'MacBook Pro 14" M5 (2025) Screen Replacement', model: 'C MacBook||MacBook Pro 14" M5 (2025)', sku: 'MB-4233', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Smartphone', status: 'In Stock', category: 'Screen Replacement', device_model: 'Mac17,2' },
  { id: 4234, name: 'MacBook Pro 14" M5 (2025) Battery Replacement', model: 'C MacBook||MacBook Pro 14" M5 (2025)', sku: 'MB-4234', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Battery', status: 'In Stock', category: 'Battery Replacement', device_model: 'Mac17,2' },
  { id: 4235, name: 'MacBook Pro 14" M5 (2025) Charging Port Replacement', model: 'C MacBook||MacBook Pro 14" M5 (2025)', sku: 'MB-4235', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Zap', status: 'In Stock', category: 'Charging Port Replacement', device_model: 'Mac17,2' },
  { id: 4236, name: 'MacBook Pro 14" M5 (2025) Water Damage Cleaning / Assessment', model: 'C MacBook||MacBook Pro 14" M5 (2025)', sku: 'MB-4236', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Wrench', status: 'In Stock', category: 'Water Damage Cleaning / Assessment', device_model: 'Mac17,2' },
  { id: 4237, name: 'MacBook Pro 14" M5 (2025) Motherboard & Logic Board Repair', model: 'C MacBook||MacBook Pro 14" M5 (2025)', sku: 'MB-4237', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Cpu', status: 'In Stock', category: 'Motherboard & Logic Board Repair', device_model: 'Mac17,2' },

  // IDs 4238-4242: MacBook Pro 14"/16" M5 Pro/Max (2026)
  { id: 4238, name: 'MacBook Pro 14"/16" M5 Pro/Max (2026) Screen Replacement', model: 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)', sku: 'MB-4238', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Smartphone', status: 'In Stock', category: 'Screen Replacement', device_model: 'Mac17,6, Mac17,7, Mac17,8, Mac17,9' },
  { id: 4239, name: 'MacBook Pro 14"/16" M5 Pro/Max (2026) Battery Replacement', model: 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)', sku: 'MB-4239', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Battery', status: 'In Stock', category: 'Battery Replacement', device_model: 'Mac17,6, Mac17,7, Mac17,8, Mac17,9' },
  { id: 4240, name: 'MacBook Pro 14"/16" M5 Pro/Max (2026) Charging Port Replacement', model: 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)', sku: 'MB-4240', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Zap', status: 'In Stock', category: 'Charging Port Replacement', device_model: 'Mac17,6, Mac17,7, Mac17,8, Mac17,9' },
  { id: 4241, name: 'MacBook Pro 14"/16" M5 Pro/Max (2026) Water Damage Cleaning / Assessment', model: 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)', sku: 'MB-4241', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Wrench', status: 'In Stock', category: 'Water Damage Cleaning / Assessment', device_model: 'Mac17,6, Mac17,7, Mac17,8, Mac17,9' },
  { id: 4242, name: 'MacBook Pro 14"/16" M5 Pro/Max (2026) Motherboard & Logic Board Repair', model: 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)', sku: 'MB-4242', stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Cpu', status: 'In Stock', category: 'Motherboard & Logic Board Repair', device_model: 'Mac17,6, Mac17,7, Mac17,8, Mac17,9' },
];

async function setupDb(customData = null) {
  const db = new PGlite();
  await db.exec(`
    CREATE TABLE public.inventory (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      sku TEXT,
      stock INTEGER DEFAULT 0,
      "minStock" INTEGER DEFAULT 0,
      "costPrice" NUMERIC DEFAULT 0,
      price NUMERIC DEFAULT 0,
      margin NUMERIC DEFAULT 0,
      "iconName" TEXT,
      status TEXT,
      category TEXT NOT NULL,
      device_model TEXT,
      is_pinned BOOLEAN DEFAULT false,
      pin_order INTEGER DEFAULT 0,
      quality_grade TEXT DEFAULT 'Standard',
      is_recommended BOOLEAN DEFAULT false
    );
  `);

  const dataToInsert = customData || SEED_DATA;
  for (const r of dataToInsert) {
    await db.query(
      `INSERT INTO public.inventory (id, name, model, sku, stock, "minStock", "costPrice", price, margin, "iconName", status, category, device_model, is_pinned, pin_order, quality_grade, is_recommended)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);`,
      [r.id, r.name, r.model, r.sku, r.stock, r.minStock, r.costPrice, r.price, r.margin, r.iconName, r.status, r.category, r.device_model, r.is_pinned, r.pin_order, r.quality_grade, r.is_recommended]
    );
  }
  // reset serial
  await db.exec(`SELECT setval('public.inventory_id_seq', 5000);`);
  return db;
}

module.exports = { setupDb, SEED_DATA };
