import React, { useMemo, useState, useEffect } from 'react';
import { masterApi } from '../services/api';
import { entityFields } from '../config/entityFields';

const TABLE = 'business-unit-allotments';

const ID_MASTERS = {
  business_category_id: { table: 'business-categories', labelField: 'name' },
  business_sub_category_id: { table: 'business-sub-categories', labelField: 'name' },
  product_id: { table: 'products', labelField: 'name' },
  business_type_id: { table: 'business-types', labelField: 'name' },
  unit_type_id: { table: 'unit-types', labelField: 'name' },
};

function isFileField(key, value) {
  if (value == null) return false;
  const lowerKey = String(key || '').toLowerCase();
  // Treat as "file" only when the field is actually a file/path field.
  // Many boolean/enum fields include words like "certificate" but store YES/NO — those should remain normal details.
  if (lowerKey.includes('path') || lowerKey.endsWith('_file')) {
    return true;
  }
  if (typeof value === 'string' && /\.(pdf|jpe?g|png|gif|webp|docx?)$/i.test(value)) return true;
  return false;
}

function isImageValue(value) {
  if (!value || typeof value !== 'string') return false;
  return /\.(jpe?g|png|gif|webp)$/i.test(value);
}

function getFileUrl(raw) {
  if (!raw) return '';
  const v = typeof raw === 'string' ? raw : String(raw);
  if (/^https?:\/\//i.test(v) || v.startsWith('/files/')) return v;
  const parts = v.split(/[\\/]/);
  const filename = parts[parts.length - 1];
  return `/files/${filename}`;
}

function niceLabel(key) {
  const f = (entityFields[TABLE] || []).find((x) => x.name === key);
  if (f?.label) return f.label;
  return String(key)
    .replace(/_id$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatValue(key, value, masters) {
  if (value === null || value === undefined || value === '') return '-';
  if (key && key.endsWith('_id')) {
    const cfg = ID_MASTERS[key];
    if (cfg && masters && Array.isArray(masters[cfg.table])) {
      const num = Number(value);
      const row =
        masters[cfg.table].find((r) => Number(r.id) === num) ||
        masters[cfg.table].find((r) => String(r.id) === String(value));
      if (row && row[cfg.labelField]) return String(row[cfg.labelField]);
    }
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return String(value);
}

function getSectionKey(key) {
  const k = String(key || '').toLowerCase();
  if (
    k === 'client_id' ||
    k === 'created_at' ||
    k === 'updated_at' ||
    k === 'beneficiary_name' ||
    k === 'aadhar_card_number' ||
    k === 'pan_card_number'
  ) {
    return 'core';
  }
  if (
    k.startsWith('business_') ||
    k.startsWith('unit_') ||
    k === 'unit_type_id' ||
    k === 'business_category_id' ||
    k === 'business_sub_category_id' ||
    k === 'product_id' ||
    k === 'business_type_id'
  ) {
    return 'business';
  }
  if (k.startsWith('bank_') || k.includes('cibil')) return 'bank';
  if (k.startsWith('land_')) return 'land';
  if (k.includes('certificate') || k.includes('cheque') || k.includes('passbook') || k.includes('license') || k.includes('gst') || k.includes('fssai') || k.includes('udyami') || k.includes('dpr') || k.includes('quotation') || k.includes('agreement') || k.includes('sanction')) {
    return 'documents';
  }
  return 'other';
}

export default function BusinessUnitAllotmentListPage({ title = 'Business Unit Allotment List' }) {
  const [aadhar, setAadhar] = useState('');
  const [pan, setPan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [masters, setMasters] = useState({});
  const [openSections, setOpenSections] = useState({ core: true, business: false, bank: false, land: false, documents: true, other: false });
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState(null);

  const fileBaseUrl =
    typeof import.meta.env?.VITE_API_ORIGIN === 'string' && import.meta.env.VITE_API_ORIGIN
      ? import.meta.env.VITE_API_ORIGIN.replace(/\/$/, '')
      : window.location.origin;

  const canSearch = useMemo(() => {
    const a = String(aadhar || '').trim();
    const p = String(pan || '').trim();
    return a.length >= 4 || p.length >= 4;
  }, [aadhar, pan]);

  const activeFilters = useMemo(() => {
    const a = String(aadhar || '').trim();
    const p = String(pan || '').trim().toUpperCase();
    return {
      aadhar: a || null,
      pan: p || null,
    };
  }, [aadhar, pan]);

  useEffect(() => {
    const needed = Array.from(new Set(Object.values(ID_MASTERS).map((x) => x.table)));
    let cancelled = false;
    Promise.all(
      needed.map((t) =>
        masterApi
          .getTable(t)
          .then((res) => ({ t, data: res?.success && Array.isArray(res.data) ? res.data : [] }))
          .catch(() => ({ t, data: [] }))
      )
    ).then((all) => {
      if (cancelled) return;
      const next = {};
      all.forEach(({ t, data }) => {
        next[t] = data;
      });
      setMasters(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onResize() {
      setIsNarrow(window.innerWidth < 1024);
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  async function runSearch(e) {
    if (e) e.preventDefault();
    const a = String(aadhar || '').trim();
    const p = String(pan || '').trim().toUpperCase();
    if (!a && !p) return;

    setLoading(true);
    setError(null);
    setActionStatus(null);
    setRows([]);
    setSelected(null);
    try {
      const res = await masterApi.search(TABLE, { aadhar: a, pan: p });
      if (!res || !res.success) {
        setError(res?.message || 'Failed to search Business Unit Allotment');
      } else {
        const list = Array.isArray(res.data) ? res.data : [];
        setRows(list);
      }
    } catch (err) {
      setError(err.message || 'Failed to search Business Unit Allotment');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(row) {
    const clientId = row?.client_id;
    if (clientId == null || clientId === '') {
      setActionStatus({ type: 'error', text: 'Cannot delete: missing client_id.' });
      return;
    }
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete Business Unit Allotment record (Client ID: ${clientId})?`);
    if (!ok) return;

    setActionStatus(null);
    try {
      const res = await masterApi.delete(TABLE, clientId);
      if (!res || !res.success) {
        setActionStatus({ type: 'error', text: res?.message || 'Delete failed.' });
        return;
      }
      setActionStatus({ type: 'success', text: 'Record deleted successfully.' });
      if (selected?.client_id === clientId) {
        setSelected(null);
        setDetailsOpen(false);
      }
      // Refresh current search results
      await runSearch();
    } catch (err) {
      setActionStatus({ type: 'error', text: err?.message || 'Delete failed.' });
    }
  }

  function clearAll() {
    setAadhar('');
    setPan('');
    setRows([]);
    setSelected(null);
    setError(null);
    setActionStatus(null);
    setLoading(false);
  }

  const selectedDetails = useMemo(() => {
    if (!selected) return null;
    const entries = Object.entries(selected)
      .filter(([k, v]) => v != null && String(v).trim() !== '' && String(k).toLowerCase() !== 'id')
      .map(([k, v]) => ({ key: k, value: v, label: niceLabel(k), isFile: isFileField(k, v) }));
    const details = entries.filter((x) => !x.isFile);
    const files = entries.filter((x) => x.isFile);
    const grouped = { core: [], business: [], bank: [], land: [], documents: [], other: [] };
    details.forEach((d) => {
      const sk = getSectionKey(d.key);
      grouped[sk] = grouped[sk] || [];
      grouped[sk].push(d);
    });
    return { details, files, grouped };
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    // When a record is selected, default to showing full information.
    setOpenSections({ core: true, business: true, bank: true, land: true, documents: true, other: true });
    setShowAllDetails(true);
  }, [selected?.id]);

  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.topHeader}>
          <div style={styles.topHeaderInner}>
            <h1 style={styles.title}>{title}</h1>
            <p style={styles.subtitle}>
              Search and view Business Unit Allotment details by Aadhaar Card Number or PAN Card Number.
            </p>
          </div>
        </div>

        <form onSubmit={runSearch} style={styles.searchCard}>
          <div style={styles.searchGrid}>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Aadhaar Card Number</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 1234..."
                value={aadhar}
                onChange={(e) => setAadhar(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>PAN Card Number</label>
              <input
                type="text"
                placeholder="e.g. ABCDE1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                style={styles.input}
              />
            </div>
            <div style={styles.actionsWrap}>
              <button type="submit" disabled={!canSearch || loading} style={styles.primaryBtn}>
                {loading ? 'Searching…' : 'Search'}
              </button>
              <button type="button" onClick={clearAll} disabled={loading} style={styles.secondaryBtn}>
                Clear
              </button>
            </div>
          </div>

          <div style={styles.helperRow}>
            <span style={styles.helperText}>Tip: You can search using Aadhaar or PAN (minimum 4 characters).</span>
            <div style={styles.chips}>
              {activeFilters.aadhar && <span style={styles.chip}>Aadhaar: {activeFilters.aadhar}</span>}
              {activeFilters.pan && <span style={styles.chip}>PAN: {activeFilters.pan}</span>}
            </div>
          </div>
        </form>

        {error && <div style={styles.error}>{error}</div>}
        {actionStatus && (
          <div style={actionStatus.type === 'success' ? styles.alertSuccess : styles.alertError}>
            {actionStatus.text}
          </div>
        )}

        {!loading && rows.length === 0 && (String(aadhar || '').trim() || String(pan || '').trim()) && !error && (
          <p style={styles.muted}>No Business Unit Allotment records found for this Aadhaar / PAN.</p>
        )}

        {rows.length > 0 && (
          <div style={isNarrow ? styles.gridNarrow : styles.grid}>
            <div style={styles.tableWrap}>
              <div style={styles.tableHeader}>
                <div style={styles.tableHeaderLeft}>
                  <span style={styles.tableHeaderText}>Matches: {rows.length}</span>
                  {selected?.client_id != null && (
                    <span style={styles.tableHeaderSubText}>
                      Selected: <strong>{selected.client_id}</strong>
                    </span>
                  )}
                </div>
              </div>
              <div style={styles.tableScroll}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Client ID</th>
                      <th style={styles.th}>Beneficiary</th>
                      <th style={styles.th}>Unit / Company</th>
                      <th style={styles.th}>PAN</th>
                      <th style={styles.th}>Created</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const isActive = selected && r && selected.id === r.id;
                      return (
                        <tr
                          key={r.id || `${r.client_id}-${r.created_at || ''}`}
                          style={isActive ? styles.trActive : styles.tr}
                          onClick={() => {
                            setSelected(r);
                            if (isNarrow) setDetailsOpen(true);
                          }}
                        >
                          <td style={styles.td}>{r.client_id ?? '-'}</td>
                          <td style={styles.td}>{r.beneficiary_name ?? '-'}</td>
                          <td style={styles.td}>{r.unit_company_name ?? '-'}</td>
                          <td style={styles.td}>{r.pan_card_number ?? '-'}</td>
                          <td style={styles.td}>{r.created_at ? String(r.created_at).slice(0, 10) : '-'}</td>
                          <td style={styles.td}>
                            <div style={styles.rowActions}>
                              <button
                                type="button"
                                style={styles.viewBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelected(r);
                                  setDetailsOpen(true);
                                }}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                style={styles.deleteBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(r);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {!isNarrow && (
              <div style={styles.detailPane}>
                {!selected ? (
                  <p style={styles.muted}>Select a row to view full Business Unit Allotment details.</p>
                ) : (
                  <DetailsPanel
                    selected={selected}
                    selectedDetails={selectedDetails}
                    masters={masters}
                    openSections={openSections}
                    showAllDetails={showAllDetails}
                    onToggleSection={toggleSection}
                    onToggleAllDetails={() => setShowAllDetails((p) => !p)}
                    onExpandAll={() =>
                      setOpenSections({ core: true, business: true, bank: true, land: true, documents: true, other: true })
                    }
                    onCollapse={() =>
                      setOpenSections({ core: true, business: false, bank: false, land: false, documents: true, other: false })
                    }
                    onClear={() => setSelected(null)}
                    fileBaseUrl={fileBaseUrl}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isNarrow && detailsOpen && selected && (
        <div
          style={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDetailsOpen(false);
          }}
        >
          <div style={styles.modalCard} onMouseDown={(e) => e.stopPropagation()}>
            <DetailsPanel
              selected={selected}
              selectedDetails={selectedDetails}
              masters={masters}
              openSections={openSections}
              showAllDetails={showAllDetails}
              onToggleSection={toggleSection}
              onToggleAllDetails={() => setShowAllDetails((p) => !p)}
              onExpandAll={() =>
                setOpenSections({ core: true, business: true, bank: true, land: true, documents: true, other: true })
              }
              onCollapse={() =>
                setOpenSections({ core: true, business: false, bank: false, land: false, documents: true, other: false })
              }
              onClear={() => setDetailsOpen(false)}
              fileBaseUrl={fileBaseUrl}
              isModal
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsPanel({
  selected,
  selectedDetails,
  masters,
  openSections,
  showAllDetails,
  onToggleSection,
  onToggleAllDetails,
  onExpandAll,
  onCollapse,
  onClear,
  fileBaseUrl,
  isModal = false,
}) {
  return (
    <>
      <div style={styles.detailHeader}>
        <div>
          <div style={styles.detailTitle}>Business Unit Allotment Details</div>
          <div style={styles.detailSub}>
            Client ID: <strong>{selected.client_id ?? '-'}</strong> • Beneficiary: <strong>{selected.beneficiary_name ?? '-'}</strong>
          </div>
        </div>
        <button type="button" style={styles.clearBtn} onClick={onClear}>
          {isModal ? 'Close' : 'Clear'}
        </button>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>KYC</div>
          <div style={styles.summaryValue}>
            Aadhaar: <strong>{selected.aadhar_card_number ?? '-'}</strong>
          </div>
          <div style={styles.summaryValue}>
            PAN: <strong>{selected.pan_card_number ?? '-'}</strong>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Business</div>
          <div style={styles.summaryValue}>
            Category: <strong>{formatValue('business_category_id', selected.business_category_id, masters)}</strong>
          </div>
          <div style={styles.summaryValue}>
            Unit type: <strong>{formatValue('unit_type_id', selected.unit_type_id, masters)}</strong>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Unit</div>
          <div style={styles.summaryValue}>
            Cluster: <strong>{selected.business_cluster_name ?? '-'}</strong>
          </div>
          <div style={styles.summaryValue}>
            Company: <strong>{selected.unit_company_name ?? '-'}</strong>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Bank</div>
          <div style={styles.summaryValue}>
            Bank: <strong>{selected.bank_name ?? '-'}</strong>
          </div>
          <div style={styles.summaryValue}>
            IFSC: <strong>{selected.bank_branch_ifsc_code ?? '-'}</strong>
          </div>
        </div>
      </div>

      {selectedDetails && (
        <div style={styles.accordionBar}>
          <button type="button" style={styles.smallBtn} onClick={onToggleAllDetails}>
            {showAllDetails ? 'Show less' : 'Show all fields'}
          </button>
          <button type="button" style={styles.smallBtnOutline} onClick={onExpandAll}>
            Expand all
          </button>
          <button type="button" style={styles.smallBtnOutline} onClick={onCollapse}>
            Collapse
          </button>
        </div>
      )}

      {selectedDetails && (
        <div style={styles.section}>
          {[
            { key: 'core', title: 'Core' },
            { key: 'business', title: 'Business' },
            { key: 'bank', title: 'Bank' },
            { key: 'land', title: 'Land' },
            { key: 'other', title: 'Other' },
          ].map((sec) => {
            const list = selectedDetails.grouped?.[sec.key] || [];
            if (!list.length) return null;
            const shown = showAllDetails ? list : list.slice(0, 10);
            return (
              <div key={sec.key} style={styles.accSection}>
                <button
                  type="button"
                  onClick={() => onToggleSection(sec.key)}
                  style={styles.accHeader}
                  aria-expanded={!!openSections[sec.key]}
                >
                  <span>{sec.title}</span>
                  <span style={styles.accMeta}>
                    {list.length} {openSections[sec.key] ? '▼' : '▶'}
                  </span>
                </button>
                {openSections[sec.key] && (
                  <ul style={styles.detailList}>
                    {shown.map((d) => (
                      <li key={d.key} style={styles.detailItem}>
                        <span style={styles.detailLabel}>{d.label}</span>
                        <span style={styles.detailValue}>{formatValue(d.key, d.value, masters)}</span>
                      </li>
                    ))}
                    {!showAllDetails && list.length > shown.length && (
                      <li style={styles.moreRow}>
                        Showing {shown.length} of {list.length}. Use “Show all fields” to see more.
                      </li>
                    )}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedDetails && selectedDetails.files.length > 0 && (
        <div style={styles.section}>
          <button
            type="button"
            onClick={() => onToggleSection('documents')}
            style={styles.accHeader}
            aria-expanded={!!openSections.documents}
          >
            <span>Files &amp; Documents</span>
            <span style={styles.accMeta}>
              {selectedDetails.files.length} {openSections.documents ? '▼' : '▶'}
            </span>
          </button>
          {openSections.documents && (
            <div style={styles.fileGrid}>
              {selectedDetails.files.map((f) => {
                const url = getFileUrl(f.value);
                const fullUrl = url && (url.startsWith('http') ? url : `${fileBaseUrl}${url}`);
                const fileName = url ? url.split('/').slice(-1)[0] : 'download';
                if (!url) return null;
                return (
                  <div key={f.key} style={styles.fileCard}>
                    <div style={styles.fileLabel}>{f.label}</div>
                    <div style={styles.fileName}>{fileName}</div>
                    <div style={styles.fileActions}>
                      {isImageValue(String(f.value)) ? (
                        <a href={fullUrl || url} target="_blank" rel="noopener noreferrer" style={styles.fileBtn}>
                          Preview
                        </a>
                      ) : (
                        <a href={fullUrl || url} target="_blank" rel="noopener noreferrer" style={styles.fileBtn}>
                          Open
                        </a>
                      )}
                      <a href={fullUrl || url} download={fileName} style={styles.fileBtnOutline}>
                        Download
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  page: {
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    background: '#fff4e0',
  },
  card: {
    width: '100%',
    maxWidth: 1200,
    background: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    padding: '1.25rem 1.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  topHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  topHeaderInner: {
    width: '100%',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 700,
    textAlign: 'center',
    color: '#8B1538',
  },
  subtitle: {
    margin: '0.1rem 0 0.75rem',
    fontSize: '0.95rem',
    textAlign: 'center',
    color: '#555',
  },
  searchCard: {
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: 'linear-gradient(180deg, #fffaf2 0%, #ffffff 100%)',
    padding: '0.9rem 1rem',
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.75rem',
    alignItems: 'end',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.85rem', fontWeight: 700, color: '#374151' },
  input: {
    padding: '0.5rem 0.7rem',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    outline: 'none',
    background: '#fff',
  },
  actionsWrap: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    padding: '0.5rem 1rem',
    borderRadius: 8,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    minWidth: 120,
  },
  secondaryBtn: {
    padding: '0.5rem 1rem',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: 120,
  },
  helperRow: {
    marginTop: '0.65rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  helperText: { fontSize: '0.85rem', color: '#6b7280' },
  chips: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  chip: {
    padding: '0.18rem 0.55rem',
    borderRadius: 999,
    border: '1px solid #fed7aa',
    background: '#fff7ed',
    color: '#9a3412',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  error: {
    padding: '0.5rem 0.75rem',
    borderRadius: 4,
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    fontSize: '0.9rem',
  },
  alertError: {
    padding: '0.5rem 0.75rem',
    borderRadius: 6,
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    fontSize: '0.9rem',
  },
  alertSuccess: {
    padding: '0.5rem 0.75rem',
    borderRadius: 6,
    background: '#ecfdf3',
    color: '#166534',
    border: '1px solid #bbf7d0',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  muted: { margin: 0, color: '#6b7280' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
    gap: '0.9rem',
    alignItems: 'start',
  },
  gridNarrow: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.9rem',
    alignItems: 'start',
  },
  tableWrap: {
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    background: '#fff',
  },
  tableHeader: {
    padding: '0.55rem 0.75rem',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  tableHeaderLeft: { display: 'flex', gap: '0.6rem', alignItems: 'baseline', flexWrap: 'wrap' },
  tableHeaderText: { fontSize: '0.9rem', fontWeight: 600, color: '#111827' },
  tableHeaderSubText: { fontSize: '0.85rem', color: '#6b7280' },
  tableScroll: { overflowX: 'auto', maxHeight: 520, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: {
    textAlign: 'left',
    padding: '0.6rem 0.75rem',
    background: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  tr: { borderBottom: '1px solid #e5e7eb', cursor: 'pointer' },
  trActive: { borderBottom: '1px solid #e5e7eb', background: '#fff7ed' },
  td: { padding: '0.55rem 0.75rem', verticalAlign: 'top', whiteSpace: 'nowrap' },
  rowActions: { display: 'flex', gap: '0.45rem', alignItems: 'center' },
  viewBtn: {
    padding: '0.3rem 0.7rem',
    borderRadius: 4,
    border: 'none',
    background: '#15803d',
    color: '#fff',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.3rem 0.7rem',
    borderRadius: 4,
    border: '1px solid #dc2626',
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  detailPane: {
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    padding: '0.75rem',
    minHeight: 220,
    maxHeight: 620,
    overflow: 'auto',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2, 6, 23, 0.6)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 2000,
  },
  modalCard: {
    width: '100%',
    maxWidth: 920,
    maxHeight: '90vh',
    overflow: 'auto',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.14)',
    background: '#ffffff',
    boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
    padding: '0.85rem',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.75rem',
    paddingBottom: '0.6rem',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '0.6rem',
  },
  detailTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827' },
  detailSub: { fontSize: '0.85rem', color: '#4b5563', marginTop: 2 },
  clearBtn: {
    padding: '0.25rem 0.65rem',
    borderRadius: 999,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    fontSize: '0.8rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.6rem',
    marginBottom: '0.6rem',
  },
  summaryCard: {
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: '#fffaf2',
    padding: '0.6rem 0.7rem',
  },
  summaryLabel: { fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', letterSpacing: '0.02em' },
  summaryValue: { fontSize: '0.86rem', color: '#111827', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  accordionBar: {
    display: 'flex',
    gap: '0.45rem',
    flexWrap: 'wrap',
    marginBottom: '0.5rem',
  },
  smallBtn: {
    padding: '0.3rem 0.7rem',
    borderRadius: 999,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  smallBtnOutline: {
    padding: '0.3rem 0.7rem',
    borderRadius: 999,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#111827',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  accSection: { marginBottom: '0.5rem' },
  accHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    padding: '0.55rem 0.65rem',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    color: '#111827',
    fontSize: '0.9rem',
    fontWeight: 800,
    cursor: 'pointer',
    marginTop: '0.55rem',
  },
  accMeta: { fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', whiteSpace: 'nowrap' },
  section: { marginTop: '0.75rem' },
  sectionHeader: { fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' },
  detailList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.45rem 1rem',
    fontSize: '0.88rem',
  },
  detailItem: { display: 'flex', justifyContent: 'space-between', gap: '0.5rem' },
  detailLabel: { fontWeight: 700, color: '#4b5563' },
  detailValue: { color: '#111827', textAlign: 'right', wordBreak: 'break-word' },
  moreRow: {
    gridColumn: '1 / -1',
    padding: '0.35rem 0.55rem',
    borderRadius: 8,
    border: '1px dashed #cbd5e1',
    background: '#f8fafc',
    color: '#475569',
    fontSize: '0.82rem',
  },
  fileGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.65rem' },
  fileCard: {
    width: 240,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    padding: '0.55rem 0.65rem',
    background: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  fileLabel: { fontSize: '0.85rem', fontWeight: 700, color: '#111827' },
  fileName: { fontSize: '0.8rem', color: '#374151', wordBreak: 'break-all' },
  fileActions: { display: 'flex', gap: '0.45rem', marginTop: '0.25rem' },
  fileBtn: {
    padding: '0.25rem 0.6rem',
    borderRadius: 6,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
    fontSize: '0.8rem',
    textDecoration: 'none',
    textAlign: 'center',
  },
  fileBtnOutline: {
    padding: '0.25rem 0.6rem',
    borderRadius: 6,
    border: '1px solid #1a5fb4',
    background: '#fff',
    color: '#1a5fb4',
    fontSize: '0.8rem',
    textDecoration: 'none',
    textAlign: 'center',
  },
};

