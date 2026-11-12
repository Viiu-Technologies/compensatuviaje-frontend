import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, RotateCcw, SendHorizontal, User } from 'lucide-react';
import { LEGAL } from '../../../../shared/config/legal';
import { askAssistant, assistantErrorMessage, type ChatTurn } from '../../services/assistantService';
import { btn, Card, cx, PageHeader } from '../../ui';

/**
 * Asistente IA con los datos reales de la empresa (CTV-12).
 *
 * Usa Doctor IA del backend (Gemini), que consulta la huella pendiente, las
 * órdenes y los proyectos disponibles de la empresa del usuario autenticado.
 * La versión anterior a la de mantenimiento respondía textos fijos y mostraba
 * cifras inventadas; esta nunca muestra datos que no vengan del backend.
 *
 * La conversación se guarda en sessionStorage (dura mientras la pestaña esté
 * abierta) y se envía como historial en cada pregunta.
 */

const STORAGE_KEY = 'ctv.b2b.assistant';
const MAX_LENGTH = 2000;

const SUGGESTIONS = [
  '¿Cuánto CO₂ nos falta compensar?',
  '¿Qué proyectos hay disponibles y a qué precio?',
  '¿Cómo van nuestras órdenes?',
  '¿Cuánto emite un vuelo Santiago–Madrid en ejecutiva?',
];

const loadConversation = (): ChatTurn[] => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((t) => (t?.role === 'user' || t?.role === 'model') && typeof t.content === 'string') : [];
  } catch {
    return [];
  }
};

/** **negrita** dentro de una línea, sin insertar HTML. */
const inline = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>
  );

/** Texto del asistente: párrafos y listas simples ("- " o "1. "). */
const Formatted: React.FC<{ text: string }> = ({ text }) => {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={blocks.length} className="m-0 my-1 pl-5 list-disc space-y-0.5">
          {list.map((item, i) => <li key={i}>{inline(item)}</li>)}
        </ul>
      );
      list = [];
    }
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const item = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (item) {
      list.push(item[1]);
      continue;
    }
    flush();
    if (line) blocks.push(<p key={blocks.length} className="m-0 my-1">{inline(line)}</p>);
  }
  flush();
  return <>{blocks}</>;
};

const AssistantView: React.FC<{ onNavigate?: (tab: string) => void }> = () => {
  const [conversation, setConversation] = useState<ChatTurn[]>(loadConversation);
  const [draft, setDraft] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversation.slice(-40)));
    } catch {
      // Sin almacenamiento (modo privado): la conversación dura hasta recargar.
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [conversation, waiting]);

  const ask = async (text: string) => {
    const message = text.trim();
    if (!message || waiting) return;
    const history = conversation;
    setConversation([...history, { role: 'user', content: message }]);
    setDraft('');
    setError(null);
    setWaiting(true);
    try {
      const reply = await askAssistant(message, history);
      setConversation((current) => [...current, { role: 'model', content: reply.message }]);
    } catch (err) {
      setError(assistantErrorMessage(err));
      // La pregunta vuelve al cuadro para reintentar sin escribirla de nuevo.
      setConversation(history);
      setDraft(message);
    } finally {
      setWaiting(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setConversation([]);
    setError(null);
    setDraft('');
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Asistente IA"
        subtitle="Pregunta por la huella de tu empresa, tus órdenes o los proyectos disponibles."
        actions={
          conversation.length > 0 ? (
            <button type="button" className={btn.secondary} onClick={reset} disabled={waiting}>
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Nueva conversación
            </button>
          ) : undefined
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-5 space-y-4 min-h-[320px] max-h-[60vh] overflow-y-auto" aria-live="polite">
          {conversation.length === 0 && (
            <div className="text-center py-6">
              <span className="mx-auto mb-3 w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                <Bot className="w-6 h-6" aria-hidden="true" />
              </span>
              <p className="m-0 text-sm text-gray-600 max-w-md mx-auto">
                Respondo con los datos de tu empresa: emisiones registradas, órdenes y proyectos. Prueba con:
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 cursor-pointer hover:border-brand-600 hover:bg-brand-50/40 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {conversation.map((turn, i) => (
            <div key={i} className={cx('flex gap-2.5', turn.role === 'user' ? 'justify-end' : 'justify-start')}>
              {turn.role === 'model' && (
                <span className="shrink-0 w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center" aria-hidden="true">
                  <Bot className="w-4 h-4" />
                </span>
              )}
              <div
                className={cx(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  turn.role === 'user' ? 'bg-brand-900 text-white whitespace-pre-wrap' : 'bg-gray-50 border border-gray-200 text-gray-800'
                )}
              >
                <span className="sr-only">{turn.role === 'user' ? 'Tú: ' : 'Asistente: '}</span>
                {turn.role === 'user' ? turn.content : <Formatted text={turn.content} />}
              </div>
              {turn.role === 'user' && (
                <span className="shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center" aria-hidden="true">
                  <User className="w-4 h-4" />
                </span>
              )}
            </div>
          ))}

          {waiting && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Consultando los datos de tu empresa…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="border-t border-gray-200 p-3 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
        >
          <label htmlFor="assistant-input" className="sr-only">
            Tu pregunta
          </label>
          <textarea
            id="assistant-input"
            ref={inputRef}
            rows={1}
            maxLength={MAX_LENGTH}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                ask(draft);
              }
            }}
            placeholder="Escribe tu pregunta (Enter para enviar)"
            className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm max-h-40 focus:outline-none focus:border-brand-600"
            disabled={waiting}
          />
          <button type="submit" className={btn.primary} disabled={waiting || !draft.trim()} aria-label="Enviar pregunta">
            <SendHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </Card>

      {error && (
        <p role="alert" className="m-0 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <p className="m-0 mt-3 text-xs text-gray-500">
        Las respuestas las genera una IA a partir de los datos de tu empresa; revisa las cifras importantes en el panel. ¿Necesitas
        a una persona?{' '}
        <a href={`mailto:${LEGAL.emails.support}`} className={cx(btn.ghost, 'p-0 text-xs')}>
          Escríbenos
        </a>
      </p>
    </div>
  );
};

export default AssistantView;
