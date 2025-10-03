import React from "react";

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: any): State {
    return { hasError: true, message: err?.message || "" };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("App error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container max-w-[800px] p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm">
              Please refresh the page. If the problem continues, try again
              later.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
