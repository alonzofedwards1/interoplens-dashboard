import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

import Pagination from '../../components/Pagination';
import { TransactionLink } from '../../components/TransactionLink';
import { ColumnFilter } from '../../components/table/ColumnFilter';
import { TableHeaderCell } from '../../components/table/TableHeaderCell';
import { TableToolbar } from '../../components/table/TableToolbar';
import type { DateRangeFilterValue, RangeFilterValue } from '../../components/table/types';
import { useCertificateDetails } from '../../hooks/useCertificateDetails';
import { useTableControls } from '../../hooks/useTableControls';
import {
    fetchMessageEvents,
    MessageFilterParams,
    MessageSortBy,
    buildMessageEventsQuery,
} from '../../lib/telemetryClient';
import type { MessageMonitorRow } from '../../types/messages';
import CertInspectorModal from '../integration-issues/modals/CertInspectorModal';

interface MessageMonitorFilters {
    search: string;
    source: 'all' | 'transport' | 'telemetry';
    organization: string;
    transactionType: string;
    status: 'all' | 'Success' | 'Error' | 'Warning';
    environment: 'all' | 'PROD' | 'TEST';
    transportTimestamp: DateRangeFilterValue;
    durationMs: RangeFilterValue<number>;
}

const DEFAULT_FILTERS: MessageMonitorFilters = {
    search: '',
    source: 'all',
    organization: '',
    transactionType: '',
    status: 'all',
    environment: 'all',
    transportTimestamp: { start: '', end: '' },
    durationMs: { min: undefined, max: undefined },
};

const SORTABLE_COLUMNS: readonly MessageSortBy[] = [
    'timestamp',
    'eventType',
    'status',
    'durationMs',
    'environment',
    'channelId',
] as const;

const formatStatus = (status?: string | null) => {
    switch (status) {
        case 'Success':
            return {
                label: 'Success',
                className: 'bg-green-100 text-green-800',
                icon: <FaCheckCircle aria-hidden className="mr-1" />,
            };
        case 'Error':
            return {
                label: 'Error',
                className: 'bg-red-100 text-red-800',
                icon: <FaTimesCircle aria-hidden className="mr-1" />,
            };
        case 'Warning':
        default:
            return {
                label: status ?? 'Warning',
                className: 'bg-yellow-100 text-yellow-800',
                icon: <FaClock aria-hidden className="mr-1" />,
            };
    }
};

const formatCertificateStatus = (status: 'Valid' | 'Expired' | 'Expiring Soon') => {
    if (status === 'Valid') return 'bg-green-100 text-green-800';
    if (status === 'Expired') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
};

const formatEnvironment = (environment?: string | null) => {
    if (!environment) return '-';
    const normalized = environment.toUpperCase();
    if (normalized === 'PROD' || normalized === 'TEST') return normalized;
    return normalized;
};

const formatTimestamp = (timestamp?: string | null) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' });
};

const toIsoIfValid = (value?: string) => {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const TelemetryPage: React.FC = () => {
    const navigate = useNavigate();
    const [messageEvents, setMessageEvents] = useState<MessageMonitorRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

    const { data: selectedCertificate, loading: certificateLoading, error: certificateError } =
        useCertificateDetails(selectedTransactionId);

    const {
        filters,
        sortBy,
        sortOrder,
        limit,
        offset,
        setFilter,
        setSort,
        setLimit,
        setOffset,
        resetAll,
        buildQueryString,
    } = useTableControls<MessageMonitorFilters, MessageSortBy>({
        tableKey: 'message-monitor',
        defaultFilters: DEFAULT_FILTERS,
        defaultLimit: 25,
        defaultOffset: 0,
        allowedSortColumns: SORTABLE_COLUMNS,
    });

    const lastQueryRef = useRef<string>('');

    const apiFilters = useMemo<MessageFilterParams>(
        () => ({
            search: filters.search.trim() || undefined,
            source: filters.source === 'all' ? undefined : filters.source,
            organization: filters.organization || undefined,
            transactionType: filters.transactionType || undefined,
            status: filters.status === 'all' ? undefined : filters.status,
            environment: filters.environment === 'all' ? undefined : filters.environment,
            startTime: toIsoIfValid(filters.transportTimestamp.start),
            endTime: toIsoIfValid(filters.transportTimestamp.end),
            daysUntilExpirationMin:
                typeof filters.durationMs.min === 'number' ? filters.durationMs.min : undefined,
            daysUntilExpirationMax:
                typeof filters.durationMs.max === 'number' ? filters.durationMs.max : undefined,
        }),
        [filters]
    );

    const loadMessages = React.useCallback(async () => {
        const query = buildMessageEventsQuery({
            filters: apiFilters,
            sortBy: sortBy ?? undefined,
            sortOrder: sortOrder ?? undefined,
            limit,
            offset,
        });

        if (query === lastQueryRef.current) {
            return;
        }

        lastQueryRef.current = query;
        setLoading(true);
        setError(null);

        try {
            const response = await fetchMessageEvents({
                filters: apiFilters,
                sortBy: sortBy ?? undefined,
                sortOrder: sortOrder ?? undefined,
                limit,
                offset,
            });
            setMessageEvents(response.items);
            setTotalCount(response.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [apiFilters, limit, offset, sortBy, sortOrder]);

    useEffect(() => {
        void loadMessages();
    }, [buildQueryString, loadMessages]);

    const fallbackSortedEvents = useMemo(() => {
        if (!sortBy || !sortOrder) {
            return messageEvents;
        }

        const sorted = [...messageEvents].sort((a, b) => {
            const sortValue = (row: MessageMonitorRow, key: MessageSortBy) => {
                if (key === 'timestamp') return row.transport_timestamp;
                if (key === 'eventType') return row.channel;
                if (key === 'status') return row.response_status;
                if (key === 'durationMs') return row.days_until_expiration;
                if (key === 'environment') return row.scheme;
                return row.endpoint_id;
            };

            const left = sortValue(a, sortBy);
            const right = sortValue(b, sortBy);

            if (left == null && right == null) return 0;
            if (left == null) return 1;
            if (right == null) return -1;

            if (sortBy === 'timestamp') {
                const leftTime = new Date(String(left)).getTime();
                const rightTime = new Date(String(right)).getTime();
                return leftTime - rightTime;
            }

            if (typeof left === 'number' && typeof right === 'number') {
                return left - right;
            }

            return String(left).localeCompare(String(right));
        });

        return sortOrder === 'asc' ? sorted : sorted.reverse();
    }, [messageEvents, sortBy, sortOrder]);

    const organizationOptions = useMemo(() => {
        const values = new Set<string>();
        fallbackSortedEvents.forEach(event => event.endpoint_id && values.add(event.endpoint_id));
        return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [fallbackSortedEvents]);

    const transactionTypeOptions = useMemo(() => {
        const values = new Set<string>();
        fallbackSortedEvents.forEach(event => event.channel && values.add(event.channel));
        return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [fallbackSortedEvents]);

    const metrics = useMemo(() => {
        const total = fallbackSortedEvents.length;
        const successes = fallbackSortedEvents.filter(e => e.response_status === 'Success').length;
        const errors = fallbackSortedEvents.filter(e => e.response_status === 'Error').length;
        const durations = fallbackSortedEvents
            .map(event => event.days_until_expiration)
            .filter((duration): duration is number => typeof duration === 'number');

        return {
            total,
            errors,
            successRate: total ? Math.round((successes / total) * 100) : 0,
            averageDuration: Math.round(
                durations.reduce((sum, duration) => sum + duration, 0) /
                    Math.max(1, durations.length)
            ),
        };
    }, [fallbackSortedEvents]);

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    const handlePageChange = (page: number) => {
        const normalized = Math.max(1, page);
        setOffset((normalized - 1) * limit);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-600 hover:text-gray-900"
                    />
                    <div>
                        <h1 className="text-2xl font-semibold">Message Monitor</h1>
                        <p className="text-gray-600">Unified integration message monitoring.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => void loadMessages()}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            <TableToolbar
                globalSearch={filters.search}
                onGlobalSearchChange={value => setFilter('search', value)}
                onReset={resetAll}
                limit={limit}
                onLimitChange={setLimit}
                isLoading={loading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Events" value={metrics.total} />
                <SummaryCard label="Errors" value={metrics.errors} />
                <SummaryCard label="Success Rate" value={`${metrics.successRate}%`} />
                <SummaryCard label="Avg Duration" value={metrics.averageDuration} />
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    <ColumnFilter
                        type="enum"
                        value={filters.source}
                        onChange={value => setFilter('source', String(value) as MessageMonitorFilters['source'])}
                        options={[
                            { label: 'All Sources', value: 'all' },
                            { label: 'Transport', value: 'transport' },
                            { label: 'Telemetry', value: 'telemetry' },
                        ]}
                    />
                    <ColumnFilter
                        type="enum"
                        value={filters.status}
                        onChange={value => setFilter('status', String(value) as MessageMonitorFilters['status'])}
                        options={[
                            { label: 'All Status', value: 'all' },
                            { label: 'Success', value: 'Success' },
                            { label: 'Warning', value: 'Warning' },
                            { label: 'Error', value: 'Error' },
                        ]}
                    />
                    <ColumnFilter
                        type="enum"
                        value={filters.environment}
                        onChange={value =>
                            setFilter('environment', String(value) as MessageMonitorFilters['environment'])
                        }
                        options={[
                            { label: 'All Environments', value: 'all' },
                            { label: 'Prod', value: 'PROD' },
                            { label: 'Test', value: 'TEST' },
                        ]}
                    />
                    <ColumnFilter
                        type="text"
                        value={filters.organization}
                        onChange={value => setFilter('organization', String(value))}
                        placeholder="Channel ID"
                        debounceMs={300}
                    />
                    <ColumnFilter
                        type="text"
                        value={filters.transactionType}
                        onChange={value => setFilter('transactionType', String(value))}
                        placeholder="Event type"
                        debounceMs={300}
                    />
                    <ColumnFilter
                        type="date"
                        value={filters.transportTimestamp.start ?? ''}
                        onChange={value =>
                            setFilter('transportTimestamp', {
                                ...filters.transportTimestamp,
                                start: String(value),
                            })
                        }
                    />
                    <ColumnFilter
                        type="date"
                        value={filters.transportTimestamp.end ?? ''}
                        onChange={value =>
                            setFilter('transportTimestamp', {
                                ...filters.transportTimestamp,
                                end: String(value),
                            })
                        }
                    />
                    <ColumnFilter
                        type="range"
                        value={filters.durationMs}
                        onChange={value =>
                            setFilter('durationMs', value as RangeFilterValue<number>)
                        }
                    />
                </div>
            </div>

            {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            {selectedTransactionId && (
                <>
                    {certificateLoading && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="rounded bg-white px-4 py-3 text-sm text-gray-700 shadow">
                                Loading certificate details...
                            </div>
                        </div>
                    )}
                    {!certificateLoading && certificateError && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="w-full max-w-md rounded bg-white p-4 shadow">
                                <p className="text-sm text-red-600">{certificateError}</p>
                                <div className="mt-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTransactionId(null)}
                                        className="rounded bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {!certificateLoading && !certificateError && selectedCertificate && (
                        <CertInspectorModal
                            cert={selectedCertificate}
                            onClose={() => setSelectedTransactionId(null)}
                        />
                    )}
                </>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100 text-left text-sm text-gray-700">
                        <tr>
                            <TableHeaderCell columnKey="timestamp" label="Timestamp" activeSortBy={sortBy} activeSortOrder={sortOrder} onSort={setSort} disabled={loading} />
                            <TableHeaderCell columnKey="eventType" label="Event Type" activeSortBy={sortBy} activeSortOrder={sortOrder} onSort={setSort} disabled={loading} />
                            <TableHeaderCell columnKey="status" label="Status" activeSortBy={sortBy} activeSortOrder={sortOrder} onSort={setSort} disabled={loading} />
                            <th className="p-3">Request ID</th>
                            <TableHeaderCell columnKey="channelId" label="Channel ID" activeSortBy={sortBy} activeSortOrder={sortOrder} onSort={setSort} disabled={loading} />
                            <th className="p-3">Interaction ID</th>
                            <TableHeaderCell columnKey="durationMs" label="Duration (ms)" activeSortBy={sortBy} activeSortOrder={sortOrder} onSort={setSort} disabled={loading} />
                            <TableHeaderCell columnKey="environment" label="Environment" activeSortBy={sortBy} activeSortOrder={sortOrder} onSort={setSort} disabled={loading} />
                            <th className="p-3">Certificate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={9} className="p-4 text-center text-gray-500">
                                    Loading messages...
                                </td>
                            </tr>
                        )}
                        {!loading &&
                            fallbackSortedEvents.map(event => {
                                const status = formatStatus(event.response_status);
                                return (
                                    <tr key={`${event.transaction_id}-${event.transport_timestamp}-${event.cert_id ?? ''}`} className="border-t text-sm">
                                        <td className="p-3 whitespace-nowrap">{formatTimestamp(event.transport_timestamp)}</td>
                                        <td className="p-3">{event.channel}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center rounded px-2 py-1 text-xs ${status.className}`}>
                                                {status.icon}
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono break-all">
                                            {event.transaction_id ? <TransactionLink id={event.transaction_id} /> : '-'}
                                        </td>
                                        <td className="p-3 font-mono break-all">{event.endpoint_id ?? '-'}</td>
                                        <td className="p-3 font-mono break-all">{event.cert_id ?? '-'}</td>
                                        <td className="p-3">{event.days_until_expiration ?? '-'}</td>
                                        <td className="p-3">{formatEnvironment(event.scheme)}</td>
                                        <td className="p-3">
                                            {event.certificate_status ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedTransactionId(event.transaction_id ?? null)}
                                                    className={`inline-flex items-center rounded px-2 py-1 text-xs ${formatCertificateStatus(event.certificate_status)}`}
                                                >
                                                    {event.certificate_status}
                                                </button>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        {!loading && fallbackSortedEvents.length === 0 && (
                            <tr>
                                <td colSpan={9} className="p-4 text-center text-gray-500">
                                    No message events available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>

            {organizationOptions.length > 0 || transactionTypeOptions.length > 0 ? (
                <div className="text-xs text-gray-500">
                    Channels: {organizationOptions.length} • Event Types: {transactionTypeOptions.length}
                </div>
            ) : null}
        </div>
    );
};

const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

export default TelemetryPage;
