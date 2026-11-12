import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  getSettings,
  updateSettings,
  PlatformSettings,
} from '../services/adminApi';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import { validateChileanRut } from '../../../shared/utils/chileanRut';
import { PageHeader, Panel, Skeleton, StatusBadge, formatCLP } from '../ui';

const EMPTY_BANK_DETAILS = {
  bankName: '',
  accountType: '',
  accountNumber: '',
  accountHolder: '',
  rut: '',
  email: '',
  message: 'Indicar número de orden en la referencia de transferencia',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    default_margin_percent: 0,
    min_price_clp_per_ton: 0,
    max_price_clp_per_ton: 0,
    legal_razon_social: '',
    legal_rut: '',
    legal_address: '',
    legal_giro: '',
    legal_representative: '',
    legal_contact_email: '',
    b2b_sales_enabled: false,
    bank_transfer_details: { ...EMPTY_BANK_DETAILS },
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

  const syncFromSettings = (settingsData: PlatformSettings) => {
    setSettings(settingsData);
    setFormData({
      default_margin_percent: toNumber(settingsData?.default_margin_percent),
      min_price_clp_per_ton: toNumber(settingsData?.min_price_clp_per_ton),
      max_price_clp_per_ton: toNumber(settingsData?.max_price_clp_per_ton),
      legal_razon_social: settingsData?.legal_razon_social || '',
      legal_rut: settingsData?.legal_rut || '',
      legal_address: settingsData?.legal_address || '',
      legal_giro: settingsData?.legal_giro || '',
      legal_representative: settingsData?.legal_representative || '',
      legal_contact_email: settingsData?.legal_contact_email || '',
      b2b_sales_enabled: Boolean(settingsData?.b2b_sales_enabled),
      bank_transfer_details: {
        ...EMPTY_BANK_DETAILS,
        ...(settingsData?.bank_transfer_details || {}),
      },
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const settingsData = await getSettings();
      syncFromSettings(settingsData);
    } catch (err: any) {
      setError(getErrorMessage(err, 'No pudimos cargar la configuración.'));
    } finally {
      setLoading(false);
    }
  };

  const legalRutValue = formData.legal_rut.trim();
  const legalRutCheck = legalRutValue ? validateChileanRut(legalRutValue) : null;
  const legalRutError = legalRutCheck && !legalRutCheck.valid ? (legalRutCheck.error || 'RUT legal inválido') : null;
  const legalEmailValue = formData.legal_contact_email.trim();
  const legalEmailError = legalEmailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(legalEmailValue)
    ? 'Ingresa un email válido'
    : null;

  const legalFormComplete = Boolean(
    formData.legal_razon_social.trim() &&
    legalRutValue && !legalRutError &&
    formData.legal_address.trim() &&
    formData.legal_giro.trim() &&
    formData.legal_representative.trim() &&
    legalEmailValue && !legalEmailError
  );

  const handleSave = async () => {
    if (legalRutError) {
      setError(legalRutError);
      return;
    }
    if (legalEmailError) {
      setError('El email de contacto legal no tiene un formato válido.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = {
        ...formData,
        legal_rut: legalRutCheck?.valid ? legalRutCheck.formatted : formData.legal_rut,
        b2b_sales_enabled: legalFormComplete ? formData.b2b_sales_enabled : false,
      };
      const updated = await updateSettings(payload);
      syncFromSettings(updated);
      window.dispatchEvent(new Event('admin-settings-updated'));
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

  const textField = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder?: string,
    hint?: string,
    fieldError?: string | null,
    type: string = 'text'
  ) => (
    <div className="adm-field">
      <label className="adm-field__label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="adm-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {fieldError
        ? <span className="adm-field__error" role="alert">{fieldError}</span>
        : hint && <span id={`${id}-hint`} className="adm-field__hint">{hint}</span>
      }
    </div>
  );

  const header = (
    <PageHeader
      title="Configuración de la plataforma"
      description="Precios, identidad legal de la plataforma, interruptor B2B y datos bancarios."
      actions={
        <button type="button" className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving || loading || !!rangeError || !!legalRutError || !!legalEmailError}>
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

      <Panel
        title="Datos legales y habilitación B2B"
        description="Identidad tributaria de la operadora y control de pre-venta (B2B_SALES_ENABLED)."
        aside={
          <StatusBadge tone={legalFormComplete ? 'success' : 'warning'}>
            {legalFormComplete ? 'Ficha legal completa' : 'Faltan datos legales'}
          </StatusBadge>
        }
      >
        <div className="adm-stack-v">
          {!legalFormComplete && (
            <div className="adm-alert adm-alert--warning">
              <ShieldAlert aria-hidden="true" />
              <div>
                Completa los 6 campos legales obligatorios para poder activar ventas B2B en producción.
              </div>
            </div>
          )}

          <div className="adm-form-grid">
            {textField('legal-razon', 'Razón social *', formData.legal_razon_social,
              (v) => setFormData({ ...formData, legal_razon_social: v }),
              'Ej: CompensaTuViaje SpA')}
            {textField('legal-rut', 'RUT empresa *', formData.legal_rut,
              (v) => setFormData({ ...formData, legal_rut: v }),
              'Ej: 76.123.456-0',
              'Validado con módulo 11 chileno.',
              legalRutError)}
            {textField('legal-giro', 'Giro SII *', formData.legal_giro,
              (v) => setFormData({ ...formData, legal_giro: v }),
              'Ej: Servicios de gestión ambiental')}
            {textField('legal-address', 'Dirección legal / comercial *', formData.legal_address,
              (v) => setFormData({ ...formData, legal_address: v }),
              'Ej: Av. Providencia 1234, Santiago')}
            {textField('legal-rep', 'Representante legal *', formData.legal_representative,
              (v) => setFormData({ ...formData, legal_representative: v }),
              'Nombre completo del representante')}
            {textField('legal-email', 'Email de contacto legal *', formData.legal_contact_email,
              (v) => setFormData({ ...formData, legal_contact_email: v }),
              'legal@compensatuviaje.cl',
              'También recibe copias administrativas si corresponde.',
              legalEmailError,
              'email')}
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: 14,
              borderRadius: 10,
              border: '1px solid var(--adm-border, #e5e7eb)',
              background: formData.b2b_sales_enabled && legalFormComplete ? '#ecfdf5' : '#f9fafb',
              cursor: legalFormComplete ? 'pointer' : 'not-allowed',
              opacity: legalFormComplete ? 1 : 0.75,
            }}
          >
            <input
              type="checkbox"
              checked={legalFormComplete && formData.b2b_sales_enabled}
              disabled={!legalFormComplete}
              onChange={(e) => setFormData({ ...formData, b2b_sales_enabled: e.target.checked })}
              style={{ marginTop: 3 }}
            />
            <div>
              <strong style={{ display: 'block', fontSize: 14 }}>
                Habilitar ventas B2B en producción (B2B_SALES_ENABLED)
              </strong>
              <span className="adm-field__hint">
                {legalFormComplete
                  ? 'Permite que empresas creen órdenes de contribución climática en entorno productivo.'
                  : 'Bloqueado hasta completar y guardar todos los datos legales obligatorios.'}
              </span>
            </div>
          </label>
        </div>
      </Panel>

      <Panel
        title="Cuenta bancaria para transferencias B2B"
        description="Si no completas banco, N° de cuenta y RUT, no se mostrarán cuentas ficticias en correos ni en el portal B2B."
        aside={
          <StatusBadge tone={settings?.bank_details_configured ? 'success' : 'neutral'}>
            {settings?.bank_details_configured ? 'Configurada' : 'Pendiente'}
          </StatusBadge>
        }
      >
        <div className="adm-form-grid">
          {textField('bank-name', 'Banco', formData.bank_transfer_details.bankName,
            (v) => setFormData({
              ...formData,
              bank_transfer_details: { ...formData.bank_transfer_details, bankName: v }
            }),
            'Ej: Banco de Chile')}
          {textField('bank-type', 'Tipo de cuenta', formData.bank_transfer_details.accountType,
            (v) => setFormData({
              ...formData,
              bank_transfer_details: { ...formData.bank_transfer_details, accountType: v }
            }),
            'Ej: Cuenta Corriente')}
          {textField('bank-number', 'N° de cuenta', formData.bank_transfer_details.accountNumber,
            (v) => setFormData({
              ...formData,
              bank_transfer_details: { ...formData.bank_transfer_details, accountNumber: v }
            }),
            'Ej: 00-123-45678-9')}
          {textField('bank-holder', 'Titular', formData.bank_transfer_details.accountHolder,
            (v) => setFormData({
              ...formData,
              bank_transfer_details: { ...formData.bank_transfer_details, accountHolder: v }
            }),
            'Ej: CompensaTuViaje SpA')}
          {textField('bank-rut', 'RUT titular', formData.bank_transfer_details.rut,
            (v) => setFormData({
              ...formData,
              bank_transfer_details: { ...formData.bank_transfer_details, rut: v }
            }),
            'Ej: 76.123.456-0')}
          {textField('bank-email', 'Email notificaciones de pago', formData.bank_transfer_details.email,
            (v) => setFormData({
              ...formData,
              bank_transfer_details: { ...formData.bank_transfer_details, email: v }
            }),
            'pagos@compensatuviaje.cl',
            undefined,
            null,
            'email')}
        </div>
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
