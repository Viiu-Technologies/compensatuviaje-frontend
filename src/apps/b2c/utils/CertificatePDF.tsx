import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// ── Types ──
interface CertificatePDFData {
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
}

// ── Styles ──
const green = '#16a34a';
const greenDark = '#15803d';
const greenLight = '#dcfce7';
const greenBg = '#f0fdf4';
const gray = '#6b7280';
const grayDark = '#374151';
const grayLight = '#f3f4f6';
const blue = '#2563eb';
const blueBg = '#eff6ff';

const s = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  // Header
  header: {
    backgroundColor: green,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 40,
    marginBottom: 0,
  },
  headerAccent: {
    backgroundColor: '#059669',
    height: 5,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  headerMain: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSub: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  headerCertNum: {
    color: '#bbf7d0',
    fontSize: 11,
    textAlign: 'center',
  },
  // Body
  body: {
    paddingHorizontal: 40,
    paddingTop: 24,
  },
  // Verified badge
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: greenLight,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 16,
  },
  badgeText: {
    color: greenDark,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  // User section
  userSection: {
    textAlign: 'center',
    marginBottom: 16,
  },
  certifiesText: {
    color: gray,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
  },
  userName: {
    color: greenDark,
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#bbf7d0',
    paddingBottom: 6,
    marginHorizontal: 60,
  },
  // Flight route
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  routeAirport: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: grayDark,
  },
  routeArrow: {
    fontSize: 14,
    color: green,
    fontFamily: 'Helvetica-Bold',
  },
  routeLine: {
    width: 40,
    height: 1,
    backgroundColor: '#86efac',
  },
  // CO2 box
  co2Box: {
    backgroundColor: green,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginHorizontal: 60,
    marginBottom: 20,
    alignItems: 'center',
  },
  co2Amount: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  co2Label: {
    fontSize: 11,
    color: '#bbf7d0',
    textAlign: 'center',
    marginTop: 2,
  },
  // Equivalencies
  equivRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  equivBox: {
    width: 130,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  equivBoxGreen: {
    backgroundColor: greenBg,
  },
  equivBoxBlue: {
    backgroundColor: blueBg,
  },
  equivBoxGray: {
    backgroundColor: grayLight,
  },
  equivIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  equivValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: grayDark,
    textAlign: 'center',
  },
  equivLabel: {
    fontSize: 8,
    color: gray,
    textAlign: 'center',
    marginTop: 2,
  },
  // Details
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
    marginHorizontal: 0,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailBlock: {},
  detailLabel: {
    fontSize: 9,
    color: gray,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: grayDark,
  },
  // NFT
  nftBox: {
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  nftTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#6d28d9',
    marginBottom: 3,
  },
  nftHash: {
    fontSize: 7,
    color: '#7c3aed',
  },
  // Stamp
  stampBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stamp: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampLeaf: {
    fontSize: 22,
    color: green,
    textAlign: 'center',
  },
  stampText: {
    fontSize: 7,
    color: green,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 2,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 2,
  },
});

// ── PDF Document Component ──
const CertificateDocument: React.FC<{ data: CertificatePDFData }> = ({ data }) => {
  const dateStr = new Date(data.date).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Green Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>COMPENSA TU VIAJE</Text>
          <Text style={s.headerMain}>Certificado de Compensacion</Text>
          <Text style={s.headerSub}>de Huella de Carbono</Text>
          <Text style={s.headerCertNum}>N. {data.certificateNumber}</Text>
        </View>
        <View style={s.headerAccent} />

        <View style={s.body}>
          {/* Verified Badge */}
          <View style={s.badgeRow}>
            <View style={s.badge}>
              <Text style={s.badgeText}>CERTIFICADO VERIFICADO</Text>
            </View>
          </View>

          {/* User */}
          <Text style={s.certifiesText}>Este documento certifica que</Text>
          <Text style={s.userName}>{data.userName}</Text>
          <View style={{ height: 16 }} />

          {/* Flight Route */}
          {data.origin && data.destination ? (
            <>
              <Text style={{ fontSize: 10, color: gray, textAlign: 'center', marginBottom: 8 }}>
                ha compensado las emisiones de su vuelo
              </Text>
              <View style={s.routeRow}>
                <Text style={s.routeAirport}>{data.origin}</Text>
                <View style={s.routeLine} />
                <Text style={s.routeArrow}>{'>>>'}</Text>
                <View style={s.routeLine} />
                <Text style={s.routeAirport}>{data.destination}</Text>
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 10, color: gray, textAlign: 'center', marginBottom: 16 }}>
              ha compensado exitosamente sus emisiones de carbono
            </Text>
          )}

          {/* CO2 Amount */}
          <View style={s.co2Box}>
            <Text style={s.co2Amount}>{data.co2Kg.toLocaleString()} kg</Text>
            <Text style={s.co2Label}>de CO2 compensado ({data.co2Tons.toFixed(2)} toneladas)</Text>
          </View>

          {/* Equivalencies */}
          <View style={s.equivRow}>
            <View style={[s.equivBox, s.equivBoxGreen]}>
              <Text style={s.equivValue}>{data.treesEquiv}</Text>
              <Text style={s.equivLabel}>Arboles equivalentes</Text>
            </View>
            <View style={[s.equivBox, s.equivBoxBlue]}>
              <Text style={s.equivValue}>{(data.waterLiters / 1000).toFixed(1)}k</Text>
              <Text style={s.equivLabel}>Litros de agua</Text>
            </View>
            <View style={[s.equivBox, s.equivBoxGray]}>
              <Text style={s.equivValue}>{data.carKmAvoided.toLocaleString()}</Text>
              <Text style={s.equivLabel}>km auto evitados</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Details */}
          <View style={s.detailsRow}>
            <View style={s.detailBlock}>
              <Text style={s.detailLabel}>Proyecto de compensacion</Text>
              <Text style={s.detailValue}>{data.projectName}</Text>
            </View>
            <View style={s.detailBlock}>
              <Text style={s.detailLabel}>Fecha de compensacion</Text>
              <Text style={s.detailValue}>{dateStr}</Text>
            </View>
          </View>

          {/* NFT info */}
          {data.nftTxHash && (
            <View style={s.nftBox}>
              <Text style={s.nftTitle}>Certificado NFT en Blockchain</Text>
              <Text style={s.nftHash}>TX: {data.nftTxHash}</Text>
            </View>
          )}

          {/* Verification Stamp */}
          <View style={s.stampBox}>
            <View style={s.stamp}>
              <Text style={s.stampLeaf}>{'🌿'}</Text>
              <Text style={s.stampText}>VERIFICADO</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Este certificado fue emitido por CompensaTuViaje.com
          </Text>
          <Text style={s.footerText}>
            Verificable en https://compensatuviaje.com/verificar
          </Text>
          <Text style={s.footerText}>
            Generado el {new Date().toLocaleDateString('es-CL')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// ── Public API: generate and download ──
export async function downloadCertificatePDF(data: CertificatePDFData): Promise<void> {
  const blob = await pdf(<CertificateDocument data={data} />).toBlob();
  saveAs(blob, `certificado-${data.certificateNumber}.pdf`);
}

export type { CertificatePDFData };
