import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { FaUser, FaChartBar } from 'react-icons/fa';
import { HiMenu, HiX, HiArrowRight } from 'react-icons/hi';
import './Header.css';

interface NavLinkItem {
  href: string;
  label: string;
  badge?: string;
  isExternal?: boolean;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const dashboardPath =
    user?.userType === 'superadmin' ? '/admin'
      : user?.userType === 'b2c' ? '/b2c/dashboard'
        : user?.userType === 'partner' ? '/partner'
          : user?.userType === 'b2b' ? '/b2b/dashboard'
            : '/dashboard';

  /* ── Scroll effect ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Active nav link via IntersectionObserver (on landing) ── */
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveHash(location.pathname);
      return;
    }

    const ids = ['inicio', 'proyectos', 'empresas', 'calculadora-content'];
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveHash(`#${id}`); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [location.pathname]);

  /* ── Lock body scroll when mobile menu is open ── */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => { logout(); navigate('/'); closeMenu(); };

  const navLinks: NavLinkItem[] = [
    { href: '#inicio', label: 'Inicio' },
    { href: '/calculadora', label: 'Calculadora', badge: 'Nueva' },
    { href: '#proyectos', label: 'Proyectos' },
    { href: '#empresas', label: 'Empresas' },
    { href: '#calculadora-content', label: 'Metodología' },
    { href: '/pagos', label: 'Pagos' },
    { href: '/aliados', label: 'Aliados' },
    { href: '/blog', label: 'Blog' },
    { href: '/contacto', label: 'Contacto' },
  ];

  const renderDesktopNavLink = (link: NavLinkItem) => {
    const isAnchor = link.href.startsWith('#');
    const isActive = isAnchor
      ? location.pathname === '/' && activeHash === link.href
      : location.pathname === link.href;

    if (isAnchor) {
      const destination = location.pathname === '/' ? link.href : `/${link.href}`;
      return (
        <a
          key={link.href}
          href={destination}
          className={`ctv-nav-link${isActive ? ' ctv-nav-link--active' : ''}`}
        >
          {link.label}
          {link.badge && <span className="ctv-nav-badge">{link.badge}</span>}
        </a>
      );
    }

    return (
      <Link
        key={link.href}
        to={link.href}
        className={`ctv-nav-link${isActive ? ' ctv-nav-link--active' : ''}`}
      >
        {link.label}
        {link.badge && <span className="ctv-nav-badge">{link.badge}</span>}
      </Link>
    );
  };

  const renderMobileNavLink = (link: NavLinkItem) => {
    const isAnchor = link.href.startsWith('#');
    const isActive = isAnchor
      ? location.pathname === '/' && activeHash === link.href
      : location.pathname === link.href;

    if (isAnchor) {
      const destination = location.pathname === '/' ? link.href : `/${link.href}`;
      return (
        <a
          key={link.href}
          href={destination}
          onClick={closeMenu}
          className={`ctv-drawer__link${isActive ? ' ctv-drawer__link--active' : ''}`}
        >
          <span>{link.label}</span>
          {link.badge && <span className="ctv-nav-badge">{link.badge}</span>}
          <HiArrowRight className="ctv-drawer__link-arrow" />
        </a>
      );
    }

    return (
      <Link
        key={link.href}
        to={link.href}
        onClick={closeMenu}
        className={`ctv-drawer__link${isActive ? ' ctv-drawer__link--active' : ''}`}
      >
        <span>{link.label}</span>
        {link.badge && <span className="ctv-nav-badge">{link.badge}</span>}
        <HiArrowRight className="ctv-drawer__link-arrow" />
      </Link>
    );
  };

  return (
    <>
      <header className={`ctv-header${scrolled ? ' ctv-header--scrolled' : ''}`}>
        <div className="ctv-header__inner">

          {/* ── Logo ── */}
          <Link to="/" onClick={closeMenu} className="ctv-header__logo">
            <img
              src="/images/brand/logo-horizontal.svg"
              alt="compensatuviaje"
              className="ctv-header__logo-img"
              width="170"
              height="38"
            />
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="ctv-header__nav" aria-label="Navegación principal">
            {navLinks.map((link) => renderDesktopNavLink(link))}
          </nav>

          {/* ── Desktop auth ── */}
          <div className="ctv-header__actions">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="ctv-btn ctv-btn--ghost">
                  <FaChartBar />
                  <span>Dashboard</span>
                </Link>

                <div className="ctv-user-chip">
                  <div className="ctv-user-chip__avatar">
                    <FaUser />
                  </div>
                  <span className="ctv-user-chip__name">
                    {user?.firstName || user?.name}
                  </span>
                </div>

                <button onClick={handleLogout} className="ctv-btn ctv-btn--ghost">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="ctv-btn ctv-btn--outline">
                  Entrar
                </Link>
                <Link to="/register" className="ctv-btn ctv-btn--primary">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="ctv-hamburger"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer — sibling del header para evitar stacking-context bugs ── */}
      <div
        className={`ctv-drawer${isMenuOpen ? ' ctv-drawer--open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        {/* Overlay */}
        <div className="ctv-drawer__overlay" onClick={closeMenu} />

        {/* Panel */}
        <div className="ctv-drawer__panel">
          <nav className="ctv-drawer__nav">
            {navLinks.map((link) => renderMobileNavLink(link))}

            {isAuthenticated && (
              <Link
                to={dashboardPath}
                onClick={closeMenu}
                className="ctv-drawer__link"
              >
                <FaChartBar />
                <span>Dashboard</span>
                <HiArrowRight className="ctv-drawer__link-arrow" />
              </Link>
            )}
          </nav>

          <div className="ctv-drawer__footer">
            {isAuthenticated ? (
              <>
                <div className="ctv-drawer__user">
                  <div className="ctv-user-chip__avatar ctv-user-chip__avatar--lg">
                    <FaUser />
                  </div>
                  <div>
                    <p className="ctv-drawer__user-name">
                      {user?.firstName || user?.name}
                    </p>
                    <p className="ctv-drawer__user-role">
                      {user?.roles?.[0] || 'Usuario'}
                    </p>
                  </div>
                </div>
                <button onClick={handleLogout} className="ctv-btn ctv-btn--outline ctv-btn--full">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="ctv-btn ctv-btn--outline ctv-btn--full">
                  Iniciar Sesión
                </Link>
                <Link to="/register" onClick={closeMenu} className="ctv-btn ctv-btn--primary ctv-btn--full">
                  Registrarse Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;