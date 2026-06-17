import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ReceiptGenerator from './pages/ReceiptGenerator';
import Login from './pages/Login';
import TenantDetailsForm from './pages/TenantDetailsForm';
import LandlordDashboard from './pages/LandlordDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavBar = location.pathname === '/tenant-form';

  // Handle redirect from 404.html (path stored in ?p=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get('p');
    if (redirectPath && redirectPath !== '/') {
      // Replace the current URL with the saved path without the query parameter
      navigate(redirectPath, { replace: true });
    }
  }, [location, navigate]);

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