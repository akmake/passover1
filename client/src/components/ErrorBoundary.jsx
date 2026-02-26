// client/src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // UI fallback יוקרתי בסגנון האתר
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center" dir="rtl">
          <div className="w-16 h-16 mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-2">משהו השתבש</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            אירעה שגיאה בלתי צפויה. ניתן לנסות שוב או לחזור לדף הבית.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-[#D4AF37] text-white text-sm font-medium tracking-wider rounded hover:bg-[#b8962e] transition-colors"
            >
              נסה שוב
            </button>
            <a
              href="/"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium tracking-wider rounded hover:bg-gray-50 transition-colors"
            >
              חזרה לדף הבית
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
