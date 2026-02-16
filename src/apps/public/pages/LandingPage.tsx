import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import CertificateSearch from '../components/CertificateSearch';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <CertificateSearch />
      <Testimonials />
      <FAQ />
      <Footer />
    </>
  );
};

export default LandingPage;
