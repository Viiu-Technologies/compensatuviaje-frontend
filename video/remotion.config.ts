import path from 'node:path';
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// El globo es WebGL: sin ANGLE, Chrome headless en Windows renderiza el canvas en negro.
Config.setChromiumOpenGlRenderer('angle');

// El video importa dibujos SVG de la web (../src). Esos archivos resolverían
// React desde el node_modules del front: se fuerza la copia del video para que
// haya un solo React en el bundle.
const own = (name: string) => path.join(process.cwd(), 'node_modules', name);
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias as Record<string, string> | undefined),
      react: own('react'),
      'react-dom': own('react-dom'),
      // CSS de la web con rutas absolutas de su carpeta public (p. ej. el logo del header).
      '/images': path.join(process.cwd(), '..', 'public', 'images'),
    },
  },
}));
