import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../../admin/components/AdminDashboard';

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

  // SuperAdmin ve el AdminDashboard en /dashboard
  if (user?.userType === 'superadmin') {
    return <AdminDashboard />;
  }

  // Si no es ninguno, redirigir al login
  return <Navigate to="/login" replace />;
};

export default DashboardPage;
