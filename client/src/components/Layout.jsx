import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MAIN_MENU, BUSINESS_MENU, REGISTRATION_MENU, ALLOTMENT_MENU } from '../config/menuConfig';
import { removeToken, getAdmin } from '../utils/auth';

const LOGO_URL = 'https://www.greatwebsoft.in/gaonmaza/public/images/white-logo.jpeg';

export default function Layout({
  children,
  isSubAdmin = false,
  allowedPaths = null,
  lang = 'en',
  onChangeLanguage,
}) {
  const navigate = useNavigate();
  const [userOpen, setUserOpen] = useState(false);
  const [mainMenuOpen, setMainMenuOpen] = useState(true);
  const [allotmentOpen, setAllotmentOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userWrapRef = useRef(null);
  const admin = getAdmin();
  const isSuperAdmin =
    admin && admin.type === 'admin' && (admin.phone === '1234567890' || admin.role === 'SUPER_ADMIN');
  const displayName =
    admin && admin.type === 'sub-admin'
      ? admin.name || admin.phone || 'Sub Admin'
      : 'Admin';

  useEffect(() => {
    function handleClickOutside(e) {
      if (userWrapRef.current && !userWrapRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    }
    if (userOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userOpen]);

  const linkStyle = ({ isActive }) => ({
    ...styles.sidebarItem,
    ...(isActive ? styles.sidebarItemActive : {}),
  });

  const sectionHeader = (label, isOpen, onToggle) => (
    <button
      type="button"
      onClick={onToggle}
      style={styles.sectionHeader}
      aria-expanded={isOpen}
    >
      <span>{label}</span>
      <span style={styles.sectionArrow}>{isOpen ? '▼' : '▶'}</span>
    </button>
  );

  const filterByPermissions = (items) => {
    if (!isSubAdmin || !Array.isArray(allowedPaths)) return items;
    return items.filter((item) => allowedPaths.includes(item.path));
  };

  const mainMenuItems = filterByPermissions(MAIN_MENU);
  const allotmentItems = filterByPermissions(ALLOTMENT_MENU);
  const businessItems = filterByPermissions(BUSINESS_MENU);
  const registrationItems = filterByPermissions(
    REGISTRATION_MENU.filter(({ type }) => type !== 'userDetails')
  );

  const canSeeUserDetails =
    !isSubAdmin || (Array.isArray(allowedPaths) && allowedPaths.includes('/user-details'));

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={LOGO_URL} alt="Logo" style={styles.logo} />
        </div>
        <div style={styles.headerRight}>
          <div style={styles.langSwitch}>
            <button
              type="button"
              onClick={() => onChangeLanguage && onChangeLanguage('en')}
              style={{
                ...styles.langButton,
                ...(lang === 'en' ? styles.langButtonActive : {}),
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage && onChangeLanguage('mr')}
              style={{
                ...styles.langButton,
                ...(lang === 'mr' ? styles.langButtonActive : {}),
              }}
            >
              मराठी
            </button>
          </div>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => navigate('/authorization')}
              style={styles.authBtn}
            >
              Authorization
            </button>
          )}
          <div style={styles.userWrap} ref={userWrapRef}>
            <button
              type="button"
              onClick={() => setUserOpen(!userOpen)}
              style={styles.userBtn}
              aria-expanded={userOpen}
              aria-haspopup="true"
            >
              <span style={styles.userIcon}>👤</span>
              <span>{displayName}</span>
              <span style={styles.dropdownArrow}>▼</span>
            </button>
            {userOpen && (
              <div style={styles.dropdown}>
                <button
                  type="button"
                  style={styles.dropdownItem}
                  className="gov-dropdown-item"
                  onClick={() => {
                    removeToken();
                    setUserOpen(false);
                    navigate('/login', { replace: true });
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={styles.body}>
        <aside style={styles.sidebar}>
          <nav style={styles.sidebarNav} className="sidebar-nav-scroll">
            <NavLink to="/" end style={linkStyle} className="gov-sidebar-link">
              Dashboard
            </NavLink>
            {/* Main Menu */}
            {sectionHeader('Main Menu', mainMenuOpen, () => setMainMenuOpen(!mainMenuOpen))}
            {mainMenuOpen && (
              <div style={styles.sectionLinks}>
                {mainMenuItems.map(({ path, label }) => (
                  <NavLink key={path} to={path} style={linkStyle} className="gov-sidebar-link">
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Allotment */}
            {sectionHeader('Allotment', allotmentOpen, () => setAllotmentOpen(!allotmentOpen))}
            {allotmentOpen && (
              <div style={styles.sectionLinks}>
                {allotmentItems.map(({ path, label }) => (
                  <NavLink key={path} to={path} style={linkStyle} className="gov-sidebar-link">
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Business */}
            {sectionHeader('Business', businessOpen, () => setBusinessOpen(!businessOpen))}
            {businessOpen && (
              <div style={styles.sectionLinks}>
                {businessItems.map(({ path, label }) => (
                  <NavLink key={path} to={path} style={linkStyle} className="gov-sidebar-link">
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Registration */}
            {sectionHeader('Registration', registrationOpen, () => setRegistrationOpen(!registrationOpen))}
            {registrationOpen && (
              <div style={styles.sectionLinks}>
                {registrationItems.map(({ path, label }) => (
                  <NavLink key={path} to={path} style={linkStyle} className="gov-sidebar-link">
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* User Details section (same theme as others) */}
            {canSeeUserDetails && sectionHeader('User Details', userMenuOpen, () => setUserMenuOpen(!userMenuOpen))}
            {canSeeUserDetails && userMenuOpen && (
              <div style={styles.sectionLinks}>
                <NavLink to="/user-details" style={linkStyle} className="gov-sidebar-link">
                  User Details
                </NavLink>
              </div>
            )}
          </nav>
        </aside>

        <main style={styles.main}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#fff4e0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.6rem 1.75rem',
    background: 'linear-gradient(90deg, #3d0715 0%, #8b1538 45%, #b52330 100%)',
    minHeight: 72,
    boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
  },
  headerLeft: { display: 'flex', alignItems: 'center' },
  logo: {
    height: 64,
    width: 'auto',
    maxWidth: 260,
    objectFit: 'contain',
    display: 'block',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  langSwitch: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginRight: '0.5rem',
  },
  langButton: {
    padding: '0.25rem 0.75rem',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.6)',
    background: 'transparent',
    color: '#fff7ec',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  langButtonActive: {
    background: '#ffe6c7',
    color: '#3d0715',
    borderColor: '#ffe6c7',
  },
  authBtn: {
    marginRight: '0.75rem',
    padding: '0.45rem 1rem',
    borderRadius: 999,
    border: 'none',
    background: 'linear-gradient(135deg, #ffb347, #ff7a1a)',
    color: '#2b0b15',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
  },
  userWrap: { position: 'relative' },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.45rem 0.9rem',
    background: 'rgba(0,0,0,0.28)',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: 999,
    color: 'rgba(255,245,235,0.95)',
    fontSize: '0.92rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
  },
  userIcon: { fontSize: '1.1rem' },
  dropdownArrow: { fontSize: '0.65rem', marginLeft: '0.25rem' },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    minWidth: 120,
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: 4,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '0.5rem 1rem',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    fontSize: '0.9rem',
    color: '#333',
    cursor: 'pointer',
  },
  body: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
    overflow: 'hidden',
    background: '#fff4e0',
  },
  sidebar: {
    width: 250,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #2a0d17 0%, #3b121f 40%, #000000 100%)',
    boxShadow: '4px 0 12px rgba(0,0,0,0.45)',
  },
  sidebarNav: {
    padding: '0.5rem 0',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0.8rem 1.1rem',
    border: 'none',
    background: 'linear-gradient(90deg, rgba(255,122,26,0.18), rgba(0,0,0,0))',
    color: '#ffe6c7',
    fontSize: '1.02rem',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
  },
  sectionArrow: { fontSize: '0.7rem', opacity: 0.9 },
  sectionLinks: { display: 'flex', flexDirection: 'column' },
  sidebarItem: {
    display: 'block',
    width: '100%',
    padding: '0.65rem 1.1rem 0.65rem 1.4rem',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    fontSize: '0.98rem',
    color: 'rgba(255,245,230,0.9)',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 0.18s ease, color 0.18s ease, padding-left 0.18s ease',
  },
  sidebarItemActive: {
    background: 'linear-gradient(90deg, rgba(255,193,7,0.35), rgba(255,122,26,0.45))',
    color: '#2b0b15',
  },
  main: {
    flex: 1,
    minHeight: 0,
    padding: '1rem 1.25rem',
    overflow: 'auto',
    background: '#fff4e0',
    fontSize: '1rem',
  },
};
