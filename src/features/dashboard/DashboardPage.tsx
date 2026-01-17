import React from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import BarChart from '../../components/BarChart';
import PieChart from '../../components/PieChart';
import Filters from '../../components/Filters';
import FindingsTable from '../../components/FindingsTable';

import { useServerData } from '../../lib/ServerDataContext';
import AlertSummaryCards from './components/AlertSummaryCards';
import OperationalInsights from './components/OperationalInsights';
import useDashboardMetrics from './hooks/useDashboardMetrics';

/* ============================
   Types
============================ */

interface DashboardProps {
    role: 'admin' | 'analyst' | 'committee' | null;
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

    const [complianceStandard, setComplianceStandard] =
        React.useState<'TEFCA' | 'IHE' | 'HL7'>('TEFCA');

    /**
     * ✅ SINGLE SOURCE OF TRUTH
     * Metrics are derived ONLY here
     */
    const { alertCards, insightCards } = useDashboardMetrics(
        findings,
        pdExecutions,
        telemetryEvents,
        complianceStandard
    );

    console.log('[Dashboard] metrics snapshot', {
        totalFindings: findings.length,
        alertCards,
    });

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
                            {error}. Showing cached fixtures; refresh once the API is available.
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
                            Telemetry unavailable: {telemetryWarning}. Observability data will appear once the service recovers.
                        </div>
                    )}

                    {/* ============================
                        Alert Summary Cards
                    ============================ */}
                    <AlertSummaryCards
                        cards={alertCards}
                        onNavigate={route => navigate(route)}
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
                        Filters
                    ============================ */}
                    <Filters />

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
