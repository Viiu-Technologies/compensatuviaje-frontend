// ============================================
// App.tsx - Routing con Multi-User Support
// ============================================

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import { scheduleIdlePrefetch } from './shared/utils/routePrefetch';

// Context
import { AuthProvider } from './apps/auth/context/AuthContext';
import { AuthProvider as B2CAuthProvider } from './apps/b2c/context/AuthContext';
import { ThemeProvider } from './shared/context/ThemeContext';

// Auth Components (needed for route guards - keep eager)
import ProtectedRoute, { 
  SuperAdminRoute, 
  B2BRoute,
  PartnerRoute
} from './apps/auth/components/ProtectedRoute';
import PublicRoute from './apps/auth/components/PublicRoute';
import B2CProtectedRoute from './apps/auth/components/B2CProtectedRoute';

// Landing Page - eager (es la ruta principal)
import LandingPage from './apps/public/pages/LandingPage';

// Lazy-loaded pages (code splitting)
const LoginPage = lazy(() => import('./apps/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./apps/auth/pages/RegisterPage'));
const B2BRegisterPage = lazy(() => import('./apps/auth/pages/B2BRegisterPage'));
const ForgotPasswordPage = lazy(() => import('./apps/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./apps/auth/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./apps/auth/pages/DashboardPage'));
const AuthCallbackPage = lazy(() => import('./apps/b2c/pages/AuthCallback'));

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
const BlogPage = lazy(() => import('./apps/public/pages/BlogPage'));
const NewsDetailPage = lazy(() => import('./apps/public/pages/NewsDetailPage'));
const NewsletterActionPage = lazy(() => import('./apps/public/pages/NewsletterActionPage'));
const PartnersGuidePage = lazy(() => import('./apps/public/pages/PartnersGuidePage'));
const CalculatorPage = lazy(() => import('./apps/public/pages/CalculatorPage'));
const ContactPage = lazy(() => import('./apps/public/pages/ContactPage'));
const PaymentMethodsPage = lazy(() => import('./apps/public/pages/PaymentMethodsPage'));
const TermsPage = lazy(() => import('./apps/public/pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('./apps/public/pages/legal/PrivacyPage'));
const RefundsPage = lazy(() => import('./apps/public/pages/legal/RefundsPage'));
const CookiesPage = lazy(() => import('./apps/public/pages/legal/CookiesPage'));

const CertificateVerificationPage = lazy(() => import('./shared/components/blockchain').then(m => ({ default: m.CertificateVerificationPage })));

const AdminRoutes = lazy(() => import('./apps/admin/routes'));
const VerificationPage = lazy(() => import('./apps/admin/pages/VerificationPage'));

const PartnerRoutes = lazy(() => import('./apps/partner').then(m => ({ default: m.PartnerRoutes })));

// TEMP dev-only previews for img2threejs blockout pass review -- remove after sign-off.
// Los lazy() se crean solo en desarrollo: si se declaran fuera del guard, Vite
// sigue emitiendo sus chunks en produccion (~100KB) aunque la ruta no exista.
const BusinessCardStackPreview = import.meta.env.DEV
  ? lazy(() => import('./threejs-assets/BusinessCardStackPreview'))
  : null;
const LeaningCardsPreview = import.meta.env.DEV
  ? lazy(() => import('./threejs-assets/LeaningCardsPreview'))
  : null;

// Loading fallback minimalista
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Antes, el catch-all mandaba cualquier URL desconocida a /dashboard (ruta
// protegida): un visitante con un enlace roto terminaba en el login sin saber
// que la direccion no existia. Ahora se muestra un 404 real.
const NotFoundPage = lazy(() => import('./apps/public/pages/NotFoundPage'));

function App() {
  useEffect(() => {
    scheduleIdlePrefetch();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <B2CAuthProvider>
        <ThemeProvider>
          <div className="App min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* Notificaciones globales. richColors da los tonos semanticos de
                exito/error; closeButton permite descartarlas con teclado, y
                sonner ya las publica en una region aria-live.
                Se habia borrado por accidente en fad4106: desde entonces
                ningun toast.* del sitio se mostraba. */}
            <Toaster
              position="top-center"
              richColors
              closeButton
              duration={5000}
              toastOptions={{
                style: {
                  fontFamily: "'Inter', system-ui, sans-serif",
                  borderRadius: '12px',
                },
              }}
            />
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
            {/* Noticias del sector. Las rutas de boletín deben ir ANTES de
                /blog/:slug, o el slug capturaría "confirmar" y "baja". */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/confirmar/:token" element={<NewsletterActionPage action="confirm" />} />
            <Route path="/blog/baja/:token" element={<NewsletterActionPage action="unsubscribe" />} />
            <Route path="/blog/:slug" element={<NewsDetailPage />} />
            <Route path="/aliados" element={<PartnersGuidePage />} />
            <Route path="/calculadora" element={<CalculatorPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/pagos" element={<PaymentMethodsPage />} />

            {/* Legal */}
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
            <Route path="/reembolsos" element={<RefundsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/terms" element={<Navigate to="/terminos" replace />} />
            <Route path="/privacy" element={<Navigate to="/privacidad" replace />} />

            {/* TEMP dev-only previews for img2threejs blockout pass review -- remove after sign-off */}
            {/* Previews temporales de revision: solo en desarrollo. */}
            {BusinessCardStackPreview && (
              <Route path="/dev/business-card-stack" element={<BusinessCardStackPreview />} />
            )}
            {LeaningCardsPreview && (
              <Route path="/dev/leaning-cards" element={<LeaningCardsPreview />} />
            )}
            
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
              path="/register/empresa" 
              element={
                <PublicRoute>
                  <B2BRegisterPage />
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
            {/* Destino del enlace del correo de recuperación (antes no existía
                y el enlace caía en 404). Acepta ?token= o /:token. */}
            {['/reset-password', '/reset-password/:token'].map((path) => (
              <Route
                key={path}
                path={path}
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                }
              />
            ))}
            
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
            <Route 
              path="/auth/register/empresa" 
              element={
                <PublicRoute>
                  <B2BRegisterPage />
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
            {/* Onboarding antiguo y gestión de usuarios: simulaban datos o no tenían
                backend. Se redirigen para no romper enlaces guardados. */}
            <Route path="/onboarding/*" element={<Navigate to="/b2b/dashboard" replace />} />
            <Route path="/company/users" element={<Navigate to="/b2b/dashboard" replace />} />

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
            {/* Catch-all - 404 */}
            {/* ===================== */}

            <Route path="*" element={<NotFoundPage />} />
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
