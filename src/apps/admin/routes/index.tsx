import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import VerificationPage from '../pages/VerificationPage';
import BatchUploadPage from '../pages/BatchUploadPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboardPage />} />
      <Route path="/verification" element={<VerificationPage />} />
      <Route path="/batch-upload" element={<BatchUploadPage />} />
    </Routes>
  );
};

export default AdminRoutes;
