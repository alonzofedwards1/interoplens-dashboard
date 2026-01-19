import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { committeeQueueData } from './data/committeeQueue.data';
import { committeeStatusStyles } from './data/committeeStatus';
import Pagination from '../../components/Pagination';

const CommitteeQueue: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
    const [sortKey, setSortKey] = useState<'decisionTarget' | 'severity' | 'organization'>('decisionTarget');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const filteredAndSorted = useMemo(() => {
        const filtered = committeeQueueData.filter(item => {
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

            if (!query.trim()) return matchesStatus;

            const lowered = query.toLowerCase();
            const matchesQuery =
                item.organization.toLowerCase().includes(lowered) ||
                item.issueType.toLowerCase().includes(lowered) ||
                item.id.toLowerCase().includes(lowered);

            return matchesStatus && matchesQuery;
        });

        return filtered.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [query, sortDirection, sortKey, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedCases = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredAndSorted.slice(start, start + pageSize);
    }, [filteredAndSorted, page]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm text-blue-600 hover:underline mb-2"
                >
                    ← Back to Dashboard
                </button>

                <h1 className="text-2xl font-semibold">Committee Review Queue</h1>
                <p className="text-gray-600">
                    Findings requiring governance-level review and decision.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
                <input
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Filter by ID, org, or type"
                    className="border rounded px-3 py-2 w-full sm:w-72"
                />

                <div className="flex items-center gap-2">
                    <label htmlFor="committee-status" className="text-gray-700">Status</label>
                    <select
                        id="committee-status"
                        value={statusFilter}
                        onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="all">All</option>
                        <option value="Awaiting Decision">Awaiting Decision</option>
                        <option value="Resolution Queued">Resolution Queued</option>
                        <option value="Pending Resolution">Pending Resolution</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="committee-sort" className="text-gray-700">Sort</label>
                    <select
                        id="committee-sort"
                        value={sortKey}
                        onChange={event => setSortKey(event.target.value as typeof sortKey)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="decisionTarget">Decision Target</option>
                        <option value="severity">Severity</option>
                        <option value="organization">Organization</option>
                    </select>
                    <button
                        onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                        className="px-2 py-1 border rounded"
                        aria-label={`Toggle sort direction (currently ${sortDirection})`}
                    >
                        {sortDirection === 'asc' ? 'Asc' : 'Desc'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left">Case ID</th>
                        <th className="px-4 py-3 text-left">Organization</th>
                        <th className="px-4 py-3 text-left">Issue Type</th>
                        <th className="px-4 py-3 text-left">Severity</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Decision Target</th>
                        <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pagedCases.map((item) => (
                        <tr
                            key={item.id}
                            className="border-t hover:bg-gray-50"
                        >
                            <td className="px-4 py-3 font-mono">{item.id}</td>
                            <td className="px-4 py-3">{item.organization}</td>
                            <td className="px-4 py-3">{item.issueType}</td>
                            <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs">
                    {item.severity}
                  </span>
                            </td>
                            <td className="px-4 py-3">
                  <span
                      className={`px-2 py-0.5 rounded text-xs ${
                          committeeStatusStyles[item.status]
                      }`}
                  >
                    {item.status}
                  </span>
                            </td>
                            <td className="px-4 py-3">{item.decisionTarget}</td>
                            <td className="px-4 py-3 text-right">
                                <button
                                    onClick={() => navigate(`/committee/${item.id}`)}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    Open Case →
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
};

export default CommitteeQueue;
