import React, { useEffect, useMemo, useState } from 'react';
import CertInspectorModal from '../integration-issues/modals/CertInspectorModal';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

import type { MessageMonitorRow } from '../../types/messages';
import type { CertificateStatus, CertificateDetails } from '../../types/certificates';
import { fetchMessageMonitor, MessageFilterParams } from '../../lib/telemetryClient';
import { TransactionLink } from '../../components/TransactionLink';
import Pagination from '../../components/Pagination';
import { mapRowToCertificateDetails } from '../messageMonitor/mappers/mapCertificate';

const formatCertificateStatus = (status: CertificateStatus | null) => {
    if (status === 'Valid') {
        return 'bg-green-100 text-green-800';
    }
    if (status === 'Expired') {
        return 'bg-red-100 text-red-800';
    }
    if (status === 'Expiring Soon') {
        return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-700';
};

const formatTimestamp = (timestamp?: string | null) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'medium',
        });
};

const getDaysToExpirationClassName = (days: number | null) => {
    if (days === null) return 'text-gray-700';
    if (days < 0) return 'text-red-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-gray-700';
};

const TelemetryPage: React.FC = () => {
    const navigate = useNavigate();
    const [messageEvents, setMessageEvents] = useState<MessageMonitorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [totalRows, setTotalRows] = useState(0);

    const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | 'custom'>('24h');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [organizationFilter, setOrganizationFilter] = useState<'all' | string>('all');
    const [sourceFilter, setSourceFilter] = useState<'all' | 'transport' | 'telemetry'>('all');

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    // UI modal boundary: keep modal state in CertificateDetails, never MessageMonitorRow.
    const [selectedCert, setSelectedCert] = useState<CertificateDetails | null>(null);
    const pageSize = 25;

    const filterParams = useMemo<MessageFilterParams>(() => {
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
            search: search.trim() || undefined,
            source: sourceFilter === 'all' ? undefined : sourceFilter,
            limit: pageSize,
            offset: (page - 1) * pageSize,
        };
    }, [customEnd, customStart, organizationFilter, page, search, sourceFilter, timeRange]);

    const loadMessages = React.useCallback(async (filters: MessageFilterParams) => {
        setLoading(true);
        setError(undefined);
        try {
            const response = await fetchMessageMonitor(filters);
            setMessageEvents(response.data);
            setTotalRows(response.pagination.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadMessages(filterParams);
    }, [filterParams, loadMessages]);

    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const organizationOptions = useMemo(() => {
        const values = new Set<string>();
        messageEvents.forEach(event => {
            if (event.channel) {
                values.add(event.channel);
            }
        });
        return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [messageEvents]);

    const metrics = useMemo(() => {
        const expired = messageEvents.filter(e => e.certificate_status === 'Expired').length;
        const expiringSoon = messageEvents.filter(
            e => e.certificate_status === 'Expiring Soon'
        ).length;
        const valid = messageEvents.filter(e => e.certificate_status === 'Valid').length;

        return {
            total: totalRows,
            expired,
            expiringSoon,
            valid,
        };
    }, [messageEvents, totalRows]);


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-gray-700">
                Loading messages...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="bg-white shadow rounded p-6 space-y-4 text-center">
                    <div className="text-red-600 font-semibold">{error}</div>
                    <p className="text-gray-600">Unable to load message events.</p>
                    <button
                        onClick={() => void loadMessages(filterParams)}
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
                        <h1 className="text-2xl font-semibold">Message Monitor</h1>
                        <p className="text-gray-600">Unified integration message monitoring across transport and telemetry layers</p>
                    </div>
                </div>
                <button
                    onClick={() => void loadMessages(filterParams)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Events" value={metrics.total} />
                <SummaryCard label="Expired certs" value={metrics.expired} />
                <SummaryCard label="Expiring soon" value={metrics.expiringSoon} />
                <SummaryCard label="Valid certs" value={metrics.valid} />
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-3 items-center justify-between text-sm">
                <div className="flex flex-wrap gap-2 items-center">
                    <label htmlFor="message-time-range" className="text-gray-700">Time Range</label>
                    <select
                        id="message-time-range"
                        value={timeRange}
                        onChange={event => setTimeRange(event.target.value as typeof timeRange)}
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
                        <label htmlFor="message-start" className="text-gray-700">Start</label>
                        <input
                            id="message-start"
                            type="datetime-local"
                            value={customStart}
                            onChange={event => setCustomStart(event.target.value)}
                            className="border rounded px-2 py-1"
                        />
                        <label htmlFor="message-end" className="text-gray-700">End</label>
                        <input
                            id="message-end"
                            type="datetime-local"
                            value={customEnd}
                            onChange={event => setCustomEnd(event.target.value)}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                )}

                <div className="flex flex-wrap gap-2 items-center">
                    <label htmlFor="message-source" className="text-gray-700">Source</label>
                    <select
                        id="message-source"
                        value={sourceFilter}
                        onChange={event => setSourceFilter(event.target.value as typeof sourceFilter)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="all">All</option>
                        <option value="transport">Transport</option>
                        <option value="telemetry">Telemetry</option>
                    </select>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <label htmlFor="message-org" className="text-gray-700">Channel</label>
                    <select
                        id="message-org"
                        value={organizationFilter}
                        onChange={event => setOrganizationFilter(event.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="all">All</option>
                        {organizationOptions.length ? (
                            organizationOptions.map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))
                        ) : (
                            <option value="all" disabled>No channels</option>
                        )}
                    </select>
                </div>

                <div className="flex gap-2 items-center text-sm">
                    <label htmlFor="message-search" className="text-gray-700">Search</label>
                    <input
                        id="message-search"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        className="border rounded px-2 py-1"
                        placeholder="Transaction ID"
                    />
                </div>
            </div>

            {selectedCert && (
                <CertInspectorModal
                    cert={selectedCert}
                    onClose={() => setSelectedCert(null)}
                />
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100 text-left text-sm text-gray-700">
                        <tr>
                            <th className="p-3">Transaction ID</th>
                            <th className="p-3">Transport Timestamp</th>
                            <th className="p-3">Channel</th>
                            <th className="p-3">Response Status</th>
                            <th className="p-3">Host</th>
                            <th className="p-3">Port</th>
                            <th className="p-3">Certificate Status</th>
                            <th className="p-3">Days Until Expiration</th>
                            <th className="p-3">Subject CN</th>
                            <th className="p-3">Issuer CN</th>
                            <th className="p-3">Is Self Signed</th>
                            <th className="p-3">Cert Age (Years)</th>
                            <th className="p-3">Detected Via</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messageEvents.map(event => (
                            <tr
                                key={`${event.transaction_id}-${event.transport_timestamp}`}
                                className="border-t text-sm"
                                onClick={() => setSelectedCert(mapRowToCertificateDetails(event))}
                            >
                                <td className="p-3 font-mono break-all">
                                    <TransactionLink id={event.transaction_id} />
                                </td>
                                <td className="p-3 whitespace-nowrap">{formatTimestamp(event.transport_timestamp)}</td>
                                <td className="p-3">{event.channel}</td>
                                <td className="p-3">{event.response_status}</td>
                                <td className="p-3 break-all">{event.host ?? '—'}</td>
                                <td className="p-3">{event.port ?? '—'}</td>
                                <td className="p-3">
                                    <span className={`inline-flex items-center rounded px-2 py-1 text-xs ${formatCertificateStatus(event.certificate_status)}`}>
                                        {event.certificate_status ?? 'Unknown'}
                                    </span>
                                </td>
                                <td className={`p-3 font-medium ${getDaysToExpirationClassName(event.days_until_expiration)}`}>
                                    {event.days_until_expiration ?? '—'}
                                </td>
                                <td className="p-3 break-all">{event.subject_cn ?? '—'}</td>
                                <td className="p-3 break-all">{event.issuer_cn ?? '—'}</td>
                                <td className="p-3">
                                    {event.is_self_signed === null ? '—' : event.is_self_signed ? 'Yes' : 'No'}
                                </td>
                                <td className="p-3">{event.cert_age_years ?? '—'}</td>
                                <td className="p-3">{event.detected_via ?? '—'}</td>
                            </tr>
                        ))}
                        {!messageEvents.length && (
                            <tr>
                                <td colSpan={13} className="p-4 text-center text-gray-500">
                                    No message events available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
