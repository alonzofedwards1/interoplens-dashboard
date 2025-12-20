import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

import { pdExecutionsData, PDExecution } from '../data/pdExecutions.data';

/* ============================
   Derived Metrics
============================ */

const totalExecutions = pdExecutionsData.length;

const executionsByDay = 1; // mock window (single day demo)
const avgPerDay = Math.round(totalExecutions / executionsByDay);

const failures = pdExecutionsData.filter(
    e => e.outcome === 'error'
).length;

const failureRate = totalExecutions
    ? ((failures / totalExecutions) * 100).toFixed(1)
    : '0.0';

const peakHour = (() => {
    const hourCounts: Record<string, number> = {};

    pdExecutionsData.forEach(e => {
        const hour = new Date(e.requestTimestamp)
            .getUTCHours()
            .toString()
            .padStart(2, '0');

        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peak = Object.entries(hourCounts).sort(
        (a, b) => b[1] - a[1]
    )[0];

    return peak ? `${peak[0]}:00–${peak[0]}:59` : '—';
})();

/* ============================
   Helpers
============================ */

const formatOutcome = (outcome: PDExecution['outcome']) => {
    switch (outcome) {
        case 'success':
            return { label: 'Success', color: 'bg-green-100 text-green-800' };
        case 'multiple-matches':
            return { label: 'Multiple Matches', color: 'bg-yellow-100 text-yellow-800' };
        case 'no-match':
            return { label: 'No Match', color: 'bg-gray-100 text-gray-800' };
        case 'error':
            return { label: 'Failure', color: 'bg-red-100 text-red-800' };
    }
};

/* ============================
   Component
============================ */

const PDExecutions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold">PD Executions</h1>
                    <p className="text-gray-600">
                        Behavioral overview of Patient Discovery activity
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total PD Executions" value={totalExecutions} />
                <SummaryCard label="Avg / Day" value={avgPerDay} />
                <SummaryCard label="Peak Hour" value={peakHour} />
                <SummaryCard label="Failure Rate" value={`${failureRate}%`} />
            </div>

            {/* Charts (placeholders) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center text-gray-400">
                    PD Volume Over Time (Chart)
                </div>
                <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center text-gray-400">
                    Outcome Distribution (Chart)
                </div>
            </div>

            {/* Execution Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100">
                    <tr className="text-left text-sm text-gray-700">
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Organization</th>
                        <th className="p-3">QHIN</th>
                        <th className="p-3">Outcome</th>
                        <th className="p-3">Response Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pdExecutionsData.map(exec => {
                        const outcome = formatOutcome(exec.outcome);

                        return (
                            <tr key={exec.id} className="border-t text-sm">
                                <td className="p-3 font-mono">
                                    {new Date(exec.requestTimestamp).toUTCString()}
                                </td>
                                <td className="p-3">
                                    {exec.organization}
                                </td>
                                <td className="p-3">
                                    {exec.qhin}
                                </td>
                                <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${outcome.color}`}
                                        >
                                            {outcome.label}
                                        </span>
                                </td>
                                <td className="p-3">
                                    {exec.executionTimeMs
                                        ? `${exec.executionTimeMs} ms`
                                        : '—'}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ============================
   Small Helper Component
============================ */

const SummaryCard = ({
                         label,
                         value
                     }: {
    label: string;
    value: string | number;
}) => (
    <div className="bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

export default PDExecutions;
