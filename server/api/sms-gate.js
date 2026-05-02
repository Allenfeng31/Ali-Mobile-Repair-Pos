/**
 * SMS Gate — determines whether SMS alerts should be sent.
 * Extracted as a pure module for testability and single-responsibility.
 *
 * The setting is stored in the `settings` table as:
 *   key: 'sms_alerts_enabled', value: 'true' | 'false'
 *
 * Default behavior: SMS is ENABLED if no setting exists (backwards compatible).
 */

/**
 * Check if SMS alerts are enabled by querying the settings table.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<boolean>}
 */
async function isSmsAlertEnabled(supabase) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'sms_alerts_enabled')
      .maybeSingle();

    if (error) {
      console.error('[SMS Gate] Failed to read sms_alerts_enabled:', error.message);
      // Fail-open: if we can't read, default to enabled (don't silently break SMS)
      return true;
    }

    // No row found → default to enabled (backwards compatible)
    if (!data) return true;

    // Explicit 'false' string → disabled
    return data.value !== 'false';
  } catch (err) {
    console.error('[SMS Gate] Unexpected error:', err.message);
    return true; // fail-open
  }
}

module.exports = { isSmsAlertEnabled };
