import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QuoteRequestModal from './QuoteRequestModal';

vi.mock('lucide-react', () => ({ X: () => <span aria-hidden="true" /> }));

const fetchMock = vi.fn();

function renderModal() {
  return render(
    <QuoteRequestModal
      isOpen
      onClose={vi.fn()}
      deviceModel="iPhone 15"
      repairType="Screen Replacement"
    />,
  );
}

async function completeForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Full Name'), 'Test Customer');
  await user.type(screen.getByLabelText('Phone Number'), '0400000000');
  await user.click(screen.getByRole('button', { name: /request quote/i }));
}

describe('QuoteRequestModal delivery contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'quote-token' });
  });

  it('does not send a quote request when the modal is first rendered', () => {
    renderModal();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the form open and gives a retry/call option when no delivery path succeeds', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 503 }));
    renderModal();

    await completeForm();

    expect(await screen.findByText(/could not send your request/i)).not.toBeNull();
    expect(screen.queryByText('Request Sent!')).toBeNull();
    expect(screen.getByDisplayValue('Test Customer')).not.toBeNull();
    expect(screen.getByRole('link', { name: /call 0481 058 514/i }).getAttribute('href')).toBe('tel:0481058514');
  });

  it('only confirms a chat delivery after the quote message has a persisted id', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 503 }))
      .mockResolvedValueOnce(new Response('{}', { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'intro-1' }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'quote-1' }), { status: 201 }));
    renderModal();

    await completeForm();

    expect(await screen.findByText('Request Sent!')).not.toBeNull();
    expect(window.localStorage.getItem('ali_chat_intro_sent')).toBe('1');
  });

  it('does not treat an HTTP-success chat response without a persisted message id as a sent quote', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 503 }))
      .mockResolvedValueOnce(new Response('{}', { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'intro-1' }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 201 }));
    renderModal();

    await completeForm();

    expect(await screen.findByText(/could not send your request/i)).not.toBeNull();
    expect(screen.queryByText('Request Sent!')).toBeNull();
  });

  it('prevents a second click while a delivery request is in flight', async () => {
    let resolveNotification: (value: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise<Response>(resolve => { resolveNotification = resolve; }));
    renderModal();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Full Name'), 'Test Customer');
    await user.type(screen.getByLabelText('Phone Number'), '0400000000');
    const submit = screen.getByRole('button', { name: /request quote/i });
    await user.click(submit);
    expect(submit).toHaveProperty('disabled', true);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    resolveNotification!(new Response(JSON.stringify({ success: false }), { status: 503 }));
    await waitFor(() => expect(screen.getByRole('button', { name: /request quote/i })).toHaveProperty('disabled', false));
  });
});
