import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MAIN_MENU, BUSINESS_MENU, REGISTRATION_MENU } from '../config/menuConfig';

const LOGO_URL = 'https://www.greatwebsoft.in/gaonmaza/public/images/white-logo.jpeg';

export default function Layout({ children }) {
  const [userOpen, setUserOpen] = useState(false);
  const [mainMenuOpen, setMainMenuOpen] = useState(true);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const userWrapRef = useRef(null);

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

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={LOGO_URL} alt="Logo" style={styles.logo} />
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userWrap} ref={userWrapRef}>
            <button
              type="button"
              onClick={() => setUserOpen(!userOpen)}
              style={styles.userBtn}
              aria-expanded={userOpen}
              aria-haspopup="true"
            >
              <span style={styles.userIcon}>👤</span>
              <span>User (Unknown)</span>
              <span style={styles.dropdownArrow}>▼</span>
            </button>
            {userOpen && (
              <div style={styles.dropdown}>
                <button type="button" style={styles.dropdownItem} className="gov-dropdown-item">
                  Login
                </button>
                <button type="button" style={styles.dropdownItem} className="gov-dropdown-item">
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
            {/* Main Menu */}
            {sectionHeader('Main Menu', mainMenuOpen, () => setMainMenuOpen(!mainMenuOpen))}
            {mainMenuOpen && (
              <div style={styles.sectionLinks}>
                {MAIN_MENU.map(({ path, label }) => (
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
                {BUSINESS_MENU.map(({ path, label }) => (
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
                {REGISTRATION_MENU.map(({ path, label }) => (
                  <NavLink key={path} to={path} style={linkStyle} className="gov-sidebar-link">
                    {label}
                  </NavLink>
                ))}
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
    background: '#f0f0f2',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1.5rem',
    background: '#8B1538',
    minHeight: 56,
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  },
  headerLeft: { display: 'flex', alignItems: 'center' },
  logo: {
    height: 42,
    width: 'auto',
    maxWidth: 180,
    objectFit: 'contain',
    display: 'block',
  },
  headerRight: { display: 'flex', alignItems: 'center' },
  userWrap: { position: 'relative' },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.75rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: 4,
    color: '#fff',
    fontSize: '0.9rem',
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
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
    background: '#4a4a4e',
    boxShadow: '2px 0 4px rgba(0,0,0,0.08)',
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
    padding: '0.6rem 1rem',
    border: 'none',
    background: 'rgba(0,0,0,0.2)',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
  },
  sectionArrow: { fontSize: '0.7rem', opacity: 0.9 },
  sectionLinks: { display: 'flex', flexDirection: 'column' },
  sidebarItem: {
    display: 'block',
    width: '100%',
    padding: '0.5rem 1rem 0.5rem 1.25rem',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.9)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  sidebarItemActive: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
  },
  main: {
    flex: 1,
    minHeight: 0,
    padding: '1.5rem 2rem',
    overflow: 'auto',
    background: '#f0f0f2',
  },
};
