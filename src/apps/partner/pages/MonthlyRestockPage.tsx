import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjectById } from '../services/partnerApi';
import { submitMonthlyEvidence, getProjectEvidence } from '../services/evidenceApi';
import { EsgProject } from '../../../types/partner.types';
import { EVIDENCE_STATUS_COLORS, EVIDENCE_STATUS_LABELS, ProjectEvidence } from '../../../types/evidence.types';
import FileUploader from '../../../shared/components/FileUploader';
import DocumentViewer from '../../../shared/components/DocumentViewer';

const MonthlyRestockPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<EsgProject | null>(null);
  const [history, setHistory] = useState<ProjectEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [unitsDelivered, setUnitsDelivered] = useState<number | ''>('');
  const [newStockRequested, setNewStockRequested] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, evRes] = await Promise.all([
        getProjectById(id!),
        getProjectEvidence(id!)
      ]);
      if (projRes) setProject(projRes);
      if (evRes?.success) setHistory(evRes.data.evidences);
    } catch (err: any) {
      setError('Error al cargar la información del proyecto.');
    } finally {
      setLoading(false);
    }
  };

  const isPending = history.some(e => e.status === 'pending_approval');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitsDelivered || !newStockRequested || files.length === 0) {
      setError('Por favor completa todos los campos requeridos y sube al menos una evidencia.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await submitMonthlyEvidence(
        id!,
        {
          unitsDelivered: Number(unitsDelivered),
          newStockRequested: Number(newStockRequested),
          note
        },
        files
      );
      
      // Reset and reload
      setUnitsDelivered('');
      setNewStockRequested('');
      setNote('');
      setFiles([]);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">Proyecto no encontrado</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          ← Volver
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ciclo de Desbloqueo Mensual</h1>
          <p className="text-gray-500">{project.name} ({project.code})</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Submit new request */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Solicitar Liberación de Fondos y Nuevo Stock</h2>
            <p className="text-sm text-gray-600 mb-6">
              Para recibir el pago por lo que ya entregaste ("escrow") y habilitar stock para el siguiente mes, necesitamos evidencia de lo realizado.
            </p>

            {isPending ? (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                <span className="text-yellow-500 text-xl">⏳</span>
                <div>
                  <h3 className="font-semibold text-yellow-800">Solicitud en revisión</h3>
                  <p className="text-sm text-yellow-700">Ya tienes una solicitud pendiente. Debes esperar a que sea aprobada o rechazada antes de subir una nueva.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {project.impact_unit_type ? `${project.impact_unit_type}s Entregados (Este Mes)` : 'Unidades Entregadas'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={unitsDelivered}
                      onChange={e => setUnitsDelivered(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Con esto liberamos el pago retenido.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nuevo Stock Solicitado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newStockRequested}
                      onChange={e => setNewStockRequested(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lo que podrás vender el próximo mes.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas u Observaciones</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Detalles sobre el avance de este mes, problemas, logros..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-dashed">
                  <FileUploader
                    label="Evidencia Fotográfica y/o Documental"
                    description="Sube guías de despacho, fotos georreferenciadas, reportes del mes."
                    accept="image/*,application/pdf"
                    maxFiles={10}
                    required
                    files={files}
                    onFilesChange={setFiles}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Evidencia y Solicitar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Summary & History */}
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-4">Estado Actual</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Stock Mensual Restante</span>
                <span className="font-bold text-blue-900">{project.monthly_stock_remaining || 0} {project.impact_unit_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Progreso Total</span>
                <span className="font-bold text-blue-900">{project.capacity_sold || 0} / {project.capacity_total || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Historial de Verificaciones</h3>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay historial todavía.</p>
            ) : (
              <div className="space-y-4">
                {history.map((ev) => (
                  <div key={ev.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">{new Date(ev.createdAt).toLocaleDateString()}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${EVIDENCE_STATUS_COLORS[ev.status]}`}>
                        {EVIDENCE_STATUS_LABELS[ev.status]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>➤ Solicitado: {ev.newStockRequested} (Verificado: {ev.unitsVerified ?? '-'})</p>
                      {ev.payoutApproved && <p className="text-emerald-600">💵 Pago liberado: ${ev.payoutAmount?.toLocaleString('es-CL')}</p>}
                      {ev.note && <p className="italic bg-gray-50 p-2 mt-2 rounded">"{ev.note}"</p>}
                      {ev.adminNotes && <p className="text-red-800 bg-red-50 p-2 mt-2 rounded">Resp: "{ev.adminNotes}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRestockPage;
