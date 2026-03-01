import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

import { useServerData } from '../../lib/ServerDataContext';
import { TransactionLink } from '../../components/TransactionLink';
import { Finding } from '../../types/findings';
import Pagination from '../../components/Pagination';
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
    const navigate = useNavigate();
    const location = useLocation();
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

    const transaction = useMemo(
        () => pdExecutions.find(exec => exec.requestId === id),
        [id, pdExecutions]
    );

    const relatedFindings = useMemo(() => {
        return (findings as Finding[]).filter(
            finding => finding.executionId && finding.executionId === id
        );
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
            setTelemetryTotal(response.pagination.total);
        } catch (error) {
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
                offset += response.pagination.limit;
            } while (offset < total);

            const latestCert = allRows
                .filter(hasCertificateData)
                .sort((a, b) => getRowTime(b) - getRowTime(a))[0] ?? null;

            setLatestCertificateEvent(latestCert);
        } catch {
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

    useEffect(() => {
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
                <button
                    onClick={() => {
                        const from =
                            (location.state as { from?: string } | undefined)?.from;
                        navigate(from ?? '/pd-executions');
                    }}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold">Transaction Detail</h1>
                    <p className="text-gray-600">Trace PD execution, findings, and telemetry</p>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailPage;