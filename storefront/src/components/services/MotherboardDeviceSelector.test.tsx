/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import MotherboardDeviceSelector from './MotherboardDeviceSelector';
import styles from './SharedRepairHierarchyPresentation.module.css';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>,
}));

const groups = [{
  key: 'other-phone', label: 'Other Phone', modelCount: 1,
  brands: [{
    brand: 'Asus', brandSlug: 'asus',
    series: [{ label: 'Asus Series', models: [{
      category: 'phone' as const, brand: 'Asus', brandSlug: 'asus', model: 'ROG Phone 5', modelSlug: 'rog-phone-5',
      href: '/repairs/motherboard-repair?category=phone&brand=asus&model=rog-phone-5',
    }] }],
  }],
}] as const;

describe('MotherboardDeviceSelector', () => {
  it('keeps the top-level group collapsed until opened, then exposes brand, series and canonical model link', () => {
    render(<MotherboardDeviceSelector groups={groups} />);

    expect(screen.getByRole('button', { name: /other phone/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'ROG Phone 5' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /other phone/i }));
    fireEvent.click(screen.getByRole('button', { name: /asus/i }));
    fireEvent.click(screen.getByRole('button', { name: /asus series/i }));

    const modelLink = screen.getByRole('link', { name: 'ROG Phone 5' });
    expect(modelLink).toHaveAttribute(
      'href',
      '/repairs/motherboard-repair?category=phone&brand=asus&model=rog-phone-5',
    );
    expect(modelLink).toHaveClass(styles.modelLink);
  });
});
