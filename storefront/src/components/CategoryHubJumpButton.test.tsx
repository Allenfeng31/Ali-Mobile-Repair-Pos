import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CategoryHubJumpButton from './CategoryHubJumpButton';

const scrollIntoView = vi.fn();
const matchMedia = vi.fn();

describe('CategoryHubJumpButton', () => {
  beforeEach(() => {
    scrollIntoView.mockReset();
    matchMedia.mockReturnValue({ matches: false });
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });
    document.body.innerHTML = '<section id="selection-target"></section>';
  });

  it('is keyboard-accessible and smoothly scrolls to the category selection without navigation', async () => {
    const user = userEvent.setup();
    const initialHref = window.location.href;
    render(<CategoryHubJumpButton targetId="selection-target">Choose Your Brand</CategoryHubJumpButton>);

    const button = screen.getByRole('button', { name: 'Choose Your Brand' });
    expect(button.getAttribute('aria-controls')).toBe('selection-target');
    await user.tab();
    await user.keyboard('{Enter}');

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(window.location.href).toBe(initialHref);
  });

  it('uses instant scrolling when reduced motion is requested', async () => {
    matchMedia.mockReturnValue({ matches: true });
    const user = userEvent.setup();
    render(<CategoryHubJumpButton targetId="selection-target">Choose Your Brand</CategoryHubJumpButton>);

    await user.click(screen.getByRole('button', { name: 'Choose Your Brand' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });
});
