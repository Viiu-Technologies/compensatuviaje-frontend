import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CompensationPage from '../pages/CompensationPage';
import B2CDashboardPage from '../pages/B2CDashboardPage';

const B2CRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<B2CDashboardPage />} />
      <Route path="/compensation" element={<CompensationPage />} />
    </Routes>
  );
};

export default B2CRoutes;
