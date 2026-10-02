import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, Leaf, Plane, RotateCcw } from 'lucide-react';
import { FlightStep } from '../CarbonCalculator/Steps/FlightStep';
import type { FormData } from '../CarbonCalculator/types';
import calculatorService, { CABIN_LABELS, type CabinClass, type CalculationResponse } from '../../services/calculatorService';
import { btn, Card, CardHeader, cx, fmtCLP, fmtInt, fmtKgAuto, fmtNum, PageHeader } from '../../ui';

/**
 * Calculadora de CO₂ de un vuelo.
 *
 * Antes tenía tres pasos y el último era un pago simulado: esperaba dos
 * segundos, mostraba "pagado" y un número de certificado al azar, sin cobrar
 * ni crear nada (y si no había cálculo, usaba $12.500 y 400 kg inventados).
 * Ahora calcula con el backend y la compensación se hace con una orden real
 * desde Proyectos.
 */
const CalculatorView: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { origin: '', destination: '', aircraftType: 'economy', passengers: 1, roundTrip: false, projectType: '', email: '' },
  });

  const calculate = async () => {
    const data = watch();
    setError(null);
    if (!data.origin || !data.destination) return setError('Elige el origen y el destino del vuelo.');
    setCalculating(true);
    try {
      const r = await calculatorService.calculateEmissions({
        origin: data.origin,
        destination: data.destination,
        cabinCode: data.aircraftType as CabinClass,
        passengers: data.passengers || 1,
        roundTrip: data.roundTrip || false,
      });
      if (r.status !== 'success') throw new Error(r.message || 'No pudimos calcular las emisiones.');
      setResult(r);
    } catch (err: any) {
      setError(err?.message || 'No pudimos conectar con el servidor.');
    } finally {
      setCalculating(false);
    }
  };

  const startOver = () => {
    reset();
    setResult(null);
    setError(null);
  };

  const route = result?.meta?.route;
  const from = route?.origin ? `${route.origin.city} (${route.origin.code})` : watch('origin');
  const to = route?.destination ? `${route.destination.city} (${route.destination.code})` : watch('destination');

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Calculadora de CO₂" subtitle="Calcula las emisiones de un vuelo con factores DEFRA / GHG Protocol." />

      {!result ? (
        <Card className="p-6 sm:p-8">
          <div aria-busy={calculating}>
            <FlightStep register={register} setValue={setValue} watch={watch} errors={errors} onNext={calculate} />
          </div>
          {calculating && <p className="m-0 mt-4 text-center text-sm text-gray-500">Calculando…</p>}
          {error && (
            <p role="alert" className="m-0 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </p>
          )}
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Emisiones del vuelo"
            icon={Plane}
            subtitle={
              <>
                {from} → {to} · {CABIN_LABELS[(watch('aircraftType') as CabinClass) || 'economy'] ?? 'Económica'} · {fmtInt(result.emissions.passengers)}{' '}
                {result.emissions.passengers === 1 ? 'pasajero' : 'pasajeros'}
                {result.meta?.tripType === 'round_trip' ? ' · ida y vuelta' : ' · solo ida'}
              </>
            }
          />
          <dl className="m-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 p-4">
              <dt className="text-sm text-gray-500">CO₂ emitido</dt>
              <dd className="m-0 mt-1 text-3xl font-bold text-gray-900 tabular-nums">{fmtKgAuto(result.emissions.kgCO2e)}</dd>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <dt className="text-sm text-gray-500">Distancia</dt>
              <dd className="m-0 mt-1 text-3xl font-bold text-gray-900 tabular-nums">
                {fmtInt(result.meta?.distanceKmTotal)} <span className="text-base font-medium text-gray-500">km</span>
              </dd>
            </div>
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
              <dt className="text-sm text-brand-800">Compensarlo cuesta aprox.</dt>
              <dd className="m-0 mt-1 text-3xl font-bold text-brand-800 tabular-nums">{fmtCLP(result.pricing?.totalPriceCLP)}</dd>
              {result.pricing?.pricePerTonCLP > 0 && <p className="m-0 mt-1 text-xs text-brand-800">{fmtCLP(result.pricing.pricePerTonCLP)} por tonelada</p>}
            </div>
          </dl>

          {result.equivalencies?.trees > 0 && (
            <p className="m-0 mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Leaf className="w-4 h-4 text-brand-700" aria-hidden="true" />
              Equivale a lo que capturan unos {fmtInt(result.equivalencies.trees)} árboles en un año.
            </p>
          )}

          <p className="m-0 mt-5 text-sm text-gray-600">
            El precio final depende del proyecto que elijas. Para compensar estas {fmtNum(result.emissions.tonCO2e, 2)} t, genera una orden en Proyectos.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {onNavigate && (
              <button type="button" className={btn.primary} onClick={() => onNavigate('proyectos')}>
                Elegir proyecto y compensar
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <button type="button" className={btn.secondary} onClick={startOver}>
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Calcular otro vuelo
            </button>
            {onNavigate && (
              <button type="button" className={cx(btn.ghost)} onClick={() => onNavigate('manifiestos')}>
                ¿Muchos vuelos? Sube un manifiesto
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CalculatorView;
