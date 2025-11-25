import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OnboardingWizardPage from '../pages/OnboardingWizardPage';
import OnboardingStatusPage from '../pages/OnboardingStatusPage';
import OnboardingEditPage from '../pages/OnboardingEditPage';

const B2BRoutes = () => {
  return (
    <Routes>
      <Route path="/wizard" element={<OnboardingWizardPage />} />
      <Route path="/status" element={<OnboardingStatusPage />} />
      <Route path="/edit" element={<OnboardingEditPage />} />
    </Routes>
  );
};

export default B2BRoutes;
