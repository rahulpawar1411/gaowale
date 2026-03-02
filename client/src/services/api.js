const API_BASE = '/api';

export const itemsApi = {
  getAll: () => fetch(`${API_BASE}/items`).then((r) => r.json()),
  getById: (id) => fetch(`${API_BASE}/items/${id}`).then((r) => r.json()),
  create: (data) =>
    fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  update: (id, data) =>
    fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  delete: (id) =>
    fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' }).then((r) => r.json()),
};

export const masterApi = {
  listTables: () => fetch(`${API_BASE}/master`).then((r) => r.json()),
  getTable: (table) => fetch(`${API_BASE}/master/${table}`).then((r) => r.json()),
  getById: (table, id) => fetch(`${API_BASE}/master/${table}/${id}`).then((r) => r.json()),
  create: (table, data) =>
    fetch(`${API_BASE}/master/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  update: (table, id, data) =>
    fetch(`${API_BASE}/master/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  delete: (table, id) =>
    fetch(`${API_BASE}/master/${table}/${id}`, { method: 'DELETE' }).then((r) => r.json()),
};

export const registrationsApi = {
  management: {
    getAll: () => fetch(`${API_BASE}/registrations/management`).then((r) => r.json()),
    getById: (id) => fetch(`${API_BASE}/registrations/management/${id}`).then((r) => r.json()),
    create: (data) =>
      fetch(`${API_BASE}/registrations/management`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    update: (id, data) =>
      fetch(`${API_BASE}/registrations/management/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    delete: (id) => fetch(`${API_BASE}/registrations/management/${id}`, { method: 'DELETE' }).then((r) => r.json()),
  },
  farmer: {
    getAll: () => fetch(`${API_BASE}/registrations/farmer`).then((r) => r.json()),
    getById: (id) => fetch(`${API_BASE}/registrations/farmer/${id}`).then((r) => r.json()),
    create: (data) =>
      fetch(`${API_BASE}/registrations/farmer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    update: (id, data) =>
      fetch(`${API_BASE}/registrations/farmer/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    delete: (id) => fetch(`${API_BASE}/registrations/farmer/${id}`, { method: 'DELETE' }).then((r) => r.json()),
  },
  customer: {
    getAll: () => fetch(`${API_BASE}/registrations/customer`).then((r) => r.json()),
    getById: (id) => fetch(`${API_BASE}/registrations/customer/${id}`).then((r) => r.json()),
    create: (data) =>
      fetch(`${API_BASE}/registrations/customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    update: (id, data) =>
      fetch(`${API_BASE}/registrations/customer/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    delete: (id) => fetch(`${API_BASE}/registrations/customer/${id}`, { method: 'DELETE' }).then((r) => r.json()),
  },
  lakhpatiDidi: {
    getAll: () => fetch(`${API_BASE}/registrations/lakhpati-didi`).then((r) => r.json()),
    getById: (id) => fetch(`${API_BASE}/registrations/lakhpati-didi/${id}`).then((r) => r.json()),
    create: (data) =>
      fetch(`${API_BASE}/registrations/lakhpati-didi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    update: (id, data) =>
      fetch(`${API_BASE}/registrations/lakhpati-didi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    delete: (id) => fetch(`${API_BASE}/registrations/lakhpati-didi/${id}`, { method: 'DELETE' }).then((r) => r.json()),
  },
};
