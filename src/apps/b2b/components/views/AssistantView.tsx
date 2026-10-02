import React from 'react';
import { Bot, Calculator, FileUp, Trees, Wrench } from 'lucide-react';
import { LEGAL } from '../../../../shared/config/legal';
import { btn, Card, cx, PageHeader } from '../../ui';

/**
 * Asistente IA: en mantenimiento.
 *
 * La versión anterior no usaba IA: respondía textos fijos según palabras
 * clave y, ante "analiza las emisiones de mi empresa", mostraba cifras
 * inventadas (445 tCO₂e, −12 % vs. el año anterior) como si fueran datos de
 * la cuenta. Queda fuera hasta conectarlo a un asistente real; el código
 * anterior está en el historial de git.
 */
const AssistantView: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const shortcuts = [
    { tab: 'calculadora', icon: Calculator, title: 'Calcular la huella de un vuelo', text: 'Con la calculadora de CO₂.' },
    { tab: 'manifiestos', icon: FileUp, title: 'Subir los vuelos de la empresa', text: 'Un CSV o Excel con todos los vuelos del mes.' },
    { tab: 'proyectos', icon: Trees, title: 'Ver proyectos para compensar', text: 'Proyectos verificados y su precio por tonelada.' },
  ];
  return (
    <div className="max-w-3xl">
      <PageHeader title="Asistente IA" subtitle="Tu consultor de sostenibilidad dentro de la plataforma." />
      <Card className="p-8 text-center">
        <span className="mx-auto mb-4 w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
          <Wrench className="w-6 h-6" aria-hidden="true" />
        </span>
        <h2 className="m-0 text-lg font-semibold text-gray-900">Estamos mejorando el asistente</h2>
        <p className="m-0 mt-2 text-sm text-gray-600 max-w-md mx-auto">
          Pronto podrá analizar las emisiones reales de tu empresa y recomendarte proyectos. Mientras tanto, estas herramientas
          ya funcionan con tus datos:
        </p>
        {onNavigate && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-left">
            {shortcuts.map((s) => (
              <button
                key={s.tab}
                type="button"
                onClick={() => onNavigate(s.tab)}
                className="rounded-xl border border-gray-200 bg-white p-4 text-left cursor-pointer hover:border-brand-600 hover:bg-brand-50/40 transition-colors"
              >
                <s.icon className="w-5 h-5 text-brand-700" aria-hidden="true" />
                <p className="m-0 mt-2 text-sm font-semibold text-gray-900">{s.title}</p>
                <p className="m-0 mt-0.5 text-xs text-gray-500">{s.text}</p>
              </button>
            ))}
          </div>
        )}
        <p className="m-0 mt-6 inline-flex items-center gap-1.5 text-xs text-gray-500">
          <Bot className="w-3.5 h-3.5" aria-hidden="true" />
          ¿Tienes una consulta ahora?{' '}
          <a href={`mailto:${LEGAL.emails.support}`} className={cx(btn.ghost, 'p-0 text-xs')}>
            Escríbenos
          </a>
        </p>
      </Card>
    </div>
  );
};

export default AssistantView;
