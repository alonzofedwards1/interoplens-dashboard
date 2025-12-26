import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartBar, FaClock, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

import { TelemetryEvent } from '../../telemetry/TelemetryEvent';
import { fetchTelemetryEvents } from '../../lib/telemetryClient';

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

const TelemetryPage: React.FC = () => {
    const navigate = useNavigate();
    const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    const loadTelemetry = React.useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const events = await fetchTelemetryEvents();
            setTelemetryEvents(events);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load telemetry');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTelemetry();
    }, [loadTelemetry]);

    const sortedEvents = useMemo(() => {
        return [...telemetryEvents].sort((a, b) => {
            const aTime = new Date(a.timestamp).getTime();
            const bTime = new Date(b.timestamp).getTime();
            return bTime - aTime;
        });
    }, [telemetryEvents]);

    const metrics = useMemo(() => {
        const total = telemetryEvents.length;
        const successes = telemetryEvents.filter(
            e => (e.outcome?.status as string)?.toUpperCase() === 'SUCCESS'
        ).length;
        const errors = telemetryEvents.filter(
            e => (e.outcome?.status as string)?.toUpperCase() === 'ERROR'
        ).length;
        const averageDuration = Math.round(
            telemetryEvents.reduce(
                (sum, event) => sum + Number(event.execution?.durationMs ?? 0),
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
                        onClick={loadTelemetry}
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
                <button
                    onClick={loadTelemetry}
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

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100 text-left text-sm text-gray-700">
                        <tr>
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
                        {sortedEvents.map(event => {
                            const statusValue = (event.outcome?.status as string) || 'UNKNOWN';
                            const status = formatStatus(statusValue);
                            return (
                                <tr key={event.eventId} className="border-t text-sm">
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
                                        {event.correlation?.requestId || '—'}
                                    </td>
                                    <td className="p-3 font-mono break-all">
                                        {event.source?.channelId || '—'}
                                    </td>
                                    <td className="p-3 font-mono break-all">
                                        {event.protocol?.interactionId || '—'}
                                    </td>
                                    <td className="p-3">{Number(event.execution?.durationMs ?? 0)}</td>
                                    <td className="p-3">{formatEnvironment(event.source?.environment)}</td>
                                </tr>
                            );
                        })}
                        {!sortedEvents.length && (
                            <tr>
                                <td colSpan={8} className="p-4 text-center text-gray-500">
                                    No telemetry events available.
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
