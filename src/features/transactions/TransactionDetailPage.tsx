import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

import { useServerData } from '../../lib/ServerDataContext';
import { TransactionLink } from '../../components/TransactionLink';
import { Finding } from '../../types/findings';
import Pagination from '../../components/Pagination';
import {
    buildCertificateFindingCopy,
    getCertificateStatusBadge,
    getCertificateStatusDescription,
    getExecutionCertificateDetails,
} from '../../lib/certificates';
import { useUserPreferences } from '../../lib/useUserPreferences';
import { formatTimestamp } from '../../lib/dateTime';

const TransactionDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { pdExecutions, telemetryEvents, findings } = useServerData();
    const { preferences } = useUserPreferences();
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const transaction = useMemo(
        () => pdExecutions.find(exec => exec.requestId === id),
        [id, pdExecutions]
    );

    const relatedFindings = useMemo(() => {
        return (findings as Finding[]).filter(
            finding => finding.executionId && finding.executionId === id
        );
    }, [findings, id]);

    const relatedTelemetry = useMemo(() => {
        return telemetryEvents.filter(event => event.requestId === id);
    }, [id, telemetryEvents]);

    const certificateDetails = useMemo(
        () => getExecutionCertificateDetails(transaction),
        [transaction]
    );

    const certificateBadge = useMemo(
        () => getCertificateStatusBadge(certificateDetails.status),
        [certificateDetails.status]
    );

    const totalPages = Math.max(1, Math.ceil(relatedTelemetry.length / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedTelemetry = useMemo(() => {
        const start = (page - 1) * pageSize;
        return relatedTelemetry.slice(start, start + pageSize);
    }, [page, relatedTelemetry]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/pd-executions')}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold">Transaction Detail</h1>
                    <p className="text-gray-600">Trace PD execution, findings, and telemetry</p>
                </div>
            </div>

            <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Transaction Overview</h2>
                    <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        🔗 Traceable
                    </span>
                </div>

                <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <dt className="text-gray-500">Transaction ID</dt>
                        <dd className="font-mono text-xs">
                            {id ? <TransactionLink id={id} /> : '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Transaction Type</dt>
                        <dd>Patient Discovery</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Outcome</dt>
                        <dd>{transaction?.outcome ?? '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Environment</dt>
                        <dd>{transaction?.sourceEnvironment ?? '—'}</dd>
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
                        {getCertificateStatusDescription(certificateDetails.status)}
                    </p>

                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <dt className="text-gray-500">Certificate Status</dt>
                            <dd className="font-medium">
                                {certificateDetails.status ?? '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Certificate Thumbprint</dt>
                            <dd className="font-mono text-xs">
                                {certificateDetails.thumbprint ?? '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Failure Stage</dt>
                            <dd>{certificateDetails.failureStage ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Root Cause</dt>
                            <dd>{certificateDetails.rootCause ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">HTTP Status</dt>
                            <dd>{certificateDetails.httpStatus ?? '—'}</dd>
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

                {!relatedTelemetry.length ? (
                    <div className="rounded border border-dashed p-6 text-center text-gray-500">
                        No telemetry events detected for this transaction.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-100 text-left text-sm text-gray-700">
                                <tr>
                                    <th className="p-3">Event ID</th>
                                    <th className="p-3">Timestamp</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Channel</th>
                                    <th className="p-3">Interaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedTelemetry.map(event => (
                                    <tr key={event.eventId} className="border-t text-sm">
                                        <td className="p-3 font-mono text-xs text-gray-700">
                                            {event.eventId}
                                        </td>
                                        <td className="p-3">
                                            {formatTimestamp(
                                                event.timestamp,
                                                preferences.timezone
                                            )}
                                        </td>
                                        <td className="p-3">{event.status ?? '—'}</td>
                                        <td className="p-3">{event.channelId ?? '—'}</td>
                                        <td className="p-3">{event.interactionId ?? '—'}</td>
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
