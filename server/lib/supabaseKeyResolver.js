function resolveServerSupabaseKey(environment = process.env) {
  const key = environment.SUPABASE_SECRET_KEY || environment.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error('Server database credentials are not configured.');
  }

  return key;
}

module.exports = { resolveServerSupabaseKey };
