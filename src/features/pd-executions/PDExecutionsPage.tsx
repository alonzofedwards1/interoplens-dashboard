import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

import { PdExecution } from '../../types';
import { useUserPreference } from '../../lib/userPreferences';
import { useServerData } from '../../lib/ServerDataContext';
import { TransactionLink } from '../../components/TransactionLink';
import { Finding } from '../../types/findings';

/* ============================
   Helpers
============================ */

const formatOutcome = (outcome?: string) => {
    switch ((outcome ?? '').toLowerCase()) {
        case 'success':
            return { label: 'Success', color: 'bg-green-100 text-green-800' };
        case 'failure':
            return { label: 'Failure', color: 'bg-red-100 text-red-800' };
        default:
            return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
    }
};

/* ============================
   Component
============================ */

type ExecutionSortKey =
    | 'completedAt'
    | 'requestId'
    | 'outcome'
    | 'executionTimeMs';

type ExecutionPreferences = {
    search: string;
    outcomeFilter: 'success' | 'failure' | 'all';
    sortKey: ExecutionSortKey;
    sortDirection: 'asc' | 'desc';
};

const defaultExecutionPreferences: ExecutionPreferences = {
    search: '',
    outcomeFilter: 'all',
    sortKey: 'completedAt',
    sortDirection: 'desc',
};

const PDExecutions: React.FC = () => {
    const navigate = useNavigate();
    const { pdExecutions, loading, findings } = useServerData();
    const [preferences, setPreferences] = useUserPreference(
        'pd.executions.table',
        defaultExecutionPreferences
    );

    const { outcomeFilter, search, sortDirection, sortKey } = preferences;

    const filteredExecutions = useMemo(() => {
        return pdExecutions.filter(exec => {
            const outcome = (exec.outcome ?? '').toLowerCase();
            const matchesOutcome = outcomeFilter === 'all' || outcome === outcomeFilter;

            if (!search.trim()) return matchesOutcome;

            const query = search.toLowerCase();
            const matchesText =
                (exec.requestId ?? '').toLowerCase().includes(query) ||
                (exec.channelId ?? '').toLowerCase().includes(query);

            return matchesOutcome && matchesText;
        });
    }, [outcomeFilter, pdExecutions, search]);

    const sortedExecutions = useMemo(() => {
        return [...filteredExecutions].sort((a, b) => {
            if (sortKey === 'completedAt') {
                const aTs = new Date(a.completedAt ?? 0).getTime();
                const bTs = new Date(b.completedAt ?? 0).getTime();
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

    const findingsByRequestId = useMemo(() => {
        return (findings as Finding[]).reduce<Record<string, number>>(
            (acc, finding) => {
                if (!finding.executionId) return acc;
                acc[finding.executionId] = (acc[finding.executionId] || 0) + 1;
                return acc;
            },
            {}
        );
    }, [findings]);

    const summaryStats = useMemo(() => {
        const totalExecutions = pdExecutions.length;
        const failures = pdExecutions.filter(
            e => (e.outcome ?? '').toLowerCase() === 'failure'
        ).length;
        const failureRate = totalExecutions
            ? ((failures / totalExecutions) * 100).toFixed(1)
            : '0.0';

        const hourCounts: Record<string, number> = {};
        pdExecutions.forEach(e => {
            const hour = new Date(e.completedAt ?? 0)
                .getUTCHours()
                .toString()
                .padStart(2, '0');

            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const peak = Object.entries(hourCounts).sort(
            (a, b) => b[1] - a[1]
        )[0];

        const peakHour = peak ? `${peak[0]}:00–${peak[0]}:59` : '—';
        const avgPerDay = Math.round(totalExecutions || 0);

        return { totalExecutions, failures, failureRate, peakHour, avgPerDay };
    }, [pdExecutions]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-gray-700">
                Loading Patient Discovery executions...
            </div>
        );
    }

    const toggleSort = (key: ExecutionSortKey) => {
        if (sortKey === key) {
            setPreferences((prev: ExecutionPreferences) => ({
                ...prev,
                sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
            }));
        } else {
            setPreferences((prev: ExecutionPreferences) => ({
                ...prev,
                sortKey: key,
                sortDirection: 'asc',
            }));
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
                <SummaryCard
                    label="Total PD Executions"
                    value={summaryStats.totalExecutions}
                />
                <SummaryCard label="Avg / Day" value={summaryStats.avgPerDay} />
                <SummaryCard label="Peak Hour" value={summaryStats.peakHour} />
                <SummaryCard
                    label="Failure Rate"
                    value={`${summaryStats.failureRate}%`}
                />
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
                                setPreferences((prev: ExecutionPreferences) => ({
                                    ...prev,
                                    outcomeFilter: event.target.value as typeof outcomeFilter,
                                }))
                            }
                            className="border rounded px-2 py-1"
                        >
                            <option value="all">All</option>
                            <option value="success">Success</option>
                            <option value="failure">Failure</option>
                        </select>
                    </div>

                    <input
                        type="search"
                        value={search}
                        onChange={event =>
                            setPreferences((prev: ExecutionPreferences) => ({
                                ...prev,
                                search: event.target.value,
                            }))
                        }
                        placeholder="Filter by request ID or channel"
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
                                setPreferences((prev: ExecutionPreferences) => ({
                                    ...prev,
                                    sortKey: event.target.value as ExecutionSortKey,
                                }))
                            }
                            className="border rounded px-2 py-1"
                        >
                            <option value="completedAt">Completed At</option>
                            <option value="requestId">Request ID</option>
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
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('completedAt')}>Completed At</th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('requestId')}>Request ID</th>
                        <th className="p-3">Traceability</th>
                        <th className="p-3">Channel ID</th>
                        <th className="p-3">Environment</th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('outcome')}>Outcome</th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('executionTimeMs')}>Response Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedExecutions.map(exec => {
                        const outcome = formatOutcome(exec.outcome);
                        const findingsCount = findingsByRequestId[exec.requestId] ?? 0;

                        return (
                            <tr key={exec.requestId} className="border-t text-sm">
                                <td className="p-3 font-mono">
                                    {exec.completedAt
                                        ? new Date(exec.completedAt).toUTCString()
                                        : '—'}
                                </td>
                                <td className="p-3">
                                    <span className="font-mono text-xs">{exec.requestId ?? '—'}</span>
                                </td>
                                <td className="p-3">
                                    <div className="flex flex-col gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 uppercase tracking-wide text-xs">
                                                Transaction ID
                                            </span>
                                            <div>
                                                {exec.requestId ? (
                                                    <TransactionLink id={exec.requestId} />
                                                ) : (
                                                    <span className="text-gray-500">—</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                                {findingsCount} Findings
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                                🔗 Traceable
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3">
                                    {exec.channelId ?? '—'}
                                </td>
                                <td className="p-3">
                                    {exec.environment ?? '—'}
                                </td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${outcome.color}`}
                                    >
                                        {outcome.label}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {exec.executionTimeMs ?? exec.durationMs
                                        ? `${exec.executionTimeMs ?? exec.durationMs} ms`
                                        : '—'}
                                </td>
                            </tr>
                        );
                    })}
                    {!sortedExecutions.length && (
                        <tr>
                            <td colSpan={7} className="p-4 text-center text-gray-500">
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
