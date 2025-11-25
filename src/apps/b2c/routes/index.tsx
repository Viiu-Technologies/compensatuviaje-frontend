import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CompensationPage from '../pages/CompensationPage';

const B2CRoutes = () => {
  return (
    <Routes>
      <Route path="/compensation" element={<CompensationPage />} />
    </Routes>
  );
};

export default B2CRoutes;
