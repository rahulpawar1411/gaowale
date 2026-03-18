import { getAuthHeaders } from '../utils/auth';

const API_BASE = '/api';

const authHeaders = () => ({ ...getAuthHeaders(), 'Content-Type': 'application/json' });

async function fetchJson(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    return { success: false, message: e?.message || 'Network error' };
  }

  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const text = await res.text();
  const looksJson = ct.includes('application/json') || ct.includes('+json') || (text && text.trim().startsWith('{')) || (text && text.trim().startsWith('['));

  if (looksJson) {
    try {
      return JSON.parse(text || 'null');
    } catch (e) {
      return {
        success: false,
        message: `Invalid JSON response (${res.status})`,
        raw: text?.slice(0, 300),
      };
    }
  }

  // Non-JSON response (HTML/text). Keep it user-visible instead of crashing.
  return {
    success: false,
    message: text?.trim() || res.statusText || `Request failed (${res.status})`,
    status: res.status,
  };
}

export const authApi = {
  login: (phone, password) =>
    fetchJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    }),
  me: () => fetchJson(`${API_BASE}/auth/me`, { headers: getAuthHeaders() }),
  verifyAdmin: (phone, password) =>
    fetchJson(`${API_BASE}/auth/verify-admin`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ phone, password }),
    }),
};

export const dashboardApi = {
  getStats: () =>
    fetchJson(`${API_BASE}/dashboard/stats`, { headers: getAuthHeaders() }),
};

export const itemsApi = {
  getAll: () => fetchJson(`${API_BASE}/items`, { headers: getAuthHeaders() }),
  getById: (id) => fetchJson(`${API_BASE}/items/${id}`, { headers: getAuthHeaders() }),
  create: (data) =>
    fetchJson(`${API_BASE}/items`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    fetchJson(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    fetchJson(`${API_BASE}/items/${id}`, { method: 'DELETE', headers: getAuthHeaders() }),
};

export const masterApi = {
  listTables: () => fetchJson(`${API_BASE}/master`, { headers: getAuthHeaders() }),
  getTable: (table) => fetchJson(`${API_BASE}/master/${table}`, { headers: getAuthHeaders() }),
  getById: (table, id) => fetchJson(`${API_BASE}/master/${table}/${id}`, { headers: getAuthHeaders() }),
  search: (table, params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v == null) return;
      const s = String(v).trim();
      if (!s) return;
      qs.set(k, s);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return fetchJson(`${API_BASE}/master/${table}/search${suffix}`, { headers: getAuthHeaders() });
  },
  lookup: (table, params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v == null) return;
      const s = String(v).trim();
      if (!s) return;
      qs.set(k, s);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return fetchJson(`${API_BASE}/master/${table}/lookup${suffix}`, { headers: getAuthHeaders() });
  },
  create: (table, data) =>
    fetchJson(`${API_BASE}/master/${table}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),
  update: (table, id, data) =>
    fetchJson(`${API_BASE}/master/${table}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),
  delete: (table, id) =>
    fetchJson(`${API_BASE}/master/${table}/${id}`, { method: 'DELETE', headers: getAuthHeaders() }),
};

export const registrationsApi = {
  management: {
    getAll: () => fetchJson(`${API_BASE}/registrations/management`, { headers: getAuthHeaders() }),
    getById: (id) => fetchJson(`${API_BASE}/registrations/management/${id}`, { headers: getAuthHeaders() }),
    create: (data) =>
      fetchJson(`${API_BASE}/registrations/management`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      fetchJson(`${API_BASE}/registrations/management/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    delete: (id) => fetchJson(`${API_BASE}/registrations/management/${id}`, { method: 'DELETE', headers: getAuthHeaders() }),
  },
  farmer: {
    getAll: () => fetchJson(`${API_BASE}/registrations/farmer`, { headers: getAuthHeaders() }),
    getById: (id) => fetchJson(`${API_BASE}/registrations/farmer/${id}`, { headers: getAuthHeaders() }),
    create: (data) =>
      fetchJson(`${API_BASE}/registrations/farmer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      fetchJson(`${API_BASE}/registrations/farmer/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    delete: (id) => fetchJson(`${API_BASE}/registrations/farmer/${id}`, { method: 'DELETE', headers: getAuthHeaders() }),
    deleteAll: () => fetchJson(`${API_BASE}/registrations/farmer/all`, { method: 'DELETE', headers: getAuthHeaders() }),
  },
  customer: {
    getAll: () => fetchJson(`${API_BASE}/registrations/customer`, { headers: getAuthHeaders() }),
    getById: (id) => fetchJson(`${API_BASE}/registrations/customer/${id}`, { headers: getAuthHeaders() }),
    create: (data) =>
      fetchJson(`${API_BASE}/registrations/customer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      fetchJson(`${API_BASE}/registrations/customer/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    delete: (id) => fetchJson(`${API_BASE}/registrations/customer/${id}`, { method: 'DELETE', headers: getAuthHeaders() }),
  },
  lakhpatiDidi: {
    getAll: () => fetchJson(`${API_BASE}/registrations/lakhpati-didi`, { headers: getAuthHeaders() }),
    getById: (id) => fetchJson(`${API_BASE}/registrations/lakhpati-didi/${id}`, { headers: getAuthHeaders() }),
    create: (data) =>
      fetchJson(`${API_BASE}/registrations/lakhpati-didi`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      fetchJson(`${API_BASE}/registrations/lakhpati-didi/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    delete: (id) => fetchJson(`${API_BASE}/registrations/lakhpati-didi/${id}`, { method: 'DELETE', headers: getAuthHeaders() }),
  },
};

export const filesApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson(`${API_BASE}/files`, {
      method: 'POST',
      headers: getAuthHeaders(), // let browser set Content-Type for multipart
      body: formData,
    });
  },
};

export const authorizationApi = {
  getSubAdmins: () =>
    fetchJson(`${API_BASE}/authorization/sub-admins`, {
      headers: getAuthHeaders(),
    }),
  createSubAdmin: (data) =>
    fetchJson(`${API_BASE}/authorization/sub-admins`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),
  getPermissions: (subAdminId) =>
    fetchJson(`${API_BASE}/authorization/sub-admins/${subAdminId}/permissions`, {
      headers: getAuthHeaders(),
    }),
  updatePermissions: (subAdminId, paths) =>
    fetchJson(`${API_BASE}/authorization/sub-admins/${subAdminId}/permissions`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ paths }),
    }),
  myPermissions: () =>
    fetchJson(`${API_BASE}/authorization/my-permissions`, {
      headers: getAuthHeaders(),
    }),
  deleteSubAdmin: (id) =>
    fetchJson(`${API_BASE}/authorization/sub-admins/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }),
};
