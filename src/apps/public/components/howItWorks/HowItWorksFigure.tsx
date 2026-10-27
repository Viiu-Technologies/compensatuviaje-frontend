import React from 'react';
import CertificateCard from './CertificateCard';
import Funnel from './Funnel';
import RouteMap from './RouteMap';
import { fmt, formula, useFlight, type Flight } from './flight';
import './HowItWorks.css';

/**
 * Figura de un paso de "Cómo funciona" con su línea de datos debajo. Las tres
 * cuentan el mismo vuelo: el de la calculadora del hero o, sin cálculo, un
 * ejemplo (y la línea lo dice).
 */

export type FigureKind = 'route' | 'funnel' | 'certificate';

const FIGURES: Record<FigureKind, React.FC> = {
  route: RouteMap,
  funnel: Funnel,
  certificate: CertificateCard,
};

const READOUT: Record<FigureKind, (f: Flight) => string> = {
  route: (f) =>
    `${f.from.code}→${f.to.code} · ${fmt.km(f)} · ${fmt.cabin(f).toLowerCase()} · ${fmt.pax(f)}${f.roundTrip ? ' · ida y vuelta' : ''}`,
  funnel: formula,
  certificate: (f) =>
    `${fmt.kg(f)}${f.priceCLP !== null ? ` · desde ${fmt.clp(f.priceCLP)}` : ''} · listo para compensar`,
};

const HowItWorksFigure: React.FC<{ kind: FigureKind }> = ({ kind }) => {
  const flight = useFlight();
  const Figure = FIGURES[kind];
  return (
    <div className="hw-step-art">
      <Figure />
      <p className="hw-readout">
        {flight.example && <span className="hw-readout__tag">Ejemplo</span>}
        {READOUT[kind](flight)}
      </p>
    </div>
  );
};

export default HowItWorksFigure;
