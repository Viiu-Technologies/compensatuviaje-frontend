import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaEnvelope,
  FaLeaf,
  FaGlobeAmericas,
  FaCertificate
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import ScrollReveal from '../../../shared/components/ScrollReveal';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Servicios',
      links: [
        { label: 'Calculadora CO₂', href: '#calculadora' },
        { label: 'Compensación', href: '#compensacion' },
        { label: 'Proyectos', href: '#proyectos' },
        { label: 'Certificación', href: '#certificacion' }
      ]
    },
    {
      title: 'Información',
      links: [
        { label: 'Blog', href: '#blog' },
        { label: 'Transparencia', href: '#transparencia' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Nosotros', href: '#nosotros' }
      ]
    },
    {
      title: 'Contacto',
      links: [
        { label: 'Contáctanos', href: '#contacto' },
        { label: 'Soporte', href: '#soporte' },
        { label: 'Prensa', href: '#prensa' },
        { label: 'Empresas', href: '#empresas' }
      ]
    }
  ];

  const socialLinks = [
    { icon: FaFacebook, label: 'Facebook', href: '#', color: 'hover:text-blue-400' },
    { icon: FaTwitter, label: 'Twitter', href: '#', color: 'hover:text-sky-400' },
    { icon: FaInstagram, label: 'Instagram', href: '#', color: 'hover:text-pink-400' },
    { icon: FaLinkedin, label: 'LinkedIn', href: '#', color: 'hover:text-blue-500' }
  ];

  const features = [
    { icon: FaLeaf, text: '100% Verificado', color: 'text-primary-900' },
    { icon: FaGlobeAmericas, text: 'Proyectos Globales', color: 'text-secondary-900' },
    { icon: FaCertificate, text: 'Certificación Digital', color: 'text-accent-900' }
  ];


  return (
    <footer className="relative text-neutral-900 overflow-hidden !backdrop-blur-2xl !bg-white/10">
      {/* Background con imagen de Chile */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-background.jpg)' }}
      >
        {/* Overlay con gradiente sunset inspirado en el atardecer */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `
              linear-gradient(180deg, rgba(30,41,82,0.85) 0%, rgba(255,183,120,0.45) 40%, rgba(120,80,160,0.35) 100%),
              linear-gradient(135deg, rgba(30,41,82,0.25) 0%, rgba(255,183,120,0.18) 60%, rgba(120,80,160,0.12) 100%)
            `
          }}
        />
      </div>

      {/* Main content - igual que Hero */}
      <div className="container mx-auto !px-4 sm:!px-6 lg:!px-8 relative z-10 !py-16 lg:!py-20" style={{ maxWidth: '1280px' }}>
        <div className="grid md:grid-cols-2 !gap-12 lg:!gap-16 items-center !mb-16">
          {/* Columna izquierda: logo, texto, badges */}
          <div className="flex flex-col items-center md:items-start !gap-6">
            <ScrollReveal>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center md:items-start !gap-6"
              >
                <img 
                  src="/images/brand/logo-horizontal.svg" 
                  alt="CompensaTuViaje"
                  className="h-14 w-auto drop-shadow-xl md:!ml-0 !mx-auto"
                />
                <p className="text-neutral-900 text-lg font-bold leading-relaxed drop-shadow-sm !text-left">
                  Compensamos la huella de carbono de tus viajes apoyando proyectos verificados en Chile y el mundo.
                </p>
                {/* Features badges */}
                <div className="flex flex-wrap !gap-4 md:!justify-start !justify-center">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center !gap-2 !px-4 !py-2 !rounded-full !bg-white/20 !backdrop-blur-xl !border !border-white/30 shadow-xl"
                      style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}
                    >
                      <feature.icon className={`text-lg ${feature.color}`} />
                      <span className="text-sm font-extrabold text-neutral-900 drop-shadow-sm">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
          {/* Columna derecha: links distribuidos horizontalmente */}
          <div className="w-full flex flex-col items-center md:items-end">
            <div className="grid sm:grid-cols-3 !gap-12 w-full md:w-auto">
              {footerLinks.map((section, sectionIndex) => (
                <ScrollReveal key={sectionIndex} delay={sectionIndex * 0.1}>
                  <div className="!space-y-4 flex flex-col items-center md:items-end mt-8">
                    <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2 drop-shadow-sm text-center md:text-right">
                      <HiSparkles className="text-primary-600" />
                      {section.title}
                    </h3>
                    <ul className="!space-y-3 w-full">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex} className="flex justify-center md:justify-end">
                          <motion.a
                            href={link.href}
                            whileHover={{ x: 5, color: '#22c55e' }}
                            className="text-neutral-900 font-bold hover:text-primary-400 transition-colors duration-200 inline-block drop-shadow-sm text-center md:text-right"
                          >
                            {link.label}
                          </motion.a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter section */}
        <ScrollReveal>
          <div className="card-glass !bg-white/15 !backdrop-blur-xl !p-8 !rounded-2xl !border !border-white/30 !mb-12 shadow-2xl"
            style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}>
            <div className="grid md:grid-cols-2 !gap-8 items-center">
              <div>
                <h3 className="text-2xl font-extrabold text-neutral-900 mb-2 flex items-center gap-2 drop-shadow-sm">
                  <FaEnvelope className="text-primary-600" />
                  Mantente Informado
                </h3>
                <p className="text-neutral-900 font-semibold drop-shadow-sm">
                  Recibe noticias sobre sostenibilidad y compensación de carbono
                </p>
              </div>
              
              <div className="flex !gap-3">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="input flex-1 !bg-white/60 !border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:!border-primary-500 focus:!ring-primary-200/30"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary px-8 whitespace-nowrap !bg-primary-600 !text-white !shadow-md"
                >
                  Suscribirse
                </motion.button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom section */}
        <div className="!border-t !border-neutral-200 !pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center !gap-6">
            {/* Copyright */}
            <p className="text-neutral-900 text-base font-bold drop-shadow-sm">
              © {currentYear} CompensaTuViaje. Todos los derechos reservados.
            </p>

            {/* Social links */}
            <div className="flex items-center !gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`!w-10 !h-10 !rounded-full !bg-white/70 !backdrop-blur !border !border-neutral-200 flex items-center justify-center text-neutral-700 ${social.color} transition-colors duration-200 shadow`}
                  onClick={(e) => e.preventDefault()}
                >
                  <social.icon className="text-lg" />
                </motion.a>
              ))}
            </div>

            {/* Legal links */}
            <div className="flex !gap-6 text-sm">
              <motion.a
                href="#privacidad"
                whileHover={{ color: '#22c55e' }}
                className="text-neutral-900 font-bold hover:text-primary-400 transition-colors drop-shadow-sm"
              >
                Privacidad
              </motion.a>
              <motion.a
                href="#terminos"
                whileHover={{ color: '#22c55e' }}
                className="text-neutral-500 hover:text-primary-600 transition-colors"
              >
                Términos
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;