import React, { lazy, Suspense, useLayoutEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import StandardsRibbon from '../components/StandardsRibbon';
import { useTheme } from '../../../shared/context/ThemeContext';

// Below-fold sections: lazy loaded for optimal Core Web Vitals (FCP / LCP)
const Features = lazy(() => import('../components/Features'));
const VirtualForestSection = lazy(() => import('../components/forest3d/VirtualForestSection'));
const ProjectsBento = lazy(() => import('../components/ProjectsBento'));
const EnterpriseSuite = lazy(() => import('../components/EnterpriseSuite'));
const CertificateSearch = lazy(() => import('../components/CertificateSearch'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const FAQ = lazy(() => import('../components/FAQ'));
const ContactSection = lazy(() => import('../components/ContactSection'));
const Footer = lazy(() => import('../components/Footer'));

const LandingPage: React.FC = () => {
  const { resolvedTheme } = useTheme();

  useLayoutEffect(() => {
    const root = window.document.documentElement;
    const originalTheme = resolvedTheme;

    // Force light theme for brand consistency on public landing
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#ffffff');
    }

    return () => {
      // Restore original theme when navigating away
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
      {/* Primer elemento tabulable: permite saltar la navegación y llegar
          directo al contenido. Solo es visible al recibir foco. */}
      <a href="#contenido-principal" className="skip-to-content">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido-principal">
        <Hero />
        <StandardsRibbon />
        <Suspense fallback={null}>
          <Features />
          <VirtualForestSection />
          <ProjectsBento />
          <EnterpriseSuite />
          <CertificateSearch />
          <Testimonials />
          <FAQ />
          <ContactSection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
};

export default LandingPage;
