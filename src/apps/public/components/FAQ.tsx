import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import ScrollReveal from '../../../shared/components/ScrollReveal';
import './FAQ.css';

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState(1);

  const faqs = [
    {
      id: 1,
      question: "¿Cómo puedo calcular mi huella de carbono?",
      answer: "Nuestra calculadora te permite ingresar datos sobre tu tipo de transporte, distancia recorrida y número de pasajeros para obtener un cálculo preciso de tu huella de carbono en kg de CO₂. El proceso es simple: selecciona tu medio de transporte (avión, auto, bus o tren), ingresa los detalles de tu viaje, y obtendrás resultados instantáneos con visualizaciones claras."
    },
    {
      id: 2,
      question: "¿Qué es la compensación de carbono?",
      answer: "La compensación de carbono es un mecanismo que permite equilibrar las emisiones de gases de efecto invernadero mediante la inversión en proyectos que reducen o eliminan esas emisiones. A través de iniciativas como la reforestación, energías renovables y conservación de bosques, puedes contribuir a un planeta más sostenible. Cada peso que inviertes es rastreado y verificado."
    },
    {
      id: 3,
      question: "¿Por qué es importante compensar?",
      answer: "Compensar tu huella de carbono es esencial para mitigar el cambio climático. Al reducir tu impacto y apoyar proyectos ecológicos, ayudas a preservar la biodiversidad y a mejorar la calidad del aire y agua, beneficiando a las futuras generaciones. Además, las empresas que compensan sus emisiones atraen más clientes conscientes del medio ambiente."
    },
    {
      id: 4,
      question: "¿Qué tipos de proyectos apoyan?",
      answer: "Apoyamos proyectos certificados internacionalmente en Chile y América Latina: reforestación nativa, energías renovables (solar y eólica), conservación de bosques, protección de la biodiversidad y proyectos de economía circular. Cada proyecto está verificado por organismos como Gold Standard y VCS (Verified Carbon Standard), asegurando transparencia total."
    },
    {
      id: 5,
      question: "¿Es segura la información que proporciono?",
      answer: "Sí, tu información es completamente confidencial y se utiliza únicamente para calcular tu huella de carbono. Implementamos encriptación de extremo a extremo, cumplimos con GDPR y la Ley de Protección de Datos Personales de Chile. Nunca compartimos tu información con terceros sin tu consentimiento explícito."
    },
    {
      id: 6,
      question: "¿Cuánto cuesta compensar mi viaje?",
      answer: "El costo varía según las emisiones generadas. En promedio, compensar 1 tonelada de CO₂ cuesta aproximadamente $25 USD. Un vuelo Santiago-Buenos Aires (ida y vuelta) genera cerca de 0.5 toneladas de CO₂, lo que costaría alrededor de $12.5 USD compensar. Puedes calcular tu costo exacto con nuestra calculadora."
    },
    {
      id: 7,
      question: "¿Recibo un certificado de compensación?",
      answer: "¡Absolutamente! Al compensar tus emisiones, recibes un certificado digital verificado con un código QR único que puedes compartir en redes sociales o incluir en tus reportes de sostenibilidad. Las empresas reciben certificados corporativos con detalles completos del impacto generado."
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <section className="section bg-gradient-to-br from-neutral-50 via-secondary-50/20 to-neutral-50">
      <div className="container-custom">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 badge-secondary mb-6"
            >
              <HiSparkles className="text-secondary-600" />
              <span>FAQ</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
              Preguntas{' '}
              <span className="text-gradient-secondary">Frecuentes</span>
            </h2>
            
            <p className="text-xl text-neutral-600">
              Respuestas a tus dudas más comunes sobre compensación de carbono
            </p>
          </div>
        </ScrollReveal>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <ScrollReveal key={faq.id} direction="up" delay={index * 0.05}>
              <motion.div
                initial={false}
                className={`card overflow-hidden transition-all duration-300 ${
                  openFAQ === faq.id ? 'shadow-xl' : 'shadow-md'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-6 flex items-center justify-between text-left group hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      openFAQ === faq.id
                        ? 'bg-gradient-to-br from-secondary-500 to-secondary-600'
                        : 'bg-neutral-100 group-hover:bg-secondary-50'
                    }`}>
                      <FaQuestionCircle className={`text-xl transition-colors ${
                        openFAQ === faq.id ? 'text-white' : 'text-neutral-600 group-hover:text-secondary-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <h3 className={`text-lg font-semibold transition-colors ${
                        openFAQ === faq.id ? 'text-secondary-600' : 'text-neutral-900'
                      }`}>
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-4"
                  >
                    <FaChevronDown className={`text-xl transition-colors ${
                      openFAQ === faq.id ? 'text-secondary-600' : 'text-neutral-400'
                    }`} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openFAQ === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-20">
                        <div className="pt-4 border-t border-neutral-200">
                          <p className="text-neutral-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA Section */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="mt-16 text-center card-glass p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              ¿Aún tienes preguntas?
            </h3>
            <p className="text-neutral-600 mb-6">
              Nuestro equipo está disponible para ayudarte en todo lo que necesites
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a href="#contacto" className="btn-secondary">
                Contáctanos
              </a>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FAQ;