/**
 * Mi cuenta y privacidad (Ley 21.719).
 *
 * Permite ejercer desde la web, sin instalar la app, los derechos de acceso y
 * portabilidad (descargar todos los datos en JSON) y de supresión (eliminar la
 * cuenta). Antes solo se podía eliminar la cuenta desde las apps móviles.
 *
 * Backend: GET /api/b2c/auth/export y DELETE /api/b2c/auth/account.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaUserShield, FaTrashAlt, FaEnvelope } from 'react-icons/fa';
import B2CLayout from '../components/B2CLayout';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { Card, CardHeader, Dialog, btn } from '../ui';
import { LEGAL, LEGAL_ROUTES } from '../../../shared/config/legal';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';
const CONFIRM_WORD = 'ELIMINAR';

/** Mensajes para los códigos de error del borrado. Apple necesita volver a autenticarse desde la app. */
function deleteErrorMessage(code?: string): string {
  switch (code) {
    case 'APPLE_REAUTH_REQUIRED':
    case 'APPLE_IDENTITY_UNAVAILABLE':
      return `Como iniciaste sesión con Apple, por seguridad Apple pide confirmar la eliminación desde la app de iOS. Si no tienes la app, escríbenos a ${LEGAL.emails.privacy} y la eliminamos por ti.`;
    case 'AUTH_IDENTITY_UNAVAILABLE':
    case 'AUTH_IDENTITY_MISMATCH':
      return 'Tu sesión no se pudo verificar. Cierra sesión, vuelve a entrar e inténtalo de nuevo.';
    default:
      return `No pudimos eliminar tu cuenta. Inténtalo nuevamente o escríbenos a ${LEGAL.emails.privacy}.`;
  }
}

const B2CAccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const token = await authService.getAccessToken();
      const response = await fetch(`${API_URL}/b2c/auth/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compensatuviaje-mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(`No pudimos generar la descarga. Inténtalo nuevamente o escríbenos a ${LEGAL.emails.privacy}.`);
    } finally {
      setDownloading(false);
    }
  };

  const closeDialog = () => {
    if (deleting) return;
    setDialogOpen(false);
    setConfirmText('');
    setDeleteError(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = await authService.getAccessToken();
      const response = await fetch(`${API_URL}/b2c/auth/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.success) {
        setDeleteError(deleteErrorMessage(body.error_code));
        setDeleting(false);
        return;
      }
      // La cuenta ya no existe: se cierra la sesión local y se vuelve al inicio.
      await logout().catch(() => undefined);
      navigate('/', { replace: true, state: { accountDeleted: true } });
    } catch {
      setDeleteError(deleteErrorMessage());
      setDeleting(false);
    }
  };

  const confirmed = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  return (
    <B2CLayout title="Mi cuenta y privacidad" subtitle="Tus datos personales y cómo ejercer tus derechos">
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader
            icon={FaUserShield}
            title="Tus datos"
            subtitle="Lo que guardamos de ti y para qué"
          />
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm m-0">
            <div>
              <dt className="text-gray-500">Nombre</dt>
              <dd className="m-0 text-gray-900 font-medium">{user?.nombre || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Correo</dt>
              <dd className="m-0 text-gray-900 font-medium break-all">{user?.email || '—'}</dd>
            </div>
          </dl>
          <p className="text-sm text-gray-600 mt-4 mb-0">
            Usamos tus datos para calcular y compensar tu huella, emitir tus certificados y procesar tus pagos.
            Tienes derecho a acceder a ellos, corregirlos, llevártelos y pedir que los eliminemos.
            Más detalle en la <a href={LEGAL_ROUTES.privacy} className="text-brand-700 underline">política de privacidad</a>.
          </p>
        </Card>

        <Card>
          <CardHeader
            icon={FaDownload}
            title="Descargar mis datos"
            subtitle="Un archivo con todo lo que guardamos sobre ti"
          />
          <p className="text-sm text-gray-600 mt-0">
            Incluye tu perfil, cálculos, viajes, certificados, pagos, insignias y tu suscripción al newsletter,
            en formato JSON para que puedas guardarlo o llevarlo a otro servicio.
          </p>
          <button type="button" onClick={handleDownload} disabled={downloading} className={btn.primary}>
            <FaDownload aria-hidden="true" /> {downloading ? 'Preparando…' : 'Descargar mis datos'}
          </button>
          {downloadError && <p role="alert" className="text-sm text-rose-700 mt-3 mb-0">{downloadError}</p>}
        </Card>

        <Card>
          <CardHeader
            icon={FaTrashAlt}
            title="Eliminar mi cuenta"
            subtitle="Esta acción no se puede deshacer"
          />
          <ul className="text-sm text-gray-600 mt-0 pl-5 space-y-1">
            <li>Se borran tu perfil, tus viajes, los cálculos sin compensar, tus insignias y tu suscripción al newsletter.</li>
            <li>Las compensaciones pagadas, sus pagos y certificados se conservan <b>sin tus datos personales</b>, porque la ley nos obliga a guardar los registros contables.</li>
            <li>Si quieres una copia, descarga tus datos antes de eliminar la cuenta.</li>
          </ul>
          <button type="button" onClick={() => setDialogOpen(true)} className={btn.danger}>
            <FaTrashAlt aria-hidden="true" /> Eliminar mi cuenta
          </button>
        </Card>

        <p className="text-sm text-gray-500 flex items-center gap-2 m-0">
          <FaEnvelope aria-hidden="true" />
          ¿Dudas sobre tus datos? Escríbenos a{' '}
          <a href={`mailto:${LEGAL.emails.privacy}`} className="text-brand-700 underline">{LEGAL.emails.privacy}</a>
        </p>
      </div>

      <Dialog
        open={dialogOpen}
        title="¿Eliminar tu cuenta?"
        onClose={closeDialog}
        busy={deleting}
        footer={
          <>
            <button type="button" onClick={closeDialog} disabled={deleting} className={btn.secondary}>Cancelar</button>
            <button type="button" onClick={handleDelete} disabled={!confirmed || deleting} className={btn.danger}>
              {deleting ? 'Eliminando…' : 'Eliminar definitivamente'}
            </button>
          </>
        }
      >
        <p className="mt-0">
          Se eliminarán tus datos personales y no podrás recuperar la cuenta.
          Para confirmar, escribe <b>{CONFIRM_WORD}</b>:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={deleting}
          autoComplete="off"
          aria-label={`Escribe ${CONFIRM_WORD} para confirmar`}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
        />
        {deleteError && <p role="alert" className="text-sm text-rose-700 mt-3 mb-0">{deleteError}</p>}
      </Dialog>
    </B2CLayout>
  );
};

export default B2CAccountPage;
