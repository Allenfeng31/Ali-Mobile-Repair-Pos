import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Header from './Header';
import { SECONDARY_PHONE_BRAND_HUB_NAV_ITEMS } from '@/lib/phone-brand-hubs';

vi.mock('next/link', () => ({
  default: ({ prefetch, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => {
    void prefetch;
    return (
      <a
        {...props}
        onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
        }}
      />
    );
  },
}));

vi.mock('next/image', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('@/context/CartContext', () => ({ useCart: () => ({ devices: [] }) }));
vi.mock('@/lib/analytics', () => ({ analytics: { trackCallNow: vi.fn() } }));

const primaryPhoneBrandLinks = [
  ['/repairs/phone/iphone', 'iPhone Repairs'],
  ['/repairs/phone/samsung', 'Samsung Phone Repairs'],
  ['/repairs/phone/google-pixel', 'Google Pixel Phone Repairs'],
  ['/repairs/phone/oppo', 'OPPO Phone Repairs'],
] as const;

const mobilePrimaryPhoneBrandLinks = [
  ['/repairs/phone/iphone', 'iPhone Repair'],
  ['/repairs/phone/samsung', 'Samsung Phone Repair'],
  ['/repairs/phone/google-pixel', 'Google Pixel Repair'],
  ['/repairs/phone/oppo', 'OPPO Phone Repair'],
] as const;

afterEach(cleanup);

describe('Header phone brand navigation', () => {
  it('keeps the requested desktop repair categories and their canonical brand links', () => {
    const { container } = render(<Header />);
    const desktopNavigation = container.querySelector('.nav-links--desktop');

    expect(desktopNavigation).not.toBeNull();
    const desktop = within(desktopNavigation as HTMLElement);
    expect(desktop.getByRole('link', { name: 'Phone Repairs' }).getAttribute('href')).toBe('/repairs/phone');
    expect(desktop.getByRole('link', { name: 'Tablet & iPad Repairs' }).getAttribute('href')).toBe('/repairs/tablet');
    expect(desktop.getByRole('link', { name: 'MacBook Repairs' }).getAttribute('href')).toBe('/repairs/laptop/macbook');
    expect(desktop.getByRole('link', { name: 'Apple Watch Repairs' }).getAttribute('href')).toBe('/repairs/watch/apple');
    fireEvent.mouseEnter(desktop.getByRole('link', { name: 'Phone Repairs' }));
    const phoneMenu = screen.getByLabelText('Phone repair brands');
    for (const [href, label] of primaryPhoneBrandLinks) {
      expect(within(phoneMenu).getByRole('link', { name: label }).getAttribute('href')).toBe(href);
    }
    expect(within(phoneMenu).getByRole('link', { name: 'More Phone Brands' }).getAttribute('href')).toBe('/repairs/phone');
    fireEvent.mouseEnter(desktop.getByRole('link', { name: 'Tablet & iPad Repairs' }));
    const tabletMenu = screen.getByLabelText('Tablet repair brands');
    expect(within(tabletMenu).getByRole('link', { name: 'iPad Repairs' }).getAttribute('href')).toBe('/repairs/tablet/ipad');
    expect(within(tabletMenu).getByRole('link', { name: 'Samsung Tablet Repairs' }).getAttribute('href')).toBe('/repairs/tablet/samsung');
    expect(within(tabletMenu).getByRole('link', { name: 'Lenovo Tablet Repairs' }).getAttribute('href')).toBe('/repairs/tablet/lenovo');
    expect(desktop.getByRole('button', { name: 'Repair Categories' })).not.toBeNull();
  });

  it('opens the desktop secondary-brand flyout immediately from the full parent row and keeps it open into the flyout', () => {
    render(<Header />);

    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Phone Repairs' }));
    const phoneMenu = screen.getByLabelText('Phone repair brands');
    const morePhoneBrandsLink = within(phoneMenu).getByRole('link', { name: 'More Phone Brands' });
    const morePhoneBrandsRow = morePhoneBrandsLink.closest('.nav-dropdown--submenu');

    expect(morePhoneBrandsRow).not.toBeNull();
    fireEvent.mouseEnter(morePhoneBrandsRow as HTMLElement);

    expect(morePhoneBrandsLink.getAttribute('aria-expanded')).toBe('true');
    const flyout = screen.getByLabelText('Other phone repair brands');
    expect(flyout.getAttribute('aria-hidden')).toBe('false');
    for (const item of SECONDARY_PHONE_BRAND_HUB_NAV_ITEMS) {
      expect(within(flyout).getByRole('link', { name: item.label }).getAttribute('href')).toBe(item.href);
    }

    fireEvent.mouseLeave(morePhoneBrandsLink, { relatedTarget: flyout });
    fireEvent.mouseEnter(flyout);
    expect(morePhoneBrandsLink.getAttribute('aria-expanded')).toBe('true');

    morePhoneBrandsLink.focus();
    fireEvent.focus(morePhoneBrandsLink);
    expect(morePhoneBrandsLink.getAttribute('aria-expanded')).toBe('true');

    fireEvent.mouseLeave(morePhoneBrandsRow as HTMLElement);
    expect(morePhoneBrandsLink.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps the mobile drawer hierarchy, secondary-brand accordion, and close behaviour', () => {
    const { container } = render(<Header />);
    const menuTrigger = screen.getByRole('button', { name: 'Open navigation menu' });

    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByRole('button', { name: /By Device/i }));

    const mobilePanel = screen.getByLabelText('Mobile navigation');
    const mobile = within(mobilePanel);
    expect(mobile.queryByRole('link', { name: 'All Service & Repairs' })).toBeNull();
    expect(mobile.queryByRole('link', { name: 'Phone Repair' })).toBeNull();
    expect(mobile.queryByRole('link', { name: 'Tablet Repair' })).toBeNull();

    for (const [href, label] of mobilePrimaryPhoneBrandLinks) {
      expect(mobile.getByRole('link', { name: label }).getAttribute('href')).toBe(href);
    }
    const morePhoneBrandsButton = mobile.getByRole('button', { name: 'More Phone Brands' });
    expect(morePhoneBrandsButton.getAttribute('aria-expanded')).toBe('false');
    expect(mobile.queryByRole('link', { name: 'Xiaomi Phone Repairs' })).toBeNull();
    fireEvent.click(morePhoneBrandsButton);
    expect(morePhoneBrandsButton.getAttribute('aria-expanded')).toBe('true');

    const secondaryBrands = mobile.getByLabelText('Other phone repair brands');
    for (const item of SECONDARY_PHONE_BRAND_HUB_NAV_ITEMS) {
      expect(within(secondaryBrands).getByRole('link', { name: item.label }).getAttribute('href')).toBe(item.href);
    }
    fireEvent.click(morePhoneBrandsButton);
    expect(morePhoneBrandsButton.getAttribute('aria-expanded')).toBe('false');

    for (const [label, href] of [
      ['iPad Repair', '/repairs/tablet/ipad'],
      ['Samsung Tablet Repair', '/repairs/tablet/samsung'],
      ['Lenovo Tablet Repair', '/repairs/tablet/lenovo'],
      ['MacBook Repair', '/repairs/laptop/macbook'],
      ['Apple Watch Repair', '/repairs/watch/apple'],
    ]) {
      expect(mobile.getByRole('link', { name: label }).getAttribute('href')).toBe(href);
    }

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByLabelText('Mobile navigation')).toBeNull();
    expect(document.activeElement).toBe(menuTrigger);
    expect(container.querySelector('.mobile-menu-overlay')).toBeNull();

    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByRole('button', { name: /By Device/i }));
    fireEvent.click(screen.getByRole('link', { name: 'Google Pixel Repair' }));
    expect(screen.queryByLabelText('Mobile navigation')).toBeNull();
  });
});
