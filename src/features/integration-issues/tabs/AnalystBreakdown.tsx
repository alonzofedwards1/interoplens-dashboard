import React, { useMemo } from "react";
import { PdExecutionHealthSummary } from "../../../types/pdExecutions";

interface Props {
    summary: PdExecutionHealthSummary | null;
    loading: boolean;
    error?: string | null;
}

const AnalystBreakdown: React.FC<Props> = ({ summary, loading, error }) => {

    const failureCategories = useMemo(() => {
        if (!summary || !summary.failure) return [];

        return Object.entries(summary.byRootCause).map(([label, count]) => ({
            label,
            percentage: Math.round((count / summary.failure) * 100),
            count,
        }));
    }, [summary]);

    if (loading) {
        return <p className="text-sm text-gray-500">Loading analysis...</p>;
    }

    if (error) {
        return <p className="text-sm text-red-600">{error}</p>;
    }

    return (
        <div className="space-y-6">

            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">Failure Categories</h3>

                {!summary?.failure ? (
                    <p className="text-sm text-gray-500">
                        No failures reported in the current execution window.
                    </p>
                ) : failureCategories.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Failure details are unavailable.
                    </p>
                ) : (
                    <ul className="text-sm text-gray-700 space-y-1">
                        {failureCategories.map(item => (
                            <li key={item.label}>
                                • {item.label} — {item.percentage}% ({item.count})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </div>
    );
};

export default AnalystBreakdown;