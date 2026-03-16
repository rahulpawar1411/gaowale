import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { REGISTRATION_MENU } from '../config/menuConfig';
import ManagementRegistrationPage from '../views/ManagementRegistrationPage';
import FarmerRegistrationPage from '../views/FarmerRegistrationPage';
import CustomerRegistrationPage from '../views/CustomerRegistrationPage';
import LakhpatiDidiRegistrationPage from '../views/LakhpatiDidiRegistrationPage';

const LOGO_URL = 'https://www.greatwebsoft.in/gaonmaza/public/images/white-logo.jpeg';

// Public section me sirf kuch hi registration dikhane hain (Farmer / Customer hide)
const PUBLIC_REGISTRATION_MENU = REGISTRATION_MENU.filter(
  ({ type }) => type !== 'userDetails' && type !== 'farmer' && type !== 'customer'
).map((item) => ({
  ...item,
  publicPath: item.path.replace(/^\//, ''),
}));

export default function PublicRegistrationApp() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [language, setLanguage] = useState('mr'); // 'en' | 'mr'

  const linkStyle = ({ isActive }) => ({
    ...styles.sidebarItem,
    ...(isActive ? styles.sidebarItemActive : {}),
  });

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={LOGO_URL} alt="Logo" style={styles.logo} />
          <div style={styles.headerTitleWrap}>
            <h1 style={styles.headerTitle}>
              {language === 'mr' ? 'सार्वजनिक नोंदणी' : 'Public Registration'}
            </h1>
            <p style={styles.headerSubtitle}>
              {language === 'mr'
                ? 'कृपया फॉर्म काळजीपूर्वक भरा'
                : 'Please complete the form carefully'}
            </p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            style={{
              ...styles.langButton,
              ...(language === 'en' ? styles.langButtonActive : {}),
            }}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('mr')}
            style={{
              ...styles.langButton,
              ...(language === 'mr' ? styles.langButtonActive : {}),
            }}
          >
            मराठी
          </button>
        </div>
      </header>

      <div style={styles.body}>
        <aside style={styles.sidebar}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            style={styles.sectionHeader}
            aria-expanded={menuOpen}
          >
            <span>Registration</span>
            <span style={styles.sectionArrow}>{menuOpen ? '▼' : '▶'}</span>
          </button>
          {menuOpen && (
            <nav style={styles.sidebarNav} className="sidebar-nav-scroll">
              {PUBLIC_REGISTRATION_MENU.map(({ publicPath, label }) => (
                <NavLink
                  key={publicPath}
                  to={publicPath}
                  style={linkStyle}
                  className="gov-sidebar-link"
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          )}
        </aside>

        <main style={styles.main}>
          <Routes>
            <Route
              index
              element={
                <Navigate
                  to={PUBLIC_REGISTRATION_MENU[0]?.publicPath || 'farmer-registration'}
                  replace
                />
              }
            />

            {PUBLIC_REGISTRATION_MENU.map(({ publicPath, label, type }) => (
              <Route
                key={publicPath}
                path={publicPath}
                element={
                  type === 'management' ? (
                    <ManagementRegistrationPage title={label} lang={language} />
                  ) : type === 'farmer' ? (
                    <FarmerRegistrationPage title={label} lang={language} />
                  ) : type === 'customer' ? (
                    <CustomerRegistrationPage title={label} lang={language} />
                  ) : type === 'lakhpatiDidi' ? (
                    <LakhpatiDidiRegistrationPage title={label} lang={language} />
                  ) : null
                }
              />
            ))}
          </Routes>
        </main>
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
    padding: '0.75rem 1.75rem',
    background: 'linear-gradient(90deg, #3d0715 0%, #8b1538 45%, #b52330 100%)',
    minHeight: 72,
    boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logo: {
    height: 60,
    width: 'auto',
    maxWidth: 220,
    objectFit: 'contain',
    display: 'block',
  },
  headerTitleWrap: {
    display: 'flex',
    flexDirection: 'column',
    color: '#fff7ec',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 700,
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '0.9rem',
    opacity: 0.9,
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
  body: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
    overflow: 'hidden',
    background: '#fff4e0',
  },
  sidebar: {
    width: 260,
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

