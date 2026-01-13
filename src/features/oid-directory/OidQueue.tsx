import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOids, OidRecord, OidStatus } from "../../lib/api/oids";

const OidQueue = () => {
    const navigate = useNavigate();

    const [statusFilter, setStatusFilter] = useState<OidStatus | "ALL">("ALL");
    const [confidenceFilter, setConfidenceFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
    const [sortKey, setSortKey] = useState<"lastSeen" | "oid" | "status" | "displayName">("lastSeen");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [oids, setOids] = useState<OidRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadOids = async () => {
            try {
                const data = await fetchOids();
                if (isMounted) {
                    setOids(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load OIDs");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadOids();
        return () => {
            isMounted = false;
        };
    }, []);

    const filteredAndSorted = useMemo(() => {
        const filtered = oids.filter(item => {
            if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
            if (confidenceFilter !== "ALL" && item.confidence !== confidenceFilter) return false;
            return true;
        });

        return filtered.sort((a, b) => {
            if (sortKey === "lastSeen") {
                const aDate = new Date(a.lastSeen).getTime();
                const bDate = new Date(b.lastSeen).getTime();
                return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
            }

            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [confidenceFilter, oids, sortDirection, sortKey, statusFilter]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">OID Directory</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <select
                    className="border p-2 rounded"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="provisional">Provisional</option>
                    <option value="approved">Approved</option>
                    <option value="deprecated">Deprecated</option>
                </select>

                <select
                    className="border p-2 rounded"
                    value={confidenceFilter}
                    onChange={e => setConfidenceFilter(e.target.value as any)}
                >
                    <option value="ALL">All Confidence</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>

                <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="oid-sort">Sort</label>
                    <select
                        id="oid-sort"
                        className="border p-2 rounded"
                        value={sortKey}
                        onChange={e => setSortKey(e.target.value as typeof sortKey)}
                    >
                        <option value="lastSeen">Last Seen</option>
                        <option value="displayName">Name</option>
                        <option value="status">Status</option>
                        <option value="oid">OID</option>
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

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded border border-dashed p-6 text-center text-gray-500">
                    Loading OID directory...
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">OID</th>
                            <th className="p-2 text-left">Display Name</th>
                            <th className="p-2 text-left">Owner</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Confidence</th>
                            <th className="p-2 text-left">Last Seen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAndSorted.map(oid => (
                            <tr
                                key={oid.oid}
                                className="border-t cursor-pointer hover:bg-gray-50"
                                onClick={() => navigate(`/oids/${encodeURIComponent(oid.oid)}`)}
                            >
                                <td className="p-2 font-mono">{oid.oid}</td>
                                <td className="p-2">{oid.displayName}</td>
                                <td className="p-2">{oid.ownerOrg}</td>
                                <td className="p-2">{oid.status}</td>
                                <td className="p-2">{oid.confidence}</td>
                                <td className="p-2">{oid.lastSeen}</td>
                            </tr>
                        ))}
                        {filteredAndSorted.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    {oids.length === 0
                                        ? "No OIDs observed yet."
                                        : "No OIDs match the selected filters"}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OidQueue;
