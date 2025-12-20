import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

import { pdExecutionsData, PDExecution } from './data/pdExecutions.data';
import { useUserPreference } from '../../lib/userPreferences';

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

type ExecutionSortKey = 'requestTimestamp' | 'organization' | 'outcome' | 'executionTimeMs';

type ExecutionPreferences = {
    search: string;
    outcomeFilter: PDExecution['outcome'] | 'all';
    sortKey: ExecutionSortKey;
    sortDirection: 'asc' | 'desc';
};

const defaultExecutionPreferences: ExecutionPreferences = {
    search: '',
    outcomeFilter: 'all',
    sortKey: 'requestTimestamp',
    sortDirection: 'desc',
};

const PDExecutions: React.FC = () => {
    const navigate = useNavigate();
    const [preferences, setPreferences] = useUserPreference(
        'pd.executions.table',
        defaultExecutionPreferences
    );

    const { outcomeFilter, search, sortDirection, sortKey } = preferences;

    const filteredExecutions = useMemo(() => {
        return pdExecutionsData.filter(exec => {
            const matchesOutcome = outcomeFilter === 'all' || exec.outcome === outcomeFilter;

            if (!search.trim()) return matchesOutcome;

            const query = search.toLowerCase();
            const matchesText =
                exec.organization.toLowerCase().includes(query) ||
                exec.qhin.toLowerCase().includes(query);

            return matchesOutcome && matchesText;
        });
    }, [outcomeFilter, search]);

    const sortedExecutions = useMemo(() => {
        return [...filteredExecutions].sort((a, b) => {
            if (sortKey === 'requestTimestamp') {
                const aTs = new Date(a.requestTimestamp).getTime();
                const bTs = new Date(b.requestTimestamp).getTime();
                return sortDirection === 'asc' ? aTs - bTs : bTs - aTs;
            }

            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue === undefined || bValue === undefined) return 0;
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredExecutions, sortDirection, sortKey]);

    const toggleSort = (key: ExecutionSortKey) => {
        if (sortKey === key) {
            setPreferences(prev => ({
                ...prev,
                sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
            }));
        } else {
            setPreferences(prev => ({ ...prev, sortKey: key, sortDirection: 'asc' }));
        }
    };

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
                <div className="flex flex-wrap gap-3 items-center justify-between p-3 border-b text-sm">
                    <div className="flex gap-2 items-center">
                        <label htmlFor="pd-outcome" className="text-gray-700">
                            Outcome
                        </label>
                        <select
                            id="pd-outcome"
                            value={outcomeFilter}
                            onChange={event =>
                                setPreferences(prev => ({
                                    ...prev,
                                    outcomeFilter: event.target.value as typeof outcomeFilter,
                                }))
                            }
                            className="border rounded px-2 py-1"
                        >
                            <option value="all">All</option>
                            <option value="success">Success</option>
                            <option value="multiple-matches">Multiple Matches</option>
                            <option value="no-match">No Match</option>
                            <option value="error">Failure</option>
                        </select>
                    </div>

                    <input
                        type="search"
                        value={search}
                        onChange={event =>
                            setPreferences(prev => ({
                                ...prev,
                                search: event.target.value,
                            }))
                        }
                        placeholder="Filter by org or QHIN"
                        className="border rounded px-3 py-2 w-full sm:w-72"
                    />

                    <div className="flex gap-2 items-center">
                        <label htmlFor="pd-sort" className="text-gray-700">
                            Sort
                        </label>
                        <select
                            id="pd-sort"
                            value={sortKey}
                            onChange={event =>
                                setPreferences(prev => ({
                                    ...prev,
                                    sortKey: event.target.value as ExecutionSortKey,
                                }))
                            }
                            className="border rounded px-2 py-1"
                        >
                            <option value="requestTimestamp">Timestamp</option>
                            <option value="organization">Organization</option>
                            <option value="outcome">Outcome</option>
                            <option value="executionTimeMs">Response Time</option>
                        </select>
                        <button
                            onClick={() => toggleSort(sortKey)}
                            className="px-2 py-1 border rounded"
                            aria-label={`Toggle sort direction (currently ${sortDirection})`}
                        >
                            {sortDirection === 'asc' ? 'Asc' : 'Desc'}
                        </button>
                    </div>
                </div>

                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100">
                    <tr className="text-left text-sm text-gray-700">
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('requestTimestamp')}>Timestamp</th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('organization')}>Organization</th>
                        <th className="p-3">QHIN</th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('outcome')}>Outcome</th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('executionTimeMs')}>Response Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedExecutions.map(exec => {
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
                    {!sortedExecutions.length && (
                        <tr>
                            <td colSpan={5} className="p-4 text-center text-gray-500">
                                No executions match the current filters.
                            </td>
                        </tr>
                    )}
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
