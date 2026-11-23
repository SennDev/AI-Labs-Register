import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Ocurrió un error inesperado en la interfaz.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F0F6F6] text-[#002733] flex items-center justify-center p-6">
          <div className="neo-surface max-w-lg w-full rounded-3xl p-8 text-center">
            <div className="neo-inset w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-[#b42318]">
              <AlertTriangle className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-[#002733] mb-3">
              No fue posible cargar la vista
            </h1>
            <p className="text-sm text-[#002733]/75 mb-6 leading-relaxed">
              Se detectó una interrupción temporal al procesar la aplicación. Puedes intentar recargar la vista actual.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn-lime inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
