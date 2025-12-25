import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginSelector from '../pages/LoginSelector';
import B2BLoginPage from '../pages/B2BLoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import AccountTypeSelector from '../pages/AccountTypeSelector';
import B2BRegisterPage from '../pages/B2BRegisterPage';
import B2CRegisterPage from '../pages/B2CRegisterPage';

const AuthRoutes = () => {
  return (
    <Routes>
      {/* Login Routes */}
      <Route path="/login" element={<LoginSelector />} />
      <Route path="/login/empresa" element={<B2BLoginPage />} />
      
      {/* Register Routes */}
      <Route path="/register" element={<AccountTypeSelector />} />
      <Route path="/register/empresa" element={<B2BRegisterPage />} />
      <Route path="/register/personal" element={<B2CRegisterPage />} />
      
      {/* Other Routes */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
};

export default AuthRoutes;
