// ============================================
// B2C Protected Route - Para usuarios autenticados con Supabase
// ============================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../b2c/context/AuthContext';

interface B2CProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const B2CProtectedRoute: React.FC<B2CProtectedRouteProps> = ({
  children,
  fallbackPath = '/login',
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default B2CProtectedRoute;
