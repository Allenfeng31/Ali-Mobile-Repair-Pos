/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const { getSyncLogs, retrySyncTask, recheckSyncTask } = vi.hoisted(() => ({
  getSyncLogs: vi.fn(),
  retrySyncTask: vi.fn(),
  recheckSyncTask: vi.fn(),
}));
vi.mock('../lib/api', () => ({ api: { getSyncLogs, retrySyncTask, recheckSyncTask } }));

import { GoogleSyncPanel } from './GoogleSyncPanel';

const now = Date.now();
const logs = [
  { id: 'failed-1', customer_id: '1', customer_name: 'Needs Help', customer_phone: '0400', operation: 'create', status: 'failed', attempts: 1, safe_error: 'Google connection failed.', created_at: '', updated_at: '', locked_at: null },
  { id: 'limit-1', customer_id: '2', customer_name: 'At Limit', customer_phone: '0401', operation: 'update', status: 'failed', attempts: 5, safe_error: 'Retry limit reached.', created_at: '', updated_at: '', locked_at: null },
  { id: 'stale-1', customer_id: '3', customer_name: 'Stale Lock', customer_phone: '0402', operation: 'update', status: 'processing', attempts: 2, safe_error: null, created_at: '', updated_at: '', locked_at: new Date(now - 6 * 60 * 1000).toISOString() },
  { id: 'active-1', customer_id: '4', customer_name: 'Active Work', customer_phone: '0403', operation: 'create', status: 'processing', attempts: 1, safe_error: null, created_at: '', updated_at: '', locked_at: new Date(now).toISOString() },
  { id: 'synced-1', customer_id: '5', customer_name: 'Synced Work', customer_phone: '0404', operation: 'create', status: 'synced', attempts: 1, safe_error: null, created_at: '', updated_at: '', locked_at: null },
  { id: 'verify-1', customer_id: '6', customer_name: 'Verify Creation', customer_phone: '0405', operation: 'create', status: 'verification_required', attempts: 1, safe_error: 'Google creation outcome needs verification. Automatic recreation is blocked to prevent duplicates.', created_at: '', updated_at: '', locked_at: null },
];

describe('GoogleSyncPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('starts on Needs Attention and separates pending and history without retrying on mount', async () => {
    getSyncLogs.mockResolvedValue(logs);
    render(<GoogleSyncPanel onClose={vi.fn()} />);
    expect(screen.getByTestId('sync-loading')).toBeTruthy();
    await screen.findByText('Needs Help');
    expect(screen.getByText('At Limit')).toBeTruthy();
    expect(screen.getByText('Verify Creation')).toBeTruthy();
    expect(screen.getByText('Limit Reached')).toBeTruthy();
    expect(screen.queryByText('Active Work')).toBeNull();
    expect(screen.queryByText('Never Queued')).toBeNull();
    expect(retrySyncTask).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Pending/i }));
    expect(await screen.findByText('Active Work')).toBeTruthy();
    expect(screen.queryByText('Stale Lock')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Synced History/i }));
    expect(await screen.findByText('Synced Work')).toBeTruthy();
  });

  it('retries exactly the selected eligible task and refreshes records', async () => {
    getSyncLogs.mockResolvedValue(logs);
    retrySyncTask.mockResolvedValue({ success: true });
    render(<GoogleSyncPanel onClose={vi.fn()} />);
    await screen.findByText('Needs Help');
    fireEvent.click(screen.getByRole('button', { name: 'Retry sync task for Needs Help' }));
    await waitFor(() => expect(retrySyncTask).toHaveBeenCalledWith('failed-1'));
    expect(getSyncLogs).toHaveBeenCalledTimes(2);
  });

  it('uses Recheck Google for verification-required CREATE work and never Retry Now', async () => {
    getSyncLogs.mockResolvedValue(logs);
    recheckSyncTask.mockResolvedValue({ success: false });
    render(<GoogleSyncPanel onClose={vi.fn()} />);
    await screen.findByText('Verify Creation');
    expect(screen.getByText('Google creation outcome needs verification. Automatic recreation is blocked to prevent duplicates.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retry sync task for Verify Creation' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Recheck Google for Verify Creation' }));
    await waitFor(() => expect(recheckSyncTask).toHaveBeenCalledWith('verify-1'));
    expect(retrySyncTask).not.toHaveBeenCalled();
  });

  it('uses sanitised errors, supports empty state and keeps task scrolling internal', async () => {
    getSyncLogs.mockRejectedValueOnce(new Error('sensitive backend detail'));
    const onClose = vi.fn();
    render(<GoogleSyncPanel onClose={onClose} />);
    expect((await screen.findByRole('alert')).textContent).toContain('Unable to load sync tasks. Please try again.');
    expect(screen.queryByText('sensitive backend detail')).toBeNull();
    expect(screen.getByText('No records found')).toBeTruthy();
    expect(screen.getByTestId('sync-task-list').className).toContain('overflow-y-auto');
    expect(screen.getByTestId('google-sync-panel').className).toContain('overflow-x-hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Close Google Sync' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
