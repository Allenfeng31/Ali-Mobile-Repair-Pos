export function getValidatedGoogleAnalyticsId(
  env: string | undefined,
  measurementId: string | undefined,
): string | null {
  if (env !== 'production') {
    return null;
  }

  if (!measurementId || typeof measurementId !== 'string') {
    return null;
  }

  // Strictly match G- followed by uppercase alphanumeric characters
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
    return null;
  }

  return measurementId;
}
