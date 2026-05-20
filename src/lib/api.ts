import { getApiBaseUrl, getApiDiagnostics } from './apiBase';

const API_URL = getApiBaseUrl();

const logApiFailure = (message: string, details: Record<string, unknown>) => {
  console.error(`[POS API] ${message}`, {
    ...getApiDiagnostics(),
    ...details,
  });
};

const handleResponse = async (res: Response) => {
  const rawBody = await res.text();
  let data: any = null;

  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch (parseError) {
    logApiFailure('Response body was not valid JSON.', {
      url: res.url,
      status: res.status,
      statusText: res.statusText,
      bodyPreview: rawBody.slice(0, 500),
      parseError,
    });
  }

  if (!res.ok) {
    logApiFailure('HTTP request failed.', {
      url: res.url,
      status: res.status,
      statusText: res.statusText,
      responseBody: data || rawBody.slice(0, 1000),
    });

    throw new Error(data?.error || data?.message || `API Request Failed (${res.status} ${res.statusText})`);
  }

  if (data === null) {
    logApiFailure('Successful response had no parseable JSON payload.', {
      url: res.url,
      status: res.status,
      statusText: res.statusText,
      bodyPreview: rawBody.slice(0, 500),
    });
  }

  return data;
};

export const api = {
  // Authentication
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  // Inventory
  getInventory: async () => {
    const res = await fetch(`${API_URL}/inventory`);
    return handleResponse(res);
  },
  createInventoryItem: async (item: any) => {
    const res = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse(res);
  },
  updateInventoryItem: async (id: number | string, item: any) => {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse(res);
  },
  deleteInventoryItem: async (id: number | string) => {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
  bulkCreateInventoryItems: async (items: any[]) => {
    const res = await fetch(`${API_URL}/inventory/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    return handleResponse(res);
  },

  // Orders
  getOrders: async () => {
    const res = await fetch(`${API_URL}/orders`);
    return handleResponse(res);
  },
  createOrder: async (order: any) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return handleResponse(res);
  },

  // Customers
  getCustomers: async () => {
    const res = await fetch(`${API_URL}/customers`);
    return handleResponse(res);
  },
  createCustomer: async (customer: any) => {
    const res = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    return handleResponse(res);
  },
  updateCustomer: async (id: string, customer: any) => {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    return handleResponse(res);
  },
  deleteCustomer: async (id: string) => {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Repairs
  createRepair: async (repair: any) => {
    const res = await fetch(`${API_URL}/repairs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repair),
    });
    return handleResponse(res);
  },
  updateRepair: async (id: string, repair: any) => {
    const res = await fetch(`${API_URL}/repairs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repair),
    });
    return handleResponse(res);
  },
  deleteRepair: async (id: string) => {
    const res = await fetch(`${API_URL}/repairs/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
  trackRepair: async (id: string) => {
    const res = await fetch(`${API_URL}/repairs/track/${id}`);
    return handleResponse(res);
  },

  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_URL}/settings`);
    return handleResponse(res);
  },
  updateSetting: async (key: string, value: string) => {
    const res = await fetch(`${API_URL}/settings/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    return handleResponse(res);
  },
  
  // Users
  updateUser: async (id: number | string, data: { username?: string, password?: string }) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  
  // System
  getDebugInfo: () => getApiDiagnostics(),
  getIp: async () => {
    const url = `${API_URL}/ip`;

    try {
      const res = await fetch(url);
      return handleResponse(res);
    } catch (error) {
      logApiFailure('Health check network/request failure.', {
        url,
        error,
      });
      throw error;
    }
  },

  // SMS Notifications
  sendSms: async (to: string, type: 'dropoff' | 'completed' | 'review' | 'partArrived', extras?: { customerName?: string; deviceModel?: string; customerId?: string }) => {
    try {
      const res = await fetch(`${API_URL}/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, type, ...extras }),
      });
      return res.json();
    } catch (err) {
      // SMS is fire-and-forget — never block the main flow
      console.warn('[SMS] Failed to send SMS:', err);
      return { ok: false };
    }
  },

  // Blog AI
  generateBlog: async (topic: string) => {
    const res = await fetch(`${API_URL}/blog/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });
    return handleResponse(res);
  },
  confirmBlog: async (slug: string, content: string, image: string) => {
    const res = await fetch(`${API_URL}/blog/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, content, image }),
    });
    return handleResponse(res);
  },

  // PermissionsFallback
  getPermissions: async (userId: string) => {
    const res = await fetch(`${API_URL}/admin/permissions/${userId}`);
    return handleResponse(res);
  },

  // Announcements
  getAnnouncements: async () => {
    const res = await fetch(`${API_URL}/announcements`);
    return handleResponse(res);
  },
  createAnnouncement: async (announcement: { message: string, is_active: boolean, display_order: number }) => {
    const res = await fetch(`${API_URL}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcement),
    });
    return handleResponse(res);
  },
  updateAnnouncement: async (id: string, announcement: Partial<{ message: string, is_active: boolean, display_order: number }>) => {
    const res = await fetch(`${API_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcement),
    });
    return handleResponse(res);
  },
  deleteAnnouncement: async (id: string) => {
    const res = await fetch(`${API_URL}/announcements/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Upsells
  getUpsells: async () => {
    const res = await fetch(`${API_URL}/upsells`);
    return handleResponse(res);
  },

  // Quality Tiers
  getQualityTiers: async () => {
    const res = await fetch(`${API_URL}/quality-tiers`);
    return handleResponse(res);
  },
  createQualityTier: async (tier: { name: string, description: string }) => {
    const res = await fetch(`${API_URL}/quality-tiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tier),
    });
    return handleResponse(res);
  },
  updateQualityTier: async (id: string, tier: Partial<{ name: string, description: string }>) => {
    const res = await fetch(`${API_URL}/quality-tiers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tier),
    });
    return handleResponse(res);
  },
  deleteQualityTier: async (id: string) => {
    const res = await fetch(`${API_URL}/quality-tiers/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Push Notifications
  getVapidPublicKey: async () => {
    const res = await fetch(`${API_URL}/push/vapid-public-key`);
    return handleResponse(res);
  },
  subscribePush: async (subscription: PushSubscriptionJSON) => {
    const res = await fetch(`${API_URL}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
    return handleResponse(res);
  },
  unsubscribePush: async (endpoint: string) => {
    const res = await fetch(`${API_URL}/push/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    });
    return handleResponse(res);
  },
  testPush: async () => {
    const res = await fetch(`${API_URL}/push/test`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Chat
  createChatSession: async (token: string) => {
    const res = await fetch(`${API_URL}/chat/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return handleResponse(res);
  },
  sendChatMessage: async (token: string, content: string) => {
    const res = await fetch(`${API_URL}/chat/session/${token}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    return handleResponse(res);
  },
};
