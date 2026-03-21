import React, { useEffect, useMemo, useState } from "react";
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
import { useUserPreferences } from "../../lib/useUserPreferences";
import { UserRole } from "../../types/auth";

/* ============================
   Helpers (Org Normalization)
============================ */

const getOrganizationName = (org: Finding["organization"]) => {
    if (!org) return null;
    return typeof org === "string" ? org : org.name;
};

const getOrganizationId = (org: Finding["organization"]) => {
    if (!org) return null;
    return typeof org === "string" ? org : org.id;
};

/* ============================
   Component
============================ */

interface DashboardProps {
    role: UserRole | null;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ role, onLogout }) => {
    const navigate = useNavigate();
    const { preferences } = useUserPreferences();

    const {
        findings,
        pdExecutions,
        messages,
        loading,
        error,
        refresh,
    } = useServerData();

    const [filters, setFilters] = useState<FiltersState>({
        organization: "",
        status: "",
    });

    const [dateRange, setDateRange] = useState(
        preferences.dashboard.defaultDateRange
    );

    const [timeGrouping, setTimeGrouping] = useState(
        preferences.dashboard.timeGrouping
    );

    /* ============================
       FIXED ORGANIZATION DROPDOWN
    ============================ */

    const organizations = useMemo(() => {
        const map = new Map<string, { id: string; name: string }>();

        (findings as Finding[]).forEach((f) => {
            const id = getOrganizationId(f.organization);
            const name = getOrganizationName(f.organization);

            if (id && name) {
                map.set(id, { id, name });
            }
        });

        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [findings]);

    /* ============================
       🔥 FILTER LOGIC (NEW)
    ============================ */

    const filteredFindings = useMemo(() => {
        return (findings as Finding[]).filter((f) => {
            if (
                filters.organization &&
                getOrganizationId(f.organization) !== filters.organization
            ) {
                return false;
            }

            if (filters.status && f.status !== filters.status) {
                return false;
            }

            return true;
        });
    }, [findings, filters]);

    /* ============================
       Metrics (unchanged)
    ============================ */

    const [complianceStandard, setComplianceStandard] =
        useState<"TEFCA" | "IHE" | "HL7">("TEFCA");

    useEffect(() => {
        setDateRange(preferences.dashboard.defaultDateRange);
        setTimeGrouping(preferences.dashboard.timeGrouping);
    }, [
        preferences.dashboard.defaultDateRange,
        preferences.dashboard.timeGrouping,
    ]);

    useEffect(() => {
        if (!preferences.dashboard.persistFilters) return;

        const stored = localStorage.getItem("dashboard.filters");
        if (!stored) return;

        try {
            const parsed = JSON.parse(stored) as FiltersState;
            setFilters(parsed);
        } catch (error) {
            console.warn("Failed to parse dashboard filters", error);
        }
    }, [preferences.dashboard.persistFilters]);

    useEffect(() => {
        if (!preferences.dashboard.persistFilters) return;
        localStorage.setItem("dashboard.filters", JSON.stringify(filters));
    }, [filters, preferences.dashboard.persistFilters]);

    const { alertCards, insightCards } = useDashboardMetrics(
        findings,
        pdExecutions,
        messages,
        complianceStandard
    );

    /* ============================
       Loading
    ============================ */

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    /* ============================
       UI
    ============================ */

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex flex-col flex-1">
                <Topbar role={role} onLogout={onLogout} />

                <main className="p-4 space-y-6">
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

                    <AlertSummaryCards
                        cards={alertCards}
                        onNavigate={(route) => navigate(route)}
                    />

                    <OperationalInsights
                        cards={insightCards}
                        complianceStandard={complianceStandard}
                        onComplianceStandardChange={setComplianceStandard}
                    />

                    <div className="text-xs text-gray-500">
                        Showing{" "}
                        {dateRange === "24h"
                            ? "the last 24 hours"
                            : dateRange === "7d"
                                ? "the last 7 days"
                                : "the last 30 days"}{" "}
                        grouped{" "}
                        {timeGrouping === "hourly" ? "hourly" : "daily"}.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 🔥 OPTIONAL: You can switch these to filteredFindings later */}
                        <BarChart findings={findings} />
                        <PieChart findings={findings} />
                    </div>

                    {/* FILTERS */}
                    <Filters
                        value={filters}
                        onChange={setFilters}
                        organizations={organizations}
                    />

                    {/* 🔥 FIXED: pass filtered data */}
                    <FindingsTable findings={filteredFindings} />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;