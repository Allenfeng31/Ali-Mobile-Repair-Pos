import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import SharedRepairGuidance, { groupSharedRepairGuidanceCards } from './SharedRepairGuidance';

const cards = [
  { title: 'Physical side-button symptoms', body: 'A stuck or loose key can need inspection.' },
  { title: 'No power is not proof of a button fault', body: 'Battery, charging and board faults can cause the same symptom.' },
  { title: 'Safe checks before repair', body: 'Remove a tight case and use only safe restart options.' },
  { title: 'Price, timing, warranty and preparation', body: 'Choose your model before confirming the repair option.', link: { href: '/repairs/phone/power-button-replacement', label: 'View repair options' } },
] as const;

describe('SharedRepairGuidance', () => {
  it('maps cards by their semantic titles instead of source order', () => {
    expect(groupSharedRepairGuidanceCards([...cards].reverse()).map((stage) => stage.key)).toEqual([
      'symptoms',
      'possible-causes',
      'our-checks',
      'next-steps',
    ]);
  });

  it('keeps every detail and link in closed native disclosures in SSR', () => {
    const html = renderToStaticMarkup(<SharedRepairGuidance heading="Before arranging Power Button Replacement" intro="Confirm the symptom first." cards={cards} />);

    expect(html.match(/data-guidance-stage/g)).toHaveLength(4);
    expect(html).toContain('A stuck or loose key can need inspection.');
    expect(html).toContain('Battery, charging and board faults can cause the same symptom.');
    expect(html).toContain('Remove a tight case and use only safe restart options.');
    expect(html).toContain('Choose your model before confirming the repair option.');
    expect(html).toContain('href="/repairs/phone/power-button-replacement"');
    expect(html).not.toContain('<details open=""');
  });

  it('uses a focusable native summary that opens on activation', () => {
    const { container } = render(<SharedRepairGuidance heading="Before arranging Power Button Replacement" intro="Confirm the symptom first." cards={cards} />);
    const summary = screen.getByText('Symptoms').closest('summary') as HTMLElement;
    const details = summary.closest('details') as HTMLDetailsElement;

    summary.focus();
    expect(summary).toHaveFocus();
    fireEvent.click(summary);
    expect(details.open).toBe(true);
    expect(container.querySelectorAll('[data-guidance-stage]')).toHaveLength(4);
  });
});
