import React, { lazy } from 'react';
import Header from '../components/Header';
import HeroScroll from '../components/heroScroll/HeroScroll';
import StandardsRibbon from '../components/StandardsRibbon';
import DeferredSection from '../components/DeferredSection';
import { useForceLightTheme } from '../../../shared/utils/useForceLightTheme';
import { useSeo } from '../../../shared/utils/useSeo';
import { PUBLIC_SEO } from '../../../shared/config/publicSeo';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { useScrollTriggerAutoRefresh } from '../hooks/useGsapReveal';

// Below-fold sections: lazy loaded for optimal Core Web Vitals (FCP / LCP)
const Features = lazy(() => import('../components/Features'));
const VirtualForestSection = lazy(() => import('../components/forest3d/VirtualForestSection'));
const ProjectsBento = lazy(() => import('../components/ProjectsBento'));
const EnterpriseSuite = lazy(() => import('../components/EnterpriseSuite'));
const CertificateSearch = lazy(() => import('../components/CertificateSearch'));
const FAQ = lazy(() => import('../components/FAQ'));
const Footer = lazy(() => import('../components/Footer'));

const LandingPage: React.FC = () => {
  useSeo(PUBLIC_SEO['/']);

  // Force light theme for brand consistency on public landing
  useForceLightTheme();

  // Lenis solo en la landing: el resto del sitio mantiene el scroll nativo.
  useSmoothScroll();
  // Las secciones diferidas y las imágenes cambian el alto de la página: los
  // disparos de las entradas se recalculan para no llegar tarde.
  useScrollTriggerAutoRefresh();

  return (
    <>
      {/* Primer elemento tabulable: permite saltar la navegación y llegar
          directo al contenido. Solo es visible al recibir foco. */}
      <a href="#contenido-principal" className="skip-to-content">
        Saltar al contenido
      </a>
      <Header transparentAtTop />
      <main id="contenido-principal">
        <HeroScroll />
        <StandardsRibbon />
        {/* Bajo el pliegue: cada sección se monta al acercarse (DeferredSection).
            Altos reservados medidos en móvil (390), tablet (768) y escritorio (1440).
            Orden de la historia: el hero cuenta emisión → medición; siguen cómo
            funciona, la verificación y la regeneración (proyectos y el bosque,
            que la cierra), y al final empresas y preguntas. */}
        <DeferredSection id="como-funciona" heights={[2002, 932, 995]}>
          <Features />
        </DeferredSection>
        <DeferredSection id="verificar" heights={[1166, 996, 645]}>
          <CertificateSearch />
        </DeferredSection>
        <DeferredSection id="proyectos" heights={[2179, 1721, 1177]}>
          <ProjectsBento />
        </DeferredSection>
        <DeferredSection id="entorno-verde" heights={[1025, 940, 1042]}>
          <VirtualForestSection />
        </DeferredSection>
        <DeferredSection id="empresas" heights={[1739, 1113, 772]}>
          <EnterpriseSuite />
        </DeferredSection>
        <DeferredSection id="faq" heights={[1355, 1251, 1407]}>
          <FAQ />
        </DeferredSection>
      </main>
      <DeferredSection heights={[1875, 1575, 1345]}>
        <Footer />
      </DeferredSection>
    </>
  );
};

export default LandingPage;
