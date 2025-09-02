import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VerificationCenter from './pages/VerificationCenter';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import VerificationReview from './pages/VerificationReview';
import Profile from './pages/Profile';
import ReportManagement from './pages/ReportManagement';
import Incidents from './pages/Incidents';
import ActivityHistory from './pages/ActivityHistory';

// Layout component for authenticated pages
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return children;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppLayout>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected user routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/verificationCenter" 
                element={
                  <ProtectedRoute>
                    <VerificationCenter />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/incidents" 
                element={
                  <ProtectedRoute>
                    <Incidents />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/activity-history" 
                element={
                  <ProtectedRoute>
                    <ActivityHistory />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/verification/:userId" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <VerificationReview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ReportManagement />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
