/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';

// Import the module under test
const { isGoogleContactsSyncEnabled, syncCustomerToGoogleContacts } = require('./googleContactsSync.js');

function createMockSupabase(returnData, returnError = null) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: returnData, error: returnError }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    }),
  };
}

describe('Google Contacts Sync Logic', () => {
  describe('isGoogleContactsSyncEnabled', () => {
    it('returns false when setting is explicitly disabled', async () => {
      const supabase = createMockSupabase({ value: 'false' });
      const result = await isGoogleContactsSyncEnabled(supabase);
      expect(result).toBe(false);
    });

    it('returns true when setting is explicitly enabled', async () => {
      const supabase = createMockSupabase({ value: 'true' });
      const result = await isGoogleContactsSyncEnabled(supabase);
      expect(result).toBe(true);
    });

    it('returns false (default disabled) when no setting row exists', async () => {
      const supabase = createMockSupabase(null);
      const result = await isGoogleContactsSyncEnabled(supabase);
      expect(result).toBe(false);
    });
  });

  describe('syncCustomerToGoogleContacts', () => {
    const mockCustomer = { id: 'cust123', name: 'John Doe', phone: '0400000000' };

    it('Should not trigger sync if the toggle is OFF', async () => {
      const supabase = createMockSupabase({ value: 'false' }); // Toggle OFF
      const googleClient = {
        people: {
          searchContacts: vi.fn(),
          createContact: vi.fn(),
        }
      };

      const result = await syncCustomerToGoogleContacts(mockCustomer, supabase, googleClient);

      expect(result).toBe(false);
      expect(googleClient.people.searchContacts).not.toHaveBeenCalled();
      expect(googleClient.people.createContact).not.toHaveBeenCalled();
    });

    it('Should search for existing phone numbers before creating a new contact', async () => {
      const supabase = createMockSupabase({ value: 'true' }); // Toggle ON
      
      const searchMock = vi.fn().mockResolvedValue({
        data: { results: [] } // No existing contacts
      });
      const createMock = vi.fn().mockResolvedValue({
        data: { resourceName: 'people/123' }
      });

      const googleClient = {
        people: {
          searchContacts: searchMock,
          createContact: createMock,
        }
      };

      const result = await syncCustomerToGoogleContacts(mockCustomer, supabase, googleClient);

      expect(result).toBe(true);
      expect(searchMock).toHaveBeenCalledWith({
        query: mockCustomer.phone,
        readMask: 'names,phoneNumbers',
      });
      expect(createMock).toHaveBeenCalled();
    });

    it('Should NOT create contact if phone number already exists', async () => {
      const supabase = createMockSupabase({ value: 'true' }); // Toggle ON
      
      const searchMock = vi.fn().mockResolvedValue({
        data: { results: [{ person: { resourceName: 'people/456' } }] } // Existing contact found
      });
      const createMock = vi.fn();

      const googleClient = {
        people: {
          searchContacts: searchMock,
          createContact: createMock,
        }
      };

      const result = await syncCustomerToGoogleContacts(mockCustomer, supabase, googleClient);

      expect(result).toBe(true); // Considered a success because we don't want duplicates
      expect(searchMock).toHaveBeenCalled();
      expect(createMock).not.toHaveBeenCalled();
    });

    it('Should update the customer record\'s "synced_to_google" flag upon success', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
      
      const supabase = {
        from: vi.fn((table) => {
          if (table === 'settings') {
            return {
              select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: { value: 'true' } }) }) })
            };
          }
          if (table === 'customers') {
            return { update: mockUpdate };
          }
          return {};
        })
      };
      
      const googleClient = {
        people: {
          searchContacts: vi.fn().mockResolvedValue({ data: { results: [] } }),
          createContact: vi.fn().mockResolvedValue({ data: { resourceName: 'people/123' } }),
        }
      };

      const result = await syncCustomerToGoogleContacts(mockCustomer, supabase, googleClient);

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('customers');
      expect(mockUpdate).toHaveBeenCalledWith({ synced_to_google: true });
      expect(mockUpdateEq).toHaveBeenCalledWith('id', mockCustomer.id);
    });
  });
});
