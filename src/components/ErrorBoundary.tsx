import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="app-card" style={{
          maxWidth: '500px',
          margin: '2rem auto',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h2 style={{color: 'var(--color-error)', marginBottom: '1rem'}}>Something went wrong</h2>
          <p style={{marginBottom: '1.5rem'}}>
            We're sorry, but something went wrong. Please try refreshing the page or contact support if the problem persists.
          </p>
          <pre style={{
            backgroundColor: 'var(--color-bg-secondary)',
            padding: '1rem',
            borderRadius: '0.375rem',
            overflow: 'auto',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            {this.state.error?.toString() || 'Unknown error'}
          </pre>
          <button
            onClick={this.resetError}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;