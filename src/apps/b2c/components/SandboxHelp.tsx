/**
 * Datos de prueba de Transbank, visibles solo cuando Webpay está en
 * integración (entorno de pruebas o local). En la clase con estudiantes esta
 * ayuda solo aparecía en localhost: nadie la veía y el 62 % de los pagos no
 * terminó.
 *
 * El ambiente lo dice el backend (GET /public/config/payments); se pregunta
 * una sola vez por carga de página.
 */
import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';

let cached: Promise<boolean> | null = null;

function isLocalhost(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/** ¿Webpay está en modo de pruebas? Ante cualquier error responde false (no muestra la ayuda). */
export function fetchIsSandbox(): Promise<boolean> {
  if (!cached) {
    cached = fetch(`${API_URL}/public/config/payments`)
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => body?.data?.webpayEnvironment === 'integration')
      .catch(() => isLocalhost());
  }
  return cached;
}

export function useIsSandbox(): boolean {
  const [sandbox, setSandbox] = useState(false);
  useEffect(() => {
    let alive = true;
    fetchIsSandbox().then((v) => { if (alive) setSandbox(v); });
    return () => { alive = false; };
  }, []);
  return sandbox;
}

export const SandboxHelp: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900 ${className}`}>
    <p className="m-0 font-semibold">Entorno de pruebas: no se cobra nada</p>
    <p className="m-0 mt-1">En Webpay usa estos datos de prueba de Transbank, no tu tarjeta real:</p>
    <ol className="mt-2 mb-0 pl-5 space-y-0.5">
      <li>
        Elige <b>Tarjeta de crédito</b> → número <span className="font-mono">4051 8856 0044 6623</span>, CVV{' '}
        <span className="font-mono">123</span>, cualquier fecha futura.
      </li>
      <li>
        En el banco simulado: RUT <span className="font-mono">11.111.111-1</span>, clave <span className="font-mono">123</span>.
      </li>
      <li>Presiona <b>Aceptar</b> en ambas pantallas (no "Rechazar").</li>
    </ol>
  </div>
);

export default SandboxHelp;
