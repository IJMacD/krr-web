import { Component, ErrorInfo, ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null, errorInfo: ErrorInfo | null }> {
    constructor(props: { children: ReactNode; }) {
        super(props);

        this.state = {
            error: null,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ error, errorInfo });
    }

    render(): ReactNode {
        if (this.state.error) {
            return (
                <div style={{ color: "red" }}>
                    <h1>Error {this.state.error.message}</h1>
                    <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
            )
        }

        return this.props.children;
    }
}