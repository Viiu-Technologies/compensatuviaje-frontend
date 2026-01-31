import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import EmpresasPage from '../pages/EmpresasPage';
import UsuariosB2CPage from '../pages/UsuariosB2CPage';
import ProyectosPage from '../pages/ProyectosPage';
import ReportesPage from '../pages/ReportesPage';
import VerificationPage from '../pages/VerificationPage';
import BatchUploadPage from '../pages/BatchUploadPage';
import PartnersPage from '../pages/PartnersPage';
import PartnerDetailPage from '../pages/PartnerDetailPage';
import ProjectsReviewPage from '../pages/ProjectsReviewPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Dashboard Principal SuperAdmin */}
        <Route path="" element={<SuperAdminDashboard />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />

        {/* Gestión de Empresas B2B */}
        <Route path="empresas" element={<EmpresasPage />} />

        {/* Gestión de Usuarios B2C */}
        <Route path="usuarios-b2c" element={<UsuariosB2CPage />} />

        {/* Gestión de Impact Partners */}
        <Route path="partners" element={<PartnersPage />} />
        <Route path="partners/:id" element={<PartnerDetailPage />} />

        {/* Revisión de Proyectos ESG (pendientes) */}
        <Route path="proyectos-revision" element={<ProjectsReviewPage />} />

        {/* Gestión de Proyectos ESG */}
        <Route path="proyectos" element={<ProyectosPage />} />

        {/* Reportes y Exportación */}
        <Route path="reportes" element={<ReportesPage />} />

        {/* Verificación de Compensaciones */}
        <Route path="verificacion" element={<VerificationPage />} />

        {/* Carga Batch */}
        <Route path="batch-upload" element={<BatchUploadPage />} />

        {/* Redirección legacy */}
        <Route path="verification" element={<Navigate to="/admin/verificacion" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
