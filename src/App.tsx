import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import CRMLayout from './components/CRMLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Clients from './pages/Clients';
import CalendarPage from './pages/Calendar';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Agreement from './pages/Agreement';
import Consent from './pages/Consent';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/agreement" element={<Agreement />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/crm" element={<CRMLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="clients" element={<Clients />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
