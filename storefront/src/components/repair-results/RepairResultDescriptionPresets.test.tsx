import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RepairResultDescriptionPresets } from './RepairResultDescriptionPresets';

describe('RepairResultDescriptionPresets', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders accessible, wrapping Screen buttons and marks the matching preset selected', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <RepairResultDescriptionPresets
        deviceName="iPhone 16 Pro"
        repairType="Screen Replacement"
        repairTypeSlug="screen-replacement"
        description=""
        descriptionSource="generated"
        onSelect={onSelect}
        onTryAnother={vi.fn()}
      />,
    );

    const buttons = screen.getAllByRole('button', { name: /use .* preset/i });
    expect(buttons).toHaveLength(10);
    expect(container.querySelector('[data-preset-list]')?.className).toContain('flex-wrap');

    fireEvent.click(screen.getByRole('button', { name: 'Use No Display preset' }));
    expect(onSelect).toHaveBeenCalledWith(expect.stringContaining('iPhone 16 Pro'), 'no-display');
  });

  it('confirms before replacing custom unsaved text', () => {
    const onSelect = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(
      <RepairResultDescriptionPresets
        deviceName="Pixel 9"
        repairType="Battery Replacement"
        repairTypeSlug="battery-replacement"
        description="Technician-authored diagnostic note."
        descriptionSource="custom"
        onSelect={onSelect}
        onTryAnother={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Use Rapid Drain preset' }));
    expect(window.confirm).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows the selected state and neutral variation control without horizontal scrolling', () => {
    const onSelect = vi.fn();
    const first = render(
      <RepairResultDescriptionPresets
        deviceName="Galaxy S24"
        repairType="Charging Port Replacement"
        repairTypeSlug="charging-port-replacement"
        description=""
        descriptionSource="preset"
        onSelect={onSelect}
        onTryAnother={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Use Cable Angle preset' }));
    const selectedDescription = onSelect.mock.calls[0][0];
    first.unmount();

    render(
      <RepairResultDescriptionPresets
        deviceName="Galaxy S24"
        repairType="Charging Port Replacement"
        repairTypeSlug="charging-port-replacement"
        description={selectedDescription}
        descriptionSource="preset"
        onSelect={vi.fn()}
        onTryAnother={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Use Cable Angle preset' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Try another neutral description' })).toBeTruthy();
    expect(screen.getByTestId('description-source').textContent).toContain('Preset selected');
  });
});
