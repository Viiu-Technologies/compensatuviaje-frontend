/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_ENV: string;
  /** Entorno local: muestra el login de prueba (nunca en builds de producción). */
  readonly VITE_DEV_LOGIN?: string;
  readonly VITE_DEV_SEED_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
