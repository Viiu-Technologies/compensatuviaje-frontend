// ==========================================================================
// Header.tsx — Liquid Glass Unified Surface Header (Framer Motion)
// El header actúa como un solo objeto/superficie de cristal líquido continuo
// que se expande físicamente con física de resorte y refracción óptica.
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
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
  footerNote: string;
  items: DropdownItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'soluciones',
    label: 'Soluciones',
    footerNote: 'Proyectos certificados internacionalmente bajo Verra VCS y Gold Standard.',
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
        description: 'Integración para aerolíneas, corporativos y viajes de negocios Scope 3',
        icon: HiOfficeBuilding,
      },
    ],
  },
  {
    id: 'transparencia',
    label: 'Transparencia',
    footerNote: 'Trazabilidad pública en Polygon Mainnet y transacciones protegidas con cifrado bancario.',
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
        description: 'Webpay Plus, Visa y Mastercard con cifrado SSL bancario 256-bit',
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
    footerNote: 'Conocimiento científico y herramientas prácticas para la acción climática real.',
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

// Física de resorte orgánica para el material de cristal líquido.
// Se aplica ÚNICAMENTE al panel expandible (altura del mega-menú): la barra
// superior nunca debe animarse con spring para evitar overshoot visible
// (el "jalón" del label del header) — esa usa LIQUID_EASE, sin rebote.
const LIQUID_SPRING: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 32,
  mass: 0.8,
};

// Transición sin overshoot para el marco del header (border-radius, sombra).
// Framer Motion aplicaba el mismo spring al contenedor padre y al panel hijo
// a la vez; dos springs en la misma superficie combinaban su rebote y
// deformaban visualmente la barra superior durante la expansión/contracción.
const LIQUID_FRAME_EASE: Transition = {
  duration: 0.34,
  ease: [0.22, 1, 0.36, 1],
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>('soluciones');

  const headerRef = useRef<HTMLElement>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpanded = activeGroup !== null;
  const currentGroupData = NAV_GROUPS.find((g) => g.id === activeGroup);

  const dashboardPath =
    user?.userType === 'superadmin' ? '/admin'
      : user?.userType === 'b2c' ? '/b2c/dashboard'
        : user?.userType === 'partner' ? '/partner'
          : user?.userType === 'b2b' ? '/b2b/dashboard'
            : '/dashboard';

  /* ── Scroll effect ── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Cerrar el panel ante cualquier intento de scroll ──
     El panel expandido cubre una franja alta del viewport (position: fixed),
     por lo que un wheel/touch del usuario sobre esa franja queda "atrapado"
     por el header en vez de desplazar la página. Se cierra en el primer
     gesto de scroll para liberar la franja de inmediato, sin esperar un
     umbral de scrollY. */
  useEffect(() => {
    if (activeGroup === null) return;

    const closeOnScrollAttempt = () => setActiveGroup(null);

    window.addEventListener('wheel', closeOnScrollAttempt, { passive: true });
    window.addEventListener('touchmove', closeOnScrollAttempt, { passive: true });
    return () => {
      window.removeEventListener('wheel', closeOnScrollAttempt);
      window.removeEventListener('touchmove', closeOnScrollAttempt);
    };
  }, [activeGroup]);

  /* ── Click outside & Escape key listeners para cierre fluido ── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveGroup(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveGroup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /* ── Lock body scroll when mobile menu is open ── */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setActiveGroup(null);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  /* ── Manejo de Apertura / Cambio / Cierre de categorías ── */
  const toggleGroup = (groupId: string) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (activeGroup === groupId) {
      setActiveGroup(null);
    } else {
      setActiveGroup(groupId);
      // Prefetch routes de la categoría
      const group = NAV_GROUPS.find((g) => g.id === groupId);
      group?.items.forEach((item) => {
        if (item.prefetchKey) prefetchRoute(item.prefetchKey);
      });
    }
  };

  const handleMouseEnterGroup = (groupId: string) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    // Si ya está expandido o el usuario pasa el cursor, activa suavemente
    setActiveGroup(groupId);
    const group = NAV_GROUPS.find((g) => g.id === groupId);
    group?.items.forEach((item) => {
      if (item.prefetchKey) prefetchRoute(item.prefetchKey);
    });
  };

  const handleMouseLeaveHeader = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveGroup(null);
    }, 280);
  };

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
      {/* ── Contenedor Único Liquid Glass ──
          Animamos físicamente la altura, border-radius y refracción especular
          como un solo bloque material de cristal líquido fluido. */}
      <motion.header
        ref={headerRef}
        className={`ctv-liquid-surface${scrolled ? ' ctv-liquid-surface--scrolled' : ''}${isExpanded ? ' ctv-liquid-surface--expanded' : ''}`}
        animate={{
          borderRadius: isExpanded ? '28px' : '9999px',
          boxShadow: isExpanded
            ? '0 28px 70px -12px rgba(0, 0, 0, 0.75), 0 0 35px rgba(62, 211, 43, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.28)'
            : scrolled
              ? '0 20px 48px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(62, 211, 43, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.16)'
              : '0 16px 40px -8px rgba(0, 0, 0, 0.55), 0 0 20px -2px rgba(62, 211, 43, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
        }}
        transition={LIQUID_FRAME_EASE}
        onMouseLeave={handleMouseLeaveHeader}
      >
        {/* Capa de refracción óptica y cáustica líquida */}
        <div className="ctv-liquid-refraction" aria-hidden="true" />

        {/* ── Barra Superior (Siempre visible y anclada al cuerpo del cristal) ── */}
        <div className="ctv-liquid-bar">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="ctv-liquid-logo" aria-label="Compensatuviaje - Inicio">
            <img
              src="/images/brand/logo-horizontal-white.svg"
              alt="Compensatuviaje"
              className="ctv-liquid-logo__img"
              width="168"
              height="36"
            />
          </Link>

          {/* Navegación Desktop: Disparadores Integrados */}
          <nav className="ctv-liquid-nav" aria-label="Navegación principal">
            {NAV_GROUPS.map((group) => {
              const isCurrentActive = activeGroup === group.id;
              const hasActiveChild = group.items.some(
                (item) => !item.href.startsWith('/#') && location.pathname === item.href
              );

              return (
                <div key={group.id} className="ctv-liquid-trigger-wrap">
                  <button
                    type="button"
                    className={`ctv-liquid-nav__trigger${isCurrentActive ? ' ctv-liquid-nav__trigger--expanded' : ''}${hasActiveChild ? ' ctv-liquid-nav__trigger--active' : ''}`}
                    onClick={() => toggleGroup(group.id)}
                    onMouseEnter={() => handleMouseEnterGroup(group.id)}
                    aria-expanded={isCurrentActive}
                    aria-controls={`liquid-panel-${group.id}`}
                  >
                    <span>{group.label}</span>
                    <motion.span
                      animate={{ rotate: isCurrentActive ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="ctv-liquid-nav__chevron-wrap"
                    >
                      <HiChevronDown className="ctv-liquid-nav__chevron" />
                    </motion.span>
                  </button>

                  {/* Indicador de píldora activa dentro de la barra líquida */}
                  {isCurrentActive && (
                    <motion.div
                      layoutId="liquid-active-pill"
                      className="ctv-liquid-active-pill"
                      transition={LIQUID_SPRING}
                    />
                  )}
                </div>
              );
            })}

            {/* Direct Quick Link: Calculadora */}
            <Link 
              to="/calculadora" 
              className="ctv-liquid-nav__direct"
              onClick={() => setActiveGroup(null)}
              onMouseEnter={() => prefetchRoute('calculator')}
            >
              <HiSparkles className="ctv-liquid-nav__sparkle" />
              <span>Calculadora</span>
              <span className="ctv-badge ctv-badge--pulse">Rápida</span>
            </Link>
          </nav>

          {/* Botones de Acción (Paleta Oficial de Marca) */}
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
                  onClick={() => setActiveGroup(null)}
                >
                  Entrar
                </Link>
                <Link 
                  to="/calculadora" 
                  className="ctv-btn-liquid ctv-btn-liquid--glow"
                  onMouseEnter={() => prefetchRoute('calculator')}
                  onClick={() => setActiveGroup(null)}
                >
                  <span>Compensar Vuelo</span>
                  <HiArrowRight className="ctv-btn-liquid__arrow" />
                </Link>
              </>
            )}
          </div>

          {/* Botón Móvil */}
          <button
            className="ctv-liquid-hamburger"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        {/* ── Extensión Líquida del Contenedor (Mega-Menú Integrado) ──
            Forma parte de la MISMA superficie de cristal y se despliega con física de resorte */}
        <AnimatePresence mode="wait">
          {isExpanded && currentGroupData && (
            <motion.div
              key={currentGroupData.id}
              id={`liquid-panel-${currentGroupData.id}`}
              role="region"
              aria-label={currentGroupData.label}
              className="ctv-liquid-body"
              initial={{ opacity: 0, height: 0, y: -6, filter: 'blur(6px)' }}
              animate={{ opacity: 1, height: 'auto', y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, height: 0, y: -4, filter: 'blur(4px)' }}
              transition={{
                height: LIQUID_SPRING,
                opacity: { duration: 0.22, ease: 'easeOut' },
                filter: { duration: 0.22 },
              }}
            >
              {/* Divisoria refractiva líquida */}
              <div className="ctv-liquid-divider" aria-hidden="true" />

              {/* Contenido panorámico en cuadrícula de 3 columnas */}
              <div className="ctv-liquid-grid">
                {currentGroupData.items.map((item, idx) => {
                  const Icon = item.icon;
                  const isInternalAnchor = item.href.startsWith('/#');

                  const cardInner = (
                    <motion.div
                      className="ctv-liquid-card"
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.04 * idx,
                        duration: 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onMouseEnter={() => item.prefetchKey && prefetchRoute(item.prefetchKey)}
                    >
                      <div className="ctv-liquid-card__icon-wrap">
                        <Icon className="ctv-liquid-card__icon" />
                      </div>

                      <div className="ctv-liquid-card__content">
                        <div className="ctv-liquid-card__header">
                          <span className="ctv-liquid-card__title">{item.label}</span>
                          {item.badge && (
                            <span className={`ctv-badge ctv-badge--${item.badgeType || 'primary'}`}>
                              {item.badge}
                            </span>
                          )}
                          <HiArrowRight className="ctv-liquid-card__arrow" />
                        </div>
                        <p className="ctv-liquid-card__desc">{item.description}</p>
                      </div>
                    </motion.div>
                  );

                  if (isInternalAnchor) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className="ctv-liquid-card__link"
                        onClick={(e) => {
                          if (location.pathname === '/') {
                            e.preventDefault();
                            handleItemClick(item.href);
                          } else {
                            closeMenu();
                          }
                        }}
                      >
                        {cardInner}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="ctv-liquid-card__link"
                      onClick={closeMenu}
                    >
                      {cardInner}
                    </Link>
                  );
                })}
              </div>

              {/* Tira inferior de confianza y verificación */}
              <div className="ctv-liquid-footer">
                <span className="ctv-liquid-footer__indicator" />
                <p className="ctv-liquid-footer__note">{currentGroupData.footerNote}</p>
                <button
                  type="button"
                  className="ctv-liquid-footer__close"
                  onClick={() => setActiveGroup(null)}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Mobile Drawer (Panel lateral táctil para vista responsive) ── */}
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
              const isExpandedMob = mobileExpandedGroup === group.id;

              return (
                <div key={group.id} className="ctv-liquid-drawer__accordion">
                  <button
                    className="ctv-liquid-drawer__accordion-header"
                    onClick={() => setMobileExpandedGroup(isExpandedMob ? null : group.id)}
                  >
                    <span>{group.label}</span>
                    <HiChevronDown 
                      className={`ctv-liquid-drawer__accordion-chevron${isExpandedMob ? ' ctv-liquid-drawer__accordion-chevron--rotated' : ''}`} 
                    />
                  </button>

                  {isExpandedMob && (
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

            {/* Acceso Directo Móvil */}
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