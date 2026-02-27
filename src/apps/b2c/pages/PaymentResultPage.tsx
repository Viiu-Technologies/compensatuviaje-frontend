import React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaCertificate, FaPlane, FaArrowLeft } from 'react-icons/fa';

/**
 * Página de resultado de pago Webpay
 * 
 * El backend redirige aquí después de confirmar con Transbank:
 * - /b2c/payment-result?status=success&certificate=CERT-XXX&amount=1902&tons=0.12
 * - /b2c/payment-result?status=rejected&reason=code_-1
 * - /b2c/payment-result?status=cancelled
 * - /b2c/payment-result?status=error&reason=...
 */
const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status') || 'error';
  const certificate = searchParams.get('certificate');
  const amount = searchParams.get('amount');
  const tons = searchParams.get('tons');
  const reason = searchParams.get('reason');
  const code = searchParams.get('code');
  const order = searchParams.get('order');

  // Detectar si estamos en entorno de desarrollo (sandbox)
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // ============================================
  // PAGO EXITOSO
  // ============================================
  if (status === 'success') {
    return (
      <div className="!min-h-screen !bg-gradient-to-b !from-gray-50 !to-white !flex !items-center !justify-center !p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="!max-w-lg !w-full"
        >
          <div className="!bg-white !rounded-3xl !shadow-2xl !shadow-gray-200/50 !border !border-emerald-100 !overflow-hidden">
            {/* Header verde */}
            <div className="!bg-gradient-to-br !from-emerald-500 !via-emerald-600 !to-teal-600 !p-10 !text-center !text-white !relative !overflow-hidden">
              <div className="!absolute !top-0 !right-0 !w-40 !h-40 !bg-white/10 !rounded-full !blur-3xl"></div>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="!w-24 !h-24 !mx-auto !mb-5 !rounded-full !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center !shadow-xl"
              >
                <FaCheckCircle className="!text-5xl" />
              </motion.div>
              <h3 className="!text-3xl !font-bold !mb-2 !m-0">¡Pago Exitoso! 🎉</h3>
              <p className="!text-emerald-100 !text-lg !m-0">Tu compensación fue procesada con éxito</p>
            </div>

            {/* Detalles */}
            <div className="!p-8">
              {/* CO2 */}
              {tons && (
                <div className="!bg-gradient-to-br !from-emerald-50 !to-teal-50 !rounded-2xl !p-6 !mb-6 !text-center !border !border-emerald-100">
                  <div className="!text-sm !text-emerald-600 !font-semibold !mb-1">CO₂ Compensado</div>
                  <div className="!text-4xl !font-bold !text-emerald-700">
                    {Number(tons) < 1
                      ? `${(Number(tons) * 1000).toFixed(0)} kg`
                      : `${Number(tons).toFixed(2)} toneladas`
                    }
                  </div>
                </div>
              )}

              {/* Certificado */}
              {certificate && (
                <div className="!bg-gray-50 !rounded-2xl !p-5 !mb-4">
                  <div className="!flex !items-center !gap-4">
                    <div className="!w-16 !h-16 !rounded-xl !bg-emerald-100 !flex !items-center !justify-center">
                      <FaCertificate className="!text-emerald-600 !text-3xl" />
                    </div>
                    <div>
                      <div className="!text-xs !text-gray-500 !mb-1 !font-medium">Tu Certificado</div>
                      <div className="!font-mono !text-xl !text-gray-800 !font-bold">{certificate}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Monto */}
              {amount && (
                <div className="!bg-gray-50 !rounded-2xl !p-5 !mb-6">
                  <div className="!flex !items-center !justify-between">
                    <span className="!text-gray-500 !font-medium">Monto pagado</span>
                    <span className="!text-2xl !font-bold !text-gray-800">
                      ${Number(amount).toLocaleString()} <span className="!text-sm !text-gray-500 !font-normal">CLP</span>
                    </span>
                  </div>
                  <div className="!flex !items-center !justify-between !mt-2">
                    <span className="!text-gray-400 !text-sm">Método de pago</span>
                    <span className="!text-sm !text-gray-600 !font-medium">Webpay (Transbank)</span>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="!space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/b2c/certificates')}
                  className="!w-full !py-4 !bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !rounded-xl !font-bold !transition !border-0 !flex !items-center !justify-center !gap-2 !shadow-xl !shadow-emerald-500/30 hover:!shadow-2xl !cursor-pointer"
                >
                  <FaCertificate />
                  Ver Mis Certificados
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/b2c/calculator')}
                  className="!w-full !py-4 !bg-emerald-50 !text-emerald-700 !rounded-xl !font-semibold !transition !border-2 !border-emerald-200 !flex !items-center !justify-center !gap-2 !cursor-pointer hover:!bg-emerald-100"
                >
                  <FaPlane />
                  Calcular Otro Vuelo
                </motion.button>
                <Link
                  to="/b2c/dashboard"
                  className="!block !w-full !py-4 !bg-gray-100 !text-gray-700 !rounded-xl !font-semibold !transition !text-center hover:!bg-gray-200 !no-underline"
                >
                  <FaArrowLeft className="!inline !mr-2" />
                  Ir al Dashboard
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // PAGO CANCELADO
  // ============================================
  if (status === 'cancelled') {
    return (
      <div className="!min-h-screen !bg-gradient-to-b !from-gray-50 !to-white !flex !items-center !justify-center !p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="!max-w-md !w-full"
        >
          <div className="!bg-white !rounded-3xl !shadow-xl !border !border-yellow-100 !overflow-hidden">
            <div className="!bg-gradient-to-br !from-yellow-400 !via-amber-500 !to-orange-500 !p-10 !text-center !text-white !relative !overflow-hidden">
              <div className="!absolute !top-0 !right-0 !w-40 !h-40 !bg-white/10 !rounded-full !blur-3xl"></div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="!w-20 !h-20 !mx-auto !mb-4 !rounded-full !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center"
              >
                <FaExclamationTriangle className="!text-4xl" />
              </motion.div>
              <h3 className="!text-2xl !font-bold !mb-2 !m-0">Pago Cancelado</h3>
              <p className="!text-yellow-100 !m-0">El pago fue cancelado antes de completarse</p>
            </div>
            <div className="!p-8">
              <p className="!text-gray-600 !text-center !mb-6">
                No se realizó ningún cargo a tu tarjeta. Puedes intentar nuevamente cuando lo desees.
              </p>
              <div className="!space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/b2c/calculator')}
                  className="!w-full !py-4 !bg-gradient-to-r !from-amber-500 !to-orange-500 !text-white !rounded-xl !font-bold !transition !border-0 !flex !items-center !justify-center !gap-2 !cursor-pointer"
                >
                  <FaPlane />
                  Volver a la Calculadora
                </motion.button>
                <Link
                  to="/b2c/dashboard"
                  className="!block !w-full !py-4 !bg-gray-100 !text-gray-700 !rounded-xl !font-semibold !transition !text-center hover:!bg-gray-200 !no-underline"
                >
                  Ir al Dashboard
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // PAGO RECHAZADO
  // ============================================
  if (status === 'rejected') {
    return (
      <div className="!min-h-screen !bg-gradient-to-b !from-gray-50 !to-white !flex !items-center !justify-center !p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="!max-w-md !w-full"
        >
          <div className="!bg-white !rounded-3xl !shadow-xl !border !border-red-100 !overflow-hidden">
            <div className="!bg-gradient-to-br !from-red-500 !via-red-600 !to-rose-600 !p-10 !text-center !text-white !relative !overflow-hidden">
              <div className="!absolute !top-0 !right-0 !w-40 !h-40 !bg-white/10 !rounded-full !blur-3xl"></div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="!w-20 !h-20 !mx-auto !mb-4 !rounded-full !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center"
              >
                <FaTimesCircle className="!text-4xl" />
              </motion.div>
              <h3 className="!text-2xl !font-bold !mb-2 !m-0">Pago Rechazado</h3>
              <p className="!text-red-200 !m-0">La transacción no fue aprobada</p>
            </div>
            <div className="!p-8">
              <p className="!text-gray-600 !text-center !mb-4">
                Tu banco o tarjeta rechazó la transacción. Verifica que tengas fondos suficientes o intenta con otra tarjeta.
              </p>
              {(code || reason) && (
                <div className="!bg-red-50 !rounded-xl !p-4 !mb-4 !text-center">
                  <span className="!text-xs !text-red-400 !font-mono">Código: {code || reason}</span>
                </div>
              )}

              {/* Instrucciones sandbox en desarrollo */}
              {isDev && (
                <div className="!bg-blue-50 !border !border-blue-200 !rounded-xl !p-4 !mb-4">
                  <p className="!text-blue-800 !font-semibold !text-sm !mb-2 !m-0">🧪 Modo Sandbox — Instrucciones de prueba:</p>
                  <ol className="!text-blue-700 !text-xs !space-y-1 !pl-4 !m-0">
                    <li>Tarjeta: <span className="!font-mono">4051 8842 3993 7852</span></li>
                    <li>CVV: <span className="!font-mono">123</span> — Exp: cualquier fecha futura</li>
                    <li>En la página del banco simulado, hacer clic en <strong>"Aceptar"</strong></li>
                    <li>RUT: <span className="!font-mono">11.111.111-1</span></li>
                    <li>Clave: <span className="!font-mono">123</span></li>
                    <li>Aceptar nuevamente para confirmar</li>
                  </ol>
                </div>
              )}

              <div className="!space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/b2c/calculator')}
                  className="!w-full !py-4 !bg-gradient-to-r !from-red-500 !to-rose-600 !text-white !rounded-xl !font-bold !transition !border-0 !flex !items-center !justify-center !gap-2 !cursor-pointer"
                >
                  Intentar Nuevamente
                </motion.button>
                <Link
                  to="/b2c/dashboard"
                  className="!block !w-full !py-4 !bg-gray-100 !text-gray-700 !rounded-xl !font-semibold !transition !text-center hover:!bg-gray-200 !no-underline"
                >
                  Ir al Dashboard
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // ERROR GENÉRICO
  // ============================================
  return (
    <div className="!min-h-screen !bg-gradient-to-b !from-gray-50 !to-white !flex !items-center !justify-center !p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="!max-w-md !w-full"
      >
        <div className="!bg-white !rounded-3xl !shadow-xl !border !border-gray-200 !overflow-hidden">
          <div className="!bg-gradient-to-br !from-gray-600 !to-gray-800 !p-10 !text-center !text-white">
            <div className="!w-20 !h-20 !mx-auto !mb-4 !rounded-full !bg-white/20 !flex !items-center !justify-center">
              <FaExclamationTriangle className="!text-4xl" />
            </div>
            <h3 className="!text-2xl !font-bold !mb-2 !m-0">Error en el Pago</h3>
            <p className="!text-gray-300 !m-0">Ocurrió un problema inesperado</p>
          </div>
          <div className="!p-8">
            <p className="!text-gray-600 !text-center !mb-4">
              No pudimos procesar tu pago. Por favor intenta nuevamente. Si el problema persiste, contáctanos.
            </p>
            {reason && (
              <div className="!bg-gray-50 !rounded-xl !p-4 !mb-4 !text-center">
                <span className="!text-xs !text-gray-400 !font-mono">{decodeURIComponent(reason)}</span>
              </div>
            )}

            {/* Instrucciones sandbox en desarrollo */}
            {isDev && (
              <div className="!bg-blue-50 !border !border-blue-200 !rounded-xl !p-4 !mb-4">
                <p className="!text-blue-800 !font-semibold !text-sm !mb-2 !m-0">🧪 Modo Sandbox — Instrucciones de prueba:</p>
                <ol className="!text-blue-700 !text-xs !space-y-1 !pl-4 !m-0">
                  <li>Tarjeta: <span className="!font-mono">4051 8842 3993 7852</span></li>
                  <li>CVV: <span className="!font-mono">123</span> — Exp: cualquier fecha futura</li>
                  <li>En la página del banco, clic en <strong>"Aceptar"</strong></li>
                  <li>RUT: <span className="!font-mono">11.111.111-1</span> — Clave: <span className="!font-mono">123</span></li>
                </ol>
              </div>
            )}

            <div className="!space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/b2c/calculator')}
                className="!w-full !py-4 !bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !rounded-xl !font-bold !transition !border-0 !flex !items-center !justify-center !gap-2 !cursor-pointer"
              >
                <FaPlane />
                Volver a la Calculadora
              </motion.button>
              <Link
                to="/b2c/dashboard"
                className="!block !w-full !py-4 !bg-gray-100 !text-gray-700 !rounded-xl !font-semibold !transition !text-center hover:!bg-gray-200 !no-underline"
              >
                Ir al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentResultPage;
