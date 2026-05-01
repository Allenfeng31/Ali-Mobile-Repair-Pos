import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsView } from './Settings';

// Mock the API since it is used in useEffect
vi.mock('../lib/api', () => ({
  api: {
    getSettings: vi.fn().mockResolvedValue({}),
    updateSetting: vi.fn().mockResolvedValue({}),
    updateUser: vi.fn(),
    generateBlog: vi.fn(),
    confirmBlog: vi.fn(),
    getQualityTiers: vi.fn().mockResolvedValue([]),
    createQualityTier: vi.fn(),
    updateQualityTier: vi.fn(),
    deleteQualityTier: vi.fn()
  }
}));

describe('SettingsView', () => {
  it('does not render Quality Tiers Management card for regular admin', () => {
    const user = { id: 1, username: 'admin', role: 'admin' };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);
    
    expect(screen.queryByText('Quality Tiers Management')).toBeNull();
  });

  it('renders Quality Tiers Management card for super admin', () => {
    const user = { id: 2, username: 'superadmin', role: 'super admin' };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);
    
    expect(screen.getByText('Quality Tiers Management')).toBeDefined();
  });
});
