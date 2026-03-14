import React, { useState, useEffect, useCallback } from 'react';
import { masterApi, registrationsApi } from '../services/api';

export default function MasterCrudPage({ table, title, fields = [], addButtonLabel }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownAlert, setDropdownAlert] = useState(null);
  const [options, setOptions] = useState({});
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filters, setFilters] = useState({});

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

  // Load options for select and combobox fields (and tables needed for selectFromLevel)
  const loadOptions = useCallback(() => {
    const tables = new Set();
    fields.forEach((f) => {
      if ((f.type === 'select' || f.type === 'combobox') && f.optionsTable) tables.add(f.optionsTable);
      if (f.type === 'selectFromLevel' && f.optionsTableMap) {
        Object.values(f.optionsTableMap).forEach((t) => tables.add(t));
      }
    });
    tables.forEach((t) => {
      if (t === 'management-registrations') {
        registrationsApi.management
          .getAll()
          .then((res) => {
            const list = (res.success ? res.data || [] : []).map((row) => ({
              id: row.id,
              name:
                row.name ||
                [row.first_name, row.middle_name, row.last_name]
                  .filter(Boolean)
                  .join(' ')
                  .trim() ||
                '—',
            }));
            setOptions((prev) => ({ ...prev, [t]: list }));
          })
          .catch(() => setOptions((prev) => ({ ...prev, [t]: [] })));
        return;
      }
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
    // Special display logic for Position Allotments: show location chain clearly
    if (table === 'position-allotments') {
      const levelType = row.level_type;
      const areaId = row.area_id != null ? Number(row.area_id) : null;
      const locationFields = [
        'zone_id',
        'vidhan_sabha_id',
        'taluka_id',
        'block_id',
        'circle_id',
        'gram_panchayat_id',
        'village_id',
      ];
      const levelHumanMap = {
        zone: 'Zone',
        vidhan_sabha: 'Vidhan Sabha',
        taluka: 'Taluka',
        block: 'Block',
        circle: 'Panchayat Samiti Circle',
        gram_panchayat: 'Gram Panchayat',
        village: 'Village',
      };

      // Human-readable Level column
      if (field.name === 'level_type') {
        if (!levelType) return '—';
        return levelHumanMap[levelType] || String(levelType);
      }

      // Location columns (Zone / Vidhan Sabha / Taluka / Block / Circle / Gram Panchayat / Village)
      if (locationFields.includes(field.name)) {
        if (areaId == null || Number.isNaN(areaId) || !levelType) return '—';
        const zones = options.zones || [];
        const vidhanSabhas = options['vidhan-sabhas'] || [];
        const talukas = options.talukas || [];
        const blocks = options.blocks || [];
        const circles = options.circles || [];
        const gramPanchayats = options['gram-panchayats'] || [];
        const villages = options.villages || [];

        let zone = null;
        let vs = null;
        let taluka = null;
        let block = null;
        let circle = null;
        let gp = null;
        let village = null;

        switch (levelType) {
          case 'zone': {
            zone = zones.find((z) => Number(z.id) === areaId);
            break;
          }
          case 'vidhan_sabha': {
            vs = vidhanSabhas.find((v) => Number(v.id) === areaId);
            if (vs) {
              zone = zones.find((z) => Number(z.id) === Number(vs.zone_id));
            }
            break;
          }
          case 'taluka': {
            taluka = talukas.find((t) => Number(t.id) === areaId);
            if (taluka) {
              vs = vidhanSabhas.find(
                (v) => Number(v.id) === Number(taluka.vidhan_sabha_id)
              );
              if (vs) {
                zone = zones.find((z) => Number(z.id) === Number(vs.zone_id));
              }
            }
            break;
          }
          case 'block': {
            block = blocks.find((b) => Number(b.id) === areaId);
            if (block) {
              taluka = talukas.find(
                (t) => Number(t.id) === Number(block.taluka_id)
              );
              if (taluka) {
                vs = vidhanSabhas.find(
                  (v) => Number(v.id) === Number(taluka.vidhan_sabha_id)
                );
                if (vs) {
                  zone = zones.find(
                    (z) => Number(z.id) === Number(vs.zone_id)
                  );
                }
              }
            }
            break;
          }
          case 'circle': {
            circle = circles.find((c) => Number(c.id) === areaId);
            if (circle) {
              block = blocks.find(
                (b) => Number(b.id) === Number(circle.block_id)
              );
              if (block) {
                taluka = talukas.find(
                  (t) => Number(t.id) === Number(block.taluka_id)
                );
              }
              if (taluka) {
                vs = vidhanSabhas.find(
                  (v) => Number(v.id) === Number(taluka.vidhan_sabha_id)
                );
                if (vs) {
                  zone = zones.find(
                    (z) => Number(z.id) === Number(vs.zone_id)
                  );
                }
              }
            }
            break;
          }
          case 'gram_panchayat': {
            gp = gramPanchayats.find((g) => Number(g.id) === areaId);
            if (gp) {
              taluka = talukas.find(
                (t) => Number(t.id) === Number(gp.taluka_id)
              );
              circle = circles.find(
                (c) => Number(c.id) === Number(gp.circle_id)
              );
          if (circle) {
            block = blocks.find(
              (b) => Number(b.id) === Number(circle.block_id)
            );
          }
            }
            if (taluka) {
              vs = vidhanSabhas.find(
                (v) => Number(v.id) === Number(taluka.vidhan_sabha_id)
              );
              if (vs) {
                zone = zones.find(
                  (z) => Number(z.id) === Number(vs.zone_id)
                );
              }
            }
            break;
          }
          case 'village': {
            village = villages.find((v) => Number(v.id) === areaId);
            if (village) {
              gp = gramPanchayats.find(
                (g) => Number(g.id) === Number(village.gram_panchayat_id)
              );
            }
            if (gp) {
              taluka = talukas.find(
                (t) => Number(t.id) === Number(gp.taluka_id)
              );
              circle = circles.find(
                (c) => Number(c.id) === Number(gp.circle_id)
              );
          if (circle) {
            block = blocks.find(
              (b) => Number(b.id) === Number(circle.block_id)
            );
          }
            }
            if (taluka) {
              vs = vidhanSabhas.find(
                (v) => Number(v.id) === Number(taluka.vidhan_sabha_id)
              );
              if (vs) {
                zone = zones.find(
                  (z) => Number(z.id) === Number(vs.zone_id)
                );
              }
            }
            break;
          }
          default:
            break;
        }

        const nameMap = {
          zone_id: zone && zone.name,
          vidhan_sabha_id: vs && vs.name,
          taluka_id: taluka && taluka.name,
          block_id: block && block.name,
          circle_id: circle && circle.name,
          gram_panchayat_id: gp && gp.name,
          village_id: village && village.name,
        };
        const name = nameMap[field.name];
        return name != null && String(name).trim() !== '' ? String(name) : '—';
      }
    }

    const val = row[field.name];
    if (field.type === 'radio') {
      // Types of Units: fallback to name when type_category is null (old records)
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
      if (!opt) return '—';
      if (field.optionsTable === 'unit-types') return opt.type_category || opt.name || String(val);
      return field.optionLabel ? (opt[field.optionLabel] ?? opt.name) : opt.name;
    }
    if (field.type === 'selectFromLevel' && field.optionsTableMap && field.levelField) {
      const levelVal = row[field.levelField];
      const optionsTable = levelVal ? field.optionsTableMap[levelVal] : null;
      if (!optionsTable || !options[optionsTable]) return '—';
      const list = options[optionsTable];
      const opt = list.find((o) => o.id == val || (o.client_id != null && String(o.client_id) === String(val)));
      return opt ? (opt.name || String(val)) : (val != null ? String(val) : '—');
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
    if (table === 'circles' && payload.block_id && opts['blocks']) {
      const block = opts['blocks'].find((b) => b.id === Number(payload.block_id) || b.id === payload.block_id);
      if (block) {
        payload.taluka_id = block.taluka_id;
        if (block.taluka_id && opts['talukas']) {
          const taluka = opts['talukas'].find((t) => t.id === Number(block.taluka_id) || t.id === block.taluka_id);
          if (taluka) payload.state_id = taluka.state_id;
        }
      }
    }
    if (table === 'gram-panchayats' && payload.circle_id && opts['circles']) {
      const circle = opts['circles'].find((c) => c.id === Number(payload.circle_id) || c.id === payload.circle_id);
      if (circle) payload.taluka_id = circle.taluka_id;
    }
    if (table === 'villages' && payload.gram_panchayat_id && opts['gram-panchayats']) {
      const gp = opts['gram-panchayats'].find((p) => p.id === Number(payload.gram_panchayat_id) || p.id === payload.gram_panchayat_id);
      if (gp) payload.taluka_id = gp.taluka_id;
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
      // Send _id select values as numbers so backend stores FK correctly (e.g. parent_id, area_id)
      if (f.name.endsWith('_id') && val != null && val !== '') {
        const n = Number(val);
        val = Number.isNaN(n) ? val : n;
      }
      payload[f.name] = val;
    });

    // For position-allotments, derive level_type + area_id from the deepest selected location
    if (table === 'position-allotments') {
      const order = [
        'zone_id',
        'vidhan_sabha_id',
        'taluka_id',
        'block_id',
        'circle_id',
        'gram_panchayat_id',
        'village_id',
      ];
      const levelMap = {
        zone_id: 'zone',
        vidhan_sabha_id: 'vidhan_sabha',
        taluka_id: 'taluka',
        block_id: 'block',
        circle_id: 'circle',
        gram_panchayat_id: 'gram_panchayat',
        village_id: 'village',
      };
      let pickedField = null;
      for (let i = order.length - 1; i >= 0; i--) {
        const fieldName = order[i];
        const v = payload[fieldName];
        if (v != null && v !== '') {
          pickedField = fieldName;
          break;
        }
      }
      if (!pickedField) {
        setDropdownAlert('Please select at least one location (Zone / Vidhan Sabha / Taluka / Block / Circle / Gram Panchayat / Village).');
        return;
      }
      payload.level_type = levelMap[pickedField];
      payload.area_id = payload[pickedField];
    }
    // Validate dropdowns: if any required select field is empty, show custom alert and stop.
    // For position-allotments, location selects are validated via the custom logic above,
    // so we skip them here to allow stopping at any depth (e.g. Block only).
    const locationSelects =
      table === 'position-allotments'
        ? ['zone_id', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id']
        : [];
    for (const f of fields) {
      if (f.type === 'select' && f.required !== false) {
        if (locationSelects.includes(f.name)) continue;
        const val = payload[f.name];
        if (val == null || val === '') {
          setDropdownAlert(`Please fill this field: ${f.label}`);
          return;
        }
      }
    }

    // Units: require Unit Name, Types of Units, and Status — show alert listing missing fields
    if (table === 'units') {
      const missing = [];
      if (!payload.name || !String(payload.name).trim()) missing.push('Unit Name');
      if (payload.unit_type_id == null || payload.unit_type_id === '') missing.push('Types of Units');
      if (payload.status == null || payload.status === '') missing.push('Status');
      if (missing.length > 0) {
        setDropdownAlert(`Please fill: ${missing.join(', ')}`);
        return;
      }
    }

    // Types of Units: type select from DB or "Other"; use type_category as name for DB
    if (table === 'unit-types') {
      let typeVal = payload.type_category;
      if (typeVal === '__OTHER__') {
        typeVal = form.type_category_other != null ? String(form.type_category_other).trim() : '';
        if (!typeVal) {
          setDropdownAlert('Please enter a type when "Other" is selected');
          return;
        }
        payload.type_category = typeVal;
      }
      if (!payload.type_category || !String(payload.type_category).trim()) {
        setDropdownAlert('Please select a type');
        return;
      }
      payload.name = payload.type_category;
    } else if (fields.some((f) => f.name === 'name')) {
      // Only require name when this table has a name field (e.g. most masters; not position-allotments)
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
      // For selectWithOther (e.g. unit-types), if value is not in static list, show "Other" and store in _other
      if (f.type === 'selectWithOther' && f.optionStatic && row[f.name]) {
        const val = row[f.name];
        const inStatic = f.optionStatic.includes(val);
        const dbOpts = options[f.optionsTable] || [];
        const inDb = dbOpts.some((o) => (f.optionValue ? o[f.optionValue] : o.id) === val);
        if (!inStatic && !inDb) {
          values[f.name] = '__OTHER__';
          values[f.name + '_other'] = val;
        }
      }
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
  const isDesignationTable = table === 'designations';

  const filteredData =
    table === 'position-allotments'
      ? filterPositionAllotments(data, filters, options)
      : data;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{title}</h1>

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
              ) : f.type === 'selectWithOther' ? (
                (() => {
                  const dbOpts = options[f.optionsTable] || [];
                  const staticList = f.optionStatic || [];
                  const dbValues = (dbOpts || [])
                    .map((o) => (f.optionLabel ? (o[f.optionLabel] ?? o[f.optionValue]) : (o[f.optionValue] ?? o.name)))
                    .filter((v) => v != null && v !== '');
                  const fromDbNotStatic = [...new Set(dbValues)].filter((v) => !staticList.includes(v));
                  const otherKey = f.name + '_other';
                  const isOther = form[f.name] === '__OTHER__';
                  return (
                    <>
                      <select
                        name={f.name}
                        value={form[f.name] != null ? form[f.name] : ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                        style={styles.input}
                      >
                        <option value="">Select...</option>
                        {staticList.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        {fromDbNotStatic.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                        <option value="__OTHER__">Other...</option>
                      </select>
                      {isOther && (
                        <input
                          type="text"
                          name={otherKey}
                          value={form[otherKey] != null ? form[otherKey] : ''}
                          onChange={(e) => setForm((prev) => ({ ...prev, [otherKey]: e.target.value }))}
                          placeholder={`Enter ${f.label.toLowerCase()}`}
                          style={{ ...styles.input, marginTop: 6 }}
                        />
                      )}
                    </>
                  );
                })()
              ) : f.type === 'select' ? (
                (() => {
                  let dbOpts = options[f.optionsTable] || [];
                  // When editing a self-referential field (e.g. designations parent_id), exclude current row from options
                  if (editingId && f.optionsTable === table && f.name === 'parent_id') {
                    dbOpts = dbOpts.filter(
                      (o) => String(o.client_id != null ? o.client_id : o.id) !== String(editingId)
                    );
                  }
                  // Special cascade for position-allotments: Zone → Vidhan Sabha → Taluka → Block → Circle → Gram Panchayat → Village
                  if (table === 'position-allotments') {
                    if (f.name === 'vidhan_sabha_id') {
                      const zoneId = form.zone_id != null ? Number(form.zone_id) : null;
                      if (zoneId != null && !Number.isNaN(zoneId)) {
                        dbOpts = dbOpts.filter((o) => o.zone_id === zoneId);
                      } else {
                        dbOpts = [];
                      }
                    } else if (f.name === 'taluka_id') {
                      const vsId = form.vidhan_sabha_id != null ? Number(form.vidhan_sabha_id) : null;
                      if (vsId != null && !Number.isNaN(vsId)) {
                        dbOpts = dbOpts.filter((o) => o.vidhan_sabha_id === vsId);
                      } else {
                        dbOpts = [];
                      }
                    } else if (f.name === 'block_id') {
                      const talukaId = form.taluka_id != null ? Number(form.taluka_id) : null;
                      if (talukaId != null && !Number.isNaN(talukaId)) {
                        dbOpts = dbOpts.filter((o) => o.taluka_id === talukaId);
                      } else {
                        dbOpts = [];
                      }
                    } else if (f.name === 'circle_id') {
                      const blockId = form.block_id != null ? Number(form.block_id) : null;
                      if (blockId != null && !Number.isNaN(blockId)) {
                        dbOpts = dbOpts.filter((o) => o.block_id === blockId);
                      } else {
                        dbOpts = [];
                      }
                    } else if (f.name === 'gram_panchayat_id') {
                      const circleId = form.circle_id != null ? Number(form.circle_id) : null;
                      if (circleId != null && !Number.isNaN(circleId)) {
                        dbOpts = dbOpts.filter((o) => o.circle_id === circleId);
                      } else {
                        dbOpts = [];
                      }
                    } else if (f.name === 'village_id') {
                      const gpId = form.gram_panchayat_id != null ? Number(form.gram_panchayat_id) : null;
                      if (gpId != null && !Number.isNaN(gpId)) {
                        dbOpts = dbOpts.filter((o) => o.gram_panchayat_id === gpId);
                      } else {
                        dbOpts = [];
                      }
                    }
                  }
                  const staticList = f.optionStatic || [];
                  const staticOpts = staticList
                    .map((s) =>
                      typeof s === 'object' && s !== null && ('id' in s || 'name' in s)
                        ? s
                        : { id: s, name: s }
                    )
                    .filter(
                      (s) =>
                        !dbOpts.some(
                          (o) => (o.id != null && o.id === s.id) || o.id === s.id
                        )
                    );
                  const selectOptions = [...dbOpts, ...staticOpts];
                  const isLocationCascade =
                    table === 'position-allotments' &&
                    ['zone_id', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id'].includes(
                      f.name
                    );
                  const parentMap = {
                    vidhan_sabha_id: 'zone_id',
                    taluka_id: 'vidhan_sabha_id',
                    block_id: 'taluka_id',
                    circle_id: 'block_id',
                    gram_panchayat_id: 'circle_id',
                    village_id: 'gram_panchayat_id',
                  };
                  const parentField = parentMap[f.name];
                  const disabled =
                    isLocationCascade && parentField ? !form[parentField] : false;
                  return (
                    <select
                      name={f.name}
                      value={form[f.name] != null ? form[f.name] : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const useNumber =
                          raw !== '' &&
                          ((!f.optionValue && f.name.endsWith('_id')) ||
                            f.optionValue === 'id');
                        setForm((prev) => {
                          const next = {
                            ...prev,
                            [f.name]: raw === '' ? null : useNumber ? Number(raw) : raw,
                          };
                          // Clear deeper cascade fields for position-allotments
                          if (table === 'position-allotments') {
                            const order = [
                              'zone_id',
                              'vidhan_sabha_id',
                              'taluka_id',
                              'block_id',
                              'circle_id',
                              'gram_panchayat_id',
                              'village_id',
                            ];
                            const idx = order.indexOf(f.name);
                            if (idx !== -1) {
                              for (let i = idx + 1; i < order.length; i++) {
                                next[order[i]] = null;
                              }
                            }
                          }
                          const dependent = fields.find(
                            (x) => x.type === 'selectFromLevel' && x.levelField === f.name
                          );
                          if (dependent) next[dependent.name] = null;
                          return next;
                        });
                      }}
                      style={styles.input}
                      disabled={disabled}
                    >
                      <option value="">{f.optionPlaceholder || 'Select...'}</option>
                      {selectOptions.map((opt) => {
                        const optValue =
                          f.optionValue != null ? opt[f.optionValue] ?? '' : opt.id;
                        const optLabel =
                          f.optionLabel != null ? opt[f.optionLabel] ?? opt.name : opt.name;
                        return (
                          <option
                            key={optValue !== '' ? optValue : opt.id}
                            value={optValue}
                          >
                            {optLabel}
                          </option>
                        );
                      })}
                    </select>
                  );
                })()
              ) : f.type === 'selectFromLevel' ? (
                (() => {
                  const levelVal = form[f.levelField] || '';
                  const optionsTable = levelVal ? f.optionsTableMap[levelVal] : null;
                  const areaOpts = optionsTable ? (options[optionsTable] || []) : [];
                  return (
                    <select
                      name={f.name}
                      value={form[f.name] != null ? form[f.name] : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const num = raw !== '' ? Number(raw) : null;
                        setForm((prev) => ({ ...prev, [f.name]: num }));
                      }}
                      style={styles.input}
                      disabled={!levelVal}
                    >
                      <option value="">{f.optionPlaceholder || 'Select...'}</option>
                      {areaOpts.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
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
                (() => {
                  // Special read-only auto-derived Level field for position-allotments
                  if (table === 'position-allotments' && f.name === 'level_type') {
                    const order = [
                      'zone_id',
                      'vidhan_sabha_id',
                      'taluka_id',
                      'block_id',
                      'circle_id',
                      'gram_panchayat_id',
                      'village_id',
                    ];
                    const labelMap = {
                      zone_id: 'Zone',
                      vidhan_sabha_id: 'Vidhan Sabha',
                      taluka_id: 'Taluka',
                      block_id: 'Block',
                      circle_id: 'Panchayat Samiti Circle',
                      gram_panchayat_id: 'Gram Panchayat',
                      village_id: 'Village',
                    };
                    let levelLabel = '';
                    for (let i = order.length - 1; i >= 0; i--) {
                      const fieldName = order[i];
                      const v = form[fieldName];
                      if (v != null && v !== '') {
                        levelLabel = labelMap[fieldName];
                        break;
                      }
                    }
                    return (
                      <input
                        type="text"
                        name={f.name}
                        value={levelLabel}
                        readOnly
                        placeholder="Auto from selection"
                        style={{ ...styles.input, backgroundColor: '#f9fafb' }}
                      />
                    );
                  }

                  return (
                    <input
                      type="text"
                      inputMode={f.type === 'number' || f.numericOnly ? 'numeric' : undefined}
                      name={f.name}
                      value={form[f.name] != null ? form[f.name] : ''}
                      onChange={(e) => {
                        let v = e.target.value;
                        if (f.type === 'number') {
                          v = v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
                        } else if (f.numericOnly) {
                          v = v.replace(/\D/g, '');
                        } else {
                          v = e.target.value;
                        }
                        setForm((prev) => ({ ...prev, [f.name]: v }));
                      }}
                      placeholder={f.label}
                      style={styles.input}
                    />
                  );
                })()
              )}
            </div>
          ))}
          <div style={styles.actions}>
            <button
              type="submit"
              disabled={submitLoading}
              style={editingId ? { ...styles.btnPrimary, ...styles.btnPrimaryEdit } : styles.btnPrimary}
            >
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

        <div style={isDesignationTable ? styles.tableWrapCompact : styles.tableWrap}>
        <table style={isDesignationTable ? styles.tableCompact : styles.table}>
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
            {table === 'position-allotments' && (
              <tr>
                <th style={styles.thFilter}>
                  <button
                    type="button"
                    style={styles.filterResetBtn}
                    onClick={() =>
                      setFilters({
                        zone_id: null,
                        vidhan_sabha_id: null,
                        taluka_id: null,
                        block_id: null,
                        circle_id: null,
                        gram_panchayat_id: null,
                        village_id: null,
                        business_position_id: null,
                        business_category_id: null,
                        user_name: '',
                      })
                    }
                  >
                    Reset
                  </button>
                </th>
                {fields.map((f) => {
                  if (f.name === 'zone_id') {
                    return (
                      <th key={`${f.name}-filter`} style={styles.thFilter}>
                        <select
                          value={filters.zone_id || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              zone_id: e.target.value || null,
                            }))
                          }
                          style={styles.filterInput}
                        >
                          <option value="">All</option>
                          {(options.zones || []).map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.name}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (f.name === 'vidhan_sabha_id') {
                    return (
                      <th key={`${f.name}-filter`} style={styles.thFilter}>
                        <select
                          value={filters.vidhan_sabha_id || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              vidhan_sabha_id: e.target.value || null,
                            }))
                          }
                          style={styles.filterInput}
                        >
                          <option value="">All</option>
                          {(options['vidhan-sabhas'] || []).map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (f.name === 'taluka_id') {
                    return (
                      <th key={`${f.name}-filter`} style={styles.thFilter}>
                        <select
                          value={filters.taluka_id || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              taluka_id: e.target.value || null,
                            }))
                          }
                          style={styles.filterInput}
                        >
                          <option value="">All</option>
                          {(options.talukas || []).map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (f.name === 'block_id') {
                    return (
                      <th key={`${f.name}-filter`} style={styles.thFilter}>
                        <select
                          value={filters.block_id || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              block_id: e.target.value || null,
                            }))
                          }
                          style={styles.filterInput}
                        >
                          <option value="">All</option>
                          {(options.blocks || []).map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (f.name === 'circle_id') {
                    return (
                      <th key={`${f.name}-filter`} style={styles.thFilter}>
                        <select
                          value={filters.circle_id || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              circle_id: e.target.value || null,
                            }))
                          }
                          style={styles.filterInput}
                        >
                          <option value="">All</option>
                          {(options.circles || []).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (f.name === 'gram_panchayat_id') {
                    return (
                      <th key={`${f.name}-filter`} style={styles.thFilter}>
                        <select
                          value={filters.gram_panchayat_id || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              gram_panchayat_id: e.target.value || null,
                            }))
                          }
                          style={styles.filterInput}
                        >
                          <option value="">All</option>
                          {(options['gram-panchayats'] || []).map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (f.name === 'village_id') {
                    return (
                      <th key={`${f.name}-filter`} style={styles.thFilter}>
                        <select
                          value={filters.village_id || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              village_id: e.target.value || null,
                            }))
                          }
                          style={styles.filterInput}
                        >
                          <option value="">All</option>
                          {(options.villages || []).map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (f.name === 'business_position_id') {
                    return (
                      <th key={`${f.name}-filter`} style={styles.thFilter}>
                        <select
                          value={filters.business_position_id || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              business_position_id: e.target.value || null,
                            }))
                          }
                          style={styles.filterInput}
                        >
                          <option value="">All</option>
                          {(options.designations || []).map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (f.name === 'business_category_id') {
                    return (
                      <th key={`${f.name}-filter`} style={styles.thFilter}>
                        <select
                          value={filters.business_category_id || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              business_category_id: e.target.value || null,
                            }))
                          }
                          style={styles.filterInput}
                        >
                          <option value="">All</option>
                          {(options['business-categories'] || []).map((bc) => (
                            <option key={bc.id} value={bc.id}>
                              {bc.name}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (f.name === 'user_name') {
                    return (
                      <th key={`${f.name}-filter`} style={styles.thFilter}>
                        <input
                          type="text"
                          value={filters.user_name || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              user_name: e.target.value || '',
                            }))
                          }
                          placeholder="Search user"
                          style={styles.filterInput}
                        />
                      </th>
                    );
                  }
                  return <th key={`${f.name}-filter`} />;
                })}
                <th />
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={fields.length + 2} style={styles.td}>
                  Loading…
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 2} style={styles.td}>
                  No data.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
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
                    <div style={styles.tableActions}>
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
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
        </div>
        {table === 'designations' && data.length > 0 && (
          <div style={styles.hierarchyWrap}>
            <h2 style={styles.hierarchyTitle}>Designation Hierarchy</h2>
            <ul style={styles.hierarchyList}>
              {buildDesignationTree(data).map((node) => (
                <HierarchyItem key={node.id} node={node} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function filterPositionAllotments(rows, filters, options) {
  if (!rows || rows.length === 0) return [];
  const zones = options.zones || [];
  const vidhanSabhas = options['vidhan-sabhas'] || [];
  const talukas = options.talukas || [];
  const blocks = options.blocks || [];
  const circles = options.circles || [];
  const gramPanchayats = options['gram-panchayats'] || [];
  const villages = options.villages || [];

  const numOrNull = (v) => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const fZone = numOrNull(filters.zone_id);
  const fVs = numOrNull(filters.vidhan_sabha_id);
  const fTaluka = numOrNull(filters.taluka_id);
  const fBlock = numOrNull(filters.block_id);
  const fCircle = numOrNull(filters.circle_id);
  const fGp = numOrNull(filters.gram_panchayat_id);
  const fVillage = numOrNull(filters.village_id);
  const fPos = numOrNull(filters.business_position_id);
  const fCat = numOrNull(filters.business_category_id);
  const fUser = (filters.user_name || '').trim().toLowerCase();

  return rows.filter((row) => {
    if (fPos != null && numOrNull(row.business_position_id) !== fPos) return false;
    if (fCat != null && numOrNull(row.business_category_id) !== fCat) return false;
    if (fUser) {
      const u = (row.user_name || '').toString().toLowerCase();
      if (!u.includes(fUser)) return false;
    }

    const levelType = row.level_type;
    const areaId = numOrNull(row.area_id);
    if (
      fZone == null &&
      fVs == null &&
      fTaluka == null &&
      fBlock == null &&
      fCircle == null &&
      fGp == null &&
      fVillage == null
    ) {
      return true;
    }
    if (!levelType || areaId == null) return false;

    let zone = null;
    let vs = null;
    let taluka = null;
    let block = null;
    let circle = null;
    let gp = null;
    let village = null;

    switch (levelType) {
      case 'zone': {
        zone = zones.find((z) => numOrNull(z.id) === areaId) || null;
        break;
      }
      case 'vidhan_sabha': {
        vs = vidhanSabhas.find((v) => numOrNull(v.id) === areaId) || null;
        if (vs) {
          zone = zones.find((z) => numOrNull(z.id) === numOrNull(vs.zone_id)) || null;
        }
        break;
      }
      case 'taluka': {
        taluka = talukas.find((t) => numOrNull(t.id) === areaId) || null;
        if (taluka) {
          vs =
            vidhanSabhas.find(
              (v) => numOrNull(v.id) === numOrNull(taluka.vidhan_sabha_id)
            ) || null;
          if (vs) {
            zone =
              zones.find((z) => numOrNull(z.id) === numOrNull(vs.zone_id)) || null;
          }
        }
        break;
      }
      case 'block': {
        block = blocks.find((b) => numOrNull(b.id) === areaId) || null;
        if (block) {
          taluka =
            talukas.find((t) => numOrNull(t.id) === numOrNull(block.taluka_id)) ||
            null;
          if (taluka) {
            vs =
              vidhanSabhas.find(
                (v) => numOrNull(v.id) === numOrNull(taluka.vidhan_sabha_id)
              ) || null;
            if (vs) {
              zone =
                zones.find((z) => numOrNull(z.id) === numOrNull(vs.zone_id)) || null;
            }
          }
        }
        break;
      }
      case 'circle': {
        circle = circles.find((c) => numOrNull(c.id) === areaId) || null;
        if (circle) {
          block =
            blocks.find((b) => numOrNull(b.id) === numOrNull(circle.block_id)) ||
            null;
          if (block) {
            taluka =
              talukas.find((t) => numOrNull(t.id) === numOrNull(block.taluka_id)) ||
              null;
          }
          if (taluka) {
            vs =
              vidhanSabhas.find(
                (v) => numOrNull(v.id) === numOrNull(taluka.vidhan_sabha_id)
              ) || null;
            if (vs) {
              zone =
                zones.find((z) => numOrNull(z.id) === numOrNull(vs.zone_id)) || null;
            }
          }
        }
        break;
      }
      case 'gram_panchayat': {
        gp = gramPanchayats.find((g) => numOrNull(g.id) === areaId) || null;
        if (gp) {
          taluka =
            talukas.find((t) => numOrNull(t.id) === numOrNull(gp.taluka_id)) ||
            null;
          circle =
            circles.find((c) => numOrNull(c.id) === numOrNull(gp.circle_id)) ||
            null;
          if (circle) {
            block =
              blocks.find((b) => numOrNull(b.id) === numOrNull(circle.block_id)) ||
              null;
          }
        }
        if (taluka) {
          vs =
            vidhanSabhas.find(
              (v) => numOrNull(v.id) === numOrNull(taluka.vidhan_sabha_id)
            ) || null;
          if (vs) {
            zone =
              zones.find((z) => numOrNull(z.id) === numOrNull(vs.zone_id)) || null;
          }
        }
        break;
      }
      case 'village': {
        village = villages.find((v) => numOrNull(v.id) === areaId) || null;
        if (village) {
          gp =
            gramPanchayats.find(
              (g) => numOrNull(g.id) === numOrNull(village.gram_panchayat_id)
            ) || null;
        }
        if (gp) {
          taluka =
            talukas.find((t) => numOrNull(t.id) === numOrNull(gp.taluka_id)) ||
            null;
          circle =
            circles.find((c) => numOrNull(c.id) === numOrNull(gp.circle_id)) ||
            null;
          if (circle) {
            block =
              blocks.find((b) => numOrNull(b.id) === numOrNull(circle.block_id)) ||
              null;
          }
        }
        if (taluka) {
          vs =
            vidhanSabhas.find(
              (v) => numOrNull(v.id) === numOrNull(taluka.vidhan_sabha_id)
            ) || null;
          if (vs) {
            zone =
              zones.find((z) => numOrNull(z.id) === numOrNull(vs.zone_id)) || null;
          }
        }
        break;
      }
      default:
        break;
    }

    if (fZone != null && (!zone || numOrNull(zone.id) !== fZone)) return false;
    if (fVs != null && (!vs || numOrNull(vs.id) !== fVs)) return false;
    if (fTaluka != null && (!taluka || numOrNull(taluka.id) !== fTaluka))
      return false;
    if (fBlock != null && (!block || numOrNull(block.id) !== fBlock)) return false;
    if (fCircle != null && (!circle || numOrNull(circle.id) !== fCircle))
      return false;
    if (fGp != null && (!gp || numOrNull(gp.id) !== fGp)) return false;
    if (fVillage != null && (!village || numOrNull(village.id) !== fVillage))
      return false;

    return true;
  });
}

function buildDesignationTree(rows) {
  if (!rows || rows.length === 0) return [];

  // One node per row
  const nodes = rows.map((r) => ({ ...r, children: [] }));

  // Lookup by both id and client_id → same node
  const byKey = new Map();
  nodes.forEach((node) => {
    const dbId = node.id != null ? String(node.id) : null;
    const clientId = node.client_id != null ? String(node.client_id) : null;
    if (dbId) byKey.set(dbId, node);
    if (clientId && !byKey.has(clientId)) byKey.set(clientId, node);
  });

  const roots = [];

  const isCyclic = (child, target) => {
    if (!child || !child.children) return false;
    for (const c of child.children) {
      if (c === target || isCyclic(c, target)) return true;
    }
    return false;
  };

  // Attach each node to its parent at most once
  nodes.forEach((node) => {
    const parentRaw =
      node.parent_id !== undefined && node.parent_id !== null && node.parent_id !== ''
        ? String(node.parent_id)
        : null;

    if (!parentRaw) {
      roots.push(node);
      return;
    }

    const parent = byKey.get(parentRaw) || null;
    if (!parent || parent === node || isCyclic(node, parent)) {
      // Missing/invalid parent or cycle → treat as root
      roots.push(node);
      return;
    }

    parent.children.push(node);
  });

  // Sort by name for stable display
  const sortByName = (a, b) => {
    const an = (a.name || '').toString().toLowerCase();
    const bn = (b.name || '').toString().toLowerCase();
    return an.localeCompare(bn);
  };

  const dedupRoots = roots.filter((n, i) => roots.indexOf(n) === i);
  dedupRoots.sort(sortByName);
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) node.children.sort(sortByName);
  });

  return dedupRoots;
}

function HierarchyItem({ node }) {
  const label = node.name != null && String(node.name).trim() !== '' ? String(node.name).trim() : '—';
  return (
    <li style={styles.hierarchyItem}>
      <div style={styles.hierarchyLabel}>{label}</div>
      {node.children && node.children.length > 0 && (
        <ul style={styles.hierarchySubList}>
          {node.children.map((child) => (
            <HierarchyItem key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
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
    padding: '1.5rem 2rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 700,
    textAlign: 'center',
    color: '#8B1538',
  },
  filterRow: {
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
    padding: '0.5rem',
    borderRadius: 4,
    border: '1px solid #ddd',
    background: '#fafafa',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem 1rem',
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 2 },
  filterLabel: { fontSize: '0.75rem', fontWeight: 500, color: '#555' },
  filterSelect: {
    minWidth: 140,
    padding: '0.3rem 0.45rem',
    borderRadius: 4,
    border: '1px solid #bbb',
    fontSize: '0.8rem',
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
  btnPrimaryEdit: {
    background: '#f97316',
  },
  btnSecondary: {
    padding: '0.5rem 1rem',
    borderRadius: 4,
    border: '1px solid #666',
    background: '#fff',
    color: '#333',
  },
  tableActions: {
    display: 'inline-flex',
    gap: '0.4rem',
    alignItems: 'center',
  },
  btnEdit: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.85rem',
    borderRadius: 4,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
  },
  btnDelete: {
    padding: '0.35rem 0.6rem',
    fontSize: '0.85rem',
    borderRadius: 4,
    border: 'none',
    background: '#8B1538',
    color: '#fff',
  },
  tableWrap: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '60vh',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 4,
  },
  tableWrapCompact: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '40vh',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 4,
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' },
  tableCompact: { width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' },
  th: {
    textAlign: 'left',
    padding: '0.3rem 0.4rem',
    borderBottom: '2px solid #4a4a4e',
    color: '#333',
    fontWeight: 600,
    background: '#f5f5f5',
    whiteSpace: 'nowrap',
  },
  thFilter: {
    padding: '0.2rem 0.35rem',
    background: '#f9fafb',
  },
  td: {
    padding: '0.3rem 0.4rem',
    borderBottom: '1px solid #ddd',
    whiteSpace: 'nowrap',
  },
  filterInput: {
    width: '100%',
    minWidth: 100,
    padding: '0.2rem 0.3rem',
    borderRadius: 4,
    border: '1px solid #ccc',
    fontSize: '0.75rem',
  },
  filterResetBtn: {
    padding: '0.2rem 0.4rem',
    fontSize: '0.75rem',
    borderRadius: 4,
    border: '1px solid #9ca3af',
    background: '#f9fafb',
    cursor: 'pointer',
  },
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
  hierarchyWrap: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#fff',
    borderRadius: 4,
    border: '1px solid #ddd',
  },
  hierarchyTitle: {
    margin: '0 0 0.75rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#333',
  },
  hierarchyList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  hierarchyItem: {
    position: 'relative',
    paddingLeft: 12,
  },
  hierarchyLabel: {
    fontWeight: 500,
  },
  hierarchySubList: {
    listStyle: 'none',
    margin: 0,
    marginTop: 4,
    marginLeft: 12,
    paddingLeft: 12,
    borderLeft: '1px solid #ccc',
  },
};
