import React from 'react';

type ErrorBoundaryProps = {
    children: React.ReactNode;
};

type ErrorBoundaryState = {
    error: Error | null;
};

export const ErrorFallback = ({ error }: { error: Error }) => {
    return (
        <div className="rounded border border-red-200 bg-red-50 p-6 text-red-700">
            <h3 className="text-lg font-semibold">Service temporarily unavailable</h3>
            <pre className="mt-2 whitespace-pre-wrap text-sm">{error.message}</pre>
        </div>
    );
};

export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    render() {
        const { error } = this.state;
        if (error) {
            return <ErrorFallback error={error} />;
        }
        return this.props.children;
    }
}
