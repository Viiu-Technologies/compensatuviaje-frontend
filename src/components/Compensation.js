import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaTree, FaGlobeAmericas, FaCertificate, FaChartLine, FaHandHoldingHeart } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import ScrollReveal from './shared/ScrollReveal';

const Compensation = () => {
  const benefits = [
    {
      icon: FaLeaf,
      title: 'Transparencia Total',
      description: 'Cada peso invertido se rastrea hasta el proyecto específico de compensación',
      color: 'primary'
    },
    {
      icon: FaCertificate,
      title: 'Certificación Verificada',
      description: 'Todos nuestros proyectos están certificados internacionalmente',
      color: 'secondary'
    },
    {
      icon: FaChartLine,
      title: 'Impacto Medible',
      description: 'Visualiza el impacto real de tu compensación en tiempo real',
      color: 'accent'
    },
    {
      icon: FaTree,
      title: 'Proyectos Locales',
      description: 'Apoyamos proyectos de reforestación en Chile y América Latina',
      color: 'success'
    },
    {
      icon: FaGlobeAmericas,
      title: 'Alcance Global',
      description: 'Contribuye a la lucha contra el cambio climático a nivel mundial',
      color: 'primary'
    },
    {
      icon: FaHandHoldingHeart,
      title: 'Compromiso Social',
      description: 'Generamos empleos y desarrollo en comunidades locales',
      color: 'secondary'
    }
  ];

  const stats = [
    { value: '15,420', label: 'Toneladas CO₂ Compensadas', suffix: '+' },
    { value: '350', label: 'Hectáreas Reforestadas', suffix: '+' },
    { value: '8,234', label: 'Viajeros Conscientes', suffix: '+' },
    { value: '98', label: 'Satisfacción', suffix: '%' }
  ];

  return (
    <section className="section bg-gradient-to-br from-neutral-50 via-primary-50/30 to-neutral-50" id="compensacion">
      <div className="container-custom">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 badge-primary mb-6"
            >
              <HiSparkles className="text-primary-600" />
              <span>Compensación Transparente</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
              Tu Viaje, Nuestro{' '}
              <span className="text-gradient-primary">Compromiso Verde</span>
            </h2>
            
            <p className="text-xl text-neutral-600 leading-relaxed">
              Compensa tu Viaje es la solución definitiva para quienes desean 
              llevar un estilo de vida más sostenible. Calcula, compensa y 
              visualiza tu impacto positivo en el planeta.
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -5 }}
                className="card-glass p-6 text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-gradient-primary mb-2">
                  {stat.value}
                  <span className="text-primary-500">{stat.suffix}</span>
                </div>
                <p className="text-sm text-neutral-600 font-medium">{stat.label}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const colorClasses = {
              primary: 'from-primary-500 to-primary-600 text-primary-600',
              secondary: 'from-secondary-500 to-secondary-600 text-secondary-600',
              accent: 'from-accent-500 to-accent-600 text-accent-600',
              success: 'from-green-500 to-green-600 text-green-600'
            };
            
            return (
              <ScrollReveal key={index} direction="up" delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="card p-6 h-full"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[benefit.color].split(' ')[0]} ${colorClasses[benefit.color].split(' ')[1]} flex items-center justify-center mb-4`}>
                    <Icon className="text-2xl text-white" />
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-3 ${colorClasses[benefit.color].split(' ')[2]}`}>
                    {benefit.title}
                  </h3>
                  
                  <p className="text-neutral-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* CTA Section */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="mt-16 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <a href="#calculadora" className="btn-primary text-lg px-8 py-4">
                <FaLeaf />
                Comienza a Compensar Ahora
              </a>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Compensation;