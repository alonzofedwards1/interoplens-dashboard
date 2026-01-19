import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '../../../components/Pagination';

interface LinkedFinding {
    id: string;
    type: string;
    date: string;
    severity: string;
}

interface LinkedFindingsTableProps {
    findings: LinkedFinding[];
}

const LinkedFindingsTable: React.FC<LinkedFindingsTableProps> = ({ findings }) => {
    const [query, setQuery] = useState('');
    const [sortKey, setSortKey] = useState<'date' | 'severity' | 'id'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const filteredAndSorted = useMemo(() => {
        const filtered = findings.filter(f => {
            if (!query.trim()) return true;
            const lowered = query.toLowerCase();
            return (
                f.id.toLowerCase().includes(lowered) ||
                f.type.toLowerCase().includes(lowered) ||
                f.severity.toLowerCase().includes(lowered)
            );
        });

        return filtered.sort((a, b) => {
            if (sortKey === 'date') {
                const aDate = new Date(a.date).getTime();
                const bDate = new Date(b.date).getTime();
                return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            }

            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [findings, query, sortDirection, sortKey]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedFindings = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredAndSorted.slice(start, start + pageSize);
    }, [filteredAndSorted, page]);

    return (
        <section className="bg-white rounded-lg shadow p-5 space-y-3">
            <h2 className="text-lg font-semibold mb-3">Linked Findings</h2>

            <div className="flex flex-wrap gap-3 items-center text-sm">
                <input
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Filter findings"
                    className="border rounded px-3 py-2 w-full sm:w-64"
                />

                <div className="flex items-center gap-2">
                    <label htmlFor="committee-findings-sort">Sort</label>
                    <select
                        id="committee-findings-sort"
                        value={sortKey}
                        onChange={event => setSortKey(event.target.value as typeof sortKey)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="date">Date</option>
                        <option value="severity">Severity</option>
                        <option value="id">Finding ID</option>
                    </select>
                    <button
                        onClick={() =>
                            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
                        }
                        className="px-2 py-1 border rounded"
                        aria-label={`Toggle sort direction (currently ${sortDirection})`}
                    >
                        {sortDirection === 'asc' ? 'Asc' : 'Desc'}
                    </button>
                </div>
            </div>

            <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                <tr>
                    <th className="py-2">Finding ID</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Severity</th>
                </tr>
                </thead>
                <tbody>
                {pagedFindings.map((f) => (
                    <tr key={f.id} className="border-b">
                        <td className="py-2 font-mono">{f.id}</td>
                        <td>{f.type}</td>
                        <td>{f.date}</td>
                        <td>{f.severity}</td>
                    </tr>
                ))}
                {!filteredAndSorted.length && (
                    <tr>
                        <td colSpan={4} className="py-3 text-center text-gray-500">
                            No linked findings match the current filters.
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
        </section>
    );
};

export default LinkedFindingsTable;
