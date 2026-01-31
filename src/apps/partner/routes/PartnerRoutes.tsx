// ============================================
// PARTNER ROUTES
// Configuración de rutas del módulo Partner
// ============================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import PartnerLayout from '../components/PartnerLayout';

// Pages
import PartnerDashboard from '../pages/PartnerDashboard';
import PartnerProfile from '../pages/PartnerProfile';
import PartnerProjects from '../pages/PartnerProjects';
import ProjectDetail from '../pages/ProjectDetail';
import ProjectForm from '../pages/ProjectForm';

// ============================================
// PARTNER ROUTES COMPONENT
// ============================================

const PartnerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<PartnerLayout />}>
        {/* Dashboard */}
        <Route index element={<PartnerDashboard />} />
        
        {/* Profile & Settings */}
        <Route path="profile" element={<PartnerProfile />} />
        
        {/* Projects */}
        <Route path="projects" element={<PartnerProjects />} />
        <Route path="projects/create" element={<ProjectForm />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/edit" element={<ProjectForm />} />
      </Route>
      
      {/* Fallback - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/partner" replace />} />
    </Routes>
  );
};

export default PartnerRoutes;
