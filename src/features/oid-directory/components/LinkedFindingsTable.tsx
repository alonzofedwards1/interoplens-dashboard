import React, { useMemo, useState } from "react";

interface Finding {
    id: string;
    severity: "OK" | "WARNING" | "CRITICAL";
    summary: string;
    lastObserved: string;
}

interface Props {
    findings?: Finding[];
}

const LinkedFindingsTable = ({ findings = [] }: Props) => {
    const [query, setQuery] = useState("");
    const [sortKey, setSortKey] = useState<"severity" | "summary" | "lastObserved">("lastObserved");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const filteredAndSorted = useMemo(() => {
        const filtered = findings.filter(f => {
            if (!query.trim()) return true;
            const lowered = query.toLowerCase();
            return (
                f.summary.toLowerCase().includes(lowered) ||
                f.severity.toLowerCase().includes(lowered)
            );
        });

        return filtered.sort((a, b) => {
            if (sortKey === "lastObserved") {
                const aDate = new Date(a.lastObserved).getTime();
                const bDate = new Date(b.lastObserved).getTime();
                return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
            }

            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [findings, query, sortDirection, sortKey]);

    return (
        <div className="border rounded p-4 bg-white space-y-3">
            <h2 className="text-lg font-semibold mb-2">Linked Findings</h2>

            {findings.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No findings currently associated with this OID.
                </p>
            ) : (
                <>
                <div className="flex flex-wrap gap-3 items-center text-sm mb-2">
                    <input
                        type="search"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        placeholder="Filter by severity or summary"
                        className="border rounded px-3 py-2 w-full sm:w-64"
                    />

                    <div className="flex items-center gap-2">
                        <label htmlFor="oid-linked-sort">Sort</label>
                        <select
                            id="oid-linked-sort"
                            value={sortKey}
                            onChange={event => setSortKey(event.target.value as typeof sortKey)}
                            className="border rounded px-2 py-1"
                        >
                            <option value="lastObserved">Last Observed</option>
                            <option value="severity">Severity</option>
                            <option value="summary">Summary</option>
                        </select>
                        <button
                            onClick={() =>
                                setSortDirection(prev => (prev === "asc" ? "desc" : "asc"))
                            }
                            className="px-2 py-1 border rounded"
                            aria-label={`Toggle sort direction (currently ${sortDirection})`}
                        >
                            {sortDirection === "asc" ? "Asc" : "Desc"}
                        </button>
                    </div>
                </div>

                <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Severity</th>
                        <th className="p-2 text-left">Summary</th>
                        <th className="p-2 text-left">Last Observed</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredAndSorted.map(f => (
                        <tr key={f.id} className="border-t">
                            <td className="p-2">{f.severity}</td>
                            <td className="p-2">{f.summary}</td>
                            <td className="p-2">{f.lastObserved}</td>
                        </tr>
                    ))}
                    {!filteredAndSorted.length && (
                        <tr>
                            <td colSpan={3} className="p-3 text-center text-gray-500">
                                No linked findings match the current filters.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </>
            )}
        </div>
    );
};

export default LinkedFindingsTable;
