// ============================================
// App.tsx - Routing con Multi-User Support
// ============================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context
import { AuthProvider } from './apps/auth/context/AuthContext';
import { AuthProvider as B2CAuthProvider } from './apps/b2c/context/AuthContext';
import { ThemeProvider } from './shared/context/ThemeContext';

// Auth Components
import ProtectedRoute, { 
  SuperAdminRoute, 
  B2BRoute, 
  CompanyAdminRoute,
  PartnerRoute 
} from './apps/auth/components/ProtectedRoute';
import PublicRoute from './apps/auth/components/PublicRoute';
import B2CProtectedRoute from './apps/auth/components/B2CProtectedRoute';

// Pages - Public
import LandingPage from './apps/public/pages/LandingPage';

// Pages - Auth
import LoginPage from './apps/auth/pages/LoginPage';
import RegisterPage from './apps/auth/pages/RegisterPage';
import ForgotPasswordPage from './apps/auth/pages/ForgotPasswordPage';
import DashboardPage from './apps/auth/pages/DashboardPage';
import AuthCallbackPage from './apps/b2c/pages/AuthCallback';

// Pages - B2B (Onboarding)
import OnboardingWizardPage from './apps/b2b/pages/OnboardingWizardPage';
import OnboardingStatusPage from './apps/b2b/pages/OnboardingStatusPage';
import OnboardingEditPage from './apps/b2b/pages/OnboardingEditPage';
import B2BDashboardPage from './apps/b2b/pages/DashboardPage';

// Pages - B2C
import B2CDashboardPage from './apps/b2c/pages/B2CDashboardPage';
import B2CFlightsPage from './apps/b2c/pages/B2CFlightsPage';
import B2CProjectsPage from './apps/b2c/pages/B2CProjectsPage';
import B2CCertificatesPage from './apps/b2c/pages/B2CCertificatesPage';
import B2CCalculatorPage from './apps/b2c/pages/B2CCalculatorPage';
import B2CNFTCertificatesPage from './apps/b2c/pages/B2CNFTCertificatesPage';
import PaymentResultPage from './apps/b2c/pages/PaymentResultPage';

// Pages - Blockchain Verification (Public)
import { CertificateVerificationPage } from './shared/components/blockchain';

// Pages - Admin
import AdminRoutes from './apps/admin/routes';
import VerificationPage from './apps/admin/pages/VerificationPage';
import BatchUploadPage from './apps/admin/pages/BatchUploadPage';

// Pages - Partner
import { PartnerRoutes } from './apps/partner';

// Smart redirect based on user type
const SmartRedirect = () => {
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <B2CAuthProvider>
        <ThemeProvider>
          <div className="App min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Routes>
            {/* ===================== */}
            {/* Rutas P├║blicas */}
            {/* ===================== */}
            
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Public Blockchain Verification */}
            <Route path="/verify/:compensationId" element={<CertificateVerificationPage />} />
            <Route path="/verify/token/:tokenId" element={<CertificateVerificationPage />} />
            
            {/* Auth Callback for OAuth */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            
            {/* Auth - Login y Register con diseño original */}
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
            
            {/* Auth Routes con prefijo /auth para compatibilidad */}
            <Route 
              path="/auth/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/auth/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            
            {/* ===================== */}
            {/* Rutas Privadas - Cualquier usuario autenticado */}
            {/* ===================== */}
            
            {/* Dashboard general - redirige seg├║n tipo de usuario */}
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
                  <div>Gesti├│n de usuarios</div>
                </CompanyAdminRoute>
              } 
            />
            
            {/* ===================== */}
            {/* Rutas Admin - Solo SuperAdmin */}
            {/* ===================== */}
            
            <Route 
              path="/admin/*" 
              element={
                <SuperAdminRoute>
                  <AdminRoutes />
                </SuperAdminRoute>
              } 
            />
            
            {/* ===================== */}
            {/* Rutas B2C - Usuarios individuales */}
            {/* ===================== */}
            
            {/* Resultado de pago Webpay (público - usuario vuelve de Transbank) */}
            <Route 
              path="/b2c/payment-result" 
              element={<PaymentResultPage />} 
            />

            {/* Redirigir /b2c/login al selector de login principal */}
            <Route 
              path="/b2c/login" 
              element={<Navigate to="/login" replace />} 
            />
            
            <Route 
              path="/b2c/dashboard" 
              element={
                <B2CProtectedRoute>
                  <B2CDashboardPage />
                </B2CProtectedRoute>
              } 
            />
            <Route 
              path="/b2c/flights" 
              element={
                <B2CProtectedRoute>
                  <B2CFlightsPage />
                </B2CProtectedRoute>
              } 
            />
            <Route 
              path="/b2c/projects" 
              element={
                <B2CProtectedRoute>
                  <B2CProjectsPage />
                </B2CProtectedRoute>
              } 
            />
            <Route 
              path="/b2c/certificates" 
              element={
                <B2CProtectedRoute>
                  <B2CCertificatesPage />
                </B2CProtectedRoute>
              } 
            />
            <Route 
              path="/b2c/calculator" 
              element={
                <B2CProtectedRoute>
                  <B2CCalculatorPage />
                </B2CProtectedRoute>
              } 
            />
            <Route 
              path="/b2c/nft-certificates" 
              element={
                <B2CProtectedRoute>
                  <B2CNFTCertificatesPage />
                </B2CProtectedRoute>
              } 
            />
            {/* Redirect legacy calculator route */}
            <Route 
              path="/calculator" 
              element={<Navigate to="/b2c/calculator" replace />} 
            />
            
            {/* ===================== */}
            {/* Rutas Partner - Proyectos ESG */}
            {/* ===================== */}
            
            <Route 
              path="/partner/*" 
              element={
                <ProtectedRoute requiredUserTypes={['partner', 'superadmin']}>
                  <PartnerRoutes />
                </ProtectedRoute>
              } 
            />
            
            {/* ===================== */}
            {/* Catch-all - Redirige seg├║n autenticaci├│n */}
            {/* ===================== */}
            
            <Route path="*" element={<SmartRedirect />} />
          </Routes>
        </div>
      </ThemeProvider>
      </B2CAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
