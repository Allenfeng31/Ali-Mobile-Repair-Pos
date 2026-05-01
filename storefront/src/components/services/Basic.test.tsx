/**
 * @vitest-environment jsdom
 */
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';

const SimpleComp = () => (
  <div className="outer">
    <div className="grid">Grid</div>
    <div className="cta">CTA</div>
  </div>
);

describe('Simple DOM Structure', () => {
  afterEach(() => {
    cleanup();
  });

  it('verifies sibling structure', () => {
    const { container } = render(<SimpleComp />);
    const grid = container.querySelector('.grid');
    const cta = container.querySelector('.cta');
    expect(grid?.nextElementSibling).toBe(cta);
  });
});
