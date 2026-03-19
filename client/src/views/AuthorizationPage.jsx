import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizationApi, authApi } from '../services/api';
import { MAIN_MENU, BUSINESS_MENU, REGISTRATION_MENU, ALLOTMENT_MENU } from '../config/menuConfig';
import { getAdmin } from '../utils/auth';

const PATH_LABELS = {};
[MAIN_MENU, BUSINESS_MENU, ALLOTMENT_MENU, REGISTRATION_MENU].forEach((group) => {
  group.forEach((m) => {
    PATH_LABELS[m.path] = m.label;
  });
});
PATH_LABELS['/user-details'] = 'User Details';

const GROUPS = [
  { key: 'main', label: 'Main Menu', paths: MAIN_MENU.map((m) => m.path) },
  { key: 'allotment', label: 'Allotment', paths: ALLOTMENT_MENU.map((m) => m.path) },
  { key: 'business', label: 'Business', paths: BUSINESS_MENU.map((m) => m.path) },
  {
    key: 'registration',
    label: 'Registration',
    paths: REGISTRATION_MENU.filter((m) => m.type !== 'userDetails').map((m) => m.path),
  },
  { key: 'userDetails', label: 'User Details', paths: ['/user-details'] },
];

export default function AuthorizationPage() {
  const admin = getAdmin();
  const isSuperAdmin = admin && admin.type === 'admin' && (admin.phone === '1234567890' || admin.role === 'SUPER_ADMIN');
  const navigate = useNavigate();

  const [subAdmins, setSubAdmins] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPerms, setSavingPerms] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const permissionsRef = useRef(null);
  const [verified, setVerified] = useState(false);
  const [verifyForm, setVerifyForm] = useState({
    phone: admin?.phone || '',
    password: '',
  });
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isSuperAdmin || !verified) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await authorizationApi.getSubAdmins();
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) {
          setSubAdmins(res.data);
        } else {
          setError(res.message || 'Failed to load sub admins');
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load sub admins');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, verified]);

  useEffect(() => {
    let cancelled = false;
    async function loadPerms() {
      if (!selectedId) {
        setPermissions([]);
        return;
      }
      setSavingPerms(false);
      try {
        const res = await authorizationApi.getPermissions(selectedId);
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) {
          setPermissions(res.data);
        } else {
          setPermissions([]);
        }
      } catch {
        if (!cancelled) setPermissions([]);
      }
    }
    loadPerms();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (!isSuperAdmin) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Authorization</h1>
        <p style={styles.subtitle}>Only the main admin can manage access.</p>
      </div>
    );
  }

  const handleVerifyChange = (e) => {
    const { name, value } = e.target;
    setVerifyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifyError(null);
    if (!verifyForm.phone || !verifyForm.password) {
      setVerifyError('Phone and password are required');
      return;
    }
    if (verifyForm.password.length < 4) {
      setVerifyError('Password must be at least 4 characters long');
      return;
    }
    setVerifyLoading(true);
    try {
      const res = await authApi.verifyAdmin(verifyForm.phone, verifyForm.password);
      if (!res.success) {
        setVerifyError(res.message || 'Verification failed');
        return;
      }
      setVerified(true);
      setVerifyForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setVerifyError(err.message || 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) return;
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await authorizationApi.createSubAdmin(form);
      if (!res.success) {
        setError(res.message || 'Failed to create sub admin');
      } else {
        setForm({ name: '', phone: '', password: '' });
        const listRes = await authorizationApi.getSubAdmins();
        if (listRes.success && Array.isArray(listRes.data)) {
          setSubAdmins(listRes.data);
        }
      }
    } catch (e2) {
      setError(e2.message || 'Failed to create sub admin');
    } finally {
      setCreating(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedId) return;
    setSavingPerms(true);
    setError(null);
    try {
      const res = await authorizationApi.updatePermissions(selectedId, permissions);
      if (!res.success) {
        setError(res.message || 'Failed to save permissions');
        window.alert(res.message || 'Failed to save permissions');
      }
      if (res.success) {
        window.alert('Allowed menus saved successfully.');
      }
    } catch (e) {
      setError(e.message || 'Failed to save permissions');
      window.alert(e.message || 'Failed to save permissions');
    } finally {
      setSavingPerms(false);
    }
  };

  const isGroupChecked = (group) =>
    group.paths.length > 0 && group.paths.every((p) => permissions.includes(p));

  const toggleGroup = (group) => {
    const checked = isGroupChecked(group);
    if (checked) {
      // Remove all paths in this group
      setPermissions((prev) => prev.filter((p) => !group.paths.includes(p)));
    } else {
      // Add all paths in this group
      setPermissions((prev) => Array.from(new Set([...prev, ...group.paths])));
    }
  };

  const togglePath = (path) => {
    setPermissions((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const handleDeleteSubAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sub admin?')) return;
    setError(null);
    try {
      const res = await authorizationApi.deleteSubAdmin(id);
      if (!res.success) {
        setError(res.message || 'Failed to delete sub admin');
        return;
      }
      const listRes = await authorizationApi.getSubAdmins();
      if (listRes.success && Array.isArray(listRes.data)) {
        setSubAdmins(listRes.data);
      }
      if (selectedId === id) {
        setSelectedId(null);
        setPermissions([]);
      }
    } catch (e) {
      setError(e.message || 'Failed to delete sub admin');
    }
  };

  const currentSubAdmin = selectedId
    ? subAdmins.find((s) => s.id === selectedId) || null
    : null;

  return (
    <div style={{ ...styles.page, ...(isMobile ? styles.pageMobile : {}) }}>
      {!verified ? (
        <div
          style={styles.verifyOverlay}
          onMouseDown={(e) => {
            // Close verification if user clicks on the overlay background
            if (e.target === e.currentTarget) {
              navigate('/');
            }
          }}
        >
          <form style={{ ...styles.verifyCard, ...(isMobile ? styles.verifyCardMobile : {}) }} onSubmit={handleVerifySubmit}>
            <button
              type="button"
              style={styles.verifyCloseBtn}
              onClick={() => navigate('/')}
              aria-label="Close"
            >
              ×
            </button>
            <h1 style={styles.title}>Authorization</h1>
            <p style={styles.subtitle}>Please confirm admin credentials to manage access.</p>
            <div style={styles.field}>
              <label style={styles.label}>Admin Phone</label>
              <input
                type="text"
                name="phone"
                value={verifyForm.phone}
                onChange={handleVerifyChange}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={verifyForm.password}
                onChange={handleVerifyChange}
                style={styles.input}
              />
            </div>
            {verifyError && <div style={styles.error}>{verifyError}</div>}
            <div style={styles.actions}>
              <button type="submit" style={styles.primaryBtn} disabled={verifyLoading}>
                {verifyLoading ? 'Verifying…' : 'Verify'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Authorization</h1>
          <p style={styles.subtitle}>Create sub admins and control which menus they can access.</p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <form style={{ ...styles.form, ...(isMobile ? styles.formMobile : {}) }} onSubmit={handleCreate}>
        <div style={{ ...styles.formRow, ...(isMobile ? styles.formRowMobile : {}) }}>
          <div style={styles.field}>
            <label style={styles.label}>Sub Admin Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              style={styles.input}
              placeholder="Enter full name"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              style={styles.input}
              placeholder="Mobile number"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleFormChange}
              style={styles.input}
              placeholder="Initial password"
            />
          </div>
          <div style={{ ...styles.actions, ...(isMobile ? styles.actionsMobile : {}) }}>
            <button
              type="submit"
              style={{ ...styles.primaryBtn, ...(isMobile ? styles.primaryBtnMobile : {}) }}
              disabled={creating || !form.name || !form.phone || !form.password}
            >
              {creating ? 'Creating…' : 'Add Sub Admin'}
            </button>
          </div>
        </div>
      </form>

      <div style={{ ...styles.contentRow, ...(isMobile ? styles.contentRowMobile : {}) }}>
        <div style={{ ...styles.subAdminList, ...(isMobile ? styles.panelMobile : {}) }}>
          <h2 style={styles.sectionTitle}>Sub Admins</h2>
          {loading ? (
            <p style={styles.muted}>Loading…</p>
          ) : subAdmins.length === 0 ? (
            <p style={styles.muted}>No sub admins created yet.</p>
          ) : (
            <ul style={styles.list}>
              {subAdmins.map((s) => (
                <li
                  key={s.id}
                  style={{
                    ...styles.listItem,
                    ...(selectedId === s.id ? styles.listItemActive : {}),
                  }}
                >
                  <div
                    style={styles.listItemMain}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <div style={styles.listItemName}>{s.name || s.phone}</div>
                    <div style={styles.listItemPhone}>{s.phone}</div>
                  </div>
                  <button
                    type="button"
                    style={styles.deleteBtn}
                    onClick={() => handleDeleteSubAdmin(s.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ ...styles.permissionsPane, ...(isMobile ? styles.panelMobile : {}) }} ref={permissionsRef}>
          <h2 style={styles.sectionTitle}>
            Allowed Menus
            {currentSubAdmin && (
              <span style={styles.sectionTitleSub}>
                {' '}
                – {currentSubAdmin.name || currentSubAdmin.phone}
              </span>
            )}
          </h2>
          {!selectedId ? (
            <p style={styles.muted}>Select a sub admin to configure access.</p>
          ) : (
            <>
              <div style={{ ...styles.groupRow, ...(isMobile ? styles.groupRowMobile : {}) }}>
                <span style={styles.groupLabel}>Allow full sections:</span>
                {GROUPS.map((g) => (
                  <label key={g.key} style={{ ...styles.groupOption, ...(isMobile ? styles.groupOptionMobile : {}) }}>
                    <input
                      type="checkbox"
                      checked={isGroupChecked(g)}
                      onChange={() => toggleGroup(g)}
                    />
                    <span>{g.label}</span>
                  </label>
                ))}
              </div>
              <p style={styles.muted}>
                Toggle sections above and click Save to update this sub admin&apos;s access.
              </p>
              <div style={{ ...styles.menuGrid, ...(isMobile ? styles.menuGridMobile : {}) }}>
                {GROUPS.map((g) => (
                  <div key={g.key} style={styles.menuGroupBox}>
                    <div style={styles.menuGroupTitle}>{g.label}</div>
                    {g.paths.map((p) => (
                      <label key={p} style={{ ...styles.menuItem, ...(isMobile ? styles.menuItemMobile : {}) }}>
                        <input
                          type="checkbox"
                          checked={permissions.includes(p)}
                          onChange={() => togglePath(p)}
                        />
                        <span>{PATH_LABELS[p] || p}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              <div style={styles.currentAccessBox}>
                <span style={styles.currentAccessLabel}>Currently allowed sections:</span>
                {GROUPS.filter((g) => isGroupChecked(g)).length === 0 ? (
                  <span style={styles.currentAccessNone}>No sections allowed yet.</span>
                ) : (
                  <ul style={styles.currentAccessList}>
                    {GROUPS.filter((g) => isGroupChecked(g)).map((g) => (
                      <li key={g.key} style={styles.currentAccessItem}>
                        {g.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                style={{ ...styles.primaryBtn, ...(isMobile ? styles.primaryBtnMobile : {}) }}
                disabled={savingPerms}
                onClick={handleSavePermissions}
              >
                {savingPerms ? 'Saving…' : 'Save Permissions'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  pageMobile: {
    gap: '0.6rem',
  },
  verifyOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  verifyCard: {
    width: '100%',
    maxWidth: 360,
    padding: '1.5rem',
    borderRadius: 8,
    background: '#fff',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  verifyCardMobile: {
    maxWidth: '100%',
    margin: '0 0.75rem',
    padding: '1rem',
  },
  verifyCloseBtn: {
    position: 'absolute',
    top: 8,
    right: 10,
    border: 'none',
    background: 'transparent',
    fontSize: '1.2rem',
    lineHeight: 1,
    cursor: 'pointer',
    color: '#4b5563',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#111827',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#6b7280',
  },
  error: {
    padding: '0.5rem 0.75rem',
    borderRadius: 4,
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    fontSize: '0.9rem',
  },
  form: {
    marginTop: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    background: '#fff',
    border: '1px solid #e5e7eb',
  },
  formMobile: {
    padding: '0.65rem 0.75rem',
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    alignItems: 'flex-end',
  },
  formRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.6rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 180,
    flex: '1 1 0',
  },
  label: {
    fontSize: '0.8rem',
    color: '#4b5563',
    marginBottom: 4,
  },
  input: {
    padding: '0.62rem 0.75rem',
    borderRadius: 4,
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    minHeight: 42,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 150,
  },
  actionsMobile: {
    minWidth: 0,
    width: '100%',
  },
  primaryBtn: {
    padding: '0.65rem 1rem',
    borderRadius: 4,
    border: 'none',
    background: '#1a5fb4',
    color: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  primaryBtnMobile: {
    width: '100%',
  },
  contentRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
    alignItems: 'flex-start',
  },
  contentRowMobile: {
    flexDirection: 'column',
    gap: '0.65rem',
    marginTop: '0.65rem',
  },
  subAdminList: {
    flex: '0 0 260px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    padding: '0.75rem',
  },
  permissionsPane: {
    flex: 1,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  panelMobile: {
    width: '100%',
    padding: '0.65rem',
  },
  groupRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
  },
  groupRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.35rem',
  },
  groupLabel: {
    fontWeight: 600,
    color: '#374151',
    marginRight: 4,
  },
  groupOption: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  groupOptionMobile: {
    padding: '0.3rem 0.1rem',
  },
  currentAccessBox: {
    marginTop: '0.25rem',
    padding: '0.4rem 0.6rem',
    borderRadius: 4,
    background: '#f9fafb',
    border: '1px dashed #d1d5db',
    fontSize: '0.85rem',
  },
  currentAccessLabel: {
    fontWeight: 600,
    color: '#374151',
    marginRight: 4,
  },
  currentAccessNone: {
    color: '#6b7280',
  },
  currentAccessList: {
    display: 'inline-flex',
    listStyle: 'none',
    padding: 0,
    margin: 0,
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  currentAccessItem: {
    padding: '0.1rem 0.45rem',
    borderRadius: 999,
    background: '#e5f0ff',
    color: '#1f2937',
  },
  sectionTitle: {
    margin: '0 0 0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#111827',
  },
  sectionTitleSub: {
    fontSize: '0.9rem',
    fontWeight: 400,
    color: '#4b5563',
  },
  muted: {
    margin: '0.5rem 0',
    color: '#6b7280',
    fontSize: '0.9rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  listItem: {
    padding: '0.6rem 0.55rem',
    borderRadius: 4,
    cursor: 'default',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemActive: {
    background: '#e5f0ff',
  },
  listItemMain: {
    flex: 1,
    cursor: 'pointer',
  },
  listItemName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#111827',
  },
  listItemPhone: {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  deleteBtn: {
    marginLeft: 8,
    padding: '0.25rem 0.6rem',
    borderRadius: 4,
    border: 'none',
    background: '#dc2626',
    color: '#fff',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  menuGridMobile: {
    gridTemplateColumns: '1fr',
    gap: '0.55rem',
  },
  menuGroupBox: {
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    padding: '0.4rem 0.5rem',
    background: '#f9fafb',
  },
  menuGroupTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: 4,
    color: '#111827',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.8rem',
  },
  menuItemMobile: {
    padding: '0.2rem 0',
    fontSize: '0.88rem',
  },
};

