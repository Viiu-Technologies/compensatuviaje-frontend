import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useMemo, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  /** Fuerza el tema claro hasta que se llame a la función que devuelve. */
  forceLight: () => () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'compensatuviaje-theme';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'system' 
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as Theme;
      }
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Vistas sin modo oscuro completo (landing, admin) piden el tema claro con
  // forceLight(). Se resuelve aquí y no desde cada vista: antes la landing
  // cambiaba la clase en su propio efecto y este provider la volvía a
  // pisar con "dark" cuando el sistema operativo estaba en oscuro.
  const [forcedLightCount, setForcedLightCount] = useState(0);
  const effectiveTheme: 'light' | 'dark' = forcedLightCount > 0 ? 'light' : resolvedTheme;

  const forceLight = useCallback(() => {
    setForcedLightCount((c) => c + 1);
    return () => setForcedLightCount((c) => c - 1);
  }, []);

  // Detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    handleChange(); // Ejecutar al inicio
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Resolver tema actual
  useEffect(() => {
    if (theme === 'light' || theme === 'dark') {
      setResolvedTheme(theme);
    } else {
      // system
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    }
  }, [theme]);

  // Aplicar clase al documento (layout effect: antes del pintado, sin parpadeo)
  useLayoutEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);

    // También actualizar el atributo data-theme para compatibilidad
    root.setAttribute('data-theme', effectiveTheme);

    // Actualizar meta theme-color para móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        effectiveTheme === 'dark' ? '#1a1a2e' : '#ffffff'
      );
    }
  }, [effectiveTheme]);

  // Guardar en localStorage
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  // Sin memoizar, este objeto era una referencia nueva en cada render de
  // ThemeProvider -- como envuelve toda la app, cualquier consumidor envuelto en
  // React.memo perdia el beneficio de la memoizacion sin razon aparente.
  // resolvedTheme expone el tema efectivo: dentro de una vista forzada a
  // claro, los componentes que eligen colores según el tema también ven "light".
  const value = useMemo<ThemeContextType>(
    () => ({ theme, resolvedTheme: effectiveTheme, setTheme, toggleTheme, forceLight }),
    [theme, effectiveTheme, setTheme, toggleTheme, forceLight]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook para aplicar clases condicionales de tema
export const useThemeClass = (lightClass: string, darkClass: string): string => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? darkClass : lightClass;
};

export default ThemeContext;
