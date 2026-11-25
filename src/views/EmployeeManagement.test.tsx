/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EmployeeManagement } from './EmployeeManagement';

const { getSession, authState } = vi.hoisted(() => ({
  getSession: vi.fn(),
  authState: { permissions: { is_super_admin: true }, isLoading: false },
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getSession },
  },
}));

vi.mock('../hooks/useAuthStore', () => ({
  useAuthStore: () => authState,
}));

vi.mock('motion/react', () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('EmployeeManagement', () => {
  beforeEach(() => {
    authState.permissions = { is_super_admin: true };
    authState.isLoading = false;
    getSession.mockResolvedValue({
      data: { session: { access_token: 'admin-access-token' } },
      error: null,
    });
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('authenticates account creation and shows the safe server validation error', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        code: 'WEAK_PASSWORD',
        error: 'Password must be at least 6 characters.',
      }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);

    render(<EmployeeManagement onBack={vi.fn()} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /new employee/i }));
    fireEvent.change(screen.getByPlaceholderText('e.g. admin'), { target: { value: 'Muse' } });
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeTruthy();
    fireEvent.change(passwordInput!, { target: { value: 'secure-password' } });
    fireEvent.click(screen.getByRole('button', { name: /create & initialize account/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Password must be at least 6 characters.');
    });

    const [url, options] = fetchMock.mock.calls[1];
    expect(String(url)).toContain('/admin/employees');
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer admin-access-token',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(options.body)).toMatchObject({ username: 'muse' });
    expect(JSON.parse(options.body)).not.toHaveProperty('email');
  });

  it('does not expose the management page or call the API for ordinary staff', async () => {
    authState.permissions = { is_super_admin: false };
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<EmployeeManagement onBack={vi.fn()} />);

    expect(screen.getByText('Access Denied')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /new employee/i })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
