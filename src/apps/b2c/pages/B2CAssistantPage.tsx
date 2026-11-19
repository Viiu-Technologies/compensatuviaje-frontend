import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { assistantHistoryKey, loadAssistantHistory, saveAssistantHistory } from '../../../shared/utils/assistantHistory';
import { Bot, Loader2, RotateCcw, SendHorizontal } from 'lucide-react';
import { LEGAL } from '../../../shared/config/legal';
import { McpConnectTrigger } from '../../../shared/components/McpConnectTrigger';
import B2CLayout from '../components/B2CLayout';
import {
  askAssistant,
  assistantErrorMessage,
  type B2CChatTurn,
} from '../services/b2cApi';
import { btn, cx, firstName } from '../ui';
import { useTypewriterPlaceholder } from '../hooks/useTypewriterPlaceholder';

/**
 * Asistente IA para personas en el panel B2C (CTV-50).
 *
 * Usa Doctor IA del backend (Gemini), autenticado con el token de sesión B2C
 * (Supabase o sesión local de desarrollo), para responder con datos reales del
 * usuario: sus viajes calculados, huella emitida/compensada/pendiente,
 * certificados emitidos, estado de pagos en Webpay, proyectos disponibles y
 * cálculos rápidos de vuelos (DEFRA 2025).
 *
 * La conversación se guarda en sessionStorage, por usuario, mientras la pestaña
 * esté abierta, y se borra al cerrar sesión.
 */

const MAX_LENGTH = 2000;

/** Ejemplos que se escriben y se borran dentro del cuadro de texto. */
const SUGGESTIONS = [
  '¿Cuánto CO₂ llevo emitido y cuánto me falta compensar?',
  '¿Qué proyectos hay disponibles y cuánto cuestan?',
  '¿Dónde están mis certificados?',
  '¿Cuánto emite un vuelo Santiago–Miami ida y vuelta?',
];
const STATIC_PLACEHOLDER = 'Pregunta por tus viajes, certificados, pagos o proyectos';

/** **negrita** dentro de una línea, sin insertar HTML. */
const inline = (text: string) =>
  text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );

/** Texto del asistente: párrafos y listas simples ("- " o "1. "). */
const Formatted: React.FC<{ text: string }> = ({ text }) => {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={blocks.length} className="m-0 my-1 pl-5 list-disc space-y-0.5">
          {list.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
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
    if (line) {
      blocks.push(
        <p key={blocks.length} className="m-0 my-1">
          {inline(line)}
        </p>
      );
    }
  }
  flush();
  return <>{blocks}</>;
};

const B2CAssistantPage: React.FC = () => {
  // El historial es de cada usuario: sin esto, quien entraba después en la misma
  // pestaña veía (y reenviaba a la IA) la conversación de la cuenta anterior.
  const { user } = useAuth();
  const storageKey = assistantHistoryKey('b2c', user?.id);
  const [conversation, setConversation] = useState<B2CChatTurn[]>(() => loadAssistantHistory<B2CChatTurn>(storageKey));
  const [loadedKey, setLoadedKey] = useState(storageKey);
  if (loadedKey !== storageKey) {
    // Cambió el usuario (o terminó de cargar): se muestra su propio historial.
    setLoadedKey(storageKey);
    setConversation(loadAssistantHistory<B2CChatTurn>(storageKey));
  }
  const [draft, setDraft] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const name = firstName(user?.nombre, user?.email);

  useEffect(() => {
    saveAssistantHistory(storageKey, conversation);
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [conversation, waiting, storageKey]);

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
      setConversation((current) => [
        ...current,
        { role: 'model', content: reply.message },
      ]);
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
    inputRef.current?.focus();
  };

  const empty = conversation.length === 0;

  return (
    <B2CLayout
      title="Asistente IA"
      fullBleed
      headerRightExtra={
        <div className="flex items-center gap-2 flex-wrap">
          <McpConnectTrigger role="b2c" />
          {!empty && (
            <button
              type="button"
              className={cx(btn.secondary, btn.sm)}
              onClick={reset}
              disabled={waiting}
              aria-label="Nueva conversación"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Nueva conversación</span>
            </button>
          )}
        </div>
      }
    >
      {/* Conversación: ocupa todo el alto y hace su propio scroll. */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" aria-live="polite">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 min-h-full flex flex-col">
          {empty && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <span className="mb-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-white flex items-center justify-center shadow-lg shadow-brand-900/20">
                <Bot className="w-7 h-7" aria-hidden="true" />
              </span>
              <h2 className="m-0 text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
                {name ? `¿En qué te ayudo, ${name}?` : '¿En qué te ayudo?'}
              </h2>
              <p className="m-0 mt-3 text-sm text-gray-500 max-w-md">
                Respondo con los datos reales de tu cuenta: tus viajes, tus certificados, tus pagos y los proyectos disponibles.
              </p>
            </div>
          )}

          {conversation.map((turn, i) =>
            turn.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-900 text-white px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap">
                  <span className="sr-only">Tú: </span>
                  {turn.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-3 items-start">
                <span
                  className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Bot className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1 text-[15px] leading-relaxed text-gray-800">
                  <span className="sr-only">Asistente: </span>
                  <Formatted text={turn.content} />
                </div>
              </div>
            ),
          )}

          {waiting && (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center" aria-hidden="true">
                <Loader2 className="w-4 h-4 animate-spin" />
              </span>
              Consultando tus datos…
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Cuadro de texto fijo abajo. */}
      <div className="border-t border-gray-200 bg-gray-50/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-3 pb-4">
          {error && (
            <p
              role="alert"
              className="m-0 mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {error}
            </p>
          )}
          <Composer
            inputRef={inputRef}
            draft={draft}
            setDraft={setDraft}
            waiting={waiting}
            animate={empty}
            onSubmit={() => ask(draft)}
          />
          <p className="m-0 mt-2 text-xs text-gray-500 text-center">
            Responde una IA con los datos de tu cuenta; revisa las cifras importantes en tu panel.{' '}
            <a href={`mailto:${LEGAL.emails.support}`} className="text-gray-600 underline">
              Hablar con una persona
            </a>
          </p>
        </div>
      </div>
    </B2CLayout>
  );
};

/**
 * Cuadro de la pregunta. Va aparte para que el texto de ejemplo, que cambia
 * letra a letra, no vuelva a pintar toda la conversación.
 */
const Composer: React.FC<{
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  draft: string;
  setDraft: (v: string) => void;
  waiting: boolean;
  animate: boolean;
  onSubmit: () => void;
}> = ({ inputRef, draft, setDraft, waiting, animate, onSubmit }) => {
  const placeholder = useTypewriterPlaceholder(SUGGESTIONS, STATIC_PLACEHOLDER, animate && !draft);
  return (
    <form
      className="flex items-end gap-2 rounded-2xl border border-gray-300 bg-white p-2 pl-4 shadow-sm focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15 transition-colors"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="b2c-assistant-input" className="sr-only">
        Tu pregunta (Enter para enviar, Mayús + Enter para una nueva línea)
      </label>
      <textarea
        id="b2c-assistant-input"
        ref={inputRef}
        rows={1}
        maxLength={MAX_LENGTH}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // IME: el Enter que confirma una composición no debe enviar (Safari reporta keyCode 229)
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            e.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder={placeholder}
        className="flex-1 min-w-0 [field-sizing:content] max-h-48 resize-none border-0 bg-transparent py-2 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
        disabled={waiting}
      />
      <button
        type="submit"
        className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-xl border-0 bg-brand-900 text-white cursor-pointer transition-colors hover:bg-[#044443] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
        disabled={waiting || !draft.trim()}
        aria-label="Enviar pregunta"
      >
        <SendHorizontal className="w-4 h-4" aria-hidden="true" />
      </button>
    </form>
  );
};

export default B2CAssistantPage;
