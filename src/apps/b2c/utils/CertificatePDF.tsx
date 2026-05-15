import { saveAs } from 'file-saver';
// Obtenemos la URL del backend desde las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';
export interface CertificatePDFData {
  certificateNumber: string;
  userName: string;
  userEmail?: string;
  co2Tons: number;
  co2Kg: number;
  origin: string;
  destination: string;
  date: string;
  projectName: string;
  treesEquiv: number;
  carKmAvoided: number;
  waterLiters: number;
  nftTxHash?: string | null;
  unitsFinanced?: number | null;
  impactUnit?: string | null;
}
export const downloadCertificatePDF = async (data: CertificatePDFData) => {
  try {
    // 1. Formatear las fechas para que se vean bien en español
    const offsetDateFormatted = new Date(data.date).toLocaleDateString('es-ES', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
    const generatedDateFormatted = new Date().toLocaleDateString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    });
    // 2. Hacer la petición POST al nuevo endpoint de Puppeteer
    const response = await fetch(`${API_URL}/public/certificates/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        certificateId: data.certificateNumber,
        recipientName: data.userName, 
        originIata: data.origin, 
        originCity: data.origin,
        destinationIata: data.destination,
        destinationCity: data.destination,
        co2kg: data.co2Kg,
        co2tons: data.co2Tons,
        equivTrees: data.treesEquiv,
        equivWater: data.waterLiters,
        equivCar: data.carKmAvoided,
        projectName: data.projectName,
        offsetDate: offsetDateFormatted,
        generatedDate: generatedDateFormatted,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
    }
    // 3. Obtener el archivo como Blob y forzar la descarga en el navegador
    const blob = await response.blob();
    const filename = `certificado-${data.certificateNumber || 'compensatuviaje'}.pdf`;
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error al generar el PDF del certificado:', error);
    alert('Hubo un problema al generar tu certificado. Por favor, intenta de nuevo más tarde.');
  }
};
// Componente React vacío por si en otros archivos aún lo intentaban renderizar (para evitar crasheos de importación)
export default function CertificatePDF() {
  return null;
}