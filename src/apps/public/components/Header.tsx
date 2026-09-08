// ==========================================================================
// Header.tsx — Liquid Glass Unified Surface Header (Estilo Wren)
// Compacto, limpio, horizontal, sin footer ni exceso de descripciones.
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
  HiSupport
} from 'react-icons/hi';
import { prefetchRoute, PrefetchKey } from '../../../shared/utils/routePrefetch';
import './Header.css';

interface DropdownItem {
  label: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconTheme?: 'green' | 'orange' | 'teal' | 'purple' | 'blue' | 'pink';
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
        description: 'Calcula y neutraliza tu huella de vuelo.',
        icon: HiCalculator,
        iconTheme: 'green',
        prefetchKey: 'calculator',
      },
      {
        label: 'Proyectos de Impacto',
        href: '/#proyectos',
        description: 'Conservación en Patagonia y Amazonía.',
        icon: FaTree,
        iconTheme: 'teal',
      },
      {
        label: 'Empresas & B2B',
        href: '/#empresas',
        description: 'Gestión Scope 3 y API corporativa.',
        icon: HiOfficeBuilding,
        iconTheme: 'orange',
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
        description: 'Certificados NFT trazables en Polygon.',
        icon: FaCube,
        iconTheme: 'purple',
      },
      {
        label: 'Metodología & Estándares',
        href: '/calculadora#metodologia',
        description: 'Factores oficiales ICAO, DEFRA y GHG.',
        icon: FaShieldAlt,
        iconTheme: 'teal',
        prefetchKey: 'calculator',
      },
      {
        label: 'Métodos de Pago',
        href: '/pagos',
        description: 'Webpay Plus, Visa y Mastercard seguros.',
        icon: HiCreditCard,
        iconTheme: 'green',
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
        description: 'Guías de ecología y viajes conscientes.',
        icon: FaNewspaper,
        iconTheme: 'pink',
        prefetchKey: 'blog',
      },
      {
        label: 'Aliados & Partners',
        href: '/aliados',
        description: 'Red global de aerolíneas y hoteles.',
        icon: FaHandshake,
        iconTheme: 'orange',
        prefetchKey: 'partners',
      },
      {
        label: 'Atención y Soporte',
        href: '/contacto',
        description: 'Centro oficial de ayuda y consultas.',
        icon: HiSupport,
        iconTheme: 'blue',
        prefetchKey: 'contact',
      },
    ],
  },
];

// Física de resorte orgánica, rápida y precisa
const LIQUID_SPRING: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 34,
  mass: 0.75,
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

  /* ── Cerrar el panel ante un scroll deliberado del usuario ──
     Antes esto vivía en el mismo efecto que setScrolled, con `activeGroup`
     como dependencia: al abrir un grupo (setActiveGroup) el efecto se
     re-suscribía y ejecutaba onScroll() de inmediato en el mismo tick, así
     que si la página ya estaba scrolleada (> 120px) el panel se cerraba
     apenas se abría. Aquí solo reacciona a scroll real (evento 'scroll'),
     nunca al montar/re-suscribirse. */
  useEffect(() => {
    if (activeGroup === null) return;
    const startY = window.scrollY;
    const onScrollWhileOpen = () => {
      if (Math.abs(window.scrollY - startY) > 40) {
        setActiveGroup(null);
      }
    };
    window.addEventListener('scroll', onScrollWhileOpen, { passive: true });
    return () => window.removeEventListener('scroll', onScrollWhileOpen);
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
      const group = NAV_GROUPS.find((g) => g.id === groupId);
      group?.items.forEach((item) => {
        if (item.prefetchKey) prefetchRoute(item.prefetchKey);
      });
    }
  };

  const handleMouseEnterGroup = (groupId: string) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
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
    }, 240);
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
      {/* ── Contenedor Único Liquid Glass ── */}
      <motion.header
        ref={headerRef}
        className={`ctv-liquid-surface${scrolled ? ' ctv-liquid-surface--scrolled' : ''}${isExpanded ? ' ctv-liquid-surface--expanded' : ''}`}
        animate={{
          borderRadius: isExpanded ? '24px' : '9999px',
          boxShadow: isExpanded
            ? '0 24px 60px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(62, 211, 43, 0.18), inset 0 1px 1.5px rgba(255, 255, 255, 0.22)'
            : scrolled
              ? '0 20px 48px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(62, 211, 43, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.16)'
              : '0 16px 40px -8px rgba(0, 0, 0, 0.55), 0 0 20px -2px rgba(62, 211, 43, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
        }}
        transition={LIQUID_SPRING}
        onMouseLeave={handleMouseLeaveHeader}
      >
        {/* Capa de refracción óptica decorativa */}
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

          {/* Navegación Desktop: Disparadores con sombra sutil y sin bordes pesados */}
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
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="ctv-liquid-nav__chevron-wrap"
                    >
                      <HiChevronDown className="ctv-liquid-nav__chevron" />
                    </motion.span>
                  </button>
                </div>
              );
            })}

            {/* Direct Quick Link: Calculadora estilo Wren ("For business [New]") */}
            <Link 
              to="/calculadora" 
              className="ctv-liquid-nav__trigger ctv-liquid-nav__trigger--link"
              onClick={() => setActiveGroup(null)}
              onMouseEnter={() => prefetchRoute('calculator')}
            >
              <span>Calculadora</span>
              <span className="ctv-badge ctv-badge--new">Nueva</span>
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

        {/* ── Extensión Líquida del Contenedor (Estilo Wren Compacto) ── */}
        <AnimatePresence mode="wait">
          {isExpanded && currentGroupData && (
            <motion.div
              key={currentGroupData.id}
              id={`liquid-panel-${currentGroupData.id}`}
              role="region"
              aria-label={currentGroupData.label}
              className="ctv-liquid-body"
              initial={{ opacity: 0, height: 0, y: -4, filter: 'blur(4px)' }}
              animate={{ opacity: 1, height: 'auto', y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, height: 0, y: -4, filter: 'blur(3px)' }}
              transition={{
                height: LIQUID_SPRING,
                opacity: { duration: 0.18, ease: 'easeOut' },
                filter: { duration: 0.18 },
              }}
            >
              {/* Título de sección sutil estilo Wren */}
              <div className="ctv-liquid-section-title">{currentGroupData.label}</div>

              {/* Grid horizontal compacto de 3 columnas */}
              <div className="ctv-liquid-grid">
                {currentGroupData.items.map((item, idx) => {
                  const Icon = item.icon;
                  const isInternalAnchor = item.href.startsWith('/#');

                  const cardInner = (
                    <motion.div
                      className="ctv-liquid-card"
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.03 * idx,
                        duration: 0.22,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onMouseEnter={() => item.prefetchKey && prefetchRoute(item.prefetchKey)}
                    >
                      <div className={`ctv-liquid-card__icon-wrap ctv-liquid-card__icon-wrap--${item.iconTheme || 'green'}`}>
                        <Icon className="ctv-liquid-card__icon" />
                      </div>

                      <div className="ctv-liquid-card__text">
                        <span className="ctv-liquid-card__title">{item.label}</span>
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
                            <div className={`ctv-liquid-drawer__item-icon ctv-liquid-card__icon-wrap--${item.iconTheme || 'green'}`}>
                              <Icon />
                            </div>
                            <div className="ctv-liquid-drawer__item-text">
                              <strong>{item.label}</strong>
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
              <HiCalculator />
              <span>Calculadora de Vuelos</span>
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