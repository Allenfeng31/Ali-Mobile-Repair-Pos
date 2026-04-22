import { supabase } from './supabase';

export type AnalyticsEventType = 'click' | 'conversion' | 'page_view';
export type AnalyticsEventName = 'model_click' | 'call_now' | 'get_quote' | 'navigate';

interface TrackEventParams {
  eventName: AnalyticsEventName;
  eventType?: AnalyticsEventType;
  modelName?: string;
  metadata?: Record<string, any>;
}

/**
 * Get or create a session ID for the user.
 * This helps us track unique users without personal data.
 */
function getSessionId() {
  if (typeof window === 'undefined') return 'server-side';
  
  let sessionId = localStorage.getItem('repair_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('repair_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Track a custom event to Supabase.
 */
export async function trackEvent({
  eventName,
  eventType = 'click',
  modelName,
  metadata = {},
}: TrackEventParams) {
  try {
    const { error } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_name: eventName,
      model_name: modelName,
      session_id: getSessionId(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      metadata: {
        ...metadata,
        path: typeof window !== 'undefined' ? window.location.pathname : '',
      },
      // City/Region/Country will be added by Vercel Analytics mainly,
      // but we could use a geolocation API here if needed.
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
  
  trackCallNow: () => 
    trackEvent({ eventName: 'call_now', eventType: 'conversion' }),
  
  trackGetQuote: (modelName?: string) => 
    trackEvent({ eventName: 'get_quote', eventType: 'conversion', modelName }),
  
  trackNavigate: () => 
    trackEvent({ eventName: 'navigate', eventType: 'conversion' }),
};
