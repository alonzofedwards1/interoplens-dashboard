import React from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import BarChart from '../../components/BarChart';
import PieChart from '../../components/PieChart';
import Filters from '../../components/Filters';
import FindingsTable from '../../components/FindingsTable';
import ExampleFindings from '../../components/ExampleFindings';

import { useServerData } from '../../lib/ServerDataContext';
import AlertSummaryCards from './components/AlertSummaryCards';
import OperationalInsights from './components/OperationalInsights';
import useDashboardMetrics from './hooks/useDashboardMetrics';
import useDashboardCards from './hooks/useDashboardCards';

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
    const { findings, pdExecutions, telemetryEvents, loading, error, refresh } =
        useServerData();
    const [complianceStandard, setComplianceStandard] =
        React.useState<'TEFCA' | 'IHE' | 'HL7'>('TEFCA');

    const { alertCards, insightCards } = useDashboardMetrics(
        findings,
        pdExecutions,
        telemetryEvents,
        complianceStandard
    );
    const { cards: alertSummaryCards } = useDashboardCards(alertCards);
    console.log('[DashboardPage] pdExecutions', {
        length: pdExecutions.length,
        sample: pdExecutions[0],
        loading,
        error,
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
                    {/* Alert Summary Cards */}
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

                    <AlertSummaryCards
                        cards={alertSummaryCards}
                        onNavigate={route => navigate(route)}
                    />

                    {/* Operational Insights */}
                    <OperationalInsights
                        cards={insightCards}
                        complianceStandard={complianceStandard}
                        onComplianceStandardChange={setComplianceStandard}
                    />

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BarChart findings={findings} />
                        <PieChart findings={findings} />
                    </div>

                    {/* Filters */}
                    <Filters />

                    {/* Findings Table */}
                    <FindingsTable findings={findings} />

                    {/* Example Findings */}
                    <ExampleFindings findings={findings} />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
