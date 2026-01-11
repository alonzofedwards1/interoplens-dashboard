import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Finding } from '../types/findings';
import { TransactionLink } from './TransactionLink';
import { useUserPreference } from '../lib/userPreferences';

/* ============================
   Derive Recent Findings
============================ */

const buildRecentFindings = (findings: Finding[]) =>
    findings
        .slice()
        .sort(
            (a, b) =>
                new Date(b.detectedAt ?? 0).getTime() -
                new Date(a.detectedAt ?? 0).getTime()
        )
        .slice(0, 5);

/* ============================
   Helpers
============================ */

const getSeverityLabel = (severity: Finding['severity']) => {
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

const getStatusLabel = (status: Finding['status']) => (
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
    const [preferences, setPreferences] = useUserPreference(
        'findings.dashboard.table',
        defaultFindingsPreferences
    );

    const { query, sortDirection, sortKey } = preferences;

    const filteredFindings = useMemo(() => {
        const recentFindings = buildRecentFindings(findings);
        return recentFindings.filter(finding => {
            if (!query.trim()) return true;

            const lowerQuery = query.toLowerCase();
            return (
                (finding.organization || '').toLowerCase().includes(lowerQuery) ||
                (finding.type || '').toLowerCase().includes(lowerQuery)
            );
        });
    }, [findings, query]);

    const sortedFindings = useMemo(() => {
        return [...filteredFindings].sort((a, b) => {
            if (sortKey === 'detectedAt') {
                const aDate = new Date(a.detectedAt ?? 0).getTime();
                const bDate = new Date(b.detectedAt ?? 0).getTime();
                return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            }

            const aValue = a[sortKey] ?? '';
            const bValue = b[sortKey] ?? '';

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredFindings, sortDirection, sortKey]);

    const toggleSort = (key: FindingsSortKey) => {
        if (sortKey === key) {
            setPreferences(prev => ({
                ...prev,
                sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
            }));
        } else {
            setPreferences(prev => ({ ...prev, sortKey: key, sortDirection: 'asc' }));
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow p-4 mt-4 space-y-3">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                    Recent Findings
                </h2>

                <button
                    onClick={() => navigate('/findings')}
                    className="text-sm text-blue-600 hover:underline"
                >
                    View All
                </button>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-between">
                <input
                    type="search"
                    value={query}
                    onChange={event =>
                        setPreferences(prev => ({
                            ...prev,
                            query: event.target.value,
                        }))
                    }
                    placeholder="Filter by organization or type"
                    className="border rounded px-3 py-2 text-sm w-full sm:w-72"
                />

                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Sort by</span>
                    <select
                        value={sortKey}
                        onChange={event =>
                            setPreferences(prev => ({
                                ...prev,
                                sortKey: event.target.value as FindingsSortKey,
                            }))
                        }
                        className="border rounded px-2 py-1"
                    >
                        <option value="detectedAt">Detected</option>
                        <option value="severity">Severity</option>
                        <option value="organization">Organization</option>
                    </select>

                    <button
                        onClick={() => toggleSort(sortKey)}
                        className="px-2 py-1 border rounded"
                        aria-label={`Toggle sort direction (currently ${sortDirection})`}
                    >
                        {sortDirection === 'asc' ? 'Asc' : 'Desc'}
                    </button>
                </div>
            </div>

            <table className="w-full text-sm text-left">
                <thead>
                <tr className="text-gray-600 border-b">
                    <th className="py-2 cursor-pointer" onClick={() => toggleSort('severity')}>State</th>
                    <th className="py-2 cursor-pointer" onClick={() => toggleSort('organization')}>Organization</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Related Transaction</th>
                    <th className="py-2 cursor-pointer" onClick={() => toggleSort('detectedAt')}>Detected</th>
                    <th className="py-2">Status</th>
                </tr>
                </thead>

                <tbody>
                {sortedFindings.map(finding => (
                    <tr
                        key={finding.id}
                        className="border-b last:border-b-0"
                    >
                        <td className="py-2">
                            {getSeverityLabel(finding.severity)}
                        </td>

                        <td className="py-2 font-medium text-gray-800">
                            {finding.organization ?? '—'}
                        </td>

                        <td className="py-2">
                            <div
                                className={`rounded border-l-4 p-3 ${
                                    finding.severity === 'critical'
                                        ? 'border-red-600 bg-red-50'
                                        : 'border-yellow-500 bg-yellow-50'
                                }`}
                            >
                                <p className="font-medium">
                                    {finding.summary ?? finding.title ?? '—'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {finding.recommendedAction ?? '—'}
                                </p>
                            </div>
                        </td>

                        <td className="py-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    Related Transaction
                                </span>
                                {finding.executionId ? (
                                    <TransactionLink id={finding.executionId} />
                                ) : (
                                    <span className="text-gray-500">—</span>
                                )}
                                <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                    🔗 Traceable
                                </span>
                            </div>
                        </td>

                        <td className="py-2 text-gray-600">
                            {finding.detectedAt
                                ? new Date(finding.detectedAt).toLocaleString()
                                : '—'}
                        </td>

                        <td className="py-2">
                            {getStatusLabel(finding.status)}
                        </td>
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
        </div>
    );
};

export default FindingsTable;
