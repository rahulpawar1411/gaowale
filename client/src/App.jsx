import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './views/DashboardPage';
import MasterCrudPage from './views/MasterCrudPage';
import RegistrationPage from './views/RegistrationPage';
import ManagementRegistrationPage from './views/ManagementRegistrationPage';
import FarmerRegistrationPage from './views/FarmerRegistrationPage';
import CustomerRegistrationPage from './views/CustomerRegistrationPage';
import LakhpatiDidiRegistrationPage from './views/LakhpatiDidiRegistrationPage';
import BusinessUnitAllotmentListPage from './views/BusinessUnitAllotmentListPage';
import UsersPage from './views/UsersPage';
import UserDetailPage from './views/UserDetailPage';
import LoginPage from './views/LoginPage';
import AuthorizationPage from './views/AuthorizationPage';
import { MAIN_MENU, BUSINESS_MENU, REGISTRATION_MENU, ALLOTMENT_MENU } from './config/menuConfig';
import { entityFields } from './config/entityFields';
import { getToken, getAdmin } from './utils/auth';
import { authorizationApi } from './services/api';
import PublicRegistrationApp from './public-registration/PublicRegistrationApp';

// Dedupe by path so each route is registered once (Product/Business Type appear in two sections)
const MASTER_ROUTES = [...MAIN_MENU];
const seen = new Set(MAIN_MENU.map((m) => m.path));
ALLOTMENT_MENU.forEach((m) => {
  if (!seen.has(m.path)) {
    seen.add(m.path);
    MASTER_ROUTES.push(m);
  }
});
BUSINESS_MENU.forEach((m) => {
  if (!seen.has(m.path)) {
    seen.add(m.path);
    MASTER_ROUTES.push(m);
  }
});

function ProtectedApp() {
  const token = getToken();
  const location = useLocation();
  const admin = getAdmin();
  const isSubAdmin = admin && admin.type === 'sub-admin';

  const [allowedPaths, setAllowedPaths] = React.useState(null);
  const [language, setLanguage] = React.useState('en'); // 'en' | 'mr'

  React.useEffect(() => {
    let cancelled = false;
    if (!isSubAdmin) {
      setAllowedPaths(null);
      return undefined;
    }
    async function loadPermissions() {
      try {
        const res = await authorizationApi.myPermissions();
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) {
          setAllowedPaths(res.data);
        } else {
          setAllowedPaths([]);
        }
      } catch {
        if (!cancelled) setAllowedPaths([]);
      }
    }
    loadPermissions();
    return () => {
      cancelled = true;
    };
  }, [isSubAdmin]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const filterByPermissions = (items) => {
    if (!isSubAdmin || !Array.isArray(allowedPaths)) return items;
    return items.filter((item) => allowedPaths.includes(item.path));
  };

  const masterRoutes = filterByPermissions(MASTER_ROUTES);
  const registrationMenu = filterByPermissions(REGISTRATION_MENU);

  return (
    <Layout
      isSubAdmin={isSubAdmin}
      allowedPaths={allowedPaths}
      lang={language}
      onChangeLanguage={setLanguage}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/authorization" element={<AuthorizationPage />} />
        <Route path="/user-details/:type/:id" element={<UserDetailPage />} />

        {masterRoutes.map(({ path, label, table, addButtonLabel }) => (
          <Route
            key={path}
            path={path}
            element={
              path === '/business-unit-allotment-list' ? (
                <BusinessUnitAllotmentListPage title={label} />
              ) : (
                <MasterCrudPage
                  table={table}
                  title={label}
                  fields={entityFields[table] || []}
                  addButtonLabel={addButtonLabel}
                  lang={language}
                />
              )
            }
          />
        ))}

        {registrationMenu.map(({ path, label, type }) => (
          <Route
            key={path}
            path={path}
            element={
              type === 'management'
                ? <ManagementRegistrationPage title={label} lang={language} />
                : type === 'userDetails'
                  ? <UsersPage />
                  : type === 'farmer'
                    ? <FarmerRegistrationPage title={label} lang={language} />
                    : type === 'customer'
                      ? <CustomerRegistrationPage title={label} lang={language} />
                      : type === 'lakhpatiDidi'
                        ? <LakhpatiDidiRegistrationPage title={label} lang={language} />
                        : <RegistrationPage type={type} title={label} lang={language} />
            }
          />
        ))}
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/public-registration/*" element={<PublicRegistrationApp />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}

export default App;
