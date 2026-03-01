import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useServerData } from '../../lib/ServerDataContext';
import { TransactionLink } from '../../components/TransactionLink';
import Pagination from '../../components/Pagination';
import BackButton from '../../components/navigation/BackButton';
import {
    getCertificateStatusBadge,
    getCertificateStatusDescription,
} from '../../lib/certificates';
import type { CertificateStatus } from '../../types/certificates';
import { useUserPreferences } from '../../lib/useUserPreferences';
import { formatTimestamp } from '../../lib/dateTime';
import { fetchMessageMonitor } from '../../lib/telemetryClient';
import type { MessageMonitorRow } from '../../types/messages';
import { buildCertificateFindingCopy } from '../../lib/certificates';

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

const hasCertificateData = (row: MessageMonitorRow): boolean => {
    return (
        row.cert_id !== null ||
        row.fingerprint_sha1 !== null ||
        row.certificate_status !== null ||
        row.subject_cn !== null ||
        row.issuer_cn !== null ||
        row.days_until_expiration !== null ||
        row.is_self_signed !== null ||
        row.detected_via !== null
    );
};

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

    const transaction = useMemo(() => {
        if (!Array.isArray(pdExecutions)) return undefined;
        return pdExecutions.find(exec => exec.requestId === id);
    }, [id, pdExecutions]);

    const relatedFindings = useMemo(() => {
        if (!Array.isArray(findings)) return [];
        return findings.filter(finding => finding.executionId === id);
    }, [findings, id]);

    const fetchTelemetryPage = useCallback(async () => {
        if (!id) {
            setTelemetryRows([]);
            setTelemetryTotal(0);
            return;
        }

        setTelemetryLoading(true);
        setTelemetryError(null);

        try {
            const response = await fetchMessageMonitor({
                search: id,
                limit: tablePageSize,
                offset: (page - 1) * tablePageSize,
            });

            const exactRows = response.data.filter(row => row.transaction_id === id);
            setTelemetryRows(exactRows);
            setTelemetryTotal(
                response.pagination.total > 0
                    ? response.pagination.total
                    : exactRows.length
            );
        } catch (error) {
            console.error('Telemetry page fetch failed', error);
            setTelemetryError(
                error instanceof Error ? error.message : 'Failed to load telemetry events'
            );
            setTelemetryRows([]);
            setTelemetryTotal(0);
        } finally {
            setTelemetryLoading(false);
        }
    }, [id, page]);

    const fetchCertificateTelemetry = useCallback(async () => {
        if (!id) {
            setLatestCertificateEvent(null);
            return;
        }

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

                const exactRows = response.data.filter(row => row.transaction_id === id);
                allRows.push(...exactRows);

                total = response.pagination.total;
                const step =
                    response.pagination.limit > 0
                        ? response.pagination.limit
                        : response.data.length > 0
                            ? response.data.length
                            : certificateScanBatchSize;

                offset += Math.max(1, step);
                pageCount += 1;
            } while (offset < total && pageCount < maxCertificateFetchPages);

            const latestCert = allRows
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

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(function resetPageOnTransactionChange() {
        setPage(1);
    }, [id]);

    const certificateStatus = mapStatusToCertificateStatus(
        latestCertificateEvent?.certificate_status ?? null
    );

    const certificateBadge = getCertificateStatusBadge(certificateStatus);
    const certificateDescription = getCertificateStatusDescription(certificateStatus);

    const certificateThumbprint =
        latestCertificateEvent?.fingerprint_sha1 ?? latestCertificateEvent?.cert_id;

    const isSelfSigned = latestCertificateEvent?.is_self_signed;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
                <BackButton
                    defaultRoute="/pd-executions"
                    label=""
                    className="text-gray-600 hover:text-gray-900"
                />
                <div>
                    <h1 className="text-2xl font-semibold">
                        Transaction Detail
                    </h1>
                    <p className="text-gray-600">
                        Trace PD execution and telemetry
                    </p>
                </div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                    Transaction Overview
                </h2>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <dt className="text-gray-500">Transaction ID</dt>
                        <dd className="font-mono text-xs">
                            <TransactionLink id={id ?? ''} />
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

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        Transport Security (Certificate)
                    </h3>
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${certificateBadge.className}`}
                    >
                        <span aria-hidden="true">{certificateBadge.icon}</span>
                        {certificateBadge.label}
                    </span>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3 text-sm">
                    <p className="text-gray-600">
                        {latestCertificateEvent
                            ? certificateDescription
                            : 'Certificate data was not reported in message monitor telemetry for this transaction.'}
                    </p>

                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <dt className="text-gray-500">Certificate Status</dt>
                            <dd className="font-medium">
                                {latestCertificateEvent?.certificate_status ?? '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Certificate Thumbprint</dt>
                            <dd className="font-mono text-xs break-all">
                                {certificateThumbprint ?? 'Not reported'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Subject CN</dt>
                            <dd>{latestCertificateEvent?.subject_cn ?? 'Not reported'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Issuer CN</dt>
                            <dd>{latestCertificateEvent?.issuer_cn ?? 'Not reported'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Days Until Expiration</dt>
                            <dd
                                className={getDaysToExpirationClassName(
                                    latestCertificateEvent?.days_until_expiration ?? null
                                )}
                            >
                                {latestCertificateEvent?.days_until_expiration ?? 'Not reported'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Detection Source</dt>
                            <dd>{latestCertificateEvent?.detected_via ?? 'Not reported'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Self-signed</dt>
                            <dd
                                className={
                                    isSelfSigned
                                        ? 'font-semibold text-yellow-700'
                                        : 'text-gray-800'
                                }
                            >
                                {isSelfSigned === null || isSelfSigned === undefined
                                    ? 'Not reported'
                                    : isSelfSigned
                                        ? 'Yes (self-signed certificate)'
                                        : 'No'}
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Related Findings</h3>
                    <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        🔗 Traceable
                    </span>
                </div>

                {!relatedFindings.length ? (
                    <div className="rounded border border-dashed p-6 text-center text-gray-500">
                        No findings detected for this transaction.
                        <br />
                        All telemetry events completed successfully.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {relatedFindings.map(finding => {
                            const certCopy = buildCertificateFindingCopy(
                                finding,
                                transaction
                            );

                            return (
                                <div
                                    key={finding.id}
                                    className={`rounded-lg border border-l-4 bg-white p-4 shadow-sm ${
                                        finding.severity === 'critical'
                                            ? 'border-red-500'
                                            : 'border-yellow-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-gray-800">
                                            {certCopy?.summary ??
                                                finding.summary ??
                                                '—'}
                                        </div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                                            Related Transaction
                                        </span>
                                    </div>
                                    {certCopy ? (
                                        <div className="mt-3 space-y-2 text-sm text-gray-700">
                                            <p>
                                                <span className="font-semibold">
                                                    Why this matters:
                                                </span>{' '}
                                                {certCopy.why}
                                            </p>
                                            <p>
                                                <span className="font-semibold">
                                                    Recommended action:
                                                </span>{' '}
                                                {certCopy.action}
                                            </p>
                                            {certCopy.thumbprint && (
                                                <p className="text-xs text-gray-500">
                                                    Affected certificate:{' '}
                                                    <span className="font-mono">
                                                        {certCopy.thumbprint}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-sm text-gray-600">
                                            {finding.recommendedAction ?? '—'}
                                        </div>
                                    )}
                                    {finding.executionId && (
                                        <div className="mt-2">
                                            <TransactionLink id={finding.executionId} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Telemetry Events</h3>
                    <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        🔗 Traceable
                    </span>
                </div>

                <div className="mb-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                    These telemetry events are associated with transaction{' '}
                    <span className="font-mono font-medium">{id ?? '—'}</span>
                </div>

                {telemetryError && (
                    <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {telemetryError}
                    </div>
                )}

                {telemetryLoading ? (
                    <div className="rounded border border-dashed p-6 text-center text-gray-500">
                        Loading telemetry events...
                    </div>
                ) : !telemetryRows.length ? (
                    <div className="rounded border border-dashed p-6 text-center text-gray-500">
                        No telemetry events detected for this transaction.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-100 text-left text-sm text-gray-700">
                                <tr>
                                    <th className="p-3">Transaction ID</th>
                                    <th className="p-3">Timestamp</th>
                                    <th className="p-3">Response Status</th>
                                    <th className="p-3">Channel</th>
                                    <th className="p-3">Host</th>
                                    <th className="p-3">Certificate Status</th>
                                    <th className="p-3">Days until expiration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {telemetryRows.map(event => {
                                    const rowBadge = getCertificateStatusBadge(
                                        mapStatusToCertificateStatus(event.certificate_status)
                                    );

                                    return (
                                        <tr
                                            key={`${event.transaction_id}-${event.transport_timestamp}-${event.cert_id ?? 'no-cert'}`}
                                            className="border-t text-sm"
                                        >
                                            <td className="p-3 font-mono text-xs text-gray-700">
                                                {event.transaction_id}
                                            </td>
                                            <td className="p-3">
                                                {formatTimestamp(
                                                    event.transport_timestamp,
                                                    preferences.timezone
                                                )}
                                            </td>
                                            <td className="p-3">{event.response_status}</td>
                                            <td className="p-3">{event.channel}</td>
                                            <td className="p-3">{event.host ?? '—'}</td>
                                            <td className="p-3">
                                                <span
                                                    className={`inline-flex items-center rounded px-2 py-1 text-xs ${rowBadge.className}`}
                                                >
                                                    <span aria-hidden="true" className="mr-1">
                                                        {rowBadge.icon}
                                                    </span>
                                                    {event.certificate_status ?? '—'}
                                                </span>
                                            </td>
                                            <td
                                                className={`p-3 ${getDaysToExpirationClassName(
                                                    event.days_until_expiration
                                                )}`}
                                            >
                                                {event.days_until_expiration ?? '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
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