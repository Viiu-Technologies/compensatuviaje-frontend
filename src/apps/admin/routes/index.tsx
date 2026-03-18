import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import EmpresasPage from '../pages/EmpresasPage';
import EmpresaDetailPage from '../pages/EmpresaDetailPage';
import UsuariosB2CPage from '../pages/UsuariosB2CPage';
import UsuarioB2CDetailPage from '../pages/UsuarioB2CDetailPage';
import ProyectosPage from '../pages/ProyectosPage';
import ReportesPage from '../pages/ReportesPage';
import VerificationPage from '../pages/VerificationPage';
import PartnersPage from '../pages/PartnersPage';
import PartnerDetailPage from '../pages/PartnerDetailPage';
import ProjectsReviewPage from '../pages/ProjectsReviewPage';
import AdminNFTDashboard from '../pages/AdminNFTDashboard';
import AIEvaluationsPage from '../pages/AIEvaluationsPage';
import AIKybDetailPage from '../pages/AIKybDetailPage';
import AICertDetailPage from '../pages/AICertDetailPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Dashboard Principal SuperAdmin */}
        <Route path="" element={<SuperAdminDashboard />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />

        {/* Gestión de Empresas B2B */}
        <Route path="empresas" element={<EmpresasPage />} />
        <Route path="empresas/:id" element={<EmpresaDetailPage />} />

        {/* Gestión de Usuarios B2C */}
        <Route path="usuarios-b2c" element={<UsuariosB2CPage />} />
        <Route path="usuarios-b2c/:id" element={<UsuarioB2CDetailPage />} />

        {/* Gestión de Impact Partners */}
        <Route path="partners" element={<PartnersPage />} />
        <Route path="partners/:id" element={<PartnerDetailPage />} />

        {/* Validaciones IA (Partners y Proyectos) */}
        <Route path="partners/evaluations" element={<AIEvaluationsPage />} />
        <Route path="partners/evaluations/:id" element={<AICertDetailPage />} />
        <Route path="partners/kyb-evaluations/:id" element={<AIKybDetailPage />} />

        {/* Revisión de Proyectos ESG (pendientes) */}
        <Route path="proyectos-revision" element={<ProjectsReviewPage />} />

        {/* Gestión de Proyectos ESG */}
        <Route path="proyectos" element={<ProyectosPage />} />

        {/* Reportes y Exportación */}
        <Route path="reportes" element={<ReportesPage />} />

        {/* Verificación de Compensaciones */}
        <Route path="verificacion" element={<VerificationPage />} />

        {/* NFT Blockchain Management */}
        <Route path="nft-blockchain" element={<AdminNFTDashboard />} />

        {/* Redirección legacy */}
        <Route path="verification" element={<Navigate to="/admin/verificacion" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
