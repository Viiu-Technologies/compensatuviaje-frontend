import React, { useCallback, useEffect, useState } from 'react';
import { Check, Copy, PlugZap, ShieldAlert, X } from 'lucide-react';
import authService from '../../apps/b2c/services/authService';

export type McpRole = 'b2c' | 'b2b' | 'partner' | 'admin';

interface McpConnectTriggerProps {
  role: McpRole;
  variant?: 'default' | 'admin';
  className?: string;
}

const ROLE_META: Record<McpRole, { label: string; tools: string[] }> = {
  b2c: {
    label: 'Persona (B2C)',
    tools: [
      'calcularVuelo',
      'verMisViajes',
      'verMisInsignias',
      'verMisCertificados',
      'verificarCertificado',
      'revisarEstadoPago',
      'verHistorialPagos',
      'verProyectosDisponibles',
    ],
  },
  b2b: {
    label: 'Empresa (B2B)',
    tools: [
      'verEstadoOnboarding',
      'validarDocumentos',
      'calcularVuelo',
      'verDeudaEmisiones',
      'verMisOrdenes',
      'verMisCertificadosB2B',
      'verificarCertificado',
      'verProyectosDisponibles',
      'verTimelineEmpresa',
    ],
  },
  partner: {
    label: 'Impact Partner',
    tools: [
      'calcularVuelo',
      'verResumenPartner',
      'verMisProyectosPartner',
      'verMisLiquidacionesPartner',
    ],
  },
  admin: {
    label: 'Administrador',
    tools: [
      'verDashboardAdmin',
      'buscarEmpresa',
      'verDetalleEmpresa',
      'verEmpresasPendientes',
      'verEstadoFondoAdmin',
      'verLiquidacionesAdmin',
      'verPagosYReembolsosAdmin',
      'verOrdenesB2bPendientesAdmin',
      'verProyectosEsgAdmin',
      'calcularVuelo',
    ],
  },
};

function getMcpBaseEndpoint(): string {
  const apiBase =
    import.meta.env.VITE_APP_API_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:3001/api';
  return `${String(apiBase).replace(/\/+$/, '')}/shared/chat/doctor-ia/mcp`;
}

async function resolveActiveToken(role: McpRole): Promise<string | null> {
  if (role === 'b2c') {
    const session = await authService.getSession().catch(() => null);
    if (session?.access_token) return session.access_token;
    return localStorage.getItem('access_token');
  }

  const jwtToken = localStorage.getItem('access_token');
  if (jwtToken) return jwtToken;

  const session = await authService.getSession().catch(() => null);
  return session?.access_token ?? null;
}

/**
 * Botón y modal reutilizable para conectar la sesión activa con clientes MCP
 * externos (Claude Web / Claude Desktop / ChatGPT / OpenAI Responses API).
 */
export const McpConnectTrigger: React.FC<McpConnectTriggerProps> = ({
  role,
  variant = 'default',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'url' | 'json' | null>(null);

  const meta = ROLE_META[role];
  const endpoint = getMcpBaseEndpoint();
  const tokenValue = token || '<TU_TOKEN_DE_SESION>';
  const directUrl = `${endpoint}/${tokenValue}`;

  const jsonConfig = JSON.stringify(
    {
      mcpServers: {
        compensatuviaje: {
          url: endpoint,
          headers: {
            Authorization: `Bearer ${tokenValue}`,
          },
        },
      },
    },
    null,
    2
  );

  const handleOpen = useCallback(async () => {
    setOpen(true);
    setLoadingToken(true);
    try {
      const resolved = await resolveActiveToken(role);
      setToken(resolved);
    } finally {
      setLoadingToken(false);
    }
  }, [role]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const handleCopy = async (key: 'url' | 'json', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 2000);
    } catch {
      // Fallback silencioso si el navegador bloquea el portapapeles
    }
  };

  const triggerClass =
    variant === 'admin'
      ? `adm-btn ${className}`.trim()
      : `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-sm font-medium transition-colors cursor-pointer ${className}`.trim();

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={triggerClass}
        title="Conectar este portal con Claude o ChatGPT vía MCP"
      >
        <PlugZap className="w-4 h-4" aria-hidden="true" />
        <span>Conectar MCP (Claude / ChatGPT)</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mcp-connect-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <PlugZap className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="mcp-connect-title" className="text-base font-semibold text-slate-900">
                    Conectar con Claude / ChatGPT (MCP)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Rol activo: <strong className="text-slate-700">{meta.label}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-700">
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                <div>
                  {loadingToken ? (
                    'Cargando token de sesión...'
                  ) : token ? (
                    'Esta URL y configuración contienen tu token JWT personal. No las compartas públicamente; expiran al cerrar o caducar tu sesión.'
                  ) : (
                    'No se detectó un token activo en esta pestaña. Inicia sesión para reemplazar <TU_TOKEN_DE_SESION> automáticamente.'
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-900">
                    1. URL directa (Claude Web / Conectores sin headers)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('url', directUrl)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {copiedKey === 'url' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        Copiada
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        Copiar URL
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={directUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-900">
                    2. JSON MCP (Claude Desktop / OpenAI Responses API)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('json', jsonConfig)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {copiedKey === 'json' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        Copiar JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-slate-100 overflow-x-auto">
                  {jsonConfig}
                </pre>
              </div>

              <div>
                <p className="font-medium text-slate-900 mb-2">
                  Herramientas habilitadas para {meta.label} ({meta.tools.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {meta.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-xs text-slate-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default McpConnectTrigger;
