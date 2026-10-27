// Página de verificación de las figuras de "Cómo funciona", fuera de React.
import { FIGURES, type FigureKind } from '../../../src/apps/public/components/stepFigures/figures.ts';
import { clockAt } from '../../../src/apps/public/components/stepFigures/model.ts';

const params = new URLSearchParams(location.search);
const frozen = params.has('t') ? Number(params.get('t')) : null;
const still = params.has('still');
const only = params.get('only');
const main = document.querySelector('main')!;
const kinds = (Object.keys(FIGURES) as FigureKind[]).filter((kind) => !only || kind === only);

const cards = kinds.map((kind) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.kind = kind;
  card.innerHTML = `${FIGURES[kind].figure()}<p></p>`;
  main.appendChild(card);
  return { kind, svg: card.querySelector('svg')!, readout: card.querySelector('p')! };
});

function frame(now: number) {
  const clock = clockAt(frozen ?? now / 1000, still);
  for (const card of cards) card.readout.textContent = FIGURES[card.kind].apply(card.svg, clock);
  if (frozen === null && !still) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
