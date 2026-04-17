export const BRANDS = [
  { id: 'apple', name: 'Apple', slug: 'apple' },
  { id: 'samsung', name: 'Samsung', slug: 'samsung' },
  { id: 'google', name: 'Google', slug: 'google' },
  { id: 'oppo', name: 'Oppo', slug: 'oppo' },
  { id: 'pixel', name: 'Pixel', slug: 'pixel' },
];

export const LOCATIONS = [
  { id: 'ringwood', name: 'Ringwood', slug: 'ringwood', description: 'Kiosk C1 Ringwood Square Shopping Centre' },
  { id: 'melbourne', name: 'Melbourne', slug: 'melbourne', description: 'Melbourne Eastern Suburbs' },
  { id: 'croydon', name: 'Croydon', slug: 'croydon', description: 'Serving Croydon area' },
  { id: 'mitcham', name: 'Mitcham', slug: 'mitcham', description: 'Serving Mitcham area' },
];

export const SERVICE_TYPES = [
  { id: 'screen', name: 'Screen Replacement', slug: 'screen-replacement' },
  { id: 'battery', name: 'Battery Repair', slug: 'battery-repair' },
  { id: 'charging', name: 'Charging Port Repair', slug: 'charging-port-repair' },
  { id: 'back-glass', name: 'Back Glass Repair', slug: 'back-glass-repair' },
];

export const DEVICE_TYPES = [
  { id: 'iphone', name: 'iPhone', slug: 'iphone', brand: 'apple' },
  { id: 'samsung-s', name: 'Samsung Galaxy S', slug: 'samsung-galaxy-s', brand: 'samsung' },
  { id: 'ipad', name: 'iPad', slug: 'ipad', brand: 'apple' },
];

// Helper to generate long-tail SEO slugs
export function generateServicePath(brand: string, device: string, service: string, location: string) {
  return `/services/${brand}/${device}-${service}-${location}`;
}
