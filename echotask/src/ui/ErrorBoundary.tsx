import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Affichage alternatif — si omis, utilise le fallback par défaut */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: 'var(--space-6)',
      }}>
        <div className="card fade-in" style={{
          maxWidth: 420,
          width: '100%',
          padding: 'var(--space-8)',
          textAlign: 'center',
        }}>
          <svg
            width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>

          <h2 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-xl)' }}>
            Une erreur est survenue
          </h2>

          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
            lineHeight: 1.6,
            margin: '0 0 var(--space-6)',
          }}>
            L'application a rencontré un problème inattendu. Vos données sont en sécurité.
          </p>

          {this.state.message && (
            <pre style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: 'var(--space-6)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {this.state.message}
            </pre>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              className="btn btn-primary"
              style={{ minWidth: 120 }}
            >
              Réessayer
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn"
              style={{ minWidth: 120 }}
            >
              Recharger
            </button>
          </div>
        </div>
      </div>
    );
  }
}
