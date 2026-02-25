import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import AdmisionesPage from './pages/AdmisionesPage';
import EstadosPage from './pages/EstadosPage';
import NoUtilPage from './pages/NoUtilPage';
import LeadsPage from './pages/LeadsPage';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('unab_token');
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <FilterProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="admisiones" element={<AdmisionesPage />} />
            <Route path="estados" element={<EstadosPage />} />
            <Route path="no-util" element={<NoUtilPage />} />
            <Route path="leads" element={<LeadsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FilterProvider>
  );
}
