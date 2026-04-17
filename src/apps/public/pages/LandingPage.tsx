import React, { lazy, Suspense } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';

// Below-fold sections — lazy loaded for faster FCP/LCP
const CertificateSearch = lazy(() => import('../components/CertificateSearch'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const FAQ = lazy(() => import('../components/FAQ'));
const ContactSection = lazy(() => import('../components/ContactSection'));
const Footer = lazy(() => import('../components/Footer'));

const LandingPage = () => {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Suspense fallback={null}>
        <CertificateSearch />
        <Testimonials />
        <FAQ />
        <ContactSection />
        <Footer />
      </Suspense>
    </>
  );
};

export default LandingPage;
