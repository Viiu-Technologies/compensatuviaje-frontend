import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import b2cApi from '../services/b2cApi';

/**
 * Descarga el PDF de un certificado.
 *
 * El PDF lo arma el servidor con los datos guardados del certificado y solo se lo
 * entrega a su dueño, así que aquí no se calcula ni se envía nada más que el id.
 */
export const downloadCertificatePDF = async (certificate: { id: string; certificateNumber?: string }) => {
  try {
    const { blob, filename } = await b2cApi.downloadCertificatePdf(certificate.id);
    saveAs(blob, filename || `certificado-${certificate.certificateNumber || 'compensatuviaje'}.pdf`);
  } catch (error) {
    console.error('Error al descargar el PDF del certificado:', error);
    toast.error('No pudimos generar tu certificado. Vuelve a intentarlo en unos minutos.');
  }
};
