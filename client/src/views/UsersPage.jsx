import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationsApi } from '../services/api';

const TYPE_LABELS = {
  management: 'Management',
  farmer: 'Farmer',
  customer: 'Customer',
  lakhpatiDidi: 'Lakhpati Didi',
};

const FIELD_LABELS = {
  id: 'ID',
  name: 'Name',
  contact: 'Contact',
  mobile_number: 'Mobile Number',
  whatsapp_number: 'WhatsApp Number',
  email: 'Email',
  state_name: 'State',
  village_name: 'Village',
  created_at: 'Created At',
  state_id: 'State',
  state_division_id: 'State Division',
  state_sub_division_id: 'Taluka Division',
  region_id: 'Region',
  region_name: 'Region',
  zone_id: 'Zone',
  zone_name: 'Zone',
  vidhan_sabha_id: 'Vidhan Sabha',
  vidhan_sabha_name: 'Vidhan Sabha',
  taluka_id: 'Taluka',
  taluka_name: 'Taluka',
  block_name: 'Block',
  block_id: 'Panchayat',
  circle_id: 'Circle',
  circle_name: 'Circle',
  gram_panchayat_id: 'Gram Panchayat',
  gram_panchayat_name: 'Gram Panchayat',
  business_position_name: 'Business Position',
};

function niceFieldLabel(key) {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/_id$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') return '-';

  // Format ISO date strings like 2025-12-30T18:30:00.000Z to dd-mm-yyyy
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
  }

  return String(value);
}

function buildRow(type, row) {
  const name = row.name || row.first_name || '';
  const contact = row.contact || row.mobile_number || row.whatsapp_number || '';
  return {
    id: `${type}-${row.id}`,
    rawId: row.id,
    type,
    name,
    contact,
    state: row.state_name || '',
    createdAt: row.created_at || '',
    raw: row,
  };
}

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [mgmt, farmer, customer, lakhpati] = await Promise.all([
          registrationsApi.management.getAll(),
          registrationsApi.farmer.getAll(),
          registrationsApi.customer.getAll(),
          registrationsApi.lakhpatiDidi.getAll(),
        ]);
        if (cancelled) return;
        const all = [];
        if (mgmt?.success && Array.isArray(mgmt.data)) {
          all.push(...mgmt.data.map((r) => buildRow('management', r)));
        }
        if (farmer?.success && Array.isArray(farmer.data)) {
          all.push(...farmer.data.map((r) => buildRow('farmer', r)));
        }
        if (customer?.success && Array.isArray(customer.data)) {
          all.push(...customer.data.map((r) => buildRow('customer', r)));
        }
        if (lakhpati?.success && Array.isArray(lakhpati.data)) {
          all.push(...lakhpati.data.map((r) => buildRow('lakhpatiDidi', r)));
        }
        // Sort by createdAt (most recent first)
        all.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        setRows(all);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load users');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleView = (row) => {
    navigate(`/user-details/${row.type}/${row.rawId}`);
  };

  const filteredRows = rows.filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const raw = r.raw || {};
    const aadhar =
      raw.aadhar_card ||
      raw.aadhar_card_path ||
      '';
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.contact && String(r.contact).toLowerCase().includes(q)) ||
      (aadhar && String(aadhar).toLowerCase().includes(q))
    );
  });

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>User Details</h1>
        <p style={styles.subtitle}>
          All registered users across Management, Farmer, Customer and Lakhpati Didi.
        </p>

        <div style={styles.filtersRow}>
          <label style={styles.filterLabel}>
            User type:
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All</option>
              <option value="management">Management</option>
              <option value="farmer">Farmer</option>
              <option value="customer">Customer</option>
              <option value="lakhpatiDidi">Lakhpati Didi</option>
            </select>
          </label>
          <input
            type="text"
            placeholder="Search by name, number or Aadhar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {loading ? (
          <p style={styles.muted}>Loading users…</p>
        ) : filteredRows.length === 0 ? (
          <p style={styles.muted}>No users found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Contact</th>
                  <th style={styles.th}>State</th>
                  <th style={styles.th}>Created At</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} style={styles.tr}>
                    <td style={styles.td}>{TYPE_LABELS[row.type] || row.type}</td>
                    <td style={styles.td}>{row.name || '-'}</td>
                    <td style={styles.td}>{row.contact || '-'}</td>
                    <td style={styles.td}>{row.state || '-'}</td>
                    <td style={styles.td}>{row.createdAt ? String(row.createdAt).slice(0, 10) : '-'}</td>
                    <td style={styles.td}>
                      <button type="button" style={styles.viewBtn} onClick={() => handleView(row)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    background: '#f2f2f5',
  },
  card: {
    width: '100%',
    maxWidth: 1040,
    background: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    padding: '1.25rem 1.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  title: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 700,
    textAlign: 'center',
    color: '#8B1538',
  },
  subtitle: {
    margin: '0.15rem 0 0.75rem',
    fontSize: '0.95rem',
    textAlign: 'center',
    color: '#555',
  },
  filtersRow: {
    marginTop: '0.75rem',
    marginBottom: '0.25rem',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '0.85rem',
    color: '#374151',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  filterSelect: {
    padding: '0.25rem 0.5rem',
    borderRadius: 4,
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
  },
  searchInput: {
    padding: '0.3rem 0.6rem',
    borderRadius: 4,
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
    minWidth: 200,
  },
  tableWrapper: {
    marginTop: '1rem',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    background: '#fff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.6rem 0.75rem',
    background: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '0.55rem 0.75rem',
    verticalAlign: 'top',
  },
  viewBtn: {
    padding: '0.3rem 0.7rem',
    borderRadius: 4,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  detailCell: {
    padding: '0.75rem',
  },
  error: {
    padding: '0.5rem 0.75rem',
    borderRadius: 4,
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    fontSize: '0.9rem',
  },
  muted: {
    marginTop: '0.5rem',
    color: '#6b7280',
  },
};

