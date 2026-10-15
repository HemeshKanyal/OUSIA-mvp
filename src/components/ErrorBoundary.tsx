import { Component, type ReactNode } from 'react';

/** Last line of defence on stage: any render error offers a one-click reset to seed data. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-ink-50 p-6">
        <div className="max-w-sm rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-card">
          <p className="text-lg font-semibold text-ink-950">Something went wrong</p>
          <p className="mt-2 text-sm text-ink-500">Reset the demo to restore the seed data and continue.</p>
          <button
            type="button"
            className="mt-5 h-10 w-full rounded-xl bg-ink-900 text-sm font-medium text-white hover:bg-ink-800"
            onClick={() => {
              try {
                window.localStorage.clear();
              } catch {
                // ignore
              }
              window.location.reload();
            }}
          >
            Reset demo
          </button>
        </div>
      </div>
    );
  }
}
