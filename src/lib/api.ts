const getApiUrl = () => {
  // @ts-ignore
  const env = import.meta.env;
  
  // If compiled securely onto Vercel servers
  if (env?.PROD) {
    return '/api';
  }
  
  // If accessing from a mobile device or another computer on the local network
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:3001/api`;
  }
  
  return env?.VITE_API_URL || 'http://localhost:3001/api';
};

const API_URL = getApiUrl();

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API Request Failed');
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
  getIp: async () => {
    const res = await fetch(`${API_URL}/ip`);
    return handleResponse(res);
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
};
