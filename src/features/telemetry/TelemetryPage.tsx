import React, {useEffect, useMemo, useRef, useState} from 'react';
import {FaCheckCircle, FaClock, FaTimesCircle} from 'react-icons/fa';

import Pagination from '../../components/Pagination';
import {TransactionLink} from '../../components/TransactionLink';
import {ColumnFilter} from '../../components/table/ColumnFilter';
import {TableHeaderCell} from '../../components/table/TableHeaderCell';
import {TableToolbar} from '../../components/table/TableToolbar';
import {useTableControls} from '../../hooks/useTableControls';
import {
    fetchMessageEvents,
    type MessageFilterParams,
    type MessageSortBy,
    buildMessageEventsQuery,
} from '../../lib/telemetryClient';
import type {MessageMonitorRow} from '../../types/messages';
import BackButton from "../../components/navigation/BackButton";

/* ========================= UTILS ========================= */

const safeString = (value: unknown): string => String(value ?? '');
const safeCompare = (a: unknown, b: unknown): number => safeString(a).localeCompare(safeString(b));

const mapStatus = (status?: number | string | null): 'Success' | 'Warning' | 'Error' => {
    if (typeof status === 'number') {
        if (status >= 500) return 'Error';
        if (status >= 400) return 'Warning';
        return 'Success';
    }

    const normalized = String(status ?? '').trim().toLowerCase();

    if (!normalized) return 'Warning';

    if (normalized.includes('error') || normalized === '500' || normalized === 'failed') {
        return 'Error';
    }

    if (
        normalized.includes('warn') ||
        normalized === '400' ||
        normalized === '401' ||
        normalized === '403' ||
        normalized === '404'
    ) {
        return 'Warning';
    }

    if (normalized.includes('success') || normalized === '200' || normalized === 'ok') {
        return 'Success';
    }

    const numeric = Number(normalized);
    if (!Number.isNaN(numeric)) {
        if (numeric >= 500) return 'Error';
        if (numeric >= 400) return 'Warning';
        return 'Success';
    }

    return 'Warning';
};

const formatStatus = (status?: string | number | null) => {
    const mapped = mapStatus(status);

    switch (mapped) {
        case 'Success':
            return {
                label: 'Success',
                className: 'bg-green-100 text-green-800',
                icon: <FaCheckCircle className="mr-1"/>,
            };
        case 'Error':
            return {
                label: 'Error',
                className: 'bg-red-100 text-red-800',
                icon: <FaTimesCircle className="mr-1"/>,
            };
        default:
            return {
                label: 'Warning',
                className: 'bg-yellow-100 text-yellow-800',
                icon: <FaClock className="mr-1"/>,
            };
    }
};

const formatTimestamp = (timestamp?: string | null): string => {
    if (!timestamp) return '—';

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium',
    });
};

const formatCertificateStatus = (status?: string | null): string => {
    if (!status) return '—';
    return status.replace(/_/g, ' ');
};

const formatEndpoint = (row: MessageMonitorRow): string => {
    const parts = [
        row.scheme ? row.scheme.toLowerCase() : null,
        row.host,
        row.port != null ? String(row.port) : null,
    ].filter(Boolean);

    if (parts.length === 0) {
        return row.endpoint_id ?? '—';
    }

    const [scheme, host, port] = parts;

    if (scheme && host && port) return `${scheme}://${host}:${port}`;
    if (scheme && host) return `${scheme}://${host}`;
    if (host && port) return `${host}:${port}`;
    if (host) return host;

    return row.endpoint_id ?? '—';
};

const formatCertExpiry = (days?: number | null): string => {
    if (days == null) return '—';
    if (days < 0) return `Expired ${Math.abs(days)}d ago`;
    if (days === 0) return 'Expires today';
    return `${days}d`;
};

/* ========================= TYPES ========================= */

interface MessageMonitorFilters {
    search: string;
    source: 'all' | 'transport' | 'telemetry';
    organization: string;
    transactionType: string;
    status: 'all' | 'Success' | 'Error' | 'Warning';
    environment: 'all' | 'http' | 'https' | 'tcp' | 'tls' | 'unknown';
}

const DEFAULT_FILTERS: MessageMonitorFilters = {
    search: '',
    source: 'all',
    organization: '',
    transactionType: '',
    status: 'all',
    environment: 'all',
};

const SORTABLE_COLUMNS: readonly MessageSortBy[] = [
    'timestamp',
    'eventType',
    'status',
    'environment',
    'channelId',
] as const;

/* ========================= COMPONENT ========================= */

const TelemetryPage: React.FC = () => {
    const [messageEvents, setMessageEvents] = useState<MessageMonitorRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const apiFilters = useMemo<MessageFilterParams>(() => {
        return {
            search: filters.search.trim() || undefined,
            source: filters.source === 'all' ? undefined : filters.source,
            organization: filters.organization || undefined,
            transactionType: filters.transactionType || undefined,
            status: filters.status === 'all' ? undefined : filters.status,
            environment:
                filters.environment === 'all'
                    ? undefined
                    : filters.environment.toUpperCase(),
        };
    }, [filters]);

    const loadMessages = React.useCallback(async () => {
        const query = buildMessageEventsQuery({
            filters: apiFilters,
            sortBy: sortBy ?? undefined,
            sortOrder: sortOrder ?? undefined,
            limit,
            offset,
        });

        if (query === lastQueryRef.current) return;

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

            /**
             * {
             *   data: MessageMonitorRow[],
             *   pagination: { total, limit, offset }
             * }
             */
            setMessageEvents(response.data ?? []);
            setTotalCount(response.pagination?.total ?? 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load messages');
            setMessageEvents([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [apiFilters, sortBy, sortOrder, limit, offset]);

    useEffect(() => {
        void loadMessages();
    }, [buildQueryString, loadMessages]);

    const fallbackSortedEvents = useMemo(() => {
        if (!sortBy || !sortOrder) return messageEvents;

        const sorted = [...messageEvents].sort((a, b) => {
            const getValue = (row: MessageMonitorRow): unknown => {
                switch (sortBy) {
                    case 'timestamp':
                        return row.transport_timestamp;
                    case 'eventType':
                        return row.channel;
                    case 'status':
                        return mapStatus(row.response_status);
                    case 'environment':
                        return row.scheme;
                    case 'channelId':
                        return row.endpoint_id;
                    default:
                        return row.transport_timestamp;
                }
            };

            const left = getValue(a);
            const right = getValue(b);

            if (sortBy === 'timestamp') {
                return new Date(String(left)).getTime() - new Date(String(right)).getTime();
            }

            return safeCompare(left, right);
        });

        return sortOrder === 'asc' ? sorted : sorted.reverse();
    }, [messageEvents, sortBy, sortOrder]);

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return (
        <div className="p-6 space-y-6">

            <div className="space-y-2">
                <BackButton
                    defaultRoute="/dashboard"
                    label="Back"
                    className="text-sm text-blue-600 hover:underline"
                    showIcon={false}
                />
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-semibold">Message Monitor</h1>
                    <p className="text-gray-600">Integration message telemetry</p>
                </div>

                <button
                    onClick={() => {
                        lastQueryRef.current = '';
                        void loadMessages();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            <TableToolbar
                globalSearch={filters.search}
                onGlobalSearchChange={(value) => setFilter('search', value)}
                onReset={() => {
                    lastQueryRef.current = '';
                    resetAll();
                }}
                limit={limit}
                onLimitChange={(value) => {
                    lastQueryRef.current = '';
                    setLimit(value);
                }}
                isLoading={loading}
            />

            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ColumnFilter
                        type="enum"
                        value={filters.status}
                        onChange={(value) => {
                            lastQueryRef.current = '';
                            setFilter('status', value as MessageMonitorFilters['status']);
                        }}
                        options={[
                            {label: 'All', value: 'all'},
                            {label: 'Success', value: 'Success'},
                            {label: 'Warning', value: 'Warning'},
                            {label: 'Error', value: 'Error'},
                        ]}
                    />

                    <ColumnFilter
                        type="enum"
                        value={filters.environment}
                        onChange={(value) => {
                            lastQueryRef.current = '';
                            setFilter('environment', value as MessageMonitorFilters['environment']);
                        }}
                        options={[
                            {label: 'All', value: 'all'},
                            {label: 'HTTP', value: 'http'},
                            {label: 'HTTPS', value: 'https'},
                            {label: 'TCP', value: 'tcp'},
                            {label: 'TLS', value: 'tls'},
                            {label: 'Unknown', value: 'unknown'},
                        ]}
                    />
                </div>
            </div>

            {error && (
                <div className="rounded border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">Event ID</th>

                        <TableHeaderCell
                            columnKey="timestamp"
                            label="Timestamp"
                            activeSortBy={sortBy}
                            activeSortOrder={sortOrder}
                            onSort={setSort}
                        />

                        <TableHeaderCell
                            columnKey="eventType"
                            label="Channel"
                            activeSortBy={sortBy}
                            activeSortOrder={sortOrder}
                            onSort={setSort}
                        />

                        <TableHeaderCell
                            columnKey="status"
                            label="Status"
                            activeSortBy={sortBy}
                            activeSortOrder={sortOrder}
                            onSort={setSort}
                        />

                        <th className="p-3 text-left">Endpoint</th>
                        <th className="p-3 text-left">Cert Subject</th>
                        <th className="p-3 text-left">Cert Issuer</th>
                        <th className="p-3 text-left">Cert Status</th>
                        <th className="p-3 text-left">Expiry</th>
                        <th className="p-3 text-left">Cert ID</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={10} className="p-6 text-center text-gray-500">
                                Loading message events...
                            </td>
                        </tr>
                    ) : fallbackSortedEvents.length === 0 ? (
                        <tr>
                            <td colSpan={10} className="p-6 text-center text-gray-500">
                                No message events found.
                            </td>
                        </tr>
                    ) : (
                        fallbackSortedEvents.map((e) => {
                            const status = formatStatus(e.response_status);

                            return (
                                <tr key={e.transaction_id} className="border-t hover:bg-gray-50">
                                    <td className="p-3 font-mono text-blue-600">
                                        <TransactionLink id={e.transaction_id}/>
                                    </td>

                                    <td className="p-3">
                                        {formatTimestamp(e.transport_timestamp)}
                                    </td>

                                    <td className="p-3">{e.channel || '—'}</td>

                                    <td className="p-3">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${status.className}`}
                                            >
                                                {status.icon}
                                                {status.label}
                                            </span>
                                    </td>

                                    <td className="p-3 text-sm">
                                        <div>{formatEndpoint(e)}</div>
                                        {e.endpoint_id && (
                                            <div className="text-xs text-gray-500 font-mono">
                                                {e.endpoint_id}
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-3 text-sm">{e.subject_cn ?? '—'}</td>

                                    <td className="p-3 text-sm">{e.issuer_cn ?? '—'}</td>

                                    <td className="p-3 text-sm">
                                        {formatCertificateStatus(e.certificate_status)}
                                    </td>

                                    <td className="p-3 text-sm">
                                        {formatCertExpiry(e.days_until_expiration)}
                                    </td>

                                    <td className="p-3 font-mono text-xs">
                                        {e.cert_id ?? '—'}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>

                <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        lastQueryRef.current = '';
                        setOffset((page - 1) * limit);
                    }}
                />
            </div>
        </div>
    );
};

export default TelemetryPage;