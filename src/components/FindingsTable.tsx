import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { findingsData, Finding } from '../features/findings/data/findings.data';

/* ============================
   Derive Recent Findings
============================ */

const recentFindings: Finding[] = findingsData
    .slice()
    .sort(
        (a, b) =>
            new Date(b.detectedAt).getTime() -
            new Date(a.detectedAt).getTime()
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

/* ============================
   Component
============================ */

const FindingsTable: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [sortKey, setSortKey] = useState<'detectedAt' | 'severity' | 'organization'>('detectedAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const filteredFindings = useMemo(() => {
        return recentFindings.filter(finding => {
            if (!query.trim()) return true;

            const lowerQuery = query.toLowerCase();
            return (
                finding.organization.toLowerCase().includes(lowerQuery) ||
                finding.type.toLowerCase().includes(lowerQuery)
            );
        });
    }, [query]);

    const sortedFindings = useMemo(() => {
        return [...filteredFindings].sort((a, b) => {
            if (sortKey === 'detectedAt') {
                const aDate = new Date(a.detectedAt).getTime();
                const bDate = new Date(b.detectedAt).getTime();
                return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            }

            const aValue = a[sortKey] ?? '';
            const bValue = b[sortKey] ?? '';

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredFindings, sortDirection, sortKey]);

    const toggleSort = (key: typeof sortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
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
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Filter by organization or type"
                    className="border rounded px-3 py-2 text-sm w-full sm:w-72"
                />

                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Sort by</span>
                    <select
                        value={sortKey}
                        onChange={event => setSortKey(event.target.value as typeof sortKey)}
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
                            {finding.organization}
                        </td>

                        <td className="py-2">
                            {finding.type}
                        </td>

                        <td className="py-2 text-gray-600">
                            {new Date(finding.detectedAt).toLocaleString()}
                        </td>

                        <td className="py-2">
                            {getStatusLabel(finding.status)}
                        </td>
                    </tr>
                ))}
                {!sortedFindings.length && (
                    <tr>
                        <td colSpan={5} className="py-3 text-center text-gray-500">
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
