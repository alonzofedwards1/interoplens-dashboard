import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Finding } from '../types/findings';
import { TransactionLink } from './TransactionLink';
import { useUserPreference } from '../lib/userPreferences';
import Pagination from './Pagination';
import { useServerData } from '../lib/ServerDataContext';
import { buildCertificateFindingCopy } from '../lib/certificates';
import { useUserPreferences } from '../lib/useUserPreferences';
import { formatTimestamp } from '../lib/dateTime';

/* ============================
   Helpers
============================ */

const buildRecentFindings = (findings: Finding[]) =>
    findings
        .slice()
        .sort(
            (a, b) =>
                new Date(b.detectedAt ?? 0).getTime() -
                new Date(a.detectedAt ?? 0).getTime()
        );

const getSeverityLabel = (severity?: Finding['severity']) => {
    switch (severity) {
        case 'critical':
            return (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                    Critical
                </span>
            );
        case 'warning':
            return (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    Warning
                </span>
            );
        default:
            return (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                    OK
                </span>
            );
    }
};

const getStatusLabel = (status?: Finding['status']) => {
    if (!status) return <span className="text-gray-500">—</span>;

    return (
        <span
            className={`font-semibold ${
                status === 'compliant'
                    ? 'text-green-600'
                    : 'text-red-600'
            }`}
        >
            {status === 'compliant' ? 'Compliant' : 'Non-Compliant'}
        </span>
    );
};

type FindingsSortKey = 'detectedAt' | 'severity' | 'organization';

type FindingsPreferences = {
    query: string;
    sortKey: FindingsSortKey;
    sortDirection: 'asc' | 'desc';
};

const defaultFindingsPreferences: FindingsPreferences = {
    query: '',
    sortKey: 'detectedAt',
    sortDirection: 'desc',
};

/* ============================
   Component
============================ */

interface FindingsTableProps {
    findings: Finding[];
}

const FindingsTable: React.FC<FindingsTableProps> = ({ findings }) => {
    const navigate = useNavigate();
    const { pdExecutions } = useServerData();
    const { preferences: userPreferences } = useUserPreferences();

    const [preferences, setPreferences] = useUserPreference(
        'findings.dashboard.table',
        defaultFindingsPreferences
    );
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const { query, sortKey, sortDirection } = preferences;

    /* ============================
       FILTER
    ============================ */

    const filteredFindings = useMemo(() => {
        const recent = buildRecentFindings(findings);

        if (!query.trim()) return recent;

        const q = query.toLowerCase();

        return recent.filter(f =>
            f.organization?.name?.toLowerCase().includes(q) ||
            f.type?.toLowerCase().includes(q) ||
            f.summary?.toLowerCase().includes(q)
        );
    }, [findings, query]);

    /* ============================
       SORT
    ============================ */

    const sortedFindings = useMemo(() => {
        return [...filteredFindings].sort((a, b) => {
            if (sortKey === 'detectedAt') {
                const aDate = new Date(a.detectedAt ?? 0).getTime();
                const bDate = new Date(b.detectedAt ?? 0).getTime();
                return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            }

            if (sortKey === 'organization') {
                const aOrg = a.organization?.name ?? '';
                const bOrg = b.organization?.name ?? '';
                return sortDirection === 'asc'
                    ? aOrg.localeCompare(bOrg)
                    : bOrg.localeCompare(aOrg);
            }

            const aVal = a.severity ?? '';
            const bVal = b.severity ?? '';

            return sortDirection === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        });
    }, [filteredFindings, sortKey, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedFindings.length / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedFindings = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedFindings.slice(start, start + pageSize);
    }, [page, sortedFindings]);

    const executionById = useMemo(() => {
        return new Map(
            pdExecutions.map(exec => [exec.requestId, exec])
        );
    }, [pdExecutions]);

    /* ============================
       RENDER
    ============================ */

    return (
        <div className="bg-white rounded-2xl shadow p-4 mt-4 space-y-3">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Recent Findings</h2>
                <button
                    onClick={() => navigate('/findings')}
                    className="text-sm text-blue-600 hover:underline"
                >
                    View All
                </button>
            </div>

            <input
                type="search"
                value={query}
                onChange={e =>
                    setPreferences(prev => ({
                        ...prev,
                        query: e.target.value,
                    }))
                }
                placeholder="Filter by organization or summary"
                className="border rounded px-3 py-2 text-sm w-full sm:w-72"
            />

            <table className="w-full text-sm text-left">
                <thead>
                <tr className="text-gray-600 border-b">
                    <th className="py-2">State</th>
                    <th className="py-2">Organization</th>
                    <th className="py-2">Summary</th>
                    <th className="py-2">Transaction</th>
                    <th className="py-2">Detected</th>
                    <th className="py-2">Status</th>
                </tr>
                </thead>

                <tbody>
                {pagedFindings.map(f => (
                    <tr key={f.id} className="border-b last:border-b-0">
                        <td className="py-2">{getSeverityLabel(f.severity)}</td>
                        <td className="py-2 font-medium">
                            {f.organization?.name ?? '—'}
                        </td>
                        <td className="py-2 text-gray-700">
                            {buildCertificateFindingCopy(
                                f,
                                f.executionId
                                    ? executionById.get(f.executionId)
                                    : undefined
                            )?.summary ?? f.summary ?? '—'}
                        </td>
                        <td className="py-2">
                            {f.executionId ? (
                                <TransactionLink id={f.executionId} />
                            ) : (
                                '—'
                            )}
                        </td>
                        <td className="py-2 text-gray-600">
                            {formatTimestamp(
                                f.detectedAt,
                                userPreferences.timezone
                            )}
                        </td>
                        <td className="py-2">{getStatusLabel(f.status)}</td>
                    </tr>
                ))}

                {!sortedFindings.length && (
                    <tr>
                        <td colSpan={6} className="py-3 text-center text-gray-500">
                            No findings match the current filters.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
};

export default FindingsTable;
