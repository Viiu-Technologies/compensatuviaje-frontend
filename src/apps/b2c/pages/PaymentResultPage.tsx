import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaCertificate, FaPlane } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { useForceLightTheme } from '../../../shared/utils/useForceLightTheme';
import { useTailwindSpacing } from '../../../shared/utils/useTailwindSpacing';
import { btn, cx, fmtCLP, fmtKgAuto } from '../ui';

/**
 * Resultado del pago en Webpay. El backend redirige aquí después de
 * confirmar con Transbank:
 * - /b2c/payment-result?status=success&certificate=CERT-XXX&amount=1902&tons=0.12
 * - /b2c/payment-result?status=rejected&reason=code_-1
 * - /b2c/payment-result?status=cancelled
 * - /b2c/payment-result?status=error&reason=...
 *
 * Los cuatro estados comparten una misma tarjeta; antes cada uno tenía su
 * encabezado en degradado de otro color (verde, ámbar, rojo, gris).
 */

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

const TONE: Record<Tone, string> = {
  success: 'bg-brand-50 text-brand-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  neutral: 'bg-gray-100 text-gray-600',
};

const ResultCard: React.FC<{ icon: IconType; tone: Tone; title: string; text: string; children?: React.ReactNode }> = ({
  icon: Icon,
  tone,
  title,
  text,
  children,
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8">
      <Link to="/b2c/dashboard" className="block mb-6 w-fit">
        <img src="/images/brand/logo-horizontal-clean.svg" alt="CompensaTuViaje" className="h-7 w-auto" />
      </Link>
      <span className={cx('w-12 h-12 rounded-full flex items-center justify-center', TONE[tone])}>
        <Icon className="text-2xl" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900 m-0">{title}</h1>
      <p className="mt-2 text-gray-600 m-0">{text}</p>
      {children}
    </div>
  </div>
);

/** Instrucciones del ambiente de pruebas de Transbank; solo en localhost. */
const SandboxHelp: React.FC = () => (
  <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
    <p className="m-0 font-semibold">Ambiente de pruebas (solo en localhost)</p>
    <ol className="mt-2 mb-0 pl-5 space-y-0.5">
      <li>Tarjeta <span className="font-mono">4051 8842 3993 7852</span>, CVV <span className="font-mono">123</span>, cualquier fecha futura</li>
      <li>En el banco simulado: RUT <span className="font-mono">11.111.111-1</span>, clave <span className="font-mono">123</span></li>
      <li>Aceptar en ambas pantallas</li>
    </ol>
  </div>
);

const PaymentResultPage: React.FC = () => {
  useTailwindSpacing();
  useForceLightTheme();
  const [searchParams] = useSearchParams();

  const status = searchParams.get('status') || 'error';
  const certificate = searchParams.get('certificate');
  const amount = searchParams.get('amount');
  const tons = searchParams.get('tons');
  const reason = searchParams.get('reason');
  const code = searchParams.get('code');

  // Datos del vuelo para reintentar (vienen del backend en rejected/cancelled)
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const retryUrl = (() => {
    const params = new URLSearchParams();
    for (const key of ['origin', 'destination', 'cabin', 'passengers', 'roundTrip', 'calculationId']) {
      const v = searchParams.get(key);
      if (v) params.set(key, v);
    }
    const qs = params.toString();
    return `/b2c/calculator${qs ? `?${qs}` : ''}`;
  })();
  const retryLabel = origin && destination ? `Reintentar ${origin} → ${destination}` : 'Volver a la calculadora';

  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const secondaryActions = (
    <Link to="/b2c/dashboard" className={cx(btn.secondary, 'w-full')}>Ir a mi resumen</Link>
  );

  if (status === 'success') {
    return (
      <ResultCard icon={FaCheckCircle} tone="success" title="Pago confirmado" text="Tu compensación quedó registrada y tu certificado ya está disponible.">
        <dl className="mt-6 rounded-xl border border-gray-200 divide-y divide-gray-100 m-0">
          {tons && (
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-gray-500">CO₂e compensado</dt>
              <dd className="m-0 font-semibold text-gray-900">{fmtKgAuto(Number(tons) * 1000)}</dd>
            </div>
          )}
          {amount && (
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-gray-500">Monto pagado</dt>
              <dd className="m-0 font-semibold text-gray-900">{fmtCLP(Number(amount))} <span className="font-normal text-gray-500">· Webpay</span></dd>
            </div>
          )}
          {certificate && (
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-gray-500">Certificado</dt>
              <dd className="m-0 font-mono font-semibold text-gray-900">{certificate}</dd>
            </div>
          )}
        </dl>
        <div className="mt-6 space-y-3">
          <Link to="/b2c/certificates" className={cx(btn.primary, 'w-full')}>
            <FaCertificate aria-hidden="true" /> Ver mi certificado
          </Link>
          <Link to="/b2c/calculator" className={cx(btn.secondary, 'w-full')}>
            <FaPlane aria-hidden="true" /> Calcular otro vuelo
          </Link>
        </div>
      </ResultCard>
    );
  }

  if (status === 'cancelled') {
    return (
      <ResultCard icon={FaExclamationTriangle} tone="warning" title="Pago cancelado" text="Cancelaste el pago antes de completarlo. No se hizo ningún cargo a tu tarjeta.">
        <div className="mt-6 space-y-3">
          <Link to={retryUrl} className={cx(btn.primary, 'w-full')}>{retryLabel}</Link>
          {secondaryActions}
        </div>
      </ResultCard>
    );
  }

  if (status === 'rejected') {
    return (
      <ResultCard icon={FaTimesCircle} tone="danger" title="Pago rechazado" text="Tu banco rechazó la transacción. Revisa que tengas saldo disponible o prueba con otra tarjeta.">
        {(code || reason) && <p className="mt-3 mb-0 text-xs text-gray-500 font-mono">Código: {code || reason}</p>}
        {isDev && <SandboxHelp />}
        <div className="mt-6 space-y-3">
          <Link to={retryUrl} className={cx(btn.primary, 'w-full')}>{retryLabel}</Link>
          {secondaryActions}
        </div>
      </ResultCard>
    );
  }

  return (
    <ResultCard icon={FaExclamationTriangle} tone="neutral" title="No pudimos procesar el pago" text="Vuelve a intentarlo. Si el problema sigue, escríbenos y lo revisamos.">
      {reason && <p className="mt-3 mb-0 text-xs text-gray-500 font-mono break-all">{decodeURIComponent(reason)}</p>}
      {isDev && <SandboxHelp />}
      <div className="mt-6 space-y-3">
        <Link to={retryUrl} className={cx(btn.primary, 'w-full')}><FaPlane aria-hidden="true" /> {retryLabel}</Link>
        {secondaryActions}
      </div>
    </ResultCard>
  );
};

export default PaymentResultPage;
