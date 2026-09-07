import React from 'react';
import { HiShieldCheck, HiCheckCircle } from 'react-icons/hi';
import './StandardsRibbon.css';

interface StandardItem {
  name: string;
  category: string;
  scope: string;
  code: string;
}

const STANDARDS: StandardItem[] = [
  {
    name: 'DEFRA 2024',
    category: 'Factores de Emisión',
    scope: 'UK Gov Greenhouse Gas Reporting',
    code: 'DEFRA-24',
  },
  {
    name: 'GHG Protocol',
    category: 'Estándar Global',
    scope: 'Corporate Scope 3 (Cat. 6)',
    code: 'GHG-SCOPE3',
  },
  {
    name: 'ICAO Carbon',
    category: 'Aviación Civil',
    scope: 'United Nations Standard Methodology',
    code: 'ICAO-UN',
  },
  {
    name: 'Verra VCS',
    category: 'Registro Internacional',
    scope: 'Verified Carbon Standard Registries',
    code: 'VCS-AUTH',
  },
  {
    name: 'Gold Standard',
    category: 'Certificación ODS',
    scope: 'Climate Security & Sustainable Development',
    code: 'GS-GLOBAL',
  },
  {
    name: 'Polygon PoS',
    category: 'Trazabilidad Inmutable',
    scope: 'Auditoría Criptográfica Descentralizada',
    code: 'CHAIN-AUDIT',
  },
];

export const StandardsRibbon: React.FC = () => {
  return (
    <section className="st-ribbon-section" aria-label="Estándares y metodologías de cálculo">
      <div className="st-ribbon-container">
        <div className="st-ribbon-intro">
          <span className="st-ribbon-badge">
            <HiShieldCheck aria-hidden="true" />
            Rigor y Auditoría
          </span>
          <p className="st-ribbon-text">
            Metodologías oficiales validadas para cálculo individual y reportes corporativos de sostenibilidad:
          </p>
        </div>

        <div className="st-ribbon-track-wrapper">
          <div className="st-ribbon-track" aria-hidden="true">
            {[...STANDARDS, ...STANDARDS].map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="st-item">
                <div className="st-item-header">
                  <span className="st-item-name">{item.name}</span>
                  <HiCheckCircle className="st-item-check" aria-hidden="true" />
                </div>
                <div className="st-item-category">{item.category}</div>
                <div className="st-item-scope">{item.scope}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StandardsRibbon;
