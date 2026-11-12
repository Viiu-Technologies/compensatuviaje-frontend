import api from '../../../shared/services/api';

/** Un turno de la conversación, en el formato que espera Doctor IA. */
export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
}

interface DoctorIaResponse {
  success: boolean;
  data: {
    message: string;
    toolsUsed?: string[];
  };
}

/** Turnos previos que se envían como contexto (el backend no necesita más). */
const HISTORY_TURNS = 10;

/**
 * POST /api/shared/chat/doctor-ia
 * El asistente responde con los datos de la empresa del usuario autenticado:
 * el backend toma la empresa del token, nunca del mensaje.
 */
export const askAssistant = async (message: string, history: ChatTurn[]): Promise<DoctorIaResponse['data']> => {
  const response = await api.post<unknown, DoctorIaResponse>(
    '/shared/chat/doctor-ia',
    { message, history: history.slice(-HISTORY_TURNS) },
    // Con herramientas, Gemini puede tardar más que el límite general de 30 s.
    { timeout: 60_000 }
  );
  return response.data;
};

/** Mensaje legible para un error de la API del asistente. */
export const assistantErrorMessage = (err: any): string => {
  const status = err?.response?.status;
  const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
  if (status === 429) return serverMessage || 'Hiciste muchas preguntas seguidas. Espera un minuto e inténtalo de nuevo.';
  if (status === 503) return 'El asistente está con mucha demanda en este momento. Inténtalo de nuevo en unos segundos.';
  if (err?.code === 'ECONNABORTED') return 'El asistente tardó demasiado en responder. Inténtalo de nuevo.';
  return serverMessage || 'No pudimos obtener una respuesta. Inténtalo de nuevo.';
};
