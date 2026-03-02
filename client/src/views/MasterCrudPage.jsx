import React, { useState, useEffect, useCallback } from 'react';
import { masterApi } from '../services/api';

export default function MasterCrudPage({ table, title, fields = [], addButtonLabel }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownAlert, setDropdownAlert] = useState(null);
  const [options, setOptions] = useState({});
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadData = useCallback(() => {
    if (!table) return Promise.resolve();
    setLoading(true);
    setError(null);
    return masterApi
      .getTable(table)
      .then((res) => {
        if (res.success) setData(res.data || []);
        else setError(res.message || 'Failed to load');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [table]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset form when switching to a different table/page so one page's input doesn't appear in another
  useEffect(() => {
    setForm({});
    setEditingId(null);
  }, [table]);

  // Load options for select and combobox fields
  const loadOptions = useCallback(() => {
    const tables = new Set();
    fields.forEach((f) => {
      if ((f.type === 'select' || f.type === 'combobox') && f.optionsTable) tables.add(f.optionsTable);
    });
    tables.forEach((t) => {
      masterApi
        .getTable(t)
        .then((res) => {
          if (res.success) setOptions((prev) => ({ ...prev, [t]: res.data || [] }));
          else setOptions((prev) => ({ ...prev, [t]: [] }));
        })
        .catch(() => setOptions((prev) => ({ ...prev, [t]: [] })));
    });
  }, [fields]);

  useEffect(() => {
    loadOptions();
  }, [table, loadOptions]);

  const getDisplayValue = (row, field) => {
    const val = row[field.name];
    if (field.type === 'radio') {
      // Unit of Type: fallback to name when type_category is null (old records)
      const displayVal = field.name === 'type_category' ? (val != null ? val : row.name) : val;
      return displayVal != null ? String(displayVal) : '—';
    }
    if (val == null) return '—';
    if (field.type === 'combobox') return String(val);
    if (field.type === 'select' && field.optionsTable && options[field.optionsTable]) {
      const list = options[field.optionsTable];
      // Use loose equality so parent_id (number or string from API) matches opt.id (number or string)
      const opt = list.find((o) => {
        const oId = o.id != null ? Number(o.id) : null;
        const v = val != null ? Number(val) : null;
        if (oId !== null && v !== null && oId === v) return true;
        if (field.optionValue && o[field.optionValue] == val) return true;
        return o.id == val;
      });
      if (!opt) return String(val);
      if (field.optionsTable === 'unit-types') return opt.type_category || opt.name || String(val);
      return field.optionLabel ? (opt[field.optionLabel] ?? opt.name) : opt.name;
    }
    return String(val);
  };

  // Derive parent IDs from child selection so user only picks the specific field (e.g. Region implies State)
  const derivePayload = (payload, opts) => {
    if (table === 'regions' && payload.state_sub_division_id && opts['state-sub-divisions']) {
      const ssd = opts['state-sub-divisions'].find((s) => s.id === Number(payload.state_sub_division_id) || s.id === payload.state_sub_division_id);
      if (ssd && ssd.state_id) payload.state_id = ssd.state_id;
    }
    if (table === 'talukas' && payload.vidhan_sabha_id && opts['vidhan-sabhas']) {
      const vs = opts['vidhan-sabhas'].find((v) => v.id === Number(payload.vidhan_sabha_id) || v.id === payload.vidhan_sabha_id);
      if (vs) payload.state_id = vs.state_id;
    }
    if (table === 'zones' && payload.region_id && opts['regions']) {
      const region = opts['regions'].find((r) => r.id === Number(payload.region_id) || r.id === payload.region_id);
      if (region) payload.state_id = region.state_id;
    }
    if (table === 'vidhan-sabhas' && payload.zone_id && opts['zones']) {
      const zone = opts['zones'].find((z) => z.id === Number(payload.zone_id) || z.id === payload.zone_id);
      if (zone) {
        payload.state_id = zone.state_id;
        payload.region_id = zone.region_id;
      }
    }
    if (table === 'circles' && payload.taluka_id && opts['talukas']) {
      const taluka = opts['talukas'].find((t) => t.id === Number(payload.taluka_id) || t.id === payload.taluka_id);
      if (taluka) payload.state_id = taluka.state_id;
    }
    if (table === 'panchayat-samitis' && payload.circle_id && opts['circles']) {
      const circle = opts['circles'].find((c) => c.id === Number(payload.circle_id) || c.id === payload.circle_id);
      if (circle) payload.taluka_id = circle.taluka_id;
    }
    if (table === 'villages' && payload.panchayat_samiti_id && opts['panchayat-samitis']) {
      const ps = opts['panchayat-samitis'].find((p) => p.id === Number(payload.panchayat_samiti_id) || p.id === payload.panchayat_samiti_id);
      if (ps) payload.taluka_id = ps.taluka_id;
    }
    if (table === 'states' && payload.country_division_id && opts['country-divisions']) {
      const cd = opts['country-divisions'].find((c) => c.id === Number(payload.country_division_id) || c.id === payload.country_division_id);
      if (cd) payload.country_id = cd.country_id;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build payload from fields so every field is always sent (avoids undefined being omitted by JSON.stringify)
    const payload = {};
    fields.forEach((f) => {
      let val = form[f.name];
      if (val === undefined) val = f.type === 'select' ? null : '';
      // Send _id select values as numbers so backend stores FK correctly (e.g. parent_id)
      if (f.type === 'select' && f.name.endsWith('_id') && val != null && val !== '') {
        const n = Number(val);
        val = Number.isNaN(n) ? val : n;
      }
      payload[f.name] = val;
    });
    // Validate dropdowns: if any required select field is empty, show custom alert and stop
    for (const f of fields) {
      if (f.type === 'select' && f.required !== false) {
        const val = payload[f.name];
        if (val == null || val === '') {
          setDropdownAlert(`Please fill this field: ${f.label}`);
          return;
        }
      }
    }

    // Units: require Unit Name, Unit Type, and Status — show alert listing missing fields
    if (table === 'units') {
      const missing = [];
      if (!payload.name || !String(payload.name).trim()) missing.push('Unit Name');
      if (payload.unit_type_id == null || payload.unit_type_id === '') missing.push('Unit Type');
      if (payload.status == null || payload.status === '') missing.push('Status');
      if (missing.length > 0) {
        setDropdownAlert(`Please fill: ${missing.join(', ')}`);
        return;
      }
    }

    // Unit of Type: type select from DB; use type_category as name for DB
    if (table === 'unit-types') {
      if (!payload.type_category || !String(payload.type_category).trim()) {
        setDropdownAlert('Please select a type');
        return;
      }
      payload.name = payload.type_category;
    } else {
      if (!payload.name || !String(payload.name).trim()) {
        setError('Name is required');
        return;
      }
    }
    // Business Sub Category: require Business Category selection
    if (table === 'business-sub-categories' && (payload.business_category_id == null || payload.business_category_id === '')) {
      setError('Please select a Business Category');
      return;
    }
    derivePayload(payload, options);
    setSubmitLoading(true);
    setError(null);
    const promise = editingId
      ? masterApi.update(table, editingId, payload)
      : masterApi.create(table, payload);
    promise
      .then(async (res) => {
        if (res.success) {
          // Refetch table from DB so UI shows the new/updated row (and Parent column is correct)
          await loadData();
          loadOptions();
          setForm({});
          setEditingId(null);
        } else setError(res.message || 'Failed to save');
      })
      .catch((e) => setError(e.message))
      .finally(() => setSubmitLoading(false));
  };

  const startEdit = (row) => {
    const values = {};
    fields.forEach((f) => {
      values[f.name] = row[f.name] != null ? row[f.name] : '';
    });
    setForm(values);
    setEditingId(row.client_id != null ? String(row.client_id) : row.id);
  };

  const cancelEdit = () => {
    setForm({});
    setEditingId(null);
  };

  const handleDelete = (idOrClientId) => {
    if (!window.confirm('Delete this record?')) return;
    setError(null);
    masterApi
      .delete(table, idOrClientId)
      .then((res) => {
        if (res.success) {
          setForm({});
          setEditingId(null);
          loadData();
        } else setError(res.message);
      })
      .catch((e) => setError(e.message));
  };

  if (!table || !title) return null;

  const addLabel = addButtonLabel || `Add ${title}`;

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>{title}</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          {fields.map((f) => (
            <div key={`${table}-${f.name}`} style={styles.fieldWrap}>
              <label style={styles.label}>{f.label}</label>
              {f.type === 'combobox' ? (
                (() => {
                  const dbOpts = options[f.optionsTable] || [];
                  const staticList = f.optionStatic || [];
                  const staticOpts = staticList.filter((s) => !dbOpts.some((o) => (f.optionValue ? o[f.optionValue] : o.id) === s));
                  const datalistValues = [...dbOpts.map((o) => (f.optionLabel ? o[f.optionLabel] : o.name) ?? (f.optionValue ? o[f.optionValue] : o.id)), ...staticOpts];
                  const listId = `datalist-${table}-${f.name}`;
                  return (
                    <>
                      <input
                        type="text"
                        name={f.name}
                        list={listId}
                        value={form[f.name] != null ? form[f.name] : ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                        placeholder={`Select or type ${f.label.toLowerCase()}`}
                        style={styles.input}
                      />
                      <datalist id={listId}>
                        {datalistValues.map((val, i) => (
                          <option key={val || i} value={val} />
                        ))}
                      </datalist>
                    </>
                  );
                })()
              ) : f.type === 'select' ? (
                (() => {
                  const dbOpts = options[f.optionsTable] || [];
                  // When editing a self-referential field (e.g. designations parent_id), exclude current row from options
                  let filteredDbOpts = dbOpts;
                  if (editingId && f.optionsTable === table && f.name === 'parent_id') {
                    filteredDbOpts = dbOpts.filter(
                      (o) => String(o.client_id != null ? o.client_id : o.id) !== String(editingId)
                    );
                  }
                  const staticList = f.optionStatic || [];
                  const staticOpts = staticList.filter((s) => !filteredDbOpts.some((o) => (f.optionValue ? o[f.optionValue] : o.id) === s)).map((s) => (f.optionValue ? { [f.optionValue]: s, id: s } : { id: s, name: s }));
                  const selectOptions = [...filteredDbOpts, ...staticOpts];
                  return (
                <select
                  name={f.name}
                  value={form[f.name] != null ? form[f.name] : ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const useNumber = raw !== '' && (!f.optionValue && f.name.endsWith('_id') || f.optionValue === 'id');
                    setForm((prev) => ({ ...prev, [f.name]: raw === '' ? null : (useNumber ? Number(raw) : raw) }));
                  }}
                  style={styles.input}
                >
                  <option value="">{f.optionPlaceholder || 'Select...'}</option>
                  {selectOptions.map((opt) => {
                    const optValue = f.optionValue != null ? (opt[f.optionValue] ?? '') : opt.id;
                    const optLabel = f.optionLabel != null ? (opt[f.optionLabel] ?? opt.name) : opt.name;
                    return (
                      <option key={optValue !== '' ? optValue : opt.id} value={optValue}>
                        {optLabel}
                      </option>
                    );
                  })}
                </select>
                  );
                })()
              ) : f.type === 'radio' && Array.isArray(f.options) ? (
                <div style={styles.radioGroup}>
                  {f.options.map((opt) => (
                    <label key={opt} style={styles.radioLabel}>
                      <input
                        type="radio"
                        name={f.name}
                        value={opt}
                        checked={(form[f.name] != null ? form[f.name] : '') === opt}
                        onChange={() => setForm((prev) => ({ ...prev, [f.name]: opt }))}
                        style={styles.radioInput}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  name={f.name}
                  value={form[f.name] != null ? form[f.name] : ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                  placeholder={f.label}
                  style={styles.input}
                />
              )}
            </div>
          ))}
          <div style={styles.actions}>
            <button type="submit" disabled={submitLoading} style={styles.btnPrimary}>
              {submitLoading ? 'Saving…' : editingId ? 'Update' : addLabel}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} style={styles.btnSecondary}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {dropdownAlert && (
        <div style={styles.alertOverlay} onClick={() => setDropdownAlert(null)} role="dialog" aria-modal="true" aria-labelledby="dropdown-alert-title">
          <div style={styles.alertBox} onClick={(e) => e.stopPropagation()}>
            <p id="dropdown-alert-title" style={styles.alertMessage}>{dropdownAlert}</p>
            <button type="button" onClick={() => setDropdownAlert(null)} style={styles.alertBtn}>
              OK
            </button>
          </div>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              {fields.map((f) => (
                <th key={f.name} style={styles.th}>
                  {f.tableHeader || f.label}
                </th>
              ))}
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={fields.length + 2} style={styles.td}>
                  Loading…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 2} style={styles.td}>
                  No data.
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const rowId = row.client_id != null ? String(row.client_id) : row.id;
                const displayId = row.client_id != null ? String(row.client_id) : row.id;
                return (
                <tr key={rowId}>
                  <td style={styles.td}>{displayId}</td>
                  {fields.map((f) => (
                    <td key={f.name} style={styles.td}>
                      {getDisplayValue(row, f)}
                    </td>
                  ))}
                  <td style={styles.td}>
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      style={styles.btnEdit}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rowId)}
                      style={styles.btnDelete}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
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
  form: { marginBottom: '0.5rem' },
  formRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.9rem', fontWeight: 500, color: '#333' },
  radioGroup: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', alignItems: 'center' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem', color: '#333' },
  radioInput: { margin: 0, cursor: 'pointer' },
  input: {
    padding: '0.5rem 0.75rem',
    borderRadius: 4,
    border: '1px solid #aaa',
    background: '#fff',
    color: '#333',
    minWidth: 180,
  },
  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  btnPrimary: {
    padding: '0.5rem 1rem',
    borderRadius: 4,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
    fontWeight: 600,
  },
  btnSecondary: {
    padding: '0.5rem 1rem',
    borderRadius: 4,
    border: '1px solid #666',
    background: '#fff',
    color: '#333',
  },
  btnEdit: {
    padding: '0.35rem 0.6rem',
    fontSize: '0.85rem',
    borderRadius: 4,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
    marginRight: '0.5rem',
  },
  btnDelete: {
    padding: '0.35rem 0.6rem',
    fontSize: '0.85rem',
    borderRadius: 4,
    border: 'none',
    background: '#8B1538',
    color: '#fff',
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
  alertOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  alertBox: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    minWidth: 280,
    maxWidth: 400,
  },
  alertMessage: {
    margin: '0 0 1rem',
    fontSize: '1rem',
    color: '#333',
  },
  alertBtn: {
    display: 'block',
    width: '100%',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: 4,
    background: '#1a5fb4',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    padding: '0.75rem',
    borderRadius: 4,
    background: '#fde8e8',
    color: '#8B1538',
    border: '1px solid #e0a0a0',
  },
};
