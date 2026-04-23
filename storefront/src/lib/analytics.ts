import { supabase } from './supabase';

export type AnalyticsEventType = 'click' | 'conversion' | 'page_view' | 'view';
export type AnalyticsEventName = 'model_click' | 'call_now' | 'get_quote' | 'navigate' | 'repair_view' | 'book_repair';

interface TrackEventParams {
  eventName: AnalyticsEventName;
  eventType?: AnalyticsEventType;
  modelName?: string;
  repairCategory?: string;
  metadata?: Record<string, any>;
}

let cachedCity: string | null = null;
let cityPromise: Promise<string | null> | null = null;

/**
 * Get the user's city via a lightweight API.
 * Uses caching to avoid redundant lookups.
 */
async function getCity() {
  if (typeof window === 'undefined') return null;
  if (cachedCity) return cachedCity;
  
  if (!cityPromise) {
    cityPromise = fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        cachedCity = data.city || null;
        return cachedCity;
      })
      .catch(() => {
        cachedCity = null;
        return null;
      });
  }
  return cityPromise;
}

/**
 * Get the user's device type.
 */
function getDeviceType() {
  if (typeof window === 'undefined') return 'Server';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

/**
 * Get or create a session ID for the user.
 * This helps us track unique users without personal data.
 */
function getSessionId() {
  if (typeof window === 'undefined') return 'server-side';
  
  try {
    let sessionId = localStorage.getItem('repair_session_id');
    if (!sessionId) {
      sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      localStorage.setItem('repair_session_id', sessionId);
    }
    return sessionId;
  } catch (e) {
    return 'storage-blocked';
  }
}

/**
 * Track a custom event to Supabase.
 */
export async function trackEvent({
  eventName,
  eventType = 'click',
  modelName,
  repairCategory,
  metadata = {},
}: TrackEventParams) {
  try {
    console.log(`[analytics] Attempting to track event: ${eventName}`, { eventType, modelName, repairCategory });
    
    const city = await getCity();
    const deviceType = getDeviceType();
    
    const { data, error } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_name: eventName,
      model_name: modelName,
      session_id: getSessionId(),
      city: city,
      device_type: deviceType,
      url: typeof window !== 'undefined' ? window.location.href : '',
      metadata: {
        ...metadata,
        repairCategory,
        path: typeof window !== 'undefined' ? window.location.pathname : '',
      },
      // Region/Country could be added too if needed
    }).select();

    if (error) {
      console.error('[analytics] Supabase insertion failed:', error);
    } else {
      console.log('[analytics] Event tracked successfully:', data);
    }
  } catch (err) {
    console.error('[analytics] Unexpected error in trackEvent:', err);
  }
}

/**
 * Convenience hooks for the high-value triggers
 */
export const analytics = {
  trackModelClick: (modelName: string) => 
    trackEvent({ eventName: 'model_click', modelName }),
  
  trackCallNow: (modelName?: string, repairCategory?: string) => 
    trackEvent({ eventName: 'call_now', eventType: 'conversion', modelName, repairCategory }),
  
  trackGetQuote: (modelName?: string, repairCategory?: string) => 
    trackEvent({ eventName: 'get_quote', eventType: 'conversion', modelName, repairCategory }),
  
  trackNavigate: () => 
    trackEvent({ eventName: 'navigate', eventType: 'conversion' }),

  trackRepairView: (modelName: string, repairCategory: string) =>
    trackEvent({ eventName: 'repair_view', eventType: 'view', modelName, repairCategory }),

  trackBookRepair: (modelName: string, repairCategory: string) =>
    trackEvent({ eventName: 'book_repair', eventType: 'conversion', modelName, repairCategory }),
};
