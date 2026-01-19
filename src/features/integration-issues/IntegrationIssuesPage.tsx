import {useState} from "react";
import {useNavigate} from "react-router-dom";

import ExecutiveSummary from "./tabs/ExecutiveSummary";
import AnalystBreakdown from "./tabs/AnalystBreakdown";
import TechnicalLogs from "./tabs/TechnicalLogs";

import {UserRole} from "../../types/auth";
import {useServerData} from '../../lib/ServerDataContext';

/* ============================
   Types
============================ */

interface Props {
    role: UserRole | null;
}

type TabId = "summary" | "analysis" | "logs";

const tabs: { id: TabId; label: string }[] = [
    {id: "summary", label: "Summary"},
    {id: "analysis", label: "Analysis"},
    {id: "logs", label: "Technical Logs"}
];

/* ============================
   Component
============================ */

const IntegrationIssuesPage: React.FC<Props> = ({role}) => {
    const [activeTab, setActiveTab] = useState<TabId>("summary");
    const navigate = useNavigate();

    const canViewLogs = role === "admin" || role === "analyst";

    // ✅ THIS IS CORRECT
    const {integrationHealth, loading} = useServerData();

    console.log(
        '[IntegrationIssuesPage] integrationHealth',
        integrationHealth
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-blue-600 hover:underline"
                >
                    ← Back
                </button>

                <h1 className="text-2xl font-bold text-gray-800">
                    Integration Issues & Health
                </h1>

                <p className="text-gray-600">
                    Understand why integrations are succeeding or struggling
                </p>
            </div>
            {/* Tabs */}
            <div className="flex space-x-4 border-b">
                {tabs.map((tab) => {
                    if (tab.id === "logs" && !canViewLogs) return null;

                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-2 text-sm font-medium transition ${
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
                {activeTab === "summary" && <ExecutiveSummary/>}
                {activeTab === "analysis" && <AnalystBreakdown/>}
                {activeTab === "logs" && canViewLogs && <TechnicalLogs/>}
            </div>
        </div>
    );
};

export default IntegrationIssuesPage;
