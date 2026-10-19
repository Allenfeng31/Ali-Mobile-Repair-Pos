import { renderToStaticMarkup } from 'react-dom/server';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const { default: Breadcrumbs } = await import('./Breadcrumbs');

describe('Breadcrumbs', () => {
  it('keeps a supplied Samsung Tablet commercial model label aligned in visible navigation and BreadcrumbList', () => {
    const html = renderToStaticMarkup(
      <Breadcrumbs
        category="tablet"
        brand="samsung"
        model="galaxy-tab-s11-sm-x730-sm-x736"
        modelLabel="Galaxy Tab S11"
      />,
    );

    expect(html).toContain('aria-current="page"><span');
    expect(html).toContain('>Galaxy Tab S11</span>');
    expect(html).toContain('"name":"Galaxy Tab S11"');
    expect(html).toContain('/repairs/tablet/samsung/galaxy-tab-s11-sm-x730-sm-x736');
    expect(html).not.toMatch(/Sm X730|Sm X736/);
  });
});
