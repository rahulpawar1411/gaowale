import React, { useState, useEffect } from 'react';
import { masterApi, registrationsApi } from '../services/api';

const MASTER_LABELS = {
  countries: 'Country',
  'country-divisions': 'Country Division',
  states: 'State',
  'state-divisions': 'State Division',
  'state-sub-divisions': 'State Sub Division',
  regions: 'Region',
  zones: 'Zone',
  'vidhan-sabhas': 'Vidhan Sabha',
  talukas: 'Taluka',
  blocks: 'Block',
  circles: 'Panchayat Samiti Circle',
  'gram-panchayats': 'Gram Panchayat',
  villages: 'Village',
  products: 'Product',
  'business-types': 'Business Type',
  units: 'Unit',
  'unit-types': 'Unit Type',
  'business-categories': 'Business Category',
  'business-sub-categories': 'Business Sub Category',
};

const REGISTRATION_KEYS = [
  { key: 'management', label: 'Management Registration', api: registrationsApi.management },
  { key: 'farmer', label: 'Farmer Registration', api: registrationsApi.farmer },
  { key: 'customer', label: 'Customer Registration', api: registrationsApi.customer },
  { key: 'lakhpatiDidi', label: 'Lakhpati Didi Registration', api: registrationsApi.lakhpatiDidi },
];

export default function DataPage() {
  const [masterTables, setMasterTables] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState('');
  const [masterData, setMasterData] = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterError, setMasterError] = useState(null);

  const [activeReg, setActiveReg] = useState('management');
  const [regData, setRegData] = useState({});
  const [regLoading, setRegLoading] = useState({});

  useEffect(() => {
    masterApi.listTables().then((res) => {
      if (res.success && res.data && res.data.length) {
        setMasterTables(res.data);
        setSelectedMaster(res.data[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedMaster) return;
    setMasterLoading(true);
    setMasterError(null);
    masterApi
      .getTable(selectedMaster)
      .then((res) => {
        if (res.success) setMasterData(res.data || []);
        else setMasterError(res.message || 'Failed to load');
      })
      .catch((e) => setMasterError(e.message))
      .finally(() => setMasterLoading(false));
  }, [selectedMaster]);

  useEffect(() => {
    REGISTRATION_KEYS.forEach(({ key, api }) => {
      setRegLoading((prev) => ({ ...prev, [key]: true }));
      api
        .getAll()
        .then((res) => {
          if (res.success) {
            setRegData((prev) => ({ ...prev, [key]: res.data || [] }));
          }
        })
        .finally(() => {
          setRegLoading((prev) => ({ ...prev, [key]: false }));
        });
    });
  }, []);

  const currentReg = REGISTRATION_KEYS.find((r) => r.key === activeReg);
  const currentRegList = regData[activeReg] || [];
  const currentRegLoading = regLoading[activeReg];

  const renderTable = (rows, keys) => {
    if (!rows.length) return <p style={styles.muted}>No rows</p>;
    const cols = keys || Object.keys(rows[0]).filter((k) => k !== 'created_at');
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
            {rows.map((row, i) => (
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
      <section style={styles.section}>
        <h2 style={styles.h2}>Master Data (from MySQL)</h2>
        <p style={styles.muted}>
          Tables are created by the server on startup. Select a master table below to view data.
        </p>
        <label style={styles.label}>
          Select table:
          <select
            value={selectedMaster}
            onChange={(e) => setSelectedMaster(e.target.value)}
            style={styles.select}
          >
            {masterTables.map((t) => (
              <option key={t} value={t}>
                {MASTER_LABELS[t] || t}
              </option>
            ))}
          </select>
        </label>
        {masterError && <div style={styles.error}>{masterError}</div>}
        {masterLoading ? (
          <p style={styles.muted}>Loading…</p>
        ) : (
          renderTable(masterData)
        )}
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Registrations</h2>
        <div style={styles.tabs}>
          {REGISTRATION_KEYS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveReg(key)}
              style={{
                ...styles.tab,
                ...(activeReg === key ? styles.tabActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {currentRegLoading ? (
          <p style={styles.muted}>Loading…</p>
        ) : (
          renderTable(currentRegList)
        )}
      </section>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  section: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  h2: { margin: '0 0 0.25rem', fontSize: '1.25rem', fontFamily: 'Georgia, "Times New Roman", serif', color: '#1a1a1a' },
  label: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  select: {
    padding: '0.4rem 0.75rem',
    borderRadius: 4,
    border: '1px solid #aaa',
    background: '#fff',
    color: '#333',
  },
  tabs: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  tab: {
    padding: '0.5rem 1rem',
    borderRadius: 4,
    border: '1px solid #666',
    background: '#fff',
    color: '#333',
  },
  tabActive: { background: '#4a4a4e', color: '#fff', borderColor: '#4a4a4e' },
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
  muted: { color: '#555', margin: 0, fontSize: '0.9rem' },
};
