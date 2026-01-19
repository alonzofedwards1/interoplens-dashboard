import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { PdExecution } from '../../types/pdExecutions';
import { useUserPreference } from '../../lib/userPreferences';
import { useServerData } from '../../lib/ServerDataContext';
import { TransactionLink } from '../../components/TransactionLink';
import Pagination from '../../components/Pagination';
import { Finding } from '../../types/findings';
import { fetchPdExecutionTelemetry } from '../../lib/api/pdExecutions';

/* ============================
   Helpers
============================ */

const formatOutcome = (outcome?: string) => {
    switch ((outcome ?? '').toLowerCase()) {
        case 'success':
            return { label: 'Success', color: 'bg-green-100 text-green-800' };
        case 'failure':
            return { label: 'Failure', color: 'bg-red-100 text-red-800' };
        case 'partial':
            return { label: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
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
    | 'durationMs';

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
    const [telemetryCounts, setTelemetryCounts] = useState<Record<string, number | null>>({});
    const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | 'custom'>('24h');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const missingTelemetryApiLogged = useRef(false);
    const missingChartDataLogged = useRef(false);

    const { outcomeFilter, search, sortDirection, sortKey } = preferences;

    const timeRangeBounds = useMemo(() => {
        const now = new Date();
        let startTime: number | undefined;
        let endTime: number | undefined;

        if (timeRange === 'custom') {
            if (customStart) {
                const startDate = new Date(customStart);
                startTime = Number.isNaN(startDate.getTime())
                    ? undefined
                    : startDate.getTime();
            }
            if (customEnd) {
                const endDate = new Date(customEnd);
                endTime = Number.isNaN(endDate.getTime())
                    ? undefined
                    : endDate.getTime();
            }
        } else {
            const ranges = {
                '1h': 1,
                '24h': 24,
                '7d': 24 * 7,
            };
            const hours = ranges[timeRange];
            startTime = now.getTime() - hours * 60 * 60 * 1000;
            endTime = now.getTime();
        }

        return { startTime, endTime };
    }, [customEnd, customStart, timeRange]);

    const filteredExecutions = useMemo(() => {
        return pdExecutions.filter(exec => {
            const outcome = (exec.outcome ?? '').toLowerCase();
            const matchesOutcome = outcomeFilter === 'all' || outcome === outcomeFilter;

            const completedAtMs = exec.completedAt
                ? new Date(exec.completedAt).getTime()
                : NaN;
            const matchesStart =
                timeRangeBounds.startTime === undefined ||
                (!Number.isNaN(completedAtMs) && completedAtMs >= timeRangeBounds.startTime);
            const matchesEnd =
                timeRangeBounds.endTime === undefined ||
                (!Number.isNaN(completedAtMs) && completedAtMs <= timeRangeBounds.endTime);

            if (!search.trim()) return matchesOutcome && matchesStart && matchesEnd;

            const query = search.toLowerCase();
            const matchesText =
                (exec.requestId ?? '').toLowerCase().includes(query) ||
                (exec.qhinName ?? '').toLowerCase().includes(query);

            return matchesOutcome && matchesText && matchesStart && matchesEnd;
        });
    }, [outcomeFilter, pdExecutions, search, timeRangeBounds]);

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

    const totalPages = Math.max(1, Math.ceil(sortedExecutions.length / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedExecutions = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedExecutions.slice(start, start + pageSize);
    }, [page, sortedExecutions]);

    useEffect(() => {
        let isMounted = true;

        const loadTelemetryCounts = async () => {
            if (!pdExecutions.length) {
                setTelemetryCounts({});
                return;
            }

            const results = await Promise.all(
                pdExecutions.map(async exec => {
                    if (!exec.requestId) {
                        return [exec.requestId ?? '', null] as const;
                    }

                    try {
                        const data = await fetchPdExecutionTelemetry(exec.requestId);
                        return [exec.requestId, Array.isArray(data) ? data.length : 0] as const;
                    } catch (err) {
                        if (!missingTelemetryApiLogged.current) {
                            console.error(
                                '[Phase0][PDExecutionGrouping] Missing telemetry linkage API',
                                err
                            );
                            missingTelemetryApiLogged.current = true;
                        }
                        return [exec.requestId, null] as const;
                    }
                })
            );

            if (isMounted) {
                setTelemetryCounts(
                    results.reduce<Record<string, number | null>>((acc, [id, count]) => {
                        if (id) {
                            acc[id] = count;
                        }
                        return acc;
                    }, {})
                );
            }
        };

        loadTelemetryCounts();

        return () => {
            isMounted = false;
        };
    }, [pdExecutions]);

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

    const executionVolumeData = useMemo(() => {
        if (!pdExecutions.length) return [];

        const buckets = pdExecutions.reduce<Record<string, number>>((acc, exec) => {
            if (!exec.completedAt) return acc;
            const date = new Date(exec.completedAt);
            if (Number.isNaN(date.getTime())) return acc;
            const key = date.toISOString().slice(0, 10);
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});

        return Object.entries(buckets)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [pdExecutions]);

    useEffect(() => {
        if (pdExecutions.length === 0 && !missingChartDataLogged.current) {
            console.warn(
                '[Phase0][PDExecutionCharts] No execution data available for chart rendering'
            );
            missingChartDataLogged.current = true;
        }
    }, [pdExecutions.length]);

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

            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-3">PD Execution Volume</h2>
                {executionVolumeData.length ? (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={executionVolumeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">
                        Execution volume charts appear once execution data is available.
                    </div>
                )}
            </div>

            {/* Execution Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <div className="flex flex-wrap gap-3 items-center justify-between p-3 border-b text-sm">
                    <div className="flex flex-wrap gap-2 items-center">
                        <label htmlFor="pd-time-range" className="text-gray-700">
                            Time Range
                        </label>
                        <select
                            id="pd-time-range"
                            value={timeRange}
                            onChange={event =>
                                setTimeRange(event.target.value as typeof timeRange)
                            }
                            className="border rounded px-2 py-1"
                        >
                            <option value="1h">Last 1h</option>
                            <option value="24h">Last 24h</option>
                            <option value="7d">Last 7d</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {timeRange === 'custom' && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <label htmlFor="pd-start" className="text-gray-700">
                                Start
                            </label>
                            <input
                                id="pd-start"
                                type="datetime-local"
                                value={customStart}
                                onChange={event => setCustomStart(event.target.value)}
                                className="border rounded px-2 py-1"
                            />
                            <label htmlFor="pd-end" className="text-gray-700">
                                End
                            </label>
                            <input
                                id="pd-end"
                                type="datetime-local"
                                value={customEnd}
                                onChange={event => setCustomEnd(event.target.value)}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                    )}
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
                        placeholder="Filter by request ID or QHIN"
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
                            <option value="durationMs">Response Time</option>
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
                        <th className="p-3">Telemetry Events</th>
                        <th className="p-3">QHIN</th>
                        <th className="p-3">Environment</th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('outcome')}>Outcome</th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('durationMs')}>Response Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pagedExecutions.map(exec => {
                        const outcome = formatOutcome(exec.outcome);
                        const findingsCount = findingsByRequestId[exec.requestId] ?? 0;
                        const telemetryCount = exec.requestId
                            ? telemetryCounts[exec.requestId]
                            : null;

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
                                    <div className="text-sm text-gray-700">
                                        {telemetryCount === null ? (
                                            <span className="text-gray-500">
                                                Telemetry count unavailable
                                            </span>
                                        ) : (
                                            <span>
                                                Grouped from {telemetryCount} telemetry events
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        <span
                                            title="Executions are grouped using correlation/request IDs."
                                            className="inline-flex items-center gap-1"
                                        >
                                            ℹ️ Executions are grouped using correlation/request IDs
                                        </span>
                                    </div>
                                </td>
                                <td className="p-3">
                                    {exec.qhinName ?? '—'}
                                </td>
                                <td className="p-3">
                                    {exec.sourceEnvironment ?? '—'}
                                </td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${outcome.color}`}
                                    >
                                        {outcome.label}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {exec.durationMs ? `${exec.durationMs} ms` : '—'}
                                </td>
                            </tr>
                        );
                    })}
                    {!sortedExecutions.length && (
                        <tr>
                            <td colSpan={8} className="p-4 text-center text-gray-500">
                                No executions match the current filters.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
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
