import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaUser, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Dashboard path based on user type
  const dashboardPath = user?.userType === 'superadmin' ? '/admin'
    : user?.userType === 'b2c' ? '/b2c/dashboard'
    : user?.userType === 'partner' ? '/partner'
    : user?.userType === 'b2b' ? '/b2b/dashboard'
    : '/dashboard';

  // Detect scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run on mount
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        backdrop-blur-2xl bg-black/30
      `}
    >
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <motion.img
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              src="/images/brand/logo-horizontal-white.svg"
              alt="CompensaTuViaje"
              className="h-12 w-auto drop-shadow-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 gap-6">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg transition-all font-semibold text-base tracking-wide ${
                  scrolled 
                    ? 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-100' 
                    : 'text-white hover:text-white hover:bg-white/10'
                }`}
                style={!scrolled ? { textShadow: '0 2px 12px rgba(0,0,0,0.4)' } : {}}
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          {/* Auth Buttons Desktop */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    scrolled
                      ? 'text-neutral-700 hover:bg-neutral-100'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <FaChartBar className="text-lg" />
                  <span className="text-sm">Dashboard</span>
                </Link>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  scrolled ? 'bg-neutral-100' : 'bg-white/10 backdrop-blur-md'
                }`}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <FaUser className="text-white text-xs" />
                  </div>
                  <span className={`text-sm font-semibold ${
                    scrolled ? 'text-neutral-900' : 'text-white'
                  }`}>
                    {user?.firstName || user?.name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    scrolled
                      ? 'text-neutral-700 hover:bg-neutral-100'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Salir
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    to="/login" 
                    className={`inline-flex items-center justify-center !px-8 !py-3 !rounded-lg text-base font-semibold transition-all ${
                      scrolled
                        ? 'text-neutral-700 hover:bg-neutral-100 border-2 border-neutral-300'
                        : 'text-white hover:bg-white/15 border-2 border-white/50'
                    }`}
                    style={!scrolled ? { textShadow: '0 2px 8px rgba(0,0,0,0.3)' } : {}}
                  >
                    Iniciar Sesión
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    to="/register" 
                    className="inline-flex items-center justify-center !px-8 !py-3 !rounded-lg text-base font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-neutral-900 shadow-lg shadow-amber-500/25 transition-all"
                  >
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
                      to={dashboardPath}
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