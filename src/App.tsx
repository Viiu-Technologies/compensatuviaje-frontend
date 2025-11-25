import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Context
import { AuthProvider } from './apps/auth/context/AuthContext';

// Auth Components
import PrivateRoute from './apps/auth/components/PrivateRoute';
import PublicRoute from './apps/auth/components/PublicRoute';

// Pages
import LandingPage from './apps/public/pages/LandingPage';
import LoginPage from './apps/auth/pages/LoginPage';
import RegisterPage from './apps/auth/pages/RegisterPage';
import ForgotPasswordPage from './apps/auth/pages/ForgotPasswordPage';
import DashboardPage from './apps/auth/pages/DashboardPage';
import OnboardingWizardPage from './apps/b2b/pages/OnboardingWizardPage';
import OnboardingStatusPage from './apps/b2b/pages/OnboardingStatusPage';
import OnboardingEditPage from './apps/b2b/pages/OnboardingEditPage';
import AdminDashboardPage from './apps/admin/pages/AdminDashboardPage';
import VerificationPage from './apps/admin/pages/VerificationPage';
import BatchUploadPage from './apps/admin/pages/BatchUploadPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Ruta pública - Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Rutas públicas - Auth (redirige a dashboard si ya está autenticado) */}
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
            
            {/* Rutas privadas - Requieren autenticación */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            
            {/* Rutas privadas - B2B (Onboarding) */}
            <Route 
              path="/onboarding/wizard" 
              element={
                <PrivateRoute>
                  <OnboardingWizardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/onboarding/status" 
              element={
                <PrivateRoute>
                  <OnboardingStatusPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/onboarding/edit" 
              element={
                <PrivateRoute>
                  <OnboardingEditPage />
                </PrivateRoute>
              } 
            />
            
            {/* Rutas privadas - Admin */}
            <Route 
              path="/admin" 
              element={
                <PrivateRoute>
                  <AdminDashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/verification" 
              element={
                <PrivateRoute>
                  <VerificationPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/batch-upload" 
              element={
                <PrivateRoute>
                  <BatchUploadPage />
                </PrivateRoute>
              } 
            />
            
            {/* Ruta 404 - Redirige a landing */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
