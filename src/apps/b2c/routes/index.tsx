import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import AuthCallback from '../pages/AuthCallback';
import CompensationPage from '../pages/CompensationPage';
import B2CDashboardPage from '../pages/B2CDashboardPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/b2c/login" replace />;
  }

  return <>{children}</>;
};

const B2CRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <B2CDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compensation"
          element={
            <ProtectedRoute>
              <CompensationPage />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/b2c/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default B2CRoutes;
