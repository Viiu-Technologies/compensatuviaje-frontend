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
    { icon: FaLeaf, text: '100% Verificado', color: 'text-primary-400' },
    { icon: FaGlobeAmericas, text: 'Proyectos Globales', color: 'text-secondary-400' },
    { icon: FaCertificate, text: 'Certificación Digital', color: 'text-accent-400' }
  ];

  return (
    <footer className="relative bg-neutral-900 text-white overflow-hidden">
      {/* Background con imagen de Chile */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/hero-background.jpg)' }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/95 via-primary-900/90 to-secondary-900/95" />
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Top section with logo and newsletter */}
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          {/* Logo & description */}
          <ScrollReveal className="lg:col-span-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-6"
            >
              <img 
                src="/images/brand/logocompensatuviaje.png" 
                alt="CompensaTuViaje"
                className="h-16 w-auto"
              />
              
              <p className="text-white/80 text-lg leading-relaxed">
                Compensamos la huella de carbono de tus viajes apoyando proyectos 
                verificados en Chile y el mundo.
              </p>

              {/* Features badges */}
              <div className="flex flex-wrap gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <feature.icon className={`text-lg ${feature.color}`} />
                    <span className="text-sm font-medium text-white/90">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Links sections */}
          <div className="lg:col-span-8">
            <div className="grid sm:grid-cols-3 gap-8">
              {footerLinks.map((section, sectionIndex) => (
                <ScrollReveal key={sectionIndex} delay={sectionIndex * 0.1}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HiSparkles className="text-primary-400" />
                      {section.title}
                    </h3>
                    <ul className="space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <motion.a
                            href={link.href}
                            whileHover={{ x: 5, color: '#22c55e' }}
                            className="text-white/70 hover:text-primary-400 transition-colors duration-200 inline-block"
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
          <div className="card-glass bg-gradient-to-r from-primary-500/20 to-secondary-500/20 p-8 rounded-2xl border border-white/10 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <FaEnvelope className="text-primary-400" />
                  Mantente Informado
                </h3>
                <p className="text-white/70">
                  Recibe noticias sobre sostenibilidad y compensación de carbono
                </p>
              </div>
              
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="input flex-1 bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-primary-400 focus:ring-primary-400/30"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary px-8 whitespace-nowrap"
                >
                  Suscribirse
                </motion.button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="text-white/60 text-sm">
              © {currentYear} CompensaTuViaje. Todos los derechos reservados.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 ${social.color} transition-colors duration-200`}
                  onClick={(e) => e.preventDefault()}
                >
                  <social.icon className="text-lg" />
                </motion.a>
              ))}
            </div>

            {/* Legal links */}
            <div className="flex gap-6 text-sm">
              <motion.a
                href="#privacidad"
                whileHover={{ color: '#22c55e' }}
                className="text-white/60 hover:text-primary-400 transition-colors"
              >
                Privacidad
              </motion.a>
              <motion.a
                href="#terminos"
                whileHover={{ color: '#22c55e' }}
                className="text-white/60 hover:text-primary-400 transition-colors"
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