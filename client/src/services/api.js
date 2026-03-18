import { getAuthHeaders } from '../utils/auth';

const API_BASE = '/api';

const authHeaders = () => ({ ...getAuthHeaders(), 'Content-Type': 'application/json' });

export const authApi = {
  login: (phone, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    }).then((r) => r.json()),
  me: () => fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() }).then((r) => r.json()),
  verifyAdmin: (phone, password) =>
    fetch(`${API_BASE}/auth/verify-admin`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ phone, password }),
    }).then((r) => r.json()),
};

export const dashboardApi = {
  getStats: () =>
    fetch(`${API_BASE}/dashboard/stats`, { headers: getAuthHeaders() }).then((r) => r.json()),
};

export const itemsApi = {
  getAll: () => fetch(`${API_BASE}/items`, { headers: getAuthHeaders() }).then((r) => r.json()),
  getById: (id) => fetch(`${API_BASE}/items/${id}`, { headers: getAuthHeaders() }).then((r) => r.json()),
  create: (data) =>
    fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  update: (id, data) =>
    fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  delete: (id) =>
    fetch(`${API_BASE}/items/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then((r) => r.json()),
};

export const masterApi = {
  listTables: () => fetch(`${API_BASE}/master`, { headers: getAuthHeaders() }).then((r) => r.json()),
  getTable: (table) => fetch(`${API_BASE}/master/${table}`, { headers: getAuthHeaders() }).then((r) => r.json()),
  getById: (table, id) => fetch(`${API_BASE}/master/${table}/${id}`, { headers: getAuthHeaders() }).then((r) => r.json()),
  search: (table, params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v == null) return;
      const s = String(v).trim();
      if (!s) return;
      qs.set(k, s);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return fetch(`${API_BASE}/master/${table}/search${suffix}`, { headers: getAuthHeaders() }).then((r) =>
      r.json()
    );
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
    return fetch(`${API_BASE}/master/${table}/lookup${suffix}`, { headers: getAuthHeaders() }).then((r) =>
      r.json()
    );
  },
  create: (table, data) =>
    fetch(`${API_BASE}/master/${table}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  update: (table, id, data) =>
    fetch(`${API_BASE}/master/${table}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  delete: (table, id) =>
    fetch(`${API_BASE}/master/${table}/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then((r) => r.json()),
};

export const registrationsApi = {
  management: {
    getAll: () => fetch(`${API_BASE}/registrations/management`, { headers: getAuthHeaders() }).then((r) => r.json()),
    getById: (id) => fetch(`${API_BASE}/registrations/management/${id}`, { headers: getAuthHeaders() }).then((r) => r.json()),
    create: (data) =>
      fetch(`${API_BASE}/registrations/management`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    update: (id, data) =>
      fetch(`${API_BASE}/registrations/management/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    delete: (id) => fetch(`${API_BASE}/registrations/management/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then((r) => r.json()),
  },
  farmer: {
    getAll: () => fetch(`${API_BASE}/registrations/farmer`, { headers: getAuthHeaders() }).then((r) => r.json()),
    getById: (id) => fetch(`${API_BASE}/registrations/farmer/${id}`, { headers: getAuthHeaders() }).then((r) => r.json()),
    create: (data) =>
      fetch(`${API_BASE}/registrations/farmer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    update: (id, data) =>
      fetch(`${API_BASE}/registrations/farmer/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    delete: (id) => fetch(`${API_BASE}/registrations/farmer/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then((r) => r.json()),
    deleteAll: () => fetch(`${API_BASE}/registrations/farmer/all`, { method: 'DELETE', headers: getAuthHeaders() }).then((r) => r.json()),
  },
  customer: {
    getAll: () => fetch(`${API_BASE}/registrations/customer`, { headers: getAuthHeaders() }).then((r) => r.json()),
    getById: (id) => fetch(`${API_BASE}/registrations/customer/${id}`, { headers: getAuthHeaders() }).then((r) => r.json()),
    create: (data) =>
      fetch(`${API_BASE}/registrations/customer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    update: (id, data) =>
      fetch(`${API_BASE}/registrations/customer/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    delete: (id) => fetch(`${API_BASE}/registrations/customer/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then((r) => r.json()),
  },
  lakhpatiDidi: {
    getAll: () => fetch(`${API_BASE}/registrations/lakhpati-didi`, { headers: getAuthHeaders() }).then((r) => r.json()),
    getById: (id) => fetch(`${API_BASE}/registrations/lakhpati-didi/${id}`, { headers: getAuthHeaders() }).then((r) => r.json()),
    create: (data) =>
      fetch(`${API_BASE}/registrations/lakhpati-didi`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    update: (id, data) =>
      fetch(`${API_BASE}/registrations/lakhpati-didi/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    delete: (id) => fetch(`${API_BASE}/registrations/lakhpati-didi/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then((r) => r.json()),
  },
};

export const filesApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/files`, {
      method: 'POST',
      headers: getAuthHeaders(), // let browser set Content-Type for multipart
      body: formData,
    }).then((r) => r.json());
  },
};

export const authorizationApi = {
  getSubAdmins: () =>
    fetch(`${API_BASE}/authorization/sub-admins`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),
  createSubAdmin: (data) =>
    fetch(`${API_BASE}/authorization/sub-admins`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  getPermissions: (subAdminId) =>
    fetch(`${API_BASE}/authorization/sub-admins/${subAdminId}/permissions`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),
  updatePermissions: (subAdminId, paths) =>
    fetch(`${API_BASE}/authorization/sub-admins/${subAdminId}/permissions`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ paths }),
    }).then((r) => r.json()),
  myPermissions: () =>
    fetch(`${API_BASE}/authorization/my-permissions`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),
  deleteSubAdmin: (id) =>
    fetch(`${API_BASE}/authorization/sub-admins/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),
};
