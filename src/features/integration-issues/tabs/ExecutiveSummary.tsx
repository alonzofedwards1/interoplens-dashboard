import { useEffect, useMemo, useState } from "react";
import CertificateHealthWidget from "../widgets/CertificateHealthWidget";
import CertInspectorModal from "../modals/CertInspectorModal";
import {
    fetchPdExecutionCounts,
    normalizeCertificateHealth,
} from "../../../services/pdExecutions.service";
import { PdExecutionCounts } from "../../../types/pdExecutions";

const ExecutiveSummary = () => {
    const [showCertModal, setShowCertModal] = useState(false);
    const [counts, setCounts] = useState<PdExecutionCounts | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadCounts = async () => {
            try {
                const data = await fetchPdExecutionCounts();
                if (isMounted) {
                    setCounts(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load execution health summary."
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadCounts();

        return () => {
            isMounted = false;
        };
    }, []);

    const executionTotals = useMemo(() => {
        const total = counts?.total ?? 0;
        const success = counts?.success ?? 0;
        const failure = counts?.failure ?? 0;
        const partial = counts?.partial ?? 0;
        const successRate = total ? Math.round((success / total) * 100) : 0;
        return { total, success, failure, partial, successRate };
    }, [counts]);

    const healthStatus = useMemo(() => {
        if (isLoading) return "Loading";
        if (error) return "Unavailable";
        if (executionTotals.total === 0) return "No Data";
        if (executionTotals.successRate >= 95) return "Stable";
        if (executionTotals.successRate >= 85) return "Degraded";
        return "At Risk";
    }, [error, executionTotals, isLoading]);

    const actionRequiredText = useMemo(() => {
        if (isLoading) return "Assessing required actions...";
        if (error) return "Unable to determine action requirements.";
        if (executionTotals.total === 0) {
            return "No execution activity reported yet.";
        }
        const attentionCount = executionTotals.failure + executionTotals.partial;
        if (attentionCount === 0) {
            return "No action required. All tracked executions succeeded.";
        }
        return `${attentionCount} execution${
            attentionCount === 1 ? "" : "s"
        } need attention based on recent outcomes.`;
    }, [error, executionTotals, isLoading]);

    const narrativeText = useMemo(() => {
        if (isLoading) return "Loading execution narrative...";
        if (error) return "Execution narrative is unavailable right now.";
        if (executionTotals.total === 0) {
            return "No execution insights are available until telemetry arrives.";
        }
        return `Success rate is ${executionTotals.successRate}% across ${executionTotals.total} executions. Review failure and partial outcomes for current risks.`;
    }, [error, executionTotals, isLoading]);

    const certificateHealth = useMemo(() => {
        if (isLoading) return undefined;
        const normalized = normalizeCertificateHealth(
            counts?.certificateHealth
        );
        if (normalized) return normalized;
        if (counts) {
            return { expired: 0, expiringSoon: 0, valid: 0 };
        }
        return undefined;
    }, [counts, isLoading]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Overall Health */}
                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-sm font-semibold text-gray-500">
                        Overall Health
                    </h3>
                    {isLoading ? (
                        <div className="mt-3 space-y-2 animate-pulse">
                            <div className="h-8 bg-gray-100 rounded w-2/3" />
                            <div className="h-4 bg-gray-100 rounded w-5/6" />
                        </div>
                    ) : (
                        <>
                            <p
                                className={`text-3xl font-bold mt-2 ${
                                    healthStatus === "Stable"
                                        ? "text-green-600"
                                        : healthStatus === "Degraded"
                                            ? "text-yellow-600"
                                            : healthStatus === "At Risk"
                                                ? "text-red-600"
                                                : "text-gray-600"
                                }`}
                            >
                                {healthStatus}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {executionTotals.total
                                    ? `${executionTotals.successRate}% successful transactions`
                                    : "No executions reported yet"}
                            </p>
                            {error && (
                                <p className="text-xs text-red-600 mt-2">
                                    {error}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Card 2: Certificate Health */}
                <CertificateHealthWidget
                    data={certificateHealth}
                    errorMessage={error ? "Unable to load certificate health." : null}
                    onViewDetails={() => setShowCertModal(true)}
                />

                {/* Card 3: Action Required */}
                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-sm font-semibold text-gray-500">
                        Action Required
                    </h3>
                    {isLoading ? (
                        <div className="mt-3 space-y-2 animate-pulse">
                            <div className="h-4 bg-gray-100 rounded w-11/12" />
                            <div className="h-4 bg-gray-100 rounded w-9/12" />
                        </div>
                    ) : (
                        <p className="text-sm mt-2 text-gray-700">
                            {actionRequiredText}
                        </p>
                    )}
                </div>

                {/* Narrative Panel */}
                <div className="md:col-span-3 bg-blue-50 p-5 rounded border border-blue-200">
                    <h4 className="font-semibold mb-2">
                        What’s happening?
                    </h4>
                    {isLoading ? (
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-blue-100 rounded w-11/12" />
                            <div className="h-4 bg-blue-100 rounded w-10/12" />
                        </div>
                    ) : (
                        <p className="text-sm text-gray-700">{narrativeText}</p>
                    )}
                </div>
            </div>

            {/* Cert Inspector Modal */}
            {showCertModal && (
                <CertInspectorModal
                    onClose={() => setShowCertModal(false)}
                    cert={{
                        subject: "Unavailable",
                        issuer: "Unavailable",
                        thumbprint: "—",
                        notBefore: "—",
                        notAfter: "—",
                        status: "Valid",
                        detectedVia: "Live Transaction",
                    }}
                />
            )}
        </>
    );
};

export default ExecutiveSummary;
