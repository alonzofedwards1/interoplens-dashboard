import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartBar, FaClock, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

import { TelemetryEvent } from '../../telemetry/TelemetryEvent';
import { useServerData } from '../../lib/ServerDataContext';

const formatStatus = (status: TelemetryEvent['outcome']['status']) => {
    switch (status) {
        case 'SUCCESS':
            return {
                label: 'Success',
                className: 'bg-green-100 text-green-800',
                icon: <FaCheckCircle aria-hidden className="mr-1" />,
            };
        case 'NO_MATCH':
            return {
                label: 'No Match',
                className: 'bg-gray-100 text-gray-800',
                icon: <FaChartBar aria-hidden className="mr-1" />,
            };
        case 'ERROR':
            return {
                label: 'Error',
                className: 'bg-red-100 text-red-800',
                icon: <FaTimesCircle aria-hidden className="mr-1" />,
            };
        case 'PARTIAL':
            return {
                label: 'Partial',
                className: 'bg-yellow-100 text-yellow-800',
                icon: <FaClock aria-hidden className="mr-1" />,
            };
    }
};

const formatEnvironment = (environment: TelemetryEvent['source']['environment']) =>
    environment === 'PROD' ? 'Production' : 'Test';

const TelemetryPage: React.FC = () => {
    const navigate = useNavigate();
    const { telemetryEvents, loading } = useServerData();

    const [statusFilter, setStatusFilter] = useState<
        TelemetryEvent['outcome']['status'] | 'all'
    >('all');
    const [environmentFilter, setEnvironmentFilter] = useState<
        TelemetryEvent['source']['environment'] | 'all'
    >('all');
    const [search, setSearch] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const filteredEvents = useMemo(() => {
        const query = search.trim().toLowerCase();

        return telemetryEvents.filter(event => {
            const matchesStatus = statusFilter === 'all' || event.outcome.status === statusFilter;
            const matchesEnvironment =
                environmentFilter === 'all' || event.source.environment === environmentFilter;

            if (!matchesStatus || !matchesEnvironment) {
                return false;
            }

            if (!query) return true;

            return (
                event.source.organization.toLowerCase().includes(query) ||
                event.source.qhin.toLowerCase().includes(query) ||
                event.correlation.requestId.toLowerCase().includes(query) ||
                event.correlation.messageId.toLowerCase().includes(query)
            );
        });
    }, [environmentFilter, search, statusFilter, telemetryEvents]);

    const sortedEvents = useMemo(() => {
        return [...filteredEvents].sort((a, b) => {
            const aTime = new Date(a.timestamp).getTime();
            const bTime = new Date(b.timestamp).getTime();
            return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
        });
    }, [filteredEvents, sortDirection]);

    const metrics = useMemo(() => {
        const total = telemetryEvents.length;
        const successes = telemetryEvents.filter(e => e.outcome.status === 'SUCCESS').length;
        const errors = telemetryEvents.filter(e => e.outcome.status === 'ERROR').length;
        const averageDuration = Math.round(
            telemetryEvents.reduce((sum, event) => sum + event.execution.durationMs, 0) /
                Math.max(total, 1)
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
                    <h1 className="text-2xl font-semibold">Telemetry</h1>
                    <p className="text-gray-600">
                        In-process PD execution telemetry with outcomes and timing
                    </p>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Events" value={metrics.total} />
                <SummaryCard label="Success rate" value={`${metrics.successRate}%`} />
                <SummaryCard label="Errors" value={metrics.errors} />
                <SummaryCard label="Avg duration" value={`${metrics.averageDuration} ms`} />
            </div>

            {/* Filters */}
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
                        <option value="NO_MATCH">No match</option>
                        <option value="PARTIAL">Partial</option>
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
                            setEnvironmentFilter(
                                event.target.value as typeof environmentFilter
                            )
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
                    placeholder="Search org, QHIN, or request ID"
                    className="border rounded px-3 py-2 w-full sm:w-72"
                />

                <button
                    onClick={() =>
                        setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
                    }
                    className="px-3 py-2 border rounded text-sm"
                >
                    Sort: {sortDirection === 'asc' ? 'Oldest first' : 'Newest first'}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100 text-left text-sm text-gray-700">
                        <tr>
                            <th className="p-3">Timestamp (UTC)</th>
                            <th className="p-3">Organization</th>
                            <th className="p-3">QHIN</th>
                            <th className="p-3">Environment</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Result count</th>
                            <th className="p-3">Duration</th>
                            <th className="p-3">Request ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedEvents.map(event => {
                            const status = formatStatus(event.outcome.status);
                            return (
                                <tr key={event.eventId} className="border-t text-sm">
                                    <td className="p-3 font-mono">
                                        {new Date(event.timestamp).toUTCString()}
                                    </td>
                                    <td className="p-3">{event.source.organization}</td>
                                    <td className="p-3">{event.source.qhin}</td>
                                    <td className="p-3">{formatEnvironment(event.source.environment)}</td>
                                    <td className="p-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded text-xs ${status.className}`}
                                        >
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="p-3">{event.outcome.resultCount}</td>
                                    <td className="p-3">{event.execution.durationMs} ms</td>
                                    <td className="p-3 font-mono">{event.correlation.requestId}</td>
                                </tr>
                            );
                        })}
                        {!sortedEvents.length && (
                            <tr>
                                <td colSpan={8} className="p-4 text-center text-gray-500">
                                    No telemetry events match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
