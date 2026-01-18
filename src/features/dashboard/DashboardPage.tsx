import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import Filters, { FiltersState } from "../../components/Filters";
import FindingsTable from "../../components/FindingsTable";

import { useServerData } from "../../lib/ServerDataContext";
import AlertSummaryCards from "./components/AlertSummaryCards";
import OperationalInsights from "./components/OperationalInsights";
import useDashboardMetrics from "./hooks/useDashboardMetrics";
import { Finding } from "../../types/findings";

/* ============================
   Types
============================ */

import { UserRole } from "../../types/auth";

interface DashboardProps {
    role: UserRole | null;
    onLogout: () => void;
}

/* ============================
   Component
============================ */

const Dashboard: React.FC<DashboardProps> = ({ role, onLogout }) => {
    const navigate = useNavigate();

    const {
        findings,
        pdExecutions,
        telemetryEvents,
        loading,
        error,
        telemetryWarning,
        refresh,
    } = useServerData();

    /* ============================
       Dashboard Filters (Minimal)
    ============================ */

    const [filters, setFilters] = useState<FiltersState>({
        organization: "",
        status: "",
    });

    /**
     * Dashboard does NOT need org filtering yet,
     * but Filters requires organizations — so we derive them safely.
     */
    const organizations = useMemo(() => {
        const map = new Map<string, { id: string; name: string }>();

        (findings as Finding[]).forEach((f) => {
            if (f.organization?.id && f.organization?.name) {
                map.set(f.organization.id, {
                    id: f.organization.id,
                    name: f.organization.name,
                });
            }
        });

        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [findings]);

    const [complianceStandard, setComplianceStandard] =
        useState<"TEFCA" | "IHE" | "HL7">("TEFCA");

    /**
     * ✅ SINGLE SOURCE OF TRUTH
     */
    const { alertCards, insightCards } = useDashboardMetrics(
        findings,
        pdExecutions,
        telemetryEvents,
        complianceStandard
    );

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex flex-col flex-1">
                <Topbar role={role} onLogout={onLogout} />

                <main className="p-4 space-y-6">
                    {/* ============================
                        Alerts / Errors
                    ============================ */}
                    {error && (
                        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                            {error}. Showing cached fixtures.
                            <button
                                type="button"
                                onClick={refresh}
                                className="ml-2 text-blue-700 underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {telemetryWarning && (
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                            Telemetry unavailable: {telemetryWarning}
                        </div>
                    )}

                    {/* ============================
                        Alert Summary Cards
                    ============================ */}
                    <AlertSummaryCards
                        cards={alertCards}
                        onNavigate={(route) => navigate(route)}
                    />

                    {/* ============================
                        Operational Insights
                    ============================ */}
                    <OperationalInsights
                        cards={insightCards}
                        complianceStandard={complianceStandard}
                        onComplianceStandardChange={setComplianceStandard}
                    />

                    {/* ============================
                        Charts
                    ============================ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BarChart findings={findings} />
                        <PieChart findings={findings} />
                    </div>

                    {/* ============================
                        Filters (NOW VALID)
                    ============================ */}
                    <Filters
                        value={filters}
                        onChange={setFilters}
                        organizations={organizations}
                    />

                    {/* ============================
                        Findings Table
                    ============================ */}
                    <FindingsTable findings={findings} />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
