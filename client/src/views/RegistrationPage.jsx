import React, { useState, useEffect } from 'react';
import { registrationsApi } from '../services/api';

const REGISTRATION_APIS = {
  management: registrationsApi.management,
  farmer: registrationsApi.farmer,
  customer: registrationsApi.customer,
  lakhpatiDidi: registrationsApi.lakhpatiDidi,
};

export default function RegistrationPage({ type, title, lang = 'en' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type || !REGISTRATION_APIS[type]) return;
    const regApi = REGISTRATION_APIS[type];
    setLoading(true);
    setError(null);
    regApi
      .getAll()
      .then((res) => {
        if (res.success) setData(res.data || []);
        else setError(res.message || 'Failed to load');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type]);

  if (!type) return null;

  const heading =
    type === 'management'
      ? lang === 'mr'
        ? 'व्यवस्थापन नोंदणी यादी'
        : 'Management Registration List'
      : type === 'farmer'
        ? lang === 'mr'
          ? 'शेतकरी नोंदणी यादी'
          : 'Farmer Registration List'
        : type === 'customer'
          ? lang === 'mr'
            ? 'ग्राहक नोंदणी यादी'
            : 'Customer Registration List'
          : type === 'lakhpatiDidi'
            ? lang === 'mr'
              ? 'लखपती दीदी नोंदणी यादी'
              : 'Lakhpati Didi Registration List'
            : title || '';

  const renderTable = () => {
    if (!data.length) return <p style={styles.muted}>No records.</p>;
    const cols = Object.keys(data[0]).filter((k) => k !== 'created_at');
    return (
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c} style={styles.th}>
                  {c.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id != null ? row.id : i}>
                {cols.map((c) => (
                  <td key={c} style={styles.td}>
                    {row[c] != null ? String(row[c]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>{heading}</h1>
      {error && <div style={styles.error}>{error}</div>}
      {loading ? <p style={styles.muted}>Loading…</p> : renderTable()}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  h1: {
    margin: 0,
    fontSize: '1.75rem',
    fontFamily: 'Georgia, "Times New Roman", serif',
    color: '#1a1a1a',
  },
  tableWrap: { overflowX: 'auto', background: '#fff', border: '1px solid #ddd', borderRadius: 4 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: {
    textAlign: 'left',
    padding: '0.5rem 0.75rem',
    borderBottom: '2px solid #4a4a4e',
    color: '#333',
    fontWeight: 600,
    background: '#f5f5f5',
  },
  td: { padding: '0.5rem 0.75rem', borderBottom: '1px solid #ddd' },
  error: {
    padding: '0.75rem',
    borderRadius: 4,
    background: '#fde8e8',
    color: '#8B1538',
    border: '1px solid #e0a0a0',
  },
  muted: { color: '#555', margin: 0 },
};
