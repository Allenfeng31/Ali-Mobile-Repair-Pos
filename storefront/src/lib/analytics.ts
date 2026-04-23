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

/**
 * Get the user's city via a lightweight API.
 * This helps populate the "Top Locations" leaderboard.
 */
async function getCity() {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return data.city || null;
  } catch (e) {
    return null;
  }
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
    const city = await getCity();
    
    const { error } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_name: eventName,
      model_name: modelName,
      session_id: getSessionId(),
      city: city,
      url: typeof window !== 'undefined' ? window.location.href : '',
      metadata: {
        ...metadata,
        repairCategory,
        path: typeof window !== 'undefined' ? window.location.pathname : '',
      },
      // Region/Country could be added too if needed
    });

    if (error) {
      console.error('[analytics] Error logging event:', error);
    }
  } catch (err) {
    console.error('[analytics] Unexpected error:', err);
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
