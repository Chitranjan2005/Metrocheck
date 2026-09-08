import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Scan from './pages/Scan';
import Dashboard from './pages/Dashboard';
import Repository from './pages/Repository';
import ReportDetail from './pages/ReportDetail';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/scan" element={<Scan />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/repository" element={<Repository />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/scan" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
