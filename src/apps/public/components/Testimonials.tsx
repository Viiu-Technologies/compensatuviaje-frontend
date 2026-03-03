import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import ScrollReveal from '../../../shared/components/ScrollReveal';
import AnimatedBackground from '../../../shared/components/AnimatedBackground';
import './Testimonials.css';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const API_URL = import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${API_URL}/testimonials`);
      const data = await response.json();
      
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (error) {
      // Fallback testimonials
      setTestimonials([
        {
          id: 1,
          name: "Laura Sánchez",
          role: "Ecologista y viajera consciente",
          company: "Fundación Verde Chile",
          message: "Compensa tu Viaje me ayudó a entender mi huella de carbono, ¡ahora puedo compensar mi impacto en el mundo! La plataforma es súper intuitiva.",
          rating: 5,
          avatar: "👩‍🔬",
          color: "primary"
        },
        {
          id: 2,
          name: "Carlos Mendoza", 
          role: "Aventurero y defensor del medio ambiente",
          company: "EcoAventura Chile",
          message: "La calculadora es muy intuitiva y me ofreció resultados detallados sobre mis hábitos. ¡Una herramienta imprescindible para cualquier viajero!",
          rating: 5,
          avatar: "👨‍🌾",
          color: "secondary"
        },
        {
          id: 3,
          name: "Ana López",
          role: "Bloguera sobre sostenibilidad y viajes", 
          company: "Viajes Conscientes",
          message: "Gracias a Compensa tu Viaje, he aprendido cómo mis decisiones afectan el planeta. ¡Definitivamente lo recomendaré a mis amigos!",
          rating: 5,
          avatar: "👩‍💼",
          color: "accent"
        },
        {
          id: 4,
          name: "Diego Rojas",
          role: "Director de Sostenibilidad",
          company: "LATAM Airlines",
          message: "Implementamos esta plataforma para nuestros pasajeros frecuentes. Los resultados han sido excelentes y el feedback muy positivo.",
          rating: 5,
          avatar: "👨‍💼",
          color: "success"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating) => {
    return Array(rating).fill(0).map((_, i) => (
      <FaStar key={i} className="text-amber-400" />
    ));
  };

  if (loading) {
    return (
      <section className="section bg-white">
        <div className="container-custom">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <AnimatedBackground variant="gradient">
      <section className="section overflow-hidden py-20 pb-40">
        <div className="container-custom">
          {/* Header */}
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="!inline-flex !items-center gap-2 badge-secondary mb-6"
              >
                <HiSparkles className="text-secondary-600" />
                <span>Testimonios</span>
              </motion.div>
              
<h2 className="!text-4xl md:!text-5xl !font-display !font-bold !text-neutral-900 mb-6">
                Historias de{' '}
                <span className="text-gradient-secondary">Impacto Positivo</span>
              </h2>
              
              <p className="text-xl text-neutral-600">
                Miles de viajeros ya están compensando su huella de carbono
              </p>
            </div>
          </ScrollReveal>

          {/* Featured Testimonial Carousel */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="relative">
              <AnimatePresence mode="wait">
                {currentTestimonial && (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -100, scale: 0.9, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="card-glass !p-8 md:!p-12 !relative !overflow-hidden !backdrop-blur-xl !bg-white/60 !border !border-white/20 !shadow-2xl"
                  >
                    {/* Quote icon with glow */}
                    <div className="absolute top-8 right-8 opacity-10">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FaQuoteLeft className="text-8xl text-primary-500" />
                      </motion.div>
                    </div>

                    {/* Stars with animation */}
                    <motion.div 
                      className="flex gap-1 mb-6"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {renderStars(currentTestimonial.rating)}
                    </motion.div>

                    {/* Message with stagger animation */}
                    <motion.blockquote 
                      className="text-2xl md:text-3xl font-display text-neutral-800 mb-8 leading-relaxed relative z-10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      "{currentTestimonial.message}"
                    </motion.blockquote>

                    {/* Author with entrance animation */}
                    <motion.div 
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div 
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-3xl shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {currentTestimonial.avatar}
                      </motion.div>
                      <div>
                        <div className="font-bold text-xl text-neutral-900">
                          {currentTestimonial.name}
                        </div>
                        <div className="text-neutral-600">
                          {currentTestimonial.role}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {currentTestimonial.company}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevTestimonial}
                  className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <FaChevronLeft />
                </motion.button>

                {/* Indicators */}
                <div className="flex items-center gap-2">
                  {testimonials.map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? 'bg-primary-500 w-8' 
                          : 'bg-neutral-300'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextTestimonial}
                  className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <FaChevronRight />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Grid of All Testimonials */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <ScrollReveal key={testimonial.id} direction="up" delay={index * 0.1}>
                <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="card !p-6 !h-full !flex !flex-col !backdrop-blur-sm !bg-white/80 hover:!bg-white !transition-all !duration-300 hover:!shadow-2xl"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>

                  {/* Message */}
                  <p className="text-neutral-700 mb-6 flex-grow leading-relaxed">
                    "{testimonial.message}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </AnimatedBackground>
  );
};

export default Testimonials;