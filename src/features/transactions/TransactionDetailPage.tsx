import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useServerData } from '../../lib/ServerDataContext';
import { TransactionLink } from '../../components/TransactionLink';
import { Finding } from '../../types/findings';
import Pagination from '../../components/Pagination';
import BackButton from '../../components/navigation/BackButton';
import {
    buildCertificateFindingCopy,
    getCertificateStatusBadge,
    getCertificateStatusDescription,
} from '../../lib/certificates';
import type { CertificateStatus } from '../../types/certificates';
import { useUserPreferences } from '../../lib/useUserPreferences';
import { formatTimestamp } from '../../lib/dateTime';
import { fetchMessageMonitor } from '../../lib/telemetryClient';
import type { MessageMonitorRow } from '../../types/messages';

const tablePageSize = 10;
const certificateScanBatchSize = 100;
const maxCertificateFetchPages = 50;

const mapStatusToCertificateStatus = (
    status: MessageMonitorRow['certificate_status']
): CertificateStatus | undefined => {
    if (status === 'Valid') return 'Valid';
    if (status === 'Expired') return 'Expired';
    if (status === 'Expiring Soon') return 'Expiring Soon';
    return undefined;
};

const hasCertificateData = (row: MessageMonitorRow): boolean =>
    row.cert_id !== null ||
    row.fingerprint_sha1 !== null ||
    row.certificate_status !== null ||
    row.subject_cn !== null ||
    row.issuer_cn !== null ||
    row.days_until_expiration !== null ||
    row.is_self_signed !== null ||
    row.detected_via !== null;

const getRowTime = (row: MessageMonitorRow): number => {
    const time = new Date(row.transport_timestamp).getTime();
    return Number.isNaN(time) ? 0 : time;
};

const getDaysToExpirationClassName = (days: number | null): string => {
    if (days === null) return 'text-gray-700';
    if (days < 0) return 'text-red-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-gray-700';
};

const TransactionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { pdExecutions, findings } = useServerData();
    const { preferences } = useUserPreferences();

    const [page, setPage] = useState(1);
    const [telemetryRows, setTelemetryRows] = useState<MessageMonitorRow[]>([]);
    const [telemetryTotal, setTelemetryTotal] = useState(0);
    const [telemetryLoading, setTelemetryLoading] = useState(false);
    const [telemetryError, setTelemetryError] = useState<string | null>(null);
    const [latestCertificateEvent, setLatestCertificateEvent] =
        useState<MessageMonitorRow | null>(null);

    // PD execution is optional now
    const transaction = useMemo(() => {
        if (!Array.isArray(pdExecutions)) return undefined;
        return pdExecutions.find(exec => exec.requestId === id);
    }, [id, pdExecutions]);

    const relatedFindings = useMemo(() => {
        if (!Array.isArray(findings)) return [];
        return (findings as Finding[]).filter(
            finding => finding.executionId === id
        );
    }, [findings, id]);

    const fetchTelemetryPage = useCallback(async () => {
        if (!id) return;

        setTelemetryLoading(true);
        setTelemetryError(null);

        try {
            const response = await fetchMessageMonitor({
                search: id,
                limit: tablePageSize,
                offset: (page - 1) * tablePageSize,
            });

            const exactRows = response.data.filter(
                row => row.transaction_id === id
            );

            setTelemetryRows(exactRows);
            setTelemetryTotal(
                response.pagination.total > 0
                    ? response.pagination.total
                    : exactRows.length
            );
        } catch (error) {
            console.error('Telemetry fetch failed', error);
            setTelemetryError(
                error instanceof Error
                    ? error.message
                    : 'Failed to load telemetry events'
            );
            setTelemetryRows([]);
            setTelemetryTotal(0);
        } finally {
            setTelemetryLoading(false);
        }
    }, [id, page]);

    const fetchCertificateTelemetry = useCallback(async () => {
        if (!id) return;

        try {
            let offset = 0;
            let total = 0;
            let pageCount = 0;
            const allRows: MessageMonitorRow[] = [];

            do {
                const response = await fetchMessageMonitor({
                    search: id,
                    limit: certificateScanBatchSize,
                    offset,
                });

                const exactRows = response.data.filter(
                    row => row.transaction_id === id
                );

                allRows.push(...exactRows);

                total = response.pagination.total;
                const step =
                    response.pagination.limit ||
                    response.data.length ||
                    certificateScanBatchSize;

                offset += step;
                pageCount++;
            } while (offset < total && pageCount < maxCertificateFetchPages);

            const latestCert =
                allRows
                    .filter(hasCertificateData)
                    .sort((a, b) => getRowTime(b) - getRowTime(a))[0] ?? null;

            setLatestCertificateEvent(latestCert);
        } catch (error) {
            console.error('Certificate telemetry fetch failed', error);
            setLatestCertificateEvent(null);
        }
    }, [id]);

    useEffect(() => {
        void fetchTelemetryPage();
    }, [fetchTelemetryPage]);

    useEffect(() => {
        void fetchCertificateTelemetry();
    }, [fetchCertificateTelemetry]);

    const totalPages = Math.max(1, Math.ceil(telemetryTotal / tablePageSize));

    const certificateStatus = mapStatusToCertificateStatus(
        latestCertificateEvent?.certificate_status ?? null
    );

    const certificateBadge = getCertificateStatusBadge(certificateStatus);
    const certificateDescription =
        getCertificateStatusDescription(certificateStatus);

    if (!id) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold text-red-600">
                    Invalid transaction route
                </h1>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
                <BackButton defaultRoute="/pd-executions" />
                <div>
                    <h1 className="text-2xl font-semibold">
                        Transaction Detail
                    </h1>
                    <p className="text-gray-600">
                        Trace PD execution, findings, and telemetry
                    </p>
                </div>
            </div>

            {/* Transaction Overview */}
            <div className="rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                    Transaction Overview
                </h2>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <dt className="text-gray-500">Transaction ID</dt>
                        <dd className="font-mono text-xs">
                            <TransactionLink id={id} />
                        </dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Outcome</dt>
                        <dd>{transaction?.outcome ?? 'Not reported'}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Environment</dt>
                        <dd>{transaction?.sourceEnvironment ?? 'Not reported'}</dd>
                    </div>
                </dl>
            </div>

            {/* Certificate Section */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        Transport Security (Certificate)
                    </h3>
                    <span
                        className={`inline-flex items-center rounded px-2 py-1 text-xs ${certificateBadge.className}`}
                    >
                        {certificateBadge.icon} {certificateBadge.label}
                    </span>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm text-sm">
                    {latestCertificateEvent ? (
                        <p className="text-gray-600">
                            {certificateDescription}
                        </p>
                    ) : (
                        <p className="text-gray-500">
                            No certificate data reported for this transaction.
                        </p>
                    )}
                </div>
            </section>

            {/* Telemetry Section */}
            <section className="space-y-3">
                <h3 className="text-lg font-semibold">Telemetry Events</h3>

                {telemetryError && (
                    <div className="text-red-600 text-sm">
                        {telemetryError}
                    </div>
                )}

                {telemetryLoading ? (
                    <div className="text-gray-500">
                        Loading telemetry events...
                    </div>
                ) : !telemetryRows.length ? (
                    <div className="text-gray-500">
                        No telemetry events found for this transaction.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-100 text-sm">
                            <tr>
                                <th className="p-3">Timestamp</th>
                                <th className="p-3">Response</th>
                                <th className="p-3">Channel</th>
                                <th className="p-3">Host</th>
                            </tr>
                            </thead>
                            <tbody>
                            {telemetryRows.map(event => (
                                <tr
                                    key={`${event.transaction_id}-${event.transport_timestamp}`}
                                    className="border-t text-sm"
                                >
                                    <td className="p-3">
                                        {formatTimestamp(
                                            event.transport_timestamp,
                                            preferences.timezone
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {event.response_status}
                                    </td>
                                    <td className="p-3">
                                        {event.channel}
                                    </td>
                                    <td className="p-3">
                                        {event.host ?? '—'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </section>
        </div>
    );
};

export default TransactionDetailPage;