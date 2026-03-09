import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './views/DashboardPage';
import MasterCrudPage from './views/MasterCrudPage';
import RegistrationPage from './views/RegistrationPage';
import ManagementRegistrationPage from './views/ManagementRegistrationPage';
import FarmerRegistrationPage from './views/FarmerRegistrationPage';
import CustomerRegistrationPage from './views/CustomerRegistrationPage';
import LakhpatiDidiRegistrationPage from './views/LakhpatiDidiRegistrationPage';
import LoginPage from './views/LoginPage';
import { MAIN_MENU, BUSINESS_MENU, REGISTRATION_MENU, ALLOTMENT_MENU } from './config/menuConfig';
import { entityFields } from './config/entityFields';
import { getToken } from './utils/auth';

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
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />

        {MASTER_ROUTES.map(({ path, label, table, addButtonLabel }) => (
          <Route
            key={path}
            path={path}
            element={
              <MasterCrudPage
                table={table}
                title={label}
                fields={entityFields[table] || []}
                addButtonLabel={addButtonLabel}
              />
            }
          />
        ))}

        {REGISTRATION_MENU.map(({ path, label, type }) => (
          <Route
            key={path}
            path={path}
            element={
              type === 'management'
                ? <ManagementRegistrationPage title={label} />
                : type === 'farmer'
                  ? <FarmerRegistrationPage title={label} />
                  : type === 'customer'
                    ? <CustomerRegistrationPage title={label} />
                    : type === 'lakhpatiDidi'
                      ? <LakhpatiDidiRegistrationPage title={label} />
                      : <RegistrationPage type={type} title={label} />
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
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}

export default App;
