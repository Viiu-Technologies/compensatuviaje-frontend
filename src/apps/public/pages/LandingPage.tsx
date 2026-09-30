import React, { lazy, Suspense } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import StandardsRibbon from '../components/StandardsRibbon';
import { useForceLightTheme } from '../../../shared/utils/useForceLightTheme';
import { useSeo } from '../../../shared/utils/useSeo';

// Below-fold sections: lazy loaded for optimal Core Web Vitals (FCP / LCP)
const Features = lazy(() => import('../components/Features'));
const VirtualForestSection = lazy(() => import('../components/forest3d/VirtualForestSection'));
const ProjectsBento = lazy(() => import('../components/ProjectsBento'));
const EnterpriseSuite = lazy(() => import('../components/EnterpriseSuite'));
const CertificateSearch = lazy(() => import('../components/CertificateSearch'));
const FAQ = lazy(() => import('../components/FAQ'));
const Footer = lazy(() => import('../components/Footer'));

const LandingPage: React.FC = () => {
  useSeo({
    title: 'CompensaTuViaje | Calcula y compensa la huella de carbono de tus viajes',
    path: '/',
  });

  // Force light theme for brand consistency on public landing
  useForceLightTheme();

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
          <FAQ />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
};

export default LandingPage;
