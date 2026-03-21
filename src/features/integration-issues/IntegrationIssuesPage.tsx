import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/navigation/BackButton";

import ExecutiveSummary from "./tabs/ExecutiveSummary";
import AnalystBreakdown from "./tabs/AnalystBreakdown";
import TechnicalLogs from "./tabs/TechnicalLogs";
import KeyInsights from "./tabs/KeyInsights";

import { UserRole } from "../../types/auth";
import { useServerData } from "../../lib/ServerDataContext";
import { deriveCertificateHealth } from "./utils/certificateHealth";
import { useIntegrationIssues } from "./hooks/useIntegrationIssues";

interface Props {
    role: UserRole | null;
}

type TabId = "summary" | "analysis" | "insights" | "logs";

const tabs: { id: TabId; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "analysis", label: "Analysis" },
    { id: "insights", label: "Key Insights" },
    { id: "logs", label: "Technical Logs" }
];

type CertificateHealth = {
    expired: number;
    expiringSoon: number;
    valid: number;
};

const IntegrationIssuesPage: React.FC<Props> = ({ role }) => {
    const [activeTab, setActiveTab] = useState<TabId>("summary");
    const navigate = useNavigate();

    const canViewLogs = role === "admin" || role === "analyst";

    const { integrationHealth, loading: globalLoading, messages } = useServerData();
    const { summary, loading, error } = useIntegrationIssues();

    /**
     * Fallback calculation from messages
     */
    const fallbackCertificateHealth: CertificateHealth = useMemo(() => {
        const fallback = deriveCertificateHealth(messages);

        return {
            expired: fallback?.expired ?? 0,
            expiringSoon: fallback?.expiringSoon ?? 0,
            valid: fallback?.valid ?? 0,
        };
    }, [messages]);

    /**
     * Normalize integrationHealth response
     * This is the CRITICAL FIX
     */
    const certificateHealth: CertificateHealth = useMemo(() => {
        const raw = integrationHealth?.certificateHealth;

        if (!raw) return fallbackCertificateHealth;

        return {
            expired: raw.expired ?? 0,
            expiringSoon: raw.expiringSoon ?? 0,
            valid: raw.valid ?? 0, // 🔥 guarantees number
        };
    }, [integrationHealth, fallbackCertificateHealth]);

    return (
        <div className="p-6 space-y-6">

            {/* Header */}
            <div className="space-y-2">
                <BackButton
                    defaultRoute="/dashboard"
                    label="Back"
                    className="text-sm text-blue-600 hover:underline"
                    showIcon={false}
                />

                <h1 className="text-2xl font-bold text-gray-800">
                    Integration Issues & Health
                </h1>

                <p className="text-gray-600">
                    Understand why integrations are succeeding or struggling
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b">
                {tabs.map(tab => {
                    if (tab.id === "logs" && !canViewLogs) return null;

                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-2 text-sm font-medium ${
                                isActive
                                    ? "border-b-2 border-blue-600 text-blue-600"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div>
                {activeTab === "summary" && (
                    <ExecutiveSummary
                        data={certificateHealth}
                        errorMessage={
                            globalLoading
                                ? null
                                : !integrationHealth && !messages
                                    ? "Integration health data unavailable"
                                    : null
                        }
                        impactedLink="/organizations"
                        onViewDetails={() => {
                            navigate("/findings?category=certificate");
                        }}
                    />
                )}

                {activeTab === "analysis" && (
                    <AnalystBreakdown summary={summary} loading={loading} error={error} />
                )}

                {activeTab === "insights" && (
                    <KeyInsights summary={summary} loading={loading} error={error} />
                )}

                {activeTab === "logs" && canViewLogs && <TechnicalLogs />}
            </div>

        </div>
    );
};

export default IntegrationIssuesPage;