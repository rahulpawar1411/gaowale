import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registrationsApi, masterApi } from '../services/api';

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
};

const MASTER_ID_TO_TABLE = {
  country_id: { table: 'countries', labelField: 'name' },
  country_division_id: { table: 'country-divisions', labelField: 'name' },
  state_division_id: { table: 'state-divisions', labelField: 'name' },
  state_id: { table: 'states', labelField: 'name' },
  state_sub_division_id: { table: 'state-sub-divisions', labelField: 'name' },
  region_id: { table: 'regions', labelField: 'name' },
  zone_id: { table: 'zones', labelField: 'name' },
  vidhan_sabha_id: { table: 'vidhan-sabhas', labelField: 'name' },
  taluka_id: { table: 'talukas', labelField: 'name' },
  block_id: { table: 'blocks', labelField: 'name' },
  circle_id: { table: 'circles', labelField: 'name' },
  gram_panchayat_id: { table: 'gram-panchayats', labelField: 'name' },
  village_id: { table: 'villages', labelField: 'name' },
  business_category_id: { table: 'business-categories', labelField: 'name' },
  business_sub_category_id: { table: 'business-sub-categories', labelField: 'name' },
  business_type_id: { table: 'business-types', labelField: 'name' },
  product_id: { table: 'products', labelField: 'name' },
  unit_id: { table: 'units', labelField: 'name' },
  business_position_id: { table: 'designations', labelField: 'name' },
  officer_department_position_id: { table: 'designations', labelField: 'name' },
  incharge_user_id: { table: 'management-registrations', labelField: 'name' },
};

function isFileField(key, value) {
  if (value == null) return false;
  const lowerKey = key.toLowerCase();
  if (
    lowerKey === 'photo' ||
    lowerKey.includes('path') ||
    lowerKey.endsWith('_file') ||
    lowerKey.includes('receipt') ||
    lowerKey.includes('certificate') ||
    lowerKey.includes('passport') ||
    lowerKey.includes('book')
  ) {
    return true;
  }
  if (typeof value === 'string' && /\.(pdf|jpe?g|png|gif|webp|docx?)$/i.test(value)) {
    return true;
  }
  return false;
}

function isImageValue(value) {
  if (!value || typeof value !== 'string') return false;
  return /\.(jpe?g|png|gif|webp)$/i.test(value);
}

function getFileUrl(raw) {
  if (!raw) return '';
  const v = typeof raw === 'string' ? raw : String(raw);
  // If already absolute or starts with /files, use as-is
  if (/^https?:\/\//i.test(v) || v.startsWith('/files/')) return v;
  // If it contains an uploads folder path, map to /files/<filename>
  const parts = v.split(/[\\/]/);
  const filename = parts[parts.length - 1];
  return `/files/${filename}`;
}

function niceFieldLabel(key) {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/_id$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function getSectionForKey(key) {
  const k = key.toLowerCase();

  // Nominee related
  if (k.startsWith('nominee_')) return 'nominee';

  // Financial / tracking
  if (
    k.includes('net_worth') ||
    k.includes('payment_amount') ||
    k.includes('contribution_amount') ||
    k.includes('incentive_amount') ||
    k.includes('work_form_') ||
    k.includes('receipt') ||
    k.includes('income_certificate')
  ) {
    return 'financial';
  }

  // Business information
  if (
    k.includes('business_') ||
    k.includes('product') ||
    k.includes('officer_department_position') ||
    k.includes('incharge_') ||
    k.includes('target_to_fill_farm') ||
    k.includes('target_completed_so_far') ||
    k.includes('existing_terms_according_to_target')
  ) {
    return 'business';
  }

  // Geographic information
  if (
    k.includes('country') ||
    k.includes('state') ||
    k.includes('region') ||
    k.includes('zone') ||
    k.includes('vidhan_sabha') ||
    k.includes('taluka') ||
    k.includes('block') ||
    k.includes('circle') ||
    k.includes('gram_panchayat') ||
    k.includes('village') ||
    k === 'pincode'
  ) {
    return 'geographic';
  }

  // Personal information
  if (
    k.includes('date_of_birth') ||
    k === 'date_of_birth' ||
    k === 'dob' ||
    k.includes('blood_group') ||
    k.includes('caste') ||
    k.includes('education') ||
    k.includes('occupation') ||
    k.includes('mobile_number') ||
    k.includes('phone_number') ||
    k.includes('whatsapp_number') ||
    k.includes('pan_card') ||
    k.includes('aadhar') ||
    k.includes('voter_id') ||
    k === 'gender'
  ) {
    return 'personal';
  }

  return 'other';
}

function formatValue(key, value, masters) {
  if (value === null || value === undefined || value === '') return '-';
  if (key.endsWith('_id') && masters) {
    const cfg = MASTER_ID_TO_TABLE[key];
    if (cfg) {
      const list = masters[cfg.table] || [];
      const num = Number(value);
      const rec =
        list.find((r) => Number(r.id) === num) ||
        list.find((r) => r.id === value);
      if (rec) {
        const labelField = cfg.labelField || 'name';
        if (rec[labelField]) return String(rec[labelField]);
      }
    }
  }
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

export default function UserDetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoadError, setPreviewLoadError] = useState(false);
  const [masters, setMasters] = useState({});
  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [hasPassword, setHasPassword] = useState(false);

  const fileBaseUrl =
    typeof import.meta.env?.VITE_API_ORIGIN === 'string' && import.meta.env.VITE_API_ORIGIN
      ? import.meta.env.VITE_API_ORIGIN.replace(/\/$/, '')
      : window.location.origin;
  const previewSrc = preview
    ? preview.url.startsWith('http')
      ? preview.url
      : `${fileBaseUrl}${preview.url}`
    : '';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let api;
        if (type === 'management') api = registrationsApi.management;
        else if (type === 'farmer') api = registrationsApi.farmer;
        else if (type === 'customer') api = registrationsApi.customer;
        else if (type === 'lakhpatiDidi') api = registrationsApi.lakhpatiDidi;
        else {
          setError('Unknown user type');
          setLoading(false);
          return;
        }
        const res = await api.getById(id);
        if (cancelled) return;
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || 'User not found');
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load user details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  useEffect(() => {
    if (!data) return;
    const needed = new Set();
    Object.keys(data).forEach((key) => {
      const cfg = MASTER_ID_TO_TABLE[key];
      if (cfg && !masters[cfg.table]) {
        needed.add(cfg.table);
      }
    });
    if (needed.size === 0) return;
    needed.forEach((table) => {
      if (table === 'management-registrations') {
        // "incharge_user_id" comes from management registrations, which is not a master table.
        registrationsApi.management
          .getAll()
          .then((res) => {
            const list = res && res.success && Array.isArray(res.data) ? res.data : [];
            const mapped = list.map((row) => ({
              id: row.id,
              name:
                row.name ||
                [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(' ').trim() ||
                row.phone ||
                '—',
            }));
            setMasters((prev) => ({ ...prev, [table]: mapped }));
          })
          .catch(() => setMasters((prev) => ({ ...prev, [table]: [] })));
        return;
      }
      masterApi
        .getTable(table)
        .then((res) => {
          if (res && res.success && Array.isArray(res.data)) {
            setMasters((prev) => ({ ...prev, [table]: res.data }));
          } else {
            setMasters((prev) => ({ ...prev, [table]: [] }));
          }
        })
        .catch(() => {
          setMasters((prev) => ({ ...prev, [table]: [] }));
        });
    });
  }, [data, masters]);

  useEffect(() => {
    // If we have already marked password as set in this session, don't override it.
    if (hasPassword) return;
    if (!data) {
      setHasPassword(false);
      return;
    }
    // For existing records that already had password in DB, infer once.
    const direct =
      data.password_hash ||
      data.passwordHash ||
      data.password ||
      null;
    if (direct) {
      setHasPassword(true);
    } else {
      setHasPassword(false);
    }
  }, [data, hasPassword]);

  const typeLabel = TYPE_LABELS[type] || type;

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!newPassword.trim()) {
      setPasswordError('Password is required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Password and Confirm Password do not match.');
      return;
    }
    let api;
    if (type === 'management') api = registrationsApi.management;
    else if (type === 'farmer') api = registrationsApi.farmer;
    else if (type === 'customer') api = registrationsApi.customer;
    else if (type === 'lakhpatiDidi') api = registrationsApi.lakhpatiDidi;
    else {
      setPasswordError('Unknown user type.');
      return;
    }
    try {
      setPasswordSaving(true);
      const res = await api.update(id, { password: newPassword });
      if (!res || !res.success) {
        setPasswordError(res?.message || 'Failed to update password.');
        return;
      }
      if (res.data) {
        setData(res.data);
      }
      setHasPassword(true);
      setPasswordSuccess('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordEditor(false);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleDeleteUser() {
    if (!data) return;
    // Basic browser confirm; prevents accidental deletion
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
    if (!ok) return;

    let api;
    if (type === 'management') api = registrationsApi.management;
    else if (type === 'farmer') api = registrationsApi.farmer;
    else if (type === 'customer') api = registrationsApi.customer;
    else if (type === 'lakhpatiDidi') api = registrationsApi.lakhpatiDidi;
    else {
      setError('Unknown user type – cannot delete.');
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const res = await api.delete(id);
      if (!res || !res.success) {
        setError(res?.message || 'Failed to delete user.');
        setLoading(false);
        return;
      }
      navigate('/user-details');
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
      setLoading(false);
    }
  }

  const detailEntries = [];
  const fileEntries = [];
  let profile = null;
  if (data) {
    const fullName =
      data.name ||
      [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' ').trim() ||
      null;
    const mobile =
      data.mobile_number ||
      data.whatsapp_number ||
      data.contact ||
      data.phone_number ||
      null;
    profile = { name: fullName, mobile };

    const profileKeys = new Set([
      'name',
      'first_name',
      'middle_name',
      'last_name',
      'contact',
      'mobile_number',
      'whatsapp_number',
      'phone_number',
    ]);

    const seenLabels = new Set();
    const seenFileKeys = new Set();
    Object.entries(data).forEach(([key, value]) => {
      const lower = key.toLowerCase();
      if (lower.includes('password')) return;
      if (profileKeys.has(key)) return;
      if (key.endsWith('_id')) {
        const base = key.replace(/_id$/, '');
        if (Object.prototype.hasOwnProperty.call(data, `${base}_name`)) {
          return;
        }
      }
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        return;
      }
      const label = niceFieldLabel(key);
      if (seenLabels.has(label)) return;
      seenLabels.add(label);
      const entry = { key, value, label };
      if (isFileField(key, value)) {
        fileEntries.push(entry);
        seenFileKeys.add(key.toLowerCase());
      } else {
        detailEntries.push(entry);
      }
    });
    // Ensure photo_path always appears in Files for Customer & Lakhpati Didi (API may use photo_path or photoPath)
    const photoPathKey = Object.keys(data).find(
      (k) => k.toLowerCase() === 'photo_path' || k.toLowerCase() === 'photopath'
    );
    const photoPathValue = photoPathKey ? data[photoPathKey] : null;
    if (
      (type === 'customer' || type === 'lakhpatiDidi') &&
      photoPathValue != null &&
      String(photoPathValue).trim() !== '' &&
      !seenFileKeys.has('photo_path') &&
      !seenFileKeys.has('photopath')
    ) {
      fileEntries.push({
        key: photoPathKey || 'photo_path',
        value: photoPathValue,
        label: 'Photo',
      });
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <button type="button" style={styles.backBtn} onClick={() => navigate('/user-details')}>
            ← Back to User List
          </button>
          <h1 style={styles.title}>{typeLabel} User Details</h1>
          {data && !hasPassword && (
            <button
              type="button"
              style={styles.editPasswordBtn}
              onClick={() => {
                setShowPasswordEditor((prev) => !prev);
                setPasswordError(null);
                setPasswordSuccess(null);
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              {showPasswordEditor ? 'Cancel Password Edit' : 'Set Password'}
            </button>
          )}
        </div>
        {error && <div style={styles.error}>{error}</div>}
        {loading ? (
          <p style={styles.muted}>Loading details…</p>
        ) : !data ? (
          <p style={styles.muted}>No data found.</p>
        ) : (
          <>
            {profile && (
              <div style={styles.profile}>
                <div style={styles.profileName}>{profile.name || '—'}</div>
                <div style={styles.profileRow}>
                  <span style={styles.profileLabel}>Mobile:</span>
                  <span style={styles.profileValue}>{profile.mobile || '—'}</span>
                </div>
              </div>
            )}
            {data && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>Account</div>
                <ul style={styles.detailList}>
                  <li style={styles.detailItem}>
                    <span style={styles.detailLabel}>Password</span>
                    <span style={styles.detailValue}>
                      {hasPassword ? 'Set (locked – cannot change again)' : 'Not set'}
                    </span>
                  </li>
                </ul>
              </div>
            )}
            {showPasswordEditor && (
              <form onSubmit={handlePasswordSave} style={styles.passwordCard}>
                <div style={styles.passwordHeader}>Set / Change User Password</div>
                {passwordError && <div style={styles.passwordError}>{passwordError}</div>}
                {passwordSuccess && <div style={styles.passwordSuccess}>{passwordSuccess}</div>}
                <div style={styles.passwordGrid}>
                  <div style={styles.fieldWrap}>
                    <label style={styles.fieldLabel}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={styles.passwordInput}
                    />
                  </div>
                  <div style={styles.fieldWrap}>
                    <label style={styles.fieldLabel}>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={styles.passwordInput}
                    />
                  </div>
                </div>
                <div style={styles.passwordActions}>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    style={styles.passwordSaveBtn}
                  >
                    {passwordSaving ? 'Saving…' : 'Save Password'}
                  </button>
                </div>
              </form>
            )}
            {(() => {
              const sections = {
                business: [],
                geographic: [],
                personal: [],
                nominee: [],
                financial: [],
                other: [],
              };

              detailEntries.forEach((entry) => {
                const sectionKey = getSectionForKey(entry.key);
                sections[sectionKey] = sections[sectionKey] || [];
                sections[sectionKey].push(entry);
              });

              const orderedSections = [
                { key: 'business', title: 'Business Information' },
                { key: 'geographic', title: 'Geographic Information' },
                { key: 'personal', title: 'Personal Information' },
                { key: 'nominee', title: 'Nominee Information' },
                { key: 'financial', title: 'Financial Information' },
                { key: 'other', title: 'Other Information' },
              ];

              return orderedSections
                .filter((s) => sections[s.key] && sections[s.key].length > 0)
                .map((section) => (
                  <div key={section.key} style={styles.section}>
                    <div style={styles.sectionHeader}>{section.title}</div>
                    <ul style={styles.detailList}>
                      {sections[section.key].map(({ key, value, label }) => (
                        <li key={key} style={styles.detailItem}>
                          <span style={styles.detailLabel}>{label}</span>
                          <span style={styles.detailValue}>{formatValue(key, value, masters)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ));
            })()}

            {fileEntries.length > 0 && (
              <div style={styles.filesSection}>
                <div style={styles.filesHeading}>Files &amp; Documents</div>
                <div style={styles.fileGrid}>
                  {fileEntries.map(({ key, value, label }) => {
                    const url = getFileUrl(value);
                    const fullUrl = url && (url.startsWith('http') ? url : `${fileBaseUrl}${url}`);
                    const fileName =
                      url && typeof url === 'string'
                        ? url.split('/').slice(-1)[0]
                        : 'download';
                    return (
                      <div key={key} style={styles.fileCard}>
                        <div style={styles.fileMetaRow}>
                          <div style={styles.fileLabel}>{label}</div>
                          <div style={styles.fileValue}>{fileName}</div>
                        </div>
                        <div style={styles.fileActions}>
                          <button
                            type="button"
                            style={styles.viewBtn}
                            onClick={() => { setPreviewLoadError(false); setPreview({ url: fullUrl || url, label }); }}
                          >
                            Preview
                          </button>
                          <a
                            href={fullUrl || url}
                            download={fileName}
                            style={styles.downloadBtn}
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={styles.footerActions}>
              <button
                type="button"
                onClick={handleDeleteUser}
                style={styles.deleteBtn}
                disabled={loading}
              >
                Delete User
              </button>
            </div>
          </>
        )}
      </div>
      {preview && (
        <div
          style={styles.previewOverlay}
          onClick={() => { setPreview(null); setPreviewLoadError(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={styles.previewModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.previewHeader}>
              <span style={styles.previewTitle}>{preview.label || 'Preview'}</span>
              <button
                type="button"
                style={styles.previewClose}
                onClick={() => { setPreview(null); setPreviewLoadError(false); }}
              >
                ✕
              </button>
            </div>
            <div style={styles.previewBody}>
              {previewLoadError || !previewSrc ? (
                <div style={styles.previewErrorWrap}>
                  <p style={styles.previewErrorText}>
                    {previewSrc ? 'Preview could not be loaded.' : 'Invalid file path.'}
                  </p>
                  <a
                    href={previewSrc || preview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.previewOpenLink}
                  >
                    Open in new tab
                  </a>
                </div>
              ) : isImageValue(preview.url) ? (
                <img
                  key={preview.url}
                  src={previewSrc}
                  alt={preview.label || 'Preview'}
                  style={styles.previewImage}
                  onError={() => setPreviewLoadError(true)}
                />
              ) : (
                <>
                  <iframe
                    key={preview.url}
                    src={previewSrc}
                    title={preview.label || 'Preview'}
                    style={styles.previewFrame}
                    onError={() => setPreviewLoadError(true)}
                  />
                  <a
                    href={previewSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.previewOpenLink}
                  >
                    Open in new tab
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'center',
     background: '#fff4e0',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  backBtn: {
    padding: '0.35rem 0.85rem',
    borderRadius: 999,
    border: 'none',
    background: '#1a5fb4',
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
  },
  title: {
    margin: 0,
    fontSize: '1.7rem',
    fontWeight: 700,
    textAlign: 'center',
    color: '#8B1538',
  },
  editPasswordBtn: {
    padding: '0.35rem 0.85rem',
    borderRadius: 999,
    border: '1px solid #2563eb',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    whiteSpace: 'nowrap',
  },
  card: {
    width: '100%',
    maxWidth: 1040,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    padding: '1.25rem 1.5rem 1.5rem',
  },
  profile: {
    marginBottom: '0.75rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
  },
  profileName: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '0.35rem',
  },
  profileRow: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.9rem',
    marginBottom: '0.15rem',
  },
  profileLabel: {
    fontWeight: 500,
    color: '#4b5563',
    minWidth: 70,
  },
  profileValue: {
    color: '#111827',
  },
  passwordCard: {
    marginBottom: '0.75rem',
    padding: '0.75rem 0.9rem',
    borderRadius: 6,
    border: '1px solid #bfdbfe',
    background: '#eff6ff',
  },
  passwordHeader: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#1d4ed8',
    marginBottom: '0.5rem',
  },
  passwordGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.5rem 1rem',
    marginBottom: '0.5rem',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  fieldLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#374151',
  },
  passwordInput: {
    padding: '0.35rem 0.55rem',
    borderRadius: 4,
    border: '1px solid #93c5fd',
    fontSize: '0.85rem',
  },
  passwordActions: {
    marginTop: '0.25rem',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  passwordSaveBtn: {
    padding: '0.35rem 0.9rem',
    borderRadius: 4,
    border: 'none',
    background: '#1d4ed8',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  passwordError: {
    marginBottom: '0.4rem',
    padding: '0.35rem 0.55rem',
    borderRadius: 4,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    fontSize: '0.85rem',
  },
  passwordSuccess: {
    marginBottom: '0.4rem',
    padding: '0.35rem 0.55rem',
    borderRadius: 4,
    background: '#ecfdf3',
    border: '1px solid #bbf7d0',
    color: '#166534',
    fontSize: '0.85rem',
  },
  detailList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.5rem 1.5rem',
    fontSize: '0.9rem',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },
  detailLabel: {
    fontWeight: 600,
    color: '#4b5563',
  },
  detailValue: {
    color: '#111827',
    textAlign: 'right',
  },
  filesSection: {
    marginTop: '1rem',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '0.75rem',
  },
  filesHeading: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '0.5rem',
  },
  section: {
    marginTop: '0.75rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  sectionHeader: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '0.4rem',
  },
  fileGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  fileCard: {
    width: 200,
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    padding: '0.5rem 0.6rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    background: '#f9fafb',
  },
  fileMetaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    fontSize: '0.8rem',
  },
  fileLabel: {
    fontWeight: 600,
    color: '#374151',
  },
  fileValue: {
    color: '#111827',
    wordBreak: 'break-all',
  },
  fileActions: {
    marginTop: 6,
    display: 'flex',
    gap: 6,
  },
  viewBtn: {
    padding: '0.25rem 0.6rem',
    borderRadius: 4,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
    fontSize: '0.8rem',
    textDecoration: 'none',
    textAlign: 'center',
    cursor: 'pointer',
  },
  downloadBtn: {
    padding: '0.25rem 0.6rem',
    borderRadius: 4,
    border: '1px solid #1a5fb4',
    background: '#fff',
    color: '#1a5fb4',
    fontSize: '0.8rem',
    textDecoration: 'none',
    textAlign: 'center',
    cursor: 'pointer',
  },
  previewOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  },
  previewModal: {
    width: '90%',
    maxWidth: 900,
    height: '80vh',
    background: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.9rem',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
  },
  previewTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#111827',
  },
  previewClose: {
    border: 'none',
    background: 'transparent',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#4b5563',
  },
  previewBody: {
    flex: 1,
    position: 'relative',
    background: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewErrorWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  previewErrorText: {
    margin: 0,
    color: '#e5e7eb',
    fontSize: '0.95rem',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    background: '#000',
  },
  previewFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: '#111827',
  },
  previewOpenLink: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '0.4rem 0.8rem',
    borderRadius: 4,
    background: '#1a5fb4',
    color: '#fff',
    fontSize: '0.85rem',
    textDecoration: 'none',
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  downloadLink: {
    marginTop: 4,
    alignSelf: 'flex-start',
    fontSize: '0.8rem',
    color: '#1a5fb4',
    textDecoration: 'none',
    fontWeight: 500,
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
  footerActions: {
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    padding: '0.4rem 0.9rem',
    borderRadius: 4,
    border: '1px solid #dc2626',
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

