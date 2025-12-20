import React from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import BarChart from '../../components/BarChart';
import PieChart from '../../components/PieChart';
import Filters from '../../components/Filters';
import FindingsTable from '../../components/FindingsTable';
import ExampleFindings from '../../components/ExampleFindings';

import {
    FaUsers,
    FaExclamationTriangle,
    FaBell,
    FaExclamationCircle,
    FaGavel
} from 'react-icons/fa';

import { findingsData } from '../findings/data/findings.data';
import { pdExecutionsData } from '../pd-executions/data/pdExecutions.data';

/* ============================
   Types
============================ */

interface DashboardProps {
    role: 'admin' | 'analyst' | 'committee' | null;
    onLogout: () => void;
}

/* ============================
   Derived Metrics (Single Source of Truth)
============================ */

// Findings
const totalFindings = findingsData.length;

const warningCount = findingsData.filter(
    f => f.severity === 'warning'
).length;

const criticalCount = findingsData.filter(
    f => f.severity === 'critical'
).length;

const committeeCount = findingsData.filter(
    f => f.type === 'Committee' && f.status === 'non-compliant'
).length;

// PD Executions
const totalPDExecutions = pdExecutionsData.length;
const pdSuccessCount = pdExecutionsData.filter(
    execution => execution.outcome === 'success'
).length;
const pdErrorCount = pdExecutionsData.filter(
    execution => execution.outcome === 'error'
).length;
const averagePdLatencyMs = Math.round(
    pdExecutionsData.reduce((sum, execution) => sum + execution.executionTimeMs, 0) /
        Math.max(totalPDExecutions, 1)
);

/* ============================
   Summary Card Data
============================ */

const alertCards = [
    {
        title: 'Total PD Executions',
        value: totalPDExecutions.toString(),
        icon: <FaUsers className="text-blue-500 text-2xl" />,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        route: '/pd-executions',
    },
    {
        title: 'Findings Detected',
        value: totalFindings.toString(),
        icon: <FaExclamationTriangle className="text-red-500 text-2xl" />,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        route: '/findings',
    },
    {
        title: 'Warnings',
        value: warningCount.toString(),
        icon: <FaBell className="text-yellow-500 text-2xl" />,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        route: '/findings?severity=warning',
    },
    {
        title: 'Critical Issues',
        value: criticalCount.toString(),
        icon: <FaExclamationCircle className="text-orange-600 text-2xl" />,
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        route: '/findings?severity=critical',
    },
    {
        title: 'CommitteeQueue',
        value: committeeCount.toString(),
        icon: <FaGavel className="text-red-600 text-2xl" />,
        bgColor: 'bg-red-200',
        textColor: 'text-red-900',
        route: '/committee',
    },
];

/* ============================
   Component
============================ */

const Dashboard: React.FC<DashboardProps> = ({ role, onLogout }) => {
    const navigate = useNavigate();

    const { complianceRate, compliantFindings, prodFindings } = React.useMemo(() => {
        const compliant = findingsData.filter(
            finding => finding.status === 'compliant'
        ).length;
        const compliancePct = Math.round(
            (compliant / Math.max(totalFindings, 1)) * 100
        );
        const prod = findingsData.filter(
            finding => finding.environment === 'prod'
        ).length;

        return {
            complianceRate: compliancePct,
            compliantFindings: compliant,
            prodFindings: prod,
        };
    }, []);

    const insightCards = React.useMemo(
        () => [
            {
                title: 'Compliance coverage',
                summary: `${complianceRate}% compliant (${compliantFindings}/${totalFindings})`,
                detail: 'Most findings are compliant; review non-compliant items to close remaining gaps.',
            },
            {
                title: 'Production focus',
                summary: `${prodFindings}/${totalFindings} findings in production`,
                detail: `${criticalCount} critical issues remain open, including committee-queued cases that need decisions.`,
            },
            {
                title: 'PD execution health',
                summary: `${Math.round((pdSuccessCount / Math.max(totalPDExecutions, 1)) * 100)}% success rate`,
                detail: `${pdErrorCount} errors observed; average latency ${averagePdLatencyMs} ms. Track retries tied to critical findings.`,
            },
        ],
        []
    );

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex flex-col flex-1">
                <Topbar role={role} onLogout={onLogout} />

                <main className="p-4 space-y-6">
                    {/* Alert Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {alertCards.map((card, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => navigate(card.route)}
                                className={`
                                    text-left rounded-lg p-4 shadow w-full
                                    flex items-center space-x-3
                                    transition hover:shadow-md hover:scale-[1.02]
                                    ${card.bgColor} ${card.textColor}
                                `}
                            >
                                <div>{card.icon}</div>
                                <div>
                                    <div className="text-xl font-bold">
                                        {card.value}
                                    </div>
                                    <div className="text-sm">
                                        {card.title}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Operational Insights */}
                    <section aria-labelledby="operational-insights" className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2
                                id="operational-insights"
                                className="text-lg font-semibold text-gray-800"
                            >
                                Operational insights
                            </h2>
                            <span className="text-sm text-gray-500">
                                Derived from current findings and PD execution telemetry
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {insightCards.map(card => (
                                <article
                                    key={card.title}
                                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="text-sm font-semibold text-gray-700">
                                        {card.title}
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 mt-1">
                                        {card.summary}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                        {card.detail}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BarChart />
                        <PieChart />
                    </div>

                    {/* Filters */}
                    <Filters />

                    {/* Findings Table */}
                    <FindingsTable />

                    {/* Example Findings */}
                    <ExampleFindings />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
