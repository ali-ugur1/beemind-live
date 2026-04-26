import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Optional: Send error to logging service in production
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <div
          className="min-h-screen bg-gray-950 flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-2xl w-full bg-gray-900 border border-gray-800 rounded-lg p-8 text-center shadow-2xl">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle
                className="w-10 h-10 text-red-500"
                aria-hidden="true"
              />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-100 mb-4">
              Something Went Wrong / Bir Şeyler Yanlış Gitti
            </h1>

            {/* Description */}
            <p className="text-gray-400 mb-8">
              An unexpected error occurred. Please try refreshing the page or go
              back to the home page.
              <br />
              <span className="text-gray-500 text-sm">
                Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana
                sayfaya dönün.
              </span>
            </p>

            {/* Error Details (Development only) */}
            {isDevelopment && this.state.error && (
              <div className="mb-8 p-4 bg-gray-800 border border-gray-700 rounded-lg text-left">
                <p className="text-sm font-mono text-red-400 mb-2 break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-xs text-gray-500 overflow-auto max-h-64 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 text-black font-semibold rounded-lg transition-colors"
                aria-label="Refresh page"
              >
                <RefreshCw className="w-5 h-5" aria-hidden="true" />
                Refresh / Yenile
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-gray-300 font-semibold rounded-lg transition-colors"
                aria-label="Go to home page"
              >
                <Home className="w-5 h-5" aria-hidden="true" />
                Home / Ana Sayfa
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
