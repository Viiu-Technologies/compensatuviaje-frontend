import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { FaUser, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';
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
    handleScroll();
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
    { href: '#contacto', label: 'Contacto' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        backdrop-blur-2xl bg-black/30 header-slide-in
      `}
    >
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img
              src="/images/brand/logo-horizontal-white.svg"
              alt="CompensaTuViaje"
              className="h-12 w-auto drop-shadow-lg hover:!scale-[1.03] !transition-transform !duration-200"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`px-4 py-2 rounded-lg transition-all font-semibold text-base tracking-wide hover:!-translate-y-0.5 active:!scale-[0.98] ${
                  scrolled 
                    ? 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-100' 
                    : 'text-white hover:text-white hover:bg-white/10'
                }`}
                style={!scrolled ? { textShadow: '0 2px 12px rgba(0,0,0,0.4)' } : {}}
              >
                {link.label}
              </a>
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
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:!scale-[1.02] active:!scale-[0.98] ${
                    scrolled
                      ? 'text-neutral-700 hover:bg-neutral-100'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`inline-flex items-center justify-center !px-8 !py-3 !rounded-lg text-base font-semibold transition-all hover:!scale-[1.02] active:!scale-[0.98] ${
                    scrolled
                      ? 'text-neutral-700 hover:bg-neutral-100 border-2 border-neutral-300'
                      : 'text-white hover:bg-white/15 border-2 border-white/50'
                  }`}
                  style={!scrolled ? { textShadow: '0 2px 8px rgba(0,0,0,0.3)' } : {}}
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center !px-8 !py-3 !rounded-lg text-base font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-neutral-900 shadow-lg shadow-amber-500/25 transition-all hover:!scale-[1.02] active:!scale-[0.98]"
                >
                  Registrarse Gratis
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-3 rounded-xl hover:bg-neutral-100 transition-colors active:!scale-90"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FaTimes className="text-2xl text-neutral-700" />
            ) : (
              <FaBars className="text-2xl text-neutral-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="py-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block px-4 py-3 rounded-lg text-neutral-700 hover:text-primary-600 hover:bg-primary-50 hover:!translate-x-1 transition-all font-medium"
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated && (
              <Link
                to={dashboardPath}
                onClick={closeMenu}
                className="block px-4 py-3 rounded-lg text-neutral-700 hover:text-primary-600 hover:bg-primary-50 hover:!translate-x-1 transition-all font-medium flex items-center gap-2"
              >
                <FaChartBar />
                Dashboard
              </Link>
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
        </div>
      </div>
    </header>
  );
};

export default Header;