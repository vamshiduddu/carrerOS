'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message ?? 'Something went wrong' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'var(--danger-muted)', color: 'var(--danger)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <AlertTriangle size={24} />
          </div>
          <h3 style={{ margin: '0 0 0.4rem', fontWeight: 700 }}>Something went wrong</h3>
          <p style={{ margin: '0 0 1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
            {this.state.message}
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
