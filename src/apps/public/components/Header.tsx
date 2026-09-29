// ==========================================================================
// Header.tsx — Liquid Glass Unified Surface Header (Estilo Wren)
// Compacto, limpio, horizontal, sin footer ni exceso de descripciones.
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig, type Transition } from 'framer-motion';
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
        description: 'Programa para agencias, aerolíneas y hoteles.',
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

// Auto-ocultado: por debajo de HIDE_AFTER_PX el header siempre se muestra;
// SCROLL_DELTA_PX filtra el jitter del trackpad para no parpadear.
const HIDE_AFTER_PX = 120;
const SCROLL_DELTA_PX = 8;

const prefetchGroup = (groupId: string) => {
  NAV_GROUPS.find((g) => g.id === groupId)?.items.forEach((item) => {
    if (item.prefetchKey) prefetchRoute(item.prefetchKey);
  });
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>('soluciones');

  const headerRef = useRef<HTMLElement>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Grupo abierto por hover: el primer click sobre su trigger lo confirma en
  // vez de cerrarlo (antes hover abría y el click inmediato lo cerraba).
  const hoverOpenedRef = useRef<string | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

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

  /* ── Scroll effect: estado "scrolled" + ocultar al bajar / mostrar al subir ── */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled(y > 20);

      if (y <= HIDE_AFTER_PX) {
        setHidden(false);
        lastY = y;
        return;
      }
      // lastY solo avanza al superar el umbral, así un scroll lento también acumula.
      const delta = y - lastY;
      if (Math.abs(delta) < SCROLL_DELTA_PX) return;
      setHidden(delta > 0);
      lastY = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Scroll a anclas (#proyectos, #metodologia…) tras navegar ──
     Se difiere con setTimeout para correr después de los scrollTo(0, 0) que
     hacen algunas páginas al montar, y reintenta porque varias secciones del
     landing se cargan en diferido. */
  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (++tries < 20) {
        timer = setTimeout(tryScroll, 100);
      }
    };
    timer = setTimeout(tryScroll, 0);
    return () => clearTimeout(timer);
  }, [location.pathname, location.hash, location.key]);

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
        setIsMenuOpen(false);
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

  /* ── El drawer se oculta por CSS a ≥1024px: cerrarlo también en estado,
     o el body se queda con overflow: hidden y la página no scrollea ── */
  useEffect(() => {
    if (!isMenuOpen) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [isMenuOpen]);

  /* ── Foco del menú móvil: entra al botón de cerrar al abrir, Tab queda
     dentro del panel y al cerrar vuelve a la hamburguesa ── */
  useEffect(() => {
    if (!isMenuOpen) return;
    const panel = drawerPanelRef.current;
    drawerCloseRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // Solo si el foco seguía en el menú (al navegar, el foco ya cambió).
      if (panel?.contains(document.activeElement)) hamburgerRef.current?.focus();
    };
  }, [isMenuOpen]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setActiveGroup(null);
  }, []);

  /* ── Cerrar todo al cambiar de ruta (incluye atrás/adelante del navegador) ── */
  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  /* ── Manejo de Apertura / Cambio / Cierre de categorías ── */
  const toggleGroup = (groupId: string) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (activeGroup === groupId) {
      if (hoverOpenedRef.current === groupId) {
        hoverOpenedRef.current = null;
        return;
      }
      setActiveGroup(null);
    } else {
      hoverOpenedRef.current = null;
      setActiveGroup(groupId);
      prefetchGroup(groupId);
    }
  };

  // Solo mouse: en táctil el pointerenter llega justo antes del click y
  // ambos eventos competirían por el mismo toque.
  const handlePointerEnterGroup = (e: React.PointerEvent, groupId: string) => {
    if (e.pointerType !== 'mouse') return;
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (activeGroup !== groupId) hoverOpenedRef.current = groupId;
    setActiveGroup(groupId);
    prefetchGroup(groupId);
  };

  const handleMouseLeaveHeader = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveGroup(null);
    }, 240);
  };

  const isHidden = hidden && !isExpanded && !isMenuOpen;

  // reducedMotion="user": las animaciones de Motion (panel, chevrons, cards)
  // respetan "reducir movimiento" del sistema, como ya lo hacía el CSS.
  return (
    <MotionConfig reducedMotion="user">
      {/* ── Contenedor Único Liquid Glass ── */}
      {/* border-radius y box-shadow ya no se animan aqui via Framer Motion -- ambas
          propiedades fuerzan layout/paint en el hilo principal en cada frame del
          spring, y Motion las recalculaba con su propio bucle de JS por encima de
          eso. Ahora son una transicion CSS declarativa (ver .ctv-liquid-surface,
          --scrolled y --expanded en Header.css) que el navegador interpola por su
          cuenta; el spring de Motion se conserva solo para lo que si vale la pena
          animar con fisica (el panel desplegable, mas abajo). */}
      <header
        ref={headerRef}
        className={`ctv-liquid-surface${scrolled ? ' ctv-liquid-surface--scrolled' : ''}${isExpanded ? ' ctv-liquid-surface--expanded' : ''}${isHidden ? ' ctv-liquid-surface--hidden' : ''}`}
        onMouseLeave={handleMouseLeaveHeader}
        onFocus={() => setHidden(false)}
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
                    onPointerEnter={(e) => handlePointerEnterGroup(e, group.id)}
                    aria-expanded={isCurrentActive}
                    aria-controls={isCurrentActive ? 'liquid-panel' : undefined}
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
                  to="/register"
                  className="ctv-btn-liquid ctv-btn-liquid--outline ctv-liquid-actions__register"
                  onClick={() => setActiveGroup(null)}
                >
                  Registrarse
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
            ref={hamburgerRef}
            className="ctv-liquid-hamburger"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        {/* ── Extensión Líquida del Contenedor (Estilo Wren Compacto) ── */}
        {/* El contenedor queda montado mientras haya un grupo activo; al cambiar
            de grupo solo se hace crossfade del contenido, sin colapsar la altura. */}
        <AnimatePresence>
          {isExpanded && currentGroupData && (
            <motion.div
              key="liquid-panel"
              id="liquid-panel"
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
              <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentGroupData.id}
                role="region"
                aria-label={currentGroupData.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
              {/* Título de sección sutil estilo Wren */}
              <div className="ctv-liquid-section-title">{currentGroupData.label}</div>

              {/* Grid horizontal compacto de 3 columnas */}
              <div className="ctv-liquid-grid">
                {currentGroupData.items.map((item, idx) => {
                  const Icon = item.icon;

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
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile Drawer (Panel lateral táctil para vista responsive) ── */}
      <div
        className={`ctv-liquid-drawer${isMenuOpen ? ' ctv-liquid-drawer--open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="ctv-liquid-drawer__overlay" onClick={closeMenu} />

        <div
          ref={drawerPanelRef}
          className="ctv-liquid-drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
        >
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
              ref={drawerCloseRef}
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
    </MotionConfig>
  );
};

export default Header;