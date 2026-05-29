const { google } = require('googleapis');

const GOOGLE_CONTACTS_TIMEOUT_MS = 3000;

async function isGoogleContactsSyncEnabled(supabase) {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'google_contacts_sync_enabled')
    .maybeSingle();

  if (error || !data) return false;
  return data.value === 'true' || data.value === true;
}

function getGoogleContactsClient() {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return null;
  }

  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  return google.people({ version: 'v1', auth: oAuth2Client });
}

async function syncCustomerToGoogleContacts(customer, supabase, googleClient = null) {
  try {
    console.log(`[Google Contacts] Starting sync for customer ${customer.name} (${customer.phone})`);
    const isEnabled = await isGoogleContactsSyncEnabled(supabase);
    console.log(`[Google Contacts] Sync enabled setting in DB is: ${isEnabled}`);
    if (!isEnabled) {
      return false;
    }

    const client = googleClient || getGoogleContactsClient();
    if (!client || !client.people) {
      console.warn('[Google Contacts] Client not configured.');
      return false;
    }

    // 1. Search for existing contacts by phone number
    console.log(`[Google Contacts] Searching for existing contact with phone: ${customer.phone}`);
    const searchResponse = await client.people.searchContacts(
      {
        query: customer.phone,
        readMask: 'names,phoneNumbers',
      },
      { timeout: GOOGLE_CONTACTS_TIMEOUT_MS }
    );

    const results = searchResponse.data.results || [];
    
    // 2. Only add if the number doesn't exist
    if (results.length === 0) {
      console.log(`[Google Contacts] No existing contact found. Creating new contact...`);
      // Add new contact
      await client.people.createContact(
        {
          requestBody: {
            names: [
              {
                givenName: customer.name || 'Unknown',
              },
            ],
            phoneNumbers: [
              {
                value: customer.phone,
                type: 'mobile',
              },
            ],
          },
        },
        { timeout: GOOGLE_CONTACTS_TIMEOUT_MS }
      );
      console.log(`[Google Contacts] Successfully synced customer ${customer.name}`);
    } else {
      console.log(`[Google Contacts] Customer ${customer.name} (${customer.phone}) already exists. Skipping creation.`);
    }

    // 3. Update the customer record's 'synced_to_google' flag upon success
    if (customer.id && supabase) {
      const { error } = await supabase
        .from('customers')
        .update({ synced_to_google: true })
        .eq('id', customer.id);
        
      if (error) {
        console.error('[Google Contacts] Error updating customer status:', error);
      }
    }

    return true;
  } catch (error) {
    console.error('[Google Contacts] Error syncing customer:', error.message);
    if (error.response && error.response.data) {
      console.error('[Google Contacts] API Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}
/**
 * Schedule a non-blocking background sync with Outbox pattern.
 * Safely updates failed_sync_logs status.
 */
async function scheduleGoogleContactsSync({ customer, supabase, logId }) {
  try {
    const success = await syncCustomerToGoogleContacts(customer, supabase);
    
    if (success && logId && supabase) {
      await supabase
        .from('failed_sync_logs')
        .update({ status: 'synced', updated_at: new Date().toISOString() })
        .eq('id', logId);
    } else if (!success && logId && supabase) {
      await supabase
        .from('failed_sync_logs')
        .update({ 
          status: 'failed', 
          error_reason: 'Sync returned false (maybe timeout, maybe API error or disabled)',
          updated_at: new Date().toISOString() 
        })
        .eq('id', logId);
    }
  } catch (err) {
    console.error('[Google Contacts] Uncaught error in scheduleGoogleContactsSync:', err.message);
    if (logId && supabase) {
      await supabase
        .from('failed_sync_logs')
        .update({ 
          status: 'failed', 
          error_reason: err.message,
          updated_at: new Date().toISOString() 
        })
        .eq('id', logId);
    }
  }
}

module.exports = {
  isGoogleContactsSyncEnabled,
  getGoogleContactsClient,
  syncCustomerToGoogleContacts,
  scheduleGoogleContactsSync
};
