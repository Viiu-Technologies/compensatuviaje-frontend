// ==========================================================================
// Header.tsx — Liquid Glass Navigation con Wren-Style Grouping
// ==========================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { 
  FaUser, 
  FaChartBar, 
  FaTree, 
  FaCube, 
  FaShieldAlt, 
  FaNewspaper, 
  FaHandshake 
} from 'react-icons/fa';
import { 
  HiMenu, 
  HiX, 
  HiArrowRight, 
  HiChevronDown, 
  HiCalculator, 
  HiOfficeBuilding, 
  HiCreditCard, 
  HiSupport,
  HiSparkles
} from 'react-icons/hi';
import { prefetchRoute, PrefetchKey } from '../../../shared/utils/routePrefetch';
import './Header.css';

interface DropdownItem {
  label: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'primary' | 'polygon' | 'secure';
  prefetchKey?: PrefetchKey;
}

interface NavGroup {
  id: string;
  label: string;
  items: DropdownItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'soluciones',
    label: 'Soluciones',
    items: [
      {
        label: 'Calculadora de Vuelos',
        href: '/calculadora',
        description: 'Calcula tu huella de CO₂ y neutralízala con proyectos certificados',
        icon: HiCalculator,
        badge: 'Nueva',
        badgeType: 'primary',
        prefetchKey: 'calculator',
      },
      {
        label: 'Proyectos de Impacto',
        href: '/#proyectos',
        description: 'Conservación forestal en Patagonia, Amazonía y energías limpias',
        icon: FaTree,
      },
      {
        label: 'Empresas & API B2B',
        href: '/#empresas',
        description: 'Integración para aerolíneas, corporativos y viajes de negocios',
        icon: HiOfficeBuilding,
      },
    ],
  },
  {
    id: 'transparencia',
    label: 'Transparencia',
    items: [
      {
        label: 'Verificación Blockchain',
        href: '/#verificar',
        description: 'Trazabilidad criptográfica en Polygon con certificados NFT únicos',
        icon: FaCube,
        badge: 'Polygon',
        badgeType: 'polygon',
      },
      {
        label: 'Metodología & Estándares',
        href: '/calculadora#metodologia',
        description: 'Factores validados con ICAO, DEFRA del Reino Unido y GHG Protocol',
        icon: FaShieldAlt,
        prefetchKey: 'calculator',
      },
      {
        label: 'Métodos de Pago & Seguridad',
        href: '/pagos',
        description: 'Webpay Plus, Visa y Mastercard con cifrado SSL bancario',
        icon: HiCreditCard,
        badge: 'Seguro',
        badgeType: 'secure',
        prefetchKey: 'payments',
      },
    ],
  },
  {
    id: 'recursos',
    label: 'Recursos',
    items: [
      {
        label: 'Blog de Impacto',
        href: '/blog',
        description: 'Noticias climáticas, ecología y guías para viajeros conscientes',
        icon: FaNewspaper,
        prefetchKey: 'blog',
      },
      {
        label: 'Aliados & Partners',
        href: '/aliados',
        description: 'Red global de aerolíneas, agencias y hoteles comprometidos',
        icon: FaHandshake,
        prefetchKey: 'partners',
      },
      {
        label: 'Atención y Soporte',
        href: '/contacto',
        description: 'Canal oficial para resolver dudas sobre tus compensaciones',
        icon: HiSupport,
        prefetchKey: 'contact',
      },
    ],
  },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>('soluciones');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Lock body scroll when mobile menu is open ── */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  /* ── Dropdown hover handlers with slight debounce for smooth feeling ── */
  const handleMouseEnterGroup = (groupId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(groupId);

    // Prefetch all pages in this group
    const group = NAV_GROUPS.find(g => g.id === groupId);
    group?.items.forEach(item => {
      if (item.prefetchKey) prefetchRoute(item.prefetchKey);
    });
  };

  const handleMouseLeaveGroup = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  /* ── Navigation click handler (handles internal anchor vs route) ── */
  const handleItemClick = (href: string) => {
    closeMenu();
    if (href.startsWith('/#')) {
      const anchorId = href.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(href);
      }
    }
  };

  return (
    <>
      <header className={`ctv-liquid-header${scrolled ? ' ctv-liquid-header--scrolled' : ''}`}>
        <div className="ctv-liquid-header__inner">

          {/* ── Brand Logo ── */}
          <Link to="/" onClick={closeMenu} className="ctv-liquid-logo" aria-label="Compensatuviaje - Inicio">
            <img
              src="/images/brand/logo-horizontal-white.svg"
              alt="Compensatuviaje"
              className="ctv-liquid-logo__img"
              width="168"
              height="36"
            />
          </Link>

          {/* ── Desktop Navigation: Wren-style Dropdowns ── */}
          <nav className="ctv-liquid-nav" aria-label="Navegación principal">
            {NAV_GROUPS.map((group) => {
              const isOpen = activeDropdown === group.id;
              const hasActiveChild = group.items.some(
                item => !item.href.startsWith('/#') && location.pathname === item.href
              );

              return (
                <div
                  key={group.id}
                  className={`ctv-liquid-nav__group${isOpen ? ' ctv-liquid-nav__group--open' : ''}`}
                  onMouseEnter={() => handleMouseEnterGroup(group.id)}
                  onMouseLeave={handleMouseLeaveGroup}
                  onFocus={() => handleMouseEnterGroup(group.id)}
                  onBlur={handleMouseLeaveGroup}
                >
                  <button
                    className={`ctv-liquid-nav__trigger${hasActiveChild ? ' ctv-liquid-nav__trigger--active' : ''}`}
                    aria-expanded={isOpen}
                    onClick={() => setActiveDropdown(isOpen ? null : group.id)}
                  >
                    <span>{group.label}</span>
                    <HiChevronDown className="ctv-liquid-nav__chevron" />
                  </button>

                  {/* Liquid Glass Dropdown Panel */}
                  <div 
                    className={`ctv-liquid-dropdown${isOpen ? ' ctv-liquid-dropdown--visible' : ''}`}
                    onMouseEnter={() => handleMouseEnterGroup(group.id)}
                    onMouseLeave={handleMouseLeaveGroup}
                  >
                    <div className="ctv-liquid-dropdown__grid">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isInternalAnchor = item.href.startsWith('/#');

                        const content = (
                          <div 
                            className="ctv-liquid-dropdown__card"
                            onMouseEnter={() => item.prefetchKey && prefetchRoute(item.prefetchKey)}
                          >
                            <div className="ctv-liquid-dropdown__icon-wrap">
                              <Icon className="ctv-liquid-dropdown__icon" />
                            </div>
                            <div className="ctv-liquid-dropdown__info">
                              <div className="ctv-liquid-dropdown__row">
                                <span className="ctv-liquid-dropdown__title">{item.label}</span>
                                {item.badge && (
                                  <span className={`ctv-badge ctv-badge--${item.badgeType || 'primary'}`}>
                                    {item.badge}
                                  </span>
                                )}
                                <HiArrowRight className="ctv-liquid-dropdown__arrow" />
                              </div>
                              <p className="ctv-liquid-dropdown__desc">{item.description}</p>
                            </div>
                          </div>
                        );

                        if (isInternalAnchor) {
                          return (
                            <a
                              key={item.href}
                              href={item.href}
                              className="ctv-liquid-dropdown__link"
                              onClick={(e) => {
                                if (location.pathname === '/') {
                                  e.preventDefault();
                                  handleItemClick(item.href);
                                } else {
                                  closeMenu();
                                }
                              }}
                            >
                              {content}
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className="ctv-liquid-dropdown__link"
                            onClick={closeMenu}
                          >
                            {content}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Direct Quick Link: Calculadora with subtle pulse badge */}
            <Link 
              to="/calculadora" 
              className="ctv-liquid-nav__direct"
              onMouseEnter={() => prefetchRoute('calculator')}
            >
              <HiSparkles className="ctv-liquid-nav__sparkle" />
              <span>Calculadora</span>
              <span className="ctv-badge ctv-badge--pulse">Rápida</span>
            </Link>
          </nav>

          {/* ── Desktop Actions (Liquid Pills) ── */}
          <div className="ctv-liquid-actions">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="ctv-btn-liquid ctv-btn-liquid--ghost">
                  <FaChartBar />
                  <span>Dashboard</span>
                </Link>

                <div className="ctv-liquid-user">
                  <div className="ctv-liquid-user__avatar">
                    <FaUser />
                  </div>
                  <span className="ctv-liquid-user__name">
                    {user?.firstName || user?.name}
                  </span>
                </div>

                <button onClick={handleLogout} className="ctv-btn-liquid ctv-btn-liquid--ghost">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="ctv-btn-liquid ctv-btn-liquid--ghost"
                  onMouseEnter={() => prefetchRoute('login')}
                >
                  Entrar
                </Link>
                <Link 
                  to="/calculadora" 
                  className="ctv-btn-liquid ctv-btn-liquid--glow"
                  onMouseEnter={() => prefetchRoute('calculator')}
                >
                  <span>Compensar Vuelo</span>
                  <HiArrowRight className="ctv-btn-liquid__arrow" />
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="ctv-liquid-hamburger"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer (Liquid Dark Glass Panel) ── */}
      <div
        className={`ctv-liquid-drawer${isMenuOpen ? ' ctv-liquid-drawer--open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="ctv-liquid-drawer__overlay" onClick={closeMenu} />

        <div className="ctv-liquid-drawer__panel">
          <div className="ctv-liquid-drawer__top">
            <Link to="/" onClick={closeMenu} className="ctv-liquid-drawer__logo">
              <img
                src="/images/brand/logo-horizontal-white.svg"
                alt="Compensatuviaje"
                width="150"
                height="32"
              />
            </Link>
            <button 
              className="ctv-liquid-drawer__close" 
              onClick={closeMenu} 
              aria-label="Cerrar menú"
            >
              <HiX />
            </button>
          </div>

          <nav className="ctv-liquid-drawer__nav">
            {NAV_GROUPS.map((group) => {
              const isExpanded = mobileExpandedGroup === group.id;

              return (
                <div key={group.id} className="ctv-liquid-drawer__accordion">
                  <button
                    className="ctv-liquid-drawer__accordion-header"
                    onClick={() => setMobileExpandedGroup(isExpanded ? null : group.id)}
                  >
                    <span>{group.label}</span>
                    <HiChevronDown 
                      className={`ctv-liquid-drawer__accordion-chevron${isExpanded ? ' ctv-liquid-drawer__accordion-chevron--rotated' : ''}`} 
                    />
                  </button>

                  {isExpanded && (
                    <div className="ctv-liquid-drawer__accordion-body">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isInternalAnchor = item.href.startsWith('/#');

                        const inner = (
                          <>
                            <div className="ctv-liquid-drawer__item-icon">
                              <Icon />
                            </div>
                            <div className="ctv-liquid-drawer__item-text">
                              <div className="ctv-liquid-drawer__item-head">
                                <strong>{item.label}</strong>
                                {item.badge && (
                                  <span className={`ctv-badge ctv-badge--${item.badgeType || 'primary'}`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <small>{item.description}</small>
                            </div>
                          </>
                        );

                        if (isInternalAnchor) {
                          return (
                            <a
                              key={item.href}
                              href={item.href}
                              className="ctv-liquid-drawer__item"
                              onClick={(e) => {
                                if (location.pathname === '/') {
                                  e.preventDefault();
                                  handleItemClick(item.href);
                                } else {
                                  closeMenu();
                                }
                              }}
                            >
                              {inner}
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className="ctv-liquid-drawer__item"
                            onClick={closeMenu}
                          >
                            {inner}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Link in Mobile */}
            <Link
              to="/calculadora"
              onClick={closeMenu}
              className="ctv-liquid-drawer__direct-cta"
            >
              <HiSparkles />
              <span>Calculadora de Vuelos Rápida</span>
              <HiArrowRight />
            </Link>
          </nav>

          <div className="ctv-liquid-drawer__footer">
            {isAuthenticated ? (
              <>
                <div className="ctv-liquid-drawer__user">
                  <div className="ctv-liquid-user__avatar ctv-liquid-user__avatar--lg">
                    <FaUser />
                  </div>
                  <div>
                    <p className="ctv-liquid-drawer__user-name">
                      {user?.firstName || user?.name}
                    </p>
                    <p className="ctv-liquid-drawer__user-role">
                      {user?.roles?.[0] || 'Usuario'}
                    </p>
                  </div>
                </div>
                <Link
                  to={dashboardPath}
                  onClick={closeMenu}
                  className="ctv-btn-liquid ctv-btn-liquid--glow ctv-btn-liquid--full"
                >
                  <FaChartBar />
                  <span>Mi Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="ctv-btn-liquid ctv-btn-liquid--ghost ctv-btn-liquid--full"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/calculadora"
                  onClick={closeMenu}
                  className="ctv-btn-liquid ctv-btn-liquid--glow ctv-btn-liquid--full"
                >
                  <span>Compensar Vuelo Ahora</span>
                  <HiArrowRight />
                </Link>
                <div className="ctv-liquid-drawer__auth-row">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="ctv-btn-liquid ctv-btn-liquid--outline ctv-btn-liquid--half"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="ctv-btn-liquid ctv-btn-liquid--primary ctv-btn-liquid--half"
                  >
                    Registrarse
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;