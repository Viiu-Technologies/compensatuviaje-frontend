import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectDetail, ProjectDetailData } from '../services/adminApi';
import { getAdminProjectEvidence, approveMonthlyEvidence, rejectMonthlyEvidence } from '../../partner/services/evidenceApi';
import { EVIDENCE_STATUS_COLORS, EVIDENCE_STATUS_LABELS, ProjectEvidence } from '../../../types/evidence.types';
import PhotoCarousel from '../../../shared/components/PhotoCarousel';
import DocumentViewer from '../../../shared/components/DocumentViewer';

const MonthlyEvidenceReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [evidenceList, setEvidenceList] = useState<ProjectEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review states per evidence
  const [reviewData, setReviewData] = useState<Record<string, {
    unitsVerified: number;
    newStockApproved: number;
    adminNotes: string;
    rejectReason: string;
    freezeStock: boolean;
  }>>({});

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, evRes] = await Promise.all([
        getProjectDetail(id!),
        getAdminProjectEvidence(id!)
      ]);
      
      if (projRes) setProject(projRes);
      
      if (evRes?.success) {
        setEvidenceList(evRes.data.evidences);
        
        // Initialize review form data
        const initialForm: Record<string, any> = {};
        evRes.data.evidences.forEach((ev: ProjectEvidence) => {
          initialForm[ev.id] = {
            unitsVerified: ev.unitsDelivered || 0,
            newStockApproved: ev.newStockRequested || 0,
            adminNotes: '',
            rejectReason: '',
            freezeStock: false
          };
        });
        setReviewData(initialForm);
      }
    } catch (err: any) {
      setError('Error al cargar la información.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewChange = (evId: string, field: string, value: any) => {
    setReviewData(prev => ({
      ...prev,
      [evId]: { ...prev[evId], [field]: value }
    }));
  };

  const handleApprove = async (evId: string) => {
    try {
      const data = reviewData[evId];
      if (!data.unitsVerified || !data.newStockApproved) {
        alert('Debes definir las unidades verificadas y el nuevo stock.');
        return;
      }
      if (!window.confirm('¿Aprobar evidencia? Esto liberará el pago en Escrow y renovará el stock del partner.')) return;

      setProcessing(true);
      await approveMonthlyEvidence(id!, evId, {
        unitsVerified: data.unitsVerified,
        newStockApproved: data.newStockApproved,
        adminNotes: data.adminNotes
      });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al aprobar.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (evId: string) => {
    try {
      const data = reviewData[evId];
      if (!data.rejectReason) {
        alert('Debes ingresar una razón para el rechazo.');
        return;
      }
      if (!window.confirm('¿Rechazar evidencia? El pago NO será liberado.')) return;

      setProcessing(true);
      await rejectMonthlyEvidence(id!, evId, {
        reason: data.rejectReason,
        freezeStock: data.freezeStock
      });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al rechazar.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">Proyecto no encontrado</div>;

  const pendingEvidence = evidenceList.filter(e => e.status === 'pending_approval');
  const pastEvidence = evidenceList.filter(e => e.status !== 'pending_approval');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            ← Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Revisión de Evidencia y Escrow</h1>
            <p className="text-gray-500">{project.name} ({project.code})</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Costo Local (Operativo)</div>
          <div className="font-bold text-lg">${project.provider_cost_unit_clp?.toLocaleString('es-CL')} CLP/{project.impact_unit}</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Main Review Section */}
      <h2 className="text-xl font-bold text-gray-800 mt-6 pt-4">Solicitudes Pendientes</h2>
      {pendingEvidence.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 p-8 text-center rounded-xl text-gray-500">
          No hay solicitudes pendientes de revisión.
        </div>
      ) : (
        <div className="space-y-8">
          {pendingEvidence.map(ev => {
            const formData = reviewData[ev.id];
            if (!formData) return null;
            
            const photos = ev.files.filter(f => f.fileType === 'photo').map(f => ({ url: f.signedUrl || f.storageUrl, fileName: f.fileName, thumbnailUrl: f.thumbnailUrl }));
            const docs = ev.files.filter(f => f.fileType !== 'photo');

            // Calculating automated payout amount
            const possiblePayout = project.provider_cost_unit_clp! * formData.unitsVerified;

            return (
              <div key={ev.id} className="bg-white rounded-xl shadow-lg border overflow-hidden">
                <div className="p-4 bg-emerald-50 border-b flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-emerald-900 border-b-2 border-emerald-500 inline-block">Ciclo: {ev.periodMonth}</h3>
                    <p className="text-xs text-emerald-700 mt-1">Enviado el {new Date(ev.createdAt).toLocaleString()} por {project.partner?.name}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-emerald-100 flex gap-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Alegan entregar</div>
                      <div className="font-bold text-lg">{ev.unitsDelivered} {project.impact_unit}s</div>
                    </div>
                    <div className="text-center border-l pl-6">
                      <div className="text-xs text-gray-500">Solicitan nuevo stock</div>
                      <div className="font-bold text-lg">{ev.newStockRequested} {project.impact_unit}s</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3">
                  {/* Left: Files */}
                  <div className="p-6 md:col-span-1 border-r bg-gray-50/50 space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3 text-sm">Evidencia Fotográfica</h4>
                      <PhotoCarousel photos={photos} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3 text-sm flex justify-between">
                        Documentación
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{docs.length}</span>
                      </h4>
                      <DocumentViewer documents={docs} />
                    </div>
                    {ev.note && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
                        <span className="font-semibold text-yellow-800">Nota del Partner:</span>
                        <p className="text-yellow-700 italic mt-1">"{ev.note}"</p>
                      </div>
                    )}
                  </div>

                  {/* Middle: Approval Controls */}
                  <div className="p-6 md:col-span-1 border-r space-y-5">
                    <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">✓</span> 
                      Cabina de Aprobación
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unidades Verificadas Reales</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.unitsVerified}
                        onChange={e => handleReviewChange(ev.id, 'unitsVerified', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 font-bold text-emerald-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">Define cuánto Escrow se liberará.</p>
                    </div>

                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg">
                      <div className="text-xs text-emerald-700 font-medium tracking-wide uppercase">Payout Estimado</div>
                      <div className="text-2xl font-bold text-emerald-900">${possiblePayout.toLocaleString('es-CL')}</div>
                    </div>

                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Habilitar Nuevo Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.newStockApproved}
                        onChange={e => handleReviewChange(ev.id, 'newStockApproved', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg font-bold text-blue-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">Stock que el partner podrá vender a partir de ahora.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notas Internas / Feedback</label>
                      <textarea
                        rows={2}
                        value={formData.adminNotes}
                        onChange={e => handleReviewChange(ev.id, 'adminNotes', e.target.value)}
                        placeholder="Feedback sobre calidad de fotos, motivos de corrección numéricas..."
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>

                    <button
                      onClick={() => handleApprove(ev.id)}
                      disabled={processing}
                      className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-200"
                    >
                      Aprobar y Liberar Payout
                    </button>
                  </div>

                  {/* Right: Rejection Controls */}
                  <div className="p-6 md:col-span-1 space-y-5 bg-red-50/20">
                    <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                       <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">✕</span>
                      Rechazo / Congelamiento
                    </h4>
                    
                    <p className="text-sm text-gray-600">
                      Si la evidencia no justifica la entrega, retenemos el Escrow.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Motivo del Rechazo (Visible al Partner)</label>
                      <textarea
                        rows={3}
                        value={formData.rejectReason}
                        onChange={e => handleReviewChange(ev.id, 'rejectReason', e.target.value)}
                        placeholder="Ej: Las fotos no corresponden a las coordenadas, las guías de despacho están adulteradas..."
                        className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                      <input
                        type="checkbox"
                        id={`freeze-${ev.id}`}
                        checked={formData.freezeStock}
                        onChange={e => handleReviewChange(ev.id, 'freezeStock', e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor={`freeze-${ev.id}`} className="text-sm font-bold text-red-800">
                        Congelar Ventas Inmediatamente
                      </label>
                    </div>
                    <p className="text-xs text-red-600">Si congelas, el proyecto pasa a estado "paused" impidiendo compensaciones de usuarios B2C/B2B.</p>

                    <button
                      onClick={() => handleReject(ev.id)}
                      disabled={processing}
                      className="w-full py-3 bg-white border-2 border-red-600 text-red-700 font-bold rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Rechazar Evidencia (Retener Payout)
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historical Section */}
      {pastEvidence.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Revisiones</h2>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciclo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verificados</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout Liberado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Aprobado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pastEvidence.map(ev => (
                  <tr key={ev.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ev.periodMonth}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${EVIDENCE_STATUS_COLORS[ev.status]}`}>
                        {EVIDENCE_STATUS_LABELS[ev.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ev.unitsVerified ?? '-'}/{ev.unitsDelivered}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                      {ev.payoutApproved ? `$${ev.payoutAmount?.toLocaleString('es-CL')}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ev.newStockApproved ?? '-'} {project.impact_unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {ev.adminNotes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyEvidenceReviewPage;
