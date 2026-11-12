import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowLeft,
  HiArrowRight,
  HiDocumentDownload,
  HiExternalLink,
  HiInformationCircle,
  HiShieldCheck,
} from 'react-icons/hi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  DEFAULT_METHODOLOGY,
  getMethodology,
  getMethodologyPdfUrl,
  type MethodologyData,
} from '../services/publicApi';
import { PUBLIC_SEO } from '../../../shared/config/publicSeo';
import { useSeo } from '../../../shared/utils/useSeo';
import { useForceLightTheme } from '../../../shared/utils/useForceLightTheme';
import './MethodologyPage.css';

/**
 * Página pública /metodologia (decisión D4).
 *
 * Muestra la fórmula, distancia Haversine, tramos de vuelo y tabla oficial
 * DEFRA 2025 (con y sin forzamiento radiativo), hidratados desde el backend
 * (calculatorConstants.js) para garantizar que la documentación coincida siempre
 * con lo que calcula la plataforma.
 */
const MethodologyPage: React.FC = () => {
  const [data, setData] = useState<MethodologyData>(DEFAULT_METHODOLOGY);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useSeo(PUBLIC_SEO['/metodologia']);
  useForceLightTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    getMethodology(controller.signal).then((res) => {
      if (res.data) setData(res.data);
    });
    return () => controller.abort();
  }, []);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const response = await fetch(getMethodologyPdfUrl());
      if (!response.ok) throw new Error('PDF no disponible');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'metodologia-calculo-compensatuviaje.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Si el servicio PDF no responde en ese instante, ofrece impresión limpia A4 del navegador.
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="mtp-page">
      <Header />

      <main className="mtp-main">
        {/* Hero */}
        <section className="mtp-hero">
          <div className="mtp-container">
            <Link to="/calculadora" className="mtp-back-link">
              <HiArrowLeft aria-hidden="true" /> Volver a la calculadora
            </Link>

            <span className="mtp-eyebrow">
              <HiShieldCheck aria-hidden="true" /> Transparencia científica · {data.factorsVersion}
            </span>

            <h1 className="mtp-title">
              Cómo calculamos la huella de carbono de tus vuelos.
            </h1>

            <p className="mtp-lead">
              Cada cálculo emitido por CompensaTuViaje utiliza las tablas oficiales de{' '}
              <strong>{data.source.organization} ({data.methodology})</strong> y sigue las directrices del{' '}
              <strong>{data.standard}</strong>. Esta página y su ficha descargable leen directamente los mismos
              factores que usa nuestra calculadora.
            </p>

            <div className="mtp-actions">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="mtp-btn-primary"
              >
                <HiDocumentDownload aria-hidden="true" />
                {downloadingPdf ? 'Generando PDF…' : 'Descargar ficha en PDF (A4)'}
              </button>
              <Link to="/calculadora" className="mtp-btn-secondary">
                Ir a la calculadora <HiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Fórmula y distancia */}
        <section className="mtp-section">
          <div className="mtp-container">
            <h2 className="mtp-section-title">1. Fórmula base y distancia ortodrómica</h2>
            <p className="mtp-section-sub">
              {data.distance.method} (radio terrestre R = {data.distance.earthRadiusKm.toLocaleString('es-CL')} km).{' '}
              {data.formula.roundTripNote}
            </p>

            <div className="mtp-formula-box">
              <div className="mtp-formula-label">Fórmula aplicada ({data.formula.unit})</div>
              <div className="mtp-formula-code">
                Emisiones ({data.formula.unit}) = {data.formula.expression}
              </div>
            </div>

            <div className="mtp-grid-3">
              {data.hauls.map((haul) => (
                <article key={haul.code} className="mtp-card">
                  <span className="mtp-card__badge">{haul.code}</span>
                  <h3 className="mtp-card__title">{haul.label}</h3>
                  <p className="mtp-card__text">{haul.rule}</p>
                </article>
              ))}
            </div>

            <div className="mtp-callout">
              <HiInformationCircle className="mtp-callout__icon" aria-hidden="true" />
              <div>
                <strong>Desvíos de ruta y espera en vuelo (+8%):</strong> {data.distance.routeUpliftNote}
              </div>
            </div>
          </div>
        </section>

        {/* Tabla oficial DEFRA 2025 */}
        <section className="mtp-section mtp-section--tinted">
          <div className="mtp-container">
            <h2 className="mtp-section-title">
              2. Factores oficiales {data.factorsVersion} (kg CO₂e por pasajero-km)
            </h2>
            <p className="mtp-section-sub">{data.radiativeForcing.summary}</p>

            <div className="mtp-table-wrap">
              <table className="mtp-table">
                <thead>
                  <tr>
                    <th>Tramo (solo ida)</th>
                    <th>Clase de cabina</th>
                    <th className="mtp-num">Con RF (usado en cobro)</th>
                    <th className="mtp-num">Sin RF (línea base GHG)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.hauls.map((haul) =>
                    haul.cabins.map((cabin, idx) => (
                      <tr key={`${haul.code}-${cabin.code}`}>
                        {idx === 0 && (
                          <td rowSpan={haul.cabins.length} className="mtp-haul-cell">
                            <span className="mtp-haul-name">{haul.label}</span>
                            <span className="mtp-haul-rule">{haul.rule}</span>
                          </td>
                        )}
                        <td>{cabin.label}</td>
                        <td className="mtp-num">{cabin.withRf.toFixed(5)}</td>
                        <td className="mtp-num">{cabin.withoutRf.toFixed(5)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <a
              href={data.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mtp-source-link"
            >
              Consultar fuente oficial: {data.source.documentTitle} <HiExternalLink aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* Equivalencias y alcance */}
        <section className="mtp-section">
          <div className="mtp-container">
            <h2 className="mtp-section-title">3. Equivalencias informativas y alcance</h2>
            <p className="mtp-section-sub">
              Para ayudar a comprender la magnitud de cada tonelada compensada, mostramos únicamente
              equivalencias respaldadas por fuentes públicas verificables.
            </p>

            <div className="mtp-grid-2">
              <article className="mtp-card">
                <span className="mtp-card__badge">Equivalencia forestal urbana</span>
                <h3 className="mtp-card__title">
                  ~{data.equivalencies.trees.treesPerTonYear} árboles urbanos por tCO₂e al año
                </h3>
                <p className="mtp-card__text">
                  Basado en {data.equivalencies.trees.tCo2PerTreeYear} t CO₂ ({data.equivalencies.trees.kgPerTreeYear}{' '}
                  kg) absorbidas por un árbol urbano promedio durante sus primeros 10 años de crecimiento.
                </p>
                <a
                  href={data.equivalencies.trees.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mtp-source-link"
                >
                  {data.equivalencies.trees.source} <HiExternalLink aria-hidden="true" />
                </a>
              </article>

              <article className="mtp-card">
                <span className="mtp-card__badge">Equivalencia terrestre</span>
                <h3 className="mtp-card__title">
                  ~{data.equivalencies.car.kmPerTon.toLocaleString('es-CL')} km en auto promedio por tCO₂e
                </h3>
                <p className="mtp-card__text">
                  Basado en {data.equivalencies.car.kgCo2ePerKm.toFixed(5)} kg CO₂e por kilómetro recorrido en un
                  automóvil promedio (combustible mixto/desconocido).
                </p>
                <a
                  href={data.equivalencies.car.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mtp-source-link"
                >
                  {data.equivalencies.car.source} <HiExternalLink aria-hidden="true" />
                </a>
              </article>
            </div>

            <p className="mtp-note">{data.note}</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MethodologyPage;

