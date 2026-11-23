import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { TRANSLATIONS, type Language } from '../utils/i18n';

interface Props {
  children: ReactNode;
  lang?: Language;
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
      message: error.message || 'An unexpected interface error occurred.',
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
      const lang: Language = this.props.lang ?? 'es';
      const t = TRANSLATIONS[lang].errorBoundary;
      return (
        <div className="min-h-screen bg-[#F0F6F6] dark:bg-[#041820] text-[#002733] dark:text-[#F0F6F6] flex items-center justify-center p-6">
          <div className="neo-surface max-w-lg w-full rounded-3xl p-8 text-center">
            <div className="neo-inset w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-[#b42318] dark:text-[#FDA29B]">
              <AlertTriangle className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-[#002733] dark:text-white mb-3">
              {t.title}
            </h1>
            <p className="text-sm text-[#002733]/75 dark:text-[#CBE0E0] mb-6 leading-relaxed">
              {t.description}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn-lime inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              {t.retryBtn}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
