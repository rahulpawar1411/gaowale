import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MasterCrudPage from './views/MasterCrudPage';
import RegistrationPage from './views/RegistrationPage';
import LakhpatiDidiRegistrationPage from './views/LakhpatiDidiRegistrationPage';
import { MAIN_MENU, BUSINESS_MENU, REGISTRATION_MENU, ALLOTMENT_MENU } from './config/menuConfig';
import { entityFields } from './config/entityFields';

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

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/continent" replace />} />

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
              type === 'lakhpatiDidi'
                ? <LakhpatiDidiRegistrationPage title={label} />
                : <RegistrationPage type={type} title={label} />
            }
          />
        ))}
      </Routes>
    </Layout>
  );
}

export default App;
