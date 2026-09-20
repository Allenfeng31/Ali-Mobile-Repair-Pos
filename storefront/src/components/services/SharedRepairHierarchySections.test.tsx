/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import SharedRepairHierarchySections from './SharedRepairHierarchySections';
import type { SharedRepairHierarchyModel } from '@/lib/sharedRepairHierarchy';

vi.mock('next/link', () => ({
  default: ({ children, href }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href}>{children}</a>,
}));

function model(
  brandSlug: string,
  brandLabel: string,
  modelSlug: string,
  modelLabel: string,
  priceLabel: string | null,
): SharedRepairHierarchyModel {
  return {
    brandSlug,
    brandLabel,
    modelSlug,
    modelLabel,
    repairLabel: 'Front Camera Replacement',
    bookingHref: `/book/${modelSlug}`,
    priceLabel,
  };
}

const hierarchyModels = [
  ...Array.from({ length: 6 }, (_, index) => model('samsung', 'Samsung', `galaxy-s${index + 1}`, `Galaxy S${index + 1}`, index === 0 ? '$99' : index === 1 ? 'From $129' : null)),
  model('samsung', 'Samsung', 'galaxy-a55', 'Galaxy A55', '$149'),
  model('htc', 'HTC', 'u24', 'U24', null),
];

describe('SharedRepairHierarchySections', () => {
  it('server-renders every brand, series, model, repair label, price, and booking href in one tree', () => {
    const markup = renderToStaticMarkup(<SharedRepairHierarchySections models={hierarchyModels} />);

    for (const text of ['Samsung', 'HTC', 'Galaxy S1', 'Galaxy A55', 'U24', 'Front Camera Replacement', '$99', 'From $129']) {
      expect(markup).toContain(text);
    }
    for (const href of ['/book/galaxy-s1', '/book/galaxy-a55', '/book/u24']) {
      expect(markup).toContain(`href="${href}"`);
    }
    expect((markup.match(/href="\/book\//g) ?? [])).toHaveLength(hierarchyModels.length);
    expect(markup).toContain('data-shared-repair-hierarchy-panel');
    expect(markup).toContain('<noscript>');
  });

  it('uses accessible local disclosure state without URL mutation and keeps collapsed content in the DOM', () => {
    const { container } = render(<SharedRepairHierarchySections models={hierarchyModels} />);
    const samsung = screen.getByRole('button', { name: /Samsung/ });
    const htc = screen.getByRole('button', { name: /HTC/ });

    expect(samsung).toHaveAttribute('type', 'button');
    expect(samsung).toHaveAttribute('aria-expanded', 'false');
    expect(samsung).toHaveAttribute('aria-controls');
    expect(htc).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelectorAll('[data-shared-repair-model-card]')).toHaveLength(hierarchyModels.length);

    fireEvent.click(samsung);
    expect(samsung).toHaveAttribute('aria-expanded', 'true');
    const series = screen.getByRole('button', { name: /Galaxy S Series/ });
    expect(series).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(series);
    expect(series).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /Galaxy S1.*Front Camera Replacement/ })).toHaveAttribute('href', '/book/galaxy-s1');
  });

  it('supports selected model visibility without changing its caller order', () => {
    const { container } = render(
      <SharedRepairHierarchySections models={hierarchyModels} selectedModelSlug="galaxy-s6" />,
    );

    expect(screen.getByRole('button', { name: /Samsung/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /Galaxy S Series/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Show Fewer Models' })).toHaveAttribute('aria-expanded', 'true');
    expect(Array.from(container.querySelectorAll('[data-shared-repair-model-card]')).map((card) => card.id)).toEqual([
      'galaxy-s1', 'galaxy-s2', 'galaxy-s3', 'galaxy-s4', 'galaxy-s5', 'galaxy-s6', 'galaxy-a55', 'u24',
    ]);
  });

  it('opens an explicitly selected brand, omits a redundant single-brand control, and keeps flat brands direct', () => {
    const { rerender } = render(
      <SharedRepairHierarchySections models={hierarchyModels} selectedBrandSlug="htc" />,
    );
    expect(screen.getByRole('button', { name: /HTC/ })).toHaveAttribute('aria-expanded', 'true');

    rerender(<SharedRepairHierarchySections models={hierarchyModels.slice(0, 7)} />);
    expect(screen.queryByRole('button', { name: /^Samsung/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Galaxy S Series/ })).toBeInTheDocument();

    rerender(<SharedRepairHierarchySections models={[hierarchyModels.at(-1)!]} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByRole('link', { name: /U24.*Front Camera Replacement/ })).toHaveAttribute('href', '/book/u24');
  });

  it('uses CSS-only collapsed panels with a no-JS reveal and no routing hooks', () => {
    const presentation = readFileSync(resolve(process.cwd(), 'src/components/services/SharedRepairHierarchyPresentation.tsx'), 'utf8');
    const presentationStyles = readFileSync(resolve(process.cwd(), 'src/components/services/SharedRepairHierarchyPresentation.module.css'), 'utf8');

    expect(presentation).toContain('<noscript>');
    expect(presentation).toContain('[data-shared-repair-hierarchy-panel] { display: block !important; }');
    expect(presentation).toContain('[data-shared-repair-hierarchy-control] { display: none !important; }');
    expect(presentation).not.toContain('next/navigation');
    expect(presentation).not.toContain('router.');
    expect(presentationStyles).toContain(".panel[data-expanded='false']");
    expect(presentationStyles).toContain('display: none;');
  });
});
