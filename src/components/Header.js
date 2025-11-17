import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaUser, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Detect scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: '#inicio', label: 'Inicio' },
    { href: '#calculadora-content', label: 'Calculadora' },
    { href: '#blog', label: 'Blog' },
    { href: '#transparencia', label: 'Transparencia' },
    { href: '#contacto', label: 'Contacto' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'glass shadow-lg py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              src="/images/brand/logocompensatuviaje.png"
              alt="CompensaTuViaje"
              className="h-12 md:h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium"
              >
                {link.label}
              </motion.a>
            ))}
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium flex items-center gap-2"
                >
                  <FaChartBar />
                  Dashboard
                </Link>
              </motion.div>
            )}
          </nav>

          {/* Auth Buttons Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-neutral-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-neutral-900">
                      {user?.firstName || user?.name}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {user?.roles?.[0] || 'Usuario'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="btn-ghost"
                >
                  Cerrar Sesión
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="btn-ghost">
                    Iniciar Sesión
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="btn-primary">
                    Registrarse Gratis
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMenu}
            className="lg:hidden p-3 rounded-xl hover:bg-neutral-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FaTimes className="text-2xl text-neutral-700" />
            ) : (
              <FaBars className="text-2xl text-neutral-700" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <nav className="py-6 space-y-2">
                {navLinks.map((link) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    whileHover={{ x: 5 }}
                    className="block px-4 py-3 rounded-lg text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium"
                  >
                    {link.label}
                  </motion.a>
                ))}
                {isAuthenticated && (
                  <motion.div whileHover={{ x: 5 }}>
                    <Link
                      to="/dashboard"
                      onClick={closeMenu}
                      className="block px-4 py-3 rounded-lg text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium flex items-center gap-2"
                    >
                      <FaChartBar />
                      Dashboard
                    </Link>
                  </motion.div>
                )}

                <div className="pt-4 border-t border-neutral-200 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 rounded-lg bg-neutral-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <FaUser className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">
                              {user?.firstName || user?.name}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {user?.roles?.[0] || 'Usuario'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full btn-ghost justify-start"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={closeMenu}
                        className="block w-full btn-ghost justify-start"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/register"
                        onClick={closeMenu}
                        className="block w-full btn-primary justify-start"
                      >
                        Registrarse Gratis
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;