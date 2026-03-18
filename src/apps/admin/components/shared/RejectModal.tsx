import React, { useState } from 'react';
import { XCircle, AlertCircle } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title: string;
  itemName: string;
  loading?: boolean;
}

const RejectModal: React.FC<RejectModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  itemName,
  loading = false
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError('El motivo debe tener al menos 10 caracteres');
      return;
    }
    setError('');
    await onConfirm(reason);
  };

  return (
    <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !p-4 !bg-black/50 !backdrop-blur-sm">
      <div className="!bg-white !rounded-xl !shadow-xl !max-w-md !w-full !overflow-hidden">
        {/* Header */}
        <div className="!flex !items-center !justify-between !p-4 !border-b !bg-red-50">
          <div className="!flex !items-center !gap-2 !text-red-700">
            <XCircle className="!w-5 !h-5" />
            <h3 className="!font-semibold">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="!text-slate-400 hover:!text-slate-600 !transition-colors"
            disabled={loading}
          >
            <svg className="!w-5 !h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="!p-6 !space-y-4">
          <p className="!text-sm !text-slate-600">
            Estás a punto de rechazar: <span className="!font-medium !text-slate-900">{itemName}</span>
          </p>

          <div>
            <label className="!block !text-sm !font-medium !text-slate-700 !mb-1">
              Motivo del rechazo <span className="!text-red-500">*</span>
            </label>
            <p className="!text-xs !text-slate-500 !mb-2">
              Este mensaje será enviado al partner para que pueda corregir el problema.
            </p>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.length >= 10) setError('');
              }}
              placeholder="Explica detalladamente por qué se rechaza esta evaluación..."
              className={`!w-full !p-3 !border !rounded-lg !focus:ring-2 !focus:ring-red-500 !focus:border-red-500 !min-h-[120px] ${
                error ? '!border-red-300 !bg-red-50' : '!border-slate-300'
              }`}
              disabled={loading}
            />
            {error && (
              <div className="!flex !items-center !gap-1 !mt-1 !text-red-600 !text-xs">
                <AlertCircle className="!w-3 !h-3" />
                <span>{error}</span>
              </div>
            )}
            <div className={`!text-right !text-xs !mt-1 ${reason.length < 10 ? '!text-red-500' : '!text-slate-500'}`}>
              {reason.length}/10 caracteres mínimo
            </div>
          </div>

          {/* Footer */}
          <div className="!flex !items-center !justify-end !gap-3 !pt-4 !border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="!px-4 !py-2 !text-slate-700 !bg-slate-100 hover:!bg-slate-200 !rounded-lg !transition-colors !font-medium disabled:!opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || reason.trim().length < 10}
              className="!px-4 !py-2 !text-white !bg-red-600 hover:!bg-red-700 !rounded-lg !transition-colors !font-medium !flex !items-center !gap-2 disabled:!opacity-50 disabled:!cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="!w-4 !h-4 !animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="!opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="!opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Rechazando...
                </>
              ) : (
                'Confirmar Rechazo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;
