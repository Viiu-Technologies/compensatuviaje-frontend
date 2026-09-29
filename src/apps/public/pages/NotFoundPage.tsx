import React from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';
import './NotFoundPage.css';
import { useSeo } from '../../../shared/utils/useSeo';

/**
 * Página 404.
 *
 * Antes, el catch-all del router redirigía cualquier URL desconocida a
 * /dashboard, que está protegido: quien llegaba con un enlace roto acababa
 * en el login sin saber que la dirección no existía. Esta página lo dice y
 * ofrece las tres salidas útiles del producto.
 */
const NotFoundPage: React.FC = () => {
  // Vercel responde 200 a cualquier ruta (SPA); el noindex evita que Google
  // indexe URLs inexistentes como páginas válidas (soft 404).
  useSeo({ title: 'Página no encontrada', noindex: true });

  return (
    <main className="nf-page">
      <div className="nf-inner">
        <p className="nf-code">Error 404</p>

        <h1 className="nf-title">Esta página no existe</h1>

        <p className="nf-text">
          Puede que el enlace esté mal escrito o que la página se haya movido.
          Desde aquí puedes seguir por otro camino.
        </p>

        <div className="nf-actions">
          <Link to="/" className="nf-btn nf-btn--primary">
            Volver al inicio
            <HiArrowRight aria-hidden="true" />
          </Link>
          <Link to="/#calculadora" className="nf-btn">
            Calcular la huella de un vuelo
          </Link>
          <Link to="/#verificar" className="nf-btn">
            Verificar un certificado
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
