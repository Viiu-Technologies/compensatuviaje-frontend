import { jsPDF } from 'jspdf';

interface CertificateForPDF {
  id: string;
  certificateNumber: string;
  date: string;
  co2Compensated: number;
  project: string;
  flightRoute?: string | null;
  status: string;
  nftTxHash?: string | null;
}

/**
 * Genera un PDF profesional del certificado de compensación CO₂
 * usando jsPDF directamente (sin necesidad de DOM/html2canvas)
 */
export function generateCertificatePDF(cert: CertificateForPDF): void {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  const treesEquiv = Math.round(cert.co2Compensated * 50);
  const waterEquiv = Math.round(cert.co2Compensated * 5000);
  const dateStr = new Date(cert.date).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // ── Background ──
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, w, h, 'F');

  // ── Green header band ──
  pdf.setFillColor(22, 163, 74); // green-600
  pdf.rect(0, 0, w, 70, 'F');

  // Subtle accent strip
  pdf.setFillColor(5, 150, 105); // emerald-600
  pdf.rect(0, 65, w, 5, 'F');

  // ── Header text ──
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('COMPENSA TU VIAJE', w / 2, 18, { align: 'center' });

  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Certificado de Compensación', w / 2, 32, { align: 'center' });
  pdf.text('de Huella de Carbono', w / 2, 42, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`N° ${cert.certificateNumber}`, w / 2, 55, { align: 'center' });

  // ── Decorative border ──
  pdf.setDrawColor(187, 247, 208); // green-200
  pdf.setLineWidth(0.8);
  pdf.roundedRect(15, 80, w - 30, h - 100, 4, 4, 'S');

  // ── Verification badge ──
  const badgeY = 90;
  if (cert.status === 'verified' || cert.status === 'issued') {
    pdf.setFillColor(220, 252, 231); // green-100
    pdf.roundedRect(w / 2 - 25, badgeY - 4, 50, 10, 3, 3, 'F');
    pdf.setTextColor(22, 101, 52); // green-800
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('✓ VERIFICADO', w / 2, badgeY + 3, { align: 'center' });
  }

  // ── CO₂ Amount (main highlight) ──
  const co2Y = 115;
  pdf.setFillColor(240, 253, 244); // green-50
  pdf.roundedRect(30, co2Y - 10, w - 60, 35, 4, 4, 'F');

  pdf.setTextColor(21, 128, 61); // green-700
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${cert.co2Compensated.toFixed(2)} t`, w / 2, co2Y + 10, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('CO₂ Compensado', w / 2, co2Y + 20, { align: 'center' });

  // ── Details section ──
  let y = co2Y + 45;
  const labelX = 35;
  const valueX = 80;

  const addDetailRow = (label: string, value: string) => {
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(label, labelX, y);

    pdf.setTextColor(17, 24, 39); // gray-900
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, valueX, y);
    y += 10;
  };

  addDetailRow('Fecha:', dateStr);
  addDetailRow('Proyecto:', cert.project);

  if (cert.flightRoute) {
    addDetailRow('Ruta:', cert.flightRoute);
  }

  if (cert.nftTxHash) {
    addDetailRow('NFT TX:', cert.nftTxHash.slice(0, 20) + '...');
  }

  // ── Equivalencies section ──
  y += 10;
  pdf.setDrawColor(229, 231, 235); // gray-200
  pdf.setLineWidth(0.3);
  pdf.line(30, y, w - 30, y);
  y += 12;

  pdf.setTextColor(17, 24, 39);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Impacto Ambiental Equivalente', w / 2, y, { align: 'center' });
  y += 15;

  // Trees box
  const boxW = (w - 80) / 2;
  const boxH = 30;
  const box1X = 35;
  const box2X = box1X + boxW + 10;

  // Trees
  pdf.setFillColor(240, 253, 244); // green-50
  pdf.roundedRect(box1X, y, boxW, boxH, 3, 3, 'F');
  pdf.setTextColor(21, 128, 61);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${treesEquiv}`, box1X + boxW / 2, y + 14, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Árboles equivalentes', box1X + boxW / 2, y + 24, { align: 'center' });

  // Water
  pdf.setFillColor(239, 246, 255); // blue-50
  pdf.roundedRect(box2X, y, boxW, boxH, 3, 3, 'F');
  pdf.setTextColor(29, 78, 216); // blue-700
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${(waterEquiv / 1000).toFixed(1)}k`, box2X + boxW / 2, y + 14, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Litros de agua', box2X + boxW / 2, y + 24, { align: 'center' });

  // ── Footer ──
  const footerY = h - 30;
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.3);
  pdf.line(30, footerY, w - 30, footerY);

  pdf.setTextColor(156, 163, 175); // gray-400
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Este certificado fue emitido por CompensaTuViaje.com', w / 2, footerY + 8, { align: 'center' });
  pdf.text('Verificable en https://compensatuviaje.com/verificar', w / 2, footerY + 14, { align: 'center' });
  pdf.text(`Generado el ${new Date().toLocaleDateString('es-CL')}`, w / 2, footerY + 20, { align: 'center' });

  // ── Save ──
  pdf.save(`certificado-${cert.certificateNumber || cert.id}.pdf`);
}
