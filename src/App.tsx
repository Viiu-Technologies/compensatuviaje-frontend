// ============================================
// App.tsx - Routing con Multi-User Support
// ============================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context
import { AuthProvider } from './apps/auth/context/AuthContext';

// Auth Components
import ProtectedRoute, { 
  SuperAdminRoute, 
  B2BRoute, 
  CompanyAdminRoute 
} from './apps/auth/components/ProtectedRoute';
import PublicRoute from './apps/auth/components/PublicRoute';

// Pages - Public
import LandingPage from './apps/public/pages/LandingPage';

// Pages - Auth
import LoginPage from './apps/auth/pages/LoginPage';
import RegisterPage from './apps/auth/pages/RegisterPage';
import ForgotPasswordPage from './apps/auth/pages/ForgotPasswordPage';
import DashboardPage from './apps/auth/pages/DashboardPage';

// Pages - B2B (Onboarding)
import OnboardingWizardPage from './apps/b2b/pages/OnboardingWizardPage';
import OnboardingStatusPage from './apps/b2b/pages/OnboardingStatusPage';
import OnboardingEditPage from './apps/b2b/pages/OnboardingEditPage';
import B2BDashboardPage from './apps/b2b/pages/DashboardPage';

// Pages - B2C
import B2CDashboardPage from './apps/b2c/pages/B2CDashboardPage';

// Pages - Admin
import AdminDashboardPage from './apps/admin/pages/AdminDashboardPage';
import VerificationPage from './apps/admin/pages/VerificationPage';
import BatchUploadPage from './apps/admin/pages/BatchUploadPage';

// Smart redirect based on user type
const SmartRedirect = () => {
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* ===================== */}
            {/* Rutas Públicas */}
            {/* ===================== */}
            
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth - redirige a dashboard si ya está autenticado */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } 
            />
            
            {/* ===================== */}
            {/* Rutas Privadas - Cualquier usuario autenticado */}
            {/* ===================== */}
            
            {/* Dashboard general - redirige según tipo de usuario */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* ===================== */}
            {/* Rutas B2B - Solo empresas */}
            {/* ===================== */}
            
            <Route 
              path="/b2b/dashboard" 
              element={
                <B2BRoute>
                  <B2BDashboardPage />
                </B2BRoute>
              } 
            />
            <Route 
              path="/onboarding/wizard" 
              element={
                <B2BRoute>
                  <OnboardingWizardPage />
                </B2BRoute>
              } 
            />
            <Route 
              path="/onboarding/status" 
              element={
                <B2BRoute>
                  <OnboardingStatusPage />
                </B2BRoute>
              } 
            />
            <Route 
              path="/onboarding/edit" 
              element={
                <B2BRoute>
                  <OnboardingEditPage />
                </B2BRoute>
              } 
            />
            
            {/* Rutas B2B - Solo admin de empresa */}
            <Route 
              path="/company/users" 
              element={
                <CompanyAdminRoute>
                  {/* UsersListPage - TODO */}
                  <div>Gestión de usuarios</div>
                </CompanyAdminRoute>
              } 
            />
            
            {/* ===================== */}
            {/* Rutas Admin - Solo SuperAdmin */}
            {/* ===================== */}
            
            <Route 
              path="/admin/verification" 
              element={
                <SuperAdminRoute>
                  <VerificationPage />
                </SuperAdminRoute>
              } 
            />
            <Route 
              path="/admin/batch-upload" 
              element={
                <SuperAdminRoute>
                  <BatchUploadPage />
                </SuperAdminRoute>
              } 
            />
            
            {/* ===================== */}
            {/* Rutas B2C - Usuarios individuales (TODO) */}
            {/* ===================== */}
            
            <Route 
              path="/b2c/dashboard" 
              element={
                <ProtectedRoute requiredUserTypes={['b2c', 'superadmin']}>
                  <B2CDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calculator" 
              element={
                <ProtectedRoute requiredUserTypes={['b2c', 'superadmin']}>
                  {/* CalculatorPage - TODO */}
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Calculadora de Huella de Carbono</h1>
                    <p className="text-gray-600 mt-2">Próximamente...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* ===================== */}
            {/* Rutas Partner - Proyectos ESG (TODO) */}
            {/* ===================== */}
            
            <Route 
              path="/partner/*" 
              element={
                <ProtectedRoute requiredUserTypes={['partner', 'superadmin']}>
                  {/* PartnerDashboard - TODO */}
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Dashboard Partner</h1>
                    <p className="text-gray-600 mt-2">Próximamente...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* ===================== */}
            {/* Catch-all - Redirige según autenticación */}
            {/* ===================== */}
            
            <Route path="*" element={<SmartRedirect />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
