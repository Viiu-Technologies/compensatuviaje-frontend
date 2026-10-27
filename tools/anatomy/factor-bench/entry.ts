// Página de verificación independiente de la mesa de factores (fuera de React).
import { plateHtml } from '../../../src/shared/iso/iso-kit.ts';
import { figureSvg } from '../../../src/apps/public/components/factorBench/art.ts';
import { COPY } from '../../../src/apps/public/components/factorBench/copy.ts';
import { mountFactorBench, startPose, startReadout } from '../../../src/apps/public/components/factorBench/live.ts';
import { blocksBehind } from '../../../src/apps/public/components/factorBench/view.ts';

const pose = startPose();
const main = document.querySelector('main')!;
main.innerHTML = plateHtml({
  fig: COPY.fig,
  title: COPY.title,
  hint: COPY.hint,
  readout: startReadout(),
  keys: [...COPY.keys],
  caption: COPY.caption,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="${COPY.aria}">${figureSvg(pose, blocksBehind(pose.x, pose.y))}</div>`,
});
mountFactorBench(main.querySelector('.iso-stage')!, main.querySelector('[data-readout]'));
