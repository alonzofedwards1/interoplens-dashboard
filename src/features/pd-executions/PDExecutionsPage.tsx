import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

import { useServerData } from '../../lib/ServerDataContext';
import { getExecutionCertificateDetails } from '../../lib/certificates';
import { TransactionLink } from '../../components/TransactionLink';
import { Finding } from '../../types/findings';

/* ============================
   Helpers
============================ */

const PAGE_SIZE = 10;

const formatOutcome = (outcome?: string) => {
    switch ((outcome ?? '').toLowerCase()) {
        case 'success':
            return { label: 'Success', color: 'bg-green-100 text-green-800' };
        case 'failure':
            return { label: 'Failure', color: 'bg-red-100 text-red-800' };
        default:
            return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
    }
};

const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

/* ============================
   Component
============================ */

const PDExecutionsPage = () => {
    const navigate = useNavigate();
    const { pdExecutions, findings, loading } = useServerData();

    const [outcomeFilter, setOutcomeFilter] =
        useState<'all' | 'success' | 'failure'>('all');

    const [certStatusFilter, setCertStatusFilter] = useState<
        'all' | 'valid' | 'expiring' | 'expired' | 'impacted'
    >('all');

    const [page, setPage] = useState(1);

    /* ----------------------------
       Findings lookup
    ---------------------------- */

    const findingsByRequestId = useMemo(() => {
        return (findings as Finding[]).reduce<Record<string, number>>((acc, f) => {
            if (!f.executionId) return acc;
            acc[f.executionId] = (acc[f.executionId] || 0) + 1;
            return acc;
        }, {});
    }, [findings]);

    /* ----------------------------
       Filtering
    ---------------------------- */

    const filteredExecutions = useMemo(() => {
        const result = pdExecutions.filter(exec => {
            if (outcomeFilter !== 'all' && exec.outcome !== outcomeFilter) {
                return false;
            }

            const certStatus =
                getExecutionCertificateDetails(exec).status ?? 'VALID';

            if (certStatusFilter === 'all') return true;
            if (certStatusFilter === 'valid') return certStatus === 'VALID';
            if (certStatusFilter === 'expiring') return certStatus === 'EXPIRING_SOON';
            if (certStatusFilter === 'expired') return certStatus === 'EXPIRED';
            if (certStatusFilter === 'impacted')
                return certStatus === 'EXPIRED' || certStatus === 'EXPIRING_SOON';

            return true;
        });

        return result;
    }, [pdExecutions, outcomeFilter, certStatusFilter]);

    /* ----------------------------
       Pagination
    ---------------------------- */

    const totalPages = Math.max(
        1,
        Math.ceil(filteredExecutions.length / PAGE_SIZE)
    );

    const pagedExecutions = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredExecutions.slice(start, start + PAGE_SIZE);
    }, [filteredExecutions, page]);

    /* Reset page when filters change */
    if (page > totalPages) {
        setPage(1);
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-gray-600">
                Loading Patient Discovery executions…
            </div>
        );
    }

    /* ----------------------------
       Summary stats
    ---------------------------- */

    const failureCount = pdExecutions.filter(e => e.outcome === 'failure').length;

    const impactedCertCount = pdExecutions.filter(e => {
        const s = getExecutionCertificateDetails(e).status;
        return s === 'EXPIRED' || s === 'EXPIRING_SOON';
    }).length;

    /* ============================
       Render
    ============================ */

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold">PD Executions</h1>
                    <p className="text-gray-600">
                        Behavioral overview of Patient Discovery activity
                    </p>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total PD Executions" value={pdExecutions.length} />
                <SummaryCard label="Failures" value={failureCount} />
                <SummaryCard
                    label="Failure Rate"
                    value={
                        pdExecutions.length
                            ? `${((failureCount / pdExecutions.length) * 100).toFixed(1)}%`
                            : '0%'
                    }
                />
                <SummaryCard label="Cert Impacted" value={impactedCertCount} />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded shadow">
                <select
                    value={outcomeFilter}
                    onChange={e => {
                        setOutcomeFilter(e.target.value as any);
                        setPage(1);
                    }}
                    className="border rounded px-2 py-1 text-sm"
                >
                    <option value="all">All Outcomes</option>
                    <option value="success">Success</option>
                    <option value="failure">Failure</option>
                </select>

                <select
                    value={certStatusFilter}
                    onChange={e => {
                        setCertStatusFilter(e.target.value as any);
                        setPage(1);
                    }}
                    className="border rounded px-2 py-1 text-sm"
                >
                    <option value="all">All Certificates</option>
                    <option value="valid">Valid</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="expired">Expired</option>
                    <option value="impacted">Impacted</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">Completed At</th>
                        <th className="p-3 text-left">Request ID</th>
                        <th className="p-3">Traceability</th>
                        <th className="p-3">Cert Status</th>
                        <th className="p-3">Outcome</th>
                        <th className="p-3">HTTP</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pagedExecutions.map(exec => {
                        const cert = getExecutionCertificateDetails(exec);
                        const outcome = formatOutcome(exec.outcome);
                        const findingsCount =
                            findingsByRequestId[exec.requestId] ?? 0;

                        return (
                            <tr
                                key={exec.requestId}
                                className="border-t hover:bg-gray-50"
                            >
                                <td className="p-3">
                                    {new Date(exec.completedAt).toUTCString()}
                                </td>
                                <td className="p-3 font-mono text-xs">
                                    {exec.requestId}
                                </td>
                                <td className="p-3">
                                    <div className="flex flex-col gap-1">
                                        <TransactionLink id={exec.requestId} />
                                        <span className="text-xs text-gray-500">
                                                {findingsCount} Findings
                                            </span>
                                    </div>
                                </td>
                                <td className="p-3">{cert.status ?? '—'}</td>
                                <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${outcome.color}`}
                                        >
                                            {outcome.label}
                                        </span>
                                </td>
                                <td className="p-3">{cert.httpStatus ?? '—'}</td>
                            </tr>
                        );
                    })}

                    {!pagedExecutions.length && (
                        <tr>
                            <td
                                colSpan={6}
                                className="p-6 text-center text-gray-500"
                            >
                                No executions match the current filters.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
                    <div>
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() =>
                                setPage(p => Math.min(totalPages, p + 1))
                            }
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDExecutionsPage;
