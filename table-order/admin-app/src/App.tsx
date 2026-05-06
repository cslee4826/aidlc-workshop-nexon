import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MenuManagementPage from './pages/MenuManagementPage';
import SalesCalendarPage from './pages/SalesCalendarPage';

function App() {
  const { isAuthenticated } = useAdminAuthStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/menus" element={<MenuManagementPage />} />
      <Route path="/sales" element={<SalesCalendarPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
