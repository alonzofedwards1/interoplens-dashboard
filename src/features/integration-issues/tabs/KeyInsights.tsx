import React, { useMemo } from "react";
import { PdExecutionHealthSummary } from "../../../types/pdExecutions";
import { generateInsights } from "../utils/generateInsights";

interface Props {
    summary: PdExecutionHealthSummary | null;
    loading: boolean;
    error?: string | null;
}

const KeyInsights: React.FC<Props> = ({ summary, loading, error }) => {
    const insights = useMemo(() => {
        if (!summary) return null;
        return generateInsights(summary);
    }, [summary]);

    if (loading) {
        return <p className="text-sm text-gray-500">Loading insights...</p>;
    }

    if (error) {
        return <p className="text-sm text-red-600">{error}</p>;
    }

    if (!summary || !insights) {
        return <p className="text-sm text-gray-500">No data available.</p>;
    }

    return (
        <div className="space-y-6">

            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">Executive Summary</h3>
                <p className="text-sm text-gray-700">{insights.executiveSummary}</p>
            </div>

            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">Primary Drivers</h3>
                <p className="text-sm text-gray-700">{insights.drivers}</p>
            </div>

            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">Risk Assessment</h3>
                <p className="text-sm text-gray-700">{insights.risk}</p>
            </div>

            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">Root Cause Hypotheses</h3>
                <ul className="text-sm text-gray-700 list-disc pl-5">
                    {insights.hypotheses.map((h, i) => (
                        <li key={i}>{h}</li>
                    ))}
                </ul>
            </div>

            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <ul className="text-sm text-gray-700 list-disc pl-5">
                    {insights.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                    ))}
                </ul>
            </div>

        </div>
    );
};

export default KeyInsights;