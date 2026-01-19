import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartBar, FaClock, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

import { TelemetryEvent } from '../../telemetry/TelemetryEvent';
import { fetchTelemetryEvents, TelemetryFilterParams } from '../../lib/telemetryClient';
import { TransactionLink } from '../../components/TransactionLink';
import Pagination from '../../components/Pagination';

const formatStatus = (status?: string) => {
    const normalized = (status || 'UNKNOWN').toUpperCase();
    switch (normalized) {
        case 'SUCCESS':
            return {
                label: 'SUCCESS',
                className: 'bg-green-100 text-green-800',
                icon: <FaCheckCircle aria-hidden className="mr-1" />,
            };
        case 'NF':
        case 'NO_MATCH':
            return {
                label: 'NF',
                className: 'bg-gray-100 text-gray-800',
                icon: <FaChartBar aria-hidden className="mr-1" />,
            };
        case 'ERROR':
            return {
                label: 'ERROR',
                className: 'bg-red-100 text-red-800',
                icon: <FaTimesCircle aria-hidden className="mr-1" />,
            };
        default:
            return {
                label: normalized,
                className: 'bg-yellow-100 text-yellow-800',
                icon: <FaClock aria-hidden className="mr-1" />,
            };
    }
};

const formatEnvironment = (environment?: string) => {
    if (!environment) return '—';
    const normalized = environment.toUpperCase();
    if (normalized === 'PROD') return 'PROD';
    if (normalized === 'TEST') return 'TEST';
    return normalized;
};

const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'medium',
          });
};

type TelemetryStatus = TelemetryEvent['status'];
type TelemetryEnvironment = TelemetryEvent['environment'];

const TelemetryPage: React.FC = () => {
    const navigate = useNavigate();
    const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | 'custom'>('24h');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [organizationFilter, setOrganizationFilter] = useState<'all' | string>('all');
    const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | string>('all');

    const [statusFilter, setStatusFilter] = useState<TelemetryStatus | 'all'>('all');
    const [environmentFilter, setEnvironmentFilter] = useState<TelemetryEnvironment | 'all'>(
        'all'
    );
    const [search, setSearch] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const pageSize = 25;

    const filterParams = useMemo<TelemetryFilterParams>(() => {
        const now = new Date();
        let startTime: string | undefined;
        let endTime: string | undefined;

        if (timeRange === 'custom') {
            if (customStart) {
                const startDate = new Date(customStart);
                startTime = Number.isNaN(startDate.getTime())
                    ? undefined
                    : startDate.toISOString();
            }
            if (customEnd) {
                const endDate = new Date(customEnd);
                endTime = Number.isNaN(endDate.getTime())
                    ? undefined
                    : endDate.toISOString();
            }
        } else {
            const ranges = {
                '1h': 1,
                '24h': 24,
                '7d': 24 * 7,
            };
            const hours = ranges[timeRange];
            const startDate = new Date(now.getTime() - hours * 60 * 60 * 1000);
            startTime = startDate.toISOString();
            endTime = now.toISOString();
        }

        return {
            startTime,
            endTime,
            organization: organizationFilter === 'all' ? undefined : organizationFilter,
            transactionType:
                transactionTypeFilter === 'all' ? undefined : transactionTypeFilter,
        };
    }, [customEnd, customStart, organizationFilter, timeRange, transactionTypeFilter]);

    const loadTelemetry = React.useCallback(async (filters?: TelemetryFilterParams) => {
        setLoading(true);
        setError(undefined);
        try {
            const shouldAttemptFiltered =
                Boolean(filters?.startTime) ||
                Boolean(filters?.endTime) ||
                Boolean(filters?.organization) ||
                Boolean(filters?.transactionType);

            if (shouldAttemptFiltered) {
                try {
                    const events = await fetchTelemetryEvents(filters);
                    setTelemetryEvents(events);
                    return;
                } catch (err) {
                    console.warn(
                        '[Phase0][TelemetryFilters] Backend filter not supported',
                        err
                    );
                }
            }

            const events = await fetchTelemetryEvents();
            setTelemetryEvents(events);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load telemetry');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTelemetry(filterParams);
    }, [filterParams, loadTelemetry]);

    const organizationOptions = useMemo(() => {
        const values = new Set<string>();
        telemetryEvents.forEach(event => {
            if (event.channelId) {
                values.add(event.channelId);
            }
        });

        return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [telemetryEvents]);

    const transactionTypeOptions = useMemo(() => {
        const values = new Set<string>();
        telemetryEvents.forEach(event => {
            if (event.eventType) {
                values.add(event.eventType);
            }
        });

        return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [telemetryEvents]);

    const filteredEvents = useMemo(() => {
        const query = search.trim().toLowerCase();
        const startTime = filterParams.startTime
            ? Date.parse(filterParams.startTime)
            : undefined;
        const endTime = filterParams.endTime
            ? Date.parse(filterParams.endTime)
            : undefined;

        return telemetryEvents.filter(event => {
            const outcomeStatus = (event.status || 'UNKNOWN').toUpperCase();
            const eventTime = event.timestamp ? Date.parse(event.timestamp) : NaN;

            const matchesStatus =
                statusFilter === 'all' || outcomeStatus === statusFilter?.toUpperCase();
            const matchesEnvironment =
                environmentFilter === 'all' || event.environment === environmentFilter;
            const matchesOrganization =
                organizationFilter === 'all' || event.channelId === organizationFilter;
            const matchesTransactionType =
                transactionTypeFilter === 'all' || event.eventType === transactionTypeFilter;

            const matchesStart =
                startTime === undefined || (!Number.isNaN(eventTime) && eventTime >= startTime);
            const matchesEnd =
                endTime === undefined || (!Number.isNaN(eventTime) && eventTime <= endTime);

            if (
                !matchesStatus ||
                !matchesEnvironment ||
                !matchesOrganization ||
                !matchesTransactionType ||
                !matchesStart ||
                !matchesEnd
            ) {
                return false;
            }
            if (!query) return true;

            return (
                (event.requestId || '').toLowerCase().includes(query) ||
                (event.channelId || '').toLowerCase().includes(query) ||
                (event.interactionId || '').toLowerCase().includes(query) ||
                (event.eventId || '').toLowerCase().includes(query)
            );
        });
    }, [
        environmentFilter,
        filterParams,
        organizationFilter,
        search,
        statusFilter,
        telemetryEvents,
        transactionTypeFilter,
    ]);

    const sortedEvents = useMemo(() => {
        return [...filteredEvents].sort((a, b) => {
            const aTime = new Date(a.timestamp).getTime();
            const bTime = new Date(b.timestamp).getTime();
            return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
        });
    }, [filteredEvents, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedEvents.length / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedEvents = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedEvents.slice(start, start + pageSize);
    }, [page, sortedEvents]);

    const metrics = useMemo(() => {
        const total = telemetryEvents.length;
        const successes = telemetryEvents.filter(
            e => (e.status || '').toUpperCase() === 'SUCCESS'
        ).length;
        const errors = telemetryEvents.filter(
            e => (e.status || '').toUpperCase() === 'ERROR'
        ).length;
        const averageDuration = Math.round(
            telemetryEvents.reduce(
                (sum, event) => sum + Number(event.durationMs ?? 0),
                0
            ) / Math.max(total, 1)
        );

        const successRate = total ? Math.round((successes / total) * 100) : 0;

        return {
            total,
            successes,
            errors,
            averageDuration,
            successRate,
        };
    }, [telemetryEvents]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-gray-700">
                Loading telemetry...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="bg-white shadow rounded p-6 space-y-4 text-center">
                    <div className="text-red-600 font-semibold">{error}</div>
                    <p className="text-gray-600">Unable to load telemetry events.</p>
                    <button
                        onClick={() => loadTelemetry(filterParams)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold">Telemetry</h1>
                        <p className="text-gray-600">
                            Live PD execution telemetry with outcomes and timing
                        </p>
                    </div>
                </div>
                <span
                    className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700"
                    title="Statuses shown here are normalized across systems into a standard taxonomy (Success, Warning, Failure). Raw vendor logs are not displayed."
                >
                    Normalized Status View
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    🔗 Traceable
                </span>
                <button
                    onClick={() => loadTelemetry(filterParams)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Events" value={metrics.total} />
                <SummaryCard label="Success rate" value={`${metrics.successRate}%`} />
                <SummaryCard label="Errors" value={metrics.errors} />
                <SummaryCard label="Avg duration" value={`${metrics.averageDuration} ms`} />
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-3 items-center justify-between text-sm">
                <div className="flex flex-wrap gap-2 items-center">
                    <label htmlFor="telemetry-time-range" className="text-gray-700">
                        Time Range
                    </label>
                    <select
                        id="telemetry-time-range"
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
                        <label htmlFor="telemetry-start" className="text-gray-700">
                            Start
                        </label>
                        <input
                            id="telemetry-start"
                            type="datetime-local"
                            value={customStart}
                            onChange={event => setCustomStart(event.target.value)}
                            className="border rounded px-2 py-1"
                        />
                        <label htmlFor="telemetry-end" className="text-gray-700">
                            End
                        </label>
                        <input
                            id="telemetry-end"
                            type="datetime-local"
                            value={customEnd}
                            onChange={event => setCustomEnd(event.target.value)}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                )}

                <div className="flex flex-wrap gap-2 items-center">
                    <label htmlFor="telemetry-org" className="text-gray-700">
                        Organization / Channel
                    </label>
                    <select
                        id="telemetry-org"
                        value={organizationFilter}
                        onChange={event => setOrganizationFilter(event.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="all">All</option>
                        {organizationOptions.length ? (
                            organizationOptions.map(value => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))
                        ) : (
                            <option value="all">Unavailable</option>
                        )}
                    </select>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <label htmlFor="telemetry-transaction" className="text-gray-700">
                        Transaction Type
                    </label>
                    <select
                        id="telemetry-transaction"
                        value={transactionTypeFilter}
                        onChange={event => setTransactionTypeFilter(event.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="all">All</option>
                        {transactionTypeOptions.length ? (
                            transactionTypeOptions.map(value => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))
                        ) : (
                            <option value="all">Unavailable</option>
                        )}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2 items-center text-sm">
                    <label htmlFor="telemetry-status" className="text-gray-700">
                        Status
                    </label>
                    <select
                        id="telemetry-status"
                        value={statusFilter}
                        onChange={event =>
                            setStatusFilter(event.target.value as typeof statusFilter)
                        }
                        className="border rounded px-2 py-1"
                    >
                        <option value="all">All</option>
                        <option value="SUCCESS">Success</option>
                        <option value="NF">NF</option>
                        <option value="NO_MATCH">No match</option>
                        <option value="ERROR">Error</option>
                    </select>
                </div>

                <div className="flex gap-2 items-center text-sm">
                    <label htmlFor="telemetry-environment" className="text-gray-700">
                        Environment
                    </label>
                    <select
                        id="telemetry-environment"
                        value={environmentFilter}
                        onChange={event =>
                            setEnvironmentFilter(event.target.value as typeof environmentFilter)
                        }
                        className="border rounded px-2 py-1"
                    >
                        <option value="all">All</option>
                        <option value="PROD">Prod</option>
                        <option value="TEST">Test</option>
                    </select>
                </div>

                <input
                    type="search"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search request, message, channel, or interaction"
                    className="border rounded px-3 py-2 w-full sm:w-80"
                />

                <button
                    onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="px-3 py-2 border rounded text-sm"
                >
                    Sort: {sortDirection === 'asc' ? 'Oldest first' : 'Newest first'}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100 text-left text-sm text-gray-700">
                        <tr>
                            <th className="p-3">Event ID</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Event Type</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Request ID</th>
                            <th className="p-3">Channel ID</th>
                            <th className="p-3">Interaction ID</th>
                            <th className="p-3">Duration (ms)</th>
                            <th className="p-3">Environment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedEvents.map(event => {
                            const statusValue = event.status || 'UNKNOWN';
                            const status = formatStatus(statusValue);
                            return (
                                <tr key={event.eventId} className="border-t text-sm">
                                    <td className="p-3 font-mono text-xs text-gray-700">
                                        {event.eventId}
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        {formatTimestamp(event.timestamp)}
                                    </td>
                                    <td className="p-3">{event.eventType || '—'}</td>
                                    <td className="p-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded text-xs ${status.className}`}
                                        >
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono break-all">
                                        {event.requestId ? (
                                            <TransactionLink id={event.requestId} />
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td className="p-3 font-mono break-all">
                                        {event.channelId || '—'}
                                    </td>
                                    <td className="p-3 font-mono break-all">
                                        {event.interactionId || '—'}
                                    </td>
                                    <td className="p-3">{Number(event.durationMs ?? 0)}</td>
                                    <td className="p-3">{formatEnvironment(event.environment)}</td>
                                </tr>
                            );
                        })}
                        {!sortedEvents.length && (
                            <tr>
                                <td colSpan={9} className="p-4 text-center text-gray-500">
                                    No telemetry events available.
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

const SummaryCard = ({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) => (
    <div className="bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

export default TelemetryPage;
