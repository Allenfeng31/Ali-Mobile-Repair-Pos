export interface RepairCategoryNavigationItem {
  label: string;
  href: string;
  description: string;
}

export const REPAIR_CATEGORY_NAV_ITEMS: RepairCategoryNavigationItem[] = [
  {
    label: 'Screen Replacement',
    href: '/repairs/screen-replacement',
    description: 'Cracked glass, touch or display faults',
  },
  {
    label: 'Battery Replacement',
    href: '/repairs/battery-replacement',
    description: 'Fast drain, shutdowns or swelling',
  },
  {
    label: 'Charging Port Repair',
    href: '/repairs/charging-port-replacement',
    description: 'Loose connection or no charging',
  },
  {
    label: 'Back Glass & Housing',
    href: '/repairs/back-glass-replacement',
    description: 'Rear glass, back cover or housing damage',
  },
];
