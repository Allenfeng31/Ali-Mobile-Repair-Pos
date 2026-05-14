const { google } = require('googleapis');

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
    const isEnabled = await isGoogleContactsSyncEnabled(supabase);
    if (!isEnabled) {
      return false;
    }

    const client = googleClient || getGoogleContactsClient();
    if (!client || !client.people) {
      console.warn('[Google Contacts] Client not configured.');
      return false;
    }

    // 1. Search for existing contacts by phone number
    const searchResponse = await client.people.searchContacts({
      query: customer.phone,
      readMask: 'names,phoneNumbers',
    });

    const results = searchResponse.data.results || [];
    
    // 2. Only add if the number doesn't exist
    if (results.length === 0) {
      // Add new contact
      await client.people.createContact({
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
      });
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
    console.error('[Google Contacts] Error syncing customer:', error);
    return false;
  }
}

module.exports = {
  isGoogleContactsSyncEnabled,
  getGoogleContactsClient,
  syncCustomerToGoogleContacts
};
