import { describe, expect, it } from 'vitest';

import { getRecoveryCustomerIntro } from './ChatWidget';

describe('chat identity recovery', () => {
  it('restores a name-only customer after a session is recreated', () => {
    expect(getRecoveryCustomerIntro('Avery Test', null, '1', [])).toBe(
      '[CUSTOMER_INFO]\nName: Avery Test\nPhone: ',
    );
  });

  it('does not resend customer identity when the recreated session already has it', () => {
    expect(getRecoveryCustomerIntro('Avery Test', null, '1', [
      {
        id: 'synthetic-message',
        sender: 'customer',
        content: '[CUSTOMER_INFO]\nName: Avery Test\nPhone: ',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ])).toBeNull();
  });
});
