import React from "react";
import { ErrorPage } from "./ErrorPage";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: unknown) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    this.setState({ error: `${error}`, errorInfo });
    console.log(
      "Uncaught error at ErrorBoundary: ",
      error,
      errorInfo.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorPage error={this.state.error ?? ""} info={this.state.errorInfo} />
      );
    }

    return this.props.children;
  }
}
