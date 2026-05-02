/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SettingsView } from './Settings';

// Mock the API since it is used in useEffect
vi.mock('../lib/api', () => ({
  api: {
    getSettings: vi.fn().mockResolvedValue({ sms_alerts_enabled: 'true' }),
    updateSetting: vi.fn().mockResolvedValue({}),
    updateUser: vi.fn(),

    getQualityTiers: vi.fn().mockResolvedValue([]),
    createQualityTier: vi.fn(),
    updateQualityTier: vi.fn(),
    deleteQualityTier: vi.fn()
  }
}));

describe('SettingsView', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not render Quality Tiers Management card for regular admin', () => {
    const user = { id: 1, username: 'admin', role: 'admin' };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);
    
    expect(screen.queryByText('Quality Tiers Management')).toBeNull();
  });

  it('renders Quality Tiers Management card for super admin with direct role', () => {
    const user = { id: 2, username: 'superadmin', role: 'super admin' };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);
    
    expect(screen.getByText('Quality Tiers Management')).toBeDefined();
  });

  it('renders Quality Tiers Management card for super admin with nested user_metadata', () => {
    const user = { id: 2, username: 'superadmin', user_metadata: { role: 'SUPER_ADMIN' } };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);
    
    expect(screen.getByText('Quality Tiers Management')).toBeDefined();
  });

  it('renders Quality Tiers Management card for super admin with nested app_metadata', () => {
    const user = { id: 2, username: 'superadmin', app_metadata: { role: 'Super Admin' } };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);
    
    expect(screen.getByText('Quality Tiers Management')).toBeDefined();
  });

  // ========================================================================
  // THE REAL BUG: Supabase data.user.role is always 'authenticated'.
  // The || short-circuit picks up 'authenticated' (truthy) and never
  // reaches app_metadata.role where the actual custom role lives.
  // ========================================================================
  it('renders Quality Tiers Management for a real Supabase user object where role=authenticated but app_metadata has SUPER ADMIN', () => {
    const user = {
      id: '123',
      email: 'test@test.com',
      role: 'authenticated',
      app_metadata: { role: 'SUPER ADMIN' },
      user_metadata: { role: 'SUPER ADMIN' }
    };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);

    expect(screen.getByText('Quality Tiers Management')).toBeDefined();
  });

  it('does NOT render Quality Tiers Management for a Supabase user with role=authenticated and NO custom role in metadata', () => {
    const user = {
      id: '456',
      email: 'staff@test.com',
      role: 'authenticated',
      app_metadata: { provider: 'email' },
      user_metadata: {}
    };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);

    expect(screen.queryByText('Quality Tiers Management')).toBeNull();
  });

  // ========================================================================
  // SMS ALERTS TOGGLE
  // ========================================================================
  it('renders the SMS Alerts section', () => {
    const user = { id: 1, username: 'admin', role: 'admin' };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);

    expect(screen.getByText('SMS Alerts')).toBeDefined();
    expect(screen.getByText(/Receive text messages for new customer chats/)).toBeDefined();
  });

  it('renders the SMS toggle button with correct initial text when enabled', () => {
    const user = { id: 1, username: 'admin', role: 'admin' };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);

    const toggleButton = screen.getByText('Disable SMS Alerts');
    expect(toggleButton).toBeDefined();
  });

  it('renders cost-saving explanation text', () => {
    const user = { id: 1, username: 'admin', role: 'admin' };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);

    expect(screen.getByText(/save Twilio credits/)).toBeDefined();
    expect(screen.getByText(/push notifications will still work/i)).toBeDefined();
  });

  it('calls updateSetting when SMS toggle is clicked', async () => {
    const { api } = await import('../lib/api');
    const user = { id: 1, username: 'admin', role: 'admin' };
    render(<SettingsView currentUser={user} onUpdateUser={vi.fn()} onLogout={vi.fn()} />);

    const toggleButton = screen.getByText('Disable SMS Alerts');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(api.updateSetting).toHaveBeenCalledWith('sms_alerts_enabled', 'false');
    });
  });
});

