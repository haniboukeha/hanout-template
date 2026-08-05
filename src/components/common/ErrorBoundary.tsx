import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500 mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-grow inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                <RefreshCw size={18} />
                Try again
              </button>
              <Link
                to="/"
                onClick={this.handleReset}
                className="flex-grow inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
              >
                <Home size={18} />
                Go home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
