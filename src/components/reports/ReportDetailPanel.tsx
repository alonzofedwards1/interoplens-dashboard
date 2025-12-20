import React from "react";
import { getReportById, ReportId } from "./reportResolver";

interface ReportDetailPanelProps {
    reportId: ReportId | null;
    onClose: () => void;
}

const ReportDetailPanel: React.FC<ReportDetailPanelProps> = ({
                                                                 reportId,
                                                                 onClose
                                                             }) => {
    if (!reportId) return null;

    const report = getReportById(reportId);
    if (!report) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-[440px] bg-white border-l shadow-lg p-6 z-20 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold">{report.title}</h2>
                    <p className="text-xs text-gray-500">
                        Generated {new Date(report.generatedAt).toLocaleString()}
                    </p>
                </div>
                <button onClick={onClose} className="text-sm text-gray-500">
                    Close
                </button>
            </div>

            {/* ---------------- TEFCA READINESS ---------------- */}
            {report.reportId === "tefca-readiness" && (
                <>
                    <section className="mb-6">
                        <h3 className="text-sm font-semibold mb-2">
                            Executive Summary
                        </h3>

                        <div className="text-3xl font-semibold">
                            {report.executiveSummary.readinessScore}
                        </div>
                        <div className="text-sm text-gray-500">
                            Risk Level: {report.executiveSummary.riskLevel}
                        </div>
                    </section>

                    <section className="mb-6">
                        <h3 className="text-sm font-semibold mb-2">
                            Core Metrics
                        </h3>

                        {report.coreMetrics.map(metric => (
                            <div
                                key={metric.metricId}
                                className="flex justify-between text-sm border-b pb-1"
                            >
                                <span>{metric.name}</span>
                                <span>
                  {metric.value}
                                    {metric.unit === "%" ? "%" : ` ${metric.unit}`}
                </span>
                            </div>
                        ))}
                    </section>

                    <section>
                        <h3 className="text-sm font-semibold mb-2">
                            Recommendations
                        </h3>

                        <ul className="list-disc pl-5 text-sm">
                            {report.recommendations.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    </section>
                </>
            )}

            {/* ---------------- TEFCA SNAPSHOT ---------------- */}
            {report.reportId === "tefca-snapshot" && (
                <>
                    <section className="mb-6">
                        <h3 className="text-sm font-semibold mb-2">
                            Operational Overview
                        </h3>

                        <div className="text-2xl font-semibold">
                            {report.overview.successRate}%
                        </div>
                        <div className="text-sm text-gray-500">
                            Failure Rate: {report.overview.failureRate}%
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-semibold mb-2">
                            Top Risks
                        </h3>

                        <ul className="list-disc pl-5 text-sm">
                            {report.topRisks.map((r, i) => (
                                <li key={i}>{r.description}</li>
                            ))}
                        </ul>
                    </section>
                </>
            )}

            <div className="mt-6 text-xs text-gray-400 border-t pt-3">
                {report.disclaimer}
            </div>
        </div>
    );
};

export default ReportDetailPanel;
