import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCar, FaInfoCircle, FaLayerGroup, FaLeaf, FaMinus, FaPlus, FaSpinner } from 'react-icons/fa';
import B2CLayout from './B2CLayout';
import CalculatorModeSwitch from './CalculatorModeSwitch';
import { createManualGroundTrip, getGroundEmissionFactors, type GroundFactorMode, type ManualGroundTrip } from '../services/b2cApi';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import { tripModeIcon, tripModeLabel } from '../utils/tripMode';
import { cx, fmtCLP, fmtInt, fmtNum } from '../ui';
import './B2CCalculator.css';

/**
 * Registrar a mano un viaje terrestre desde la web (Orden 9). Hasta ahora
 * solo la app móvil los registraba por GPS. Usa el mismo endpoint que la app
 * (POST /b2c/ground-trips con el viaje ya cerrado) y los mismos factores
 * (GET /public/emission-factors/ground), así la huella coincide en ambos.
 */

/** Caminata o bici no emiten: no tiene sentido registrarlas para compensar. */
const PAYABLE_MODES = ['car', 'motorcycle', 'bus', 'rail', 'taxi'];
/** Arica–Punta Arenas por carretera son ~5.000 km: más que eso es un error de tipeo. */
const MAX_KM = 5000;
/** Mínimo de Webpay; lo mismo valida el backend al crear el pago. */
const WEBPAY_MIN_CLP = 50;

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const GroundTripCalculator: React.FC = () => {
  const navigate = useNavigate();
  const ids = { km: useId(), kmHint: useId(), subtype: useId(), date: useId() };
  const kmRef = useRef<HTMLInputElement>(null);

  const [modes, setModes] = useState<GroundFactorMode[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [source, setSource] = useState('');
  const [mode, setMode] = useState('car');
  const [subtype, setSubtype] = useState('');
  const [km, setKm] = useState('');
  const [roundTrip, setRoundTrip] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState(todayLocal);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<ManualGroundTrip | null>(null);

  useEffect(() => {
    getGroundEmissionFactors()
      .then((catalog) => {
        setModes(catalog.modes.filter((m) => PAYABLE_MODES.includes(m.mode)));
        setSource(catalog.source || '');
      })
      .catch((err) => setCatalogError(getErrorMessage(err, 'No pudimos cargar los factores de emisión.')));
  }, []);

  const current = modes.find((m) => m.mode === mode);
  // Al cambiar de medio se vuelve al subtipo por defecto de ese medio.
  useEffect(() => {
    if (current) setSubtype(current.defaultSubtype);
  }, [current]);

  const kmNumber = Number(km.replace(',', '.'));
  const totalKm = Number.isFinite(kmNumber) && kmNumber > 0 ? kmNumber * (roundTrip ? 2 : 1) : 0;
  const factor = current?.subtypes.find((s) => s.code === subtype) ?? current?.subtypes[0];
  const sharesCar = Boolean(current?.divideByPassengers);
  // Misma fórmula que calculateGroundEmissionsKg del backend; la cifra final la da el servidor.
  const estimateKg = useMemo(() => {
    if (!factor || totalKm <= 0) return 0;
    return totalKm * factor.kgCo2PerKm / (sharesCar ? passengers : 1);
  }, [factor, totalKm, sharesCar, passengers]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    const input = kmRef.current;
    if (input) {
      input.setCustomValidity(
        !(kmNumber > 0) ? 'Escribe la distancia en kilómetros, por ejemplo 12,5.'
          : kmNumber * (roundTrip ? 2 : 1) > MAX_KM ? `Un viaje terrestre no puede superar ${fmtInt(MAX_KM)} km.` : '',
      );
      if (!input.reportValidity()) return;
    }
    setSaving(true);
    setError(null);
    try {
      const trip = await createManualGroundTrip({
        mode,
        vehicleSubtype: factor?.code,
        passengers: sharesCar ? passengers : 1,
        distanceKm: totalKm,
        date,
      });
      setSaved(trip);
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos guardar el viaje. Vuelve a intentarlo.'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSaved(null);
    setKm('');
    setRoundTrip(false);
    setError(null);
  };

  const layout = (content: React.ReactNode) => (
    <B2CLayout title="Calcular CO₂" subtitle="Registra un trayecto en auto, bus, metro o taxi y compénsalo">
      {content}
    </B2CLayout>
  );

  if (saved) {
    const price = saved.compensation?.estimatedPriceCLP ?? 0;
    const belowMinimum = price < WEBPAY_MIN_CLP;
    const Icon = tripModeIcon(saved.mode);
    return layout(
      <div className="b2cc-result">
        <div className="b2cc-card">
          <div className="b2cc-result-route">
            <div className="b2cc-result-airports">
              <span className="b2cc-card-icon" aria-hidden="true"><Icon /></span>
              <div>
                <div className="b2cc-result-code">{tripModeLabel(saved.mode)}</div>
                <div className="b2cc-result-city">Guardado en Mis viajes</div>
              </div>
            </div>
            <div className="b2cc-result-meta">
              <div>{fmtNum(saved.distanceKm, 1)} km</div>
              {saved.passengers > 1 && <div>{fmtInt(saved.passengers)} personas</div>}
            </div>
          </div>

          <div className="b2cc-impact-panel" role="status">
            <div className="b2cc-impact-caption">Huella de este trayecto</div>
            <div className="b2cc-impact-number">
              {fmtNum(saved.co2Kg, saved.co2Kg < 10 ? 2 : 0)} <span>kg CO₂e</span>
            </div>
            {price > 0 && <div className="b2cc-impact-tons">Compensarlo cuesta cerca de {fmtCLP(price)}</div>}
          </div>

          {belowMinimum ? (
            <div className="b2cc-error" role="note">
              <FaInfoCircle className="b2cc-error-icon" aria-hidden="true" />
              <span>
                Es menos que el pago mínimo de Webpay ({fmtCLP(WEBPAY_MIN_CLP)}). Júntalo con otros viajes en{' '}
                <b>Mis viajes</b> y compénsalos en un solo pago.
              </span>
            </div>
          ) : (
            <p className="b2cc-result-note">
              En el siguiente paso eliges el proyecto y ves exactamente qué financia tu compensación y cuánto cuesta.
            </p>
          )}

          <div className="b2cc-result-actions">
            <button type="button" onClick={resetForm} className="b2cc-btn-secondary">
              <FaArrowLeft aria-hidden="true" /> Registrar otro
            </button>
            {belowMinimum ? (
              <button type="button" onClick={() => navigate('/b2c/flights?type=ground')} className="b2cc-submit-btn">
                <FaLayerGroup aria-hidden="true" /> Juntar con otros viajes
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/b2c/projects?calcId=${encodeURIComponent(saved.calculationId)}&kg=${saved.co2Kg}`)}
                className="b2cc-submit-btn"
              >
                <FaLeaf aria-hidden="true" /> Elegir proyecto para compensar
              </button>
            )}
          </div>
        </div>
      </div>,
    );
  }

  return layout(
    <>
      <CalculatorModeSwitch active="ground" />
      <div className="b2cc-grid">
        <div className="b2cc-card">
          <div className="b2cc-card-header">
            <span className="b2cc-card-icon" aria-hidden="true"><FaCar /></span>
            <div>
              <h2 className="b2cc-card-title">Datos del trayecto</h2>
              <p className="b2cc-card-subtitle">Si usas la app, tus trayectos se registran solos por GPS</p>
            </div>
          </div>

          {catalogError ? (
            <div role="alert" className="b2cc-error">
              <FaInfoCircle className="b2cc-error-icon" aria-hidden="true" />
              <span>{catalogError}</span>
            </div>
          ) : (
            <form className="b2cc-form" onSubmit={handleSubmit} noValidate aria-busy={!modes.length}>
              <fieldset className="b2cc-fieldset">
                <legend className="b2cc-field-label">Medio de transporte</legend>
                <div className="b2cc-chip-group grid-cols-2 sm:grid-cols-5">
                  {PAYABLE_MODES.map((m) => {
                    const Icon = tripModeIcon(m);
                    return (
                      <label
                        key={m}
                        className={cx(
                          'b2cc-chip inline-flex items-center justify-center gap-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-700',
                          mode === m && 'b2cc-chip--active',
                        )}
                      >
                        <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="sr-only" />
                        <Icon aria-hidden="true" /> {tripModeLabel(m)}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {current && current.subtypes.length > 1 && (
                <div>
                  <label htmlFor={ids.subtype} className="b2cc-field-label">Tipo de vehículo</label>
                  <div className="b2cc-input-wrap">
                    <select
                      id={ids.subtype}
                      name="vehicleSubtype"
                      value={subtype}
                      onChange={(e) => setSubtype(e.target.value)}
                      className="b2cc-input cursor-pointer"
                    >
                      {current.subtypes.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="b2cc-row">
                <div>
                  <label htmlFor={ids.km} className="b2cc-field-label">Distancia (km)</label>
                  <div className="b2cc-input-wrap">
                    <input
                      ref={kmRef}
                      id={ids.km}
                      name="distanceKm"
                      type="text"
                      inputMode="decimal"
                      enterKeyHint="done"
                      autoComplete="off"
                      required
                      value={km}
                      onChange={(e) => { setKm(e.target.value); e.target.setCustomValidity(''); }}
                      placeholder="Ej.: 12,5"
                      aria-describedby={ids.kmHint}
                      className="b2cc-input"
                    />
                  </div>
                  <p id={ids.kmHint} className="m-0 mt-1.5 text-xs text-gray-500">
                    Puedes verla en Google Maps o en la app de transporte.
                  </p>
                </div>
                <div>
                  <label htmlFor={ids.date} className="b2cc-field-label">Fecha</label>
                  <div className="b2cc-input-wrap">
                    <input
                      id={ids.date}
                      name="date"
                      type="date"
                      required
                      max={todayLocal()}
                      value={date}
                      onChange={(e) => setDate(e.target.value || todayLocal())}
                      className="b2cc-input"
                    />
                  </div>
                </div>
              </div>

              <div className="b2cc-row b2cc-row--wide">
                {sharesCar && (
                  <div>
                    <span className="b2cc-field-label">Personas en el vehículo</span>
                    <div className="b2cc-stepper">
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                        disabled={passengers <= 1}
                        className="b2cc-stepper-btn"
                        aria-label="Quitar una persona"
                      >
                        <FaMinus aria-hidden="true" />
                      </button>
                      <output className="b2cc-stepper-display" aria-live="polite">{passengers}</output>
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.min(8, p + 1))}
                        disabled={passengers >= 8}
                        className="b2cc-stepper-btn"
                        aria-label="Agregar una persona"
                      >
                        <FaPlus aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <span className="b2cc-field-label">Recorrido</span>
                  <div className="b2cc-toggle" role="radiogroup" aria-label="Recorrido">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!roundTrip}
                      onClick={() => setRoundTrip(false)}
                      className={cx('b2cc-toggle-btn', !roundTrip && 'b2cc-toggle-btn--active')}
                    >
                      Solo ida
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={roundTrip}
                      onClick={() => setRoundTrip(true)}
                      className={cx('b2cc-toggle-btn', roundTrip && 'b2cc-toggle-btn--active')}
                    >
                      Ida y vuelta
                    </button>
                  </div>
                </div>
              </div>

              {estimateKg > 0 && (
                <div className="b2cc-distance" aria-live="polite">
                  <span>Huella estimada{sharesCar && passengers > 1 ? ' por persona' : ''}</span>
                  <strong>{fmtNum(estimateKg, estimateKg < 10 ? 2 : 0)} kg CO₂e · {fmtNum(totalKm, 1)} km</strong>
                </div>
              )}

              {error && (
                <div role="alert" className="b2cc-error">
                  <FaInfoCircle className="b2cc-error-icon" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={saving || !modes.length} className="b2cc-submit-btn">
                {saving ? (
                  <><FaSpinner className="b2cc-spin" aria-hidden="true" /> Guardando…</>
                ) : (
                  <><FaLeaf aria-hidden="true" /> Guardar y calcular huella</>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="b2cc-card b2cc-card--side">
          <div className="b2cc-card-header">
            <span className="b2cc-card-icon" aria-hidden="true"><FaLayerGroup /></span>
            <h2 className="b2cc-card-title">Trayectos cortos</h2>
          </div>
          <p className="m-0 text-sm text-gray-600 leading-relaxed">
            Un viaje corto suele costar menos que el pago mínimo de Webpay ({fmtCLP(WEBPAY_MIN_CLP)}). Registra varios y,
            en <Link to="/b2c/flights?type=ground" className="font-semibold text-brand-700 hover:underline">Mis viajes</Link>,
            márcalos para compensarlos juntos en un solo pago.
          </p>
          <p className="m-0 mt-4 text-xs text-gray-500">
            Factores de emisión{source ? ` ${source}` : ''}: los mismos que usa la app.{' '}
            <Link to="/metodologia" className="font-semibold text-brand-700 hover:underline">Ver metodología</Link>
          </p>
        </div>
      </div>
    </>,
  );
};

export default GroundTripCalculator;
