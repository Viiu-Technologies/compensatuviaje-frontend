import { useState, useEffect } from 'react';
import {
  Settings,
  TrendingUp,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  Calculator,
  Info
} from 'lucide-react';
import {
  getSettings,
  updateSettings,
  PlatformSettings,
} from '../services/adminApi';

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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const settingsData = await getSettings();
      setSettings(settingsData);
      setFormData({
        default_margin_percent: settingsData.default_margin_percent,
        min_price_clp_per_ton: settingsData.min_price_clp_per_ton,
        max_price_clp_per_ton: settingsData.max_price_clp_per_ton
      });
    } catch (err: any) {
      setError(err.message || 'Error loading settings');
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
      setError(err.message || 'Error saving settings');
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

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !min-h-[400px]">
        <RefreshCw className="!w-8 !h-8 !text-indigo-600 !animate-spin" />
      </div>
    );
  }

  return (
    <div className="!space-y-8">
      {/* Header */}
      <div className="!flex !items-center !justify-between">
        <div>
          <h1 className="!text-3xl !font-bold !text-slate-900 !flex !items-center !gap-3">
            <Settings className="!w-8 !h-8 !text-indigo-600" />
            Platform Settings
          </h1>
          <p className="!text-slate-600 !mt-1">
            Configure márgenes y parámetros de precios en CLP
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="!flex !items-center !gap-2 !px-6 !py-3 !bg-gradient-to-r !from-indigo-600 !to-purple-600 !text-white !rounded-xl !font-semibold hover:!shadow-lg hover:!shadow-indigo-500/30 !transition-all disabled:!opacity-50"
        >
          {saving ? (
            <RefreshCw className="!w-5 !h-5 !animate-spin" />
          ) : (
            <Save className="!w-5 !h-5" />
          )}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="!bg-red-50 !border !border-red-200 !rounded-xl !p-4 !flex !items-center !gap-3">
          <AlertCircle className="!w-5 !h-5 !text-red-600" />
          <span className="!text-red-700">{error}</span>
        </div>
      )}
      {success && (
        <div className="!bg-green-50 !border !border-green-200 !rounded-xl !p-4 !flex !items-center !gap-3">
          <CheckCircle2 className="!w-5 !h-5 !text-green-600" />
          <span className="!text-green-700">{success}</span>
        </div>
      )}

      <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-8">
        {/* Margin & Limits Card */}
        <div className="!bg-white !rounded-2xl !shadow-sm !border !border-slate-200 !p-6 lg:!col-span-2">
          <div className="!flex !items-center !gap-3 !mb-6">
            <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-purple-500 !to-indigo-600 !flex !items-center !justify-center">
              <TrendingUp className="!w-6 !h-6 !text-white" />
            </div>
            <div>
              <h2 className="!text-xl !font-bold !text-slate-900">Parámetros de Precios</h2>
              <p className="!text-sm !text-slate-500">Márgenes y límites de precio en CLP</p>
            </div>
          </div>

          <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-6">
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-2">
                Margen por Defecto (%)
              </label>
              <input
                type="number"
                value={formData.default_margin_percent}
                onChange={(e) => setFormData({ ...formData, default_margin_percent: parseFloat(e.target.value) || 0 })}
                className="!w-full !px-4 !py-3 !border !border-slate-300 !rounded-xl focus:!ring-2 focus:!ring-indigo-500 focus:!border-indigo-500"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-2">
                Precio Mínimo (CLP/ton)
              </label>
              <input
                type="number"
                value={formData.min_price_clp_per_ton}
                onChange={(e) => setFormData({ ...formData, min_price_clp_per_ton: parseFloat(e.target.value) || 0 })}
                className="!w-full !px-4 !py-3 !border !border-slate-300 !rounded-xl focus:!ring-2 focus:!ring-indigo-500 focus:!border-indigo-500"
                step="1"
                min="0"
              />
            </div>
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-2">
                Precio Máximo (CLP/ton)
              </label>
              <input
                type="number"
                value={formData.max_price_clp_per_ton}
                onChange={(e) => setFormData({ ...formData, max_price_clp_per_ton: parseFloat(e.target.value) || 0 })}
                className="!w-full !px-4 !py-3 !border !border-slate-300 !rounded-xl focus:!ring-2 focus:!ring-indigo-500 focus:!border-indigo-500"
                step="1"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Price Calculator Preview */}
        <div className="!bg-gradient-to-br !from-indigo-50 !to-purple-50 !rounded-2xl !border !border-indigo-200 !p-6 lg:!col-span-2">
          <div className="!flex !items-center !gap-3 !mb-6">
            <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-indigo-500 !to-purple-600 !flex !items-center !justify-center">
              <Calculator className="!w-6 !h-6 !text-white" />
            </div>
            <div>
              <h2 className="!text-xl !font-bold !text-slate-900">Calculadora de Precios</h2>
              <p className="!text-sm !text-slate-600">Prueba la fórmula de precios con valores de ejemplo</p>
            </div>
          </div>

          {/* Formula Display */}
          <div className="!bg-white !rounded-xl !p-4 !mb-6 !border !border-indigo-200">
            <div className="!flex !items-center !gap-2 !mb-2">
              <Info className="!w-4 !h-4 !text-indigo-600" />
              <span className="!text-sm !font-medium !text-indigo-700">Fórmula Oficial</span>
            </div>
            <code className="!text-sm !text-slate-700 !font-mono !bg-slate-100 !px-3 !py-2 !rounded-lg !block">
              precio_clp_ton = (costo_clp * (1 + margen) / kg_co2) * 1000
            </code>
          </div>

          <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-6">
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-2">
                Costo del Proyecto (CLP)
              </label>
              <input
                type="number"
                value={exampleCalc.cost_clp}
                onChange={(e) => setExampleCalc({ ...exampleCalc, cost_clp: parseFloat(e.target.value) || 0 })}
                className="!w-full !px-4 !py-3 !border !border-slate-300 !rounded-xl focus:!ring-2 focus:!ring-indigo-500 focus:!border-indigo-500"
              />
            </div>
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-2">
                Capacidad (kg CO2)
              </label>
              <input
                type="number"
                value={exampleCalc.capacity_kg}
                onChange={(e) => setExampleCalc({ ...exampleCalc, capacity_kg: parseFloat(e.target.value) || 0 })}
                className="!w-full !px-4 !py-3 !border !border-slate-300 !rounded-xl focus:!ring-2 focus:!ring-indigo-500 focus:!border-indigo-500"
              />
            </div>
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-2">
                Precio Calculado
              </label>
              <div className="!bg-gradient-to-r !from-green-500 !to-emerald-600 !rounded-xl !px-4 !py-3 !text-white !text-xl !font-bold !text-center">
                ${Math.round(calculateExamplePrice()).toLocaleString('es-CL')} CLP/ton
              </div>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="!mt-6 !bg-white !rounded-xl !p-4 !border !border-indigo-200">
            <h3 className="!text-sm !font-semibold !text-slate-700 !mb-3">Desglose del Cálculo</h3>
            <div className="!grid !grid-cols-2 md:!grid-cols-3 !gap-4 !text-sm">
              <div>
                <span className="!text-slate-500">Con Margen ({formData.default_margin_percent}%):</span>
                <p className="!font-mono !font-semibold">
                  ${Math.round(exampleCalc.cost_clp * (1 + formData.default_margin_percent / 100)).toLocaleString('es-CL')} CLP
                </p>
              </div>
              <div>
                <span className="!text-slate-500">Por kg CO2:</span>
                <p className="!font-mono !font-semibold">
                  ${(calculateExamplePrice() / 1000).toFixed(0)} CLP
                </p>
              </div>
              <div>
                <span className="!text-slate-500">Por tonelada CO2:</span>
                <p className="!font-mono !font-semibold !text-green-600">
                  ${Math.round(calculateExamplePrice()).toLocaleString('es-CL')} CLP
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      {settings && (
        <div className="!text-center !text-sm !text-slate-500">
          Última actualización: {new Date(settings.updated_at).toLocaleString('es-CL')}
          {settings.updated_by && ` por ${settings.updated_by}`}
        </div>
      )}
    </div>
  );
}
