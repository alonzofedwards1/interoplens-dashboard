import { useEffect, useMemo, useState } from "react";
import { fetchIntegrationHealth } from "../../../services/integrationHealth.service";
import { IntegrationHealthResponse } from "../../../types/integrationHealth";

const AnalystBreakdown = () => {
    const [summary, setSummary] = useState<IntegrationHealthResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadSummary = async () => {
            try {
                const data = await fetchIntegrationHealth();
                if (isMounted) {
                    setSummary(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load analyst breakdown."
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadSummary();

        return () => {
            isMounted = false;
        };
    }, []);

    const failureCategories = useMemo(() => {
        if (!summary) return [];
        const totalFailures = summary.failure;
        if (!totalFailures) return [];
        const rootCauses = summary.failureRootCauses ?? {};
        return Object.entries(rootCauses).map(([label, count]) => ({
            label,
            percentage: Math.round((count / totalFailures) * 100),
            count,
        }));
    }, [summary]);

    const hasFailureDetails = Boolean(
        summary?.failure && failureCategories.length
    );

    return (
        <div className="space-y-6">

            {/* Failure Categories */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Failure Categories
                </h3>
                {isLoading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-100 rounded w-2/3" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                    </div>
                ) : error ? (
                    <p className="text-sm text-red-600">{error}</p>
                ) : summary?.failure === 0 ? (
                    <p className="text-sm text-gray-500">
                        No failures reported in the current execution window.
                    </p>
                ) : !hasFailureDetails ? (
                    <p className="text-sm text-gray-500">
                        Failure details are unavailable for the current window.
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

            {/* Notable Trends */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Notable Trends
                </h3>
                <p className="text-sm text-gray-600">
                    Trend analysis will populate once execution diagnostics are
                    correlated with PD activity.
                </p>
            </div>

            {/* Analyst Observations */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Analyst Observations
                </h3>
                <p className="text-sm text-gray-600">
                    Observations will be available after root cause enrichment
                    lands in the PD execution feed.
                </p>
            </div>

            {/* Emerging Risk Signals */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Emerging Risk Signals
                </h3>
                <p className="text-sm text-gray-600">
                    Risk signals will appear once telemetry integration is
                    enabled for PD execution outcomes.
                </p>
            </div>

            {/* Root Cause Hypotheses */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Root Cause Hypotheses
                </h3>
                <p className="text-sm text-gray-600">
                    Root cause hypotheses will be generated as failures are
                    tagged with diagnostic metadata.
                </p>
            </div>

            {/* Analyst Recommendations */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Analyst Recommendations
                </h3>
                <p className="text-sm text-gray-600">
                    Recommendations will publish after trends and root causes
                    are confirmed from live execution data.
                </p>
            </div>

        </div>
    );
};

export default AnalystBreakdown;
