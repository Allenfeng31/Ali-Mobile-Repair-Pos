import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Header from './Header';

vi.mock('next/link', () => ({
  default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => (
    <a
      href={props.href}
      onClick={(event) => {
        props.onClick?.(event);
        event.preventDefault();
      }}
    >
      {props.children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: () => null,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/context/CartContext', () => ({
  useCart: () => ({ devices: [] }),
}));

vi.mock('@/lib/analytics', () => ({
  analytics: { trackCallNow: vi.fn() },
}));

const primaryPhoneBrandLinks = [
  ['/repairs/phone/iphone', 'iPhone'],
  ['/repairs/phone/samsung', 'Samsung'],
  ['/repairs/phone/google-pixel', 'Google Pixel'],
  ['/repairs/phone/oppo', 'OPPO'],
] as const;

describe('Header phone brand navigation', () => {
  it('keeps all four primary phone brand hubs directly accessible from the desktop repair menu', () => {
    const { container } = render(<Header />);
    const desktopNavigation = container.querySelector('.nav-links--desktop');

    expect(desktopNavigation).not.toBeNull();
    for (const [href, label] of primaryPhoneBrandLinks) {
      expect(within(desktopNavigation as HTMLElement).getByRole('link', { name: new RegExp(label) }).getAttribute('href')).toBe(href);
    }
    expect(within(desktopNavigation as HTMLElement).getByRole('link', { name: 'Other Phone Repairs' }).getAttribute('href')).toBe('/repairs/phone');
  });

  it('keeps all four primary phone brand hubs in the existing mobile device group and closes after selection', () => {
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    fireEvent.click(screen.getByRole('button', { name: /By Device/i }));

    const mobilePanel = screen.getByLabelText('Mobile navigation');
    for (const [href, label] of primaryPhoneBrandLinks) {
      expect(within(mobilePanel).getByRole('link', { name: new RegExp(label) }).getAttribute('href')).toBe(href);
    }
    expect(within(mobilePanel).getByRole('link', { name: 'More Brand Repairs' }).getAttribute('href')).toBe('/repairs/phone');

    fireEvent.click(within(mobilePanel).getByRole('link', { name: 'Google Pixel Repair' }));
    expect(screen.queryByLabelText('Mobile navigation')).toBeNull();
  });
});
