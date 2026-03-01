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

const tablePageSize = 10;

const mapStatusToCertificateStatus = (
    status: MessageMonitorRow['certificate_status']
): CertificateStatus | undefined => {
    if (status === 'Valid') return 'Valid';
    if (status === 'Expired') return 'Expired';
    if (status === 'Expiring Soon') return 'Expiring Soon';
    return undefined;
};

const TransactionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { pdExecutions } = useServerData();
    const { preferences } = useUserPreferences();

    const [page, setPage] = useState(1);
    const [telemetryRows, setTelemetryRows] = useState<MessageMonitorRow[]>([]);
    const [telemetryTotal, setTelemetryTotal] = useState(0);
    const [telemetryLoading, setTelemetryLoading] = useState(false);
    const [telemetryError, setTelemetryError] = useState<string | null>(null);

    const transaction = useMemo(() => {
        if (!Array.isArray(pdExecutions)) return undefined;
        return pdExecutions.find(exec => exec.requestId === id);
    }, [id, pdExecutions]);

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
            setTelemetryTotal(exactRows.length);
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

    useEffect(() => {
        void fetchTelemetryPage();
    }, [fetchTelemetryPage]);

    useEffect(() => {
        setPage(1);
    }, [id]);

    const totalPages = Math.max(1, Math.ceil(telemetryTotal / tablePageSize));

    const certificateStatus = mapStatusToCertificateStatus(
        telemetryRows[0]?.certificate_status ?? null
    );

    const certificateBadge = getCertificateStatusBadge(certificateStatus);
    const certificateDescription =
        getCertificateStatusDescription(certificateStatus);

    if (!id) {
        return <div className="p-6">Invalid transaction route</div>;
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

            <section>
                <h3 className="text-lg font-semibold mb-3">
                    Telemetry Events
                </h3>

                {telemetryLoading ? (
                    <div>Loading telemetry events...</div>
                ) : telemetryError ? (
                    <div className="text-red-600">{telemetryError}</div>
                ) : !telemetryRows.length ? (
                    <div>No telemetry events found.</div>
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