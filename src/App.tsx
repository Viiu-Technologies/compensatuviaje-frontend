// ============================================
// App.tsx - Routing con Multi-User Support
// ============================================

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context
import { AuthProvider } from './apps/auth/context/AuthContext';
import { AuthProvider as B2CAuthProvider } from './apps/b2c/context/AuthContext';
import { ThemeProvider } from './shared/context/ThemeContext';

// Auth Components (needed for route guards - keep eager)
import ProtectedRoute, { 
  SuperAdminRoute, 
  B2BRoute, 
  CompanyAdminRoute,
  PartnerRoute 
} from './apps/auth/components/ProtectedRoute';
import PublicRoute from './apps/auth/components/PublicRoute';
import B2CProtectedRoute from './apps/auth/components/B2CProtectedRoute';

// Landing Page - eager (es la ruta principal)
import LandingPage from './apps/public/pages/LandingPage';

// Lazy-loaded pages (code splitting)
const LoginPage = lazy(() => import('./apps/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./apps/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./apps/auth/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./apps/auth/pages/DashboardPage'));
const AuthCallbackPage = lazy(() => import('./apps/b2c/pages/AuthCallback'));

const OnboardingWizardPage = lazy(() => import('./apps/b2b/pages/OnboardingWizardPage'));
const OnboardingStatusPage = lazy(() => import('./apps/b2b/pages/OnboardingStatusPage'));
const OnboardingEditPage = lazy(() => import('./apps/b2b/pages/OnboardingEditPage'));
const B2BDashboardPage = lazy(() => import('./apps/b2b/pages/DashboardPage'));

const B2CDashboardPage = lazy(() => import('./apps/b2c/pages/B2CDashboardPage'));
const B2CFlightsPage = lazy(() => import('./apps/b2c/pages/B2CFlightsPage'));
const B2CProjectsPage = lazy(() => import('./apps/b2c/pages/B2CProjectsPage'));
const B2CCertificatesPage = lazy(() => import('./apps/b2c/pages/B2CCertificatesPage'));
const B2CCalculatorPage = lazy(() => import('./apps/b2c/pages/B2CCalculatorPage'));
const B2CNFTCertificatesPage = lazy(() => import('./apps/b2c/pages/B2CNFTCertificatesPage'));
const B2CAchievementsPage = lazy(() => import('./apps/b2c/pages/B2CAchievementsPage'));
const PublicImpactProfile  = lazy(() => import('./apps/b2c/pages/PublicImpactProfile'));
const PaymentResultPage = lazy(() => import('./apps/b2c/pages/PaymentResultPage'));

const CertificateVerificationPage = lazy(() => import('./shared/components/blockchain').then(m => ({ default: m.CertificateVerificationPage })));

const AdminRoutes = lazy(() => import('./apps/admin/routes'));
const VerificationPage = lazy(() => import('./apps/admin/pages/VerificationPage'));

const PartnerRoutes = lazy(() => import('./apps/partner').then(m => ({ default: m.PartnerRoutes })));

// Loading fallback minimalista
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

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
            <Suspense fallback={<PageLoader />}>
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
            <Route
              path="/b2c/achievements"
              element={
                <B2CProtectedRoute>
                  <B2CAchievementsPage />
                </B2CProtectedRoute>
              }
            />
            {/* Public profile page — no auth required, linked from social share */}
            <Route
              path="/impacto/:userId"
              element={<PublicImpactProfile />}
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
          </Suspense>
        </div>
      </ThemeProvider>
      </B2CAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
