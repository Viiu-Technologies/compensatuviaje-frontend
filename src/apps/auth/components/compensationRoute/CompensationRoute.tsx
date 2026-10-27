import React, { useEffect, useMemo, useRef } from 'react';
import { plateHtml } from '../../../../shared/iso/iso-kit.ts';
import '../../../../shared/iso/iso.css';
import { figureSvg } from './art.ts';
import { COPY } from './copy.ts';
import { mountCompensationRoute, restPose } from './live.ts';
import { readoutOf, type Trip } from './model.ts';
import { slotOf } from './view.ts';
import './CompensationRoute.css';

/**
 * Fig. 2, "La ruta de tu compensación": lo que pasa después de iniciar sesión,
 * como una línea de embalaje. Continúa la serie de la Fig. 1 (mesa de
 * factores, en /calculadora). Siempre en tema claro, como el resto de las
 * figuras públicas. `trip` es el vuelo que trae la URL de destino, si lo hay.
 */
const CompensationRoute: React.FC<{ trip: Trip | null; caption?: boolean }> = ({ trip, caption = true }) => {
  const root = useRef<HTMLDivElement>(null);

  // La tarjeta se arma una vez por vuelo; después solo cambian atributos.
  const html = useMemo(() => {
    const pose = restPose(0);
    return plateHtml({
      fig: COPY.fig,
      title: COPY.title,
      hint: COPY.hint,
      readout: readoutOf(0, trip),
      caption: caption ? COPY.caption : undefined,
      body: `<div class="iso-stage" tabindex="0" role="slider" aria-valuemin="1" aria-valuemax="4" aria-label="${COPY.aria}">${figureSvg(pose, slotOf(pose.x))}</div>`,
    });
  }, [trip, caption]);

  useEffect(() => {
    const el = root.current;
    const stage = el?.querySelector<HTMLElement>('.iso-stage');
    if (!el || !stage) return;
    return mountCompensationRoute(stage, el.querySelector<HTMLElement>('[data-readout]'), trip);
  }, [html, trip]);

  return <div ref={root} className="iso compensation-route" data-theme="light" dangerouslySetInnerHTML={{ __html: html }} />;
};

export default CompensationRoute;
