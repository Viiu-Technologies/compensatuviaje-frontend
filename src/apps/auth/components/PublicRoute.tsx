import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuth as useB2CAuth } from '../../b2c/context/AuthContext';
import { getRedirectPath } from '../services/authService';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated: isB2BAuth, isLoading: isB2BLoading, user: b2bUser } = useAuth();
  const { isAuthenticated: isB2CAuth, loading: isB2CLoading, user: b2cUser } = useB2CAuth();

  // Mostrar spinner si cualquiera de los dos contextos está cargando
  if (isB2BLoading || isB2CLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Redirección para usuarios B2B/Admin
  if (isB2BAuth && b2bUser) {
    const redirectPath = getRedirectPath(b2bUser.userType);
    return <Navigate to={redirectPath} replace />;
  }

  // Redirección para usuarios B2C
  if (isB2CAuth && b2cUser) {
    return <Navigate to="/b2c/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
