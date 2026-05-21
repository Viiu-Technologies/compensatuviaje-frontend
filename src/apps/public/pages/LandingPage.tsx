import React, { lazy, Suspense, useLayoutEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import { useTheme } from '../../../shared/context/ThemeContext';

// Below-fold sections — lazy loaded for faster FCP/LCP
const CertificateSearch = lazy(() => import('../components/CertificateSearch'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const FAQ = lazy(() => import('../components/FAQ'));
const ContactSection = lazy(() => import('../components/ContactSection'));
const Footer = lazy(() => import('../components/Footer'));

const LandingPage = () => {
  const { resolvedTheme } = useTheme();

  useLayoutEffect(() => {
    const root = window.document.documentElement;
    const originalTheme = resolvedTheme;

    // Force light theme
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');

    // Also update theme-color meta tag for mobile devices
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#ffffff');
    }

    return () => {
      // Restore original theme when leaving the landing page
      root.classList.remove('light', 'dark');
      root.classList.add(originalTheme);
      root.setAttribute('data-theme', originalTheme);
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          originalTheme === 'dark' ? '#1a1a2e' : '#ffffff'
        );
      }
    };
  }, [resolvedTheme]);

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
