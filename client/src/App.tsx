import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnitsPage from './pages/UnitsPage';
import UnitDetailsPage from './pages/UnitDetailsPage';
import MaintenancePage from './pages/MaintenancePage';
import MaintenanceDetailsPage from './pages/MaintenanceDetailsPage';
import RentPage from './pages/RentPage';
import AlertsPage from './pages/AlertsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Manager Routes */}
            <Route path="dashboard" element={<ProtectedRoute roles={['PROPERTY_MANAGER']}><DashboardPage /></ProtectedRoute>} />
            <Route path="units" element={<ProtectedRoute roles={['PROPERTY_MANAGER']}><UnitsPage /></ProtectedRoute>} />
            <Route path="units/:id" element={<ProtectedRoute roles={['PROPERTY_MANAGER']}><UnitDetailsPage /></ProtectedRoute>} />
            <Route path="rent" element={<ProtectedRoute roles={['PROPERTY_MANAGER']}><RentPage /></ProtectedRoute>} />
            <Route path="alerts" element={<ProtectedRoute roles={['PROPERTY_MANAGER']}><AlertsPage /></ProtectedRoute>} />
            
            {/* Shared Routes */}
            <Route path="maintenance" element={<ProtectedRoute roles={['PROPERTY_MANAGER']}><MaintenancePage /></ProtectedRoute>} />
            <Route path="maintenance/:id" element={<MaintenanceDetailsPage />} />
            
            {/* Contractor Routes */}
            <Route path="my-requests" element={<ProtectedRoute roles={['MAINTENANCE_CONTRACTOR']}><MaintenancePage /></ProtectedRoute>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
