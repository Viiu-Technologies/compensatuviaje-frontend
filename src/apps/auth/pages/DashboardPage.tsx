import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  // Redirigir usuarios B2B al dashboard correcto
  if (user?.userType === 'b2b') {
    return <Navigate to="/b2b/dashboard" replace />;
  }

  // Redirigir usuarios B2C a su dashboard
  if (user?.userType === 'b2c') {
    return <Navigate to="/b2c/dashboard" replace />;
  }

  // SuperAdmin va al panel de administración real
  if (user?.userType === 'superadmin') {
    return <Navigate to="/admin" replace />;
  }

  // Partner va a su panel
  if (user?.userType === 'partner') {
    return <Navigate to="/partner" replace />;
  }

  // Si no es ninguno, redirigir al login
  return <Navigate to="/login" replace />;
};

export default DashboardPage;
