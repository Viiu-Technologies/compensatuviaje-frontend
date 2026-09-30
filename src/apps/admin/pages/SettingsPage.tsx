import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  getSettings,
  updateSettings,
  PlatformSettings,
} from '../services/adminApi';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import { PageHeader, Panel, Skeleton, formatCLP } from '../ui';

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    default_margin_percent: 0,
    min_price_clp_per_ton: 0,
    max_price_clp_per_ton: 0
  });

  const [exampleCalc, setExampleCalc] = useState({
    cost_clp: 5000000,
    capacity_kg: 1000
  });

  useEffect(() => {
    loadData();
  }, []);

  // Si la API omite un campo, antes quedaba undefined y los cálculos
  // mostraban "$NaN CLP/ton".
  const toNumber = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const settingsData = await getSettings();
      setSettings(settingsData);
      setFormData({
        default_margin_percent: toNumber(settingsData?.default_margin_percent),
        min_price_clp_per_ton: toNumber(settingsData?.min_price_clp_per_ton),
        max_price_clp_per_ton: toNumber(settingsData?.max_price_clp_per_ton)
      });
    } catch (err: any) {
      setError(getErrorMessage(err, 'No pudimos cargar la configuración.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await updateSettings(formData);
      setSettings(updated);
      setSuccess('Configuración guardada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err, 'No pudimos guardar los cambios. Vuelve a intentarlo.'));
    } finally {
      setSaving(false);
    }
  };

  const calculateExamplePrice = () => {
    if (!exampleCalc.capacity_kg) return 0;
    const marginMultiplier = 1 + (formData.default_margin_percent / 100);
    const pricePerKg = (exampleCalc.cost_clp * marginMultiplier) / exampleCalc.capacity_kg;
    return pricePerKg * 1000;
  };

  // Un mínimo mayor que el máximo dejaría sin precio válido a todo proyecto
  const rangeError =
    formData.min_price_clp_per_ton > 0 &&
    formData.max_price_clp_per_ton > 0 &&
    formData.min_price_clp_per_ton > formData.max_price_clp_per_ton
      ? 'El precio mínimo no puede ser mayor que el máximo.'
      : null;

  const numberField = (
    id: string,
    label: string,
    value: number,
    onChange: (v: number) => void,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    hint?: string
  ) => (
    <div className="adm-field">
      <label className="adm-field__label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        className="adm-input adm-num"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
      />
      {/* Ayuda bajo el campo: arriba desalineaba los inputs de la fila */}
      {hint && <span id={`${id}-hint`} className="adm-field__hint">{hint}</span>}
    </div>
  );

  const header = (
    <PageHeader
      title="Configuración de la plataforma"
      description="Margen y límites de precio que se aplican al aprobar proyectos."
      actions={
        <button type="button" className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving || loading || !!rangeError}>
          <Save aria-hidden="true" />
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      }
    />
  );

  if (loading) {
    return (
      <div className="adm-page" aria-busy="true">
        {header}
        <Skeleton height={180} />
        <Skeleton height={260} />
      </div>
    );
  }

  const withMargin = exampleCalc.cost_clp * (1 + formData.default_margin_percent / 100);
  const pricePerTon = calculateExamplePrice();

  return (
    <div className="adm-page">
      {header}

      {error && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertCircle aria-hidden="true" />
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div role="status" className="adm-alert adm-alert--success">
          <CheckCircle2 aria-hidden="true" />
          <div>{success}</div>
        </div>
      )}

      <Panel title="Parámetros de precio" description="Pesos chilenos por tonelada de CO₂e">
        <div className="adm-form-grid">
          {numberField('st-margin', 'Margen por defecto (%)', formData.default_margin_percent,
            (v) => setFormData({ ...formData, default_margin_percent: v }), { step: '0.1', min: 0, max: 100 },
            'Se suma al costo del partner.')}
          {numberField('st-min', 'Precio mínimo (CLP/t)', formData.min_price_clp_per_ton,
            (v) => setFormData({ ...formData, min_price_clp_per_ton: v }), { step: '1', min: 0 })}
          {numberField('st-max', 'Precio máximo (CLP/t)', formData.max_price_clp_per_ton,
            (v) => setFormData({ ...formData, max_price_clp_per_ton: v }), { step: '1', min: 0 })}
        </div>
        {rangeError && <p className="adm-field__error" role="alert" style={{ marginTop: 10 }}>{rangeError}</p>}
      </Panel>

      <Panel title="Calculadora de precio" description="Prueba la fórmula con valores de ejemplo; no guarda nada">
        <div className="adm-stack-v">
          <p className="adm-note">
            Precio por tonelada = costo × (1 + margen) ÷ kg de CO₂ × 1.000
          </p>
          <div className="adm-form-grid">
            {numberField('st-cost', 'Costo del proyecto (CLP)', exampleCalc.cost_clp,
              (v) => setExampleCalc({ ...exampleCalc, cost_clp: v }), { min: 0 })}
            {numberField('st-capacity', 'Captura (kg de CO₂)', exampleCalc.capacity_kg,
              (v) => setExampleCalc({ ...exampleCalc, capacity_kg: v }), { min: 0 })}
          </div>
          <div className="adm-calc">
            <dl className="adm-dl">
              <dt>Costo con margen ({formData.default_margin_percent} %)</dt>
              <dd>{formatCLP(withMargin)}</dd>
              <dt>Por kg de CO₂</dt>
              <dd>{formatCLP(pricePerTon / 1000)}</dd>
            </dl>
            <div className="adm-calc__price">
              Precio por tonelada
              <b>{formatCLP(pricePerTon)}</b>
            </div>
          </div>
        </div>
      </Panel>

      {settings?.updated_at && !Number.isNaN(new Date(settings.updated_at).getTime()) && (
        <p className="adm-cell-mute" style={{ fontSize: 13 }}>
          Última actualización: {new Date(settings.updated_at).toLocaleString('es-CL', { hourCycle: 'h23' })}
          {settings.updated_by && ` por ${settings.updated_by}`}
        </p>
      )}
    </div>
  );
}
