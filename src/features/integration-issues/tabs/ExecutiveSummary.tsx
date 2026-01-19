import { useMemo, useState } from "react";
import CertificateHealthWidget from "../widgets/CertificateHealthWidget";
import CertInspectorModal from "../modals/CertInspectorModal";
import { useServerData } from "../../../lib/ServerDataContext";

const ExecutiveSummary = () => {
    const [showCertModal, setShowCertModal] = useState(false);

    // ✅ REAL DATA SOURCE (Backend API)
    const { integrationHealth, loading, error } = useServerData();

    const executionTotals = useMemo(() => {
        const total = integrationHealth?.totalExecutions ?? 0;
        const successRate = integrationHealth?.successRate ?? 0;
        const affectedPartners = integrationHealth?.affectedPartners ?? 0;
        return { total, successRate, affectedPartners };
    }, [integrationHealth]);

    const healthStatus = useMemo(() => {
        if (loading) return "Loading";
        if (error) return "Unavailable";
        if (executionTotals.total === 0) return "No Data";
        if (executionTotals.successRate >= 95) return "Stable";
        if (executionTotals.successRate >= 85) return "Degraded";
        return "At Risk";
    }, [loading, error, executionTotals]);

    const actionRequiredText = useMemo(() => {
        if (loading) return "Assessing required actions...";
        if (error) return "Unable to determine action requirements.";
        if (executionTotals.total === 0) {
            return "No execution activity reported yet.";
        }
        if (executionTotals.successRate >= 95) {
            return "No action required. Success rates remain strong.";
        }
        if (executionTotals.affectedPartners > 0) {
            return `${executionTotals.affectedPartners} partner${
                executionTotals.affectedPartners === 1 ? "" : "s"
            } currently experiencing degraded outcomes.`;
        }
        return "Some executions are failing or partial. Review affected integrations.";
    }, [loading, error, executionTotals]);

    const narrativeText = useMemo(() => {
        if (loading) return "Loading execution narrative...";
        if (error) return "Execution narrative is unavailable right now.";
        if (executionTotals.total === 0) {
            return "No execution insights are available until telemetry arrives.";
        }
        const partnerLabel =
            executionTotals.affectedPartners === 1 ? "partner" : "partners";
        return `Success rate is ${executionTotals.successRate}% across ${executionTotals.total} executions. ${executionTotals.affectedPartners} ${partnerLabel} are impacted.`;
    }, [loading, error, executionTotals]);

    const certificateHealth = useMemo(() => {
        if (loading) return undefined;
        return integrationHealth?.certificateHealth;
    }, [integrationHealth, loading]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Health */}
                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-sm font-semibold text-gray-500">
                        Overall Health
                    </h3>
                    {loading ? (
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

                {/* Certificate Health */}
                <CertificateHealthWidget
                    data={certificateHealth}
                    errorMessage={error ? "Unable to load certificate health." : null}
                    onViewDetails={() => setShowCertModal(true)}
                    impactedLink="/pd-executions?certStatus=EXPIRED,EXPIRING_SOON"
                />

                {/* Action Required */}
                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-sm font-semibold text-gray-500">
                        Action Required
                    </h3>
                    {loading ? (
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

                {/* Narrative */}
                <div className="md:col-span-3 bg-blue-50 p-5 rounded border border-blue-200">
                    <h4 className="font-semibold mb-2">What’s happening?</h4>
                    {loading ? (
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-blue-100 rounded w-11/12" />
                            <div className="h-4 bg-blue-100 rounded w-10/12" />
                        </div>
                    ) : (
                        <p className="text-sm text-gray-700">{narrativeText}</p>
                    )}
                </div>
            </div>

            {/* Certificate Inspector Modal */}
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
