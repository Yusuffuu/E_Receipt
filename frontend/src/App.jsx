import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ReceiptGenerator from './pages/ReceiptGenerator';
import Login from './pages/Login';
import TenantDetailsForm from './pages/TenantDetailsForm';
import LandlordDashboard from './pages/LandlordDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';

function AppContent() {
  const location = useLocation();
  const hideNavBar = location.pathname === '/tenant-form';

  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<ReceiptGenerator />} />
        <Route path="/login" element={<Login />} />
        <Route path="/agreement" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/tenant-form" element={<TenantDetailsForm />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;