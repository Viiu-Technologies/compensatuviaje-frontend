import React, { useCallback, useId, useState } from 'react';
import { useModalDialog } from './ui/useModalDialog';
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

/** Qué puede hacer cada herramienta, dicho para personas. */
const TOOL_LABELS: Record<string, string> = {
  calcularVuelo: 'Calcular la huella de un vuelo',
  verMisViajes: 'Ver tus viajes calculados',
  verMisInsignias: 'Ver tus insignias',
  verMisCertificados: 'Ver tus certificados',
  verificarCertificado: 'Verificar un certificado',
  revisarEstadoPago: 'Revisar el estado de un pago',
  verHistorialPagos: 'Ver tu historial de pagos',
  verProyectosDisponibles: 'Ver los proyectos disponibles',
  verEstadoOnboarding: 'Ver el estado de tu registro',
  validarDocumentos: 'Revisar tus documentos',
  verDeudaEmisiones: 'Ver las emisiones pendientes',
  verMisOrdenes: 'Ver tus órdenes',
  verMisCertificadosB2B: 'Ver los certificados de tu empresa',
  verTimelineEmpresa: 'Ver la historia de tu empresa',
  verResumenPartner: 'Ver tu resumen como partner',
  verMisProyectosPartner: 'Ver tus proyectos',
  verMisLiquidacionesPartner: 'Ver tus liquidaciones',
  verDashboardAdmin: 'Ver el panel de administración',
  buscarEmpresa: 'Buscar una empresa',
  verDetalleEmpresa: 'Ver el detalle de una empresa',
  verEmpresasPendientes: 'Ver empresas pendientes',
  verEstadoFondoAdmin: 'Ver el estado del fondo',
  verLiquidacionesAdmin: 'Ver liquidaciones',
  verPagosYReembolsosAdmin: 'Ver pagos y reembolsos',
  verOrdenesB2bPendientesAdmin: 'Ver órdenes B2B pendientes',
  verProyectosEsgAdmin: 'Ver proyectos ESG',
};

type Tab = 'web' | 'desktop';

/**
 * Botón y ventana para conectar la sesión activa con clientes MCP externos
 * (Claude, ChatGPT, Claude Desktop, OpenAI Responses API).
 *
 * Usa <dialog> nativo (useModalDialog): se abre en la capa superior. Antes era
 * un div `fixed` dentro del encabezado, y el backdrop-blur del encabezado lo
 * dejaba posicionado respecto a él: la ventana salía cortada arriba.
 */
export const McpConnectTrigger: React.FC<McpConnectTriggerProps> = ({
  role,
  variant = 'default',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('web');
  const [token, setToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'url' | 'json' | null>(null);
  const titleId = useId();

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

  const modal = useModalDialog({ open, onClose: () => setOpen(false) });

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

  const copyButton = (key: 'url' | 'json', text: string, label: string) => (
    <button
      type="button"
      onClick={() => handleCopy(key, text)}
      disabled={loadingToken}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors cursor-pointer border-0 disabled:opacity-50"
    >
      {copiedKey === key ? (
        <>
          <Check className="w-4 h-4" aria-hidden="true" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" aria-hidden="true" />
          {label}
        </>
      )}
    </button>
  );

  const tabButton = (id: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      id={`${titleId}-tab-${id}`}
      aria-selected={tab === id}
      aria-controls={`${titleId}-panel`}
      onClick={() => setTab(id)}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer border-0 ${
        tab === id ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={triggerClass}
        title="Conectar este portal con Claude o ChatGPT vía MCP"
      >
        <PlugZap className="w-4 h-4" aria-hidden="true" />
        {/* En celular solo "MCP": el texto completo desbordaba el encabezado. */}
        <span>
          <span className="hidden sm:inline">Conectar </span>MCP<span className="hidden md:inline"> (Claude / ChatGPT)</span>
        </span>
      </button>

      {/* m-auto: el preflight de Tailwind pone margin 0 y el <dialog> dejaría de centrarse. */}
      <dialog
        {...modal}
        aria-labelledby={titleId}
        className="m-auto p-0 w-[calc(100%-2rem)] max-w-xl max-h-[90dvh] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white text-left text-slate-700 shadow-2xl backdrop:bg-slate-900/50"
      >
        {open && (
          <>
            <div className="flex items-start gap-3 px-6 pt-6">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-white">
                <PlugZap className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="m-0 text-lg font-semibold text-slate-900">
                  Usa CompensaTuViaje desde Claude o ChatGPT
                </h2>
                <p className="m-0 mt-1 text-sm text-slate-500">
                  Tu asistente podrá consultar los datos de tu cuenta con tu sesión actual.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors bg-transparent border-0 cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pt-5">
              <div role="tablist" aria-label="Dónde lo vas a usar" className="flex gap-1 rounded-xl bg-slate-100 p-1">
                {tabButton('web', 'Claude o ChatGPT')}
                {tabButton('desktop', 'Claude Desktop o API')}
              </div>
            </div>

            <div id={`${titleId}-panel`} role="tabpanel" aria-labelledby={`${titleId}-tab-${tab}`} className="px-6 pt-5 space-y-4 text-sm">
              {tab === 'web' ? (
                <>
                  <ol className="m-0 pl-5 list-decimal space-y-1.5 text-slate-600 marker:text-emerald-700 marker:font-semibold">
                    <li>Copia tu enlace personal.</li>
                    <li>En Claude o ChatGPT, agrega un conector personalizado (MCP).</li>
                    <li>Pega el enlace y guarda. Listo: pregúntale por tus datos.</li>
                  </ol>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={loadingToken ? 'Preparando tu enlace…' : directUrl}
                      aria-label="Tu enlace personal"
                      onFocus={(e) => e.currentTarget.select()}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {copyButton('url', directUrl, 'Copiar enlace')}
                  </div>
                </>
              ) : (
                <>
                  <p className="m-0 text-slate-600">
                    Agrega este bloque a la configuración MCP de Claude Desktop o a tu llamada a la API de OpenAI.
                  </p>
                  <pre className="m-0 max-h-56 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100">
                    {jsonConfig}
                  </pre>
                  <div className="flex justify-end">{copyButton('json', jsonConfig, 'Copiar configuración')}</div>
                </>
              )}

              <p className="m-0 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" aria-hidden="true" />
                <span>
                  {loadingToken
                    ? 'Cargando tu sesión…'
                    : token
                    ? 'Incluye tu token de sesión: no lo compartas. Deja de funcionar cuando cierras sesión o caduca.'
                    : 'No encontramos una sesión activa en esta pestaña. Inicia sesión y vuelve a abrir esta ventana.'}
                </span>
              </p>
            </div>

            <div className="px-6 pt-5 pb-6">
              <h3 className="m-0 mb-2.5 text-sm font-semibold text-slate-900">Lo que podrá hacer</h3>
              <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {meta.tools.map((tool) => (
                  <li key={tool} className="flex items-center gap-2 text-sm text-slate-600" title={tool}>
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {TOOL_LABELS[tool] ?? tool}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </dialog>
    </>
  );
};

export default McpConnectTrigger;
