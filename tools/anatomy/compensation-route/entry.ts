// Página de verificación independiente de "La ruta de tu compensación" (fuera de React).
// ?trip=SCL-MAD-2-1 simula llegar con un vuelo; ?step=n arranca en otra etapa.
import { plateHtml } from '../../../src/shared/iso/iso-kit.ts';
import { figureSvg } from '../../../src/apps/auth/components/compensationRoute/art.ts';
import { COPY } from '../../../src/apps/auth/components/compensationRoute/copy.ts';
import { mountCompensationRoute, restPose } from '../../../src/apps/auth/components/compensationRoute/live.ts';
import { readoutOf, tripOf } from '../../../src/apps/auth/components/compensationRoute/model.ts';
import { slotOf } from '../../../src/apps/auth/components/compensationRoute/view.ts';

const params = new URLSearchParams(location.search);
const [origin, destination, passengers, round] = (params.get('trip') || '').split('-');
const trip = tripOf(origin ? `?origin=${origin}&destination=${destination}&passengers=${passengers || 1}&roundTrip=${round === '1'}` : '');
const step = Math.max(0, Math.min(3, Number(params.get('step') || 0)));
const pose = restPose(step);
const main = document.querySelector('main')!;
main.innerHTML = plateHtml({
  fig: COPY.fig,
  title: COPY.title,
  hint: COPY.hint,
  readout: readoutOf(step, trip),
  keys: [...COPY.keys],
  caption: COPY.caption,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-valuemin="1" aria-valuemax="4" aria-label="${COPY.aria}">${figureSvg(pose, slotOf(pose.x))}</div>`,
});
mountCompensationRoute(main.querySelector('.iso-stage')!, main.querySelector('[data-readout]'), trip, step);
