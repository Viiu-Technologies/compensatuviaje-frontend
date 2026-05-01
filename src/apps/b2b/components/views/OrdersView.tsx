import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  TreePine,
  Building2,
  Copy,
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { getMyOrders, getBankDetails, type B2BOrder, type BankDetails } from '../../services/ordersService';

const OrdersView: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<B2BOrder | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [copied, setCopied] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyOrders();
      setOrders(data.orders);
    } catch (err: any) {
      setError('Error al cargar las órdenes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    getBankDetails().then(setBankDetails).catch(() => {});
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendiente', icon: Clock, color: 'yellow', bg: '!bg-yellow-100 !text-yellow-700', dot: '!bg-yellow-500' };
      case 'approved':
        return { label: 'Aprobada', icon: CheckCircle2, color: 'green', bg: '!bg-green-100 !text-green-700', dot: '!bg-green-500' };
      case 'rejected':
        return { label: 'Rechazada', icon: XCircle, color: 'red', bg: '!bg-red-100 !text-red-700', dot: '!bg-red-500' };
      case 'expired':
        return { label: 'Expirada', icon: AlertCircle, color: 'gray', bg: '!bg-gray-100 !text-gray-500', dot: '!bg-gray-400' };
      default:
        return { label: status, icon: Package, color: 'gray', bg: '!bg-gray-100 !text-gray-700', dot: '!bg-gray-500' };
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
    totalCLP: orders.filter(o => o.status === 'approved').reduce((acc, o) => acc + o.amount, 0),
    totalTons: orders.filter(o => o.status === 'approved').reduce((acc, o) => acc + o.tonsTco2, 0)
  };

  if (isLoading) {
    return (
      <div className="!flex !items-center !justify-center !py-20">
        <div className="!text-center">
          <Loader2 className="!w-12 !h-12 !text-green-500 !animate-spin !mx-auto !mb-4" />
          <p className={isDark ? '!text-gray-400' : '!text-gray-500'}>Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col lg:!flex-row !items-start lg:!items-center !justify-between !gap-4">
        <div>
          <h1 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Mis Órdenes</h1>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Historial de órdenes de compensación por transferencia</p>
        </div>
        <button
          onClick={loadOrders}
          className={`!flex !items-center !gap-2 !px-4 !py-2.5 !rounded-xl !font-medium !text-sm !border-0 !transition-all ${
            isDark ? '!bg-gray-700 !text-gray-300 hover:!bg-gray-600' : '!bg-white !text-gray-700 !border !border-gray-200 hover:!bg-gray-50'
          }`}
        >
          <RefreshCw className="!w-4 !h-4" /> Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="!grid sm:!grid-cols-4 !gap-4">
        {[
          { label: 'Total Órdenes', value: stats.total, icon: Package, gradient: 'from-blue-500 to-indigo-600' },
          { label: 'Pendientes', value: stats.pending, icon: Clock, gradient: 'from-yellow-500 to-orange-500' },
          { label: 'Aprobadas', value: stats.approved, icon: CheckCircle2, gradient: 'from-green-500 to-emerald-600' },
          { label: 'Tons Compensadas', value: `${stats.totalTons.toFixed(1)}t`, icon: TreePine, gradient: 'from-teal-500 to-cyan-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`!rounded-2xl !p-4 !border ${isDark ? '!bg-gray-800/50 !border-gray-700' : '!bg-white !border-gray-200'}`}
          >
            <div className="!flex !items-center !gap-3">
              <div className={`!w-10 !h-10 !rounded-xl !bg-gradient-to-br !${stat.gradient} !flex !items-center !justify-center`}>
                <stat.icon className="!w-5 !h-5 !text-white" />
              </div>
              <div>
                <p className={`!text-xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{stat.value}</p>
                <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {error && (
        <div className="!flex !items-center !gap-2 !p-4 !rounded-xl !bg-red-50 !text-red-700">
          <AlertCircle className="!w-5 !h-5" /> {error}
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="!text-center !py-16">
          <Package className={`!w-16 !h-16 !mx-auto !mb-4 ${isDark ? '!text-gray-600' : '!text-gray-300'}`} />
          <h3 className={`!text-lg !font-semibold ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Sin órdenes</h3>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-500' : '!text-gray-500'}`}>Visita Proyectos para crear tu primera orden de compensación</p>
        </div>
      ) : (
        <div className="!space-y-3">
          {orders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            const isSelected = selectedOrder?.id === order.id;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  onClick={() => setSelectedOrder(isSelected ? null : order)}
                  className={`!rounded-2xl !border !p-5 !cursor-pointer !transition-all hover:!shadow-md ${
                    isSelected
                      ? isDark ? '!bg-gray-800 !border-green-600 !shadow-lg' : '!bg-green-50/50 !border-green-300 !shadow-lg'
                      : isDark ? '!bg-gray-800/50 !border-gray-700 hover:!border-gray-600' : '!bg-white !border-gray-200 hover:!border-gray-300'
                  }`}
                >
                  <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-3">
                    <div className="!flex !items-center !gap-4 !flex-1">
                      <div className={`!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-green-500 !to-emerald-600 !flex !items-center !justify-center !flex-shrink-0`}>
                        <TreePine className="!w-6 !h-6 !text-white" />
                      </div>
                      <div className="!flex-1 !min-w-0">
                        <p className={`!font-semibold !truncate ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
                          {order.project?.name || 'Proyecto desconocido'}
                        </p>
                        <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                          {order.tonsTco2} tCO₂ &bull; {new Date(order.createdAt).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>

                    <div className="!flex !items-center !gap-4">
                      <p className={`!text-lg !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
                        ${order.amount.toLocaleString('es-CL')} CLP
                      </p>
                      <span className={`!px-3 !py-1.5 !rounded-full !text-xs !font-semibold !flex !items-center !gap-1.5 ${statusConfig.bg}`}>
                        <span className={`!w-2 !h-2 !rounded-full ${statusConfig.dot}`}></span>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`!mt-4 !pt-4 !border-t !space-y-4 ${isDark ? '!border-gray-700' : '!border-gray-200'}`}
                    >
                      <div className="!grid sm:!grid-cols-3 !gap-4 !text-sm">
                        <div>
                          <p className={isDark ? '!text-gray-400' : '!text-gray-500'}>ID Orden</p>
                          <p className={`!font-medium !flex !items-center !gap-1 ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>
                            {order.id.slice(0, 12)}...
                            <button onClick={(e) => { e.stopPropagation(); copyToClipboard(order.id); }} className="!border-0 !bg-transparent !p-0.5">
                              {copied ? <CheckCircle2 className="!w-3.5 !h-3.5 !text-green-500" /> : <Copy className="!w-3.5 !h-3.5 !text-gray-400" />}
                            </button>
                          </p>
                        </div>
                        <div>
                          <p className={isDark ? '!text-gray-400' : '!text-gray-500'}>Proyecto</p>
                          <p className={`!font-medium ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>
                            {order.project?.name}
                          </p>
                        </div>
                        <div>
                          <p className={isDark ? '!text-gray-400' : '!text-gray-500'}>Fecha</p>
                          <p className={`!font-medium ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>
                            {new Date(order.createdAt).toLocaleString('es-CL')}
                          </p>
                        </div>
                      </div>

                      {/* Bank details for pending orders */}
                      {order.status === 'pending' && bankDetails && (
                        <div className={`!rounded-xl !p-4 !space-y-2 ${isDark ? '!bg-yellow-900/20 !border !border-yellow-700/30' : '!bg-yellow-50 !border !border-yellow-200'}`}>
                          <p className={`!text-sm !font-semibold ${isDark ? '!text-yellow-400' : '!text-yellow-800'}`}>
                            Datos para transferencia bancaria
                          </p>
                          <div className="!grid sm:!grid-cols-2 !gap-2 !text-sm">
                            {[
                              { l: 'Banco', v: bankDetails.bankName },
                              { l: 'Tipo', v: bankDetails.accountType },
                              { l: 'N° Cuenta', v: bankDetails.accountNumber },
                              { l: 'Titular', v: bankDetails.accountHolder },
                              { l: 'RUT', v: bankDetails.rut },
                              { l: 'Email', v: bankDetails.email },
                            ].filter(i => i.v).map((item, i) => (
                              <div key={i} className="!flex !justify-between">
                                <span className={isDark ? '!text-gray-400' : '!text-gray-500'}>{item.l}:</span>
                                <span className={`!font-medium ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>{item.v}</span>
                              </div>
                            ))}
                          </div>
                          <p className={`!text-xs !mt-2 ${isDark ? '!text-yellow-400/80' : '!text-yellow-700'}`}>
                            Monto: <strong>${order.amount.toLocaleString('es-CL')} CLP</strong> &bull; Referencia: Orden {order.id.slice(0, 8)}
                          </p>
                        </div>
                      )}

                      {order.status === 'approved' && (
                        <div className={`!rounded-xl !p-4 !text-center ${isDark ? '!bg-green-900/20 !border !border-green-700/30' : '!bg-green-50 !border !border-green-200'}`}>
                          <CheckCircle2 className="!w-8 !h-8 !text-green-500 !mx-auto !mb-2" />
                          <p className={`!text-sm !font-medium ${isDark ? '!text-green-400' : '!text-green-700'}`}>
                            Transferencia verificada. Certificado emitido.
                          </p>
                          {order.invoicePdfUrl && (
                            <a
                              href={order.invoicePdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`!inline-flex !items-center !gap-2 !mt-3 !px-4 !py-2 !rounded-xl !text-sm !font-semibold !transition-all !no-underline ${
                                isDark
                                  ? '!bg-green-700/40 !text-green-300 hover:!bg-green-700/60'
                                  : '!bg-green-600 !text-white hover:!bg-green-700'
                              }`}
                            >
                              <Download className="!w-4 !h-4" /> Descargar Factura
                            </a>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersView;
