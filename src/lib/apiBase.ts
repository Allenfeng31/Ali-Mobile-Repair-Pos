const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const isSafeBrowserApiUrl = (value: string) =>
  value.startsWith('/') || value.startsWith('https://');

export const getApiBaseUrl = () => {
  // @ts-ignore - Vite injects import.meta.env at build time.
  const env = import.meta.env;
  const configuredUrl = typeof env?.VITE_API_URL === 'string'
    ? trimTrailingSlash(env.VITE_API_URL.trim())
    : '';

  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    // Production and HTTPS pages must never call a plain HTTP API. Browsers block
    // that as mixed content, which makes the POS look disconnected on devices.
    if (env?.PROD || protocol === 'https:') {
      return configuredUrl && isSafeBrowserApiUrl(configuredUrl) ? configuredUrl : '/api';
    }

    if (configuredUrl) return configuredUrl;
    if (!isLocalhost) return `http://${hostname}:3001/api`;
  }

  return configuredUrl || 'http://localhost:3001/api';
};

export const getApiDiagnostics = () => {
  // @ts-ignore - Vite injects import.meta.env at build time.
  const env = import.meta.env;
  const apiUrl = getApiBaseUrl();

  return {
    apiUrl,
    mode: env?.MODE,
    prod: Boolean(env?.PROD),
    viteApiUrl: env?.VITE_API_URL || null,
    browserOrigin: typeof window !== 'undefined' ? window.location.origin : null,
    browserHostname: typeof window !== 'undefined' ? window.location.hostname : null,
    browserProtocol: typeof window !== 'undefined' ? window.location.protocol : null,
  };
};
