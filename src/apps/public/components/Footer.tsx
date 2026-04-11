import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaFacebook, 
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
    { icon: FaLinkedin, label: 'LinkedIn', href: '#', color: 'hover:text-blue-500' }
  ];

  const features = [
    { icon: FaLeaf, text: '100% Verificado', color: 'text-primary-900' },
    { icon: FaGlobeAmericas, text: 'Proyectos Globales', color: 'text-secondary-900' },
    { icon: FaCertificate, text: 'Certificación Digital', color: 'text-accent-900' }
  ];


  return (
    <footer className="!relative !text-white !overflow-hidden">
      {/* Background con imagen de Chile */}
      <div 
        className="!absolute !inset-0 !bg-cover !bg-center !bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-background.jpg)' }}
      >
        {/* Overlay oscuro for text readability */}
        <div 
          className="!absolute !inset-0"
          style={{ 
            background: `
              linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(30,41,82,0.80) 40%, rgba(15,23,42,0.88) 100%)
            `
          }}
        />
      </div>

      {/* Main content */}
      <div className="!relative !z-10 !py-16 lg:!py-20" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div className="!grid md:!grid-cols-2 !gap-12 lg:!gap-16 !items-start !mb-16">
          {/* Columna izquierda: logo, texto, badges */}
          <div className="!flex !flex-col !items-center md:!items-start !gap-6">
            <ScrollReveal>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="!flex !flex-col !items-center md:!items-start !gap-6"
              >
                <img 
                  src="/images/brand/logo-horizontal.svg" 
                  alt="CompensaTuViaje"
                  className="!h-14 !w-auto !drop-shadow-xl md:!ml-0 !mx-auto !brightness-0 !invert"
                />
                <p className="!text-gray-300 !text-lg !leading-relaxed !text-center md:!text-left">
                  Compensamos la huella de carbono de tus viajes apoyando proyectos verificados en Chile y el mundo.
                </p>
                {/* Features badges */}
                <div className="!flex !flex-wrap !gap-3 md:!justify-start !justify-center">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="!flex !items-center !gap-2 !px-4 !py-2 !rounded-full !bg-white/10 !backdrop-blur-xl !border !border-white/20"
                    >
                      <feature.icon className={`!text-lg ${feature.color === 'text-primary-900' ? '!text-emerald-400' : feature.color === 'text-secondary-900' ? '!text-blue-400' : '!text-amber-400'}`} />
                      <span className="!text-sm !font-semibold !text-white/90">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>
          </div>

          {/* Columna derecha: links */}
          <div className="!w-full !flex !flex-col !items-center md:!items-end">
            <div className="!grid sm:!grid-cols-3 !gap-10 !w-full md:!w-auto">
              {footerLinks.map((section, sectionIndex) => (
                <ScrollReveal key={sectionIndex} delay={sectionIndex * 0.1}>
                  <div className="!space-y-4 !flex !flex-col !items-center md:!items-end">
                    <h3 className="!text-lg !font-bold !text-white !flex !items-center !gap-2 !text-center md:!text-right">
                      <HiSparkles className="!text-emerald-400" />
                      {section.title}
                    </h3>
                    <ul className="!space-y-3 !w-full">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex} className="!flex !justify-center md:!justify-end">
                          <motion.a
                            href={link.href}
                            whileHover={{ x: 5, color: '#34d399' }}
                            className="!text-gray-400 hover:!text-emerald-400 !transition-colors !duration-200 !inline-block !text-center md:!text-right"
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
          <div className="!bg-white/10 !backdrop-blur-xl !p-8 !rounded-2xl !border !border-white/20 !mb-12">
            <div className="!grid md:!grid-cols-2 !gap-8 !items-center">
              <div>
                <h3 className="!text-2xl !font-bold !text-white !mb-2 !flex !items-center !gap-2">
                  <FaEnvelope className="!text-emerald-400" />
                  Mantente Informado
                </h3>
                <p className="!text-gray-400">
                  Recibe noticias sobre sostenibilidad y compensación de carbono
                </p>
              </div>
              
              <div className="!flex !gap-3">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="!flex-1 !bg-white/10 !border !border-white/20 !text-white !placeholder-gray-500 !rounded-xl !px-4 !py-3 focus:!border-emerald-400 focus:!outline-none focus:!ring-2 focus:!ring-emerald-400/20"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="!px-8 !py-3 !whitespace-nowrap !bg-emerald-600 !text-white !font-semibold !rounded-xl !shadow-md hover:!bg-emerald-700 !transition-colors"
                >
                  Suscribirse
                </motion.button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom section */}
        <div className="!border-t !border-white/20 !pt-8">
          <div className="!flex !flex-col md:!flex-row !justify-between !items-center !gap-6">
            {/* Copyright */}
            <p className="!text-gray-400 !text-base">
              © {currentYear} CompensaTuViaje. Todos los derechos reservados.
            </p>

            {/* Social links */}
            <div className="!flex !items-center !gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`!w-10 !h-10 !rounded-full !bg-white/10 !backdrop-blur !border !border-white/20 !flex !items-center !justify-center !text-gray-300 ${social.color} !transition-colors !duration-200`}
                  onClick={(e) => e.preventDefault()}
                >
                  <social.icon className="!text-lg" />
                </motion.a>
              ))}
            </div>

            {/* Legal links */}
            <div className="!flex !gap-6 !text-sm">
              <motion.a
                href="#privacidad"
                whileHover={{ color: '#34d399' }}
                className="!text-gray-400 hover:!text-emerald-400 !transition-colors"
              >
                Privacidad
              </motion.a>
              <motion.a
                href="#terminos"
                whileHover={{ color: '#34d399' }}
                className="!text-gray-400 hover:!text-emerald-400 !transition-colors"
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