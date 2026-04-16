import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center h-screen p-8">
          <div className="text-center max-w-md">
            <h1 className="text-lg font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted mb-4">{this.state.error.message}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="text-xs px-4 py-2 rounded bg-accent text-white hover:opacity-90"
            >Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
