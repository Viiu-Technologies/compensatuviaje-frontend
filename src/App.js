import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components - Landing
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Compensation from './components/Compensation';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

// Components - Auth
import Login from './components/auth/Login';
import RegisterWizard from './components/auth/RegisterWizard';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/auth/Dashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';

// Components - Onboarding
import CompanyOnboardingWizard from './components/onboarding/CompanyOnboardingWizard';
import OnboardingStatus from './components/onboarding/OnboardingStatus';
import OnboardingEdit from './components/onboarding/OnboardingEdit';

// Components - Admin
import AdminDashboard from './components/admin/AdminDashboard';
import VerificationPanel from './components/admin/VerificationPanel';
import BatchUpload from './components/admin/BatchUpload';

// Landing Page Component
const LandingPage = () => (
  <>
    <Header />
    <Hero />
    <Features />
    <Compensation />
    <Testimonials />
    <FAQ />
    <Footer />
  </>
);

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
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterWizard />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            
            {/* Rutas privadas - Requieren autenticación */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Rutas privadas - Onboarding */}
            <Route 
              path="/onboarding/wizard" 
              element={
                <PrivateRoute>
                  <CompanyOnboardingWizard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/onboarding/status" 
              element={
                <PrivateRoute>
                  <OnboardingStatus />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/onboarding/edit" 
              element={
                <PrivateRoute>
                  <OnboardingEdit />
                </PrivateRoute>
              } 
            />
            
            {/* Rutas privadas - Admin */}
            <Route 
              path="/admin" 
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/verification" 
              element={
                <PrivateRoute>
                  <VerificationPanel />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/batch-upload" 
              element={
                <PrivateRoute>
                  <BatchUpload />
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
