import { useEffect, useState } from 'react';
import { AlertTriangle, Download, FileBarChart } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  getEmissionsReport,
  getFinancialReport,
  getCompaniesReport,
  getB2CReport,
  exportReport,
  downloadCSV,
  ReportFilters,
} from '../services/adminApi';
import { toast } from 'sonner';
import {
  ADMIN_COLORS,
  BarList,
  EmptyState,
  KpiCard,
  PageHeader,
  Panel,
  Segmented,
  Skeleton,
  StatusBadge,
  COMPANY_STATUS,
  authProviderLabel,
  companyStatusLabel,
  formatCLP,
  formatCLPCompact,
  formatDayLong,
  formatDayShort,
  formatInt,
  industryLabel,
  kgToTonnes,
} from '../ui';

type ReportType = 'emissions' | 'financial' | 'companies' | 'b2c';

const REPORT_TABS = [
  { value: 'emissions', label: 'Emisiones' },
  { value: 'financial', label: 'Financiero' },
  { value: 'companies', label: 'Empresas' },
  { value: 'b2c', label: 'Usuarios B2C' },
];

const GROUP_LABELS: Record<string, string> = {
  time: 'Fecha',
  company: 'Empresa',
  project: 'Proyecto',
  type: 'Tipo',
  source: 'Fuente',
};

/** Filas visibles en la tabla; el resto va en el CSV. */
const TABLE_LIMIT = 50;

const rowLabel = (item: any, groupBy: string) => {
  switch (groupBy) {
    case 'time': return item.date ? formatDayLong(item.date) : '—';
    case 'company': return item.companyName || '—';
    case 'project': return item.projectName || '—';
    case 'type': return item.type || '—';
    case 'source': return item.source || '—';
    default: return item.name || '—';
  }
};

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('emissions');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const [period, setPeriod] = useState('all');
  const [groupBy, setGroupBy] = useState('time');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  // Rango aplicado. Antes existía showCustomDates, pero nunca pasaba a true
  // y las fechas personalizadas no se enviaban.
  const [appliedRange, setAppliedRange] = useState<{ from: string; to: string } | null>(null);

  const isCustom = period === 'custom';
  const hasGrouping = activeTab === 'emissions' || activeTab === 'financial';

  const filters = (): ReportFilters => ({
    period,
    groupBy,
    dateFrom: isCustom ? appliedRange?.from : undefined,
    dateTo: isCustom ? appliedRange?.to : undefined,
  });

  useEffect(() => {
    // Con "Personalizado" se espera a que se apliquen las fechas
    if (isCustom && !appliedRange) return;
    loadReport();
  }, [activeTab, period, groupBy, appliedRange]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const f = filters();
      const loaders = {
        emissions: getEmissionsReport,
        financial: getFinancialReport,
        companies: getCompaniesReport,
        b2c: getB2CReport,
      };
      setReportData(await loaders[activeTab](f));
      setLoadError(false);
    } catch (error) {
      console.error('Error loading report:', error);
      setLoadError(true);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Antes: el interceptor de la API ya devuelve el archivo, pero se buscaba
  // response.data (inexistente), así que nunca se descargaba y el aviso
  // decía "Exportación completada". Excel y PDF devolvían JSON sin archivo.
  const handleExport = async () => {
    setExporting(true);
    try {
      const f = filters();
      const res: any = await exportReport({ reportType: activeTab, format: 'csv', period, dateFrom: f.dateFrom, dateTo: f.dateTo });
      const blob: unknown = res instanceof Blob ? res : res?.data;
      if (!(blob instanceof Blob)) throw new Error('La respuesta no es un archivo');
      downloadCSV(blob, `reporte_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Reporte descargado');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('No se pudo exportar el reporte. Vuelve a intentarlo.');
    } finally {
      setExporting(false);
    }
  };

  const applyRange = () => {
    if (!dateFrom || !dateTo) {
      toast.error('Elige fecha de inicio y de término.');
      return;
    }
    if (dateFrom > dateTo) {
      toast.error('La fecha de inicio es posterior a la de término.');
      return;
    }
    setAppliedRange({ from: dateFrom, to: dateTo });
  };

  const report: any[] = reportData?.report ?? [];
  const totals = reportData?.totals;
  const stats = reportData?.stats;
  const valueKey = activeTab === 'emissions' ? (groupBy === 'time' ? 'emissionsKg' : 'totalEmissionsKg') : 'revenueCLP';
  const valueOf = (item: any) => (activeTab === 'emissions' ? item.emissionsKg ?? item.totalEmissionsKg ?? 0 : item.revenueCLP ?? 0);
  const formatValue = (n: number) => (activeTab === 'emissions' ? `${kgToTonnes(n)} t` : formatCLP(n));

  const renderKpis = () => {
    if (activeTab === 'emissions' && totals) {
      return (
        <div className="adm-kpis">
          <KpiCard label="Emisiones calculadas" value={kgToTonnes(totals.totalEmissionsKg)} unit="t CO₂e" />
          <KpiCard label="Certificados" value={formatInt(totals.totalCertificates)} />
          <KpiCard label="Ingresos" value={formatCLP(totals.totalRevenueCLP)} />
        </div>
      );
    }
    if (activeTab === 'financial' && totals) {
      return (
        <div className="adm-kpis">
          <KpiCard label="Ingresos" value={formatCLP(totals.totalRevenueCLP)} />
          <KpiCard label="Transacciones" value={formatInt(totals.totalTransactions)} />
          <KpiCard label="Ticket promedio" value={formatCLP(totals.averageTransactionCLP)} />
        </div>
      );
    }
    if (activeTab === 'companies' && stats) {
      const by = stats.byStatus || {};
      return (
        <div className="adm-kpis">
          <KpiCard label="Empresas" value={formatInt(stats.total)} />
          <KpiCard label="Activas" value={formatInt(by.active)} />
          <KpiCard label="Por avanzar" value={formatInt((by.registered ?? 0) + (by.pending_contract ?? 0))} context="Registradas o con contrato pendiente" />
          <KpiCard label="Suspendidas" value={formatInt(by.suspended)} />
        </div>
      );
    }
    if (activeTab === 'b2c' && stats) {
      return (
        <div className="adm-kpis">
          <KpiCard label="Usuarios" value={formatInt(stats.total)} />
        </div>
      );
    }
    return null;
  };

  const renderCharts = () => {
    if (hasGrouping) {
      if (!report.length) return null;
      if (groupBy === 'time') {
        return (
          <Panel
            title={activeTab === 'emissions' ? 'Emisiones calculadas por día' : 'Ingresos por día'}
            description={activeTab === 'emissions' ? 'Toneladas de CO₂e' : 'Pesos chilenos'}
          >
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke={ADMIN_COLORS.grid} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: ADMIN_COLORS.axis, fontSize: 12 }} tickFormatter={formatDayShort} minTickGap={32} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: ADMIN_COLORS.axis, fontSize: 12 }} width={64}
                    tickFormatter={(v: number) => (activeTab === 'emissions' ? kgToTonnes(v, 0) : formatCLPCompact(v))} />
                  <Tooltip
                    labelFormatter={(l) => formatDayLong(String(l))}
                    formatter={(v: number) => [formatValue(v), activeTab === 'emissions' ? 'Emisiones' : 'Ingresos']}
                    contentStyle={{ borderRadius: 6, border: `1px solid ${ADMIN_COLORS.neutral}`, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey={valueKey} stroke={ADMIN_COLORS.series1} fill={ADMIN_COLORS.series1} fillOpacity={0.12} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        );
      }
      return (
        <Panel title={`${activeTab === 'emissions' ? 'Emisiones' : 'Ingresos'} por ${GROUP_LABELS[groupBy].toLowerCase()}`} description="Los 10 mayores">
          <BarList items={report.map((r) => ({ label: rowLabel(r, groupBy), value: valueOf(r) }))} format={formatValue} showShare max={10} />
        </Panel>
      );
    }
    if (activeTab === 'companies' && stats) {
      return (
        <div className="adm-grid adm-grid--1-1">
          <Panel title="Por estado">
            <BarList items={Object.entries(stats.byStatus || {}).map(([k, v]) => ({ label: companyStatusLabel(k), value: v as number }))} showShare />
          </Panel>
          <Panel title="Por industria">
            <BarList items={Object.entries(stats.byIndustry || {}).map(([k, v]) => ({ label: industryLabel(k), value: v as number }))} showShare max={10} />
          </Panel>
        </div>
      );
    }
    if (activeTab === 'b2c' && stats) {
      return (
        <div className="adm-grid adm-grid--1-1">
          <Panel title="Por método de acceso">
            <BarList items={Object.entries(stats.byAuthProvider || {}).map(([k, v]) => ({ label: authProviderLabel(k), value: v as number }))} showShare />
          </Panel>
          <Panel title="Por país">
            <BarList items={Object.entries(stats.byCountry || {}).map(([k, v]) => ({ label: k, value: v as number }))} showShare max={10} />
          </Panel>
        </div>
      );
    }
    return null;
  };

  const renderTable = () => {
    let head: React.ReactNode;
    let rows: React.ReactNode[] = [];
    let total = 0;
    if (hasGrouping) {
      total = report.length;
      head = (
        <tr>
          <th scope="col">{GROUP_LABELS[groupBy]}</th>
          <th scope="col" className="adm-col-num">{activeTab === 'emissions' ? 'Emisiones (t CO₂e)' : 'Ingresos (CLP)'}</th>
          <th scope="col" className="adm-col-num">{activeTab === 'emissions' ? 'Certificados' : 'Transacciones'}</th>
        </tr>
      );
      rows = report.slice(0, TABLE_LIMIT).map((item, i) => (
        <tr key={i}>
          <td>{rowLabel(item, groupBy)}</td>
          <td className="adm-col-num">{activeTab === 'emissions' ? kgToTonnes(valueOf(item)) : formatCLP(valueOf(item))}</td>
          <td className="adm-col-num">{formatInt(activeTab === 'emissions' ? item.count ?? item.certificatesCount : item.transactions)}</td>
        </tr>
      ));
    } else if (activeTab === 'companies') {
      const list: any[] = reportData?.companies ?? [];
      total = list.length;
      head = (
        <tr>
          <th scope="col">Empresa</th><th scope="col">RUT</th><th scope="col">Industria</th><th scope="col">Tamaño</th><th scope="col">Estado</th>
        </tr>
      );
      rows = list.slice(0, TABLE_LIMIT).map((c, i) => (
        <tr key={i}>
          <td className="adm-cell-title">{c.companyName || c.name || '—'}</td>
          <td>{c.rut || '—'}</td>
          <td>{industryLabel(c.industry)}</td>
          <td>{c.companySize || c.size || '—'}</td>
          <td><StatusBadge tone={COMPANY_STATUS[c.status]?.tone ?? 'neutral'}>{companyStatusLabel(c.status || '—')}</StatusBadge></td>
        </tr>
      ));
    } else {
      const list: any[] = reportData?.users ?? [];
      total = list.length;
      head = (
        <tr>
          <th scope="col">Nombre</th><th scope="col">Email</th><th scope="col">Acceso</th><th scope="col">Registro</th>
        </tr>
      );
      rows = list.slice(0, TABLE_LIMIT).map((u, i) => (
        <tr key={i}>
          <td className="adm-cell-title">{u.name || u.displayName || '—'}</td>
          <td>{u.email || '—'}</td>
          <td>{authProviderLabel(u.authProvider || u.provider)}</td>
          <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CL') : '—'}</td>
        </tr>
      ));
    }

    const cols = hasGrouping ? 3 : activeTab === 'companies' ? 5 : 4;
    return (
      <section className="adm-table-card">
        <div className="adm-panel__head" style={{ paddingBottom: 12 }}>
          <div>
            <h2 className="adm-panel__title">Detalle</h2>
            <p className="adm-panel__desc">Registros del período seleccionado</p>
          </div>
          <span className="adm-panel__aside">{formatInt(total)} registros</span>
        </div>
        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>{head}</thead>
            <tbody>
              {rows.length ? rows : (
                <tr><td colSpan={cols}><EmptyState icon={FileBarChart} title="Sin registros en este período" text="Prueba con otro período o agrupación." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Antes decía "Listado completo" y mostraba 10 filas sin avisar */}
        {total > TABLE_LIMIT && (
          <p className="adm-table-note">
            Se muestran {formatInt(TABLE_LIMIT)} de {formatInt(total)} registros. Exporta el CSV para ver el detalle completo.
          </p>
        )}
      </section>
    );
  };

  return (
    <div className="adm-page">
      <PageHeader
        title="Reportes"
        description="Emisiones, ingresos, empresas y usuarios de la plataforma por período."
        actions={
          <button type="button" className="adm-btn" onClick={handleExport} disabled={exporting || loading}>
            <Download aria-hidden="true" />
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </button>
        }
      />

      <section className="adm-panel">
        <div className="adm-toolbar" style={{ borderBottom: 0 }}>
          <Segmented label="Reporte" options={REPORT_TABS} value={activeTab} onChange={(v) => setActiveTab(v as ReportType)} />
          <div className="adm-filters">
            <div className="adm-field">
              <label className="adm-field__label" htmlFor="rp-period">Período</label>
              <select
                id="rp-period"
                className="adm-select"
                value={period}
                onChange={(e) => { setPeriod(e.target.value); setAppliedRange(null); }}
              >
                <option value="all">Todo</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="365d">Último año</option>
                <option value="ytd">Año en curso</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            {isCustom && (
              <>
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="rp-from">Desde</label>
                  <input id="rp-from" type="date" className="adm-input adm-input--date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="rp-to">Hasta</label>
                  <input id="rp-to" type="date" className="adm-input adm-input--date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <button type="button" className="adm-btn adm-btn--primary" onClick={applyRange}>Aplicar</button>
              </>
            )}
            {hasGrouping && (
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="rp-group">Agrupar por</label>
                <select id="rp-group" className="adm-select" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                  <option value="time">Fecha</option>
                  <option value="company">Empresa</option>
                  <option value="project">Proyecto</option>
                  {activeTab === 'emissions' && <option value="type">Tipo</option>}
                  {activeTab === 'financial' && <option value="source">Fuente</option>}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {loadError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>No se pudo cargar el reporte.</b> Revisa la conexión y vuelve a intentar.</div>
        </div>
      )}

      {isCustom && !appliedRange ? (
        <section className="adm-panel">
          <EmptyState icon={FileBarChart} title="Elige un rango de fechas" text="Selecciona desde y hasta, y presiona Aplicar." />
        </section>
      ) : loading ? (
        <>
          <div className="adm-kpis">{[0, 1, 2].map((i) => <Skeleton key={i} height={96} />)}</div>
          <Skeleton height={320} />
        </>
      ) : (
        !loadError && (
          <>
            {renderKpis()}
            {renderCharts()}
            {renderTable()}
          </>
        )
      )}
    </div>
  );
}
