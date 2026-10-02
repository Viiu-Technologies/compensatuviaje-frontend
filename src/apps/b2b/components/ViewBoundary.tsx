import React from 'react';

/**
 * Aísla cada sección del panel: si una vista falla al renderizar (por ejemplo,
 * un dato que llega con otra forma), muestra un aviso en esa sección y el
 * resto del panel —menú incluido— sigue funcionando. Antes la pantalla
 * completa quedaba en blanco.
 */
interface Props {
  /** Cambia al navegar: reinicia el estado de error. */
  resetKey: string;
  children: React.ReactNode;
}

interface State {
  failed: boolean;
}

export default class ViewBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }

  componentDidCatch(error: unknown) {
    console.error('[B2B] Error en la sección', this.props.resetKey, error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <h2 className="text-base font-semibold text-gray-900 m-0">No pudimos mostrar esta sección</h2>
        <p className="text-sm text-gray-500 m-0 mt-1.5">Recarga la página. Si el problema sigue, escríbenos.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 inline-flex items-center justify-center rounded-full border border-brand-700 bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 cursor-pointer"
        >
          Recargar
        </button>
      </div>
    );
  }
}
