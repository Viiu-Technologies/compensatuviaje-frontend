import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaPlane } from 'react-icons/fa';
import { cx } from '../ui';

/**
 * Vuelo / Terrestre en la calculadora (Orden 9). Son enlaces, no pestañas:
 * cada modo tiene su URL (/b2c/calculator y ?mode=ground) para poder llegar
 * directo desde "Mis viajes" y volver con Atrás.
 */
const CalculatorModeSwitch: React.FC<{ active: 'flight' | 'ground' }> = ({ active }) => (
  <nav aria-label="Tipo de cálculo" className="mb-5">
    <div className="b2cc-toggle max-w-xs">
      <Link
        to="/b2c/calculator"
        aria-current={active === 'flight' ? 'page' : undefined}
        className={cx('b2cc-toggle-btn inline-flex items-center justify-center gap-2 no-underline', active === 'flight' && 'b2cc-toggle-btn--active')}
      >
        <FaPlane aria-hidden="true" /> Vuelo
      </Link>
      <Link
        to="/b2c/calculator?mode=ground"
        aria-current={active === 'ground' ? 'page' : undefined}
        className={cx('b2cc-toggle-btn inline-flex items-center justify-center gap-2 no-underline', active === 'ground' && 'b2cc-toggle-btn--active')}
      >
        <FaCar aria-hidden="true" /> Terrestre
      </Link>
    </div>
  </nav>
);

export default CalculatorModeSwitch;
