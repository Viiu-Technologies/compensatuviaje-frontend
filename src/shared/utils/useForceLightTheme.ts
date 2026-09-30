import { useLayoutEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Fuerza el tema claro mientras el componente está montado.
 *
 * El ThemeProvider sigue al sistema operativo por defecto; en las vistas que
 * no tienen un modo oscuro completo (landing, admin) eso dejaba texto claro
 * sobre fondos que siguen blancos. El provider aplica "light" mientras alguna
 * vista lo pida y vuelve al tema del usuario al desmontarse la última.
 */
export function useForceLightTheme() {
  const { forceLight } = useTheme();
  useLayoutEffect(() => forceLight(), [forceLight]);
}
