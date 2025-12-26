import { useEffect, useState } from 'react';
import {
  FileBarChart,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Building2,
  Users,
  Leaf,
  DollarSign,
  ChevronDown,
  FileText,
  Table as TableIcon,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Globe
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  getEmissionsReport,
  getFinancialReport,
  exportReport,
  downloadCSV,
  ReportFilters
} from '../services/adminApi';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

type ReportType = 'emissions' | 'financial' | 'companies' | 'b2c';

interface ReportTab {
  id: ReportType;
  label: string;
  icon: React.ElementType;
}

const reportTabs: ReportTab[] = [
  { id: 'emissions', label: 'Emisiones', icon: Leaf },
  { id: 'financial', label: 'Financiero', icon: DollarSign },
  { id: 'companies', label: 'Empresas', icon: Building2 },
  { id: 'b2c', label: 'Usuarios B2C', icon: Users },
];

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('emissions');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  // Filtros
  const [period, setPeriod] = useState('30d');
  const [groupBy, setGroupBy] = useState('time');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCustomDates, setShowCustomDates] = useState(false);

  useEffect(() => {
    loadReport();
  }, [activeTab, period, groupBy]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const filters: ReportFilters = {
        period,
        groupBy,
        dateFrom: showCustomDates && dateFrom ? dateFrom : undefined,
        dateTo: showCustomDates && dateTo ? dateTo : undefined
      };

      let data;
      switch (activeTab) {
        case 'emissions':
          data = await getEmissionsReport(filters);
          break;
        case 'financial':
          data = await getFinancialReport(filters);
          break;
        default:
          data = await getEmissionsReport(filters);
      }
      setReportData(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExporting(true);
    try {
      const response = await exportReport({
        reportType: activeTab,
        format,
        period,
        dateFrom: showCustomDates && dateFrom ? dateFrom : undefined,
        dateTo: showCustomDates && dateTo ? dateTo : undefined
      });

      if (format === 'csv' && response.data instanceof Blob) {
        downloadCSV(response.data, `reporte_${activeTab}_${Date.now()}.csv`);
      } else {
        console.log('Export result:', response.data);
        alert('Exportación completada. Ver consola para detalles.');
      }
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="!space-y-8 !animate-in !fade-in !duration-700">
      {/* Header Section */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
        <div>
          <h1 className="!text-4xl !font-black !text-slate-900 !tracking-tight !mb-2">
            Centro de <span className="!text-emerald-600">Reportes</span>
          </h1>
          <p className="!text-slate-500 !font-medium">
            Analiza el impacto ambiental y el rendimiento financiero de la plataforma.
          </p>
        </div>
        <div className="!flex !items-center !gap-3">
          <div className="!relative !group">
            <button
              disabled={exporting}
              className="!flex !items-center !gap-2 !bg-slate-900 !hover:bg-slate-800 !text-white !px-6 !py-3 !rounded-2xl !font-bold !transition-all !shadow-lg !shadow-slate-200 !active:scale-95"
            >
              <Download className="!w-5 !h-5" />
              {exporting ? 'Exportando...' : 'Exportar Datos'}
              <ChevronDown className="!w-4 !h-4" />
            </button>
            <div className="!absolute !right-0 !mt-2 !w-56 !bg-white !rounded-2xl !shadow-2xl !border !border-slate-100 !py-2 !z-50 !opacity-0 !invisible !group-hover:opacity-100 !group-hover:visible !transition-all !translate-y-2 !group-hover:translate-y-0">
              <button
                onClick={() => handleExport('csv')}
                className="!w-full !flex !items-center !gap-3 !px-4 !py-3 !text-sm !font-bold !text-slate-700 !hover:bg-slate-50 !transition-colors"
              >
                <TableIcon className="!w-4 !h-4 !text-emerald-500" />
                Exportar CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="!w-full !flex !items-center !gap-3 !px-4 !py-3 !text-sm !font-bold !text-slate-700 !hover:bg-slate-50 !transition-colors"
              >
                <FileText className="!w-4 !h-4 !text-blue-500" />
                Exportar Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="!w-full !flex !items-center !gap-3 !px-4 !py-3 !text-sm !font-bold !text-slate-700 !hover:bg-slate-50 !transition-colors"
              >
                <FileBarChart className="!w-4 !h-4 !text-red-500" />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="!bg-white !p-2 !rounded-3xl !shadow-sm !border !border-slate-100 !flex !flex-wrap !gap-2">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`!flex !items-center !gap-2 !px-6 !py-3 !rounded-2xl !font-bold !transition-all ${
              activeTab === tab.id
                ? '!bg-emerald-600 !text-white !shadow-lg !shadow-emerald-100'
                : '!text-slate-500 !hover:bg-slate-50 !hover:text-slate-900'
            }`}
          >
            <tab.icon className="!w-5 !h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100">
        <div className="!flex !flex-col lg:!flex-row !gap-6 !items-center">
          <div className="!flex !items-center !gap-3 !w-full lg:!w-auto">
            <div className="!w-10 !h-10 !bg-slate-100 !rounded-xl !flex !items-center !justify-center">
              <Calendar className="!w-5 !h-5 !text-slate-500" />
            </div>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                if (e.target.value !== 'custom') setShowCustomDates(false);
              }}
              className="!flex-1 lg:!w-48 !bg-slate-50 !border-none !rounded-2xl !px-4 !py-3 !font-bold !text-slate-700 !focus:ring-2 !focus:ring-emerald-500 !cursor-pointer"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="365d">Último año</option>
              <option value="ytd">Año actual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {period === 'custom' && (
            <div className="!flex !items-center !gap-3 !w-full lg:!w-auto !animate-in !slide-in-from-left-4">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="!flex-1 !bg-slate-50 !border-none !rounded-2xl !px-4 !py-3 !font-bold !text-slate-700 !focus:ring-2 !focus:ring-emerald-500"
              />
              <span className="!text-slate-400 !font-black">/</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="!flex-1 !bg-slate-50 !border-none !rounded-2xl !px-4 !py-3 !font-bold !text-slate-700 !focus:ring-2 !focus:ring-emerald-500"
              />
              <button
                onClick={() => { setShowCustomDates(true); loadReport(); }}
                className="!bg-emerald-600 !text-white !px-6 !py-3 !rounded-2xl !font-bold !hover:bg-emerald-700 !transition-all"
              >
                Aplicar
              </button>
            </div>
          )}

          {(activeTab === 'emissions' || activeTab === 'financial') && (
            <div className="!flex !items-center !gap-3 !w-full lg:!w-auto">
              <div className="!w-10 !h-10 !bg-slate-100 !rounded-xl !flex !items-center !justify-center">
                <Filter className="!w-5 !h-5 !text-slate-500" />
              </div>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="!flex-1 lg:!w-48 !bg-slate-50 !border-none !rounded-2xl !px-4 !py-3 !font-bold !text-slate-700 !focus:ring-2 !focus:ring-emerald-500 !cursor-pointer"
              >
                <option value="time">Por Tiempo</option>
                <option value="company">Por Empresa</option>
                <option value="project">Por Proyecto</option>
                {activeTab === 'emissions' && <option value="type">Por Tipo</option>}
                {activeTab === 'financial' && <option value="source">Por Fuente</option>}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="!space-y-8">
          <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="!h-32 !bg-slate-100 !rounded-3xl !animate-pulse" />
            ))}
          </div>
          <div className="!h-[400px] !bg-slate-100 !rounded-3xl !animate-pulse" />
        </div>
      ) : (
        <div className="!space-y-8">
          {/* KPI Cards */}
          {reportData?.totals && (
            <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
              {activeTab === 'emissions' && (
                <>
                  <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
                    <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-emerald-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
                    <div className="!relative">
                      <div className="!w-12 !h-12 !bg-emerald-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
                        <Leaf className="!w-6 !h-6 !text-emerald-600" />
                      </div>
                      <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Emisiones Totales</p>
                      <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">
                        {formatNumber(reportData.totals.totalEmissionsKg)} <span className="!text-sm !font-medium !text-slate-400">kg</span>
                      </h3>
                    </div>
                  </div>
                  <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
                    <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-blue-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
                    <div className="!relative">
                      <div className="!w-12 !h-12 !bg-blue-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
                        <FileBarChart className="!w-6 !h-6 !text-blue-600" />
                      </div>
                      <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Certificados</p>
                      <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{reportData.totals.totalCertificates}</h3>
                    </div>
                  </div>
                  <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
                    <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-amber-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
                    <div className="!relative">
                      <div className="!w-12 !h-12 !bg-amber-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
                        <DollarSign className="!w-6 !h-6 !text-amber-600" />
                      </div>
                      <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Ingresos</p>
                      <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{formatCurrency(reportData.totals.totalRevenueCLP)}</h3>
                    </div>
                  </div>
                  <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
                    <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-purple-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
                    <div className="!relative">
                      <div className="!w-12 !h-12 !bg-purple-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
                        <TrendingUp className="!w-6 !h-6 !text-purple-600" />
                      </div>
                      <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Impacto</p>
                      <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">High</h3>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'financial' && (
                <>
                  <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
                    <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-emerald-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
                    <div className="!relative">
                      <div className="!w-12 !h-12 !bg-emerald-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
                        <DollarSign className="!w-6 !h-6 !text-emerald-600" />
                      </div>
                      <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Ingresos CLP</p>
                      <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{formatCurrency(reportData.totals.totalRevenueCLP)}</h3>
                    </div>
                  </div>
                  <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
                    <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-blue-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
                    <div className="!relative">
                      <div className="!w-12 !h-12 !bg-blue-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
                        <Globe className="!w-6 !h-6 !text-blue-600" />
                      </div>
                      <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Ingresos USD</p>
                      <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">${formatNumber(reportData.totals.totalRevenueUSD)}</h3>
                    </div>
                  </div>
                  <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
                    <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-purple-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
                    <div className="!relative">
                      <div className="!w-12 !h-12 !bg-purple-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
                        <Activity className="!w-6 !h-6 !text-purple-600" />
                      </div>
                      <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Transacciones</p>
                      <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{reportData.totals.totalTransactions}</h3>
                    </div>
                  </div>
                  <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
                    <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-amber-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
                    <div className="!relative">
                      <div className="!w-12 !h-12 !bg-amber-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
                        <TrendingUp className="!w-6 !h-6 !text-amber-600" />
                      </div>
                      <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Ticket Promedio</p>
                      <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{formatCurrency(reportData.totals.averageTransactionCLP)}</h3>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Charts Section */}
          <div className="!grid !grid-cols-1 lg:!grid-cols-3 !gap-8">
            {/* Main Chart */}
            <div className="lg:!col-span-2 !bg-white !p-8 !rounded-[2.5rem] !shadow-sm !border !border-slate-100">
              <div className="!flex !items-center !justify-between !mb-8">
                <div>
                  <h3 className="!text-xl !font-black !text-slate-900">Tendencia Temporal</h3>
                  <p className="!text-slate-500 !text-sm !font-medium">Visualización de datos por período seleccionado.</p>
                </div>
                <div className="!flex !items-center !gap-2 !bg-slate-50 !p-1 !rounded-xl">
                  <button className="!p-2 !bg-white !shadow-sm !rounded-lg !text-emerald-600"><Activity className="!w-4 !h-4" /></button>
                  <button className="!p-2 !text-slate-400 !hover:text-slate-600"><PieChartIcon className="!w-4 !h-4" /></button>
                </div>
              </div>
              
              <div className="!h-[350px] !w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {groupBy === 'time' ? (
                    <AreaChart data={reportData?.report || []}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          padding: '12px'
                        }}
                        formatter={(value: number, name: string) => [
                          activeTab === 'financial' ? formatCurrency(value) : `${formatNumber(value)} kg`,
                          name === 'emissionsKg' ? 'Emisiones' : 'Ingresos'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey={activeTab === 'emissions' ? 'emissionsKg' : 'revenueCLP'}
                        stroke={activeTab === 'emissions' ? '#10b981' : '#f59e0b'}
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={reportData?.report || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey={groupBy === 'company' ? 'companyName' : 
                                 groupBy === 'project' ? 'projectName' : 
                                 groupBy === 'type' ? 'type' :
                                 groupBy === 'source' ? 'source' : 'name'}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar 
                        dataKey={activeTab === 'emissions' ? 'totalEmissionsKg' : 'revenueCLP'} 
                        fill={activeTab === 'emissions' ? '#10b981' : '#f59e0b'} 
                        radius={[8, 8, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="!bg-white !p-8 !rounded-[2.5rem] !shadow-sm !border !border-slate-100">
              <h3 className="!text-xl !font-black !text-slate-900 !mb-2">Distribución</h3>
              <p className="!text-slate-500 !text-sm !font-medium !mb-8">Reparto porcentual por categoría.</p>
              
              <div className="!h-[300px] !w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData?.report?.slice(0, 5) || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey={activeTab === 'emissions' ? (groupBy === 'time' ? 'emissionsKg' : 'totalEmissionsKg') : 'revenueCLP'}
                    >
                      {(reportData?.report || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="!mt-6 !space-y-3">
                <div className="!flex !items-center !justify-between !p-3 !bg-slate-50 !rounded-2xl">
                  <div className="!flex !items-center !gap-2">
                    <div className="!w-3 !h-3 !bg-emerald-500 !rounded-full" />
                    <span className="!text-sm !font-bold !text-slate-700">Mayor Impacto</span>
                  </div>
                  <span className="!text-sm !font-black !text-slate-900">42%</span>
                </div>
                <div className="!flex !items-center !justify-between !p-3 !bg-slate-50 !rounded-2xl">
                  <div className="!flex !items-center !gap-2">
                    <div className="!w-3 !h-3 !bg-blue-500 !rounded-full" />
                    <span className="!text-sm !font-bold !text-slate-700">Crecimiento</span>
                  </div>
                  <span className="!text-sm !font-black !text-emerald-600">+12.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Data Table */}
          <div className="!bg-white !rounded-[2.5rem] !shadow-sm !border !border-slate-100 !overflow-hidden">
            <div className="!p-8 !border-b !border-slate-100 !flex !items-center !justify-between !bg-slate-50/50">
              <div>
                <h3 className="!text-xl !font-black !text-slate-900">Desglose Detallado</h3>
                <p className="!text-slate-500 !text-sm !font-medium">Listado completo de registros para el período.</p>
              </div>
              <button className="!p-2 !text-slate-400 !hover:text-emerald-600 !transition-colors">
                <ArrowUpRight className="!w-6 !h-6" />
              </button>
            </div>
            
            <div className="!overflow-x-auto">
              <table className="!w-full !text-left !border-collapse">
                <thead>
                  <tr className="!bg-slate-50/30">
                    <th className="!px-8 !py-4 !text-slate-500 !font-bold !text-xs !uppercase !tracking-widest">
                      {groupBy === 'time' ? 'Fecha' : groupBy === 'company' ? 'Empresa' : 'Proyecto'}
                    </th>
                    <th className="!px-8 !py-4 !text-slate-500 !font-bold !text-xs !uppercase !tracking-widest !text-right">
                      {activeTab === 'emissions' ? 'Emisiones (kg)' : 'Ingresos (CLP)'}
                    </th>
                    <th className="!px-8 !py-4 !text-slate-500 !font-bold !text-xs !uppercase !tracking-widest !text-right">
                      {activeTab === 'emissions' ? 'Certificados' : 'Transacciones'}
                    </th>
                    <th className="!px-8 !py-4 !text-slate-500 !font-bold !text-xs !uppercase !tracking-widest !text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="!divide-y !divide-slate-100">
                  {(reportData?.report || []).slice(0, 10).map((item: any, index: number) => (
                    <tr key={index} className="!hover:bg-slate-50/50 !transition-colors">
                      <td className="!px-8 !py-5 !font-bold !text-slate-900">
                        {groupBy === 'time' ? (item.date ? new Date(item.date).toLocaleDateString('es-CL') : '-') : 
                         groupBy === 'company' ? item.companyName : item.projectName}
                      </td>
                      <td className="!px-8 !py-5 !text-right !font-black !text-slate-700">
                        {activeTab === 'emissions' ? 
                          formatNumber(item.emissionsKg || item.totalEmissionsKg || 0) : 
                          formatCurrency(item.revenueCLP || 0)}
                      </td>
                      <td className="!px-8 !py-5 !text-right !font-bold !text-slate-500">
                        {activeTab === 'emissions' ? (item.count || item.certificatesCount || 0) : (item.transactions || 0)}
                      </td>
                      <td className="!px-8 !py-5 !text-right">
                        <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-[10px] !font-black !uppercase !tracking-wider !bg-emerald-100 !text-emerald-700">
                          Completado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="!p-6 !bg-slate-50/50 !border-t !border-slate-100 !text-center">
              <button className="!text-sm !font-bold !text-emerald-600 !hover:text-emerald-700 !transition-colors">
                Ver todos los registros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

